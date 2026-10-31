// Dữ liệu của API giả: nạp từ sample-data.json, giữ thay đổi trong bộ nhớ.
// Không sửa dữ liệu mẫu cho đẹp. Các chỗ lệch có chủ ý ghi ở meta.knownQuirks.
// Mỗi lần tạo bản sao mới nên quản trị sửa dữ liệu không làm hỏng dữ liệu mẫu gốc (xem resetMockDb).
import sample from "../../../docs/design-handoff/sample-data.json";
import type {
  Account,
  AdminUser,
  AuditEntry,
  Banner,
  Character,
  DownloadInfo,
  Item,
  NewsPost,
  ServerStatus,
  Skill,
} from "../schemas.ts";

export const MOCK_NOW: string = sample.meta.mockNow;

function fresh() {
  const copy = structuredClone(sample);
  return {
    /** Bài có trong danh sách (khớp bản vẽ Trang chủ và Tin tức). */
    news: copy.news as NewsPost[],
    /** Bài chỉ mở được bằng địa chỉ trực tiếp, không nằm trong danh sách mẫu (bản vẽ không liệt kê). */
    newsDetailOnly: copy.moreNews as NewsPost[],
    items: copy.items as Item[],
    itemGroups: copy.itemGroups,
    players: copy.ranking.rows,
    me: copy.ranking.me,
    totalPlayers: copy.ranking.totalPlayers,
    clans: copy.clans,
    totalClans: copy.clanRanking.totalClans,
    myClanName: copy.clanRanking.myClanName,
    account: copy.account as Account,
    characters: copy.characters as Character[],
    skills: copy.skills as Skill[],
    serverStatus: copy.serverStatus as ServerStatus & { factsOnHome?: string[] },
    downloadInfo: copy.downloadInfo as DownloadInfo,
    banners: copy.banners as Array<Banner & { expectedStatus?: string }>,
    adminUsers: copy.adminUsers as AdminUser[],
    auditLog: copy.auditLog as AuditEntry[],
    staticContent: copy.staticContent,
  };
}

export const db = fresh();

/** Trả dữ liệu về như dữ liệu mẫu gốc (dùng trong kiểm thử và khi nạp lại trang). */
export function resetMockDb(): void {
  Object.assign(db, fresh());
}

/** Ngày giờ giả lập theo giờ Việt Nam, dạng "YYYY-MM-DD". */
export function mockToday(): string {
  return MOCK_NOW.slice(0, 10);
}

const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Giờ đóng dấu bản ghi mới ở máy chủ giả: giờ Việt Nam, cùng dạng với dữ liệu mẫu nên so và sắp theo chữ vẫn đúng.
 * Không lùi dưới giờ mẫu, để bản ghi mới không nằm dưới dữ liệu mẫu khi đồng hồ máy chạy sai.
 */
export function stampAt(ms: number): string {
  const text = `${new Date(ms + VIETNAM_OFFSET_MS).toISOString().slice(0, 19)}+07:00`;
  return text > MOCK_NOW ? text : MOCK_NOW;
}

export type MockDb = typeof db;
