import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getBanner } from "../../api/endpoints.ts";
import type { Banner } from "../../api/schemas.ts";
import { SHARED_COPY } from "../../content/shared.ts";
import "./BannerStrip.css";

const CLOSED_KEY = "issvn.banner.closed";

function readClosedId(): number | null {
  try {
    const raw = window.sessionStorage.getItem(CLOSED_KEY);
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
}

function writeClosedId(id: number): void {
  try {
    window.sessionStorage.setItem(CLOSED_KEY, String(id));
  } catch {
    // Trình duyệt chặn lưu trữ phiên: dải chỉ đóng đến khi tải lại trang.
  }
}

/** Chỉ nhận liên kết trong site (bắt đầu bằng một dấu "/") hoặc địa chỉ http, https. Mọi dạng khác bị bỏ. */
function linkKind(url: string | null): "internal" | "external" | null {
  if (!url) return null;
  if (url.startsWith("/") && !url.startsWith("//")) return "internal";
  return /^https?:\/\//i.test(url) ? "external" : null;
}

/**
 * Dải Banner công khai (G-26, A-24). Nằm trên cùng mọi trang công khai, trên thanh trạng thái ở máy tính
 * và trên đầu trang ở điện thoại. Chỉ hiện khi API trả về banner đang bật và trong khoảng ngày.
 * Người dùng đóng được trong phiên (lưu mã banner đã đóng ở `sessionStorage`). Lỗi API thì ẩn dải, không báo lỗi.
 */
export function BannerStrip() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const copy = SHARED_COPY.banner;

  useEffect(() => {
    const controller = new AbortController();
    getBanner({ signal: controller.signal })
      .then((data) => {
        if (data.banner && readClosedId() !== data.banner.id) setBanner(data.banner);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (!banner) return null;

  const kind = linkKind(banner.linkUrl);
  const href = banner.linkUrl ?? "";

  return (
    <aside className="banner-strip" aria-label={copy.label}>
      <span className="banner-strip__side" aria-hidden="true" />
      <p className="banner-strip__body text-label-l">
        <span className="banner-strip__message">{banner.message}</span>
        {kind === "internal" ? (
          <Link className="banner-strip__link" to={href}>
            {copy.link}
          </Link>
        ) : null}
        {kind === "external" ? (
          <a className="banner-strip__link" href={href} target="_blank" rel="noopener noreferrer">
            {copy.link}
          </a>
        ) : null}
      </p>
      <button
        type="button"
        className="banner-strip__close"
        aria-label={copy.close}
        onClick={() => {
          writeClosedId(banner.id);
          setBanner(null);
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
    </aside>
  );
}
