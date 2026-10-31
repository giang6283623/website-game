import { afterEach, describe, expect, mock, test } from "bun:test";

type Entry = { isIntersecting: boolean; target: Element };
type Callback = (entries: Entry[]) => void;

/** Bộ quan sát giả: ghi lại phần tử được theo dõi để kiểm thử tự gọi hàm báo. */
class FakeObserver {
  static last: FakeObserver | undefined;
  watched = new Set<Element>();
  constructor(readonly callback: Callback) {
    FakeObserver.last = this;
  }
  observe(element: Element) {
    this.watched.add(element);
  }
  unobserve(element: Element) {
    this.watched.delete(element);
  }
}

// Motion thật cần Web Animations API, nên kiểm thử thay mô-đun Motion bằng bản giả. Đường chạy thật đo ở Chrome.
const playLockOn = mock(async (_container: HTMLElement) => {});
mock.module("../src/motion/signal.ts", () => ({ playLockOn }));

type Globals = { IntersectionObserver?: unknown; matchMedia?: unknown };
const globals = globalThis as Globals;
const prototype = Element.prototype as { animate?: unknown };
const original = {
  observer: globals.IntersectionObserver,
  matchMedia: globals.matchMedia,
  animate: prototype.animate,
};

/** Dựng môi trường: mặc định đủ IntersectionObserver, Web Animations API và không bật giảm chuyển động. */
function setup(options: { reduced?: boolean; observer?: boolean; animate?: boolean } = {}) {
  const { reduced = false, observer = true, animate = true } = options;
  globals.IntersectionObserver = observer ? FakeObserver : undefined;
  globals.matchMedia = () => ({ matches: reduced });
  prototype.animate = animate ? () => ({}) : undefined;
}

afterEach(() => {
  globals.IntersectionObserver = original.observer;
  globals.matchMedia = original.matchMedia;
  prototype.animate = original.animate;
  FakeObserver.last = undefined;
  playLockOn.mockClear();
  playLockOn.mockImplementation(async () => {});
});

/** Mỗi kiểm thử nạp một bản mô-đun riêng vì mô-đun giữ bộ quan sát và cờ "đã quét" ở biến chung. */
async function freshModule(tag: string) {
  return (await import(`../src/lib/signal.ts?${tag}`)) as typeof import("../src/lib/signal.ts");
}

/** Phần tử có vị trí giả: `top` là khoảng cách tới đỉnh khung nhìn. */
function boxAt(top: number): HTMLElement {
  const element = document.createElement("div");
  Object.defineProperty(element, "getBoundingClientRect", { value: () => ({ top }) });
  return element;
}

const BELOW_FOLD = 5000;
const settle = () => new Promise((done) => setTimeout(done, 0));

describe("khóa mục tiêu (lockOnRef)", () => {
  test("bật giảm chuyển động thì khối dưới màn hình không bị ẩn và không bị theo dõi", async () => {
    setup({ reduced: true });
    const { lockOnRef } = await freshModule("reduced");
    const element = boxAt(BELOW_FOLD);
    lockOnRef(element);
    expect(element.hasAttribute("data-lock")).toBe(false);
    expect(FakeObserver.last).toBeUndefined();
  });

  test("thiếu IntersectionObserver thì không ẩn", async () => {
    setup({ observer: false });
    const { lockOnRef } = await freshModule("no-observer");
    const element = boxAt(BELOW_FOLD);
    lockOnRef(element);
    expect(element.hasAttribute("data-lock")).toBe(false);
  });

  test("thiếu Web Animations API thì không ẩn", async () => {
    setup({ animate: false });
    const { lockOnRef } = await freshModule("no-animate");
    const element = boxAt(BELOW_FOLD);
    lockOnRef(element);
    expect(element.hasAttribute("data-lock")).toBe(false);
    expect(FakeObserver.last).toBeUndefined();
  });

  test("khối đang trong màn hình lúc nối thì để nguyên", async () => {
    setup();
    const { lockOnRef } = await freshModule("in-view");
    const element = boxAt(10);
    lockOnRef(element);
    expect(element.hasAttribute("data-lock")).toBe(false);
    expect(FakeObserver.last).toBeUndefined();
  });

  test("ref rỗng không làm gì", async () => {
    setup();
    const { lockOnRef } = await freshModule("null");
    lockOnRef(null);
    expect(FakeObserver.last).toBeUndefined();
  });

  test("khối dưới màn hình: ẩn chờ, vào khung nhìn thì chạy Motion rồi hiện", async () => {
    setup();
    const { lockOnRef } = await freshModule("below");
    const element = boxAt(BELOW_FOLD);
    lockOnRef(element);
    const observer = FakeObserver.last;
    if (!observer) throw new Error("chưa tạo bộ quan sát");
    expect(element.getAttribute("data-lock")).toBe("pending");
    expect(observer.watched.has(element)).toBe(true);

    observer.callback([{ isIntersecting: false, target: element }]);
    expect(element.getAttribute("data-lock")).toBe("pending");
    expect(playLockOn).toHaveBeenCalledTimes(0);

    observer.callback([{ isIntersecting: true, target: element }]);
    expect(observer.watched.has(element)).toBe(false);
    await settle();
    expect(playLockOn).toHaveBeenCalledTimes(1);
    expect(playLockOn.mock.calls[0]?.[0] === element).toBe(true);
    expect(element.getAttribute("data-lock")).toBe("in");
  });

  test("Motion nạp lỗi thì khối vẫn hiện", async () => {
    setup();
    playLockOn.mockImplementation(async () => {
      throw new Error("nạp lỗi");
    });
    const { lockOnRef } = await freshModule("failure");
    const element = boxAt(BELOW_FOLD);
    lockOnRef(element);
    FakeObserver.last?.callback([{ isIntersecting: true, target: element }]);
    await settle();
    expect(element.getAttribute("data-lock")).toBe("in");
  });
});
