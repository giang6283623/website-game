import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Bỏ chú thích, vì chú thích có nhắc tới chữ `transform` và `animation`. */
const css = readFileSync(resolve(import.meta.dir, "../src/styles/motion.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

/** Gỡ mọi khối `{...}` bắt đầu bằng đoạn khớp `start` (khớp ngoặc nhọn lồng nhau). */
function stripBlocks(source: string, start: RegExp): string {
  const pattern = new RegExp(start.source, "g");
  let result = source;
  for (;;) {
    pattern.lastIndex = 0;
    const match = pattern.exec(result);
    if (!match) return result;
    const open = result.indexOf("{", match.index);
    let depth = 0;
    let end = open;
    for (; end < result.length; end += 1) {
      if (result[end] === "{") depth += 1;
      if (result[end] === "}") {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    result = result.slice(0, match.index) + result.slice(end + 1);
  }
}

/** Nội dung của khối `@keyframes <tên>`. */
function keyframes(name: string): string {
  const start = css.indexOf(`@keyframes ${name}`);
  if (start < 0) throw new Error(`không có @keyframes ${name}`);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let end = open; end < css.length; end += 1) {
    if (css[end] === "{") depth += 1;
    if (css[end] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(open, end + 1);
    }
  }
  throw new Error(`@keyframes ${name} không đóng`);
}

describe("motion.css giữ luật giảm chuyển động", () => {
  const withoutMotion = stripBlocks(
    stripBlocks(
      stripBlocks(css, /@media \(prefers-reduced-motion: no-preference\)/),
      /@media \(hover: hover\) and \(prefers-reduced-motion: no-preference\)/,
    ),
    /@keyframes [a-z-]+/,
  );

  test("ngoài khối no-preference và @keyframes không có animation, transition, transform hay trạng thái ẩn", () => {
    expect(withoutMotion).not.toMatch(/animation/);
    expect(withoutMotion).not.toMatch(/transition/);
    expect(withoutMotion).not.toMatch(/transform/);
    expect(withoutMotion).not.toMatch(/\b(translate|rotate|scale):/);
    expect(withoutMotion).not.toMatch(/data-lock/);
  });

  test("tệp có đủ khối no-preference để phép gỡ ở trên có nghĩa", () => {
    expect(css).toContain('[data-lock="pending"]');
    expect(css).toContain("animation: signal-tear");
    expect(withoutMotion.length).toBeLessThan(css.length / 2);
  });
});

describe("motion.css giữ giới hạn nháy sáng (không quá 3 lần mỗi giây)", () => {
  // Mỗi cú đổi sáng mạnh là một mốc lệch theo --glitch-tear hoặc kéo giãn scaleX. Một chu kỳ có đúng 1 giây nhiễu.
  const strongPunches = (name: string) =>
    (keyframes(name).match(/var\(--tear-\d\)\)\) scaleX|scaleX\(1\.03\)/g) ?? []).length;

  test("mỗi giây nhiễu có tối đa 3 cú mạnh, nhiễu nhẹ cũng vậy", () => {
    expect(strongPunches("signal-tear")).toBeLessThanOrEqual(3);
    expect(strongPunches("signal-tear-soft")).toBeLessThanOrEqual(3);
  });

  test("giật màu đi cùng ba cú xé, không thêm lần đổi sáng", () => {
    for (const name of ["signal-tear-blood", "signal-tear-blood-soft"]) {
      expect(keyframes(name).match(/var\(--blood-\d, 0\)/g)).toHaveLength(3);
    }
    expect(keyframes("signal-tear-ghost").match(/opacity: 0\.(85|95);/g)).toHaveLength(3);
  });

  test("đỏ của giật màu chưa phải đỏ bão hòa theo WCAG 2.3.1, tỉ lệ dưới 0,8", () => {
    const theme = readFileSync(resolve(import.meta.dir, "../src/styles/theme.css"), "utf8");
    const hex = /--color-text-danger: #([0-9a-f]{6});/.exec(theme)?.[1] ?? "";
    const channel = (at: number) => {
      const value = Number.parseInt(hex.slice(at, at + 2), 16) / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    expect(channel(0) / (channel(0) + channel(2) + channel(4))).toBeLessThan(0.8);
  });

  test("nhiễu chạy 1 nhịp trong chu kỳ 2 nhịp, tiêu đề trang 1 nhịp trong chu kỳ 4 nhịp", () => {
    expect(keyframes("signal-tear-gate")).toMatch(/50% \{\s*opacity: 0;/);
    expect(keyframes("signal-tear-gate-soft")).toMatch(/25% \{\s*opacity: 0;/);
    expect(css).toMatch(/signal-tear-gate calc\(var\(--signal-beat\) \* 2\) steps\(1, end\)/);
    expect(css).toMatch(/signal-tear-gate-soft calc\(var\(--signal-beat\) \* 4\) steps\(1, end\)/);
  });

  test("cú xé trôi mượt, chỉ việc bật tắt lát mới dùng steps", () => {
    expect(css).toMatch(/signal-tear calc\(var\(--signal-beat\) \* 2\) var\(--tear-ease\)/);
    expect(css).toMatch(/signal-tear-soft calc\(var\(--signal-beat\) \* 4\) var\(--tear-ease\)/);
    expect(keyframes("signal-tear")).not.toContain("opacity");
  });

  test("các lát lệch nhau vài mili giây nên cú xé chạy như sóng", () => {
    const lags = [...css.matchAll(/--slice-lag: (\d+)ms;/g)].map((match) => Number(match[1]));
    expect(lags).toHaveLength(5);
    expect(new Set(lags).size).toBe(5);
    expect(Math.max(...lags)).toBeLessThanOrEqual(32);
  });
});

describe("motion.css giữ nhịp tiếp sức", () => {
  test("nhịp đặt một chỗ, quét băng 4 nhịp và bắt đầu trong giây nghỉ của nhiễu", () => {
    expect(css.match(/--signal-beat: [^;]+;/g)).toEqual(["--signal-beat: 1s;"]);
    expect(css).toMatch(
      /animation: signal-sweep calc\(var\(--signal-beat\) \* 4\) linear 1\.2s infinite/,
    );
  });

  test("không còn bản sao nhiễu cũ", () => {
    expect(css).not.toContain("signal-glitch");
    expect(css).not.toContain(".glitch::");
  });

  test("@keyframes chỉ đổi opacity và các thuộc tính transform, không đổi clip-path", () => {
    for (const match of css.matchAll(/@keyframes ([a-z-]+)/g)) {
      const body = keyframes(match[1] as string);
      const props = [...body.matchAll(/^\s*([a-z-]+):/gm)].map((prop) => prop[1]);
      for (const prop of props)
        expect(["opacity", "transform", "translate", "rotate", "scale"]).toContain(prop as string);
    }
  });
});

describe("lát nhiễu", () => {
  test("lát ẩn mặc định, chỉ hiện trong khối no-preference và khi chưa tắt hiệu ứng", () => {
    expect(css).toMatch(/\.glitch-text__slice \{[^}]*display: none;/);
    expect(css).toMatch(
      /html:not\(\[data-motion="off"\]\) \.glitch-text__slice \{[^}]*display: block;/,
    );
  });

  test("bóng màu ẩn mặc định, nằm sau lưng chữ và chỉ hiện trong khối no-preference", () => {
    expect(css).toMatch(/^\.glitch-text__ghost \{[^}]*display: none;/m);
    expect(css).toMatch(
      /html:not\(\[data-motion="off"\]\) \.glitch-text__ghost \{[^}]*display: block;/,
    );
  });

  test("lát trên và lát dưới cùng dùng inset âm để giữ dấu tiếng Việt", () => {
    expect(css).toMatch(/^\.glitch-text__slice--1 \{[^}]*--slice-clip: inset\(-30%/m);
    expect(css).toMatch(/^\.glitch-text__slice--5 \{[^}]*--slice-clip: inset\(\d+% -?\d+% -30%/m);
  });

  test("khối ra khỏi màn hình thì dừng vòng lặp, tắt hiệu ứng thì dừng mọi hoạt ảnh", () => {
    expect(css).toMatch(/\[data-offscreen\] \*::after \{[^}]*animation-play-state: paused;/);
    expect(css).toMatch(/html\[data-motion="off"\] \*[^{]*\{[^}]*animation: none !important;/);
  });
});
