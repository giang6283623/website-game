import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { getAdminItems, patchAdminItem } from "../../api/admin-endpoints.ts";
import { normalizeError } from "../../api/client.ts";
import type { Item, ItemGroupKey } from "../../api/schemas.ts";
import { Button } from "../../components/Button/Button.tsx";
import { Chip } from "../../components/Chip/Chip.tsx";
import { Notice } from "../../components/Notice/Notice.tsx";
import { Pagination } from "../../components/Pagination/Pagination.tsx";
import { ResourceView } from "../../components/ResourceView/ResourceView.tsx";
import { Toggle } from "../../components/Toggle/Toggle.tsx";
import { ADMIN_COPY, ADMIN_LIST_COPY } from "../../content/admin.ts";
import { useResource } from "../../hooks/useResource.ts";
import { assetUrl } from "../../lib/assets.ts";
import { buildQuery, parsePositiveInt } from "../../lib/query.ts";
import { Callout, PageHead, rowAction, SearchBox } from "./parts.tsx";
import "./Items.css";

const PATH = "/quan-tri/vat-pham";
const copy = ADMIN_COPY.items;

/** Danh sách vật phẩm của quản trị (E4-S6): bật tắt Nổi bật và Hiện, thêm vật phẩm và sửa từng dòng (G-23). */
export function ItemsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const flash = (useLocation().state as { flash?: string } | null)?.flash ?? null;
  const group = params.get("nhom") as ItemGroupKey | null;
  const query = (params.get("q") ?? "").trim();
  const page = parsePositiveInt(params.get("trang"));

  const hrefFor = (changes: Record<string, string | number | null>) =>
    `${PATH}${buildQuery(params, changes, { trang: "1" })}`;

  const resource = useResource(
    (signal) => getAdminItems({ loai: group, q: query || undefined, trang: page }, { signal }),
    [group, query, page],
    { isEmpty: (data) => data.items.length === 0 },
  );

  // Dòng đã đổi cục bộ sau khi API trả về, và số vật phẩm nổi bật mới nhất.
  const [patched, setPatched] = useState<Record<number, Item>>({});
  const [featuredCount, setFeaturedCount] = useState<number | null>(null);
  const [pending, setPending] = useState<ReadonlySet<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const data = resource.status === "success" ? resource.data : null;
  // Dữ liệu mới về thì bỏ phần đã chỉnh cục bộ. Trong lúc tải, giữ số cũ để dòng "Đang chọn" không nháy.
  // biome-ignore lint/correctness/useExhaustiveDependencies: chạy mỗi khi dữ liệu từ API đổi
  useEffect(() => {
    setPatched({});
    setFeaturedCount(null);
  }, [data]);
  const lastKnown = useRef({ count: 0, max: 4 });
  if (data)
    lastKnown.current = { count: featuredCount ?? data.featuredCount, max: data.featuredMax };
  const { count, max } = lastKnown.current;

  const change = async (item: Item, changes: { featured?: boolean; visible?: boolean }) => {
    if (pending.has(item.id)) return;
    setError(null);
    setPending((previous) => new Set(previous).add(item.id));
    try {
      const saved = await patchAdminItem(item.id, changes);
      setPatched((previous) => ({ ...previous, [item.id]: saved }));
      if (changes.featured !== undefined) {
        setFeaturedCount((previous) => (previous ?? count) + (changes.featured ? 1 : -1));
      }
    } catch (failure) {
      const known = normalizeError(failure);
      setError(known.fields.featured ? copy.featuredLimit(max) : ADMIN_COPY.common.actionFailed);
    } finally {
      setPending((previous) => {
        const next = new Set(previous);
        next.delete(item.id);
        return next;
      });
    }
  };

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
      {flash ? <Notice tone="success" label={flash} /> : null}
      <Callout title={copy.featuredTitle}>{copy.featuredText(count, max)}</Callout>
      {error ? <Notice tone="error" label={error} /> : null}
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
            <li>
              <Chip to={hrefFor({ nhom: null, trang: null })} selected={group === null}>
                {ADMIN_COPY.common.all}
              </Chip>
            </li>
            {(data?.groups ?? [])
              .filter((entry) => entry.count > 0)
              .map((entry) => (
                <li key={entry.key}>
                  <Chip
                    to={hrefFor({ nhom: entry.key, trang: null })}
                    selected={entry.key === group}
                  >
                    {entry.label}
                  </Chip>
                </li>
              ))}
          </ul>
        </nav>
      </div>
      <ResourceView
        resource={resource}
        copy={ADMIN_LIST_COPY.items}
        onEmptyAction={() => navigate(hrefFor({ q: null, nhom: null, trang: null }))}
      >
        {(list) => (
          <table className="admin-table items-table">
            <caption className="visually-hidden">{copy.tableCaption}</caption>
            <thead>
              <tr className="text-label-m">
                <th scope="col">{copy.columns.image}</th>
                <th scope="col">{copy.columns.item}</th>
                <th scope="col">{copy.columns.featured}</th>
                <th scope="col">{copy.columns.visible}</th>
                <th scope="col">
                  <span className="visually-hidden">{copy.edit}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((original) => {
                const item = patched[original.id] ?? original;
                const busy = pending.has(item.id);
                return (
                  <tr key={item.id} className="items-row" data-item={item.slug}>
                    <td className="items-row__image">
                      {item.imageKey ? (
                        <img
                          src={assetUrl(item.imageKey)}
                          alt=""
                          width="80"
                          height="48"
                          loading="lazy"
                        />
                      ) : null}
                    </td>
                    <td className="items-row__name">
                      <p className="items-row__title text-body-m-strong">{item.name}</p>
                      <p className="items-row__type text-label-m">{item.typeLabel}</p>
                    </td>
                    <td className="items-row__featured">
                      <Toggle
                        label={item.featured ? copy.featuredOn : copy.featuredOff}
                        checked={item.featured}
                        disabled={busy}
                        onChange={(next) => change(item, { featured: next })}
                      />
                    </td>
                    <td className="items-row__visible">
                      <Toggle
                        label={item.visible ? copy.visibleOn : copy.visibleOff}
                        checked={item.visible}
                        disabled={busy}
                        onChange={(next) => change(item, { visible: next })}
                      />
                    </td>
                    <td className="items-row__edit">
                      <Link className={rowAction} to={`${PATH}/${item.id}`}>
                        {copy.edit}
                        <span className="visually-hidden">: {item.name}</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
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
    </div>
  );
}
