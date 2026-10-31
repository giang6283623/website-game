// Đọc ba endpoint công khai của máy chủ game cũ (xem docs/design-handoff/API-DATA-REAL.md mục 9.3).
// Chỉ dùng trong tiến trình máy chủ. Không bao giờ chạy trong trình duyệt, vì:
//   - máy chủ game không trả header CORS nên trình duyệt sẽ chặn;
//   - nội dung là XML nén gzip chứ không phải JSON;
//   - chứng chỉ TLS của máy chủ game không qua kiểm tra công khai, và Bun không bắt tay được với nó.
// Vì vậy lớp này nói HTTP thường tới cổng 80. Dữ liệu chỉ đọc, không có mật khẩu, không có phiên.

/** Địa chỉ máy chủ game. Đổi bằng biến môi trường GAME_ORIGIN khi cần trỏ sang bản sao. */
export const GAME_ORIGIN = process.env.GAME_ORIGIN ?? "http://x.x.x.x";

/** Quá thời gian này thì bỏ, khớp REQUEST_TIMEOUT_MS của ứng dụng. */
const TIMEOUT_MS = 8000;

export class GameSourceError extends Error {
  readonly reason: "timeout" | "network" | "status" | "parse";
  constructor(reason: GameSourceError["reason"], message: string) {
    super(message);
    this.name = "GameSourceError";
    this.reason = reason;
  }
}

async function request(path: string, init: RequestInit = {}): Promise<Uint8Array<ArrayBuffer>> {
  let response: Response;
  try {
    response = await fetch(`${GAME_ORIGIN}${path}`, {
      ...init,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        // Máy chủ game là IIS cũ, nhưng vẫn gửi User-Agent cho lịch sự.
        "user-agent": "issvn-website/1.0 (+readonly)",
        ...(init.headers ?? {}),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const timeout = message.toLowerCase().includes("timeout") || message.includes("aborted");
    throw new GameSourceError(timeout ? "timeout" : "network", message);
  }
  if (!response.ok) {
    throw new GameSourceError("status", `Máy chủ game trả mã ${response.status} cho ${path}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

/**
 * Hai byte đầu của phản hồi nén là tiền tố `$1` của client game, không phải một phần của gzip.
 * Bỏ tiền tố rồi mới giải nén được. Phản hồi không nén thì trả nguyên.
 */
export function inflateGameBody(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  // Sao chép sang bộ đệm riêng để kiểu luôn là ArrayBuffer, không dính ArrayBufferLike.
  const copy = new Uint8Array(bytes);
  if (copy.length > 2 && copy[0] === 0x24 && copy[1] === 0x31) {
    const body = copy.subarray(2);
    if (body.length > 1 && body[0] === 0x1f && body[1] === 0x8b) {
      return new Uint8Array(Bun.gunzipSync(body));
    }
  }
  return copy;
}

function textOf(bytes: Uint8Array): string {
  return new TextDecoder("utf-8").decode(inflateGameBody(bytes));
}

/** Đọc một thuộc tính trong một thẻ XML. Máy chủ cũ trả XML rất đơn giản nên không cần bộ phân tích. */
function attr(tag: string, name: string): string | null {
  return new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`).exec(tag)?.[1] ?? null;
}

export type GameServerInfo = {
  status: "ONLINE" | "OFFLINE" | "UNKNOWN";
  news: Array<{ name: string; url: string; date: string }>;
};

/** `updater/api_getserverinfo.xml`: nguồn trạng thái máy chủ công khai duy nhất. */
export async function fetchServerInfo(): Promise<GameServerInfo> {
  const xml = textOf(await request("/infestation/updater/api_getserverinfo.xml"));
  const statusTag = /<ServerInfo[^>]*>/.exec(xml)?.[0] ?? "";
  const rawStatus = (attr(statusTag, "status") ?? "").toUpperCase();
  const news = [...xml.matchAll(/<news\s+name\s*=\s*"([^"]*)"[^>]*>/g)].map((match) => {
    const tag = match[0];
    return {
      name: match[1] ?? "",
      url: attr(tag, "url") ?? "",
      date: attr(tag, "date") ?? "",
    };
  });
  return {
    status: rawStatus === "ONLINE" ? "ONLINE" : rawStatus === "OFFLINE" ? "OFFLINE" : "UNKNOWN",
    news,
  };
}

export type GameManifest = {
  /** Phiên bản dữ liệu game. */
  version: string;
  /** Đường dẫn gốc của gói đầy đủ. */
  baseUrl: string;
  /** Đường dẫn gốc của gói tăng dần. */
  incrementalUrl: string;
};

/** `data/wz.xml`: manifest dữ liệu game, dùng cho trang tải game. */
export async function fetchGameManifest(): Promise<GameManifest> {
  const xml = textOf(await request("/infestation/data/wz.xml"));
  const tag = /<d\s[^>]*>/.exec(xml)?.[0] ?? "";
  const version = attr(tag, "ver");
  if (!version) throw new GameSourceError("parse", "Manifest wz.xml thiếu trường ver");
  return {
    version,
    baseUrl: attr(tag, "base") ?? "",
    incrementalUrl: attr(tag, "inc") ?? "",
  };
}

export type GameLauncherManifest = {
  version: string;
  url: string;
  /** Kích thước tệp, đơn vị byte. */
  size: number;
  crc: string;
};

/** `updater/wzupd.xml`: manifest tự cập nhật của launcher. */
export async function fetchLauncherManifest(): Promise<GameLauncherManifest> {
  const xml = textOf(await request("/infestation/updater/wzupd.xml"));
  const tag = /<u\s[^>]*>/.exec(xml)?.[0] ?? "";
  const version = attr(tag, "ver");
  if (!version) throw new GameSourceError("parse", "Manifest wzupd.xml thiếu trường ver");
  return {
    version,
    url: attr(tag, "url") ?? "",
    size: Number.parseInt(attr(tag, "size") ?? "0", 10) || 0,
    crc: attr(tag, "crc") ?? "",
  };
}

export type GameItemStats = Record<string, string>;

export type GameItem = {
  /** Mã vật phẩm trong game, ví dụ "20006". */
  id: string;
  /** "gear" hoặc "weapon". */
  kind: "gear" | "weapon";
  /** Các thuộc tính thô máy chủ trả về. Tên trường không đổi để đối chiếu được với client. */
  stats: GameItemStats;
};

export type GameItemCatalog = {
  gears: GameItem[];
  weapons: GameItem[];
  /** Thời điểm lấy dữ liệu, dạng ISO. */
  fetchedAt: string;
};

/**
 * `api_GetItemsInfo.aspx`: danh mục vật phẩm.
 * Endpoint này hiện không đòi phiên, chỉ cần một body bất kỳ. Chỉ đọc một lần rồi nhớ, vì danh mục ít đổi.
 */
export async function fetchItemCatalog(): Promise<GameItemCatalog> {
  const bytes = await request("/infestation/api/api_GetItemsInfo.aspx", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "x=1",
  });
  const xml = textOf(bytes);
  const collect = (section: "gears" | "weapons", tag: "g" | "w", kind: GameItem["kind"]) => {
    const block = new RegExp(`<${section}>([\\s\\S]*?)</${section}>`).exec(xml)?.[1] ?? "";
    return [...block.matchAll(new RegExp(`<${tag}\\s([^>]*?)/>`, "g"))].flatMap((match) => {
      const attrs = match[1] ?? "";
      const id = /ID\s*=\s*"([^"]*)"/.exec(attrs)?.[1];
      if (!id) return [];
      const stats: GameItemStats = {};
      for (const pair of attrs.matchAll(/([A-Za-z_][\w]*)\s*=\s*"([^"]*)"/g)) {
        const key = pair[1];
        const value = pair[2];
        if (key && value !== undefined && key !== "ID") stats[key] = value;
      }
      return [{ id, kind, stats }];
    });
  };
  const gears = collect("gears", "g", "gear");
  const weapons = collect("weapons", "w", "weapon");
  if (gears.length === 0 && weapons.length === 0) {
    throw new GameSourceError("parse", "Danh mục vật phẩm rỗng hoặc sai dạng");
  }
  return { gears, weapons, fetchedAt: new Date().toISOString() };
}
