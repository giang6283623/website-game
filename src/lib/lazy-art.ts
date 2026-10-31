/**
 * Ảnh nền trang trí dưới màn hình đầu chỉ được nạp khi phần tử sắp vào khung nhìn.
 * Phần tử gắn `data-art-lazy` và `ref={lazyArtRef}`. Khi đến gần, ta đặt thêm `data-art-in`,
 * CSS trong `src/styles/art.css` mới trả biến `--art-*` về giá trị thật nên ảnh mới bắt đầu tải.
 * Máy chủ không chạy `ref` nên HTML dựng sẵn không có `data-art-in`: ảnh chờ tới khi trang chạy trên trình duyệt.
 */

/** Nạp sớm 300 px trước khi phần tử vào khung nhìn để ảnh kịp hiện. */
const ROOT_MARGIN = "300px 0px";

let observer: IntersectionObserver | undefined;

function reveal(element: Element): void {
  element.setAttribute("data-art-in", "");
}

export function lazyArtRef(element: HTMLElement | null): void {
  if (!element) return;
  if (typeof IntersectionObserver === "undefined") {
    reveal(element);
    return;
  }
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target);
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: ROOT_MARGIN },
  );
  observer.observe(element);
}
