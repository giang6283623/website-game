// Định dạng số, hạng và ngày theo CONTENT-COPY.md mục 1. Múi giờ Việt Nam (UTC+7). Không dùng giờ máy.

const TIME_ZONE = "Asia/Ho_Chi_Minh";

const numberFormat = new Intl.NumberFormat("vi-VN");

/** 2480150 thành "2.480.150". */
export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** Hạng nhỏ hơn 100 có số 0 đầu (01 đến 99). Dòng "của tôi" không đệm số 0. */
export function formatRank(rank: number, pad = true): string {
  return pad && rank < 100 ? String(rank).padStart(2, "0") : String(rank);
}

/** Số đếm danh mục có số 0 đầu khi dưới 10 (05, 06). */
export function formatCount(count: number): string {
  return count < 10 ? String(count).padStart(2, "0") : String(count);
}

type DateParts = { day: string; month: string; year: string; hour: string; minute: string };

const dateParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Nhận chuỗi ISO. Ngày không có giờ ("2026-10-28") hiểu là 00:00 giờ Việt Nam. */
export function parseDate(input: string | Date): Date {
  if (input instanceof Date) return input;
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(input) ? `${input}T00:00:00+07:00` : input);
}

function partsOf(input: string | Date): DateParts {
  const map: Record<string, string> = {};
  for (const part of dateParts.formatToParts(parseDate(input))) map[part.type] = part.value;
  return {
    day: map.day ?? "",
    month: map.month ?? "",
    year: map.year ?? "",
    hour: map.hour ?? "",
    minute: map.minute ?? "",
  };
}

/** "30/10". Thêm năm khi khác năm của `now` ("30/10/2025"). */
export function formatDateShort(input: string | Date, now: string | Date): string {
  const date = partsOf(input);
  const current = partsOf(now);
  const base = `${date.day}/${date.month}`;
  return date.year === current.year ? base : `${base}/${date.year}`;
}

/** "28/10/2026". */
export function formatDateFull(input: string | Date): string {
  const date = partsOf(input);
  return `${date.day}/${date.month}/${date.year}`;
}

/** "30/10/2026 08:00". */
export function formatDateTime(input: string | Date): string {
  const date = partsOf(input);
  return `${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute}`;
}

/** Số phút đọc theo 200 chữ mỗi phút, tối thiểu 1. */
export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
