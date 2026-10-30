import { cn } from "../../lib/cn.ts";
import { sanitizeHtml } from "../../lib/sanitize.ts";
import "./Prose.css";

/**
 * Nội dung bài do quản trị soạn (HTML đã làm sạch). Giao diện làm sạch thêm một lần bằng danh sách cho phép
 * (đoạn, tiêu đề cấp 2 và 3, danh sách, liên kết, ảnh, in đậm, in nghiêng).
 */
export function Prose({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn("prose", className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML đã qua sanitizeHtml (danh sách thẻ cho phép)
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
