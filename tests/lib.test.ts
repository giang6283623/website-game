import { describe, expect, test } from "bun:test";
import {
  formatCount,
  formatDateFull,
  formatDateShort,
  formatDateTime,
  formatNumber,
  formatRank,
  readingMinutes,
} from "../src/lib/format.ts";
import { sanitizeHtml } from "../src/lib/sanitize.ts";
import { foldText, slugify, uniqueSlug } from "../src/lib/slug.ts";

const NOW = "2026-10-30T08:30:00+07:00";

describe("định dạng số và hạng", () => {
  test("dấu chấm ngăn nghìn theo vi-VN", () => {
    expect(formatNumber(2480150)).toBe("2.480.150");
    expect(formatNumber(312450)).toBe("312.450");
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(99999)).toBe("99.999");
  });

  test("hạng nhỏ hơn 100 có số 0 đầu, dòng của tôi thì không", () => {
    expect(formatRank(1)).toBe("01");
    expect(formatRank(9)).toBe("09");
    expect(formatRank(99)).toBe("99");
    expect(formatRank(100)).toBe("100");
    expect(formatRank(128)).toBe("128");
    expect(formatRank(7, false)).toBe("7");
  });

  test("số đếm danh mục có số 0 đầu khi dưới 10", () => {
    expect(formatCount(5)).toBe("05");
    expect(formatCount(17)).toBe("17");
    expect(formatCount(41)).toBe("41");
  });
});

describe("định dạng ngày theo giờ Việt Nam", () => {
  test("dạng ngắn bỏ năm khi cùng năm với giờ giả lập", () => {
    expect(formatDateShort("2026-10-30T08:00:00+07:00", NOW)).toBe("30/10");
    expect(formatDateShort("2026-10-28", NOW)).toBe("28/10");
  });

  test("dạng ngắn thêm năm khi khác năm", () => {
    expect(formatDateShort("2025-12-31T10:00:00+07:00", NOW)).toBe("31/12/2025");
  });

  test("dạng đủ năm và dạng ngày giờ", () => {
    expect(formatDateFull("2026-10-28T08:00:00+07:00")).toBe("28/10/2026");
    expect(formatDateTime("2026-10-30T08:00:00+07:00")).toBe("30/10/2026 08:00");
    expect(formatDateTime("2026-10-29T09:42:00+07:00")).toBe("29/10/2026 09:42");
  });

  test("giờ UTC được đổi sang giờ Việt Nam, không dùng múi giờ của máy", () => {
    expect(formatDateTime("2026-10-29T17:30:00Z")).toBe("30/10/2026 00:30");
    expect(formatDateFull("2026-10-29T17:30:00Z")).toBe("30/10/2026");
  });

  test("số phút đọc tối thiểu 1, theo 200 chữ mỗi phút", () => {
    expect(readingMinutes("một hai ba")).toBe(1);
    expect(readingMinutes(Array(401).fill("chữ").join(" "))).toBe(3);
    expect(readingMinutes("")).toBe(1);
  });
});

describe("slug", () => {
  test("bỏ dấu tiếng Việt, đ thành d, chữ thường, nối bằng gạch ngang", () => {
    expect(slugify("Cuối tuần nhân đôi kinh nghiệm")).toBe("cuoi-tuan-nhan-doi-kinh-nghiem");
    expect(slugify("Cập nhật 1.0.3: sửa lỗi và cân bằng lại vũ khí")).toBe(
      "cap-nhat-1-0-3-sua-loi-va-can-bang-lai-vu-khi",
    );
    expect(slugify("  ĐẶNG  Ợ  ")).toBe("dang-o");
  });

  test("tối đa 100 ký tự và không kết thúc bằng gạch ngang", () => {
    const slug = slugify(`${"a".repeat(98)} bbb ccc`);
    expect(slug.length).toBeLessThanOrEqual(100);
    expect(slug.endsWith("-")).toBe(false);
  });

  test("tiêu đề không có chữ nào dùng được thì có giá trị mặc định", () => {
    expect(slugify("!!!")).toBe("bai-viet");
  });

  test("không trùng: thêm hậu tố", () => {
    expect(uniqueSlug("tin", ["tin", "tin-2"])).toBe("tin-3");
    expect(uniqueSlug("moi", ["tin"])).toBe("moi");
    expect(uniqueSlug("a".repeat(100), ["a".repeat(100)]).length).toBeLessThanOrEqual(100);
  });

  test("foldText bỏ dấu và chữ hoa để tìm kiếm", () => {
    expect(foldText("Đèn Khò")).toBe("den kho");
    expect(foldText("AK-74")).toBe("ak-74");
  });
});

describe("làm sạch HTML của bodyHtml", () => {
  test("giữ các thẻ được phép", () => {
    const html =
      "<p>Xin <strong>chào</strong> và <em>nghiêng</em></p><h2>Mục</h2><ul><li>Một</li></ul>";
    expect(sanitizeHtml(html)).toBe(html);
  });

  test("bỏ script cùng nội dung của nó", () => {
    expect(sanitizeHtml("<p>a</p><script>alert(1)</script><p>b</p>")).toBe("<p>a</p><p>b</p>");
  });

  test("bỏ thuộc tính sự kiện và kiểu nội tuyến", () => {
    expect(sanitizeHtml('<p onclick="x()" style="color:red">a</p>')).toBe("<p>a</p>");
    expect(sanitizeHtml('<img src="/a.png" alt="ảnh" onerror="alert(1)">')).toBe(
      '<img src="/a.png" alt="ảnh">',
    );
  });

  test("img chỉ nhận nguồn nội bộ", () => {
    expect(sanitizeHtml('<img src="https://evil.test/x.png">')).toBe("");
    expect(sanitizeHtml('<img src="//evil.test/x.png">')).toBe("");
    expect(sanitizeHtml('<img src="javascript:alert(1)">')).toBe("");
  });

  test("liên kết: chặn javascript và các cách lách, tự thêm rel", () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe("<a>x</a>");
    expect(sanitizeHtml('<a href="JaVa\tScript:alert(1)">x</a>')).toBe("<a>x</a>");
    expect(sanitizeHtml('<a href="&#106;avascript:alert(1)">x</a>')).toBe("<a>x</a>");
    expect(sanitizeHtml('<a href="//evil.test">x</a>')).toBe("<a>x</a>");
    expect(sanitizeHtml('<a href="https://example.com/a" target="_blank">x</a>')).toBe(
      '<a href="https://example.com/a" rel="noopener noreferrer">x</a>',
    );
    expect(sanitizeHtml('<a href="/tin-tuc">x</a>')).toBe(
      '<a href="/tin-tuc" rel="noopener noreferrer">x</a>',
    );
  });

  test("thẻ lạ bị gỡ nhưng giữ chữ bên trong", () => {
    expect(sanitizeHtml("<div><span>chữ</span></div>")).toBe("chữ");
  });

  test("iframe, style và chú thích bị bỏ hẳn", () => {
    expect(
      sanitizeHtml('<iframe src="/x">nội dung</iframe><style>p{}</style><!-- ghi chú -->a'),
    ).toBe("a");
  });

  test("dấu < lẻ được mã hóa, thẻ không đóng được đóng lại", () => {
    expect(sanitizeHtml("1 < 2")).toBe("1 &lt; 2");
    expect(sanitizeHtml("<p><strong>a")).toBe("<p><strong>a</strong></p>");
    expect(sanitizeHtml("a</p>b")).toBe("ab");
  });

  test("chuỗi rỗng", () => {
    expect(sanitizeHtml("")).toBe("");
  });
});
