import { cn } from "../../lib/cn.ts";
import { Action, type ActionProps } from "../internal/Action.tsx";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "l" | "m";

export type ButtonProps = ActionProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Giãn hết khung chứa (biểu mẫu và điện thoại). */
  fill?: boolean;
};

/** Mọi hành động. Primary cho hành động chính của khối, Secondary cho hành động phụ, Ghost cho liên kết nhẹ. */
export function Button({
  variant = "primary",
  size = "m",
  fill = false,
  className,
  ...rest
}: ButtonProps) {
  return (
    <Action
      {...rest}
      className={cn(
        "btn",
        `btn--${variant}`,
        `btn--${size}`,
        size === "l" ? "text-label-l" : "text-label-m",
        fill && "btn--fill",
        className,
      )}
    />
  );
}
