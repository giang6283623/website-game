import { useId, useState } from "react";
import { Link, useParams } from "react-router";
import { getAdminUser, lockAdminUser, unlockAdminUser } from "../../api/admin-endpoints.ts";
import { normalizeError } from "../../api/client.ts";
import type { AdminUserDetail } from "../../api/schemas.ts";
import { useAuth } from "../../auth/AuthProvider.tsx";
import { Button } from "../../components/Button/Button.tsx";
import { ResourceView } from "../../components/ResourceView/ResourceView.tsx";
import { ADMIN_COPY, ADMIN_LIST_COPY } from "../../content/admin.ts";
import { useResource } from "../../hooks/useResource.ts";
import { cn } from "../../lib/cn.ts";
import { formatDateFull, formatDateTime, formatNumber } from "../../lib/format.ts";
import { ConfirmDialog, PageHead, PanelRow, rowAction } from "./parts.tsx";
import "./Compose.css";
import "./UserDetail.css";

const PATH = "/quan-tri/nguoi-dung";
const copy = ADMIN_COPY.users;
const detail = copy.detail;

/** Chi tiết người dùng quản trị (G-23). Đường dẫn `/quan-tri/nguoi-dung/:id`: thông tin, hạng, nhân vật và nhật ký, có khóa hoặc mở khóa. */
export function UserDetailPage() {
  const { id } = useParams();
  const userId = id !== undefined && /^\d{1,9}$/.test(id) ? Number(id) : null;
  const resource = useResource((signal) => getAdminUser(userId ?? 0, { signal }), [userId], {
    enabled: userId !== null,
  });

  if (userId === null) return <MissingUser />;
  return (
    <ResourceView
      resource={resource}
      copy={{ ...ADMIN_LIST_COPY.users, errorTitle: detail.loadFailed }}
    >
      {(user) => <UserDetail key={user.id} user={user} onChanged={resource.reload} />}
    </ResourceView>
  );
}

function MissingUser() {
  return (
    <div className="admin-page">
      <PageHead title={detail.title} />
      <Link className={rowAction} to={PATH}>
        {copy.title}
      </Link>
    </div>
  );
}

function UserDetail({ user, onChanged }: { user: AdminUserDetail; onChanged: () => void }) {
  const auth = useAuth();
  const ids = useId();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const banned = user.status === "banned";
  const isMe = auth.account?.displayName === user.displayName;
  const toggleLabel = banned ? copy.unlock : copy.lock;

  const close = () => {
    setConfirming(false);
    setDialogError(null);
  };

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    setDialogError(null);
    try {
      if (banned) await unlockAdminUser(user.id);
      else await lockAdminUser(user.id);
      close();
      onChanged();
    } catch (failure) {
      const known = normalizeError(failure);
      setDialogError(known.fields.user ? copy.selfLock : ADMIN_COPY.common.actionFailed);
    } finally {
      setBusy(false);
    }
  };

  const toggle = (size: "m" | "l", fill = false) => (
    <Button size={size} fill={fill} disabled={isMe && !banned} onClick={() => setConfirming(true)}>
      {toggleLabel}
    </Button>
  );

  return (
    <div className="admin-page compose user-detail">
      <PageHead
        title={detail.title}
        action={
          <span className="only-desktop">
            <Button variant="secondary" size="m" to={PATH}>
              {detail.back}
            </Button>
            {toggle("m")}
          </span>
        }
      />
      <div className="compose__layout">
        <section
          className="compose__panel user-detail__info"
          aria-labelledby={`${ids}-info`}
          data-panel="info"
        >
          <h2 id={`${ids}-info`} className="compose__panel-title text-label-l">
            <span className="compose__bar" aria-hidden="true" />
            {detail.infoTitle}
          </h2>
          <dl className="user-detail__kv">
            <PanelRow label={detail.fields.name}>
              <span className="user-detail__value text-data-m">{user.displayName}</span>
            </PanelRow>
            <PanelRow label={detail.fields.email}>
              <span className="user-detail__value text-data-m">{user.emailMasked}</span>
            </PanelRow>
            <PanelRow label={detail.fields.role}>
              <span
                className={cn(
                  "user-detail__value",
                  "admin-state",
                  "text-label-m",
                  user.role === "admin" ? "admin-state--accent" : "admin-state--strong",
                )}
              >
                {copy.role[user.role]}
              </span>
            </PanelRow>
            <PanelRow label={detail.fields.status}>
              <span
                className={cn(
                  "user-detail__value",
                  "admin-state",
                  "text-label-m",
                  user.status === "active" && "admin-state--ok",
                  banned && "admin-state--bad",
                )}
              >
                {copy.status[user.status]}
              </span>
            </PanelRow>
            <PanelRow label={detail.fields.created}>
              <span className="user-detail__value text-data-m">
                {formatDateFull(user.createdAt)}
              </span>
            </PanelRow>
          </dl>
        </section>

        <section
          className="compose__panel user-detail__rank"
          aria-labelledby={`${ids}-rank`}
          data-panel="rank"
        >
          <h2 id={`${ids}-rank`} className="compose__panel-title text-label-l">
            <span className="compose__bar" aria-hidden="true" />
            {detail.rankTitle}
          </h2>
          {user.ranking ? (
            <dl className="user-detail__kv">
              <PanelRow label={detail.rank.rank}>
                <span className="user-detail__value text-data-m">#{user.ranking.rank}</span>
              </PanelRow>
              <PanelRow label={detail.rank.clan}>
                <span className="user-detail__value text-data-m">
                  {user.ranking.clanName ?? detail.noClan}
                </span>
              </PanelRow>
              <PanelRow label={detail.rank.gameDollar}>
                <span className="user-detail__value text-data-m">
                  {formatNumber(user.ranking.gameDollar)}
                </span>
              </PanelRow>
              <PanelRow label={detail.rank.xp}>
                <span className="user-detail__value text-data-m">
                  {formatNumber(user.ranking.xp)}
                </span>
              </PanelRow>
            </dl>
          ) : (
            <p className="user-detail__empty text-body-s">{detail.rankEmpty}</p>
          )}
        </section>

        <section
          className="compose__panel user-detail__characters"
          aria-labelledby={`${ids}-characters`}
          data-panel="characters"
        >
          <h2 id={`${ids}-characters`} className="compose__panel-title text-label-l">
            <span className="compose__bar" aria-hidden="true" />
            {detail.charactersTitle(user.characters.length, detail.characterLimit)}
          </h2>
          {user.characters.length === 0 ? (
            <p className="user-detail__empty text-body-s">{detail.charactersEmpty}</p>
          ) : (
            <table className="user-detail__table user-detail__table--characters">
              <caption className="visually-hidden">{detail.charactersCaption}</caption>
              <colgroup>
                <col />
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr className="text-label-m">
                  <th scope="col">{detail.characterColumns.name}</th>
                  <th scope="col">{detail.characterColumns.level}</th>
                  <th scope="col">{detail.characterColumns.profession}</th>
                  <th scope="col">{detail.characterColumns.nights}</th>
                </tr>
              </thead>
              <tbody>
                {user.characters.map((character) => {
                  const profession = character.profession ?? detail.noValue;
                  const nights = character.nightsSurvived;
                  return (
                    <tr key={character.id} className="user-detail__row">
                      <td className="user-detail__name text-data-m">{character.name}</td>
                      <td className="user-detail__col text-data-m">{character.level}</td>
                      <td className="user-detail__col text-data-m">{profession}</td>
                      <td className="user-detail__col text-data-m">{nights ?? detail.noValue}</td>
                      <td className="user-detail__meta text-body-s">
                        {[
                          detail.levelShort(character.level),
                          profession,
                          nights === null ? detail.noValue : detail.nightsShort(nights),
                        ].join(" · ")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <section
          className="compose__panel user-detail__history"
          aria-labelledby={`${ids}-history`}
          data-panel="history"
        >
          <h2 id={`${ids}-history`} className="compose__panel-title text-label-l">
            <span className="compose__bar" aria-hidden="true" />
            {detail.historyTitle}
          </h2>
          {user.history.length === 0 ? (
            <p className="user-detail__empty text-body-s">{detail.historyEmpty}</p>
          ) : (
            <table className="user-detail__table user-detail__table--history">
              <caption className="visually-hidden">{detail.historyCaption}</caption>
              <colgroup>
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr className="text-label-m">
                  <th scope="col">{detail.historyColumns.time}</th>
                  <th scope="col">{detail.historyColumns.action}</th>
                  <th scope="col">{detail.historyColumns.actor}</th>
                </tr>
              </thead>
              <tbody>
                {user.history.map((entry) => (
                  <tr key={entry.id} className="user-detail__row">
                    <td className="user-detail__col text-data-m">{formatDateTime(entry.at)}</td>
                    <td className="user-detail__name user-detail__action text-data-m">
                      {entry.actionLabel}
                    </td>
                    <td className="user-detail__col text-data-m">{entry.actorName}</td>
                    <td className="user-detail__meta text-body-s">
                      {formatDateTime(entry.at)} · {entry.actorName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <div className="compose__bar-mobile">
        <Button variant="secondary" size="l" fill to={PATH}>
          {detail.back}
        </Button>
        {toggle("l", true)}
      </div>

      {confirming ? (
        <ConfirmDialog
          title={banned ? copy.confirmUnlockTitle : copy.confirmLockTitle}
          message={
            banned ? copy.confirmUnlock(user.displayName) : copy.confirmLock(user.displayName)
          }
          confirmLabel={banned ? copy.confirmUnlockAction : copy.confirmLockAction}
          busy={busy}
          error={dialogError}
          onConfirm={confirm}
          onCancel={close}
        />
      ) : null}
    </div>
  );
}
