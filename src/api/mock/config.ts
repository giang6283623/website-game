// Cấu hình API giả: độ trễ và chế độ để thử ListState. Đọc từ ?mock= trên địa chỉ, ví dụ ?mock=slow.
//   slow   : trả chậm 3 giây (thấy trạng thái đang tải)
//   empty  : mọi danh sách rỗng (thấy trạng thái rỗng)
//   error  : mọi yêu cầu dữ liệu trả 500 (thấy trạng thái lỗi)
//   offline: máy chủ game ngoại tuyến
//   user   : đã đăng nhập sẵn bằng người chơi mẫu
//   admin  : đã đăng nhập sẵn bằng quản trị viên mẫu

export type MockMode = "normal" | "slow" | "empty" | "error" | "offline";

export type MockConfig = {
  latencyMs: number;
  mode: MockMode;
  session: "guest" | "user" | "admin";
};

const MODES: readonly MockMode[] = ["normal", "slow", "empty", "error", "offline"];

export function parseMockQuery(search: string): Partial<MockConfig> {
  const values = new URLSearchParams(search).getAll("mock").flatMap((value) => value.split(","));
  const result: Partial<MockConfig> = {};
  for (const value of values) {
    if ((MODES as readonly string[]).includes(value)) result.mode = value as MockMode;
    if (value === "user" || value === "admin") result.session = value;
  }
  return result;
}

const defaults: MockConfig = { latencyMs: 200, mode: "normal", session: "guest" };
let overrides: Partial<MockConfig> | null = null;

/** Dùng trong kiểm thử để đặt cấu hình cố định. Truyền null để quay về đọc từ địa chỉ. */
export function setMockConfig(next: Partial<MockConfig> | null): void {
  overrides = next;
}

export function getMockConfig(): MockConfig {
  const fromQuery =
    overrides === null && typeof window !== "undefined"
      ? parseMockQuery(window.location.search)
      : {};
  const merged = { ...defaults, ...fromQuery, ...(overrides ?? {}) };
  if (merged.mode === "slow" && !(overrides && "latencyMs" in overrides)) merged.latencyMs = 3000;
  return merged;
}
