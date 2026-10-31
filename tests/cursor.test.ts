import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Glob } from "bun";

const root = resolve(import.meta.dir, "..");
const files = [...new Glob("src/**/*.css").scanSync(root)];
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("trỏ chuột của website", () => {
  test("html, thẻ a và thẻ button dùng token trỏ chuột", () => {
    const css = read("src/styles/global.css");
    expect(css).toMatch(/html \{[^}]*cursor: var\(--cursor-default\);/);
    expect(css).toMatch(/a,\nbutton \{[^}]*cursor: var\(--cursor-pointer\);/);
  });

  test("CSS nguồn không còn cursor: pointer hay cursor: default viết tay", () => {
    for (const file of files) {
      expect(`${file}: ${/cursor: (pointer|default);/.test(read(file))}`).toBe(`${file}: false`);
    }
  });

  test("không ẩn trỏ thật và không gọi url() cho trỏ chuột trong CSS nguồn", () => {
    for (const file of files) {
      expect(`${file}: ${/cursor:\s*(none|url\()/.test(read(file))}`).toBe(`${file}: false`);
    }
  });

  test("giữ nguyên not-allowed của các thẻ khóa", () => {
    expect(read("src/components/ItemSlot/ItemSlot.css")).toContain("cursor: not-allowed;");
    expect(read("src/components/Button/Button.css")).toContain("cursor: not-allowed;");
  });
});
