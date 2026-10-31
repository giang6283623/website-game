// Lõi của API giả: nhận phương thức, đường dẫn, tham số, thân yêu cầu và phiên hiện tại, trả Reply.
// Trả đúng các lát cắt của dữ liệu mẫu theo hợp đồng ở ROUTES-AND-DATA.md mục 8.
// Bản chạy trong trình duyệt (adapter.ts) và máy chủ giả (scripts/lib/mock-api.ts) cùng gọi lõi này.
// Không dùng Bun hay Node ở đây, vì tệp này nằm trong gói API giả của trình duyệt.
import { foldText } from "../../lib/slug.ts";
import type { Banner, ClanRow, Item, NewsPost, NewsSummary, PlayerRow } from "../schemas.ts";
import type { CoreDeps } from "./account.ts";
import * as account from "./account.ts";
import { handleAdmin } from "./admin.ts";
import type { MockConfig } from "./config.ts";
import { db, mockToday } from "./db.ts";
import {
  fail,
  noContent,
  ok,
  type Query,
  type Reply,
  SERVER_ERROR,
  UNAUTHORIZED,
} from "./reply.ts";
import { accountFor, type Session } from "./session.ts";

export type { CoreDeps, PasswordHasher } from "./account.ts";

function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toSummary(post: NewsPost): NewsSummary {
  const body = post.bodyHtml ?? "";
  const excerpt = post.excerpt || plainText(body).slice(0, 160) || post.title;
  return {
    slug: post.slug,
    title: post.title,
    category: post.category,
    excerpt,
    coverImageKey: post.coverImageKey,
    publishedAt: post.publishedAt ?? post.createdAt,
    authorName: post.authorName,
  };
}

function isPublished(post: NewsPost, at: string): boolean {
  return post.status === "published" && post.publishedAt !== null && post.publishedAt <= at;
}

function pageNumber(raw: string | undefined): number {
  const value = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(value) && value >= 1 ? value : 1;
}

function limitOf(raw: string | undefined, fallback: number, max: number): number {
  const value = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(value) && value >= 1 ? Math.min(value, max) : fallback;
}

function listNews(query: Query, config: MockConfig, at: string): Reply {
  const pageSize = limitOf(query.limit, 8, 20);
  const page = pageNumber(query.trang);
  const category = query.loai;
  const all = config.mode === "empty" ? [] : db.news.filter((post) => isPublished(post, at));
  const filtered = all
    .filter((post) => !category || post.category === category)
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

  // Trang 1 không lọc: một bài nổi bật (bài ghim) và pageSize - 1 dòng. Các trang sau mỗi trang pageSize dòng.
  const pinnedPost = category ? null : (filtered.find((post) => post.pinned) ?? null);
  const rest = pinnedPost ? filtered.filter((post) => post.slug !== pinnedPost.slug) : filtered;
  const firstPageRows = pinnedPost ? pageSize - 1 : pageSize;
  const start = page === 1 ? 0 : firstPageRows + (page - 2) * pageSize;
  const rows = rest.slice(start, start + (page === 1 ? firstPageRows : pageSize));
  const featured = page === 1 && pinnedPost ? toSummary(pinnedPost) : null;

  return ok({
    items: rows.map(toSummary),
    page,
    pageSize,
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / pageSize),
    featured,
  });
}

function newsDetail(slug: string, at: string): Reply {
  const post = [...db.news, ...db.newsDetailOnly].find((candidate) => candidate.slug === slug);
  if (!post || !isPublished(post, at)) return fail(404, "not_found", "Không tìm thấy bài viết.");
  const related = db.news
    .filter((other) => other.slug !== slug && isPublished(other, at))
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
    .slice(0, 3)
    .map(toSummary);
  return ok({ ...toSummary(post), bodyHtml: post.bodyHtml ?? `<p>${post.title}</p>`, related });
}

function listItems(query: Query, config: MockConfig): Reply {
  const pageSize = limitOf(query.limit, 12, 48);
  const page = pageNumber(query.trang);
  const term = foldText((query.q ?? "").trim());
  const visible = config.mode === "empty" ? [] : db.items.filter((item) => item.visible);
  const filtered = visible
    .filter((item) => !query.loai || item.group === query.loai)
    .filter((item) => !term || foldText(item.name).includes(term));
  const sorted =
    query["sap-xep"] === "ten-a-z"
      ? [...filtered].sort((a, b) => a.name.localeCompare(b.name, "vi"))
      : [...filtered].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.id - b.id);
  return ok({
    items: sorted.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    total: sorted.length,
    totalPages: Math.ceil(sorted.length / pageSize),
    groups: db.itemGroups,
  });
}

function itemDetail(slug: string): Reply {
  const item: Item | undefined = db.items.find((candidate) => candidate.slug === slug);
  if (!item?.visible) return fail(404, "not_found", "Không tìm thấy vật phẩm.");
  return ok(item);
}

const emblemByClan = new Map(db.clans.map((clan) => [clan.name, clan.emblemKey]));

function clanRows(): ClanRow[] {
  return db.clans.map((clan) => ({
    rank: clan.rank,
    clanName: clan.name,
    emblemKey: clan.emblemKey,
    memberCount: clan.memberCount,
    gameDollar: clan.gameDollar,
    xp: clan.xp,
  }));
}

function ranking(query: Query, config: MockConfig, signedIn: boolean): Reply {
  const board = query.bang === "xp" || query.bang === "gia-toc" ? query.bang : "gamedollar";
  const page = pageNumber(query.trang);
  const pageSize = limitOf(query.limit, 50, 100);
  const term = foldText((query.q ?? "").trim());
  if (term && term.length < 2) return fail(422, "validation_failed", "Gõ ít nhất 2 ký tự.");

  if (board === "gia-toc") {
    const all = config.mode === "empty" ? [] : clanRows();
    const rows = all.filter((row) => !term || foldText(row.clanName).includes(term));
    const total = term || config.mode === "empty" ? rows.length : db.totalClans;
    const myClan = signedIn ? (all.find((row) => row.clanName === db.myClanName) ?? null) : null;
    return ok({
      board,
      rows: rows.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      totalPlayers: null,
      totalClans: total,
      me: null,
      myClan,
    });
  }

  const base: PlayerRow[] = config.mode === "empty" ? [] : db.players.map((row) => ({ ...row }));
  const ordered =
    board === "xp"
      ? [...base].sort((a, b) => b.xp - a.xp).map((row, index) => ({ ...row, rank: index + 1 }))
      : base;
  const withEmblem = ordered.map((row) => ({
    ...row,
    emblemKey: row.clanName ? (emblemByClan.get(row.clanName) ?? null) : null,
  }));
  const rows = withEmblem.filter((row) => !term || foldText(row.playerName).includes(term));
  const total = term || config.mode === "empty" ? rows.length : db.totalPlayers;
  return ok({
    board,
    rows: rows.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
    totalPlayers: total,
    totalClans: null,
    me:
      signedIn && config.mode !== "empty"
        ? { ...db.me, emblemKey: emblemByClan.get(db.me.clanName ?? "") ?? null }
        : null,
    myClan: null,
  });
}

function bannerStatus(banner: Banner): "showing" | "scheduled" | "expired" {
  const today = mockToday();
  if (today < banner.startsAt) return "scheduled";
  if (today > banner.endsAt) return "expired";
  return "showing";
}

function currentBanner(): Reply {
  const showing = db.banners.find((banner) => banner.enabled && bannerStatus(banner) === "showing");
  if (!showing) return ok({ banner: null });
  const { expectedStatus: _ignored, ...banner } = showing;
  return ok({ banner });
}

function serverStatus(config: MockConfig): Reply {
  const { factsOnHome: _facts, ...status } = db.serverStatus;
  if (config.mode === "offline") return ok({ ...status, online: false, playersOnline: null });
  return ok(status);
}

export type MockRequest = {
  method: string;
  path: string;
  query: Query;
  body: unknown;
  config: MockConfig;
  /** Phiên của yêu cầu này. Lõi không tự tìm phiên ở đâu khác. */
  session: Session | null;
};

export async function handleRequest(request: MockRequest, deps: CoreDeps): Promise<Reply> {
  const { method, path, query, body, config, session } = request;
  const dataMode = config.mode === "error";
  const at = deps.stamp();
  if (path.startsWith("/admin")) return handleAdmin(method, path, query, body, config, session, at);

  if (method === "get") {
    if (path === "/banner")
      return dataMode ? fail(500, "server_error", "Lỗi máy chủ.") : currentBanner();
    if (path === "/server/status")
      return dataMode ? fail(500, "server_error", "Lỗi máy chủ.") : serverStatus(config);
    if (path === "/download") {
      if (dataMode) return fail(500, "server_error", "Lỗi máy chủ.");
      // Chế độ rỗng giả lập bộ cài chưa sẵn sàng (available = false, ROUTES-AND-DATA.md mục 7.6).
      return config.mode === "empty"
        ? ok({ ...db.downloadInfo, available: false, installerUrl: null })
        : ok(db.downloadInfo);
    }
    if (path === "/me") return session ? ok(accountFor(session)) : UNAUTHORIZED();
    if (path === "/me/characters") {
      if (!session) return UNAUTHORIZED();
      if (dataMode) return SERVER_ERROR();
      const none = config.mode === "empty" || session.kind === "new";
      return ok({
        characters: none ? [] : db.characters,
        skills: session.kind === "new" ? [] : db.skills,
      });
    }
    if (path.startsWith("/auth/reset/"))
      return account.resetCheck(decodeURIComponent(path.slice(12)));
    if (dataMode && /^\/(news|items|ranking)/.test(path))
      return fail(500, "server_error", "Lỗi máy chủ.");
    if (path === "/news") return listNews(query, config, at);
    if (path.startsWith("/news/")) return newsDetail(decodeURIComponent(path.slice(6)), at);
    if (path === "/items") return listItems(query, config);
    if (path.startsWith("/items/")) return itemDetail(decodeURIComponent(path.slice(7)));
    if (path === "/ranking")
      return ranking(query, config, session?.kind === "user" || session?.kind === "admin");
  }

  if (method === "post") {
    const data = (body ?? {}) as Record<string, unknown>;
    if (path === "/auth/login") return account.login(data, config, deps);
    if (path === "/auth/register") return account.register(data, config, deps);
    if (path === "/auth/forgot") return account.forgot(data, config);
    if (path === "/auth/reset") return account.reset(data, config, deps);
    if (path === "/account/password") return account.changePassword(data, config, session, deps);
    if (path === "/auth/logout") return { ...noContent(), effect: { type: "sign-out" } };
  }

  return fail(404, "not_found", "Không tìm thấy.");
}
