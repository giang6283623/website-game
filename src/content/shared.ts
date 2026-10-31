// Chữ dùng chung của khung trang. Nguồn: CONTENT-COPY.md mục 2 và 3. Chữ hoa do CSS làm, nguồn lưu chữ thường.
import type { NavKey } from "../routes.ts";

export type Station = {
  key: NavKey;
  /** Tần số trang trí, không có nghĩa kỹ thuật. Trình đọc màn hình đọc tên mục, không đọc số. */
  frequency: string;
  name: string;
  /** Chữ ngắn trên TabBar điện thoại. */
  tab: string;
  to: string;
};

export const STATIONS: readonly Station[] = [
  { key: "home", frequency: "88.1", name: "Trang chủ", tab: "Chủ", to: "/" },
  { key: "news", frequency: "92.4", name: "Tin tức", tab: "Tin", to: "/tin-tuc" },
  { key: "items", frequency: "96.7", name: "Kho đồ", tab: "Kho", to: "/kho-do" },
  { key: "ranking", frequency: "101.3", name: "Xếp hạng", tab: "Hạng", to: "/xep-hang" },
  { key: "profile", frequency: "107.9", name: "Hồ sơ", tab: "Hồ sơ", to: "/ho-so" },
];

export const SHARED_COPY = {
  skipLink: "Bỏ qua đến nội dung chính",
  mainNav: "Điều hướng chính",
  quickNav: "Điều hướng nhanh",
  homeLabel: "Infestation Việt Nam, về trang chủ",
  strip: {
    label: "Trạng thái máy chủ",
    online: "Máy chủ trực tuyến",
    // G-25 (Figma 155:369, State=Offline): thay chữ "đang bảo trì" cũ.
    offline: "Máy chủ ngoại tuyến",
    players: (count: string) => `${count} người đang chơi`,
    // Giả định A-01: chờ chủ dự án xác nhận chữ "miễn phí".
    facts: "Miễn phí · Tiếng Việt",
  },
  // Dải Banner công khai (G-26, Figma 155:385). Chữ "Xem chi tiết" và nhãn nút đóng do nhóm code soạn (C-56).
  banner: {
    label: "Thông báo của ban quản trị",
    link: "Xem chi tiết",
    close: "Đóng thông báo",
  },
  buttons: {
    login: "Đăng nhập",
    register: "Đăng ký",
    download: "Tải game",
  },
  account: {
    menuLabel: (name: string) => `Tài khoản của ${name}`,
    rank: (rank: string) => `Hạng ${rank}`,
    profile: "Hồ sơ",
    changePassword: "Đổi mật khẩu",
    admin: "Quản trị",
    logout: "Đăng xuất",
  },
  footer: {
    intro:
      "Máy chủ Infestation dành cho người chơi. Tạo tài khoản, tải game, lập gia tộc và sống sót cùng nhau.",
    navTitle: "Điều hướng",
    supportTitle: "Hỗ trợ",
    communityTitle: "Cộng đồng",
    motionOff: "Tắt hiệu ứng",
    motionOn: "Bật hiệu ứng",
  },
} as const;

/** Trang chủ trong tab: số 0 đến 4 theo thứ tự trạm, dùng để đặt kim. */
export function stationIndex(nav: NavKey | null): number {
  return nav === null ? -1 : STATIONS.findIndex((station) => station.key === nav);
}
