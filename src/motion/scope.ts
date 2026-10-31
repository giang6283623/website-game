/**
 * Tầng 2 của ống ngắm: một ống ngắm dùng chung cho cả lưới, trượt từ thẻ này sang thẻ khác bằng đường lò xo của kim,
 * hai vạch chữ thập bám đầu mũi trỏ chuột. Không cần Motion, chỉ đặt `transform` để CSS chuyển mượt.
 * Tệp này nạp lười từ `src/lib/signal.ts`. Lỗi nạp thì tầng 1 (CSS của `ItemSlot`) vẫn đủ dùng.
 */
import { lockLayer } from "../lib/lock-layer.ts";

const CORNERS = ["tl", "tr", "bl", "br"] as const;

function mark(className: string, box: HTMLElement): HTMLElement {
  const element = document.createElement("i");
  element.className = className;
  box.append(element);
  return element;
}

/** Gắn một trình nghe `pointermove` ủy quyền lên lưới. Trả về hàm gỡ. */
export function attachScope(grid: HTMLElement): () => void {
  const box = document.createElement("div");
  box.className = "scope-shared";
  for (const corner of CORNERS) mark(`lock-reticle__mark lock-reticle__mark--${corner}`, box);
  const vertical = mark("scope-shared__line scope-shared__line--v", box);
  const horizontal = mark("scope-shared__line scope-shared__line--h", box);
  lockLayer().append(box);
  grid.classList.add("scope-live");
  let current: Element | null = null;

  const hide = () => {
    current = null;
    box.removeAttribute("data-on");
  };

  const onMove = (event: PointerEvent) => {
    const slot = (event.target as Element).closest?.(".item-slot:not(.is-disabled)") ?? null;
    const plate = slot?.querySelector(".item-slot__plate");
    if (!slot || !plate) {
      hide();
      return;
    }
    const rect = plate.getBoundingClientRect();
    vertical.style.transform = `translateX(${event.clientX - rect.left}px)`;
    horizontal.style.transform = `translateY(${event.clientY - rect.top}px)`;
    if (slot === current) return;
    const appearing = current === null;
    current = slot;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
    box.style.transform = `translate(${rect.left + window.scrollX}px, ${rect.top + window.scrollY}px)`;
    // Lần hiện ra không trượt: đọc bố cục để trình duyệt nhận vị trí trước khi `data-on` bật chuyển động.
    if (appearing) void box.offsetWidth;
    box.setAttribute("data-on", "");
  };

  grid.addEventListener("pointermove", onMove);
  grid.addEventListener("pointerleave", hide);
  return () => {
    grid.removeEventListener("pointermove", onMove);
    grid.removeEventListener("pointerleave", hide);
    grid.classList.remove("scope-live");
    box.remove();
  };
}
