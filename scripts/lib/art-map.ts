// Bảng ảnh trang trí: tệp nguồn (nằm ngoài git), tệp web, kích thước đích và trần dung lượng.
// `copy` chép nguyên tệp WebP đã đúng cỡ. `webp` và `jpg` đổi định dạng và đổi cỡ.
export type ArtEntry = {
  source: string;
  web: string;
  width: number;
  height: number;
  mode: "copy" | "webp" | "jpg";
  quality?: number;
  /** Trần dung lượng (KB). Ảnh Hero được 150, ảnh khác 100. */
  maxKb: number;
};

const copy = (name: string, width: number, height: number, maxKb = 100): ArtEntry => ({
  source: name,
  web: name,
  width,
  height,
  mode: "copy",
  maxKb,
});

const webp = (
  source: string,
  web: string,
  width: number,
  height: number,
  quality: number,
  maxKb = 100,
): ArtEntry => ({ source, web, width, height, mode: "webp", quality, maxKb });

/** Ảnh trỏ chuột: PNG 32 x 32 nằm ở thư mục hình game, chép nguyên tệp nên không đi cùng bảng ảnh WebP. */
export const CURSOR_ART = { source: "ui-images/CURSOR.png", web: "cursor.png", maxKb: 4 };

/** `01-bg-home-hero-desktop.webp` thành `--art-bg-home-hero-desktop`. */
export function artVarName(web: string): string {
  return `--art-${web.replace(/^\d+-/, "").replace(/\.[a-z]+$/, "")}`;
}

/** Nội dung art.css: mỗi ảnh WebP là một biến CSS. Tệp này không đi qua bộ dựng nên thiếu ảnh không làm hỏng build. */
export function buildArtCss(files: readonly string[]): string {
  const lines = files
    .filter((file) => file.endsWith(".webp"))
    .map((file) => `  ${artVarName(file)}: url("/assets/art/${file}");`);
  // `--art-frost` và `--art-blur` chỉ có khi có ảnh: thiếu tệp thì thẻ kính mờ giữ đúng màu đặc cũ.
  lines.push("  --art-frost: 60%;", "  --art-blur: 5px;");
  const url = `url("/assets/art/${CURSOR_ART.web}") 1 1`;
  // art.css nạp trước global.css nên `:root` sẽ thua token mặc định của theme.css, vì vậy dùng `html:root`.
  const cursor = files.includes(CURSOR_ART.web)
    ? `html:root {\n  --cursor-default: ${url}, auto;\n  --cursor-pointer: ${url}, pointer;\n}\n`
    : "";
  return `/* Sinh bởi bun run build:art. Không sửa tay, không commit. */\n:root {\n${lines.join("\n")}\n}\n${cursor}`;
}

export const ART_MAP: ArtEntry[] = [
  copy("01-bg-home-hero-desktop.webp", 1920, 960, 150),
  copy("02-bg-home-hero-mobile.webp", 780, 1386, 150),
  copy("03-bg-pagetitle-generic.webp", 2400, 480),
  copy("04-bg-pagetitle-news.webp", 2400, 480),
  webp("05-bg-pagetitle-items.png", "05-bg-pagetitle-items.webp", 2400, 480, 76),
  webp("bg-pagetitle-ranking.png", "06-bg-pagetitle-ranking.webp", 2400, 480, 76),
  webp("07-bg-auth-visual.png", "07-bg-auth-visual.webp", 1024, 1536, 76, 150),
  webp("09-bg-download-card.png", "09-bg-download-card.webp", 1600, 727, 76),
  copy("10-hands-band-wide.webp", 2400, 480),
  copy("11-hands-cta-desktop.webp", 2400, 600),
  webp("12-hands-cta-mobile.png", "12-hands-cta-mobile.webp", 780, 1040, 76),
  webp("13-hands-404.png", "13-hands-404.webp", 1536, 1024, 76, 150),
  copy("14-hands-500-cracked.webp", 1920, 1280, 150),
  webp("15-hands-overlay-black.png", "15-hands-overlay-black.webp", 1600, 800, 72),
  webp("16-cover-news.png", "16-cover-news.webp", 1280, 720, 80),
  copy("17-cover-guide.webp", 1280, 720),
  copy("18-cover-event.webp", 1280, 720),
  copy("19-cover-update.webp", 1280, 720),
  copy("20-cover-default.webp", 1280, 720),
  // Ba họa tiết lặp chỉ hiện nhạt, nên thu nhỏ và nén mạnh để rẻ dung lượng.
  webp("21-tex-frosted-glass-tile.webp", "21-tex-frosted-glass-tile.webp", 256, 256, 55),
  webp("22-tex-concrete-tile.webp", "22-tex-concrete-tile.webp", 384, 384, 40),
  webp("23-tex-rust-steel-tile.png", "23-tex-rust-steel-tile.webp", 384, 384, 50),
  webp("24-divider-smear.png", "24-divider-smear.webp", 2400, 160, 76),
  copy("25-decor-barbed-wire.webp", 2400, 160),
  copy("26-decor-chainlink-fog.webp", 1536, 1024),
  webp("27-decor-flare-glow.png", "27-decor-flare-glow.webp", 512, 512, 85),
  {
    source: "28-og-share.png",
    web: "28-og-share.jpg",
    width: 1200,
    height: 630,
    mode: "jpg",
    quality: 82,
    maxKb: 250,
  },
  webp("bg-500-general.png", "29-bg-500-general.webp", 1672, 941, 68, 150),
];
