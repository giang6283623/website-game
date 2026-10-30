// Dựng sẵn HTML của một đường dẫn và in ra màn hình. Dùng trong kiểm thử (tests/shell.test.tsx):
//   bun run --preload ./scripts/runtime-stubs.ts scripts/render-path.tsx /kho-do
// Chạy ở tiến trình riêng vì máy dựng chuỗi (Fizz) của React để lại trạng thái làm hỏng bài kiểm thử vẽ trên trình duyệt giả trong cùng tiến trình.
import { renderApp } from "../src/entry-server.tsx";

const path = process.argv[2] ?? "/";
process.stdout.write(await renderApp(path));
