import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToString } from "react-dom/server";
import {
  MOTION_NOSCRIPT_TAG,
  MOTION_PREF_SOURCE,
  MOTION_PREF_TAG,
} from "../scripts/lib/motion-pref-script.ts";
import { MotionToggle } from "../src/components/MotionToggle/MotionToggle.tsx";
import { SHARED_COPY } from "../src/content/shared.ts";
import { isMotionOff, MOTION_PREF_KEY, setMotionOff } from "../src/lib/motion-pref.ts";
import { canPlaySignal } from "../src/lib/signal.ts";

const root = resolve(import.meta.dir, "..");

describe("nút Tắt hiệu ứng", () => {
  afterEach(() => {
    if (typeof document !== "undefined") setMotionOff(false);
  });

  test("HTML dựng sẵn không có nút", () => {
    expect(renderToString(<MotionToggle />)).toBe("");
  });

  test("tắt thì đặt data-motion và nhớ, bật lại thì gỡ cả hai", () => {
    setMotionOff(true);
    expect(document.documentElement.dataset.motion).toBe("off");
    expect(localStorage.getItem(MOTION_PREF_KEY)).toBe("off");
    expect(isMotionOff()).toBe(true);
    setMotionOff(false);
    expect(document.documentElement.dataset.motion).toBeUndefined();
    expect(localStorage.getItem(MOTION_PREF_KEY)).toBeNull();
  });

  test("tắt hiệu ứng thì không chạy khóa mục tiêu", () => {
    setMotionOff(true);
    expect(canPlaySignal()).toBe(false);
  });

  test("tắt JavaScript thì không có vòng lặp và không có lát, vì nút không chạy được", () => {
    expect(MOTION_NOSCRIPT_TAG).toStartWith("<noscript><style>");
    expect(MOTION_NOSCRIPT_TAG).toContain("animation:none!important");
    expect(MOTION_NOSCRIPT_TAG).toContain(".glitch-text__slice,.glitch-text__ghost{display:none");
    const prerender = readFileSync(resolve(root, "scripts/prerender.tsx"), "utf8");
    expect(prerender).toContain("${MOTION_NOSCRIPT_TAG}");
  });

  test("script nhúng đứng trước CSS, đọc đúng khóa, có chữ cho cả hai trạng thái", () => {
    expect(MOTION_PREF_SOURCE).toContain(MOTION_PREF_KEY);
    expect(MOTION_PREF_SOURCE).not.toContain("$");
    expect(MOTION_PREF_TAG.length).toBeLessThan(200);
    const prerender = readFileSync(resolve(root, "scripts/prerender.tsx"), "utf8");
    expect(prerender).toMatch(/MOTION_PREF_TAG\}.*headHtml\}.*FONT_TAGS\}/);
    expect(SHARED_COPY.footer.motionOff).toBe("Tắt hiệu ứng");
    expect(SHARED_COPY.footer.motionOn).toBe("Bật hiệu ứng");
  });
});
