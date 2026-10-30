// Hàm gọi API quản trị (ROUTES-AND-DATA.md mục 8). Tách khỏi `endpoints.ts` để chỉ gói quản trị nạp tệp này.
import { api, parseResponse } from "./client.ts";
import {
  type AdminBanner,
  adminBannerListSchema,
  adminBannerSchema,
  adminItemListSchema,
  adminNewsListSchema,
  adminUserDetailSchema,
  adminUserListSchema,
  adminUserSchema,
  auditListSchema,
  type ItemGroupKey,
  type ItemStat,
  itemSchema,
  type NewsCategoryKey,
  type NewsPostStatus,
  newsPostSchema,
  uploadResultSchema,
} from "./schemas.ts";

type Options = { signal?: AbortSignal };

export type NewsDraft = {
  title: string;
  category: NewsCategoryKey | null;
  bodyHtml: string;
  coverImageKey: string | null;
  pinned: boolean;
  status: NewsPostStatus;
};

export const getAdminNews = (
  params: { status?: NewsPostStatus | null; q?: string; trang?: number; limit?: number },
  o: Options = {},
) => parseResponse(api.get("/admin/news", { params, signal: o.signal }), adminNewsListSchema);

export const getAdminNewsPost = (id: number, o: Options = {}) =>
  parseResponse(api.get(`/admin/news/${id}`, { signal: o.signal }), newsPostSchema);

export const createAdminNews = (draft: NewsDraft) =>
  parseResponse(api.post("/admin/news", draft), newsPostSchema);

export const updateAdminNews = (id: number, changes: Partial<NewsDraft>) =>
  parseResponse(api.put(`/admin/news/${id}`, changes), newsPostSchema);

/** Tải ảnh đại diện. Máy chủ kiểm lại loại và dung lượng, mã hóa lại và đặt tên ngẫu nhiên. */
export const uploadImage = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return parseResponse(api.post("/admin/uploads", form), uploadResultSchema);
};

export const getAdminItems = (
  params: { loai?: ItemGroupKey | null; q?: string; trang?: number; limit?: number },
  o: Options = {},
) => parseResponse(api.get("/admin/items", { params, signal: o.signal }), adminItemListSchema);

/** Các trường vật phẩm gửi lên khi thêm hoặc sửa (G-23). Đường dẫn chỉ gửi lúc thêm. */
export type ItemDraft = {
  name: string;
  group: ItemGroupKey | null;
  typeLabel: string;
  stats: ItemStat[];
  statLine: string;
  description: string;
  imageKey: string;
  gameItemId: string;
  featured: boolean;
  visible: boolean;
};

export const getAdminItem = (id: number, o: Options = {}) =>
  parseResponse(api.get(`/admin/items/${id}`, { signal: o.signal }), itemSchema);

export const createAdminItem = (draft: ItemDraft & { slug: string }) =>
  parseResponse(api.post("/admin/items", draft), itemSchema);

export const patchAdminItem = (id: number, changes: Partial<ItemDraft>) =>
  parseResponse(api.patch(`/admin/items/${id}`, changes), itemSchema);

export type BannerDraft = Pick<AdminBanner, "message" | "linkUrl" | "startsAt" | "endsAt"> & {
  enabled: boolean;
};

export const getAdminBanners = (o: Options = {}) =>
  parseResponse(api.get("/admin/banners", { signal: o.signal }), adminBannerListSchema);

export const createAdminBanner = (draft: BannerDraft) =>
  parseResponse(api.post("/admin/banners", draft), adminBannerSchema);

export const patchAdminBanner = (id: number, changes: Partial<BannerDraft>) =>
  parseResponse(api.patch(`/admin/banners/${id}`, changes), adminBannerSchema);

export const getAdminUsers = (
  params: {
    "vai-tro"?: "player" | "admin" | null;
    "trang-thai"?: "banned" | null;
    q?: string;
    trang?: number;
    limit?: number;
  },
  o: Options = {},
) => parseResponse(api.get("/admin/users", { params, signal: o.signal }), adminUserListSchema);

export const getAdminUser = (id: number, o: Options = {}) =>
  parseResponse(api.get(`/admin/users/${id}`, { signal: o.signal }), adminUserDetailSchema);

export const lockAdminUser = (id: number) =>
  parseResponse(api.post(`/admin/users/${id}/lock`), adminUserSchema);

export const unlockAdminUser = (id: number) =>
  parseResponse(api.post(`/admin/users/${id}/unlock`), adminUserSchema);

export const getAudit = (
  params: { "doi-tuong"?: "news" | "item" | "banner" | "user" | null; trang?: number },
  o: Options = {},
) => parseResponse(api.get("/admin/audit", { params, signal: o.signal }), auditListSchema);
