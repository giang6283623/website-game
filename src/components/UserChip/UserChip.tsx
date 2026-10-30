import { forwardRef } from "react";
import type { Account } from "../../api/schemas.ts";
import { SHARED_COPY } from "../../content/shared.ts";
import { assetUrl } from "../../lib/assets.ts";
import { cn } from "../../lib/cn.ts";
import "./UserChip.css";

export type UserChipProps = {
  account: Account;
  /** full: ảnh, tên và mũi tên (máy tính). icon: chỉ ảnh (điện thoại). */
  size: "full" | "icon";
  open: boolean;
  onToggle: () => void;
  menuId: string;
};

/** Chỗ bấm mở menu tài khoản. Ảnh đại diện là huy hiệu gia tộc. Không có gia tộc thì dùng chữ cái đầu của tên. */
export const UserChip = forwardRef<HTMLButtonElement, UserChipProps>(function UserChip(
  { account, size, open, onToggle, menuId },
  ref,
) {
  const emblem = account.clan?.emblemKey;
  return (
    <button
      ref={ref}
      type="button"
      className={cn("user-chip", `user-chip--${size}`, open && "is-open")}
      aria-label={SHARED_COPY.account.menuLabel(account.displayName)}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? menuId : undefined}
      onClick={onToggle}
    >
      <span className="user-chip__avatar" aria-hidden="true">
        {emblem ? (
          <img src={assetUrl(emblem)} alt="" width="28" height="28" />
        ) : (
          <span className="text-label-m">{account.displayName.slice(0, 1)}</span>
        )}
      </span>
      {size === "full" ? (
        <>
          <span className="user-chip__name text-body-m-strong">{account.displayName}</span>
          <svg
            className="user-chip__arrow"
            viewBox="0 0 12 8"
            width="12"
            height="8"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </>
      ) : null}
    </button>
  );
});
