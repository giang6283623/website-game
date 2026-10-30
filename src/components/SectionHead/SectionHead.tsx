import type { ReactNode } from "react";
import { cn } from "../../lib/cn.ts";
import { Overline } from "../Overline/Overline.tsx";
import "./SectionHead.css";

/** Đầu một khối trang: nhãn nhỏ, tiêu đề mục (H2 kiểu Heading/H1), đoạn dẫn, và nút phụ ở bên phải (máy tính). */
export function SectionHead({
  overline,
  title,
  lead,
  action,
  id,
  className,
}: {
  overline?: string;
  title: string;
  lead?: ReactNode;
  action?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("section-head", className)}>
      <div className="section-head__text">
        {overline ? <Overline>{overline}</Overline> : null}
        <h2 id={id} className="section-head__title text-heading-h1">
          {title}
        </h2>
        {lead ? <p className="section-head__lead text-body-m">{lead}</p> : null}
      </div>
      {action ? <div className="section-head__action">{action}</div> : null}
    </div>
  );
}
