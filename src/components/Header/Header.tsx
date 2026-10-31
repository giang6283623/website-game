import { useAuth } from "../../auth/AuthProvider.tsx";
import { SHARED_COPY } from "../../content/shared.ts";
import type { NavKey } from "../../routes.ts";
import { Button } from "../Button/Button.tsx";
import { NavDial } from "../NavDial/NavDial.tsx";
import { AccountControl } from "../UserChip/AccountControl.tsx";
import { Wordmark } from "../Wordmark/Wordmark.tsx";
import "./Header.css";

/**
 * Đầu trang máy tính (từ 1200): Wordmark, NavDial và vùng hành động.
 * Khách: ĐĂNG NHẬP và ĐĂNG KÝ. Đã đăng nhập: chip tài khoản và TẢI GAME. Dính ở đỉnh khi cuộn (xem Header.css).
 */
export function Header({ active }: { active: NavKey | null }) {
  const { status } = useAuth();
  const copy = SHARED_COPY.buttons;
  return (
    <header className="header">
      <Wordmark size="l" />
      <NavDial active={active} />
      <div className="header__actions">
        {status === "user" ? (
          <>
            <AccountControl size="full" />
            <Button variant="primary" size="m" to="/tai-game">
              {copy.download}
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" size="m" to="/dang-nhap">
              {copy.login}
            </Button>
            <Button variant="primary" size="m" to="/dang-ky">
              {copy.register}
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

/** Đầu trang điện thoại và máy tính bảng (dưới 1200): Wordmark S và nút ĐĂNG NHẬP hoặc chip tài khoản dạng gọn. */
export function HeaderMobile() {
  const { status } = useAuth();
  return (
    <header className="header-mobile">
      <Wordmark size="s" />
      {status === "user" ? (
        <AccountControl size="icon" />
      ) : (
        <Button variant="secondary" size="m" to="/dang-nhap">
          {SHARED_COPY.buttons.login}
        </Button>
      )}
    </header>
  );
}
