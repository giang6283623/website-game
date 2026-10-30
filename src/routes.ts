// Bảng đường dẫn: một nơi duy nhất cho tiêu đề, mô tả, quyền lập chỉ mục và kiểu khung trang.
// Dùng chung cho router, khung trang, SEO trên trình duyệt và bước dựng HTML lúc build.
// Nguồn: ROUTES-AND-DATA.md mục 2 và 5. Mô tả (description) do nhóm code soạn, chờ chủ dự án duyệt.
import { matchPath } from "react-router";

export const SITE_NAME = "Infestation Việt Nam";

export type NavKey = "home" | "news" | "items" | "ranking" | "profile";

/** public: đầu trang, thanh trạng thái, chân trang. auth: khung xác thực. admin: khung quản trị. error: như public nhưng không sáng mục nào. */
export type Chrome = "public" | "auth" | "admin" | "error";

export type RouteMeta = {
  /** Mẫu đường dẫn của router, ví dụ "/tin-tuc/:slug". */
  path: string;
  title: string;
  description: string;
  nav: NavKey | null;
  chrome: Chrome;
  /** Cho công cụ tìm kiếm lập chỉ mục. Trang riêng tư gắn noindex. */
  index: boolean;
  /** Dựng sẵn thành HTML lúc build. Chỉ trang công khai có địa chỉ cố định. */
  prerender: boolean;
};

const DEFAULT_DESCRIPTION =
  "Infestation Việt Nam là máy chủ sinh tồn tiếng Việt. Tạo tài khoản, tải game, lập gia tộc và sống sót cùng nhau.";

function privatePage(
  path: string,
  name: string,
  chrome: Chrome,
  nav: NavKey | null = null,
): RouteMeta {
  return {
    path,
    title: `${name} | ${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
    nav,
    chrome,
    index: false,
    prerender: false,
  };
}

export const ROUTES: readonly RouteMeta[] = [
  {
    path: "/",
    title: `${SITE_NAME} | Máy chủ sinh tồn tiếng Việt`,
    description:
      "Infestation Việt Nam là máy chủ sinh tồn tiếng Việt. Tạo tài khoản, tải game, lập gia tộc, theo dõi tin tức, kho đồ và bảng xếp hạng.",
    nav: "home",
    chrome: "public",
    index: true,
    prerender: true,
  },
  {
    path: "/tin-tuc",
    title: `Tin tức | ${SITE_NAME}`,
    description:
      "Tin tức, hướng dẫn, sự kiện và bản cập nhật mới nhất của máy chủ Infestation Việt Nam. Đọc để nắm kịp mọi thay đổi trước khi vào game.",
    nav: "news",
    chrome: "public",
    index: true,
    prerender: true,
  },
  {
    path: "/tin-tuc/:slug",
    title: `Tin tức | ${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
    nav: "news",
    chrome: "public",
    index: true,
    prerender: false,
  },
  {
    path: "/kho-do",
    title: `Kho đồ | ${SITE_NAME}`,
    description:
      "Xem toàn bộ vật phẩm trong game: vũ khí, giáp và ba lô, y tế và đồ ăn, dụng cụ, vật liệu, thuốc nổ và đạn. Lọc theo nhóm, tìm theo tên.",
    nav: "items",
    chrome: "public",
    index: true,
    prerender: true,
  },
  {
    path: "/kho-do/:slug",
    title: `Kho đồ | ${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
    nav: "items",
    chrome: "public",
    index: true,
    prerender: false,
  },
  {
    path: "/xep-hang",
    title: `Xếp hạng | ${SITE_NAME}`,
    description:
      "Bảng xếp hạng của máy chủ Infestation Việt Nam theo GameDollar, XP và gia tộc. Tìm người chơi và xem vị trí của bạn trên bảng.",
    nav: "ranking",
    chrome: "public",
    index: true,
    prerender: true,
  },
  {
    path: "/tai-game",
    title: `Tải game | ${SITE_NAME}`,
    description:
      "Tải game cho máy chủ Infestation Việt Nam, xem cấu hình tối thiểu và làm theo ba bước cài đặt để vào game chỉ trong vài phút.",
    nav: null,
    chrome: "public",
    index: true,
    prerender: true,
  },
  {
    path: "/quy-tac",
    title: `Quy tắc cộng đồng | ${SITE_NAME}`,
    description:
      "Quy tắc cộng đồng của máy chủ Infestation Việt Nam. Đọc kỹ để chơi công bằng, tôn trọng người khác và tránh bị khóa tài khoản.",
    nav: null,
    chrome: "public",
    index: true,
    prerender: true,
  },
  privatePage("/dang-nhap", "Đăng nhập", "auth"),
  privatePage("/dang-ky", "Đăng ký", "auth"),
  privatePage("/quen-mat-khau", "Quên mật khẩu", "auth"),
  privatePage("/dat-lai-mat-khau", "Đặt lại mật khẩu", "auth"),
  privatePage("/ho-so", "Hồ sơ", "public", "profile"),
  privatePage("/ho-so/doi-mat-khau", "Đổi mật khẩu", "public", "profile"),
  privatePage("/quan-tri", "Quản trị", "admin"),
  privatePage("/quan-tri/bai-viet", "Quản trị bài viết", "admin"),
  privatePage("/quan-tri/bai-viet/moi", "Soạn bài mới", "admin"),
  privatePage("/quan-tri/bai-viet/:id", "Sửa bài viết", "admin"),
  privatePage("/quan-tri/vat-pham", "Quản trị vật phẩm", "admin"),
  privatePage("/quan-tri/vat-pham/moi", "Thêm vật phẩm", "admin"),
  privatePage("/quan-tri/vat-pham/:id", "Sửa vật phẩm", "admin"),
  privatePage("/quan-tri/banner", "Quản trị banner", "admin"),
  privatePage("/quan-tri/nguoi-dung", "Quản trị người dùng", "admin"),
  privatePage("/quan-tri/nguoi-dung/:id", "Chi tiết người dùng", "admin"),
  privatePage("/quan-tri/nhat-ky", "Nhật ký quản trị", "admin"),
];

/** Trang 404 dùng khi không có mẫu nào khớp. Không lập chỉ mục. */
export const NOT_FOUND_ROUTE: RouteMeta = {
  path: "*",
  title: `Không tìm thấy trang | ${SITE_NAME}`,
  description: DEFAULT_DESCRIPTION,
  nav: null,
  chrome: "error",
  index: false,
  prerender: false,
};

export const SERVER_ERROR_ROUTE: RouteMeta = {
  ...NOT_FOUND_ROUTE,
  title: `Máy chủ đang gặp sự cố | ${SITE_NAME}`,
};

/** Tìm mẫu đường dẫn khớp. Không khớp thì trả về trang 404. */
export function matchRoute(pathname: string): RouteMeta {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return (
    ROUTES.find((route) => matchPath({ path: route.path, end: true }, clean)) ?? NOT_FOUND_ROUTE
  );
}

/** Danh sách đường dẫn dựng sẵn thành HTML lúc build. */
export function prerenderPaths(): string[] {
  return ROUTES.filter((route) => route.prerender).map((route) => route.path);
}
