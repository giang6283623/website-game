// Dựng website tĩnh vào out/ bằng bộ dựng gốc của Bun (E0-S1).
import { existsSync } from "node:fs";
import { cp, mkdir } from "node:fs/promises";
import { basename, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, "out");
const apiMode = process.env.API_MODE ?? "mock";

// In các giá trị đang dùng để thấy file .env nào đã được nạp (Bun chọn file theo NODE_ENV).
console.log(
  `build: NODE_ENV=${process.env.NODE_ENV ?? "(chưa đặt)"} API_MODE=${apiMode} SITE_URL=${process.env.SITE_URL || "(trống)"}`,
);

// Dọn out/ bằng trash (luật xóa an toàn của dự án). Không dùng rm.
if (existsSync(outDir)) {
  if (!Bun.which("trash")) {
    console.error(
      "Thiếu lệnh trash. macOS 14 trở lên có sẵn. Cài trash-cli trên Linux hoặc npm i -g trash-cli.",
    );
    process.exit(1);
  }
  const trashed = Bun.spawnSync(["trash", outDir], { stdout: "inherit", stderr: "inherit" });
  if (trashed.exitCode !== 0) process.exit(trashed.exitCode ?? 1);
}

const gen = Bun.spawnSync(["bun", "run", "scripts/gen-theme.ts"], {
  cwd: root,
  stdout: "inherit",
  stderr: "inherit",
});
if (gen.exitCode !== 0) process.exit(gen.exitCode ?? 1);

const result = await Bun.build({
  entrypoints: [resolve(root, "src/index.html")],
  outdir: outDir,
  target: "browser",
  minify: true,
  splitting: true,
  sourcemap: "none",
  publicPath: "/",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    // mock: API giả chạy trong trình duyệt. mock-server: gọi mạng tới scripts/mock-server.ts.
    // Đặt API_MODE=real khi đã có máy chủ API thật (sau quyết định D-12).
    "process.env.API_MODE": JSON.stringify(apiMode),
    // Gốc địa chỉ công khai cho canonical và og:url. Để trống khi chưa chọn tên miền (D-08).
    "process.env.SITE_URL": JSON.stringify(process.env.SITE_URL ?? ""),
  },
  naming: {
    entry: "[dir]/[name].[ext]",
    chunk: "assets/[name]-[hash].[ext]",
    asset: "assets/[name]-[hash].[ext]",
  },
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

await mkdir(outDir, { recursive: true });
await cp(resolve(root, "public"), outDir, { recursive: true });

// Bộ dựng gộp CSS của mọi trang vào tệp CSS của index.html và còn ghi thêm CSS riêng cho từng gói trang nạp lười.
// Các tệp riêng đó không được HTML hay JS nào gọi tới, nên bỏ đi để không phát hành tệp thừa (xóa bằng trash).
const indexHtml = await Bun.file(resolve(outDir, "index.html")).text();
const orphans = result.outputs.filter(
  (output) => output.path.endsWith(".css") && !indexHtml.includes(basename(output.path)),
);
if (orphans.length > 0) {
  const removed = Bun.spawnSync(["trash", ...orphans.map((output) => output.path)], {
    stdout: "inherit",
    stderr: "inherit",
  });
  if (removed.exitCode !== 0) process.exit(removed.exitCode ?? 1);
}
const kept = result.outputs.filter((output) => !orphans.includes(output));

// Dựng sẵn HTML cho trang công khai. Chạy bằng Bun trực tiếp với tệp nạp trước bỏ qua CSS.
const prerender = Bun.spawnSync(
  ["bun", "run", "--preload", "./scripts/runtime-stubs.ts", "scripts/prerender.tsx"],
  { cwd: root, stdout: "inherit", stderr: "inherit", env: process.env },
);
if (prerender.exitCode !== 0) process.exit(prerender.exitCode ?? 1);
// bun run in danh sách script và vẫn thoát mã 0 khi không thấy tệp, nên kiểm kết quả thật.
for (const file of ["404.html", "200.html", "index.html", "tin-tuc/index.html"]) {
  if (!existsSync(resolve(outDir, file))) {
    console.error(`build: bước dựng sẵn HTML không tạo ra out/${file}`);
    process.exit(1);
  }
}
console.log(`build: ${kept.length} tệp trong out/`);
for (const output of kept)
  console.log(`  ${output.path.replace(`${root}/`, "")} ${(output.size / 1024).toFixed(1)} KB`);
