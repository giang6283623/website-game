// Bộ xử lý của API giả cho tài khoản (ROUTES-AND-DATA.md mục 8.2): đăng nhập, đăng ký, quên và đặt lại mật khẩu, đổi mật khẩu.
// Quy tắc theo CONTENT-COPY.md mục 6. Giới hạn đăng nhập: sai 5 lần thì khóa 15 phút, trong lúc đó trả 429.
import { foldText } from "../../lib/slug.ts";
import type { MockConfig } from "./config.ts";
import { db } from "./db.ts";
import { fail, noContent, ok, type Reply, SERVER_ERROR, UNAUTHORIZED } from "./reply.ts";
import {
  accountFor,
  DEMO_RESET_TOKEN,
  maskEmail,
  newAccount,
  type Session,
  sessionOf,
  state,
  USER_EMAIL,
} from "./session.ts";

const MAX_FAILED_LOGINS = 5;
const LOCK_MS = 15 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[A-Za-z0-9]{3,16}$/;

export type PasswordHasher = {
  hash: (password: string) => string | Promise<string>;
  verify: (password: string, hash: string) => boolean | Promise<boolean>;
};

/** Thứ lõi cần từ bên ngoài. Trình duyệt và máy chủ giả truyền bản riêng. */
export type CoreDeps = {
  passwords: PasswordHasher;
  /** Giờ máy, để tính thời gian khóa đăng nhập. */
  now: () => number;
  /** Giờ đóng dấu bản ghi mới và mốc xét bài đã đăng. Bản trình duyệt giữ giờ mẫu, máy chủ giả dùng giờ thật. */
  stamp: () => string;
};

type Body = Record<string, unknown>;
const text = (value: unknown): string => (typeof value === "string" ? value : "");

function takenNames(): Set<string> {
  const names = [
    db.account.displayName,
    ...db.adminUsers.map((user) => user.displayName),
    ...db.players.map((row) => row.playerName),
    ...[...state.accounts.values()].map((record) => record.account?.displayName ?? ""),
  ];
  return new Set(names.map((name) => foldText(name)));
}

function isLocked(accountId: number | undefined): boolean {
  return db.adminUsers.some((user) => user.id === accountId && user.status === "banned");
}

export async function login(body: Body, config: MockConfig, deps: CoreDeps): Promise<Reply> {
  if (config.mode === "error") return SERVER_ERROR();
  const email = text(body.email).trim().toLowerCase();
  const password = text(body.password);
  const now = deps.now();
  const failed = state.failedLogins.get(email);
  if (failed && now - failed.lastAt >= LOCK_MS) state.failedLogins.delete(email);
  else if (failed && failed.count >= MAX_FAILED_LOGINS) {
    const waitSeconds = Math.ceil((LOCK_MS - (now - failed.lastAt)) / 1000);
    return fail(429, "rate_limited", "Bạn thử quá nhiều lần. Chờ 15 phút rồi thử lại.", undefined, {
      "retry-after": String(waitSeconds),
    });
  }
  const record = state.accounts.get(email);
  if (!record || !(await deps.passwords.verify(password, record.passwordHash))) {
    const count = (state.failedLogins.get(email)?.count ?? 0) + 1;
    state.failedLogins.set(email, { count, lastAt: now });
    return fail(401, "unauthorized", "Email hoặc mật khẩu chưa đúng. Kiểm tra lại rồi thử tiếp.");
  }
  state.failedLogins.delete(email);
  if (isLocked(record.account?.id)) {
    return fail(403, "forbidden", "Tài khoản này đang bị khóa.");
  }
  const session = sessionOf(email);
  return { ...ok(accountFor(session)), effect: { type: "sign-in", session } };
}

export async function register(body: Body, config: MockConfig, deps: CoreDeps): Promise<Reply> {
  if (config.mode === "error") return SERVER_ERROR();
  const email = text(body.email).trim().toLowerCase();
  const displayName = text(body.displayName).trim();
  const password = text(body.password);
  const fields: Record<string, string> = {};
  if (!EMAIL_PATTERN.test(email)) fields.email = "Email chưa đúng. Ví dụ: ten@email.com";
  if (!NAME_PATTERN.test(displayName)) {
    fields.displayName =
      displayName.length < 3 || displayName.length > 16
        ? "Tên cần từ 3 đến 16 ký tự."
        : "Tên không được có dấu hay dấu cách. Ví dụ: ThoSanDem";
  }
  if (password.length < 8) fields.password = "Mật khẩu cần ít nhất 8 ký tự.";
  if (password !== text(body.passwordConfirm)) {
    fields.passwordConfirm = "Hai mật khẩu chưa giống nhau.";
  }
  if (Object.keys(fields).length > 0) {
    return fail(422, "validation_failed", "Kiểm tra lại các ô được đánh dấu.", fields);
  }
  const conflicts: Record<string, string> = {};
  if (state.accounts.has(email)) {
    conflicts.email = "Email này đã có tài khoản. Hãy đăng nhập hoặc dùng email khác.";
  }
  if (takenNames().has(foldText(displayName))) {
    conflicts.displayName = "Tên này đã có người dùng. Chọn tên khác.";
  }
  if (Object.keys(conflicts).length > 0) {
    return fail(409, "conflict", "Kiểm tra lại các ô được đánh dấu.", conflicts);
  }
  const account = newAccount(email, displayName, deps.stamp().slice(0, 10));
  state.accounts.set(email, {
    email,
    passwordHash: await deps.passwords.hash(password),
    account,
  });
  db.adminUsers.unshift({
    id: account.id,
    displayName,
    emailMasked: account.emailMasked,
    role: account.role,
    status: account.status,
    createdAt: account.createdAt,
  });
  return { status: 201, data: account, effect: { type: "sign-in", session: sessionOf(email) } };
}

/** Luôn trả 202 dù email có tài khoản hay không (không lộ email nào có tài khoản). */
export function forgot(body: Body, config: MockConfig): Reply {
  if (config.mode === "error") return SERVER_ERROR();
  const email = text(body.email).trim();
  if (!EMAIL_PATTERN.test(email)) {
    return fail(422, "validation_failed", "Email chưa đúng.", {
      email: "Email chưa đúng. Ví dụ: ten@email.com",
    });
  }
  return { status: 202, data: null };
}

function tokenUsable(token: string): boolean {
  return token === DEMO_RESET_TOKEN && !state.usedResetTokens.has(token);
}

/** GET /auth/reset/{token}: kiểm mã trước khi hiện form, trả email đã che. Là phần mở rộng của hợp đồng. */
export function resetCheck(token: string): Reply {
  if (!tokenUsable(token)) {
    return fail(410, "gone", "Liên kết đã quá 30 phút hoặc đã được dùng rồi.");
  }
  return ok({ emailMasked: maskEmail(USER_EMAIL) });
}

export async function reset(body: Body, config: MockConfig, deps: CoreDeps): Promise<Reply> {
  if (config.mode === "error") return SERVER_ERROR();
  const token = text(body.token);
  if (!tokenUsable(token)) {
    return fail(410, "gone", "Liên kết đã quá 30 phút hoặc đã được dùng rồi.");
  }
  const password = text(body.password);
  const fields: Record<string, string> = {};
  if (password.length < 8) fields.password = "Mật khẩu cần ít nhất 8 ký tự.";
  if (password !== text(body.passwordConfirm)) {
    fields.passwordConfirm = "Hai mật khẩu chưa giống nhau.";
  }
  if (Object.keys(fields).length > 0) {
    return fail(422, "validation_failed", "Kiểm tra lại các ô được đánh dấu.", fields);
  }
  const record = state.accounts.get(USER_EMAIL);
  if (record) record.passwordHash = await deps.passwords.hash(password);
  state.usedResetTokens.add(token);
  state.failedLogins.clear();
  return { ...noContent(), effect: { type: "revoke", email: USER_EMAIL } };
}

export async function changePassword(
  body: Body,
  config: MockConfig,
  session: Session | null,
  deps: CoreDeps,
): Promise<Reply> {
  if (!session) return UNAUTHORIZED();
  if (config.mode === "error") return SERVER_ERROR();
  const record = state.accounts.get(session.email);
  const current = text(body.currentPassword);
  const next = text(body.newPassword);
  if (!record || !(await deps.passwords.verify(current, record.passwordHash))) {
    return fail(403, "forbidden", "Mật khẩu hiện tại chưa đúng.", {
      currentPassword: "Mật khẩu hiện tại chưa đúng.",
    });
  }
  const fields: Record<string, string> = {};
  if (next.length < 8) fields.newPassword = "Mật khẩu cần ít nhất 8 ký tự.";
  else if (next === current) fields.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại.";
  if (next !== text(body.newPasswordConfirm)) {
    fields.newPasswordConfirm = "Hai mật khẩu chưa giống nhau.";
  }
  if (Object.keys(fields).length > 0) {
    return fail(422, "validation_failed", "Kiểm tra lại các ô được đánh dấu.", fields);
  }
  record.passwordHash = await deps.passwords.hash(next);
  return { ...noContent(), effect: { type: "rotate" } };
}
