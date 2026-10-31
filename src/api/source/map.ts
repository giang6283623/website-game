// Bộ chuyển đổi từ dữ liệu máy chủ game cũ sang hình dạng của hợp đồng /api/v1.
// Tách riêng khỏi phần gọi mạng để kiểm thử được bằng dữ liệu tĩnh.
// Quy tắc: máy chủ cũ chỉ có mã số và thông số, không có tên, không có mô tả, không có hình.
// Những trường đó để trống và giao diện tự quyết cách hiện (xem API-DATA-REAL.md mục 8).

import type { GameItem, GameItemCatalog, GameServerInfo } from "./game-source.ts";

/** Nhóm vật phẩm của hợp đồng mới. Máy chủ cũ không phân nhóm như vậy. */
export const GEAR_GROUP = "giap-va-ba-lo";
export const WEAPON_GROUP = "vu-khi";

export type MappedItem = {
  /** Mã vật phẩm trong game, giữ nguyên để đối chiếu. */
  gameItemId: string;
  group: typeof GEAR_GROUP | typeof WEAPON_GROUP;
  typeLabel: string;
  /** Một dòng thông số đọc được, dựng từ các trường thô. */
  statLine: string;
  stats: Array<{ label: string; value: string }>;
};

/** Nhãn tiếng Việt của các trường thô trong danh mục vật phẩm. */
const STAT_LABELS: Record<GameItem["kind"], Record<string, string>> = {
  gear: {
    lv: "CẤP YÊU CẦU",
    wg: "KHỐI LƯỢNG",
    dp: "ĐỘ BỀN",
    dm: "ĐỘ BỀN TỐI ĐA",
  },
  weapon: {
    lv: "CẤP YÊU CẦU",
    d1: "SÁT THƯƠNG",
    d2: "TẦM XA",
    rf: "TỐC ĐỘ BẮN",
    sp: "TỐC ĐỘ DI CHUYỂN",
    rc: "ĐỘ GIẬT",
  },
};

/** Thứ tự hiển thị cố định, để hai lần đọc cho cùng một kết quả. */
const STAT_ORDER: Record<GameItem["kind"], string[]> = {
  gear: ["lv", "wg", "dp", "dm"],
  weapon: ["lv", "d1", "d2", "rf", "sp", "rc"],
};

function oneItem(item: GameItem): MappedItem {
  const labels = STAT_LABELS[item.kind];
  const order = STAT_ORDER[item.kind];
  const known = order.flatMap((key) => {
    const value = item.stats[key];
    const label = labels[key];
    return value === undefined || label === undefined ? [] : [{ label, value }];
  });
  return {
    gameItemId: item.id,
    group: item.kind === "weapon" ? WEAPON_GROUP : GEAR_GROUP,
    typeLabel: item.kind === "weapon" ? "VŨ KHÍ" : "TRANG BỊ",
    statLine: known.map((stat) => `${stat.label} ${stat.value}`).join(" · "),
    stats: known,
  };
}

/** Đổi danh mục thô thành danh sách phẳng, sắp theo mã để kết quả ổn định. */
export function mapItemCatalog(catalog: GameItemCatalog): MappedItem[] {
  return [...catalog.weapons, ...catalog.gears]
    .map(oneItem)
    .sort((a, b) => a.gameItemId.localeCompare(b.gameItemId, "en", { numeric: true }));
}

export type MappedServerStatus = {
  online: boolean;
  playersOnline: number | null;
  updatedAt: string;
};

/**
 * Trạng thái máy chủ. Máy chủ cũ chỉ trả ONLINE hoặc OFFLINE, không có số người đang chơi.
 * `playersOnline` để null để giao diện ẩn cụm số thay vì hiện số sai (StatusStrip đã xử lý null).
 */
export function mapServerStatus(info: GameServerInfo, now = new Date()): MappedServerStatus {
  return {
    online: info.status === "ONLINE",
    playersOnline: null,
    updatedAt: now.toISOString(),
  };
}
