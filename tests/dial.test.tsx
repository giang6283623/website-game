import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { firstDialMove, nextDialMove } from "../src/components/DialNeedle/DialNeedle.tsx";
import { NavDial } from "../src/components/NavDial/NavDial.tsx";
import { TabBar } from "../src/components/TabBar/TabBar.tsx";

const root = resolve(import.meta.dir, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");
const motion = read("src/styles/motion.css").replace(/\/\*[\s\S]*?\*\//g, "");

describe("quãng nhảy của kim", () => {
  test("lúc nối kim đứng yên, trang không thuộc trạm nào thì đặt ở trạm đầu", () => {
    expect(firstDialMove(2)).toEqual({ index: 2, station: 2, hop: 0, dir: 1, seq: 0 });
    expect(firstDialMove(-1).station).toBe(0);
  });

  test("đổi trạm thì tính số trạm nhảy và chiều đi", () => {
    const right = nextDialMove(firstDialMove(0), 3);
    expect(right).toEqual({ index: 3, station: 3, hop: 3, dir: 1, seq: 1 });
    expect(nextDialMove(right, 1)).toEqual({ index: 1, station: 1, hop: 2, dir: -1, seq: 2 });
  });

  test("sang trang nav null chỉ giấu kim, quay lại thì trượt từ chỗ cũ", () => {
    const parked = nextDialMove(firstDialMove(1), -1);
    expect(parked.station).toBe(1);
    expect(parked.seq).toBe(0);
    expect(nextDialMove(parked, 4)).toEqual({ index: 4, station: 4, hop: 3, dir: 1, seq: 1 });
    expect(nextDialMove(parked, 1).hop).toBe(0);
  });

  test("cùng trạm thì giữ nguyên, không chạy lại con lắc", () => {
    const move = nextDialMove(firstDialMove(0), 2);
    expect(nextDialMove(move, 2) === move).toBe(true);
  });
});

describe("kim trong NavDial và TabBar", () => {
  test("HTML dựng sẵn có hop 0 và giữ kim trong DOM ở trang nav null", () => {
    for (const Dial of [NavDial, TabBar]) {
      const html = renderToString(
        <MemoryRouter>
          <Dial active={null} />
        </MemoryRouter>,
      );
      expect(html).toContain('data-hop="0"');
      expect(html).toContain("data-parked");
      expect(html).toContain("dial-needle__bar");
    }
  });

  test("đổi trạm giữ nguyên ray, đặt data-hop và --dial-index trong cùng một lần vẽ", () => {
    const view = render(
      <MemoryRouter>
        <NavDial active="home" />
      </MemoryRouter>,
    );
    const nav = view.container.querySelector("nav") as HTMLElement;
    const track = view.container.querySelector(".dial-track");
    expect(nav.getAttribute("data-hop")).toBe("0");
    view.rerender(
      <MemoryRouter>
        <NavDial active="ranking" />
      </MemoryRouter>,
    );
    expect(nav.getAttribute("data-hop")).toBe("3");
    expect(nav.style.getPropertyValue("--dial-index")).toBe("3");
    expect(nav.style.getPropertyValue("--dial-dir")).toBe("1");
    expect(view.container.querySelector(".dial-track") === track).toBe(true);
    view.unmount();
  });
});

describe("CSS của kim", () => {
  test("bốn đường lò xo nằm trong @supports, ngoài đó dùng --ease-standard", () => {
    const block = motion.slice(
      motion.indexOf("@supports (transition-timing-function: linear(0, 1))"),
    );
    for (const hop of [1, 2, 3, 4])
      expect(block).toMatch(new RegExp(`--spring-${hop}: linear\\(\\s*0,`));
    expect(motion).toContain("var(--dial-curve, var(--ease-standard))");
  });

  test("kim không còn dùng left và không có vòng requestAnimationFrame", () => {
    for (const file of ["src/components/NavDial/NavDial.css", "src/components/TabBar/TabBar.css"]) {
      expect(read(file)).not.toContain("transition: left");
    }
    expect(read("src/components/DialNeedle/DialNeedle.css")).not.toContain("left: calc(");
    expect(
      read("src/components/DialNeedle/DialNeedle.tsx").replace(/\/\*[\s\S]*?\*\//g, ""),
    ).not.toContain("requestAnimationFrame");
  });

  test("rung rà sóng trễ từ 1 giây để lúc tải trang kim đứng yên", () => {
    const delay =
      /animation: dial-seek calc\(var\(--signal-beat\) \* 2\) steps\(1, end\) ([\d.]+)s infinite/.exec(
        motion,
      );
    expect(Number(delay?.[1])).toBeGreaterThanOrEqual(1);
  });

  test("hoạt ảnh đổi trạm chỉ chạy khi data-hop khác 0", () => {
    expect(motion).toMatch(
      /\.dial-root:not\(\[data-hop="0"\]\) \.dial-needle \{[^}]*animation: dial-swing/,
    );
    expect(motion).toMatch(
      /\.dial-root:not\(\[data-hop="0"\]\) \.dial-ruler \{[^}]*animation: dial-land/,
    );
  });

  test("hút kim có đích 19 px để đỉnh lò xo không quá 22 px", () => {
    expect(motion).toMatch(/clamp\(-19px, [^;]+, 19px\)/);
  });
});
