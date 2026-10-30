import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../auth/AuthProvider.tsx";
import { Wordmark } from "../../components/Wordmark/Wordmark.tsx";
import { ADMIN_COPY, ADMIN_NAV } from "../../content/admin.ts";
import { cn } from "../../lib/cn.ts";
import "./AdminLayout.css";

/**
 * Khung của khu quản trị (E4-S1). Máy tính: thanh bên 280 giữ chỗ khi cuộn. Điện thoại: dải đầu có nút ĐĂNG XUẤT
 * và một hàng chip điều hướng cuộn ngang. Cùng một cây DOM cho cả hai cỡ, chỉ CSS đổi dáng.
 */
export function AdminLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const signOut = async () => {
    await auth.signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="admin">
      <aside className="admin__side">
        <div className="admin__brand">
          <span className="only-desktop">
            <Wordmark size="l" />
          </span>
          <span className="only-mobile">
            <Wordmark size="s" />
          </span>
        </div>
        <p className="admin__label text-label-m">{ADMIN_COPY.navLabel}</p>
        <nav className="admin__nav" aria-label={ADMIN_COPY.navAria}>
          <ul className="admin__list">
            {ADMIN_NAV.map((item) => {
              const current = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <li key={item.key}>
                  <Link
                    to={item.to}
                    className={cn("admin__link", "text-label-m", current && "is-current")}
                    aria-current={current ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <button type="button" className="admin__signout text-label-m" onClick={signOut}>
          {ADMIN_COPY.signOut}
        </button>
      </aside>
      <div className="admin__content">{children}</div>
    </div>
  );
}
