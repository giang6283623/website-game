import type { CSSProperties } from "react";
import { cn } from "../../lib/cn.ts";
import "./CornerMarks.css";

/**
 * Hai dấu góc trang trí (trên trái, dưới phải) cho khay hình, Locker, thẻ tin nổi bật và khung CTA.
 * Đặt trong phần tử có position: relative. Chỉ để trang trí nên ẩn khỏi trình đọc màn hình.
 */
export function CornerMarks({
  length = 28,
  inset = 12,
  color = "var(--color-border-bold)",
  placement = "diagonal",
  className,
}: {
  length?: number;
  inset?: number;
  color?: string;
  /** "diagonal": trên trái và dưới phải. "bottom": dưới trái và dưới phải (khối Detail). */
  placement?: "diagonal" | "bottom";
  className?: string;
}) {
  const style = {
    "--corner-length": `${length}px`,
    "--corner-inset": `${inset}px`,
    "--corner-color": color,
  } as CSSProperties;
  return (
    <span
      className={cn("corner-marks", placement === "bottom" && "corner-marks--bottom", className)}
      style={style}
      aria-hidden="true"
    >
      <span className="corner-marks__tl" />
      <span className="corner-marks__br" />
    </span>
  );
}
