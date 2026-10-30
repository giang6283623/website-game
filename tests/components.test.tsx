import { describe, expect, mock, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Button } from "../src/components/Button/Button.tsx";
import { Checkbox } from "../src/components/Checkbox/Checkbox.tsx";
import { Chip } from "../src/components/Chip/Chip.tsx";
import { Field } from "../src/components/Field/Field.tsx";
import { ItemSlot } from "../src/components/ItemSlot/ItemSlot.tsx";
import { ListState } from "../src/components/ListState/ListState.tsx";
import { Tag } from "../src/components/Tag/Tag.tsx";
import { Toggle } from "../src/components/Toggle/Toggle.tsx";

function inRouter(node: React.ReactNode) {
  return render(<MemoryRouter>{node}</MemoryRouter>);
}

describe("Button", () => {
  test("không có địa chỉ thì là nút, mặc định type=button", () => {
    inRouter(<Button>Gửi</Button>);
    const button = screen.getByRole("button", { name: "Gửi" });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.className).toContain("btn--primary");
    expect(button.className).toContain("btn--m");
  });

  test("có to thì là liên kết của router", () => {
    inRouter(
      <Button to="/kho-do" variant="secondary" size="l">
        Xem kho đồ
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Xem kho đồ" });
    expect(link.getAttribute("href")).toBe("/kho-do");
    expect(link.className).toContain("btn--secondary");
    expect(link.className).toContain("btn--l");
  });

  test("nút bị khóa không gọi onClick", () => {
    const onClick = mock(() => {});
    inRouter(
      <Button disabled onClick={onClick}>
        Gửi
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Gửi" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("liên kết bị khóa dùng aria-disabled và bỏ địa chỉ", () => {
    inRouter(
      <Button to="/tai-game" disabled>
        Tải game
      </Button>,
    );
    const link = screen.getByText("Tải game");
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.getAttribute("href")).toBeNull();
  });

  test("href ngoài dùng thẻ a thường", () => {
    inRouter(<Button href="https://example.org/file.zip">Tệp</Button>);
    expect(screen.getByRole("link", { name: "Tệp" }).getAttribute("href")).toBe(
      "https://example.org/file.zip",
    );
  });
});

describe("Chip", () => {
  test("nút bật tắt dùng aria-pressed", () => {
    inRouter(<Chip selected>Tất cả</Chip>);
    expect(screen.getByRole("button", { name: "Tất cả" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  test("liên kết đang chọn dùng aria-current", () => {
    inRouter(
      <Chip to="/tin-tuc?loai=su-kien" selected>
        Sự kiện
      </Chip>,
    );
    const link = screen.getByRole("link", { name: "Sự kiện" });
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(link.className).toContain("chip--selected");
  });

  test("chip không chọn không có aria-current", () => {
    inRouter(<Chip to="/tin-tuc">Tất cả</Chip>);
    expect(screen.getByRole("link", { name: "Tất cả" }).getAttribute("aria-current")).toBeNull();
  });

  test("nút bị khóa (Disabled) không gọi onClick", () => {
    const onClick = mock(() => {});
    inRouter(
      <Chip disabled onClick={onClick}>
        Trước
      </Chip>,
    );
    const button = screen.getByRole("button", { name: "Trước" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("liên kết bị khóa dùng aria-disabled và bỏ địa chỉ", () => {
    inRouter(
      <Chip to="/tin-tuc?trang=2" disabled>
        Sau
      </Chip>,
    );
    const chip = screen.getByText("Sau");
    expect(chip.getAttribute("aria-disabled")).toBe("true");
    expect(chip.getAttribute("href")).toBeNull();
  });
});

describe("ItemSlot", () => {
  const item = {
    name: "AK-74",
    typeLabel: "Súng trường",
    statLine: "Sát thương 32",
    imageKey: "game/hud/ak-74",
  };

  test("mặc định là liên kết tới trang chi tiết", () => {
    const { container } = inRouter(
      <ul>
        <ItemSlot item={item} to="/kho-do/ak-74" />
      </ul>,
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/kho-do/ak-74");
    expect(link.getAttribute("aria-disabled")).toBeNull();
    expect(container.querySelector(".item-slot.is-disabled") === null).toBe(true);
  });

  test("bị khóa (Disabled) không phải liên kết, mang aria-disabled và lớp is-disabled", () => {
    const { container } = inRouter(
      <ul>
        <ItemSlot item={item} to="/kho-do/ak-74" disabled selected />
      </ul>,
    );
    expect(screen.queryByRole("link")).toBeNull();
    const slot = container.querySelector(".item-slot");
    expect(slot?.className).toContain("is-disabled");
    expect(slot?.className).not.toContain("is-selected");
    expect(container.querySelector(".item-slot__link")?.getAttribute("aria-disabled")).toBe("true");
    expect(container.querySelector(".item-slot__badge")).toBeNull();
    expect(screen.getByText("AK-74")).toBeTruthy();
  });

  test("chưa có hình thì giữ khay nền, không vẽ thẻ img, tên và chỉ số vẫn còn", () => {
    const { container } = inRouter(
      <ul>
        <ItemSlot item={{ ...item, imageKey: "" }} to="/kho-do/chua-co-hinh" />
      </ul>,
    );
    expect(container.querySelector(".item-slot__plate")).toBeTruthy();
    expect(container.querySelector(".item-slot__image")).toBeNull();
    expect(screen.getByRole("link").getAttribute("href")).toBe("/kho-do/chua-co-hinh");
    expect(screen.getByText("AK-74")).toBeTruthy();
    expect(screen.getByText("Sát thương 32")).toBeTruthy();
  });
});

describe("Tag", () => {
  test("gắn lớp theo kiểu", () => {
    render(<Tag variant="event">Sự kiện</Tag>);
    expect(screen.getByText("Sự kiện").className).toContain("tag--event");
  });
});

describe("Field", () => {
  test("nhãn gắn với ô nhập và gợi ý gắn bằng aria-describedby", () => {
    render(<Field label="Email" hint="Dùng email đã đăng ký." />);
    const input = screen.getByLabelText("Email");
    const hint = screen.getByText("Dùng email đã đăng ký.");
    expect(input.getAttribute("aria-describedby")).toBe(hint.id);
    expect(input.getAttribute("aria-invalid")).toBeNull();
  });

  test("lỗi thay gợi ý và đặt aria-invalid", () => {
    render(<Field label="Email" hint="Gợi ý" error="Email không hợp lệ." />);
    const input = screen.getByLabelText("Email");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.queryByText("Gợi ý")).toBeNull();
    expect(input.getAttribute("aria-describedby")).toBe(screen.getByText("Email không hợp lệ.").id);
  });

  test("ô mật khẩu có nút hiện và ẩn", () => {
    render(<Field label="Mật khẩu" type="password" revealable />);
    const input = screen.getByLabelText("Mật khẩu") as HTMLInputElement;
    expect(input.type).toBe("password");
    const toggle = screen.getByRole("button", { name: /Hiện mật khẩu/ });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(toggle);
    expect(input.type).toBe("text");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(toggle);
    expect(input.type).toBe("password");
  });

  test("ô bị khóa không nhận nhập", () => {
    render(<Field label="Email" disabled />);
    expect((screen.getByLabelText("Email") as HTMLInputElement).disabled).toBe(true);
  });
});

describe("Checkbox", () => {
  test("bấm vào nhãn đổi trạng thái", () => {
    const onChange = mock(() => {});
    render(<Checkbox label="Tôi đồng ý" onChange={onChange} />);
    const box = screen.getByLabelText("Tôi đồng ý") as HTMLInputElement;
    expect(box.checked).toBe(false);
    fireEvent.click(screen.getByText("Tôi đồng ý"));
    expect(box.checked).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe("Toggle", () => {
  test("là công tắc có tên và trạng thái", () => {
    const onChange = mock((_next: boolean) => {});
    render(<Toggle label="Hiện" checked={false} onChange={onChange} />);
    const toggle = screen.getByRole("switch", { name: "Hiện" });
    expect(toggle.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  test("công tắc bị khóa không đổi", () => {
    const onChange = mock((_next: boolean) => {});
    render(<Toggle label="Hiện" checked onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("ListState", () => {
  test("lỗi báo bằng role alert, có nút thử lại gọi onAction", () => {
    const onAction = mock(() => {});
    inRouter(
      <ListState
        kind="error"
        title="Không tải được"
        message="Thử lại sau."
        actionLabel="Thử lại"
        onAction={onAction}
      />,
    );
    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  test("đang tải báo bằng role status, aria-busy và không có nút", () => {
    inRouter(
      <ListState kind="loading" title="Đang tải" message="Chờ chút." actionLabel="Bỏ qua" />,
    );
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-busy")).toBe("true");
    expect(screen.queryByRole("button")).toBeNull();
  });

  test("rỗng có thể có liên kết hành động", () => {
    inRouter(
      <ListState
        kind="empty"
        title="Chưa có gì"
        message="Danh sách trống."
        actionLabel="Về trang chủ"
        actionTo="/"
      />,
    );
    expect(screen.getByRole("link", { name: "Về trang chủ" }).getAttribute("href")).toBe("/");
  });

  test("tiêu đề thật khi có headingLevel", () => {
    inRouter(<ListState kind="empty" title="Không thấy" message="..." headingLevel={1} />);
    expect(screen.getByRole("heading", { level: 1, name: "Không thấy" })).toBeTruthy();
  });
});
