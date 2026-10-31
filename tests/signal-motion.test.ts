/**
 * Khóa thứ tự trong `src/motion/signal.ts` bằng Motion giả (không chạy hoạt ảnh thật):
 * mục tiêu đã hiện thì giữ hiện trong lúc chờ mục khác, và khối chỉ sang "in" rồi mới gỡ style nội tuyến.
 * Thứ tự này chặn lỗi chớp tắt giữa chừng đã đo ở Chrome.
 */
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

type Pending = { element: Element; open: () => void; fail: () => void };

const pending: Pending[] = [];
let failAll = false;

mock.module("motion/mini", () => ({
  animate: (element: Element) => {
    let open = () => {};
    let fail = () => {};
    const finished = new Promise<void>((resolve, reject) => {
      open = resolve;
      fail = () => reject(new Error("animate failed"));
    });
    if (failAll) fail();
    pending.push({ element, open, fail });
    return { finished };
  },
}));

// Query riêng để không dính mock `src/motion/signal.ts` của tests/signal.test.ts (mock của Bun dùng chung giữa các tệp).
const realTag = "real";
const { playLockOn } = (await import(
  `../src/motion/signal.ts?${realTag}`
)) as typeof import("../src/motion/signal.ts");

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function setup() {
  document.body.innerHTML =
    '<div id="box" data-lock="pending"><p id="a">a</p><p id="b">b</p></div>';
  const box = document.getElementById("box") as HTMLElement;
  const a = document.getElementById("a") as HTMLElement;
  const b = document.getElementById("b") as HTMLElement;
  return { box, a, b };
}

function openFor(element: HTMLElement) {
  for (const item of pending.filter((p) => p.element === element)) item.open();
}

function openReticles() {
  for (const item of pending.filter((p) => p.element.tagName === "I")) item.open();
}

beforeEach(() => {
  pending.length = 0;
  failAll = false;
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("playLockOn", () => {
  test("mục tiêu đã hiện thì giữ hiện, khối chưa sang in khi còn mục khác đang chạy", async () => {
    const { box, a, b } = setup();
    const done = playLockOn(box);
    openReticles();
    openFor(a);
    await tick();
    expect(a.style.opacity).toBe("1");
    expect(b.style.opacity).toBe("");
    expect(box.getAttribute("data-lock")).toBe("pending");
    openFor(b);
    await done;
    expect(box.getAttribute("data-lock")).toBe("in");
  });

  test("xong thì gỡ hết style nội tuyến và dọn lớp dấu góc", async () => {
    const { box, a, b } = setup();
    const done = playLockOn(box);
    openReticles();
    openFor(a);
    openFor(b);
    await done;
    await tick();
    expect(a.style.opacity).toBe("");
    expect(a.style.transform).toBe("");
    expect(b.style.opacity).toBe("");
    expect(b.style.transform).toBe("");
    expect(document.querySelector(".lock-layer")?.childElementCount ?? 0).toBe(0);
  });

  test("hoạt ảnh lỗi thì khối vẫn sang in và style được gỡ sạch", async () => {
    const { box, a } = setup();
    failAll = true;
    await expect(playLockOn(box)).rejects.toThrow("animate failed");
    expect(box.getAttribute("data-lock")).toBe("in");
    expect(a.style.opacity).toBe("");
  });
});
