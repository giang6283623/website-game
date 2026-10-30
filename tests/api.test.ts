import { beforeEach, describe, expect, test } from "bun:test";
import { z } from "zod";
import sample from "../docs/design-handoff/sample-data.json";
import { api, onApiEvent, parseResponse } from "../src/api/client.ts";
import {
  getBanner,
  getDownloadInfo,
  getItem,
  getItemList,
  getMe,
  getMyCharacters,
  getNewsDetail,
  getNewsList,
  getRanking,
  getServerStatus,
} from "../src/api/endpoints.ts";
import { isApiError } from "../src/api/errors.ts";
import { resetMockSession } from "../src/api/mock/adapter.ts";
import { setMockConfig } from "../src/api/mock/config.ts";
import {
  accountSchema,
  adminUserSchema,
  auditEntrySchema,
  bannerSchema,
  characterSchema,
  clanRowSchema,
  downloadInfoSchema,
  itemSchema,
  newsPostSchema,
  playerRowSchema,
  serverStatusSchema,
  skillSchema,
} from "../src/api/schemas.ts";

beforeEach(() => {
  resetMockSession();
  setMockConfig({ latencyMs: 0, mode: "normal", session: "guest" });
});

describe("sample-data.json qua lược đồ Zod", () => {
  test("mọi mảng dữ liệu đúng lược đồ", () => {
    const cases: Array<[string, z.ZodType, unknown[]]> = [
      ["news", newsPostSchema, sample.news],
      ["moreNews", newsPostSchema, sample.moreNews],
      ["items", itemSchema, sample.items],
      ["players", playerRowSchema, sample.ranking.rows],
      ["clans", clanRowSchema.partial().passthrough(), sample.clans],
      ["characters", characterSchema, sample.characters],
      ["skills", skillSchema, sample.skills],
      ["banners", bannerSchema.passthrough(), sample.banners],
      ["adminUsers", adminUserSchema, sample.adminUsers],
      ["auditLog", auditEntrySchema, sample.auditLog],
    ];
    for (const [name, schema, rows] of cases) {
      for (const [index, row] of rows.entries()) {
        const result = schema.safeParse(row);
        if (!result.success) {
          throw new Error(`${name}[${index}] sai lược đồ: ${result.error.message.slice(0, 300)}`);
        }
      }
    }
    expect(accountSchema.safeParse(sample.account).success).toBe(true);
    expect(serverStatusSchema.safeParse(sample.serverStatus).success).toBe(true);
    expect(downloadInfoSchema.safeParse(sample.downloadInfo).success).toBe(true);
  });
});

describe("API giả: tin tức", () => {
  test("trang 1 có bài nổi bật và bảy dòng", async () => {
    const list = await getNewsList({});
    expect(list.page).toBe(1);
    expect(list.featured).not.toBeNull();
    expect(list.items.length).toBe(7);
    expect(list.items.every((post) => post.excerpt.length > 0)).toBe(true);
    expect(list.items.some((post) => post.slug === list.featured?.slug)).toBe(false);
  });

  test("lọc theo loại chỉ trả bài của loại đó và không có bài nổi bật", async () => {
    const list = await getNewsList({ loai: "su-kien" });
    expect(list.featured).toBeNull();
    expect(list.items.length).toBeGreaterThan(0);
    expect(list.items.every((post) => post.category === "su-kien")).toBe(true);
  });

  test("chi tiết bài có nội dung và bài liên quan", async () => {
    const first = (await getNewsList({})).items[0];
    expect(first).toBeDefined();
    const detail = await getNewsDetail(first?.slug ?? "");
    expect(detail.bodyHtml.length).toBeGreaterThan(0);
    expect(detail.related.length).toBeGreaterThan(0);
    expect(detail.related.some((post) => post.slug === detail.slug)).toBe(false);
  });

  test("slug không có thì lỗi not_found", async () => {
    const error = await getNewsDetail("khong-co-bai-nay").catch((e: unknown) => e);
    expect(isApiError(error)).toBe(true);
    if (isApiError(error)) {
      expect(error.status).toBe(404);
      expect(error.code).toBe("not_found");
    }
  });
});

describe("API giả: kho đồ, xếp hạng, trạng thái", () => {
  test("danh sách vật phẩm có nhóm và lọc theo từ khóa không dấu", async () => {
    const all = await getItemList({});
    expect(all.groups.length).toBe(9);
    expect(all.items.length).toBeLessThanOrEqual(12);
    expect(all.total).toBe(167);
    const ak = await getItemList({ q: "ak" });
    expect(ak.items.length).toBeGreaterThan(0);
    const none = await getItemList({ q: "zzzzzz" });
    expect(none.items.length).toBe(0);
  });

  test("158 vật phẩm nhập từ client game có mã trong game, hai nhóm mới và ba món ẩn", async () => {
    const imported = (await getItemList({ limit: 48 })).groups;
    const counts = Object.fromEntries(imported.map((group) => [group.key, group.count]));
    expect(counts["nhan-vat"]).toBe(22);
    expect(counts["cong-thuc"]).toBe(4);
    expect(counts.dan).toBe(0);
    const helmets = await getItemList({ loai: "giap-va-ba-lo", q: "m9 helmet" });
    const helmet = helmets.items.find((entry) => entry.name === "M9 Helmet Green");
    expect(helmet?.gameItemId).toBe("20047");
    expect(helmet?.imageKey).toBe("");
    expect(helmet?.stats.length).toBeGreaterThan(0);
    const hidden = await getItem("vat-pham-20252").catch((error: unknown) => error);
    expect(isApiError(hidden)).toBe(true);
  });

  test("chi tiết vật phẩm theo slug", async () => {
    const [first] = (await getItemList({})).items;
    const item = await getItem(first?.slug ?? "");
    expect(item.slug).toBe(first?.slug ?? "");
  });

  test("bảng xếp hạng: tổng lấy từ dữ liệu mẫu, khách không có dòng của tôi", async () => {
    const board = await getRanking({});
    expect(board.totalPlayers).toBe(12480);
    expect(board.me).toBeNull();
    expect(board.rows.length).toBe(12);
    const clans = await getRanking({ bang: "gia-toc" });
    expect(clans.totalClans).toBe(86);
  });

  test("tìm người chơi dưới 2 ký tự bị từ chối", async () => {
    const error = await getRanking({ q: "a" }).catch((e: unknown) => e);
    expect(isApiError(error) && error.status === 422).toBe(true);
  });

  test("trạng thái máy chủ, tải game và banner", async () => {
    expect((await getServerStatus()).online).toBe(true);
    expect((await getDownloadInfo()).version.length).toBeGreaterThan(0);
    const { banner } = await getBanner();
    expect(banner === null || typeof banner.id === "number").toBe(true);
  });
});

describe("API giả: tài khoản và chế độ thử", () => {
  test("khách gọi /me nhận 401 và phát sự kiện unauthorized", async () => {
    const events: string[] = [];
    const off = onApiEvent((event) => events.push(event.type));
    const error = await getMe().catch((e: unknown) => e);
    off();
    expect(isApiError(error) && error.status === 401).toBe(true);
    expect(events).toEqual(["unauthorized"]);
  });

  test("đăng nhập đúng rồi xem nhân vật", async () => {
    await api.post("/auth/login", { email: "nguoisongsot@email.com", password: "matkhau123" });
    const me = await getMe();
    expect(me.emailMasked).toContain("***");
    const { characters, skills } = await getMyCharacters();
    expect(characters.length).toBe(2);
    expect(skills.length).toBe(6);
  });

  test("đăng nhập sai nhận 401 với thông báo tiếng Việt", async () => {
    const error = await api
      .post("/auth/login", { email: "sai@email.com", password: "x" })
      .catch((e: unknown) => e);
    expect(isApiError(error) && error.status === 401).toBe(true);
  });

  test("chế độ error làm mọi danh sách lỗi 500", async () => {
    setMockConfig({ latencyMs: 0, mode: "error", session: "guest" });
    const error = await getNewsList({}).catch((e: unknown) => e);
    expect(isApiError(error) && error.status === 500 && error.code === "server_error").toBe(true);
  });

  test("chế độ empty làm danh sách rỗng", async () => {
    setMockConfig({ latencyMs: 0, mode: "empty", session: "guest" });
    expect((await getNewsList({})).items).toEqual([]);
    expect((await getItemList({})).items).toEqual([]);
    expect((await getRanking({})).rows).toEqual([]);
  });

  test("phản hồi sai lược đồ bị coi là lỗi máy chủ", async () => {
    const error = await parseResponse(
      Promise.resolve({ data: { khong: "dung" } }),
      z.object({ items: z.array(z.string()) }),
    ).catch((e: unknown) => e);
    expect(isApiError(error) && error.code === "invalid_response").toBe(true);
  });

  test("máy chủ ngoại tuyến", async () => {
    setMockConfig({ latencyMs: 0, mode: "offline", session: "guest" });
    expect((await getServerStatus()).online).toBe(false);
  });
});
