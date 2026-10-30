import type { CSSProperties } from "react";
import { NavLink } from "react-router";
import { SHARED_COPY, STATIONS, stationIndex } from "../../content/shared.ts";
import type { NavKey } from "../../routes.ts";
import "./NavDial.css";

/**
 * Điều hướng chính trên máy tính: năm trạm, thước và kim cam. Kim đứng giữa trạm đang chọn và trượt khi đổi trang.
 * Tần số là chữ trang trí, nên ẩn khỏi trình đọc màn hình. Thước và kim cũng là trang trí.
 */
export function NavDial({ active }: { active: NavKey | null }) {
  const index = stationIndex(active);
  return (
    <nav className="nav-dial" aria-label={SHARED_COPY.mainNav}>
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
              <span className="nav-dial__freq text-label-m" aria-hidden="true">
                {station.frequency}
              </span>
              <span className="nav-dial__name text-label-l">{station.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <span className="nav-dial__ruler" aria-hidden="true" />
      {index >= 0 ? (
        <span
          className="nav-dial__needle"
          aria-hidden="true"
          style={{ "--dial-index": index } as CSSProperties}
        />
      ) : null}
    </nav>
  );
}
