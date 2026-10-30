import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "../../components/Button/Button.tsx";
import { Field } from "../../components/Field/Field.tsx";
import { ADMIN_COPY } from "../../content/admin.ts";
import { cn } from "../../lib/cn.ts";
import "./Admin.css";

/** Tiêu đề trang quản trị và nút hành động chính ở bên phải. */
export function PageHead({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <header className="admin-head">
      <h1 className="admin-head__title text-heading-h1">{title}</h1>
      {action ? <div className="admin-head__action">{action}</div> : null}
    </header>
  );
}

/** Dòng chữ nhấn có viền cam bên trái (khối "NỔI BẬT TRÊN TRANG CHỦ" và "BANNER LÀ GÌ?"). */
export function Callout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="admin-callout">
      <p className="admin-callout__title text-label-m">{title}</p>
      <p className="admin-callout__text text-body-m">{children}</p>
    </div>
  );
}

/**
 * Ô tìm. Gửi bằng phím Enter hoặc tự gửi sau khi ngừng gõ 350 ms. Giá trị nằm trên địa chỉ nên chia sẻ và tải lại không lệch.
 */
export function SearchBox({
  label,
  hint,
  placeholder,
  value,
  onSearch,
}: {
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  onSearch: (next: string) => void;
}) {
  const [term, setTerm] = useState(value);
  const latest = useRef({ value, onSearch });
  latest.current = { value, onSearch };

  // Địa chỉ đổi từ nơi khác (xóa bộ lọc) thì ô nhập theo.
  useEffect(() => setTerm(value), [value]);

  useEffect(() => {
    const next = term.trim();
    if (next === latest.current.value) return;
    const timer = setTimeout(() => latest.current.onSearch(next), 350);
    return () => clearTimeout(timer);
  }, [term]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = term.trim();
    if (next !== value) onSearch(next);
  };

  return (
    <form className="admin-search" noValidate onSubmit={submit}>
      <Field
        fill
        type="search"
        name="q"
        label={label}
        hint={hint}
        placeholder={placeholder}
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        autoComplete="off"
        maxLength={60}
      />
    </form>
  );
}

/** Hộp xác nhận cho thao tác khó hoàn tác (ẩn bài, khóa người dùng). Tiêu điểm bắt đầu ở nút hủy. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  busy = false,
  error,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => before?.focus?.();
  }, []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onCancel();
      return;
    }
    if (event.key !== "Tab") return;
    const buttons = boxRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
    if (!buttons || buttons.length === 0) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  return (
    <div className="admin-confirm" role="presentation">
      <div
        ref={boxRef}
        className="admin-confirm__box"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-text"
        onKeyDown={onKeyDown}
      >
        <h2 id="admin-confirm-title" className="admin-confirm__title text-heading-h3">
          {title}
        </h2>
        <p id="admin-confirm-text" className="admin-confirm__text text-body-m">
          {message}
        </p>
        {error ? (
          <p className="admin-confirm__error text-body-s" role="alert">
            {error}
          </p>
        ) : null}
        <div className="admin-confirm__actions">
          <Button variant="primary" size="m" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </Button>
          <button
            ref={cancelRef}
            type="button"
            className="btn btn--secondary btn--m text-label-m"
            onClick={onCancel}
          >
            {ADMIN_COPY.confirm.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Chữ hành động trong bảng (SỬA, ẨN, KHÓA). Nhìn như chữ cam nhưng là nút hoặc liên kết thật. */
export const rowAction = cn("admin-action", "text-label-m");

/** Một dòng của khung bên phải (nhãn trái, giá trị phải) dùng chung cho Soạn bài và Vật phẩm. */
export function PanelRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="compose__row">
      <dt className="text-label-m">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** Hỏi lại khi rời trang lúc còn thay đổi chưa lưu: đóng tab hoặc tải lại, và bấm liên kết trong trang. */
export function useUnsavedGuard(active: boolean, message: string) {
  useEffect(() => {
    if (!active) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const onClick = (event: globalThis.MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!anchor || anchor.getAttribute("target") === "_blank") return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href.startsWith("/") || href === window.location.pathname) return;
      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [active, message]);
}
