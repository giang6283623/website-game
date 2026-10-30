import type { MouseEventHandler } from "react";
import { Link } from "react-router";
import type { Item } from "../../api/schemas.ts";
import { assetUrl } from "../../lib/assets.ts";
import { cn } from "../../lib/cn.ts";
import { CornerMarks } from "../CornerMarks/CornerMarks.tsx";
import "./ItemSlot.css";

/**
 * Thẻ vật phẩm. Máy tính: 304 x 292 có dòng chỉ số. Điện thoại: thẻ nhỏ không có dòng chỉ số (MiniSlot).
 * Đang chọn: vòng cam 2 px và nhãn "ĐANG XEM". Nhãn chỉ là hình ảnh, thẻ mang aria-current.
 * Khóa (Figma `State=Disabled`): hình mờ 40 phần trăm, chữ `text/disabled`, không phải liên kết.
 */
export function ItemSlot({
  item,
  to,
  selected = false,
  disabled = false,
  onClick,
}: {
  item: Pick<Item, "name" | "typeLabel" | "statLine" | "imageKey">;
  to: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
}) {
  const body = (
    <>
      <span className="item-slot__plate pattern-cross">
        {item.imageKey ? (
          <img
            className="item-slot__image"
            src={assetUrl(item.imageKey)}
            alt={item.name}
            width="272"
            height="160"
            loading="lazy"
            decoding="async"
          />
        ) : null}
        <CornerMarks length={16} inset={12} color="var(--color-text-disabled)" />
        {selected && !disabled ? (
          <span className="item-slot__badge text-label-m" aria-hidden="true">
            Đang xem
          </span>
        ) : null}
      </span>
      <span className="item-slot__info">
        <span className="item-slot__type text-label-m">{item.typeLabel}</span>
        <span className="item-slot__name text-heading-h3">{item.name}</span>
        <span className="item-slot__stat text-data-m">{item.statLine}</span>
      </span>
    </>
  );
  if (disabled) {
    return (
      <li className="item-slot is-disabled">
        <span className="item-slot__link" aria-disabled="true">
          {body}
        </span>
      </li>
    );
  }
  return (
    <li className={cn("item-slot", selected && "is-selected")}>
      <Link
        className="item-slot__link"
        to={to}
        onClick={onClick}
        aria-current={selected ? "true" : undefined}
      >
        {body}
      </Link>
    </li>
  );
}
