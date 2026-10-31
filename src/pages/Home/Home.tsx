import { Fragment } from "react";
import { getItem, getNewsList, getRanking } from "../../api/endpoints.ts";
import type { Item, PlayerRow } from "../../api/schemas.ts";
import { Button } from "../../components/Button/Button.tsx";
import { CornerMarks } from "../../components/CornerMarks/CornerMarks.tsx";
import { GlitchText } from "../../components/GlitchText/GlitchText.tsx";
import { ItemSlot } from "../../components/ItemSlot/ItemSlot.tsx";
import { NewsList } from "../../components/NewsRow/NewsRow.tsx";
import { Overline } from "../../components/Overline/Overline.tsx";
import { RadioLine } from "../../components/RadioLine/RadioLine.tsx";
import { RankTable } from "../../components/RankTable/RankTable.tsx";
import { ResourceView } from "../../components/ResourceView/ResourceView.tsx";
import { SectionHead } from "../../components/SectionHead/SectionHead.tsx";
import { StepCard } from "../../components/StepCard/StepCard.tsx";
import { LIST_COPY } from "../../content/lists.ts";
import { PAGE_COPY } from "../../content/pages.ts";
import { useResource } from "../../hooks/useResource.ts";
import { useServerStatus } from "../../hooks/useServerStatus.tsx";
import { formatNumber } from "../../lib/format.ts";
import { lazyArtRef } from "../../lib/lazy-art.ts";
import { lockOnRef, scopeGridRef } from "../../lib/signal.ts";
import { Locker } from "./Locker.tsx";
import "./Home.css";

const copy = PAGE_COPY.home;

/** Lưới vật phẩm trang chủ vừa có khóa mục tiêu, vừa có ống ngắm. */
function itemGridRef(element: HTMLUListElement | null) {
  lockOnRef(element);
  return scopeGridRef(element);
}

function Hero() {
  return (
    <section className="home-hero pattern-cross pattern-cross--large" aria-labelledby="home-title">
      <div className="home-hero__intro">
        <Overline>{copy.heroLabel}</Overline>
        <h1 id="home-title" className="home-hero__title">
          <span className="home-hero__line">{copy.heroTitleLine1}</span>
          <GlitchText
            className="home-hero__line home-hero__line--accent"
            text={copy.heroTitleLine2}
          />
        </h1>
        <p className="home-hero__lead">
          {copy.heroLeadStart}
          <span className="only-desktop">{copy.heroLeadDesktopOnly}</span>
          {copy.heroLeadEnd}
        </p>
        <div className="home-hero__actions">
          <Button size="l" to="/tai-game">
            {copy.download}
          </Button>
          <Button size="l" variant="secondary" to="/tai-game#huong-dan">
            {copy.guide}
          </Button>
        </div>
        <p className="home-hero__note text-label-m">{copy.heroNote}</p>
      </div>
      <Locker />
      <span className="art-fog" aria-hidden="true" />
    </section>
  );
}

function Fact({ value, label, className }: { value: string; label: string; className?: string }) {
  return (
    <li className={className ? `fact ${className}` : "fact"}>
      <span className="fact__value text-display-m">{value}</span>
      <span className="fact__label text-label-m">{label}</span>
    </li>
  );
}

/** Cụm số liệu nhanh. Chưa có số người chơi thì ẩn ô đó, không hiện "0" sai (E1-S1). */
function Facts() {
  const state = useServerStatus();
  const players =
    state.phase === "ready" && state.status.online && state.status.playersOnline !== null
      ? state.status.playersOnline
      : null;
  const facts = copy.facts;
  const count = players === null ? 3 : 4;
  return (
    <section className="home-facts" aria-label="Số liệu nhanh">
      <ul className={`home-facts__grid home-facts__grid--${count}`}>
        {players !== null ? <Fact value={formatNumber(players)} label={facts.players} /> : null}
        <Fact value={facts.uptime.value} label={facts.uptime.label} />
        <Fact
          value={facts.languageDesktop.value}
          label={facts.languageDesktop.label}
          className="fact--desktop"
        />
        <Fact
          value={facts.freeDesktop.value}
          label={facts.freeDesktop.label}
          className="fact--desktop"
        />
        <Fact
          value={facts.freeMobile.value}
          label={facts.freeMobile.label}
          className="fact--mobile"
        />
        <Fact
          value={facts.languageMobile.value}
          label={facts.languageMobile.label}
          className="fact--mobile"
        />
      </ul>
    </section>
  );
}

function Steps() {
  const steps = copy.steps;
  return (
    <section className="home-steps" aria-labelledby="home-steps-title">
      <SectionHead
        id="home-steps-title"
        overline={steps.overline}
        title={steps.title}
        lead={
          <>
            <span className="only-desktop">{steps.leadDesktop}</span>
            <span className="only-mobile">{steps.leadMobile}</span>
          </>
        }
      />
      <RadioLine label={steps.radioLabel}>{steps.radioText}</RadioLine>
      <ol className="home-steps__list" ref={lockOnRef}>
        {steps.cards.map((card) => (
          <StepCard
            key={card.no}
            no={card.no}
            icon={card.icon}
            title={card.title}
            text={
              card.textMobile ? (
                <Fragment>
                  <span className="only-desktop">{card.text}</span>
                  <span className="only-mobile">{card.textMobile}</span>
                </Fragment>
              ) : (
                card.text
              )
            }
            action={
              <Button variant="ghost" size="m" to={card.to} className="step-card__action">
                {card.action}
              </Button>
            }
          />
        ))}
      </ol>
    </section>
  );
}

function LatestNews() {
  const resource = useResource(
    "home/news",
    async (signal) => {
      const list = await getNewsList({ trang: 1, limit: 5 }, { signal });
      return [...(list.featured ? [list.featured] : []), ...list.items].slice(0, 5);
    },
    [],
    { isEmpty: (rows) => rows.length === 0 },
  );
  return (
    <div className="home-news">
      <div className="home-block-head">
        <h2 className="text-heading-h1">{copy.news.title}</h2>
        <Button variant="ghost" size="m" to="/tin-tuc" className="fact--desktop">
          {copy.news.all}
        </Button>
      </div>
      <ResourceView resource={resource} copy={LIST_COPY.news} emptyActionTo="/tin-tuc">
        {(posts) => (
          <>
            <NewsList posts={posts} className="home-news__list" />
            <div className="only-mobile home-block-more">
              <Button variant="secondary" size="m" fill to="/tin-tuc">
                {copy.news.allMobile}
              </Button>
            </div>
          </>
        )}
      </ResourceView>
    </div>
  );
}

function TopPlayers() {
  const resource = useResource(
    "home/ranking",
    async (signal) => {
      const ranking = await getRanking({ bang: "gamedollar", limit: 5 }, { signal });
      return ranking.rows.filter((row): row is PlayerRow => "playerName" in row);
    },
    [],
    { isEmpty: (rows) => rows.length === 0 },
  );
  return (
    <div className="home-ranking">
      <div className="home-block-head">
        <h2 className="text-heading-h1">{copy.ranking.title}</h2>
        <Button variant="ghost" size="m" to="/xep-hang" className="fact--desktop">
          {copy.ranking.all}
        </Button>
      </div>
      <ResourceView resource={resource} copy={LIST_COPY.ranking}>
        {(rows) => (
          <>
            <RankTable rows={rows} caption={copy.ranking.caption} />
            <div className="only-mobile home-block-more">
              <Button variant="secondary" size="m" fill to="/xep-hang">
                {copy.ranking.allMobile}
              </Button>
            </div>
          </>
        )}
      </ResourceView>
    </div>
  );
}

function FeaturedItems() {
  const resource = useResource(
    "home/items",
    async (signal) => {
      const results = await Promise.allSettled(
        copy.items.slugs.map((slug) => getItem(slug, { signal })),
      );
      const items = results
        .filter((result): result is PromiseFulfilledResult<Item> => result.status === "fulfilled")
        .map((result) => result.value);
      if (items.length === 0 && results.length > 0) {
        const failed = results.find((result) => result.status === "rejected");
        if (failed && failed.status === "rejected") throw failed.reason;
      }
      return items;
    },
    [],
    { isEmpty: (items) => items.length === 0 },
  );
  return (
    <section className="home-items" aria-labelledby="home-items-title">
      <SectionHead
        id="home-items-title"
        overline={copy.items.overline}
        title={copy.items.title}
        lead={copy.items.lead}
        action={
          <Button variant="ghost" size="m" to="/kho-do">
            {copy.items.all}
          </Button>
        }
        className="home-items__head"
      />
      <ResourceView resource={resource} copy={LIST_COPY.items} emptyActionTo="/kho-do">
        {(items) => (
          <>
            <ul className="home-items__grid scope-grid" ref={itemGridRef}>
              {items.map((item) => (
                <ItemSlot key={item.slug} item={item} to={`/kho-do/${item.slug}`} />
              ))}
            </ul>
            <div className="only-mobile home-block-more">
              <Button variant="secondary" size="m" fill to="/kho-do">
                {copy.items.all}
              </Button>
            </div>
          </>
        )}
      </ResourceView>
    </section>
  );
}

function Cta() {
  const cta = copy.cta;
  return (
    <section className="home-cta" aria-labelledby="home-cta-title" ref={lockOnRef}>
      <div className="home-cta__frame pattern-cross" data-art-lazy ref={lazyArtRef}>
        <span className="home-cta__ruler pattern-ruler" aria-hidden="true" />
        <div className="home-cta__body">
          <div className="home-cta__text">
            <Overline>{cta.overline}</Overline>
            <h2 id="home-cta-title" className="text-display-l home-cta__title">
              {cta.title}
            </h2>
            <p className="text-body-l home-cta__lead">{cta.lead}</p>
          </div>
          <div className="home-cta__actions">
            <Button size="l" to="/dang-ky">
              {cta.register}
            </Button>
            <Button size="l" variant="secondary" to="/tai-game#huong-dan">
              {cta.guide}
            </Button>
          </div>
        </div>
        <span className="art-flare" aria-hidden="true" />
        <CornerMarks length={28} inset={12} />
      </div>
    </section>
  );
}

/** Trang chủ (E1-S1): Hero, số liệu nhanh, ba bước, tin mới và top sinh tồn, kho đồ, lời kêu gọi. */
export function Home() {
  return (
    <>
      <Hero />
      <Facts />
      <Steps />
      <div className="home-news-ranking" ref={lockOnRef}>
        <LatestNews />
        <TopPlayers />
      </div>
      <FeaturedItems />
      <Cta />
    </>
  );
}
