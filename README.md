# ISSVN: website Infestation Việt Nam

Website tĩnh cho máy chủ game sinh tồn Infestation Việt Nam. Người chơi xem tin tức, kho đồ và bảng xếp hạng. Họ cũng tải game và đọc quy tắc cộng đồng. Có khu đăng nhập, hồ sơ người chơi và khu quản trị.

Website hiện chạy bằng dữ liệu mẫu (API giả). Chưa có máy chủ API thật.

## Lưu ý về hình ảnh và tài sản của game

Mã nguồn dùng giấy phép MIT (xem `LICENSE`). Giấy phép này chỉ áp dụng cho mã và tài liệu do dự án tự viết.

Một số hình ảnh vật phẩm và tài sản của game chỉ mang tính tham khảo. Chúng thuộc về bên thứ ba. Dự án không sở hữu chúng và không cấp quyền dùng chúng.

- Kho này không chứa các hình đó. Thư mục `public/assets/game/` nằm ngoài git. Có một ngoại lệ: `public/favicon.webp` là một hình lấy từ game, dùng làm biểu tượng tab. Hình này cũng thuộc về bên thứ ba và chịu cùng lời cảnh báo ở trên.
- Tên, mã và chỉ số vật phẩm trong `docs/design-handoff/sample-data.json` lấy từ dữ liệu của game. Chúng cũng thuộc về bên thứ ba.
- Tên game, nhãn hiệu và logo thuộc về chủ sở hữu của chúng. Dự án không tuyên bố liên kết hay được bảo trợ bởi chủ sở hữu game gốc.
- Hãy cân nhắc kỹ trước khi dùng lại hoặc phát hành các hình và tài sản này. Bạn cần tự xin phép chủ sở hữu.
- Nếu bạn là chủ sở hữu và muốn gỡ một nội dung, hãy mở một issue trên kho này.

## Trạng thái

Đã có:

- Giao diện các trang công khai, đăng nhập, hồ sơ và khu quản trị, chạy bằng dữ liệu mẫu.
- Bản dựng tĩnh, có HTML dựng sẵn cho các trang công khai.
- Kiểm thử tự động bằng `bun test`.

Chưa có:

- Máy chủ API thật.
- Link Discord và YouTube (đang là `#`) và địa chỉ tải bộ cài game.
- Tên miền chính thức.
- Hình game. Khi chạy từ bản clone, mọi hình trong `public/assets/game/` bị thiếu. Chúng nằm ở trang chủ, tin tức, kho đồ, xếp hạng, tải game, đăng nhập và đăng ký. Mã ẩn các hình hỏng, nên ô hình chỉ hiện khung nền. Tên, nhãn loại và chỉ số vẫn hiện như khi có hình.
- Ảnh trang trí. Khi chạy từ bản clone, thư mục `public/assets/art/` bị thiếu vì ảnh nằm ngoài git. Trang vẫn dựng được và giữ thiết kế phẳng, không lỗi và không lệch bố cục.

## Cần có

- Bun. Đã thử với 1.4.4.
- Lệnh `trash`. Lệnh dựng dùng nó để dọn thư mục `out/` cũ.
  - macOS 14 trở lên: có sẵn.
  - Linux: `sudo apt install trash-cli`.
  - Máy có Node.js: `npm install --global trash-cli`.

## Chạy thử

```sh
bun install
bun run build
bun run serve
```

Mở http://127.0.0.1:4173/ trong trình duyệt.

## Chạy thử có lưu dữ liệu

Lệnh này dựng website rồi bật máy chủ giả trên máy bạn. Dữ liệu lưu thành tệp JSON trong `.mock-data/`, nên tải lại trang hay tắt máy chủ vẫn còn.

```sh
bun run mock
```

Mở địa chỉ mà lệnh in ra.

| Vai | Email | Mật khẩu |
| --- | --- | --- |
| Người chơi | `nguoisongsot@email.com` | `matkhau123` |
| Quản trị | `admin@email.com` | `matkhau123` |

Đây là mật khẩu mẫu công khai, không phải bí mật thật.

Cảnh báo: máy chủ giả chỉ dùng trên máy của bạn. Không đưa lên mạng và không lưu dữ liệu thật vào đó.

Sau lệnh này, `out/` là bản dành cho máy chủ giả. Muốn dùng lại `bun run serve` thì chạy lại `bun run build`.

## Triển khai và nối API thật

| Tài liệu | Dành cho | Nội dung |
| --- | --- | --- |
| [Dựng và triển khai lên Ubuntu](docs/guides/DEPLOY-UBUNTU.md) | Người đưa website lên máy chủ | Dựng bản tĩnh, chép lên máy chủ, cấu hình nginx, HTTPS, quay lại bản cũ. |
| [Nối API thật thay API giả](docs/guides/REAL-API.md) | Người làm API và người sửa giao diện | Các bước đổi `API_MODE`, hợp đồng API, xác thực và các lưu ý. |

Hai tài liệu này là mẫu minh họa. Tên miền và đường dẫn trong đó chỉ là ví dụ.

## Lệnh

| Lệnh | Việc làm |
| --- | --- |
| `bun run build` | Dựng website vào `out/` bằng `.env.development`. |
| `bun run serve` | Máy chủ thử cho `out/`, cổng 4173. |
| `bun run build:prod` | Dựng bản phát hành bằng `.env.production`. |
| `bun run serve:prod` | Máy chủ thử cho bản phát hành, cổng 4174. |
| `bun run mock` | Dựng website rồi bật máy chủ giả, cổng 4175. |
| `bun run mock:reset` | Đưa dữ liệu máy chủ giả về ban đầu, có câu xác nhận. Tắt máy chủ giả trước khi chạy. |
| `bun run typecheck` | Kiểm tra kiểu TypeScript. |
| `bun run lint` | Kiểm tra định dạng và lỗi bằng Biome. |
| `bun run test` | Chạy kiểm thử. |
| `bun run validate` | Chạy kiểm tra kiểu, Biome, kiểm thử và dựng, theo thứ tự. |
| `bun run measure` | Đo JavaScript tải đầu của `out/`. Ngân sách là 165 KB nén. |
| `bun run gen-theme` | Sinh `src/styles/theme.css` từ `docs/design-handoff/design-values.json`. |
| `bun run build:fonts` | Tạo phông woff2 trong `public/assets/fonts/`. |
| `bun run build:images` | Chuyển hình game sang WebP. Cần thư mục hình nguồn mà kho này không có (đặt bằng biến `GAME_ASSETS_DIR`) và lệnh `cwebp`. |
| `bun run build:art` | Dựng ảnh trang trí (nền, họa tiết) vào `public/assets/art/` từ thư mục ảnh nguồn `art-src` (đặt bằng biến `ART_ASSETS_DIR`). Cần lệnh `cwebp` và `magick`. Thiếu ảnh thì trang giữ thiết kế phẳng. |

## Cấu hình

Hai tệp `.env.development` và `.env.production` nằm trong kho. Giá trị được nhúng vào gói JavaScript lúc dựng. Vì vậy không đặt khóa bí mật ở đó. Muốn ghi đè trên máy của bạn, dùng tệp `.env.local`.

| Biến | Ý nghĩa |
| --- | --- |
| `API_MODE` | `mock` dùng dữ liệu mẫu trong `docs/design-handoff/sample-data.json`. `mock-server` gọi `/api/v1` trên máy chủ giả. `real` gọi `/api/v1` trên máy chủ thật. |
| `SITE_URL` | Địa chỉ công khai của site, dạng `https://ten-mien.com`. Dùng cho `canonical`, `og:url` và `sitemap.xml`. |
| `PORT` | Cổng của máy chủ thử. Chỉ ảnh hưởng lệnh `serve`. |

Khi `API_MODE` là `mock` hoặc `mock-server`, bản dựng chặn công cụ tìm kiếm: `robots.txt` chỉ có `Disallow: /`, mọi trang có thẻ `noindex, nofollow`, và không có `sitemap.xml`.

## Cấu trúc thư mục

| Thư mục | Nội dung |
| --- | --- |
| `src/` | Mã giao diện (React). Có `pages/`, `components/`, `content/` (chữ trên giao diện) và `api/` (có `mock/` là API giả). |
| `scripts/` | Dựng website, máy chủ thử, đo dung lượng, xử lý phông và hình. |
| `tests/` | Kiểm thử. |
| `docs/` | Mô tả sản phẩm, đặc tả thiết kế, hợp đồng API (`docs/design-handoff/ROUTES-AND-DATA.md`) và hướng dẫn triển khai (`docs/guides/`). |
| `public/` | Tệp tĩnh: phông chữ và biểu tượng. |

## Các trang

| Đường dẫn | Trang |
| --- | --- |
| `/` | Trang chủ |
| `/tin-tuc`, `/tin-tuc/:slug` | Tin tức và bài viết |
| `/kho-do`, `/kho-do/:slug` | Kho đồ và chi tiết vật phẩm |
| `/xep-hang` | Bảng xếp hạng |
| `/tai-game` | Tải game |
| `/quy-tac` | Quy tắc cộng đồng |
| `/dang-nhap`, `/dang-ky`, `/quen-mat-khau`, `/dat-lai-mat-khau` | Tài khoản |
| `/ho-so`, `/ho-so/doi-mat-khau` | Hồ sơ người chơi |
| `/quan-tri/*` | Khu quản trị: bài viết, vật phẩm, banner, người dùng, nhật ký |

## Giấy phép

- Mã nguồn và tài liệu của dự án: MIT, xem `LICENSE`.
- Phông chữ: SIL Open Font License 1.1, xem `public/assets/fonts/LICENSE.txt`.
- Thư viện: mỗi gói trong `package.json` có giấy phép riêng.
- Hình ảnh và tài sản của game: xem mục "Lưu ý về hình ảnh và tài sản của game" ở trên.
