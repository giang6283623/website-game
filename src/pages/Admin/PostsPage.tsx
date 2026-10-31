import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { getAdminNews, updateAdminNews } from "../../api/admin-endpoints.ts";
import { normalizeError } from "../../api/client.ts";
import type { NewsPost, NewsPostStatus } from "../../api/schemas.ts";
import { Button } from "../../components/Button/Button.tsx";
import { Chip } from "../../components/Chip/Chip.tsx";
import { Notice } from "../../components/Notice/Notice.tsx";
import { Pagination } from "../../components/Pagination/Pagination.tsx";
import { ResourceView } from "../../components/ResourceView/ResourceView.tsx";
import { CATEGORY_TAG, Tag } from "../../components/Tag/Tag.tsx";
import { ADMIN_COPY, ADMIN_LIST_COPY } from "../../content/admin.ts";
import { NEWS_CATEGORY_LABEL } from "../../content/labels.ts";
import { useResource } from "../../hooks/useResource.ts";
import { getNow } from "../../lib/clock.ts";
import { cn } from "../../lib/cn.ts";
import { formatDateFull, formatDateShort } from "../../lib/format.ts";
import { buildQuery, parseOneOf, parsePositiveInt } from "../../lib/query.ts";
import { ConfirmDialog, PageHead, rowAction, SearchBox } from "./parts.tsx";
import "./Posts.css";

const PATH = "/quan-tri/bai-viet";
const FILTERS = ["tat-ca", "da-dang", "ban-nhap"] as const;
type Filter = (typeof FILTERS)[number];
const STATUS_OF: Record<Filter, NewsPostStatus | null> = {
  "tat-ca": null,
  "da-dang": "published",
  "ban-nhap": "draft",
};
const copy = ADMIN_COPY.posts;
const FILTER_LABEL: Record<Filter, string> = {
  "tat-ca": copy.filters.all,
  "da-dang": copy.filters.published,
  "ban-nhap": copy.filters.draft,
};

type Flash = { flash?: string } | null;

/** Danh sách bài viết của quản trị (E4-S4). Bộ lọc, từ khóa và trang nằm trên địa chỉ. */
export function PostsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const flash = (location.state as Flash)?.flash ?? null;

  const filter = parseOneOf<Filter>(params.get("loc"), FILTERS, "tat-ca");
  const query = (params.get("q") ?? "").trim();
  const page = parsePositiveInt(params.get("trang"));

  const hrefFor = (changes: Record<string, string | number | null>) =>
    `${PATH}${buildQuery(params, changes, { loc: "tat-ca", trang: "1" })}`;

  const resource = useResource(
    "admin/news",
    (signal) =>
      getAdminNews({ status: STATUS_OF[filter], q: query || undefined, trang: page }, { signal }),
    [filter, query, page],
    { isEmpty: (data) => data.items.length === 0 },
  );

  const [hiding, setHiding] = useState<NewsPost | null>(null);
  const [busy, setBusy] = useState(false);
  const [hideError, setHideError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const confirmHide = async () => {
    if (!hiding || busy) return;
    setBusy(true);
    setHideError(null);
    try {
      await updateAdminNews(hiding.id, { status: "draft" });
      setHiding(null);
      setMessage(copy.hidden);
      resource.reload();
    } catch (error) {
      void normalizeError(error);
      setHideError(ADMIN_COPY.common.actionFailed);
    } finally {
      setBusy(false);
    }
  };

  const filtering = query !== "" || filter !== "tat-ca";
  const shown = message ?? flash;
  const data = resource.status === "success" ? resource.data : null;

  return (
    <div className="admin-page">
      <PageHead
        title={copy.title}
        action={
          <Button to={`${PATH}/moi`} size="m">
            {copy.create}
          </Button>
        }
      />
      {shown ? <Notice tone="success" label={shown} /> : null}
      <div className="admin-filters">
        <SearchBox
          label={copy.searchLabel}
          hint={copy.searchHint}
          placeholder={copy.searchPlaceholder}
          value={query}
          onSearch={(next) => navigate(hrefFor({ q: next, trang: null }), { replace: true })}
        />
        <nav className="admin-filters__chips-wrap" aria-label={copy.filterLabel}>
          <ul className="admin-filters__chips">
            {FILTERS.map((key) => (
              <li key={key}>
                <Chip to={hrefFor({ loc: key, trang: null })} selected={key === filter}>
                  {FILTER_LABEL[key]}
                </Chip>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <ResourceView
        resource={resource}
        copy={filtering ? ADMIN_LIST_COPY.postsFiltered : ADMIN_LIST_COPY.posts}
        emptyActionTo={filtering ? undefined : `${PATH}/moi`}
        onEmptyAction={
          filtering ? () => navigate(hrefFor({ q: null, loc: null, trang: null })) : undefined
        }
      >
        {(list) => (
          <table className="admin-table posts-table">
            <caption className="visually-hidden">{copy.tableCaption}</caption>
            <thead>
              <tr className="text-label-m">
                <th scope="col">{copy.columns.title}</th>
                <th scope="col">{copy.columns.category}</th>
                <th scope="col">{copy.columns.date}</th>
                <th scope="col">{copy.columns.status}</th>
                <th scope="col">
                  <span className="visually-hidden">{ADMIN_COPY.navAria}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((post) => (
                <PostRow key={post.id} post={post} onHide={() => setHiding(post)} />
              ))}
            </tbody>
          </table>
        )}
      </ResourceView>
      {data ? (
        <Pagination
          className="admin-pagination"
          page={data.page}
          totalPages={data.totalPages}
          hrefFor={(next) => hrefFor({ trang: next })}
          label={ADMIN_COPY.pagination}
        />
      ) : null}
      {hiding ? (
        <ConfirmDialog
          title={copy.confirmHideTitle}
          message={copy.confirmHide(hiding.title)}
          confirmLabel={copy.confirmHideAction}
          busy={busy}
          error={hideError}
          onConfirm={confirmHide}
          onCancel={() => {
            setHiding(null);
            setHideError(null);
          }}
        />
      ) : null}
    </div>
  );
}

function PostRow({ post, onHide }: { post: NewsPost; onHide: () => void }) {
  const published = post.status === "published";
  const date = post.publishedAt ?? post.createdAt;
  return (
    <tr className="posts-row">
      <td className="posts-row__title">
        <Link className="posts-row__link text-body-m-strong" to={`${PATH}/${post.id}`}>
          {post.title}
        </Link>
      </td>
      <td className="posts-row__tag">
        <Tag variant={CATEGORY_TAG[post.category] ?? "news"}>
          {NEWS_CATEGORY_LABEL[post.category]}
        </Tag>
      </td>
      <td className="posts-row__date text-data-m">
        <time dateTime={date}>
          <span className="only-desktop">{formatDateFull(date)}</span>
          <span className="only-mobile">{formatDateShort(date, getNow())}</span>
        </time>
      </td>
      <td className="posts-row__status">
        <p className={cn("admin-state", "text-label-m", published && "admin-state--ok")}>
          {published ? copy.status.published : copy.status.draft}
        </p>
      </td>
      <td className="posts-row__actions">
        <div className="admin-actions">
          <Link className={rowAction} to={`${PATH}/${post.id}`}>
            {copy.edit}
          </Link>
          {published ? (
            <button type="button" className={rowAction} onClick={onHide}>
              {copy.hide}
              <span className="visually-hidden">: {post.title}</span>
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
