// Giờ hiện tại của ứng dụng. Mặc định là giờ máy. API giả đặt giờ giả lập (meta.mockNow) để
// trạng thái khớp bản vẽ, nên giao diện không bao giờ gọi new Date() trực tiếp để so ngày.

let fixedNow: string | null = null;

export function setNow(value: string | null): void {
  fixedNow = value;
}

export function getNow(): Date {
  return fixedNow ? new Date(fixedNow) : new Date();
}

export function getNowIso(): string {
  return getNow().toISOString();
}
