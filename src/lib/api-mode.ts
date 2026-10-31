// Quy tắc theo API_MODE dùng chung cho giao diện và bước dựng sẵn.

/**
 * Chỉ bản dựng nối API thật mới cho lập chỉ mục. Mọi giá trị khác (`mock`, `mock-server`, gõ nhầm) đều chặn,
 * để dữ liệu mẫu không vào kết quả tìm kiếm (C-91).
 */
export function blocksIndexing(mode: string | undefined): boolean {
  return mode !== "real";
}
