import type { ReactNode } from "react";
import { cn } from "../../lib/cn.ts";
import "./Tag.css";

/** Tên theo nghĩa nội dung: news (TIN TỨC), guide (HƯỚNG DẪN, cũng dùng cho nhãn trạng thái), event (SỰ KIỆN), new (CẬP NHẬT). */
export type TagVariant = "news" | "guide" | "event" | "new";

export function Tag({
  variant,
  className,
  children,
}: {
  variant: TagVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cn("tag", `tag--${variant}`, "text-label-m", className)}>{children}</span>
  );
}

/** Ánh xạ khóa loại bài viết sang kiểu Tag (CONTENT-COPY.md mục 4.1). */
export const CATEGORY_TAG: Record<string, TagVariant> = {
  "tin-tuc": "news",
  "huong-dan": "guide",
  "su-kien": "event",
  "cap-nhat": "new",
};
