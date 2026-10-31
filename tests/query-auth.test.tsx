// Nhóm F: TanStack Query lấy dữ liệu, zustand giữ trạng thái đăng nhập trong bộ nhớ.
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { SESSION_HINT_COOKIE } from "../src/api/auth-transport.ts";
import { api } from "../src/api/client.ts";
import type { Account } from "../src/api/schemas.ts";
import { AuthProvider, useAuth } from "../src/auth/AuthProvider.tsx";
import { setAuth, useAuthStore } from "../src/auth/auth-store.ts";
import { BannerStrip } from "../src/components/BannerStrip/BannerStrip.tsx";
import { useResource } from "../src/hooks/useResource.ts";
import { dropInactiveQueries, queryClient } from "../src/lib/query-client.ts";

const account = (id: number) => ({ id, displayName: `Nguoi${id}` }) as Account;

describe("cấu hình TanStack Query", () => {
  test("không tự thử lại, không tự tải khi đổi cửa sổ, vẫn gọi khi trình duyệt báo mất mạng", () => {
    const options = queryClient.getDefaultOptions().queries;
    expect(options?.retry).toBe(false);
    expect(options?.refetchOnWindowFocus).toBe(false);
    expect(options?.networkMode).toBe("always");
  });

  test("lỗi chỉ gọi một lần, sang trạng thái lỗi ngay", async () => {
    let calls = 0;
    const { result } = renderHook(() =>
      useResource("thu", async () => {
        calls += 1;
        throw new Error("hỏng");
      }, []),
    );
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(calls).toBe(1);
  });

  test("hai chỗ cùng tên và cùng tham số dùng chung một lần gọi", async () => {
    let calls = 0;
    const fetcher = async () => {
      calls += 1;
      return "dữ liệu";
    };
    const { result } = renderHook(() => [
      useResource("chung", fetcher, [1]),
      useResource("chung", fetcher, [1]),
    ]);
    await waitFor(() => expect(result.current[1]?.status).toBe("success"));
    expect(calls).toBe(1);
  });

  test("quay lại trang thấy dữ liệu đã nhớ ngay, rồi tự làm mới", async () => {
    let calls = 0;
    const fetcher = async () => {
      calls += 1;
      return `lần ${calls}`;
    };
    const first = renderHook(() => useResource("nho", fetcher, []));
    await waitFor(() => expect(first.result.current.data).toBe("lần 1"));
    first.unmount();
    const second = renderHook(() => useResource("nho", fetcher, []));
    expect(second.result.current.data).toBe("lần 1");
    await waitFor(() => expect(second.result.current.data).toBe("lần 2"));
  });

  test("ghi thành công thì bỏ dữ liệu không còn trên màn hình, không để hiện bản cũ", async () => {
    const first = renderHook(() => useResource("cu", async () => "bản cũ", []));
    await waitFor(() => expect(first.result.current.data).toBe("bản cũ"));
    first.unmount();
    dropInactiveQueries();
    const second = renderHook(() => useResource("cu", async () => "bản mới", []));
    expect(second.result.current.status).toBe("loading");
  });
});

describe("trạng thái đăng nhập trong zustand", () => {
  test("đổi tài khoản thì xóa dữ liệu đã nhớ của tài khoản trước", async () => {
    setAuth({ status: "user", account: account(1), signedOut: false });
    await queryClient.fetchQuery({ queryKey: ["rieng"], queryFn: async () => "của người 1" });
    setAuth({ status: "user", account: account(2), signedOut: false });
    expect(queryClient.getQueryData(["rieng"])).toBeUndefined();
  });

  test("lần hỏi /me đầu tiên không xóa dữ liệu đang tải", async () => {
    await queryClient.fetchQuery({ queryKey: ["cong-khai"], queryFn: async () => "tin tức" });
    setAuth({ status: "user", account: account(1), signedOut: false });
    expect(queryClient.getQueryData(["cong-khai"])).toBe("tin tức");
  });

  test("giữ nguyên trạng thái đã có thì không xóa, tránh vòng lặp 401", async () => {
    setAuth({ status: "guest", account: null, signedOut: false });
    await queryClient.fetchQuery({ queryKey: ["giu"], queryFn: async () => "tin tức" });
    setAuth({ status: "guest", account: null, signedOut: false });
    expect(queryClient.getQueryData(["giu"])).toBe("tin tức");
  });

  test("chỉ nằm trong bộ nhớ: không ghi localStorage, sessionStorage", () => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    setAuth({ status: "user", account: account(1), signedOut: false });
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
    const text = readFileSync(resolve(import.meta.dir, "../src/auth/auth-store.ts"), "utf8");
    expect(text).not.toContain("zustand/middleware");
  });

  test("useAuth đọc từ kho, AuthProvider hỏi /me khi nối vào trang", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("guest"));
    act(() => result.current.setAccount(account(7)));
    expect(result.current.account?.id).toBe(7);
    expect(useAuthStore.getState().status).toBe("user");
  });
});

describe("AuthProvider chỉ hỏi /me khi cần (C-154)", () => {
  /** Chạy một đoạn với API_MODE cho trước, ghi lại các yêu cầu đi qua api. */
  async function inMode(mode: string, run: () => Promise<void>): Promise<(string | undefined)[]> {
    const seen: (string | undefined)[] = [];
    const id = api.interceptors.request.use((config) => {
      seen.push(config.url);
      return config;
    });
    const original = process.env.API_MODE;
    process.env.API_MODE = mode;
    try {
      await run();
    } finally {
      process.env.API_MODE = original;
      api.interceptors.request.eject(id);
      // biome-ignore lint/suspicious/noDocumentCookie: kiểm thử giả lập cookie do máy chủ đặt
      document.cookie = `${SESSION_HINT_COOKIE}=; Max-Age=0; Path=/`;
    }
    return seen;
  }

  test("máy chủ giả, không có cookie gợi ý: là khách ngay, không gọi /me", async () => {
    const seen = await inMode("mock-server", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
      await waitFor(() => expect(result.current.status).toBe("guest"));
    });
    expect(seen).toEqual([]);
  });

  test("máy chủ giả, có cookie gợi ý: gọi /me", async () => {
    // biome-ignore lint/suspicious/noDocumentCookie: kiểm thử giả lập cookie do máy chủ đặt
    document.cookie = `${SESSION_HINT_COOKIE}=1; Path=/`;
    const seen = await inMode("mock-server", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
      await waitFor(() => expect(result.current.status).toBe("guest"));
    });
    expect(seen).toEqual(["/me"]);
  });

  test("bản nối API thật không có cookie gợi ý vẫn gọi /me", async () => {
    const seen = await inMode("real", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
      await waitFor(() => expect(result.current.status).toBe("guest"));
    });
    expect(seen).toEqual(["/me"]);
  });
});

describe("khung trang dùng TanStack Query", () => {
  test("dải Banner hiện từ API và đóng được", async () => {
    render(
      <MemoryRouter>
        <BannerStrip />
      </MemoryRouter>,
    );
    const close = await screen.findByRole("button", { name: /đóng/i });
    expect(document.querySelector(".banner-strip") !== null).toBe(true);
    act(() => close.click());
    expect(document.querySelector(".banner-strip") === null).toBe(true);
    window.sessionStorage.clear();
  });
});
