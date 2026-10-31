/** Lớp chứa dấu góc và ống ngắm: nằm ngoài cây React, cắt phần tràn ngang để trang không có thanh cuộn ngang. */
export function lockLayer(): HTMLElement {
  const existing = document.querySelector<HTMLElement>(".lock-layer");
  if (existing) return existing;
  const layer = document.createElement("div");
  layer.className = "lock-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.append(layer);
  return layer;
}
