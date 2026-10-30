import { cn } from "../../lib/cn.ts";
import { Button } from "../Button/Button.tsx";
import "./ListState.css";

export type ListStateKind = "empty" | "loading" | "error";

export type ListStateProps = {
  kind: ListStateKind;
  title: string;
  message: string;
  /** Nhãn nút. Bắt buộc với Error (THỬ LẠI), tùy chọn với Empty, không dùng với Loading. */
  actionLabel?: string;
  onAction?: () => void;
  actionTo?: string;
  className?: string;
  /** Cấp tiêu đề thật (1 đến 3) khi trạng thái là nội dung chính của trang, ví dụ trang 404. Mặc định là đoạn văn. */
  headingLevel?: 1 | 2 | 3;
};

function CompassIcon() {
  // Biểu tượng la bàn 176 x 107, nét theo màu chữ nhạt.
  return (
    <svg
      className="list-state__compass"
      viewBox="0 0 176 107"
      width="176"
      height="107"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="88" cy="53.5" r="44" />
        <circle cx="88" cy="53.5" r="36" strokeOpacity="0.5" />
        <path d="M88 5v12M88 90v12M40 53.5H28M148 53.5h-12" />
        <path d="M88 53.5 76 83l12-9 12 9z" className="list-state__needle" />
        <path d="M88 53.5 100 24l-12 9-12-9z" />
        <path d="M8 105h160" strokeOpacity="0.5" />
      </g>
    </svg>
  );
}

/** Trạng thái rỗng, đang tải và lỗi của một danh sách. Nút thử lại tải lại dữ liệu, không tải cả trang. */
export function ListState({
  kind,
  title,
  message,
  actionLabel,
  onAction,
  actionTo,
  className,
  headingLevel,
}: ListStateProps) {
  const Title = headingLevel ? (`h${headingLevel}` as const) : "p";
  const role = kind === "error" ? "alert" : "status";
  const hasAction = kind !== "loading" && actionLabel !== undefined;
  return (
    <div
      className={cn("list-state", `list-state--${kind}`, className)}
      role={role}
      aria-busy={kind === "loading" ? true : undefined}
    >
      {kind === "empty" ? <CompassIcon /> : null}
      {kind === "loading" ? (
        <div className="list-state__bars" aria-hidden="true">
          <span className="list-state__bar list-state__bar--long" />
          <span className="list-state__bar list-state__bar--mid" />
          <span className="list-state__bar list-state__bar--short" />
        </div>
      ) : null}
      {kind === "error" ? (
        <div className="list-state__bang text-display-m" aria-hidden="true">
          !
        </div>
      ) : null}
      <Title className="list-state__title text-heading-h3">{title}</Title>
      <p className="list-state__message text-body-m">{message}</p>
      {hasAction ? (
        <Button
          variant={kind === "error" ? "primary" : "secondary"}
          size="m"
          onClick={onAction}
          to={actionTo}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
