// Lỗi API chuẩn hóa theo ROUTES-AND-DATA.md mục 8.4. Giao diện không bao giờ hiện mã HTTP hay chi tiết kỹ thuật.

export type ApiErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "gone"
  | "validation_failed"
  | "rate_limited"
  | "server_error"
  | "network_error"
  | "timeout"
  | "invalid_response";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fields: Record<string, string>;
  /** Số giây phải chờ (đầu Retry-After) khi bị 429. */
  readonly retryAfter: number | null;

  constructor(init: {
    status: number;
    code: ApiErrorCode;
    message: string;
    fields?: Record<string, string>;
    retryAfter?: number | null;
  }) {
    super(init.message);
    this.name = "ApiError";
    this.status = init.status;
    this.code = init.code;
    this.fields = init.fields ?? {};
    this.retryAfter = init.retryAfter ?? null;
  }
}

const STATUS_TO_CODE: Record<number, ApiErrorCode> = {
  400: "bad_request",
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
  409: "conflict",
  410: "gone",
  422: "validation_failed",
  429: "rate_limited",
};

export function codeForStatus(status: number): ApiErrorCode {
  return STATUS_TO_CODE[status] ?? "server_error";
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
