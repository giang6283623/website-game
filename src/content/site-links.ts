// Liên kết mạng xã hội và liên hệ (giả định A-07, A-08). Liên kết null bị ẩn,
// không bao giờ hiện liên kết rỗng (CONTENT-COPY.md mục 2.3).
// Chủ dự án chốt (29/10/2026): chỉ giữ Facebook group, Discord và YouTube. Đã bỏ Zalo.
// Facebook có địa chỉ thật. Discord và YouTube tạm đặt "#" cho đến khi có địa chỉ (C-55).
export type SiteLink = { key: string; label: string; url: string | null };

export const COMMUNITY_LINKS: readonly SiteLink[] = [
  {
    key: "facebook",
    label: "Facebook",
    url: "https://www.facebook.com/groups/infestationsmmovietnam",
  },
  { key: "discord", label: "Discord", url: "#" },
  { key: "youtube", label: "YouTube", url: "#" },
];

export const CONTACT_LINK: SiteLink = { key: "contact", label: "Liên hệ quản trị", url: null };

// LINK-TAI-GAME: chỗ gắn link tải bộ cài game. Chưa có link thật nên tạm đặt "#": bấm nút tải không đi đâu,
// không nhảy sang địa chỉ giả `installerUrl` của dữ liệu mẫu.
// Khi có link thật: thay "#" bằng địa chỉ tệp cài. Mọi nút tải ở /tai-game dùng chung hằng này và tự bật
// lại thuộc tính `download` (xem InstallerButton ở src/pages/Download/DownloadCard.tsx).
// Rồi sửa các bài "LINK-TAI-GAME" và nút tải trong tests/download.test.tsx cho khớp.
export const INSTALLER_URL: string = "#";
