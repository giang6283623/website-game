// Quy tắc cộng đồng (nội dung tĩnh, nằm trong kho mã theo IMPLEMENTATION-PLAN.md mục 4).
// Nguồn chữ: CONTENT-COPY.md mục 10.8 và `staticContent.communityRules` trong sample-data.json.
// Đây là bản mẫu chờ chủ dự án duyệt (A-25). Chữ hoa do CSS làm, nguồn lưu chữ thường.

export interface RulePenalty {
  step: string;
  action: string;
}

export interface RuleSection {
  /** Số thứ tự hiện trong tiêu đề và mục lục (1 đến 4). */
  id: number;
  title: string;
  lead: string;
  bullets: readonly string[];
  penalties?: readonly RulePenalty[];
  closing?: string;
}

export interface CommunityRules {
  /** Ngày dạng `YYYY-MM-DD`. Trang đổi sang `dd/mm/yyyy` bằng `formatDateFull`. */
  updatedAt: string;
  intro: string;
  sections: readonly RuleSection[];
}

export const COMMUNITY_RULES: CommunityRules = {
  updatedAt: "2026-10-28",
  intro: "Bốn quy tắc giúp máy chủ vui và công bằng.",
  sections: [
    {
      id: 1,
      title: "Tôn trọng người chơi khác",
      lead: "Đây là máy chủ của cộng đồng. Hãy cư xử như bạn muốn người khác cư xử với bạn.",
      bullets: [
        "Không chửi bới, đe dọa hay kỳ thị người khác.",
        "Không chặn điểm xuất hiện để giết liên tục người chơi mới.",
        "Không phát tán nội dung nhạy cảm trong trò chuyện.",
      ],
    },
    {
      id: 2,
      title: "Không gian lận",
      lead: "Mọi cách chơi không công bằng đều bị cấm.",
      bullets: [
        "Không dùng phần mềm hack hoặc công cụ tự động.",
        "Không cố tình khai thác lỗi game. Nếu thấy lỗi, hãy báo cho ban quản trị.",
        "Không mua bán tài khoản hoặc vật phẩm bằng tiền thật.",
      ],
    },
    {
      id: 3,
      title: "Bảo vệ tài khoản",
      lead: "Ban quản trị không bao giờ hỏi mật khẩu của bạn. Đừng chia sẻ mật khẩu cho bất kỳ ai.",
      bullets: [],
    },
    {
      id: 4,
      title: "Xử lý vi phạm",
      lead: "Mỗi trường hợp được xem xét riêng. Mức xử lý thông thường như sau.",
      bullets: [],
      penalties: [
        { step: "Lần 1", action: "Cảnh cáo" },
        { step: "Lần 2", action: "Khóa 7 ngày" },
        { step: "Lần 3", action: "Khóa vĩnh viễn" },
      ],
      closing: "Gian lận nặng có thể bị khóa vĩnh viễn ngay lần đầu.",
    },
  ],
};
