// Địa chỉ hình game. Khóa hình (imageKey, emblemKey...) đã là đường dẫn tương đối của hình WebP.
import { IMAGE_SIZES } from "../content/image-sizes.ts";

export const GAME_ASSET_BASE = "/assets/game/";

export function assetUrl(key: string): string {
  return `${GAME_ASSET_BASE}${key}`;
}

/** Kích thước gốc của hình (rộng, cao) để giữ chỗ và tránh nhảy bố cục. */
export function assetSize(key: string): readonly [number, number] | null {
  return IMAGE_SIZES[key] ?? null;
}
