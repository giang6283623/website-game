import { useCallback, useEffect, useState } from "react";

/**
 * Đếm ngược theo giây (ví dụ khóa nút "Gửi lại liên kết" trong 60 giây).
 * `restart()` đặt lại về `seconds`. Khi về 0, `remaining` là 0 và đồng hồ dừng.
 */
export function useCountdown(seconds: number): { remaining: number; restart: () => void } {
  const [remaining, setRemaining] = useState(seconds);
  const [run, setRun] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `run` chỉ để chạy lại đồng hồ khi bấm restart
  useEffect(() => {
    setRemaining(seconds);
    const timer = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds, run]);

  const restart = useCallback(() => setRun((value) => value + 1), []);
  return { remaining, restart };
}
