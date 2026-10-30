import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { Forbidden } from "../pages/Forbidden.tsx";
import { useAuth } from "./AuthProvider.tsx";

/**
 * Cổng của khu quản trị (ROUTES-AND-DATA.md mục 4). Khách đi tới trang đăng nhập, người chơi thấy trang 403.
 * Cổng này chỉ để điều hướng. Quyền thật do API kiểm.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { pathname, search } = useLocation();
  // Đang hỏi /me: giữ chỗ trống, không hiện chữ nào chưa có trong bản vẽ.
  if (auth.status === "loading") return <div aria-busy="true" style={{ minHeight: "60vh" }} />;
  if (auth.status === "guest") {
    // Vừa bấm ĐĂNG XUẤT trong khu quản trị thì về trang chủ, không bắt đăng nhập lại.
    if (auth.signedOut) return <Navigate to="/" replace />;
    return <Navigate to={`/dang-nhap?tiep=${encodeURIComponent(pathname + search)}`} replace />;
  }
  return auth.isAdmin ? children : <Forbidden />;
}
