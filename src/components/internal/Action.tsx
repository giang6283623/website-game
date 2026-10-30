import type { AriaAttributes, MouseEventHandler, ReactNode } from "react";
import { Link } from "react-router";

export type ActionProps = {
  /** Đường dẫn nội bộ của ứng dụng (dùng router). */
  to?: string;
  /** Địa chỉ ngoài hoặc tệp tải về (dùng thẻ a thường). */
  href?: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLElement>;
  id?: string;
  title?: string;
  target?: string;
  rel?: string;
  download?: boolean | string;
  "data-testid"?: string;
} & Pick<
  AriaAttributes,
  | "aria-current"
  | "aria-pressed"
  | "aria-expanded"
  | "aria-haspopup"
  | "aria-label"
  | "aria-controls"
  | "aria-describedby"
>;

/**
 * Phần tử bấm được theo đúng vai trò: liên kết khi điều hướng, nút khi gửi biểu mẫu hoặc đổi trạng thái.
 * Trạng thái khóa dùng `disabled` cho nút và `aria-disabled` cho liên kết (COMPONENTS.md mục 1).
 */
export function Action({
  to,
  href,
  disabled,
  className,
  children,
  type,
  onClick,
  ...rest
}: ActionProps) {
  if (to !== undefined || href !== undefined) {
    if (disabled) {
      return (
        <a className={className} aria-disabled="true" {...rest}>
          {children}
        </a>
      );
    }
    if (to !== undefined) {
      return (
        <Link className={className} to={to} onClick={onClick} {...rest}>
          {children}
        </Link>
      );
    }
    return (
      <a className={className} href={href} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button
      className={className}
      type={type ?? "button"}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
