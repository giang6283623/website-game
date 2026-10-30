import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { getAdminUsers, lockAdminUser, unlockAdminUser } from "../../api/admin-endpoints.ts";
import { normalizeError } from "../../api/client.ts";
import type { AdminUser } from "../../api/schemas.ts";
import { useAuth } from "../../auth/AuthProvider.tsx";
import { Chip } from "../../components/Chip/Chip.tsx";
import { Notice } from "../../components/Notice/Notice.tsx";
import { Pagination } from "../../components/Pagination/Pagination.tsx";
import { ResourceView } from "../../components/ResourceView/ResourceView.tsx";
import { ADMIN_COPY, ADMIN_LIST_COPY } from "../../content/admin.ts";
import { useResource } from "../../hooks/useResource.ts";
import { cn } from "../../lib/cn.ts";
import { formatDateFull } from "../../lib/format.ts";
import { buildQuery, parseOneOf, parsePositiveInt } from "../../lib/query.ts";
import { ConfirmDialog, PageHead, rowAction, SearchBox } from "./parts.tsx";
import "./Users.css";

const PATH = "/quan-tri/nguoi-dung";
const FILTERS = ["tat-ca", "nguoi-choi", "quan-tri", "bi-khoa"] as const;
type Filter = (typeof FILTERS)[number];
const PARAMS_OF: Record<Filter, { "vai-tro"?: "player" | "admin"; "trang-thai"?: "banned" }> = {
  "tat-ca": {},
  "nguoi-choi": { "vai-tro": "player" },
  "quan-tri": { "vai-tro": "admin" },
  "bi-khoa": { "trang-thai": "banned" },
};
const copy = ADMIN_COPY.users;
const FILTER_LABEL: Record<Filter, string> = {
  "tat-ca": copy.filters.all,
  "nguoi-choi": copy.filters.player,
  "quan-tri": copy.filters.admin,
  "bi-khoa": copy.filters.banned,
};

/** Quản trị người dùng (E4-S8): lọc, tìm, khóa và mở khóa có xác nhận. Không tự khóa mình. Email luôn đã che. */
export function UsersPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const myName = auth.account?.displayName ?? null;

  const filter = parseOneOf<Filter>(params.get("loc"), FILTERS, "tat-ca");
  const query = (params.get("q") ?? "").trim();
  const page = parsePositiveInt(params.get("trang"));

  const hrefFor = (changes: Record<string, string | number | null>) =>
    `${PATH}${buildQuery(params, changes, { loc: "tat-ca", trang: "1" })}`;

  const resource = useResource(
    (signal) =>
      getAdminUsers({ ...PARAMS_OF[filter], q: query || undefined, trang: page }, { signal }),
    [filter, query, page],
    { isEmpty: (data) => data.users.length === 0 },
  );
  const data = resource.status === "success" ? resource.data : null;

  const [target, setTarget] = useState<AdminUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const close = () => {
    setTarget(null);
    setDialogError(null);
  };

  const confirm = async () => {
    if (!target || busy) return;
    const locking = target.status !== "banned";
    setBusy(true);
    setDialogError(null);
    try {
      if (locking) await lockAdminUser(target.id);
      else await unlockAdminUser(target.id);
      close();
      setMessage(null);
      resource.reload();
    } catch (failure) {
      const known = normalizeError(failure);
      setDialogError(known.fields.user ? copy.selfLock : ADMIN_COPY.common.actionFailed);
    } finally {
      setBusy(false);
    }
  };

  const locking = target ? target.status !== "banned" : true;
  const clearFilters = () => navigate(hrefFor({ q: null, loc: null, trang: null }));

  return (
    <div className="admin-page">
      <PageHead title={copy.title} />
      {message ? <Notice tone="success" label={message} /> : null}
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
      <ResourceView resource={resource} copy={ADMIN_LIST_COPY.users} onEmptyAction={clearFilters}>
        {(list) => (
          <table className="admin-table users-table">
            <caption className="visually-hidden">{copy.tableCaption}</caption>
            <thead>
              <tr className="text-label-m">
                <th scope="col">{copy.columns.name}</th>
                <th scope="col">{copy.columns.email}</th>
                <th scope="col">{copy.columns.role}</th>
                <th scope="col">{copy.columns.status}</th>
                <th scope="col">{copy.columns.created}</th>
                <th scope="col">
                  <span className="visually-hidden">{ADMIN_COPY.navAria}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.users.map((user) => {
                const banned = user.status === "banned";
                const isMe = myName !== null && user.displayName === myName;
                return (
                  <tr key={user.id} className="users-row">
                    <td className="users-row__name text-body-m-strong">
                      <Link className="users-row__link" to={`${PATH}/${user.id}`}>
                        {user.displayName}
                      </Link>
                    </td>
                    <td className="users-row__email text-body-s">{user.emailMasked}</td>
                    <td className="users-row__role">
                      <p
                        className={cn(
                          "admin-state",
                          "text-label-m",
                          user.role === "admin" ? "admin-state--accent" : "admin-state--strong",
                        )}
                      >
                        {copy.role[user.role]}
                      </p>
                    </td>
                    <td className="users-row__status">
                      <p
                        className={cn(
                          "admin-state",
                          "text-label-m",
                          user.status === "active" && "admin-state--ok",
                          banned && "admin-state--bad",
                        )}
                      >
                        {copy.status[user.status]}
                      </p>
                    </td>
                    <td className="users-row__created text-body-s">
                      <span className="only-desktop">{formatDateFull(user.createdAt)}</span>
                      <span className="only-mobile">
                        {copy.created(formatDateFull(user.createdAt))}
                      </span>
                    </td>
                    <td className="users-row__action">
                      <button
                        type="button"
                        className={rowAction}
                        disabled={isMe && !banned}
                        onClick={() => setTarget(user)}
                      >
                        {banned ? copy.unlock : copy.lock}
                        <span className="visually-hidden">: {user.displayName}</span>
                      </button>
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
      {target ? (
        <ConfirmDialog
          title={locking ? copy.confirmLockTitle : copy.confirmUnlockTitle}
          message={
            locking ? copy.confirmLock(target.displayName) : copy.confirmUnlock(target.displayName)
          }
          confirmLabel={locking ? copy.confirmLockAction : copy.confirmUnlockAction}
          busy={busy}
          error={dialogError}
          onConfirm={confirm}
          onCancel={close}
        />
      ) : null}
    </div>
  );
}
