import { type ComponentType, type LazyExoticComponent, lazy } from "react";

export type PageLoader = () => Promise<ComponentType>;

const cache = new Map<PageLoader, LazyExoticComponent<ComponentType>>();

function componentFor(load: PageLoader): LazyExoticComponent<ComponentType> {
  let component = cache.get(load);
  if (!component) {
    component = lazy(async () => ({ default: await load() }));
    cache.set(load, component);
  }
  return component;
}

/**
 * Trang nạp lười: mã của trang chỉ tải khi người dùng vào trang đó (ngân sách JavaScript đầu 150 KB nén).
 * `load` là hàm cố định ở mức tệp, trả về chính thành phần trang. Bước dựng sẵn HTML chờ nạp xong nên HTML của trang vẫn đầy đủ.
 */
export function LazyPage({ load }: { load: PageLoader }) {
  const Page = componentFor(load);
  return <Page />;
}

/** Quên các trang đã nạp lỗi. React giữ kết quả lỗi của lần nạp trước nên nút THỬ LẠI phải gọi hàm này. */
export function resetLazyPages(): void {
  cache.clear();
}
