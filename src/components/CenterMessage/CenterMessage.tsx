import { GlitchText } from "../GlitchText/GlitchText.tsx";
import { ListState } from "../ListState/ListState.tsx";
import "./CenterMessage.css";

/** Trang lỗi toàn trang (404, 500): số lỗi cỡ lớn (Display/L trên điện thoại, Display/XL trên máy tính) và ListState kiểu Error rộng 720. Không hiện mã kỹ thuật nào khác. */
export function CenterMessage({
  code,
  title,
  message,
  actionLabel,
  onAction,
  actionTo,
}: {
  code: string;
  title: string;
  message: string;
  actionLabel: string;
  onAction?: () => void;
  actionTo?: string;
}) {
  return (
    <section className="center-message container" data-code={code}>
      <p className="center-message__code text-display-l">
        <GlitchText text={code} tone="error" />
      </p>
      <ListState
        kind="error"
        headingLevel={1}
        title={title}
        message={message}
        actionLabel={actionLabel}
        onAction={onAction}
        actionTo={actionTo}
        className="center-message__card"
      />
    </section>
  );
}
