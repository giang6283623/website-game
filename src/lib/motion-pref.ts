/**
 * Lựa chọn "Tắt hiệu ứng" (WCAG 2.2.2): lưu trên máy người dùng, đặt `data-motion="off"` ở thẻ html, CSS dừng mọi vòng lặp.
 * Script nhúng ở `scripts/lib/motion-pref-script.ts` đọc khóa này trước khi vẽ để không chạy hiệu ứng ở giây đầu.
 */
export const MOTION_PREF_KEY = "issvn-motion";

const listeners = new Set<() => void>();

export function isMotionOff(): boolean {
  return typeof document !== "undefined" && document.documentElement.dataset.motion === "off";
}

export function setMotionOff(off: boolean): void {
  if (off) document.documentElement.dataset.motion = "off";
  else delete document.documentElement.dataset.motion;
  try {
    if (off) localStorage.setItem(MOTION_PREF_KEY, "off");
    else localStorage.removeItem(MOTION_PREF_KEY);
  } catch {
    // Trình duyệt chặn bộ nhớ: lựa chọn vẫn có tác dụng tới khi tải lại trang.
  }
  for (const listener of listeners) listener();
}

export function subscribeMotionPref(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
