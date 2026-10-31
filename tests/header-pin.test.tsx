import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { App } from "../src/App.tsx";
import { resetMockSession } from "../src/api/mock/adapter.ts";
import { setMockConfig } from "../src/api/mock/config.ts";
import { headerPinRef } from "../src/lib/header-pin.ts";
import { lockLayer } from "../src/lib/lock-layer.ts";

const read = (path: string) =>
  readFileSync(resolve(import.meta.dir, "..", path), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const headerCss = read("src/components/Header/Header.css");
const motionCss = read("src/styles/motion.css");

/** Phần thân của khối @media đầu tiên khớp `query` (đếm ngoặc để lấy đủ khối lồng nhau). */
function mediaBlock(css: string, query: string): string {
  const start = css.indexOf(`@media ${query}`);
  if (start < 0) return "";
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") depth -= 1;
    if (depth === 0) return css.slice(open + 1, index);
  }
  return "";
}

type Entry = { isIntersecting: boolean };

/** Bộ quan sát giả: kiểm thử tự gọi hàm báo. DOM giả không có IntersectionObserver thật. */
class FakeObserver {
  static last: FakeObserver | undefined;
  observed: Element[] = [];
  disconnected = false;
  constructor(readonly callback: (entries: Entry[]) => void) {
    FakeObserver.last = this;
  }
  observe(element: Element) {
    this.observed.push(element);
  }
  disconnect() {
    this.disconnected = true;
  }
}

const globals = globalThis as { IntersectionObserver?: unknown };
const originalObserver = globals.IntersectionObserver;

function sentinelInShell() {
  const shell = document.createElement("div");
  const sentinel = document.createElement("div");
  shell.append(sentinel);
  return { shell, sentinel };
}

afterEach(() => {
  globals.IntersectionObserver = originalObserver;
  FakeObserver.last = undefined;
  document.body.innerHTML = "";
});

describe("headerPinRef bật trạng thái ghim", () => {
  beforeEach(() => {
    globals.IntersectionObserver = FakeObserver;
  });

  test("mốc ra khỏi khung nhìn thì đặt dấu, mốc quay lại thì gỡ dấu", () => {
    const { shell, sentinel } = sentinelInShell();
    headerPinRef(sentinel);
    expect(FakeObserver.last?.observed[0] === sentinel).toBe(true);
    FakeObserver.last?.callback([{ isIntersecting: false }]);
    expect(shell.hasAttribute("data-header-pinned")).toBe(true);
    FakeObserver.last?.callback([{ isIntersecting: true }]);
    expect(shell.hasAttribute("data-header-pinned")).toBe(false);
  });

  test("nhiều báo cáo một lúc thì lấy báo cáo mới nhất", () => {
    const { shell, sentinel } = sentinelInShell();
    headerPinRef(sentinel);
    FakeObserver.last?.callback([{ isIntersecting: false }, { isIntersecting: true }]);
    expect(shell.hasAttribute("data-header-pinned")).toBe(false);
    FakeObserver.last?.callback([{ isIntersecting: true }, { isIntersecting: false }]);
    expect(shell.hasAttribute("data-header-pinned")).toBe(true);
  });

  test("gỡ mốc thì ngừng theo dõi và không để sót dấu", () => {
    const { shell, sentinel } = sentinelInShell();
    const cleanup = headerPinRef(sentinel);
    FakeObserver.last?.callback([{ isIntersecting: false }]);
    cleanup?.();
    expect(FakeObserver.last?.disconnected).toBe(true);
    expect(shell.hasAttribute("data-header-pinned")).toBe(false);
  });

  test("trình duyệt thiếu IntersectionObserver thì bỏ qua, không lỗi", () => {
    globals.IntersectionObserver = undefined;
    const { shell, sentinel } = sentinelInShell();
    expect(headerPinRef(sentinel)).toBeUndefined();
    expect(shell.hasAttribute("data-header-pinned")).toBe(false);
  });

  test("React gọi lại với null thì không làm gì", () => {
    expect(headerPinRef(null)).toBeUndefined();
    expect(FakeObserver.last).toBeUndefined();
  });
});

describe("mốc ghim nằm trong khung trang", () => {
  beforeEach(() => {
    globals.IntersectionObserver = FakeObserver;
    resetMockSession();
    setMockConfig({ latencyMs: 0 });
  });

  async function renderAt(path: string) {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>,
      );
      await new Promise((done) => setTimeout(done, 30));
    });
  }

  test("trang công khai: mốc đứng ngay trước đầu trang, ẩn với trình đọc màn hình", async () => {
    await renderAt("/quy-tac");
    const sentinel = document.querySelector("[data-header-sentinel]");
    expect(sentinel?.getAttribute("aria-hidden")).toBe("true");
    expect(sentinel?.nextElementSibling === document.querySelector(".header")).toBe(true);
    expect(sentinel?.parentElement === document.querySelector(".shell")).toBe(true);
  });

  test("trang không có đầu trang thì không có mốc", async () => {
    await renderAt("/dang-nhap");
    expect(document.querySelector(".header")).toBeNull();
    expect(document.querySelector("[data-header-sentinel]")).toBeNull();
  });
});

describe("Header.css giữ luật ghim", () => {
  const tall = mediaBlock(headerCss, "(min-height: 560px)");

  test("chỉ dính khi màn hình đủ cao, dưới 560 px thì đứng yên", () => {
    expect(tall).toContain("position: sticky");
    expect(headerCss.replace(tall, "")).not.toContain("position: sticky");
    expect(headerCss.replace(tall, "")).toContain("position: relative");
  });

  test("dính ở đỉnh và nằm dưới cửa sổ, trên lớp dấu góc", () => {
    expect(tall).toMatch(/\.header-mobile \{[^}]*top: 0;/);
    expect(tall).toMatch(/\.header-mobile \{[^}]*z-index: var\(--z-tab-bar\);/);
  });

  test("hộp đầu trang không đổi chiều cao khi ghim, chỉ đẩy phần trên ra khỏi đỉnh", () => {
    expect(tall).toMatch(
      /\[data-header-pinned\][^{]*\{[^}]*top: calc\(-1 \* var\(--header-pin-cut\)\);/,
    );
    expect(tall).toMatch(/\[data-header-pinned\][^{]*\{[^}]*padding-top: var\(--header-pin-cut\);/);
    expect(tall).not.toMatch(/\[data-header-pinned\][^{]*\{[^}]*[^-]height:/);
  });

  test("hai cỡ thu đúng số đã duyệt: 96 xuống 76, 72 xuống 56", () => {
    expect(headerCss).toMatch(/:root \{[^}]*--header-pin-cut: 16px;/);
    const desktop = mediaBlock(headerCss, "(min-width: 1200px)");
    expect(desktop).toMatch(/:root \{[^}]*--header-pin-cut: 20px;/);
  });

  test("cuộn tới mốc # không bị đầu trang che", () => {
    expect(tall).toMatch(/html \{[^}]*scroll-padding-top: /);
  });

  test("vạch cam chạy từ trái, không đổ bóng và không làm mờ nền", () => {
    expect(headerCss).toMatch(/::after \{[^}]*transform: scaleX\(0\);/);
    expect(headerCss).toMatch(/::after \{[^}]*transform-origin: left/);
    expect(tall).toMatch(/\[data-header-pinned\][^{]*::after[^{]*\{[^}]*transform: scaleX\(1\);/);
    expect(headerCss).not.toContain("box-shadow");
    expect(headerCss).not.toContain("backdrop-filter");
  });

  test("không dùng transform trên khối hành động, vì menu tài khoản tựa vào khung đầu trang", () => {
    expect(headerCss).not.toMatch(/header__actions[^{]*\{[^}]*transform/);
    expect(headerCss).not.toMatch(/> \*[^{]*\{[^}]*transform/);
  });
});

describe("motion.css giữ luật chuyển động của đầu trang", () => {
  const allowed = mediaBlock(motionCss, "(prefers-reduced-motion: no-preference)");

  test("chuyển cảnh nằm trong khối cho phép chuyển động và tôn trọng nút Tắt hiệu ứng", () => {
    expect(allowed).toMatch(
      /html:not\(\[data-motion="off"\]\) :is\(\.header, \.header-mobile\)[^{]*\{[^}]*transition: padding-top var\(--motion-slow\)/,
    );
    expect(allowed).toMatch(
      /html:not\(\[data-motion="off"\]\) :is\(\.header, \.header-mobile\)::after[^{]*\{[^}]*transition: transform var\(--motion-slow\)/,
    );
  });

  test("không có chuyển cảnh đầu trang nằm ngoài khối đó", () => {
    expect(motionCss.replace(allowed, "")).not.toContain(".header");
    expect(headerCss).not.toContain("transition");
  });
});

describe("lớp dấu góc nằm dưới đầu trang dính", () => {
  test("gắn vào .shell để không vẽ đè đầu trang đã ghim", () => {
    const shell = document.createElement("div");
    shell.className = "shell";
    document.body.append(shell);
    expect(lockLayer().parentElement === shell).toBe(true);
  });

  test("không có .shell thì gắn vào body, gọi lại vẫn dùng đúng một lớp", () => {
    const layer = lockLayer();
    expect(layer.parentElement === document.body).toBe(true);
    expect(lockLayer() === layer).toBe(true);
    expect(document.querySelectorAll(".lock-layer").length).toBe(1);
  });
});
