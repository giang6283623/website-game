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

describe("Chi tiết vật phẩm (E1-S5)", () => {
  test("hiện đường dẫn, một h1 là tên vật phẩm và đủ bốn chỉ số", async () => {
    await renderAt("/kho-do/ak-74");
    expect(screen.getAllByRole("heading", { level: 1 }).length).toBe(1);
    expect(screen.getByRole("heading", { level: 1, name: "AK-74" })).toBeTruthy();
    const crumbs = screen.getByRole("navigation", { name: "Đường dẫn" });
    expect(within(crumbs).getByRole("link", { name: "Kho đồ" }).getAttribute("href")).toBe(
      "/kho-do",
    );
    expect(within(crumbs).getByText("AK-74").getAttribute("aria-current")).toBe("page");
    expect(document.querySelectorAll(".item-detail__stat").length).toBe(4);
    expect(document.title).toBe("AK-74 | Kho đồ Infestation");
  });

  test("cuối trang có bốn vật phẩm cùng nhóm, không có chính nó, và nút quay lại", async () => {
    await renderAt("/kho-do/ak-74");
    const list = screen.getByRole("list", { name: "Vật phẩm cùng nhóm" });
    const slugs = within(list)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(slugs).toEqual(["/kho-do/akm", "/kho-do/fal", "/kho-do/mp5a4", "/kho-do/desert-eagle"]);
    expect(screen.getByRole("link", { name: "Quay lại kho đồ" }).getAttribute("href")).toBe(
      "/kho-do",
    );
  });

  test("vật phẩm không có chỉ số chi tiết hiện dòng tóm tắt thay cho lưới", async () => {
    await renderAt("/kho-do/ba-lo-32-o");
    expect(screen.getByRole("heading", { level: 1, name: "BA LÔ 32 Ô" })).toBeTruthy();
    expect(document.querySelector(".item-detail__stats")).toBeNull();
    expect(document.querySelector(".item-detail__summary")?.textContent).toBe("Chứa 32 ô đồ");
  });

  test("địa chỉ không có vật phẩm thì hiện trang 404", async () => {
    await renderAt("/kho-do/khong-co-mon-nay");
    expect(screen.getByRole("heading", { level: 1, name: "Không tìm thấy trang" })).toBeTruthy();
  });

  test("API lỗi thì hiện thông báo lỗi có nút thử lại, không hiện 404", async () => {
    setMockConfig({ latencyMs: 0, mode: "error", session: "guest" });
    await renderAt("/kho-do/ak-74");
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeTruthy();
    expect(screen.queryByText("Không tìm thấy trang")).toBeNull();
  });
});
