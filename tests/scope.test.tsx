import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { ItemSlot } from "../src/components/ItemSlot/ItemSlot.tsx";
import { PAGE_COPY } from "../src/content/pages.ts";
import { attachScope } from "../src/motion/scope.ts";

const root = resolve(import.meta.dir, "..");
const read = (file: string) =>
  readFileSync(resolve(root, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const motion = read("src/styles/motion.css");
const slotCss = read("src/components/ItemSlot/ItemSlot.css");
const item = {
  name: "AK-74",
  typeLabel: "Súng trường",
  statLine: "Sát thương 30",
  imageKey: "ak.webp",
};
const slot = (disabled = false) =>
  renderToString(
    <MemoryRouter>
      <ItemSlot item={item} to="/kho-do/ak" disabled={disabled} />
    </MemoryRouter>,
  );

describe("ống ngắm tầng 1", () => {
  test("thẻ có chữ thập và nhãn ĐÃ KHÓA, đều ẩn khỏi trình đọc màn hình", () => {
    const html = slot();
    expect(html).toContain('class="item-slot__scope" aria-hidden="true"');
    expect(html.match(/item-slot__cross--/g)).toHaveLength(2);
    expect(html).toContain(PAGE_COPY.itemsPage.scopeLocked);
  });

  test("thẻ khóa không có ống ngắm", () => {
    expect(slot(true)).not.toContain("item-slot__scope");
  });

  test("không có số giả: nhãn chỉ là chữ", () => {
    expect(PAGE_COPY.itemsPage.scopeLocked).toBe("Đã khóa");
  });

  test("bàn phím nhận y hệt chuột", () => {
    expect(slotCss).toMatch(/:is\(:hover, :active, :has\(\.item-slot__link:focus-visible\)\)/);
    expect(motion).toMatch(/:is\(:hover, :active, :has\(\.item-slot__link:focus-visible\)\)/);
  });

  test("giảm chuyển động vẫn hiện ống ngắm tức thì: trạng thái hiện nằm ngoài khối no-preference", () => {
    expect(slotCss).toMatch(/\.item-slot__scope \{\s*opacity: 1;/);
    expect(slotCss).not.toMatch(/translate|animation|transition/);
  });

  test("dấu góc phản hồi ngay, không có transition-delay ở mốc đầu", () => {
    const rule = /\.item-slot__plate::before,[^{]*\{[^}]*animation: scope-squeeze[^}]*\}/.exec(
      motion,
    );
    expect(rule?.[0]).not.toContain("delay");
    expect(motion).toMatch(/--scope-time: 300ms;/);
    expect(motion).toMatch(/transition: opacity 100ms linear;/);
  });

  test("thẻ khác chỉ mờ khay, thẻ đang chọn giữ nguyên", () => {
    expect(slotCss).toMatch(
      /\.scope-grid:has\([^{]*\.is-selected[^{]*\.item-slot__plate \{\s*opacity: 0\.55;/,
    );
    expect(slotCss).not.toMatch(/item-slot__info[^{]*\{[^}]*opacity/);
  });

  test("điện thoại khóa trong 120 ms", () => {
    expect(motion).toMatch(/@media \(hover: none\) \{\s*:root \{\s*--scope-time: 120ms;/);
  });
});

describe("ống ngắm tầng 2", () => {
  function grid(): HTMLElement {
    const element = document.createElement("ul");
    element.innerHTML =
      '<li class="item-slot" id="a"><span class="item-slot__plate"></span></li><li class="item-slot is-disabled" id="b"><span class="item-slot__plate"></span></li>';
    document.body.append(element);
    return element;
  }

  test("trỏ vào thẻ thì bật ống ngắm chung, thẻ khóa thì tắt, gỡ thì sạch", () => {
    const element = grid();
    const detach = attachScope(element);
    expect(element.classList.contains("scope-live")).toBe(true);
    const box = document.querySelector(".scope-shared") as HTMLElement;
    const move = (id: string) =>
      document
        .getElementById(id)
        ?.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: 5, clientY: 7 }));
    move("a");
    expect(box.hasAttribute("data-on")).toBe(true);
    expect((box.querySelector(".scope-shared__line--v") as HTMLElement).style.transform).toBe(
      "translateX(5px)",
    );
    move("b");
    expect(box.hasAttribute("data-on")).toBe(false);
    detach();
    expect(document.querySelector(".scope-shared")).toBeNull();
    expect(element.classList.contains("scope-live")).toBe(false);
    element.remove();
  });
});
