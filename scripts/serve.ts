// Máy chủ thử cho out/ (E0-S1). Chạy có giới hạn thời gian và bộ nhớ, không bao giờ chạy trần.
// Quy tắc giống một máy chủ web tĩnh thật: tệp có thật thì trả tệp, thư mục thì trả index.html,
// đường dẫn của ứng dụng chưa dựng sẵn (trang riêng tư, trang chi tiết) trả 200.html mã 200, còn lại trả 404.html mã 404.
// Khi API_SOURCE=game, ba đường dẫn đọc của /api/v1/server/status và /api/v1/source/* do máy chủ này trả,
// lấy dữ liệu công khai từ máy chủ game cũ (xem src/api/source/handler.ts). Phần còn lại của /api/v1 chưa có.
import { existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { handleSourceRequest } from "../src/api/source/handler.ts";
import { matchRoute, NOT_FOUND_ROUTE } from "../src/routes.ts";

const root = resolve(import.meta.dir, "..", "out");
const port = Number(process.env.PORT ?? 4173);
/** "mock" (mặc định): không có API thật. "game": bật phần đọc nguồn game. */
const apiSource = process.env.API_SOURCE ?? "mock";

if (!existsSync(join(root, "index.html"))) {
  console.error("serve: chưa có out/. Chạy bun run build trước.");
  process.exit(1);
}

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
};

function fileFor(pathname: string): string | null {
  const decoded = decodeURIComponent(pathname);
  const target = normalize(join(root, decoded));
  // Không cho thoát khỏi out/ (đường dẫn có ..)
  if (target !== root && !target.startsWith(root + sep)) return null;
  if (existsSync(target)) {
    const stat = statSync(target);
    if (stat.isFile()) return target;
    const index = join(target, "index.html");
    if (stat.isDirectory() && existsSync(index)) return index;
  }
  return null;
}

function send(file: string, status = 200): Response {
  const hashed = /\/assets\/[^/]+-[a-z0-9]{8}\.[a-z]+$/.test(file);
  return new Response(Bun.file(file), {
    status,
    headers: {
      "content-type": TYPES[extname(file)] ?? "application/octet-stream",
      "cache-control": hashed ? "public, max-age=31536000, immutable" : "no-cache",
    },
  });
}

const server = Bun.serve({
  hostname: "127.0.0.1",
  port,
  async fetch(request) {
    const { pathname } = new URL(request.url);
    // Phần đọc nguồn game (chỉ đọc, không phiên). Tắt khi API_SOURCE không phải "game".
    if (apiSource === "game") {
      const source = await handleSourceRequest(request.method, pathname);
      if (source) return source;
    }
    const file = fileFor(pathname);
    if (file) return send(file);
    // Có đuôi tệp mà không thấy tệp thì là 404 thật (hình, phông, script).
    if (extname(pathname) !== "") return send(join(root, "404.html"), 404);
    const route = matchRoute(pathname);
    if (route !== NOT_FOUND_ROUTE) return send(join(root, "200.html"));
    return send(join(root, "404.html"), 404);
  },
});

console.log(
  `serve: http://127.0.0.1:${server.port}/ (thư mục out/). API_SOURCE=${apiSource}. Dừng bằng Ctrl+C.`,
);
