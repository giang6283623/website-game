import { Suspense } from "react";
import { Route, Routes, useLocation } from "react-router";
import { AdminGate } from "./auth/AdminGate.tsx";
import { AuthProvider } from "./auth/AuthProvider.tsx";
import { RequireAuth } from "./auth/RequireAuth.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary.tsx";
import { PageShell } from "./components/PageShell/PageShell.tsx";
import { ServerStatusProvider } from "./hooks/useServerStatus.tsx";
import { LazyPage, resetLazyPages } from "./lazy-page.tsx";
import { NotFound } from "./pages/NotFound.tsx";

// Mỗi trang là một gói riêng. Trang 404 nhỏ nên nằm trong gói chính.
const loadAdmin = () => import("./pages/Admin/AdminApp.tsx").then((m) => m.AdminApp);
const loadArticle = () => import("./pages/Article/Article.tsx").then((m) => m.Article);
const loadChangePassword = () =>
  import("./pages/Profile/ChangePassword.tsx").then((m) => m.ChangePassword);
const loadDownload = () => import("./pages/Download/Download.tsx").then((m) => m.Download);
const loadHome = () => import("./pages/Home/Home.tsx").then((m) => m.Home);
const loadItem = () => import("./pages/Item/ItemPage.tsx").then((m) => m.ItemPage);
const loadItems = () => import("./pages/Items/Items.tsx").then((m) => m.Items);
const loadRanking = () => import("./pages/Ranking/Ranking.tsx").then((m) => m.Ranking);
const loadForgot = () => import("./pages/Auth/Forgot.tsx").then((m) => m.Forgot);
const loadLogin = () => import("./pages/Auth/Login.tsx").then((m) => m.Login);
const loadProfile = () => import("./pages/Profile/Profile.tsx").then((m) => m.Profile);
const loadRegister = () => import("./pages/Auth/Register.tsx").then((m) => m.Register);
const loadReset = () => import("./pages/Auth/Reset.tsx").then((m) => m.Reset);
const loadRules = () => import("./pages/Rules/Rules.tsx").then((m) => m.Rules);
const loadNews = () => import("./pages/News/News.tsx").then((m) => m.News);

/** Gốc của ứng dụng. Cùng một cây cho trình duyệt (BrowserRouter) và cho bước dựng sẵn HTML (StaticRouter). */
export function App() {
  const { pathname } = useLocation();
  return (
    <AuthProvider>
      <ServerStatusProvider>
        <PageShell>
          <ErrorBoundary resetKey={pathname} onReset={resetLazyPages}>
            <Suspense fallback={<div aria-busy="true" style={{ minHeight: "60vh" }} />}>
              <Routes>
                <Route path="/" element={<LazyPage load={loadHome} />} />
                <Route path="/tin-tuc" element={<LazyPage load={loadNews} />} />
                <Route path="/tin-tuc/:slug" element={<LazyPage load={loadArticle} />} />
                <Route path="/kho-do" element={<LazyPage load={loadItems} />} />
                <Route path="/xep-hang" element={<LazyPage load={loadRanking} />} />
                <Route path="/tai-game" element={<LazyPage load={loadDownload} />} />
                <Route path="/quy-tac" element={<LazyPage load={loadRules} />} />
                <Route path="/kho-do/:slug" element={<LazyPage load={loadItem} />} />
                <Route path="/dang-nhap" element={<LazyPage load={loadLogin} />} />
                <Route path="/dang-ky" element={<LazyPage load={loadRegister} />} />
                <Route path="/quen-mat-khau" element={<LazyPage load={loadForgot} />} />
                <Route path="/dat-lai-mat-khau" element={<LazyPage load={loadReset} />} />
                <Route
                  path="/ho-so"
                  element={
                    <RequireAuth>
                      <LazyPage load={loadProfile} />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/ho-so/doi-mat-khau"
                  element={
                    <RequireAuth>
                      <LazyPage load={loadChangePassword} />
                    </RequireAuth>
                  }
                />
                {/* Khu quản trị (E4): cổng quyền bên ngoài, toàn bộ trang quản trị là một gói riêng. */}
                <Route
                  path="/quan-tri/*"
                  element={
                    <AdminGate>
                      <LazyPage load={loadAdmin} />
                    </AdminGate>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </PageShell>
      </ServerStatusProvider>
    </AuthProvider>
  );
}
