import { cn } from "../../lib/cn.ts";
import { Chip } from "../Chip/Chip.tsx";
import "./Pagination.css";

export type PageEntry = { kind: "page"; page: number } | { kind: "gap"; after: number };

/** Dãy số trang rút gọn: luôn có trang đầu, trang cuối và các trang sát trang hiện tại. Dưới 8 trang thì hiện hết. */
export function pageEntries(page: number, totalPages: number): PageEntry[] {
  const wanted =
    totalPages <= 7
      ? Array.from({ length: totalPages }, (_, index) => index + 1)
      : [...new Set([1, page - 1, page, page + 1, totalPages])]
          .filter((value) => value >= 1 && value <= totalPages)
          .sort((a, b) => a - b);
  const entries: PageEntry[] = [];
  let previous = 0;
  for (const value of wanted) {
    if (previous > 0 && value - previous > 1) entries.push({ kind: "gap", after: previous });
    entries.push({ kind: "page", page: value });
    previous = value;
  }
  return entries;
}

/**
 * Phân trang bằng hàng Chip (COMPONENTS.md, Pagination): TRƯỚC, số trang, SAU.
 * Mỗi nút là liên kết có địa chỉ riêng nên chia sẻ và tải lại đều giữ đúng trang.
 * Ít hơn hai trang thì không vẽ gì.
 */
export function Pagination({
  page,
  totalPages,
  hrefFor,
  label = "Phân trang",
  previousLabel = "Trước",
  nextLabel = "Sau",
  className,
}: {
  page: number;
  totalPages: number;
  /** Trả địa chỉ (có thể kèm truy vấn) của một trang. */
  hrefFor: (page: number) => string;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
}) {
  if (totalPages <= 1) return null;
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;
  return (
    <nav className={cn("pagination", className)} aria-label={label}>
      <ul className="pagination__list">
        <li>
          {hasPrevious ? (
            <Chip to={hrefFor(page - 1)}>{previousLabel}</Chip>
          ) : (
            <Chip disabled>{previousLabel}</Chip>
          )}
        </li>
        {pageEntries(page, totalPages).map((entry) =>
          entry.kind === "page" ? (
            <li key={entry.page}>
              <Chip
                to={hrefFor(entry.page)}
                selected={entry.page === page}
                aria-label={`Trang ${entry.page}`}
              >
                {entry.page}
              </Chip>
            </li>
          ) : (
            <li
              key={`gap-${entry.after}`}
              className="pagination__gap text-label-l"
              aria-hidden="true"
            >
              ...
            </li>
          ),
        )}
        <li>
          {hasNext ? (
            <Chip to={hrefFor(page + 1)}>{nextLabel}</Chip>
          ) : (
            <Chip disabled>{nextLabel}</Chip>
          )}
        </li>
      </ul>
    </nav>
  );
}
