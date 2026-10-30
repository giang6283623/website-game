import type { ReactNode } from "react";
import { AUTH_COPY, AUTH_ITEMS } from "../../content/account.ts";
import { assetSize, assetUrl } from "../../lib/assets.ts";
import { Button } from "../Button/Button.tsx";
import { Overline } from "../Overline/Overline.tsx";
import { StatusStrip } from "../StatusStrip/StatusStrip.tsx";
import { Wordmark } from "../Wordmark/Wordmark.tsx";
import "./AuthLayout.css";

/**
 * Bố cục của các trang xác thực (PAGES.md mục 5). Máy tính: StatusStrip, AuthBar, hai nửa (hình bên trái, biểu mẫu bên phải).
 * Điện thoại: một cột gồm AuthBar, giới thiệu, dải ba hình, biểu mẫu. Không có TabBar và Footer.
 * Tiêu đề H1 của trang nằm trong FormCard. Khối hình chỉ trang trí nên tiêu đề ở đây là đoạn văn.
 */
export function AuthLayout({
  overline,
  heading,
  lead,
  bar = "home",
  children,
}: {
  overline: string;
  /** Hai dòng trên máy tính. Điện thoại nối thành một đoạn. */
  heading: readonly [string, string];
  lead: string;
  /** Nút Ghost ở thanh trên: về trang chủ, hoặc sang trang đăng nhập. */
  bar?: "home" | "login";
  children: ReactNode;
}) {
  const copy = AUTH_COPY;
  return (
    <div className="auth">
      <StatusStrip />
      <div className="auth__bar">
        <span className="only-desktop">
          <Wordmark size="l" />
        </span>
        <span className="only-mobile">
          <Wordmark size="s" />
        </span>
        {bar === "home" ? (
          <Button to="/" variant="ghost" size="m">
            <span className="only-desktop">{copy.bar.home}</span>
            <span className="only-mobile">{copy.bar.homeMobile}</span>
          </Button>
        ) : (
          <Button to="/dang-nhap" variant="ghost" size="m">
            {copy.bar.login}
          </Button>
        )}
      </div>
      <div className="auth__main">
        <section className="auth-visual pattern-cross">
          <div className="auth-visual__intro">
            <Overline>{overline}</Overline>
            <p className="auth-visual__heading text-display-m">
              <span>{heading[0]}</span> <span>{heading[1]}</span>
            </p>
            <p className="auth-visual__lead">{lead}</p>
          </div>
          <div className="auth-visual__items">
            <div className="auth-visual__ruler pattern-ruler" aria-hidden="true" />
            <ul className="auth-items" aria-label={copy.itemsLabel}>
              {AUTH_ITEMS.map((item) => {
                const size = assetSize(item.imageKey);
                return (
                  <li key={item.imageKey} className="auth-items__slot">
                    <span className="auth-items__plate">
                      <img
                        src={assetUrl(item.imageKey)}
                        alt={item.name}
                        width={size?.[0]}
                        height={size?.[1]}
                        decoding="async"
                      />
                    </span>
                    <span className="auth-items__name text-label-m">{item.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
        <div className="auth-form">{children}</div>
      </div>
    </div>
  );
}
