// Dựng sẵn HTML của một đường dẫn (E0-S8). Chạy bằng Bun trong scripts/prerender.tsx, không đi vào gói của trình duyệt.
import { prerender } from "react-dom/static";
import { StaticRouter } from "react-router";
import { App } from "./App.tsx";

/**
 * Ngưỡng (byte) để React tách một khối nội dung ra khỏi HTML chính. Mặc định là 12800 byte.
 * Trang chủ và trang Tải game vượt ngưỡng đó, nên React giấu khối giữa trong `<div hidden>` và chỉ mở lại bằng
 * một script nhúng. Khi tắt JavaScript, phần giữa trang bị trống (C-120). Đặt ngưỡng lớn hơn mọi trang
 * thì nội dung nằm thẳng trong HTML và hai script nhúng của React biến mất.
 */
const INLINE_CHUNK_BYTES = 1_000_000;

/** `prerender` chờ mọi trang nạp lười xong rồi mới trả kết quả, nên chuỗi HTML đầy đủ nội dung, không còn khung chờ. */
export async function renderApp(url: string): Promise<string> {
  const { prelude } = await prerender(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
    { progressiveChunkSize: INLINE_CHUNK_BYTES },
  );
  return new Response(prelude).text();
}
