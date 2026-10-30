import { type InputHTMLAttributes, type ReactNode, useId } from "react";
import { cn } from "../../lib/cn.ts";
import "./Checkbox.css";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id"> & {
  label: ReactNode;
  id?: string;
};

/** Một lựa chọn bật tắt có nhãn dài. Hộp vẽ lại bằng CSS, nhưng bên dưới vẫn là input checkbox thật. */
export function Checkbox({ label, id, className, ...rest }: CheckboxProps) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <label className={cn("checkbox", className)} htmlFor={inputId}>
      <input {...rest} id={inputId} type="checkbox" className="checkbox__input" />
      <span className="checkbox__box" aria-hidden="true">
        <svg viewBox="0 0 14 14" width="14" height="14" focusable="false" aria-hidden="true">
          <path d="M2 7.5 5.5 11 12 3.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
        </svg>
      </span>
      <span className="checkbox__label text-body-m">{label}</span>
    </label>
  );
}
