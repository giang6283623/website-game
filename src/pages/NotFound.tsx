import { CenterMessage } from "../components/CenterMessage/CenterMessage.tsx";
import { PAGE_COPY } from "../content/pages.ts";

/** Trang 404: đường dẫn không có trong bảng. Bản dựng tĩnh cũng ghi tệp 404.html từ trang này. */
export function NotFound() {
  const copy = PAGE_COPY.notFound;
  return (
    <CenterMessage
      code={copy.code}
      title={copy.title}
      message={copy.message}
      actionLabel={copy.action}
      actionTo="/"
    />
  );
}
