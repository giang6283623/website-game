// E0-S4: chuyển hình game sang WebP theo ASSET-MAP.md.
// Nguồn: thư mục hình game, mặc định game-assets-src/ (không nằm trong git), đổi bằng biến GAME_ASSETS_DIR.
// Đích: public/assets/game/ (không commit, D-09).
// Cần lệnh `cwebp` có sẵn trên máy (brew install webp). Thiếu hình nguồn thì bỏ qua, không làm hỏng build.
import { existsSync } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { type AssetEntry, parseAssetMap } from "./lib/asset-map.ts";

const root = resolve(import.meta.dir, "..");
const sourceRoot = resolve(root, process.env.GAME_ASSETS_DIR ?? "game-assets-src");
const outRoot = resolve(root, "public/assets/game");
const mapFile = resolve(root, "docs/design-handoff/ASSET-MAP.md");
const itemImagesFile = resolve(root, "scripts/data/game-item-images.json");
const sizesFile = resolve(root, "src/content/image-sizes.ts");

async function convert(entry: AssetEntry): Promise<number | null> {
  const input = resolve(sourceRoot, entry.source);
  const output = resolve(outRoot, entry.web);
  if (!existsSync(input)) return null;
  await mkdir(dirname(output), { recursive: true });
  const small = (await stat(input)).size < 100 * 1024;
  const args = small
    ? ["-quiet", "-lossless", "-z", "6", input, "-o", output]
    : ["-quiet", "-q", "90", "-alpha_q", "100", "-m", "6", input, "-o", output];
  const proc = Bun.spawn(["cwebp", ...args], { stdout: "ignore", stderr: "pipe" });
  const code = await proc.exited;
  if (code !== 0)
    throw new Error(`cwebp lỗi với ${entry.source}: ${await new Response(proc.stderr).text()}`);
  return (await stat(output)).size;
}

const entries = parseAssetMap(await Bun.file(mapFile).text());
// Hình vật phẩm nhập từ client game (xem C-74, C-80). Mỗi dòng nối một mã trong game với một hình, hình dùng chung chỉ chuyển một lần.
const known = new Set(entries.map((e) => e.web));
const itemImages = (await Bun.file(itemImagesFile).json()) as AssetEntry[];
for (const row of itemImages) {
  if (known.has(row.web)) continue;
  known.add(row.web);
  entries.push({ source: row.source, web: row.web, width: row.width, height: row.height });
}
let converted = 0;
let missing = 0;
let bytes = 0;
for (const entry of entries) {
  const size = await convert(entry);
  if (size === null) missing += 1;
  else {
    converted += 1;
    bytes += size;
  }
}

// Bảng kích thước để dùng cho thuộc tính width và height (tránh nhảy bố cục). Giữ trong git, không chứa hình.
const lines = entries.map((e) => `  "${e.web}": [${e.width}, ${e.height}],`);
await mkdir(dirname(sizesFile), { recursive: true });
await writeFile(
  sizesFile,
  [
    "// Tự sinh bằng scripts/build-images.ts từ ASSET-MAP.md và scripts/data/game-item-images.json. Không sửa tay.",
    "export const IMAGE_SIZES: Record<string, readonly [number, number]> = {",
    ...lines,
    "};",
    "",
  ].join("\n"),
);

console.log(
  `build-images: ${entries.length} hình trong bản đồ, đã chuyển ${converted}, thiếu nguồn ${missing}, tổng ${(bytes / 1024).toFixed(0)} KB`,
);
