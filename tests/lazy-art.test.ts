import { afterEach, describe, expect, test } from "bun:test";

type Callback = (entries: { isIntersecting: boolean; target: Element }[]) => void;

/** Bộ quan sát giả: ghi lại phần tử được theo dõi, để kiểm thử tự gọi hàm báo. */
class FakeObserver {
  static last: FakeObserver | undefined;
  options: unknown;
  watched = new Set<Element>();
  constructor(
    readonly callback: Callback,
    options: unknown,
  ) {
    this.options = options;
    FakeObserver.last = this;
  }
  observe(element: Element) {
    this.watched.add(element);
  }
  unobserve(element: Element) {
    this.watched.delete(element);
  }
}

const original = (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;

afterEach(() => {
  (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = original;
  FakeObserver.last = undefined;
});

/** Mỗi kiểm thử nạp một bản mô-đun riêng vì mô-đun giữ bộ quan sát ở biến chung. */
async function freshModule(tag: string) {
  return (await import(`../src/lib/lazy-art.ts?${tag}`)) as typeof import("../src/lib/lazy-art.ts");
}

describe("nạp lười ảnh nền trang trí", () => {
  test("không có IntersectionObserver thì hiện ảnh ngay", async () => {
    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = undefined;
    const { lazyArtRef } = await freshModule("none");
    const element = document.createElement("div");
    lazyArtRef(element);
    expect(element.hasAttribute("data-art-in")).toBe(true);
  });

  test("phần tử chưa vào khung nhìn chưa có data-art-in, vào gần thì có rồi thôi theo dõi", async () => {
    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = FakeObserver;
    const { lazyArtRef } = await freshModule("observe");
    const element = document.createElement("div");
    lazyArtRef(element);
    const observer = FakeObserver.last;
    if (!observer) throw new Error("chưa tạo bộ quan sát");
    expect(observer.watched.has(element)).toBe(true);
    expect(element.hasAttribute("data-art-in")).toBe(false);
    expect((observer.options as { rootMargin: string }).rootMargin).toBe("300px 0px");

    observer.callback([{ isIntersecting: false, target: element }]);
    expect(element.hasAttribute("data-art-in")).toBe(false);

    observer.callback([{ isIntersecting: true, target: element }]);
    expect(element.hasAttribute("data-art-in")).toBe(true);
    expect(observer.watched.has(element)).toBe(false);
  });

  test("ref rỗng (phần tử bị gỡ) không làm gì", async () => {
    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = FakeObserver;
    const { lazyArtRef } = await freshModule("null");
    lazyArtRef(null);
    expect(FakeObserver.last).toBeUndefined();
  });
});
