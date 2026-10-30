import { useCallback, useEffect, useState } from "react";
import { normalizeError, REQUEST_TIMEOUT_MS } from "../api/client.ts";
import { ApiError } from "../api/errors.ts";

export type ResourceState<T> =
  | { status: "loading"; data: undefined; error: undefined }
  | { status: "success"; data: T; error: undefined }
  | { status: "empty"; data: T; error: undefined }
  | { status: "error"; data: undefined; error: ApiError };

export type Resource<T> = ResourceState<T> & { reload: () => void };

type Options<T> = {
  /** Trả đúng khi dữ liệu coi là rỗng (hiện ListState rỗng). */
  isEmpty?: (data: T) => boolean;
  /** Tắt tải khi chưa đủ điều kiện (ví dụ chưa đăng nhập). */
  enabled?: boolean;
  /** Quá thời gian này thì sang trạng thái Lỗi. Mặc định 8 giây. */
  timeoutMs?: number;
};

const LOADING: ResourceState<never> = { status: "loading", data: undefined, error: undefined };

/**
 * Lấy dữ liệu qua Axios và Zod, trả đủ ba trạng thái của ListState: đang tải, rỗng, lỗi (và thành công).
 * `deps` là các giá trị làm dữ liệu đổi (bộ lọc, trang). Bộ lọc được giữ nguyên khi bấm "thử lại".
 */
export function useResource<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[],
  options: Options<T> = {},
): Resource<T> {
  const { isEmpty, enabled = true, timeoutMs = REQUEST_TIMEOUT_MS } = options;
  const [state, setState] = useState<ResourceState<T>>(LOADING);
  const [attempt, setAttempt] = useState(0);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: deps do người gọi chọn, fetcher luôn lấy bản mới nhất ở lần chạy này
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let active = true;
    setState(LOADING);

    const timer = setTimeout(() => {
      if (!active) return;
      active = false;
      controller.abort();
      setState({
        status: "error",
        data: undefined,
        error: new ApiError({ status: 0, code: "timeout", message: "Quá thời gian chờ." }),
      });
    }, timeoutMs);

    fetcher(controller.signal)
      .then((data) => {
        if (!active) return;
        active = false;
        clearTimeout(timer);
        setState(
          isEmpty?.(data)
            ? { status: "empty", data, error: undefined }
            : { status: "success", data, error: undefined },
        );
      })
      .catch((error: unknown) => {
        if (!active) return;
        active = false;
        clearTimeout(timer);
        setState({ status: "error", data: undefined, error: normalizeError(error) });
      });

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [...deps, attempt, enabled, timeoutMs]);

  return { ...state, reload } as Resource<T>;
}
