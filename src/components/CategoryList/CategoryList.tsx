import { Link } from "react-router";
import { ITEM_GROUP_KEYS, type ItemGroupCount, type ItemGroupKey } from "../../api/schemas.ts";
import { ITEM_GROUP_LABEL } from "../../content/labels.ts";
import { cn } from "../../lib/cn.ts";
import { formatCount } from "../../lib/format.ts";
import "./CategoryList.css";

/**
 * Danh sách loại vật phẩm. Máy tính: cột bên có số lượng (Category). Điện thoại: hàng chip cuộn ngang, không có số.
 * Một cấu trúc cho cả hai cỡ. Mỗi mục là liên kết, mục đang chọn có aria-current.
 * Chưa có số lượng từ API (đang tải hoặc lỗi) thì vẫn hiện tên nhóm, chỉ bỏ số.
 */
export function CategoryList({
  groups,
  selected,
  hrefFor,
  allLabel,
  label,
  className,
}: {
  groups: readonly ItemGroupCount[] | null;
  selected: ItemGroupKey | null;
  hrefFor: (key: ItemGroupKey | null) => string;
  allLabel: string;
  label: string;
  className?: string;
}) {
  const total = groups ? groups.reduce((sum, group) => sum + group.count, 0) : null;
  const entries = [
    { key: null, label: allLabel, count: total },
    ...ITEM_GROUP_KEYS.map((key) => {
      const found = groups?.find((group) => group.key === key);
      return { key, label: found?.label ?? ITEM_GROUP_LABEL[key], count: found?.count ?? null };
    }),
    // Nhóm không có vật phẩm nào thì không hiện, để bấm vào không ra danh sách rỗng (C-75).
  ].filter((entry) => entry.key === null || entry.count !== 0);
  return (
    <nav className={cn("category-list", className)} aria-label={label}>
      <p className="category-list__label text-label-m" aria-hidden="true">
        {label}
      </p>
      <ul className="category-list__list">
        {entries.map((entry) => {
          const current = entry.key === selected;
          return (
            <li key={entry.key ?? "all"} className="category-list__item">
              <Link
                className={cn("category", "text-label-l", current && "category--selected")}
                to={hrefFor(entry.key)}
                aria-current={current ? "true" : undefined}
              >
                <span className="category__name">{entry.label}</span>
                {entry.count !== null ? (
                  <span className="category__count text-data-m">{formatCount(entry.count)}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
