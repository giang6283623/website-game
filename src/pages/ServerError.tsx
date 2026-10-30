import { CenterMessage } from "../components/CenterMessage/CenterMessage.tsx";
import { PAGE_COPY } from "../content/pages.ts";

/** Trang 500: không hiện chi tiết kỹ thuật. Nút THỬ LẠI gọi `onRetry` (vẽ lại phần bị lỗi). */
export function ServerError({ onRetry }: { onRetry: () => void }) {
  const copy = PAGE_COPY.serverError;
  return (
    <CenterMessage
      code={copy.code}
      title={copy.title}
      message={copy.message}
      actionLabel={copy.action}
      onAction={onRetry}
    />
  );
}
