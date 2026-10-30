import { beforeEach, describe, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { App } from "../src/App.tsx";
import { resetMockSession } from "../src/api/mock/adapter.ts";
import { setMockConfig } from "../src/api/mock/config.ts";
import { RankTable } from "../src/components/RankTable/RankTable.tsx";

function Probe() {
  const location = useLocation();
  return <output data-testid="where">{location.pathname + location.search}</output>;
}

async function settle(ms = 80) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

async function renderAt(path: string) {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
        <Probe />
      </MemoryRouter>,
    );
    await new Promise((resolve) => setTimeout(resolve, 80));
  });
}

const where = () => screen.getByTestId("where").textContent;
// Truy vấn hẹp theo CSS: truy vấn trượt trên cả trang in ra cây DOM rất lớn.
const main = () => document.querySelector("#main") as HTMLElement;
const tableRows = () => [...main().querySelectorAll(".rank-results__table tbody tr")];
const names = () =>
  tableRows().map((row) => row.querySelector(".rank-table__name")?.textContent ?? "");
const searchInput = () => main().querySelector(".rank-search input") as HTMLInputElement;
const link = (text: string) =>
  [...main().querySelectorAll("a")].find((a) => a.textContent === text) as HTMLAnchorElement;

async function search(value: string) {
  fireEvent.change(searchInput(), { target: { value } });
  fireEvent.submit(main().querySelector(".rank-search") as HTMLFormElement);
  await settle();
}

beforeEach(() => {
  cleanup();
  resetMockSession();
  setMockConfig({ latencyMs: 0, mode: "normal", session: "guest" });
});

describe("Xếp hạng người chơi (E3-S1)", () => {
  test("có một h1, ba tab, bảng 12 dòng và bảng đang chọn là GameDollar", async () => {
    await renderAt("/xep-hang");
    expect(main().querySelectorAll("h1").length).toBe(1);
    expect(main().querySelector("h1")?.textContent).toBe("Xếp hạng");
    const tabs = [...main().querySelectorAll(".rank-tabs a")];
    expect(tabs.map((tab) => tab.textContent)).toEqual(["GameDollar", "XP", "Gia tộc"]);
    expect(tabs[0]?.getAttribute("aria-current")).toBe("page");
    expect(tableRows().length).toBe(12);
    expect(names()[0]).toBe("ThoSanDem");
    expect(tableRows()[0]?.textContent).toContain("2.480.150");
  });

  test("hạng 1 đến 3 có nền nổi và hạng được đệm số 0", async () => {
    await renderAt("/xep-hang");
    const rows = tableRows();
    expect(rows[0]?.className).toContain("is-top");
    expect(rows[2]?.className).toContain("is-top");
    expect(rows[3]?.className).not.toContain("is-top");
    expect(rows[0]?.querySelector(".rank-table__rank")?.textContent).toBe("01");
  });

  test("đổi tab thành XP thì địa chỉ là ?bang=xp và bảng đổi theo", async () => {
    await renderAt("/xep-hang");
    expect(link("XP").getAttribute("href")).toBe("/xep-hang?bang=xp");
    await act(async () => {
      fireEvent.click(link("XP"));
    });
    await settle();
    expect(where()).toBe("/xep-hang?bang=xp");
    expect(main().querySelector(".rank-results__table table")?.getAttribute("data-board")).toBe(
      "xp",
    );
    expect(link("XP").getAttribute("aria-current")).toBe("page");
  });

  test("tab Gia tộc có cột huy hiệu, số thành viên và dòng gia tộc của tôi", async () => {
    setMockConfig({ latencyMs: 0, mode: "normal", session: "user" });
    await renderAt("/xep-hang?bang=gia-toc");
    expect(main().querySelector("h1 + p, .page-title__lead")?.textContent).toBe(
      "Bảng xếp hạng gia tộc theo GameDollar và kinh nghiệm (XP).",
    );
    expect(names()[0]).toBe("Bão Đêm");
    expect(tableRows()[0]?.textContent).toContain("48 thành viên");
    expect(tableRows()[0]?.querySelector(".rank-table__badge img")).toBeTruthy();
    const mine = main().querySelector(".rank-me__row tbody tr");
    expect(mine?.textContent).toContain("Sống Sót");
    expect(mine?.textContent).toContain("39 thành viên");
    expect(main().querySelector(".rank-me button")?.textContent).toBe("Gia tộc của tôi");
  });

  test("phân trang theo 50 dòng và giữ ?bang= trên địa chỉ trang", async () => {
    await renderAt("/xep-hang?bang=xp");
    const next = main().querySelector('nav[aria-label="Phân trang"] a[aria-label="Trang 2"]');
    expect(next?.getAttribute("href")).toBe("/xep-hang?bang=xp&trang=2");
  });

  test("trang vượt quá số dòng hiện trạng thái rỗng thay vì bảng trắng", async () => {
    await renderAt("/xep-hang?trang=3");
    expect(main().querySelector(".rank-table")).toBeNull();
    expect(main().textContent).toContain("Không có người chơi này");
  });

  test("lỗi máy chủ hiện KHÔNG TẢI ĐƯỢC XẾP HẠNG", async () => {
    setMockConfig({ latencyMs: 0, mode: "error", session: "guest" });
    await renderAt("/xep-hang");
    expect(main().textContent).toContain("Không tải được xếp hạng");
    expect(main().querySelector(".rank-table")).toBeNull();
  });
});

describe("Tìm tên và vị trí của tôi (E3-S2)", () => {
  test("gõ một ký tự thì báo lỗi và không đổi địa chỉ", async () => {
    await renderAt("/xep-hang");
    await search("t");
    expect(where()).toBe("/xep-hang");
    expect(main().querySelector(".rank-search .field--error")).toBeTruthy();
    expect(main().querySelector(".rank-search .field__hint")?.textContent).toBe(
      "Gõ ít nhất 2 ký tự.",
    );
    expect(searchInput().getAttribute("aria-invalid")).toBe("true");
  });

  test("tìm theo tên không dấu, không phân biệt hoa thường", async () => {
    await renderAt("/xep-hang");
    await search("linh");
    expect(where()).toBe("/xep-hang?q=linh");
    expect(names()).toEqual(["LinhCanh77"]);
  });

  test("không thấy tên thì hiện KHÔNG CÓ NGƯỜI CHƠI NÀY và nút xóa từ khóa", async () => {
    await renderAt("/xep-hang");
    await search("zzzz");
    expect(main().textContent).toContain("Không có người chơi này");
    const clear = [...main().querySelectorAll("button")].find(
      (b) => b.textContent === "Xóa từ khóa",
    );
    expect(clear).toBeTruthy();
    await act(async () => {
      fireEvent.click(clear as HTMLButtonElement);
    });
    await settle();
    expect(where()).toBe("/xep-hang");
    expect(tableRows().length).toBe(12);
  });

  test("khách thấy nhãn VỊ TRÍ CỦA TÔI dẫn tới đăng nhập và không có dòng ghim", async () => {
    await renderAt("/xep-hang");
    const mine = main().querySelector(".rank-me a");
    expect(mine?.textContent).toBe("Vị trí của tôi");
    expect(mine?.getAttribute("href")).toBe("/dang-nhap?tiep=%2Fxep-hang");
    expect(main().querySelector(".rank-me__row")).toBeNull();
  });

  test("thành viên có hạng thấy dòng ghim, bấm nhãn thì nhảy tới trang chứa hạng 128", async () => {
    setMockConfig({ latencyMs: 0, mode: "normal", session: "user" });
    await renderAt("/xep-hang");
    const pinned = main().querySelector(".rank-me__row tbody tr");
    expect(pinned?.querySelector(".rank-table__rank")?.textContent).toBe("128");
    expect(pinned?.textContent).toContain("NguoiSongSot");
    expect(pinned?.textContent).toContain("312.450");
    const button = main().querySelector(".rank-me button") as HTMLButtonElement;
    expect(button.textContent).toBe("Vị trí của tôi");
    await act(async () => {
      fireEvent.click(button);
    });
    await settle();
    expect(where()).toBe("/xep-hang?trang=3");
  });

  test("dòng của tôi trong bảng được đánh dấu khi tên trùng", () => {
    const row = {
      rank: 128,
      playerName: "NguoiSongSot",
      clanName: "Sống Sót",
      emblemKey: null,
      gameDollar: 312450,
      xp: 9870,
    };
    const other = { ...row, rank: 4, playerName: "NguoiGacDem" };
    const { container } = render(
      <RankTable rows={[other, row]} caption="Thử" highlight="NguoiSongSot" />,
    );
    const marked = [...container.querySelectorAll("tr.is-me")];
    expect(marked.length).toBe(1);
    expect(marked[0]?.textContent).toContain("NguoiSongSot");
  });
});
