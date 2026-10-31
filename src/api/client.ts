// Khách Axios dùng chung (E0-S7). baseURL /api/v1. Cách xác thực nằm ở auth-transport.ts.
// Chuẩn hóa lỗi và báo các mã 401, 403, 429 qua một kênh sự kiện.
import axios, {
  type AxiosAdapter,
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from "axios";
import type { ZodType } from "zod";
import { dropInactiveQueries } from "../lib/query-client.ts";
import { AUTH_REQUEST_CONFIG, attachAuth, isWriteMethod } from "./auth-transport.ts";
import { ApiError, type ApiErrorCode, codeForStatus } from "./errors.ts";
import { apiErrorBodySchema } from "./schemas.ts";

export const API_BASE_URL = "/api/v1";
/** Quá thời gian này thì chuyển sang trạng thái Lỗi (DESIGN-SPEC mục 8). */
export const REQUEST_TIMEOUT_MS = 8000;

export type ApiEvent =
  | { type: "unauthorized" }
  | { type: "forbidden" }
  | { type: "rate_limited"; retryAfter: number | null };

const listeners = new Set<(event: ApiEvent) => void>();

/** Đăng ký nhận sự kiện 401, 403, 429. Trả về hàm hủy đăng ký. */
export function onApiEvent(listener: (event: ApiEvent) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(event: ApiEvent): void {
  for (const listener of listeners) listener(event);
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (!axios.isAxiosError(error)) {
    return new ApiError({ status: 0, code: "network_error", message: "Không kết nối được." });
  }
  const axiosError = error as AxiosError;
  const response = axiosError.response;
  if (!response) {
    const timedOut = axiosError.code === "ECONNABORTED" || axiosError.code === "ETIMEDOUT";
    return new ApiError({
      status: 0,
      code: timedOut ? "timeout" : "network_error",
      message: timedOut ? "Quá thời gian chờ." : "Không kết nối được.",
    });
  }
  const parsed = apiErrorBodySchema.safeParse(response.data);
  const retryHeader = response.headers?.["retry-after"];
  const retryAfter =
    retryHeader !== undefined ? Number.parseInt(String(retryHeader), 10) : Number.NaN;
  const known = parsed.success
    ? (parsed.data.error.code as ApiErrorCode)
    : codeForStatus(response.status);
  return new ApiError({
    status: response.status,
    code: known,
    message: parsed.success ? parsed.data.error.message : "Có lỗi xảy ra.",
    fields: parsed.success ? parsed.data.error.fields : undefined,
    retryAfter: Number.isFinite(retryAfter) ? retryAfter : null,
  });
}

export function createApiClient(options: { adapter?: AxiosAdapter } = {}): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    ...AUTH_REQUEST_CONFIG,
    timeout: REQUEST_TIMEOUT_MS,
    headers: { Accept: "application/json" },
    ...(options.adapter ? { adapter: options.adapter } : {}),
  });

  client.interceptors.request.use(attachAuth);

  const onSuccess = (response: AxiosResponse) => {
    if (isWriteMethod(response.config.method)) dropInactiveQueries();
    return response;
  };

  client.interceptors.response.use(onSuccess, (error: unknown) => {
    const apiError = normalizeError(error);
    if (apiError.status === 401) emit({ type: "unauthorized" });
    else if (apiError.status === 403) emit({ type: "forbidden" });
    else if (apiError.status === 429)
      emit({ type: "rate_limited", retryAfter: apiError.retryAfter });
    return Promise.reject(apiError);
  });

  return client;
}

/** API giả chạy trong trình duyệt chỉ nạp khi API_MODE là "mock". Gói này nằm riêng, không vào gói tải ban đầu. */
const mockAdapter: AxiosAdapter = async (config) => {
  const { handleMockRequest } = await import("./mock/adapter.ts");
  return handleMockRequest(config);
};

export const api: AxiosInstance = createApiClient(
  process.env.API_MODE === "mock" ? { adapter: mockAdapter } : {},
);

/** Gọi API rồi kiểm phản hồi bằng lược đồ Zod. Sai lược đồ thì coi là lỗi máy chủ. */
export async function parseResponse<T>(
  pending: Promise<{ data: unknown }>,
  schema: ZodType<T>,
): Promise<T> {
  const response = await pending;
  const parsed = schema.safeParse(response.data);
  if (!parsed.success) {
    throw new ApiError({
      status: 502,
      code: "invalid_response",
      message: "Phản hồi từ máy chủ không đúng dạng.",
    });
  }
  return parsed.data;
}
