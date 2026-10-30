// Dựng sẵn HTML của một đường dẫn (E0-S8). Chạy bằng Bun trong scripts/prerender.tsx, không đi vào gói của trình duyệt.
import { prerender } from "react-dom/static";
import { StaticRouter } from "react-router";
import { App } from "./App.tsx";

/** `prerender` chờ mọi trang nạp lười xong rồi mới trả kết quả, nên chuỗi HTML đầy đủ nội dung, không còn khung chờ. */
export async function renderApp(url: string): Promise<string> {
  const { prelude } = await prerender(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
  return new Response(prelude).text();
}
