import type { CSSProperties } from "react";
import { NavLink } from "react-router";
import { SHARED_COPY, STATIONS, stationIndex } from "../../content/shared.ts";
import type { NavKey } from "../../routes.ts";
import "./TabBar.css";

/** Điều hướng chính trên điện thoại, cố định ở đáy màn hình. Cùng thứ tự với NavDial. */
export function TabBar({ active }: { active: NavKey | null }) {
  const index = stationIndex(active);
  return (
    <nav className="tab-bar" aria-label={SHARED_COPY.quickNav}>
      <span className="tab-bar__ruler" aria-hidden="true" />
      {index >= 0 ? (
        <span
          className="tab-bar__needle"
          aria-hidden="true"
          style={{ "--tab-index": index } as CSSProperties}
        />
      ) : null}
      <ul className="tab-bar__list">
        {STATIONS.map((station) => (
          <li key={station.key} className="tab-bar__item">
            <NavLink
              to={station.to}
              end={station.to === "/"}
              aria-current={station.key === active ? "page" : undefined}
              aria-label={station.name}
              className={() => (station.key === active ? "tab-bar__tab is-active" : "tab-bar__tab")}
            >
              <span className="text-label-m" aria-hidden="true">
                {station.tab}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
