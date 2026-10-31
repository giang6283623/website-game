import { type KeyboardEvent, useEffect, useRef } from "react";
import type { Item } from "../../api/schemas.ts";
import { Button } from "../Button/Button.tsx";
import { ItemDetail } from "../ItemDetail/ItemDetail.tsx";
import "./ItemDialog.css";

export type ItemDialogLabels = {
  dialog: string;
  close: string;
  closeLabel: string;
  previous: string;
  previousLabel: string;
  next: string;
  nextLabel: string;
  position: (index: number, total: number) => string;
};

/**
 * Cửa sổ chi tiết vật phẩm: hiện trên trang, có Trước và Sau để xem liền một dải vật phẩm.
 * Tiêu điểm vào cửa sổ khi mở, bị giữ trong cửa sổ khi bấm Tab, và trả về phần tử đã mở khi đóng.
 * Phím: Esc đóng, mũi tên trái và phải đổi vật phẩm. Bấm ra ngoài khung cũng đóng.
 * Hết dải (vật phẩm đầu hoặc cuối) thì `onPrevious` hoặc `onNext` là `undefined` và nút bị khóa.
 */
export function ItemDialog({
  item,
  index,
  total,
  labels,
  onClose,
  onPrevious,
  onNext,
}: {
  item: Item;
  /** Vị trí của vật phẩm trong dải, đếm từ 0. */
  index: number;
  total: number;
  labels: ItemDialogLabels;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);

  // Mở: nhớ phần tử đang giữ tiêu điểm để trả lại khi đóng, và khóa cuộn trang phía sau.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = overflow;
      opener?.focus?.();
    };
  }, []);

  // Tiêu điểm nằm trong khung. Nút vừa bị khóa (hết dải) không được giữ tiêu điểm, vì phím sẽ không tới được nữa.
  // biome-ignore lint/correctness/useExhaustiveDependencies: chạy lại mỗi khi đổi vật phẩm
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const active = document.activeElement;
    const lost = !box.contains(active) || (active instanceof HTMLButtonElement && active.disabled);
    if (lost) box.focus();
  }, [item.slug]);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key === "ArrowLeft" && onPrevious) {
      event.preventDefault();
      onPrevious();
      return;
    }
    if (event.key === "ArrowRight" && onNext) {
      event.preventDefault();
      onNext();
      return;
    }
    if (event.key !== "Tab") return;
    const box = boxRef.current;
    const buttons = box?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
    if (!box || !buttons || buttons.length === 0) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === box)) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  return (
    <div className="item-dialog">
      <button
        type="button"
        className="item-dialog__backdrop"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={boxRef}
        className="item-dialog__box"
        role="dialog"
        aria-modal="true"
        aria-label={`${labels.dialog}: ${item.name}`}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className="item-dialog__bar">
          <p className="item-dialog__position text-label-m" aria-live="polite">
            {labels.position(index + 1, total)}
          </p>
          <Button
            variant="secondary"
            size="m"
            onClick={onClose}
            aria-label={labels.closeLabel}
            className="item-dialog__close"
          >
            {labels.close}
          </Button>
        </div>
        <ItemDetail item={item} headingLevel={2} />
        <div className="item-dialog__nav">
          <Button
            variant="secondary"
            size="m"
            onClick={onPrevious}
            disabled={!onPrevious}
            aria-label={labels.previousLabel}
          >
            {labels.previous}
          </Button>
          <Button
            variant="secondary"
            size="m"
            onClick={onNext}
            disabled={!onNext}
            aria-label={labels.nextLabel}
          >
            {labels.next}
          </Button>
        </div>
      </div>
    </div>
  );
}
