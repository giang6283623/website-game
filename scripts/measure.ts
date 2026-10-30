// Đo dung lượng gói tải ban đầu của out/ (E0-S1). Ngân sách: JavaScript tải ban đầu 150 KB nén gzip.
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..", "out");
const BUDGET_JS_GZIP = 150 * 1024;
const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

if (!existsSync(join(root, "index.html"))) {
  console.error("measure: chưa có out/. Chạy bun run build trước.");
  process.exit(1);
}

const gzipSize = async (file: string) =>
  Bun.gzipSync(new Uint8Array(await Bun.file(join(root, file)).arrayBuffer())).byteLength;

const html = await Bun.file(join(root, "index.html")).text();
const entry = /<script[^>]+src="(\/assets\/[^"]+\.js)"/.exec(html)?.[1];
const css = [
  ...html.matchAll(/<link rel="stylesheet"[^>]*href="(\/assets\/index-[^"]+\.css)"/g),
].map((m) => m[1] as string);
if (!entry) {
  console.error("measure: không thấy thẻ script trong out/index.html.");
  process.exit(1);
}

// JavaScript tải ban đầu = tệp vào và mọi tệp nó nạp tĩnh (import "..." hoặc from "..."). import() động là nạp lười.
const initial = new Set<string>();
const lazy = new Set<string>();
async function walk(path: string) {
  if (initial.has(path)) return;
  initial.add(path);
  const text = await Bun.file(join(root, path)).text();
  for (const m of text.matchAll(/(?:from|import)\s*["'](\/assets\/[^"']+\.js)["']/g))
    await walk(m[1] as string);
  for (const m of text.matchAll(/import\(\s*["'](\/assets\/[^"']+\.js)["']\s*\)/g))
    lazy.add(m[1] as string);
}
await walk(entry);

let jsRaw = 0;
let jsGzip = 0;
console.log("measure: JavaScript tải ban đầu");
for (const path of initial) {
  const raw = statSync(join(root, path)).size;
  const gz = await gzipSize(path);
  jsRaw += raw;
  jsGzip += gz;
  console.log(`  ${path}: ${kb(raw)}, nén ${kb(gz)}`);
}
console.log(
  `measure: tổng JS ban đầu ${kb(jsRaw)}, nén gzip ${kb(jsGzip)} (ngân sách ${kb(BUDGET_JS_GZIP)})`,
);

console.log("measure: JavaScript nạp lười (không tính vào ngân sách)");
for (const path of lazy) {
  if (initial.has(path)) continue;
  console.log(`  ${path}: ${kb(statSync(join(root, path)).size)}, nén ${kb(await gzipSize(path))}`);
}

let cssGzip = 0;
for (const path of css) {
  const gz = await gzipSize(path);
  cssGzip += gz;
  console.log(`measure: CSS ${path}: ${kb(statSync(join(root, path)).size)}, nén ${kb(gz)}`);
}

const fontDir = join(root, "assets", "fonts");
const fonts = existsSync(fontDir) ? readdirSync(fontDir).filter((f) => f.endsWith(".woff2")) : [];
const fontBytes = fonts.reduce((sum, f) => sum + statSync(join(fontDir, f)).size, 0);
console.log(`measure: phông ${fonts.length} tệp, tổng ${kb(fontBytes)}`);
console.log(
  `measure: HTML trang chủ ${kb(statSync(join(root, "index.html")).size)}, nén ${kb(await gzipSize("index.html"))}`,
);

if (jsGzip > BUDGET_JS_GZIP) {
  console.log(`measure: VƯỢT ngân sách JavaScript ${kb(jsGzip - BUDGET_JS_GZIP)}`);
  process.exitCode = 2;
} else {
  console.log("measure: trong ngân sách JavaScript");
}
void cssGzip;
