import { describe, expect, test } from "bun:test";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ApiError } from "../src/api/errors.ts";
import { useResource } from "../src/hooks/useResource.ts";

describe("useResource", () => {
  test("đi từ đang tải sang thành công", async () => {
    const { result } = renderHook(() => useResource(async () => [1, 2, 3], []));
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data).toEqual([1, 2, 3]);
  });

  test("danh sách rỗng thì sang trạng thái rỗng", async () => {
    const { result } = renderHook(() =>
      useResource(async () => [] as number[], [], { isEmpty: (rows) => rows.length === 0 }),
    );
    await waitFor(() => expect(result.current.status).toBe("empty"));
  });

  test("lỗi được chuẩn hóa và nút thử lại tải lại", async () => {
    let calls = 0;
    const { result } = renderHook(() =>
      useResource(async () => {
        calls += 1;
        if (calls === 1) throw new ApiError({ status: 500, code: "server_error", message: "Lỗi." });
        return "ok";
      }, []),
    );
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error?.code).toBe("server_error");
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data).toBe("ok");
    expect(calls).toBe(2);
  });

  test("quá thời gian chờ thì sang trạng thái lỗi timeout", async () => {
    const { result } = renderHook(() =>
      useResource(() => new Promise<string>(() => {}), [], { timeoutMs: 30 }),
    );
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error?.code).toBe("timeout");
  });

  test("đổi bộ lọc thì tải lại và bỏ kết quả cũ", async () => {
    const { result, rerender } = renderHook(
      ({ filter }: { filter: string }) => useResource(async () => `kết quả ${filter}`, [filter]),
      { initialProps: { filter: "a" } },
    );
    await waitFor(() => expect(result.current.data).toBe("kết quả a"));
    rerender({ filter: "b" });
    await waitFor(() => expect(result.current.data).toBe("kết quả b"));
  });

  test("tắt tải khi enabled là false", async () => {
    let calls = 0;
    renderHook(() =>
      useResource(
        async () => {
          calls += 1;
          return 1;
        },
        [],
        { enabled: false },
      ),
    );
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(calls).toBe(0);
  });
});
