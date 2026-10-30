import { beforeEach, describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { act, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { App } from "../src/App.tsx";
import { resetMockSession } from "../src/api/mock/adapter.ts";
import { setMockConfig } from "../src/api/mock/config.ts";

async function renderAt(path: string) {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );
    await new Promise((resolve) => setTimeout(resolve, 80));
  });
}

beforeEach(() => {
  resetMockSession();
  setMockConfig({ latencyMs: 0, mode: "normal", session: "guest" });
});

describe("Quy tắc cộng đồng (E1-S7)", () => {
  test("có một h1, ngày cập nhật và câu mở đầu", async () => {
    await renderAt("/quy-tac");
    expect(screen.getAllByRole("heading", { level: 1 }).length).toBe(1);
    expect(screen.getByRole("heading", { level: 1, name: "Quy tắc cộng đồng" })).toBeTruthy();
    expect(
      screen.getByText("Cập nhật lần cuối 28/10/2026. Bốn quy tắc giúp máy chủ vui và công bằng."),
    ).toBeTruthy();
    expect(document.title).toBe("Quy tắc cộng đồng | Infestation Việt Nam");
  });

  test("bốn quy tắc có số thứ tự, mã neo và nội dung đúng", async () => {
    await renderAt("/quy-tac");
    const reading = document.querySelector(".rules") as HTMLElement;
    const headings = within(reading)
      .getAllByRole("heading", { level: 2 })
      .map((node) => node.textContent);
    expect(headings).toEqual([
      "1. Tôn trọng người chơi khác",
      "2. Không gian lận",
      "3. Bảo vệ tài khoản",
      "4. Xử lý vi phạm",
    ]);
    for (const id of ["quy-tac-1", "quy-tac-2", "quy-tac-3", "quy-tac-4"]) {
      expect(document.getElementById(id)).toBeTruthy();
    }
    expect(document.querySelectorAll(".rules__list li").length).toBe(6);
    expect(document.getElementById("quy-tac-3")?.querySelector("ul.rules__list")).toBeNull();
  });

  test("mục lục có bốn liên kết neo và đánh dấu mục đang đọc", async () => {
    await renderAt("/quy-tac");
    const toc = screen.getByRole("navigation", { name: "Mục lục quy tắc cộng đồng" });
    const links = within(toc).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/quy-tac#quy-tac-1",
      "/quy-tac#quy-tac-2",
      "/quy-tac#quy-tac-3",
      "/quy-tac#quy-tac-4",
    ]);
    // Trong môi trường thử không có bố cục, nên chỉ kiểm tra có đúng một mục được đánh dấu.
    const current = links.filter((link) => link.getAttribute("aria-current") === "location");
    expect(current.length).toBe(1);
  });

  test("bảng mức xử lý có ba hàng, có ghi chú và dòng của Trạm trưởng", async () => {
    await renderAt("/quy-tac");
    const table = screen.getByRole("list", { name: "Mức xử lý vi phạm" });
    const rows = [...table.querySelectorAll("li")].map((row) =>
      [...row.querySelectorAll("span")].map((cell) => cell.textContent),
    );
    expect(rows).toEqual([
      ["Lần 1", "Cảnh cáo"],
      ["Lần 2", "Khóa 7 ngày"],
      ["Lần 3", "Khóa vĩnh viễn"],
    ]);
    expect(screen.getByText("Gian lận nặng có thể bị khóa vĩnh viễn ngay lần đầu.")).toBeTruthy();
    expect(screen.getByText("Thấy ai vi phạm? Báo cho ban quản trị qua kênh hỗ trợ.")).toBeTruthy();
  });
});

describe("dựng sẵn HTML của trang chữ", () => {
  test("Quy tắc cộng đồng có đủ chữ ngay trong HTML dựng sẵn", () => {
    const result = Bun.spawnSync(
      [
        "bun",
        "run",
        "--preload",
        "./scripts/runtime-stubs.ts",
        "scripts/render-path.tsx",
        "/quy-tac",
      ],
      { cwd: resolve(import.meta.dir, ".."), timeout: 30_000, killSignal: "SIGKILL" },
    );
    expect(result.exitCode).toBe(0);
    const html = result.stdout.toString();
    expect(html).toContain("<h1");
    expect(html).toContain("1. Tôn trọng người chơi khác");
    expect(html).toContain("Khóa vĩnh viễn");
    expect(html).not.toContain("<!--$!-->");
  });
});
