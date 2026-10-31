import { NavLink } from "react-router";
import { SHARED_COPY, STATIONS, stationIndex } from "../../content/shared.ts";
import type { NavKey } from "../../routes.ts";
import { DialNeedle, dialRootProps, useDialMove } from "../DialNeedle/DialNeedle.tsx";
import "./TabBar.css";

/** Điều hướng chính trên điện thoại, cố định ở đáy màn hình. Cùng thứ tự với NavDial. */
export function TabBar({ active }: { active: NavKey | null }) {
  const move = useDialMove(stationIndex(active));
  return (
    <nav className="tab-bar dial-root" aria-label={SHARED_COPY.quickNav} {...dialRootProps(move)}>
      <span key={move.seq} className="tab-bar__ruler dial-ruler" aria-hidden="true" />
      <DialNeedle move={move} />
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
              <span className="dial-pop text-label-m" aria-hidden="true">
                {station.tab}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
