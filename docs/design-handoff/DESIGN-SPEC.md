# Đặc tả thiết kế: Tần số sinh tồn

Trạng thái: Figma vòng 3 đã hoàn tất và đã kiểm tra (29/10/2026). Vòng 3 thêm token `border/control`, sáu thành phần mới và mọi trang còn thiếu (máy tính và điện thoại). Tài liệu này chưa gắn với code. Mọi mục ghi "đề xuất" chưa có trong Figma và cần duyệt trước khi code.

Tệp Figma: liên kết Figma đã ẩn (mã tệp `FIGMA_FILE_KEY`). Mã node dạng `24:2` dán vào URL dưới dạng `?node-id=24-2`.

## 0. Cách đọc tài liệu này

| Cần biết | Xem ở |
| --- | --- |
| Giá trị số (màu, cỡ chữ, khoảng cách) | `design-values.json` |
| Quy tắc dùng giá trị, bố cục, trạng thái, truy cập | Tệp này |
| 22 thành phần dùng chung và các mẫu cục bộ | `COMPONENTS.md` |
| Từng trang: các khối, thứ tự, dữ liệu | `PAGES.md` |
| Câu chữ trên giao diện | `CONTENT-COPY.md` |
| Đường dẫn, dữ liệu, API | `ROUTES-AND-DATA.md` |
| Hình ảnh | `ASSET-MAP.md` |
| Ảnh chụp từng trang | `SCREENS.md` |
| Thứ tự làm và cách kiểm tra | `IMPLEMENTATION-PLAN.md` |

Thứ tự tin cậy khi hai nguồn khác nhau: Figma (hình dạng và nội dung mẫu), rồi `design-values.json` (số), rồi tệp này (quy tắc), rồi PRD (mục tiêu). Nếu thấy mâu thuẫn, ghi vào mục 12 và hỏi chủ dự án.

Viết tắt: MT là bản máy tính (khung 1440). ĐT là bản điện thoại (khung 390).

## 1. Khái niệm

Tên hướng thiết kế là **Tần số sinh tồn**. Ý tưởng: người sống sót dò tìm một kênh liên lạc cuối cùng. Giao diện mượn ngôn ngữ của máy dò sóng và kho đồ, không mượn hình máy thu thanh.

Ba hướng đã cân nhắc và cách giữ lại:

| Hướng | Quyết định | Dùng ở đâu |
| --- | --- | --- |
| A. Núm dò đài | Giữ | Thanh điều hướng (NavDial và TabBar): thước vạch, kim cam, tần số giả |
| B. Bản đồ khu vực | Chỉ giữ họa tiết | Lưới chữ thập làm nền phía sau |
| C. Sổ tay sinh tồn | Giữ | Thẻ nội dung: thẻ vật phẩm như thẻ kho đồ, có dấu góc |

Bốn quy tắc cứng của thiết kế:

1. Chỉ một màu nhấn: cam gỉ (rust). Màu rêu (moss) chỉ cho trạng thái trực tuyến. Màu đỏ máu (blood) chỉ cho lỗi.
2. Giao diện phẳng: không đổ bóng, không gradient, không bo góc lớn (0, 2 hoặc 4 px).
3. Cỡ chữ nhỏ nhất 16 px. Display, Heading và Label luôn in hoa.
4. Hình game chỉ đặt trên khay tối. Không dùng ảnh nền ConnectScreen. Không dùng màu mè.

Ngoại lệ đã được người dùng duyệt (phiên 15, 31/10/2026) cho quy tắc 2: ảnh nền trang trí do công cụ tạo ảnh vẽ, đặt sau một lớp phủ phẳng một màu (không gradient), kèm hiệu ứng nhẹ. Phạm vi của ngoại lệ:

- Nơi dùng: Hero và CTA trang chủ, tiêu đề các trang, khung tải game, bên trái trang đăng nhập, trang lỗi, ảnh bìa tin, dải số liệu, mép trên chân trang.
- Họa tiết lặp rất nhạt: bê tông phủ nền trang (độ đậm 7%), thép gỉ phủ nền chân trang (16%), hạt kính trên các tấm kính mờ (30%). Các họa tiết nằm dưới chữ và không đổi màu chữ.
- Nạp lười: ảnh của khung CTA và chân trang chỉ tải khi phần tử cách khung nhìn dưới 300 px (thuộc tính `data-art-lazy`, mã ở `src/lib/lazy-art.ts`). Nhờ đó ngân sách trang chủ điện thoại tính cho phần trên màn hình đầu vẫn đạt.
- Kính mờ: ô Locker, bảng yêu cầu máy, ô số liệu và khung chữ CTA điện thoại dùng màu khay trộn 60% và làm mờ 5 px. Chỉ riêng tấm kính này được mờ nền.
- Hiệu ứng: sương và pháo sáng chỉ đổi độ đậm (chu kỳ 14 giây và 4 giây). Mọi hiệu ứng tắt khi người dùng bật giảm chuyển động.
- Chữ vẫn phải đạt tương phản ít nhất 4,5:1 (chữ lớn 3:1), đo bằng điểm ảnh thật sau lớp phủ.
- Nếu thiếu ảnh (bản clone không có thư mục `public/assets/art/`) thì trang trở về thiết kế phẳng cũ, không lỗi và không lệch bố cục.
- Ảnh không nằm trong git. Dựng bằng `bun run build:art` từ thư mục `art-src` (đường dẫn tới ảnh gốc), mã nguồn ở `scripts/build-art.ts` và `scripts/lib/art-map.ts`, kiểu dáng ở `src/styles/art.css`.

Ngoại lệ thứ hai đã được người dùng duyệt (phiên 16, 31/10/2026) cho chuyển động: hoạt ảnh "Tín hiệu yếu" (thư viện Motion, bản `motion/mini`) và cửa sổ chi tiết vật phẩm. Phạm vi của ngoại lệ:

- Chỉ đổi `opacity` và `transform` (gồm cả `translate`, `rotate`, `scale`). Bước vào dùng 120 đến 900 ms. Mọi nhịp lặp là bội số của `--signal-beat` (1 giây) và chỉ chạy khi không bật giảm chuyển động: nhiễu dòng tiêu đề và số trang lỗi (1 giây nhiễu, 1 giây nghỉ), nhiễu nhẹ tiêu đề trang (1 giây mỗi 4 giây), quét băng (1,8 giây mỗi 4 giây), kim rà sóng (rung 1 px mỗi 2 giây). Khối ra khỏi màn hình thì dừng vòng lặp.
- Mục dưới màn hình đầu hiện bằng "khóa mục tiêu". Trạng thái ẩn chỉ đặt sau khi React nối vào.
- Nhiễu là chữ bị xé thành các lát, lệch tới 0,2 em, không có bản sao sáng đè lên chữ. Lát cùng màu với chữ, riêng ở ba cú xé thì lát lên màu đỏ `#e5705a`. Dòng tiêu đề có thêm hai bóng đỏ và xanh bệnh nằm sau lưng chữ. Tiêu đề trang chỉ có lát đỏ, không có bóng. Số trang lỗi giật sang trắng xương. Đỏ này có tỉ lệ đỏ 0,75, dưới mức 0,8 nên chưa là đỏ bão hòa theo WCAG 2.3.1. Mọi khoảng 1 giây có không quá 3 lần đổi sáng mạnh trên vùng từ 21824 px².
- Tắt mọi dịch chuyển khi bật giảm chuyển động. Chữ lúc nghỉ vẫn đạt tương phản 4,5. Bản sao nhiễu chỉ là hình trang trí, ẩn khỏi trình đọc màn hình.
- Vạch quét VHS trên Locker là vạch phẳng nửa tối, không chuyển động, chỉ có khi có ảnh trang trí.
- Cửa sổ chi tiết vật phẩm hiện bằng nền mờ dần 200 ms và khung nổi lên 8 px trong 320 ms.
- Ống ngắm trên thẻ vật phẩm là phản hồi khi người dùng trỏ, lấy nét hoặc chạm. Phần CSS luôn chạy. Phần JavaScript nạp lười chỉ thêm một ống ngắm trượt từ thẻ này sang thẻ khác. Không có số giả, chỉ dùng dữ liệu thật của vật phẩm.
- Kim đổi trạm bằng đường lò xo `linear()` sinh từ công thức khối lượng, chạy bằng `transition`, không dùng vòng `requestAnimationFrame`. Lúc tải trang kim đứng yên.
- Trỏ chuột dùng ảnh `cursor.png` 32 x 32, điểm nóng (1, 1), nạp qua `art.css`. Thiếu ảnh thì về `auto` và `pointer`. Ô nhập giữ `text`, thẻ khóa giữ `not-allowed`. Ảnh không nằm trong git.
- Nút `Tắt hiệu ứng` ở chân trang dừng mọi vòng lặp và nhớ lựa chọn trên máy người dùng.
- Mã nằm ở `src/lib/signal.ts`, `src/motion/signal.ts` và `src/styles/motion.css`. Motion chỉ được nạp lười sau khi React nối vào, nên không nằm trong gói JavaScript tải đầu.

Giọng nói trên giao diện: ngắn, thẳng, tiếng Việt thường ngày. Chỉ có một nơi dùng giọng nhập vai: dòng "TRẠM TRƯỞNG · 88.1 MHz" trong mục Ba bước (chỉ là chữ, không có âm thanh).

Từ dùng trong tài liệu này (chưa phải bảng thuật ngữ chính thức của dự án):

| Từ | Nghĩa | Nên tránh |
| --- | --- | --- |
| Tần số sinh tồn | Tên hướng thiết kế | giao diện radio, theme radio, điện đài |
| NavDial | Thanh điều hướng máy tính: 5 trạm có vạch thước và kim cam | menu radio |
| TabBar | Thanh điều hướng điện thoại cố định ở đáy | footer menu |
| Thẻ vật phẩm (ItemSlot) | Thẻ kho đồ có khay hình và dấu góc | card sản phẩm |
| Dấu góc (bracket) | Bốn vạch ngắn ở góc khay hình | khung viền |
| Thước (ruler) | Họa tiết vạch chia nhỏ | thanh tiến trình |
| Lưới chữ thập (cross) | Họa tiết nền dấu cộng mờ | pattern |

## 2. Màu

Giá trị đầy đủ nằm trong `design-values.json` (17 màu gốc, 25 màu ngữ nghĩa). Code chỉ dùng màu ngữ nghĩa. Không dùng thẳng màu gốc trong thành phần.

### 2.1 Bậc nền (từ thấp đến cao)

| Token | Hex | Dùng cho |
| --- | --- | --- |
| `bg/inset` | #0c0d0b | Thanh trạng thái máy chủ, chân trang, dải số liệu, ô nhập, TabBar, thanh bên quản trị, vùng soạn bài, dải nền xen kẽ trên ĐT |
| `bg/page` | #131512 | Nền trang |
| `bg/panel` | #191c17 | Thẻ, khung, bảng |
| `bg/raised` | #1f231d | Khay hình vật phẩm, dòng hạng Top và Me, danh mục đang chọn |
| `bg/hover` | #282d25 | Nền khi rê chuột, thẻ Guide, thanh skeleton, nút bị khóa |

Quy tắc xếp lớp: một khối nằm trên nền nào thì thành phần con dùng bậc cao hơn hoặc thấp hơn một bậc. Không nhảy hai bậc. Ví dụ: thẻ `bg/panel` trên trang `bg/page`, khay hình `bg/raised` trong thẻ.

### 2.2 Chữ

| Token | Hex | Dùng cho |
| --- | --- | --- |
| `text/primary` | #ece8db | Chữ chính, tiêu đề, giá trị |
| `text/secondary` | #c9c4b3 | Đoạn dẫn, mô tả, nhãn ô nhập |
| `text/muted` | #a29e8e | Nhãn nhỏ, ngày, gợi ý |
| `text/disabled` | #6f6c60 | Chỉ trong thành phần bị khóa |
| `text/accent` | #e27a33 | Nhãn loại, số mục đang chọn, hạng Top, kỹ năng đã mở |
| `text/on-accent` | #0c0d0b | Chữ trên nền cam (`accent/default`, `accent/hover`) |
| `text/danger` | #e5705a | Gợi ý lỗi, dấu chấm than |
| `text/online` | #9db86a | Chỉ cho "MÁY CHỦ TRỰC TUYẾN" và "ĐANG TRỰC TUYẾN" |

### 2.3 Viền và nhấn

| Token | Hex | Dùng cho |
| --- | --- | --- |
| `border/soft` | #282d25 | Đường kẻ mỏng giữa dòng, viền thẻ (chỉ trang trí) |
| `border/strong` | #353b31 | Tag tin tức, viền ảnh đại diện, đường kẻ nổi |
| `border/control` | #6f6c60 | Viền ô nhập, chip, nút bật tắt, ô chọn, chip tài khoản (tương phản 3,27 đến 3,70 với nền) |
| `border/bold` | #c9c4b3 | Viền nút Secondary, dấu góc |
| `border/focus` | #ece8db | Vòng lấy nét bàn phím, dày 3 px |
| `border/accent` | #d0601c | Mục đang chọn, dòng "của tôi", tag Event |
| `border/danger` | #e5705a | Ô nhập lỗi, khung lỗi danh sách |
| `accent/default` | #d0601c | Nền nút Primary, thanh nhấn, nhãn "ĐANG XEM" |
| `accent/hover` | #e27a33 | Nút Primary khi rê chuột |
| `accent/pressed` | #a94a14 | Nút Primary khi nhấn |
| `status/online` | #9db86a | Chấm trực tuyến |
| `status/danger` | #9e3524 | Dự phòng, chưa dùng |

### 2.4 Tương phản (đã đo)

Tỉ lệ đo bằng công thức WCAG 2.x. Bảng đủ nằm trong `design-values.json`, mục `contrast`.

| Cặp | Tỉ lệ | Kết luận |
| --- | --- | --- |
| `text/primary` trên `bg/page` | 14,98 | Đạt |
| `text/secondary` trên `bg/panel` | 9,86 | Đạt |
| `text/muted` trên `bg/panel` | 6,41 | Đạt |
| `text/accent` trên `bg/panel` | 5,79 | Đạt |
| `text/danger` trên `bg/panel` | 5,57 | Đạt |
| `text/online` trên `bg/panel` | 7,79 | Đạt |
| `text/on-accent` trên `accent/default` | 4,98 | Đạt |
| `text/primary` trên `accent/pressed` | 4,66 | Đạt (đây là lý do nút Pressed dùng `text/primary`) |

Cặp cấm: `text/on-accent` trên `accent/pressed` (3,41). `text/primary` trên `accent/default` (3,19). `accent/default` làm màu chữ nhỏ (4,40, dùng `text/accent`). `text/disabled` ngoài thành phần bị khóa.

Đã xử lý ở vòng 3: viền `border/strong` cũ của ô nhập và chip chỉ đạt 1,49 đến 1,69 so với nền, thấp hơn mức 3 cho thành phần giao diện (WCAG 1.4.11). Token `border/control` (#6f6c60, tỉ lệ 3,27 đến 3,70) đã được duyệt và áp dụng trong Figma. Xem mục 12, khoảng trống G-01. Cặp `text/disabled` trên `bg/hover` (2,67) vẫn chỉ dùng cho thành phần bị khóa, được miễn theo WCAG.

## 3. Chữ

### 3.1 Họ font

| Vai trò | Font | Độ đậm | Chỗ dùng |
| --- | --- | --- | --- |
| Display | Big Shoulders Stencil Display | 900 | Display và Wordmark. Không dùng cho đoạn văn |
| Heading, Label | Barlow Condensed | 600, 700 | Tiêu đề, nhãn, nút |
| Body | Barlow | 400, 600 | Đoạn văn, gợi ý, tên |
| Data | Barlow Semi Condensed | 500, 600 | Số liệu, ngày, tiền, hạng |

Cách nạp (đề xuất): tự lưu tệp `woff2` trên máy chủ website, gồm các bộ ký tự `latin`, `latin-ext`, `vietnamese`. Dùng `font-display: swap`. Nạp sớm (`preload`) ba tệp: Barlow 400, Barlow 600, Barlow Condensed 600. Hai font còn lại nạp theo nhu cầu. Kiểm tra giấy phép trước khi tự lưu và kiểm tra dấu tiếng Việt trên mọi cỡ Display.

### 3.2 Kiểu chữ

Tên kiểu chữ giống tên trong Figma. Đơn vị px. Độ giãn chữ tính bằng em.

| Kiểu | Font và độ đậm | Cỡ / dòng | Giãn chữ | Hoa | Dùng cho |
| --- | --- | --- | --- | --- | --- |
| Display/XL | Display 900 | 96 / 112 | +0,02 | Có | Tiêu đề Hero trang chủ MT |
| Display/L | Display 900 | 64 / 76 | +0,02 | Có | Tiêu đề trang, CTA, Hero ĐT |
| Display/M | Display 900 | 40 / 48 | +0,02 | Có | Số liệu lớn, Wordmark L, tiêu đề xác thực ĐT |
| Heading/H1 | Barlow Condensed 700 | 44 / 50 | +0,01 | Có | Tiêu đề mục, tiêu đề khung xác thực MT |
| Heading/H2 | Barlow Condensed 600 | 32 / 38 | +0,02 | Có | Tiêu đề thẻ bước, mục con |
| Heading/H3 | Barlow Condensed 600 | 24 / 30 | +0,02 | Có | Tên vật phẩm, tiêu đề dòng tin |
| Body/L | Barlow 400 | 20 / 32 | 0 | Không | Đoạn dẫn MT |
| Body/M | Barlow 400 | 18 / 28 | 0 | Không | Văn bản chính, đoạn dẫn ĐT |
| Body/S | Barlow 400 | 16 / 24 | 0 | Không | Gợi ý, ghi chú |
| Body/M Strong | Barlow 600 | 18 / 28 | 0 | Không | Tên người chơi |
| Label/L | Barlow Condensed 600 | 18 / 22 | +0,06 | Có | Nút L, chip, nhãn mục |
| Label/M | Barlow Condensed 600 | 16 / 20 | +0,08 | Có | Nút M, tag, nhãn ô nhập, tab bar |
| Data/L | Barlow Semi Condensed 600 | 28 / 32 | 0 | Không | Hạng, tên tài khoản |
| Data/M | Barlow Semi Condensed 500 | 18 / 24 | 0 | Không | Ngày, tiền, XP |

Quy tắc chữ hoa: lưu nội dung ở dạng câu thường (ví dụ "Cuối tuần nhân đôi kinh nghiệm") và dùng `text-transform: uppercase` cho Display, Heading, Label. Lý do: dấu tiếng Việt vẫn đúng khi sao chép, trình đọc màn hình đọc đúng, và biên tập viên không phải gõ hoa.

### 3.3 Máy tính và điện thoại

| Vai trò | MT | ĐT |
| --- | --- | --- |
| Tiêu đề Hero | Display/XL | Display/L |
| Tiêu đề trang | Display/L | Display/L |
| Tiêu đề trang xác thực | Display/L | Display/M |
| Đoạn dẫn | Body/L | Body/M |
| Tiêu đề mục | Heading/H1 | Heading/H1 |
| Tiêu đề khung xác thực | Heading/H1 | Heading/H2 |
| Các kiểu còn lại | Giữ nguyên | Giữ nguyên |

### 3.4 Ghi chú cho tiếng Việt

- Đặt `lang="vi"` trên thẻ `html`.
- Display có độ giãn dòng 1,17 (112/96). Đủ cho dấu chồng như "Ệ", "Ẫ". Không giảm độ giãn dòng.
- Tiêu đề dùng `text-wrap: balance`. Đoạn văn dùng `text-wrap: pretty`. Không tự động ngắt từ bằng dấu gạch nối.
- Cột số dùng `font-variant-numeric: tabular-nums`.
- Tên người chơi và tên gia tộc dài: tối đa 2 dòng, cắt bằng dấu ba chấm. Đây là quy tắc từ thử nghiệm với tên dài trên bảng xếp hạng ĐT (xem PAGES.md).
- Định dạng số: dấu chấm ngăn nghìn ("2.480.150"). Ngày: "28/10" trong danh sách, "30/10/2026 08:00" khi cần đủ.

## 4. Khoảng cách, viền, kích thước

Thang khoảng cách (px): 4, 8, 12, 16, 24, 32, 48, 64, 96 (tên `space/1` đến `space/9`). Hai giá trị riêng của ĐT nằm ngoài thang: lề 20 và khoảng cách dọc giữa các mục 56. Giữ nguyên và đặt tên `--space-gutter-mobile`, `--space-section-y-mobile`.

Viền: 1 px (đường kẻ, viền thẻ), 2 px (nút Secondary, ô nhập có trạng thái, vòng chọn), 3 px (vòng lấy nét), 4 px (cạnh dưới nút Primary). Bo góc: 0 mặc định, 2 hoặc 4 khi cần. Không đổ bóng.

Kích thước cố định quan trọng:

| Phần tử | Giá trị |
| --- | --- |
| Nút L | cao 56, đệm ngang 28 |
| Nút M | cao 44, đệm ngang 20 |
| Hộp ô nhập | cao 52, đệm ngang 16 |
| Chip | cao 46, đệm 11 / 16 |
| Tag | cao 28, đệm 4 / 10 |
| TabBar | 390 x 58 |
| Header MT | cao 96 |
| HeaderMobile | cao 72 |
| Thanh trạng thái máy chủ | cao 44 |
| Thẻ vật phẩm | 304 x 292, khay hình cao 176 |
| Thẻ vật phẩm nhỏ ĐT | 169 x 190 |
| Mục tiêu chạm nhỏ nhất | 44 |

## 5. Bố cục và co giãn

### 5.1 Khung thiết kế

| | MT | ĐT |
| --- | --- | --- |
| Khung | 1440 | 390 |
| Lề hai bên | 64 | 20 |
| Độ rộng nội dung | 1312 | 350 |
| Khoảng cách dọc giữa các mục | 96 | 56 |
| Đệm vùng nội dung trang con | 48 / 64 / 96 / 64 (trên, ngang, dưới) | Chia thành từng khối, lề ngang 20 (xem PAGES.md) |
| PageTitle | cao 273 | cao 232 |
| Điều hướng | Header 96 có NavDial | HeaderMobile 72 và TabBar cố định đáy |
| Thanh trạng thái máy chủ | Có (trừ trang quản trị) | Không |

### 5.2 Mốc co giãn (đề xuất, cần duyệt)

Figma chỉ có hai khung. Các mốc dưới đây là đề xuất để code. Nguyên tắc: bố cục ĐT là cột đơn và dùng cho mọi màn hình dưới 1200 px.

| Dải rộng | Bố cục | Lề | Ghi chú |
| --- | --- | --- | --- |
| dưới 768 | ĐT | 20 | Đúng như Figma |
| 768 đến 1199 | ĐT, nội dung tối đa 720 và căn giữa | 32 | TabBar giữ nguyên. Lưới thẻ có thể tăng lên 3 cột |
| 1200 đến 1439 | MT co giãn | 48 | NavDial co từ 720 xuống 600. Display/XL co theo `clamp(72px, 6.7vw, 96px)` |
| từ 1440 | MT đúng Figma | 64 | Nội dung tối đa 1312, căn giữa |

Lý do chọn 1200: Header MT cần ít nhất khoảng 1181 px (Wordmark 191, NavDial 600, hai nút 246, khoảng cách 48, lề 96).

Cách từng mẫu co lại ở dải 1200 đến 1439:

| Mẫu | Quy tắc |
| --- | --- |
| Hero trang chủ | Hai cột 55 phần trăm và 45 phần trăm. Khung Locker co theo cột, giữ tỉ lệ hình |
| Dải số liệu | 4 cột đều |
| Ba thẻ bước | 3 cột đều, thẻ co theo cột |
| Tin mới và Top sinh tồn | Hai cột theo tỉ lệ 704 : 560 |
| Lưới Kho đồ | 3 cột, thẻ co từ 304 xuống tối thiểu 232. Khay hình giữ cao 176 và hình dùng `object-fit: contain` |
| Kho đồ có thanh bên | Thanh bên cố định 288, phần còn lại co |
| Bảng xếp hạng | Cột Hạng 72, Emblem 36, Người chơi co, Tiền 120, XP 104. Không đổi |
| Khung đăng nhập và đăng ký | Hai nửa 50 phần trăm. Khung biểu mẫu 520 giữ nguyên |
| Quản trị | Thanh bên 280. Vùng chính co. Cột soạn bài co, cột cài đặt 360 giữ nguyên |

Dải 768 đến 1199 dùng bố cục ĐT. Để tránh nhìn trống trên màn hình rộng, đặt nội dung tối đa 720 và căn giữa. Lưới thẻ vật phẩm nhỏ có thể lên 3 cột (mỗi thẻ tối thiểu 169). Bảng xếp hạng giữ một cột số liệu.

### 5.3 Thanh điều hướng cố định (ĐT)

- TabBar rộng đủ màn hình, cao 58, cố định ở đáy. Đặt `padding-bottom: env(safe-area-inset-bottom)` để tránh thanh cử chỉ của iPhone.
- Mọi trang ĐT có TabBar phải chừa khoảng trống ở cuối: chân trang có đệm dưới 112.
- Trang đăng nhập, đăng ký, quên mật khẩu, đặt lại mật khẩu và quản trị trên ĐT không có TabBar.
- Header MT dính ở đỉnh khi cuộn. Khi bắt đầu dính, phần nhìn thấy thu từ 96 xuống 76, Wordmark nhỏ còn 88 phần trăm, vạch `border/accent` 2 px chạy từ trái sang phải ở mép dưới. Hộp Header vẫn cao 96 nên nội dung bên dưới không xê dịch. Màn hình thấp dưới 560 px thì không dính. HeaderMobile dính giống vậy, thu từ 72 xuống 56.

### 5.4 Cuộn ngang

Dải chip ở Tin tức, Kho đồ, Xếp hạng, Quản trị trên ĐT cuộn ngang trong khung 350. Dùng `overflow-x: auto`, `scroll-snap-type: x proximity` và ẩn thanh cuộn. Chip đang chọn phải được cuộn vào vùng nhìn thấy khi tải trang. Không có dấu hiệu mờ dần ở mép trong Figma. Đề xuất thêm bóng mờ ở mép phải để báo còn nội dung.

## 6. Họa tiết và trang trí

Chi tiết tệp hình nằm trong `ASSET-MAP.md`, mục 3.

| Họa tiết | Mô tả | Dùng ở |
| --- | --- | --- |
| Lưới chữ thập | Dấu cộng mờ trên ô 96 px (thẻ) hoặc 192 px (nền lớn) | Nền Hero, PageTitle, Locker, khay hình, thẻ tin nổi bật, khung CTA |
| Thước | Dải vạch 40 x 14 px, lặp ngang | NavDial, TabBar, Footer, dải Ticks trên đầu thẻ bước và khung xác thực |
| Dấu góc | Bốn vạch 28 x 2 px (ĐT: 20 x 2 hoặc 14 x 2), màu `border/bold` | Locker, khay hình, thẻ tin nổi bật, khung CTA |
| Thanh Overline | Thanh cam 32 x 3 (ĐT: 24 x 3) trước nhãn mục | Đầu mục, Hero, Intro |
| Thanh Callout | Thanh cam 3 x 40 trước tên vật phẩm | Chú thích hình vật phẩm (Locker, tin nổi bật) |

Quy tắc: lưới chữ thập chỉ làm nền, không đặt sau chữ dài. Mọi họa tiết đặt `aria-hidden="true"`. Họa tiết không được chặn thao tác chạm (`pointer-events: none`).

## 7. Tương tác và chuyển động

Toàn bộ mục này là đề xuất (Figma không có nguyên mẫu tương tác). Giá trị thời gian nằm trong `design-values.json`, mục `motion`.

| Phần tử | Khi | Thay đổi | Thời gian |
| --- | --- | --- | --- |
| Nút, chip, dòng tin, thẻ | Rê chuột | Đổi nền và viền theo bảng trạng thái trong COMPONENTS.md | 120 ms |
| Nút Primary | Nhấn | Mất viền dưới 4 px và nội dung dịch xuống 4 px. Nền `accent/pressed` | tức thì |
| Mọi phần tử tương tác | Lấy nét bằng bàn phím | Vòng 3 px `border/focus`, vẽ vào trong bằng `outline-offset: -3px` để không đổi bố cục | tức thì |
| NavDial, TabBar | Đổi trang | Kim cam trượt đến trạm mới theo đường lò xo: vượt 8 đến 18 px rồi về đúng trạm, kim lắc như con lắc, có vệt phẳng sau kim. Thước giật nhẹ khi kim chạm đích. Nếu tải trang đầy đủ thì kim đứng sẵn ở trạm hiện tại, không cần hoạt ảnh | Theo số trạm nhảy, tối đa 1,1 giây |
| Header MT, HeaderMobile | Bắt đầu dính khi cuộn | Thu gọn và vạch cam như mục 5.3. Giảm chuyển động hoặc Tắt hiệu ứng thì đổi tức thì | 320 ms |
| Thẻ vật phẩm | Rê chuột, lấy nét, chạm | Ống ngắm: bốn dấu góc siết vào, chữ thập gặp nhau giữa khay, góc chuyển cam, hình phóng 1,06, nhãn "ĐÃ KHÓA". Đang giữ thì lắc thở 1 px. Khay các thẻ khác mờ còn 0,55, chữ giữ nguyên. Rời thẻ tắt trong 120 ms | Khóa đủ trong 320 ms |
| Thẻ vật phẩm | Chọn | Hiện vòng `border/accent` 2 px và nhãn "ĐANG XEM". Máy tính mở cửa sổ chi tiết có Trước, Sau và Đóng (xem ngoại lệ ở mục 1) | 200 ms |
| Skeleton | Đang tải | Thanh xám nhấp nháy độ mờ 0,5 đến 1, 1200 ms, lặp | Tắt khi giảm chuyển động |
| Trang | Chuyển trang | Không có hiệu ứng chuyển trang | |

Khi `prefers-reduced-motion: reduce`: tắt trượt kim, tắt nhấp nháy skeleton, tắt mọi hoạt ảnh "Tín hiệu yếu" (xem ngoại lệ ở mục 1).

Hành vi bàn phím:

| Phần tử | Phím |
| --- | --- |
| NavDial, TabBar | Là danh sách liên kết thường. Tab đi qua từng mục. Mục hiện tại có `aria-current="page"` |
| Chip lọc | Nút bật tắt (`aria-pressed`) hoặc liên kết với tham số truy vấn. Chọn một giá trị thì chip khác bỏ chọn |
| Tab bảng xếp hạng | Liên kết có `aria-current="page"`. Mỗi bảng có địa chỉ riêng |
| Nút bật tắt (GHIM LÊN ĐẦU, THÔNG BÁO TRONG GAME) | Nhóm radio hai lựa chọn BẬT và TẮT, hoặc nút `role="switch"`. Phím Space đổi giá trị |
| Phân trang | Liên kết. Trang hiện tại có `aria-current="page"` |
| Thẻ vật phẩm | Liên kết đến trang chi tiết. Trên MT, khi bật JavaScript, nhấp sẽ chọn thẻ và cập nhật khối chi tiết phía dưới. Địa chỉ đổi thành `?chon=<slug>` |
| Soạn bài viết | Công cụ ĐẬM, NGHIÊNG, DANH SÁCH, LIÊN KẾT, ẢNH là nút. Tổ hợp phím chuẩn (Ctrl+B, Ctrl+I) nên hoạt động |

## 8. Trạng thái dữ liệu: rỗng, đang tải, lỗi

Nguồn: bảng "Trạng thái danh sách" (`62:1027`) và thành phần ListState (`59:163`). Áp dụng cho Tin tức, Kho đồ, Xếp hạng. Có thể dùng lại cho danh sách khác.

| Trạng thái | Khi nào | Cách trình bày | Hành động |
| --- | --- | --- | --- |
| Rỗng | Danh sách trả về 0 mục | Biểu tượng la bàn, tiêu đề, một câu giải thích lý do | Một nút giúp thoát: "XEM TẤT CẢ TIN", "XÓA BỘ LỌC", "XÓA TỪ KHÓA" |
| Đang tải | Đang chờ dữ liệu | Ba thanh xám tại đúng chỗ dữ liệu sẽ hiện, kèm tiêu đề và câu ngắn | Không có. Sau 8 giây chuyển sang Lỗi |
| Lỗi | Không tải được | Dấu "!" trong khung đỏ, tiêu đề, câu ngắn, không có mã lỗi kỹ thuật | Nút "THỬ LẠI". Giữ nguyên bộ lọc người dùng đã chọn |

Chi tiết:

- Rỗng phải nói lý do và đưa ra một việc có thể làm. Không dùng câu chung chung "Không có dữ liệu".
- Đang tải chỉ dùng skeleton cho danh sách. Với trang tin có nội dung dựng sẵn từ máy chủ, không cần trạng thái này lần đầu vào trang.
- Lỗi chỉ hiển thị khi yêu cầu thất bại. Không hiển thị mã HTTP hay chữ tiếng Anh.
- Văn bản tiếng Việt cho từng danh sách nằm trong `CONTENT-COPY.md`.

## 9. Truy cập (accessibility)

Mục tiêu: đạt WCAG 2.2 mức AA trên mọi trang công khai.

| Hạng mục | Quy tắc |
| --- | --- |
| Tương phản | Xem mục 2.4. Kiểm tra bằng công cụ trước khi hoàn tất mỗi thành phần |
| Lấy nét | Mọi phần tử tương tác có vòng 3 px `border/focus`. Không bao giờ dùng `outline: none` mà không thay thế |
| Mục tiêu chạm | Tối thiểu 44 x 44 px. Chip cao 46, nút M cao 44, tab của TabBar rộng 78 và cao 58 |
| Vùng chính | Mỗi trang có đúng một `h1`. Thứ tự tiêu đề không nhảy cấp |
| Vùng điều hướng | `header`, `nav` (có `aria-label="Điều hướng chính"`), `main`, `footer`. TabBar dùng `nav` riêng với `aria-label="Điều hướng nhanh"` |
| Liên kết bỏ qua | Có liên kết "Bỏ qua đến nội dung chính" ở đầu trang, hiện khi lấy nét |
| Biểu mẫu | Mỗi ô có nhãn gắn bằng `for` và `id`. Gợi ý và lỗi gắn bằng `aria-describedby`. Ô lỗi có `aria-invalid="true"`. Tóm tắt lỗi đặt ở đầu biểu mẫu và nhận lấy nét sau khi gửi |
| `autocomplete` | Email: `email`. Tên hiển thị: `username`. Mật khẩu đăng nhập: `current-password`. Mật khẩu mới: `new-password` |
| Hình ảnh | Hình vật phẩm có `alt` là tên vật phẩm. Họa tiết có `alt=""` hoặc nằm trong CSS |
| Màu không phải kênh duy nhất | Trạng thái đang chọn có thêm vòng và nhãn chữ, không chỉ đổi màu. Lỗi có thêm văn bản |
| Thông báo động | Kết quả tải lại danh sách và lỗi gửi biểu mẫu báo qua `aria-live="polite"` |
| Giảm chuyển động | Xem mục 7 |
| Phóng to chữ | Giao diện vẫn dùng được khi chữ lớn gấp 2 (200 phần trăm). Dùng `rem` cho cỡ chữ. Không đặt chiều cao cố định cho khung có chữ |
| Trạng thái "đang trực tuyến" | Chấm xanh luôn đi kèm chữ "TRỰC TUYẾN" |

## 10. Hiệu năng và SEO

Mục tiêu phù hợp tiêu chí thành công trong PRD (nhanh trên điện thoại). Đo trên điện thoại tầm trung với mạng 4G.

| Chỉ số | Mục tiêu |
| --- | --- |
| LCP (nội dung lớn nhất) | không quá 2,5 giây |
| CLS (nhảy bố cục) | không quá 0,05 |
| INP (độ trễ thao tác) | không quá 200 ms |
| JavaScript trang công khai | không quá 165 KB nén (gzip) |
| Font nạp ban đầu | không quá 120 KB (ba tệp preload) |
| Trọng lượng trang chủ ĐT | không quá 700 KB không tính hình dưới màn hình đầu |

Cách làm:

- Bản dựng tĩnh (đã chọn ở D-11): khi build, dựng sẵn một tệp HTML cho mỗi đường dẫn công khai, có `title`, `meta description`, thẻ Open Graph và khung trang. Nội dung ít đổi (Tải game, Quy tắc cộng đồng) dựng sẵn đủ chữ. Danh sách động (Tin tức, Kho đồ, Xếp hạng) lấy bằng Axios sau khi trang tải, nên hiện khung xương (ListState Loading) trước. Bài viết và vật phẩm chi tiết nên dựng sẵn lại khi có nội dung mới. Chi tiết nằm ở `IMPLEMENTATION-PLAN.md` mục 2. Mục tiêu LCP ở trang danh sách có thể không đạt 2,5 giây nếu chỉ dựa vào dữ liệu lấy lúc chạy, nên cần đo ở bước hoàn thiện (E5).
- Hình: WebP hoặc AVIF, có `width` và `height`, lười tải (`loading="lazy"`) cho hình dưới màn hình đầu. Ảnh lớn nhất đầu trang (hình AK-74 trong Locker) nạp ưu tiên (`fetchpriority="high"`).
- Hai họa tiết vẽ bằng CSS hoặc SVG nhỏ. Không tải ảnh PNG lớn cho nền.
- Mỗi trang có `title`, `meta description`, `link rel="canonical"` và thẻ Open Graph. Mẫu tiêu đề: "Tên trang | Infestation Việt Nam".
- `sitemap.xml` và `robots.txt`. Trang đăng nhập, đăng ký, hồ sơ, quản trị đặt `noindex`.
- Chuyển hướng 301 từ địa chỉ cũ của site cũ (xem `ROUTES-AND-DATA.md`).
- Bảng xếp hạng và kho đồ dùng phân trang có địa chỉ riêng để công cụ tìm kiếm lập chỉ mục.

## 11. Quy ước đặt tên khi code (đề xuất)

| Loại | Quy ước | Ví dụ |
| --- | --- | --- |
| Biến CSS màu | `--color-<nhóm>-<tên>` từ token ngữ nghĩa | `--color-bg-page`, `--color-text-muted`, `--color-accent-default` |
| Biến CSS khoảng cách | `--space-1` đến `--space-9` | `--space-5` |
| Biến CSS chữ | `--font-display`, `--font-heading`, `--font-body`, `--font-data` | |
| Kiểu chữ | Lớp tiện ích theo tên Figma, chữ thường, gạch nối | `.text-display-l`, `.text-label-m` |
| Thành phần | PascalCase theo tên Figma | `Button`, `Tag`, `Field`, `NavDial`, `StatusStrip`, `ItemSlot`, `RankRow`, `NewsRow`, `TabBar`, `Wordmark`, `Header`, `Footer`, `HeaderMobile`, `Chip`, `PageTitle`, `ListState`, `Checkbox`, `Toggle`, `UserChip`, `AccountMenu`, `HeaderUser`, `HeaderMobileUser` |
| Biến thể | Thuộc tính cùng tên và giá trị cùng tên với Figma | `<Button type="primary" size="m">` |
| Tệp hình | Xem `ASSET-MAP.md` | `items/asr-ak74.webp` |

Giữ tên Figma ở mức có thể để người thiết kế và lập trình cùng gọi một tên.

## 12. Khoảng trống, giả định và rủi ro đã biết

Mức ảnh hưởng: Cao (chặn việc code hoặc làm sai mục tiêu), Vừa (cần quyết sớm), Thấp (làm sau).

Cột Trạng thái: **Đã đóng** (không còn việc gì), **Đã thiết kế** (Figma có, còn chờ chủ dự án duyệt nội dung hoặc quyết định liên quan), **Mở** (còn việc). Cập nhật ngày 29/10/2026, sau vòng 3. Có 26 mã: 4 đã đóng, 11 đã thiết kế, 11 còn mở.

| Mã | Khoảng trống | Ảnh hưởng | Trạng thái | Xử lý |
| --- | --- | --- | --- | --- |
| G-01 | Viền ô nhập và chip dùng `border/strong`, chỉ đạt 1,49 đến 1,69 (cần 3) | Vừa | Đã đóng | Token `border/control` (#6f6c60, `VariableID:104:1361`) đã áp dụng cho ô nhập, chip, nút bật tắt, ô chọn, chip tài khoản. Đã đo lại: 3,27 đến 3,70 |
| G-02 | Không có thiết kế cho trang Tải game và Hướng dẫn | Cao | Đã thiết kế | MT `107:1097`, ĐT `108:310`. Nút tải trỏ tới bộ cài chưa có (D-04). Số phiên bản, dung lượng, yêu cầu máy là dữ liệu mẫu (A-21) |
| G-03 | Game chỉ chạy trên Windows nhưng người dùng ĐT thấy nút tải | Cao | Đã thiết kế | ĐT hiện khung "GAME CHỈ CHẠY TRÊN WINDOWS", nút tải ở trạng thái khóa và nút "SAO CHÉP LIÊN KẾT". Chờ chủ dự án duyệt (D-05) |
| G-04 | Không có trang chi tiết bài viết và chi tiết vật phẩm trên ĐT | Cao | Đã thiết kế | Bài viết: MT `109:1198`, ĐT `109:1679`. Vật phẩm: MT `110:1278`, ĐT `110:1814` |
| G-05 | Không có quên mật khẩu, đặt lại mật khẩu, đổi mật khẩu | Cao | Đã thiết kế | Quên: `113:1398`, `113:1941`. Đặt lại: `113:1480`, `113:2003`. Đổi: `115:1455`, `115:2215`. Bảng sáu trạng thái xác thực: `114:1436`, `114:1940`. Thời hạn liên kết 30 phút, gửi lại sau 60 giây, khóa 15 phút là giả định (A-22) |
| G-06 | Không có luồng "Tạo nhân vật" | Vừa | Đã thiết kế, rồi bỏ | MT `115:1603`, ĐT `115:2271`. Chủ dự án chốt 29/10/2026: bỏ trang này, nhân vật tạo trong game. Giới hạn đổi từ 3 sang 5 nhân vật (A-23) |
| G-07 | Các mục quản trị Vật phẩm, Banner, Người dùng, Nhật ký chưa có thiết kế | Vừa | Đã thiết kế | Danh sách Bài viết: `118:2045`, `119:2856`. Vật phẩm: `118:2186`, `119:2937`. Banner: `118:2356`, `119:3056`. Người dùng: `118:2462`, `119:3131`. Nhật ký: `118:2607`, `119:3215`. Form thêm hoặc sửa vật phẩm đã vẽ ở phiên 3 (G-23). Chi tiết người dùng đã vẽ ở phiên 4: `171:2870`, `172:1027`. Ý nghĩa của Banner là giả định (A-24) |
| G-08 | Không có trang 404, 500 và trạng thái "máy chủ ngoại tuyến" | Vừa | Đã thiết kế | 404: `116:1760`, `116:2516`. 500: `116:1836`, `116:2533`. Trạng thái ngoại tuyến của thanh trạng thái đã vẽ ở phiên 3 (`155:363`, G-25). Không làm trang ngoại tuyến vì website không phải PWA |
| G-09 | Không có biến thể Header khi đã đăng nhập | Vừa | Đã thiết kế | UserChip `112:215`, AccountMenu `112:231`, HeaderUser `112:477`, HeaderMobileUser `112:479`. Bảng ghép: `120:3042`, `120:3221`. Hồ sơ và Xếp hạng đã dùng HeaderUser |
| G-10 | Trạng thái Hover, Focus và Disabled còn thiếu ở Chip, ItemSlot, NavDial, TabBar và nút M. Đã vẽ ở phiên 5 và đã code | Thấp | Đã thiết kế | Chip Disabled (`29:138`). ItemSlot Disabled (`20:109`, chủ dự án chọn vẽ). Nút M đủ Hover, Focus, Disabled và Pressed (`18:6`). Hover và Focus của trạm NavDial, tab TabBar và mục AccountMenu nằm ở bảng tham chiếu `184:363`, làm từ bản sao của khung thật, không phải thành phần mới. Chip và ItemSlot đã có Hover và Focus từ trước. Chủ dự án chốt ĐĂNG XUẤT giữ chữ đỏ khi Hover (C-70) |
| G-11 | Chip cuộn ngang không có dấu hiệu mép trong Figma | Thấp | Mở | Thêm bóng mờ ở mép phải khi code. Ở trang quản trị ĐT, chip bộ lọc xuống dòng, chỉ hàng chip điều hướng mục quản trị cuộn ngang |
| G-12 | Xếp hạng ĐT có thể dài nhiều dòng khi tên dài | Thấp | Mở | Tối đa 2 dòng và cắt bằng dấu ba chấm |
| G-13 | Quảng cáo "MIỄN PHÍ", "24/7", "Windows", các liên kết mạng xã hội là giả định. Đã bỏ dòng pháp lý (A-06) và kênh Zalo (A-07) | Vừa | Mở | Chủ dự án xác nhận từng mục. Xem `CONTENT-COPY.md`, mục 9 |
| G-14 | Mọi số liệu, tên, ngày, tin trong thiết kế là dữ liệu mẫu | Thấp | Mở | Thay bằng dữ liệu thật. Không dùng tên thật của người chơi từ site cũ |
| G-15 | Quyền dùng hình game chưa được xác nhận | Cao | Mở | Hỏi chủ sở hữu hoặc thay bằng hình tự làm trước khi công khai (A-20) |
| G-16 | Giao diện game gốc là SWF nên website là mặt phẳng tự thiết kế, không giống menu game | Thấp | Đã đóng | Chấp nhận. Đồng bộ màu và nét chữ, không sao chép menu game |
| G-17 | Không có nguyên mẫu tương tác trong Figma (hover, TabBar cố định, chip cuộn ngang chỉ là hình tĩnh) | Thấp | Mở | Dùng bảng trong mục 7 |
| G-18 | Tên hướng thiết kế chưa vào bảng thuật ngữ chính thức | Thấp | Đã đóng | Dòng "Tần số sinh tồn" đã ghi vào `docs/CONTEXT.md` ngày 29/10/2026 |
| G-19 | Tab GIA TỘC của bảng xếp hạng chưa có cột riêng. Site cũ có 8 bảng, thiết kế chỉ có 3 tab | Vừa | Đã thiết kế | MT `116:2736`, ĐT `117:2636` (cột: hạng, huy hiệu, tên gia tộc, số thành viên, GameDollar, XP). Chủ dự án vẫn cần chọn bảng nào hiện (D-03) |
| G-20 | Quản trị trên ĐT không có thanh hành động dính | Thấp | Đã thiết kế | Thanh dính "LƯU NHÁP" và "ĐĂNG BÀI" đã thêm vào `71:279` (cao 89, đặt cuối màn hình đầu tiên) |
| G-21 | Ô mật khẩu chưa có nút "HIỆN" và "ẨN". Đăng nhập chưa có ô "Ghi nhớ đăng nhập" | Thấp | Đã đóng | Field có `Show action` và đã dùng ở đăng nhập, đăng ký, đặt lại và đổi mật khẩu. Thành phần Checkbox `106:215` đã có sẵn nhưng chưa đặt vào trang đăng nhập, vì ô "Ghi nhớ" không bắt buộc ở bản đầu |
| G-22 | Trang "Quy tắc cộng đồng" chưa có | Vừa | Đã thiết kế | MT `116:1623`, ĐT `116:2550`. Nội dung bốn quy tắc và mức xử lý là bản mẫu, cần chủ dự án duyệt (A-25) |
| G-23 | Form thêm hoặc sửa vật phẩm: đã vẽ ở phiên 3 (`156:2378`, `156:2723`, `160:915`, `160:1145`) và đã code. Trang chi tiết người dùng trong quản trị đã vẽ ở phiên 4 (`171:2870` bản 1440, `172:1027` bản 390) và đã code | Vừa | Đã thiết kế | Form vật phẩm và chi tiết người dùng dùng lại khung soạn bài. Chi tiết người dùng có bốn khung: thông tin, xếp hạng và bang, nhân vật (tối đa 5), nhật ký thao tác. Nội dung do nhóm code soạn (C-62) |
| G-24 | Toggle chưa có Focus và Disabled. UserChip và mục AccountMenu chưa có Hover và Focus. Đã vẽ ở phiên 5 và đã code | Thấp | Đã thiết kế | Toggle `106:230` thêm Off Focus, On Focus, Off Disabled, On Disabled. UserChip `112:215` thêm Hover và Focus cho Full và Icon. Mục AccountMenu nằm ở bảng tham chiếu `184:363` |
| G-25 | Thanh trạng thái có biến thể "MÁY CHỦ NGOẠI TUYẾN" | Thấp | Đã thiết kế | `155:363` (bộ `155:369`). Chấm rỗng, chữ màu `text/muted`. Bật bằng `?mock=offline`. Nguồn trạng thái thật phụ thuộc D-02 |
| G-26 | Dải Banner công khai: đã vẽ ở phiên 3 (`155:385`, trang mẫu `158:2480` và `158:4043`) và đã code (`BannerStrip`). Trạng thái "đã tắt trong khoảng ngày" của cột TRẠNG THÁI trong quản trị vẫn chưa vẽ | Vừa | Đã thiết kế | Đặt trên cùng mọi trang công khai, trước StatusStrip. Có nút đóng trong phiên. Cần chủ dự án xác nhận ý nghĩa của Banner (A-24) |
