// Tìm tệp trong out/ theo đường dẫn, cùng quy tắc với máy chủ web tĩnh thật:
// tệp có thật thì trả tệp, thư mục thì trả index.html, trang của ứng dụng chưa dựng sẵn trả 200.html, còn lại 404.html.
import { existsSync, statSync } from "node:fs";
import { extname, join, normalize, sep } from "node:path";
import { matchRoute, NOT_FOUND_ROUTE } from "../../src/routes.ts";

export type StaticFile = { file: string; status: number };

function realFile(root: string, pathname: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const target = normalize(join(root, decoded));
  // Không cho thoát khỏi out/ (đường dẫn có ..)
  if (target !== root && !target.startsWith(root + sep)) return null;
  if (!existsSync(target)) return null;
  const stat = statSync(target);
  if (stat.isFile()) return target;
  const index = join(target, "index.html");
  return stat.isDirectory() && existsSync(index) ? index : null;
}

export function findStatic(root: string, pathname: string): StaticFile {
  const file = realFile(root, pathname);
  if (file) return { file, status: 200 };
  // Có đuôi tệp mà không thấy tệp thì là 404 thật (hình, phông, script).
  if (extname(pathname) === "" && matchRoute(pathname) !== NOT_FOUND_ROUTE) {
    return { file: join(root, "200.html"), status: 200 };
  }
  return { file: join(root, "404.html"), status: 404 };
}
