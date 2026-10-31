// Dựng sẵn HTML cho các trang công khai (E0-S8, D-13). Chạy sau scripts/build.ts:
//   bun --preload ./scripts/runtime-stubs.ts run scripts/prerender.tsx
// Lấy out/index.html do bộ dựng tạo (đã có thẻ script và css có mã băm) làm khung, rồi với mỗi đường dẫn:
// thay <!--head-tags-->, <!--app-html--> và <!--noscript-html-->. Ghi thêm 404.html, 200.html, robots.txt và sitemap.xml.
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { renderApp } from "../src/entry-server.tsx";
import { blocksIndexing } from "../src/lib/api-mode.ts";
import { matchRoute, NOT_FOUND_ROUTE, prerenderPaths, SITE_NAME } from "../src/routes.ts";
import { buildHead, escapeText, headToHtml } from "../src/seo.ts";
import { BROKEN_IMAGE_TAG } from "./lib/broken-image-script.ts";
import { PRELOAD } from "./lib/font-preload.ts";
import { ICON_TAGS } from "./lib/icons.ts";
import { MOTION_NOSCRIPT_TAG, MOTION_PREF_TAG } from "./lib/motion-pref-script.ts";
import { buildRobotsTxt } from "./lib/robots.ts";

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, "out");
const siteUrl = process.env.SITE_URL || undefined;
// Cùng mặc định với scripts/build.ts: không đặt API_MODE thì là "mock". Bản giả chặn lập chỉ mục (C-91).
const apiMode = process.env.API_MODE ?? "mock";
const blockIndexing = blocksIndexing(apiMode);

const template = await Bun.file(resolve(outDir, "index.html")).text();
for (const marker of ["<!--head-tags-->", "<!--app-html-->", "<!--noscript-html-->"]) {
  if (!template.includes(marker)) throw new Error(`Khung out/index.html thiếu ${marker}`);
}

const NOSCRIPT =
  '<p class="noscript-note">Trang này cần JavaScript để hiện danh sách và đăng nhập. Hãy bật JavaScript rồi tải lại trang.</p>';

/**
 * Bảng biến ảnh trang trí (bun run build:art). Chỉ gắn khi tệp có trong out/: bản clone không có ảnh vẫn dựng được
 * và các lớp nền ảnh tự rơi về màu phẳng, vì CSS dùng `var(--art-..., none)`.
 */
// Ảnh chia sẻ chỉ được ghi vào thẻ og:image khi tệp có trong out/ (bản clone không có ảnh thì bỏ thẻ).
const OG_IMAGE = existsSync(resolve(outDir, "assets/art/28-og-share.jpg"))
  ? "/assets/art/28-og-share.jpg"
  : undefined;

const ART_TAGS = existsSync(resolve(outDir, "assets/art/art.css"))
  ? ['<link rel="stylesheet" href="/assets/art/art.css">']
  : [];

/**
 * Phông nạp sớm, bảng phông và biểu tượng tab. Các tệp này nằm trong public/ nên bộ dựng không tự gắn vào HTML.
 * Không gắn data-head: trình duyệt xóa mọi thẻ data-head khi đổi trang, còn các thẻ này phải ở lại.
 */
const FONT_TAGS = [
  ...PRELOAD.map(
    (file) =>
      `<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/${file}" crossorigin>`,
  ),
  '<link rel="stylesheet" href="/assets/fonts/fonts.css">',
  ...ART_TAGS,
  ...ICON_TAGS,
].join("\n    ");

function page(headHtml: string, appHtml: string): string {
  // Script ẩn hình hỏng đứng trước mọi stylesheet (đứng sau thì phải chờ CSS tải xong) và trước mọi thẻ img.
  return template
    .replace(
      "<!--head-tags-->",
      `${BROKEN_IMAGE_TAG}\n    ${MOTION_PREF_TAG}\n    ${headHtml}\n    ${FONT_TAGS}\n    ${MOTION_NOSCRIPT_TAG}`,
    )
    .replace("<!--app-html-->", appHtml)
    .replace("<!--noscript-html-->", NOSCRIPT);
}

async function write(file: string, content: string) {
  const target = resolve(outDir, file);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content);
}

const written: string[] = [];

for (const path of prerenderPaths()) {
  const route = matchRoute(path);
  const html = page(
    headToHtml(buildHead(route, { pathname: path, siteUrl, blockIndexing, ogImage: OG_IMAGE })),
    await renderApp(path),
  );
  const file = path === "/" ? "index.html" : `${path.slice(1)}/index.html`;
  await write(file, html);
  written.push(file);
}

// 404.html: máy chủ web tĩnh trả tệp này kèm mã 404 cho đường dẫn không có.
await write(
  "404.html",
  page(
    headToHtml(
      buildHead(NOT_FOUND_ROUTE, { pathname: "/404", siteUrl, blockIndexing, ogImage: OG_IMAGE }),
    ),
    await renderApp("/404"),
  ),
);
written.push("404.html");

// 200.html: khung rỗng cho trang riêng tư và trang chi tiết. Trình duyệt tự dựng trang và đặt lại head.
const shellHead = headToHtml({
  title: SITE_NAME,
  tags: [
    { tag: "meta", attrs: { name: "robots", content: "noindex, nofollow" } },
    { tag: "meta", attrs: { name: "description", content: NOT_FOUND_ROUTE.description } },
  ],
});
await write("200.html", page(shellHead, ""));
written.push("200.html");

await write("robots.txt", buildRobotsTxt({ siteUrl, blockIndexing }));
written.push("robots.txt");

if (blockIndexing) {
  console.log(
    `prerender: API_MODE=${apiMode} nên chặn lập chỉ mục (robots.txt, thẻ noindex) và bỏ sitemap.xml, canonical, og:url (C-91).`,
  );
} else if (siteUrl) {
  const base = siteUrl.replace(/\/+$/, "");
  const urls = prerenderPaths()
    .map((path) => `  <url><loc>${escapeText(`${base}${path}`)}</loc></url>`)
    .join("\n");
  await write(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  written.push("sitemap.xml");
} else {
  console.log("prerender: chưa đặt SITE_URL nên bỏ sitemap.xml, canonical và og:url (D-08).");
}

console.log(`prerender: ${written.length} tệp`);
for (const file of written) console.log(`  out/${file}`);
