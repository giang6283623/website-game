import { beforeEach, describe, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { App } from "../src/App.tsx";
import { resetMockSession } from "../src/api/mock/adapter.ts";
import { setMockConfig } from "../src/api/mock/config.ts";
import { safeNext } from "../src/lib/query.ts";

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
// Tìm trong vùng nội dung chính. Truy vấn trượt trên cả trang in ra cây DOM rất lớn, nên dùng CSS và vùng hẹp.
const main = () => document.querySelector("#main") as HTMLElement;
const alertBox = () => main().querySelector('[role="alert"]') as HTMLElement;
const status = () => main().querySelector('[role="status"]') as HTMLElement | null;
const field = (label: string) => screen.getByLabelText(label) as HTMLInputElement;
const type = (label: string, value: string) =>
  fireEvent.change(field(label), { target: { value } });

async function submit() {
  fireEvent.submit(document.querySelector("form") as HTMLFormElement);
  await settle();
}

async function logIn(email: string, password: string) {
  type("Email", email);
  type("Mật khẩu", password);
  await submit();
}

beforeEach(() => {
  resetMockSession();
  setMockConfig({ latencyMs: 0, mode: "normal", session: "guest" });
});

describe("safeNext", () => {
  test("chỉ nhận đường dẫn nội bộ và không quay lại trang xác thực", () => {
    expect(safeNext("/ho-so/doi-mat-khau")).toBe("/ho-so/doi-mat-khau");
    expect(safeNext("/kho-do?loai=sung")).toBe("/kho-do?loai=sung");
    expect(safeNext(null)).toBe("/ho-so");
    expect(safeNext("https://evil.example")).toBe("/ho-so");
    expect(safeNext("//evil.example")).toBe("/ho-so");
    expect(safeNext("/\\evil.example")).toBe("/ho-so");
    expect(safeNext("/dang-nhap?tiep=/ho-so")).toBe("/ho-so");
    expect(safeNext("/ho-so\n")).toBe("/ho-so");
  });
});

describe("Đăng nhập (E2-S2)", () => {
  test("có một h1 trong khung, hai liên kết phụ và ô ghi nhớ", async () => {
    await renderAt("/dang-nhap");
    expect(screen.getAllByRole("heading", { level: 1 }).length).toBe(1);
    expect(screen.getByRole("heading", { level: 1, name: "Đăng nhập" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Quên mật khẩu?" }).getAttribute("href")).toBe(
      "/quen-mat-khau",
    );
    expect(screen.getByRole("link", { name: "Đăng ký ngay" }).getAttribute("href")).toBe(
      "/dang-ky",
    );
    expect(screen.getByRole("checkbox", { name: "Ghi nhớ tôi" })).toBeTruthy();
    expect(document.title).toBe("Đăng nhập | Infestation Việt Nam");
  });

  test("gửi ô trống thì báo lỗi từng ô và đưa tiêu điểm vào ô lỗi đầu tiên", async () => {
    await renderAt("/dang-nhap");
    await submit();
    expect(screen.getByText("Nhập email của bạn.")).toBeTruthy();
    expect(screen.getByText("Nhập mật khẩu.")).toBeTruthy();
    expect(field("Email").getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement === field("Email")).toBe(true);
  });

  test("sai mật khẩu chỉ báo chung, giữ email và xóa mật khẩu", async () => {
    await renderAt("/dang-nhap");
    await logIn("nguoisongsot@email.com", "saimatkhau");
    const box = alertBox();
    expect(box.textContent).toContain("Email hoặc mật khẩu chưa đúng");
    expect(box.textContent).toContain("Mật khẩu phân biệt chữ hoa và chữ thường.");
    expect(field("Email").value).toBe("nguoisongsot@email.com");
    expect(field("Mật khẩu").value).toBe("");
    expect(where()).toBe("/dang-nhap");
  });

  test("đăng nhập đúng thì vào Hồ sơ", async () => {
    await renderAt("/dang-nhap");
    await logIn("nguoisongsot@email.com", "matkhau123");
    expect(where()).toBe("/ho-so");
    expect(screen.getByRole("heading", { level: 1, name: "Hồ sơ" })).toBeTruthy();
  });

  test("?tiep= nội bộ được theo, địa chỉ ngoài bị bỏ", async () => {
    await renderAt("/dang-nhap?tiep=%2Fho-so%2Fdoi-mat-khau");
    await logIn("nguoisongsot@email.com", "matkhau123");
    expect(where()).toBe("/ho-so/doi-mat-khau");
  });

  test("?tiep= trỏ ra ngoài thì về Hồ sơ", async () => {
    await renderAt("/dang-nhap?tiep=%2F%2Fevil.example");
    await logIn("nguoisongsot@email.com", "matkhau123");
    expect(where()).toBe("/ho-so");
  });

  test("sai năm lần thì lần sau hiện trạng thái tạm khóa", async () => {
    await renderAt("/dang-nhap");
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await logIn("nguoisongsot@email.com", `sai${attempt}`);
    }
    expect(screen.queryByText("Tạm khóa đăng nhập")).toBeNull();
    await logIn("nguoisongsot@email.com", "matkhau123");
    expect(screen.getByRole("heading", { level: 1, name: "Tạm khóa đăng nhập" })).toBeTruthy();
    expect(alertBox().textContent).toContain("Hãy thử lại sau 15 phút");
    expect(screen.getByRole("link", { name: "Đặt lại mật khẩu" }).getAttribute("href")).toBe(
      "/quen-mat-khau",
    );
  });

  test("mất kết nối thì báo một câu chung, không lộ mã lỗi", async () => {
    setMockConfig({ latencyMs: 0, mode: "error", session: "guest" });
    await renderAt("/dang-nhap");
    await logIn("nguoisongsot@email.com", "matkhau123");
    expect(alertBox().textContent).toContain("Không kết nối được. Thử lại sau vài giây.");
  });

  test("đã đăng nhập mà vào trang đăng nhập thì được chuyển tới Hồ sơ", async () => {
    setMockConfig({ latencyMs: 0, mode: "normal", session: "user" });
    await renderAt("/dang-nhap");
    expect(where()).toBe("/ho-so");
  });
});

describe("Đăng ký (E2-S1)", () => {
  async function fill(values: { email: string; name: string; pass: string; again: string }) {
    type("Email", values.email);
    type("Tên hiển thị", values.name);
    type("Mật khẩu", values.pass);
    type("Nhập lại mật khẩu", values.again);
    await submit();
  }

  test("tên có dấu, tên ngắn, mật khẩu ngắn và hai mật khẩu khác nhau đều báo lỗi", async () => {
    await renderAt("/dang-ky");
    await fill({ email: "ten@email.com", name: "Thợ", pass: "abc", again: "abd" });
    expect(screen.getByText("Tên không được có dấu hay dấu cách. Ví dụ: ThoSanDem")).toBeTruthy();
    expect(screen.getByText("Mật khẩu cần ít nhất 8 ký tự.")).toBeTruthy();
    expect(screen.getByText("Hai mật khẩu chưa giống nhau.")).toBeTruthy();
    type("Tên hiển thị", "ab");
    await submit();
    expect(screen.getByText("Tên cần từ 3 đến 16 ký tự.")).toBeTruthy();
  });

  test("email và tên đã có thì máy chủ báo lỗi vào đúng ô", async () => {
    await renderAt("/dang-ky");
    await fill({
      email: "nguoisongsot@email.com",
      name: "nguoisongsot",
      pass: "matkhau456",
      again: "matkhau456",
    });
    expect(
      screen.getByText("Email này đã có tài khoản. Hãy đăng nhập hoặc dùng email khác."),
    ).toBeTruthy();
    expect(screen.getByText("Tên này đã có người dùng. Chọn tên khác.")).toBeTruthy();
    expect(field("Email").getAttribute("aria-invalid")).toBe("true");
    expect(field("Tên hiển thị").getAttribute("aria-invalid")).toBe("true");
  });

  test("thành công thì báo đã đăng nhập, có nút Tải game và hồ sơ trống nhân vật", async () => {
    await renderAt("/dang-ky");
    await fill({
      email: "moi@email.com",
      name: "NguoiMoi01",
      pass: "matkhau456",
      again: "matkhau456",
    });
    expect(
      screen.getByText("Tạo tài khoản xong. Bạn đã đăng nhập và có thể tải game."),
    ).toBeTruthy();
    expect(within(main()).getByRole("link", { name: "Tải game" }).getAttribute("href")).toBe(
      "/tai-game",
    );
    fireEvent.click(screen.getByRole("link", { name: "Xem hồ sơ" }));
    await settle();
    expect(where()).toBe("/ho-so");
    expect(within(main()).getByText("NguoiMoi01")).toBeTruthy();
    expect(screen.getByText("Chưa có nhân vật")).toBeTruthy();
    expect(screen.queryByText(/tạo nhân vật/i)).toBeNull();
  });

  test("cụm quy tắc cộng đồng là liên kết tới /quy-tac", async () => {
    await renderAt("/dang-ky");
    expect(screen.getByRole("link", { name: "quy tắc cộng đồng" }).getAttribute("href")).toBe(
      "/quy-tac",
    );
  });
});

describe("Quên và đặt lại mật khẩu (E2-S3)", () => {
  test("email sai dạng thì báo lỗi, chưa gửi", async () => {
    await renderAt("/quen-mat-khau");
    type("Email", "khong-phai-email");
    await submit();
    expect(screen.getByText("Email chưa đúng. Ví dụ: ten@email.com")).toBeTruthy();
    expect(screen.queryByText("Đã gửi liên kết")).toBeNull();
  });

  test("email lạ cũng thấy câu 'đã gửi', nút gửi lại khóa 60 giây", async () => {
    await renderAt("/quen-mat-khau");
    type("Email", "khonghe@email.com");
    await submit();
    expect(screen.getByRole("heading", { level: 1, name: "Đã gửi liên kết" })).toBeTruthy();
    expect((status() as HTMLElement).textContent).toContain(
      "Nếu email này có tài khoản, bạn sẽ nhận thư trong vài phút.",
    );
    const resend = screen.getByRole("button", { name: "Gửi lại liên kết" }) as HTMLButtonElement;
    expect(resend.disabled).toBe(true);
    expect(screen.getByText("Có thể gửi lại sau 60 giây.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Quay lại đăng nhập" })).toBeTruthy();
  });

  test("không có mã thì hiện trạng thái liên kết hết hạn", async () => {
    await renderAt("/dat-lai-mat-khau");
    expect(
      screen.getByRole("heading", { level: 1, name: "Liên kết không dùng được" }),
    ).toBeTruthy();
    const box = alertBox();
    expect(box.textContent).toContain("Liên kết hết hạn");
    expect(box.textContent).toContain("Hãy gửi liên kết mới.");
    expect(screen.getByRole("link", { name: "Gửi lại liên kết" }).getAttribute("href")).toBe(
      "/quen-mat-khau",
    );
  });

  test("mã đúng thì đặt lại được một lần, lần sau hết hạn, rồi đăng nhập bằng mật khẩu mới", async () => {
    await renderAt("/dat-lai-mat-khau?ma=ma-mau");
    expect(screen.getByText("Chọn mật khẩu mới cho tài khoản n***@email.com.")).toBeTruthy();
    type("Mật khẩu mới", "matkhaumoi1");
    type("Nhập lại mật khẩu", "khacnhau123");
    await submit();
    expect(screen.getByText("Hai mật khẩu chưa giống nhau.")).toBeTruthy();
    type("Nhập lại mật khẩu", "matkhaumoi1");
    await submit();
    expect(screen.getByRole("heading", { level: 1, name: "Đã đổi mật khẩu" })).toBeTruthy();
    expect((status() as HTMLElement).textContent).toContain("Đã lưu");
    // Mã đã dùng.
    cleanup();
    await renderAt("/dat-lai-mat-khau?ma=ma-mau");
    expect(screen.getAllByRole("heading", { level: 1 }).at(-1)?.textContent).toBe(
      "Liên kết không dùng được",
    );
  });

  test("mã lạ thì hiện trạng thái hết hạn", async () => {
    await renderAt("/dat-lai-mat-khau?ma=ma-sai");
    expect(
      screen.getByRole("heading", { level: 1, name: "Liên kết không dùng được" }),
    ).toBeTruthy();
  });
});

describe("Đổi mật khẩu (E2-S5)", () => {
  test("khách bị chuyển tới đăng nhập kèm đường dẫn để quay lại", async () => {
    await renderAt("/ho-so/doi-mat-khau");
    expect(where()).toBe("/dang-nhap?tiep=%2Fho-so%2Fdoi-mat-khau");
  });

  test("mật khẩu hiện tại sai thì lỗi nằm ở ô đầu, đúng thì xóa ba ô và báo đã lưu", async () => {
    setMockConfig({ latencyMs: 0, mode: "normal", session: "user" });
    await renderAt("/ho-so/doi-mat-khau");
    expect(screen.getByRole("heading", { level: 1, name: "Đổi mật khẩu" })).toBeTruthy();
    type("Mật khẩu hiện tại", "saimatkhau");
    type("Mật khẩu mới", "matkhaumoi1");
    type("Nhập lại mật khẩu mới", "matkhaumoi1");
    await submit();
    const current = field("Mật khẩu hiện tại");
    expect(current.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Mật khẩu hiện tại chưa đúng.")).toBeTruthy();

    type("Mật khẩu hiện tại", "matkhau123");
    await submit();
    expect((status() as HTMLElement).textContent).toContain(
      "Đã đổi mật khẩu. Các máy khác sẽ phải đăng nhập lại.",
    );
    expect(field("Mật khẩu hiện tại").value).toBe("");
    expect(field("Mật khẩu mới").value).toBe("");
  });

  test("mật khẩu mới trùng mật khẩu cũ thì báo lỗi, chưa gửi", async () => {
    setMockConfig({ latencyMs: 0, mode: "normal", session: "user" });
    await renderAt("/ho-so/doi-mat-khau");
    type("Mật khẩu hiện tại", "matkhau123");
    type("Mật khẩu mới", "matkhau123");
    type("Nhập lại mật khẩu mới", "matkhau123");
    await submit();
    expect(screen.getByText("Mật khẩu mới phải khác mật khẩu hiện tại.")).toBeTruthy();
    expect(status()).toBeNull();
  });

  test("có bảng mẹo với ba mục, một ghi chú và nút Hủy về Hồ sơ", async () => {
    setMockConfig({ latencyMs: 0, mode: "normal", session: "user" });
    await renderAt("/ho-so/doi-mat-khau");
    const tips = document.querySelector(".password__tips") as HTMLElement;
    expect(within(tips).getByRole("heading", { name: "Mẹo chọn mật khẩu" })).toBeTruthy();
    expect(within(tips).getAllByRole("listitem").length).toBe(3);
    expect(tips.querySelector(".password__tips-note")?.textContent).toBe(
      "Sau khi đổi, các thiết bị khác sẽ phải đăng nhập lại.",
    );
    expect(screen.getByRole("link", { name: "Hủy" }).getAttribute("href")).toBe("/ho-so");
  });
});

describe("Hồ sơ (E2-S4)", () => {
  test("khách bị chuyển tới đăng nhập kèm ?tiep=", async () => {
    await renderAt("/ho-so");
    expect(where()).toBe("/dang-nhap?tiep=%2Fho-so");
  });

  test("hiện thẻ tài khoản, bốn chỉ số, hai nhân vật và sáu kỹ năng", async () => {
    setMockConfig({ latencyMs: 0, mode: "normal", session: "user" });
    await renderAt("/ho-so");
    expect(screen.getAllByRole("heading", { level: 1 }).length).toBe(1);
    const card = document.querySelector(".account-card") as HTMLElement;
    expect(within(card).getByText("NguoiSongSot")).toBeTruthy();
    expect(within(card).getByText("Gia tộc Sống Sót")).toBeTruthy();
    expect(within(card).getByText("Đang trực tuyến")).toBeTruthy();
    const rows = [...card.querySelectorAll(".account-card__row")].map((row) => [
      row.querySelector("dt")?.textContent,
      row.querySelector("dd")?.textContent,
    ]);
    expect(rows).toEqual([
      ["Email", "n***@email.com"],
      ["Ngày tham gia", "12/03/2026"],
      ["Trạng thái", "Đã kích hoạt"],
    ]);
    const stats = [...document.querySelectorAll(".stat-card")].map((item) => [
      item.querySelector(".stat-card__label")?.textContent,
      item.querySelector(".stat-card__value")?.textContent,
    ]);
    expect(stats).toEqual([
      ["Hạng", "128"],
      ["GameDollar", "312.450"],
      ["Kinh nghiệm (XP)", "9.870"],
      ["Cấp", "14"],
    ]);
    const characters = [...document.querySelectorAll(".character-card")];
    expect(characters.length).toBe(2);
    expect(characters[0]?.textContent).toContain("ThoSanDem01");
    expect(characters[0]?.textContent).toContain("Cấp 14 · Thợ săn");
    expect(characters[0]?.textContent).toContain("87 đêm");
    expect(characters[1]?.textContent).toContain("Cấp 6 · Người nhặt đồ");
    const skills = [...document.querySelectorAll(".skill-tile")];
    expect(skills.length).toBe(6);
    expect(skills.filter((tile) => tile.classList.contains("is-unlocked")).length).toBe(3);
    expect(screen.getByRole("link", { name: "Đổi mật khẩu" }).getAttribute("href")).toBe(
      "/ho-so/doi-mat-khau",
    );
  });

  test("không có nhân vật thì hiện chữ đã chốt và nút Tải game, không có nút tạo nhân vật", async () => {
    setMockConfig({ latencyMs: 0, mode: "empty", session: "user" });
    await renderAt("/ho-so");
    expect(screen.getByText("Chưa có nhân vật")).toBeTruthy();
    expect(
      screen.getByText(
        "Nhân vật được tạo khi bạn vào game lần đầu. Tải game và đăng nhập để bắt đầu.",
      ),
    ).toBeTruthy();
    const download = within(main()).getByRole("link", { name: "Tải game" });
    expect(download.getAttribute("href")).toBe("/tai-game");
    expect(screen.queryByText(/tạo nhân vật/i)).toBeNull();
  });

  test("lỗi tải nhân vật thì có nút Thử lại và các khối khác vẫn còn", async () => {
    setMockConfig({ latencyMs: 0, mode: "error", session: "user" });
    await renderAt("/ho-so");
    expect(screen.getByText("Không tải được hồ sơ")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeTruthy();
    expect(document.querySelector(".account-card")).toBeTruthy();
  });

  test("đăng xuất thì về trang chủ và đầu trang đổi lại như khách", async () => {
    setMockConfig({ latencyMs: 0, mode: "normal", session: "user" });
    await renderAt("/ho-so");
    fireEvent.click(screen.getByRole("button", { name: "Đăng xuất" }));
    await settle();
    expect(where()).toBe("/");
    // Vào lại Hồ sơ vẫn bị chặn: phiên đã đóng, không quay về ?mock=user.
    expect(screen.queryByText("NguoiSongSot")).toBeNull();
  });
});
