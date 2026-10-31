import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { buildThemeCss, type DesignValues } from "../scripts/lib/theme-css.ts";

const root = resolve(import.meta.dir, "..");
const values = (await Bun.file(
  resolve(root, "docs/design-handoff/design-values.json"),
).json()) as DesignValues;
const css = buildThemeCss(values);

/** Đọc mọi khai báo `--ten: giá trị;` trong khối :root đầu tiên. */
function rootVars(source: string): Map<string, string> {
  const block = /:root\s*\{([\s\S]*?)\n\}/.exec(source)?.[1] ?? "";
  const map = new Map<string, string>();
  for (const match of block.matchAll(/^\s*(--[\w-]+):\s*(.+);$/gm)) {
    map.set(match[1] as string, (match[2] as string).trim());
  }
  return map;
}

const vars = rootVars(css);
const px = (n: number) => `${n}px`;
const rem = (n: number) => `${Number((n / 16).toFixed(4))}rem`;

describe("gen-theme", () => {
  test("mọi màu ngữ nghĩa khớp design-values.json", () => {
    const entries = Object.entries(values.color.semantic);
    expect(entries.length).toBe(25);
    for (const [key, color] of entries) {
      expect(vars.get(`--color-${key}`)).toBe(color.hex);
    }
  });

  test("không có màu gốc (primitive) bị lộ ra thành biến", () => {
    expect([...vars.keys()].some((name) => name.includes("ink-") || name.includes("rust-"))).toBe(
      false,
    );
  });

  test("thang khoảng cách 1 đến 9 và hai giá trị riêng của điện thoại", () => {
    for (let i = 1; i <= 9; i += 1) {
      expect(vars.get(`--space-${i}`)).toBe(px(values.space[String(i)] as number));
    }
    expect(vars.get("--space-gutter-mobile")).toBe("20px");
    expect(vars.get("--space-section-y-mobile")).toBe("56px");
  });

  test("bo góc, viền, kích thước và bố cục", () => {
    expect(vars.get("--radius-none")).toBe("0px");
    expect(vars.get("--radius-sm")).toBe("2px");
    expect(vars.get("--radius-md")).toBe("4px");
    expect(vars.get("--border-focus")).toBe("3px");
    expect(vars.get("--border-pressed-edge")).toBe("4px");
    expect(vars.get("--size-button-l")).toBe("56px");
    expect(vars.get("--size-field-box")).toBe("52px");
    expect(vars.get("--size-nav-dial-width")).toBe("720px");
    expect(vars.get("--size-item-slot-plate")).toBe("176px");
    expect(vars.get("--layout-desktop-content")).toBe("1312px");
    expect(vars.get("--layout-mobile-gutter")).toBe("20px");
    expect(vars.get("--layout-admin-sidebar")).toBe("280px");
  });

  test("14 kiểu chữ khớp cỡ, dòng và độ giãn", () => {
    const styles = Object.entries(values.typography.styles);
    expect(styles.length).toBe(14);
    for (const [key, style] of styles) {
      expect(vars.get(`--text-${key}-size`)).toBe(rem(style.size));
      expect(vars.get(`--text-${key}-line`)).toBe(rem(style.lineHeight));
      expect(vars.get(`--text-${key}-spacing`)).toBe(`${style.letterSpacing}em`);
      expect(css).toContain(`.text-${key} {`);
    }
  });

  test("chữ nhỏ nhất là 16 px", () => {
    for (const style of Object.values(values.typography.styles)) {
      expect(style.size).toBeGreaterThanOrEqual(16);
    }
  });

  test("Display, Heading và Label in hoa bằng CSS", () => {
    for (const key of [
      "display-xl",
      "display-l",
      "display-m",
      "heading-h1",
      "label-l",
      "label-m",
    ]) {
      const rule = new RegExp(`\\.text-${key} \\{[^}]*text-transform: uppercase;`).test(css);
      expect(rule).toBe(true);
    }
    expect(/\.text-body-m \{[^}]*text-transform/.test(css)).toBe(false);
  });

  test("chuyển động, lớp xếp chồng và họ chữ", () => {
    expect(vars.get("--motion-fast")).toBe("120ms");
    expect(vars.get("--ease-standard")).toBe("cubic-bezier(0.2, 0, 0, 1)");
    expect(vars.get("--z-tab-bar")).toBe("50");
    expect(vars.get("--font-display")).toContain("Big Shoulders Stencil Display");
    expect(vars.get("--font-body")).toContain("Barlow");
  });

  test("token trỏ chuột mặc định là con trỏ của hệ thống", () => {
    expect(vars.get("--cursor-default")).toBe("auto");
    expect(vars.get("--cursor-pointer")).toBe("pointer");
  });

  test("không có mã màu viết tay ngoài khối :root", () => {
    const outside = css.slice(css.indexOf("\n}\n") + 3);
    expect(/#[0-9a-fA-F]{3,8}\b/.test(outside)).toBe(false);
  });

  test("tệp src/styles/theme.css đã commit khớp kết quả sinh lại", async () => {
    const onDisk = await Bun.file(resolve(root, "src/styles/theme.css")).text();
    expect(onDisk).toBe(css);
  });
});
