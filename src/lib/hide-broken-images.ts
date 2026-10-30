import { GAME_ASSET_BASE } from "./assets.ts";

/** Dấu gắn lên hình game không tải được. Quy tắc `img[data-broken]` trong global.css ẩn hình đó. */
export const BROKEN_ATTRIBUTE = "data-broken";

function isGameImage(node: EventTarget | null): node is HTMLImageElement {
  return (
    node instanceof HTMLImageElement && (node.getAttribute("src") ?? "").startsWith(GAME_ASSET_BASE)
  );
}

/**
 * Ẩn biểu tượng hình hỏng của hình game (mọi `img` có địa chỉ dưới /assets/game/).
 * Bản clone không có thư mục hình, nên trình duyệt sẽ vẽ biểu tượng hình hỏng. Hàm này chỉ ẩn hình, khung vẫn giữ chỗ.
 * Sự kiện lỗi không nổi lên cha, nên nghe ở pha bắt (capture) trên cả tài liệu.
 * HTML dựng sẵn tải hình trước khi React chạy, sự kiện lỗi đã xảy ra rồi, nên quét một lần lúc bắt đầu.
 * Hình tải lại thành công (ví dụ đổi vật phẩm) thì gỡ dấu. Trả về hàm gỡ bộ nghe.
 */
export function hideBrokenGameImages(doc: Document): () => void {
  const onError = (event: Event) => {
    if (isGameImage(event.target)) event.target.setAttribute(BROKEN_ATTRIBUTE, "");
  };
  // Gỡ dấu cho mọi img, kể cả khi hình đổi sang địa chỉ không phải hình game, để không ẩn nhầm hình tốt.
  const onLoad = (event: Event) => {
    if (event.target instanceof HTMLImageElement) event.target.removeAttribute(BROKEN_ATTRIBUTE);
  };
  doc.addEventListener("error", onError, true);
  doc.addEventListener("load", onLoad, true);
  for (const image of doc.querySelectorAll("img")) {
    if (isGameImage(image) && image.complete && image.naturalWidth === 0) {
      image.setAttribute(BROKEN_ATTRIBUTE, "");
    }
  }
  return () => {
    doc.removeEventListener("error", onError, true);
    doc.removeEventListener("load", onLoad, true);
  };
}
