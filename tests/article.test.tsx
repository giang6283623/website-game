import { beforeEach, describe, expect, test } from "bun:test";
import { act, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { App } from "../src/App.tsx";
import { resetMockSession } from "../src/api/mock/adapter.ts";
import { setMockConfig } from "../src/api/mock/config.ts";
import { Prose } from "../src/components/Prose/Prose.tsx";
import { readingMinutes } from "../src/lib/format.ts";
import { htmlToText } from "../src/lib/sanitize.ts";

const FULL_POST = "/tin-tuc/cap-nhat-1-0-3-sua-loi-va-can-bang-lai-vu-khi";
const COVER_POST = "/tin-tuc/cuoi-tuan-nhan-doi-kinh-nghiem";

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

describe("Chi tiết bài viết (E1-S4)", () => {
  test("một h1 là tiêu đề bài, đường dẫn có ba mục và mục cuối là trang hiện tại", async () => {
    await renderAt(FULL_POST);
    expect(screen.getAllByRole("heading", { level: 1 }).length).toBe(1);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Cập nhật 1.0.3: sửa lỗi và cân bằng lại vũ khí",
      }),
    ).toBeTruthy();
    const crumbs = screen.getByRole("navigation", { name: "Đường dẫn" });
    expect(within(crumbs).getByRole("link", { name: "Trang chủ" }).getAttribute("href")).toBe("/");
    expect(within(crumbs).getByRole("link", { name: "Tin tức" }).getAttribute("href")).toBe(
      "/tin-tuc",
    );
    expect(within(crumbs).getByText("Bài viết").getAttribute("aria-current")).toBe("page");
    expect(document.title).toBe(
      "Cập nhật 1.0.3: sửa lỗi và cân bằng lại vũ khí | Tin tức Infestation",
    );
  });

  test("dòng thông tin có loại, ngày đầy đủ, tác giả và thời gian đọc", async () => {
    await renderAt(FULL_POST);
    expect(document.querySelector(".article-head .tag")?.textContent).toBe("Cập nhật");
    expect(document.querySelector(".article-head__info")?.textContent).toBe(
      "28/10/2026 · Ban quản trị · Đọc 1 phút",
    );
  });

  test("nội dung bài có tiêu đề con, danh sách ba mục và dòng Trạm trưởng", async () => {
    await renderAt(FULL_POST);
    const headings = within(document.querySelector(".prose") as HTMLElement).getAllByRole(
      "heading",
      { level: 2 },
    );
    expect(headings.map((heading) => heading.textContent)).toEqual(["Sửa lỗi", "Cân bằng vũ khí"]);
    expect(document.querySelectorAll(".prose li").length).toBe(3);
    expect(screen.getByText("Trạm trưởng · 88.1 MHz")).toBeTruthy();
  });

  test("cuối bài có ba bài khác, không có chính bài này, và nút quay lại", async () => {
    await renderAt(FULL_POST);
    const list = screen.getByRole("list", { name: "Tin mới khác" });
    const hrefs = within(list)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs.length).toBe(3);
    expect(hrefs.includes(FULL_POST)).toBe(false);
    expect(screen.getByRole("link", { name: "Quay lại tin tức" }).getAttribute("href")).toBe(
      "/tin-tuc",
    );
  });

  test("bài có ảnh bìa hiện khung ảnh đại diện, bài không có ảnh thì bỏ khung", async () => {
    await renderAt(COVER_POST);
    const image = document.querySelector(".article-hero img");
    expect(image?.getAttribute("src")).toBe("/assets/game/items/exp-flare.webp");
    expect(image?.getAttribute("alt")).toBe("");
  });

  test("bài không có ảnh bìa không vẽ khung ảnh đại diện", async () => {
    await renderAt(FULL_POST);
    expect(document.querySelector(".article-hero")).toBeNull();
  });

  test("địa chỉ không có bài hoặc bài nháp thì hiện trang 404", async () => {
    await renderAt("/tin-tuc/khong-co-bai-nay");
    expect(screen.getByRole("heading", { level: 1, name: "Không tìm thấy trang" })).toBeTruthy();
  });

  test("bài nháp không lộ ra ngoài và hiện trang 404", async () => {
    await renderAt("/tin-tuc/huong-dan-tao-gia-toc-dau-tien");
    expect(screen.getByRole("heading", { level: 1, name: "Không tìm thấy trang" })).toBeTruthy();
  });

  test("API lỗi thì hiện thông báo lỗi có nút thử lại, không hiện 404", async () => {
    setMockConfig({ latencyMs: 0, mode: "error", session: "guest" });
    await renderAt(FULL_POST);
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeTruthy();
    expect(screen.queryByText("Không tìm thấy trang")).toBeNull();
  });
});

describe("Prose và thời gian đọc", () => {
  test("bỏ thẻ script, thuộc tính sự kiện và liên kết javascript", () => {
    const { container } = render(
      <Prose
        html={
          '<p>Chào</p><script>alert(1)</script><img src="/a.webp" onerror="alert(1)"><a href="javascript:alert(1)">bấm</a>'
        }
      />,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")?.getAttribute("onerror")).toBeNull();
    expect(container.querySelector("a")?.getAttribute("href")).toBeNull();
    expect(container.textContent).toContain("Chào");
  });

  test("htmlToText bỏ thẻ và gộp khoảng trắng", () => {
    expect(htmlToText("<p>Một  hai</p><ul><li>ba</li></ul>")).toBe("Một hai ba");
  });

  test("thời gian đọc tính theo 200 chữ mỗi phút, tối thiểu 1 phút", () => {
    expect(readingMinutes("một hai ba")).toBe(1);
    expect(readingMinutes(Array.from({ length: 450 }, () => "chữ").join(" "))).toBe(3);
  });
});
