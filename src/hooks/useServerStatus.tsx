import { useQuery } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { getServerStatus } from "../api/endpoints.ts";
import type { ServerStatus } from "../api/schemas.ts";
import { queryClient } from "../lib/query-client.ts";

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
  const query = useQuery(
    {
      queryKey: ["server/status"],
      queryFn: ({ signal }) => getServerStatus({ signal }),
      refetchInterval: REFRESH_MS,
    },
    queryClient,
  );
  const { data, isError } = query;
  const state = useMemo<ServerStatusState>(() => {
    if (data) return { phase: "ready", status: data };
    return isError ? { phase: "unknown" } : { phase: "loading" };
  }, [data, isError]);

  return <ServerStatusContext.Provider value={state}>{children}</ServerStatusContext.Provider>;
}

export function useServerStatus(): ServerStatusState {
  return useContext(ServerStatusContext);
}
