import { GAME_ASSET_BASE } from "../../src/lib/assets.ts";
import { BROKEN_ATTRIBUTE } from "../../src/lib/hide-broken-images.ts";

/**
 * Script nhúng đầu trang: gắn dấu hỏng cho hình game trước khi gói JavaScript chạy, để biểu tượng hình hỏng không nháy.
 * Phần còn lại (gỡ dấu khi hình tải được, dự phòng khi script này bị chặn) nằm ở src/lib/hide-broken-images.ts.
 * Không dùng ký tự $: chuỗi này đi qua String.replace ở scripts/prerender.tsx, $ sẽ bị hiểu là mẫu thay thế.
 */
export const BROKEN_IMAGE_SOURCE = `document.addEventListener("error",function(e){var t=e.target;if(t.tagName==="IMG"&&(t.getAttribute("src")||"").indexOf(${JSON.stringify(GAME_ASSET_BASE)})===0)t.setAttribute(${JSON.stringify(BROKEN_ATTRIBUTE)},"")},true)`;

export const BROKEN_IMAGE_TAG = `<script>${BROKEN_IMAGE_SOURCE}</script>`;
