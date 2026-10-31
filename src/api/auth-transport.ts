// Cách gắn thông tin xác thực vào yêu cầu API. Hiện có một cách: cookie do máy chủ đặt và mã CSRF.
// Khi nối API thật, API thật quyết định cách xác thực và chỉ cần sửa tệp này (ROUTES-AND-DATA.md mục 8.5).
import type { InternalAxiosRequestConfig } from "axios";

/** Trình duyệt tự gửi cookie phiên. Giao diện không đọc hay lưu mã phiên. */
export const AUTH_REQUEST_CONFIG = { withCredentials: true } as const;

const SAFE_METHODS = new Set(["get", "head", "options"]);

/**
 * Cookie đọc được do máy chủ giả đặt khi có phiên, để khách khỏi hỏi /me rồi nhận 401 (C-154).
 * Chỉ là gợi ý, không cấp quyền gì: quyền thật vẫn lấy từ cookie phiên.
 */
export const SESSION_HINT_COOKIE = "issvn_signed_in";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`).exec(document.cookie);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/** Mã CSRF do máy chủ đặt trong cookie đọc được (không phải cookie phiên). */
export function readCsrf(): string | null {
  return readCookie("csrf_token");
}

/** Chỉ máy chủ giả có cookie gợi ý. API thật và API giả trong trình duyệt luôn phải hỏi /me. */
export function mayHaveSession(): boolean {
  return process.env.API_MODE !== "mock-server" || readCookie(SESSION_HINT_COOKIE) !== null;
}

export function isWriteMethod(method: string | undefined): boolean {
  return !SAFE_METHODS.has((method ?? "get").toLowerCase());
}

export function attachAuth(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  if (isWriteMethod(config.method)) {
    const csrf = readCsrf();
    if (csrf) config.headers.set("X-CSRF-Token", csrf);
  }
  return config;
}
