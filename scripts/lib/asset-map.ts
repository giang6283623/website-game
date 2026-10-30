export type AssetEntry = { source: string; web: string; width: number; height: number };

/** Đọc các dòng của ASSET-MAP.md: tệp riêng tư (.png), tên tệp web (.webp) và kích thước gốc. */
export function parseAssetMap(markdown: string): AssetEntry[] {
  const entries: AssetEntry[] = [];
  for (const line of markdown.split("\n")) {
    if (!/^\| \d+ \|/.test(line)) continue;
    const source = /`([a-z-]+-icons\/[^`]+\.png)`/.exec(line)?.[1];
    const web = /`([a-z-]+\/[^`]+\.webp)`/.exec(line)?.[1];
    const size = /\| (\d+)x(\d+) \|/.exec(line);
    if (!source || !web || !size) continue;
    entries.push({ source, web, width: Number(size[1]), height: Number(size[2]) });
  }
  return entries;
}
