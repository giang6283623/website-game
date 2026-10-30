import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { getNewsList } from "../../api/endpoints.ts";
import { NEWS_CATEGORY_KEYS, type NewsCategoryKey } from "../../api/schemas.ts";
import { Chip } from "../../components/Chip/Chip.tsx";
import { FeaturedNews } from "../../components/FeaturedNews/FeaturedNews.tsx";
import { NewsList } from "../../components/NewsRow/NewsRow.tsx";
import { usePageMeta } from "../../components/PageShell/PageShell.tsx";
import { PageTitle } from "../../components/PageTitle/PageTitle.tsx";
import { Pagination } from "../../components/Pagination/Pagination.tsx";
import { ResourceView } from "../../components/ResourceView/ResourceView.tsx";
import { NEWS_CATEGORY_LABEL } from "../../content/labels.ts";
import { LIST_COPY } from "../../content/lists.ts";
import { PAGE_COPY } from "../../content/pages.ts";
import { useResource } from "../../hooks/useResource.ts";
import { buildQuery, parseOneOf, parsePositiveInt } from "../../lib/query.ts";
import "./News.css";

const copy = PAGE_COPY.newsPage;
const PATH = "/tin-tuc";
/** Một giá trị chung cho mọi thiết bị: trang 1 có 1 bài nổi bật và 7 dòng (ROUTES-AND-DATA.md mục 10). */
const PAGE_SIZE = 8;
const CATEGORY_CHOICES: readonly (NewsCategoryKey | "")[] = ["", ...NEWS_CATEGORY_KEYS];

/** Trang Tin tức (E1-S2). Loại bài và trang nằm trên địa chỉ nên chia sẻ và tải lại không lệch. */
export function News() {
  const [params] = useSearchParams();
  const category = parseOneOf(params.get("loai"), CATEGORY_CHOICES, "");
  const page = parsePositiveInt(params.get("trang"));

  const hrefFor = (changes: Record<string, string | number | null>) =>
    `${PATH}${buildQuery(params, changes, { trang: "1" })}`;

  usePageMeta({
    title: category ? copy.pageTitle(NEWS_CATEGORY_LABEL[category]) : undefined,
  });

  const resource = useResource(
    (signal) => getNewsList({ loai: category || null, trang: page, limit: PAGE_SIZE }, { signal }),
    [category, page],
    { isEmpty: (data) => data.items.length === 0 && data.featured === null },
  );

  // Đổi trang thì đưa danh sách vào tầm nhìn.
  const resultsRef = useRef<HTMLDivElement>(null);
  const firstPage = useRef(page);
  useEffect(() => {
    if (firstPage.current === page) return;
    firstPage.current = page;
    resultsRef.current?.scrollIntoView({ block: "start" });
  }, [page]);

  const data = resource.status === "success" ? resource.data : null;

  return (
    <>
      <PageTitle
        crumbs={[{ label: "Trang chủ", to: "/" }, { label: copy.title }]}
        title={copy.title}
        lead={copy.lead}
      />
      <section className="news-page" aria-label={copy.resultsLabel}>
        <div className="news-filters">
          <nav className="news-filters__chips" aria-label={copy.filterLabel}>
            <ul className="news-filters__list">
              <li>
                <Chip to={hrefFor({ loai: null, trang: null })} selected={category === ""}>
                  {copy.filterAll}
                </Chip>
              </li>
              {NEWS_CATEGORY_KEYS.map((key) => (
                <li key={key}>
                  <Chip to={hrefFor({ loai: key, trang: null })} selected={category === key}>
                    {NEWS_CATEGORY_LABEL[key]}
                  </Chip>
                </li>
              ))}
            </ul>
          </nav>
          <p className="news-filters__count text-body-s">{data ? copy.count(data.total) : null}</p>
          <p className="news-filters__sort text-label-m only-mobile" aria-hidden="true">
            {copy.sortNewest}
          </p>
        </div>

        <div ref={resultsRef} className="news-page__results">
          <ResourceView
            resource={resource}
            copy={LIST_COPY.news}
            emptyActionTo={category ? PATH : undefined}
          >
            {(list) => (
              <>
                {list.featured ? <FeaturedNews post={list.featured} /> : null}
                {list.items.length > 0 ? <NewsList posts={list.items} /> : null}
              </>
            )}
          </ResourceView>
          {data && data.totalPages > 1 ? (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              hrefFor={(target) => hrefFor({ trang: target })}
            />
          ) : null}
        </div>
      </section>
    </>
  );
}
