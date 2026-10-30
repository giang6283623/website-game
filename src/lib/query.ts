// Đọc và dựng tham số truy vấn của danh sách (ROUTES-AND-DATA.md mục 3). Giá trị mặc định không ghi lên địa chỉ.

/** Số nguyên từ 1 trở lên, sai hoặc thiếu thì trả về `fallback`. */
export function parsePositiveInt(value: string | null, fallback = 1): number {
  if (value === null || !/^\d{1,6}$/.test(value)) return fallback;
  const parsed = Number(value);
  return parsed >= 1 ? parsed : fallback;
}

/** Trả `value` nếu nằm trong `allowed`, ngược lại trả `fallback`. */
export function parseOneOf<T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T,
): T {
  return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/**
 * Dựng chuỗi truy vấn mới từ chuỗi hiện tại và các thay đổi. Giá trị `null`, rỗng hoặc bằng mặc định thì bỏ khỏi địa chỉ.
 * Trả về "" hoặc chuỗi bắt đầu bằng "?".
 */
export function buildQuery(
  current: URLSearchParams,
  changes: Record<string, string | number | null>,
  defaults: Record<string, string> = {},
): string {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === "") next.delete(key);
    else next.set(key, String(value));
  }
  for (const [key, fallback] of Object.entries(defaults)) {
    if (next.get(key) === fallback) next.delete(key);
  }
  const text = next.toString();
  return text ? `?${text}` : "";
}

/**
 * Đích sau khi đăng nhập (`?tiep=`). Chỉ nhận đường dẫn nội bộ để tránh chuyển người dùng sang trang lạ.
 * Từ chối địa chỉ tuyệt đối, "//", "/\" và ký tự điều khiển. Không quay lại các trang xác thực.
 */
export function safeNext(raw: string | null, fallback = "/ho-so"): string {
  if (!raw?.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  // biome-ignore lint/suspicious/noControlCharactersInRegex: chủ ý chặn ký tự điều khiển
  if (/[\u0000-\u001f\u007f]/.test(raw)) return fallback;
  const path = raw.split(/[?#]/)[0] ?? "";
  if (AUTH_PATHS.has(path)) return fallback;
  return raw;
}

const AUTH_PATHS = new Set(["/dang-nhap", "/dang-ky", "/quen-mat-khau", "/dat-lai-mat-khau"]);
