import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { getRanking } from "../../api/endpoints.ts";
import {
  RANKING_BOARDS,
  type RankingBoard,
  type Ranking as RankingData,
} from "../../api/schemas.ts";
import { useAuth } from "../../auth/AuthProvider.tsx";
import { Button } from "../../components/Button/Button.tsx";
import { Chip } from "../../components/Chip/Chip.tsx";
import { Field } from "../../components/Field/Field.tsx";
import { Overline } from "../../components/Overline/Overline.tsx";
import { PageTitle } from "../../components/PageTitle/PageTitle.tsx";
import { Pagination } from "../../components/Pagination/Pagination.tsx";
import { RankTable } from "../../components/RankTable/RankTable.tsx";
import { ResourceView } from "../../components/ResourceView/ResourceView.tsx";
import { LIST_COPY } from "../../content/lists.ts";
import { PAGE_COPY } from "../../content/pages.ts";
import { useResource } from "../../hooks/useResource.ts";
import { formatNumber } from "../../lib/format.ts";
import { buildQuery, parseOneOf, parsePositiveInt } from "../../lib/query.ts";
import "./Ranking.css";

const copy = PAGE_COPY.rankingPage;
const PATH = "/xep-hang";
/** Mỗi trang 50 dòng (IMPLEMENTATION-PLAN.md, E3-S1). */
const PAGE_SIZE = 50;
const DEFAULTS = { bang: "gamedollar", trang: "1" };
const MIN_SEARCH = 2;

type Changes = Record<string, string | number | null>;

/** Trang Xếp hạng (E3-S1, E3-S2). Bảng, từ khóa và trang đều nằm trên địa chỉ nên chia sẻ và tải lại không lệch. */
export function Ranking() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();
  // null: còn đang hỏi `/me`, chưa biết là khách hay thành viên.
  const signedIn = auth.status === "loading" ? null : auth.account !== null;

  const board = parseOneOf<RankingBoard>(params.get("bang"), RANKING_BOARDS, "gamedollar");
  const clans = board === "gia-toc";
  const query = (params.get("q") ?? "").trim();
  const page = parsePositiveInt(params.get("trang"));
  const text = clans ? copy.clans : copy.players;

  const hrefFor = (changes: Changes) => `${PATH}${buildQuery(params, changes, DEFAULTS)}`;
  const go = (changes: Changes, replace = false) =>
    navigate(hrefFor(changes), { replace, preventScrollReset: true });

  // Ô tìm gửi bằng nút TÌM hoặc phím Enter. Dưới 2 ký tự thì báo lỗi, không gọi API.
  const [term, setTerm] = useState(query);
  const [tooShort, setTooShort] = useState(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: đổi bảng thì xóa chữ gõ dở, dù từ khóa trên địa chỉ không đổi
  useEffect(() => {
    setTerm(query);
    setTooShort(false);
  }, [query, board]);
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const next = term.trim();
    if (next.length > 0 && next.length < MIN_SEARCH) {
      setTooShort(true);
      return;
    }
    setTooShort(false);
    if (next !== query) go({ q: next, trang: null }, true);
  };

  const resource = useResource(
    (signal) =>
      getRanking({ bang: board, q: query || undefined, trang: page, limit: PAGE_SIZE }, { signal }),
    [board, query, page],
    { isEmpty: (data) => data.rows.length === 0 },
  );
  const data = resource.status === "success" || resource.status === "empty" ? resource.data : null;

  // Đổi trang thì đưa bảng vào tầm nhìn. "Vị trí của tôi" nhảy tới trang chứa hạng của mình rồi cuộn tới dòng.
  const resultsRef = useRef<HTMLDivElement>(null);
  const firstPage = useRef(page);
  const wantMine = useRef(false);
  useEffect(() => {
    if (firstPage.current === page) return;
    firstPage.current = page;
    if (!wantMine.current) resultsRef.current?.scrollIntoView?.({ block: "start" });
  }, [page]);
  useEffect(() => {
    if (!wantMine.current || !data) return;
    const row = resultsRef.current?.querySelector("tr.is-me");
    if (row) {
      wantMine.current = false;
      row.scrollIntoView?.({ block: "center", behavior: "smooth" });
    }
  }, [data]);

  const mine = data ? (clans ? data.myClan : data.me) : null;
  const mineName = mine ? ("memberCount" in mine ? mine.clanName : mine.playerName) : null;
  const jumpToMine = () => {
    if (!mine) return;
    const inTable = resultsRef.current?.querySelector("tr.is-me");
    if (inTable) {
      inTable.scrollIntoView?.({ block: "center", behavior: "smooth" });
      return;
    }
    wantMine.current = true;
    go({ q: null, trang: Math.max(1, Math.ceil(mine.rank / PAGE_SIZE)) });
  };

  const total = data ? (clans ? data.totalClans : data.totalPlayers) : null;
  const tabs: readonly RankingBoard[] = RANKING_BOARDS;

  return (
    <>
      <PageTitle
        crumbs={[{ label: "Trang chủ", to: "/" }, { label: copy.title }]}
        title={copy.title}
        lead={clans ? copy.leadClans : copy.leadPlayers}
      />
      <div className="rank-page">
        <div className="rank-controls">
          <nav className="rank-tabs" aria-label={copy.boardsLabel}>
            {tabs.map((key) => (
              <Chip
                key={key}
                to={hrefFor({ bang: key, q: null, trang: null })}
                selected={key === board}
              >
                {copy.tabs[key]}
              </Chip>
            ))}
          </nav>
          <form className="rank-search" noValidate onSubmit={submitSearch}>
            <Field
              fill
              type="search"
              name="q"
              label={text.searchLabel}
              placeholder={text.searchPlaceholder}
              hint={text.searchHint}
              error={tooShort ? copy.tooShort : undefined}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              autoComplete="off"
              maxLength={60}
            />
            <Button type="submit" size="m" className="rank-search__submit">
              <span className="only-desktop">{text.submit}</span>
              <span className="only-mobile">{text.submitMobile}</span>
            </Button>
          </form>
        </div>

        <MineBlock
          label={text.mine}
          mine={mine}
          signedIn={signedIn}
          loaded={data !== null}
          clans={clans}
          board={board}
          onJump={jumpToMine}
        />

        <section className="rank-results" aria-label={copy.resultsLabel}>
          {total !== null ? (
            <p className="rank-count only-mobile text-body-m">{text.count(formatNumber(total))}</p>
          ) : null}
          <div ref={resultsRef} className="rank-results__table">
            <ResourceView
              resource={resource}
              copy={clans ? LIST_COPY.rankingClans : LIST_COPY.ranking}
              onEmptyAction={() => go({ q: null, trang: null })}
            >
              {(list) => (
                <RankTable
                  variant="page"
                  rows={list.rows}
                  caption={text.caption}
                  nameLabel={text.nameColumn}
                  membersLabel={copy.clans.members}
                  board={board === "xp" ? "xp" : "gamedollar"}
                  highlight={mineName}
                />
              )}
            </ResourceView>
          </div>
          {data && data.totalPages > 1 ? (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              hrefFor={(target) => hrefFor({ trang: target })}
            />
          ) : null}
        </section>
      </div>
    </>
  );
}

type Mine = RankingData["me"] | RankingData["myClan"];

/** Dòng ghim "của tôi". Khách thấy nhãn dẫn tới đăng nhập. Người có hạng thấy dòng của mình và nhãn cuộn tới dòng trong bảng. */
function MineBlock({
  label,
  mine,
  signedIn,
  loaded,
  clans,
  board,
  onJump,
}: {
  label: string;
  mine: Mine;
  signedIn: boolean | null;
  loaded: boolean;
  clans: boolean;
  board: RankingBoard;
  onJump: () => void;
}) {
  if (signedIn === null) return null;
  if (!signedIn) {
    return (
      <section className="rank-me" aria-label={copy.mineAria}>
        <Overline>
          <Link className="rank-me__jump" to={`/dang-nhap?tiep=${encodeURIComponent(PATH)}`}>
            {label}
          </Link>
        </Overline>
      </section>
    );
  }
  if (!loaded || !mine) return null;
  return (
    <section className="rank-me" aria-label={copy.mineAria}>
      <Overline>
        <button type="button" className="rank-me__jump" onClick={onJump}>
          {label}
        </button>
      </Overline>
      <div className="rank-me__row">
        <RankTable
          variant="me"
          rows={[mine]}
          caption={label}
          nameLabel={clans ? copy.clans.nameColumn : copy.players.nameColumn}
          membersLabel={copy.clans.members}
          board={board === "xp" ? "xp" : "gamedollar"}
        />
      </div>
    </section>
  );
}
