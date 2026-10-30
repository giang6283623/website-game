import { Link } from "react-router";
import { cn } from "../../lib/cn.ts";
import "./Breadcrumbs.css";

/** `desktopOnly`: mục chỉ hiện từ 1200 px trở lên (bản vẽ điện thoại bỏ "Trang chủ" ở một số trang). */
export type Crumb = { label: string; to?: string; desktopOnly?: boolean };

/** Đường dẫn trang. Mục cuối là `aria-current="page"` và không là liên kết. */
export function Breadcrumbs({
  crumbs,
  label = "Đường dẫn",
  className,
}: {
  crumbs: readonly Crumb[];
  label?: string;
  className?: string;
}) {
  return (
    <nav aria-label={label}>
      <ol className={cn("breadcrumbs", "text-label-m", className)}>
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          return (
            <li
              key={crumb.label}
              className={cn("breadcrumbs__item", crumb.desktopOnly && "breadcrumbs__item--desktop")}
            >
              {last || !crumb.to ? (
                <span aria-current={last ? "page" : undefined}>{crumb.label}</span>
              ) : (
                <Link to={crumb.to}>{crumb.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
