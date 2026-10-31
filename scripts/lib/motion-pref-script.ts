import { MOTION_PREF_KEY } from "../../src/lib/motion-pref.ts";

/**
 * Script nhúng đầu trang: áp lựa chọn "Tắt hiệu ứng" trước lần vẽ đầu tiên. Bị chặn thì hiệu ứng chạy như thường.
 * Không dùng ký tự $, xem scripts/lib/broken-image-script.ts. Sửa chuỗi này thì mã băm trong chính sách nội dung đổi theo (C-124).
 */
export const MOTION_PREF_SOURCE = `try{if(localStorage.getItem(${JSON.stringify(MOTION_PREF_KEY)})==="off")document.documentElement.dataset.motion="off"}catch(e){}`;

export const MOTION_PREF_TAG = `<script>${MOTION_PREF_SOURCE}</script>`;

/** Tắt JavaScript thì nút "Tắt hiệu ứng" không chạy, nên trang không có vòng lặp nào (WCAG 2.2.2). */
export const MOTION_NOSCRIPT_TAG =
  "<noscript><style>*,*::before,*::after{animation:none!important}.glitch-text__slice,.glitch-text__ghost{display:none!important}</style></noscript>";
