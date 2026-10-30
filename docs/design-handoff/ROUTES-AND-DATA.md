# Đường dẫn, dữ liệu và hợp đồng API

Tệp này nói website cần những đường dẫn nào, lưu và trả những dữ liệu nào, và vì sao chưa thể code hết ngay. Giao diện dùng Bun, React, TypeScript, Zod và Axios và build thành tệp tĩnh (chủ dự án đã chọn ngày 29/10/2026, xem `IMPLEMENTATION-PLAN.md` mục 2). Phần máy chủ API chưa chọn (D-12), nên hợp đồng API ở đây không phụ thuộc công nghệ máy chủ. Mọi tên trường, đường dẫn API và quy tắc ở đây là **đề xuất** để hai bên (giao diện và máy chủ) cùng làm theo. Chỗ nào cần chủ dự án quyết thì ghi mã D-xx ở mục 12.

Dữ liệu mẫu để thử nằm trong `sample-data.json`. Câu chữ nằm trong `CONTENT-COPY.md`. Từng trang nằm trong `PAGES.md`.

## 1. Tóm tắt dành cho người không code

- Website có 3 nhóm trang: công khai (ai cũng xem), dành cho người chơi (cần đăng nhập) và quản trị (chỉ quản trị viên).
- Tin tức, hướng dẫn và trang tải game phải xem được **không cần đăng nhập**. Đây là lỗi lớn nhất của site cũ.
- Phần khó nhất không phải giao diện mà là dữ liệu thật: tài khoản, nhân vật và xếp hạng nằm trong máy chủ game. Chưa quyết dùng nguồn nào thì chưa làm được các trang này (D-01, D-02).
- Site cũ không có API JSON. Mọi thứ phải làm mới.
- Website là ứng dụng tĩnh. Các trang công khai được dựng sẵn thành tệp HTML lúc build để công cụ tìm kiếm và trình chia sẻ đọc được. Dữ liệu động (danh sách tin, kho đồ, xếp hạng, hồ sơ, quản trị) được trình duyệt tải bằng Axios từ API. Vì thế mọi trang động phải có đủ trạng thái đang tải, rỗng và lỗi (`CONTENT-COPY.md` mục 7).

## 2. Bản đồ đường dẫn

Cột "Thiết kế" cho biết trạng thái: **Có** là đã dựng trong Figma (mã khung ở cột Figma, chi tiết trong `PAGES.md`). **Không cần** là trang dùng lại thiết kế khác hoặc chỉ chuyển hướng.

| Đường dẫn | Trang | Truy cập | Figma MT / ĐT | Thiết kế |
| --- | --- | --- | --- | --- |
| `/` | Trang chủ | Công khai | `24:2` / `39:2` | Có |
| `/tin-tuc` | Danh sách tin | Công khai | `30:224` / `65:110` | Có |
| `/tin-tuc/:slug` | Chi tiết bài viết | Công khai | `109:1198` / `109:1679` | Có |
| `/kho-do` | Kho đồ | Công khai | `32:365` / `41:46` | Có |
| `/kho-do/:slug` | Chi tiết vật phẩm | Công khai | `110:1278` / `110:1814` | Có |
| `/xep-hang` | Xếp hạng (`bang` = `gamedollar`, `xp`, `gia-toc`) | Công khai | `34:571` / `66:393`. Bảng gia tộc: `116:2736` / `117:2636` | Có |
| `/tai-game` | Tải game và hướng dẫn (mốc `#huong-dan` tới ba bước cài, mốc `#ho-tro` tới mục hỗ trợ) | Công khai | `107:1097` / `108:310` | Có |
| `/quy-tac` | Quy tắc cộng đồng | Công khai | `116:1623` / `116:2550` | Có |
| `/dang-nhap` | Đăng nhập | Khách | `36:808` / `67:190` | Có |
| `/dang-ky` | Đăng ký | Khách | `36:869` / `67:234` | Có |
| `/quen-mat-khau` | Quên mật khẩu | Khách | `113:1398` / `113:1941`. Trạng thái sau khi gửi: bảng `114:1436` / `114:1940` | Có |
| `/dat-lai-mat-khau` | Đặt lại mật khẩu (kèm mã `?ma=`) | Khách có mã | `113:1480` / `113:2003`. Mã hết hạn: bảng `114:1436` / `114:1940` | Có |
| `/ho-so` | Hồ sơ | Đã đăng nhập | `37:856` / `68:294` | Có |
| `/ho-so/doi-mat-khau` | Đổi mật khẩu | Đã đăng nhập | `115:1455` / `115:2215` | Có |
| `/ho-so/nhan-vat/moi` | Tạo nhân vật. Đã bỏ khỏi bản code (A-23), không có trong tuyến | Đã đăng nhập | `115:1603` / `115:2271` | Có (không dùng) |
| `/quan-tri` | Chuyển tới `/quan-tri/bai-viet` | Quản trị viên | Không | Không cần |
| `/quan-tri/bai-viet` | Danh sách bài (quản trị) | Quản trị viên | `118:2045` / `119:2856` | Có |
| `/quan-tri/bai-viet/moi` | Soạn bài mới | Quản trị viên | `38:954` / `71:279` | Có |
| `/quan-tri/bai-viet/:id` | Sửa bài | Quản trị viên | Dùng lại biểu mẫu soạn | Không cần |
| `/quan-tri/vat-pham` | Danh sách vật phẩm (quản trị) | Quản trị viên | `118:2186` / `119:2937` | Có. Có nút THÊM VẬT PHẨM và cột SỬA (cột SỬA chưa có bản vẽ danh sách) |
| `/quan-tri/vat-pham/moi` | Thêm vật phẩm | Quản trị viên | `156:2723` / `160:1145` | Có (G-23) |
| `/quan-tri/vat-pham/:id` | Sửa vật phẩm | Quản trị viên | `156:2378` / `160:915` | Có (G-23). Đường dẫn bị khóa khi sửa |
| `/quan-tri/banner` | Banner | Quản trị viên | `118:2356` / `119:3056` | Có (gồm khung sửa) |
| `/quan-tri/nguoi-dung` | Người dùng | Quản trị viên | `118:2462` / `119:3131` | Có. Tên người dùng là liên kết sang trang chi tiết |
| `/quan-tri/nguoi-dung/:id` | Chi tiết người dùng | Quản trị viên | `171:2870` / `172:1027` | Có (G-23). Chỉ chạy trên API giả: hệ thống cũ không có API quản trị (C-64) |
| `/quan-tri/nhat-ky` | Nhật ký | Quản trị viên | `118:2607` / `119:3215` | Có |
| Trang 404 (đường dẫn không có) và 403 (không có quyền) | Lỗi | Mọi người | 404: `116:1760` / `116:2516`. 403: trạng thái 6 trong bảng `114:1436` / `114:1940` | Có |
| Trang 500 (máy chủ lỗi) | Lỗi | Mọi người | `116:1836` / `116:2533` | Có |
| Trang ngoại tuyến | Lỗi mạng | Mọi người | Không | Bỏ qua ở bản đầu (không phải PWA) |

Tên đường dẫn là tiếng Việt không dấu, chữ thường, nối bằng gạch ngang. Mã `:slug` do hệ thống tạo từ tiêu đề (bỏ dấu, chữ thường, thay dấu cách bằng gạch ngang, tối đa 100 ký tự, không trùng).

## 3. Tham số truy vấn

| Tham số | Dùng ở | Giá trị | Mặc định |
| --- | --- | --- | --- |
| `loai` | `/tin-tuc` | `tin-tuc`, `huong-dan`, `su-kien`, `cap-nhat` | Không có (tất cả) |
| `loai` | `/kho-do` | `vu-khi`, `giap-va-ba-lo`, `y-te-va-do-an`, `dung-cu`, `vat-lieu`, `thuoc-no`, `dan`, `nhan-vat`, `cong-thuc` | Không có (tất cả) |
| `q` | `/kho-do`, `/xep-hang` | Chữ tìm. Tối thiểu 2 ký tự (xếp hạng). Không phân biệt hoa thường và dấu | Rỗng |
| `sap-xep` | `/kho-do` | `moi-nhat`, `ten-a-z` | `moi-nhat` |
| `trang` | `/tin-tuc`, `/kho-do`, `/xep-hang` | Số nguyên từ 1 | 1 |
| `chon` | `/kho-do` | `slug` của vật phẩm đang xem (trong khối chi tiết MT) | Vật phẩm đầu của trang |
| `bang` | `/xep-hang` | `gamedollar`, `xp`, `gia-toc` | `gamedollar` |
| `tiep` | `/dang-nhap`, `/dang-ky` | Đường dẫn nội bộ để quay lại sau khi vào. Chỉ nhận đường dẫn bắt đầu bằng `/` và không bắt đầu bằng `//` | `/ho-so` |
| `ma` | `/dat-lai-mat-khau` | Mã một lần trong thư | Bắt buộc |

Quy tắc chung: tham số lạ thì bỏ qua. Giá trị sai thì dùng mặc định. `trang` vượt quá tổng số trang thì chuyển về trang cuối (302). Địa chỉ chuẩn (canonical) của trang có bộ lọc trỏ về chính nó, trang `?trang=1` trỏ về địa chỉ không có tham số.

## 4. Quyền truy cập và chuyển hướng

| Tình huống | Hành vi |
| --- | --- |
| Khách vào trang cần đăng nhập (`/ho-so`, `/ho-so/...`) | Chuyển tới `/dang-nhap?tiep=<đường dẫn>` (302) |
| Người đã đăng nhập vào `/dang-nhap`, `/dang-ky`, `/quen-mat-khau` | Chuyển tới `/ho-so` (302) |
| Khách vào `/quan-tri/...` | Chuyển tới `/dang-nhap?tiep=...` |
| Người chơi (không phải quản trị) vào `/quan-tri/...` | Trang 403: nhãn "KHÔNG ĐƯỢC PHÉP VÀO", tiêu đề "TRANG NÀY CHỈ DÀNH CHO QUẢN TRỊ VIÊN", nút "VỀ TRANG CHỦ" (trạng thái 6 của bảng xác thực, `CONTENT-COPY.md` mục 10.5). Không chuyển hướng ngầm |
| Mã đặt lại mật khẩu sai hoặc hết hạn | Hiện trạng thái "LIÊN KẾT KHÔNG DÙNG ĐƯỢC" với nút "GỬI LẠI LIÊN KẾT" (trạng thái 2 của bảng xác thực) |
| Đăng nhập sai | Một thông báo chung "EMAIL HOẶC MẬT KHẨU CHƯA ĐÚNG" (trạng thái 4). Không nói email có tồn tại hay không |
| Đăng nhập sai quá nhiều lần | Hiện "TẠM KHÓA ĐĂNG NHẬP" (trạng thái 5), API trả 429 kèm `Retry-After` |
| Đăng xuất | Hủy phiên ở máy chủ, xóa cookie, chuyển về `/` |
| Chỉ ứng dụng tĩnh | Cổng chặn trên trình duyệt (router) chỉ để điều hướng cho người dùng. Quyền thật luôn do API kiểm: mọi đường `/me` và `/admin` trả 401 hoặc 403 khi thiếu quyền, và giao diện phải xử lý hai mã này như bảng trên |
| Đường dẫn không có | Trang 404 |

Trang công khai (`/`, `/tin-tuc`, `/kho-do`, `/xep-hang`, `/tai-game`, `/quy-tac`) tuyệt đối không bắt đăng nhập.

## 5. SEO và chia sẻ

| Đường dẫn | Tiêu đề trang | Cho công cụ tìm kiếm lập chỉ mục |
| --- | --- | --- |
| `/` | Infestation Việt Nam \| Máy chủ sinh tồn tiếng Việt | Có |
| `/tin-tuc` | Tin tức \| Infestation Việt Nam | Có |
| `/tin-tuc/:slug` | `<Tiêu đề bài>` \| Infestation Việt Nam | Có |
| `/kho-do`, `/kho-do/:slug` | Kho đồ \| Infestation Việt Nam, `<Tên vật phẩm>` \| Kho đồ Infestation | Có |
| `/xep-hang` | Xếp hạng \| Infestation Việt Nam | Có (trang không có `q`) |
| `/tai-game`, `/quy-tac` | Tải game \| Infestation Việt Nam, Quy tắc cộng đồng \| Infestation Việt Nam | Có |
| `/dang-nhap`, `/dang-ky`, `/quen-mat-khau`, `/dat-lai-mat-khau`, `/ho-so/*`, `/quan-tri/*` | `<Tên trang>` \| Infestation Việt Nam | Không (`noindex`) |
| Trang 404, 403 và 500 | `Không tìm thấy trang \| Infestation Việt Nam` và các tiêu đề tương tự | Không (`noindex`) |

Cách dựng để SEO chạy được trên ứng dụng tĩnh (đề xuất D-13):

- Mọi trang công khai (`/`, `/tin-tuc`, `/kho-do`, `/xep-hang`, `/tai-game`, `/quy-tac`) được dựng sẵn thành HTML lúc build. Tiêu đề, mô tả, địa chỉ chuẩn và thẻ chia sẻ nằm trong HTML dựng sẵn.
- Trang chi tiết bài viết và vật phẩm cần dựng sẵn lại mỗi khi có bài hoặc vật phẩm mới. Cách nối với API làm sau khi chọn máy chủ (D-12).
- Danh sách động (tin tức, kho đồ, xếp hạng) hiện khung đang tải rồi lấy dữ liệu bằng Axios. Số liệu xếp hạng không cần công cụ tìm kiếm đọc.
- Trang riêng tư (đăng nhập, hồ sơ, quản trị) gắn `noindex`, không dựng sẵn nội dung cá nhân.
- Đường dẫn không có trong bảng trả trang 404. Máy chủ web tĩnh phải trả đúng mã 404 cho các đường này (tệp `404.html`).

Quy tắc:

- Mỗi trang có một `<h1>`, một mô tả (`<meta name="description">`, 120 đến 160 ký tự), địa chỉ chuẩn và thẻ chia sẻ (Open Graph: tiêu đề, mô tả, hình 1200 x 630).
- Bài viết dùng dữ liệu có cấu trúc `Article` (tiêu đề, ngày đăng, tác giả, hình).
- Có `sitemap.xml` (trang công khai, bài viết, vật phẩm) và `robots.txt` (cho phép trang công khai, chặn `/quan-tri/` và `/api/`). Địa chỉ trang có `q` hoặc `trang` lớn hơn 1 gắn `noindex, follow`. Bản dựng với `API_MODE=mock` (dữ liệu mẫu) chặn lập chỉ mục: `robots.txt` chỉ có `Disallow: /`, mọi trang gắn `noindex, nofollow`, và không có `sitemap.xml`, `canonical`, `og:url`. Các thẻ trên chỉ hiện khi `API_MODE=real` (C-91).
- Thuộc tính `lang="vi"` trên thẻ `html`. Mục tiêu hiệu năng xem `DESIGN-SPEC.md`, mục 10.

## 6. Chuyển hướng từ site cũ (chỉ cần nếu giữ tên miền cũ, D-08)

| Địa chỉ cũ | Địa chỉ mới | Ghi chú |
| --- | --- | --- |
| `/announcement` | `/tin-tuc` | 301 |
| `/announcement/view/<slug>-<id>` | `/tin-tuc` | 301. Nội dung bài cũ không chuyển sang (phạm vi PRD) |
| `/announcement/download` | `/tai-game` | 301 |
| `/ranking?b=gd&q=<tên>` | `/xep-hang?bang=gamedollar&q=<tên>` | 301. Giá trị `b` khác `gd`: về `/xep-hang` |
| `/ide/login`, `/ide/login?required` | `/dang-nhap` | 301 |
| `/ide/register` | `/dang-ky` | 301 |
| `/ide/forgotpass` | `/quen-mat-khau` | 301 |
| `/ide/language`, `/ide/login/en` | `/` | 301. Bỏ công tắc ngôn ngữ ở bản đầu |

## 7. Thực thể dữ liệu

Kiểu dữ liệu ghi theo nghĩa chung (chuỗi, số nguyên, thời điểm). Chọn kiểu cụ thể khi biết cơ sở dữ liệu. Cột "Nguồn" nói dữ liệu đến từ đâu: **Site** là website tự lưu, **Game** là phải lấy từ máy chủ game (chưa có đường lấy, D-02).

### 7.1 Account (tài khoản)

| Trường | Kiểu | Quy tắc | Nguồn |
| --- | --- | --- | --- |
| `id` | Mã duy nhất | Không đổi | Site hoặc Game (D-01) |
| `email` | Chuỗi, tối đa 254 | Duy nhất, lưu chữ thường, kiểm tra dạng | D-01 |
| `displayName` | Chuỗi 3 đến 16 | Duy nhất không phân biệt hoa thường. Chỉ chữ không dấu và số (giả định A-11) | D-01 |
| `passwordHash` | Chuỗi | Không bao giờ trả ra API. Thuật toán: xem mục 11 và D-01 | D-01 |
| `status` | `pending`, `active`, `banned` | Hiển thị "Đã kích hoạt" ở Hồ sơ khi `active`. Ở quản trị Người dùng: `active` là "HOẠT ĐỘNG", `banned` là "BỊ KHÓA" (A-27) | D-01 |
| `role` | `player`, `admin` | Mặc định `player` | Site |
| `createdAt` | Thời điểm | Hiển thị "NGÀY THAM GIA" (12/03/2026) | D-01 |
| `lastLoginAt` | Thời điểm hoặc rỗng | Dùng cho nhật ký | Site |

### 7.2 Character (nhân vật), Skill và Clan

| Thực thể | Trường chính | Ghi chú |
| --- | --- | --- |
| Character | `id`, `accountId`, `name` (duy nhất), `level` (số nguyên), `profession` (chữ hoặc rỗng, A-12), `state` (`playing`, `idle`), `mainWeaponItemSlug`, `nightsSurvived` (số nguyên hoặc rỗng, A-13) | Nguồn Game |
| CharacterSkill | `characterId`, `skillKey`, `unlocked` (đúng hoặc sai) | Sáu kỹ năng trong thiết kế (A-14) |
| Clan | `id`, `name` (duy nhất), `emblemKey` (khóa hình huy hiệu), `memberCount` | Nguồn Game. Huy hiệu mẫu: `clans/clan-bandit.webp`, `clan-lawman`, `clan-survivor` |

### 7.3 RankingEntry (dòng xếp hạng)

| Trường | Kiểu | Quy tắc |
| --- | --- | --- |
| `board` | `gamedollar`, `xp`, `gia-toc` | Site cũ có nhiều bảng hơn (D-03) |
| `rank` | Số nguyên từ 1 | Hiển thị có số 0 đầu khi nhỏ hơn 10 (01, 02). Thiết kế chịu được tới 99.999 |
| `playerName` | Chuỗi | Duy nhất trong một bảng |
| `clanName` | Chuỗi hoặc rỗng | Dòng hiển thị dưới tên người chơi |
| `gameDollar` | Số nguyên lớn không âm | Hiển thị có dấu chấm ngăn nghìn |
| `xp` | Số nguyên không âm | Hiển thị có dấu chấm ngăn nghìn |
| `takenAt` | Thời điểm | Lúc chụp bảng. Khuyến nghị làm bảng chụp (snapshot) cập nhật mỗi vài phút, không tính trực tiếp mỗi lượt xem |

Bảng `gia-toc`: mỗi dòng là một gia tộc, gồm `rank`, `clanName`, `emblemKey`, `memberCount`, `gameDollar` và `xp`. Bảng này không có `playerName`. Dòng "GIA TỘC CỦA TÔI" lấy từ gia tộc của tài khoản đang đăng nhập. Dữ liệu mẫu: trường `clans` trong `sample-data.json` (mười hai dòng đã sắp theo hạng, có `rank`, `memberCount`, `gameDollar`, `xp`) và trường `clanRanking` (tổng 86 gia tộc, gia tộc của tôi). API giả đổi `name` thành `clanName` khi trả dòng của bảng `gia-toc`.

Dòng "Me" (vị trí của tôi) không phải một bản ghi riêng. Máy chủ tìm dòng của tài khoản đang đăng nhập trong cùng bảng và trả thêm trường `me` (hạng, tên, gia tộc, hai chỉ số).

### 7.4 NewsPost (bài viết)

| Trường | Kiểu | Quy tắc |
| --- | --- | --- |
| `id` | Mã duy nhất | |
| `slug` | Chuỗi | Duy nhất, tạo từ tiêu đề, tối đa 100 |
| `title` | Chuỗi | 1 đến 80 ký tự (khớp gợi ý "Tối đa 80 ký tự") |
| `category` | `tin-tuc`, `huong-dan`, `su-kien`, `cap-nhat` | Bắt buộc |
| `excerpt` | Chuỗi thuần | Tối đa 200 ký tự. Rỗng thì lấy 160 ký tự đầu của nội dung |
| `bodyHtml` | HTML đã làm sạch | Chỉ giữ thẻ cho phép (mục 11) |
| `coverImageKey` | Chuỗi hoặc rỗng | Ảnh đại diện. Rỗng thì dùng hình mặc định |
| `status` | `draft`, `published` | Hiển thị "BẢN NHÁP" khi `draft` |
| `pinned` | Đúng hoặc sai | "GHIM LÊN ĐẦU". Chỉ một bài ghim làm bài nổi bật |
| `notifyInGame` | Đúng hoặc sai | "THÔNG BÁO TRONG GAME". Chỉ lưu cờ ở bản đầu (D-10) |
| `publishedAt` | Thời điểm hoặc rỗng | "NGÀY ĐĂNG". Rỗng khi còn nháp |
| `authorName` | Chuỗi | Mặc định "Ban quản trị" |
| `authorAccountId` | Mã duy nhất | Người bấm đăng |
| `createdAt`, `updatedAt` | Thời điểm | Cột NGÀY của danh sách quản trị lấy `publishedAt`, nếu rỗng (bản nháp) thì lấy `createdAt` |

### 7.5 Item (vật phẩm)

| Trường | Kiểu | Quy tắc |
| --- | --- | --- |
| `id`, `slug` | Mã, chuỗi | `slug` duy nhất, ví dụ `ak-74` |
| `name` | Chuỗi | Tên tiếng Việt hoặc tên gốc (A-16). Hiển thị chữ hoa |
| `group` | `vu-khi`, `giap-va-ba-lo`, `y-te-va-do-an`, `dung-cu`, `vat-lieu`, `thuoc-no`, `dan`, `nhan-vat`, `cong-thuc` | Chín nhóm. Số lượng mẫu 66, 34, 26, 9, 1, 5, 0, 22, 4 (167 món hiện). Nhóm không có món nào thì không hiện ở cột loại (C-75) |
| `typeLabel` | Chuỗi | Nhãn loại nhỏ, ví dụ "SÚNG TRƯỜNG" |
| `statLine` | Chuỗi | Dòng chỉ số trên thẻ, ví dụ "Sát thương 32 · Tầm xa 120". Nhập tay hoặc sinh từ `stats` |
| `stats` | Danh sách {nhãn, giá trị} | Bộ trường theo nhóm, xem bảng dưới |
| `description` | Chuỗi thuần | Mô tả ngắn cho khối chi tiết |
| `imageKey` | Chuỗi | Khóa hình, ví dụ `items/asr-ak74.webp`. Danh sách đầy đủ trong `ASSET-MAP.md`. Luôn có tiền tố thư mục (`items/...`). Rỗng khi chưa có hình: thẻ và khối chi tiết vẫn vẽ khung nền, tên và chỉ số, không vẽ thẻ `img` (C-74). Từ phiên 7, 154 trong 170 dòng mẫu có hình, 16 dòng còn rỗng (C-80) |
| `publishedAt` | Thời điểm | Dùng cho sắp xếp "MỚI NHẤT" |
| `featured` | Đúng hoặc sai | Cột "NỔI BẬT" ở quản trị Vật phẩm. Tối đa 4 vật phẩm cùng bật. Các vật phẩm này hiện ở khối "Vũ khí và đồ dùng" của Trang chủ (A-27) |
| `visible` | Đúng hoặc sai | Cột "HIỂN THỊ" ở quản trị. Tắt thì vật phẩm biến khỏi Kho đồ công khai và khỏi `sitemap.xml` |
| `gameItemId` | Chuỗi hoặc rỗng | Mã vật phẩm trong game, để đối chiếu về sau. 158 món nhập từ client game đã có mã thật (C-73, C-74) |

Bộ chỉ số theo nhóm (đề xuất, đối chiếu với dữ liệu game thật, A-15):

| Nhóm | Chỉ số (nhãn hiển thị) |
| --- | --- |
| Vũ khí bắn | SÁT THƯƠNG, TẦM XA (m), TỐC ĐỘ BẮN (phát/phút), BĂNG ĐẠN (viên) |
| Cận chiến | SÁT THƯƠNG, TỐC ĐỘ (Nhanh hoặc Chậm) |
| Ba lô, giáp | SỐ Ô (ba lô), GIÁP (áo giáp) |
| Y tế và đồ ăn | HỒI MÁU hoặc HỒI NĂNG LƯỢNG |
| Các nhóm còn lại | Mô tả ngắn, không bắt buộc chỉ số |

### 7.6 Các thực thể phụ

| Thực thể | Trường chính | Mục đích |
| --- | --- | --- |
| Session | `id` (ngẫu nhiên dài), `accountId`, `createdAt`, `expiresAt`, `ipHash`, `userAgentHash` | Phiên đăng nhập |
| PasswordResetToken | `id`, `accountId`, `tokenHash`, `expiresAt` (30 phút), `usedAt` | Quên mật khẩu. Chỉ lưu bản băm của mã |
| AuditLog (NHẬT KÝ) | `id`, `at`, `actorAccountId`, `action`, `targetType` (`news`, `item`, `banner`, `user`), `targetId`, `meta` | Ghi mọi hành động quản trị. Giá trị `action` mẫu: `news.publish` (ĐĂNG BÀI), `news.hide` (ẨN BÀI), `item.create` (THÊM VẬT PHẨM), `item.feature` (BẬT NỔI BẬT), `banner.update` (SỬA BANNER), `user.lock` (KHÓA NGƯỜI DÙNG), `auth.login` (ĐĂNG NHẬP) |
| ServerStatus | `online`, `playersOnline`, `updatedAt` | Thanh trạng thái và số liệu nhanh. Làm mới 30 đến 60 giây |
| Banner | `id`, `message` (tối đa 120 ký tự), `linkUrl` (không bắt buộc), `startsAt`, `endsAt`, `enabled`, `createdAt` | Dải thông báo (A-24). Cột TRẠNG THÁI tính từ ngày: LÊN LỊCH (chưa tới `startsAt`), HẾT HẠN (qua `endsAt`), ĐANG HIỆN (trong khoảng ngày và `enabled` đúng). Khóa trong dữ liệu mẫu: `showing`, `scheduled`, `expired`. Banner chỉ lên trang công khai khi `enabled` đúng và đang trong khoảng ngày. Banner mẫu thứ hai ở trạng thái LÊN LỊCH với công tắc Tắt, nên tới ngày vẫn chưa hiện cho tới khi quản trị bật. Trạng thái "đã tắt trong khoảng ngày" chưa vẽ. Tại một thời điểm chỉ một banner được bật. Vị trí hiện trên trang công khai chưa vẽ (G-26) |
| DownloadInfo | `available`, `version`, `sizeLabel`, `releasedAt`, `installerUrl`, `requirements` (`os`, `memory`, `disk`, `network`) | Dữ liệu của khối tải ở `/tai-game` (A-21). Chỉ có một bản ghi. Nơi đặt bộ cài: D-04 |
| Nội dung tĩnh | Quy tắc cộng đồng, hỏi đáp tải game, ba bước cài đặt, bộ đồ khởi đầu | Nằm trong kho mã (tệp `content/`), người lập trình sửa. Không có màn hình quản trị cho các nội dung này ở bản đầu (A-23, A-25, A-26) |

## 8. Hợp đồng API đề xuất (`/api/v1`)

Mọi đường dẫn tương đối với gốc website. Dữ liệu là JSON, mã hóa UTF-8. Tên trường dùng kiểu `camelCase`. Giao diện là ứng dụng tĩnh nên trình duyệt gọi các đường dẫn này bằng Axios (một phiên bản Axios dùng chung, `baseURL` là `/api/v1`, `withCredentials: true`). Cookie phiên chỉ hoạt động khi API cùng site với giao diện (cùng tên miền gốc), xem D-12 và D-13. Trong lúc chưa có API thật, giao diện dùng API giả đọc từ `sample-data.json`.

### 8.1 Công khai (không cần đăng nhập)

| Phương thức và đường dẫn | Tham số | Trả về |
| --- | --- | --- |
| `GET /api/v1/server/status` | Không | `{ "online": true, "playersOnline": 34, "updatedAt": "2026-10-28T09:00:00+07:00" }` |
| `GET /api/v1/news` | `loai`, `trang`, `limit` (mặc định 8, tối đa 20) | Danh sách bài và thông tin phân trang. Trang 1 không lọc có thêm `featured` |
| `GET /api/v1/news/{slug}` | Không | Một bài đầy đủ (kèm `bodyHtml`) hoặc 404 |
| `GET /api/v1/items` | `loai`, `q`, `sap-xep`, `trang`, `limit` (mặc định 12) | Danh sách vật phẩm, thông tin phân trang và `groups` (số lượng từng nhóm) |
| `GET /api/v1/items/{slug}` | Không | Một vật phẩm đầy đủ (kèm `stats`) hoặc 404 |
| `GET /api/v1/ranking` | `bang` (`gamedollar`, `xp`, `gia-toc`), `q`, `trang`, `limit` (mặc định 50, tối đa 100) | Danh sách dòng xếp hạng, tổng số người chơi (hoặc gia tộc) và `me` nếu đã đăng nhập |
| `GET /api/v1/download` | Không | Thông tin bộ cài (DownloadInfo): `{ "available": true, "version": "1.0.3", "sizeLabel": "1,2 GB", "releasedAt": "2026-10-28", "installerUrl": null, "requirements": { "os": "Windows 7 trở lên (64 bit)", "memory": "4 GB RAM", "disk": "3 GB trống", "network": "Cần kết nối internet" } }`. `installerUrl` rỗng khi chưa có bộ cài (D-04) |
| `GET /api/v1/banner` | Không | Banner đang hiện hoặc `{ "banner": null }`. Gửi `Cache-Control` ngắn (30 giây) |

Ví dụ trả về của `GET /api/v1/news?loai=su-kien&trang=1`:

```json
{
  "items": [
    {
      "slug": "cuoi-tuan-nhan-doi-kinh-nghiem",
      "title": "Cuối tuần nhân đôi kinh nghiệm",
      "category": "su-kien",
      "excerpt": "Hai ngày thứ Bảy và Chủ nhật, mọi người chơi nhận gấp đôi kinh nghiệm khi sống sót. Lập đội cùng bạn bè để đi xa hơn.",
      "coverImageKey": "items/exp-flare.webp",
      "publishedAt": "2026-10-30T08:00:00+07:00",
      "authorName": "Ban quản trị"
    },
    {
      "slug": "giai-dau-sinh-ton-thang-11-mo-dang-ky",
      "title": "Giải đấu sinh tồn tháng 11 mở đăng ký",
      "category": "su-kien",
      "excerpt": "Đăng ký đội 3 người để tham gia giải đấu cuối tháng.",
      "coverImageKey": null,
      "publishedAt": "2026-10-18T08:00:00+07:00",
      "authorName": "Ban quản trị"
    }
  ],
  "page": 1,
  "pageSize": 8,
  "total": 2,
  "totalPages": 1,
  "featured": null
}
```

Ví dụ trả về của `GET /api/v1/ranking?bang=gamedollar&q=tho`:

```json
{
  "board": "gamedollar",
  "totalPlayers": 12480,
  "rows": [
    { "rank": 1, "playerName": "ThoSanDem", "clanName": "Bão Đêm", "gameDollar": 2480150, "xp": 48210 }
  ],
  "page": 1,
  "pageSize": 50,
  "total": 1,
  "totalPages": 1,
  "me": { "rank": 128, "playerName": "NguoiSongSot", "clanName": "Sống Sót", "gameDollar": 312450, "xp": 9870 }
}
```

`me` là `null` khi khách chưa đăng nhập hoặc tài khoản chưa có nhân vật xếp hạng.

### 8.2 Tài khoản và đăng nhập

| Phương thức và đường dẫn | Nội dung gửi | Kết quả |
| --- | --- | --- |
| `POST /api/v1/auth/register` | `email`, `displayName`, `password`, `passwordConfirm` | 201 và cookie phiên. Lỗi 409 (email hoặc tên đã dùng), 422 (sai quy tắc) |
| `POST /api/v1/auth/login` | `email`, `password` | 200 và cookie phiên. Lỗi 401 (thông báo chung), 429 (quá nhiều lần) |
| `POST /api/v1/auth/logout` | Không | 204. Xóa phiên |
| `POST /api/v1/auth/forgot` | `email` | Luôn 202, dù email có hay không |
| `POST /api/v1/auth/reset` | `token`, `password`, `passwordConfirm` | 204. Lỗi 410 (mã hết hạn) |
| `POST /api/v1/account/password` | `currentPassword`, `newPassword`, `newPasswordConfirm` | 204. Lỗi 403 (mật khẩu hiện tại sai) |
| `GET /api/v1/me` | Không | Tài khoản, gia tộc, bốn chỉ số (HẠNG, GAMEDOLLAR, XP, CẤP). Email đã che |
| `GET /api/v1/me/characters` | Không | Nhân vật kèm vũ khí đang dùng, số đêm sống sót và kỹ năng |
| `POST /api/v1/me/characters` | `name` | Không làm (A-23 đã bỏ, nhân vật tạo trong game). Nếu làm lại: 201 và nhân vật mới, lỗi 409 (tên đã có), 422 (sai quy tắc hoặc đủ 5 nhân vật) |

### 8.3 Quản trị (cần vai trò `admin`)

| Phương thức và đường dẫn | Mục đích |
| --- | --- |
| `GET /api/v1/admin/news` | Danh sách bài, gồm cả nháp |
| `POST /api/v1/admin/news` | Tạo bài (nháp hoặc đăng ngay) |
| `GET`, `PUT`, `DELETE /api/v1/admin/news/{id}` | Xem, sửa, xóa bài |
| `POST /api/v1/admin/uploads` | Tải ảnh lên. Nhận JPG, PNG, WebP tối đa 5 MB. Trả `imageKey` |
| `GET /api/v1/admin/items` | Danh sách vật phẩm kèm `featured` và `visible` (bộ lọc `loai`, `q`, `trang`) |
| `GET /api/v1/admin/items/{id}` | Một vật phẩm, để nạp form sửa |
| `POST /api/v1/admin/items` | Thêm vật phẩm: `name`, `slug`, `group`, `typeLabel`, `stats`, `statLine`, `description`, `imageKey`, `gameItemId`, `featured`, `visible`. Lỗi 422 trả `fields` theo từng trường (`slug` trùng, `featured` quá 4) |
| `PATCH /api/v1/admin/items/{id}` | Nhận mọi trường của form (trừ `slug` và `hudKey`), gồm `featured` (tối đa 4, quá thì trả 422) và `visible` |
| `GET`, `POST /api/v1/admin/banners` | Danh sách banner và tạo banner |
| `PATCH`, `DELETE /api/v1/admin/banners/{id}` | Sửa, bật hoặc tắt (bật banner này thì máy chủ tắt banner đang bật), xóa banner |
| `GET /api/v1/admin/users` | Danh sách người dùng (bộ lọc `vai-tro`, `trang-thai`, `q`, `trang`). Email trả về đã che |
| `POST /api/v1/admin/users/{id}/lock`, `POST /api/v1/admin/users/{id}/unlock` | Khóa hoặc mở khóa tài khoản. Ghi vào AuditLog. Không tự khóa chính mình |
| `GET /api/v1/admin/audit` | Xem nhật ký (mục NHẬT KÝ). Chỉ đọc, bộ lọc `doi-tuong` (`news`, `item`, `banner`, `user`) và `trang` |

Ví dụ gửi lên `POST /api/v1/admin/news`:

```json
{
  "title": "Cuối tuần nhân đôi kinh nghiệm",
  "category": "su-kien",
  "bodyHtml": "<p>Hai ngày thứ Bảy và Chủ nhật, mọi người chơi nhận gấp đôi kinh nghiệm khi sống sót.</p>",
  "coverImageKey": null,
  "pinned": true,
  "notifyInGame": false,
  "status": "published"
}
```

### 8.4 Dạng lỗi, mã trạng thái và bộ nhớ đệm

Mọi lỗi dùng một dạng:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Kiểm tra lại các ô được đánh dấu.",
    "fields": { "displayName": "Tên không được có dấu hay dấu cách. Ví dụ: ThoSanDem" }
  }
}
```

| Mã | Khi nào | `error.code` |
| --- | --- | --- |
| 400 | Dữ liệu gửi lên hỏng | `bad_request` |
| 401 | Chưa đăng nhập hoặc sai thông tin đăng nhập | `unauthorized` |
| 403 | Không đủ quyền | `forbidden` |
| 404 | Không có bản ghi | `not_found` |
| 409 | Trùng email hoặc tên hiển thị | `conflict` |
| 410 | Mã đặt lại mật khẩu hết hạn | `gone` |
| 422 | Sai quy tắc dữ liệu | `validation_failed` |
| 429 | Quá nhiều lần thử. Có đầu `Retry-After` | `rate_limited` |
| 500 | Lỗi máy chủ. Không lộ chi tiết kỹ thuật | `server_error` |

Câu trong `message` và `fields` là câu tiếng Việt ở `CONTENT-COPY.md`, mục 6.

Bộ nhớ đệm: dữ liệu công khai gửi `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` (xếp hạng: `s-maxage=120`). Dữ liệu cá nhân (`/me`, `/admin`) gửi `Cache-Control: private, no-store`.

## 9. Quy tắc kiểm tra dữ liệu

Kiểm tra ở cả hai nơi. Phía người dùng cho nhanh, phía máy chủ là bắt buộc.

| Ô | Quy tắc | Thông báo (CONTENT-COPY mục 6) |
| --- | --- | --- |
| Email | Đúng dạng, tối đa 254, chưa dùng (khi đăng ký) | 6.1, 6.2 |
| Tên hiển thị | `^[A-Za-z0-9]{3,16}$`, chưa dùng, không phân biệt hoa thường (giả định A-11) | 6.2 |
| Mật khẩu | 8 đến 128 ký tự (giả định A-10). Không cắt khoảng trắng. Không bắt buộc ký tự đặc biệt | 6.2 |
| Nhập lại mật khẩu | Giống ô mật khẩu | 6.2 |
| Tìm người chơi | Tối thiểu 2 ký tự | 6.4 |
| Tiêu đề bài | 1 đến 80 ký tự | 6.5 |
| Phân loại bài | Một trong bốn loại | 6.5 |
| Nội dung bài | Không rỗng, tối đa khoảng 20.000 ký tự | 6.5 |
| Ảnh tải lên | JPG, PNG, WebP. Tối đa 5 MB. Kiểm tra nội dung tệp, không chỉ phần mở rộng | 6.5 |
| Mật khẩu hiện tại (đổi mật khẩu) | Không rỗng. Máy chủ kiểm đúng sai | 6.3 |
| Mật khẩu mới (đổi hoặc đặt lại) | Như ô mật khẩu ở trên. Không được trùng mật khẩu hiện tại (đề xuất) | 6.2, 6.3 |
| Tên nhân vật | `^[A-Za-z0-9]{3,16}$`, chưa dùng, không đổi sau khi tạo. Cần đã tích "Tôi đã đọc quy tắc cộng đồng". Tối đa 5 nhân vật (A-23, chỉ áp dụng nếu làm lại trang tạo nhân vật) | 6.2 |
| Nội dung banner | 1 đến 120 ký tự | CONTENT-COPY mục 10.11 |
| Liên kết banner | Không bắt buộc. Nếu có: đường dẫn nội bộ bắt đầu bằng `/` hoặc địa chỉ `https://`. Không nhận `javascript:` | Đề xuất |
| Ngày của banner | `endsAt` không sớm hơn `startsAt` | Đề xuất |
| Vật phẩm nổi bật | Tối đa 4 vật phẩm có `featured` bằng đúng | CONTENT-COPY mục 10.11 |

Cách dùng Zod ở giao diện (D-13): mỗi biểu mẫu có một lược đồ Zod riêng, thông báo lấy từ `CONTENT-COPY.md` mục 6. Mỗi phản hồi API được kiểm bằng lược đồ Zod trước khi vào giao diện. Phản hồi sai lược đồ được coi là lỗi máy chủ và hiện trạng thái Lỗi, không hiện dữ liệu hỏng. Trường `error.fields` của API được gắn vào đúng ô nhập.

## 10. Phân trang, sắp xếp và tìm kiếm

| Danh sách | Kích thước trang | Sắp xếp | Tìm kiếm |
| --- | --- | --- | --- |
| Tin tức | 8 bài (trang 1 không lọc: 1 nổi bật và 7 dòng) | Mới nhất trước | Không có ô tìm |
| Kho đồ | Bản vẽ có 9 thẻ (MT) và 8 thẻ (ĐT). Đề xuất một giá trị chung 12 cho mọi thiết bị (MT lưới 3 x 4, ĐT lưới 2 x 6) để liên kết chia sẻ không lệch | `moi-nhat`, `ten-a-z` | Khớp một phần tên, không phân biệt hoa thường và dấu |
| Xếp hạng | 50 dòng (như site cũ). Bản vẽ chỉ có 10 đến 12 dòng làm mẫu | Theo hạng của bảng đang chọn | Tên người chơi, tối thiểu 2 ký tự, khớp một phần |
| Quản trị bài viết | 20 dòng (đề xuất) | Mới sửa trước | Theo tiêu đề (đề xuất) |
| Quản trị vật phẩm | 20 dòng (đề xuất) | Mới thêm trước | Theo tên (đề xuất) |
| Quản trị người dùng | 20 dòng (đề xuất) | Mới tạo trước | Theo tên hiển thị hoặc email (đề xuất) |
| Quản trị nhật ký | 50 dòng (đề xuất) | Mới nhất trước, chỉ đọc | Không có ô tìm. Lọc theo đối tượng bằng chip |
| Quản trị banner | Không phân trang (ít banner) | Banner đang hiện lên đầu, rồi lên lịch, rồi hết hạn | Không có ô tìm |
| Xếp hạng gia tộc | 50 dòng | Theo hạng | Theo tên gia tộc, tối thiểu 2 ký tự |

Mọi danh sách có đủ ba trạng thái ngoài trạng thái có dữ liệu: rỗng, đang tải, lỗi (`CONTENT-COPY.md`, mục 7). Quá 8 giây chưa có dữ liệu thì chuyển sang trạng thái lỗi.

## 11. Bảo mật

| Chủ đề | Quy tắc |
| --- | --- |
| Phiên đăng nhập | Cookie `HttpOnly`, `Secure`, `SameSite=Lax`, tên có tiền tố `__Host-` khi API cùng tên miền với giao diện (D-12). Giao diện không bao giờ đọc hay lưu mã phiên trong `localStorage`. Mã phiên ngẫu nhiên dài. Hết hạn sau 14 ngày không dùng. Hủy phiên khi đăng xuất và khi đổi mật khẩu |
| CSRF | Mọi yêu cầu ghi (POST, PUT, PATCH, DELETE) kiểm tra nguồn gốc (`Origin`) và mã CSRF. Axios gắn mã CSRF vào đầu `X-CSRF-Token` cho mọi yêu cầu ghi. Không nhận ghi bằng GET |
| Ứng dụng tĩnh | Mọi tệp tĩnh và mã giao diện là công khai. Không đặt khóa, mật khẩu hay địa chỉ nội bộ vào mã giao diện hay vào biến môi trường được nhúng vào gói giao diện. Mọi quyết định quyền nằm ở API |
| Mật khẩu | Nếu website tự giữ mật khẩu: băm bằng argon2id (hoặc bcrypt chi phí 12 nếu bắt buộc). Nếu dùng chung tài khoản với game: dùng đúng cách băm của game (D-01) và nâng cấp dần khi người dùng đăng nhập |
| Giới hạn tốc độ | Đăng nhập: 5 lần mỗi 15 phút cho mỗi cặp địa chỉ IP và email. Đăng ký: 5 lần mỗi giờ cho mỗi IP. Quên mật khẩu: 3 lần mỗi giờ cho mỗi email và IP. Vượt giới hạn trả 429 |
| Không lộ thông tin | Đăng nhập sai: một thông báo chung. Quên mật khẩu: luôn trả cùng một câu. Email luôn hiển thị che ("n***@email.com": giữ ký tự đầu, thay phần còn lại của tên bằng ba dấu sao, giữ phần sau dấu @). Riêng đăng ký: báo "email đã có tài khoản" để người dùng biết cách xử lý (đánh đổi giữa dễ dùng và an toàn, có giới hạn tốc độ để giảm dò email) |
| Mã đặt lại mật khẩu | Dùng một lần. Hết hạn sau 30 phút. Chỉ lưu bản băm. Đổi mật khẩu thành công thì hủy mọi phiên khác |
| Nội dung bài viết | Làm sạch HTML ở máy chủ bằng danh sách cho phép: `p`, `h2`, `h3`, `ul`, `ol`, `li`, `a` (chỉ `href`, tự thêm `rel="noopener noreferrer"`), `img` (chỉ `src` nội bộ và `alt`), `strong`, `em`. Bỏ mọi thuộc tính sự kiện và kiểu nội tuyến |
| Tải ảnh | Kiểm tra nội dung tệp. Mã hóa lại ảnh, xóa dữ liệu EXIF. Đặt tên tệp ngẫu nhiên. Lưu ngoài thư mục chạy mã |
| Quyền quản trị | Chặn mặc định. Mỗi hành động quản trị kiểm tra vai trò ở máy chủ và ghi vào AuditLog |
| Tiêu đề bảo mật | `Content-Security-Policy` chặt (`default-src 'self'`, hình và phông chỉ từ gốc của site), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `frame-ancestors 'none'`. Chưa đặt tiêu đề `Content-Security-Policy` ở đâu. Đo bằng Chrome: `default-src 'self'` nguyên văn chặn nhiều phần của bản dựng hiện tại, nên phải mở rộng trước khi bật. Phần bị chặn gồm script nhúng ẩn hình hỏng (`scripts/lib/broken-image-script.ts`), hai script nhúng React tạo ở `/` và `/tai-game` (thiếu chúng thì React báo lỗi #419), thuộc tính `style` nội tuyến và hình `data:` trong CSS. Console của trình duyệt in đúng mã băm cần thêm cho từng script. Nếu chỉ thiếu mã băm của script ẩn hình hỏng, hình hỏng chỉ ẩn muộn hơn, sau khi gói JavaScript chạy |
| Bí mật và cấu hình | Khóa, mật khẩu cơ sở dữ liệu và khóa gửi thư nằm trong biến môi trường, không đưa vào mã nguồn hay nhật ký |
| Dữ liệu cá nhân | Chỉ lưu những gì cần: email, tên hiển thị, mật khẩu băm. Nhật ký không ghi mật khẩu và mã đặt lại |
| Quyền hình ảnh | Chủ dự án xác nhận quyền dùng hình lấy từ client game trước khi mở công khai (A-20, G-15) |

## 12. Nguồn dữ liệu và các quyết định chặn

Website cần dữ liệu từ máy chủ game. Có ba cách nối:

| Cách | Mô tả | Ưu điểm | Nhược điểm |
| --- | --- | --- | --- |
| A. Cơ sở dữ liệu của website, đồng bộ từ game | Website có cơ sở dữ liệu riêng. Một tác vụ định kỳ đọc (chỉ đọc) từ game và chép số liệu xếp hạng, vật phẩm sang | An toàn (website không đụng game). Nhanh. Dễ thử | Số liệu trễ vài phút. Cần quyền đọc từ game |
| B. Đọc trực tiếp cơ sở dữ liệu game (bản sao chỉ đọc) | Website truy vấn thẳng | Số liệu mới nhất | Ràng buộc chặt với cấu trúc của game. Nguy cơ làm chậm game nếu truy vấn nặng |
| C. Game cung cấp API | Máy chủ game có lớp API riêng cho website | Sạch nhất về lâu dài | Cần sửa phía game. Chưa biết có làm được không |

Khuyến nghị: cách A cho xếp hạng, vật phẩm và nhân vật. Tin tức và bài viết luôn nằm trong cơ sở dữ liệu của website.

Các quyết định đang chặn việc code:

| Mã | Câu hỏi | Chặn phần nào | Hậu quả nếu chưa quyết |
| --- | --- | --- | --- |
| D-01 | Tài khoản sống ở đâu, và game xác thực mật khẩu bằng cách băm nào? Website dùng chung tài khoản với game, hay có tài khoản riêng? | Đăng ký, Đăng nhập, Hồ sơ | Không làm được. Nếu tài khoản website tách rời game, người chơi sẽ phải có hai tài khoản |
| D-02 | Lấy xếp hạng, nhân vật, vật phẩm từ đâu (A, B hay C)? | Xếp hạng, Hồ sơ, Kho đồ thật | Chỉ làm được bằng dữ liệu nhập tay hoặc dữ liệu mẫu |
| D-03 | Hiện những bảng xếp hạng nào? Site cũ có 8 bảng, thiết kế chỉ có 3 tab (G-19) | Xếp hạng | Làm 3 tab theo thiết kế, thêm sau |
| D-04 | Bộ cài game: đặt ở đâu, dung lượng, phiên bản, cách tải (A-09) | Tải game | Trang `/tai-game` không có đích tải |
| D-05 | Người dùng điện thoại bấm "TẢI GAME" thì sao? Game chỉ chạy trên máy tính (G-03) | Trang chủ, Tải game | Dùng giải pháp trong PAGES.md mục 11.1 (cảnh báo và nút sao chép liên kết) |
| D-06 | Dịch vụ gửi email cho quên mật khẩu (SMTP hoặc dịch vụ gửi thư) | Quên mật khẩu | Chưa bật được chức năng này |
| D-07 | Quy tắc mật khẩu và tên hiển thị thật (A-10, A-11) | Đăng ký | Dùng giá trị đề xuất, sửa khi có thông tin |
| D-08 | Tên miền: dùng lại `infestation.vn` (tức thay site cũ) hay tên miền mới? Hạ tầng đặt ở đâu? | Chuyển hướng, triển khai | Chưa triển khai được. Mục 6 chỉ cần khi thay site cũ |
| D-09 | Quyền dùng hình lấy từ client game (A-20) | Mọi trang có hình | Rủi ro pháp lý khi mở công khai |
| D-10 | "THÔNG BÁO TRONG GAME" gửi bằng kênh nào? | Quản trị bài viết | Ẩn mục này hoặc chỉ lưu cờ |
| D-11 | Công nghệ dựng giao diện website | Mọi phần giao diện | Đã quyết ngày 29/10/2026: Bun, React, TypeScript, Zod, Axios, build tĩnh (`IMPLEMENTATION-PLAN.md` mục 2) |
| D-12 | Máy chủ API dùng công nghệ nào, đặt ở đâu, và có cùng site với giao diện không (cần cho cookie phiên)? | Mọi trang cần dữ liệu thật, đăng nhập, quản trị | Giao diện chạy với API giả đọc từ `sample-data.json`. Chưa có đăng nhập thật và dữ liệu thật |
| D-13 | Chi tiết kỹ thuật giao diện do trợ lý tự chọn tạm: bộ dựng của Bun, React 19, React Router (chế độ thư viện), dựng sẵn HTML cho trang công khai bằng `react-dom/server`, API giả bằng bộ chuyển đổi của Axios, Bun làm trình quản lý gói và chạy kiểm thử (`bun test`) | Khung dự án, SEO, kiểm thử | Làm theo mặc định này. Nếu bước thử E0 thất bại thì dùng Vite chạy bằng Bun. Chủ dự án xem lại ở cuối phiên sau |

Trong 13 quyết định: D-11 đã chọn. D-13 là mặc định tạm của trợ lý, chờ chủ dự án xem lại. Còn 11 quyết định chưa có đáp án (D-01 đến D-10 và D-12). PRD ghi D-01 và D-02 là câu hỏi mở số một.
