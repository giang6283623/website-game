import { beforeEach, describe, expect, test } from "bun:test";
import { act, fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { App } from "../src/App.tsx";
import { resetMockSession } from "../src/api/mock/adapter.ts";
import { setMockConfig } from "../src/api/mock/config.ts";

/** Vẽ ứng dụng rồi chờ các yêu cầu API giả xong (độ trễ 0). */
async function renderAt(path: string) {
  let view: ReturnType<typeof render> | undefined;
  await act(async () => {
    view = render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
  return view as ReturnType<typeof render>;
}

const strip = () => document.querySelector<HTMLElement>(".banner-strip");

beforeEach(() => {
  resetMockSession();
  window.sessionStorage.clear();
  setMockConfig({ latencyMs: 0, mode: "normal", session: "guest" });
});

describe("dải Banner công khai (E1-S9)", () => {
  test("hiện banner đang bật trên đầu trang công khai, đứng trước thanh trạng thái", async () => {
    await renderAt("/");
    const node = strip();
    expect(node).toBeTruthy();
    expect(node?.textContent).toContain("Bảo trì máy chủ lúc 04:00 sáng thứ Sáu");
    expect(node?.tagName).toBe("ASIDE");
    expect(node?.getAttribute("aria-label")).toBe("Thông báo của ban quản trị");
    const shell = document.querySelector(".shell");
    expect(shell?.children[1] === node).toBe(true);
    expect(node?.nextElementSibling?.classList.contains("status-strip")).toBe(true);
  });

  test("có liên kết trong site tới /tin-tuc và nút đóng có tên", async () => {
    await renderAt("/");
    const link = strip()?.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/tin-tuc");
    expect(link?.textContent).toBe("Xem chi tiết");
    const close = strip()?.querySelector("button");
    expect(close?.getAttribute("aria-label")).toBe("Đóng thông báo");
  });

  test("bấm đóng thì ẩn dải và nhớ trong phiên", async () => {
    const first = await renderAt("/");
    const close = strip()?.querySelector("button");
    expect(close).toBeTruthy();
    await act(async () => {
      fireEvent.click(close as HTMLElement);
    });
    expect(strip()).toBeNull();
    expect(window.sessionStorage.getItem("issvn.banner.closed")).toBe("1");
    first.unmount();
    await renderAt("/tin-tuc");
    expect(strip()).toBeNull();
  });

  test("không hiện ở trang xác thực", async () => {
    await renderAt("/dang-nhap");
    expect(strip()).toBeNull();
  });

  test("API lỗi thì ẩn dải và trang vẫn chạy", async () => {
    setMockConfig({ latencyMs: 0, mode: "error", session: "guest" });
    await renderAt("/tin-tuc");
    expect(strip()).toBeNull();
    expect(document.getElementById("main")).toBeTruthy();
  });
});

describe("thanh trạng thái ngoại tuyến (G-25)", () => {
  test("hiện chữ ngoại tuyến, vòng rỗng, không có số người chơi", async () => {
    setMockConfig({ latencyMs: 0, mode: "offline", session: "guest" });
    await renderAt("/");
    const node = document.querySelector<HTMLElement>(".status-strip");
    expect(node?.getAttribute("aria-label")).toBe("Trạng thái máy chủ");
    expect(node?.querySelector(".status-strip__offline")?.textContent).toBe("Máy chủ ngoại tuyến");
    expect(node?.querySelector(".status-strip__dot")?.classList.contains("is-online")).toBe(false);
    expect(node?.querySelector(".status-strip__middle")?.textContent).toBe("");
    expect(node?.querySelector(".status-strip__right")?.textContent).toBe("Miễn phí · Tiếng Việt");
  });

  test("trực tuyến vẫn hiện chấm đặc và số người chơi", async () => {
    await renderAt("/");
    const node = document.querySelector<HTMLElement>(".status-strip");
    expect(node?.querySelector(".status-strip__online")?.textContent).toBe("Máy chủ trực tuyến");
    expect(node?.querySelector(".status-strip__dot")?.classList.contains("is-online")).toBe(true);
    expect(node?.querySelector(".status-strip__middle")?.textContent).toContain("người đang chơi");
  });
});
