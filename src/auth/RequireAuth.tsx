import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "./AuthProvider.tsx";

/**
 * Cổng của trang riêng tư (Hồ sơ, Đổi mật khẩu). Khách đi tới đăng nhập kèm đường dẫn để quay lại (`?tiep=`).
 * Cổng này chỉ để điều hướng. Quyền thật do API kiểm.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { pathname, search } = useLocation();
  // Đang hỏi /me: giữ chỗ trống, không hiện chữ nào chưa có trong bản vẽ.
  if (auth.status === "loading") return <div aria-busy="true" style={{ minHeight: "60vh" }} />;
  if (auth.status === "guest") {
    // Vừa tự đăng xuất thì về trang chủ. Phiên hết hạn thì tới đăng nhập và quay lại sau.
    if (auth.signedOut) return <Navigate to="/" replace />;
    return <Navigate to={`/dang-nhap?tiep=${encodeURIComponent(pathname + search)}`} replace />;
  }
  return children;
}
