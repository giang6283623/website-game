import { cn } from "../../lib/cn.ts";
import { Breadcrumbs, type Crumb } from "../Breadcrumbs/Breadcrumbs.tsx";
import "./PageTitle.css";

export type { Crumb };

/**
 * Đầu trang con: đường dẫn, tiêu đề H1 và đoạn dẫn (COMPONENTS.md mục 15).
 * Mục cuối của đường dẫn là `aria-current="page"` và không là liên kết.
 */
export function PageTitle({
  crumbs,
  crumbsLabel = "Đường dẫn",
  title,
  lead,
  id,
  compactOnMobile = false,
  art = "generic",
  className,
}: {
  crumbs: readonly Crumb[];
  crumbsLabel?: string;
  title: string;
  lead?: string;
  id?: string;
  /** Tiêu đề dài: điện thoại dùng cỡ chữ vừa (display-m) để vừa một dòng. Máy tính vẫn cỡ lớn. */
  compactOnMobile?: boolean;
  /** Ảnh nền của dải tiêu đề. Thiếu ảnh (bản clone) thì dải giữ nền phẳng. */
  art?: "generic" | "news" | "items" | "ranking";
  className?: string;
}) {
  return (
    <header
      className={cn("page-title", "pattern-cross--large", `page-title--art-${art}`, className)}
    >
      <Breadcrumbs crumbs={crumbs} label={crumbsLabel} />
      <h1
        id={id}
        className={cn(
          "page-title__title",
          "text-display-l",
          compactOnMobile && "page-title__title--compact",
        )}
      >
        {title}
      </h1>
      {lead ? <p className="page-title__lead">{lead}</p> : null}
    </header>
  );
}
