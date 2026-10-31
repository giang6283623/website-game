// Trạng thái đăng nhập của cả ứng dụng. Chỉ nằm trong bộ nhớ, không dùng persist:
// giao diện không lưu mã phiên hay thông tin tài khoản xuống trình duyệt (ROUTES-AND-DATA.md mục 11).
import { create } from "zustand";
import type { Account } from "../api/schemas.ts";
import { queryClient } from "../lib/query-client.ts";

export type AuthStatus = "loading" | "guest" | "user";

export type AuthState = {
  status: AuthStatus;
  account: Account | null;
  /** Đúng khi người dùng vừa tự đăng xuất. Cổng trang riêng tư dùng cờ này để về trang chủ thay vì tới đăng nhập. */
  signedOut: boolean;
};

export const useAuthStore = create<AuthState>(() => ({
  status: "loading",
  account: null,
  signedOut: false,
}));

/** Đổi trạng thái. Đổi sang người khác thì tải lại dữ liệu, để không hiện dữ liệu của tài khoản trước. */
export function setAuth(next: AuthState): void {
  const previous = useAuthStore.getState();
  useAuthStore.setState(next, true);
  if (previous.status !== "loading" && previous.account?.id !== next.account?.id) {
    void queryClient.resetQueries();
  }
}
