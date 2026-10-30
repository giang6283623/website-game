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
