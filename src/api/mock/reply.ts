// Kiểu và hàm dựng phản hồi dùng chung cho các bộ xử lý của API giả.
export type Query = Record<string, string | undefined>;
export type Reply = { status: number; data: unknown; headers?: Record<string, string> };

export const ok = (data: unknown): Reply => ({ status: 200, data });
export const created = (data: unknown): Reply => ({ status: 201, data });
export const noContent = (): Reply => ({ status: 204, data: null });

export const fail = (
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
  headers?: Record<string, string>,
): Reply => ({
  status,
  data: { error: { code, message, ...(fields ? { fields } : {}) } },
  ...(headers ? { headers } : {}),
});

export const SERVER_ERROR = (): Reply => fail(500, "server_error", "Lỗi máy chủ.");
export const UNAUTHORIZED = (): Reply => fail(401, "unauthorized", "Chưa đăng nhập.");
export const FORBIDDEN = (): Reply => fail(403, "forbidden", "Không đủ quyền.");
export const NOT_FOUND = (message = "Không tìm thấy."): Reply => fail(404, "not_found", message);
