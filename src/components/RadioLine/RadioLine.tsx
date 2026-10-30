import type { ReactNode } from "react";
import { cn } from "../../lib/cn.ts";
import "./RadioLine.css";

/** Dòng giọng "Trạm trưởng" (COMPONENTS.md, RadioLine): viền cam bên trái, một nhãn nhỏ và một câu ngắn. */
export function RadioLine({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <aside className={cn("radio-line", className)}>
      <p className="radio-line__label text-label-m">{label}</p>
      <p className="radio-line__text text-body-m">{children}</p>
    </aside>
  );
}
