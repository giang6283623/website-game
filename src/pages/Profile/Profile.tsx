import { useEffect, useState } from "react";
import { getItem, getMyCharacters } from "../../api/endpoints.ts";
import type { Account, Character, Skill } from "../../api/schemas.ts";
import { useAuth } from "../../auth/AuthProvider.tsx";
import { Button } from "../../components/Button/Button.tsx";
import { ListState } from "../../components/ListState/ListState.tsx";
import { PageTitle } from "../../components/PageTitle/PageTitle.tsx";
import { Tag } from "../../components/Tag/Tag.tsx";
import { PROFILE_COPY } from "../../content/account.ts";
import { LIST_COPY } from "../../content/lists.ts";
import { useResource } from "../../hooks/useResource.ts";
import { assetUrl } from "../../lib/assets.ts";
import { cn } from "../../lib/cn.ts";
import { formatDateFull, formatNumber } from "../../lib/format.ts";
import "./Profile.css";

/** Hồ sơ (E2-S4): thẻ tài khoản, bốn chỉ số, nhân vật và kỹ năng. Không có nút tạo nhân vật (A-23). */
export function Profile() {
  const copy = PROFILE_COPY;
  const auth = useAuth();
  const account = auth.account;
  const characters = useResource((signal) => getMyCharacters({ signal }), [account?.id], {
    enabled: account !== null,
  });
  if (!account) return null;

  return (
    <>
      <PageTitle
        crumbs={[{ label: "Trang chủ", to: "/" }, { label: copy.title }]}
        title={copy.title}
        lead={copy.lead}
      />
      <div className="profile container">
        <AccountCard account={account} onSignOut={() => auth.signOut()} />
        <div className="profile__main">
          <Stats account={account} />
          {characters.status === "loading" ? (
            <ListState
              kind="loading"
              title={LIST_COPY.profile.loadingTitle}
              message={LIST_COPY.profile.loadingMessage}
            />
          ) : characters.status === "error" ? (
            <ListState
              kind="error"
              title={LIST_COPY.profile.errorTitle}
              message={LIST_COPY.profile.errorMessage}
              actionLabel={LIST_COPY.profile.errorAction}
              onAction={characters.reload}
            />
          ) : (
            <>
              <CharacterSection characters={characters.data.characters} />
              {characters.data.skills.length > 0 ? (
                <SkillSection skills={characters.data.skills} />
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function AccountCard({ account, onSignOut }: { account: Account; onSignOut: () => Promise<void> }) {
  const copy = PROFILE_COPY.account;
  return (
    <section className="account-card" aria-labelledby="account-name">
      <div className="account-card__ruler pattern-ruler" aria-hidden="true" />
      <div className="account-card__body">
        <div className="account-card__who">
          <span className="account-card__avatar" aria-hidden="true">
            {account.clan ? (
              <img src={assetUrl(account.clan.emblemKey)} alt="" width="96" height="96" />
            ) : (
              <span className="text-display-m">{account.displayName.slice(0, 1)}</span>
            )}
          </span>
          <div className="account-card__text">
            <h2 id="account-name" className="account-card__name text-heading-h2">
              {account.displayName}
            </h2>
            <p className="account-card__clan text-body-m">
              {account.clan ? `${copy.clanPrefix} ${account.clan.name}` : copy.noClan}
            </p>
            <p className={cn("account-card__presence text-label-m", account.online && "is-online")}>
              <span className="account-card__dot" aria-hidden="true" />
              {account.online ? copy.online : copy.offline}
            </p>
          </div>
        </div>
        <dl className="account-card__rows">
          <Row label={copy.email} value={account.emailMasked} />
          <Row label={copy.joined} value={formatDateFull(account.createdAt)} />
          <Row label={copy.status} value={copy.statusLabels[account.status]} />
        </dl>
        <div className="account-card__actions">
          <Button to="/ho-so/doi-mat-khau" variant="secondary" size="m">
            {copy.changePassword}
          </Button>
          <Button variant="ghost" size="m" onClick={() => void onSignOut()}>
            {copy.logout}
          </Button>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="account-card__row">
      <dt className="text-label-m">{label}</dt>
      <dd className="text-body-m">{value}</dd>
    </div>
  );
}

function Stats({ account }: { account: Account }) {
  const copy = PROFILE_COPY.stats;
  const { stats } = account;
  const items = [
    { label: copy.rank, value: stats.rank === null ? "-" : String(stats.rank) },
    { label: copy.gameDollar, value: formatNumber(stats.gameDollar) },
    { label: copy.xp, value: formatNumber(stats.xp) },
    { label: copy.level, value: String(stats.level) },
  ];
  return (
    <ul className="profile-stats" aria-label={PROFILE_COPY.statsLabel}>
      {items.map((item) => (
        <li key={item.label} className="stat-card">
          <span className="stat-card__label text-label-m">{item.label}</span>
          <span className="stat-card__value text-display-m">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}

function CharacterSection({ characters }: { characters: Character[] }) {
  const copy = PROFILE_COPY.characters;
  return (
    <section className="profile-section" aria-labelledby="profile-characters">
      <h2
        id="profile-characters"
        className="profile-section__title profile-section__title--tall text-heading-h2"
      >
        {copy.title}
      </h2>
      {characters.length === 0 ? (
        <ListState
          kind="empty"
          title={LIST_COPY.profile.emptyTitle}
          message={LIST_COPY.profile.emptyMessage}
          actionLabel={LIST_COPY.profile.emptyAction}
          actionTo="/tai-game"
        />
      ) : (
        <ul className="profile-characters">
          {characters.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </ul>
      )}
    </section>
  );
}

/** Tên vũ khí lấy từ kho đồ. Vật phẩm không có trong kho (ví dụ beretta-92f) thì dùng tên viết lại từ slug. */
function useWeaponName(slug: string | null): string | null {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    if (!slug) return;
    let active = true;
    getItem(slug)
      .then((item) => {
        if (active) setName(item.name);
      })
      .catch(() => {
        if (active) setName(slug.replace(/-/g, " ").toUpperCase());
      });
    return () => {
      active = false;
    };
  }, [slug]);
  return name;
}

function CharacterCard({ character }: { character: Character }) {
  const copy = PROFILE_COPY.characters;
  const weaponName = useWeaponName(character.mainWeaponItemSlug);
  return (
    <li className="character-card">
      <div className="character-card__head">
        <div className="character-card__id">
          <h3 className="character-card__name text-heading-h3">{character.name}</h3>
          <p className="character-card__level text-body-s">
            {copy.level(character.level, character.profession)}
          </p>
        </div>
        <Tag variant="guide">{character.state === "playing" ? copy.playing : copy.idle}</Tag>
      </div>
      <div className="character-card__weapon pattern-cross">
        <span className="character-card__weapon-label text-label-m">{copy.weapon}</span>
        {character.weaponHudKey ? (
          <img
            src={assetUrl(character.weaponHudKey)}
            alt={weaponName ?? ""}
            width="200"
            height="80"
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </div>
      {character.nightsSurvived !== null ? (
        <div className="character-card__foot">
          <span className="text-label-m">{copy.survived}</span>
          <span className="character-card__foot-value text-body-s">
            {copy.nights(character.nightsSurvived)}
          </span>
        </div>
      ) : null}
    </li>
  );
}

function SkillSection({ skills }: { skills: Skill[] }) {
  const copy = PROFILE_COPY.skills;
  return (
    <section className="profile-section" aria-labelledby="profile-skills">
      <h2 id="profile-skills" className="profile-section__title text-heading-h2">
        {copy.title}
      </h2>
      <ul className="profile-skills">
        {skills.map((skill) => (
          <li key={skill.key} className={cn("skill-tile", skill.unlocked && "is-unlocked")}>
            <img src={assetUrl(skill.iconKey)} alt="" width="56" height="56" loading="lazy" />
            <span className="skill-tile__name text-label-m">{skill.name}</span>
            <span className="skill-tile__state text-label-m">
              {skill.unlocked ? copy.unlocked : copy.locked}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
