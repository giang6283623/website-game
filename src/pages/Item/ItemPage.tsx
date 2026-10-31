import { useParams } from "react-router";
import { getItem, getItemList } from "../../api/endpoints.ts";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { Button } from "../../components/Button/Button.tsx";
import { ItemDetail } from "../../components/ItemDetail/ItemDetail.tsx";
import { ItemSlot } from "../../components/ItemSlot/ItemSlot.tsx";
import { usePageMeta } from "../../components/PageShell/PageShell.tsx";
import { ResourceView } from "../../components/ResourceView/ResourceView.tsx";
import { SectionHead } from "../../components/SectionHead/SectionHead.tsx";
import { LIST_COPY } from "../../content/lists.ts";
import { PAGE_COPY } from "../../content/pages.ts";
import { useResource } from "../../hooks/useResource.ts";
import { scopeGridRef } from "../../lib/signal.ts";
import { NotFound } from "../NotFound.tsx";
import "./ItemPage.css";

const copy = PAGE_COPY.itemPage;
/** Số vật phẩm cùng nhóm hiện ở cuối trang (một hàng 4 cột trên máy tính, lưới 2 x 2 trên điện thoại). */
const OTHERS = 4;

/** Chi tiết vật phẩm (E1-S5). Vật phẩm không có hoặc bị ẩn thì hiện trang 404. */
export function ItemPage() {
  const { slug = "" } = useParams();
  const item = useResource((signal) => getItem(slug, { signal }), [slug]);
  const found = item.status === "success" ? item.data : null;

  usePageMeta({ title: found ? copy.pageTitle(found.name) : undefined });

  // Vật phẩm cùng nhóm. Lấy thêm một món để còn đủ bốn khi bỏ chính vật phẩm đang xem.
  const group = found?.group;
  const others = useResource(
    (signal) => getItemList({ loai: group, limit: OTHERS + 1 }, { signal }),
    [group],
    { enabled: group !== undefined },
  );
  const sameGroup =
    others.status === "success" || others.status === "empty"
      ? others.data.items.filter((entry) => entry.slug !== slug).slice(0, OTHERS)
      : [];

  if (item.status === "error" && item.error.code === "not_found") return <NotFound />;

  return (
    <>
      <header className="item-head">
        <Breadcrumbs
          label={copy.crumbs}
          crumbs={[
            { label: "Trang chủ", to: "/" },
            { label: PAGE_COPY.itemsPage.title, to: "/kho-do" },
            { label: found?.name ?? slug },
          ]}
        />
      </header>
      <div className="item-page">
        <ResourceView resource={item} copy={LIST_COPY.items} className="item-page__state">
          {(data) => <ItemDetail item={data} headingLevel={1} className="item-page__detail" />}
        </ResourceView>
        <div className="item-page__tail">
          {sameGroup.length > 0 ? (
            <section className="item-page__others" aria-labelledby="item-others">
              <SectionHead
                id="item-others"
                overline={copy.othersOverline}
                title={copy.othersTitle}
              />
              <ul
                className="item-page__grid scope-grid"
                aria-label={copy.othersLabel}
                ref={scopeGridRef}
              >
                {sameGroup.map((entry) => (
                  <ItemSlot key={entry.slug} item={entry} to={`/kho-do/${entry.slug}`} />
                ))}
              </ul>
            </section>
          ) : null}
          <div className="item-page__back">
            <Button variant="ghost" to="/kho-do">
              {copy.back}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
