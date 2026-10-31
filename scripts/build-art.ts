// Chuyển ảnh trang trí sang WebP đúng cỡ theo scripts/lib/art-map.ts.
// Nguồn: thư mục ảnh trang trí, mặc định art-src/ (không nằm trong git), đổi bằng biến ART_ASSETS_DIR.
// Đích: public/assets/art/ (không commit). Cần lệnh `cwebp` và `magick` (brew install webp imagemagick).
// Thiếu ảnh nguồn thì bỏ qua, không làm hỏng build. Quá trần dung lượng thì thoát với mã 1.
import { existsSync } from "node:fs";
import { copyFile, mkdir, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ART_MAP, type ArtEntry, buildArtCss, CURSOR_ART } from "./lib/art-map.ts";

const root = resolve(import.meta.dir, "..");
const sourceRoot = resolve(root, process.env.ART_ASSETS_DIR ?? "art-src");
const gameRoot = resolve(root, process.env.GAME_ASSETS_DIR ?? "game-assets-src");
const outRoot = resolve(root, "public/assets/art");

async function run(command: string[]): Promise<void> {
  const proc = Bun.spawn(command, { stdout: "ignore", stderr: "pipe" });
  if ((await proc.exited) !== 0) {
    throw new Error(`${command[0]} lỗi: ${await new Response(proc.stderr).text()}`);
  }
}

async function convert(entry: ArtEntry): Promise<number | null> {
  const input = resolve(sourceRoot, entry.source);
  const output = resolve(outRoot, entry.web);
  if (!existsSync(input)) return null;
  await mkdir(outRoot, { recursive: true });
  const quality = String(entry.quality ?? 80);
  if (entry.mode === "copy") {
    await copyFile(input, output);
  } else if (entry.mode === "webp") {
    await run([
      "cwebp",
      "-quiet",
      "-q",
      quality,
      "-m",
      "6",
      "-resize",
      String(entry.width),
      String(entry.height),
      input,
      "-o",
      output,
    ]);
  } else {
    const box = `${entry.width}x${entry.height}`;
    await run([
      "magick",
      input,
      "-resize",
      `${box}^`,
      "-gravity",
      "center",
      "-extent",
      box,
      "-strip",
      "-quality",
      quality,
      output,
    ]);
  }
  return (await stat(output)).size;
}

let missing = 0;
let tooBig = 0;
const built: string[] = [];
for (const entry of ART_MAP) {
  const size = await convert(entry);
  if (size === null) {
    missing += 1;
    continue;
  }
  built.push(entry.web);
  const kb = Math.round(size / 1024);
  const flag = kb > entry.maxKb ? " QUÁ TRẦN" : "";
  if (flag) tooBig += 1;
  console.log(
    `${entry.web.padEnd(34)} ${String(entry.width).padStart(4)}x${String(entry.height).padEnd(4)} ${String(kb).padStart(4)} KB (trần ${entry.maxKb})${flag}`,
  );
}
// Ảnh trỏ chuột là hình game, thiếu thì website dùng con trỏ của hệ thống.
const cursorSource = resolve(gameRoot, CURSOR_ART.source);
if (existsSync(cursorSource)) {
  await mkdir(outRoot, { recursive: true });
  const output = resolve(outRoot, CURSOR_ART.web);
  await copyFile(cursorSource, output);
  built.push(CURSOR_ART.web);
  if ((await stat(output)).size / 1024 > CURSOR_ART.maxKb) tooBig += 1;
}
if (built.length > 0) await writeFile(resolve(outRoot, "art.css"), buildArtCss(built));
console.log(
  `build:art: ${ART_MAP.length - missing} ảnh, thiếu nguồn ${missing}, quá trần ${tooBig}`,
);
if (tooBig > 0) process.exit(1);
