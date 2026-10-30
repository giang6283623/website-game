// Phiên đăng nhập và tài khoản của API giả. Mọi thứ nằm trong bộ nhớ, đặt lại bằng resetMockSession.
import type { Account } from "../schemas.ts";
import { getMockConfig, type MockConfig } from "./config.ts";
import { db, mockToday } from "./db.ts";

export type SessionKind = "user" | "admin" | "new";

/** Email và mật khẩu mẫu. Mật khẩu mẫu chỉ dùng trong API giả, không phải bí mật thật. */
export const DEMO_PASSWORD = "matkhau123";
export const USER_EMAIL = "nguoisongsot@email.com";
export const ADMIN_EMAIL = "admin@email.com";
/** Mã đặt lại mật khẩu dùng được một lần trong API giả. Mã khác coi là hết hạn. */
export const DEMO_RESET_TOKEN = "ma-mau";

export const state = {
  session: null as SessionKind | null,
  /** Đã bấm đăng xuất: không quay lại phiên mặc định của ?mock=user hoặc ?mock=admin. */
  loggedOut: false,
  /** Tài khoản vừa đăng ký trong phiên này. */
  registered: null as Account | null,
  passwords: new Map<string, string>(),
  failedLogins: new Map<string, number>(),
  usedResetTokens: new Set<string>(),
  extraEmails: new Set<string>(),
};

export function resetSessionState(): void {
  state.session = null;
  state.loggedOut = false;
  state.registered = null;
  state.passwords = new Map([
    [USER_EMAIL, DEMO_PASSWORD],
    [ADMIN_EMAIL, DEMO_PASSWORD],
  ]);
  state.failedLogins = new Map();
  state.usedResetTokens = new Set();
  state.extraEmails = new Set();
}
resetSessionState();

export function currentSession(config: MockConfig = getMockConfig()): SessionKind | null {
  if (state.session) return state.session;
  if (state.loggedOut) return null;
  return config.session === "guest" ? null : config.session;
}

export function adminAccount(): Account {
  return {
    ...db.account,
    id: 4,
    displayName: "AdminDemo",
    role: "admin",
    emailMasked: "a***@email.com",
  };
}

export function accountFor(session: SessionKind): Account {
  if (session === "admin") return adminAccount();
  if (session === "new" && state.registered) return state.registered;
  return db.account;
}

/** Che email: giữ ký tự đầu, ba dấu sao, rồi phần sau dấu @. */
export function maskEmail(email: string): string {
  const [name = "", domain = ""] = email.split("@");
  return `${name.slice(0, 1)}***@${domain}`;
}

export function newAccount(email: string, displayName: string): Account {
  return {
    id: 100 + state.extraEmails.size,
    displayName,
    role: "player",
    status: "active",
    emailMasked: maskEmail(email),
    createdAt: mockToday(),
    online: true,
    clan: null,
    stats: { rank: null, gameDollar: 0, xp: 0, level: 1 },
  };
}
