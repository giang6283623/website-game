import { NavLink } from "react-router";
import { SHARED_COPY, STATIONS, stationIndex } from "../../content/shared.ts";
import { pauseOffscreenRef } from "../../lib/signal.ts";
import type { NavKey } from "../../routes.ts";
import { DialNeedle, dialRootProps, useDialMove } from "../DialNeedle/DialNeedle.tsx";
import "./NavDial.css";

/**
 * Điều hướng chính trên máy tính: năm trạm, thước và kim cam. Kim đứng giữa trạm đang chọn và trượt có quán tính khi đổi trang.
 * Tần số là chữ trang trí, nên ẩn khỏi trình đọc màn hình. Thước và kim cũng là trang trí.
 */
export function NavDial({ active }: { active: NavKey | null }) {
  const move = useDialMove(stationIndex(active));
  return (
    <nav
      className="nav-dial dial-root"
      aria-label={SHARED_COPY.mainNav}
      ref={pauseOffscreenRef}
      {...dialRootProps(move)}
    >
      <ul className="nav-dial__list">
        {STATIONS.map((station) => (
          <li key={station.key} className="nav-dial__item">
            <NavLink
              to={station.to}
              end={station.to === "/"}
              aria-current={station.key === active ? "page" : undefined}
              className={() =>
                station.key === active ? "nav-dial__station is-active" : "nav-dial__station"
              }
            >
              <span className="nav-dial__freq dial-pop text-label-m" aria-hidden="true">
                {station.frequency}
              </span>
              <span className="nav-dial__name text-label-l">{station.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <span key={move.seq} className="nav-dial__ruler dial-ruler" aria-hidden="true" />
      <DialNeedle move={move} />
    </nav>
  );
}
