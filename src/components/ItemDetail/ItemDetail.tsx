import type { Item } from "../../api/schemas.ts";
import { assetUrl } from "../../lib/assets.ts";
import { cn } from "../../lib/cn.ts";
import { CornerMarks } from "../CornerMarks/CornerMarks.tsx";
import "./ItemDetail.css";

/**
 * Khối chi tiết vật phẩm (Detail, COMPONENTS.md). Dùng ở Kho đồ (máy tính) và ở trang `/kho-do/:slug`.
 * Máy tính: khung có nền, ảnh bên trái, chữ bên phải. Điện thoại: không có khung ngoài, ảnh trên (cao 212, dấu góc trên trái và dưới phải), chữ dưới, chỉ số lưới 2 x 2.
 * Vật phẩm thiếu mô tả hoặc chỉ số thì ẩn phần đó. Không có chỉ số chi tiết thì hiện dòng tóm tắt `statLine`.
 */
export function ItemDetail({
  item,
  badge,
  headingLevel = 2,
  className,
}: {
  item: Item;
  /** Nhãn nhỏ "ĐANG XEM" ở góc ảnh. Chỉ dùng trong Kho đồ. */
  badge?: string;
  headingLevel?: 1 | 2 | 3;
  className?: string;
}) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article className={cn("item-detail", className)}>
      <div className="item-detail__visual pattern-cross">
        {item.imageKey ? (
          <img
            className="item-detail__image"
            src={assetUrl(item.imageKey)}
            alt={item.name}
            width="360"
            height="220"
            decoding="async"
          />
        ) : null}{" "}
        {item.hudKey ? (
          <img
            className="item-detail__hud"
            src={assetUrl(item.hudKey)}
            alt=""
            width="206"
            height="60"
            loading="lazy"
            decoding="async"
          />
        ) : null}
        <CornerMarks
          className="only-desktop"
          length={20}
          inset={12}
          color="var(--color-border-bold)"
          placement="bottom"
        />
        <CornerMarks
          className="only-mobile"
          length={28}
          inset={8}
          color="var(--color-border-bold)"
        />
        {badge ? (
          <span className="item-detail__badge text-label-m" aria-hidden="true">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="item-detail__text">
        <p className="item-detail__type text-label-m">{item.typeLabel}</p>
        <Heading className="item-detail__name text-heading-h1">{item.name}</Heading>
        {item.description ? (
          <p className="item-detail__description text-body-m">{item.description}</p>
        ) : null}
        {item.stats.length > 0 ? (
          <dl className="item-detail__stats">
            {item.stats.map((stat) => (
              <div key={stat.label} className="item-detail__stat">
                <dt className="item-detail__stat-label text-label-m">{stat.label}</dt>
                <dd className="item-detail__stat-value text-data-l">{stat.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="item-detail__summary text-data-m">{item.statLine}</p>
        )}
      </div>
    </article>
  );
}
