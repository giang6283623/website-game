// Lớp API của máy chủ giả: cookie phiên, chống CSRF, kiểm Origin, rồi chuyển yêu cầu cho lõi src/api/mock/core.ts.
// Nhận và trả đối tượng thường, không dùng Request và Response, để kiểm thử chạy được với đồng hồ giả.
// Quyền chỉ lấy từ cookie phiên. Tham số ?mock= không có tác dụng ở đây.
// Không ghi mật khẩu, cookie, mã phiên hay mã đặt lại vào nhật ký.
import { createHash, timingSafeEqual } from "node:crypto";
import { SESSION_HINT_COOKIE } from "../../src/api/auth-transport.ts";
import type { MockConfig } from "../../src/api/mock/config.ts";
import { handleRequest, type PasswordHasher } from "../../src/api/mock/core.ts";
import { stampAt } from "../../src/api/mock/db.ts";
import { FORBIDDEN, fail, type Query, type Reply, SERVER_ERROR } from "../../src/api/mock/reply.ts";
import { sessionOf } from "../../src/api/mock/session.ts";
import type { MockStore, SessionRecord } from "./mock-store.ts";

export const API_PREFIX = "/api/v1";
const SESSION_NAME = "issvn_session";
const CSRF_NAME = "csrf_token";
const SESSION_MAX_AGE_SECONDS = 14 * 24 * 60 * 60;
const SESSION_TTL_MS = SESSION_MAX_AGE_SECONDS * 1000;
/** Gia hạn phiên cách nhau ít nhất chừng này, để mỗi lần đọc không phải ghi tệp. */
const TOUCH_EVERY_MS = 60 * 60 * 1000;
const MAX_JSON_BYTES = 1024 * 1024;
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
/** Máy chủ giả không có chế độ thử của ?mock=. */
const CONFIG: MockConfig = { latencyMs: 0, mode: "normal", session: "guest" };

export type ApiInput = {
  method: string;
  path: string;
  search: string;
  header: (name: string) => string | null;
  text: () => Promise<string>;
  formData: () => Promise<FormData>;
};

export type ApiOutput = { status: number; headers: [string, string][]; body: string | null };

type ApiOptions = {
  store: MockStore;
  passwords: PasswordHasher;
  origins: readonly string[];
  hosts: readonly string[];
  /** Bật `Secure` và tiền tố `__Host-` của cookie phiên. */
  secureCookies: boolean;
  now?: () => number;
  log?: (line: string) => void;
};

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const randomToken = () =>
  Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
/** Mã CSRF của một phiên tính từ mã phiên, nên tệp không phải lưu thêm gì. */
const csrfOfSession = (token: string) => sha256(`csrf:${token}`);

function sameText(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function parseCookies(header: string | null): Map<string, string> {
  const cookies = new Map<string, string>();
  for (const part of (header ?? "").split(";")) {
    const index = part.indexOf("=");
    if (index > 0) cookies.set(part.slice(0, index).trim(), part.slice(index + 1).trim());
  }
  return cookies;
}

function queryOf(search: string): Query {
  const query: Query = {};
  for (const [key, value] of new URLSearchParams(search)) {
    if (value !== "") query[key] = value;
  }
  return query;
}

function outputOf(reply: Reply, cookies: string[] = []): ApiOutput {
  const headers: [string, string][] = [
    ["cache-control", "no-store"],
    ["x-content-type-options", "nosniff"],
    ...Object.entries(reply.headers ?? {}),
    ...cookies.map((cookie): [string, string] => ["set-cookie", cookie]),
  ];
  if (reply.data === null) return { status: reply.status, headers, body: null };
  headers.push(["content-type", "application/json; charset=utf-8"]);
  return { status: reply.status, headers, body: JSON.stringify(reply.data) };
}

export function createMockApi(options: ApiOptions) {
  const { store, passwords, origins, hosts, secureCookies } = options;
  const now = options.now ?? Date.now;
  const log = options.log ?? console.log;
  const sessionCookieName = secureCookies ? `__Host-${SESSION_NAME}` : SESSION_NAME;
  const attributes = `Path=/; SameSite=Lax${secureCookies ? "; Secure" : ""}`;
  const deps = { passwords, now, stamp: () => stampAt(now()) };
  let tail: Promise<unknown> = Promise.resolve();

  const sessionCookie = (token: string) =>
    `${sessionCookieName}=${token}; ${attributes}; HttpOnly; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
  const clearSessionCookie = () => `${sessionCookieName}=; ${attributes}; HttpOnly; Max-Age=0`;
  const csrfCookie = (value: string) =>
    `${CSRF_NAME}=${value}; ${attributes}; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
  const hintCookie = () =>
    `${SESSION_HINT_COOKIE}=1; ${attributes}; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
  const clearHintCookie = () => `${SESSION_HINT_COOKIE}=; ${attributes}; Max-Age=0`;

  const allowsHost = (host: string | null) => host !== null && hosts.includes(host);

  /** Ghi lần lượt từng yêu cầu, để các bước chờ băm mật khẩu không xen vào nhau. */
  function exclusive<T>(job: () => Promise<T>): Promise<T> {
    const run = tail.then(job, job);
    tail = run.catch(() => {});
    return run;
  }

  function removeSessions(match: (row: SessionRecord) => boolean): void {
    for (let index = store.sessions.length - 1; index >= 0; index -= 1) {
      const row = store.sessions[index];
      if (row && match(row)) store.sessions.splice(index, 1);
    }
  }

  function issueSession(email: string): string {
    const token = randomToken();
    const at = now();
    store.sessions.push({ tokenHash: sha256(token), email, createdAt: at, lastUsedAt: at });
    return token;
  }

  async function readBody(
    input: ApiInput,
    path: string,
  ): Promise<{ body?: unknown; error?: Reply }> {
    if (path === "/admin/uploads") return { body: await input.formData().catch(() => null) };
    const text = await input.text();
    if (Buffer.byteLength(text) > MAX_JSON_BYTES) {
      return { error: fail(413, "bad_request", "Dữ liệu gửi lên quá lớn.") };
    }
    if (!text) return {};
    try {
      return { body: JSON.parse(text) };
    } catch {
      return { error: fail(400, "bad_request", "Dữ liệu gửi lên hỏng.") };
    }
  }

  async function process(input: ApiInput, write: boolean): Promise<ApiOutput> {
    const cookies = parseCookies(input.header("cookie"));
    const sent = cookies.get(sessionCookieName) ?? null;
    let row = sent ? store.sessions.find((item) => item.tokenHash === sha256(sent)) : undefined;
    let sessionsChanged = false;
    if (row && now() - row.lastUsedAt > SESSION_TTL_MS) {
      const expired = row;
      removeSessions((item) => item === expired);
      row = undefined;
      sessionsChanged = true;
    }
    const setCookies: string[] = [];

    if (write) {
      const origin = input.header("origin");
      if (origin === null || !origins.includes(origin)) return outputOf(FORBIDDEN());
      // Khách so với cookie (khách cũng cần mã này để đăng nhập), người đã đăng nhập so với mã của phiên.
      const expected = row && sent ? csrfOfSession(sent) : cookies.get(CSRF_NAME);
      const header = input.header("x-csrf-token");
      if (!expected || !header || !sameText(expected, header)) return outputOf(FORBIDDEN());
    }

    let token = row ? sent : null;
    if (row && now() - row.lastUsedAt >= TOUCH_EVERY_MS) {
      row.lastUsedAt = now();
      sessionsChanged = true;
      if (token) setCookies.push(sessionCookie(token));
    }

    const path = input.path.slice(API_PREFIX.length);
    const { body, error } = write ? await readBody(input, path) : { body: undefined, error: null };
    if (error) return outputOf(error);

    const caller = row ? sessionOf(row.email) : null;
    const reply = await handleRequest(
      {
        method: input.method.toLowerCase(),
        path,
        query: queryOf(input.search),
        body,
        config: CONFIG,
        session: caller,
      },
      deps,
    );

    const effect = reply.effect;
    if (effect) sessionsChanged = true;
    if (effect?.type === "sign-in") {
      const old = row;
      if (old) removeSessions((item) => item === old);
      token = issueSession(effect.session.email);
      setCookies.push(sessionCookie(token));
    } else if (effect?.type === "sign-out") {
      const old = row;
      if (old) removeSessions((item) => item === old);
      token = null;
    } else if (effect?.type === "rotate" && caller) {
      removeSessions((item) => item.email === caller.email);
      token = issueSession(caller.email);
      setCookies.push(sessionCookie(token));
    } else if (effect?.type === "revoke") {
      removeSessions((item) => item.email === effect.email);
      if (caller?.email === effect.email) token = null;
    }

    // Cookie gợi ý theo đúng phiên, kể cả khi hai bên đang lệch nhau. Tới đây setCookies chỉ chứa
    // cookie phiên vừa cấp hoặc gia hạn, nên đặt lại cùng lúc để hai cookie hết hạn như nhau.
    const hinted = cookies.has(SESSION_HINT_COOKIE);
    if (token && (!hinted || setCookies.length > 0)) setCookies.push(hintCookie());
    else if (!token && hinted) setCookies.push(clearHintCookie());

    if (sent && !token) setCookies.push(clearSessionCookie());
    const csrf = token ? csrfOfSession(token) : effect ? randomToken() : cookies.get(CSRF_NAME);
    const nextCsrf = csrf ?? randomToken();
    if (nextCsrf !== cookies.get(CSRF_NAME)) setCookies.push(csrfCookie(nextCsrf));

    if (write && reply.status < 300) await Promise.all([store.saveContent(), store.saveAccounts()]);
    if (sessionsChanged) await store.saveSessions();
    return outputOf(reply, setCookies);
  }

  async function guarded(input: ApiInput, write: boolean): Promise<ApiOutput> {
    try {
      return await process(input, write);
    } catch (error) {
      if (error instanceof URIError) {
        return outputOf(fail(400, "bad_request", "Dữ liệu gửi lên hỏng."));
      }
      log(`mock: lỗi xử lý ${input.method} (${error instanceof Error ? error.name : "không rõ"})`);
      return outputOf(SERVER_ERROR());
    }
  }

  async function handle(input: ApiInput): Promise<ApiOutput> {
    const write = !SAFE_METHODS.has(input.method);
    const output = !allowsHost(input.header("host"))
      ? outputOf(FORBIDDEN())
      : write
        ? await exclusive(() => guarded(input, true))
        : await guarded(input, false);
    log(
      `mock: ${input.method} ${input.path.replace(/(\/auth\/reset\/).+/, "$1***")} ${output.status}`,
    );
    return output;
  }

  /** Cookie CSRF cho khách lần đầu mở trang. Đã có thì trả null. */
  function csrfCookieFor(cookieHeader: string | null): string | null {
    return parseCookies(cookieHeader).has(CSRF_NAME) ? null : csrfCookie(randomToken());
  }

  return { handle, allowsHost, csrfCookieFor };
}
