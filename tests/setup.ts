// Chạy trước mọi bài kiểm thử: bật DOM giả (happy-dom) và bỏ qua tệp CSS khi nạp trong bun test.
import { afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { plugin } from "bun";

// Mọi bài kiểm thử gọi API giả, không gọi mạng thật.
process.env.API_MODE = "mock";

plugin({
  name: "ignore-css",
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, () => ({ contents: "export default {};", loader: "js" }));
  },
});

if (!("document" in globalThis)) {
  GlobalRegistrator.register({ url: "http://localhost/" });
}

// Dọn cây DOM sau mỗi bài để các bài không ảnh hưởng nhau.
const { cleanup } = await import("@testing-library/react");
afterEach(() => {
  cleanup();
  document.head.querySelectorAll("[data-head]").forEach((node) => {
    node.remove();
  });
});

// Nạp sẵn các trang nạp lười để bài kiểm thử không phải chờ gói trang.
await Promise.all([
  import("../src/pages/Home/Home.tsx"),
  import("../src/pages/Items/Items.tsx"),
  import("../src/pages/Ranking/Ranking.tsx"),
  import("../src/pages/Item/ItemPage.tsx"),
  import("../src/pages/News/News.tsx"),
  import("../src/pages/Article/Article.tsx"),
  import("../src/pages/Download/Download.tsx"),
  import("../src/pages/Rules/Rules.tsx"),
  import("../src/pages/Auth/Login.tsx"),
  import("../src/pages/Auth/Register.tsx"),
  import("../src/pages/Auth/Forgot.tsx"),
  import("../src/pages/Auth/Reset.tsx"),
  import("../src/pages/Profile/Profile.tsx"),
  import("../src/pages/Profile/ChangePassword.tsx"),
  import("../src/pages/Admin/AdminApp.tsx"),
]);
