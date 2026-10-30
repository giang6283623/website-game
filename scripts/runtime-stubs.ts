// Nạp trước khi chạy script dựng sẵn HTML bằng Bun trực tiếp (không qua bộ dựng).
// Tệp CSS import trong thành phần không cần khi dựng chuỗi HTML, nên trả về module rỗng.
import { plugin } from "bun";

plugin({
  name: "ignore-css",
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, () => ({ contents: "export default {};", loader: "js" }));
  },
});
