import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./App.tsx";

const container = document.getElementById("root");

if (container) {
  const tree = (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // Trang đã dựng sẵn HTML thì nối (hydrate) vào HTML có sẵn. HTML dựng sẵn không có chuỗi truy vấn,
  // nên địa chỉ có truy vấn (ví dụ /kho-do?loai=vu-khi) sẽ lệch HTML và phải vẽ mới. Trang rỗng (200.html) cũng vẽ mới.
  if (container.hasChildNodes() && !window.location.search) {
    hydrateRoot(container, tree);
  } else {
    container.replaceChildren();
    createRoot(container).render(tree);
  }
}
