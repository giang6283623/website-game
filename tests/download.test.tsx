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

describe("Tải game và Hướng dẫn (E1-S6)", () => {
  test("có một h1, đường dẫn và khung tải với phiên bản, dung lượng, ngày", async () => {
    await renderAt("/tai-game");
    expect(screen.getAllByRole("heading", { level: 1 }).length).toBe(1);
    expect(screen.getByRole("heading", { level: 1, name: "Tải game" })).toBeTruthy();
    const card = document.querySelector(".download-card") as HTMLElement;
    const facts = [...card.querySelectorAll(".download-card__fact dd")].map(
      (node) => node.textContent,
    );
    expect(facts).toEqual(["1.0.3", "1,2 GB", "28/10/2026"]);
    expect(document.title).toBe("Tải game | Infestation Việt Nam");
  });

  test("bảng yêu cầu máy có bốn dòng lấy từ API", async () => {
    await renderAt("/tai-game");
    const rows = [...document.querySelectorAll(".download-card__row")].map((row) => [
      row.querySelector("dt")?.textContent,
      row.querySelector("dd")?.textContent,
    ]);
    expect(rows).toEqual([
      ["Hệ điều hành", "Windows 7 trở lên (64 bit)"],
      ["Bộ nhớ", "4 GB RAM"],
      ["Ổ đĩa", "3 GB trống"],
      ["Mạng", "Cần kết nối internet"],
    ]);
  });

  test("nút tải trên máy tính là liên kết tải về, nút trên điện thoại bị khóa", async () => {
    await renderAt("/tai-game");
    const card = document.querySelector(".download-card") as HTMLElement;
    const desktop = card.querySelector(".installer--desktop");
    expect(desktop?.getAttribute("href")).toBe("https://example.invalid/issvn-setup-1.0.3.exe");
    expect(desktop?.hasAttribute("download")).toBe(true);
    const mobile = card.querySelector(".installer--mobile") as HTMLButtonElement;
    expect(mobile.disabled).toBe(true);
  });

  test("có khung cảnh báo Windows với nút sao chép liên kết", async () => {
    await renderAt("/tai-game");
    const warning = screen.getByRole("complementary", { name: "Game chỉ chạy trên Windows" });
    expect(within(warning).getByRole("button", { name: "Sao chép liên kết" })).toBeTruthy();
  });

  test("ba bước cài đặt có nút đúng đích, mục #huong-dan và #ho-tro tồn tại", async () => {
    await renderAt("/tai-game");
    expect(document.getElementById("huong-dan")).toBeTruthy();
    expect(document.getElementById("ho-tro")).toBeTruthy();
    const steps = [...document.querySelectorAll(".download-steps .step-card")];
    expect(steps.length).toBe(3);
    expect(steps.map((step) => step.querySelector("h3")?.textContent)).toEqual([
      "Tải bộ cài",
      "Cài đặt game",
      "Đăng nhập và chơi",
    ]);
    const second = within(steps[1] as HTMLElement).getByRole("link", {
      name: "Xem lỗi thường gặp",
    });
    expect(second.getAttribute("href")).toBe("/tai-game#ho-tro");
    const third = within(steps[2] as HTMLElement).getByRole("link", { name: "Tạo tài khoản" });
    expect(third.getAttribute("href")).toBe("/dang-ky");
  });

  test("hỏi đáp có bốn thẻ và hỗ trợ có hai kênh: Facebook thật, Discord tạm đặt #", async () => {
    await renderAt("/tai-game");
    expect(document.querySelectorAll(".faq-card").length).toBe(4);
    const channels = screen.getByRole("list", { name: "Kênh hỗ trợ" });
    const buttons = [...channels.querySelectorAll(".btn")];
    expect(buttons.map((button) => button.textContent)).toEqual(["Facebook", "Discord"]);
    expect(buttons.map((button) => button.getAttribute("href"))).toEqual([
      "https://www.facebook.com/groups/infestationsmmovietnam",
      "#",
    ]);
    for (const button of buttons) {
      expect(button.getAttribute("aria-disabled")).not.toBe("true");
    }
  });

  test("bộ cài chưa sẵn sàng thì ẩn khung tải và vẫn giữ hướng dẫn", async () => {
    setMockConfig({ latencyMs: 0, mode: "empty", session: "guest" });
    await renderAt("/tai-game");
    expect(document.querySelector(".download-card")).toBeNull();
    expect(screen.getByText("Chưa có bộ cài")).toBeTruthy();
    expect(document.getElementById("huong-dan")).toBeTruthy();
  });

  test("API lỗi thì hiện thông báo lỗi có nút thử lại và vẫn giữ hướng dẫn", async () => {
    setMockConfig({ latencyMs: 0, mode: "error", session: "guest" });
    await renderAt("/tai-game");
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeTruthy();
    expect(document.getElementById("ho-tro")).toBeTruthy();
  });
});
