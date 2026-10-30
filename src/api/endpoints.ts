// Hàm gọi API có kiểu. Tên tham số truy vấn theo ROUTES-AND-DATA.md mục 3 và 8.
import { api, parseResponse } from "./client.ts";
import {
  accountSchema,
  bannerResponseSchema,
  charactersSchema,
  downloadInfoSchema,
  type ItemGroupKey,
  itemListSchema,
  itemSchema,
  type NewsCategoryKey,
  newsDetailSchema,
  newsListSchema,
  type RankingBoard,
  rankingSchema,
  resetCheckSchema,
  serverStatusSchema,
} from "./schemas.ts";

type Options = { signal?: AbortSignal };

export const getServerStatus = (o: Options = {}) =>
  parseResponse(api.get("/server/status", { signal: o.signal }), serverStatusSchema);

export const getNewsList = (
  params: { loai?: NewsCategoryKey | null; trang?: number; limit?: number },
  o: Options = {},
) => parseResponse(api.get("/news", { params, signal: o.signal }), newsListSchema);

export const getNewsDetail = (slug: string, o: Options = {}) =>
  parseResponse(
    api.get(`/news/${encodeURIComponent(slug)}`, { signal: o.signal }),
    newsDetailSchema,
  );

export const getItemList = (
  params: {
    loai?: ItemGroupKey | null;
    q?: string;
    "sap-xep"?: "moi-nhat" | "ten-a-z";
    trang?: number;
    limit?: number;
  },
  o: Options = {},
) => parseResponse(api.get("/items", { params, signal: o.signal }), itemListSchema);

export const getItem = (slug: string, o: Options = {}) =>
  parseResponse(api.get(`/items/${encodeURIComponent(slug)}`, { signal: o.signal }), itemSchema);

export const getRanking = (
  params: { bang?: RankingBoard; q?: string; trang?: number; limit?: number },
  o: Options = {},
) => parseResponse(api.get("/ranking", { params, signal: o.signal }), rankingSchema);

export const getDownloadInfo = (o: Options = {}) =>
  parseResponse(api.get("/download", { signal: o.signal }), downloadInfoSchema);

export const getBanner = (o: Options = {}) =>
  parseResponse(api.get("/banner", { signal: o.signal }), bannerResponseSchema);

export const getMe = (o: Options = {}) =>
  parseResponse(api.get("/me", { signal: o.signal }), accountSchema);

export const getMyCharacters = (o: Options = {}) =>
  parseResponse(api.get("/me/characters", { signal: o.signal }), charactersSchema);

export const postLogout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const postLogin = (body: { email: string; password: string; remember: boolean }) =>
  parseResponse(api.post("/auth/login", body), accountSchema);

export const postRegister = (body: {
  email: string;
  displayName: string;
  password: string;
  passwordConfirm: string;
}) => parseResponse(api.post("/auth/register", body), accountSchema);

/** Luôn thành công (202) dù email có tài khoản hay không. */
export const postForgot = async (email: string): Promise<void> => {
  await api.post("/auth/forgot", { email });
};

/** Kiểm mã đặt lại mật khẩu (phần mở rộng của hợp đồng). Mã hỏng thì ném lỗi 410. */
export const getResetCheck = (token: string, o: Options = {}) =>
  parseResponse(
    api.get(`/auth/reset/${encodeURIComponent(token)}`, { signal: o.signal }),
    resetCheckSchema,
  );

export const postReset = async (body: {
  token: string;
  password: string;
  passwordConfirm: string;
}): Promise<void> => {
  await api.post("/auth/reset", body);
};

export const postChangePassword = async (body: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}): Promise<void> => {
  await api.post("/account/password", body);
};
