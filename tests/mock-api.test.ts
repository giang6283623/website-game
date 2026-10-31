// Lớp API của máy chủ giả (nhóm C và D): cookie, CSRF, Origin, phân quyền, hủy phiên, độ bền.
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type ApiInput, type ApiOutput, createMockApi } from "../scripts/lib/mock-api.ts";
import { type MockStore, openMockStore } from "../scripts/lib/mock-store.ts";
import { SESSION_HINT_COOKIE } from "../src/api/auth-transport.ts";
import { resetMockSession } from "../src/api/mock/adapter.ts";
import type { PasswordHasher } from "../src/api/mock/core.ts";
import { MOCK_NOW } from "../src/api/mock/db.ts";
import { ADMIN_EMAIL, DEMO_PASSWORD, USER_EMAIL } from "../src/api/mock/session.ts";

const ORIGIN = "http://localhost:4175";
const HOST = "localhost:4175";
const DAY = 24 * 60 * 60 * 1000;
const passwords: PasswordHasher = {
  hash: (password) => `bam:${password}`,
  verify: (password, hash) => hash === `bam:${password}`,
};

let parent = "";
let dir = "";
let count = 0;
let clock = 1_000_000;
let logs: string[] = [];
let store: MockStore;
let api: ReturnType<typeof createMockApi>;

async function boot(secureCookies = false) {
  store = await openMockStore({ dir, passwords, log: () => {} });
  api = createMockApi({
    store,
    passwords,
    origins: [ORIGIN, "http://127.0.0.1:4175"],
    hosts: [HOST, "127.0.0.1:4175"],
    secureCookies,
    now: () => clock,
    log: (line) => logs.push(line),
  });
}

type SendOptions = {
  origin?: string | null;
  csrf?: string | null;
  host?: string;
  rawBody?: string;
};

/** Trình duyệt giả: giữ cookie, gắn Origin và mã CSRF như client.ts làm. */
class Browser {
  jar = new Map<string, string>();

  absorb(output: ApiOutput) {
    for (const [name, value] of output.headers) {
      if (name !== "set-cookie") continue;
      const [pair = "", ...attributes] = value.split("; ");
      const [key = "", cookie = ""] = pair.split("=");
      if (attributes.includes("Max-Age=0")) this.jar.delete(key);
      else this.jar.set(key, cookie);
    }
  }

  async send(method: string, path: string, body?: unknown, options: SendOptions = {}) {
    const url = new URL(path, ORIGIN);
    const headers = new Map<string, string>([["host", options.host ?? HOST]]);
    const cookie = [...this.jar].map(([key, value]) => `${key}=${value}`).join("; ");
    if (cookie) headers.set("cookie", cookie);
    if (method !== "GET") {
      const origin = options.origin === undefined ? ORIGIN : options.origin;
      if (origin) headers.set("origin", origin);
      const csrf = options.csrf === undefined ? this.jar.get("csrf_token") : options.csrf;
      if (csrf) headers.set("x-csrf-token", csrf);
    }
    const input: ApiInput = {
      method,
      path: url.pathname,
      search: url.search,
      header: (name) => headers.get(name) ?? null,
      text: async () => options.rawBody ?? (body === undefined ? "" : JSON.stringify(body)),
      formData: async () => new FormData(),
    };
    const output = await api.handle(input);
    this.absorb(output);
    return { ...output, json: output.body ? JSON.parse(output.body) : null };
  }

  /** Lấy mã CSRF như khi tải trang lần đầu. */
  async visit() {
    return this.send("GET", "/api/v1/me");
  }

  async login(email = USER_EMAIL, password = DEMO_PASSWORD) {
    await this.visit();
    return this.send("POST", "/api/v1/auth/login", { email, password });
  }
}

const cookieLines = (output: ApiOutput) =>
  output.headers.filter(([name]) => name === "set-cookie").map(([, value]) => value);
const fileText = (name: string) => readFileSync(join(dir, name), "utf8");
const snapshot = () => ["db.json", "accounts.json", "sessions.json"].map(fileText).join("\n");
const NEWS = {
  title: "Bài kiểm thử",
  category: "tin-tuc",
  bodyHtml: "<p>Nội dung</p>",
  status: "draft",
};

beforeAll(() => {
  parent = mkdtempSync(join(tmpdir(), "issvn-api-"));
});

afterAll(() => {
  Bun.spawnSync(["trash", parent]);
});

beforeEach(async () => {
  count += 1;
  dir = join(parent, `lan-${count}`);
  clock = 1_000_000;
  logs = [];
  await boot();
});

afterEach(() => {
  resetMockSession();
});

describe("đăng nhập và cookie", () => {
  test("cookie phiên HttpOnly, SameSite=Lax, Path=/, 14 ngày. csrf_token đọc được", async () => {
    const reply = await new Browser().login();
    expect(reply.status).toBe(200);
    const lines = cookieLines(reply);
    const session = lines.find((line) => line.startsWith("issvn_session="));
    expect(session).toContain("; HttpOnly");
    expect(session).toContain("; SameSite=Lax");
    expect(session).toContain("; Path=/");
    expect(session).toContain("; Max-Age=1209600");
    expect(session).not.toContain("Secure");
    const csrf = lines.find((line) => line.startsWith("csrf_token="));
    expect(csrf).toContain("; SameSite=Lax");
    expect(csrf).not.toContain("HttpOnly");
  });

  test("bật cookie an toàn thì có Secure và tên __Host-", async () => {
    await boot(true);
    const reply = await new Browser().login();
    const session = cookieLines(reply).find((line) => line.startsWith("__Host-issvn_session="));
    expect(session).toContain("; Secure");
    expect(session).toContain("; Path=/");
    expect(session).not.toContain("Domain");
  });

  test("mã phiên 32 byte, tệp chỉ giữ băm SHA-256, mỗi lần đăng nhập một mã mới", async () => {
    const browser = new Browser();
    await browser.login();
    const first = browser.jar.get("issvn_session") ?? "";
    expect(Buffer.from(first, "base64url").length).toBe(32);
    expect(snapshot()).not.toContain(first);
    const hash = new Bun.CryptoHasher("sha256").update(first).digest("hex");
    expect(fileText("sessions.json")).toContain(hash);

    await browser.send("POST", "/api/v1/auth/login", {
      email: USER_EMAIL,
      password: DEMO_PASSWORD,
    });
    const second = browser.jar.get("issvn_session");
    expect(second === first).toBe(false);
    expect(JSON.parse(fileText("sessions.json")).sessions.length).toBe(1);
  });

  test("hai trình duyệt, hai tài khoản, không lẫn", async () => {
    const player = new Browser();
    const admin = new Browser();
    await player.login();
    await admin.login(ADMIN_EMAIL);
    expect((await player.send("GET", "/api/v1/me")).json.role).toBe("player");
    expect((await admin.send("GET", "/api/v1/me")).json.role).toBe("admin");
  });

  test("đăng ký thành công tạo phiên ngay", async () => {
    const browser = new Browser();
    await browser.visit();
    const reply = await browser.send("POST", "/api/v1/auth/register", {
      email: "moi@email.com",
      displayName: "NguoiMoi01",
      password: "matkhau-moi",
      passwordConfirm: "matkhau-moi",
    });
    expect(reply.status).toBe(201);
    expect((await browser.send("GET", "/api/v1/me")).json.displayName).toBe("NguoiMoi01");
    expect(fileText("accounts.json")).not.toContain('"matkhau-moi"');
  });

  test("sai nhiều lần trả 429 có Retry-After", async () => {
    const browser = new Browser();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect((await browser.login(USER_EMAIL, "sai")).status).toBe(401);
    }
    const reply = await browser.login();
    expect(reply.status).toBe(429);
    expect(reply.headers).toContainEqual(["retry-after", "900"]);
  });

  test("nhật ký không có mật khẩu, cookie, mã phiên, mã đặt lại", async () => {
    const browser = new Browser();
    await browser.login();
    await browser.send("GET", "/api/v1/auth/reset/ma-mau");
    const text = logs.join("\n");
    expect(logs.length).toBeGreaterThan(0);
    expect(text).not.toContain(DEMO_PASSWORD);
    expect(text).not.toContain(browser.jar.get("issvn_session") ?? "x");
    expect(text).not.toContain(browser.jar.get("csrf_token") ?? "x");
    expect(text).not.toContain("ma-mau");
  });
});

describe("chống giả mạo (A4)", () => {
  async function signedIn() {
    const browser = new Browser();
    await browser.login(ADMIN_EMAIL);
    return browser;
  }

  test("khách nhận csrf_token ngay lần đọc đầu", async () => {
    const browser = new Browser();
    await browser.visit();
    expect(browser.jar.get("csrf_token")?.length).toBeGreaterThan(20);
  });

  test("thiếu mã CSRF thì 403, tệp không đổi", async () => {
    const browser = await signedIn();
    const before = snapshot();
    const reply = await browser.send("POST", "/api/v1/admin/news", NEWS, { csrf: null });
    expect(reply.status).toBe(403);
    expect(snapshot()).toBe(before);
  });

  test("sai mã CSRF thì 403, tệp không đổi", async () => {
    const browser = await signedIn();
    const before = snapshot();
    const reply = await browser.send("POST", "/api/v1/admin/news", NEWS, { csrf: "sai-ma" });
    expect(reply.status).toBe(403);
    expect(snapshot()).toBe(before);
  });

  test("mã CSRF của phiên khác không dùng được", async () => {
    const browser = await signedIn();
    const other = await signedIn();
    const reply = await browser.send("POST", "/api/v1/admin/news", NEWS, {
      csrf: other.jar.get("csrf_token"),
    });
    expect(reply.status).toBe(403);
  });

  test.each([
    ["sai", "https://ke-gian.example"],
    ["thiếu", null],
    ["khác cổng", "http://localhost:9999"],
  ])("%s Origin thì 403", async (_name, origin) => {
    const browser = await signedIn();
    const before = snapshot();
    const reply = await browser.send("POST", "/api/v1/admin/news", NEWS, { origin });
    expect(reply.status).toBe(403);
    expect(snapshot()).toBe(before);
  });

  test("đăng nhập cũng phải có Origin và mã CSRF", async () => {
    const browser = new Browser();
    await browser.visit();
    const body = { email: USER_EMAIL, password: DEMO_PASSWORD };
    expect((await browser.send("POST", "/api/v1/auth/login", body, { csrf: null })).status).toBe(
      403,
    );
    expect(
      (
        await browser.send("POST", "/api/v1/auth/login", body, {
          origin: "https://ke-gian.example",
        })
      ).status,
    ).toBe(403);
  });

  test("thử ghi bằng GET không đổi gì", async () => {
    const browser = await signedIn();
    const before = snapshot();
    expect((await browser.send("GET", "/api/v1/auth/logout")).status).toBe(404);
    expect((await browser.send("GET", "/api/v1/admin/users/1/lock")).status).toBe(404);
    expect((await browser.send("GET", "/api/v1/me")).status).toBe(200);
    expect(snapshot()).toBe(before);
  });

  test("tên máy lạ (đổi DNS về 127.0.0.1) bị từ chối", async () => {
    const browser = new Browser();
    const reply = await browser.send("GET", "/api/v1/me", undefined, { host: "ke-gian.example" });
    expect(reply.status).toBe(403);
  });
});

describe("phân quyền (A5)", () => {
  test("?mock=admin không cấp quyền: chưa đăng nhập vẫn 401", async () => {
    const browser = new Browser();
    expect((await browser.send("GET", "/api/v1/admin/news?mock=admin")).status).toBe(401);
    expect((await browser.send("GET", "/api/v1/me?mock=user")).status).toBe(401);
  });

  test("người chơi gọi quản trị thì 403, quản trị thì 200", async () => {
    const player = new Browser();
    await player.login();
    expect((await player.send("GET", "/api/v1/admin/news?mock=admin")).status).toBe(403);
    const admin = new Browser();
    await admin.login(ADMIN_EMAIL);
    expect((await admin.send("GET", "/api/v1/admin/news")).status).toBe(200);
  });
});

describe("hủy phiên (A6)", () => {
  async function keepOldCookie(browser: Browser) {
    const old = new Browser();
    old.jar = new Map(browser.jar);
    return old;
  }

  test("đăng xuất thì mã phiên cũ trả 401 và cookie bị xóa", async () => {
    const browser = new Browser();
    await browser.login();
    const old = await keepOldCookie(browser);
    const reply = await browser.send("POST", "/api/v1/auth/logout");
    expect(reply.status).toBe(204);
    expect(browser.jar.has("issvn_session")).toBe(false);
    expect((await old.send("GET", "/api/v1/me")).status).toBe(401);
  });

  test("đổi mật khẩu: mã cũ 401, trình duyệt đang dùng có mã mới, mật khẩu cũ sai", async () => {
    const browser = new Browser();
    await browser.login();
    const old = await keepOldCookie(browser);
    const otherDevice = new Browser();
    await otherDevice.login();
    const reply = await browser.send("POST", "/api/v1/account/password", {
      currentPassword: DEMO_PASSWORD,
      newPassword: "matkhau-moi",
      newPasswordConfirm: "matkhau-moi",
    });
    expect(reply.status).toBe(204);
    expect((await old.send("GET", "/api/v1/me")).status).toBe(401);
    expect((await otherDevice.send("GET", "/api/v1/me")).status).toBe(401);
    expect((await browser.send("GET", "/api/v1/me")).status).toBe(200);
    expect((await new Browser().login(USER_EMAIL, DEMO_PASSWORD)).status).toBe(401);
    expect((await new Browser().login(USER_EMAIL, "matkhau-moi")).status).toBe(200);
  });

  test("hết hạn sau 14 ngày không dùng", async () => {
    const browser = new Browser();
    await browser.login();
    clock += 14 * DAY + 1;
    const reply = await browser.send("GET", "/api/v1/me");
    expect(reply.status).toBe(401);
    expect(browser.jar.has("issvn_session")).toBe(false);
    expect(JSON.parse(fileText("sessions.json")).sessions.length).toBe(0);
  });

  test("còn dùng thì thời hạn trượt theo, cookie được gia hạn", async () => {
    const browser = new Browser();
    await browser.login();
    clock += 10 * DAY;
    const reply = await browser.send("GET", "/api/v1/me");
    expect(reply.status).toBe(200);
    expect(cookieLines(reply).some((line) => line.startsWith("issvn_session="))).toBe(true);
    clock += 10 * DAY;
    expect((await browser.send("GET", "/api/v1/me")).status).toBe(200);
  });

  test("hết phiên thì ghi trả 401, không phải 403", async () => {
    const browser = new Browser();
    await browser.login(ADMIN_EMAIL);
    clock += 15 * DAY;
    expect((await browser.send("POST", "/api/v1/admin/news", NEWS)).status).toBe(401);
  });
});

describe("cookie gợi ý có phiên (C-154)", () => {
  const hintLine = (output: ApiOutput) =>
    cookieLines(output).find((line) => line.startsWith(`${SESSION_HINT_COOKIE}=`));

  test("đăng nhập đặt cookie đọc được, không chứa mã phiên, cùng thời hạn với cookie phiên", async () => {
    const browser = new Browser();
    const reply = await browser.login();
    expect(hintLine(reply)).toBe(`${SESSION_HINT_COOKIE}=1; Path=/; SameSite=Lax; Max-Age=1209600`);
  });

  test("bật cookie an toàn thì cookie gợi ý cũng có Secure, trình duyệt xử lý như cookie phiên", async () => {
    await boot(true);
    expect(hintLine(await new Browser().login())).toContain("; Secure");
  });

  test("khách không nhận cookie gợi ý", async () => {
    const browser = new Browser();
    await browser.visit();
    await browser.send("GET", "/api/v1/server/status");
    expect(browser.jar.has(SESSION_HINT_COOKIE)).toBe(false);
  });

  test("đăng nhập sai không đặt cookie gợi ý", async () => {
    const browser = new Browser();
    await browser.login(USER_EMAIL, "sai");
    expect(browser.jar.has(SESSION_HINT_COOKIE)).toBe(false);
  });

  test("đăng ký thành công đặt cookie gợi ý", async () => {
    const browser = new Browser();
    await browser.visit();
    await browser.send("POST", "/api/v1/auth/register", {
      email: "moi@email.com",
      displayName: "NguoiMoi01",
      password: "matkhau-moi",
      passwordConfirm: "matkhau-moi",
    });
    expect(browser.jar.get(SESSION_HINT_COOKIE)).toBe("1");
  });

  test("đăng xuất xóa cookie gợi ý", async () => {
    const browser = new Browser();
    await browser.login();
    await browser.send("POST", "/api/v1/auth/logout");
    expect(browser.jar.has(SESSION_HINT_COOKIE)).toBe(false);
  });

  test("đổi mật khẩu cấp phiên mới, cookie gợi ý còn", async () => {
    const browser = new Browser();
    await browser.login();
    await browser.send("POST", "/api/v1/account/password", {
      currentPassword: DEMO_PASSWORD,
      newPassword: "matkhau-moi",
      newPasswordConfirm: "matkhau-moi",
    });
    expect(browser.jar.get(SESSION_HINT_COOKIE)).toBe("1");
  });

  test("gia hạn phiên thì gia hạn cả cookie gợi ý, nếu không hai cookie sẽ hết hạn lệch nhau", async () => {
    const browser = new Browser();
    await browser.login();
    clock += 10 * DAY;
    expect(hintLine(await browser.send("GET", "/api/v1/me"))).toContain("; Max-Age=1209600");
  });

  test("đọc bình thường không đặt lại cookie gợi ý", async () => {
    const browser = new Browser();
    await browser.login();
    expect(hintLine(await browser.send("GET", "/api/v1/me"))).toBeUndefined();
  });

  test("phiên hết hạn thì xóa cookie gợi ý", async () => {
    const browser = new Browser();
    await browser.login();
    clock += 14 * DAY + 1;
    await browser.send("GET", "/api/v1/me");
    expect(browser.jar.has(SESSION_HINT_COOKIE)).toBe(false);
  });

  test("mất cookie phiên mà còn cookie gợi ý thì xóa, lần tải sau không gọi /me nữa", async () => {
    const browser = new Browser();
    await browser.login();
    browser.jar.delete("issvn_session");
    await browser.send("GET", "/api/v1/server/status");
    expect(browser.jar.has(SESSION_HINT_COOKIE)).toBe(false);
  });

  test("còn phiên mà mất cookie gợi ý thì đặt lại, để lần tải sau không thành khách", async () => {
    const browser = new Browser();
    await browser.login();
    browser.jar.delete(SESSION_HINT_COOKIE);
    await browser.send("GET", "/api/v1/server/status");
    expect(browser.jar.get(SESSION_HINT_COOKIE)).toBe("1");
  });

  test("bị khóa tài khoản: lần gọi sau của người đó xóa cookie gợi ý", async () => {
    const player = new Browser();
    await player.visit();
    const created = await player.send("POST", "/api/v1/auth/register", {
      email: "moi@email.com",
      displayName: "NguoiMoi01",
      password: "matkhau-moi",
      passwordConfirm: "matkhau-moi",
    });
    const admin = new Browser();
    await admin.login(ADMIN_EMAIL);
    await admin.send("POST", `/api/v1/admin/users/${created.json.id}/lock`);
    expect((await player.send("GET", "/api/v1/me")).status).toBe(401);
    expect(player.jar.has(SESSION_HINT_COOKIE)).toBe(false);
  });

  test("tự tạo cookie gợi ý không cấp quyền gì", async () => {
    const browser = new Browser();
    await browser.visit();
    browser.jar.set(SESSION_HINT_COOKIE, "1");
    expect((await browser.send("GET", "/api/v1/admin/news")).status).toBe(401);
    expect(browser.jar.has(SESSION_HINT_COOKIE)).toBe(false);
  });
});

describe("giờ thật của bản ghi mới (C-165)", () => {
  const REAL_MS = Date.parse("2026-11-02T03:04:05Z");
  const REAL_TEXT = "2026-11-02T10:04:05+07:00";
  const PUBLISHED = { ...NEWS, title: "Bài đăng thật", status: "published" };
  const ITEM = {
    name: "Vật phẩm mới",
    slug: "vat-pham-moi",
    group: "vu-khi",
    typeLabel: "Súng",
    stats: [],
  };

  async function signedInAt(ms: number) {
    clock = ms;
    const admin = new Browser();
    await admin.login(ADMIN_EMAIL);
    return admin;
  }

  test("bài đăng mới mang giờ thật và hiện ngay ở trang công khai", async () => {
    const admin = await signedInAt(REAL_MS);
    const post = (await admin.send("POST", "/api/v1/admin/news", PUBLISHED)).json;
    expect(post.publishedAt).toBe(REAL_TEXT);
    expect(post.createdAt).toBe(REAL_TEXT);
    expect(post.updatedAt).toBe(REAL_TEXT);
    const list = (await new Browser().send("GET", "/api/v1/news")).json;
    expect(list.items[0].slug).toBe(post.slug);
    expect((await new Browser().send("GET", `/api/v1/news/${post.slug}`)).status).toBe(200);
  });

  test("lưu nháp rồi mới đăng: ngày đăng là lúc đăng, ngày tạo giữ nguyên", async () => {
    const admin = await signedInAt(REAL_MS);
    const draft = (await admin.send("POST", "/api/v1/admin/news", NEWS)).json;
    expect(draft.publishedAt).toBe(null);
    clock = REAL_MS + 60 * 60 * 1000;
    const post = (
      await admin.send("PUT", `/api/v1/admin/news/${draft.id}`, { status: "published" })
    ).json;
    expect(post.createdAt).toBe(REAL_TEXT);
    expect(post.publishedAt).toBe("2026-11-02T11:04:05+07:00");
  });

  test("sửa bài mẫu đổi giờ cập nhật, giữ ngày đăng gốc", async () => {
    const admin = await signedInAt(REAL_MS);
    const before = (await admin.send("GET", "/api/v1/admin/news")).json.items[0];
    const after = (
      await admin.send("PUT", `/api/v1/admin/news/${before.id}`, { title: "Tiêu đề mới" })
    ).json;
    expect(after.updatedAt).toBe(REAL_TEXT);
    expect(after.publishedAt).toBe(before.publishedAt);
  });

  test("nhật ký ghi giờ thật, dòng mới đứng đầu", async () => {
    const admin = await signedInAt(REAL_MS);
    await admin.send("POST", "/api/v1/admin/news", NEWS);
    const entry = (await admin.send("GET", "/api/v1/admin/audit")).json.entries[0];
    expect(entry.at).toBe(REAL_TEXT);
    expect(entry.action).toBe("news.draft");
  });

  test("xóa bài và khóa người dùng cũng ghi nhật ký giờ thật", async () => {
    const admin = await signedInAt(REAL_MS);
    const post = (await admin.send("POST", "/api/v1/admin/news", NEWS)).json;
    clock = REAL_MS + 60_000;
    await admin.send("DELETE", `/api/v1/admin/news/${post.id}`);
    const entries = (await admin.send("GET", "/api/v1/admin/audit")).json.entries;
    expect(entries[0].action).toBe("news.delete");
    expect(entries[0].at).toBe("2026-11-02T10:05:05+07:00");
    clock = REAL_MS + 120_000;
    await admin.send("POST", "/api/v1/admin/users/1/lock");
    const latest = (await admin.send("GET", "/api/v1/admin/audit")).json.entries[0];
    expect(latest.action).toBe("user.lock");
    expect(latest.at).toBe("2026-11-02T10:06:05+07:00");
  });

  test("vật phẩm mới mang giờ thật và đứng đầu danh sách công khai", async () => {
    const admin = await signedInAt(REAL_MS);
    const item = (await admin.send("POST", "/api/v1/admin/items", ITEM)).json;
    expect(item.publishedAt).toBe(REAL_TEXT);
    const list = (await new Browser().send("GET", "/api/v1/items")).json;
    expect(list.items[0].slug).toBe(ITEM.slug);
  });

  test("banner mới mang giờ thật, sửa và xóa ghi nhật ký giờ thật", async () => {
    const admin = await signedInAt(REAL_MS);
    const banner = (
      await admin.send("POST", "/api/v1/admin/banners", {
        message: "Banner mới",
        startsAt: "2026-10-30",
        endsAt: "2026-11-30",
      })
    ).json;
    expect(banner.createdAt).toBe(REAL_TEXT);
    clock = REAL_MS + 60_000;
    await admin.send("PATCH", `/api/v1/admin/banners/${banner.id}`, { message: "Đã sửa" });
    const entry = (await admin.send("GET", "/api/v1/admin/audit")).json.entries[0];
    expect(entry.action).toBe("banner.update");
    expect(entry.at).toBe("2026-11-02T10:05:05+07:00");
  });

  test("sửa vật phẩm ghi nhật ký giờ thật", async () => {
    const admin = await signedInAt(REAL_MS);
    const item = (await admin.send("POST", "/api/v1/admin/items", ITEM)).json;
    clock = REAL_MS + 60_000;
    await admin.send("PATCH", `/api/v1/admin/items/${item.id}`, { name: "Tên mới" });
    const entry = (await admin.send("GET", "/api/v1/admin/audit")).json.entries[0];
    expect(entry.action).toBe("item.update");
    expect(entry.at).toBe("2026-11-02T10:05:05+07:00");
  });

  test("tài khoản mới mang ngày thật theo giờ Việt Nam, kể cả khi giờ UTC còn ở ngày trước", async () => {
    clock = Date.parse("2026-11-02T18:00:00Z");
    const browser = new Browser();
    await browser.visit();
    const account = await browser.send("POST", "/api/v1/auth/register", {
      email: "moi@email.com",
      displayName: "NguoiMoi01",
      password: "matkhau-moi",
      passwordConfirm: "matkhau-moi",
    });
    expect(account.json.createdAt).toBe("2026-11-03");
  });

  test("đồng hồ máy lùi trước ngày mẫu: bản ghi không tụt dưới dữ liệu mẫu, vẫn hiện", async () => {
    const admin = await signedInAt(1_000_000);
    const post = (await admin.send("POST", "/api/v1/admin/news", PUBLISHED)).json;
    expect(post.publishedAt).toBe(MOCK_NOW);
    expect((await new Browser().send("GET", `/api/v1/news/${post.slug}`)).status).toBe(200);
  });

  test("bản ghi giờ thật còn hiện sau khi tắt rồi bật lại máy chủ", async () => {
    const admin = await signedInAt(REAL_MS);
    const post = (await admin.send("POST", "/api/v1/admin/news", PUBLISHED)).json;
    resetMockSession();
    await boot();
    clock = REAL_MS + DAY;
    const reply = await new Browser().send("GET", `/api/v1/news/${post.slug}`);
    expect(reply.status).toBe(200);
    expect(reply.json.publishedAt).toBe(REAL_TEXT);
  });

  test("dải banner vẫn so với ngày mẫu: giờ thật đã qua ngày kết thúc thì banner mẫu không mất", async () => {
    clock = Date.parse("2027-06-01T00:00:00Z");
    const reply = await new Browser().send("GET", "/api/v1/banner");
    expect(reply.json.banner?.id).toBe(1);
  });
});

describe("thân yêu cầu", () => {
  test("JSON hỏng thì 400, quá cỡ thì 413, không sập", async () => {
    const browser = new Browser();
    await browser.visit();
    const broken = await browser.send("POST", "/api/v1/auth/login", undefined, {
      rawBody: "{ hỏng",
    });
    expect(broken.status).toBe(400);
    expect(broken.json.error.code).toBe("bad_request");
    const huge = await browser.send("POST", "/api/v1/auth/login", undefined, {
      rawBody: JSON.stringify({ email: "x".repeat(2 * 1024 * 1024) }),
    });
    expect(huge.status).toBe(413);
    expect((await browser.send("GET", "/api/v1/server/status")).status).toBe(200);
  });

  test("đường dẫn mã hóa hỏng thì 400, không sập", async () => {
    const browser = new Browser();
    expect((await browser.send("GET", "/api/v1/news/%E0%A4%A")).status).toBe(400);
  });
});

describe("độ bền (A1, A7)", () => {
  test("tắt rồi bật lại: tài khoản, phiên, bài sửa vẫn còn", async () => {
    const browser = new Browser();
    await browser.visit();
    await browser.send("POST", "/api/v1/auth/register", {
      email: "moi@email.com",
      displayName: "NguoiMoi01",
      password: "matkhau-moi",
      passwordConfirm: "matkhau-moi",
    });
    const admin = new Browser();
    await admin.login(ADMIN_EMAIL);
    const list = await admin.send("GET", "/api/v1/admin/news");
    const id = list.json.items[0].id;
    await admin.send("PUT", `/api/v1/admin/news/${id}`, { title: "Tiêu đề sau khi sửa" });

    resetMockSession();
    await boot();

    expect((await browser.send("GET", "/api/v1/me")).json.displayName).toBe("NguoiMoi01");
    const after = await admin.send("GET", `/api/v1/admin/news/${id}`);
    expect(after.json.title).toBe("Tiêu đề sau khi sửa");
    expect((await new Browser().login("moi@email.com", "matkhau-moi")).status).toBe(200);
  });

  test("20 lần ghi cùng lúc đều vào tệp, mã không trùng", async () => {
    const admin = new Browser();
    await admin.login(ADMIN_EMAIL);
    const replies = await Promise.all(
      Array.from({ length: 20 }, (_, index) =>
        admin.send("POST", "/api/v1/admin/news", { ...NEWS, title: `Bài song song ${index}` }),
      ),
    );
    expect(replies.map((reply) => reply.status)).toEqual(Array(20).fill(201));
    expect(new Set(replies.map((reply) => reply.json.id)).size).toBe(20);
    await store.idle();
    const titles = JSON.parse(fileText("db.json")).news.map(
      (post: { title: string }) => post.title,
    );
    expect(titles.filter((title: string) => title.startsWith("Bài song song")).length).toBe(20);
  });

  test("20 lần đăng ký cùng email cùng lúc chỉ một lần thành công", async () => {
    const browsers = Array.from({ length: 20 }, () => new Browser());
    await Promise.all(browsers.map((browser) => browser.visit()));
    const replies = await Promise.all(
      browsers.map((browser, index) =>
        browser.send("POST", "/api/v1/auth/register", {
          email: "trung@email.com",
          displayName: `NguoiThu${index}`,
          password: "matkhau-moi",
          passwordConfirm: "matkhau-moi",
        }),
      ),
    );
    expect(replies.filter((reply) => reply.status === 201).length).toBe(1);
    expect(replies.filter((reply) => reply.status === 409).length).toBe(19);
  });
});
