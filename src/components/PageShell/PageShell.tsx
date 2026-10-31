import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router";
import { SHARED_COPY } from "../../content/shared.ts";
import { blocksIndexing } from "../../lib/api-mode.ts";
import { headerPinRef } from "../../lib/header-pin.ts";
import { type Chrome, matchRoute } from "../../routes.ts";
import { applyHead, buildHead } from "../../seo.ts";
import { BannerStrip } from "../BannerStrip/BannerStrip.tsx";
import { Footer } from "../Footer/Footer.tsx";
import { Header, HeaderMobile } from "../Header/Header.tsx";
import { StatusStrip } from "../StatusStrip/StatusStrip.tsx";
import { TabBar } from "../TabBar/TabBar.tsx";
import "./PageShell.css";

type MetaOverride = { title?: string; description?: string; chrome?: Chrome } | null;
const PageMetaContext = createContext<(meta: MetaOverride) => void>(() => {});

/**
 * Trang chi tiết (bài viết, vật phẩm) đặt tiêu đề đầy đủ riêng cho thẻ title. Khi rời trang thì trả về tiêu đề của mẫu đường dẫn.
 * Trang 403 trong khu quản trị đổi khung sang `error` để vẫn có đầu trang và chân trang. Chạy trước khi vẽ nên không nháy khung.
 */
export function usePageMeta(meta: { title?: string; description?: string; chrome?: Chrome }): void {
  const set = useContext(PageMetaContext);
  const { title, description, chrome } = meta;
  useLayoutEffect(() => {
    set({ title, description, chrome });
    return () => set(null);
  }, [set, title, description, chrome]);
}

const SITE_URL: string | undefined = process.env.SITE_URL || undefined;
/** Bản dựng dùng API giả chặn lập chỉ mục, cùng quy tắc với scripts/prerender.tsx (C-91). */
const BLOCK_INDEXING = blocksIndexing(process.env.API_MODE);

/**
 * Khung chung của mọi trang: liên kết bỏ qua, thanh trạng thái, đầu trang, nội dung, chân trang và TabBar.
 * Khung xác thực và quản trị tự dựng bố cục riêng nên ở đây chỉ bọc nội dung (nâng cấp ở E3 và E4).
 */
export function PageShell({ children }: { children: ReactNode }) {
  const { pathname, search, hash } = useLocation();
  const route = useMemo(() => matchRoute(pathname), [pathname]);
  const [override, setOverride] = useState<MetaOverride>(null);
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    applyHead(
      buildHead(route, {
        pathname,
        search,
        title: override?.title,
        description: override?.description,
        siteUrl: SITE_URL,
        blockIndexing: BLOCK_INDEXING,
      }),
    );
  }, [route, pathname, search, override]);

  // Đổi trang bằng router: về đầu trang (hoặc tới mốc #), đưa lấy nét vào vùng nội dung cho người dùng bàn phím và trình đọc màn hình.
  // biome-ignore lint/correctness/useExhaustiveDependencies: chỉ chạy khi đường dẫn hoặc mốc đổi
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) {
      target.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
      mainRef.current?.focus({ preventScroll: true });
    }
  }, [pathname, hash]);

  const chrome = override?.chrome ?? route.chrome;
  const withChrome = chrome === "public" || chrome === "error";

  return (
    <PageMetaContext.Provider value={setOverride}>
      <div className={`shell shell--${chrome}`}>
        <a className="skip-link text-label-m" href="#main">
          {SHARED_COPY.skipLink}
        </a>
        {withChrome ? (
          <>
            <BannerStrip />
            <StatusStrip />
            <div ref={headerPinRef} data-header-sentinel="" aria-hidden="true" />
            <Header active={route.nav} />
            <HeaderMobile />
          </>
        ) : null}
        <main id="main" ref={mainRef} tabIndex={-1} className="shell__main">
          {children}
        </main>
        {withChrome ? (
          <>
            <Footer introOnMobile={route.path === "/"} />
            <TabBar active={route.nav} />
          </>
        ) : null}
      </div>
    </PageMetaContext.Provider>
  );
}
