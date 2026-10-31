import { type CSSProperties, useState } from "react";
import "./DialNeedle.css";

/** `index`: trạm của trang hiện tại, -1 khi trang không thuộc trạm nào. `station`: trạm kim đang đứng. */
export type DialMove = {
  index: number;
  station: number;
  hop: number;
  dir: 1 | -1;
  seq: number;
};

/** Lúc nối vào trang kim đứng yên: `hop` là 0 nên HTML dựng sẵn khớp và không có hoạt ảnh nào chạy. */
export function firstDialMove(index: number): DialMove {
  return { index, station: Math.max(index, 0), hop: 0, dir: 1, seq: 0 };
}

/** Trang `nav: null` chỉ giấu kim tại chỗ, nên quay lại một trạm kim vẫn trượt từ chỗ cũ. */
export function nextDialMove(move: DialMove, index: number): DialMove {
  if (index === move.index) return move;
  if (index < 0) return { ...move, index };
  const hop = Math.abs(index - move.station);
  if (hop === 0) return { ...move, index, hop };
  const dir = index > move.station ? 1 : -1;
  return { index, station: index, hop, dir, seq: move.seq + 1 };
}

/** Giữ trạm trước đó để biết quãng nhảy và chiều đi. Đổi state ngay lúc dựng để số trạm và `data-hop` đổi cùng một lần vẽ. */
export function useDialMove(index: number): DialMove {
  const [move, setMove] = useState(() => firstDialMove(index));
  if (move.index === index) return move;
  const next = nextDialMove(move, index);
  setMove(next);
  return next;
}

export function dialRootProps(move: DialMove) {
  const style = { "--dial-index": move.station, "--dial-dir": move.dir } as CSSProperties;
  return { "data-hop": move.hop, style };
}

/**
 * Kim có khối lượng, gồm các lớp để hoạt ảnh không đè nhau: ray dời theo trạm bằng `transition` trên luồng tổng hợp,
 * lớp hút nghiêng về trạm đang rê, kim lắc như con lắc, trong cùng là thân kim rung rà sóng. Đổi `key` chỉ chạy lại con lắc, ray vẫn trượt tiếp.
 * Không dùng vòng requestAnimationFrame: lúc đổi trang luồng chính bận tải chunk nên kim sẽ giật.
 */
export function DialNeedle({ move }: { move: DialMove }) {
  return (
    <span className="dial-track" aria-hidden="true" data-parked={move.index < 0 ? "" : undefined}>
      <span className="dial-magnet">
        <span key={move.seq} className="dial-needle">
          <span className="dial-needle__trail" />
          <span className="dial-needle__bar" />
        </span>
      </span>
    </span>
  );
}
