// Kho JSON của máy chủ giả. Chỉ chạy trên máy chủ, không vào gói trình duyệt.
// Ba tệp: db.json (nội dung), accounts.json (tài khoản, mật khẩu đã băm), sessions.json (chỉ băm SHA-256 của mã phiên).
// Ghi tệp tạm rồi đổi tên, các lần ghi xếp hàng lần lượt. Tệp hỏng đổi thành bản .bad, tạo lại, không làm sập máy chủ.
import { mkdir, open as openFile, readFile, rename } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import type { PasswordHasher } from "../../src/api/mock/core.ts";
import { db, resetMockDb } from "../../src/api/mock/db.ts";
import { DEMO_PASSWORD, demoAccounts, state } from "../../src/api/mock/session.ts";
import {
  accountSchema,
  adminUserSchema,
  auditEntrySchema,
  bannerSchema,
  characterSchema,
  downloadInfoSchema,
  itemGroupCountSchema,
  itemSchema,
  newsPostSchema,
  playerRowSchema,
  serverStatusSchema,
  skillSchema,
} from "../../src/api/schemas.ts";

export type SessionRecord = {
  /** Băm SHA-256 của mã phiên. Mã thật chỉ nằm trong cookie của trình duyệt. */
  tokenHash: string;
  email: string;
  createdAt: number;
  lastUsedAt: number;
};

const dbFileSchema = z.object({
  news: z.array(newsPostSchema),
  newsDetailOnly: z.array(newsPostSchema),
  items: z.array(itemSchema),
  itemGroups: z.array(itemGroupCountSchema),
  players: z.array(playerRowSchema),
  me: playerRowSchema,
  totalPlayers: z.number().int().min(0),
  clans: z.array(z.object({ name: z.string(), rank: z.number().int() })),
  totalClans: z.number().int().min(0),
  myClanName: z.string(),
  account: accountSchema,
  characters: z.array(characterSchema),
  skills: z.array(skillSchema),
  serverStatus: serverStatusSchema,
  downloadInfo: downloadInfoSchema,
  banners: z.array(bannerSchema),
  adminUsers: z.array(adminUserSchema),
  auditLog: z.array(auditEntrySchema),
});

const accountsFileSchema = z.object({
  accounts: z.array(
    z.object({
      email: z.string().min(3),
      passwordHash: z.string().min(1),
      account: accountSchema.nullable(),
    }),
  ),
  usedResetTokens: z.array(z.string()),
});

const sessionsFileSchema = z.object({
  sessions: z.array(
    z.object({
      tokenHash: z.string().regex(/^[0-9a-f]{64}$/),
      email: z.string(),
      createdAt: z.number(),
      lastUsedAt: z.number(),
    }),
  ),
});

export type MockStore = {
  sessions: SessionRecord[];
  saveContent: () => Promise<void>;
  saveAccounts: () => Promise<void>;
  saveSessions: () => Promise<void>;
  /** Chờ mọi lần ghi đang xếp hàng xong. */
  idle: () => Promise<void>;
};

type StoreOptions = {
  dir: string;
  passwords: PasswordHasher;
  log?: (line: string) => void;
};

export async function openMockStore(options: StoreOptions): Promise<MockStore> {
  const { dir, passwords, log = console.log } = options;
  await mkdir(dir, { recursive: true });
  let tail: Promise<unknown> = Promise.resolve();
  let tempCount = 0;

  async function writeNow(name: string, snapshot: () => unknown): Promise<void> {
    const path = join(dir, name);
    tempCount += 1;
    const temp = `${path}.${process.pid}.${tempCount}.tmp`;
    const file = await openFile(temp, "w");
    try {
      await file.writeFile(JSON.stringify(snapshot(), null, 2));
      await file.sync();
    } finally {
      await file.close();
    }
    await rename(temp, path);
  }

  /** Xếp hàng một lần ghi. Dữ liệu lấy lúc tới lượt, nên lần ghi sau luôn có bản mới nhất. */
  function save(name: string, snapshot: () => unknown): Promise<void> {
    const job = tail.then(() => writeNow(name, snapshot));
    tail = job.catch(() => {});
    return job;
  }

  /** Đọc và kiểm một tệp. Thiếu thì trả null. Hỏng thì đổi thành bản .bad, báo nhật ký rồi trả null. */
  async function load<T>(name: string, schema: z.ZodType<T>): Promise<unknown | null> {
    const path = join(dir, name);
    let raw: string;
    try {
      raw = await readFile(path, "utf8");
    } catch {
      return null;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      if (schema.safeParse(parsed).success) return parsed;
    } catch {
      // JSON sai xử lý cùng chỗ với sai lược đồ ở dưới.
    }
    const bad = `${path}.${Date.now()}-${tempCount++}.bad`;
    await rename(path, bad);
    log(`mock: ${name} hỏng, đã đổi tên thành ${bad} và tạo lại.`);
    return null;
  }

  const contentFile = await load("db.json", dbFileSchema);
  if (contentFile) Object.assign(db, contentFile);
  else resetMockDb();

  const accountsFile = (await load("accounts.json", accountsFileSchema)) as z.infer<
    typeof accountsFileSchema
  > | null;
  const records = accountsFile?.accounts ?? demoAccounts(await passwords.hash(DEMO_PASSWORD));
  state.accounts = new Map(records.map((record) => [record.email, record]));
  state.usedResetTokens = new Set(accountsFile?.usedResetTokens ?? []);
  state.failedLogins = new Map();

  const sessionsFile = (await load("sessions.json", sessionsFileSchema)) as z.infer<
    typeof sessionsFileSchema
  > | null;
  const sessions = (sessionsFile?.sessions ?? []).filter((row) => state.accounts.has(row.email));

  const saveContent = () => save("db.json", () => db);
  const saveAccounts = () =>
    save("accounts.json", () => ({
      accounts: [...state.accounts.values()],
      usedResetTokens: [...state.usedResetTokens],
    }));
  const saveSessions = () => save("sessions.json", () => ({ sessions }));

  await Promise.all([saveContent(), saveAccounts(), saveSessions()]);
  return { sessions, saveContent, saveAccounts, saveSessions, idle: () => tail.then(() => {}) };
}
