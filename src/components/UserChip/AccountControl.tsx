import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../auth/AuthProvider.tsx";
import { SHARED_COPY } from "../../content/shared.ts";
import { formatRank } from "../../lib/format.ts";
import { UserChip } from "./UserChip.tsx";
import "./AccountMenu.css";

/**
 * Chip tài khoản kèm menu thả ra (UserChip và AccountMenu). Escape đóng menu và trả lấy nét về chip.
 * Mũi tên lên xuống đi giữa các mục. Bấm ra ngoài hoặc đổi trang thì đóng.
 */
export function AccountControl({ size }: { size: "full" | "icon" }) {
  const { account, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const chipRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // biome-ignore lint/correctness/useExhaustiveDependencies: đổi trang là lý do duy nhất cần đóng menu
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || chipRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if (!account) return null;

  const items = (): HTMLElement[] =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      chipRef.current?.focus();
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const list = items();
    const current = list.indexOf(document.activeElement as HTMLElement);
    const step = event.key === "ArrowDown" ? 1 : -1;
    list[(current + step + list.length) % list.length]?.focus();
  };

  const toggle = () => {
    setOpen((value) => !value);
  };

  const copy = SHARED_COPY.account;
  const rank = account.stats.rank;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: chỉ bắt phím Escape và mũi tên cho cả cụm chip và menu
    <div className="account-control" onKeyDown={onKeyDown}>
      <UserChip
        ref={chipRef}
        account={account}
        size={size}
        open={open}
        onToggle={toggle}
        menuId={menuId}
      />
      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={copy.menuLabel(account.displayName)}
          className="account-menu"
        >
          <div className="account-menu__summary">
            <p className="account-menu__name text-body-m-strong">{account.displayName}</p>
            <p className="account-menu__email text-data-m">{account.emailMasked}</p>
            {rank !== null ? (
              <p className="account-menu__rank text-label-m">
                {copy.rank(formatRank(rank, false))}
              </p>
            ) : null}
          </div>
          <Link role="menuitem" className="account-menu__item text-label-l" to="/ho-so">
            {copy.profile}
          </Link>
          <Link
            role="menuitem"
            className="account-menu__item text-label-l"
            to="/ho-so/doi-mat-khau"
          >
            {copy.changePassword}
          </Link>
          {isAdmin ? (
            <Link
              role="menuitem"
              className="account-menu__item account-menu__item--admin text-label-l"
              to="/quan-tri/bai-viet"
            >
              {copy.admin}
            </Link>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className="account-menu__logout text-label-l"
            onClick={async () => {
              setOpen(false);
              await signOut();
              navigate("/");
            }}
          >
            {copy.logout}
          </button>
        </div>
      ) : null}
    </div>
  );
}
