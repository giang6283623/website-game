// Kho JSON của máy chủ giả (nhóm B): tạo lần đầu, nạp lại, ghi an toàn, tệp hỏng không làm sập.
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openMockStore } from "../scripts/lib/mock-store.ts";
import { resetMockSession } from "../src/api/mock/adapter.ts";
import type { PasswordHasher } from "../src/api/mock/core.ts";
import { db } from "../src/api/mock/db.ts";
import { ADMIN_EMAIL, DEMO_PASSWORD, state, USER_EMAIL } from "../src/api/mock/session.ts";

const passwords: PasswordHasher = {
  hash: (password) => `bam:${password}`,
  verify: (password, hash) => hash === `bam:${password}`,
};

let parent = "";
let dir = "";
let count = 0;
let logs: string[] = [];

const open = () => openMockStore({ dir, passwords, log: (line) => logs.push(line) });
const readJson = (name: string) => JSON.parse(readFileSync(join(dir, name), "utf8"));
const badFiles = () => readdirSync(dir).filter((name) => name.endsWith(".bad"));

beforeAll(() => {
  parent = mkdtempSync(join(tmpdir(), "issvn-store-"));
});

afterAll(() => {
  Bun.spawnSync(["trash", parent]);
});

beforeEach(() => {
  count += 1;
  dir = join(parent, `lan-${count}`);
  logs = [];
});

afterEach(() => {
  resetMockSession();
});

describe("tạo lần đầu", () => {
  test("tạo đủ ba tệp từ dữ liệu mẫu, có hai tài khoản mẫu, mật khẩu đã băm", async () => {
    await open();
    expect(readdirSync(dir).sort()).toEqual(["accounts.json", "db.json", "sessions.json"]);
    expect(readJson("db.json").news.length).toBe(db.news.length);
    const { accounts } = readJson("accounts.json");
    expect(accounts.map((row: { email: string }) => row.email).sort()).toEqual(
      [ADMIN_EMAIL, USER_EMAIL].sort(),
    );
    expect(readFileSync(join(dir, "accounts.json"), "utf8")).not.toContain(`"${DEMO_PASSWORD}"`);
    expect(accounts[0].passwordHash).toBe(`bam:${DEMO_PASSWORD}`);
    expect(badFiles()).toEqual([]);
  });

  test("dữ liệu mẫu qua được lược đồ khi mở lại, không sinh tệp .bad", async () => {
    await open();
    await open();
    expect(badFiles()).toEqual([]);
    expect(logs.filter((line) => line.includes("hỏng"))).toEqual([]);
  });
});

describe("nạp lại", () => {
  test("sửa rồi lưu, mở lại vẫn còn", async () => {
    const store = await open();
    const post = db.news[0];
    if (!post) throw new Error("thiếu bài mẫu");
    post.title = "Tiêu đề đã sửa";
    state.accounts.set("moi@email.com", {
      email: "moi@email.com",
      passwordHash: "bam:x",
      account: null,
    });
    state.usedResetTokens.add("ma-da-dung");
    store.sessions.push({
      tokenHash: "a".repeat(64),
      email: USER_EMAIL,
      createdAt: 1,
      lastUsedAt: 2,
    });
    await Promise.all([store.saveContent(), store.saveAccounts(), store.saveSessions()]);

    resetMockSession();
    expect(db.news[0]?.title).not.toBe("Tiêu đề đã sửa");
    const reopened = await open();
    expect(db.news[0]?.title).toBe("Tiêu đề đã sửa");
    expect(state.accounts.has("moi@email.com")).toBe(true);
    expect(state.usedResetTokens.has("ma-da-dung")).toBe(true);
    expect(reopened.sessions.map((row) => row.lastUsedAt)).toEqual([2]);
  });

  test("phiên của tài khoản không còn thì bị bỏ khi mở lại", async () => {
    const store = await open();
    store.sessions.push({
      tokenHash: "b".repeat(64),
      email: "khong-con@email.com",
      createdAt: 1,
      lastUsedAt: 2,
    });
    await store.saveSessions();
    expect((await open()).sessions).toEqual([]);
  });
});

describe("tệp hỏng", () => {
  test.each([
    ["db.json", "{ không phải JSON"],
    ["accounts.json", '{"accounts": "sai dạng"}'],
    ["sessions.json", ""],
    ["db.json", '{"news": []}'],
  ])("%s hỏng thì đổi tên thành .bad, tạo lại, ghi nhật ký, không sập", async (name, broken) => {
    await open();
    writeFileSync(join(dir, name), broken);
    await open();
    expect(badFiles().length).toBe(1);
    expect(badFiles()[0]?.startsWith(name)).toBe(true);
    expect(readFileSync(join(dir, badFiles()[0] ?? ""), "utf8")).toBe(broken);
    expect(logs.some((line) => line.includes(name) && line.includes("hỏng"))).toBe(true);
    expect(() => readJson(name)).not.toThrow();
    expect(state.accounts.size).toBe(2);
  });

  test("hỏng hai lần thì giữ cả hai bản .bad", async () => {
    await open();
    writeFileSync(join(dir, "db.json"), "hỏng lần một");
    await open();
    writeFileSync(join(dir, "db.json"), "hỏng lần hai");
    await open();
    expect(badFiles().length).toBe(2);
  });
});

describe("ghi an toàn", () => {
  test("20 lần ghi cùng lúc: tệp hợp lệ, giữ bản mới nhất, không còn tệp tạm", async () => {
    const store = await open();
    const post = db.news[0];
    if (!post) throw new Error("thiếu bài mẫu");
    await Promise.all(
      Array.from({ length: 20 }, (_, index) => {
        post.title = `Lần ghi ${index}`;
        return store.saveContent();
      }),
    );
    expect(readJson("db.json").news[0].title).toBe("Lần ghi 19");
    expect(readdirSync(dir).filter((name) => name.endsWith(".tmp"))).toEqual([]);
  });
});
