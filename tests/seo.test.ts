import { describe, expect, test } from "bun:test";
import { buildRobotsTxt } from "../scripts/lib/robots.ts";
import {
  matchRoute,
  NOT_FOUND_ROUTE,
  prerenderPaths,
  ROUTES,
  SERVER_ERROR_ROUTE,
} from "../src/routes.ts";
import { applyHead, buildHead, canonicalSearch, headToHtml } from "../src/seo.ts";

function find(head: ReturnType<typeof buildHead>, key: string, value: string) {
  return head.tags.find((tag) => tag.attrs[key] === value);
}

describe("matchRoute", () => {
  test("khớp đường dẫn cố định và đường dẫn có tham số", () => {
    expect(matchRoute("/").path).toBe("/");
    expect(matchRoute("/tin-tuc").path).toBe("/tin-tuc");
    expect(matchRoute("/tin-tuc/ban-cap-nhat-1").path).toBe("/tin-tuc/:slug");
    expect(matchRoute("/kho-do/ak-47").path).toBe("/kho-do/:slug");
  });

  test("đường dẫn lạ trả về trang 404, không lập chỉ mục", () => {
    const route = matchRoute("/khong-co-trang-nay");
    expect(route).toBe(NOT_FOUND_ROUTE);
    expect(route.index).toBe(false);
    expect(route.nav).toBeNull();
  });

  test("trang 500 cũng không lập chỉ mục", () => {
    expect(SERVER_ERROR_ROUTE.index).toBe(false);
  });
});

describe("bảng đường dẫn", () => {
  test("mô tả của trang lập chỉ mục dựng sẵn dài 120 đến 160 ký tự", () => {
    for (const route of ROUTES.filter((item) => item.index && item.prerender)) {
      expect(route.description.length).toBeGreaterThanOrEqual(120);
      expect(route.description.length).toBeLessThanOrEqual(160);
    }
  });

  test("chỉ trang công khai có địa chỉ cố định được dựng sẵn", () => {
    expect(prerenderPaths()).toEqual([
      "/",
      "/tin-tuc",
      "/kho-do",
      "/xep-hang",
      "/tai-game",
      "/quy-tac",
    ]);
  });

  test("trang riêng tư gắn noindex và không dựng sẵn", () => {
    for (const route of ROUTES.filter(
      (item) => item.chrome === "auth" || item.chrome === "admin",
    )) {
      expect(route.index).toBe(false);
      expect(route.prerender).toBe(false);
    }
  });
});

describe("buildHead", () => {
  const home = matchRoute("/");

  test("trang công khai có mô tả và không có robots", () => {
    const head = buildHead(home, { pathname: "/" });
    expect(head.title).toBe(home.title);
    expect(find(head, "name", "description")?.attrs.content).toBe(home.description);
    expect(find(head, "name", "robots")).toBeUndefined();
  });

  test("trang riêng tư gắn noindex, nofollow", () => {
    const head = buildHead(matchRoute("/ho-so"), { pathname: "/ho-so" });
    expect(find(head, "name", "robots")?.attrs.content).toBe("noindex, nofollow");
  });

  test("trang tìm kiếm hoặc trang số 2 trở đi gắn noindex, follow", () => {
    const news = matchRoute("/tin-tuc");
    expect(
      find(buildHead(news, { pathname: "/tin-tuc", search: "?q=ak" }), "name", "robots")?.attrs
        .content,
    ).toBe("noindex, follow");
    expect(
      find(buildHead(news, { pathname: "/tin-tuc", search: "?trang=2" }), "name", "robots")?.attrs
        .content,
    ).toBe("noindex, follow");
    expect(
      find(buildHead(news, { pathname: "/tin-tuc", search: "?trang=1" }), "name", "robots"),
    ).toBeUndefined();
  });

  test("chưa có tên miền thì không ghi canonical và og:url", () => {
    const head = buildHead(home, { pathname: "/" });
    expect(find(head, "rel", "canonical")).toBeUndefined();
    expect(find(head, "property", "og:url")).toBeUndefined();
  });

  test("có tên miền thì ghi canonical gọn, bỏ tham số lạ và trang=1", () => {
    const news = matchRoute("/tin-tuc");
    const head = buildHead(news, {
      pathname: "/tin-tuc/",
      search: "?loai=su-kien&trang=1&utm_source=x",
      siteUrl: "https://example.org/",
    });
    expect(find(head, "rel", "canonical")?.attrs.href).toBe(
      "https://example.org/tin-tuc?loai=su-kien",
    );
    expect(find(head, "property", "og:url")?.attrs.content).toBe(
      "https://example.org/tin-tuc?loai=su-kien",
    );
  });

  test("trang không lập chỉ mục không có canonical dù có tên miền", () => {
    const head = buildHead(matchRoute("/ho-so"), {
      pathname: "/ho-so",
      siteUrl: "https://example.org",
    });
    expect(find(head, "rel", "canonical")).toBeUndefined();
  });

  test("bản dựng dùng API giả (blockIndexing) gắn noindex, nofollow, không canonical và og:url dù có tên miền", () => {
    const head = buildHead(home, {
      pathname: "/",
      siteUrl: "https://example.org",
      blockIndexing: true,
    });
    expect(find(head, "name", "robots")?.attrs.content).toBe("noindex, nofollow");
    expect(find(head, "rel", "canonical")).toBeUndefined();
    expect(find(head, "property", "og:url")).toBeUndefined();
    expect(find(head, "name", "description")?.attrs.content).toBe(home.description);
  });

  test("blockIndexing tắt thì trang công khai vẫn có canonical như trước", () => {
    const head = buildHead(home, {
      pathname: "/",
      siteUrl: "https://example.org",
      blockIndexing: false,
    });
    expect(find(head, "name", "robots")).toBeUndefined();
    expect(find(head, "rel", "canonical")?.attrs.href).toBe("https://example.org/");
  });

  test("tiêu đề riêng của trang chi tiết thay tiêu đề của mẫu", () => {
    const head = buildHead(matchRoute("/tin-tuc/abc"), {
      pathname: "/tin-tuc/abc",
      title: "Bài A | Infestation",
    });
    expect(head.title).toBe("Bài A | Infestation");
    expect(find(head, "property", "og:title")?.attrs.content).toBe("Bài A | Infestation");
  });
});

describe("buildRobotsTxt", () => {
  test("bản dựng dùng API giả chặn cả site và không ghi Sitemap", () => {
    const text = buildRobotsTxt({ siteUrl: "https://example.org", blockIndexing: true });
    expect(text).toBe("User-agent: *\nDisallow: /\n");
    expect(text).not.toContain("Sitemap");
    expect(text).not.toContain("Allow: /");
  });

  test("bản có API thật cho bot vào, chặn khu quản trị và ghi Sitemap khi có tên miền", () => {
    const text = buildRobotsTxt({ siteUrl: "https://example.org/", blockIndexing: false });
    expect(text).toContain("Allow: /");
    expect(text).toContain("Disallow: /quan-tri/");
    expect(text).toContain("Disallow: /api/");
    expect(text).toContain("Sitemap: https://example.org/sitemap.xml");
  });

  test("chưa có tên miền thì không ghi Sitemap", () => {
    const text = buildRobotsTxt({ blockIndexing: false });
    expect(text).toContain("Allow: /");
    expect(text).not.toContain("Sitemap");
  });
});

describe("canonicalSearch", () => {
  test("giữ thứ tự cố định và bỏ tham số rỗng", () => {
    expect(canonicalSearch("?trang=3&q=&loai=huong-dan")).toBe("?loai=huong-dan&trang=3");
    expect(canonicalSearch(undefined)).toBe("");
  });
});

describe("headToHtml và applyHead", () => {
  test("thoát ký tự đặc biệt trong thuộc tính và tiêu đề", () => {
    const html = headToHtml({
      title: "A & B <x>",
      tags: [{ tag: "meta", attrs: { name: "description", content: 'Nói "xin chào" <b>' } }],
    });
    expect(html).toContain("<title>A &amp; B &lt;x&gt;</title>");
    expect(html).toContain('content="Nói &quot;xin chào&quot; &lt;b&gt;"');
    expect(html).toContain("data-head");
  });

  test("applyHead thay thẻ cũ do ứng dụng quản lý và giữ thẻ khác", () => {
    const keep = document.createElement("link");
    keep.setAttribute("rel", "icon");
    document.head.appendChild(keep);
    applyHead({
      title: "Một",
      tags: [{ tag: "meta", attrs: { name: "description", content: "a" } }],
    });
    applyHead({
      title: "Hai",
      tags: [{ tag: "meta", attrs: { name: "description", content: "b" } }],
    });
    expect(document.title).toBe("Hai");
    const metas = document.head.querySelectorAll('meta[name="description"]');
    expect(metas.length).toBe(1);
    expect(metas[0]?.getAttribute("content")).toBe("b");
    expect(document.head.contains(keep)).toBe(true);
    keep.remove();
  });
});
