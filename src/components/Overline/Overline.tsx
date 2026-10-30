import type { ReactNode } from "react";
import { cn } from "../../lib/cn.ts";
import "./Overline.css";

/**
 * Nhãn nhỏ đứng trên tiêu đề: thanh cam và chữ cam (ví dụ "01 · BẮT ĐẦU").
 * Cỡ "l" theo bản vẽ: điện thoại dùng chữ label-m và thanh 24 x 3, máy tính dùng chữ label-l và thanh 32 x 3.
 * Cỡ "m" luôn dùng chữ label-m và thanh 24 x 3.
 */
export function Overline({
  children,
  size = "l",
  className,
}: {
  children: ReactNode;
  size?: "l" | "m";
  className?: string;
}) {
  return (
    <p className={cn("overline", "text-label-m", size === "l" && "overline--l", className)}>
      <span className="overline__bar" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
