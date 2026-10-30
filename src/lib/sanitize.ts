// Làm sạch bodyHtml bằng danh sách cho phép (ROUTES-AND-DATA.md mục 11).
// Máy chủ vẫn phải làm sạch. Đây là lớp phòng thủ thứ hai ở giao diện. Không cần DOM nên chạy được khi dựng sẵn.

const ALLOWED_TAGS = new Set(["p", "h2", "h3", "ul", "ol", "li", "a", "img", "strong", "em"]);
const VOID_TAGS = new Set(["img"]);
/** Bỏ cả nội dung bên trong. */
const DROP_WITH_CONTENT = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "noscript",
  "template",
  "svg",
  "math",
  "title",
  "textarea",
]);

const TAG_PATTERN =
  /^<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^\s"'<>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/;
const ATTR_PATTERN = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);?/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&colon;/gi, ":")
    .replace(/&tab;|&newline;/gi, "")
    .replace(/&amp;/gi, "&");
}

/** Chỉ nhận đường dẫn nội bộ (bắt đầu bằng "/" và không bắt đầu bằng "//"), https, http hoặc mailto. */
export function isSafeHref(raw: string): boolean {
  const value = decodeBasicEntities(raw)
    // biome-ignore lint/suspicious/noControlCharactersInRegex: loại ký tự điều khiển dùng để lách bộ lọc
    .replace(/[\u0000-\u0020\u007f]/g, "");
  if (value.startsWith("//")) return false;
  if (value.startsWith("/")) return true;
  return /^(https?:|mailto:)/i.test(value);
}

function isSafeImageSrc(raw: string): boolean {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: loại ký tự điều khiển dùng để lách bộ lọc
  const value = decodeBasicEntities(raw).replace(/[\u0000-\u0020\u007f]/g, "");
  return value.startsWith("/") && !value.startsWith("//");
}

function readAttributes(source: string): Map<string, string> {
  const attributes = new Map<string, string>();
  for (const match of source.matchAll(ATTR_PATTERN)) {
    const name = (match[1] ?? "").toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (name && !attributes.has(name)) attributes.set(name, value);
  }
  return attributes;
}

function buildOpenTag(tag: string, attributes: Map<string, string>): string | null {
  if (tag === "a") {
    const href = attributes.get("href");
    if (href === undefined || !isSafeHref(href)) return "<a>";
    return `<a href="${escapeAttr(href)}" rel="noopener noreferrer">`;
  }
  if (tag === "img") {
    const src = attributes.get("src");
    if (src === undefined || !isSafeImageSrc(src)) return null;
    return `<img src="${escapeAttr(src)}" alt="${escapeAttr(attributes.get("alt") ?? "")}">`;
  }
  return `<${tag}>`;
}

export function sanitizeHtml(input: string): string {
  let output = "";
  const stack: string[] = [];
  let index = 0;

  while (index < input.length) {
    const lt = input.indexOf("<", index);
    if (lt === -1) {
      output += input.slice(index);
      break;
    }
    output += input.slice(index, lt);
    const rest = input.slice(lt);

    if (rest.startsWith("<!--")) {
      const end = rest.indexOf("-->");
      index = end === -1 ? input.length : lt + end + 3;
      continue;
    }

    const match = TAG_PATTERN.exec(rest);
    if (!match) {
      output += "&lt;";
      index = lt + 1;
      continue;
    }

    const closing = match[1] === "/";
    const tag = (match[2] ?? "").toLowerCase();
    index = lt + match[0].length;

    if (DROP_WITH_CONTENT.has(tag)) {
      if (!closing) {
        const closeAt = input.toLowerCase().indexOf(`</${tag}`, index);
        if (closeAt === -1) {
          index = input.length;
        } else {
          const gt = input.indexOf(">", closeAt);
          index = gt === -1 ? input.length : gt + 1;
        }
      }
      continue;
    }

    if (!ALLOWED_TAGS.has(tag)) continue;

    if (closing) {
      const at = stack.lastIndexOf(tag);
      if (at === -1) continue;
      while (stack.length > at) output += `</${stack.pop()}>`;
      continue;
    }

    const open = buildOpenTag(tag, readAttributes(match[3] ?? ""));
    if (open === null) continue;
    output += open;
    if (!VOID_TAGS.has(tag)) stack.push(tag);
  }

  while (stack.length > 0) output += `</${stack.pop()}>`;
  return output;
}

/** Chữ thuần của một đoạn HTML (đã làm sạch), dùng để đếm chữ và tính thời gian đọc. */
export function htmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
