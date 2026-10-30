import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { act, render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { App } from "../src/App.tsx";
import { resetMockSession } from "../src/api/mock/adapter.ts";
import { setMockConfig } from "../src/api/mock/config.ts";
import { BROKEN_ATTRIBUTE, hideBrokenGameImages } from "../src/lib/hide-broken-images.ts";

/**
 * Bản clone không có thư mục public/assets/game/ (hình game không vào git), nên mọi hình game trả 404.
 * Các kiểm thử này giữ hợp đồng: hình game hỏng bị ẩn, hình khác không bị đụng.
 */

const GAME_SRC = "/assets/game/items/akm.webp";
const stop = new Set<() => void>();

/**
 * Thêm một thẻ img vào tài liệu. `state` giả lập thứ trình duyệt biết về hình lúc quét đầu vào.
 * DOM giả (happy-dom) coi hình mới là đã xong và rộng 0, khác trình duyệt thật, nên mặc định là "đang tải".
 */
function addImage(src: string, state = { complete: false, naturalWidth: 0 }) {
  const image = document.createElement("img");
  image.setAttribute("src", src);
  Object.defineProperty(image, "complete", { value: state.complete });
  Object.defineProperty(image, "naturalWidth", { value: state.naturalWidth });
  document.body.appendChild(image);
  return image;
}

function start() {
  const off = hideBrokenGameImages(document);
  stop.add(off);
  return off;
}

afterEach(() => {
  for (const off of stop) off();
  stop.clear();
  document.body.replaceChildren();
});

describe("ẩn hình game hỏng", () => {
  test("hình game báo lỗi thì có dấu data-broken", () => {
    const image = addImage(GAME_SRC);
    start();
    expect(image.hasAttribute(BROKEN_ATTRIBUTE)).toBe(false);
    image.dispatchEvent(new Event("error"));
    expect(image.hasAttribute(BROKEN_ATTRIBUTE)).toBe(true);
  });

  test("hình thêm vào sau khi bắt đầu nghe vẫn được xử lý", () => {
    start();
    const image = addImage(GAME_SRC);
    image.dispatchEvent(new Event("error"));
    expect(image.hasAttribute(BROKEN_ATTRIBUTE)).toBe(true);
  });

  test("hình tải lại thành công (đổi vật phẩm) thì gỡ dấu", () => {
    const image = addImage(GAME_SRC);
    start();
    image.dispatchEvent(new Event("error"));
    image.setAttribute("src", "/assets/game/items/fal.webp");
    image.dispatchEvent(new Event("load"));
    expect(image.hasAttribute(BROKEN_ATTRIBUTE)).toBe(false);
  });

  test("hình đổi sang địa chỉ không phải hình game rồi tải xong cũng được gỡ dấu", () => {
    const image = addImage(GAME_SRC);
    start();
    image.dispatchEvent(new Event("error"));
    image.setAttribute("src", "/uploads/cover.webp");
    image.dispatchEvent(new Event("load"));
    expect(image.hasAttribute(BROKEN_ATTRIBUTE)).toBe(false);
  });

  test("hình không phải hình game không bị đụng (hình tải lên, hình ngoài)", () => {
    start();
    const upload = addImage("/uploads/cover.webp");
    const outside = addImage("https://example.com/assets/game/x.webp");
    const bare = document.createElement("img");
    document.body.appendChild(bare);
    for (const image of [upload, outside, bare]) {
      image.dispatchEvent(new Event("error"));
      expect(image.hasAttribute(BROKEN_ATTRIBUTE)).toBe(false);
    }
  });

  test("quét đầu vào: hình đã hỏng từ trước (HTML dựng sẵn) bị đánh dấu ngay", () => {
    const failed = addImage(GAME_SRC, { complete: true, naturalWidth: 0 });
    start();
    expect(failed.hasAttribute(BROKEN_ATTRIBUTE)).toBe(true);
  });

  test("quét đầu vào: hình tải tốt hoặc còn đang tải không bị đánh dấu", () => {
    const good = addImage(GAME_SRC, { complete: true, naturalWidth: 272 });
    const loading = addImage(GAME_SRC, { complete: false, naturalWidth: 0 });
    const upload = addImage("/uploads/cover.webp", { complete: true, naturalWidth: 0 });
    start();
    expect(good.hasAttribute(BROKEN_ATTRIBUTE)).toBe(false);
    expect(loading.hasAttribute(BROKEN_ATTRIBUTE)).toBe(false);
    expect(upload.hasAttribute(BROKEN_ATTRIBUTE)).toBe(false);
  });

  test("hàm trả về gỡ cả hai bộ nghe", () => {
    const image = addImage(GAME_SRC);
    const off = start();
    off();
    image.dispatchEvent(new Event("error"));
    expect(image.hasAttribute(BROKEN_ATTRIBUTE)).toBe(false);
  });
});

describe("nối vào ứng dụng", () => {
  beforeEach(() => {
    resetMockSession();
    setMockConfig({ latencyMs: 0 });
  });

  test("App bắt đầu nghe khi gắn và dừng khi gỡ", async () => {
    let view: ReturnType<typeof render> | undefined;
    await act(async () => {
      view = render(
        <MemoryRouter initialEntries={["/quy-tac"]}>
          <App />
        </MemoryRouter>,
      );
      await new Promise((done) => setTimeout(done, 30));
    });
    const image = addImage(GAME_SRC);
    image.dispatchEvent(new Event("error"));
    expect(image.hasAttribute(BROKEN_ATTRIBUTE)).toBe(true);

    view?.unmount();
    const after = addImage(GAME_SRC);
    after.dispatchEvent(new Event("error"));
    expect(after.hasAttribute(BROKEN_ATTRIBUTE)).toBe(false);
  });
});

describe("quy tắc CSS", () => {
  test("img[data-broken] ẩn bằng visibility (giữ chỗ, không đổi bố cục)", async () => {
    const css = await Bun.file(resolve(import.meta.dir, "../src/styles/global.css")).text();
    const rule = css.match(/img\[data-broken\]\s*\{([^}]*)\}/);
    expect(rule).not.toBeNull();
    expect(rule?.[1]).toContain("visibility: hidden");
    expect(rule?.[1]).not.toContain("display");
  });
});
