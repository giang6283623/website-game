// Chuyển design-values.json thành theme.css. Hàm thuần, không đọc tệp, để kiểm thử được.

type SemanticColor = { hex: string };

type TypographyStyle = {
  family: string;
  weight: number;
  size: number;
  lineHeight: number;
  letterSpacing: number;
  case: "upper" | "none";
};

export type DesignValues = {
  color: { semantic: Record<string, SemanticColor> };
  space: Record<string, number | { gutter: number; sectionY: number }>;
  radius: Record<string, number | string>;
  border: Record<string, number | string>;
  size: Record<string, number | Record<string, number>>;
  layout: Record<string, number | Record<string, number>>;
  font: {
    families: Record<string, { name: string; fallback: string }>;
  };
  typography: {
    styles: Record<string, TypographyStyle>;
    wordmarkSmall: { family: string; weight: number; size: number };
  };
  motion: {
    durations: Record<string, number>;
    easing: Record<string, string>;
  };
  zIndex: Record<string, number | string>;
  breakpoints: {
    desktop: { displayXlSize: string };
  };
};

const kebab = (key: string): string => key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

const rem = (px: number): string => `${Number((px / 16).toFixed(4))}rem`;

const encodeSvg = (svg: string): string =>
  `url("data:image/svg+xml,${svg.replace(/#/g, "%23").replace(/"/g, "'").replace(/</g, "%3C").replace(/>/g, "%3E")}")`;

/** Họa tiết "Thước" 40x14 và "Lưới chữ thập" 96x96, màu lấy từ token (ASSET-MAP mục 3). */
function patterns(values: DesignValues): { ruler: string; cross: string } {
  const muted = values.color.semantic["text-muted"]?.hex ?? "#a29e8e";
  const faint = values.color.semantic["text-disabled"]?.hex ?? "#6f6c60";
  const ruler =
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="14" viewBox="0 0 40 14">` +
    `<rect x="8" y="8" width="1" height="6" fill="${faint}"/><rect x="16" y="8" width="1" height="6" fill="${faint}"/>` +
    `<rect x="24" y="8" width="1" height="6" fill="${faint}"/><rect x="32" y="8" width="1" height="6" fill="${faint}"/>` +
    `<rect x="0" y="0" width="1" height="14" fill="${muted}"/></svg>`;
  const cross =
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">` +
    `<rect x="42" y="47" width="12" height="2" fill="${muted}" fill-opacity="0.22"/>` +
    `<rect x="47" y="42" width="2" height="12" fill="${muted}" fill-opacity="0.22"/>` +
    `<rect x="46" y="46" width="4" height="4" fill="${muted}" fill-opacity="0.39"/></svg>`;
  return { ruler: encodeSvg(ruler), cross: encodeSvg(cross) };
}

const isNumber = (value: unknown): value is number => typeof value === "number";

/** Cỡ chữ theo rem để chữ phóng to được (DESIGN-SPEC mục 9). Khoảng cách và kích thước giữ px. */
export function buildThemeCss(values: DesignValues): string {
  const lines: string[] = [];
  const decl = (name: string, value: string | number) => lines.push(`  ${name}: ${value};`);

  lines.push(
    "/* Tệp tự sinh bằng scripts/gen-theme.ts từ design-values.json. Không sửa tay. */",
    ":root {",
  );

  lines.push("  /* Màu ngữ nghĩa */");
  for (const [key, color] of Object.entries(values.color.semantic)) {
    decl(`--color-${key}`, color.hex);
  }

  lines.push("  /* Khoảng cách */");
  for (const [key, value] of Object.entries(values.space)) {
    if (isNumber(value) && /^\d+$/.test(key)) decl(`--space-${key}`, `${value}px`);
  }
  const extra = values.space.extraMobile;
  if (extra && typeof extra === "object") {
    decl("--space-gutter-mobile", `${extra.gutter}px`);
    decl("--space-section-y-mobile", `${extra.sectionY}px`);
  }

  lines.push("  /* Bo góc và viền */");
  for (const [key, value] of Object.entries(values.radius)) {
    if (isNumber(value)) decl(`--radius-${kebab(key)}`, `${value}px`);
  }
  for (const [key, value] of Object.entries(values.border)) {
    if (isNumber(value)) decl(`--border-${kebab(key)}`, `${value}px`);
  }

  lines.push("  /* Kích thước cố định */");
  for (const [key, value] of Object.entries(values.size)) {
    if (isNumber(value)) {
      decl(`--size-${kebab(key)}`, `${value}px`);
    } else {
      for (const [sub, subValue] of Object.entries(value)) {
        decl(`--size-${kebab(key)}-${kebab(sub)}`, `${subValue}px`);
      }
    }
  }

  lines.push("  /* Bố cục */");
  for (const [key, value] of Object.entries(values.layout)) {
    if (isNumber(value)) {
      decl(`--layout-${kebab(key)}`, `${value}px`);
    } else {
      for (const [sub, subValue] of Object.entries(value)) {
        decl(`--layout-${kebab(key)}-${kebab(sub)}`, `${subValue}px`);
      }
    }
  }

  lines.push("  /* Họ chữ */");
  for (const [key, family] of Object.entries(values.font.families)) {
    decl(`--font-${key}`, `"${family.name}", ${family.fallback}`);
  }

  lines.push("  /* Kiểu chữ */");
  for (const [key, style] of Object.entries(values.typography.styles)) {
    decl(`--text-${key}-size`, rem(style.size));
    decl(`--text-${key}-line`, rem(style.lineHeight));
    decl(`--text-${key}-spacing`, `${style.letterSpacing}em`);
  }
  decl("--text-wordmark-s-size", rem(values.typography.wordmarkSmall.size));

  lines.push("  /* Chuyển động */");
  for (const [key, ms] of Object.entries(values.motion.durations)) {
    decl(`--motion-${kebab(key)}`, `${ms}ms`);
  }
  for (const [key, easing] of Object.entries(values.motion.easing)) {
    decl(`--ease-${kebab(key)}`, easing);
  }

  lines.push("  /* Lớp xếp chồng */");
  for (const [key, value] of Object.entries(values.zIndex)) {
    if (isNumber(value)) decl(`--z-${kebab(key)}`, value);
  }

  lines.push("  /* Trỏ chuột. Bản có ảnh được art.css ghi đè (scripts/lib/art-map.ts). */");
  decl("--cursor-default", "auto");
  decl("--cursor-pointer", "pointer");

  const pattern = patterns(values);
  lines.push("  /* Họa tiết */");
  decl("--pattern-ruler", pattern.ruler);
  decl("--pattern-cross", pattern.cross);

  lines.push("}", "");

  lines.push(
    "/* Display/XL co theo màn hình ở dải 1200 đến 1439 (DESIGN-SPEC mục 5.2) */",
    "@media (min-width: 1200px) and (max-width: 1439px) {",
    "  :root {",
    `    --text-display-xl-size: ${values.breakpoints.desktop.displayXlSize};`,
    "  }",
    "}",
    "",
  );

  lines.push("/* Lớp tiện ích kiểu chữ (tên theo Figma) */");
  for (const [key, style] of Object.entries(values.typography.styles)) {
    lines.push(
      `.text-${key} {`,
      `  font-family: var(--font-${style.family});`,
      `  font-weight: ${style.weight};`,
      `  font-size: var(--text-${key}-size);`,
      `  line-height: var(--text-${key}-line);`,
      `  letter-spacing: var(--text-${key}-spacing);`,
    );
    if (style.case === "upper") lines.push("  text-transform: uppercase;");
    if (style.family === "data") lines.push("  font-variant-numeric: tabular-nums;");
    lines.push("}", "");
  }

  lines.push(
    ".text-wordmark-s {",
    "  font-family: var(--font-display);",
    `  font-weight: ${values.typography.wordmarkSmall.weight};`,
    "  font-size: var(--text-wordmark-s-size);",
    "  line-height: 1;",
    "  letter-spacing: 0.02em;",
    "  text-transform: uppercase;",
    "}",
    "",
  );

  return lines.join("\n");
}
