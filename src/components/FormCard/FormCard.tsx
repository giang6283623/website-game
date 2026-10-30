import type { ReactNode } from "react";
import { cn } from "../../lib/cn.ts";
import "./FormCard.css";

/**
 * Khung biểu mẫu và thông báo xác thực (FormCard, COMPONENTS.md). Trên cùng là thước.
 * Máy tính rộng 520 với thân đệm 40. Điện thoại rộng 350 với thân đệm 24.
 * Tiêu đề là H1 của trang (điện thoại dùng cỡ H2 theo bản vẽ).
 */
export function FormCard({
  title,
  headingLevel = 1,
  largeTitle = false,
  children,
  className,
}: {
  /** Bỏ trống khi trang đã có H1 riêng (ví dụ Đổi mật khẩu). */
  title?: string;
  headingLevel?: 1 | 2;
  /** Điện thoại dùng cỡ chữ H1 (Quên và Đặt lại mật khẩu). Mặc định điện thoại dùng cỡ H2. */
  largeTitle?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const Heading = `h${headingLevel}` as const;
  return (
    <section className={cn("form-card", largeTitle && "form-card--large-title", className)}>
      <div className="form-card__ruler pattern-ruler" aria-hidden="true" />
      <div className="form-card__body">
        {title ? <Heading className="form-card__title text-heading-h2">{title}</Heading> : null}
        {children}
      </div>
    </section>
  );
}
