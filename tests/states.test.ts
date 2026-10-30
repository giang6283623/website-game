import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";

/**
 * Hợp đồng CSS cho trạng thái Hover, Focus và Disabled (G-10, G-24).
 * Trình duyệt thử không tính được :hover hay :focus-visible, nên kiểm tra chữ trong tệp CSS.
 * Mỗi kiểm thử khớp một dòng của bảng trạng thái trong COMPONENTS.md.
 */
const root = resolve(import.meta.dir, "..");
const read = (path: string) => Bun.file(resolve(root, path)).text();

/** Gộp phần khai báo của mọi khối có selector đúng bằng `selector` (kể cả khối trong @media). */
function declarations(css: string, selector: string): string {
  const parts: string[] = [];
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const match of bare.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const list = (match[1] as string).split(",").map((item) => item.trim());
    if (list.includes(selector)) parts.push(match[2] as string);
  }
  return parts.join("\n");
}

const hasProp = (body: string, property: string) =>
  new RegExp(`(^|[;\\s])${property}\\s*:`).test(body);

describe("vòng lấy nét chung", () => {
  test("vòng 3 px border/focus vẽ vào trong, không đổi kích thước", async () => {
    const css = await read("src/styles/global.css");
    const ring = declarations(css, ":focus-visible");
    expect(ring).toContain("var(--border-focus) solid var(--color-border-focus)");
    expect(ring).toContain("calc(var(--border-focus) * -1)");
  });
});

describe("AccountMenu (G-24)", () => {
  test("mục thường đổi chữ sang text/primary khi Hover và Focus", async () => {
    const css = await read("src/components/UserChip/AccountMenu.css");
    expect(declarations(css, ".account-menu__item:hover")).toContain("var(--color-text-primary)");
    expect(declarations(css, ".account-menu__item:focus-visible")).toContain(
      "var(--color-text-primary)",
    );
  });

  test("ĐĂNG XUẤT đổi nền khi Hover nhưng giữ chữ text/danger", async () => {
    const css = await read("src/components/UserChip/AccountMenu.css");
    const hover = declarations(css, ".account-menu__logout:hover");
    expect(hover).toContain("var(--color-bg-hover)");
    expect(hasProp(hover, "color")).toBe(false);
    expect(hasProp(declarations(css, ".account-menu__logout:focus-visible"), "color")).toBe(false);
    expect(declarations(css, ".account-menu__logout")).toContain("var(--color-text-danger)");
  });
});

describe("TabBar (G-10)", () => {
  test("Hover chỉ có với chuột, Focus đổi chữ sang text/primary", async () => {
    const css = await read("src/components/TabBar/TabBar.css");
    expect(css).toMatch(/@media \(hover: hover\) \{\s*\.tab-bar__tab:hover \{/);
    expect(declarations(css, ".tab-bar__tab:hover")).toContain("var(--color-text-primary)");
    expect(declarations(css, ".tab-bar__tab:focus-visible")).toContain("var(--color-text-primary)");
  });

  test("tab đang chọn giữ text/accent vì quy tắc nằm sau Hover và Focus", async () => {
    const css = await read("src/components/TabBar/TabBar.css");
    const active = css.indexOf(".tab-bar__tab.is-active {");
    expect(active).toBeGreaterThan(css.indexOf(".tab-bar__tab:hover {"));
    expect(active).toBeGreaterThan(css.indexOf(".tab-bar__tab:focus-visible {"));
    expect(declarations(css, ".tab-bar__tab.is-active")).toContain("var(--color-text-accent)");
  });
});

describe("NavDial (G-10)", () => {
  test("Hover đổi tên trạm sang text/primary, tần số giữ nguyên", async () => {
    const css = await read("src/components/NavDial/NavDial.css");
    expect(declarations(css, ".nav-dial__station:hover .nav-dial__name")).toContain(
      "var(--color-text-primary)",
    );
    expect(declarations(css, ".nav-dial__station:hover .nav-dial__freq")).toBe("");
  });
});

describe("ItemSlot (G-10)", () => {
  test("Disabled: hình mờ 40 phần trăm, chữ text/disabled, rê chuột không đổi nền", async () => {
    const css = await read("src/components/ItemSlot/ItemSlot.css");
    expect(declarations(css, ".item-slot.is-disabled .item-slot__image")).toContain("opacity: 0.4");
    for (const part of ["type", "name", "stat"]) {
      expect(declarations(css, `.item-slot.is-disabled .item-slot__${part}`)).toContain(
        "var(--color-text-disabled)",
      );
    }
    expect(declarations(css, ".item-slot.is-disabled:hover")).toContain("var(--color-bg-panel)");
  });
});

describe("Chip, Toggle, UserChip (G-10, G-24)", () => {
  test("Chip Disabled: viền border/soft, chữ text/disabled", async () => {
    const css = await read("src/components/Chip/Chip.css");
    const body = declarations(css, ".chip:disabled");
    expect(body).toContain("var(--color-border-soft)");
    expect(body).toContain("var(--color-text-disabled)");
  });

  test("Toggle Disabled: ray bg/hover, viền border/soft, núm và nhãn text/disabled", async () => {
    const css = await read("src/components/Toggle/Toggle.css");
    const track = declarations(css, ".toggle__track:disabled");
    expect(track).toContain("var(--color-bg-hover)");
    expect(track).toContain("var(--color-border-soft)");
    expect(declarations(css, ".toggle__track:disabled .toggle__thumb")).toContain(
      "var(--color-text-disabled)",
    );
    expect(declarations(css, ".toggle:has(.toggle__track:disabled) .toggle__label")).toContain(
      "var(--color-text-disabled)",
    );
  });

  test("UserChip Hover: nền bg/hover, viền giữ border/control", async () => {
    const css = await read("src/components/UserChip/UserChip.css");
    const hover = declarations(css, ".user-chip:hover");
    expect(hover).toContain("var(--color-bg-hover)");
    expect(hasProp(hover, "border-color")).toBe(false);
    expect(declarations(css, ".user-chip")).toContain("var(--color-border-control)");
  });
});
