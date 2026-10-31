/**
 * Bật trạng thái ghim của đầu trang khi cuộn. Một mốc cao 0 đứng ngay trên đầu trang: mốc ra khỏi khung nhìn
 * nghĩa là đầu trang vừa chạm đỉnh, ta đặt `data-header-pinned` lên `.shell` để CSS chuyển sang dạng thu gọn.
 * Phần dính do `position: sticky` lo, nên tắt JavaScript hoặc thiếu IntersectionObserver thì đầu trang vẫn dính, chỉ không thu gọn.
 * Mốc nằm ngoài đầu trang nên thu gọn không làm dấu bật tắt liên tục.
 */
export function headerPinRef(sentinel: HTMLElement | null): (() => void) | undefined {
  const shell = sentinel?.parentElement;
  if (!sentinel || !shell || typeof IntersectionObserver === "undefined") return undefined;
  const observer = new IntersectionObserver((entries) => {
    const latest = entries.at(-1);
    if (latest) shell.toggleAttribute("data-header-pinned", !latest.isIntersecting);
  });
  observer.observe(sentinel);
  return () => {
    observer.disconnect();
    shell.removeAttribute("data-header-pinned");
  };
}
