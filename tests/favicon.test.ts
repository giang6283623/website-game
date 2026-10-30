import { describe, expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { ICON_TAGS } from "../scripts/lib/icons.ts";

/**
 * Biểu tượng tab. public/favicon.webp là bản chép của một hình game, ngoại lệ DUY NHẤT cho quy tắc
 * "hình game không vào git" (xem ASSET-MAP.md). favicon.svg tự vẽ là dự phòng.
 */
const root = resolve(import.meta.dir, "..");

describe("biểu tượng tab", () => {
  test("có thẻ cho cả favicon.webp và favicon.svg dự phòng", () => {
    expect(ICON_TAGS).toContain('<link rel="icon" href="/favicon.webp" type="image/webp">');
    expect(ICON_TAGS).toContain('<link rel="icon" href="/favicon.svg" type="image/svg+xml">');
  });

  test("bước dựng sẵn HTML gắn các thẻ này vào đầu trang", async () => {
    const source = await Bun.file(resolve(root, "scripts/prerender.tsx")).text();
    expect(source).toContain("...ICON_TAGS");
  });

  test("favicon.webp là tệp WebP thật và nhỏ", async () => {
    const file = Bun.file(resolve(root, "public/favicon.webp"));
    const bytes = new Uint8Array(await file.arrayBuffer());
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe("RIFF");
    expect(String.fromCharCode(...bytes.slice(8, 12))).toBe("WEBP");
    expect(file.size).toBeLessThan(32 * 1024);
  });

  test("ngoại lệ chỉ có một tệp: public/ không có hình WebP nào khác ngoài thư mục assets", async () => {
    const entries = await readdir(resolve(root, "public"));
    expect(entries.filter((name) => name.endsWith(".webp"))).toEqual(["favicon.webp"]);
  });

  test("favicon.svg dự phòng vẫn còn", async () => {
    expect(await Bun.file(resolve(root, "public/favicon.svg")).exists()).toBe(true);
  });
});
