import { Link } from "react-router";
import { SHARED_COPY } from "../../content/shared.ts";
import { cn } from "../../lib/cn.ts";
import "./Wordmark.css";

/** Nhận diện thương hiệu, dẫn về trang chủ. Cỡ L cho máy tính và chân trang, cỡ S cho điện thoại. Chữ là văn bản thật. */
export function Wordmark({ size = "l", className }: { size?: "l" | "s"; className?: string }) {
  return (
    <Link
      to="/"
      aria-label={SHARED_COPY.homeLabel}
      className={cn("wordmark", `wordmark--${size}`, className)}
    >
      <span className={cn("wordmark__name", size === "l" ? "text-display-m" : "text-wordmark-s")}>
        Infestation
      </span>
      <span className="wordmark__sub">
        <span className="wordmark__bar" aria-hidden="true" />
        <span className={cn("wordmark__label", size === "l" ? "text-label-l" : "text-label-m")}>
          Việt Nam
        </span>
      </span>
    </Link>
  );
}
