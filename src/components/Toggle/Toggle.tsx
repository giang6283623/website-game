import { type ReactNode, useId } from "react";
import { cn } from "../../lib/cn.ts";
import "./Toggle.css";

export type ToggleProps = {
  /** Nhãn đứng trước ray. Nên đổi chữ theo trạng thái ("Hiện" và "Ẩn") để không dùng màu làm kênh duy nhất. */
  label: ReactNode;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
};

/** Bật tắt một cài đặt có hiệu lực ngay. Dùng role="switch". */
export function Toggle({ label, checked, onChange, disabled, className, id }: ToggleProps) {
  const generated = useId();
  const labelId = `${id ?? generated}-label`;
  return (
    <div className={cn("toggle", className)}>
      <span id={labelId} className="toggle__label text-body-m">
        {label}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        disabled={disabled}
        className="toggle__track"
        onClick={() => onChange(!checked)}
      >
        <span className="toggle__thumb" aria-hidden="true" />
      </button>
    </div>
  );
}
