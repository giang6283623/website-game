import { Link } from "react-router";
import { SHARED_COPY, STATIONS } from "../../content/shared.ts";
import { COMMUNITY_LINKS, CONTACT_LINK, type SiteLink } from "../../content/site-links.ts";
import { lazyArtRef } from "../../lib/lazy-art.ts";
import { MotionToggle } from "../MotionToggle/MotionToggle.tsx";
import { Wordmark } from "../Wordmark/Wordmark.tsx";
import "./Footer.css";

function ExternalLink({ link, className }: { link: SiteLink; className?: string }) {
  if (!link.url) return null;
  return (
    <li className={className}>
      <a href={link.url} target="_blank" rel="noopener noreferrer">
        {link.label}
      </a>
    </li>
  );
}

/**
 * Chân trang. Một cấu trúc cho cả hai cỡ màn hình, CSS đổi bố cục.
 * Liên kết chưa có địa chỉ thì ẩn, không bao giờ hiện liên kết rỗng (giả định A-07, A-08).
 * Trên điện thoại, nhãn dài rút gọn và cột CỘNG ĐỒNG nhập vào cột HỖ TRỢ.
 * Đoạn giới thiệu chỉ hiện trên điện thoại ở Trang chủ (`introOnMobile`), các trang khác bỏ đoạn này theo bản vẽ.
 */
export function Footer({ introOnMobile = false }: { introOnMobile?: boolean }) {
  const copy = SHARED_COPY.footer;
  const community = COMMUNITY_LINKS.filter((link) => link.url);
  const [firstCommunity] = community;
  return (
    <footer
      className={introOnMobile ? "footer footer--intro-mobile" : "footer"}
      data-art-lazy
      ref={lazyArtRef}
    >
      <div className="footer__top">
        <div className="footer__brand">
          <Wordmark size="l" />
          <p className="footer__intro text-body-m">{copy.intro}</p>
        </div>
        <nav className="footer__col" aria-labelledby="footer-nav-title">
          <h2 id="footer-nav-title" className="footer__title text-label-l">
            {copy.navTitle}
          </h2>
          <ul className="footer__list">
            {STATIONS.filter((station) => station.key !== "profile").map((station) => (
              <li key={station.key}>
                <Link className="text-body-m" to={station.to}>
                  {station.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav className="footer__col" aria-labelledby="footer-support-title">
          <h2 id="footer-support-title" className="footer__title text-label-l">
            {copy.supportTitle}
          </h2>
          <ul className="footer__list">
            <li>
              <Link className="text-body-m" to="/tai-game#huong-dan">
                Hướng dẫn<span className="footer__more"> tải game</span>
              </Link>
            </li>
            <li className="footer__desktop-only">
              <Link className="text-body-m" to="/dang-ky">
                Tạo tài khoản
              </Link>
            </li>
            <li>
              <Link className="text-body-m" to="/quen-mat-khau">
                Quên mật khẩu
              </Link>
            </li>
            {CONTACT_LINK.url ? (
              <li>
                <a className="text-body-m" href={CONTACT_LINK.url}>
                  Liên hệ<span className="footer__more"> quản trị</span>
                </a>
              </li>
            ) : null}
            {firstCommunity ? (
              <li className="footer__mobile-only text-body-m">
                <a href={firstCommunity.url ?? undefined} target="_blank" rel="noopener noreferrer">
                  {firstCommunity.label}
                </a>
              </li>
            ) : null}
            <li>
              <MotionToggle />
            </li>
          </ul>
        </nav>
        {community.length > 0 ? (
          <nav
            className="footer__col footer__desktop-only"
            aria-labelledby="footer-community-title"
          >
            <h2 id="footer-community-title" className="footer__title text-label-l">
              {copy.communityTitle}
            </h2>
            <ul className="footer__list text-body-m">
              {community.map((link) => (
                <ExternalLink key={link.key} link={link} />
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
      <span className="footer__ruler" aria-hidden="true" />
    </footer>
  );
}
