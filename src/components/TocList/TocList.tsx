import { Link } from "react-router";
import { cn } from "../../lib/cn.ts";
import "./TocList.css";

export interface TocItem {
  /** Mã neo, không có dấu `#`. */
  id: string;
  label: string;
}

/**
 * Mục lục bên trái (COMPONENTS.md, TocList): nhãn và các liên kết neo cao 47, ngăn bằng đường kẻ.
 * Mục đang đọc có chữ màu nhấn và `aria-current="location"`.
 */
export function TocList({
  label,
  ariaLabel,
  items,
  activeId,
  className,
}: {
  label: string;
  ariaLabel: string;
  items: readonly TocItem[];
  activeId: string;
  className?: string;
}) {
  return (
    <nav className={cn("toc-list", className)} aria-label={ariaLabel}>
      <p className="toc-list__label text-label-m" aria-hidden="true">
        {label}
      </p>
      <ol className="toc-list__items">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={{ hash: `#${item.id}` }}
              className="toc-list__link text-label-m"
              aria-current={item.id === activeId ? "location" : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
