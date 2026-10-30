import type { ReactNode } from "react";
import type { ListCopy } from "../../content/lists.ts";
import type { Resource } from "../../hooks/useResource.ts";
import { ListState } from "../ListState/ListState.tsx";

/**
 * Chọn đúng trạng thái cho một danh sách: đang tải, rỗng, lỗi hoặc nội dung.
 * Nút thử lại gọi tải lại dữ liệu, không tải cả trang. Nút ở trạng thái rỗng tùy trang quyết định.
 */
export function ResourceView<T>({
  resource,
  copy,
  onEmptyAction,
  emptyActionTo,
  className,
  children,
}: {
  resource: Resource<T>;
  copy: ListCopy;
  onEmptyAction?: () => void;
  emptyActionTo?: string;
  className?: string;
  children: (data: T) => ReactNode;
}) {
  if (resource.status === "loading") {
    return (
      <ListState
        kind="loading"
        title={copy.loadingTitle}
        message={copy.loadingMessage}
        className={className}
      />
    );
  }
  if (resource.status === "error") {
    return (
      <ListState
        kind="error"
        title={copy.errorTitle}
        message={copy.errorMessage}
        actionLabel={copy.errorAction}
        onAction={resource.reload}
        className={className}
      />
    );
  }
  if (resource.status === "empty") {
    return (
      <ListState
        kind="empty"
        title={copy.emptyTitle}
        message={copy.emptyMessage}
        actionLabel={onEmptyAction || emptyActionTo ? copy.emptyAction : undefined}
        onAction={onEmptyAction}
        actionTo={emptyActionTo}
        className={className}
      />
    );
  }
  return <>{children(resource.data)}</>;
}
