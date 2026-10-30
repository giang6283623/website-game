import { describe, expect, mock, test } from "bun:test";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ItemSlot } from "../src/components/ItemSlot/ItemSlot.tsx";
import { NewsList } from "../src/components/NewsRow/NewsRow.tsx";
import { RankTable } from "../src/components/RankTable/RankTable.tsx";
import { ResourceView } from "../src/components/ResourceView/ResourceView.tsx";
import { LIST_COPY } from "../src/content/lists.ts";
import type { Resource } from "../src/hooks/useResource.ts";

function inRouter(node: React.ReactNode) {
  return render(<MemoryRouter>{node}</MemoryRouter>);
}

describe("NewsList", () => {
  const posts = [
    {
      slug: "bai-mot",
      title: "Bài một",
      category: "su-kien" as const,
      excerpt: "Tóm tắt",
      coverImageKey: null,
      publishedAt: "2026-10-28T08:00:00+07:00",
      authorName: "Ban quản trị",
    },
    {
      slug: "bai-hai",
      title: "Bài hai",
      category: "huong-dan" as const,
      excerpt: "Tóm tắt",
      coverImageKey: null,
      publishedAt: "2026-10-20T08:00:00+07:00",
      authorName: "Ban quản trị",
    },
  ];

  test("mỗi dòng là một liên kết đến bài và có thẻ time với ngày chuẩn", () => {
    inRouter(<NewsList posts={posts} />);
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/tin-tuc/bai-mot",
      "/tin-tuc/bai-hai",
    ]);
    const time = links[0]?.querySelector("time");
    expect(time?.getAttribute("datetime")).toBe("2026-10-28T08:00:00+07:00");
  });
});

describe("RankTable", () => {
  const rows = [
    { rank: 1, playerName: "NguoiMot", clanName: "Bão Đêm", gameDollar: 2480150, xp: 1200 },
    { rank: 4, playerName: "NguoiBon", clanName: null, gameDollar: 10, xp: 5 },
  ];

  test("là bảng thật có chú thích, tiêu đề cột và hàng đúng số", () => {
    render(<RankTable rows={rows} caption="Bảng thử" />);
    const table = screen.getByRole("table", { name: "Bảng thử" });
    expect(within(table).getAllByRole("columnheader").length).toBe(5);
    expect(within(table).getAllByRole("row").length).toBe(3);
  });

  test("hạng 1 đến 3 có lớp nổi bật, hạng 4 thì không", () => {
    render(<RankTable rows={rows} caption="Bảng thử" />);
    const bodyRows = document.querySelectorAll("tbody tr");
    expect(bodyRows[0]?.classList.contains("is-top")).toBe(true);
    expect(bodyRows[1]?.classList.contains("is-top")).toBe(false);
  });

  test("số GameDollar có dấu chấm ngăn cách hàng nghìn kiểu vi-VN", () => {
    render(<RankTable rows={rows} caption="Bảng thử" />);
    expect(screen.getByText("2.480.150")).toBeTruthy();
  });

  test("không vẽ tên gia tộc khi không có", () => {
    render(<RankTable rows={rows} caption="Bảng thử" />);
    const cells = document
      .querySelectorAll("tbody tr")[1]
      ?.querySelectorAll("td.rank-table__player");
    expect(cells?.[0]?.querySelector(".rank-table__clan")).toBeNull();
  });
});

describe("ItemSlot", () => {
  const item = {
    name: "AK-74",
    typeLabel: "Súng trường",
    statLine: "Sát thương 32 · Tầm xa 120",
    imageKey: "items/ak-74.webp",
  };

  test("là một liên kết có ảnh mang tên vật phẩm làm văn bản thay thế", () => {
    inRouter(<ItemSlot item={item} to="/kho-do/ak-74" />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/kho-do/ak-74");
    expect(within(link).getByRole("img", { name: "AK-74" })).toBeTruthy();
    expect(link.getAttribute("aria-current")).toBeNull();
  });

  test("đang chọn thì có aria-current và nhãn Đang xem chỉ là hình ảnh", () => {
    inRouter(<ItemSlot item={item} to="/kho-do?chon=ak-74" selected />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("aria-current")).toBe("true");
    const badge = link.querySelector(".item-slot__badge");
    expect(badge?.getAttribute("aria-hidden")).toBe("true");
  });

  test("gọi onClick khi bấm", () => {
    const onClick = mock(() => {});
    inRouter(<ItemSlot item={item} to="/kho-do/ak-74" onClick={onClick} />);
    fireEvent.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("ResourceView", () => {
  const reload = mock(() => {});
  const copy = LIST_COPY.news;

  test("đang tải hiện trạng thái loading", () => {
    const resource: Resource<string[]> = {
      status: "loading",
      data: undefined,
      error: undefined,
      reload,
    };
    render(
      <ResourceView resource={resource} copy={copy}>
        {() => <p>nội dung</p>}
      </ResourceView>,
    );
    expect(screen.getByRole("status").getAttribute("aria-busy")).toBe("true");
    expect(screen.queryByText("nội dung")).toBeNull();
  });

  test("lỗi hiện thông báo và nút thử lại gọi reload, không tải cả trang", () => {
    const resource = {
      status: "error",
      data: undefined,
      error: new Error("x"),
      reload,
    } as unknown as Resource<string[]>;
    render(
      <ResourceView resource={resource} copy={copy}>
        {() => <p>nội dung</p>}
      </ResourceView>,
    );
    const alert = screen.getByRole("alert");
    fireEvent.click(within(alert).getByRole("button", { name: /thử lại/i }));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  test("rỗng chỉ có nút khi trang cung cấp hành động", () => {
    const resource: Resource<string[]> = {
      status: "empty",
      data: [],
      error: undefined,
      reload,
    };
    const { unmount } = render(
      <ResourceView resource={resource} copy={copy}>
        {() => <p>nội dung</p>}
      </ResourceView>,
    );
    expect(screen.queryByRole("button")).toBeNull();
    unmount();
    const onEmptyAction = mock(() => {});
    render(
      <ResourceView resource={resource} copy={copy} onEmptyAction={onEmptyAction}>
        {() => <p>nội dung</p>}
      </ResourceView>,
    );
    fireEvent.click(screen.getByRole("button", { name: /xem tất cả tin/i }));
    expect(onEmptyAction).toHaveBeenCalledTimes(1);
  });

  test("thành công vẽ nội dung với dữ liệu", () => {
    const resource: Resource<string[]> = {
      status: "success",
      data: ["a", "b"],
      error: undefined,
      reload,
    };
    render(
      <ResourceView resource={resource} copy={copy}>
        {(data) => <p>{data.join("-")}</p>}
      </ResourceView>,
    );
    expect(screen.getByText("a-b")).toBeTruthy();
  });
});
