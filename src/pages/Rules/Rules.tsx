import { useEffect, useState } from "react";
import { PageTitle } from "../../components/PageTitle/PageTitle.tsx";
import { RadioLine } from "../../components/RadioLine/RadioLine.tsx";
import { TocList } from "../../components/TocList/TocList.tsx";
import { PAGE_COPY } from "../../content/pages.ts";
import { COMMUNITY_RULES, type RuleSection } from "../../content/rules.ts";
import { formatDateFull } from "../../lib/format.ts";
import "./Rules.css";

const copy = PAGE_COPY.rulesPage;
const sectionId = (section: RuleSection) => `quy-tac-${section.id}`;
const sectionTitle = (section: RuleSection) => `${section.id}. ${section.title}`;

const SECTION_IDS = COMMUNITY_RULES.sections.map(sectionId);

/** Mục đang đọc là mục cuối cùng có đầu mục nằm trong 100 px đầu cửa sổ. Cuộn tới đáy trang thì chọn mục cuối. */
const READING_LINE = 100;

function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    const update = () => {
      let current = ids[0] ?? "";
      for (const id of ids) {
        const node = document.getElementById(id);
        if (node && node.getBoundingClientRect().top <= READING_LINE) current = id;
      }
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      setActive(atBottom && window.scrollY > 0 ? (ids.at(-1) ?? current) : current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ids]);
  return active;
}

function PenaltyTable({ section }: { section: RuleSection }) {
  if (!section.penalties) return null;
  return (
    <ul className="penalties" aria-label={copy.penaltiesLabel}>
      {section.penalties.map((penalty) => (
        <li key={penalty.step} className="penalties__row">
          <span className="penalties__step text-label-m">{penalty.step}</span>
          <span className="penalties__action text-data-l">{penalty.action}</span>
        </li>
      ))}
    </ul>
  );
}

export function Rules() {
  const sections = COMMUNITY_RULES.sections;
  const active = useActiveSection(SECTION_IDS);
  const items = sections.map((section) => ({
    id: sectionId(section),
    label: sectionTitle(section),
  }));

  return (
    <>
      <PageTitle
        crumbs={[{ label: copy.crumbHome, to: "/" }, { label: "Quy tắc" }]}
        crumbsLabel={copy.crumbs}
        title={copy.title}
        compactOnMobile
        lead={copy.lead(formatDateFull(COMMUNITY_RULES.updatedAt), COMMUNITY_RULES.intro)}
      />
      <div className="rules-page">
        <TocList
          className="rules-page__toc"
          label={copy.tocLabel}
          ariaLabel={copy.tocAria}
          items={items}
          activeId={active}
        />
        <div className="rules">
          {sections.map((section) => (
            <section
              key={section.id}
              id={sectionId(section)}
              className="rules__section"
              aria-labelledby={`${sectionId(section)}-title`}
            >
              <h2 id={`${sectionId(section)}-title`} className="rules__title text-heading-h2">
                {sectionTitle(section)}
              </h2>
              <p className="rules__lead">{section.lead}</p>
              {section.bullets.length > 0 ? (
                <ul className="rules__list">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
              <PenaltyTable section={section} />
              {section.closing ? (
                <p className="rules__closing text-body-s">{section.closing}</p>
              ) : null}
            </section>
          ))}
          <RadioLine label={copy.radioLabel} className="rules__radio">
            {copy.radioText}
          </RadioLine>
        </div>
      </div>
    </>
  );
}
