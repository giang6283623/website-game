import { CornerMarks } from "../../components/CornerMarks/CornerMarks.tsx";
import { PAGE_COPY } from "../../content/pages.ts";
import { assetUrl } from "../../lib/assets.ts";
import { pauseOffscreenRef } from "../../lib/signal.ts";

/** Túi đồ khởi đầu: hình lớn AK-74 với chú thích, và bốn món nhỏ. Nội dung chọn sẵn, không lấy từ API. */
export function Locker() {
  const copy = PAGE_COPY.home.locker;
  return (
    <aside className="locker pattern-cross" aria-label={copy.title} ref={pauseOffscreenRef}>
      <div className="locker__head text-label-m" aria-hidden="true">
        <span>{copy.title}</span>
        <span>{copy.count}</span>
      </div>
      <div className="locker__main">
        <p className="callout">
          <span className="callout__bar" aria-hidden="true" />
          <span className="callout__text">
            <span className="callout__name text-label-l">{copy.main.name}</span>
            <span className="callout__type text-label-m">{copy.main.typeLabel}</span>
          </span>
        </p>
        <img
          className="locker__image"
          src={assetUrl(copy.main.imageKey)}
          alt={copy.main.name}
          width="528"
          height="322"
          fetchPriority="high"
        />
        <span className="locker__sweep" aria-hidden="true">
          <span className="locker__sweep-band" />
        </span>
      </div>
      <ul className="locker__small">
        {copy.small.map((item) => (
          <li key={item.name} className="locker__item">
            <img src={assetUrl(item.imageKey)} alt="" width="128" height="78" loading="lazy" />
            <span className="locker__item-name text-label-m">
              <span className="only-desktop">{item.name}</span>
              <span className="only-mobile">{item.short}</span>
            </span>
          </li>
        ))}
      </ul>
      <CornerMarks length={28} inset={12} />
    </aside>
  );
}
