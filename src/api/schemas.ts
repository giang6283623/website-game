// Lược đồ Zod của hợp đồng API (ROUTES-AND-DATA.md mục 7, 8 và 9).
// Mỗi phản hồi API được kiểm bằng lược đồ trước khi vào giao diện. Sai lược đồ thì coi là lỗi máy chủ.
import { z } from "zod";

export const NEWS_CATEGORY_KEYS = ["tin-tuc", "huong-dan", "su-kien", "cap-nhat"] as const;
export const ITEM_GROUP_KEYS = [
  "vu-khi",
  "giap-va-ba-lo",
  "y-te-va-do-an",
  "dung-cu",
  "vat-lieu",
  "thuoc-no",
  "dan",
  "nhan-vat",
  "cong-thuc",
] as const;
export const RANKING_BOARDS = ["gamedollar", "xp", "gia-toc"] as const;

export const newsCategorySchema = z.enum(NEWS_CATEGORY_KEYS);
export const itemGroupSchema = z.enum(ITEM_GROUP_KEYS);
export const rankingBoardSchema = z.enum(RANKING_BOARDS);

const isoText = z.string().min(8);

/** Bản ghi bài viết đầy đủ (thực thể NewsPost). */
export const newsPostSchema = z.object({
  id: z.number().int(),
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(80),
  category: newsCategorySchema,
  status: z.enum(["draft", "published"]),
  pinned: z.boolean(),
  notifyInGame: z.boolean(),
  publishedAt: isoText.nullable(),
  authorName: z.string(),
  excerpt: z.string().max(200).nullable(),
  coverImageKey: z.string().nullable(),
  bodyHtml: z.string().nullable(),
  createdAt: isoText,
  updatedAt: isoText,
});

/** Một dòng của danh sách bài (không có bodyHtml). */
export const newsSummarySchema = z.object({
  slug: z.string(),
  title: z.string(),
  category: newsCategorySchema,
  excerpt: z.string(),
  coverImageKey: z.string().nullable(),
  publishedAt: isoText,
  authorName: z.string(),
});

export const newsDetailSchema = newsSummarySchema.extend({
  bodyHtml: z.string(),
  related: z.array(newsSummarySchema).default([]),
});

const pagingShape = {
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
};

export const newsListSchema = z.object({
  items: z.array(newsSummarySchema),
  ...pagingShape,
  featured: newsSummarySchema.nullable(),
});

export const itemStatSchema = z.object({ label: z.string(), value: z.string() });

export const itemSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  name: z.string(),
  group: itemGroupSchema,
  typeLabel: z.string(),
  statLine: z.string(),
  imageKey: z.string(),
  hudKey: z.string().nullable(),
  description: z.string().nullable(),
  stats: z.array(itemStatSchema),
  publishedAt: isoText,
  featured: z.boolean(),
  visible: z.boolean(),
  gameItemId: z.string().nullable(),
});

export const itemGroupCountSchema = z.object({
  key: itemGroupSchema,
  label: z.string(),
  count: z.number().int().min(0),
});

export const itemListSchema = z.object({
  items: z.array(itemSchema),
  ...pagingShape,
  groups: z.array(itemGroupCountSchema),
});

export const playerRowSchema = z.object({
  rank: z.number().int().min(1),
  playerName: z.string(),
  clanName: z.string().nullable(),
  /** Khóa huy hiệu gia tộc để vẽ ở cột Huy hiệu. Rỗng thì không vẽ huy hiệu. */
  emblemKey: z.string().nullable().optional(),
  gameDollar: z.number().int().min(0),
  xp: z.number().int().min(0),
});

export const clanRowSchema = z.object({
  rank: z.number().int().min(1),
  clanName: z.string(),
  emblemKey: z.string(),
  memberCount: z.number().int().min(0),
  gameDollar: z.number().int().min(0),
  xp: z.number().int().min(0),
});

export const rankingSchema = z.object({
  board: rankingBoardSchema,
  rows: z.array(z.union([playerRowSchema, clanRowSchema])),
  ...pagingShape,
  totalPlayers: z.number().int().min(0).nullable(),
  totalClans: z.number().int().min(0).nullable(),
  me: playerRowSchema.nullable(),
  myClan: clanRowSchema.nullable(),
});

export const accountSchema = z.object({
  id: z.number().int(),
  displayName: z.string(),
  role: z.enum(["player", "admin"]),
  status: z.enum(["pending", "active", "banned"]),
  emailMasked: z.string(),
  createdAt: z.string(),
  online: z.boolean(),
  clan: z.object({ name: z.string(), emblemKey: z.string() }).nullable(),
  stats: z.object({
    rank: z.number().int().nullable(),
    gameDollar: z.number().int(),
    xp: z.number().int(),
    level: z.number().int(),
  }),
});

export const characterSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  level: z.number().int(),
  profession: z.string().nullable(),
  state: z.enum(["playing", "idle"]),
  mainWeaponItemSlug: z.string().nullable(),
  weaponHudKey: z.string().nullable(),
  nightsSurvived: z.number().int().nullable(),
});

export const skillSchema = z.object({
  key: z.string(),
  name: z.string(),
  unlocked: z.boolean(),
  iconKey: z.string(),
});

export const charactersSchema = z.object({
  characters: z.array(characterSchema),
  skills: z.array(skillSchema),
});

export const serverStatusSchema = z.object({
  online: z.boolean(),
  playersOnline: z.number().int().min(0).nullable(),
  updatedAt: isoText,
});

export const downloadInfoSchema = z.object({
  available: z.boolean(),
  version: z.string(),
  sizeLabel: z.string(),
  releasedAt: z.string(),
  installerUrl: z.string().nullable(),
  requirements: z.object({
    os: z.string(),
    memory: z.string(),
    disk: z.string(),
    network: z.string(),
  }),
});

export const BANNER_STATUS_KEYS = ["showing", "scheduled", "expired", "off"] as const;

export const bannerSchema = z.object({
  id: z.number().int(),
  message: z.string().min(1).max(120),
  linkUrl: z.string().nullable(),
  startsAt: z.string(),
  endsAt: z.string(),
  enabled: z.boolean(),
  createdAt: isoText,
});

export const bannerResponseSchema = z.object({ banner: bannerSchema.nullable() });

export const adminUserSchema = z.object({
  id: z.number().int(),
  displayName: z.string(),
  emailMasked: z.string(),
  role: z.enum(["player", "admin"]),
  status: z.enum(["pending", "active", "banned"]),
  createdAt: z.string(),
});

export const auditEntrySchema = z.object({
  id: z.number().int(),
  at: isoText,
  actorName: z.string(),
  action: z.string(),
  actionLabel: z.string(),
  targetType: z.enum(["news", "item", "banner", "user", "auth"]),
  targetLabel: z.string(),
});

/** Nhân vật trong trang chi tiết người dùng quản trị. Chỉ các trường quản trị cần xem. */
export const adminUserCharacterSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  level: z.number().int(),
  profession: z.string().nullable(),
  nightsSurvived: z.number().int().nullable(),
});

/** Hạng của người dùng trên bảng GameDollar. `null` khi người dùng chưa có trên bảng. */
export const adminUserRankingSchema = z.object({
  rank: z.number().int(),
  clanName: z.string().nullable(),
  gameDollar: z.number().int(),
  xp: z.number().int(),
});

/** Trang chi tiết người dùng quản trị (G-23): thông tin, hạng, nhân vật và nhật ký thao tác về người này. */
export const adminUserDetailSchema = adminUserSchema.extend({
  ranking: adminUserRankingSchema.nullable(),
  characters: z.array(adminUserCharacterSchema),
  history: z.array(auditEntrySchema),
});

/** Một dòng của danh sách quản trị banner. `status` tính theo ngày và công tắc (off: đang trong ngày nhưng đã tắt). */
export const adminBannerSchema = bannerSchema.extend({ status: z.enum(BANNER_STATUS_KEYS) });
export const adminBannerListSchema = z.object({ banners: z.array(adminBannerSchema) });

export const adminNewsListSchema = z.object({ items: z.array(newsPostSchema), ...pagingShape });

export const adminItemListSchema = z.object({
  items: z.array(itemSchema),
  ...pagingShape,
  groups: z.array(itemGroupCountSchema),
  featuredCount: z.number().int().min(0),
  featuredMax: z.number().int().min(1),
});

export const adminUserListSchema = z.object({ users: z.array(adminUserSchema), ...pagingShape });
export const auditListSchema = z.object({ entries: z.array(auditEntrySchema), ...pagingShape });
export const uploadResultSchema = z.object({ imageKey: z.string().min(1) });

/** Kết quả kiểm mã đặt lại mật khẩu: email đã che để hiện "Chọn mật khẩu mới cho tài khoản ...". */
export const resetCheckSchema = z.object({ emailMasked: z.string() });

export const apiErrorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.record(z.string(), z.string()).optional(),
  }),
});

export type NewsCategoryKey = z.infer<typeof newsCategorySchema>;
export type ItemGroupKey = z.infer<typeof itemGroupSchema>;
export type RankingBoard = z.infer<typeof rankingBoardSchema>;
export type NewsPost = z.infer<typeof newsPostSchema>;
export type NewsSummary = z.infer<typeof newsSummarySchema>;
export type NewsDetail = z.infer<typeof newsDetailSchema>;
export type NewsList = z.infer<typeof newsListSchema>;
export type Item = z.infer<typeof itemSchema>;
export type ItemList = z.infer<typeof itemListSchema>;
export type ItemGroupCount = z.infer<typeof itemGroupCountSchema>;
export type ItemStat = z.infer<typeof itemStatSchema>;
export type PlayerRow = z.infer<typeof playerRowSchema>;
export type ClanRow = z.infer<typeof clanRowSchema>;
export type Ranking = z.infer<typeof rankingSchema>;
export type Account = z.infer<typeof accountSchema>;
export type Character = z.infer<typeof characterSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Characters = z.infer<typeof charactersSchema>;
export type ServerStatus = z.infer<typeof serverStatusSchema>;
export type DownloadInfo = z.infer<typeof downloadInfoSchema>;
export type Banner = z.infer<typeof bannerSchema>;
export type AdminUser = z.infer<typeof adminUserSchema>;
export type AdminUserCharacter = z.infer<typeof adminUserCharacterSchema>;
export type AdminUserDetail = z.infer<typeof adminUserDetailSchema>;
export type AuditEntry = z.infer<typeof auditEntrySchema>;
export type AdminBanner = z.infer<typeof adminBannerSchema>;
export type AdminBannerStatus = AdminBanner["status"];
export type AdminNewsList = z.infer<typeof adminNewsListSchema>;
export type AdminItemList = z.infer<typeof adminItemListSchema>;
export type AdminUserList = z.infer<typeof adminUserListSchema>;
export type AuditList = z.infer<typeof auditListSchema>;
export type NewsPostStatus = NewsPost["status"];
export type ResetCheck = z.infer<typeof resetCheckSchema>;
export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;
