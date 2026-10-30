import { cn } from "../../lib/cn.ts";
import { Action, type ActionProps } from "../internal/Action.tsx";
import "./Chip.css";

export type ChipProps = Omit<ActionProps, "aria-pressed" | "aria-current"> & {
  /** Chip đang chọn (Selected). Liên kết nhận aria-current, nút nhận aria-pressed. */
  selected?: boolean;
};

/** Bộ lọc, nút phân trang, nút bật tắt, công cụ soạn. Cao 46, chữ Label/L. */
export function Chip({ selected = false, className, ...rest }: ChipProps) {
  const isLink = rest.to !== undefined || rest.href !== undefined;
  const state = isLink
    ? { "aria-current": selected ? ("page" as const) : undefined }
    : { "aria-pressed": selected };
  return (
    <Action
      {...rest}
      {...state}
      className={cn("chip", "text-label-l", selected && "chip--selected", className)}
    />
  );
}
