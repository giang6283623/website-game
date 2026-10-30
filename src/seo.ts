// Thẻ trong <head>: tiêu đề, mô tả, địa chỉ chuẩn, robots và Open Graph.
// Cùng một hàm cho bước dựng HTML lúc build (chuỗi) và cho trình duyệt khi đổi trang (cập nhật DOM).
import { type RouteMeta, SITE_NAME } from "./routes.ts";

export type HeadTag = { tag: "meta" | "link"; attrs: Record<string, string> };

export type HeadInput = {
  pathname: string;
  /** Chuỗi truy vấn, ví dụ "?loai=su-kien&trang=2". */
  search?: string;
  /** Ghi đè tiêu đề của mẫu đường dẫn (trang chi tiết có tiêu đề riêng). */
  title?: string;
  description?: string;
  /** Gốc địa chỉ công khai, ví dụ "https://example.org". Chưa chọn tên miền (D-08) thì bỏ trống và không ghi canonical, og:url. */
  siteUrl?: string;
  /** Bản dựng dùng API giả: mọi trang gắn "noindex, nofollow" và không có canonical, og:url (C-91). */
  blockIndexing?: boolean;
};

export type Head = { title: string; tags: HeadTag[] };

/** Bỏ tham số lạ, bỏ trang=1 và tham số rỗng. Giữ thứ tự cố định để địa chỉ chuẩn ổn định. */
const CANONICAL_PARAMS = ["loai", "q", "sap-xep", "trang", "bang", "chon"] as const;

export function canonicalSearch(search: string | undefined): string {
  const params = new URLSearchParams(search ?? "");
  const out = new URLSearchParams();
  for (const key of CANONICAL_PARAMS) {
    const value = params.get(key);
    if (value === null || value === "") continue;
    if (key === "trang" && value === "1") continue;
    out.set(key, value);
  }
  const text = out.toString();
  return text ? `?${text}` : "";
}

/** Trang có từ khóa tìm hoặc trang số lớn hơn 1 gắn "noindex, follow" (ROUTES-AND-DATA.md mục 5). */
function isThinListing(search: string | undefined): boolean {
  const params = new URLSearchParams(search ?? "");
  const page = Number.parseInt(params.get("trang") ?? "1", 10);
  return (params.get("q") ?? "") !== "" || (Number.isFinite(page) && page > 1);
}

export function buildHead(route: RouteMeta, input: HeadInput): Head {
  const title = input.title ?? route.title;
  const description = input.description ?? route.description;
  const tags: HeadTag[] = [{ tag: "meta", attrs: { name: "description", content: description } }];

  const indexable = route.index && !input.blockIndexing;

  if (!indexable) {
    tags.push({ tag: "meta", attrs: { name: "robots", content: "noindex, nofollow" } });
  } else if (isThinListing(input.search)) {
    tags.push({ tag: "meta", attrs: { name: "robots", content: "noindex, follow" } });
  }

  tags.push(
    { tag: "meta", attrs: { property: "og:site_name", content: SITE_NAME } },
    { tag: "meta", attrs: { property: "og:type", content: "website" } },
    { tag: "meta", attrs: { property: "og:locale", content: "vi_VN" } },
    { tag: "meta", attrs: { property: "og:title", content: title } },
    { tag: "meta", attrs: { property: "og:description", content: description } },
  );

  if (input.siteUrl && indexable) {
    const base = input.siteUrl.replace(/\/+$/, "");
    const path = input.pathname === "/" ? "/" : input.pathname.replace(/\/+$/, "");
    const url = `${base}${path}${canonicalSearch(input.search)}`;
    tags.push(
      { tag: "link", attrs: { rel: "canonical", href: url } },
      { tag: "meta", attrs: { property: "og:url", content: url } },
    );
  }

  return { title, tags };
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Chuỗi HTML của các thẻ head (dùng khi dựng sẵn). Mỗi thẻ mang data-head để trình duyệt thay thế khi đổi trang. */
export function headToHtml(head: Head): string {
  const lines = [`<title>${escapeText(head.title)}</title>`];
  for (const { tag, attrs } of head.tags) {
    const text = Object.entries(attrs)
      .map(([name, value]) => `${name}="${escapeAttr(value)}"`)
      .join(" ");
    lines.push(`<${tag} ${text} data-head>`);
  }
  return lines.join("\n    ");
}

/** Cập nhật <head> trên trình duyệt: thay các thẻ do ứng dụng quản lý, không đụng thẻ khác. */
export function applyHead(head: Head, doc: Document = document): void {
  doc.title = head.title;
  for (const node of Array.from(doc.head.querySelectorAll("[data-head]"))) node.remove();
  for (const { tag, attrs } of head.tags) {
    const element = doc.createElement(tag);
    for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value);
    element.setAttribute("data-head", "");
    doc.head.appendChild(element);
  }
}
