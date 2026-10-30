import { type ChangeEvent, type RefObject, useEffect, useRef, useState } from "react";
import type { ZodType } from "zod";
import { normalizeError } from "../api/client.ts";
import type { ApiError } from "../api/errors.ts";
import { FORM_MESSAGES } from "../content/account.ts";
import { firstErrors } from "../lib/forms.ts";

type Errors<T> = Partial<Record<keyof T & string, string>>;

/** Lỗi nối mạng hoặc máy chủ: hiện câu chung, không lộ chi tiết kỹ thuật. */
function isOutage(error: ApiError): boolean {
  return error.status === 0 || error.status >= 500;
}

/**
 * Trạng thái biểu mẫu: giá trị, lỗi từng ô, lỗi chung và đang gửi.
 * - Kiểm bằng Zod trước khi gọi API. Lỗi 409 và 422 của máy chủ gắn vào đúng ô nhờ `fields`.
 * - Bấm gửi hai lần liên tiếp chỉ gọi API một lần.
 * - Có lỗi thì đưa tiêu điểm tới ô lỗi đầu tiên.
 */
export function useForm<T extends Record<string, string>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Errors<T>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const formRef: RefObject<HTMLFormElement | null> = useRef(null);

  const errorCount = Object.keys(errors).length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: chạy mỗi khi tập lỗi đổi
  useEffect(() => {
    if (errorCount === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errors, errorCount]);

  const setValue = (name: keyof T & string, value: string) =>
    setValues((previous) => ({ ...previous, [name]: value }));

  /** Thuộc tính gắn vào `<Field>`. */
  const field = (name: keyof T & string) => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setValues((previous) => ({ ...previous, [name]: value }));
      setErrors((previous) => (previous[name] ? { ...previous, [name]: undefined } : previous));
    },
  });

  /**
   * Kiểm rồi gọi `run`. `onError` trả đúng khi trang tự xử lý lỗi (ví dụ 429), khi đó không hiện lỗi chung.
   */
  async function submit(
    schema: ZodType,
    run: (values: T) => Promise<void>,
    onError?: (error: ApiError) => boolean,
  ): Promise<void> {
    if (busyRef.current) return;
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setFormError(null);
      setErrors(firstErrors(parsed.error) as Errors<T>);
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setErrors({});
    setFormError(null);
    try {
      await run(values);
    } catch (caught) {
      const error = normalizeError(caught);
      if (onError?.(error)) return;
      if (Object.keys(error.fields).length > 0) setErrors(error.fields as Errors<T>);
      else setFormError(isOutage(error) ? FORM_MESSAGES.network : error.message);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return {
    values,
    errors,
    setErrors,
    formError,
    setFormError,
    busy,
    formRef,
    field,
    setValue,
    submit,
  };
}
