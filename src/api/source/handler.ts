// Máy chủ đọc dữ liệu công khai của game cho website (phương án A, API-DATA-REAL.md mục 9.2).
// Chỉ phục vụ ba đường dẫn đọc, không có ghi, không có phiên, không có mật khẩu:
//   GET /api/v1/server/status            trạng thái máy chủ, cùng lược đồ serverStatusSchema
//   GET /api/v1/source/items-catalog     danh mục vật phẩm thô của máy chủ game
//   GET /api/v1/source/manifests         phiên bản dữ liệu game và launcher
// Phần còn lại của /api/v1 (tài khoản, tin tức, xếp hạng, quản trị) vẫn dùng API giả cho tới khi
// đội game mở API JSON riêng (phương án C).

import {
  fetchGameManifest,
  fetchItemCatalog,
  fetchLauncherManifest,
  fetchServerInfo,
  type GameItemCatalog,
  type GameLauncherManifest,
  type GameManifest,
  type GameServerInfo,
  GameSourceError,
} from "./game-source.ts";
import { mapItemCatalog, mapServerStatus } from "./map.ts";

/** Danh mục vật phẩm ít đổi, giữ lại 10 phút để không gọi máy chủ game mỗi lần có người xem. */
const CATALOG_TTL_MS = 10 * 60 * 1000;
/** Trạng thái máy chủ đổi liên tục, giữ 30 giây để nhiều người xem cùng lúc không tạo nhiều lệnh gọi. */
const STATUS_TTL_MS = 30 * 1000;

type Cached<T> = { value: T; at: number };

let catalogCache: Cached<GameItemCatalog> | null = null;
let statusCache: Cached<GameServerInfo> | null = null;

function fresh<T>(entry: Cached<T> | null, ttl: number): T | null {
  if (!entry) return null;
  return Date.now() - entry.at < ttl ? entry.value : null;
}

/** Xóa bộ nhớ đệm. Dùng trong kiểm thử. */
export function clearSourceCache(): void {
  catalogCache = null;
  statusCache = null;
}

function errorBody(code: string, message: string): { error: { code: string; message: string } } {
  return { error: { code, message } };
}

function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

/** Dựng phản hồi lỗi từ lỗi nguồn. Giao diện chỉ thấy mã chung, không thấy chi tiết máy chủ game. */
function sourceFailure(error: unknown): Response {
  const reason = error instanceof GameSourceError ? error.reason : "network";
  if (reason === "timeout") {
    return json(errorBody("timeout", "Máy chủ game không phản hồi kịp."), 504);
  }
  if (reason === "parse") {
    return json(errorBody("invalid_response", "Dữ liệu máy chủ game sai dạng."), 502);
  }
  return json(errorBody("server_error", "Không đọc được máy chủ game."), 502);
}

async function catalog(): Promise<GameItemCatalog> {
  const cached = fresh(catalogCache, CATALOG_TTL_MS);
  if (cached) return cached;
  const value = await fetchItemCatalog();
  catalogCache = { value, at: Date.now() };
  return value;
}

async function serverInfo(): Promise<GameServerInfo> {
  const cached = fresh(statusCache, STATUS_TTL_MS);
  if (cached) return cached;
  const value = await fetchServerInfo();
  statusCache = { value, at: Date.now() };
  return value;
}

/**
 * Trả phản hồi cho một đường dẫn đọc của phần nguồn game, hoặc null nếu đường dẫn không thuộc phần này.
 * `pathname` là đường dẫn đầy đủ, ví dụ "/api/v1/server/status".
 */
export async function handleSourceRequest(
  method: string,
  pathname: string,
): Promise<Response | null> {
  const isSourcePath =
    pathname === "/api/v1/server/status" ||
    pathname === "/api/v1/source/items-catalog" ||
    pathname === "/api/v1/source/manifests";
  if (!isSourcePath) return null;
  if (method !== "GET" && method !== "HEAD") {
    return json(errorBody("bad_request", "Chỉ đọc."), 405, { allow: "GET, HEAD" });
  }

  try {
    if (pathname === "/api/v1/server/status") {
      return json(mapServerStatus(await serverInfo()));
    }
    if (pathname === "/api/v1/source/items-catalog") {
      const value = await catalog();
      return json({
        items: mapItemCatalog(value),
        fetchedAt: value.fetchedAt,
        counts: { gears: value.gears.length, weapons: value.weapons.length },
      });
    }
    const [game, launcher]: [GameManifest, GameLauncherManifest] = await Promise.all([
      fetchGameManifest(),
      fetchLauncherManifest(),
    ]);
    return json({ game, launcher });
  } catch (error) {
    return sourceFailure(error);
  }
}
