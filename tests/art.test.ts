import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ART_MAP, artVarName, buildArtCss } from "../scripts/lib/art-map.ts";

const root = resolve(import.meta.dir, "..");

describe("bảng ảnh trang trí", () => {
  test("mỗi dòng có tên web duy nhất, đúng đuôi, kích thước dương và trần dung lượng", () => {
    const names = ART_MAP.map((entry) => entry.web);
    expect(new Set(names).size).toBe(names.length);
    for (const entry of ART_MAP) {
      expect(entry.web).toMatch(/^\d{2}-[a-z0-9-]+\.(webp|jpg)$/);
      expect(entry.width).toBeGreaterThan(0);
      expect(entry.height).toBeGreaterThan(0);
      expect(entry.maxKb).toBeGreaterThanOrEqual(100);
      expect(entry.mode === "copy" ? entry.source === entry.web : entry.quality !== undefined).toBe(
        true,
      );
    }
  });

  test("tên biến CSS bỏ số đầu và đuôi tệp", () => {
    expect(artVarName("01-bg-home-hero-desktop.webp")).toBe("--art-bg-home-hero-desktop");
    expect(artVarName("27-decor-flare-glow.webp")).toBe("--art-decor-flare-glow");
  });

  test("art.css chỉ có biến cho tệp WebP và có hai biến kính mờ", () => {
    const css = buildArtCss(["01-bg-home-hero-desktop.webp", "28-og-share.jpg"]);
    expect(css).toContain(
      '--art-bg-home-hero-desktop: url("/assets/art/01-bg-home-hero-desktop.webp");',
    );
    expect(css).not.toContain("og-share");
    expect(css).toContain("--art-frost:");
    expect(css).toContain("--art-blur:");
  });

  test("mọi biến --art-* mà src/styles/art.css đọc đều có trong bảng ảnh", () => {
    const css = readFileSync(resolve(root, "src/styles/art.css"), "utf8");
    const known = new Set(ART_MAP.map((entry) => artVarName(entry.web)));
    known.add("--art-img");
    known.add("--art-pos");
    known.add("--art-scrim");
    known.add("--art-frost");
    known.add("--art-blur");
    const used = new Set([...css.matchAll(/var\((--art-[a-z0-9-]+)/g)].map((match) => match[1]));
    for (const name of used) expect(known.has(name as string)).toBe(true);
  });

  test("ảnh dưới màn hình đầu bị tắt cho tới khi có data-art-in và CSS có chỗ đặt ba họa tiết", () => {
    const css = readFileSync(resolve(root, "src/styles/art.css"), "utf8");
    expect(css).toContain("[data-art-lazy]:not([data-art-in])");
    for (const name of [
      "--art-tex-frosted-glass-tile",
      "--art-tex-concrete-tile",
      "--art-tex-rust-steel-tile",
    ]) {
      expect(css).toContain(`var(${name}, none)`);
    }
    // Chân trang và khung CTA phải gắn data-art-lazy, nếu không ảnh nạp ngay như trước.
    const footer = readFileSync(resolve(root, "src/components/Footer/Footer.tsx"), "utf8");
    const home = readFileSync(resolve(root, "src/pages/Home/Home.tsx"), "utf8");
    expect(footer).toContain("data-art-lazy");
    expect(home).toContain("data-art-lazy");
  });

  // Chỉ chạy khi máy có ảnh đã dựng (bun run build:art). Bản clone không có ảnh thì bỏ qua.
  const built = existsSync(resolve(root, "public/assets/art/art.css"));
  test.skipIf(!built)("ảnh đã dựng có đúng cỡ trong bảng và không vượt trần dung lượng", () => {
    for (const entry of ART_MAP) {
      const file = resolve(root, "public/assets/art", entry.web);
      expect(existsSync(file)).toBe(true);
      expect(Bun.file(file).size / 1024).toBeLessThanOrEqual(entry.maxKb);
    }
  });
});
