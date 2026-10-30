import type { ReactNode } from "react";
import { cn } from "../../lib/cn.ts";
import "./Notice.css";

/**
 * Thông báo trong biểu mẫu và trang xác thực: viền trái 3 px, nhãn ngắn và một đoạn giải thích.
 * Lỗi dùng role alert, thành công dùng role status. Màu không là cách duy nhất báo loại: nhãn luôn có chữ.
 */
export function Notice({
  tone,
  label,
  children,
  className,
}: {
  tone: "error" | "success";
  label: string;
  /** Đoạn giải thích. Bỏ trống khi nhãn đã là cả câu. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("notice", `notice--${tone}`, className)}
      role={tone === "error" ? "alert" : "status"}
    >
      <p className="notice__label text-label-m">{label}</p>
      {children ? <p className="notice__text text-body-s">{children}</p> : null}
    </div>
  );
}
