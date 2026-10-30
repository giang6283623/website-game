import { type InputHTMLAttributes, useId, useState } from "react";
import { cn } from "../../lib/cn.ts";
import "./Field.css";

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "aria-invalid"> & {
  /** Nhãn hiện trên ô nhập (Label/M, chữ hoa bằng CSS). */
  label: string;
  /** Dòng gợi ý luôn hiện. Khi có lỗi, thông báo lỗi thay chỗ gợi ý. */
  hint?: string;
  /** Thông báo lỗi. Có giá trị thì ô vào trạng thái Error. */
  error?: string;
  id?: string;
  /** Ô mật khẩu: thêm nút HIỆN/ẨN ở mép phải. */
  revealable?: boolean;
  /** Ô đứng một mình, giãn hết khung chứa (mặc định rộng 360). */
  fill?: boolean;
  wrapperClassName?: string;
};

/** Ô nhập kèm nhãn và gợi ý. Mọi lỗi và gợi ý đều được gắn vào ô bằng aria-describedby. */
export function Field({
  label,
  hint,
  error,
  id,
  type = "text",
  revealable = false,
  fill = false,
  disabled,
  className,
  wrapperClassName,
  ...rest
}: FieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const hintId = `${inputId}-hint`;
  const [shown, setShown] = useState(false);
  const message = error ?? hint;
  const inputType = revealable ? (shown ? "text" : "password") : type;

  return (
    <div
      className={cn(
        "field",
        fill && "field--fill",
        error && "field--error",
        disabled && "field--disabled",
        wrapperClassName,
      )}
    >
      <label className="field__label text-label-m" htmlFor={inputId}>
        {label}
      </label>
      <div className="field__box">
        <input
          {...rest}
          id={inputId}
          type={inputType}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? hintId : undefined}
          className={cn("field__input text-body-m", className)}
        />
        {revealable ? (
          <button
            type="button"
            className="field__action text-label-m"
            aria-pressed={shown}
            disabled={disabled}
            onClick={() => setShown((value) => !value)}
          >
            <span className="visually-hidden">Hiện mật khẩu</span>
            <span aria-hidden="true">{shown ? "ẨN" : "HIỆN"}</span>
          </button>
        ) : null}
      </div>
      {message ? (
        <p id={hintId} className="field__hint text-body-s">
          {message}
        </p>
      ) : null}
    </div>
  );
}
