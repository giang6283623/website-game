import { Navigate, Route, Routes } from "react-router";
import { AdminLayout } from "./AdminLayout.tsx";
import { AuditPage } from "./AuditPage.tsx";
import { BannersPage } from "./BannersPage.tsx";
import { ComposePage } from "./ComposePage.tsx";
import { ItemFormPage } from "./ItemFormPage.tsx";
import { ItemsPage } from "./ItemsPage.tsx";
import { PostsPage } from "./PostsPage.tsx";
import { UserDetailPage } from "./UserDetailPage.tsx";
import { UsersPage } from "./UsersPage.tsx";

/**
 * Toàn bộ khu quản trị trong một gói riêng, chỉ nạp khi quản trị viên vào `/quan-tri` (E4).
 * Cổng quyền nằm ở `AdminGate` bên ngoài. Quyền thật do API kiểm.
 */
export function AdminApp() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Navigate to="/quan-tri/bai-viet" replace />} />
        <Route path="bai-viet" element={<PostsPage />} />
        <Route path="bai-viet/moi" element={<ComposePage />} />
        <Route path="bai-viet/:id" element={<ComposePage />} />
        <Route path="vat-pham" element={<ItemsPage />} />
        <Route path="vat-pham/moi" element={<ItemFormPage />} />
        <Route path="vat-pham/:id" element={<ItemFormPage />} />
        <Route path="banner" element={<BannersPage />} />
        <Route path="nguoi-dung" element={<UsersPage />} />
        <Route path="nguoi-dung/:id" element={<UserDetailPage />} />
        <Route path="nhat-ky" element={<AuditPage />} />
        <Route path="*" element={<Navigate to="/quan-tri/bai-viet" replace />} />
      </Routes>
    </AdminLayout>
  );
}
