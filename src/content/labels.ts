// Nhãn dùng chung cho nhiều trang. Nguồn: CONTENT-COPY.md mục 4. Chữ hoa do CSS làm.
import type { ItemGroupKey, NewsCategoryKey } from "../api/schemas.ts";

export const NEWS_CATEGORY_LABEL: Record<NewsCategoryKey, string> = {
  "tin-tuc": "Tin tức",
  "huong-dan": "Hướng dẫn",
  "su-kien": "Sự kiện",
  "cap-nhat": "Cập nhật",
};

/** Tên nhóm vật phẩm khi API chưa trả danh sách nhóm (đang tải hoặc lỗi). Số lượng chỉ hiện khi có từ API. */
export const ITEM_GROUP_LABEL: Record<ItemGroupKey, string> = {
  "vu-khi": "Vũ khí",
  "giap-va-ba-lo": "Giáp và ba lô",
  "y-te-va-do-an": "Y tế và đồ ăn",
  "dung-cu": "Dụng cụ",
  "vat-lieu": "Vật liệu",
  "thuoc-no": "Thuốc nổ",
  dan: "Đạn",
  "nhan-vat": "Nhân vật",
  "cong-thuc": "Công thức",
};
