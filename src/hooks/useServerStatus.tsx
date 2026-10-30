import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { getServerStatus } from "../api/endpoints.ts";
import type { ServerStatus } from "../api/schemas.ts";

export type ServerStatusState =
  | { phase: "loading" }
  | { phase: "ready"; status: ServerStatus }
  | { phase: "unknown" };

const REFRESH_MS = 60_000;

const ServerStatusContext = createContext<ServerStatusState>({ phase: "loading" });

/**
 * Trạng thái máy chủ cho thanh trạng thái và trang chủ. Làm mới mỗi 60 giây, lần làm mới không hiện lại khung tải.
 * Nếu lấy lỗi thì giữ số liệu cũ. Chưa có số liệu nào thì ẩn cụm thay vì hiện số sai.
 */
export function ServerStatusProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ServerStatusState>({ phase: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const load = () => {
      getServerStatus({ signal: controller.signal })
        .then((status) => {
          if (active) setState({ phase: "ready", status });
        })
        .catch(() => {
          if (active)
            setState((current) => (current.phase === "ready" ? current : { phase: "unknown" }));
        });
    };
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      active = false;
      controller.abort();
      clearInterval(timer);
    };
  }, []);

  return <ServerStatusContext.Provider value={state}>{children}</ServerStatusContext.Provider>;
}

export function useServerStatus(): ServerStatusState {
  return useContext(ServerStatusContext);
}
