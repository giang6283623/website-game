import { useNavigate, useSearchParams } from "react-router";
import { getAudit } from "../../api/admin-endpoints.ts";
import { Chip } from "../../components/Chip/Chip.tsx";
import { Pagination } from "../../components/Pagination/Pagination.tsx";
import { ResourceView } from "../../components/ResourceView/ResourceView.tsx";
import { ADMIN_COPY, ADMIN_LIST_COPY } from "../../content/admin.ts";
import { useResource } from "../../hooks/useResource.ts";
import { formatDateTime } from "../../lib/format.ts";
import { buildQuery, parseOneOf, parsePositiveInt } from "../../lib/query.ts";
import { PageHead } from "./parts.tsx";
import "./Audit.css";

const PATH = "/quan-tri/nhat-ky";
const FILTERS = ["tat-ca", "bai-viet", "vat-pham", "banner", "nguoi-dung"] as const;
type Filter = (typeof FILTERS)[number];
const TARGET_OF = {
  "tat-ca": null,
  "bai-viet": "news",
  "vat-pham": "item",
  banner: "banner",
  "nguoi-dung": "user",
} as const;
const copy = ADMIN_COPY.audit;
const FILTER_LABEL: Record<Filter, string> = {
  "tat-ca": copy.filters.all,
  "bai-viet": copy.filters.news,
  "vat-pham": copy.filters.item,
  banner: copy.filters.banner,
  "nguoi-dung": copy.filters.user,
};

/** Nhật ký thao tác (E4-S5). Chỉ đọc, mới nhất ở trên. */
export function AuditPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const filter = parseOneOf<Filter>(params.get("loc"), FILTERS, "tat-ca");
  const page = parsePositiveInt(params.get("trang"));
  const hrefFor = (changes: Record<string, string | number | null>) =>
    `${PATH}${buildQuery(params, changes, { loc: "tat-ca", trang: "1" })}`;

  const resource = useResource(
    "admin/audit",
    (signal) => getAudit({ "doi-tuong": TARGET_OF[filter], trang: page }, { signal }),
    [filter, page],
    { isEmpty: (data) => data.entries.length === 0 },
  );
  const data = resource.status === "success" ? resource.data : null;

  return (
    <div className="admin-page">
      <PageHead title={copy.title} />
      <nav aria-label={copy.filterLabel}>
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
      <ResourceView
        resource={resource}
        copy={ADMIN_LIST_COPY.audit}
        onEmptyAction={() => navigate(hrefFor({ loc: null, trang: null }))}
      >
        {(list) => (
          <table className="admin-table audit-table">
            <caption className="visually-hidden">{copy.tableCaption}</caption>
            <thead>
              <tr className="text-label-m">
                <th scope="col">{copy.columns.time}</th>
                <th scope="col">{copy.columns.actor}</th>
                <th scope="col">{copy.columns.action}</th>
                <th scope="col">{copy.columns.target}</th>
              </tr>
            </thead>
            <tbody>
              {list.entries.map((entry) => (
                <tr key={entry.id} className="audit-row">
                  <td className="audit-row__time text-data-m">
                    <time dateTime={entry.at}>
                      <span className="only-desktop">{formatDateTime(entry.at)}</span>
                      <span className="only-mobile">
                        {formatDateTime(entry.at).replace(/\/\d{4}/, "")}
                      </span>
                    </time>
                  </td>
                  <td className="audit-row__actor text-body-m-strong">{entry.actorName}</td>
                  <td className="audit-row__action text-label-m">{entry.actionLabel}</td>
                  <td className="audit-row__target text-body-s">{entry.targetLabel}</td>
                </tr>
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
    </div>
  );
}
