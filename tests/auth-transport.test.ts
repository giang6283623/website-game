// Chỗ nối xác thực (nhóm E): hiện chỉ có một cách, cookie và mã CSRF.
import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";
import { mayHaveSession, SESSION_HINT_COOKIE } from "../src/api/auth-transport.ts";
import { createApiClient } from "../src/api/client.ts";

function capture() {
  const seen: InternalAxiosRequestConfig[] = [];
  const adapter: AxiosAdapter = async (config) => {
    seen.push(config);
    return { data: {}, status: 200, statusText: "OK", headers: {}, config };
  };
  return { client: createApiClient({ adapter }), seen };
}

const originalMode = process.env.API_MODE;

afterEach(() => {
  process.env.API_MODE = originalMode;
  // biome-ignore lint/suspicious/noDocumentCookie: kiểm thử giả lập cookie do máy chủ đặt
  document.cookie = "csrf_token=; Max-Age=0; Path=/";
  // biome-ignore lint/suspicious/noDocumentCookie: kiểm thử giả lập cookie do máy chủ đặt
  document.cookie = `${SESSION_HINT_COOKIE}=; Max-Age=0; Path=/`;
  // biome-ignore lint/suspicious/noDocumentCookie: kiểm thử giả lập cookie do máy chủ đặt
  document.cookie = `x${SESSION_HINT_COOKIE}=; Max-Age=0; Path=/`;
});

describe("gắn thông tin xác thực", () => {
  test("yêu cầu ghi có X-CSRF-Token lấy từ cookie, yêu cầu đọc thì không", async () => {
    // biome-ignore lint/suspicious/noDocumentCookie: kiểm thử giả lập cookie do máy chủ đặt
    document.cookie = "csrf_token=ma-csrf; Path=/";
    const { client, seen } = capture();
    await client.post("/auth/login", {});
    await client.put("/admin/news/1", {});
    await client.patch("/admin/items/1", {});
    await client.delete("/admin/banners/1");
    await client.get("/me");
    expect(seen.map((config) => config.headers.has("X-CSRF-Token"))).toEqual([
      true,
      true,
      true,
      true,
      false,
    ]);
    expect(seen[0]?.headers.get("X-CSRF-Token") === "ma-csrf").toBe(true);
  });

  test("chưa có cookie CSRF thì không gắn đầu nào", async () => {
    const { client, seen } = capture();
    await client.post("/auth/login", {});
    expect(seen[0]?.headers.has("X-CSRF-Token")).toBe(false);
  });

  test("luôn gửi kèm cookie", async () => {
    const { client, seen } = capture();
    await client.get("/me");
    expect(seen[0]?.withCredentials).toBe(true);
  });

  test("client.ts không tự đọc cookie, mọi cách xác thực nằm ở auth-transport.ts", () => {
    const text = readFileSync(resolve(import.meta.dir, "../src/api/client.ts"), "utf8");
    expect(text).not.toContain("document.cookie");
    expect(text).not.toContain("X-CSRF-Token");
    expect(text).not.toContain("withCredentials");
  });
});

describe("cookie gợi ý có phiên (C-154)", () => {
  test.each(["mock", "real"])("API_MODE=%s không có cookie gợi ý vẫn hỏi /me", (mode) => {
    process.env.API_MODE = mode;
    expect(mayHaveSession()).toBe(true);
  });

  test("máy chủ giả: chưa có cookie gợi ý thì là khách", () => {
    process.env.API_MODE = "mock-server";
    expect(mayHaveSession()).toBe(false);
  });

  test("máy chủ giả: có cookie gợi ý thì phải hỏi /me", () => {
    process.env.API_MODE = "mock-server";
    // biome-ignore lint/suspicious/noDocumentCookie: kiểm thử giả lập cookie do máy chủ đặt
    document.cookie = `${SESSION_HINT_COOKIE}=1; Path=/`;
    expect(mayHaveSession()).toBe(true);
  });

  test("cookie khác có tên gần giống không tính", () => {
    process.env.API_MODE = "mock-server";
    // biome-ignore lint/suspicious/noDocumentCookie: kiểm thử giả lập cookie do máy chủ đặt
    document.cookie = `x${SESSION_HINT_COOKIE}=1; Path=/`;
    expect(mayHaveSession()).toBe(false);
  });
});
