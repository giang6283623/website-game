import type { ClanRow, PlayerRow } from "../../api/schemas.ts";
import { assetUrl } from "../../lib/assets.ts";
import { cn } from "../../lib/cn.ts";
import { formatNumber, formatRank } from "../../lib/format.ts";
import "./RankTable.css";

export type RankRow = PlayerRow | ClanRow;

function isClan(row: RankRow): row is ClanRow {
  return "memberCount" in row;
}

/**
 * Bảng xếp hạng người chơi hoặc gia tộc. Là bảng thật (th có scope). Hạng 1 đến 3 có nền nổi và số hạng cam.
 * Điện thoại chỉ giữ một cột số: GameDollar, hoặc XP khi `board` là "xp". Cột còn lại ẩn bằng CSS.
 * Tiêu đề cột ẩn thu về không kích thước nhưng vẫn có trong cây truy cập.
 */
export function RankTable({
  rows,
  caption,
  nameLabel = "Người chơi",
  membersLabel,
  board = "gamedollar",
  highlight,
  variant = "list",
  className,
}: {
  rows: readonly RankRow[];
  caption: string;
  /** Tiêu đề cột tên: "Người chơi" hoặc "Gia tộc". */
  nameLabel?: string;
  /** Dòng nhỏ dưới tên gia tộc, ví dụ "48 thành viên". Bắt buộc khi bảng có dòng gia tộc. */
  membersLabel?: (count: number) => string;
  board?: "gamedollar" | "xp";
  /** Tên của dòng "của tôi" cần đánh dấu. */
  highlight?: string | null;
  /** "page": bảng của trang Xếp hạng (hàng tiêu đề thấp hơn ở điện thoại). "me": dòng ghim "của tôi", không có tiêu đề cột nhìn thấy, không có vạch dưới. */
  variant?: "list" | "page" | "me";
  className?: string;
}) {
  const pinned = variant === "me";
  return (
    <table
      className={cn(
        "rank-table",
        pinned && "rank-table--me",
        variant === "page" && "rank-table--page",
        className,
      )}
      data-board={board === "xp" ? "xp" : undefined}
    >
      <caption className="visually-hidden">{caption}</caption>
      <thead>
        <tr className="text-label-m">
          <th scope="col" className="rank-table__rank rank-table__sr">
            Hạng
          </th>
          <th scope="col" className="rank-table__badge rank-table__sr">
            <span className="visually-hidden">Huy hiệu</span>
          </th>
          <th scope="col" className="rank-table__player rank-table__sr">
            {nameLabel}
          </th>
          <th scope="col" className="rank-table__num rank-table__gd">
            GameDollar
          </th>
          <th scope="col" className="rank-table__num rank-table__xp">
            XP
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const clan = isClan(row);
          const name = clan ? row.clanName : row.playerName;
          const sub = clan ? (membersLabel ? membersLabel(row.memberCount) : null) : row.clanName;
          return (
            <tr
              key={`${row.rank}-${name}`}
              className={cn(!pinned && row.rank <= 3 && "is-top", name === highlight && "is-me")}
            >
              <td className="rank-table__rank text-data-l">{formatRank(row.rank)}</td>
              <td className="rank-table__badge">
                {row.emblemKey ? (
                  <img src={assetUrl(row.emblemKey)} alt="" width="36" height="36" loading="lazy" />
                ) : null}
              </td>
              <td className="rank-table__player">
                <span className="rank-table__name text-body-m-strong">{name}</span>
                {sub ? <span className="rank-table__clan text-body-s">{sub}</span> : null}
              </td>
              <td className="rank-table__num rank-table__gd text-data-m">
                {formatNumber(row.gameDollar)}
              </td>
              <td className="rank-table__num rank-table__xp text-data-m">{formatNumber(row.xp)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
