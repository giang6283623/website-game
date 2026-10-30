// Dựng sẵn HTML cho các trang công khai (E0-S8, D-13). Chạy sau scripts/build.ts:
//   bun --preload ./scripts/runtime-stubs.ts run scripts/prerender.tsx
// Lấy out/index.html do bộ dựng tạo (đã có thẻ script và css có mã băm) làm khung, rồi với mỗi đường dẫn:
// thay <!--head-tags-->, <!--app-html--> và <!--noscript-html-->. Ghi thêm 404.html, 200.html, robots.txt và sitemap.xml.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { renderApp } from "../src/entry-server.tsx";
import { matchRoute, NOT_FOUND_ROUTE, prerenderPaths, SITE_NAME } from "../src/routes.ts";
import { buildHead, escapeText, headToHtml } from "../src/seo.ts";
import { PRELOAD } from "./lib/font-preload.ts";

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, "out");
const siteUrl = process.env.SITE_URL || undefined;

const template = await Bun.file(resolve(outDir, "index.html")).text();
for (const marker of ["<!--head-tags-->", "<!--app-html-->", "<!--noscript-html-->"]) {
  if (!template.includes(marker)) throw new Error(`Khung out/index.html thiếu ${marker}`);
}

const NOSCRIPT =
  '<p class="noscript-note">Trang này cần JavaScript để hiện danh sách và đăng nhập. Hãy bật JavaScript rồi tải lại trang.</p>';

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
  '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
].join("\n    ");

function page(headHtml: string, appHtml: string): string {
  return template
    .replace("<!--head-tags-->", `${headHtml}\n    ${FONT_TAGS}`)
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
    headToHtml(buildHead(route, { pathname: path, siteUrl })),
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
    headToHtml(buildHead(NOT_FOUND_ROUTE, { pathname: "/404", siteUrl })),
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

await write(
  "robots.txt",
  [
    "User-agent: *",
    "Allow: /",
    "Disallow: /quan-tri/",
    "Disallow: /api/",
    ...(siteUrl ? [`Sitemap: ${siteUrl.replace(/\/+$/, "")}/sitemap.xml`] : []),
    "",
  ].join("\n"),
);
written.push("robots.txt");

if (siteUrl) {
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
