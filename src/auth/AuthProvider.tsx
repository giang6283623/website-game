import { type ReactNode, useCallback, useEffect, useMemo } from "react";
import { mayHaveSession } from "../api/auth-transport.ts";
import { onApiEvent } from "../api/client.ts";
import { getMe, postLogout } from "../api/endpoints.ts";
import type { Account } from "../api/schemas.ts";
import { type AuthState, setAuth, useAuthStore } from "./auth-store.ts";

export type { AuthStatus } from "./auth-store.ts";

export type AuthValue = AuthState & {
  isAdmin: boolean;
  /** Gọi sau khi đăng nhập thành công để lưu tài khoản. */
  setAccount: (account: Account) => void;
  signOut: () => Promise<void>;
};

/**
 * Hỏi /me khi ứng dụng chạy trên trình duyệt (không hỏi lúc dựng sẵn HTML) và theo dõi sự kiện 401.
 * Trạng thái nằm ở auth-store.ts. Trong lúc chờ, giao diện coi như khách để HTML dựng sẵn và lần vẽ đầu giống nhau.
 * Quyền thật luôn do API kiểm tra. Ở đây chỉ để chọn đầu trang và cổng điều hướng.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    let active = true;
    if (mayHaveSession()) {
      getMe()
        .then((account) => {
          if (active) setAuth({ status: "user", account, signedOut: false });
        })
        .catch(() => {
          if (active) setAuth({ status: "guest", account: null, signedOut: false });
        });
    } else {
      setAuth({ status: "guest", account: null, signedOut: false });
    }
    const off = onApiEvent((event) => {
      if (event.type === "unauthorized") {
        setAuth({ status: "guest", account: null, signedOut: false });
      }
    });
    return () => {
      active = false;
      off();
    };
  }, []);

  return children;
}

export function useAuth(): AuthValue {
  const state = useAuthStore();

  const setAccount = useCallback(
    (account: Account) => setAuth({ status: "user", account, signedOut: false }),
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await postLogout();
    } finally {
      setAuth({ status: "guest", account: null, signedOut: true });
    }
  }, []);

  return useMemo<AuthValue>(
    () => ({ ...state, isAdmin: state.account?.role === "admin", setAccount, signOut }),
    [state, setAccount, signOut],
  );
}
