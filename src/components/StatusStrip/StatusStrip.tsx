import { SHARED_COPY } from "../../content/shared.ts";
import { useServerStatus } from "../../hooks/useServerStatus.tsx";
import { formatNumber } from "../../lib/format.ts";
import "./StatusStrip.css";

/**
 * Dải thông tin máy chủ ở đầu trang máy tính. Số liệu lấy từ API, làm mới mỗi 60 giây.
 * Chưa có số liệu thì hiện thanh xám giữ chỗ. Không có số người chơi thì ẩn cả cụm giữa.
 */
export function StatusStrip() {
  const state = useServerStatus();
  const copy = SHARED_COPY.strip;
  const ready = state.phase === "ready" ? state.status : null;
  const online = ready?.online === true;

  return (
    <aside className="status-strip" aria-label={copy.label}>
      <div className="status-strip__left text-label-m">
        {ready ? (
          <>
            <span
              className={online ? "status-strip__dot is-online" : "status-strip__dot"}
              aria-hidden="true"
            />
            <span className={online ? "status-strip__online" : "status-strip__offline"}>
              {online ? copy.online : copy.offline}
            </span>
          </>
        ) : state.phase === "loading" ? (
          <span className="status-strip__bar" aria-hidden="true" />
        ) : null}
      </div>
      <div className="status-strip__middle text-label-m">
        {ready && online && ready.playersOnline !== null ? (
          <span>{copy.players(formatNumber(ready.playersOnline))}</span>
        ) : null}
      </div>
      <div className="status-strip__right text-label-m">{copy.facts}</div>
    </aside>
  );
}
