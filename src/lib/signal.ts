/**
 * Cửa vào của hoạt ảnh "Tín hiệu yếu". Tệp này nhỏ và nằm trong gói trang, không nhập Motion.
 * Motion nằm ở `src/motion/signal.ts` và chỉ được nạp bằng import() khi cần, sau khi React nối vào trang.
 *
 * Quy tắc giữ HTML dựng sẵn hiện đủ (C-120): máy chủ không chạy `ref`, nên HTML dựng sẵn không có trạng thái ẩn.
 * Tắt JavaScript, bật giảm chuyển động, thiếu IntersectionObserver hoặc Web Animations API đều không ẩn gì cả.
 */

import { isMotionOff } from "./motion-pref.ts";

type SignalModule = typeof import("../motion/signal.ts");

let loader: Promise<SignalModule> | undefined;
let observer: IntersectionObserver | undefined;
let loopObserver: IntersectionObserver | undefined;

/** Nạp Motion một lần. */
export function loadSignal(): Promise<SignalModule> {
  loader ??= import("../motion/signal.ts");
  return loader;
}

function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Có đủ khả năng chạy hoạt ảnh không. Thiếu một thứ thì giữ trang như HTML dựng sẵn. */
export function canPlaySignal(): boolean {
  return (
    typeof IntersectionObserver !== "undefined" &&
    typeof Element !== "undefined" &&
    typeof Element.prototype.animate === "function" &&
    !prefersReducedMotion() &&
    !isMotionOff()
  );
}

/** Nạp sẵn Motion lúc máy rảnh để lần khóa đầu tiên không chờ. */
function warm(): void {
  if (typeof requestIdleCallback === "function") requestIdleCallback(() => void loadSignal());
  else setTimeout(() => void loadSignal(), 1000);
}

function lockOn(container: HTMLElement): void {
  const finish = () => container.setAttribute("data-lock", "in");
  if (!canPlaySignal()) {
    finish();
    return;
  }
  loadSignal()
    .then((signal) => signal.playLockOn(container))
    .then(finish, finish);
}

function onIntersect(entries: IntersectionObserverEntry[]): void {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    observer?.unobserve(entry.target);
    lockOn(entry.target as HTMLElement);
  }
}

/**
 * Tầng 2 của ống ngắm: chỉ nạp ở lần trỏ chuột đầu tiên vào lưới. Thiết bị chạm, giảm chuyển động hay nạp lỗi thì giữ tầng 1 (CSS).
 */
export function scopeGridRef(grid: HTMLElement | null): (() => void) | undefined {
  if (!grid || !canPlaySignal()) return undefined;
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;
  let detach: (() => void) | undefined;
  let gone = false;
  const start = () => {
    import("../motion/scope.ts")
      .then((scope) => {
        if (!gone) detach = scope.attachScope(grid);
      })
      .catch(() => undefined);
  };
  grid.addEventListener("pointerover", start, { once: true });
  return () => {
    gone = true;
    grid.removeEventListener("pointerover", start);
    detach?.();
  };
}

/** Khối có vòng lặp ra khỏi màn hình thì đặt `data-offscreen`, CSS dừng vòng lặp để đỡ tốn máy. */
export function pauseOffscreenRef(element: HTMLElement | null): (() => void) | undefined {
  if (!element || typeof IntersectionObserver === "undefined") return undefined;
  loopObserver ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      entry.target.toggleAttribute("data-offscreen", !entry.isIntersecting);
    }
  });
  loopObserver.observe(element);
  return () => loopObserver?.unobserve(element);
}

/**
 * Khóa mục tiêu: gắn vào khối bọc, các phần tử con trực tiếp là mục tiêu.
 * Khối đang trong màn hình lúc nối thì để nguyên. Khối dưới màn hình thì giấu (data-lock="pending", CSS lo),
 * tới khi cuộn gần thì chạy hoạt ảnh rồi đặt data-lock="in". Nạp Motion lỗi thì vẫn hiện (data-lock="in").
 */
export function lockOnRef(element: HTMLElement | null): void {
  if (!element || !canPlaySignal()) return;
  if (element.getBoundingClientRect().top < window.innerHeight) return;
  element.setAttribute("data-lock", "pending");
  warm();
  observer ??= new IntersectionObserver(onIntersect, { rootMargin: "0px 0px -8% 0px" });
  observer.observe(element);
}
