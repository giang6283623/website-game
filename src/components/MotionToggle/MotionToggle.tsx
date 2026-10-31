import { useSyncExternalStore } from "react";
import { SHARED_COPY } from "../../content/shared.ts";
import { isMotionOff, setMotionOff, subscribeMotionPref } from "../../lib/motion-pref.ts";

const copy = SHARED_COPY.footer;

/** Nút tạm dừng mọi vòng lặp ở chân trang. HTML dựng sẵn không có nút, vì tắt JavaScript thì nút không làm được gì. */
export function MotionToggle() {
  const off = useSyncExternalStore(subscribeMotionPref, isMotionOff, () => null);
  if (off === null) return null;
  return (
    <button type="button" className="footer__motion text-body-m" onClick={() => setMotionOff(!off)}>
      {off ? copy.motionOn : copy.motionOff}
    </button>
  );
}
