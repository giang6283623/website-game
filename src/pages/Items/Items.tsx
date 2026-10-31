import { type FormEvent, type MouseEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { getItemList } from "../../api/endpoints.ts";
import { ITEM_GROUP_KEYS, type ItemGroupKey } from "../../api/schemas.ts";
import { CategoryList } from "../../components/CategoryList/CategoryList.tsx";
import { Chip } from "../../components/Chip/Chip.tsx";
import { Field } from "../../components/Field/Field.tsx";
import { ItemDetail } from "../../components/ItemDetail/ItemDetail.tsx";
import { ItemSlot } from "../../components/ItemSlot/ItemSlot.tsx";
import { PageTitle } from "../../components/PageTitle/PageTitle.tsx";
import { Pagination } from "../../components/Pagination/Pagination.tsx";
import { ResourceView } from "../../components/ResourceView/ResourceView.tsx";
import { LIST_COPY } from "../../content/lists.ts";
import { PAGE_COPY } from "../../content/pages.ts";
import { useResource } from "../../hooks/useResource.ts";
import { buildQuery, parseOneOf, parsePositiveInt } from "../../lib/query.ts";
import "./Items.css";

const copy = PAGE_COPY.itemsPage;
const PATH = "/kho-do";
/** Một giá trị chung cho mọi thiết bị: máy tính lưới 3 x 4, điện thoại lưới 2 x 6 (ROUTES-AND-DATA.md mục 10). */
const PAGE_SIZE = 12;
const SORTS = ["moi-nhat", "ten-a-z"] as const;
/** Giá trị mặc định không ghi lên địa chỉ. */
const DEFAULTS = { "sap-xep": "moi-nhat", trang: "1" };
const SEARCH_DELAY_MS = 300;

type Changes = Record<string, string | number | null>;

/** Trang Kho đồ (E1-S3). Bộ lọc, trang và vật phẩm đang xem đều nằm trên địa chỉ nên chia sẻ và tải lại không lệch. */
export function Items() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const group: ItemGroupKey | null = ITEM_GROUP_KEYS.includes(params.get("loai") as ItemGroupKey)
    ? (params.get("loai") as ItemGroupKey)
    : null;
  const query = (params.get("q") ?? "").trim();
  const sort = parseOneOf(params.get("sap-xep"), SORTS, "moi-nhat");
  const page = parsePositiveInt(params.get("trang"));
  const chosen = params.get("chon");

  const hrefFor = (changes: Changes) => `${PATH}${buildQuery(params, changes, DEFAULTS)}`;
  const go = (changes: Changes, replace = false) =>
    navigate(hrefFor(changes), { replace, preventScrollReset: true });

  // Ô tìm: gõ xong một lúc mới đổi địa chỉ để không gọi API sau mỗi phím.
  const [term, setTerm] = useState(query);
  const pendingTerm = useRef(term);
  pendingTerm.current = term;
  // Đồng bộ ô tìm khi địa chỉ đổi (nút Quay lại, Xóa bộ lọc).
  useEffect(() => {
    setTerm(query);
  }, [query]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: hẹn giờ chỉ phụ thuộc chữ đang gõ, `go` luôn lấy bản mới nhất ở lần chạy này
  useEffect(() => {
    const next = term.trim();
    if (next === query) return;
    const timer = setTimeout(() => go({ q: next, trang: null, chon: null }, true), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [term]);
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const next = pendingTerm.current.trim();
    if (next !== query) go({ q: next, trang: null, chon: null }, true);
  };

  const resource = useResource(
    (signal) =>
      getItemList(
        { loai: group, q: query || undefined, "sap-xep": sort, trang: page, limit: PAGE_SIZE },
        { signal },
      ),
    [group, query, sort, page],
    { isEmpty: (data) => data.items.length === 0 },
  );

  // Giữ số lượng nhóm của lần tải gần nhất để cột loại không nháy khi đổi bộ lọc.
  const [groups, setGroups] = useState(resource.status === "success" ? resource.data.groups : null);
  useEffect(() => {
    if (resource.status === "success" || resource.status === "empty")
      setGroups(resource.data.groups);
  }, [resource.status, resource.data]);

  // Đổi trang thì đưa danh sách vào tầm nhìn.
  const resultsRef = useRef<HTMLDivElement>(null);
  const firstPage = useRef(page);
  useEffect(() => {
    if (firstPage.current === page) return;
    firstPage.current = page;
    resultsRef.current?.scrollIntoView({ block: "start" });
  }, [page]);

  const data = resource.status === "success" || resource.status === "empty" ? resource.data : null;
  const selected = data ? (data.items.find((item) => item.slug === chosen) ?? data.items[0]) : null;
  const total = groups ? groups.reduce((sum, entry) => sum + entry.count, 0) : null;

  // Máy tính: bấm thẻ thì đổi khối chi tiết bên dưới. Điện thoại và phím bổ trợ: mở trang chi tiết như liên kết thường.
  const pick = (slug: string) => (event: MouseEvent<HTMLElement>) => {
    const plain = !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
    if (!plain || event.button !== 0) return;
    if (!window.matchMedia("(min-width: 1200px)").matches) return;
    event.preventDefault();
    go({ chon: slug }, true);
  };

  const clearFilters = () => go({ loai: null, q: null, trang: null, chon: null });

  return (
    <>
      <PageTitle
        art="items"
        crumbs={[{ label: "Trang chủ", to: "/" }, { label: copy.title }]}
        title={copy.title}
        lead={copy.lead}
      />
      <div className="items-page">
        <div className="items-page__side">
          <form onSubmit={submitSearch}>
            <Field
              fill
              type="search"
              name="q"
              label={copy.searchLabel}
              placeholder={copy.searchPlaceholder}
              hint={total !== null ? copy.searchHint(total) : undefined}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              autoComplete="off"
              maxLength={60}
            />
          </form>
          <CategoryList
            groups={groups}
            selected={group}
            allLabel={copy.categoryAll}
            label={copy.categoryLabel}
            hrefFor={(key) => hrefFor({ loai: key, trang: null, chon: null })}
          />
        </div>

        <section className="items-page__main" aria-label={copy.resultsLabel}>
          <div className="items-toolbar">
            <p className="items-toolbar__count text-label-l">
              {data ? copy.count(data.total) : null}
            </p>
            <fieldset className="items-toolbar__sort" aria-label={copy.sortLabel}>
              <span
                className="items-toolbar__sort-label text-label-m only-desktop"
                aria-hidden="true"
              >
                {copy.sortLabel}
              </span>
              <Chip
                to={hrefFor({ "sap-xep": "moi-nhat", trang: null, chon: null })}
                selected={sort === "moi-nhat"}
              >
                {copy.sortNewest}
              </Chip>
              <Chip
                to={hrefFor({ "sap-xep": "ten-a-z", trang: null, chon: null })}
                selected={sort === "ten-a-z"}
              >
                {copy.sortAz}
              </Chip>
            </fieldset>
          </div>

          <div ref={resultsRef} className="items-page__results">
            <ResourceView resource={resource} copy={LIST_COPY.items} onEmptyAction={clearFilters}>
              {(list) => (
                <ul className="items-grid">
                  {list.items.map((item) => (
                    <ItemSlot
                      key={item.slug}
                      item={item}
                      to={`${PATH}/${item.slug}`}
                      selected={item.slug === selected?.slug}
                      onClick={pick(item.slug)}
                    />
                  ))}
                </ul>
              )}
            </ResourceView>
          </div>

          {data && data.totalPages > 1 ? (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              hrefFor={(target) => hrefFor({ trang: target, chon: null })}
            />
          ) : null}

          {selected ? (
            <section className="items-page__detail only-desktop" aria-label={copy.detailLabel}>
              <ItemDetail item={selected} badge={copy.viewing} headingLevel={2} />
            </section>
          ) : null}
        </section>
      </div>
    </>
  );
}
