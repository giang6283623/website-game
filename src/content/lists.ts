// Chữ trạng thái danh sách (ListState). Nguồn: CONTENT-COPY.md mục 7. Chữ hoa do CSS làm.
export type ListCopy = {
  emptyTitle: string;
  emptyMessage: string;
  emptyAction: string;
  loadingTitle: string;
  loadingMessage: string;
  errorTitle: string;
  errorMessage: string;
  errorAction: string;
};

const ERROR_MESSAGE = "Kết nối bị gián đoạn. Thử lại sau vài giây.";

export const LIST_COPY = {
  news: {
    emptyTitle: "Chưa có tin",
    emptyMessage: "Mục này chưa có bài viết. Quay lại sau hoặc xem mục khác.",
    emptyAction: "Xem tất cả tin",
    loadingTitle: "Đang tải tin",
    loadingMessage: "Chờ một chút, tin mới đang về.",
    errorTitle: "Không tải được tin",
    errorMessage: ERROR_MESSAGE,
    errorAction: "Thử lại",
  },
  items: {
    emptyTitle: "Không tìm thấy vật phẩm",
    emptyMessage: "Không có vật phẩm khớp với bộ lọc. Thử từ khóa khác hoặc xóa bộ lọc.",
    emptyAction: "Xóa bộ lọc",
    loadingTitle: "Đang tải kho đồ",
    loadingMessage: "Chờ một chút, vật phẩm đang về.",
    errorTitle: "Không tải được kho đồ",
    errorMessage: ERROR_MESSAGE,
    errorAction: "Thử lại",
  },
  download: {
    emptyTitle: "Chưa có bộ cài",
    emptyMessage: "Bộ cài đang được cập nhật. Quay lại sau hoặc nhắn kênh hỗ trợ ở cuối trang.",
    emptyAction: "Xem hướng dẫn",
    loadingTitle: "Đang tải thông tin bộ cài",
    loadingMessage: "Chờ một chút, bộ cài đang về.",
    errorTitle: "Không tải được thông tin bộ cài",
    errorMessage: ERROR_MESSAGE,
    errorAction: "Thử lại",
  },
  ranking: {
    emptyTitle: "Không có người chơi này",
    emptyMessage: "Không tìm thấy tên này trong bảng xếp hạng. Kiểm tra lại chính tả.",
    emptyAction: "Xóa từ khóa",
    loadingTitle: "Đang tải xếp hạng",
    loadingMessage: "Chờ một chút, số liệu đang về.",
    errorTitle: "Không tải được xếp hạng",
    errorMessage: ERROR_MESSAGE,
    errorAction: "Thử lại",
  },
  // Chữ tự soạn cho bảng gia tộc (bản vẽ chỉ có chữ "KHÔNG CÓ NGƯỜI CHƠI NÀY").
  rankingClans: {
    emptyTitle: "Không có gia tộc này",
    emptyMessage: "Không tìm thấy tên này trong bảng xếp hạng gia tộc. Kiểm tra lại chính tả.",
    emptyAction: "Xóa từ khóa",
    loadingTitle: "Đang tải xếp hạng",
    loadingMessage: "Chờ một chút, số liệu đang về.",
    errorTitle: "Không tải được xếp hạng",
    errorMessage: ERROR_MESSAGE,
    errorAction: "Thử lại",
  },
  // Nhân vật rỗng: chữ chủ dự án chốt ngày 29/10/2026 (CONTENT-COPY.md mục 7, A-23).
  profile: {
    emptyTitle: "Chưa có nhân vật",
    emptyMessage: "Nhân vật được tạo khi bạn vào game lần đầu. Tải game và đăng nhập để bắt đầu.",
    emptyAction: "Tải game",
    loadingTitle: "Đang tải hồ sơ",
    loadingMessage: "Chờ một chút, hồ sơ đang về.",
    errorTitle: "Không tải được hồ sơ",
    errorMessage: ERROR_MESSAGE,
    errorAction: "Thử lại",
  },
} as const satisfies Record<string, ListCopy>;
