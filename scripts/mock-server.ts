// Máy chủ giả có lưu dữ liệu, chỉ dùng trên máy mình (bun run mock). Chạy bằng --no-env-file nên không đọc .env*.
// Chỉ nghe 127.0.0.1, phục vụ out/ và /api/v1 trên cùng một cổng. Dữ liệu nằm trong .mock-data/.
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { PasswordHasher } from "../src/api/mock/core.ts";
import { API_PREFIX, createMockApi } from "./lib/mock-api.ts";
import { openMockStore } from "./lib/mock-store.ts";
import { findStatic } from "./lib/static-site.ts";
import { defaultDataDir, isServerRunning, PID_FILE } from "./mock-reset.ts";

const DEFAULT_PORT = 4175;
/** Ảnh tải lên tối đa 5 MB, cộng phần bao của biểu mẫu. */
const MAX_BODY_BYTES = 6 * 1024 * 1024;

const outDir = resolve(process.env.MOCK_OUT_DIR ?? join(import.meta.dir, "..", "out"));
const dataDir = defaultDataDir();
const pidFile = join(dataDir, PID_FILE);

if (!existsSync(join(outDir, "index.html"))) {
  console.error("mock: chưa có out/. Chạy bun run mock để dựng rồi bật máy chủ.");
  process.exit(1);
}
if (isServerRunning(dataDir)) {
  console.error("mock: đã có máy chủ giả đang dùng thư mục dữ liệu này.");
  process.exit(1);
}

const passwords: PasswordHasher = {
  hash: (password) => Bun.password.hash(password),
  verify: (password, hash) => Bun.password.verify(password, hash),
};
const store = await openMockStore({ dir: dataDir, passwords });

let api: ReturnType<typeof createMockApi>;

function sendStatic(request: Request, pathname: string): Response {
  if (!api.allowsHost(request.headers.get("host"))) {
    return new Response("Không được phép.", { status: 403 });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Không hỗ trợ.", { status: 405 });
  }
  const { file, status } = findStatic(outDir, pathname);
  const hashed = /\/assets\/[^/]+-[a-z0-9]{8}\.[a-z]+$/.test(file);
  const headers = new Headers({
    "cache-control": hashed ? "public, max-age=31536000, immutable" : "no-cache",
    "x-content-type-options": "nosniff",
  });
  // Đăng nhập cũng là yêu cầu ghi, nên khách cần mã CSRF ngay khi mở trang.
  const cookie = file.endsWith(".html") ? api.csrfCookieFor(request.headers.get("cookie")) : null;
  if (cookie) headers.append("set-cookie", cookie);
  return new Response(Bun.file(file), { status, headers });
}

const server = Bun.serve({
  hostname: "127.0.0.1",
  port: Number(process.env.PORT ?? DEFAULT_PORT),
  maxRequestBodySize: MAX_BODY_BYTES,
  async fetch(request) {
    const { pathname, search } = new URL(request.url);
    if (pathname !== API_PREFIX && !pathname.startsWith(`${API_PREFIX}/`)) {
      return sendStatic(request, pathname);
    }
    const output = await api.handle({
      method: request.method,
      path: pathname,
      search,
      header: (name) => request.headers.get(name),
      text: () => request.text(),
      formData: () => request.formData(),
    });
    const headers = new Headers();
    for (const [name, value] of output.headers) headers.append(name, value);
    return new Response(output.body, { status: output.status, headers });
  },
});

api = createMockApi({
  store,
  passwords,
  origins: [`http://localhost:${server.port}`, `http://127.0.0.1:${server.port}`],
  hosts: [`localhost:${server.port}`, `127.0.0.1:${server.port}`],
  secureCookies: process.env.MOCK_SECURE_COOKIE !== "0",
});
writeFileSync(pidFile, String(process.pid));

async function shutdown(): Promise<void> {
  server.stop(true);
  await store.idle();
  if (existsSync(pidFile)) unlinkSync(pidFile);
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log(`mock: mở http://localhost:${server.port}/ . Dữ liệu ở ${dataDir}. Dừng bằng Ctrl+C.`);
console.log("mock: chỉ dùng trên máy của bạn. Không đưa lên mạng.");
