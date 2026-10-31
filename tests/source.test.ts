// Kiểm thử phần đọc nguồn game (phương án A). Không gọi mạng: thay fetch toàn cục bằng dữ liệu dựng sẵn.
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { inflateGameBody } from "../src/api/source/game-source.ts";
import { clearSourceCache, handleSourceRequest } from "../src/api/source/handler.ts";
import { mapItemCatalog, mapServerStatus, WEAPON_GROUP } from "../src/api/source/map.ts";

const SERVER_INFO_XML = `<info>
    <news>
    <news name = "Open Offcial 13/10/2026" url ="https://www.facebook.com/groups/issvn" date="13.10.2026" />
    </news>
    <SurveyIn link="https://infestation.vn/" />
    <SurveyOut link="" />
    <ServerInfo status="ONLINE" />
</info>`;

const ITEMS_XML = `<?xml version="1.0"?>
<items><gears><g ID="20006"
lv="20"
wg="1000"
dp="30"
dm="1500"
/>
</gears><weapons><w ID="101002"
lv="0"
d1="27"
d2="300"
rf="625"
sp="3"
rc="3"
/>
</weapons><generics></generics><packages></packages></items>`;

const WZ_XML = `<p><d ver="169672992" base="http://host/data/wz0A" inc="http://host/data/wz0B"/></p>`;
const WZUPD_XML = `<p><u url="http://host/updater/Launcher.exe_5.17.exe" crc="1555945230" ver="5.17" size="8436224"/></p>`;

/** Ghép tiền tố `$1` và nén gzip, đúng như máy chủ game trả cho danh mục vật phẩm. */
function asGamePayload(text: string): Uint8Array<ArrayBuffer> {
  const gz = Bun.gzipSync(new TextEncoder().encode(text));
  const out = new Uint8Array(new ArrayBuffer(gz.length + 2));
  out[0] = 0x24;
  out[1] = 0x31;
  out.set(gz, 2);
  return out;
}
const realFetch = globalThis.fetch;

function stubFetch(routes: Record<string, () => Response>): void {
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    for (const [suffix, make] of Object.entries(routes)) {
      if (url.endsWith(suffix)) return make();
    }
    return new Response("not found", { status: 404 });
  }) as typeof fetch;
}

function xml(text: string): Response {
  return new Response(text, { status: 200, headers: { "content-type": "text/xml" } });
}

beforeEach(() => {
  clearSourceCache();
});

afterEach(() => {
  globalThis.fetch = realFetch;
  clearSourceCache();
});

describe("giải nén phản hồi máy chủ game", () => {
  test("bỏ tiền tố $1 rồi giải nén gzip", () => {
    const payload = asGamePayload(ITEMS_XML);
    const text = new TextDecoder().decode(inflateGameBody(payload));
    expect(text).toContain("<items>");
    expect(text).toContain('ID="20006"');
  });

  test("phản hồi không nén thì trả nguyên", () => {
    const raw = new TextEncoder().encode("<info></info>");
    expect(new TextDecoder().decode(inflateGameBody(raw))).toBe("<info></info>");
  });
});

describe("đổi dữ liệu thô sang hợp đồng mới", () => {
  test("vật phẩm giữ mã game, nhãn tiếng Việt đúng thứ tự", () => {
    const mapped = mapItemCatalog({
      gears: [{ id: "20006", kind: "gear", stats: { lv: "20", wg: "1000", dp: "30", dm: "1500" } }],
      weapons: [
        {
          id: "101002",
          kind: "weapon",
          stats: { lv: "0", d1: "27", d2: "300", rf: "625", sp: "3", rc: "3" },
        },
      ],
      fetchedAt: "2026-10-29T00:00:00.000Z",
    });
    // Sắp theo mã tăng dần nên 20006 đứng trước 101002.
    expect(mapped.map((item) => item.gameItemId)).toEqual(["20006", "101002"]);
    const weapon = mapped[1];
    expect(weapon?.group).toBe(WEAPON_GROUP);
    expect(weapon?.stats.map((stat) => stat.label)).toEqual([
      "CẤP YÊU CẦU",
      "SÁT THƯƠNG",
      "TẦM XA",
      "TỐC ĐỘ BẮN",
      "TỐC ĐỘ DI CHUYỂN",
      "ĐỘ GIẬT",
    ]);
    expect(weapon?.statLine).toBe(
      "CẤP YÊU CẦU 0 · SÁT THƯƠNG 27 · TẦM XA 300 · TỐC ĐỘ BẮN 625 · TỐC ĐỘ DI CHUYỂN 3 · ĐỘ GIẬT 3",
    );
  });

  test("trạng thái máy chủ không bịa số người online", () => {
    const status = mapServerStatus(
      { status: "ONLINE", news: [] },
      new Date("2026-10-29T12:00:00Z"),
    );
    expect(status.online).toBe(true);
    expect(status.playersOnline).toBeNull();
    expect(status.updatedAt).toBe("2026-10-29T12:00:00.000Z");
  });

  test("máy chủ ngoại tuyến", () => {
    expect(mapServerStatus({ status: "OFFLINE", news: [] }).online).toBe(false);
    expect(mapServerStatus({ status: "UNKNOWN", news: [] }).online).toBe(false);
  });
});

describe("máy chủ đọc nguồn game", () => {
  test("đường dẫn ngoài phần nguồn thì trả null để máy chủ tĩnh xử lý", async () => {
    expect(await handleSourceRequest("GET", "/api/v1/news")).toBeNull();
    expect(await handleSourceRequest("GET", "/tin-tuc")).toBeNull();
  });

  test("chỉ nhận GET và HEAD", async () => {
    const response = await handleSourceRequest("POST", "/api/v1/server/status");
    expect(response?.status).toBe(405);
    expect(response?.headers.get("allow")).toBe("GET, HEAD");
  });

  test("trạng thái máy chủ đúng lược đồ của hợp đồng", async () => {
    stubFetch({ "api_getserverinfo.xml": () => xml(SERVER_INFO_XML) });
    const response = await handleSourceRequest("GET", "/api/v1/server/status");
    expect(response?.status).toBe(200);
    const body = (await response?.json()) as Record<string, unknown>;
    expect(body.online).toBe(true);
    expect(body.playersOnline).toBeNull();
    expect(typeof body.updatedAt).toBe("string");
    // Không được để lộ chi tiết nội bộ của máy chủ game ra ngoài.
    expect(JSON.stringify(body)).not.toContain("facebook");
  });

  test("danh mục vật phẩm có mã game và đếm đúng", async () => {
    stubFetch({
      "api_GetItemsInfo.aspx": () => new Response(asGamePayload(ITEMS_XML), { status: 200 }),
    });
    const response = await handleSourceRequest("GET", "/api/v1/source/items-catalog");
    expect(response?.status).toBe(200);
    const body = (await response?.json()) as {
      items: Array<{ gameItemId: string }>;
      counts: { gears: number; weapons: number };
    };
    expect(body.counts).toEqual({ gears: 1, weapons: 1 });
    expect(body.items.map((item) => item.gameItemId)).toEqual(["20006", "101002"]);
  });

  test("manifest trả phiên bản dữ liệu và launcher", async () => {
    stubFetch({ "data/wz.xml": () => xml(WZ_XML), "updater/wzupd.xml": () => xml(WZUPD_XML) });
    const response = await handleSourceRequest("GET", "/api/v1/source/manifests");
    expect(response?.status).toBe(200);
    const body = (await response?.json()) as {
      game: { version: string };
      launcher: { version: string; size: number };
    };
    expect(body.game.version).toBe("169672992");
    expect(body.launcher.version).toBe("5.17");
    expect(body.launcher.size).toBe(8436224);
  });

  test("máy chủ game lỗi thì trả lỗi chung, không lộ chi tiết", async () => {
    stubFetch({ "api_getserverinfo.xml": () => new Response("boom", { status: 500 }) });
    const response = await handleSourceRequest("GET", "/api/v1/server/status");
    expect(response?.status).toBe(502);
    const body = (await response?.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe("server_error");
    expect(body.error.message).not.toContain("boom");
  });

  test("dữ liệu sai dạng thì báo invalid_response", async () => {
    stubFetch({ "api_GetItemsInfo.aspx": () => new Response("<items></items>", { status: 200 }) });
    const response = await handleSourceRequest("GET", "/api/v1/source/items-catalog");
    expect(response?.status).toBe(502);
    const body = (await response?.json()) as { error: { code: string } };
    expect(body.error.code).toBe("invalid_response");
  });

  test("bộ nhớ đệm: hai lần đọc chỉ gọi máy chủ game một lần", async () => {
    let calls = 0;
    stubFetch({
      "api_getserverinfo.xml": () => {
        calls += 1;
        return xml(SERVER_INFO_XML);
      },
    });
    await handleSourceRequest("GET", "/api/v1/server/status");
    await handleSourceRequest("GET", "/api/v1/server/status");
    expect(calls).toBe(1);
  });
});
