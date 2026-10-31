// Lõi API giả (nhóm A): phiên đi theo từng yêu cầu, không còn trạng thái chung một người.
import { beforeEach, describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { api } from "../src/api/client.ts";
import { resetMockSession } from "../src/api/mock/adapter.ts";
import type { MockConfig } from "../src/api/mock/config.ts";
import { type CoreDeps, handleRequest } from "../src/api/mock/core.ts";
import { MOCK_NOW, stampAt } from "../src/api/mock/db.ts";
import { ADMIN_EMAIL, DEMO_PASSWORD, type Session, USER_EMAIL } from "../src/api/mock/session.ts";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const config: MockConfig = { latencyMs: 0, mode: "normal", session: "guest" };
let clock = 1_000_000;
const deps: CoreDeps = {
  passwords: {
    hash: (password) => `bam:${password}`,
    verify: (password, hash) => hash === `bam:${password}` || hash === password,
  },
  now: () => clock,
  stamp: () => MOCK_NOW,
};

const player: Session = { kind: "user", email: USER_EMAIL };
const admin: Session = { kind: "admin", email: ADMIN_EMAIL };

function call(method: string, path: string, session: Session | null = null, body?: unknown) {
  return handleRequest({ method, path, query: {}, body, config, session }, deps);
}

const REGISTER = {
  email: "moi@email.com",
  displayName: "NguoiMoi01",
  password: "matkhau-moi",
  passwordConfirm: "matkhau-moi",
};

beforeEach(() => {
  clock = 1_000_000;
  resetMockSession();
});

describe("đóng dấu giờ bản ghi mới (C-165)", () => {
  test("đổi sang giờ Việt Nam, đúng dạng dữ liệu mẫu, kể cả khi sang ngày", () => {
    expect(stampAt(Date.parse("2026-11-02T03:04:05Z"))).toBe("2026-11-02T10:04:05+07:00");
    expect(stampAt(Date.parse("2026-12-31T17:30:00Z"))).toBe("2027-01-01T00:30:00+07:00");
  });

  test("không lùi dưới giờ mẫu, để bản ghi mới không nằm dưới dữ liệu mẫu", () => {
    expect(stampAt(0)).toBe(MOCK_NOW);
    expect(stampAt(Date.parse(MOCK_NOW) - 1000)).toBe(MOCK_NOW);
    expect(stampAt(Date.parse(MOCK_NOW) + 1000)).toBe("2026-10-30T08:30:01+07:00");
  });

  test("lõi đóng dấu bằng deps.stamp, không tự đọc giờ", async () => {
    const stamped: CoreDeps = { ...deps, stamp: () => "2026-11-02T10:04:05+07:00" };
    const reply = await handleRequest(
      {
        method: "post",
        path: "/admin/news",
        query: {},
        body: { title: "Bài mới", status: "draft" },
        config,
        session: admin,
      },
      stamped,
    );
    expect((reply.data as { createdAt: string }).createdAt).toBe("2026-11-02T10:04:05+07:00");
  });

  test("bản chạy trong trình duyệt giữ đồng hồ mẫu, khớp bản vẽ", async () => {
    await api.post("/auth/login", { email: ADMIN_EMAIL, password: DEMO_PASSWORD });
    const reply = await api.post("/admin/news", { title: "Bài mới", status: "draft" });
    expect(reply.data.createdAt).toBe(MOCK_NOW);
  });
});

describe("phiên đi theo từng yêu cầu", () => {
  test("hai phiên khác nhau trong cùng tiến trình không lẫn tài khoản", async () => {
    const created = await call("post", "/auth/register", null, REGISTER);
    expect(created.status).toBe(201);
    const other = await call("post", "/auth/register", null, {
      ...REGISTER,
      email: "khac@email.com",
      displayName: "NguoiKhac02",
    });
    expect(other.status).toBe(201);

    const first = await call("get", "/me", { kind: "new", email: REGISTER.email });
    const second = await call("get", "/me", { kind: "new", email: "khac@email.com" });
    expect((first.data as { displayName: string }).displayName).toBe("NguoiMoi01");
    expect((second.data as { displayName: string }).displayName).toBe("NguoiKhac02");
    expect((await call("get", "/me", admin)).data).toMatchObject({ role: "admin" });
    expect((await call("get", "/me", player)).data).toMatchObject({ role: "player" });
  });

  test("lõi không tự sinh phiên: thiếu phiên thì 401 dù cấu hình ghi admin", async () => {
    const reply = await handleRequest(
      {
        method: "get",
        path: "/admin/news",
        query: { mock: "admin" },
        body: undefined,
        config: { ...config, session: "admin" },
        session: null,
      },
      deps,
    );
    expect(reply.status).toBe(401);
  });

  test("đăng nhập, đăng ký, đăng xuất chỉ báo thay đổi phiên qua effect", async () => {
    const login = await call("post", "/auth/login", null, {
      email: USER_EMAIL,
      password: DEMO_PASSWORD,
    });
    expect(login.effect).toEqual({ type: "sign-in", session: player });
    const logout = await call("post", "/auth/logout", player);
    expect(logout.status).toBe(204);
    expect(logout.effect).toEqual({ type: "sign-out" });
    const created = await call("post", "/auth/register", null, REGISTER);
    expect(created.effect).toEqual({
      type: "sign-in",
      session: { kind: "new", email: REGISTER.email },
    });
  });

  test("đổi mật khẩu đúng người, mật khẩu cũ hết tác dụng, phiên cũ phải thay", async () => {
    await call("post", "/auth/register", null, REGISTER);
    const session: Session = { kind: "new", email: REGISTER.email };
    const change = {
      currentPassword: REGISTER.password,
      newPassword: "matkhau-doi",
      newPasswordConfirm: "matkhau-doi",
    };
    const reply = await call("post", "/account/password", session, change);
    expect(reply.status).toBe(204);
    expect(reply.effect).toEqual({ type: "rotate" });
    const old = await call("post", "/auth/login", null, {
      email: REGISTER.email,
      password: REGISTER.password,
    });
    expect(old.status).toBe(401);
    const fresh = await call("post", "/auth/login", null, {
      email: REGISTER.email,
      password: "matkhau-doi",
    });
    expect(fresh.status).toBe(200);
    expect(
      (
        await call("post", "/auth/login", null, {
          email: USER_EMAIL,
          password: DEMO_PASSWORD,
        })
      ).status,
    ).toBe(200);
  });

  test("đặt lại mật khẩu báo hủy mọi phiên của tài khoản đó", async () => {
    const reply = await call("post", "/auth/reset", null, {
      token: "ma-mau",
      password: "matkhau-dat-lai",
      passwordConfirm: "matkhau-dat-lai",
    });
    expect(reply.status).toBe(204);
    expect(reply.effect).toEqual({ type: "revoke", email: USER_EMAIL });
  });
});

describe("giới hạn đăng nhập", () => {
  const wrong = { email: USER_EMAIL, password: "sai-mat-khau" };

  test("sai năm lần thì lần sau 429 kể cả mật khẩu đúng, hết 15 phút thì mở lại", async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect((await call("post", "/auth/login", null, wrong)).status).toBe(401);
    }
    const locked = await call("post", "/auth/login", null, {
      email: USER_EMAIL,
      password: DEMO_PASSWORD,
    });
    expect(locked.status).toBe(429);
    expect(locked.headers?.["retry-after"]).toBe("900");

    clock += FIFTEEN_MINUTES;
    const open = await call("post", "/auth/login", null, {
      email: USER_EMAIL,
      password: DEMO_PASSWORD,
    });
    expect(open.status).toBe(200);
  });
});

describe("tài khoản mới và khóa tài khoản", () => {
  test("người vừa đăng ký hiện ở danh sách quản trị", async () => {
    await call("post", "/auth/register", null, REGISTER);
    const list = await call("get", "/admin/users", admin);
    const names = (list.data as { users: { displayName: string }[] }).users.map(
      (user) => user.displayName,
    );
    expect(names).toContain("NguoiMoi01");
  });

  test("khóa tài khoản thì hủy phiên và không đăng nhập được, mở khóa thì lại được", async () => {
    await call("post", "/auth/register", null, REGISTER);
    const list = await call("get", "/admin/users", admin);
    const row = (list.data as { users: { id: number; displayName: string }[] }).users.find(
      (user) => user.displayName === "NguoiMoi01",
    );
    const lock = await call("post", `/admin/users/${row?.id}/lock`, admin);
    expect(lock.status).toBe(200);
    expect(lock.effect).toEqual({ type: "revoke", email: REGISTER.email });

    const login = { email: REGISTER.email, password: REGISTER.password };
    expect((await call("post", "/auth/login", null, login)).status).toBe(403);
    await call("post", `/admin/users/${row?.id}/unlock`, admin);
    expect((await call("post", "/auth/login", null, login)).status).toBe(200);
  });
});

describe("gói API giả trong trình duyệt", () => {
  test("không tệp nào dùng Bun hay node:, để gói của trình duyệt vẫn dựng được", () => {
    const folder = resolve(import.meta.dir, "../src/api/mock");
    for (const file of readdirSync(folder)) {
      const text = readFileSync(join(folder, file), "utf8");
      expect(`${file}: ${/\bBun\.|from "node:/.test(text)}`).toBe(`${file}: false`);
    }
  });
});
