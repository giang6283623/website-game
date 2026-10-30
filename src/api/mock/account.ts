// Bộ xử lý của API giả cho tài khoản (ROUTES-AND-DATA.md mục 8.2): đăng nhập, đăng ký, quên và đặt lại mật khẩu, đổi mật khẩu.
// Quy tắc theo CONTENT-COPY.md mục 6. Giới hạn đăng nhập: sai 5 lần thì lần sau trả 429.
import { foldText } from "../../lib/slug.ts";
import type { MockConfig } from "./config.ts";
import { db } from "./db.ts";
import { fail, noContent, ok, type Reply, SERVER_ERROR, UNAUTHORIZED } from "./reply.ts";
import {
  accountFor,
  currentSession,
  DEMO_RESET_TOKEN,
  maskEmail,
  newAccount,
  state,
  USER_EMAIL,
} from "./session.ts";

const MAX_FAILED_LOGINS = 5;
const LOCK_SECONDS = 15 * 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[A-Za-z0-9]{3,16}$/;

type Body = Record<string, unknown>;
const text = (value: unknown): string => (typeof value === "string" ? value : "");

function takenNames(): Set<string> {
  const names = [
    db.account.displayName,
    ...db.adminUsers.map((user) => user.displayName),
    ...db.players.map((row) => row.playerName),
    ...(state.registered ? [state.registered.displayName] : []),
  ];
  return new Set(names.map((name) => foldText(name)));
}

function takenEmails(): Set<string> {
  return new Set([...state.passwords.keys(), ...state.extraEmails]);
}

export function login(body: Body, config: MockConfig): Reply {
  if (config.mode === "error") return SERVER_ERROR();
  const email = text(body.email).trim().toLowerCase();
  const password = text(body.password);
  if ((state.failedLogins.get(email) ?? 0) >= MAX_FAILED_LOGINS) {
    return fail(429, "rate_limited", "Bạn thử quá nhiều lần. Chờ 15 phút rồi thử lại.", undefined, {
      "retry-after": String(LOCK_SECONDS),
    });
  }
  const known = state.passwords.get(email);
  if (known === undefined || known !== password) {
    state.failedLogins.set(email, (state.failedLogins.get(email) ?? 0) + 1);
    return fail(401, "unauthorized", "Email hoặc mật khẩu chưa đúng. Kiểm tra lại rồi thử tiếp.");
  }
  state.failedLogins.delete(email);
  state.loggedOut = false;
  state.session = email === USER_EMAIL ? "user" : email === "admin@email.com" ? "admin" : "new";
  return ok(accountFor(state.session));
}

export function register(body: Body, config: MockConfig): Reply {
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
  if (takenEmails().has(email)) {
    conflicts.email = "Email này đã có tài khoản. Hãy đăng nhập hoặc dùng email khác.";
  }
  if (takenNames().has(foldText(displayName))) {
    conflicts.displayName = "Tên này đã có người dùng. Chọn tên khác.";
  }
  if (Object.keys(conflicts).length > 0) {
    return fail(409, "conflict", "Kiểm tra lại các ô được đánh dấu.", conflicts);
  }
  state.extraEmails.add(email);
  state.passwords.set(email, password);
  state.registered = newAccount(email, displayName);
  state.loggedOut = false;
  state.session = "new";
  return { status: 201, data: state.registered };
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

export function reset(body: Body, config: MockConfig): Reply {
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
  state.usedResetTokens.add(token);
  state.passwords.set(USER_EMAIL, password);
  state.failedLogins.clear();
  return noContent();
}

export function changePassword(body: Body, config: MockConfig): Reply {
  const session = currentSession(config);
  if (!session) return UNAUTHORIZED();
  if (config.mode === "error") return SERVER_ERROR();
  const email = session === "user" ? USER_EMAIL : session === "admin" ? "admin@email.com" : "";
  const current = text(body.currentPassword);
  const next = text(body.newPassword);
  const registeredEmail = [...state.extraEmails][0] ?? "";
  const key = email || registeredEmail;
  if (state.passwords.get(key) !== current) {
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
  state.passwords.set(key, next);
  return noContent();
}
