import { cn } from "../../lib/cn.ts";
import { pauseOffscreenRef } from "../../lib/signal.ts";

/** `full` và `error`: năm lát. `soft`: ba lát, biên độ một nửa, cho tiêu đề trang. */
type Tone = "full" | "soft" | "error";

const SLICES: Record<Tone, readonly number[]> = {
  full: [1, 2, 3, 4, 5],
  soft: [1, 2, 3],
  error: [1, 2, 3, 4, 5],
};

const GHOSTS = ["a", "b"] as const;

/**
 * Chữ bị nhiễu xé (kiểu dáng ở `src/styles/motion.css`). Chữ thật giữ nguyên là nút văn bản cho trình đọc màn hình và bản tắt JavaScript.
 * Các lát và hai bóng màu đều rỗng, chỉ vẽ `data-text` bằng CSS, nên `textContent` không bị lặp chữ. Giảm chuyển động thì tất cả bị ẩn.
 */
export function GlitchText({
  text,
  tone = "full",
  className,
}: {
  text: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn("glitch-text", tone !== "full" && `glitch-text--${tone}`, className)}
      ref={pauseOffscreenRef}
    >
      <span className="glitch-text__real">{text}</span>
      {tone === "soft"
        ? null
        : GHOSTS.map((ghost) => (
            <span
              key={ghost}
              className={`glitch-text__ghost glitch-text__ghost--${ghost}`}
              data-text={text}
              aria-hidden="true"
            />
          ))}
      {SLICES[tone].map((slice) => (
        <span
          key={slice}
          className={`glitch-text__slice glitch-text__slice--${slice}`}
          data-text={text}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
