import { beforeEach, describe, expect, test } from "bun:test";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { App } from "../src/App.tsx";
import { resetMockSession } from "../src/api/mock/adapter.ts";
import { setMockConfig } from "../src/api/mock/config.ts";
import { CategoryList } from "../src/components/CategoryList/CategoryList.tsx";
import { ItemDetail } from "../src/components/ItemDetail/ItemDetail.tsx";
import { PageTitle } from "../src/components/PageTitle/PageTitle.tsx";
import { Pagination, pageEntries } from "../src/components/Pagination/Pagination.tsx";
import { buildQuery, parseOneOf, parsePositiveInt } from "../src/lib/query.ts";

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
    await new Promise((resolve) => setTimeout(resolve, 40));
  });
}

const wait = (ms: number) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

const slugs = () =>
  [...document.querySelectorAll(".items-grid .item-slot a")].map((node) =>
    (node.getAttribute("href") ?? "").split("/").pop(),
  );

const names = () =>
  [...document.querySelectorAll(".items-grid .item-slot__name")].map((node) => node.textContent);

beforeEach(() => {
  resetMockSession();
  setMockConfig({ latencyMs: 0, mode: "normal", session: "guest" });
});

describe("Kho đồ (E1-S3)", () => {
  test("hiện đường dẫn, một h1, mười hai thẻ và số lượng nhóm từ API", async () => {
    await renderAt("/kho-do");
    expect(screen.getAllByRole("heading", { level: 1 }).length).toBe(1);
    const crumbs = screen.getByRole("navigation", { name: "Đường dẫn" });
    expect(within(crumbs).getByText("Kho đồ").getAttribute("aria-current")).toBe("page");
    expect(names().length).toBe(12);
    const categories = screen.getByRole("navigation", { name: "Loại vật phẩm" });
    // Chín khóa nhóm, trừ nhóm ĐẠN không còn món nào, thêm mục Tất cả: tám nhóm cộng Tất cả.
    expect(within(categories).getAllByRole("link").length).toBe(9);
    expect(screen.getByText("Có 167 vật phẩm trong kho")).toBeTruthy();
    expect(document.querySelector(".items-toolbar__count")?.textContent).toBe("167 vật phẩm");
  });

  test("chưa có ?chon= thì không mở cửa sổ chi tiết và không thẻ nào đang chọn", async () => {
    await renderAt("/kho-do");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.querySelector(".item-slot.is-selected")).toBeNull();
    expect(document.querySelector(".item-detail")).toBeNull();
    expect(document.documentElement.style.overflow).toBe("");
  });

  test("?chon= mở cửa sổ chi tiết ở thẻ đó, vật phẩm không có chỉ số hiện dòng tóm tắt", async () => {
    await renderAt("/kho-do?chon=akm");
    const link = document.querySelector('.item-slot a[href="/kho-do/akm"]') as HTMLElement;
    expect(link.getAttribute("aria-current")).toBe("true");
    const dialog = screen.getByRole("dialog", { name: "Chi tiết vật phẩm đang xem: AKM" });
    const detail = dialog.querySelector(".item-detail") as HTMLElement;
    expect(within(detail).getByRole("heading", { name: "AKM" })).toBeTruthy();
    expect(detail.querySelector(".item-detail__stats")).toBeNull();
    expect(detail.querySelector(".item-detail__summary")?.textContent).toContain("Sát thương");
    expect(within(dialog).getByText(`${slugs().indexOf("akm") + 1} / 12`)).toBeTruthy();
  });

  test("?chon= không khớp thẻ nào trong trang thì không mở cửa sổ", async () => {
    await renderAt("/kho-do?chon=khong-co-that");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("lọc theo nhóm bằng ?loai= và đánh dấu nhóm đang chọn", async () => {
    await renderAt("/kho-do?loai=vat-lieu");
    expect(names()).toEqual(["Gas"]);
    const categories = screen.getByRole("navigation", { name: "Loại vật phẩm" });
    const current = within(categories)
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "true");
    expect(current.length).toBe(1);
    expect(current[0]?.getAttribute("href")).toBe("/kho-do?loai=vat-lieu");
  });

  test("tham số sai quay về mặc định, không báo lỗi", async () => {
    await renderAt("/kho-do?loai=khong-co&trang=abc&sap-xep=xyz&chon=khong-co");
    expect(names().length).toBe(12);
    expect(document.querySelector(".item-slot.is-selected")).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("sắp xếp tên A-Z đặt liên kết sắp xếp đúng và đổi thứ tự", async () => {
    await renderAt("/kho-do?sap-xep=ten-a-z");
    expect(names().slice(0, 3)).toEqual(["1911", "AA-12", "AK-74"]);
    const sortGroup = screen.getByRole("group", { name: "Sắp xếp" });
    const az = within(sortGroup).getByRole("link", { name: "Tên A-Z" });
    expect(az.getAttribute("aria-current")).toBe("page");
    const newest = within(sortGroup).getByRole("link", { name: "Mới nhất" });
    expect(newest.getAttribute("href")).toBe("/kho-do");
  });

  test("gõ vào ô tìm thì sau một lúc địa chỉ có ?q= và danh sách lọc không phân biệt hoa thường", async () => {
    await renderAt("/kho-do");
    const input = screen.getByLabelText("Tìm vật phẩm") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "AK" } });
    await wait(450);
    expect(screen.getByTestId("where").textContent).toBe("/kho-do?q=AK");
    expect(names()).toEqual(["AK-74", "AKM", "AK-74M", "AKM", "Wakizashi"]);
  });

  test("tìm không ra thì hiện trạng thái rỗng và nút Xóa bộ lọc trả về danh sách đầy đủ", async () => {
    await renderAt("/kho-do?q=khong-co-mon-nay&loai=vu-khi");
    expect(screen.getByText("Không tìm thấy vật phẩm")).toBeTruthy();
    const clear = screen.getByRole("button", { name: /xóa bộ lọc/i });
    await act(async () => {
      fireEvent.click(clear);
      await new Promise((resolve) => setTimeout(resolve, 40));
    });
    expect(screen.getByTestId("where").textContent).toBe("/kho-do");
    expect(names().length).toBe(12);
  });

  test("API lỗi thì hiện thông báo lỗi và nút thử lại, cột loại vẫn còn", async () => {
    setMockConfig({ latencyMs: 0, mode: "error", session: "guest" });
    await renderAt("/kho-do");
    expect(screen.getByRole("alert")).toBeTruthy();
    const categories = screen.getByRole("navigation", { name: "Loại vật phẩm" });
    // Chưa có số lượng thì hiện đủ chín nhóm cộng mục Tất cả, kể cả nhóm đang trống.
    expect(within(categories).getAllByRole("link").length).toBe(10);
  });
});

describe("Cửa sổ chi tiết vật phẩm", () => {
  const where = () => screen.getByTestId("where").textContent;
  const open = (slug: string) => renderAt(`/kho-do?chon=${slug}`);
  const button = (name: string) =>
    within(screen.getByRole("dialog")).getByRole("button", { name }) as HTMLButtonElement;

  test("mở thì tiêu điểm vào khung, trang phía sau bị khóa cuộn, đóng thì trả lại", async () => {
    await open("akm");
    const dialog = screen.getByRole("dialog");
    expect(document.activeElement === dialog).toBe(true);
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(document.documentElement.style.overflow).toBe("hidden");
    fireEvent.click(button("Đóng chi tiết vật phẩm"));
    await wait(10);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.documentElement.style.overflow).toBe("");
    expect(where()).toBe("/kho-do");
  });

  test("Sau và Trước đi theo thứ tự danh sách và ghi vào ?chon=", async () => {
    await open("akm");
    const all = slugs();
    const at = all.indexOf("akm");
    expect(at).toBeGreaterThan(0);
    fireEvent.click(button("Vật phẩm sau"));
    await wait(10);
    expect(where()).toBe(`/kho-do?chon=${all[at + 1]}`);
    expect(
      within(screen.getByRole("dialog")).getByRole("heading", { name: names()[at + 1] ?? "" }),
    ).toBeTruthy();
    fireEvent.click(button("Vật phẩm trước"));
    fireEvent.click(button("Vật phẩm trước"));
    await wait(10);
    expect(where()).toBe(`/kho-do?chon=${all[at - 1]}`);
  });

  test("vật phẩm đầu khóa nút Trước, vật phẩm cuối khóa nút Sau", async () => {
    await open("ak-74");
    expect(button("Vật phẩm trước").disabled).toBe(true);
    expect(button("Vật phẩm sau").disabled).toBe(false);
    const last = slugs().at(-1) ?? "";
    fireEvent.click(button("Đóng chi tiết vật phẩm"));
    await wait(10);
    fireEvent.click(document.querySelector(`.item-slot a[href="/kho-do/${last}"]`) as HTMLElement);
    await wait(10);
    // Màn hình thử không đủ rộng để bấm thẻ mở cửa sổ (chỉ máy tính), nên mở bằng địa chỉ.
    if (!screen.queryByRole("dialog")) await open(last);
    expect(button("Vật phẩm sau").disabled).toBe(true);
    expect(button("Vật phẩm trước").disabled).toBe(false);
  });

  test("phím mũi tên đổi vật phẩm, Esc đóng, bấm nền ngoài khung cũng đóng", async () => {
    await open("akm");
    const all = slugs();
    const at = all.indexOf("akm");
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    await wait(10);
    expect(where()).toBe(`/kho-do?chon=${all[at + 1]}`);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowLeft" });
    await wait(10);
    expect(where()).toBe(`/kho-do?chon=${all[at]}`);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await wait(10);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(where()).toBe("/kho-do");
    await open("akm");
    fireEvent.click(document.querySelector(".item-dialog__backdrop") as HTMLElement);
    await wait(10);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("Tab ở nút cuối quay về nút đầu, Shift+Tab ở khung quay về nút cuối", async () => {
    await open("akm");
    const dialog = screen.getByRole("dialog");
    const buttons = [...dialog.querySelectorAll("button:not(:disabled)")] as HTMLElement[];
    const first = buttons[0] as HTMLElement;
    const last = buttons.at(-1) as HTMLElement;
    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(document.activeElement === first).toBe(true);
    dialog.focus();
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(document.activeElement === last).toBe(true);
  });
});

describe("tham số truy vấn", () => {
  test("parsePositiveInt chỉ nhận số nguyên từ 1", () => {
    expect(parsePositiveInt("3")).toBe(3);
    expect(parsePositiveInt("0")).toBe(1);
    expect(parsePositiveInt("-2")).toBe(1);
    expect(parsePositiveInt("2.5")).toBe(1);
    expect(parsePositiveInt(null)).toBe(1);
    expect(parsePositiveInt("99999999")).toBe(1);
  });

  test("parseOneOf trả mặc định khi giá trị lạ", () => {
    expect(parseOneOf("ten-a-z", ["moi-nhat", "ten-a-z"] as const, "moi-nhat")).toBe("ten-a-z");
    expect(parseOneOf("x", ["moi-nhat", "ten-a-z"] as const, "moi-nhat")).toBe("moi-nhat");
  });

  test("buildQuery bỏ giá trị rỗng, null và giá trị mặc định", () => {
    const current = new URLSearchParams("loai=vu-khi&trang=3&chon=akm");
    expect(buildQuery(current, { trang: null, chon: null })).toBe("?loai=vu-khi");
    expect(buildQuery(current, { "sap-xep": "moi-nhat" }, { "sap-xep": "moi-nhat" })).toBe(
      "?loai=vu-khi&trang=3&chon=akm",
    );
    expect(buildQuery(new URLSearchParams(), { q: "" })).toBe("");
    expect(buildQuery(new URLSearchParams("trang=2"), { trang: 1 }, { trang: "1" })).toBe("");
  });
});

describe("Pagination", () => {
  test("dưới tám trang thì hiện hết các số", () => {
    expect(pageEntries(2, 4).map((entry) => (entry.kind === "page" ? entry.page : "..."))).toEqual([
      1, 2, 3, 4,
    ]);
  });

  test("nhiều trang thì rút gọn bằng dấu ba chấm quanh trang hiện tại", () => {
    const text = pageEntries(10, 20).map((entry) => (entry.kind === "page" ? entry.page : "..."));
    expect(text).toEqual([1, "...", 9, 10, 11, "...", 20]);
    const start = pageEntries(1, 20).map((entry) => (entry.kind === "page" ? entry.page : "..."));
    expect(start).toEqual([1, 2, "...", 20]);
  });

  test("không vẽ gì khi chỉ có một trang", () => {
    const { container } = render(
      <MemoryRouter>
        <Pagination page={1} totalPages={1} hrefFor={(page) => `?trang=${page}`} />
      </MemoryRouter>,
    );
    expect(container.querySelector("nav")).toBeNull();
  });

  test("trang đầu khóa nút Trước, trang hiện tại có aria-current", () => {
    render(
      <MemoryRouter>
        <Pagination page={1} totalPages={3} hrefFor={(page) => `?trang=${page}`} />
      </MemoryRouter>,
    );
    const nav = screen.getByRole("navigation", { name: "Phân trang" });
    expect(within(nav).getByRole("button", { name: "Trước" }).hasAttribute("disabled")).toBe(true);
    expect(within(nav).getByRole("link", { name: "Trang 1" }).getAttribute("aria-current")).toBe(
      "page",
    );
    expect(within(nav).getByRole("link", { name: "Sau" }).getAttribute("href")).toBe("/?trang=2");
  });
});

describe("PageTitle", () => {
  test("mục cuối của đường dẫn không là liên kết và có aria-current", () => {
    render(
      <MemoryRouter>
        <PageTitle
          crumbs={[{ label: "Trang chủ", to: "/" }, { label: "Kho đồ" }]}
          title="Kho đồ"
          lead="Đoạn dẫn"
        />
      </MemoryRouter>,
    );
    const nav = screen.getByRole("navigation", { name: "Đường dẫn" });
    expect(within(nav).getAllByRole("link").length).toBe(1);
    expect(within(nav).getByText("Kho đồ").getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("heading", { level: 1, name: "Kho đồ" })).toBeTruthy();
    expect(screen.getByText("Đoạn dẫn")).toBeTruthy();
  });
});

describe("CategoryList", () => {
  test("chưa có số lượng thì vẫn hiện đủ tên nhóm, chỉ bỏ số", () => {
    render(
      <MemoryRouter>
        <CategoryList
          groups={null}
          selected={null}
          hrefFor={(key) => `/kho-do${key ? `?loai=${key}` : ""}`}
          allLabel="Tất cả"
          label="Loại vật phẩm"
        />
      </MemoryRouter>,
    );
    const nav = screen.getByRole("navigation", { name: "Loại vật phẩm" });
    // Chưa biết số lượng thì không ẩn nhóm nào, để cột loại không nhảy khi dữ liệu về.
    expect(within(nav).getAllByRole("link").length).toBe(10);
    expect(nav.querySelector(".category__count")).toBeNull();
    expect(within(nav).getByRole("link", { name: "Tất cả" }).getAttribute("aria-current")).toBe(
      "true",
    );
  });
});

describe("ItemDetail", () => {
  const base = {
    slug: "x",
    name: "Vật phẩm thử",
    typeLabel: "SÚNG",
    statLine: "Sát thương 1",
    imageKey: "items/x.webp",
    group: "vu-khi",
    stats: [],
  } as never;

  test("thiếu mô tả, chỉ số và ảnh HUD thì ẩn các phần đó và hiện dòng tóm tắt", () => {
    const { container } = render(<ItemDetail item={base} badge="Đang xem" />);
    expect(container.querySelector(".item-detail__description")).toBeNull();
    expect(container.querySelector(".item-detail__stats")).toBeNull();
    expect(container.querySelector(".item-detail__hud")).toBeNull();
    expect(container.querySelector(".item-detail__summary")?.textContent).toBe("Sát thương 1");
    expect(screen.getByRole("heading", { level: 2, name: "Vật phẩm thử" })).toBeTruthy();
  });

  test("headingLevel 1 dùng cho trang chi tiết riêng", () => {
    render(<ItemDetail item={base} headingLevel={1} />);
    expect(screen.getByRole("heading", { level: 1, name: "Vật phẩm thử" })).toBeTruthy();
  });

  test("chưa có hình thì không vẽ thẻ img nhưng vẫn có khung nền và tên", () => {
    const noImage = { ...(base as Record<string, unknown>), imageKey: "" } as never;
    const { container } = render(<ItemDetail item={noImage} />);
    expect(container.querySelector(".item-detail__visual")).toBeTruthy();
    expect(container.querySelector(".item-detail__image")).toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: "Vật phẩm thử" })).toBeTruthy();
  });
});
