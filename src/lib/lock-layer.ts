/**
 * Lớp chứa dấu góc và ống ngắm: React không quản lý, cắt phần tràn ngang để trang không có thanh cuộn ngang.
 * Gắn trong `.shell` vì `.shell` có `isolation: isolate`: gắn ở `body` thì lớp này vẽ đè đầu trang đang dính.
 */
export function lockLayer(): HTMLElement {
  const existing = document.querySelector<HTMLElement>(".lock-layer");
  if (existing) return existing;
  const layer = document.createElement("div");
  layer.className = "lock-layer";
  layer.setAttribute("aria-hidden", "true");
  (document.querySelector(".shell") ?? document.body).append(layer);
  return layer;
}
