import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onApiEvent } from "../api/client.ts";
import { getMe, postLogout } from "../api/endpoints.ts";
import type { Account } from "../api/schemas.ts";

export type AuthStatus = "loading" | "guest" | "user";

export type AuthValue = {
  status: AuthStatus;
  account: Account | null;
  isAdmin: boolean;
  /** Đúng khi người dùng vừa tự đăng xuất. Cổng trang riêng tư dùng cờ này để về trang chủ thay vì tới đăng nhập. */
  signedOut: boolean;
  /** Gọi sau khi đăng nhập thành công để lưu tài khoản. */
  setAccount: (account: Account) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

/**
 * Giữ trạng thái đăng nhập của cả ứng dụng. Chỉ hỏi /me trên trình duyệt (không hỏi lúc dựng sẵn HTML).
 * Trong lúc chờ, giao diện coi như khách để HTML dựng sẵn và lần vẽ đầu giống nhau.
 * Quyền thật luôn do API kiểm tra. Ở đây chỉ để chọn đầu trang và cổng điều hướng.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    status: AuthStatus;
    account: Account | null;
    signedOut: boolean;
  }>({ status: "loading", account: null, signedOut: false });

  useEffect(() => {
    let active = true;
    getMe()
      .then((account) => {
        if (active) setState({ status: "user", account, signedOut: false });
      })
      .catch(() => {
        if (active) setState({ status: "guest", account: null, signedOut: false });
      });
    const off = onApiEvent((event) => {
      if (event.type === "unauthorized") {
        setState({ status: "guest", account: null, signedOut: false });
      }
    });
    return () => {
      active = false;
      off();
    };
  }, []);

  const setAccount = useCallback(
    (account: Account) => setState({ status: "user", account, signedOut: false }),
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await postLogout();
    } finally {
      setState({ status: "guest", account: null, signedOut: true });
    }
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      status: state.status,
      account: state.account,
      isAdmin: state.account?.role === "admin",
      signedOut: state.signedOut,
      setAccount,
      signOut,
    }),
    [state, setAccount, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth phải nằm trong AuthProvider.");
  return value;
}
