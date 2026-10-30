import { beforeEach, describe, expect, test } from "bun:test";
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

describe("Tin tức (E1-S2)", () => {
  test("có một h1, đường dẫn và năm chip lọc với Tất cả đang chọn", async () => {
    await renderAt("/tin-tuc");
    expect(screen.getAllByRole("heading", { level: 1 }).length).toBe(1);
    expect(screen.getByRole("heading", { level: 1, name: "Tin tức" })).toBeTruthy();
    const filters = screen.getByRole("navigation", { name: "Lọc theo loại bài" });
    const chips = within(filters).getAllByRole("link");
    expect(chips.map((chip) => chip.textContent)).toEqual([
      "Tất cả",
      "Tin tức",
      "Hướng dẫn",
      "Sự kiện",
      "Cập nhật",
    ]);
    expect(chips.map((chip) => chip.getAttribute("href"))).toEqual([
      "/tin-tuc",
      "/tin-tuc?loai=tin-tuc",
      "/tin-tuc?loai=huong-dan",
      "/tin-tuc?loai=su-kien",
      "/tin-tuc?loai=cap-nhat",
    ]);
    expect(chips.map((chip) => chip.getAttribute("aria-current"))).toEqual([
      "page",
      null,
      null,
      null,
      null,
    ]);
  });

  test("trang 1 không lọc có một bài nổi bật và 7 dòng, bài nổi bật không lặp trong danh sách", async () => {
    await renderAt("/tin-tuc");
    const featured = screen.getByRole("article", { name: "Bài nổi bật" });
    const title = within(featured).getByRole("heading", { level: 2 });
    expect(title.textContent).toMatch(/nhân đôi kinh nghiệm/i);
    const href = within(title).getByRole("link").getAttribute("href");
    expect(href).toBe("/tin-tuc/cuoi-tuan-nhan-doi-kinh-nghiem");
    const rows = document.querySelectorAll(".news-list .news-row");
    expect(rows.length).toBe(7);
    const rowHrefs = [...rows].map((row) => row.querySelector("a")?.getAttribute("href"));
    expect(rowHrefs.includes(href)).toBe(false);
    expect(document.querySelector(".news-filters__count")?.textContent).toBe("8 bài viết");
  });

  test("bài nổi bật có hai nút Đọc tiếp cùng đến bài viết và ảnh bìa là ảnh thật", async () => {
    await renderAt("/tin-tuc");
    const featured = screen.getByRole("article", { name: "Bài nổi bật" });
    const buttons = featured.querySelectorAll(".featured-news__action");
    expect(buttons.length).toBe(2);
    for (const button of buttons) {
      expect(button.getAttribute("href")).toBe("/tin-tuc/cuoi-tuan-nhan-doi-kinh-nghiem");
    }
    const image = featured.querySelector("img");
    expect(image?.getAttribute("src")).toBe("/assets/game/items/exp-flare.webp");
    expect(image?.getAttribute("alt")).toBe("");
  });

  test("lọc theo loại: không còn bài nổi bật, mọi dòng đúng loại và tiêu đề trang đổi", async () => {
    await renderAt("/tin-tuc?loai=su-kien");
    expect(screen.queryByRole("article", { name: "Bài nổi bật" })).toBeNull();
    const filters = screen.getByRole("navigation", { name: "Lọc theo loại bài" });
    expect(
      within(filters).getByRole("link", { name: "Sự kiện" }).getAttribute("aria-current"),
    ).toBe("page");
    const tags = [...document.querySelectorAll(".news-row .tag")].map((tag) => tag.textContent);
    expect(tags.length).toBeGreaterThan(0);
    expect(tags.every((text) => text === "Sự kiện")).toBe(true);
    const count = document.querySelector(".news-filters__count")?.textContent;
    expect(count).toBe(`${tags.length} bài viết`);
    expect(document.title).toBe("Sự kiện | Tin tức | Infestation Việt Nam");
  });

  test("loại lạ trên địa chỉ rơi về Tất cả", async () => {
    await renderAt("/tin-tuc?loai=khong-co");
    const filters = screen.getByRole("navigation", { name: "Lọc theo loại bài" });
    expect(within(filters).getByRole("link", { name: "Tất cả" }).getAttribute("aria-current")).toBe(
      "page",
    );
    expect(screen.getByRole("article", { name: "Bài nổi bật" })).toBeTruthy();
  });

  test("trang quá số trang hiện trạng thái rỗng, không hiện bài nổi bật", async () => {
    await renderAt("/tin-tuc?trang=9");
    expect(screen.getByText("Chưa có tin")).toBeTruthy();
    expect(screen.queryByRole("article", { name: "Bài nổi bật" })).toBeNull();
  });

  test("máy chủ trả rỗng thì hiện trạng thái rỗng", async () => {
    setMockConfig({ latencyMs: 0, mode: "empty", session: "guest" });
    await renderAt("/tin-tuc");
    expect(screen.getByText("Chưa có tin")).toBeTruthy();
  });

  test("API lỗi thì hiện thông báo lỗi có nút thử lại", async () => {
    setMockConfig({ latencyMs: 0, mode: "error", session: "guest" });
    await renderAt("/tin-tuc");
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeTruthy();
  });

  test("một trang thì không vẽ phân trang", async () => {
    await renderAt("/tin-tuc");
    expect(screen.queryByRole("navigation", { name: "Phân trang" })).toBeNull();
  });
});
