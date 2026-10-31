import type { DownloadInfo } from "../../api/schemas.ts";
import { Button, type ButtonProps } from "../../components/Button/Button.tsx";
import { CornerMarks } from "../../components/CornerMarks/CornerMarks.tsx";
import { Overline } from "../../components/Overline/Overline.tsx";
import { PAGE_COPY } from "../../content/pages.ts";
import { INSTALLER_URL } from "../../content/site-links.ts";
import { cn } from "../../lib/cn.ts";
import { formatDateFull } from "../../lib/format.ts";

const copy = PAGE_COPY.downloadPage.card;
const REQUIREMENT_KEYS = ["os", "memory", "disk", "network"] as const;

/**
 * Nút tải bộ cài. Máy tính: liên kết tải về (khóa khi chưa có địa chỉ tệp). Điện thoại: luôn khóa (D-05).
 * Hai nút cùng nhãn, CSS chỉ cho hiện một nút theo cỡ màn hình.
 */
export function InstallerButton({
  info,
  variant,
  size,
  fill,
  className,
  children,
}: {
  info: DownloadInfo | null;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  fill?: boolean;
  className?: string;
  children: string;
}) {
  // LINK-TAI-GAME: link tải game gắn ở INSTALLER_URL (src/content/site-links.ts), đang tạm là "#".
  const href = info?.available ? INSTALLER_URL : undefined;
  // Chưa có link thật: `download` sẽ tải chính trang web về máy, còn bấm "#" sẽ cuộn về đầu trang.
  const placeholder = href === "#";
  return (
    <>
      <Button
        className={cn("installer installer--desktop", className)}
        variant={variant}
        size={size}
        fill={fill}
        href={href}
        download={href && !placeholder ? true : undefined}
        onClick={placeholder ? (event) => event.preventDefault() : undefined}
        disabled={!href}
      >
        {children}
      </Button>
      <Button
        className={cn("installer installer--mobile", className)}
        variant={variant}
        size={size}
        fill={fill}
        disabled
      >
        {children}
      </Button>
    </>
  );
}

/** Khung tải bộ cài (COMPONENTS.md, DownloadCard): chữ và nút bên trái, bảng yêu cầu máy bên phải. */
export function DownloadCard({ info }: { info: DownloadInfo }) {
  return (
    <section className="download-card" aria-labelledby="download-title">
      <div className="download-card__main pattern-cross">
        <Overline>{copy.label}</Overline>
        <h2 id="download-title" className="download-card__title text-display-m">
          <span>{copy.titleLine1}</span>
          <span>{copy.titleLine2}</span>
        </h2>
        <p className="download-card__text text-body-m">{copy.text}</p>
        <dl className="download-card__facts">
          <div className="download-card__fact">
            <dt className="text-label-m">{copy.version}</dt>
            <dd>{info.version}</dd>
          </div>
          <div className="download-card__fact">
            <dt className="text-label-m">{copy.size}</dt>
            <dd>{info.sizeLabel}</dd>
          </div>
          <div className="download-card__fact">
            <dt className="text-label-m">{copy.released}</dt>
            <dd>{formatDateFull(info.releasedAt)}</dd>
          </div>
        </dl>
        <div className="download-card__actions">
          <InstallerButton info={info} size="l" fill>
            {copy.download}
          </InstallerButton>
          <Button variant="secondary" size="l" to="#huong-dan" className="download-card__guide">
            {copy.guide}
          </Button>
        </div>
        <p className="download-card__note text-body-s">
          <span className="only-desktop">{copy.note}</span>
          <span className="only-mobile">{copy.noteMobile}</span>
        </p>
        <CornerMarks className="only-mobile" />
      </div>
      <aside className="download-card__req" aria-labelledby="download-req-title">
        <span className="download-card__ruler pattern-ruler" aria-hidden="true" />
        <div className="download-card__panel">
          <h3 id="download-req-title" className="download-card__req-title text-label-l">
            {copy.requirementsTitle}
          </h3>
          <dl className="download-card__rows">
            {REQUIREMENT_KEYS.map((key) => (
              <div key={key} className="download-card__row">
                <dt className="text-label-m">{copy.requirements[key]}</dt>
                <dd>{info.requirements[key]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
      <CornerMarks className="only-desktop" />
    </section>
  );
}
