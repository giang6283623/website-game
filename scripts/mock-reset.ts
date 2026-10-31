// bun run mock:reset: đưa dữ liệu máy chủ giả về ban đầu. Lần bật máy chủ tiếp theo tạo lại từ dữ liệu mẫu.
// Chỉ bỏ các tệp dữ liệu đã biết tên, bỏ vào Thùng rác bằng trash nên vẫn lấy lại được.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const DATA_FILE = /^(db|accounts|sessions)\.json($|\.)/;
export const PID_FILE = "server.pid";

export function defaultDataDir(): string {
  return resolve(process.env.MOCK_DATA_DIR ?? join(import.meta.dir, "..", ".mock-data"));
}

/** Máy chủ đang bật giữ dữ liệu trong bộ nhớ và sẽ ghi đè tệp, nên không được đặt lại lúc đó. */
export function isServerRunning(dir: string): boolean {
  const file = join(dir, PID_FILE);
  if (!existsSync(file)) return false;
  const pid = Number.parseInt(readFileSync(file, "utf8"), 10);
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

type ResetOptions = {
  dir: string;
  confirm: () => boolean;
  log?: (line: string) => void;
};

export async function resetMockData(
  options: ResetOptions,
): Promise<"server-running" | "cancelled" | "nothing" | "done" | "failed"> {
  const { dir, confirm, log = console.log } = options;
  if (isServerRunning(dir)) {
    log("mock:reset: máy chủ giả đang bật. Tắt máy chủ rồi chạy lại lệnh này.");
    return "server-running";
  }
  const files = existsSync(dir) ? readdirSync(dir).filter((name) => DATA_FILE.test(name)) : [];
  if (files.length === 0) {
    log("mock:reset: chưa có dữ liệu nào để đặt lại.");
    return "nothing";
  }
  if (!confirm()) {
    log("mock:reset: đã hủy, dữ liệu giữ nguyên.");
    return "cancelled";
  }
  if (!Bun.which("trash")) {
    log(
      "mock:reset: thiếu lệnh trash. macOS 14 trở lên có sẵn. Linux: sudo apt install trash-cli.",
    );
    return "failed";
  }
  const trashed = Bun.spawnSync(["trash", ...files.map((name) => join(dir, name))]);
  if (trashed.exitCode !== 0) {
    log("mock:reset: không bỏ được tệp vào Thùng rác.");
    return "failed";
  }
  log(`mock:reset: đã bỏ ${files.length} tệp vào Thùng rác. Lần bật tiếp theo sẽ tạo lại dữ liệu.`);
  return "done";
}

if (import.meta.main) {
  const dir = defaultDataDir();
  const result = await resetMockData({
    dir,
    confirm: () =>
      prompt(`Đặt lại toàn bộ dữ liệu máy chủ giả trong ${dir}? Gõ "co" để đồng ý:`) === "co",
  });
  if (result === "server-running" || result === "failed") process.exit(1);
}
