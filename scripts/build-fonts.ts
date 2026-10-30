// E0-S3: tạo phông tự lưu (woff2) từ gói @fontsource (giấy phép OFL-1.1).
// Mỗi kiểu chữ có hai tệp: "latin" (cắt gọn còn ký tự cần cho tiếng Việt) và "vietnamese".
// Bộ "latin-ext" bỏ đi vì ngân sách 120 KB và vì tiếng Việt không dùng.
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import subsetFont from "subset-font";
import { PRELOAD } from "./lib/font-preload.ts";

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, "public/assets/fonts");

type Face = { pkg: string; slug: string; family: string; weight: number };

export const FACES: Face[] = [
  {
    pkg: "big-shoulders-stencil-display",
    slug: "big-shoulders-stencil-display",
    family: "Big Shoulders Stencil Display",
    weight: 900,
  },
  { pkg: "barlow-condensed", slug: "barlow-condensed", family: "Barlow Condensed", weight: 600 },
  { pkg: "barlow-condensed", slug: "barlow-condensed", family: "Barlow Condensed", weight: 700 },
  { pkg: "barlow", slug: "barlow", family: "Barlow", weight: 400 },
  { pkg: "barlow", slug: "barlow", family: "Barlow", weight: 600 },
  {
    pkg: "barlow-semi-condensed",
    slug: "barlow-semi-condensed",
    family: "Barlow Semi Condensed",
    weight: 500,
  },
  {
    pkg: "barlow-semi-condensed",
    slug: "barlow-semi-condensed",
    family: "Barlow Semi Condensed",
    weight: 600,
  },
];

/**
 * Ký tự giữ lại trong bộ latin: ASCII, các chữ Latin-1 mà tiếng Việt dùng (À Á Â Ã È É Ê Ì Í Ò Ó Ô Õ Ù Ú Ý và chữ thường),
 * dấu cách cứng, dấu chấm giữa, dấu nhân, độ và dấu câu thường dùng. Các chữ Việt còn lại nằm trong bộ vietnamese.
 */
function latinText(): string {
  const ascii = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("");
  const vietnameseLatin1 = "ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúý";
  const extra = "\u00a0\u00b7\u00d7\u00b0\u2013\u2014\u2018\u2019\u201c\u201d\u2026\u2192";
  return ascii + vietnameseLatin1 + extra;
}

/** Lấy unicode-range của từng bộ ký tự từ CSS của @fontsource (một nguồn sự thật). */
async function unicodeRange(pkg: string, subset: string, weight: number): Promise<string> {
  const css = await readFile(
    resolve(root, `node_modules/@fontsource/${pkg}/${weight}.css`),
    "utf8",
  );
  const pattern = new RegExp(
    `-${subset}-${weight}-normal \\*/[\\s\\S]*?unicode-range:\\s*([^;]+);`,
  );
  const match = pattern.exec(css);
  if (!match) throw new Error(`Không thấy unicode-range của ${pkg} ${subset} ${weight}`);
  return (match[1] as string).trim();
}

const faceCss: string[] = [];
const report: Array<{ file: string; bytes: number }> = [];

await mkdir(outDir, { recursive: true });

for (const face of FACES) {
  const base = `${resolve(root, "node_modules/@fontsource", face.pkg, "files")}/${face.slug}`;

  const latinSource = await readFile(`${base}-latin-${face.weight}-normal.woff2`);
  const latin = await subsetFont(latinSource, latinText(), { targetFormat: "woff2" });
  const latinName = `${face.slug}-${face.weight}-latin.woff2`;
  await writeFile(resolve(outDir, latinName), latin);
  report.push({ file: latinName, bytes: latin.byteLength });

  const vietnameseName = `${face.slug}-${face.weight}-vietnamese.woff2`;
  await copyFile(`${base}-vietnamese-${face.weight}-normal.woff2`, resolve(outDir, vietnameseName));
  report.push({
    file: vietnameseName,
    bytes: (await readFile(resolve(outDir, vietnameseName))).byteLength,
  });

  for (const [subset, name] of [
    ["latin", latinName],
    ["vietnamese", vietnameseName],
  ] as const) {
    const range = await unicodeRange(face.pkg, subset, face.weight);
    faceCss.push(
      `@font-face{font-family:"${face.family}";font-style:normal;font-weight:${face.weight};font-display:swap;src:url(/assets/fonts/${name}) format("woff2");unicode-range:${range}}`,
    );
  }
}

await writeFile(
  resolve(outDir, "fonts.css"),
  `/* Tự sinh bằng scripts/build-fonts.ts. Phông giấy phép SIL OFL-1.1. */\n${faceCss.join("\n")}\n`,
);
await writeFile(
  resolve(outDir, "LICENSE.txt"),
  [
    "Big Shoulders Stencil Display, Barlow, Barlow Condensed và Barlow Semi Condensed",
    "được phát hành theo SIL Open Font License 1.1 (https://openfontlicense.org).",
    "Tệp woff2 lấy từ gói @fontsource tương ứng, đã cắt gọn bộ ký tự latin.",
    "",
  ].join("\n"),
);

const total = report.reduce((sum, item) => sum + item.bytes, 0);
const preloadBytes = report
  .filter((item) => PRELOAD.includes(item.file))
  .reduce((sum, item) => sum + item.bytes, 0);
const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;
console.log("build-fonts: tệp phông");
for (const item of report) console.log(`  ${item.file}: ${kb(item.bytes)}`);
console.log(
  `build-fonts: tổng ${kb(total)} (${report.length} tệp, bảy kiểu chữ, latin và vietnamese)`,
);
console.log(
  `build-fonts: nạp sớm ${kb(preloadBytes)} (ngân sách 120 KB, ${preloadBytes <= 120 * 1024 ? "đạt" : "VƯỢT"})`,
);
console.log(
  `build-fonts: tổng cả bảy kiểu ${total <= 120 * 1024 ? "đạt" : "vượt"} mức 120 KB, xem deferred-decisions.md`,
);
