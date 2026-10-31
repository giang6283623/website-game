// Máy chủ giả chạy thật trong tiến trình riêng (nhóm C). Gọi bằng node:http vì DOM giả của bộ test thay mất fetch.
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { isServerRunning, resetMockData } from "../scripts/mock-reset.ts";

const root = resolve(import.meta.dir, "..");
let parent = "";
let dataDir = "";
let port = 0;
let server: ReturnType<typeof Bun.spawn>;

type Sent = {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  body: string;
};

function send(path: string, options: { method?: string; body?: string; host?: string } = {}) {
  return new Promise<Sent>((done, reject) => {
    const call = httpRequest(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method: options.method ?? "GET",
        headers: { host: options.host ?? `localhost:${port}` },
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () =>
          done({
            status: response.statusCode ?? 0,
            headers: response.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          }),
        );
      },
    );
    call.on("error", reject);
    call.end(options.body);
  });
}

beforeAll(async () => {
  parent = mkdtempSync(join(tmpdir(), "issvn-server-"));
  dataDir = join(parent, "data");
  const outDir = join(parent, "out");
  mkdirSync(join(outDir, "assets"), { recursive: true });
  writeFileSync(join(outDir, "index.html"), "<p>trang chủ</p>");
  writeFileSync(join(outDir, "200.html"), "<p>khung rỗng</p>");
  writeFileSync(join(outDir, "404.html"), "<p>không có trang</p>");
  writeFileSync(join(outDir, "assets", "tep.js"), "1");
  server = Bun.spawn(["bun", "--no-env-file", "run", "scripts/mock-server.ts"], {
    cwd: root,
    env: { ...process.env, PORT: "0", MOCK_DATA_DIR: dataDir, MOCK_OUT_DIR: outDir },
    stdout: "pipe",
    stderr: "inherit",
  });
  const reader = (server.stdout as ReadableStream<Uint8Array>).getReader();
  let text = "";
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline && !/localhost:\d+/.test(text)) {
    const { value, done } = await reader.read();
    if (done) break;
    text += new TextDecoder().decode(value);
  }
  port = Number(/localhost:(\d+)/.exec(text)?.[1] ?? 0);
  expect(port).toBeGreaterThan(0);
});

afterAll(async () => {
  server.kill("SIGTERM");
  await Promise.race([server.exited, new Promise((done) => setTimeout(done, 3000))]);
  if (server.exitCode === null) server.kill("SIGKILL");
  Bun.spawnSync(["trash", parent]);
});

describe("phục vụ trang và API trên cùng một cổng", () => {
  test("trang có sẵn, trang riêng tư, trang không có", async () => {
    expect((await send("/")).body).toContain("trang chủ");
    const shell = await send("/ho-so");
    expect(shell.status).toBe(200);
    expect(shell.body).toContain("khung rỗng");
    const missing = await send("/khong-co-trang-nay");
    expect(missing.status).toBe(404);
    expect(missing.body).toContain("không có trang");
    expect((await send("/assets/khong-co.js")).status).toBe(404);
  });

  test("trang HTML đặt sẵn csrf_token, tệp tĩnh thì không", async () => {
    expect(String((await send("/")).headers["set-cookie"])).toContain("csrf_token=");
    expect((await send("/assets/tep.js")).headers["set-cookie"]).toBeUndefined();
  });

  test("/api/v1 trả JSON, không lưu đệm, có nosniff", async () => {
    const status = await send("/api/v1/server/status");
    expect(status.status).toBe(200);
    expect(JSON.parse(status.body)).toHaveProperty("online");
    expect(status.headers["cache-control"]).toBe("no-store");
    expect(status.headers["x-content-type-options"]).toBe("nosniff");
  });

  test("/api/v1 không có đường thì trả lỗi JSON, không trả trang HTML", async () => {
    const missing = await send("/api/v1/khong-co");
    expect(missing.status).toBe(404);
    expect(JSON.parse(missing.body).error.code).toBe("not_found");
  });

  test("không đọc được tệp dữ liệu hay tệp ngoài out/", async () => {
    expect((await send("/.mock-data/db.json")).status).toBe(404);
    expect((await send("/..%2f..%2fpackage.json")).status).toBe(404);
    expect((await send("/%E0%A4%A")).status).toBe(404);
  });

  test("thân quá 6 MB bị chặn", async () => {
    const huge = await send("/api/v1/auth/login", {
      method: "POST",
      body: "x".repeat(7 * 1024 * 1024),
    }).catch(() => ({ status: 413 }));
    expect(huge.status).toBe(413);
    expect((await send("/api/v1/server/status")).status).toBe(200);
  });

  test("tên máy lạ bị từ chối ở trang và ở API", async () => {
    expect((await send("/", { host: "ke-gian.example" })).status).toBe(403);
    expect((await send("/api/v1/me", { host: "ke-gian.example" })).status).toBe(403);
  });
});

describe("mock:reset", () => {
  test("từ chối khi máy chủ đang chạy", async () => {
    expect(isServerRunning(dataDir)).toBe(true);
    const logs: string[] = [];
    const result = await resetMockData({
      dir: dataDir,
      confirm: () => true,
      log: (line) => logs.push(line),
    });
    expect(result).toBe("server-running");
    expect(existsSync(join(dataDir, "db.json"))).toBe(true);
  });

  test("không xác nhận thì không xóa, xác nhận thì về dữ liệu ban đầu", async () => {
    const other = join(parent, "data-khac");
    mkdirSync(other);
    writeFileSync(join(other, "db.json"), "{}");
    writeFileSync(join(other, "giu-lai.txt"), "tệp khác");
    const log = () => {};
    expect(await resetMockData({ dir: other, confirm: () => false, log })).toBe("cancelled");
    expect(existsSync(join(other, "db.json"))).toBe(true);
    expect(await resetMockData({ dir: other, confirm: () => true, log })).toBe("done");
    expect(existsSync(join(other, "db.json"))).toBe(false);
    expect(existsSync(join(other, "giu-lai.txt"))).toBe(true);
  });
});
