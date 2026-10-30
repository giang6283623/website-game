// Bộ xử lý của API giả cho quản trị (E4). Mọi đường `/admin` kiểm quyền trước: khách 401, người chơi 403.
// Mỗi hành động thay đổi dữ liệu ghi một dòng vào nhật ký, như máy chủ thật sẽ làm.
import { sanitizeHtml } from "../../lib/sanitize.ts";
import { foldText, slugify, uniqueSlug } from "../../lib/slug.ts";
import {
  type AdminBanner,
  type AdminUser,
  type AuditEntry,
  type Banner,
  ITEM_GROUP_KEYS,
  type Item,
  type ItemGroupKey,
  type ItemStat,
  NEWS_CATEGORY_KEYS,
  type NewsPost,
} from "../schemas.ts";
import type { MockConfig } from "./config.ts";
import { db, MOCK_NOW, mockToday } from "./db.ts";
import {
  created,
  FORBIDDEN,
  fail,
  NOT_FOUND,
  noContent,
  ok,
  type Query,
  type Reply,
  SERVER_ERROR,
  UNAUTHORIZED,
} from "./reply.ts";
import { adminAccount, type SessionKind } from "./session.ts";

const PAGE_SIZE = 20;
const FEATURED_MAX = 4;
const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
const UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Body = Record<string, unknown>;

function pageOf<T>(list: readonly T[], query: Query) {
  const limit = Number(query.limit);
  const size = Number.isInteger(limit) && limit >= 1 ? Math.min(limit, 50) : PAGE_SIZE;
  const raw = Number(query.trang);
  const page = Number.isInteger(raw) && raw >= 1 ? raw : 1;
  const total = list.length;
  return {
    rows: list.slice((page - 1) * size, page * size),
    page,
    pageSize: size,
    total,
    totalPages: Math.ceil(total / size),
  };
}

function audit(
  action: string,
  actionLabel: string,
  targetType: AuditEntry["targetType"],
  targetLabel: string,
) {
  const next = db.auditLog.reduce((max, entry) => Math.max(max, entry.id), 0) + 1;
  db.auditLog.unshift({
    id: next,
    at: MOCK_NOW,
    actorName: adminAccount().displayName,
    action,
    actionLabel,
    targetType,
    targetLabel,
  });
}

// Bài viết -----------------------------------------------------------------------------------

function allNews(): NewsPost[] {
  return [...db.news, ...db.newsDetailOnly];
}

function newsSortKey(post: NewsPost): string {
  return post.publishedAt ?? post.createdAt;
}

function newsList(query: Query): Reply {
  const status = query.status === "published" || query.status === "draft" ? query.status : null;
  const term = foldText((query.q ?? "").trim());
  const rows = allNews()
    .filter((post) => !status || post.status === status)
    .filter((post) => !term || foldText(post.title).includes(term))
    .sort((a, b) => newsSortKey(b).localeCompare(newsSortKey(a)));
  const paged = pageOf(rows, query);
  return ok({ items: paged.rows, ...omitRows(paged) });
}

function omitRows<T extends { rows: unknown }>(paged: T): Omit<T, "rows"> {
  const { rows: _rows, ...rest } = paged;
  return rest;
}

/** Tiêu đề luôn bắt buộc. Phân loại và nội dung chỉ bắt buộc khi bài sẽ ở trạng thái đã đăng. */
function validateNews(values: Body, strict: boolean): Record<string, string> | null {
  const errors: Record<string, string> = {};
  const title = typeof values.title === "string" ? values.title.trim() : "";
  if (!title) errors.title = "Nhập tiêu đề bài viết.";
  else if (title.length > 80) errors.title = "Tiêu đề tối đa 80 ký tự.";
  if (strict) {
    if (!(NEWS_CATEGORY_KEYS as readonly unknown[]).includes(values.category)) {
      errors.category = "Chọn một phân loại.";
    }
    const text =
      typeof values.bodyHtml === "string" ? values.bodyHtml.replace(/<[^>]*>/g, "").trim() : "";
    if (!text) errors.bodyHtml = "Bài viết cần có nội dung.";
  }
  return Object.keys(errors).length > 0 ? errors : null;
}

function excerptOf(html: string): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 200 ? `${text.slice(0, 197)}...` : text;
}

function applyNews(post: NewsPost, data: Body): void {
  if (typeof data.title === "string") post.title = data.title.trim();
  if (typeof data.category === "string") post.category = data.category as NewsPost["category"];
  if (typeof data.bodyHtml === "string") {
    post.bodyHtml = sanitizeHtml(data.bodyHtml);
    post.excerpt = excerptOf(post.bodyHtml);
  }
  if ("coverImageKey" in data) post.coverImageKey = (data.coverImageKey as string | null) ?? null;
  if (typeof data.pinned === "boolean") post.pinned = data.pinned;
  if (typeof data.notifyInGame === "boolean") post.notifyInGame = data.notifyInGame;
  post.updatedAt = MOCK_NOW;
}

function createNews(data: Body): Reply {
  const errors = validateNews(data, data.status === "published");
  if (errors) return fail(422, "validation_failed", "Dữ liệu chưa hợp lệ.", errors);
  const posts = allNews();
  const id = posts.reduce((max, post) => Math.max(max, post.id), 0) + 1;
  const title = String(data.title).trim();
  const post: NewsPost = {
    id,
    slug: uniqueSlug(
      slugify(title),
      posts.map((item) => item.slug),
    ),
    title,
    category: (data.category as NewsPost["category"] | undefined) ?? "tin-tuc",
    status: data.status === "published" ? "published" : "draft",
    pinned: false,
    notifyInGame: false,
    publishedAt: data.status === "published" ? MOCK_NOW : null,
    authorName: "Ban quản trị",
    excerpt: null,
    coverImageKey: null,
    bodyHtml: null,
    createdAt: MOCK_NOW,
    updatedAt: MOCK_NOW,
  };
  applyNews(post, data);
  db.news.unshift(post);
  if (post.status === "published") audit("news.publish", "ĐĂNG BÀI", "news", post.title);
  else audit("news.draft", "LƯU NHÁP", "news", post.title);
  return created(post);
}

function updateNews(id: number, data: Body): Reply {
  const post = allNews().find((item) => item.id === id);
  if (!post) return NOT_FOUND("Không tìm thấy bài viết.");
  const nextStatus =
    data.status === "published" || data.status === "draft" ? data.status : post.status;
  const errors = validateNews(
    {
      title: data.title ?? post.title,
      category: data.category ?? post.category,
      bodyHtml: data.bodyHtml ?? post.bodyHtml,
    },
    nextStatus === "published",
  );
  if (errors) return fail(422, "validation_failed", "Dữ liệu chưa hợp lệ.", errors);
  const before = post.status;
  applyNews(post, data);
  if (data.status === "published" || data.status === "draft") {
    post.status = data.status;
    if (data.status === "published" && !post.publishedAt) post.publishedAt = MOCK_NOW;
  }
  if (before === "draft" && post.status === "published")
    audit("news.publish", "ĐĂNG BÀI", "news", post.title);
  else if (before === "published" && post.status === "draft")
    audit("news.hide", "ẨN BÀI", "news", post.title);
  else audit("news.update", "SỬA BÀI", "news", post.title);
  return ok(post);
}

function upload(data: unknown): Reply {
  const file = data instanceof FormData ? data.get("file") : null;
  if (!(file instanceof Blob)) return fail(422, "validation_failed", "Chưa có tệp.");
  if (!UPLOAD_TYPES.includes(file.type) || file.size > UPLOAD_MAX_BYTES) {
    return fail(422, "validation_failed", "Chỉ nhận ảnh JPG, PNG hoặc WebP, tối đa 5 MB.");
  }
  const random = Math.random().toString(36).slice(2, 10);
  return created({ imageKey: `uploads/${random}.webp` });
}

// Vật phẩm -----------------------------------------------------------------------------------

function itemList(query: Query): Reply {
  const term = foldText((query.q ?? "").trim());
  const rows = db.items
    .filter((item) => !query.loai || item.group === query.loai)
    .filter((item) => !term || foldText(item.name).includes(term));
  const paged = pageOf(rows, query);
  return ok({
    items: paged.rows,
    ...omitRows(paged),
    groups: db.itemGroups,
    featuredCount: db.items.filter((item) => item.featured).length,
    featuredMax: FEATURED_MAX,
  });
}

const ITEM_LIMITS = {
  name: 60,
  slug: 60,
  typeLabel: 40,
  statLine: 80,
  description: 400,
  imageKey: 120,
  gameItemId: 40,
  statText: 40,
  stats: 6,
};
const ITEM_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ITEM_IMAGE_KEY = /^(?!.*\.\.)[a-z0-9][a-z0-9/_.-]*\.(?:webp|png|jpe?g)$/i;
const ITEM_GROUPS = new Set<string>(ITEM_GROUP_KEYS);

const asText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");
const sizeOf = (text: string): number => Array.from(text).length;

/** Dòng chỉ số tự tạo từ hai chỉ số đầu khi người dùng để trống: "Sát thương 32 · Tầm xa 120 m". */
function statLineOf(stats: ItemStat[]): string {
  return stats
    .slice(0, 2)
    .map(({ label, value }) => {
      const lower = label.toLocaleLowerCase("vi");
      return `${lower.charAt(0).toLocaleUpperCase("vi")}${lower.slice(1)} ${value}`;
    })
    .join(" · ");
}

/**
 * Kiểm các trường vật phẩm. Khi tạo, mọi trường bắt buộc đều được kiểm. Khi sửa, chỉ kiểm trường có gửi lên.
 * Đường dẫn chỉ nhận lúc tạo, không đổi được về sau.
 */
function readItemFields(
  data: Body,
  creating: boolean,
): { errors: Record<string, string>; value: Partial<Item> } {
  const errors: Record<string, string> = {};
  const value: Partial<Item> = {};
  const sent = (key: string) => creating || key in data;

  if (sent("name")) {
    const name = asText(data.name);
    if (!name) errors.name = "Nhập tên vật phẩm.";
    else if (sizeOf(name) > ITEM_LIMITS.name) errors.name = `Tên tối đa ${ITEM_LIMITS.name} ký tự.`;
    else value.name = name;
  }
  if (creating) {
    const slug = asText(data.slug);
    if (!slug) errors.slug = "Nhập đường dẫn.";
    else if (slug.length > ITEM_LIMITS.slug || !ITEM_SLUG.test(slug)) {
      errors.slug = "Chỉ dùng chữ thường, số và dấu gạch ngang.";
    } else if (db.items.some((item) => item.slug === slug)) {
      errors.slug = "Đường dẫn này đã có vật phẩm khác dùng.";
    } else value.slug = slug;
  }
  if (sent("group")) {
    if (typeof data.group !== "string" || !ITEM_GROUPS.has(data.group)) {
      errors.group = "Chọn một nhóm.";
    } else value.group = data.group as ItemGroupKey;
  }
  if (sent("typeLabel")) {
    const typeLabel = asText(data.typeLabel);
    if (!typeLabel) errors.typeLabel = "Nhập nhãn loại.";
    else if (sizeOf(typeLabel) > ITEM_LIMITS.typeLabel) {
      errors.typeLabel = `Nhãn loại tối đa ${ITEM_LIMITS.typeLabel} ký tự.`;
    } else value.typeLabel = typeLabel;
  }
  if (sent("stats")) {
    const list = Array.isArray(data.stats) ? (data.stats as unknown[]) : [];
    const stats: ItemStat[] = [];
    let broken = list.length > ITEM_LIMITS.stats;
    for (const entry of list) {
      const row = (entry && typeof entry === "object" ? entry : {}) as Body;
      const label = asText(row.label);
      const text = asText(row.value);
      if (
        !label ||
        !text ||
        sizeOf(label) > ITEM_LIMITS.statText ||
        sizeOf(text) > ITEM_LIMITS.statText
      ) {
        broken = true;
      } else stats.push({ label: label.toLocaleUpperCase("vi"), value: text });
    }
    if (broken) {
      errors.stats = `Mỗi chỉ số cần nhãn và giá trị, tối đa ${ITEM_LIMITS.stats} dòng.`;
    } else value.stats = stats;
  }
  if (sent("statLine")) {
    const statLine = asText(data.statLine);
    if (sizeOf(statLine) > ITEM_LIMITS.statLine) {
      errors.statLine = `Dòng chỉ số tối đa ${ITEM_LIMITS.statLine} ký tự.`;
    } else value.statLine = statLine;
  }
  if (sent("description")) {
    const description = asText(data.description);
    if (sizeOf(description) > ITEM_LIMITS.description) {
      errors.description = `Mô tả tối đa ${ITEM_LIMITS.description} ký tự.`;
    } else value.description = description || null;
  }
  if (sent("imageKey")) {
    const imageKey = asText(data.imageKey);
    // Vật phẩm nhập từ client game có thể chưa có hình (xem C-74), nên ô này không bắt buộc.
    if (imageKey && (imageKey.length > ITEM_LIMITS.imageKey || !ITEM_IMAGE_KEY.test(imageKey))) {
      errors.imageKey = "Khóa hình không hợp lệ.";
    } else value.imageKey = imageKey;
  }
  if (sent("gameItemId")) {
    const gameItemId = asText(data.gameItemId);
    if (sizeOf(gameItemId) > ITEM_LIMITS.gameItemId) {
      errors.gameItemId = `Mã trong game tối đa ${ITEM_LIMITS.gameItemId} ký tự.`;
    } else value.gameItemId = gameItemId || null;
  }
  return { errors, value };
}

function featuredFull(): boolean {
  return db.items.filter((candidate) => candidate.featured).length >= FEATURED_MAX;
}

const FEATURED_FULL_MESSAGE = `Chọn tối đa ${FEATURED_MAX} vật phẩm nổi bật.`;

function createItem(data: Body): Reply {
  const { errors, value } = readItemFields(data, true);
  const featured = data.featured === true;
  if (featured && featuredFull()) errors.featured = FEATURED_FULL_MESSAGE;
  if (Object.keys(errors).length > 0) {
    return fail(422, "validation_failed", "Dữ liệu chưa hợp lệ.", errors);
  }
  const stats = value.stats ?? [];
  const item: Item = {
    id: db.items.reduce((max, candidate) => Math.max(max, candidate.id), 0) + 1,
    slug: value.slug ?? "",
    name: value.name ?? "",
    group: value.group ?? "vu-khi",
    typeLabel: value.typeLabel ?? "",
    statLine: value.statLine || statLineOf(stats),
    imageKey: value.imageKey ?? "",
    hudKey: null,
    description: value.description ?? null,
    stats,
    publishedAt: MOCK_NOW,
    featured,
    visible: data.visible !== false,
    gameItemId: value.gameItemId ?? null,
  };
  db.items.unshift(item);
  audit("item.create", "THÊM VẬT PHẨM", "item", `Vật phẩm ${item.name}`);
  return created(item);
}

const ITEM_CONTENT_KEYS = [
  "name",
  "group",
  "typeLabel",
  "statLine",
  "imageKey",
  "description",
  "stats",
  "gameItemId",
] as const;

function patchItem(id: number, data: Body): Reply {
  const item: Item | undefined = db.items.find((candidate) => candidate.id === id);
  if (!item) return NOT_FOUND("Không tìm thấy vật phẩm.");
  const { errors, value } = readItemFields(data, false);
  if (data.featured === true && !item.featured && featuredFull()) {
    errors.featured = FEATURED_FULL_MESSAGE;
  }
  if (Object.keys(errors).length > 0) {
    const message =
      errors.featured && Object.keys(errors).length === 1
        ? errors.featured
        : "Dữ liệu chưa hợp lệ.";
    return fail(422, "validation_failed", message, errors);
  }
  if ("statLine" in value && !value.statLine) {
    value.statLine = statLineOf(value.stats ?? item.stats);
  }
  const changed = ITEM_CONTENT_KEYS.some(
    (key) => key in value && JSON.stringify(value[key]) !== JSON.stringify(item[key]),
  );
  Object.assign(item, value);
  if (changed) audit("item.update", "SỬA VẬT PHẨM", "item", `Vật phẩm ${item.name}`);
  if (typeof data.featured === "boolean" && data.featured !== item.featured) {
    item.featured = data.featured;
    audit(
      data.featured ? "item.feature" : "item.unfeature",
      data.featured ? "BẬT NỔI BẬT" : "TẮT NỔI BẬT",
      "item",
      `Vật phẩm ${item.name}`,
    );
  }
  if (typeof data.visible === "boolean" && data.visible !== item.visible) {
    item.visible = data.visible;
    audit(
      data.visible ? "item.show" : "item.hide",
      data.visible ? "HIỆN VẬT PHẨM" : "ẨN VẬT PHẨM",
      "item",
      `Vật phẩm ${item.name}`,
    );
  }
  return ok(item);
}

// Banner -------------------------------------------------------------------------------------

function bannerStatusOf(banner: Banner): AdminBanner["status"] {
  const today = mockToday();
  if (banner.endsAt < today) return "expired";
  if (banner.startsAt > today) return "scheduled";
  return banner.enabled ? "showing" : "off";
}

function bannerRow(banner: Banner & { expectedStatus?: string }): AdminBanner {
  const { expectedStatus: _ignored, ...rest } = banner;
  return { ...rest, status: bannerStatusOf(banner) };
}

function validateBanner(
  data: Body,
  partial: boolean,
  current?: Banner,
): Record<string, string> | null {
  const errors: Record<string, string> = {};
  if (!partial || "message" in data) {
    const message = typeof data.message === "string" ? data.message.trim() : "";
    if (!message) errors.message = "Nhập nội dung banner.";
    else if (message.length > 120) errors.message = "Nội dung tối đa 120 ký tự.";
  }
  const startsAt = (data.startsAt as string | undefined) ?? current?.startsAt ?? "";
  const endsAt = (data.endsAt as string | undefined) ?? current?.endsAt ?? "";
  if (!partial || "startsAt" in data) if (!startsAt) errors.startsAt = "Chọn ngày bắt đầu.";
  if (!partial || "endsAt" in data) if (!endsAt) errors.endsAt = "Chọn ngày kết thúc.";
  if (startsAt && endsAt && endsAt < startsAt)
    errors.endsAt = "Ngày kết thúc không sớm hơn ngày bắt đầu.";
  if (typeof data.linkUrl === "string" && data.linkUrl && !data.linkUrl.startsWith("/")) {
    errors.linkUrl = "Liên kết là đường dẫn trong trang, bắt đầu bằng /.";
  }
  return Object.keys(errors).length > 0 ? errors : null;
}

function switchOthersOff(keep: Banner) {
  for (const other of db.banners) {
    if (other !== keep && other.enabled) other.enabled = false;
  }
}

function createBanner(data: Body): Reply {
  const errors = validateBanner(data, false);
  if (errors) return fail(422, "validation_failed", "Dữ liệu chưa hợp lệ.", errors);
  const id = db.banners.reduce((max, banner) => Math.max(max, banner.id), 0) + 1;
  const banner: Banner = {
    id,
    message: String(data.message).trim(),
    linkUrl: typeof data.linkUrl === "string" && data.linkUrl ? data.linkUrl : null,
    startsAt: String(data.startsAt),
    endsAt: String(data.endsAt),
    enabled: data.enabled === true,
    createdAt: MOCK_NOW,
  };
  db.banners.unshift(banner);
  if (banner.enabled) switchOthersOff(banner);
  audit("banner.create", "THÊM BANNER", "banner", banner.message);
  return created(bannerRow(banner));
}

function patchBanner(id: number, data: Body): Reply {
  const banner = db.banners.find((candidate) => candidate.id === id);
  if (!banner) return NOT_FOUND("Không tìm thấy banner.");
  const errors = validateBanner(data, true, banner);
  if (errors) return fail(422, "validation_failed", "Dữ liệu chưa hợp lệ.", errors);
  const wasEnabled = banner.enabled;
  if (typeof data.message === "string") banner.message = data.message.trim();
  if ("linkUrl" in data)
    banner.linkUrl = typeof data.linkUrl === "string" && data.linkUrl ? data.linkUrl : null;
  if (typeof data.startsAt === "string") banner.startsAt = data.startsAt;
  if (typeof data.endsAt === "string") banner.endsAt = data.endsAt;
  if (typeof data.enabled === "boolean") banner.enabled = data.enabled;
  if (banner.enabled) switchOthersOff(banner);
  const toggled = typeof data.enabled === "boolean" && data.enabled !== wasEnabled;
  audit(
    toggled ? (banner.enabled ? "banner.enable" : "banner.disable") : "banner.update",
    toggled ? (banner.enabled ? "BẬT BANNER" : "TẮT BANNER") : "SỬA BANNER",
    "banner",
    banner.message,
  );
  return ok(bannerRow(banner));
}

// Người dùng và nhật ký ---------------------------------------------------------------------

function userList(query: Query): Reply {
  const term = foldText((query.q ?? "").trim());
  const rows = db.adminUsers
    .filter((user) => !query["vai-tro"] || user.role === query["vai-tro"])
    .filter((user) => query["trang-thai"] !== "banned" || user.status === "banned")
    .filter(
      (user) =>
        !term ||
        foldText(user.displayName).includes(term) ||
        foldText(user.emailMasked).includes(term),
    );
  const paged = pageOf(rows, query);
  return ok({ users: paged.rows, ...omitRows(paged) });
}

/**
 * Chi tiết người dùng (G-23). Hạng lấy từ bảng xếp hạng mẫu theo tên hiển thị.
 * Dữ liệu mẫu chỉ có hai nhân vật, nên người chơi nào cũng nhận hai nhân vật này, đổi tên theo tên hiển thị.
 * Quản trị viên không có nhân vật. Nhật ký là các dòng nhắm vào người này.
 */
function userDetail(id: number): Reply {
  const user = db.adminUsers.find((candidate) => candidate.id === id);
  if (!user) return NOT_FOUND("Không tìm thấy người dùng.");
  const row = db.players.find((player) => player.playerName === user.displayName);
  const ranking = row
    ? { rank: row.rank, clanName: row.clanName ?? null, gameDollar: row.gameDollar, xp: row.xp }
    : null;
  const characters =
    user.role === "player"
      ? db.characters.map((character, index) => ({
          id: user.id * 10 + index + 1,
          name: `${user.displayName}${String(index + 1).padStart(2, "0")}`,
          level: character.level,
          profession: character.profession,
          nightsSurvived: character.nightsSurvived,
        }))
      : [];
  const history = db.auditLog
    .filter((entry) => entry.targetType === "user" && entry.targetLabel === user.displayName)
    .sort((a, b) => b.at.localeCompare(a.at) || b.id - a.id);
  return ok({ ...user, ranking, characters, history });
}

function setLock(id: number, lock: boolean): Reply {
  const user: AdminUser | undefined = db.adminUsers.find((candidate) => candidate.id === id);
  if (!user) return NOT_FOUND("Không tìm thấy người dùng.");
  if (lock && user.displayName === adminAccount().displayName) {
    const message = "Không thể tự khóa tài khoản của chính mình.";
    return fail(422, "validation_failed", message, { user: message });
  }
  user.status = lock ? "banned" : "active";
  audit(
    lock ? "user.lock" : "user.unlock",
    lock ? "KHÓA NGƯỜI DÙNG" : "MỞ KHÓA NGƯỜI DÙNG",
    "user",
    user.displayName,
  );
  return ok(user);
}

function auditList(query: Query): Reply {
  const rows = db.auditLog
    .filter((entry) => !query["doi-tuong"] || entry.targetType === query["doi-tuong"])
    .sort((a, b) => b.at.localeCompare(a.at) || b.id - a.id);
  const paged = pageOf(rows, query);
  return ok({ entries: paged.rows, ...omitRows(paged) });
}

// Cửa vào ------------------------------------------------------------------------------------

export function handleAdmin(
  method: string,
  path: string,
  query: Query,
  body: unknown,
  config: MockConfig,
  session: SessionKind | null,
): Reply {
  if (!session) return UNAUTHORIZED();
  if (session !== "admin") return FORBIDDEN();
  if (config.mode === "error") return SERVER_ERROR();

  const data = (body && typeof body === "object" ? body : {}) as Body;
  const match = /^\/admin\/([a-z]+)(?:\/(\d+))?(?:\/([a-z]+))?$/.exec(path);
  if (!match) return NOT_FOUND();
  const [, resource, rawId, action] = match;
  const id = rawId ? Number(rawId) : null;

  if (config.mode === "empty" && method === "get" && id === null) {
    // Chế độ rỗng: mọi danh sách quản trị rỗng để xem trạng thái ListState.
    if (resource === "news")
      return ok({ items: [], page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 0 });
    if (resource === "banners") return ok({ banners: [] });
    if (resource === "users")
      return ok({ users: [], page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 0 });
    if (resource === "audit")
      return ok({ entries: [], page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 0 });
  }

  switch (resource) {
    case "news":
      if (method === "get" && id === null) return newsList(query);
      if (method === "get" && id !== null) {
        const post = allNews().find((item) => item.id === id);
        return post ? ok(post) : NOT_FOUND("Không tìm thấy bài viết.");
      }
      if (method === "post" && id === null) return createNews(data);
      if (method === "put" && id !== null) return updateNews(id, data);
      if (method === "delete" && id !== null) {
        const index = db.news.findIndex((item) => item.id === id);
        if (index < 0) return NOT_FOUND("Không tìm thấy bài viết.");
        const [removed] = db.news.splice(index, 1);
        audit("news.delete", "XÓA BÀI", "news", removed?.title ?? "");
        return noContent();
      }
      break;
    case "uploads":
      if (method === "post") return upload(body);
      break;
    case "items":
      if (method === "get" && id === null) return itemList(query);
      if (method === "get" && id !== null) {
        const item = db.items.find((candidate) => candidate.id === id);
        return item ? ok(item) : NOT_FOUND("Không tìm thấy vật phẩm.");
      }
      if (method === "post" && id === null) return createItem(data);
      if (method === "patch" && id !== null) return patchItem(id, data);
      break;
    case "banners":
      if (method === "get" && id === null) return ok({ banners: db.banners.map(bannerRow) });
      if (method === "post" && id === null) return createBanner(data);
      if (method === "patch" && id !== null) return patchBanner(id, data);
      if (method === "delete" && id !== null) {
        const index = db.banners.findIndex((item) => item.id === id);
        if (index < 0) return NOT_FOUND("Không tìm thấy banner.");
        const [removed] = db.banners.splice(index, 1);
        audit("banner.delete", "XÓA BANNER", "banner", removed?.message ?? "");
        return noContent();
      }
      break;
    case "users":
      if (method === "get" && id === null) return userList(query);
      if (method === "get" && id !== null && !action) return userDetail(id);
      if (method === "post" && id !== null && (action === "lock" || action === "unlock")) {
        return setLock(id, action === "lock");
      }
      break;
    case "audit":
      if (method === "get" && id === null) return auditList(query);
      break;
    default:
      break;
  }
  return NOT_FOUND();
}
