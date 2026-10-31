// Bộ chuyển đổi (adapter) của Axios cho bản chạy trong trình duyệt (E0-S7).
// Phiên của bản này nằm trong bộ nhớ của trang, hoặc lấy từ ?mock=user và ?mock=admin. Dữ liệu do lõi core.ts xử lý.
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { setNow } from "../../lib/clock.ts";
import { getMockConfig, type MockConfig } from "./config.ts";
import { type CoreDeps, handleRequest } from "./core.ts";
import { MOCK_NOW, resetMockDb } from "./db.ts";
import type { Query, SessionEffect } from "./reply.ts";
import { ADMIN_EMAIL, resetSessionState, type Session, sessionOf, USER_EMAIL } from "./session.ts";

const browser = {
  session: null as Session | null,
  /** Đã bấm đăng xuất: không quay lại phiên mặc định của ?mock=user hoặc ?mock=admin. */
  loggedOut: false,
};

/** Bản trình duyệt giữ mật khẩu nguyên chữ trong bộ nhớ, vì dữ liệu mất khi tải lại trang. */
const deps: CoreDeps = {
  passwords: {
    hash: (password) => password,
    verify: (password, hash) => password === hash,
  },
  now: () => Date.now(),
  stamp: () => MOCK_NOW,
};

function sessionFor(config: MockConfig): Session | null {
  if (browser.session) return browser.session;
  if (browser.loggedOut || config.session === "guest") return null;
  return sessionOf(config.session === "admin" ? ADMIN_EMAIL : USER_EMAIL);
}

function applyEffect(effect: SessionEffect | undefined): void {
  if (effect?.type === "sign-in") {
    browser.session = effect.session;
    browser.loggedOut = false;
  } else if (effect?.type === "sign-out") {
    browser.session = null;
    browser.loggedOut = true;
  }
}

function delay(ms: number): Promise<void> {
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
}

function queryOf(config: InternalAxiosRequestConfig): Query {
  const query: Query = {};
  for (const [key, value] of Object.entries(config.params ?? {})) {
    if (value !== undefined && value !== null && value !== "") query[key] = String(value);
  }
  return query;
}

/** Đặt lại trạng thái đăng nhập (dùng trong kiểm thử). */
export function resetMockSession(): void {
  browser.session = null;
  browser.loggedOut = false;
  resetSessionState();
  resetMockDb();
}

export async function handleMockRequest(
  config: InternalAxiosRequestConfig,
): Promise<AxiosResponse> {
  setNow(MOCK_NOW);
  const mock = getMockConfig();
  await delay(mock.latencyMs);
  if (config.signal?.aborted) {
    throw new AxiosError("Đã hủy.", AxiosError.ERR_CANCELED, config);
  }
  const url = new URL(config.url ?? "/", "http://mock.local");
  const reply = await handleRequest(
    {
      method: (config.method ?? "get").toLowerCase(),
      path: url.pathname,
      query: queryOf(config),
      body: typeof config.data === "string" && config.data ? JSON.parse(config.data) : config.data,
      config: mock,
      session: sessionFor(mock),
    },
    deps,
  );
  applyEffect(reply.effect);
  const response: AxiosResponse = {
    data: reply.data,
    status: reply.status,
    statusText: String(reply.status),
    headers: reply.headers ?? {},
    config,
  };
  if (reply.status >= 200 && reply.status < 300) return response;
  throw new AxiosError(
    `Yêu cầu giả trả mã ${reply.status}`,
    reply.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
    config,
    null,
    response,
  );
}
