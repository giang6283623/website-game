import { beforeEach, describe, expect, test } from "bun:test";
import { act, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { App } from "../src/App.tsx";
import { resetMockSession } from "../src/api/mock/adapter.ts";
import { setMockConfig } from "../src/api/mock/config.ts";

/** Vẽ ứng dụng ở một đường dẫn rồi chờ các yêu cầu API giả (độ trễ 0) xong. */
async function renderAt(path: string) {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );
    await new Promise((resolve) => setTimeout(resolve, 40));
  });
}

beforeEach(() => {
  resetMockSession();
  setMockConfig({ latencyMs: 0, mode: "normal", session: "guest" });
});

describe("trang chủ (E1-S1)", () => {
  test("có đúng một h1 và hai nút đầu trang dẫn đến tải game", async () => {
    await renderAt("/");
    const h1 = screen.getAllByRole("heading", { level: 1 });
    expect(h1.length).toBe(1);
    const main = document.getElementById("main") as HTMLElement;
    const download = within(main).getAllByRole("link", { name: /tải game/i })[0] as HTMLElement;
    expect(download.getAttribute("href")).toBe("/tai-game");
    const guide = within(main).getAllByRole("link", { name: /xem hướng dẫn/i });
    expect(guide.some((link) => link.getAttribute("href") === "/tai-game#huong-dan")).toBe(true);
  });

  test("hiện ba thẻ bước theo thứ tự có đánh số", async () => {
    await renderAt("/");
    const list = document.querySelector(".home-steps__list") as HTMLElement;
    expect(list.tagName).toBe("OL");
    expect(list.querySelectorAll("li.step-card").length).toBe(3);
    const titles = [...list.querySelectorAll("h3")].map((node) => node.textContent);
    expect(titles.length).toBe(3);
  });

  test("tin mới lấy năm dòng đầu của danh sách và không có bài chỉ mở bằng địa chỉ", async () => {
    await renderAt("/");
    const rows = document.querySelectorAll(".home-news .news-row");
    expect(rows.length).toBeGreaterThanOrEqual(5);
    const titles = [...document.querySelectorAll(".home-news .news-row__title")].map(
      (node) => node.textContent ?? "",
    );
    expect(titles.length).toBe(5);
    expect(titles.some((title) => title.includes("1.0.3"))).toBe(false);
  });

  test("bảng top sinh tồn có năm hàng và nhãn cột GameDollar", async () => {
    await renderAt("/");
    const table = screen.getByRole("table", { name: /GameDollar cao nhất/i });
    expect(within(table).getAllByRole("row").length).toBe(6);
    expect(within(table).getByRole("columnheader", { name: "GameDollar" })).toBeTruthy();
  });

  test("kho đồ sinh tồn hiện bốn vật phẩm chọn sẵn, mỗi vật phẩm là một liên kết", async () => {
    await renderAt("/");
    const slots = document.querySelectorAll(".home-items .item-slot");
    expect(slots.length).toBe(4);
    for (const slot of slots) {
      const link = slot.matches("a") ? slot : slot.querySelector("a");
      expect(link?.getAttribute("href")).toMatch(/^\/kho-do/);
    }
  });

  test("có số người đang chơi khi máy chủ báo trực tuyến", async () => {
    await renderAt("/");
    const facts = document.querySelector(".home-facts__grid") as HTMLElement;
    expect(facts.className).toContain("home-facts__grid--4");
    expect(facts.querySelectorAll(".fact").length).toBe(6);
  });

  test("ẩn ô người đang chơi khi máy chủ game ngoại tuyến, không hiện số 0 sai", async () => {
    setMockConfig({ latencyMs: 0, mode: "offline", session: "guest" });
    await renderAt("/");
    const facts = document.querySelector(".home-facts__grid") as HTMLElement;
    expect(facts.className).toContain("home-facts__grid--3");
    expect(facts.textContent ?? "").not.toMatch(/^0\b/);
  });

  test("khi API lỗi, mỗi khối dữ liệu hiện thông báo lỗi riêng với nút thử lại", async () => {
    setMockConfig({ latencyMs: 0, mode: "error", session: "guest" });
    await renderAt("/");
    const alerts = within(document.getElementById("main") as HTMLElement).getAllByRole("alert");
    expect(alerts.length).toBeGreaterThanOrEqual(2);
    for (const alert of alerts) {
      expect(within(alert).getByRole("button", { name: /thử lại/i })).toBeTruthy();
    }
  });

  test("khi API rỗng, danh sách tin hiện trạng thái rỗng", async () => {
    setMockConfig({ latencyMs: 0, mode: "empty", session: "guest" });
    await renderAt("/");
    const news = document.querySelector(".home-news") as HTMLElement;
    expect(within(news).getByRole("status")).toBeTruthy();
    expect(news.querySelectorAll(".news-row").length).toBe(0);
  });
});
