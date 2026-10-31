// Nội dung robots.txt cho bước dựng sẵn (scripts/prerender.tsx).
// Bản dựng dùng API giả (API_MODE khác real) chặn mọi bot, để dữ liệu mẫu không vào kết quả tìm kiếm (C-91).

export type RobotsOptions = {
  /** Gốc địa chỉ công khai, ví dụ "https://example.org". Có thì ghi dòng Sitemap. */
  siteUrl?: string;
  /** Bản dựng dùng dữ liệu mẫu: chặn cả site và không ghi Sitemap. */
  blockIndexing: boolean;
};

export function buildRobotsTxt({ siteUrl, blockIndexing }: RobotsOptions): string {
  if (blockIndexing) return ["User-agent: *", "Disallow: /", ""].join("\n");
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /quan-tri/",
    "Disallow: /api/",
    ...(siteUrl ? [`Sitemap: ${siteUrl.replace(/\/+$/, "")}/sitemap.xml`] : []),
    "",
  ].join("\n");
}
