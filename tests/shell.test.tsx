import { beforeEach, describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { App } from "../src/App.tsx";
import { resetMockSession } from "../src/api/mock/adapter.ts";
import { setMockConfig } from "../src/api/mock/config.ts";

/** Vẽ ứng dụng rồi chờ các yêu cầu API giả xong (độ trễ 0) để mọi cập nhật trạng thái nằm trong act. */
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

beforeEach(() => {
  resetMockSession();
  setMockConfig({ latencyMs: 0 });
});

describe("khung trang", () => {
  test("có liên kết bỏ qua, vùng nội dung chính và đúng một h1 trên trang chủ", async () => {
    await renderAt("/");
    expect(
      screen.getByRole("link", { name: "Bỏ qua đến nội dung chính" }).getAttribute("href"),
    ).toBe("#main");
    expect(document.getElementById("main")).toBeTruthy();
    expect(screen.getAllByRole("heading", { level: 1 }).length).toBe(1);
  });

  test("điều hướng chính sáng đúng mục theo đường dẫn", async () => {
    await renderAt("/");
    const nav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.textContent?.replace(/^\d+\.\d/, ""))).toEqual([
      "Trang chủ",
      "Tin tức",
      "Kho đồ",
      "Xếp hạng",
      "Hồ sơ",
    ]);
    const current = links.filter((link) => link.getAttribute("aria-current") === "page");
    expect(current.length).toBe(1);
    expect(current[0]?.getAttribute("href")).toBe("/");
  });

  test("trang không có trong bảng hiện 404 và không sáng mục nào", async () => {
    await renderAt("/khong-co-trang-nay");
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    const nav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    expect(
      within(nav)
        .queryAllByRole("link")
        .some((link) => link.getAttribute("aria-current") === "page"),
    ).toBe(false);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe(
      "noindex, nofollow",
    );
  });

  test("cập nhật tiêu đề trang theo đường dẫn", async () => {
    await renderAt("/");
    await waitFor(() => expect(document.title).toContain("Infestation Việt Nam"));
    expect(document.querySelector('meta[name="description"]')).toBeTruthy();
  });

  test("thanh trạng thái hiện máy chủ trực tuyến và số người chơi", async () => {
    await renderAt("/");
    await waitFor(() => expect(screen.getByText(/người đang chơi/)).toBeTruthy());
    expect(screen.getByText("Máy chủ trực tuyến")).toBeTruthy();
  });

  test("khách thấy nút Đăng nhập và Đăng ký", async () => {
    await renderAt("/");
    await waitFor(() =>
      expect(screen.getAllByRole("link", { name: "Đăng ký" }).length).toBeGreaterThan(0),
    );
    expect(screen.getAllByRole("link", { name: "Đăng nhập" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /Tài khoản của/ })).toBeNull();
  });
});

describe("menu tài khoản", () => {
  async function openMenu() {
    setMockConfig({ latencyMs: 0, session: "user" });
    await renderAt("/");
    const chips = await screen.findAllByRole("button", { name: /Tài khoản của/ });
    const chip = chips[0] as HTMLElement;
    fireEvent.click(chip);
    return chip;
  }

  test("mở menu có các mục hồ sơ, đổi mật khẩu và đăng xuất", async () => {
    const chip = await openMenu();
    expect(chip.getAttribute("aria-expanded")).toBe("true");
    const menu = screen.getByRole("menu");
    const items = within(menu).getAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual(["Hồ sơ", "Đổi mật khẩu", "Đăng xuất"]);
  });

  test("Escape đóng menu và trả lấy nét về chip", async () => {
    const chip = await openMenu();
    const first = within(screen.getByRole("menu")).getAllByRole("menuitem")[0] as HTMLElement;
    first.focus();
    fireEvent.keyDown(first, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement === chip).toBe(true);
  });

  test("mũi tên xuống đi qua các mục và quay vòng", async () => {
    await openMenu();
    const items = within(screen.getByRole("menu")).getAllByRole("menuitem") as HTMLElement[];
    items[0]?.focus();
    fireEvent.keyDown(items[0] as HTMLElement, { key: "ArrowDown" });
    expect(document.activeElement === items[1]).toBe(true);
    items[2]?.focus();
    fireEvent.keyDown(items[2] as HTMLElement, { key: "ArrowDown" });
    expect(document.activeElement === items[0]).toBe(true);
  });

  test("bấm ra ngoài đóng menu", async () => {
    await openMenu();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  test("Đăng xuất đưa về khách", async () => {
    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Đăng xuất" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: /Tài khoản của/ })).toBeNull());
    expect(screen.getAllByRole("link", { name: "Đăng nhập" }).length).toBeGreaterThan(0);
  });

  test("người chơi thường không thấy mục Quản trị", async () => {
    await openMenu();
    expect(screen.queryByRole("menuitem", { name: "Quản trị" })).toBeNull();
  });

  test("quản trị viên thấy mục Quản trị", async () => {
    setMockConfig({ latencyMs: 0, session: "admin" });
    await renderAt("/");
    const chips = await screen.findAllByRole("button", { name: /Tài khoản của/ });
    fireEvent.click(chips[0] as HTMLElement);
    expect(screen.getByRole("menuitem", { name: "Quản trị" })).toBeTruthy();
  });
});

/** Dựng sẵn HTML ở tiến trình riêng (xem scripts/render-path.tsx). Có giới hạn thời gian. */
function renderApp(path: string): string {
  const result = Bun.spawnSync(
    ["bun", "run", "--preload", "./scripts/runtime-stubs.ts", "scripts/render-path.tsx", path],
    { cwd: resolve(import.meta.dir, ".."), timeout: 30_000, killSignal: "SIGKILL" },
  );
  if (result.exitCode !== 0) throw new Error(`Dựng sẵn ${path} lỗi: ${result.stderr.toString()}`);
  return result.stdout.toString();
}

describe("dựng sẵn HTML", () => {
  test("trang chủ có h1, đầu trang, chân trang và nội dung trang nạp lười trong chuỗi HTML", () => {
    const html = renderApp("/");
    expect(html).toContain("<h1");
    expect(html).toContain("Nơi sinh tồn");
    expect(html).not.toContain("<!--$!-->");
    expect(html).toContain("Điều hướng chính");
    expect(html).toContain("<footer");
    expect(html).not.toContain("Tài khoản của");
  });

  test("trang Kho đồ dựng sẵn có đủ khung và tiêu đề", () => {
    const html = renderApp("/kho-do");
    expect(html).toContain("<h1");
    expect(html).toContain("Tra cứu mọi vật phẩm");
  });

  test("đường dẫn lạ dựng ra trang 404", () => {
    const html = renderApp("/khong-co");
    expect(html).toContain("<h1");
  });
});
