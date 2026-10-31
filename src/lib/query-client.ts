// Một QueryClient cho cả ứng dụng. Hook truyền thẳng client này nên không cần bọc Provider.
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Lỗi hiện ngay ở trạng thái Lỗi, người dùng tự bấm thử lại (ROUTES-AND-DATA.md mục 10).
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // Mặc định TanStack Query dừng khi trình duyệt báo mất mạng, trang sẽ đứng ở Đang tải mãi.
      networkMode: "always",
    },
  },
});

/** Sau khi ghi, dữ liệu không còn trên màn hình có thể đã cũ. Bỏ đi để lần mở sau tải mới. */
export function dropInactiveQueries(): void {
  queryClient.removeQueries({ type: "inactive" });
}
