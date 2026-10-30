import type { ReactNode } from "react";
import { assetUrl } from "../../lib/assets.ts";
import "./StepCard.css";

/**
 * Thẻ bước (COMPONENTS.md, StepCard): thước ở trên, vòng tròn chứa icon, số bước, tiêu đề, mô tả và một nút Ghost.
 * Dùng cho "Ba bước vào game" ở Trang chủ và "Ba bước cài đặt" ở Tải game.
 */
export function StepCard({
  no,
  icon,
  title,
  text,
  action,
}: {
  no: string;
  /** Khóa hình icon bước, ví dụ "steps/use.webp". */
  icon: string;
  title: string;
  text: ReactNode;
  /** Nút Ghost M của thẻ. */
  action: ReactNode;
}) {
  return (
    <li className="step-card">
      <span className="step-card__ruler pattern-ruler" aria-hidden="true" />
      <div className="step-card__body">
        <div className="step-card__top">
          <span className="step-card__ring" aria-hidden="true">
            <img src={assetUrl(icon)} alt="" width="48" height="48" loading="lazy" />
          </span>
          <span className="step-card__no text-display-m" aria-hidden="true">
            {no}
          </span>
        </div>
        <h3 className="step-card__title text-heading-h2">{title}</h3>
        <p className="step-card__text text-body-m">{text}</p>
        {action}
      </div>
    </li>
  );
}
