import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { App } from "../src/App.tsx";
import { resetMockSession } from "../src/api/mock/adapter.ts";
import { setMockConfig } from "../src/api/mock/config.ts";
import { ErrorBoundary } from "../src/components/ErrorBoundary/ErrorBoundary.tsx";
import { Notice } from "../src/components/Notice/Notice.tsx";

function Where() {
  const location = useLocation();
  return <output data-testid="where">{`${location.pathname}${location.search}`}</output>;
}

async function renderAt(path: string) {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
        <Where />
      </MemoryRouter>,
    );
    await new Promise((resolve) => setTimeout(resolve, 60));
  });
}

const state = { broken: true };

function Bomb() {
  if (state.broken) throw new Error("chi-tiet-ky-thuat-bi-mat");
  return <p>Đã sống lại</p>;
}

beforeEach(() => {
  resetMockSession();
  setMockConfig({ latencyMs: 0, mode: "normal", session: "guest" });
});

describe("trang 404", () => {
  test("hiện đúng chữ, một h1 và nút Về trang chủ", async () => {
    await renderAt("/khong-co-trang-nay");
    expect(screen.getAllByRole("heading", { level: 1 }).length).toBe(1);
    expect(screen.getByRole("heading", { level: 1, name: "Không tìm thấy trang" })).toBeTruthy();
    expect(screen.getByText("404")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Về trang chủ" }).getAttribute("href")).toBe("/");
  });
});

describe("khu quản trị (403)", () => {
  test("người chơi thường thấy trang 403, vẫn có đầu trang và chân trang, không bị chuyển hướng", async () => {
    setMockConfig({ latencyMs: 0, session: "user" });
    await renderAt("/quan-tri/bai-viet");
    expect(screen.getByTestId("where").textContent).toBe("/quan-tri/bai-viet");
    expect(screen.getAllByRole("heading", { level: 1 }).length).toBe(1);
    expect(screen.getByRole("heading", { level: 1, name: "Không được phép vào" })).toBeTruthy();
    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("Trang này chỉ dành cho quản trị viên")).toBeTruthy();
    expect(
      within(alert).getByText("Tài khoản của bạn không có quyền xem trang quản trị."),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "Về trang chủ" }).getAttribute("href")).toBe("/");
    expect(screen.getAllByRole("navigation", { name: "Điều hướng chính" }).length).toBeGreaterThan(
      0,
    );
    expect(document.querySelector("footer")).not.toBeNull();
    expect(document.title).toBe("Không có quyền truy cập | Infestation Việt Nam");
  });

  test("khách được chuyển tới đăng nhập kèm đường dẫn để quay lại", async () => {
    await renderAt("/quan-tri/bai-viet?trang=2");
    expect(screen.getByTestId("where").textContent).toBe(
      `/dang-nhap?tiep=${encodeURIComponent("/quan-tri/bai-viet?trang=2")}`,
    );
  });

  test("quản trị viên không thấy trang 403", async () => {
    setMockConfig({ latencyMs: 0, session: "admin" });
    await renderAt("/quan-tri/bai-viet");
    expect(screen.queryByText("Không được phép vào")).toBeNull();
    expect(screen.getByTestId("where").textContent).toBe("/quan-tri/bai-viet");
  });
});

describe("ErrorBoundary (500)", () => {
  let errorSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    errorSpy = spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => errorSpy.mockRestore());

  test("lỗi khi vẽ hiện trang 500, không lộ chi tiết kỹ thuật, nút Thử lại vẽ lại", () => {
    state.broken = true;
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Có lỗi ở máy chủ" })).toBeTruthy();
    expect(screen.getByText("500")).toBeTruthy();
    expect(document.body.textContent).not.toContain("chi-tiet-ky-thuat-bi-mat");
    expect(screen.getByRole("alert")).toBeTruthy();

    state.broken = false;
    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(screen.getByText("Đã sống lại")).toBeTruthy();
    expect(screen.queryByText("500")).toBeNull();
  });

  test("lỗi còn thì bấm Thử lại vẫn hiện trang 500", () => {
    state.broken = true;
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(screen.getByText("500")).toBeTruthy();
  });

  test("đổi resetKey thì thoát trạng thái lỗi", () => {
    state.broken = true;
    const view = render(
      <MemoryRouter>
        <ErrorBoundary resetKey="/a">
          <Bomb />
        </ErrorBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByText("500")).toBeTruthy();
    state.broken = false;
    view.rerender(
      <MemoryRouter>
        <ErrorBoundary resetKey="/b">
          <Bomb />
        </ErrorBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByText("Đã sống lại")).toBeTruthy();
  });
});

describe("Notice", () => {
  test("lỗi dùng role alert, thành công dùng role status", () => {
    render(
      <>
        <Notice tone="error" label="Lỗi nhãn">
          Nội dung lỗi
        </Notice>
        <Notice tone="success" label="Đã lưu nhãn">
          Nội dung xong
        </Notice>
      </>,
    );
    expect(within(screen.getByRole("alert")).getByText("Lỗi nhãn")).toBeTruthy();
    expect(within(screen.getByRole("status")).getByText("Đã lưu nhãn")).toBeTruthy();
  });
});

describe("chân trang trên điện thoại", () => {
  test("đoạn giới thiệu chỉ bật ở Trang chủ, các trang khác bỏ theo bản vẽ", async () => {
    await renderAt("/");
    expect(document.querySelector("footer")?.classList.contains("footer--intro-mobile")).toBe(true);
  });

  test("trang Kho đồ không bật đoạn giới thiệu trên điện thoại", async () => {
    await renderAt("/kho-do");
    expect(document.querySelector("footer")?.classList.contains("footer--intro-mobile")).toBe(
      false,
    );
  });
});
