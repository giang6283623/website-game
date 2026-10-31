/**
 * Hoạt ảnh "Tín hiệu yếu" chạy bằng Motion (bản nhỏ motion/mini, dùng Web Animations API của trình duyệt).
 * Tệp này chỉ được nạp bằng import() từ `src/lib/signal.ts` sau khi React đã nối vào trang,
 * nên Motion không nằm trong gói JavaScript tải đầu.
 * Mọi hoạt ảnh chỉ đổi `transform` và `opacity`. Hoạt ảnh xong thì gỡ style nội tuyến mà Motion ghi lại,
 * để CSS của trang (ví dụ hover của thẻ vật phẩm) vẫn có tác dụng.
 */
import { animate } from "motion/mini";
import { lockLayer } from "../lib/lock-layer.ts";

/** Thời lượng khóa một mục tiêu, giây. Đủ chậm để mắt kịp thấy từng mục hiện lên. */
const LOCK_SECONDS = 0.45;
const RETICLE_SECONDS = 0.9;
/** Cách nhau 80 ms giữa các mục tiêu, tối đa 5 nấc để danh sách dài không chờ lâu. */
const STAGGER_SECONDS = 0.08;
const STAGGER_MAX_STEPS = 5;
/** Dấu góc nằm ngoài mục tiêu 8 px, và bay vào từ xa thêm 10 px. */
const RETICLE_OUTSET = 8;
const RETICLE_TRAVEL = 10;
const EASE_STANDARD: [number, number, number, number] = [0.2, 0, 0, 1];

const CORNERS = [
  { name: "tl", x: -1, y: -1 },
  { name: "tr", x: 1, y: -1 },
  { name: "bl", x: -1, y: 1 },
  { name: "br", x: 1, y: 1 },
] as const;

/** Bốn dấu góc cam quanh `target`, bay từ ngoài vào rồi mờ đi. Trả về lời hứa khi xong và đã gỡ khỏi trang. */
async function playReticle(target: HTMLElement, delay: number): Promise<void> {
  const rect = target.getBoundingClientRect();
  const box = document.createElement("div");
  box.className = "lock-reticle";
  box.style.left = `${rect.left + window.scrollX - RETICLE_OUTSET}px`;
  box.style.top = `${rect.top + window.scrollY - RETICLE_OUTSET}px`;
  box.style.width = `${rect.width + RETICLE_OUTSET * 2}px`;
  box.style.height = `${rect.height + RETICLE_OUTSET * 2}px`;
  const marks = CORNERS.map((corner) => {
    const mark = document.createElement("i");
    mark.className = `lock-reticle__mark lock-reticle__mark--${corner.name}`;
    box.append(mark);
    return { mark, corner };
  });
  lockLayer().append(box);
  try {
    await Promise.all(
      marks.map(
        ({ mark, corner }) =>
          animate(
            mark,
            {
              opacity: [0, 1, 1, 0],
              transform: [
                `translate(${corner.x * RETICLE_TRAVEL}px, ${corner.y * RETICLE_TRAVEL}px)`,
                "translate(0px, 0px)",
                "translate(0px, 0px)",
                "translate(0px, 0px)",
              ],
            },
            { duration: RETICLE_SECONDS, delay, ease: EASE_STANDARD, times: [0, 0.35, 0.65, 1] },
          ).finished,
      ),
    );
  } finally {
    box.remove();
  }
}

/**
 * Mục tiêu hiện lên hai nấc (nửa rồi đủ), lệch ngang vài px rồi chốt, như tín hiệu vừa bắt được.
 * Xong thì giữ `opacity: 1` bằng style nội tuyến, để mục tiêu không chớp tắt trong lúc chờ các mục khác.
 */
async function playLock(target: HTMLElement, delay: number): Promise<void> {
  await animate(
    target,
    {
      opacity: [0, 0.55, 1],
      transform: ["translateX(-3px)", "translateX(1px)", "translateX(0px)"],
    },
    { duration: LOCK_SECONDS, delay, ease: "linear", times: [0, 0.5, 1] },
  ).finished;
  target.style.opacity = "1";
}

/**
 * Khóa mục tiêu: mỗi phần tử con trực tiếp của `container` hiện lần lượt theo vị trí, kèm dấu góc.
 * Khi mọi mục tiêu đã hiện: đặt `data-lock="in"` (CSS giữ chúng hiện) rồi mới gỡ style nội tuyến,
 * để thứ tự này không để lọt một khung hình ẩn, và CSS của trang (hover thẻ vật phẩm) lại có tác dụng.
 */
export async function playLockOn(container: HTMLElement): Promise<void> {
  const targets = Array.from(container.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
  const delayOf = (index: number) => Math.min(index, STAGGER_MAX_STEPS) * STAGGER_SECONDS;
  for (const [index, target] of targets.entries()) {
    playReticle(target, delayOf(index)).catch(() => undefined);
  }
  try {
    await Promise.all(targets.map((target, index) => playLock(target, delayOf(index))));
  } finally {
    container.setAttribute("data-lock", "in");
    for (const target of targets) {
      target.style.removeProperty("opacity");
      target.style.removeProperty("transform");
    }
  }
}
