// Khai báo kiểu cho tệp CSS nạp bằng import (Bun gom CSS khi build).
declare module "*.css";

// Thư viện cắt tập con phông chữ (chỉ dùng trong scripts/build-fonts.ts) không kèm kiểu.
declare module "subset-font" {
  export default function subsetFont(
    font: Uint8Array | Buffer,
    text: string,
    options?: { targetFormat?: "sfnt" | "woff" | "woff2"; preserveNameIds?: number[] },
  ): Promise<Buffer>;
}
