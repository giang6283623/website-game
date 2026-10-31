// Tài khoản của API giả. Bản chạy trong trình duyệt giữ trong bộ nhớ, đặt lại bằng resetMockSession.
// Máy chủ giả nạp phần này từ accounts.json. Phiên không nằm ở đây: bên gọi lõi truyền phiên vào từng yêu cầu.
import type { Account } from "../schemas.ts";
import { db } from "./db.ts";

export type SessionKind = "user" | "admin" | "new";

/** Người đang gọi API. `kind` chọn dữ liệu mẫu, `email` chỉ đúng một tài khoản. */
export type Session = { kind: SessionKind; email: string };

/** Email và mật khẩu mẫu. Mật khẩu mẫu chỉ dùng trong API giả, không phải bí mật thật. */
export const DEMO_PASSWORD = "matkhau123";
export const USER_EMAIL = "nguoisongsot@email.com";
export const ADMIN_EMAIL = "admin@email.com";
/** Mã đặt lại mật khẩu dùng được một lần trong API giả. Mã khác coi là hết hạn. */
export const DEMO_RESET_TOKEN = "ma-mau";

export type AccountRecord = {
  email: string;
  /** Bản trình duyệt giữ nguyên chữ, máy chủ giả giữ bản băm. */
  passwordHash: string;
  /** Rỗng với hai tài khoản mẫu: thông tin của họ lấy từ dữ liệu mẫu. */
  account: Account | null;
};

export const state = {
  accounts: new Map<string, AccountRecord>(),
  failedLogins: new Map<string, { count: number; lastAt: number }>(),
  usedResetTokens: new Set<string>(),
};

export function demoAccounts(passwordHash: string): AccountRecord[] {
  return [USER_EMAIL, ADMIN_EMAIL].map((email) => ({ email, passwordHash, account: null }));
}

export function resetSessionState(): void {
  state.accounts = new Map(demoAccounts(DEMO_PASSWORD).map((record) => [record.email, record]));
  state.failedLogins = new Map();
  state.usedResetTokens = new Set();
}
resetSessionState();

export function sessionOf(email: string): Session {
  const kind = email === USER_EMAIL ? "user" : email === ADMIN_EMAIL ? "admin" : "new";
  return { kind, email };
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

export function accountFor(session: Session): Account {
  if (session.kind === "admin") return adminAccount();
  return state.accounts.get(session.email)?.account ?? db.account;
}

/** Che email: giữ ký tự đầu, ba dấu sao, rồi phần sau dấu @. */
export function maskEmail(email: string): string {
  const [name = "", domain = ""] = email.split("@");
  return `${name.slice(0, 1)}***@${domain}`;
}

export function newAccount(email: string, displayName: string, today: string): Account {
  const ids = [...state.accounts.values()].map((record) => record.account?.id ?? 0);
  return {
    id: Math.max(99, ...ids) + 1,
    displayName,
    role: "player",
    status: "active",
    emailMasked: maskEmail(email),
    createdAt: today,
    online: true,
    clan: null,
    stats: { rank: null, gameDollar: 0, xp: 0, level: 1 },
  };
}
