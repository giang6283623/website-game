// Kiểu và hàm dựng phản hồi dùng chung cho các bộ xử lý của API giả.
import type { Session } from "./session.ts";

export type Query = Record<string, string | undefined>;

/** Việc bên gọi lõi phải làm với phiên. Lõi không tự giữ phiên. */
export type SessionEffect =
  | { type: "sign-in"; session: Session }
  | { type: "sign-out" }
  /** Hủy mọi phiên của người đang gọi rồi cấp phiên mới cho chính họ (đổi mật khẩu). */
  | { type: "rotate" }
  /** Hủy mọi phiên của một tài khoản (đặt lại mật khẩu, khóa tài khoản). */
  | { type: "revoke"; email: string };

export type Reply = {
  status: number;
  data: unknown;
  headers?: Record<string, string>;
  effect?: SessionEffect;
};

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
