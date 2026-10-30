import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { App } from "../src/App.tsx";
import {
  createAdminItem,
  getAdminItem,
  getAdminNews,
  getAdminNewsPost,
  getAdminUser,
  patchAdminItem,
  uploadImage,
} from "../src/api/admin-endpoints.ts";
import { normalizeError } from "../src/api/client.ts";
import { resetMockSession } from "../src/api/mock/adapter.ts";
import { type MockConfig, setMockConfig } from "../src/api/mock/config.ts";

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
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
}

const where = () => screen.getByTestId("where").textContent;
const main = () => document.querySelector("#main") as HTMLElement;
const all = (selector: string) => [...main().querySelectorAll<HTMLElement>(selector)];
const one = (selector: string) => main().querySelector(selector) as HTMLElement;
const text = (el: Element | null | undefined) => (el?.textContent ?? "").trim();
const buttonByText = (scope: ParentNode, label: string) =>
  [...scope.querySelectorAll<HTMLElement>("button, a")].find((el) =>
    text(el).toLowerCase().startsWith(label.toLowerCase()),
  ) as HTMLElement;
const dialog = () => document.querySelector('[role="alertdialog"]') as HTMLElement | null;
const setBody = (html: string) => {
  const area = one(".editor__area");
  area.innerHTML = html;
  fireEvent.input(area);
};

// setMockConfig thay cả cấu hình, nên luôn đặt đủ ba trường.
const configure = (changes: Partial<MockConfig> = {}) =>
  setMockConfig({ latencyMs: 0, mode: "normal", session: "admin", ...changes });

beforeEach(() => {
  cleanup();
  resetMockSession();
  configure();
});

afterEach(() => {
  cleanup();
});

describe("Khung quản trị (E4-S1)", () => {
  test("có thanh bên với năm mục, mục hiện tại và nút đăng xuất, và chuyển được giữa các mục", async () => {
    await renderAt("/quan-tri");
    expect(where()).toBe("/quan-tri/bai-viet");
    const links = all(".admin__link");
    expect(links.map((link) => text(link))).toEqual([
      "Bài viết",
      "Vật phẩm",
      "Banner",
      "Người dùng",
      "Nhật ký",
    ]);
    expect(links[0]?.getAttribute("aria-current")).toBe("page");
    expect(text(one(".admin__signout"))).toBe("Đăng xuất");
    fireEvent.click(links[2] as HTMLElement);
    await settle();
    expect(where()).toBe("/quan-tri/banner");
    expect(text(one("h1"))).toBe("Banner");
  });

  test("khu quản trị không có đầu trang công khai và có đúng một h1", async () => {
    await renderAt("/quan-tri/bai-viet");
    expect(document.querySelector("header.header, .header")).toBeNull();
    expect(main().querySelectorAll("h1").length).toBe(1);
  });

  test("đăng xuất đưa về trang chủ", async () => {
    await renderAt("/quan-tri/bai-viet");
    fireEvent.click(one(".admin__signout"));
    await settle(150);
    expect(where()).toBe("/");
  });

  test("người chơi thường thấy trang 403, khách tới đăng nhập", async () => {
    configure({ session: "user" });
    await renderAt("/quan-tri/bai-viet");
    expect(where()).toBe("/quan-tri/bai-viet");
    expect(document.body.textContent).toContain("Không được phép vào");
    cleanup();
    configure({ session: "guest" });
    await renderAt("/quan-tri/nhat-ky");
    expect(where()).toStartWith("/dang-nhap?tiep=");
  });
});

describe("Danh sách bài viết (E4-S4)", () => {
  test("liệt kê bài với loại, ngày, trạng thái và hai hành động", async () => {
    await renderAt("/quan-tri/bai-viet");
    const rows = all(".posts-row");
    expect(rows.length).toBeGreaterThanOrEqual(6);
    const first = rows[0] as HTMLElement;
    // Sắp theo ngày giảm dần: bài ngày 30/10 đứng đầu.
    expect(text(first.querySelector(".posts-row__link"))).toBe("Cuối tuần nhân đôi kinh nghiệm");
    expect(text(first.querySelector(".tag"))).toBe("Sự kiện");
    expect(text(first.querySelector(".admin-state"))).toBe("Đã đăng");
    expect(buttonByText(first, "Sửa")).toBeTruthy();
    expect(buttonByText(first, "Ẩn")).toBeTruthy();
    expect(all(".admin-filters__chips a").map((a) => text(a))).toEqual([
      "Tất cả",
      "Đã đăng",
      "Bản nháp",
    ]);
  });

  test("bản nháp không có nút Ẩn và bộ lọc Bản nháp chỉ giữ bản nháp", async () => {
    await renderAt("/quan-tri/bai-viet?loc=ban-nhap");
    const rows = all(".posts-row");
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(text(row.querySelector(".admin-state"))).toBe("Bản nháp");
      expect(buttonByText(row, "Ẩn")).toBeUndefined();
    }
  });

  test("tìm theo một phần tiêu đề không phân biệt dấu, kết quả rỗng có nút xóa bộ lọc", async () => {
    await renderAt("/quan-tri/bai-viet");
    const input = one(".admin-search input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "bao tri" } });
    fireEvent.submit(one(".admin-search"));
    await settle();
    expect(where()).toBe("/quan-tri/bai-viet?q=bao+tri");
    const titles = all(".posts-row__link").map((a) => text(a));
    expect(titles.length).toBe(1);
    expect(titles[0]).toContain("Bảo trì");

    fireEvent.change(input, { target: { value: "khong co bai nay" } });
    fireEvent.submit(one(".admin-search"));
    await settle();
    expect(text(one(".list-state--empty"))).toContain("Không tìm thấy bài viết");
    fireEvent.click(buttonByText(one(".list-state--empty"), "Xóa bộ lọc"));
    await settle();
    expect(where()).toBe("/quan-tri/bai-viet");
    expect(all(".posts-row").length).toBeGreaterThan(1);
  });

  test("Ẩn hỏi xác nhận. Hủy giữ nguyên, xác nhận chuyển bài về bản nháp và ghi nhật ký", async () => {
    await renderAt("/quan-tri/bai-viet");
    const row = all(".posts-row")[0] as HTMLElement;
    const title = text(row.querySelector(".posts-row__link"));
    fireEvent.click(buttonByText(row, "Ẩn"));
    await settle();
    expect(dialog()).not.toBeNull();
    expect(text(dialog()?.querySelector("h2"))).toBe("Ẩn bài viết?");
    expect(dialog()?.textContent).toContain(title);
    // Tiêu điểm bắt đầu ở nút Hủy. Esc đóng hộp.
    expect(document.activeElement?.textContent).toBe("Hủy");
    fireEvent.keyDown(dialog() as HTMLElement, { key: "Escape" });
    await settle();
    expect(dialog()).toBeNull();
    expect(text((all(".posts-row")[0] as HTMLElement).querySelector(".admin-state"))).toBe(
      "Đã đăng",
    );

    fireEvent.click(buttonByText(all(".posts-row")[0] as HTMLElement, "Ẩn"));
    await settle();
    fireEvent.click(buttonByText(dialog() as HTMLElement, "Ẩn bài"));
    await settle(150);
    expect(dialog()).toBeNull();
    expect(main().textContent).toContain("Đã ẩn bài viết.");
    const after = all(".posts-row").find(
      (r) => text(r.querySelector(".posts-row__link")) === title,
    );
    expect(text(after?.querySelector(".admin-state"))).toBe("Bản nháp");

    cleanup();
    await renderAt("/quan-tri/nhat-ky");
    expect(text(all(".audit-row")[0]?.querySelector(".audit-row__action"))).toBe("ẨN BÀI");
    expect(text(all(".audit-row")[0]?.querySelector(".audit-row__target"))).toBe(title);
  });

  test("chế độ rỗng và lỗi dùng đúng trạng thái danh sách", async () => {
    configure({ mode: "empty" });
    await renderAt("/quan-tri/bai-viet");
    expect(text(one(".list-state--empty"))).toContain("Chưa có bài viết");
    cleanup();
    configure({ mode: "error" });
    await renderAt("/quan-tri/bai-viet");
    expect(one(".list-state--error")).toBeTruthy();
    expect(main().textContent).not.toContain("500");
  });
});

describe("Soạn bài (E4-S2, E4-S3)", () => {
  test("có bốn phân loại, đếm ký tự theo lúc gõ và không có dòng THÔNG BÁO TRONG GAME", async () => {
    await renderAt("/quan-tri/bai-viet/moi");
    expect(text(one("h1"))).toBe("Đăng bài mới");
    expect(all(".compose__chips button").map((b) => text(b))).toEqual([
      "Tin tức",
      "Hướng dẫn",
      "Sự kiện",
      "Cập nhật",
    ]);
    expect(main().textContent).toContain("Tối đa 80 ký tự. Hiện có 0 ký tự.");
    fireEvent.change(one(".compose__main input[name=title]"), {
      target: { value: "Cuối tuần nhân đôi kinh nghiệm" },
    });
    expect(main().textContent).toContain("Hiện có 30 ký tự.");
    expect(main().textContent?.toLowerCase()).not.toContain("thông báo trong game");
    expect(all(".editor__tool").map((b) => text(b))).toEqual([
      "Đậm",
      "Nghiêng",
      "Danh sách",
      "Liên kết",
      "Ảnh",
    ]);
  });

  test("đăng bài trống báo ba lỗi đúng chữ và chưa gọi API", async () => {
    await renderAt("/quan-tri/bai-viet/moi");
    fireEvent.click(buttonByText(one(".compose__panel"), "Xuất bản ngay"));
    await settle();
    expect(where()).toBe("/quan-tri/bai-viet/moi");
    const messages = all("[role=alert], .field__hint").map((el) => text(el));
    expect(messages).toContain("Nhập tiêu đề bài viết.");
    expect(messages).toContain("Chọn một phân loại.");
    expect(messages).toContain("Bài viết cần có nội dung.");
    expect(one("input[name=title]").getAttribute("aria-invalid")).toBe("true");
  });

  test("tiêu đề quá 80 ký tự bị từ chối", async () => {
    await renderAt("/quan-tri/bai-viet/moi");
    fireEvent.change(one("input[name=title]"), { target: { value: "a".repeat(81) } });
    fireEvent.click(buttonByText(one(".compose__panel"), "Lưu nháp"));
    await settle();
    expect(main().textContent).toContain("Tiêu đề tối đa 80 ký tự.");
  });

  test("lưu nháp chỉ cần tiêu đề, chuyển sang trang sửa và hiện Đã lưu nháp", async () => {
    await renderAt("/quan-tri/bai-viet/moi");
    fireEvent.change(one("input[name=title]"), { target: { value: "Bản nháp thử" } });
    fireEvent.click(buttonByText(one(".compose__panel"), "Lưu nháp"));
    await settle(200);
    expect(where()).toMatch(/^\/quan-tri\/bai-viet\/\d+$/);
    expect(text(one("h1"))).toBe("Sửa bài viết");
    expect(main().textContent).toContain("Đã lưu nháp.");
    expect((one("input[name=title]") as HTMLInputElement).value).toBe("Bản nháp thử");
  });

  test("xuất bản làm sạch nội dung, ghim bài, về danh sách và bài hiện ở Tin tức", async () => {
    await renderAt("/quan-tri/bai-viet/moi");
    fireEvent.change(one("input[name=title]"), { target: { value: "Sự kiện cuối tuần" } });
    fireEvent.click(buttonByText(one(".compose__chips"), "Sự kiện"));
    setBody(
      '<p>Nhận gấp đôi kinh nghiệm.</p><script>alert(1)</script><img src="x" onerror="alert(2)">',
    );
    fireEvent.click(buttonByText(one(".compose__pair"), "Bật"));
    fireEvent.click(buttonByText(one(".compose__panel"), "Xuất bản ngay"));
    await settle(250);
    expect(where()).toBe("/quan-tri/bai-viet");
    expect(main().textContent).toContain("Đã xuất bản bài viết.");
    const created = all(".posts-row").find(
      (row) => text(row.querySelector(".posts-row__link")) === "Sự kiện cuối tuần",
    );
    expect(created).toBeTruthy();
    expect(text(created?.querySelector(".admin-state"))).toBe("Đã đăng");

    const list = await getAdminNews({ q: "sự kiện cuối tuần" });
    const saved = await getAdminNewsPost(list.items[0]?.id ?? 0);
    expect(saved.bodyHtml).toContain("Nhận gấp đôi kinh nghiệm.");
    expect(saved.bodyHtml).not.toContain("script");
    expect(saved.bodyHtml).not.toContain("onerror");
    expect(saved.category).toBe("su-kien");
    expect(saved.pinned).toBe(true);
    expect(saved.status).toBe("published");

    cleanup();
    await renderAt("/tin-tuc");
    expect(main().textContent).toContain("Sự kiện cuối tuần");
  });

  test("ảnh đại diện sai loại hoặc quá lớn bị từ chối bằng đúng chữ", async () => {
    await renderAt("/quan-tri/bai-viet/moi");
    const input = one("input[name=cover]") as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [new File(["x"], "ghi-chu.txt", { type: "text/plain" })] },
    });
    await settle();
    expect(main().textContent).toContain("Chỉ nhận ảnh JPG, PNG hoặc WebP, tối đa 5 MB.");
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "lon.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [big] } });
    await settle();
    expect(main().textContent).toContain("Chỉ nhận ảnh JPG, PNG hoặc WebP, tối đa 5 MB.");
    expect(main().querySelector(".cover__image")).toBeNull();
  });

  test("ảnh đại diện hợp lệ hiện bản xem trước và có nút bỏ ảnh", async () => {
    await renderAt("/quan-tri/bai-viet/moi");
    const input = one("input[name=cover]") as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [new File(["x"], "anh.webp", { type: "image/webp" })] },
    });
    await settle(150);
    expect(one(".cover__image")).toBeTruthy();
    fireEvent.click(buttonByText(one(".cover"), "Bỏ ảnh"));
    expect(main().querySelector(".cover__image")).toBeNull();
  });

  test("API từ chối tệp sai loại với 422", async () => {
    await expect(
      uploadImage(new File(["x"], "a.gif", { type: "image/gif" })),
    ).rejects.toMatchObject({
      status: 422,
    });
  });

  test("mở bài có sẵn thì nạp tiêu đề, phân loại và nội dung", async () => {
    await renderAt("/quan-tri/bai-viet/1");
    expect(text(one("h1"))).toBe("Sửa bài viết");
    const post = await getAdminNewsPost(1);
    expect((one("input[name=title]") as HTMLInputElement).value).toBe(post.title);
    const selected = all(".compose__chips button[aria-pressed=true]");
    expect(selected.length).toBe(1);
    expect(one(".editor__area").innerHTML.length).toBeGreaterThan(0);
    // Bài đã đăng chỉ có nút lưu thay đổi.
    if (post.status === "published") {
      expect(buttonByText(one(".compose__panel"), "Lưu nháp")).toBeUndefined();
      expect(buttonByText(one(".compose__panel"), "Lưu thay đổi")).toBeTruthy();
    }
  });

  test("bài không có thì báo lỗi tải, địa chỉ sai không làm hỏng trang", async () => {
    await renderAt("/quan-tri/bai-viet/99999");
    expect(one(".list-state--error")).toBeTruthy();
    cleanup();
    await renderAt("/quan-tri/bai-viet/abc");
    expect(main().querySelectorAll("h1").length).toBe(1);
  });

  test("rời trang khi còn thay đổi chưa lưu hỏi lại, đồng ý thì rời", async () => {
    await renderAt("/quan-tri/bai-viet/moi");
    const original = window.confirm;
    let asked = "";
    window.confirm = (message?: string) => {
      asked = message ?? "";
      return false;
    };
    try {
      // Chưa sửa gì thì rời không hỏi.
      fireEvent.change(one("input[name=title]"), { target: { value: "Dở dang" } });
      fireEvent.click(all(".admin__link")[2] as HTMLElement);
      await settle();
      expect(asked).toBe("Bạn có thay đổi chưa lưu. Rời trang sẽ mất các thay đổi này.");
      expect(where()).toBe("/quan-tri/bai-viet/moi");
      window.confirm = () => true;
      fireEvent.click(all(".admin__link")[2] as HTMLElement);
      await settle();
      expect(where()).toBe("/quan-tri/banner");
    } finally {
      window.confirm = original;
    }
  });
});

describe("Vật phẩm (E4-S6)", () => {
  test("liệt kê vật phẩm với hai công tắc, chip nhóm từ API, nút thêm và liên kết sửa từng dòng", async () => {
    await renderAt("/quan-tri/vat-pham");
    expect(all(".items-row").length).toBe(20);
    expect(main().textContent).toContain("Đang chọn 3 / 4.");
    const first = all(".items-row")[0] as HTMLElement;
    expect(text(first.querySelector(".items-row__title"))).toBe("AK-74");
    const labels = [...first.querySelectorAll(".toggle__label")].map((el) => text(el));
    expect(labels).toEqual(["Nổi bật", "Hiện"]);
    expect(buttonByText(main(), "Thêm vật phẩm")?.getAttribute("href")).toBe(
      "/quan-tri/vat-pham/moi",
    );
    expect(first.querySelector("a.admin-action")?.getAttribute("href")).toBe(
      "/quan-tri/vat-pham/1",
    );
    expect(all(".admin-filters__chips a").length).toBeGreaterThan(2);
  });

  test("bật Nổi bật tới 4 được, vật phẩm thứ 5 bị từ chối và công tắc giữ nguyên", async () => {
    await renderAt("/quan-tri/vat-pham");
    const fal = all(".items-row").find(
      (row) => text(row.querySelector(".items-row__title")) === "FAL",
    );
    const mp5 = all(".items-row").find(
      (row) => text(row.querySelector(".items-row__title")) === "MP5A4",
    );
    const featuredSwitch = (row?: HTMLElement) =>
      row?.querySelectorAll<HTMLButtonElement>("[role=switch]")[0] as HTMLButtonElement;
    fireEvent.click(featuredSwitch(fal));
    await settle();
    expect(main().textContent).toContain("Đang chọn 4 / 4.");
    expect(text(fal?.querySelector(".toggle__label"))).toBe("Nổi bật");
    fireEvent.click(featuredSwitch(mp5));
    await settle();
    expect(main().textContent).toContain("Chọn tối đa 4 vật phẩm nổi bật.");
    expect(featuredSwitch(mp5).getAttribute("aria-checked")).toBe("false");
    expect(main().textContent).toContain("Đang chọn 4 / 4.");
  });

  test("ẩn một vật phẩm đổi nhãn sang Ẩn và ghi nhật ký", async () => {
    await renderAt("/quan-tri/vat-pham");
    const row = all(".items-row")[1] as HTMLElement;
    const switches = row.querySelectorAll<HTMLButtonElement>("[role=switch]");
    fireEvent.click(switches[1] as HTMLButtonElement);
    await settle();
    expect(text(row.querySelectorAll(".toggle__label")[1])).toBe("Ẩn");
    cleanup();
    await renderAt("/quan-tri/nhat-ky?loc=vat-pham");
    expect(text(all(".audit-row")[0]?.querySelector(".audit-row__action"))).toBe("ẨN VẬT PHẨM");
  });

  test("lọc theo nhóm và tìm tên không dấu", async () => {
    await renderAt("/quan-tri/vat-pham?nhom=dan");
    expect(all(".items-row").length).toBe(0);
    cleanup();
    await renderAt("/quan-tri/vat-pham?q=ba+lo");
    expect(all(".items-row").length).toBe(1);
  });
});

describe("Thêm và sửa vật phẩm (G-23)", () => {
  const input = (label: string) =>
    main().querySelector<HTMLInputElement>(`input[aria-label="${label}"]`) as HTMLInputElement;
  const field = (label: string) => screen.getByLabelText(label) as HTMLInputElement;
  const type = (el: HTMLInputElement | HTMLTextAreaElement, value: string) =>
    fireEvent.change(el, { target: { value } });
  const panelSave = () => one(".compose__panel-actions button");
  const click = async (el: Element | null | undefined) => {
    fireEvent.click(el as Element);
    await settle();
  };

  test("nút Thêm vật phẩm mở biểu mẫu với nhóm Vũ khí chọn sẵn và bốn nhãn chỉ số gợi ý", async () => {
    await renderAt("/quan-tri/vat-pham");
    await click(buttonByText(main(), "Thêm vật phẩm"));
    expect(where()).toBe("/quan-tri/vat-pham/moi");
    expect(text(one("h1"))).toBe("Thêm vật phẩm");
    const selected = all(".item-form__chips [aria-pressed=true]");
    expect(selected.map((chip) => text(chip))).toEqual(["Vũ khí"]);
    expect(all(".item-stats__row").length).toBe(4);
    expect(input("Nhãn chỉ số 1").value).toBe("SÁT THƯƠNG");
    expect(input("Giá trị chỉ số 1").value).toBe("");
    expect(field("Đường dẫn").disabled).toBe(false);
    expect(main().textContent).toContain("Đang chọn 3 / 4 vật phẩm nổi bật trên trang chủ.");
  });

  test("đổi nhóm khi chưa nhập chỉ số thì đổi nhãn gợi ý, thêm xóa dòng và giới hạn 6 dòng", async () => {
    await renderAt("/quan-tri/vat-pham/moi");
    const chips = all(".item-form__chips button");
    await click(chips.find((chip) => text(chip) === "Dụng cụ"));
    expect(all(".item-stats__row").length).toBe(1);
    expect(input("Nhãn chỉ số 1").value).toBe("");
    const add = buttonByText(main(), "Thêm chỉ số") as HTMLButtonElement;
    for (let i = 0; i < 5; i += 1) await click(add);
    expect(all(".item-stats__row").length).toBe(6);
    expect(add.disabled).toBe(true);
    await click(all(".item-stats__row button")[0]);
    expect(all(".item-stats__row").length).toBe(5);
    expect(add.disabled).toBe(false);
  });

  test("lưu khi còn trống thì báo lỗi từng ô, đưa tiêu điểm về ô đầu và không gọi API", async () => {
    await renderAt("/quan-tri/vat-pham/moi");
    await click(panelSave());
    expect(where()).toBe("/quan-tri/vat-pham/moi");
    expect(main().textContent).toContain("Nhập tên vật phẩm.");
    expect(main().textContent).toContain("Nhập đường dẫn.");
    expect(main().textContent).toContain("Nhập nhãn loại.");
    expect(main().textContent).toContain("Chưa chọn hình");
    expect(document.activeElement === field("Tên vật phẩm")).toBe(true);
    expect(field("Tên vật phẩm").getAttribute("aria-invalid")).toBe("true");
    type(field("Tên vật phẩm"), "Thử");
    expect(field("Tên vật phẩm").getAttribute("aria-invalid")).toBeNull();
    type(field("Đường dẫn"), "Sai Chuỗi");
    type(field("Nhãn loại"), "SÚNG THỬ");
    type(field("Khóa hình"), "items/thu.webp");
    await click(panelSave());
    expect(main().textContent).toContain("Chỉ dùng chữ thường, số và dấu gạch ngang.");
    type(field("Đường dẫn"), "thu");
    // Ba dòng gợi ý còn trống giá trị bị bỏ qua. Dòng có giá trị mà mất nhãn là lỗi.
    type(input("Nhãn chỉ số 1"), "");
    type(input("Giá trị chỉ số 1"), "10");
    await click(panelSave());
    expect(main().textContent).toContain("Mỗi chỉ số cần có cả nhãn và giá trị.");
    expect(where()).toBe("/quan-tri/vat-pham/moi");
  });

  test("thêm vật phẩm mới: về danh sách với lời nhắn, dòng mới ở đầu, nhật ký và trang Kho đồ", async () => {
    await renderAt("/quan-tri/vat-pham/moi");
    type(field("Tên vật phẩm"), "  SCAR-H  ");
    type(field("Đường dẫn"), "scar-h");
    type(field("Nhãn loại"), "SÚNG TRƯỜNG");
    type(input("Giá trị chỉ số 1"), "45");
    type(input("Giá trị chỉ số 2"), "150 m");
    type(field("Khóa hình"), "items/scar-h.webp");
    type(screen.getByLabelText("Mô tả") as HTMLTextAreaElement, "Súng trường mạnh.");
    type(field("Mã trong game"), "wpn_scar_h");
    await click(panelSave());
    expect(where()).toBe("/quan-tri/vat-pham");
    expect(main().textContent).toContain("Đã thêm vật phẩm.");
    expect(all(".items-row").length).toBe(20);
    expect(text(all(".items-row")[0]?.querySelector(".items-row__title"))).toBe("SCAR-H");
    cleanup();
    await renderAt("/quan-tri/nhat-ky?loc=vat-pham");
    expect(text(all(".audit-row")[0]?.querySelector(".audit-row__action"))).toBe("THÊM VẬT PHẨM");
    const saved = await getAdminItem(171);
    expect(saved.stats).toEqual([
      { label: "SÁT THƯƠNG", value: "45" },
      { label: "TẦM XA", value: "150 m" },
    ]);
    expect(saved.statLine).toBe("Sát thương 45 · Tầm xa 150 m");
    expect(saved.gameItemId).toBe("wpn_scar_h");
    expect(saved.hudKey).toBeNull();
    expect(saved.visible).toBe(true);
    expect(saved.featured).toBe(false);
    cleanup();
    await renderAt("/kho-do/scar-h");
    expect(document.querySelector("#main")?.textContent).toContain("SCAR-H");
  });

  test("đường dẫn trùng bị máy chủ từ chối và lỗi hiện ở ô Đường dẫn", async () => {
    await renderAt("/quan-tri/vat-pham/moi");
    type(field("Tên vật phẩm"), "AK khác");
    type(field("Đường dẫn"), "ak-74");
    type(field("Nhãn loại"), "SÚNG TRƯỜNG");
    type(field("Khóa hình"), "items/ak-khac.webp");
    await click(panelSave());
    expect(where()).toBe("/quan-tri/vat-pham/moi");
    expect(field("Đường dẫn").getAttribute("aria-invalid")).toBe("true");
    expect(main().textContent).toContain("Đường dẫn này đã có vật phẩm khác dùng.");
  });

  test("sửa vật phẩm: nạp sẵn dữ liệu, đường dẫn bị khóa, lưu giữ nguyên hudKey và ghi nhật ký", async () => {
    await renderAt("/quan-tri/vat-pham");
    await click(all(".items-row")[0]?.querySelector("a.admin-action"));
    expect(where()).toBe("/quan-tri/vat-pham/1");
    expect(text(one("h1"))).toBe("Sửa vật phẩm");
    expect(field("Tên vật phẩm").value).toBe("AK-74");
    expect(field("Đường dẫn").value).toBe("ak-74");
    expect(field("Đường dẫn").disabled).toBe(true);
    expect(main().textContent).toContain("Trang: /kho-do/ak-74");
    expect(all(".item-stats__row").length).toBe(4);
    expect(input("Giá trị chỉ số 2").value).toBe("120 m");
    expect((screen.getByLabelText("Mô tả") as HTMLTextAreaElement).value).toContain("Súng trường");
    expect(field("Khóa hình").value).toBe("items/asr-ak74.webp");
    expect(text(panelSave())).toBe("Lưu thay đổi");
    type(field("Tên vật phẩm"), "AK-74M");
    await click(panelSave());
    expect(where()).toBe("/quan-tri/vat-pham");
    expect(main().textContent).toContain("Đã lưu thay đổi.");
    expect(text(all(".items-row")[0]?.querySelector(".items-row__title"))).toBe("AK-74M");
    const saved = await getAdminItem(1);
    expect(saved.name).toBe("AK-74M");
    expect(saved.slug).toBe("ak-74");
    expect(saved.hudKey).toBe("hud/asr-ak74.webp");
    expect(saved.featured).toBe(true);
    cleanup();
    await renderAt("/quan-tri/nhat-ky?loc=vat-pham");
    expect(text(all(".audit-row")[0]?.querySelector(".audit-row__action"))).toBe("SỬA VẬT PHẨM");
  });

  test("bật Nổi bật khi đã đủ 4 vật phẩm thì lỗi hiện trong khung bên phải và không rời trang", async () => {
    await patchAdminItem(4, { featured: true });
    await renderAt("/quan-tri/vat-pham/6");
    expect(main().textContent).toContain("Đang chọn 4 / 4 vật phẩm nổi bật trên trang chủ.");
    const on = all(".compose__pair button").find((chip) => text(chip) === "Bật");
    await click(on);
    expect(main().textContent).toContain("Đang chọn 5 / 4 vật phẩm nổi bật trên trang chủ.");
    await click(panelSave());
    expect(where()).toBe("/quan-tri/vat-pham/6");
    expect(text(one(".item-form__note--error"))).toBe("Chọn tối đa 4 vật phẩm nổi bật.");
    const unchanged = await getAdminItem(6);
    expect(unchanged.featured).toBe(false);
  });

  test("địa chỉ không phải số hiện đường về danh sách, mã không có thì báo không tải được", async () => {
    await renderAt("/quan-tri/vat-pham/abc");
    expect(text(one("h1"))).toBe("Sửa vật phẩm");
    expect(one("a.admin-action").getAttribute("href")).toBe("/quan-tri/vat-pham");
    cleanup();
    await renderAt("/quan-tri/vat-pham/999");
    expect(main().textContent).toContain("Không tải được vật phẩm");
  });

  test("API: tạo và sửa kiểm trường, giới hạn 6 chỉ số và chỉ đổi trường được gửi", async () => {
    const valid = {
      name: "Thử API",
      slug: "thu-api",
      group: "dan" as const,
      typeLabel: "ĐẠN THỬ",
      stats: [],
      statLine: "",
      description: "",
      imageKey: "items/thu-api.webp",
      gameItemId: "",
      featured: false,
      visible: true,
    };
    const fields = async (draft: Parameters<typeof createAdminItem>[0]) => {
      try {
        await createAdminItem(draft);
        return null;
      } catch (failure) {
        return normalizeError(failure).fields;
      }
    };
    expect((await fields({ ...valid, name: "" }))?.name).toBeTruthy();
    expect((await fields({ ...valid, name: "x".repeat(61) }))?.name).toBeTruthy();
    expect((await fields({ ...valid, slug: "Sai Slug" }))?.slug).toBeTruthy();
    expect((await fields({ ...valid, group: null }))?.group).toBeTruthy();
    expect((await fields({ ...valid, imageKey: "../x.webp" }))?.imageKey).toBeTruthy();
    expect((await fields({ ...valid, description: "d".repeat(401) }))?.description).toBeTruthy();
    const seven = Array.from({ length: 7 }, (_, i) => ({ label: `L${i}`, value: "1" }));
    expect((await fields({ ...valid, stats: seven }))?.stats).toBeTruthy();
    expect(await fields(valid)).toBeNull();
    const made = await getAdminItem(171);
    expect(made.slug).toBe("thu-api");
    expect(made.statLine).toBe("");
    const patched = await patchAdminItem(171, { typeLabel: "ĐẠN MỚI" });
    expect(patched.typeLabel).toBe("ĐẠN MỚI");
    expect(patched.name).toBe("Thử API");
    expect(patched.imageKey).toBe("items/thu-api.webp");
    let status = 0;
    try {
      await patchAdminItem(999, { name: "Không có" });
    } catch (failure) {
      status = normalizeError(failure).status ?? 0;
    }
    expect(status).toBe(404);
  });
});

describe("Banner (E4-S7)", () => {
  test("hiện ba banner với trạng thái, công tắc, xem trước và khung sửa", async () => {
    await renderAt("/quan-tri/banner");
    const rows = all(".banners-row");
    expect(rows.length).toBe(3);
    expect(rows.map((row) => text(row.querySelector(".admin-state")))).toEqual([
      "Đang hiện",
      "Lên lịch",
      "Hết hạn",
    ]);
    expect(rows.map((row) => text(row.querySelector(".toggle__label")))).toEqual([
      "Đang hiện",
      "Tắt",
      "Tắt",
    ]);
    expect(text(rows[0]?.querySelector(".banners-row__range"))).toBe("28/10/2026 đến 30/10/2026");
    expect(text(one("[data-testid=banner-preview]"))).toBe(
      "Bảo trì máy chủ lúc 04:00 sáng thứ Sáu. Xem chi tiết.",
    );
    expect((one("textarea[name=message]") as HTMLTextAreaElement).value).toBe(
      "Bảo trì máy chủ lúc 04:00 sáng thứ Sáu",
    );
    expect((one("input[name=startsAt]") as HTMLInputElement).value).toBe("28/10/2026");
  });

  test("xem trước đổi theo lúc gõ", async () => {
    await renderAt("/quan-tri/banner");
    fireEvent.change(one("textarea[name=message]"), { target: { value: "Nghỉ lễ" } });
    expect(text(one("[data-testid=banner-preview]"))).toBe("Nghỉ lễ. Xem chi tiết.");
    fireEvent.change(one("input[name=linkUrl]"), { target: { value: "" } });
    expect(text(one("[data-testid=banner-preview]"))).toBe("Nghỉ lễ");
  });

  test("bật một banner thì banner đang hiện bị tắt", async () => {
    await renderAt("/quan-tri/banner");
    const second = all(".banners-row")[1] as HTMLElement;
    fireEvent.click(second.querySelector("[role=switch]") as HTMLElement);
    await settle(150);
    const rows = all(".banners-row");
    expect(rows.map((row) => text(row.querySelector(".toggle__label")))).toEqual([
      "Tắt",
      "Đang hiện",
      "Tắt",
    ]);
    // Banner đầu vẫn trong khoảng ngày nhưng đã tắt: chữ riêng, không còn Đang hiện.
    expect(text(rows[0]?.querySelector(".admin-state"))).toBe("Đã tắt");
  });

  test("ngày kết thúc sớm hơn ngày bắt đầu và ngày sai dạng bị từ chối", async () => {
    await renderAt("/quan-tri/banner");
    fireEvent.change(one("input[name=endsAt]"), { target: { value: "27/10/2026" } });
    fireEvent.submit(one(".banner-form"));
    await settle();
    expect(main().textContent).toContain("Ngày kết thúc không sớm hơn ngày bắt đầu.");
    fireEvent.change(one("input[name=endsAt]"), { target: { value: "31/02/2026" } });
    fireEvent.submit(one(".banner-form"));
    await settle();
    expect(main().textContent).toContain("Nhập ngày theo dạng 28/10/2026.");
  });

  test("nội dung trống hoặc quá 120 ký tự bị từ chối", async () => {
    await renderAt("/quan-tri/banner");
    fireEvent.change(one("textarea[name=message]"), { target: { value: "  " } });
    fireEvent.submit(one(".banner-form"));
    await settle();
    expect(main().textContent).toContain("Nhập nội dung banner.");
    fireEvent.change(one("textarea[name=message]"), { target: { value: "a".repeat(121) } });
    fireEvent.submit(one(".banner-form"));
    await settle();
    expect(main().textContent).toContain("Nội dung tối đa 120 ký tự.");
  });

  test("lưu sửa banner, thêm banner mới và ghi nhật ký", async () => {
    await renderAt("/quan-tri/banner");
    fireEvent.change(one("textarea[name=message]"), {
      target: { value: "Bảo trì lùi sang 05:00" },
    });
    fireEvent.submit(one(".banner-form"));
    await settle(150);
    expect(main().textContent).toContain("Đã lưu banner.");
    expect(all(".banners-row__title").map((el) => text(el))).toContain("Bảo trì lùi sang 05:00");

    fireEvent.click(buttonByText(one(".admin-head"), "Thêm banner"));
    expect(text(one(".banner-form__title"))).toBe("Thêm banner");
    fireEvent.change(one("textarea[name=message]"), { target: { value: "Chào mừng mùa mới" } });
    fireEvent.change(one("input[name=startsAt]"), { target: { value: "02/11/2026" } });
    fireEvent.change(one("input[name=endsAt]"), { target: { value: "09/11/2026" } });
    fireEvent.submit(one(".banner-form"));
    await settle(150);
    const rows = all(".banners-row");
    expect(rows.length).toBe(4);
    expect(text(rows[0]?.querySelector(".admin-state"))).toBe("Lên lịch");

    cleanup();
    await renderAt("/quan-tri/nhat-ky?loc=banner");
    expect(all(".audit-row").map((row) => text(row.querySelector(".audit-row__action")))).toContain(
      "THÊM BANNER",
    );
  });

  test("Hủy trả khung sửa về giá trị đã lưu", async () => {
    await renderAt("/quan-tri/banner");
    fireEvent.change(one("textarea[name=message]"), { target: { value: "Đã gõ dở" } });
    fireEvent.click(buttonByText(one(".banner-form"), "Hủy"));
    expect((one("textarea[name=message]") as HTMLTextAreaElement).value).toBe(
      "Bảo trì máy chủ lúc 04:00 sáng thứ Sáu",
    );
  });
});

describe("Người dùng (E4-S8)", () => {
  test("liệt kê bảy người dùng, email đã che, vai trò và trạng thái", async () => {
    await renderAt("/quan-tri/nguoi-dung");
    const rows = all(".users-row");
    expect(rows.length).toBe(7);
    for (const row of rows) expect(text(row.querySelector(".users-row__email"))).toContain("***@");
    const admin = rows.find((row) => text(row.querySelector(".users-row__name")) === "AdminDemo");
    expect(text(admin?.querySelector(".users-row__role"))).toBe("Quản trị");
    const banned = rows.find(
      (row) => text(row.querySelector(".users-row__name")) === "KeLangThang",
    );
    expect(text(banned?.querySelector(".users-row__status"))).toBe("Bị khóa");
    expect(text(buttonByText(banned as HTMLElement, "Mở khóa"))).toContain("Mở khóa");
  });

  test("bộ lọc Bị khóa và Quản trị, ô tìm theo tên", async () => {
    await renderAt("/quan-tri/nguoi-dung?loc=bi-khoa");
    expect(all(".users-row").length).toBe(1);
    cleanup();
    await renderAt("/quan-tri/nguoi-dung?loc=quan-tri");
    expect(all(".users-row").length).toBe(1);
    cleanup();
    await renderAt("/quan-tri/nguoi-dung?q=linh");
    expect(all(".users-row").map((row) => text(row.querySelector(".users-row__name")))).toEqual([
      "LinhCanh77",
    ]);
  });

  test("khóa hỏi xác nhận, ghi nhật ký, rồi mở khóa được", async () => {
    await renderAt("/quan-tri/nguoi-dung");
    const target = () =>
      all(".users-row").find(
        (row) => text(row.querySelector(".users-row__name")) === "ThoSanDem",
      ) as HTMLElement;
    fireEvent.click(buttonByText(target(), "Khóa"));
    await settle();
    expect(text(dialog()?.querySelector("h2"))).toBe("Khóa người dùng?");
    fireEvent.click(buttonByText(dialog() as HTMLElement, "Hủy"));
    await settle();
    expect(text(target().querySelector(".users-row__status"))).toBe("Hoạt động");

    fireEvent.click(buttonByText(target(), "Khóa"));
    await settle();
    fireEvent.click(dialog()?.querySelector("button") as HTMLElement);
    await settle(150);
    expect(text(target().querySelector(".users-row__status"))).toBe("Bị khóa");

    fireEvent.click(buttonByText(target(), "Mở khóa"));
    await settle();
    fireEvent.click(dialog()?.querySelector("button") as HTMLElement);
    await settle(150);
    expect(text(target().querySelector(".users-row__status"))).toBe("Hoạt động");

    cleanup();
    await renderAt("/quan-tri/nhat-ky?loc=nguoi-dung");
    const actions = all(".audit-row__action").map((el) => text(el));
    expect(actions.slice(0, 2)).toEqual(["MỞ KHÓA NGƯỜI DÙNG", "KHÓA NGƯỜI DÙNG"]);
  });

  test("không tự khóa tài khoản của mình", async () => {
    await renderAt("/quan-tri/nguoi-dung");
    const me = all(".users-row").find(
      (row) => text(row.querySelector(".users-row__name")) === "AdminDemo",
    ) as HTMLElement;
    const lock = buttonByText(me, "Khóa") as HTMLButtonElement;
    expect(lock.disabled).toBe(true);
    fireEvent.click(lock);
    await settle();
    expect(dialog()).toBeNull();
  });
});

describe("Nhật ký (E4-S5)", () => {
  test("chỉ đọc, mới nhất ở trên, đủ bốn cột và không có nút sửa", async () => {
    await renderAt("/quan-tri/nhat-ky");
    const rows = all(".audit-row");
    expect(rows.length).toBe(8);
    expect(text(rows[0]?.querySelector(".audit-row__action"))).toBe("ĐĂNG BÀI");
    expect(text(rows[0]?.querySelector(".audit-row__time"))).toContain("29/10/2026 09:42");
    expect(text(rows[0]?.querySelector(".audit-row__actor"))).toBe("AdminDemo");
    expect(
      all("th")
        .map((th) => text(th))
        .filter(Boolean),
    ).toEqual(["Thời gian", "Người làm", "Hành động", "Đối tượng"]);
    expect(one(".admin__content").querySelectorAll("button, input").length).toBe(0);
    expect(all(".admin-filters__chips a").map((a) => text(a))).toEqual([
      "Tất cả",
      "Bài viết",
      "Vật phẩm",
      "Banner",
      "Người dùng",
    ]);
  });

  test("lọc theo đối tượng chỉ giữ đúng loại", async () => {
    await renderAt("/quan-tri/nhat-ky?loc=vat-pham");
    expect(all(".audit-row").map((row) => text(row.querySelector(".audit-row__action")))).toEqual([
      "BẬT NỔI BẬT",
      "THÊM VẬT PHẨM",
    ]);
  });

  test("API quản trị từ chối khách và người chơi", async () => {
    configure({ session: "guest" });
    await expect(getAdminNews({})).rejects.toMatchObject({ status: 401 });
    configure({ session: "user" });
    await expect(getAdminNews({})).rejects.toMatchObject({ status: 403 });
  });
});

describe("Chi tiết người dùng (G-23)", () => {
  const panel = (name: string) => one(`[data-panel="${name}"]`);
  const rowText = (scope: Element, label: string) => {
    const row = [...scope.querySelectorAll(".compose__row")].find(
      (candidate) => text(candidate.querySelector("dt")) === label,
    );
    return text(row?.querySelector("dd"));
  };
  const click = async (el: HTMLElement, ms = 80) => {
    fireEvent.click(el);
    await settle(ms);
  };

  test("bấm tên trong danh sách mở trang chi tiết", async () => {
    await renderAt("/quan-tri/nguoi-dung");
    const row = all(".users-row").find(
      (candidate) => text(candidate.querySelector(".users-row__name")) === "KeLangThang",
    ) as HTMLElement;
    await click(row.querySelector("a.users-row__link") as HTMLElement);
    expect(where()).toBe("/quan-tri/nguoi-dung/5");
    expect(text(one("h1"))).toBe("Chi tiết người dùng");
    expect(one(".admin__link[aria-current='page']").getAttribute("href")).toBe(
      "/quan-tri/nguoi-dung",
    );
  });

  test("người chơi bị khóa: thông tin, hạng, nhân vật và nhật ký", async () => {
    await renderAt("/quan-tri/nguoi-dung/5");
    const info = panel("info");
    expect(rowText(info, "Tên hiển thị")).toBe("KeLangThang");
    expect(rowText(info, "Email")).toBe("k***@email.com");
    expect(rowText(info, "Vai trò")).toBe("Người chơi");
    expect(rowText(info, "Trạng thái")).toBe("Bị khóa");
    expect(rowText(info, "Ngày tạo")).toBe("12/10/2026");
    expect(info.querySelector(".admin-state--bad")).not.toBeNull();

    const rank = panel("rank");
    expect(rowText(rank, "Hạng")).toBe("#5");
    expect(rowText(rank, "Gia tộc")).toBe("Sống Sót");
    expect(rowText(rank, "GameDollar")).toBe("1.388.410");
    expect(rowText(rank, "XP")).toBe("37.640");

    const characters = panel("characters");
    expect(text(characters.querySelector("h2"))).toBe("Nhân vật (2 / 5)");
    const names = [...characters.querySelectorAll(".user-detail__name")].map((el) => text(el));
    expect(names).toEqual(["KeLangThang01", "KeLangThang02"]);
    expect(text(characters.querySelector(".user-detail__meta"))).toBe(
      "Cấp 14 · Thợ săn · 87 đêm sống sót",
    );

    const history = panel("history");
    expect([...history.querySelectorAll(".user-detail__action")].map((el) => text(el))).toEqual([
      "KHÓA NGƯỜI DÙNG",
    ]);
    expect(text(history.querySelector(".user-detail__meta"))).toBe("28/10/2026 16:18 · AdminDemo");
  });

  test("quản trị viên chưa có hạng và không có nhân vật thì hiện chữ trống", async () => {
    await renderAt("/quan-tri/nguoi-dung/4");
    expect(rowText(panel("info"), "Vai trò")).toBe("Quản trị");
    expect(text(panel("rank").querySelector(".user-detail__empty"))).toBe("Chưa có hạng.");
    expect(text(panel("characters").querySelector("h2"))).toBe("Nhân vật (0 / 5)");
    expect(text(panel("characters").querySelector(".user-detail__empty"))).toBe(
      "Chưa có nhân vật.",
    );
    expect(text(panel("history").querySelector(".user-detail__action"))).toBe("ĐĂNG NHẬP");
  });

  test("khóa có hỏi xác nhận, đổi nút thành Mở khóa và ghi vào nhật ký của người này", async () => {
    await renderAt("/quan-tri/nguoi-dung/1");
    expect(panel("history").querySelector(".user-detail__empty")).not.toBeNull();
    await click(buttonByText(main(), "Khóa"));
    expect(text(dialog()?.querySelector("h2"))).toBe("Khóa người dùng?");
    await click(buttonByText(dialog() as HTMLElement, "Hủy"));
    expect(dialog()).toBeNull();
    expect(rowText(panel("info"), "Trạng thái")).toBe("Hoạt động");

    await click(buttonByText(main(), "Khóa"));
    await click(dialog()?.querySelector("button") as HTMLElement, 150);
    expect(dialog()).toBeNull();
    expect(rowText(panel("info"), "Trạng thái")).toBe("Bị khóa");
    expect(buttonByText(main(), "Mở khóa")).toBeTruthy();
    expect([...panel("history").querySelectorAll(".user-detail__action")].map(text)).toEqual([
      "KHÓA NGƯỜI DÙNG",
    ]);

    await click(buttonByText(main(), "Mở khóa"));
    await click(dialog()?.querySelector("button") as HTMLElement, 150);
    expect(rowText(panel("info"), "Trạng thái")).toBe("Hoạt động");
    expect([...panel("history").querySelectorAll(".user-detail__action")].map(text)).toEqual([
      "MỞ KHÓA NGƯỜI DÙNG",
      "KHÓA NGƯỜI DÙNG",
    ]);
  });

  test("không tự khóa tài khoản của mình", async () => {
    await renderAt("/quan-tri/nguoi-dung/4");
    const lock = buttonByText(main(), "Khóa") as HTMLButtonElement;
    expect(lock.disabled).toBe(true);
    fireEvent.click(lock);
    await settle();
    expect(dialog()).toBeNull();
  });

  test("có nút quay lại danh sách", async () => {
    await renderAt("/quan-tri/nguoi-dung/5");
    const back = buttonByText(main(), "Quay lại");
    expect(back.getAttribute("href")).toBe("/quan-tri/nguoi-dung");
  });

  test("địa chỉ không phải số hiện đường về danh sách, mã không có thì báo không tải được", async () => {
    await renderAt("/quan-tri/nguoi-dung/abc");
    expect(text(one("h1"))).toBe("Chi tiết người dùng");
    expect(one("a.admin-action").getAttribute("href")).toBe("/quan-tri/nguoi-dung");
    cleanup();
    await renderAt("/quan-tri/nguoi-dung/999");
    expect(main().textContent).toContain("Không tải được người dùng");
  });

  test("API: trả hạng, nhân vật và nhật ký, mã không có thì 404", async () => {
    const detail = await getAdminUser(5);
    expect(detail.displayName).toBe("KeLangThang");
    expect(detail.ranking?.rank).toBe(5);
    expect(detail.characters.length).toBe(2);
    expect(detail.history.map((entry) => entry.action)).toEqual(["user.lock"]);
    const admin = await getAdminUser(4);
    expect(admin.ranking).toBeNull();
    expect(admin.characters).toEqual([]);
    await expect(getAdminUser(999)).rejects.toMatchObject({ status: 404 });
    configure({ session: "user" });
    await expect(getAdminUser(5)).rejects.toMatchObject({ status: 403 });
  });
});
