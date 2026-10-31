import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { normalizeError, REQUEST_TIMEOUT_MS } from "../api/client.ts";
import { ApiError } from "../api/errors.ts";
import { queryClient } from "../lib/query-client.ts";

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

/** Gọi `fetcher`, quá `timeoutMs` thì hủy và báo lỗi timeout. Mọi lỗi được chuẩn hóa thành ApiError. */
function fetchWithTimeout<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  signal: AbortSignal,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  signal.addEventListener("abort", () => controller.abort());
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      controller.abort();
      reject(new ApiError({ status: 0, code: "timeout", message: "Quá thời gian chờ." }));
    }, timeoutMs);
    fetcher(controller.signal)
      .then(resolve, (error: unknown) => reject(normalizeError(error)))
      .finally(() => clearTimeout(timer));
  });
}

/**
 * Lấy dữ liệu qua Axios, Zod và TanStack Query, trả đủ ba trạng thái của ListState: đang tải, rỗng, lỗi (và thành công).
 * `name` đặt tên cho loại dữ liệu. Cùng tên và cùng `deps` thì dùng chung dữ liệu đã nhớ.
 * `deps` là các giá trị làm dữ liệu đổi (bộ lọc, trang). Bộ lọc được giữ nguyên khi bấm "thử lại".
 */
export function useResource<T>(
  name: string,
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[],
  options: Options<T> = {},
): Resource<T> {
  const { isEmpty, enabled = true, timeoutMs = REQUEST_TIMEOUT_MS } = options;
  const query = useQuery<T, ApiError>(
    {
      queryKey: [name, ...deps],
      queryFn: ({ signal }) => fetchWithTimeout(fetcher, signal, timeoutMs),
      enabled,
    },
    queryClient,
  );
  const { refetch } = query;
  const reload = useCallback(() => {
    void refetch();
  }, [refetch]);

  // Đang thử lại sau lỗi thì hiện Đang tải như lần đầu.
  if (query.isPending || (query.isError && query.isFetching)) return { ...LOADING, reload };
  if (query.isError) return { status: "error", data: undefined, error: query.error, reload };
  const status = isEmpty?.(query.data) ? "empty" : "success";
  return { status, data: query.data, error: undefined, reload };
}
