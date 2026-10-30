# Đặc tả từng trang

Tệp này mô tả 24 trang sản phẩm (27 khung MT và 26 khung ĐT, gồm cả 3 bảng tham chiếu). Tám trang đầu có từ vòng 1 và 2, phần còn lại thêm ở vòng 3 (mục 11). Mỗi trang ghi: mã Figma, đường dẫn, quyền truy cập, các khối theo thứ tự từ trên xuống, dữ liệu cần và hành vi. Chữ trên giao diện lấy từ Figma, bản đầy đủ nằm trong `CONTENT-COPY.md`. Thành phần xem `COMPONENTS.md`. Giá trị màu, chữ xem `DESIGN-SPEC.md` và `design-values.json`.

Viết tắt: MT là bản máy tính (khung 1440). ĐT là bản điện thoại (khung 390). Số kích thước dạng "rộng x cao".

Bảng tóm tắt:

| # | Trang | Đường dẫn đề xuất | Truy cập | MT | ĐT |
| --- | --- | --- | --- | --- | --- |
| 1 | Trang chủ | `/` | Công khai | `24:2` | `39:2` |
| 2 | Tin tức | `/tin-tuc` | Công khai | `30:224` | `65:110` |
| 3 | Kho đồ | `/kho-do` | Công khai | `32:365` | `41:46` |
| 4 | Xếp hạng | `/xep-hang` | Công khai | `34:571` | `66:393` |
| 5 | Đăng nhập | `/dang-nhap` | Khách | `36:808` | `67:190` |
| 6 | Đăng ký | `/dang-ky` | Khách | `36:869` | `67:234` |
| 7 | Hồ sơ | `/ho-so` | Đã đăng nhập | `37:856` | `68:294` |
| 8 | Quản trị (bài viết) | `/quan-tri/bai-viet/moi` | Quản trị viên | `38:954` | `71:279` |
| 9 | Bảng trạng thái danh sách | Không phải trang sản phẩm | Không | `62:1027` | Không |
| 10 | Tải game | `/tai-game` | Công khai | `107:1097` | `108:310` |
| 11 | Chi tiết bài viết | `/tin-tuc/:slug` | Công khai | `109:1198` | `109:1679` |
| 12 | Chi tiết vật phẩm | `/kho-do/:slug` | Công khai | `110:1278` | `110:1814` |
| 13 | Quên mật khẩu | `/quen-mat-khau` | Khách | `113:1398` | `113:1941` |
| 14 | Đặt lại mật khẩu | `/dat-lai-mat-khau` | Khách có mã | `113:1480` | `113:2003` |
| 15 | Bảng trạng thái xác thực | Không phải trang sản phẩm | Không | `114:1436` | `114:1940` |
| 16 | Đổi mật khẩu | `/ho-so/doi-mat-khau` | Đã đăng nhập | `115:1455` | `115:2215` |
| 17 | Tạo nhân vật (đã bỏ khỏi bản code, A-23) | `/ho-so/nhan-vat/moi` | Đã đăng nhập | `115:1603` | `115:2271` |
| 18 | Quy tắc cộng đồng | `/quy-tac` | Công khai | `116:1623` | `116:2550` |
| 19 | Trang 404 | Đường dẫn không có | Mọi người | `116:1760` | `116:2516` |
| 20 | Trang 500 | Khi máy chủ lỗi | Mọi người | `116:1836` | `116:2533` |
| 21 | Xếp hạng gia tộc | `/xep-hang?bang=gia-toc` | Công khai | `116:2736` | `117:2636` |
| 22 | Quản trị: Bài viết (danh sách) | `/quan-tri/bai-viet` | Quản trị viên | `118:2045` | `119:2856` |
| 23 | Quản trị: Vật phẩm | `/quan-tri/vat-pham` | Quản trị viên | `118:2186` | `119:2937` |
| 24 | Quản trị: Banner | `/quan-tri/banner` | Quản trị viên | `118:2356` | `119:3056` |
| 25 | Quản trị: Người dùng | `/quan-tri/nguoi-dung` | Quản trị viên | `118:2462` | `119:3131` |
| 26 | Quản trị: Nhật ký | `/quan-tri/nhat-ky` | Quản trị viên | `118:2607` | `119:3215` |
| 27 | Bảng đầu trang khi đã đăng nhập | Không phải trang sản phẩm | Không | `120:3042` | `120:3221` |

Mọi khối có dữ liệu động ghi rõ cột "Dữ liệu". Thực thể dữ liệu (Account, NewsPost, Item, RankingEntry, Clan, Character) định nghĩa trong `ROUTES-AND-DATA.md`.

## 1. Trang chủ

Mục đích: giúp người mới hiểu máy chủ là gì và đi tới "tạo tài khoản" hoặc "tải game" trong vài giây. Mục tiêu chính của cả website.

SEO: tiêu đề "Infestation Việt Nam | Máy chủ sinh tồn tiếng Việt". Mô tả: một câu về tạo tài khoản, tải game, miễn phí (khi đã xác nhận).

### 1.1 Bản MT (`24:2`, 1440 x 4057)

| # | Khối | Kích thước | Nội dung | Dữ liệu |
| --- | --- | --- | --- | --- |
| 1 | StatusStrip | 1440 x 44 | Trạng thái máy chủ, số người chơi | Trạng thái máy chủ, số người đang chơi |
| 2 | Header (Active Home) | 1440 x 96 | Wordmark, NavDial, nút | Phiên đăng nhập |
| 3 | Hero | 1440 x 720, đệm ngang 64, khoảng cách 48, nền họa tiết | Cột trái Intro 640: nhãn "MÁY CHỦ INFESTATION TIẾNG VIỆT" (thanh 32 x 3), Display/XL hai dòng "NƠI SINH TỒN" và "KHẮC NGHIỆT" (dòng hai màu `text/accent`), đoạn dẫn Body/L rộng 560, nút Primary L "TẢI GAME" và Secondary L "XEM HƯỚNG DẪN", dòng nhỏ "MIỄN PHÍ · DÀNH CHO MÁY TÍNH WINDOWS". Cột phải Locker 624 x 592 | Không. Locker là nội dung chọn sẵn |
| 4 | Facts | 1440 x 140, nền `bg/inset` | 4 ô: "34 NGƯỜI ĐANG CHƠI", "24/7 MÁY CHỦ HOẠT ĐỘNG", "TIẾNG VIỆT GIAO DIỆN VÀ HƯỚNG DẪN", "MIỄN PHÍ TẢI VỀ VÀ CHƠI" | Số người chơi |
| 5 | Ba bước | Đệm 96 / 64, khoảng cách 48 | SectionHead ("01 · BẮT ĐẦU", H1 "BA BƯỚC VÀO GAME", đoạn dẫn), RadioLine, 3 StepCard 416 x 354 (khoảng cách 32) | Không |
| 6 | Tin mới và Top sinh tồn | Nền `bg/inset`, đệm 96 / 64, khoảng cách 48 | Cột trái 704: H1 "TIN MỚI" và 5 NewsRow. Cột phải 560: H1 "TOP SINH TỒN", TableHead và 5 RankRow | 5 bài mới nhất, 5 người hạng cao nhất theo GameDollar |
| 7 | Kho đồ sinh tồn | Đệm 96 / 64, khoảng cách 48 | SectionHead ("02 · KHO ĐỒ", H1 "KHO ĐỒ SINH TỒN", đoạn dẫn) kèm Ghost M "XEM TOÀN BỘ KHO ĐỒ", hàng 4 ItemSlot (khoảng cách 32): AK-74, BA LÔ 32 Ô, BỘ Y TẾ, RÌU CỨU HỎA | 4 vật phẩm nổi bật do quản trị chọn (hoặc cố định ở bản đầu) |
| 8 | CTA | Đệm 0 / 64 / 96 / 64. Khung 1312 x 340, đệm 64, nền `bg/panel` và họa tiết, 4 dấu góc | Nhãn "THAM GIA NGAY", Display/L "SẴN SÀNG SỐNG SÓT?", câu dẫn, nút Primary L "ĐĂNG KÝ TÀI KHOẢN" và Secondary L "XEM HƯỚNG DẪN" | Không |
| 9 | Footer | 1440 x 405 | Xem COMPONENTS.md | Không |

Locker (hình trong Hero): tiêu đề "TÚI ĐỒ KHỞI ĐẦU" và "05 MÓN". Hình lớn AK-74 (528 x 322), chú thích Callout "AK-74 / SÚNG TRƯỜNG", đường kẻ, bốn hình nhỏ (128 x 78): "BA LÔ 32 Ô", "BỘ Y TẾ", "LA BÀN", "ĐỒ HỘP".

Ba bước (StepCard): 01 "TẠO TÀI KHOẢN" (nút "ĐĂNG KÝ NGAY"), 02 "TẢI VÀ CÀI GAME" (nút "TẢI GAME"), 03 "VÀO TRẬN" (nút "XEM HƯỚNG DẪN"). Mỗi thẻ có icon bước (Use, Collect, GoTo).

### 1.2 Bản ĐT (`39:2`, 390 x 5855)

| # | Khối | Nội dung |
| --- | --- | --- |
| 1 | HeaderMobile | Wordmark S và "ĐĂNG NHẬP" |
| 2 | Intro | Đệm 32 / 20 / 0 / 20, khoảng cách 20. Nhãn, Display/L hai dòng, đoạn dẫn Body/M, hai nút Primary L và Secondary L xếp dọc, giãn hết khung, khoảng cách 12. Dòng nhỏ "MIỄN PHÍ · DÀNH CHO MÁY TÍNH WINDOWS" |
| 3 | Locker | 350 x 340. Hình lớn 310 x 189, bốn hình nhỏ 70 x 43 (nhãn ngắn: BA LÔ, Y TẾ, LA BÀN, ĐỒ HỘP) |
| 4 | Facts | Lưới 2 x 2, nền `bg/inset`, mỗi ô 195 x 110 |
| 5 | Ba bước | Đệm 56 / 20, khoảng cách 24. Head, RadioLine, 3 StepCard 350 x 310 xếp dọc (khoảng cách 16) |
| 6 | Tin mới | Nền `bg/inset`. H1 "TIN MỚI", 4 NewsCard, Secondary M "XEM TẤT CẢ TIN" giãn hết khung |
| 7 | Top sinh tồn | H1 "TOP SINH TỒN", nhãn số liệu "GAMEDOLLAR", 5 dòng, Secondary M "XEM BẢNG XẾP HẠNG" |
| 8 | Kho đồ sinh tồn | Nền `bg/inset`. Head, lưới 2 x 2 MiniSlot (khoảng cách 12), Secondary M "XEM TOÀN BỘ KHO ĐỒ" |
| 9 | CTA | Khung 350 x 468, thước ở trên, thân đệm 24 |
| 10 | Footer | 390 x 657, 2 cột |
| 11 | TabBar (Home) | Cố định đáy |

Hành vi: nút "TẢI GAME" dẫn tới `/tai-game`. "XEM HƯỚNG DẪN" dẫn tới `/tai-game#huong-dan`. "ĐĂNG KÝ NGAY" và "ĐĂNG KÝ TÀI KHOẢN" dẫn tới `/dang-ky`. Cần xử lý riêng cho người dùng ĐT khi bấm "TẢI GAME" (G-03).

## 2. Tin tức

Mục đích: danh sách bài viết do quản trị đăng. Tiêu đề: "Tin tức | Infestation Việt Nam".

### 2.1 Bản MT (`30:224`, 1440 x 1981)

| # | Khối | Nội dung | Dữ liệu |
| --- | --- | --- | --- |
| 1 | StatusStrip, Header (Active News) | | |
| 2 | PageTitle | Crumb "TRANG CHỦ / TIN TỨC", Display/L "TIN TỨC", đoạn dẫn "Cập nhật, sự kiện và hướng dẫn mới nhất từ máy chủ Infestation Việt Nam." | |
| 3 | Content (đệm 48 / 64 / 96 / 64, khoảng cách 32) | | |
| 3a | Filters | Hàng Chip (khoảng cách 12): TẤT CẢ (chọn), TIN TỨC, HƯỚNG DẪN, SỰ KIỆN, CẬP NHẬT. Bên phải là tổng "28 BÀI VIẾT" (Label/L `text/muted`) | Loại và tổng số bài |
| 3b | Featured | 1312 x 390. Bài nổi bật: ảnh, Tag, tiêu đề Heading/H1, tóm tắt Body/L, ngày và tác giả "30/10/2026 · BAN QUẢN TRỊ", nút Primary M "ĐỌC TIẾP" | Bài ghim hoặc mới nhất |
| 3c | List | 7 NewsRow | Bài trong trang |
| 3d | Pagination | TRƯỚC, 1, 2, 3, 4, SAU | Số trang |
| 4 | Footer | | |

Quy tắc đề xuất: mỗi trang 8 bài (1 nổi bật và 7 dòng). Bài nổi bật không lặp lại trong danh sách (bản vẽ Figma có lặp bài "Cuối tuần nhân đôi kinh nghiệm" vì dữ liệu mẫu). Bài nổi bật chỉ hiện ở trang 1 và khi không lọc. Trang 2 trở đi và khi lọc: hiện 8 dòng, không có Featured. Bộ lọc là liên kết dạng `/tin-tuc?loai=su-kien` (xem ROUTES-AND-DATA). Sắp xếp mặc định mới nhất trước.

### 2.2 Bản ĐT (`65:110`, 390 x 2239)

HeaderMobile, Title (232), Controls (hàng chip cuộn ngang TẤT CẢ, TIN TỨC, HƯỚNG DẪN, SỰ KIỆN, CẬP NHẬT và dòng "28 bài viết" bên trái, "MỚI NHẤT" bên phải), FeaturedWrap (350 x 480), List (6 NewsCard), Pagination (TRƯỚC, 1, 2, 3, SAU), Footer, TabBar (News).

Trạng thái rỗng, đang tải, lỗi: dùng ListState, bản "TIN TỨC" (xem mục 9).

## 3. Kho đồ

Mục đích: tra cứu vật phẩm trong game. Tiêu đề: "Kho đồ | Infestation Việt Nam".

### 3.1 Bản MT (`32:365`, 1440 x 2508)

| # | Khối | Nội dung | Dữ liệu |
| --- | --- | --- | --- |
| 1 | PageTitle | "KHO ĐỒ", đoạn dẫn "Tra cứu mọi vật phẩm trong game: vũ khí, giáp, y tế, vật liệu và dụng cụ." | |
| 2 | Content ngang (đệm 48 / 64 / 96 / 64, khoảng cách 64) | | |
| 2a | Thanh bên 288 | Field "Tìm vật phẩm" (giữ chỗ "Nhập tên vật phẩm", gợi ý "Có 41 vật phẩm trong kho"). Nhãn "LOẠI VẬT PHẨM". 8 mục danh mục: TẤT CẢ 41, VŨ KHÍ 17, GIÁP VÀ BA LÔ 05, Y TẾ VÀ ĐỒ ĂN 06, DỤNG CỤ 05, VẬT LIỆU 03, THUỐC NỔ 04, ĐẠN 01 | Danh mục và số lượng |
| 2b | Chính 960 (khoảng cách 32) | | |
| | Toolbar | "41 VẬT PHẨM" bên trái. Bên phải "SẮP XẾP" và hai Chip: MỚI NHẤT (chọn), TÊN A-Z | Tổng số |
| | Lưới | 3 cột x 3 hàng ItemSlot, khoảng cách 24 (bản vẽ có 9 thẻ. Số thẻ thật mỗi trang xem `ROUTES-AND-DATA.md`, mục 10) | Vật phẩm trong trang |
| | Pagination | | Số trang |
| | Detail | 960 x 434. Chi tiết vật phẩm đang chọn (Selected) | Vật phẩm đang chọn |
| 3 | Footer | | |

Vật phẩm mẫu: AK-74 (SÚNG TRƯỜNG, "Sát thương 32 · Tầm xa 120"), AKM, FAL, MP5A4, Desert Eagle, Benelli M1, M82, Rìu nhỏ, Xà beng. Chi tiết AK-74: SÁT THƯƠNG 32, TẦM XA 120 m, TỐC ĐỘ BẮN 600/phút, BĂNG ĐẠN 30 viên. Mô tả mẫu: "Súng trường của người sống sót: dễ kiểm soát, bền, dùng tốt ở tầm trung. Phù hợp người mới."

Hành vi đề xuất: chọn danh mục hoặc gõ tìm thì tải lại danh sách qua tham số truy vấn (`?loai=vu-khi&q=ak&trang=2`). Chọn một thẻ thì cập nhật khối Detail và đặt `?chon=<slug>`. Khi chưa chọn thẻ nào, Detail hiện vật phẩm đầu tiên của trang. Chỉ số trong Detail khác nhau theo nhóm vật phẩm (vũ khí có sát thương, tầm xa, tốc độ bắn, băng đạn. Đồ y tế có hồi máu. Ba lô có số ô). Cần quy định bộ trường theo nhóm (xem ROUTES-AND-DATA, bảng Item).

### 3.2 Bản ĐT (`41:46`, 390 x 2049)

HeaderMobile, Title, Controls (Field "Tìm vật phẩm", hàng chip cuộn ngang 8 danh mục, dòng "41 VẬT PHẨM" và hai chip sắp xếp), Grid (4 hàng x 2 MiniSlot, 8 vật phẩm), Pagination (TRƯỚC, 1, 2, 3, SAU), Footer, TabBar (Items).

Khác bản MT: MiniSlot không có dòng chỉ số. Không có khối Detail. Chạm vào thẻ nên mở trang chi tiết riêng (G-04).

## 4. Xếp hạng

Mục đích: bảng xếp hạng người chơi. Tiêu đề: "Xếp hạng | Infestation Việt Nam".

### 4.1 Bản MT (`34:571`, 1440 x 2187)

| # | Khối | Nội dung | Dữ liệu |
| --- | --- | --- | --- |
| 1 | PageTitle | "XẾP HẠNG", đoạn dẫn "Bảng xếp hạng người chơi theo GameDollar, kinh nghiệm (XP) và gia tộc." | |
| 2 | Controls | Tabs: ba Chip GAMEDOLLAR (chọn), XP, GIA TỘC. Bên phải: Field "Tìm người chơi" (giữ chỗ "Nhập tên không dấu", gợi ý "Ví dụ: ThoSanDem. Gõ ít nhất 2 ký tự.") và nút "TÌM" | Bảng đang chọn, từ khóa |
| 3 | MyPosition | Nhãn "VỊ TRÍ CỦA TÔI" và một RankRow Me. Chỉ hiện khi đã đăng nhập và có trong bảng | Hạng của người đăng nhập |
| 4 | Table | TableHead (HẠNG, NGƯỜI CHƠI, GAMEDOLLAR, XP) và 12 dòng mẫu (3 Top, 9 Default) | Dòng của trang |
| 5 | Pagination | TRƯỚC, 1, 2, 3, 4, SAU | Số trang |

Hành vi đề xuất: tab đổi bảng bằng liên kết `/xep-hang?bang=xp`. Tìm theo tên không dấu (khớp một phần, tối thiểu 2 ký tự). Phân trang 50 dòng mỗi trang như site cũ (bản mẫu chỉ vẽ 12 dòng). Dòng của người đăng nhập luôn được đánh dấu Me nếu xuất hiện trong trang.

Chưa thiết kế: cột của bảng GIA TỘC (tab có nhưng chỉ vẽ nội dung người chơi, G-19). Site cũ có 8 bảng (gd, xp, time, survivor, bandits, hero, killbandit, zombie). Cần quyết định bảng nào hiện (câu hỏi mở trong PRD).

### 4.2 Bản ĐT (`66:393`, 390 x 2180)

HeaderMobile, Title, Controls (3 chip cuộn ngang, Field "Tìm người chơi", nút Primary M "TÌM"), MyRank ("VỊ TRÍ CỦA TÔI" và dòng Me), CountWrap ("12.480 người chơi"), Table (TableHead HẠNG, NGƯỜI CHƠI, GAMEDOLLAR và 10 dòng), Pagination, Footer, TabBar (Ranking).

Khác bản MT: một cột số liệu (theo chip đang chọn). Không có cột XP. Có dòng đếm tổng người chơi.

## 5. Đăng nhập

Mục đích: đưa người chơi đã có tài khoản vào Hồ sơ. Tiêu đề: "Đăng nhập | Infestation Việt Nam". `noindex`.

### 5.1 Bản MT (`36:808`, 1440 x 935)

StatusStrip, AuthBar (Wordmark L và Ghost M "QUAY LẠI TRANG CHỦ"), Main chia hai nửa:

- Trái, Visual 720 (đệm 64, nền `bg/panel` và họa tiết): Intro (nhãn "TÀI KHOẢN", Display/L hai dòng "VÀO LẠI VÙNG ĐẤT" và "SINH TỒN", đoạn dẫn "Đăng nhập để xem nhân vật, kho đồ và vị trí của bạn trên bảng xếp hạng."), dải hình vật phẩm (4 hình).
- Phải, Form 720 (đệm 80 / 64, nền `bg/page`): FormCard 520 gồm H1 "ĐĂNG NHẬP", Field "Email" (gợi ý "Email đã dùng để đăng ký tài khoản"), Field "Mật khẩu" (gợi ý "Phân biệt chữ hoa và chữ thường"), Ghost M "QUÊN MẬT KHẨU?", Primary L "ĐĂNG NHẬP", đường kẻ, "Chưa có tài khoản?" kèm Ghost M "ĐĂNG KÝ NGAY".

### 5.2 Bản ĐT (`67:190`, 390 x 1092)

AuthBar 72 (Wordmark S và Ghost M "TRANG CHỦ"), Intro (nhãn "TÀI KHOẢN", Display/M "VÀO LẠI VÙNG ĐẤT SINH TỒN", đoạn dẫn), dải 3 hình (cao 95, nền `bg/inset`), FormWrap với FormCard 350. Không có TabBar và Footer.

Hành vi đề xuất:

- Gửi bằng POST. Thành công: chuyển tới trang đích (`?tiep=` nếu hợp lệ và nội bộ, mặc định `/ho-so`).
- Sai email hoặc mật khẩu: một thông báo chung ở đầu khung, không nói sai ô nào. Giữ lại email.
- Giới hạn số lần thử (xem ROUTES-AND-DATA, bảo mật). Không dùng captcha trong bản đầu nếu chưa cần.
- Chưa vẽ nút "HIỆN" mật khẩu và ô "Ghi nhớ đăng nhập" (G-21). Hai mục này không bắt buộc ở bản đầu.

## 6. Đăng ký

Mục đích: tạo tài khoản. Tiêu đề: "Đăng ký | Infestation Việt Nam". `noindex`.

### 6.1 Bản MT (`36:869`, 1440 x 1179) và ĐT (`67:234`, 390 x 1384)

Cùng cấu trúc với Đăng nhập. Visual: nhãn "TÀI KHOẢN MỚI", Display "BƯỚC ĐẦU TIÊN ĐỂ SỐNG SÓT", đoạn dẫn "Tạo tài khoản miễn phí. Chỉ cần email, tên hiển thị và mật khẩu." FormCard (MT 520, ĐT 350) gồm H1 "TẠO TÀI KHOẢN" (ĐT dùng H2) và bốn Field:

| Ô | Giữ chỗ hoặc mẫu | Gợi ý | Ghi chú |
| --- | --- | --- | --- |
| Email | nguoisongsot@email.com | "Dùng để đăng nhập và lấy lại mật khẩu" | `type="email"`, `autocomplete="email"` |
| Tên hiển thị | ThoSanDem | "Tên không được có dấu hay dấu cách. Ví dụ: ThoSanDem" | Figma vẽ ô này ở trạng thái Error làm mẫu. `autocomplete="username"` |
| Mật khẩu | | "Ít nhất 8 ký tự" | `autocomplete="new-password"`. Mức tối thiểu 8 là giả định |
| Nhập lại mật khẩu | | "Gõ lại đúng mật khẩu ở trên" | `autocomplete="new-password"` |

Tiếp theo: Primary L "TẠO TÀI KHOẢN", ghi chú "Bằng việc đăng ký, bạn đồng ý với quy tắc cộng đồng." (cụm "quy tắc cộng đồng" nên là liên kết, trang chưa có, G-22), đường kẻ, "Đã có tài khoản?" kèm Ghost M "ĐĂNG NHẬP".

Quy tắc kiểm tra (đề xuất, chờ chủ dự án xác nhận với dữ liệu thật):

- Email hợp lệ và chưa dùng.
- Tên hiển thị: chỉ chữ không dấu và số, viết liền, độ dài 3 đến 16 ký tự (theo site cũ là "Không dấu, viết liền mạch"). Chưa dùng.
- Mật khẩu: tối thiểu 8 ký tự. Hai ô khớp nhau.
- Kiểm tra cả phía người dùng (nhanh) và phía máy chủ (bắt buộc).

Thông báo lỗi từng ô nằm trong `CONTENT-COPY.md`, mục 6.

## 7. Hồ sơ

Mục đích: trang cá nhân của người chơi đã đăng nhập. Tiêu đề: "Hồ sơ | Infestation Việt Nam". `noindex`. Chưa đăng nhập: chuyển tới `/dang-nhap?tiep=/ho-so`.

### 7.1 Bản MT (`37:856`, 1440 x 1743)

PageTitle ("HỒ SƠ", đoạn dẫn "Tài khoản, nhân vật và thành tích của bạn trên máy chủ."). Content ngang (đệm 48 / 64 / 96 / 64, khoảng cách 48):

| Khối | Nội dung | Dữ liệu |
| --- | --- | --- |
| AccountCard (rộng 400) | Huy hiệu gia tộc, tên tài khoản, gia tộc, "ĐANG TRỰC TUYẾN". Ba dòng: EMAIL (che, ví dụ "n***@email.com"), NGÀY THAM GIA "12/03/2026", TRẠNG THÁI "Đã kích hoạt". Hai nút Secondary M "ĐỔI MẬT KHẨU" và Ghost M "ĐĂNG XUẤT" | Tài khoản, trạng thái trực tuyến |
| Stats (4 thẻ 204 x 122) | HẠNG 128, GAMEDOLLAR 312.450, KINH NGHIỆM (XP) 9.870, CẤP 14 | Chỉ số tài khoản hoặc nhân vật chính |
| Nhân vật | SectionHead "NHÂN VẬT" (bản code bỏ nút Ghost M "TẠO NHÂN VẬT", A-23). Hai Character: ThoSanDem01 (Cấp 14 · Thợ săn, Tag "ĐANG CHƠI", vũ khí AK-74, "87 đêm"), ThoSanDem02 (Cấp 6 · Người nhặt đồ, 19 đêm) | Nhân vật của tài khoản |
| Kỹ năng | SectionHead "KỸ NĂNG". 6 ô Skill: THỂ LỰC, BẮN SÚNG, SINH TỒN (ĐÃ MỞ), Y TẾ, CHẾ TẠO, CẬN CHIẾN (CHƯA MỞ) | Kỹ năng đã mở |

### 7.2 Bản ĐT (`68:294`, 390 x 2698)

HeaderMobile, Title, Content (đệm 0 / 20 / 56 / 20, khoảng cách 32): AccountCard 350 x 447, Stats (2 hàng x 2 thẻ 169 x 110), Nhân vật (SectionHead, 2 Character 350 x 292), Kỹ năng (2 hàng x 3 ô 109 x 144), Footer, TabBar (Profile).

Ghi chú dữ liệu: email luôn che một phần. Chữ "Cấp 14 · Thợ săn" là ví dụ (nghề nghiệp không chắc có trong dữ liệu game, G-14). Bốn chỉ số thống kê cần nguồn dữ liệu xác định (xem ROUTES-AND-DATA).

## 8. Quản trị (đăng bài viết)

Mục đích: quản trị viên đăng bài không cần code. Tiêu đề: "Quản trị | Infestation Việt Nam". `noindex`. Chỉ vai trò quản trị.

### 8.1 Bản MT (`38:954`, 1440 x 1395)

Các mục khác của quản trị (danh sách bài, vật phẩm, banner, người dùng, nhật ký) nằm ở mục 11.9. Không có StatusStrip và Footer. Bố cục ngang gồm Sidebar 280 (nền `bg/inset`) và Main 1160 (đệm 48 / 64 / 96 / 64, khoảng cách 40).

| Khối | Nội dung |
| --- | --- |
| Sidebar | Wordmark L, nhãn "QUẢN TRỊ", 5 mục (BÀI VIẾT đang chọn, VẬT PHẨM, BANNER, NGƯỜI DÙNG, NHẬT KÝ), Ghost M "ĐĂNG XUẤT" ở đáy |
| Top | H1 "ĐĂNG BÀI MỚI" và hai nút: Secondary M "LƯU NHÁP", Primary M "XUẤT BẢN" |
| Cột soạn (640) | Field "Tiêu đề" (gợi ý "Tối đa 80 ký tự. Hiện có 30 ký tự."), nhóm PHÂN LOẠI (4 Chip: TIN TỨC, HƯỚNG DẪN, SỰ KIỆN, CẬP NHẬT), nhóm NỘI DUNG (Editor: thanh công cụ ĐẬM, NGHIÊNG, DANH SÁCH, LIÊN KẾT, ẢNH và vùng chữ), nhóm ẢNH ĐẠI DIỆN (DropZone "Kéo ảnh vào đây hoặc chọn từ kho hình" và nút "CHỌN ẢNH") |
| Cột cài đặt (360) | Khung "XUẤT BẢN": TRẠNG THÁI (Tag "BẢN NHÁP"), NGÀY ĐĂNG ("30/10/2026 08:00"), TÁC GIẢ ("Ban quản trị"), GHIM LÊN ĐẦU (BẬT, TẮT), THÔNG BÁO TRONG GAME (BẬT, TẮT), nút Primary L "XUẤT BẢN NGAY" và Secondary L "LƯU NHÁP" |
| Recent | H2 "BÀI GẦN ĐÂY" và 4 NewsRow (kèm Tag loại) |

### 8.2 Bản ĐT (`71:279`, 390 x 2414)

AdminBar 72 (Wordmark S và Ghost M "ĐĂNG XUẤT"), Nav (nhãn "QUẢN TRỊ" và hàng chip cuộn ngang 5 mục), Head ("ĐĂNG BÀI MỚI"), Form (Field "Tiêu đề", nhóm PHÂN LOẠI chip xuống dòng, nhóm NỘI DUNG, nhóm ẢNH ĐẠI DIỆN), Settings (350, các dòng khóa giá trị và hai nút), Recent (4 NewsCard). Không có TabBar. Có thanh hành động dính StickyActions (cao 89, "LƯU NHÁP" và "ĐĂNG BÀI") đặt ở đáy màn hình đầu tiên, thêm ở vòng 3 (G-20). Các nút trong khung Settings vẫn giữ để người dùng bàn phím và trình đọc màn hình thao tác theo thứ tự trang.

Hành vi đề xuất:

- Bản nháp được lưu khi bấm "LƯU NHÁP". Có thể tự lưu mỗi 30 giây (không bắt buộc).
- "XUẤT BẢN" và "XUẤT BẢN NGAY" cùng chức năng. Hai nút ở hai vị trí để tiện thao tác. Ngày đăng mặc định là lúc xuất bản và có thể hẹn giờ (đề xuất sau).
- Bộ soạn tạo HTML sạch, giới hạn thẻ cho phép (đoạn, tiêu đề cấp 2 và 3, danh sách, liên kết, ảnh, in đậm, in nghiêng). Làm sạch phía máy chủ trước khi lưu.
- "THÔNG BÁO TRONG GAME" cần kênh gửi vào game. Bản đầu chỉ lưu cờ, chưa gửi. Hoặc ẩn mục này cho tới khi có kênh (câu hỏi mở trong PRD).
- Nút "ĐĂNG XUẤT" trong Sidebar. Các mục khác có thiết kế danh sách ở mục 11.9 (G-07).

## 9. Bảng trạng thái danh sách (`62:1027`)

Không phải trang sản phẩm. Là bảng tham chiếu cho ListState: 3 danh sách (TIN TỨC, KHO ĐỒ, XẾP HẠNG) x 3 trạng thái (Rỗng, Đang tải, Lỗi), cộng khung "QUY TẮC CHUNG" (ba quy tắc). Chữ đầy đủ nằm trong `CONTENT-COPY.md`, mục 7. Quy tắc nằm trong `DESIGN-SPEC.md`, mục 8.

## 10. Khác biệt cố ý giữa MT và ĐT

Các điểm sau không phải lỗi. Chúng là quyết định thiết kế hoặc dữ liệu mẫu.

| Hạng mục | MT | ĐT |
| --- | --- | --- |
| Thanh trạng thái máy chủ | Có | Không có |
| Đầu trang | Wordmark L, NavDial, hai nút | Wordmark S, một nút "ĐĂNG NHẬP" |
| Điều hướng chính | NavDial trong Header | TabBar cố định ở đáy |
| Chân trang | 4 khối (thương hiệu và 3 cột) | 2 cột rút gọn, đệm dưới 112 |
| Dải số liệu trang chủ | "MIỄN PHÍ", "TIẾNG VIỆT" | "0 ĐỒNG", "100% TIẾNG VIỆT" |
| Nút cuối mục trang chủ | "XEM TẤT CẢ", "BẢNG XẾP HẠNG" | "XEM TẤT CẢ TIN", "XEM BẢNG XẾP HẠNG" |
| Thẻ vật phẩm | ItemSlot 304 x 292 có chỉ số | MiniSlot 169 x 190 không có chỉ số |
| Chi tiết vật phẩm | Khối Detail ngay dưới lưới ở Kho đồ, và trang riêng `/kho-do/:slug` | Trang riêng `/kho-do/:slug` (mục 11.3), không có khối Detail dưới lưới |
| Bảng xếp hạng | 4 cột (có XP) | 1 cột số liệu theo chip, có dòng "12.480 người chơi" |
| Tin tức | NewsRow ngang | NewsCard dọc |
| Vùng thả ảnh quản trị | "Kéo ảnh vào đây hoặc chọn từ kho hình" | "Chọn ảnh từ máy hoặc từ kho hình" |
| Xác thực | Hai nửa | Cột đơn, dải hình 95 |
| Quản trị | Sidebar, bảng (AdminTable) hoặc hai cột | Thanh trên, chip điều hướng cuộn ngang, cột đơn, danh sách là thẻ (AdminCard), trang soạn bài có thanh hành động dính |
| Tải game | Khung tải và bảng yêu cầu máy cạnh nhau | Khung cảnh báo Windows, nút tải khóa, nút sao chép liên kết |
| Đầu trang khi đã đăng nhập | Chip đầy đủ (ảnh, tên, mũi tên) và nút "TẢI GAME" | Chip gọn (chỉ ảnh đại diện) |
| Quy tắc cộng đồng | Mục lục bên trái và cột đọc 720 | Không có mục lục, cột đọc 350 |
| Dữ liệu mẫu | Ngày đầy đủ trong danh sách tin ("30/10/2026") | Ngày ngắn ("28/10") |
| TabBar trong ảnh chụp dài | Không có | Nằm chồng lên nội dung (cố định đáy theo thiết kế) |

## 11. Trang thiết kế ở vòng 3

Các trang dưới đây đã có trong Figma từ vòng 3 (29/10/2026). Mỗi trang có bản MT (1440) và ĐT (390). Chữ đầy đủ nằm trong `CONTENT-COPY.md`, mục 10. Mọi số liệu và tên trong thiết kế là dữ liệu mẫu (A-21 đến A-27 trong `CONTENT-COPY.md`, mục 9).

Quy ước chung cho trang mới:

- Trang công khai dùng StatusStrip, Header (hoặc HeaderUser khi đã đăng nhập), PageTitle hoặc khối đầu riêng, Content, Footer. Trang không thuộc năm trạm của NavDial dùng Header `Active=None`.
- Bản ĐT: HeaderMobile (hoặc HeaderMobileUser), khối tiêu đề, Content, Footer và TabBar cố định ở đáy. Trang xác thực và quản trị không có TabBar.
- Khoảng cách dọc giữa các khối Content: MT 96 (đệm 48 / 64 / 96 / 64), ĐT 56 (đệm 0 / 20 / 56 / 20).

### 11.1 Tải game và Hướng dẫn (`/tai-game`)

MT `107:1097` (1440 x 3011). ĐT `108:310` (390 x 4556). Mục tiêu: "người mới tải và vào được game trong vài phút" (G-02, G-03).

| Khối | Thành phần | Nội dung |
| --- | --- | --- |
| PageTitle | PageTitle | Đường dẫn "TRANG CHỦ / TẢI GAME", tiêu đề "TẢI GAME", đoạn dẫn "Tải bộ cài, cài đặt và vào trận chỉ trong vài phút." |
| Download (MT 1312 x 604) | DownloadCard | Nhãn "BẢN CÀI ĐẶT MỚI NHẤT", tiêu đề "TẢI BỘ CÀI / VÀO TRẬN NGAY", ba ô PHIÊN BẢN 1.0.3, DUNG LƯỢNG 1,2 GB và ngày 28/10/2026, nút "TẢI BỘ CÀI" và "XEM HƯỚNG DẪN", dòng "Miễn phí · Dành cho máy tính Windows", bảng YÊU CẦU MÁY (4 dòng) |
| Guide (`#huong-dan`) | SectionHead và 3 StepCard 416 x 371 | "01 · CÀI ĐẶT", "BA BƯỚC CÀI ĐẶT". Bước 01 TẢI BỘ CÀI, 02 CÀI ĐẶT GAME, 03 ĐĂNG NHẬP VÀ CHƠI. Nút ở thẻ: "TẢI BỘ CÀI", "XEM LỖI THƯỜNG GẶP", "TẠO TÀI KHOẢN" |
| Faq | SectionHead và FaqGrid 2 x 2 | "02 · HỖ TRỢ", "GẶP LỖI KHI CÀI ĐẶT?". Bốn thẻ: KHÔNG MỞ ĐƯỢC BỘ CÀI, KHÔNG ĐĂNG NHẬP ĐƯỢC, QUÊN MẬT KHẨU, KHÔNG VÀO ĐƯỢC MÁY CHỦ |
| Support | RadioLine và 2 nút Secondary M (bản vẽ có 3, bản code bỏ ZALO) | Câu "Vẫn chưa vào được game? Nhắn kênh hỗ trợ, ban quản trị sẽ trả lời." và các nút FACEBOOK, DISCORD |

Bản ĐT: Content gồm Top (khung cảnh báo "GAME CHỈ CHẠY TRÊN WINDOWS" với nút "SAO CHÉP LIÊN KẾT", rồi khối tải với nút tải ở trạng thái khóa và dòng "Mở trang này trên máy tính Windows để tải. Miễn phí."), Guide, Faq, Support. TabBar `Active=None`.

Hành vi: nút "TẢI BỘ CÀI" trỏ tới tệp cài (nguồn chưa quyết, D-04). Trên ĐT không cho tải (D-05). Neo `#huong-dan` cuộn tới mục Guide. Neo `#ho-tro` cuộn tới mục HỖ TRỢ (nút "XEM LỖI THƯỜNG GẶP" ở bước 02 dùng neo này). Dữ liệu phiên bản, dung lượng, ngày, yêu cầu máy lấy từ một bản ghi `DownloadInfo` (xem `ROUTES-AND-DATA.md`, mục 7.6).

### 11.2 Chi tiết bài viết (`/tin-tuc/:slug`)

MT `109:1198` (1440 x 2500). ĐT `109:1679` (390 x 2424). Header `Active=News`, TabBar `Active=News` (G-04).

| Khối | Nội dung |
| --- | --- |
| Head (MT cao 288, ĐT 272) | Đường dẫn "TRANG CHỦ / TIN TỨC / BÀI VIẾT". Hàng Tag loại (CẬP NHẬT) và dòng "28/10/2026 · BAN QUẢN TRỊ · ĐỌC 3 PHÚT". Tiêu đề bài |
| HeroWrap (MT cao 520, ĐT 244) | Ảnh đại diện: khung lưới chữ thập, hình lớn, 4 dấu góc |
| Reading | Cột đọc rộng 720 (ĐT 350): đoạn mở đầu, tiêu đề con "SỬA LỖI" với danh sách 3 mục, tiêu đề con "CÂN BẰNG VŨ KHÍ" với một đoạn, rồi RadioLine "Cần hỗ trợ sau khi cập nhật? ..." |
| More | SectionHead "BÀI KHÁC / ĐỌC THÊM TIN MỚI", 3 NewsRow (MT) hoặc NewsCard (ĐT), nút Secondary M "QUAY LẠI TIN TỨC" |

Nội dung bài do quản trị soạn, lưu thành HTML đã làm sạch (xem mục 8). Thẻ cho phép: đoạn, tiêu đề cấp 2 và 3, danh sách, liên kết, ảnh, in đậm, in nghiêng. Dòng ĐỌC 3 PHÚT tính từ số chữ (tốc độ đọc 200 chữ mỗi phút, đề xuất).

### 11.3 Chi tiết vật phẩm (`/kho-do/:slug`)

MT `110:1278` (1440 x 1763). ĐT `110:1814` (390 x 2001). Header `Active=Items`, TabBar `Active=Items` (G-04).

| Khối | Nội dung |
| --- | --- |
| Head | Đường dẫn "TRANG CHỦ / KHO ĐỒ / AK-74" |
| Detail | MT: khối Detail 960 x 434 như ở Kho đồ (hình, bóng súng HUD, nhãn loại, tên, mô tả, 4 chỉ số: SÁT THƯƠNG 32, TẦM XA 120 m, TỐC ĐỘ BẮN 600/phút, BĂNG ĐẠN 30 viên). ĐT: ảnh 350, tên, mô tả, lưới chỉ số 2 x 2 |
| Others | SectionHead "CÙNG KHO ĐỒ / VẬT PHẨM KHÁC" và 4 ItemSlot (MT) hoặc 4 MiniSlot (ĐT) cùng nhóm |
| Back | Nút Secondary M "QUAY LẠI KHO ĐỒ" |

Chỉ số lấy từ trường `stats` của Item. Vật phẩm nào thiếu chỉ số thì ẩn ô đó.

### 11.4 Quên mật khẩu và Đặt lại mật khẩu

Quên: MT `113:1398` (1440 x 815), ĐT `113:1941` (390 x 1012). Đặt lại: MT `113:1480` (1440 x 834), ĐT `113:2003` (390 x 1007). Dùng bố cục xác thực của đăng nhập (AuthBar, Visual, FormCard). Không có TabBar (G-05).

| Trang | Visual (trái) | FormCard (phải) |
| --- | --- | --- |
| `/quen-mat-khau` | Nhãn "KHÔI PHỤC TÀI KHOẢN", tiêu đề "LẤY LẠI QUYỀN / VÀO GAME", đoạn "Quên mật khẩu không làm mất tài khoản. Chúng tôi chỉ cần email bạn đã đăng ký." | Tiêu đề "QUÊN MẬT KHẨU", đoạn hướng dẫn, Field Email (gợi ý "Dùng email bạn đã đăng ký tài khoản"), Primary L "GỬI LIÊN KẾT", dòng "Nhớ mật khẩu rồi?" và nút Ghost M "ĐĂNG NHẬP". AuthBar có nút Ghost M "ĐĂNG NHẬP" |
| `/dat-lai-mat-khau?ma=...` | Nhãn "MẬT KHẨU MỚI", tiêu đề "SẮP VÀO LẠI / ĐƯỢC RỒI", đoạn "Chọn mật khẩu mới rồi đăng nhập như bình thường. Mỗi liên kết chỉ dùng được một lần." | Tiêu đề "ĐẶT MẬT KHẨU MỚI", dòng "Chọn mật khẩu mới cho tài khoản n***@email.com.", hai Field có nút HIỆN (mật khẩu mới với gợi ý "Tối thiểu 8 ký tự. Phân biệt chữ hoa và chữ thường.", rồi "NHẬP LẠI MẬT KHẨU"), Primary L "LƯU MẬT KHẨU MỚI" |

Bản ĐT là cột đơn: AuthBar, Intro, Items (dải hình cao 95), FormWrap. Các trạng thái sau khi gửi, liên kết hết hạn và thành công nằm ở mục 11.11.

### 11.5 Đổi mật khẩu (`/ho-so/doi-mat-khau`)

MT `115:1455` (1440 x 1510). ĐT `115:2215` (390 x 1830). HeaderUser `Active=Profile`, TabBar `Active=Profile`.

PageTitle: "TRANG CHỦ / HỒ SƠ / ĐỔI MẬT KHẨU", đoạn "Dùng mật khẩu mạnh và chưa dùng ở nơi khác." Content (MT hai cột): FormCard 640 với ba Field có nút HIỆN (MẬT KHẨU HIỆN TẠI, mật khẩu mới, NHẬP LẠI MẬT KHẨU MỚI), Primary L "LƯU MẬT KHẨU" và Secondary L "HỦY". Cột phải TipsCard 608 "MẸO CHỌN MẬT KHẨU" với bốn mục (dài từ 8 ký tự, trộn chữ hoa chữ thường và số, không dùng lại mật khẩu của email hay của trang khác, các thiết bị khác phải đăng nhập lại sau khi đổi). ĐT: FormCard rồi TipsCard xếp dọc.

### 11.6 Trang 404 và 500

404: MT `116:1760`, ĐT `116:2516`. 500: MT `116:1836`, ĐT `116:2533`. Cao 1177 ở cả hai cỡ. Header `Active=None`, TabBar `Active=None` (G-08).

CenterMessage: số lỗi cỡ lớn và ListState kiểu Error rộng 720. 404 có tiêu đề "KHÔNG TÌM THẤY TRANG", câu "Trang bạn tìm không có hoặc đã được chuyển đi. Hãy quay lại trang chủ." và nút "VỀ TRANG CHỦ". 500 có "CÓ LỖI Ở MÁY CHỦ", câu "Máy chủ gặp lỗi khi xử lý yêu cầu. Dữ liệu của bạn vẫn an toàn. Hãy thử lại sau ít phút." và nút "THỬ LẠI". Không hiện mã kỹ thuật. Trang ngoại tuyến không làm (website không phải PWA). Trạng thái "MÁY CHỦ NGOẠI TUYẾN" của StatusStrip: xem G-25.

Với bản dựng tĩnh, máy chủ web phải trả `404.html` cho đường dẫn không có và tệp `500.html` cho lỗi, hoặc trình định tuyến phía người dùng hiện trang 404 khi không khớp tuyến nào (xem `IMPLEMENTATION-PLAN.md`).

### 11.7 Quy tắc cộng đồng (`/quy-tac`)

MT `116:1623` (1440 x 2084). ĐT `116:2550` (390 x 2217). Header `Active=None`, TabBar `Active=None` (G-22).

PageTitle: "TRANG CHỦ / QUY TẮC", "QUY TẮC CỘNG ĐỒNG", "Cập nhật lần cuối 28/10/2026. Bốn quy tắc giúp máy chủ vui và công bằng." Content (MT): TocList 288 bên trái và Reading 720 bên phải. Bốn quy tắc: 1 TÔN TRỌNG NGƯỜI CHƠI KHÁC (3 gạch đầu dòng), 2 KHÔNG GIAN LẬN (3 gạch), 3 BẢO VỆ TÀI KHOẢN (một đoạn), 4 XỬ LÝ VI PHẠM (PenaltyRow ba mức và một ghi chú). Cuối trang: RadioLine "Thấy ai vi phạm? Báo cho ban quản trị qua kênh hỗ trợ." Bản ĐT không có TocList.

Nội dung là bản mẫu, cần chủ dự án duyệt (A-25). Ngày "Cập nhật lần cuối" lấy từ dữ liệu trang chữ.

### 11.8 Tạo nhân vật (`/ho-so/nhan-vat/moi`), đã bỏ khỏi bản code (A-23)

Chủ dự án chốt bỏ trang này và nút "TẠO NHÂN VẬT" ngày 29/10/2026. Mục này giữ để tham khảo.

MT `115:1603` (1440 x 1386). ĐT `115:2271` (390 x 1729). HeaderUser, TabBar `Active=Profile` (G-06).

PageTitle: "TRANG CHỦ / HỒ SƠ / TẠO NHÂN VẬT", "Đặt tên cho người sống sót mới. Tên không đổi được sau khi tạo." Content (MT hai cột): FormCard 640 gồm Field "TÊN NHÂN VẬT" (ví dụ ThoSanDem03, gợi ý "3 đến 16 ký tự, không dấu, viết liền."), dòng "SỐ NHÂN VẬT 2 / 5" (giới hạn 5 nhân vật), Checkbox "Tôi đã đọc quy tắc cộng đồng" (liên kết tới `/quy-tac`), nút Primary L "TẠO NHÂN VẬT" và Secondary L "HỦY". Cột phải StarterKit 608 "BỘ ĐỒ KHỞI ĐẦU". ĐT xếp dọc.

Đã chốt: nhân vật tạo trong game (A-23). Hồ sơ không còn nút "TẠO NHÂN VẬT". Khi tài khoản chưa có nhân vật, Hồ sơ hiện "CHƯA CÓ NHÂN VẬT", câu "Nhân vật được tạo khi bạn vào game lần đầu. Tải game và đăng nhập để bắt đầu." và nút "TẢI GAME".

### 11.9 Quản trị: danh sách các mục (G-07, G-20)

Chung cho năm trang MT: không có StatusStrip và Footer. Bố cục ngang gồm Sidebar 280 (mục đang chọn sáng, giống Category) và Main 1160 (đệm 48 / 64 / 96 / 64, khoảng cách 32). Main gồm Top (H1 và nút Primary M), các khối riêng của trang, AdminTable 1032 và Pagination. Bản ĐT: AdminBar, Nav (hàng chip cuộn ngang, mục đang chọn sáng), Head (H1 và nút Primary L giãn hết khung), Content gồm các AdminCard. Bộ lọc bằng Chip và ô tìm kiếm.

| Trang | MT / ĐT | Nội dung |
| --- | --- | --- |
| Bài viết | `118:2045` (cao 909) / `119:2856` (cao 1328) | Nút "ĐĂNG BÀI MỚI". Chip TẤT CẢ, ĐÃ ĐĂNG, BẢN NHÁP. Ô "TÌM BÀI VIẾT". Cột TIÊU ĐỀ, LOẠI (Tag), NGÀY, TRẠNG THÁI (ĐÃ ĐĂNG, BẢN NHÁP), hành động SỬA và ẨN. 6 dòng mẫu (ĐT 4) |
| Vật phẩm | `118:2186` (cao 1047) / `119:2937` (cao 1539) | Nút "THÊM VẬT PHẨM". AdminNote "NỔI BẬT TRÊN TRANG CHỦ" (tối đa 4, đang chọn 3 / 4). Chip TẤT CẢ, SÚNG TRƯỜNG, SÚNG NGẮN, CẬN CHIẾN. Cột ẢNH, VẬT PHẨM (tên và nhóm), NỔI BẬT (Toggle), HIỂN THỊ (Toggle), SỬA. 6 dòng mẫu (ĐT 5) |
| Banner | `118:2356` (cao 1128) / `119:3056` (cao 1871) | Nút "THÊM BANNER". AdminNote "BANNER LÀ GÌ?". BannerPreview "XEM TRƯỚC". Bảng NỘI DUNG (kèm khoảng ngày), TRẠNG THÁI (ĐANG HIỆN, LÊN LỊCH, HẾT HẠN), BẬT / TẮT (Toggle), SỬA. Khung phải 360 "SỬA BANNER": NỘI DUNG (tối đa 120 ký tự), LIÊN KẾT (KHÔNG BẮT BUỘC), HIỆN TỪ, ĐẾN, Toggle "Đang hiện", "LƯU BANNER", "HỦY". ĐT xếp khung sửa dưới danh sách |
| Người dùng | `118:2462` (cao 978) / `119:3131` (cao 1403) | Không có nút thêm (người dùng tự đăng ký). Chip TẤT CẢ, NGƯỜI CHƠI, QUẢN TRỊ, BỊ KHÓA. Ô "TÌM NGƯỜI DÙNG". Cột TÊN HIỂN THỊ, EMAIL (che một phần), VAI TRÒ, TRẠNG THÁI (HOẠT ĐỘNG, BỊ KHÓA), NGÀY TẠO, KHÓA hoặc MỞ KHÓA |
| Nhật ký | `118:2607` (cao 853) / `119:3215` (cao 1175) | Chỉ đọc. Chip TẤT CẢ, BÀI VIẾT, VẬT PHẨM, BANNER, NGƯỜI DÙNG. Cột THỜI GIAN, NGƯỜI LÀM, HÀNH ĐỘNG (ĐĂNG BÀI, ẨN BÀI, BẬT NỔI BẬT, SỬA BANNER, KHÓA NGƯỜI DÙNG, THÊM VẬT PHẨM, ĐĂNG NHẬP), ĐỐI TƯỢNG |

Soạn bài mới giữ nguyên ở mục 8 (`38:954` và `71:279`). Trên ĐT, trang soạn bài có thanh hành động dính StickyActions (cao 89, "LƯU NHÁP" và "ĐĂNG BÀI") đặt ở đáy màn hình đầu tiên (G-20).

Hành vi đề xuất:

- Mọi hành động quản trị ghi vào Nhật ký (người làm, hành động, đối tượng, thời điểm). Nhật ký không sửa và không xóa được từ giao diện.
- Khóa người dùng cần hộp xác nhận. Không hiện email đầy đủ (đã che một phần). Quản trị viên không đổi được mật khẩu người khác ở bản đầu.
- Toggle "NỔI BẬT" không cho bật quá 4 vật phẩm. Toggle "HIỂN THỊ" tắt thì vật phẩm biến khỏi Kho đồ công khai.
- Banner: tại một thời điểm chỉ một banner đang bật. Bật banner mới thì banner cũ tự tắt (A-24). Dải banner công khai (G-26) đã vẽ ở phiên 3 (`155:385`) và đặt trên cùng mọi trang công khai (`BannerStrip`).
- Form thêm hoặc sửa vật phẩm (G-23) do nhóm code vẽ ở phiên 3: Sửa 1440 `156:2378`, Thêm 1440 `156:2723`, Sửa 390 `160:915`, Thêm 390 `160:1145`. Trang `/quan-tri/vat-pham/moi` và `/quan-tri/vat-pham/:id`. Cột SỬA trong danh sách chưa có bản vẽ riêng (C-43). Chi tiết người dùng (G-23) do nhóm code vẽ ở phiên 4: 1440 `171:2870`, 390 `172:1027`. Trang `/quan-tri/nguoi-dung/:id`.

### 11.10 Xếp hạng gia tộc (`/xep-hang?bang=gia-toc`)

MT `116:2736` (1440 x 2187). ĐT `117:2636` (390 x 2180). Cùng bố cục Xếp hạng (mục 4), chip GIA TỘC đang chọn (G-19).

Khác với bảng người chơi: đoạn dẫn "Bảng xếp hạng gia tộc theo GameDollar và kinh nghiệm (XP).", nhãn "GIA TỘC CỦA TÔI", tiêu đề cột GIA TỘC, mỗi RankRow có thêm dòng phụ "N thành viên", ô tìm "TÌM GIA TỘC", ĐT có dòng đếm "86 gia tộc". Dữ liệu mẫu có 12 gia tộc (xem `sample-data.json`, trường `clans`). Chủ dự án vẫn cần chọn bảng nào hiện (D-03).

### 11.11 Bảng trạng thái xác thực

MT `114:1436` (1440 x 1454). ĐT `114:1940` (390 x 3030). Không phải trang sản phẩm, là bảng tham chiếu sáu trạng thái cho đăng nhập, quên mật khẩu và quyền truy cập (G-05):

| Số | Trạng thái | Chữ chính |
| --- | --- | --- |
| 1 | Sau khi gửi yêu cầu quên mật khẩu | "ĐÃ GỬI LIÊN KẾT". Nút "GỬI LẠI LIÊN KẾT" (gửi lại sau 60 giây) và "QUAY LẠI ĐĂNG NHẬP" |
| 2 | Liên kết hết hạn hoặc đã dùng | ListState Error "LIÊN KẾT KHÔNG DÙNG ĐƯỢC", nhãn LIÊN KẾT HẾT HẠN |
| 3 | Đổi mật khẩu thành công | "ĐÃ ĐỔI MẬT KHẨU", nhãn ĐÃ LƯU |
| 4 | Đăng nhập sai (thông báo chung) | "EMAIL HOẶC MẬT KHẨU CHƯA ĐÚNG", không nói sai ô nào |
| 5 | Tạm khóa sau nhiều lần sai | "TẠM KHÓA ĐĂNG NHẬP", "Hãy thử lại sau 15 phút, hoặc đặt lại mật khẩu ngay." |
| 6 | Không có quyền truy cập (403) | "KHÔNG ĐƯỢC PHÉP VÀO", "TRANG NÀY CHỈ DÀNH CHO QUẢN TRỊ VIÊN", nút "VỀ TRANG CHỦ" |

Các mốc 30 phút, 60 giây, 15 phút là giả định (A-22).

### 11.12 Đầu trang khi đã đăng nhập

MT `120:3042` (1440 x 1252). ĐT `120:3221` (390 x 778). Bảng ghép, không phải trang sản phẩm (G-09). Ba phần: 1 HeaderUser ở trang chủ, 2 menu tài khoản đang mở (UserChip `Open` và AccountMenu căn mép phải), 3 thành phần riêng lẻ (bốn trạng thái UserChip, AccountMenu cho người chơi và cho quản trị) kèm ba ghi chú "CÁCH DÙNG", "QUYỀN QUẢN TRỊ", "ĐIỆN THOẠI". Chip tài khoản thay hai nút ĐĂNG NHẬP và ĐĂNG KÝ trên MT. Trên ĐT chip gọn thay nút ĐĂNG NHẬP.
