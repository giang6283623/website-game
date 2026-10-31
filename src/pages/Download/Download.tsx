import { useState } from "react";
import { getDownloadInfo } from "../../api/endpoints.ts";
import type { DownloadInfo } from "../../api/schemas.ts";
import { Button } from "../../components/Button/Button.tsx";
import { PageTitle } from "../../components/PageTitle/PageTitle.tsx";
import { RadioLine } from "../../components/RadioLine/RadioLine.tsx";
import { ResourceView } from "../../components/ResourceView/ResourceView.tsx";
import { SectionHead } from "../../components/SectionHead/SectionHead.tsx";
import { StepCard } from "../../components/StepCard/StepCard.tsx";
import { LIST_COPY } from "../../content/lists.ts";
import { PAGE_COPY } from "../../content/pages.ts";
import { COMMUNITY_LINKS } from "../../content/site-links.ts";
import { useResource } from "../../hooks/useResource.ts";
import { DownloadCard, InstallerButton } from "./DownloadCard.tsx";
import "./Download.css";

const copy = PAGE_COPY.downloadPage;
/** Hai kênh hỗ trợ hiện ở cuối trang (CONTENT-COPY.md mục 10.1). YouTube chỉ có ở chân trang. Đã bỏ Zalo. */
const SUPPORT_KEYS = ["facebook", "discord"];

type CopyState = "idle" | "copied" | "failed";

/** Điện thoại: khung cảnh báo game chỉ chạy trên Windows, có nút sao chép địa chỉ trang để mở lại trên máy tính. */
function WindowsWarning() {
  const [state, setState] = useState<CopyState>("idle");
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState("copied");
    } catch {
      setState("failed");
    }
  };
  return (
    <aside className="windows-warning only-mobile" aria-labelledby="windows-warning-title">
      <h2 id="windows-warning-title" className="windows-warning__title text-heading-h3">
        {copy.warning.title}
      </h2>
      <p className="windows-warning__text text-body-m">{copy.warning.text}</p>
      <Button variant="secondary" size="m" onClick={copyLink}>
        {copy.warning.copy}
      </Button>
      <p className="windows-warning__status text-body-s" role="status">
        {state === "copied" ? copy.warning.copied : null}
        {state === "failed" ? copy.warning.copyFailed : null}
      </p>
    </aside>
  );
}

function stepAction(step: (typeof copy.guide.steps)[number], info: DownloadInfo | null) {
  if (step.kind === "download") {
    return (
      <InstallerButton info={info} variant="ghost" size="m" className="step-card__action">
        {step.action}
      </InstallerButton>
    );
  }
  return (
    <Button variant="ghost" size="m" to={step.to} className="step-card__action">
      {step.action}
    </Button>
  );
}

/** Tải game và Hướng dẫn (E1-S6). Phiên bản, dung lượng, ngày và yêu cầu máy lấy từ API, các bước và hỏi đáp là nội dung tĩnh. */
export function Download() {
  // Bộ cài chưa sẵn sàng (available = false) thì coi như rỗng: ẩn khung tải, chỉ giữ hướng dẫn.
  const info = useResource("download", (signal) => getDownloadInfo({ signal }), [], {
    isEmpty: (value) => !value.available,
  });
  const data = info.status === "success" || info.status === "empty" ? info.data : null;

  return (
    <>
      <PageTitle
        crumbs={[{ label: "Trang chủ", to: "/" }, { label: copy.title }]}
        crumbsLabel={copy.crumbs}
        title={copy.title}
        lead={copy.lead}
      />
      <div className="download-page">
        <div className="download-page__top">
          <WindowsWarning />
          <ResourceView resource={info} copy={LIST_COPY.download} emptyActionTo="#huong-dan">
            {(value) => <DownloadCard info={value} />}
          </ResourceView>
        </div>

        <section id="huong-dan" className="download-section" aria-labelledby="guide-title">
          <SectionHead
            id="guide-title"
            overline={copy.guide.overline}
            title={copy.guide.title}
            lead={copy.guide.lead}
          />
          <ol className="download-steps">
            {copy.guide.steps.map((step) => (
              <StepCard
                key={step.no}
                no={step.no}
                icon={step.icon}
                title={step.title}
                text={step.text}
                action={stepAction(step, data)}
              />
            ))}
          </ol>
        </section>

        <section id="ho-tro" className="download-section" aria-labelledby="faq-title">
          <SectionHead
            id="faq-title"
            overline={copy.faq.overline}
            title={copy.faq.title}
            lead={copy.faq.lead}
          />
          <ul className="faq-grid">
            {copy.faq.items.map((item) => (
              <li key={item.question} className="faq-card">
                <h3 className="faq-card__question text-heading-h3">{item.question}</h3>
                <p className="faq-card__answer text-body-m">{item.answer}</p>
              </li>
            ))}
          </ul>
        </section>
        <div className="support">
          <RadioLine label={copy.support.label} className="support__radio">
            {copy.support.text}
          </RadioLine>
          <ul className="support__channels" aria-label={copy.support.channelsLabel}>
            {SUPPORT_KEYS.map((key) => {
              const channel = COMMUNITY_LINKS.find((link) => link.key === key);
              if (!channel) return null;
              return (
                <li key={key}>
                  <Button
                    variant="secondary"
                    size="m"
                    fill
                    href={channel.url ?? undefined}
                    disabled={!channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {channel.label}
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
