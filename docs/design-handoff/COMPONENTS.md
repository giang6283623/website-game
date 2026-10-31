# Thành phần giao diện

Có 22 thành phần dùng chung trong Figma, trang `20 Components` (16 bộ biến thể và 6 thành phần đơn). 16 thành phần đầu có từ vòng 1 và 2. Sáu thành phần cuối (Checkbox, Toggle, UserChip, AccountMenu, HeaderUser, HeaderMobileUser) thêm ở vòng 3. Phần cuối tệp mô tả các mẫu cục bộ: những khối chỉ có trong từng trang, chưa là thành phần Figma, nhưng khi code nên làm thành phần.

Quy ước đọc:

- Mã Figma (ví dụ `18:6`) dán vào URL dạng `?node-id=18-6`.
- Màu viết theo tên token ngữ nghĩa (xem `design-values.json`).
- "Hug" là co theo nội dung. "Fill" là giãn theo khung chứa.
- Mọi thành phần lấy nét bằng bàn phím phải có vòng 3 px `border/focus` vẽ vào trong, không làm đổi kích thước.

Bảng tóm tắt:

| # | Thành phần | Mã Figma | Biến thể | Dùng ở |
| --- | --- | --- | --- | --- |
| 1 | Button | `18:6` | Type (Primary, Secondary, Ghost) x State x Size (L, M). Có 30 biến thể vẽ sẵn: mỗi cỡ đủ Default, Hover, Focus, Disabled, Pressed cho cả ba kiểu | Mọi trang |
| 2 | Tag | `18:37` | Type: News, Guide, Event, New | Tin tức, Hồ sơ, Quản trị |
| 3 | Field | `18:46` | State: Default, Focus, Error, Disabled | Đăng nhập, đăng ký, Kho đồ, Xếp hạng, Quản trị |
| 4 | NavDial | `20:2` | Active: Home, Profile, News, Items, Ranking | Trong Header |
| 5 | StatusStrip | `20:103` | Một | Đầu trang MT |
| 6 | ItemSlot | `20:109` | State: Default, Selected, Hover, Focus, Disabled | Trang chủ, Kho đồ |
| 7 | RankRow | `20:148` | Type: Top, Me, Default | Trang chủ, Xếp hạng |
| 8 | NewsRow | `20:182` | State: Default, Hover, Focus | Trang chủ, Tin tức, Quản trị |
| 9 | TabBar | `20:195` | Active: Home, Profile, News, Items, Ranking | Đáy trang ĐT |
| 10 | Wordmark | `22:4` | Size: L, S | Header, Footer, xác thực, quản trị |
| 11 | Header | `23:4` | Active: Home, Profile, News, Items, Ranking | Đầu trang MT |
| 12 | Footer | `23:160` | Một | Chân trang MT |
| 13 | HeaderMobile | `23:189` | Một | Đầu trang ĐT |
| 14 | Chip | `29:138` | State: Default, Selected, Hover, Focus, Disabled | Bộ lọc, phân trang, nút bật tắt, công cụ soạn |
| 15 | PageTitle | `29:145` | Một. Chữ: Crumb, Title, Lead | Đầu trang con MT |
| 16 | ListState | `59:163` | Type: Empty, Error, Loading | Danh sách rỗng, lỗi, đang tải |
| 17 | Checkbox | `106:215` | State: Unchecked, Checked, Focus, Disabled. Chữ nhãn đổi được | Đăng nhập (ghi nhớ), Tạo nhân vật |
| 18 | Toggle | `106:230` | State: Off, On, Off Focus, On Focus, Off Disabled, On Disabled. Chữ nhãn đổi được | Quản trị (Vật phẩm, Banner) |
| 19 | UserChip | `112:215` | Size: Full, Icon. State: Default, Open, Hover, Focus. Chữ tên đổi được | Đầu trang khi đã đăng nhập |
| 20 | AccountMenu | `112:231` | Một. Chữ: Name, Email, Rank. Công tắc Show admin | Menu của chip tài khoản |
| 21 | HeaderUser | `112:477` | Active: Home, News, Items, Ranking, Profile, None | Đầu trang MT khi đã đăng nhập |
| 22 | HeaderMobileUser | `112:479` | Một | Đầu trang ĐT khi đã đăng nhập |

## 1. Button (`18:6`)

Mục đích: mọi hành động. Primary cho hành động chính của khối (mỗi khối nhiều nhất một). Secondary cho hành động phụ. Ghost cho liên kết dạng nút ít nổi bật.

Kích thước:

| Cỡ | Cao | Đệm ngang | Chữ | Khoảng cách icon và chữ |
| --- | --- | --- | --- | --- |
| L | 56 | 28 | Label/L | 8 |
| M | 44 | 20 | Label/M | 8 |

Chiều rộng co theo nội dung (hug). Trong biểu mẫu và trên ĐT dùng giãn hết khung (fill).

Token theo kiểu và trạng thái:

| Kiểu | Default | Hover | Focus | Disabled | Pressed |
| --- | --- | --- | --- | --- | --- |
| Primary | Nền `accent/default`. Chữ `text/on-accent`. Cạnh dưới 4 px màu rust-600 (nằm trong bố cục) | Nền `accent/hover`. Chữ `text/on-accent`. Cạnh dưới 4 px `accent/default` | Nền `accent/default`. Vòng 3 px `border/focus` bên trong. Không cạnh dưới. Đệm dưới 4 | Nền `bg/hover`. Chữ `text/disabled`. Không cạnh | Nền `accent/pressed`. Chữ `text/primary`. Không cạnh. Đệm trên 4, chữ dịch xuống |
| Secondary | Trong suốt. Viền 2 `border/bold`. Chữ `text/primary` | Nền `bg/hover`. Viền 2 `text/primary` | Nền `bg/hover`. Vòng 3 `border/focus`. Đệm 2 / 30 | Trong suốt. Viền 2 `border/strong`. Chữ `text/disabled` | Nền `bg/inset`. Viền 2 `border/accent`. Chữ `text/primary` |
| Ghost | Không nền. Chữ `text/accent` | Nền `bg/hover`. Chữ `text/primary` | Vòng 3 `border/focus`. Chữ `text/accent` | Chữ `text/disabled` | Nền `bg/inset`. Chữ `text/accent` |

Ghi chú:

- Từ phiên 5 Figma vẽ đủ cỡ M ở Default, Hover, Focus, Disabled và Pressed cho cả ba kiểu (G-10). Cỡ M dùng cùng quy tắc màu với cỡ L, chỉ khác kích thước (cao 44, đệm ngang 20, chữ Label/M).
- Cạnh dưới của Primary giữ chiều cao tổng 56 (hoặc 44). Khi nhấn, cạnh dưới mất và chữ dịch xuống 4 px nên nút trông như bị ấn xuống. Làm bằng `border-bottom: 4px solid` và đổi sang `padding-top: 4px` khi `:active`.
- Nút có thể có icon hoặc mũi tên trước hoặc sau chữ (khoảng cách 8). Figma hiện chỉ dùng chữ. Icon là đề xuất, nếu thêm phải ẩn khỏi trình đọc màn hình.
- Chữ nút luôn in hoa (Label).

HTML: dùng `<a>` khi điều hướng, `<button>` khi gửi biểu mẫu hoặc đổi trạng thái. Trạng thái khóa dùng `disabled` cho nút và `aria-disabled="true"` cho liên kết.

## 2. Tag (`18:37`)

Mục đích: nhãn loại nội dung, nhỏ, không bấm được.

| Kiểu | Hiển thị | Dùng cho |
| --- | --- | --- |
| News | Viền 1 `border/strong`. Chữ `text/secondary` | Tin tức |
| Guide | Nền `bg/hover`. Chữ `text/primary` | Hướng dẫn (cũng dùng làm nhãn trạng thái như "ĐANG CHƠI" và "BẢN NHÁP") |
| Event | Viền 1 `border/accent`. Chữ `text/accent` | Sự kiện |
| New | Nền `text/primary`. Chữ `text/on-accent` | Mới |

Kích thước: đệm 4 / 10, chữ Label/M, cao 28 (đặt `box-sizing: border-box` để viền nằm trong). Loại bài viết và nhãn hiển thị: News là TIN TỨC, Guide là HƯỚNG DẪN, Event là SỰ KIỆN, New là CẬP NHẬT (xem `CONTENT-COPY.md`). Bốn nhãn này trùng với bốn chip lọc và bốn lựa chọn PHÂN LOẠI trong quản trị. Các biến thể trong Figma đều mang chữ mẫu "TIN TỨC", chữ thật do từng nơi dùng đặt. Khi code, đặt tên biến thể theo nghĩa nội dung (`variant="news"`) hoặc theo hình (`outline`, `filled`, `accent`, `inverse`), không gắn "Guide" với trạng thái.

HTML: `<span>`. Không có vai trò đặc biệt.

## 3. Field (`18:46`)

Mục đích: một ô nhập kèm nhãn và dòng gợi ý.

Cấu trúc (xếp dọc, khoảng cách 8): Nhãn (Label/M, `text/secondary`), Hộp nhập (cao 52, đệm ngang 16, nền `bg/inset`, viền 1 `border/control`, chữ Body/M), Gợi ý (Body/S, `text/muted`). Từ vòng 3, hộp nhập có thêm nút hành động tùy chọn ở bên phải (công tắc `Show action`, chữ `Action`, mặc định "HIỆN"), dùng cho ô mật khẩu.

| Trạng thái | Thay đổi |
| --- | --- |
| Default | Giá trị giữ chỗ (placeholder) màu `text/muted`. Giá trị thật màu `text/primary` |
| Focus | Viền 2 `border/focus`. Nhãn đổi `text/primary` |
| Error | Viền 2 `border/danger`. Dòng gợi ý đổi thành thông báo lỗi, màu `text/danger` |
| Disabled | Nền `bg/panel`. Viền 1 `border/soft`. Chữ `text/disabled`. Nhãn `text/muted` |

Rộng mặc định 360. Trong biểu mẫu và trên ĐT giãn hết khung.

Quy tắc:

- Gợi ý luôn hiện (không chỉ hiện khi lỗi). Khi lỗi, thông báo lỗi thay gợi ý, không thêm dòng.
- Viền Default dùng `border/control` (#6f6c60, tương phản 3,27 đến 3,70 với nền). Đã áp dụng ở vòng 3 và đóng G-01. Viền `border/strong` không còn dùng cho ô nhập.
- Ô mật khẩu: bật `Show action` để hiện chữ "HIỆN" ở mép phải hộp nhập. Khi bấm, mật khẩu hiện ra dạng chữ và chữ nút đổi thành "ẨN". Nút này là `<button type="button">` có `aria-pressed` và nhãn ẩn "Hiện mật khẩu". Đã vẽ trên đăng nhập, đăng ký, đặt lại mật khẩu và đổi mật khẩu (G-21).

HTML: `<label for>` + `<input id>` + `<p id="...-hint">`. Gắn `aria-describedby` tới gợi ý. Lỗi: `aria-invalid="true"`. Dùng đúng `type` (`email`, `password`, `search`) và `autocomplete` (xem DESIGN-SPEC mục 9).

## 4. NavDial (`20:2`)

Mục đích: điều hướng chính trên MT, nằm trong Header.

Kích thước: 720 x 68. Gồm hai phần: dải 5 trạm (cao 44, mỗi trạm rộng 144) và thước (cao 14, đặt ở y = 54) có kim.

Mỗi trạm xếp dọc, căn giữa, khoảng cách 2: tần số (Label/M) phía trên, tên (Label/L) phía dưới.

| Thứ tự | Tần số | Tên | Đường dẫn |
| --- | --- | --- | --- |
| 1 | 88.1 | Trang chủ | `/` |
| 2 | 92.4 | Tin tức | `/tin-tuc` |
| 3 | 96.7 | Kho đồ | `/kho-do` |
| 4 | 101.3 | Xếp hạng | `/xep-hang` |
| 5 | 107.9 | Hồ sơ | `/ho-so` |

| Trạm | Tần số | Tên |
| --- | --- | --- |
| Đang chọn | `text/accent` | `text/primary` |
| Khác | `text/muted` | `text/secondary` |

Hover và Focus của một trạm (bảng tham chiếu `184:363`, G-10). Hover: tên đổi sang `text/primary`, tần số giữ nguyên. Focus: vòng 3 `border/focus` vẽ vào trong trạm 144 x 44. Trạm đang chọn giữ màu như bảng trên.

Kim: thanh 3 x 24 màu `accent/default`, đứng ở giữa trạm đang chọn (x = 71, 215, 359, 503, 647), nhô lên trên thước 10 px. Thước dùng họa tiết "Thước" (xem ASSET-MAP).

Tần số 88.1 đến 107.9 là số giả để tạo không khí, không có ý nghĩa kỹ thuật. Giữ cố định theo thứ tự trên.

HTML: `<nav aria-label="Điều hướng chính"><ul><li><a>`. Trạm hiện tại có `aria-current="page"`. Thước và kim là trang trí (`aria-hidden`). Nếu thêm trạm mới, đề xuất tần số kế tiếp tăng khoảng 4 đến 6.

Co giãn: xem DESIGN-SPEC mục 5.2. Từ 1200 đến 1439 chiều rộng co từ 720 xuống 600, mỗi trạm co theo.

## 5. StatusStrip (`20:103`)

Mục đích: dải thông tin máy chủ ở đầu trang MT.

Kích thước: 1440 x 44, nền `bg/inset`, viền dưới 1 `border/soft`, lề ngang 64. Ba mục (Label/M):

| Vị trí | Nội dung mẫu | Màu |
| --- | --- | --- |
| Trái | Chấm 8 x 8 `status/online` và "MÁY CHỦ TRỰC TUYẾN" | `text/online` |
| Giữa | "34 NGƯỜI ĐANG CHƠI" | `text/primary` |
| Phải | "MIỄN PHÍ · TIẾNG VIỆT" | `text/secondary` |

Dữ liệu động: trạng thái máy chủ (trực tuyến hoặc ngoại tuyến) và số người đang chơi. Mục bên phải là chữ cố định, cần chủ dự án xác nhận (G-13).

Chỉ có trên MT. Có mặt ở các trang công khai và trang xác thực. Không có ở trang quản trị.

HTML: `<aside aria-label="Trạng thái máy chủ">`. Chấm xanh đi kèm chữ nên không cần mô tả thêm. Cập nhật số liệu bằng làm mới theo chu kỳ 30 đến 60 giây (đề xuất) hoặc theo từng lần tải trang.

Trạng thái ngoại tuyến (Figma `155:363`, bộ biến thể `155:369`, trang mẫu `158:2655`, nhóm code vẽ ở phiên 3): chấm rỗng (vòng viền 2 `text/muted`), chữ "Máy chủ ngoại tuyến" viết hoa bằng CSS, màu `text/muted`, bỏ mục giữa. Bật bằng `?mock=offline`.

## 5a. BannerStrip (`155:385`)

Dải thông báo của ban quản trị, đặt trên cùng mọi trang công khai và trang xác thực, trước StatusStrip (G-26, A-24). Nhóm code vẽ ở phiên 3. Bộ biến thể: Desktop `155:370`, Mobile `155:378`. Trang mẫu: 1440 `158:2480`, 390 `158:4043`.

Nền `accent/default`, viền dưới 1 `accent/pressed`, chữ `text/on-accent` kiểu `label-l`. Nút đóng 44 x 44 ở bên phải. Liên kết "Xem chi tiết" gạch chân, chỉ hiện khi banner có `linkUrl`.

| Biến thể | Kích thước | Bố cục |
| --- | --- | --- |
| Mobile | 390 x 73 khi chữ một dòng | Lề trái `page-pad-x`, lề phải 8. Chữ và liên kết xếp dọc, khoảng cách 4, đệm dọc 8 |
| Desktop | 1440 x 53 | Một hàng căn giữa, khoảng cách 16. Có ô đệm 44 x 44 bên trái để chữ nằm giữa trang |

Dữ liệu: `GET /banner`. Dải ẩn khi không có banner đang bật hoặc API lỗi. Nút đóng lưu mã banner trong `sessionStorage` (`issvn.banner.closed`) nên banner khác vẫn hiện. HTML: `<aside aria-label="Thông báo của ban quản trị">`. Liên kết trong trang dùng `Link`, liên kết ngoài mở thẻ mới với `rel="noopener noreferrer"`. Dải hiện sau khi API trả lời nên đẩy trang xuống 53 hoặc 73 (C-60).

## 6. ItemSlot (`20:109`)

Mục đích: thẻ vật phẩm theo kiểu thẻ kho đồ.

Kích thước: 304 x 292. Xếp dọc gồm Khay hình (cao 176, nền `bg/raised`) và Thông tin (đệm 16, khoảng cách 4).

Khay hình: họa tiết lưới chữ thập, hình vật phẩm 272 x 160 vừa khít (`contain`), bốn dấu góc 16 x 2 và 2 x 16 màu `text/disabled`.

Thông tin: Nhãn loại (Label/M, `text/muted`), Tên (Heading/H3, `text/primary`), Chỉ số (Data/M, `text/secondary`, ví dụ "Sát thương 32 · Tầm xa 120").

| Trạng thái | Thay đổi |
| --- | --- |
| Default | Nền `bg/panel`. Viền 1 `border/soft` |
| Hover | Nền `bg/hover`. Viền 1 `border/strong` |
| Selected | Vòng 2 `border/accent` quanh thẻ và nhãn "ĐANG XEM" (86 x 28, nền `accent/default`, chữ `text/on-accent`) |
| Focus | Vòng 3 `border/focus` quanh thẻ |
| Disabled | Giữ nền `bg/panel` và viền 1 `border/soft` như Default. Hình mờ 40 phần trăm. Nhãn loại, tên và chỉ số đổi `text/disabled`. Không có nhãn "ĐANG XEM". Rê chuột không đổi gì |

Mọi trạng thái cùng kích thước 304 x 292 (có đệm 1 để vòng không làm đổi cỡ).

Disabled (vẽ ở phiên 5, quyết định C-69): trong code thẻ khóa là `<li class="item-slot is-disabled">` chứa `<span aria-disabled="true">`, không phải liên kết. Hiện chưa trang nào dùng, để dành cho vật phẩm chưa mở hoặc đã ẩn.

Dữ liệu: `category`, `name`, `stat`, `imageKey`. Hình: xem ASSET-MAP. Mẫu ĐT dùng thẻ nhỏ riêng (xem mục MiniSlot ở cuối).

HTML: `<li>` trong `<ul>`. Bên trong là `<a>` bao tiêu đề. Hình `alt` là tên vật phẩm. "ĐANG XEM" chỉ là nhãn hình ảnh, thêm `aria-current="true"` cho thẻ đang chọn.

## 7. RankRow (`20:148`)

Mục đích: một dòng trong bảng xếp hạng MT. Kích thước dòng 1312 x 69 (Top 69, Me 72).

Cột (khoảng cách 16, đệm 8 / 16):

| Cột | Rộng | Kiểu chữ | Ghi chú |
| --- | --- | --- | --- |
| Hạng | 72 | Data/L | Top: `text/accent`. Khác: `text/muted` |
| Huy hiệu | 36 | Hình | Huy hiệu gia tộc 36 x 36 |
| Người chơi | giãn | Body/M Strong (tên), Body/S `text/muted` (gia tộc) | |
| GameDollar | 120 | Data/M | |
| XP | 104 | Data/M `text/secondary` | |

| Kiểu | Hiển thị |
| --- | --- |
| Default | Không nền. Viền dưới 1 `border/soft` |
| Top | Nền `bg/raised`. Số hạng `text/accent`. Áp dụng cho hạng 1 đến 3 |
| Me | Nền `bg/raised`. Viền 2 `border/accent`. Dòng của người đang đăng nhập |

Mẫu ĐT là mẫu cục bộ: đệm 10 / 12, khoảng cách 12. Cột Hạng rộng tối thiểu 36, huy hiệu 36, tên giãn, chỉ một cột số liệu (đang chọn theo thẻ GameDollar, XP hoặc Gia tộc). Không có cột XP.

Quy tắc dữ liệu: dùng chấm ngăn nghìn. Đặt `tabular-nums`. Tên dài: tối đa 2 dòng rồi dấu ba chấm (G-12).

HTML: dùng `<table>` thật với `<th scope="col">`: Hạng, Người chơi, GameDollar, XP. Mỗi dòng là `<tr>`. Dòng Me thêm nhãn ẩn "Vị trí của bạn". Không dùng `div` giả bảng.

## 8. NewsRow (`20:182`)

Mục đích: một dòng tin ở danh sách MT.

Cấu trúc ngang (đệm 16, khoảng cách 16): ô Tag rộng 124, Tiêu đề (Heading/H3, giãn), Ngày (Data/M, `text/muted`). Viền dưới 1 `border/soft`.

| Trạng thái | Thay đổi |
| --- | --- |
| Default | Không nền |
| Hover | Nền `bg/hover` |
| Focus | Vòng 3 `border/focus` (đệm dưới 17 để giữ chiều cao) |

Dữ liệu: `category`, `title`, `date`, `slug`. Cả dòng là một liên kết đến bài viết.

HTML: `<li>` chứa `<a>` rộng hết dòng. Ngày dùng `<time datetime>`.

Mẫu ĐT là NewsCard (mục cuối): xếp dọc, Tag và ngày ở trên, tiêu đề ở dưới.

## 9. TabBar (`20:195`)

Mục đích: điều hướng chính trên ĐT, cố định ở đáy màn hình.

Kích thước: 390 x 58. Nền `bg/inset`. Thước cao 14 trên cùng (kim 3 x 24 ở x = 38, 116, 194, 272, 350). Dưới là 5 tab rộng 78 x cao 44 (xếp dọc, đệm 10 / 0 / 14 / 0, căn giữa).

| Tab | Chữ | Đường dẫn |
| --- | --- | --- |
| 1 | CHỦ | `/` |
| 2 | TIN | `/tin-tuc` |
| 3 | KHO | `/kho-do` |
| 4 | HẠNG | `/xep-hang` |
| 5 | HỒ SƠ | `/ho-so` |

Chữ Label/M. Tab đang chọn: `text/accent`. Tab khác: `text/secondary`. Hover (chỉ máy có chuột, `@media (hover: hover)`): chữ `text/primary`. Focus: vòng 3 `border/focus` vào trong tab 78 x 44 và chữ `text/primary`. Tab đang chọn giữ `text/accent` ở cả Hover và Focus (bảng tham chiếu `184:363`, G-10). Biến thể `Active=None` không tab nào sáng, dùng cho trang ngoài năm tab chính (Tải game, Quy tắc, 404, 500).

Hành vi: cố định (`position: fixed; bottom: 0`). Chiếm toàn chiều ngang. Thêm `padding-bottom: env(safe-area-inset-bottom)`. Chừa đệm cuối trang 112 (đã tính trong Footer). Không hiện trên đăng nhập, đăng ký, quên mật khẩu, đặt lại mật khẩu và quản trị.

HTML: `<nav aria-label="Điều hướng nhanh">`. Thứ tự tab giống NavDial.

## 10. Wordmark (`22:4`)

Mục đích: nhận diện thương hiệu, dẫn về trang chủ.

| Cỡ | Kích thước | Cấu tạo |
| --- | --- | --- |
| L | 191 x 72 | "INFESTATION" (Display/M, `text/primary`) và hàng phụ: thanh 24 x 3 `accent/default` và "VIỆT NAM" (Label/L, `text/accent`) |
| S | 134 x 54 | "INFESTATION" (Display 900, 28 px, `text/primary`) và hàng phụ: thanh 16 x 3 và "VIỆT NAM" (Label/M, `text/accent`) |

Cỡ S dùng trên ĐT (HeaderMobile, đăng nhập, đăng ký, quản trị). Cỡ L dùng trên MT và trong chân trang ĐT.

HTML: `<a href="/" aria-label="Infestation Việt Nam, về trang chủ">`. Chữ là văn bản thật, không phải hình.

## 11. Header (`23:4`)

Mục đích: đầu trang MT. Kích thước 1440 x 96, đệm ngang 64, nền `bg/page`, viền dưới 1 `border/soft`.

Gồm: Wordmark L, NavDial và hai nút (Secondary M "ĐĂNG NHẬP", Primary M "ĐĂNG KÝ"). Biến thể `Active` chọn trạm đang sáng trong NavDial.

Header có thêm biến thể `Active=None` (không trạm nào sáng) cho trang không nằm trong năm trạm chính, như Tải game, Quy tắc, 404 và 500. Khi đã đăng nhập, dùng `HeaderUser` (mục 21): hai nút được thay bằng chip tài khoản `UserChip` và nút Primary M "TẢI GAME" (đã vẽ ở vòng 3, đóng G-09).

Dính ở đỉnh khi cuộn, xem DESIGN-SPEC mục 5.3.

## 12. Footer (`23:160`)

Mục đích: chân trang MT. Kích thước 1440 x 405, đệm 64 / 64 / 40 / 64, khoảng cách 40, nền `bg/inset`, viền trên 1 `border/soft`.

| Khối | Nội dung |
| --- | --- |
| Thương hiệu (rộng 400) | Wordmark L và câu giới thiệu (Body/M `text/secondary`) |
| ĐIỀU HƯỚNG | Trang chủ, Tin tức, Kho đồ, Xếp hạng |
| HỖ TRỢ | Hướng dẫn tải game, Tạo tài khoản, Quên mật khẩu, Liên hệ quản trị |
| CỘNG ĐỒNG | Facebook (group), Discord, YouTube (bản code bỏ Zalo) |
| Dưới cùng | Thước. Bản code bỏ dòng pháp lý (A-06) |

Tiêu đề cột là Label/L `text/primary`. Liên kết là Body/M `text/secondary`. Trạng thái hover của liên kết chưa vẽ, đề xuất đổi sang `text/primary`.

Bản ĐT (mẫu cục bộ, mỗi trang tự dựng): 2 cột. Cột ĐIỀU HƯỚNG và cột HỖ TRỢ (rút gọn: Hướng dẫn, Quên mật khẩu, Liên hệ, Facebook). Đệm 40 / 20 / 112 / 20. Đệm dưới 112 chừa chỗ cho TabBar.

Các liên kết mạng xã hội là giả định (G-13).

HTML: `<footer>`. Mỗi cột là `<nav aria-label>` hoặc `<section>` có tiêu đề cấp `h2` ẩn hoặc hiện.

## 13. HeaderMobile (`23:189`)

Đầu trang ĐT: 390 x 72, đệm ngang 20. Wordmark S bên trái và nút Secondary M "ĐĂNG NHẬP" bên phải. Không có nút "ĐĂNG KÝ" (người dùng vào qua trang đăng nhập hoặc nút trong nội dung).

Khi đã đăng nhập: dùng `HeaderMobileUser` (mục 22), nút "ĐĂNG NHẬP" được thay bằng chip tài khoản dạng gọn (chỉ ảnh đại diện).

## 14. Chip (`29:138`)

Mục đích: bộ lọc, nút phân trang, nút bật tắt, công cụ soạn bài viết.

Kích thước: cao 46, đệm 11 / 16, chữ Label/L.

| Trạng thái | Thay đổi |
| --- | --- |
| Default | Viền 1 `border/control`. Chữ `text/secondary` |
| Hover | Nền `bg/hover`. Viền 1 `border/bold`. Chữ `text/primary` |
| Selected | Nền và viền `accent/default`. Chữ `text/on-accent` |
| Focus | Vòng 3 `border/focus`. Chữ `text/primary` |
| Disabled | Không nền. Viền 1 `border/soft`. Chữ `text/disabled`. Con trỏ `not-allowed` (G-10, vẽ ở phiên 5) |

Disabled trong code: nút dùng thuộc tính `disabled`, liên kết dùng `aria-disabled="true"` và không có `href`.

Cách dùng:

- Bộ lọc loại: chọn một giá trị (TẤT CẢ, TIN TỨC, HƯỚNG DẪN, SỰ KIỆN, CẬP NHẬT).
- Phân trang: "TRƯỚC", các số, "SAU". Trang hiện tại là Selected.
- Nút bật tắt: hai chip BẬT và TẮT cạnh nhau, đúng một chip Selected.
- Công cụ soạn: ĐẬM, NGHIÊNG, DANH SÁCH, LIÊN KẾT, ẢNH.
- Sắp xếp: MỚI NHẤT, TÊN A-Z (Kho đồ), MỚI NHẤT (Tin tức ĐT).

HTML theo vai trò: bộ lọc và phân trang là liên kết (`<a>`) có `aria-current`. Nút bật tắt là `<button role="switch">` hoặc nhóm radio. Công cụ soạn là `<button>` có nhãn ẩn đầy đủ (ví dụ "In đậm"). Viền Default của chip dùng `border/control` (G-01 đã đóng).

## 15. PageTitle (`29:145`)

Mục đích: đầu trang con ở MT. Kích thước 1440 x 273, đệm 56 / 64, khoảng cách 16, cắt phần tràn. Nền họa tiết lưới chữ thập (tỉ lệ 1, tuyệt đối). Viền dưới 1 `border/soft`.

| Phần | Kiểu |
| --- | --- |
| Đường dẫn (Crumb) | Label/M `text/muted`. Ví dụ "TRANG CHỦ  /  TIN TỨC" |
| Tiêu đề | Display/L `text/primary` |
| Đoạn dẫn | Body/L `text/secondary`, rộng tối đa 720 |

Bản ĐT là mẫu cục bộ "Title": cao 232, đệm 32 / 20 / 24 / 20, khoảng cách 12, đoạn dẫn Body/M.

HTML: `<header>` chứa `<nav aria-label="Đường dẫn">` (danh sách có dấu phân cách), `<h1>` và `<p>`. Mục cuối của đường dẫn là `aria-current="page"` và không là liên kết.

## 16. ListState (`59:163`)

Mục đích: trạng thái rỗng, đang tải và lỗi của một danh sách. Xem quy tắc trong DESIGN-SPEC mục 8 và chữ trong CONTENT-COPY.

Khung: rộng 640 (mặc định, giãn theo vùng), đệm 40 / 32, khoảng cách 16, căn giữa, nền `bg/panel`, viền 1 `border/soft` (Error: `border/danger`).

| Kiểu | Nội dung |
| --- | --- |
| Empty | Biểu tượng la bàn 176 x 107, tiêu đề (Heading/H3), câu giải thích (Body/M `text/secondary`), nút Secondary M |
| Loading | Ba thanh xám (574 x 14, 240 x 14, 160 x 14, nền `bg/hover`), tiêu đề, câu ngắn |
| Error | Hộp 72 x 72 viền 3 `border/danger` chứa "!" (Display/M `text/danger`), tiêu đề, câu ngắn, nút Primary M "THỬ LẠI" |

HTML: Empty và Loading dùng `role="status"`. Error dùng `role="alert"`. Nút thử lại gọi tải lại mà không tải cả trang.

## 17. Checkbox (`106:215`)

Mục đích: một lựa chọn bật tắt có nhãn dài, như "Ghi nhớ đăng nhập" và "Tôi đã đọc quy tắc cộng đồng". Dùng Toggle (mục 18) cho cài đặt có hiệu lực ngay.

Kích thước: hộp 22 x 22, khoảng cách tới nhãn 12, tổng 176 x 28. Nhãn Body/M `text/primary`.

| Trạng thái | Hộp |
| --- | --- |
| Unchecked | Nền `bg/inset`, viền 2 `border/control` |
| Checked | Nền `accent/default`, viền 2 `border/accent`, dấu tick 14 x 14 nét 2,4 màu `text/on-accent` |
| Focus | Nền `bg/inset`, viền 3 `border/focus` |
| Disabled | Nền `bg/hover`, viền 2 `border/soft`, nhãn `text/disabled` |

HTML: `<input type="checkbox">` thật, ẩn hộp mặc định bằng CSS và vẽ lại hộp bằng `::before` hoặc phần tử kế bên. Nhãn gắn bằng `<label for>`. Vùng bấm gồm cả nhãn và cao ít nhất 44.

## 18. Toggle (`106:230`)

Mục đích: bật tắt một cài đặt, như "Nổi bật" và "Hiện" của vật phẩm, "Đang hiện" của banner.

Kích thước: đường ray 48 x 26, núm 16 x 16, tổng 125 x 28 (chữ nhãn đổi được nên chiều rộng co theo nhãn). Nhãn Body/M `text/primary` đứng trước ray.

| Trạng thái | Ray và núm |
| --- | --- |
| Off | Ray nền `bg/inset`, viền 2 `border/control`. Núm `text/muted` nằm bên trái |
| On | Ray nền `accent/default`, viền 2 `border/accent`. Núm `text/on-accent` nằm bên phải |

| Off Focus, On Focus | Như Off và On, thêm vòng 3 `border/focus` vào trong đường ray. Núm giữ đúng vị trí của Off hoặc On (G-24, vẽ ở phiên 5) |
| Off Disabled, On Disabled | Ray nền `bg/hover`, viền 2 `border/soft`. Núm và nhãn `text/disabled`. Núm giữ vị trí của Off hoặc On (G-24, vẽ ở phiên 5) |

HTML: `<button type="button" role="switch" aria-checked>` kèm nhãn. Phím Space đổi giá trị. Không dùng màu làm kênh duy nhất: chữ nhãn đổi theo trạng thái ("Hiện" và "Ẩn", "Đang hiện" và "Tắt").

## 19. UserChip (`112:215`)

Mục đích: chỗ bấm để mở menu tài khoản trong đầu trang khi đã đăng nhập.

| Biến thể | Kích thước | Dùng ở |
| --- | --- | --- |
| Size=Full | 178 x 44: ảnh đại diện 28 x 28 (viền 1 `border/strong`), tên (Body/M Strong, chữ `Name`), mũi tên 12 x 8 | HeaderUser (MT) |
| Size=Icon | 44 x 44: chỉ ảnh đại diện | HeaderMobileUser (ĐT) |

| Trạng thái | Thay đổi |
| --- | --- |
| Default | Không nền. Viền 1 `border/control` |
| Open | Nền `bg/hover`. Viền 1 `border/accent`. Mũi tên chỉ lên |
| Hover | Nền `bg/hover`. Viền 1 `border/control` giữ nguyên (G-10, vẽ ở phiên 5) |
| Focus | Vòng 3 `border/focus` vào trong chip. Bản Full giữ đúng chiều rộng của Default (đệm hai bên giảm 2 để bù viền dày hơn) |

Ảnh đại diện dùng huy hiệu gia tộc có sẵn (nguồn thật chưa quyết, D-02). Tên dài: cắt bằng dấu ba chấm trong chip, tên đầy đủ nằm trong AccountMenu.

HTML: `<button aria-expanded aria-haspopup="menu">` có nhãn "Tài khoản của <tên>". Menu mở bằng AccountMenu. Phím Escape đóng và trả lấy nét về chip.

## 20. AccountMenu (`112:231`)

Mục đích: menu thả ra từ UserChip. Kích thước 280 x 282, nền `bg/panel`, viền 2 `border/bold`. Đặt cách đầu trang 8 và căn mép phải theo lề (64 trên MT, 20 trên ĐT).

| Khối | Nội dung |
| --- | --- |
| Summary | Tên (Body/M Strong), email đã che một phần (Data/M `text/muted`), hạng (Label/M `text/accent`, ví dụ "HẠNG 128") |
| Items | HỒ SƠ, ĐỔI MẬT KHẨU (Label/L `text/secondary`, mỗi dòng cao 44), QUẢN TRỊ (`text/accent`, chỉ hiện khi công tắc `Show admin` bật) |
| Logout | ĐĂNG XUẤT (`text/danger`, cao 60) |

Hover và Focus của một mục (bảng tham chiếu `184:363`, G-10). Hover: nền `bg/hover` và chữ `text/primary`. Focus: vòng 3 `border/focus` vào trong dòng và chữ `text/primary`. Riêng ĐĂNG XUẤT giữ chữ `text/danger` (đỏ) ở cả Hover, chỉ nền đổi sang `bg/hover` (quyết định C-70). Mục QUẢN TRỊ chưa vẽ riêng. Code làm theo quy tắc chung: chữ cam đổi sang `text/primary` khi Hover hoặc Focus.

Mục QUẢN TRỊ chỉ hiện với vai trò quản trị, và máy chủ vẫn phải kiểm tra quyền ở mọi API quản trị (xem ROUTES-AND-DATA mục 11). Hạng lấy từ bảng xếp hạng, có thể ẩn dòng này ở bản đầu nếu chưa có dữ liệu (D-03).

HTML: `<div role="menu">` với `<a role="menuitem">`. Mũi tên lên và xuống di chuyển giữa các mục. Escape đóng menu. Đăng xuất là `<button>` gửi yêu cầu POST.

## 21. HeaderUser (`112:477`)

Đầu trang MT khi đã đăng nhập. Kích thước 1440 x 96, giống Header (mục 11) nhưng vùng hành động bên phải gồm UserChip Full và nút Primary M "TẢI GAME". Biến thể `Active` giống Header: Home (`112:249`), News (`112:255`), Items (`112:261`), Ranking (`112:267`), Profile (`112:273`), None (`112:279`).

Bảng mẫu ghép: khung "Đầu trang đã đăng nhập / 1440" (`120:3042`) trên trang `30 Screens 1440`.

## 22. HeaderMobileUser (`112:479`)

Đầu trang ĐT khi đã đăng nhập. Kích thước 390 x 72: Wordmark S bên trái, UserChip Icon bên phải. Menu mở dưới đầu trang, rộng 280, cách lề phải 20. Bảng mẫu ghép: "Đầu trang đã đăng nhập / 390" (`120:3221`).

## 23. Mẫu cục bộ (chưa là thành phần Figma)

Những khối này lặp lại hoặc phức tạp, nên làm thành phần khi code. Kích thước ghi theo MT, bản ĐT ghi riêng.

| Mẫu | Mô tả ngắn | Dùng ở |
| --- | --- | --- |
| SectionHead | Dòng nhãn nhỏ (Overline: thanh cam 32 x 3 và nhãn như "01 · BẮT ĐẦU"), tiêu đề Heading/H1, đoạn dẫn Body/L. Có thể kèm nút Ghost M ở bên phải | Trang chủ |
| RadioLine | Dòng giọng "Trạm trưởng": viền trái 4 `border/accent`, đệm 8 / 0 / 8 / 20 (ĐT 16), dòng nhãn "TRẠM TRƯỞNG · 88.1 MHz" và một câu ngắn | Trang chủ, mục Ba bước |
| StepCard | Thẻ bước 416 x 354 (ĐT 350 x 310), nền `bg/panel`, viền 1 `border/soft`. Trên cùng là thước 14. Thân đệm 32, khoảng cách 16: hàng đầu có vòng tròn 88 x 88 (viền `border/strong`) chứa icon bước 48 x 48 và số "01" (Display/M `text/muted`), tiêu đề Heading/H2, mô tả Body/M, nút Ghost M | Trang chủ |
| Fact | Ô số liệu: số Display/M `text/primary` và nhãn Label/L `text/muted`. MT: 4 cột, đệm dọc 32, ngăn cột bằng đường dọc 1 `border/soft`. ĐT: lưới 2 x 2, ô 195 x 110, đệm 20 | Trang chủ |
| Locker | Khung "TÚI ĐỒ KHỞI ĐẦU / 05 MÓN": 624 x 592 (ĐT 350 x 340), nền `bg/panel` và lưới chữ thập, hình lớn 528 x 322 (ĐT 310 x 189), Callout, đường kẻ 1 `border/strong`, 4 hình nhỏ 128 x 78 (ĐT 70 x 43) kèm tên, 4 dấu góc | Hero trang chủ |
| Callout | Thanh cam 3 x 40 và hai dòng: tên (Label/L `text/primary`), loại (Label/M `text/muted`) | Locker, tin nổi bật |
| NewsCard (ĐT) | Dọc, đệm 16 / 0, khoảng cách 8, viền dưới 1 `border/soft`: dòng Tag và ngày (Data/M `text/muted`), tiêu đề Heading/H3 | Trang chủ, Tin tức, Quản trị ĐT |
| Featured | Bài nổi bật: MT 1312 x 390, ảnh 640 x 380 (nền `bg/raised`, họa tiết, hình 420 x 256, Callout, 4 dấu góc) và cột chữ (đệm 48, khoảng cách 20: Tag, Heading/H1, Body/L, ngày, nút Primary M "ĐỌC TIẾP"). ĐT: dọc 350 x 480, ảnh cao 168, thân đệm 20 | Tin tức |
| MiniSlot (ĐT) | Thẻ vật phẩm nhỏ 169 x 190: khay 165 x 112 (hình 149 x 96, dấu góc 14 x 2) và thông tin đệm 12 (Label/M nhãn loại, Heading/H3 tên). Không có dòng chỉ số. Thẻ chọn viền 2 `border/accent`, thẻ khác viền 1 `border/soft` | Kho đồ ĐT |
| Category | Mục danh mục ở thanh bên Kho đồ MT: 288 x 48, đệm 12 / 16, tên Label/L và số lượng Data/M. Chọn: nền `bg/raised`, viền trái 3 `border/accent`, số `text/accent`, tên `text/primary`. Khác: viền dưới 1 `border/soft`, tên `text/secondary`, số `text/muted` | Kho đồ MT |
| Detail | Khối chi tiết vật phẩm 960 x 434: ảnh bên trái 400 (nền `bg/raised`, hình 360 x 220, bóng súng HUD 206 x 60, nhãn "ĐANG XEM", dấu góc), cột chữ bên phải (đệm 32, khoảng cách 16: nhãn loại `text/accent`, tên Heading/H1, mô tả Body/M, lưới 4 chỉ số 241 x 88 gồm nhãn Label/M và giá trị Data/L) | Kho đồ MT |
| TableHead | Dòng đầu bảng: đệm 8 / 16, viền dưới 1 `border/strong`, chữ Label/M `text/muted` | Xếp hạng |
| Stat | Thẻ thống kê: MT 204 x 122, đệm 24, ĐT 169 x 110, đệm 16. Nhãn Label/M `text/muted` và số Display/M `text/primary` | Hồ sơ |
| AccountCard | Thẻ tài khoản: MT rộng 400 (thân đệm 32), ĐT rộng 350 (đệm 20). Trên cùng là thước. Huy hiệu 96 (ĐT 80), tên tài khoản Data/L, gia tộc Body/M `text/secondary`, chấm và chữ "ĐANG TRỰC TUYẾN", ba dòng thông tin (EMAIL đã che, NGÀY THAM GIA, TRẠNG THÁI) và hai nút | Hồ sơ |
| Character | Thẻ nhân vật: MT 424 x 309 (đệm 24), ĐT 350 x 292 (đệm 16). Tên Data/L, cấp và nghề Body/M, Tag, khay vũ khí (bóng súng HUD 206 x 60) và dòng "ĐÃ SỐNG SÓT" | Hồ sơ |
| Skill | Ô kỹ năng: MT 131 x 156 (đệm 16), ĐT 109 x 144 (đệm 12 / 8). Icon 64 x 64, tên Label/L, trạng thái Label/M. Đã mở: icon màu, nhãn "ĐÃ MỞ" `text/accent`. Chưa mở: icon đen trắng, tên `text/secondary`, nhãn "CHƯA MỞ" `text/muted` | Hồ sơ |
| AuthBar | Thanh trên của trang xác thực: MT 1440 x 96 (Wordmark L và Ghost M "QUAY LẠI TRANG CHỦ"), ĐT 390 x 72 (Wordmark S và Ghost M "TRANG CHỦ") | Đăng nhập, đăng ký |
| FormCard | Khung biểu mẫu: MT 520 (thân đệm 40, khoảng cách 20), ĐT 350 (thân đệm 24). Trên cùng là thước. Tiêu đề Heading/H1 (ĐT Heading/H2), các Field, nút Primary L, ghi chú Body/S, đường kẻ 1 `border/soft`, dòng chuyển đổi đăng nhập và đăng ký | Đăng nhập, đăng ký |
| Editor | Bộ soạn bài: viền 1 `border/strong`. Thanh công cụ (đệm 12, khoảng cách 8, nền `bg/panel`) gồm 5 Chip, vùng chữ (đệm 24, nền `bg/inset`, Body/M) | Quản trị |
| DropZone | Vùng thả ảnh: nền `bg/inset`, viền 2 `border/strong`, đệm 24, khoảng cách 16. Chữ Body/M `text/secondary` và nút Secondary M "CHỌN ẢNH" | Quản trị |
| Settings | Khung xuất bản: MT 360, ĐT 350. Đệm 24 (ĐT 20). Nhãn "XUẤT BẢN" (thanh 24 x 3 `border/accent`), các dòng khóa giá trị (viền trên 1 `border/soft`), hai nút bật tắt, hai nút Primary L và Secondary L | Quản trị |
| Sidebar (quản trị) | 280 rộng, nền `bg/inset`, đệm 32, khoảng cách 24: Wordmark L, nhãn "QUẢN TRỊ", 5 mục (BÀI VIẾT, VẬT PHẨM, BANNER, NGƯỜI DÙNG, NHẬT KÝ), nút Ghost M "ĐĂNG XUẤT" ở cuối. Mục chọn giống Category (nền `bg/raised`, viền trái 3 `border/accent`) | Quản trị MT |
| Pagination | Hàng Chip: "TRƯỚC", số trang, "SAU", khoảng cách 8. Trang hiện tại Selected | Tin tức, Kho đồ, Xếp hạng |

Mẫu cục bộ thêm ở vòng 3:

| Mẫu | Mô tả ngắn | Dùng ở |
| --- | --- | --- |
| DownloadCard | Khung tải bộ cài 1312 x 604, nền lưới chữ thập, 4 dấu góc. Cột trái 654: nhãn "BẢN CÀI ĐẶT MỚI NHẤT", tiêu đề "TẢI BỘ CÀI / VÀO TRẬN NGAY", đoạn dẫn, ba ô thông tin (PHIÊN BẢN, DUNG LƯỢNG, ngày cập nhật), hai nút (Primary L "TẢI BỘ CÀI" và Secondary L "XEM HƯỚNG DẪN") và dòng "Miễn phí · Dành cho máy tính Windows". Cột phải 480: thước và bảng YÊU CẦU MÁY 4 dòng (HỆ ĐIỀU HÀNH, BỘ NHỚ, Ổ ĐĨA, MẠNG) | Tải game |
| NoticeWindows (ĐT) | Khung viền trái `border/accent` "GAME CHỈ CHẠY TRÊN WINDOWS" kèm Secondary M "SAO CHÉP LIÊN KẾT". Nút tải bị khóa (Disabled) | Tải game ĐT (G-03) |
| FaqItem | Tiêu đề Heading/H3 và đoạn Body/M, lưới 2 x 2 trên MT, một cột trên ĐT | Tải game |
| ReadingColumn | Cột đọc rộng 720 căn giữa, Body/L, tiêu đề con Heading/H2, danh sách chấm vuông `text/accent` | Chi tiết bài viết, Quy tắc |
| ArticleHead | Đường dẫn, hàng Tag loại và dòng "ngày · tác giả · thời gian đọc" (ví dụ "28/10/2026 · BAN QUẢN TRỊ · ĐỌC 3 PHÚT"), tiêu đề lớn. Dưới là khung ảnh đại diện 1312 x 480 (nền lưới chữ thập, hình 640 x 360, 4 dấu góc) | Chi tiết bài viết |
| StatGrid | Lưới chỉ số 2 hàng x 2 ô, mỗi ô 241 x 88 (nhãn Label/M và giá trị Data/L), giống khối Detail của Kho đồ | Chi tiết vật phẩm |
| StateBoard | Bảng tham chiếu sáu trạng thái xác thực. Không phải trang sản phẩm. Mỗi trạng thái là một FormCard hoặc ListState với chữ riêng | Trạng thái xác thực |
| TipsCard | Khung "MẸO CHỌN MẬT KHẨU" với danh sách chấm vuông, bên phải FormCard (MT) hoặc dưới FormCard (ĐT) | Đổi mật khẩu |
| StarterKit | Khung "BỘ ĐỒ KHỞI ĐẦU" liệt kê 4 dòng vật phẩm kèm số lượng (Ba lô 32 ô x1, Bộ y tế x1, La bàn x1, Đồ hộp x2), ngăn bằng đường kẻ 1. Cuối khung có ghi chú "Danh sách mẫu, ban quản trị sẽ chốt sau." (chú thích thiết kế, không đưa lên trang thật) | Tạo nhân vật (đã bỏ, A-23) |
| TocList | Mục lục 288 x 208: nhãn "MỤC LỤC" và 4 liên kết neo cao 47, ngăn bằng đường kẻ 1 `border/soft`. Mục đang đọc có chữ `text/accent`, mục khác `text/secondary` | Quy tắc cộng đồng MT |
| PenaltyRow | Bảng 720 x 184 gồm ba hàng: LẦN 1 CẢNH CÁO, LẦN 2 KHÓA 7 NGÀY, LẦN 3 KHÓA VĨNH VIỄN | Quy tắc cộng đồng |
| CenterMessage | Khối giữa trang cho 404 và 500: số lỗi cỡ lớn ("404", "500") phía trên và ListState kiểu Error rộng 720. Nút Primary M "VỀ TRANG CHỦ" (404) hoặc "THỬ LẠI" (500) | 404, 500 |
| AdminTable (MT) | Bảng 1032 rộng: TableHead và Row (đệm 12 / 16, khoảng cách 16, viền dưới 1 `border/soft`). Cột cuối chứa nút Ghost M. Dưới bảng là Pagination | Quản trị: Bài viết, Vật phẩm, Banner, Người dùng, Nhật ký |
| AdminCard (ĐT) | Thẻ danh sách quản trị: đệm 16 / 0, viền dưới 1 `border/soft`, hàng đầu (Tag hoặc tên và trạng thái), giữa (nội dung), cuối (Toggle hoặc nút Ghost M) | Quản trị ĐT |
| AdminNote | Ghi chú đầu trang quản trị: viền trái 4 `border/accent`, nhãn Label/M `text/accent`, một câu Body/M | Quản trị: Vật phẩm, Banner |
| BannerPreview | Dải xem trước banner: nền `accent/default`, chữ Label/L `text/on-accent`, đệm 12 / 16 | Quản trị: Banner |
| StickyActions (ĐT) | Thanh hành động dính 390 x 89 ở đáy màn hình đầu tiên: nền `bg/inset`, viền trên 1 `border/soft`, hai nút L giãn đều "LƯU NHÁP" (Secondary) và "ĐĂNG BÀI" (Primary) | Quản trị: soạn bài ĐT (G-20) |

Mục QUẢN TRỊ trong Sidebar có đủ thiết kế danh sách cho cả năm mục (BÀI VIẾT, VẬT PHẨM, BANNER, NGƯỜI DÙNG, NHẬT KÝ). Form thêm hoặc sửa vật phẩm do nhóm code vẽ ở phiên 3 (`156:2378`, `156:2723`, `160:915`, `160:1145`). Chi tiết người dùng do nhóm code vẽ ở phiên 4 (`171:2870`, `172:1027`, G-23).
