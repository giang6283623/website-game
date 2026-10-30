# Bộ chữ nội dung (CONTENT-COPY)

Tệp này gom toàn bộ chữ trên giao diện, lấy từng chữ từ bản vẽ Figma (cập nhật ngày 29/10/2026, vòng 3). Lập trình viên chép chữ từ đây, không tự viết lại. Chữ chưa có trong Figma được ghi rõ là "đề xuất". Dữ liệu mẫu (tên người chơi, số liệu, ngày) nằm trong `sample-data.json`.

Cách đọc:

- Chữ trong ô "Chữ" ghi đúng như hiển thị trong Figma. Kiểu Display, Heading và Label luôn hiển thị chữ hoa.
- Khi code, lưu nội dung bằng chữ thường thông thường (ví dụ "Tin tức") và để CSS `text-transform: uppercase` tạo chữ hoa. Đặt `lang="vi"` trên thẻ `html` để chữ hoa có dấu chuyển đúng.
- Viết tắt: MT là bản máy tính (1440), ĐT là bản điện thoại (390).

## 1. Nguyên tắc nội dung

| Nội dung | Quy tắc |
| --- | --- |
| Ngôn ngữ | Tiếng Việt có dấu. Bản đầu chỉ một ngôn ngữ. Nút chuyển sang tiếng Anh của site cũ bỏ qua (xem PRD, câu hỏi mở) |
| Giọng văn | Ngắn, rõ, đời thường. Xưng "bạn". Câu lệnh ở nút bắt đầu bằng động từ ("TẢI GAME", "ĐĂNG KÝ NGAY"). Không dùng thuật ngữ kỹ thuật với người mới |
| Cách gọi người dùng | Dùng "người chơi". Không viết "người chơi Việt" |
| Tên hướng thiết kế | "Tần số sinh tồn". Không dùng "điện đài", "giao diện radio", "theme radio" |
| Tên riêng | "Infestation" (một chữ I hoa). "GameDollar" khi viết thường, "GAMEDOLLAR" ở nhãn. "XP" luôn kèm giải thích "kinh nghiệm" ở nơi đầu tiên xuất hiện |
| Số | Dấu chấm ngăn hàng nghìn: 2.480.150. Hạng nhỏ hơn 100 có số 0 đầu: 01 đến 99. Số đếm danh mục có số 0 đầu khi dưới 10: 05, 06. Đơn vị cách số một dấu cách: "120 m", "30 viên", "87 đêm", "600/phút" |
| Ngày | Danh sách: "30/10". Bảng quản trị: "28/10/2026" (đủ năm). Chi tiết: "30/10/2026 · BAN QUẢN TRỊ". Ngày giờ: "30/10/2026 08:00". Múi giờ Việt Nam (UTC+7). Năm hiện ra khi khác năm hiện tại |
| Thứ trong tuần | "thứ Hai" đến "thứ Bảy" (chữ "thứ" thường, tên ngày viết hoa chữ đầu), "Chủ nhật" |
| Dấu chấm giữa | "·" ngăn các nhóm trên một dòng, có một dấu cách hai bên. Đường dẫn trang (breadcrumb) dùng "/" với hai dấu cách hai bên |
| Chữ nhập mẫu | Dùng tên tổng hợp (ThoSanDem, nguoisongsot@email.com). Không dùng email hay tên thật |
| Người dùng đăng nhập mẫu | NguoiSongSot: hạng 128, gia tộc Sống Sót, email che "n***@email.com". Chip ở đầu trang, trang Hồ sơ và dòng "của tôi" ở Xếp hạng đều dùng người này. Các tên khác (ThoSanDem, LinhCanh77...) là người chơi khác trong bảng xếp hạng. Email che: giữ ký tự đầu, ba dấu sao, rồi phần sau dấu @ |
| Giữ chỗ bằng dấu chấm | Ô mật khẩu mẫu là "••••••••" |

## 2. Chữ dùng chung

### 2.1 Thanh trạng thái (StatusStrip, chỉ MT)

| Vị trí | Chữ | Ghi chú |
| --- | --- | --- |
| Trái | MÁY CHỦ TRỰC TUYẾN | Chấm xanh moss. Khi máy chủ tắt (đề xuất): "MÁY CHỦ ĐANG BẢO TRÌ" và chấm xám |
| Giữa | 34 NGƯỜI ĐANG CHƠI | Số lấy từ dữ liệu thật. Khi không có số: ẩn cả cụm |
| Phải | MIỄN PHÍ · TIẾNG VIỆT | Giả định A-01 |

### 2.2 Đầu trang và điều hướng

| Phần | Chữ MT | Chữ ĐT |
| --- | --- | --- |
| Wordmark | INFESTATION, dòng dưới "VIỆT NAM" | Giống MT |
| Núm dò (NavDial) | Trang chủ 88.1, Tin tức 92.4, Kho đồ 96.7, Xếp hạng 101.3, Hồ sơ 107.9 | Không có. Thay bằng TabBar |
| Nút đầu trang | ĐĂNG NHẬP (Secondary M), ĐĂNG KÝ (Primary M) | ĐĂNG NHẬP (Secondary M), không có nút ĐĂNG KÝ. Trang xác thực: nút "TRANG CHỦ". Quản trị: nút "ĐĂNG XUẤT" |
| TabBar (đáy ĐT) | Không có | CHỦ, TIN, KHO, HẠNG, HỒ SƠ |

Các số tần số (88.1 đến 107.9) là chữ trang trí, không phải số thật. Khi đọc bằng trình đọc màn hình, đọc tên mục ("Trang chủ"), không đọc số.

### 2.3 Chân trang (Footer)

| Phần | Chữ MT | Chữ ĐT |
| --- | --- | --- |
| Giới thiệu | Máy chủ Infestation dành cho người chơi. Tạo tài khoản, tải game, lập gia tộc và sống sót cùng nhau. | Giống MT (ba dòng, đặt dưới Wordmark) |
| Cột ĐIỀU HƯỚNG | Trang chủ, Tin tức, Kho đồ, Xếp hạng | Giống MT |
| Cột HỖ TRỢ | Hướng dẫn tải game, Tạo tài khoản, Quên mật khẩu, Liên hệ quản trị | Hướng dẫn, Quên mật khẩu, Liên hệ, Facebook (bốn mục xếp một cột) |
| Cột CỘNG ĐỒNG | Facebook (group), Discord, YouTube | Không có cột riêng. Liên kết Facebook nối vào cuối cột HỖ TRỢ |
| Dòng pháp lý | Đã bỏ (chủ dự án chốt 29/10/2026). Chân trang chỉ còn thước ở cuối | Giống MT |

Liên kết mạng xã hội và "Liên hệ quản trị" chưa có địa chỉ (giả định A-07, A-08). Liên kết nào chưa có địa chỉ thì ẩn, không để liên kết rỗng.

### 2.4 Đường dẫn trang (breadcrumb)

Dạng "TRANG CHỦ  /  TIN TỨC" (hai dấu cách mỗi bên của dấu gạch chéo, chữ hoa). Mục cuối không là liên kết. Có ở Tin tức, Kho đồ, Xếp hạng, Hồ sơ.

## 3. Từ điển nút và liên kết

Kiểu và cỡ của từng nút (Primary, Secondary, Ghost, L, M) ghi trong `PAGES.md` và `COMPONENTS.md`. Bảng này chỉ ghi chữ, nơi dùng và đích.

| Chữ nút | Dùng ở | Đích hoặc hành động |
| --- | --- | --- |
| TẢI GAME | Trang chủ (hero, bước 02) | `/tai-game` (trang chưa thiết kế, PAGES.md mục 11.1) |
| XEM HƯỚNG DẪN | Trang chủ (hero, bước 03, khối cuối) | `/tai-game#huong-dan` |
| ĐĂNG KÝ NGAY | Trang chủ (bước 01), Đăng nhập | `/dang-ky` |
| XEM TẤT CẢ | Trang chủ, mục Tin mới (MT) | `/tin-tuc` |
| XEM TẤT CẢ TIN | Trang chủ ĐT, trạng thái rỗng của tin tức | `/tin-tuc` |
| BẢNG XẾP HẠNG | Trang chủ, mục Top sinh tồn (MT) | `/xep-hang` |
| XEM BẢNG XẾP HẠNG | Trang chủ ĐT | `/xep-hang` |
| XEM TOÀN BỘ KHO ĐỒ | Trang chủ, mục Kho đồ | `/kho-do` |
| ĐĂNG KÝ TÀI KHOẢN | Trang chủ (khối cuối) | `/dang-ky` |
| ĐĂNG NHẬP | Đầu trang, Đăng nhập (nút gửi), Đăng ký (chân form) | `/dang-nhap` hoặc gửi form |
| ĐĂNG KÝ | Đầu trang (MT) | `/dang-ky` |
| ĐỌC TIẾP | Tin tức, bài nổi bật | `/tin-tuc/<slug>` |
| TRƯỚC, 1, 2, 3, 4, SAU | Tin tức, Xếp hạng (phân trang) | `?trang=` |
| TÌM | Xếp hạng MT | Tìm tên. Bản ĐT ghi "TÌM NGƯỜI CHƠI" |
| VỊ TRÍ CỦA TÔI | Xếp hạng | Cuộn tới dòng của mình. Chưa đăng nhập: chuyển tới `/dang-nhap` |
| QUÊN MẬT KHẨU? | Đăng nhập | `/quen-mat-khau` |
| QUAY LẠI TRANG CHỦ | Đăng nhập, Đăng ký (MT) | `/` |
| TẠO TÀI KHOẢN | Đăng ký (nút gửi) | Gửi form |
| TẠO NHÂN VẬT | Đã bỏ (A-23). Hồ sơ không còn nút này | Nhân vật tạo trong game |
| ĐỔI MẬT KHẨU | Hồ sơ | `/ho-so/doi-mat-khau` |
| ĐĂNG XUẤT | Hồ sơ, Quản trị | Hủy phiên rồi về `/` |
| LƯU NHÁP | Quản trị | Lưu bài ở trạng thái BẢN NHÁP |
| XUẤT BẢN, XUẤT BẢN NGAY | Quản trị | Đăng bài. Hai nút cùng chức năng |
| CHỌN ẢNH | Quản trị | Mở hộp chọn tệp hoặc kho hình |
| THỬ LẠI | Trạng thái lỗi | Gọi lại dữ liệu, giữ nguyên bộ lọc |
| XÓA BỘ LỌC, XÓA TỪ KHÓA | Trạng thái rỗng | Đặt lại bộ lọc hoặc ô tìm |

## 4. Nhãn, loại, bộ lọc và tiêu đề cột

### 4.1 Loại bài viết (khớp ba nơi: Tag, chip lọc, PHÂN LOẠI trong quản trị)

| Khóa | Nhãn hiển thị | Tag trong Figma |
| --- | --- | --- |
| tin-tuc | TIN TỨC | News |
| huong-dan | HƯỚNG DẪN | Guide |
| su-kien | SỰ KIỆN | Event |
| cap-nhat | CẬP NHẬT | New |

Chip lọc có thêm "TẤT CẢ" ở đầu. Tin tức có dòng đếm "28 BÀI VIẾT" và sắp xếp "MỚI NHẤT" (ĐT).

### 4.2 Nhóm vật phẩm (Kho đồ)

Cột "LOẠI VẬT PHẨM": TẤT CẢ 41, VŨ KHÍ 17, GIÁP VÀ BA LÔ 05, Y TẾ VÀ ĐỒ ĂN 06, DỤNG CỤ 05, VẬT LIỆU 03, THUỐC NỔ 04, ĐẠN 01. Nhóm của từng hình nằm trong `ASSET-MAP.md`.

Nhãn loại nhỏ trên thẻ vật phẩm: SÚNG TRƯỜNG, SÚNG TIỂU LIÊN (ĐT: TIỂU LIÊN), SÚNG NGẮN, SHOTGUN, SÚNG NGẮM, CẬN CHIẾN, BA LÔ, Y TẾ.

Dòng chỉ số: "Sát thương 32 · Tầm xa 120", "Sát thương 24 · Bắn nhanh", "Sát thương 70 · Tầm gần", "Sát thương 45 · Nhanh", "Sát thương 55 · Chậm", "Chứa 32 ô đồ", "Hồi 60 máu". Số là dữ liệu mẫu (giả định A-15).

### 4.3 Bảng xếp hạng

| Phần | Chữ |
| --- | --- |
| Tab | GAMEDOLLAR, XP, GIA TỘC |
| Tiêu đề cột | HẠNG, NGƯỜI CHƠI, GAMEDOLLAR, XP |
| Dòng của tôi | Nhãn "VỊ TRÍ CỦA TÔI", hạng không đệm số 0 (ví dụ 128) |
| Ô tìm | Nhãn "Tìm người chơi". Giữ chỗ "Nhập tên không dấu". Gợi ý "Ví dụ: ThoSanDem. Gõ ít nhất 2 ký tự." |

### 4.4 Sắp xếp

"SẮP XẾP" kèm hai chip: "MỚI NHẤT", "TÊN A-Z". Tin tức ĐT chỉ có "MỚI NHẤT".

## 5. Nội dung từng trang

### 5.1 Trang chủ (`/`)

| Vùng | Chữ MT | Khác ở ĐT |
| --- | --- | --- |
| Nhãn hero | MÁY CHỦ INFESTATION TIẾNG VIỆT | Giống |
| Tiêu đề hero | NƠI SINH TỒN (dòng 1), KHẮC NGHIỆT (dòng 2) | Giống |
| Đoạn dẫn | Tạo tài khoản, tải game, vào trận trong vài phút. Cày đồ, lập gia tộc và sống sót qua từng đêm cùng người chơi. | "... và sống sót cùng người chơi." (bỏ cụm "qua từng đêm") |
| Nút | TẢI GAME, XEM HƯỚNG DẪN | Giống |
| Ghi chú dưới nút | MIỄN PHÍ · DÀNH CHO MÁY TÍNH WINDOWS | Giống. Giả định A-01 và A-03 |
| Túi đồ khởi đầu | Nhãn "TÚI ĐỒ KHỞI ĐẦU", đếm "05 MÓN", món chính AK-74 (SÚNG TRƯỜNG), bốn món nhỏ BA LÔ 32 Ô, BỘ Y TẾ, LA BÀN, ĐỒ HỘP | Tên món nhỏ ngắn hơn: BA LÔ, Y TẾ, LA BÀN, ĐỒ HỘP |
| Số liệu nhanh | 34 NGƯỜI ĐANG CHƠI, 24/7 MÁY CHỦ HOẠT ĐỘNG, TIẾNG VIỆT GIAO DIỆN VÀ HƯỚNG DẪN, MIỄN PHÍ TẢI VỀ VÀ CHƠI | 34 NGƯỜI ĐANG CHƠI, 24/7 MÁY CHỦ HOẠT ĐỘNG, 0 ĐỒNG TẢI VỀ VÀ CHƠI, 100% TIẾNG VIỆT |
| Mục 01 | Nhãn "01 · BẮT ĐẦU". Tiêu đề "BA BƯỚC VÀO GAME". Dẫn: "Không cần biết kỹ thuật. Làm theo ba bước, đa số người chơi vào được game trong vài phút." | Dẫn: "Không cần biết kỹ thuật. Làm theo ba bước là vào được game." |
| Lời trạm trưởng | Nhãn "TRẠM TRƯỞNG · 88.1 MHz". Lời: "Người mới à? Làm theo ba bước dưới đây là vào được game. Cần giúp thì gọi kênh hỗ trợ ở cuối trang." | Giống |
| Bước 01 | TẠO TÀI KHOẢN. "Đăng ký bằng email. Chọn tên hiển thị không dấu, viết liền." Nút ĐĂNG KÝ NGAY | Giống |
| Bước 02 | TẢI VÀ CÀI GAME. "Tải bộ cài về máy tính, chạy và làm theo hướng dẫn trên màn hình." Nút TẢI GAME | "Tải bộ cài về máy tính và làm theo hướng dẫn." |
| Bước 03 | VÀO TRẬN. "Đăng nhập, tạo nhân vật và bước vào vùng đất sinh tồn." Nút XEM HƯỚNG DẪN | Giống |
| Tin mới | Tiêu đề "TIN MỚI". Liên kết "XEM TẤT CẢ". 5 dòng tin (dữ liệu trong `sample-data.json`) | 4 thẻ tin. Nút "XEM TẤT CẢ TIN" |
| Top sinh tồn | Tiêu đề "TOP SINH TỒN". Liên kết "BẢNG XẾP HẠNG". Cột HẠNG, NGƯỜI CHƠI, GAMEDOLLAR, XP. 5 dòng | Nút "XEM BẢNG XẾP HẠNG" |
| Mục 02 | Nhãn "02 · KHO ĐỒ". Tiêu đề "KHO ĐỒ SINH TỒN". Dẫn: "Mỗi món đồ có chỗ riêng trong kho. Xem trước tên, loại và chỉ số trước khi vào game." Nút "XEM TOÀN BỘ KHO ĐỒ". Bốn thẻ mẫu: AK-74, BA LÔ 32 Ô, BỘ Y TẾ, RÌU CỨU HỎA | Bốn thẻ nhỏ chỉ có loại và tên |
| Khối cuối | Nhãn "THAM GIA NGAY". Tiêu đề "SẴN SÀNG SỐNG SÓT?". Dẫn: "Tạo tài khoản miễn phí, tải game và gặp người chơi ngay hôm nay." Hai nút "ĐĂNG KÝ TÀI KHOẢN" và "XEM HƯỚNG DẪN" | Giống |

Số liệu nhanh ở MT và ĐT đang khác chữ (cùng ý "miễn phí" và "tiếng Việt"). Khi code, dùng một bản. Đề xuất dùng bản MT cho cả hai. Cả hai đều cần xác nhận A-01.

### 5.2 Tin tức (`/tin-tuc`)

| Vùng | Chữ |
| --- | --- |
| Đường dẫn | TRANG CHỦ / TIN TỨC |
| Tiêu đề | TIN TỨC |
| Đoạn dẫn | Cập nhật, sự kiện và hướng dẫn mới nhất từ máy chủ Infestation Việt Nam. |
| Chip lọc | TẤT CẢ, TIN TỨC, HƯỚNG DẪN, SỰ KIỆN, CẬP NHẬT |
| Đếm | 28 BÀI VIẾT (số thật theo bộ lọc) |
| Bài nổi bật | Chú thích hình "PHÁO SÁNG" và "VẬT PHẨM SỰ KIỆN". Tag SỰ KIỆN. Tiêu đề "CUỐI TUẦN NHÂN ĐÔI KINH NGHIỆM". Tóm tắt "Hai ngày thứ Bảy và Chủ nhật, mọi người chơi nhận gấp đôi kinh nghiệm khi sống sót. Lập đội cùng bạn bè để đi xa hơn." Dòng thông tin "30/10/2026 · BAN QUẢN TRỊ". Nút "ĐỌC TIẾP" |
| Danh sách | Mỗi dòng: Tag, tiêu đề, ngày (ví dụ "28/10"). Dữ liệu trong `sample-data.json` |
| Phân trang | TRƯỚC, 1, 2, 3, 4, SAU (ĐT: TRƯỚC, 1, 2, 3, SAU) |
| Sắp xếp (ĐT) | MỚI NHẤT |

Chú thích hình "PHÁO SÁNG" và "VẬT PHẨM SỰ KIỆN" là chữ trên ảnh bìa mẫu. Khi code, ảnh bìa là ảnh thật của bài viết, bỏ hai dòng này.

### 5.3 Kho đồ (`/kho-do`)

| Vùng | Chữ |
| --- | --- |
| Đường dẫn | TRANG CHỦ / KHO ĐỒ |
| Tiêu đề | KHO ĐỒ |
| Đoạn dẫn | Tra cứu mọi vật phẩm trong game: vũ khí, giáp, y tế, vật liệu và dụng cụ. |
| Ô tìm | Nhãn "Tìm vật phẩm". Giữ chỗ "Nhập tên vật phẩm". Gợi ý "Có 41 vật phẩm trong kho" |
| Thanh công cụ | "41 VẬT PHẨM", "SẮP XẾP", chip MỚI NHẤT, TÊN A-Z |
| Cột nhóm | LOẠI VẬT PHẨM và danh sách ở mục 4.2 |
| Thẻ chọn | Nhãn nhỏ "ĐANG XEM" trên thẻ đang chọn |
| Khung chi tiết | Tên, loại, mô tả "Súng trường của người sống sót: dễ kiểm soát, bền, dùng tốt ở tầm trung. Phù hợp người mới." Bốn chỉ số: SÁT THƯƠNG 32, TẦM XA 120 m, TỐC ĐỘ BẮN 600/phút, BĂNG ĐẠN 30 viên |

Mô tả và bốn chỉ số của AK-74 là chữ mẫu (giả định A-15). Dữ liệu thật phải lấy từ game hoặc do quản trị nhập.

### 5.4 Xếp hạng (`/xep-hang`)

| Vùng | Chữ |
| --- | --- |
| Đường dẫn | TRANG CHỦ / XẾP HẠNG |
| Tiêu đề | XẾP HẠNG |
| Đoạn dẫn | Bảng xếp hạng người chơi theo GameDollar, kinh nghiệm (XP) và gia tộc. |
| Ô tìm, tab, cột | Mục 4.3 |
| Đếm (ĐT) | 12.480 người chơi |
| Dòng của tôi | 128, NguoiSongSot, Sống Sót, 312.450, 9.870 |
| Các dòng khác | Mười hai dòng đầu trong `sample-data.json` |

### 5.5 Đăng nhập (`/dang-nhap`)

| Vùng | Chữ MT | Khác ở ĐT |
| --- | --- | --- |
| Nút đầu | QUAY LẠI TRANG CHỦ | TRANG CHỦ |
| Khối hình (Visual) | Nhãn "TÀI KHOẢN". Tiêu đề "VÀO LẠI VÙNG ĐẤT SINH TỒN" (hai dòng). Dẫn "Đăng nhập để xem nhân vật, kho đồ và vị trí của bạn trên bảng xếp hạng." Túi đồ mẫu BA LÔ 32 Ô, BỘ Y TẾ, LA BÀN, ĐỒ HỘP | Cùng chữ. Dưới đoạn dẫn là dải ba hình vật phẩm (ba lô, hộp thuốc, la bàn), không có chữ |
| Form | Tiêu đề "ĐĂNG NHẬP". Email, giữ chỗ "nguoisongsot@email.com", gợi ý "Email đã dùng để đăng ký tài khoản". Mật khẩu, giữ chỗ "••••••••", gợi ý "Phân biệt chữ hoa và chữ thường" | Giống. Tiêu đề form dùng H2 |
| Nút | ĐĂNG NHẬP (Primary L). Liên kết "QUÊN MẬT KHẨU?" | Giống |
| Chân form | "Chưa có tài khoản?" và liên kết "ĐĂNG KÝ NGAY" | Giống |

### 5.6 Đăng ký (`/dang-ky`)

| Vùng | Chữ |
| --- | --- |
| Khối hình | Nhãn "TÀI KHOẢN MỚI". Tiêu đề "BƯỚC ĐẦU TIÊN ĐỂ SỐNG SÓT". Dẫn "Tạo tài khoản miễn phí. Chỉ cần email, tên hiển thị và mật khẩu." |
| Form | Tiêu đề "TẠO TÀI KHOẢN". Email (giữ chỗ nguoisongsot@email.com, gợi ý "Dùng để đăng nhập và lấy lại mật khẩu"). Tên hiển thị (giữ chỗ ThoSanDem, gợi ý "Tên không được có dấu hay dấu cách. Ví dụ: ThoSanDem"). Mật khẩu (gợi ý "Ít nhất 8 ký tự"). Nhập lại mật khẩu (gợi ý "Gõ lại đúng mật khẩu ở trên") |
| Nút | TẠO TÀI KHOẢN (Primary L) |
| Ghi chú | "Bằng việc đăng ký, bạn đồng ý với quy tắc cộng đồng." Cụm "quy tắc cộng đồng" nên là liên kết tới `/quy-tac` (G-22) |
| Chân form | "Đã có tài khoản?" và liên kết ĐĂNG NHẬP |

### 5.7 Hồ sơ (`/ho-so`)

| Vùng | Chữ |
| --- | --- |
| Đường dẫn và tiêu đề | TRANG CHỦ / HỒ SƠ. Tiêu đề HỒ SƠ. Dẫn "Tài khoản, nhân vật và thành tích của bạn trên máy chủ." |
| Bốn thẻ số | HẠNG 128, GAMEDOLLAR 312.450, KINH NGHIỆM (XP) 9.870, CẤP 14 |
| Thẻ tài khoản | Tên "NguoiSongSot". Gia tộc "Gia tộc Sống Sót". "ĐANG TRỰC TUYẾN". EMAIL "n***@email.com". NGÀY THAM GIA "12/03/2026". TRẠNG THÁI "Đã kích hoạt". Nút ĐỔI MẬT KHẨU, ĐĂNG XUẤT |
| Nhân vật | Nhãn NHÂN VẬT. Không có nút TẠO NHÂN VẬT (A-23 đã bỏ). Thẻ "ThoSanDem01" (Cấp 14 · Thợ săn, ĐANG CHƠI) và "ThoSanDem02" (Cấp 6 · Người nhặt đồ, ĐANG CHƠI). Mỗi thẻ có "VŨ KHÍ ĐANG DÙNG" và "ĐÃ SỐNG SÓT" (87 đêm, 19 đêm) |
| Kỹ năng | Nhãn KỸ NĂNG. Sáu kỹ năng: THỂ LỰC, BẮN SÚNG, SINH TỒN (ĐÃ MỞ), Y TẾ, CHẾ TẠO, CẬN CHIẾN (CHƯA MỞ) |

Email luôn được che ("n***@email.com", giữ ký tự đầu). Nghề ("Thợ săn", "Người nhặt đồ"), số đêm sống sót và tên kỹ năng là chữ mẫu (giả định A-12 đến A-14).

### 5.8 Quản trị bài viết (`/quan-tri/bai-viet/moi`)

| Vùng | Chữ |
| --- | --- |
| Thanh bên (MT) | Nhãn QUẢN TRỊ. Mục BÀI VIẾT (đang chọn), VẬT PHẨM, BANNER, NGƯỜI DÙNG, NHẬT KÝ. Nút ĐĂNG XUẤT |
| Đầu trang | "ĐĂNG BÀI MỚI". Nút LƯU NHÁP, XUẤT BẢN |
| Tiêu đề bài | Nhãn "Tiêu đề". Giá trị mẫu "Cuối tuần nhân đôi kinh nghiệm". Gợi ý "Tối đa 80 ký tự. Hiện có 30 ký tự." (số đếm cập nhật theo lúc gõ) |
| Phân loại | Nhãn PHÂN LOẠI. Bốn chip: TIN TỨC, HƯỚNG DẪN, SỰ KIỆN, CẬP NHẬT |
| Nội dung | Nhãn NỘI DUNG. Thanh công cụ: ĐẬM, NGHIÊNG, DANH SÁCH, LIÊN KẾT, ẢNH. Nội dung mẫu: "Hai ngày thứ Bảy và Chủ nhật, mọi người chơi nhận gấp đôi kinh nghiệm khi sống sót." và "Lập đội cùng bạn bè để đi xa hơn. Sự kiện bắt đầu lúc 08:00 sáng thứ Bảy và kết thúc lúc 23:59 Chủ nhật." |
| Ảnh đại diện | Nhãn "ẢNH ĐẠI DIỆN". Vùng thả: "Kéo ảnh vào đây hoặc chọn từ kho hình" (ĐT: "Chọn ảnh từ máy hoặc từ kho hình"). Nút CHỌN ẢNH |
| Khung xuất bản | Nhãn XUẤT BẢN. TRẠNG THÁI "BẢN NHÁP". NGÀY ĐĂNG "30/10/2026 08:00". TÁC GIẢ "Ban quản trị". GHIM LÊN ĐẦU (BẬT, TẮT). THÔNG BÁO TRONG GAME (BẬT, TẮT). Nút "XUẤT BẢN NGAY" và "LƯU NHÁP" |
| Bài gần đây | Nhãn "BÀI GẦN ĐÂY". Bốn dòng tin mẫu |

"THÔNG BÁO TRONG GAME" cần kênh gửi vào game (câu hỏi mở trong PRD). Nếu chưa có kênh, ẩn dòng này.

## 6. Biểu mẫu: gợi ý, lỗi và thông báo thành công

Các gợi ý nằm trong Figma (mục 5). Các thông báo lỗi dưới đây là **đề xuất**, chưa có trong Figma. Lỗi hiện dưới ô, chữ `text/danger`, kèm biểu tượng "!" và `aria-describedby`. Lỗi chung của form hiện trên đầu form với `role="alert"`.

### 6.1 Đăng nhập

| Tình huống | Chữ |
| --- | --- |
| Email trống | Nhập email của bạn. |
| Email sai dạng | Email chưa đúng. Ví dụ: ten@email.com |
| Mật khẩu trống | Nhập mật khẩu. |
| Sai email hoặc mật khẩu | Email hoặc mật khẩu chưa đúng. Kiểm tra lại rồi thử tiếp. |
| Thử quá nhiều lần | Bạn thử quá nhiều lần. Chờ 15 phút rồi thử lại. |
| Mất kết nối | Không kết nối được. Thử lại sau vài giây. |

Không nói rõ là email sai hay mật khẩu sai (tránh lộ email nào có tài khoản).

### 6.2 Đăng ký

| Tình huống | Chữ |
| --- | --- |
| Email đã có tài khoản | Email này đã có tài khoản. Hãy đăng nhập hoặc dùng email khác. |
| Tên có dấu hoặc dấu cách | Tên không được có dấu hay dấu cách. Ví dụ: ThoSanDem |
| Tên sai độ dài | Tên cần từ 3 đến 16 ký tự. |
| Tên đã có người dùng | Tên này đã có người dùng. Chọn tên khác. |
| Mật khẩu ngắn | Mật khẩu cần ít nhất 8 ký tự. |
| Hai mật khẩu khác nhau | Hai mật khẩu chưa giống nhau. |
| Thành công | Tạo tài khoản xong. Bạn đã đăng nhập và có thể tải game. |

### 6.3 Quên mật khẩu và đổi mật khẩu

Chữ ở ba dòng đầu đã có trong Figma (bảng trạng thái xác thực, mục 10.5). Các dòng còn lại là đề xuất.

| Tình huống | Chữ |
| --- | --- |
| Gửi liên kết (luôn hiện, dù email có tài khoản hay không) | Nếu email này có tài khoản, bạn sẽ nhận thư trong vài phút. Liên kết dùng được trong 30 phút. Không thấy thư? Hãy xem mục thư rác. |
| Liên kết hết hạn hoặc đã dùng | Liên kết đã quá 30 phút hoặc đã được dùng rồi. Hãy gửi liên kết mới. (nút GỬI LẠI LIÊN KẾT) |
| Đặt lại xong | Mật khẩu mới đã được lưu. Bạn có thể đăng nhập ngay. |
| Mật khẩu hiện tại sai (đề xuất) | Mật khẩu hiện tại chưa đúng. |
| Đổi xong trong hồ sơ (đề xuất) | Đã đổi mật khẩu. Các máy khác sẽ phải đăng nhập lại. |

### 6.4 Tìm kiếm

| Tình huống | Chữ |
| --- | --- |
| Tìm người chơi dưới 2 ký tự | Gõ ít nhất 2 ký tự. |
| Tên có dấu | Tên người chơi không có dấu. Thử gõ không dấu. |

### 6.5 Quản trị bài viết

| Tình huống | Chữ |
| --- | --- |
| Tiêu đề trống | Nhập tiêu đề bài viết. |
| Tiêu đề quá dài | Tiêu đề tối đa 80 ký tự. |
| Chưa chọn phân loại | Chọn một phân loại. |
| Nội dung trống | Bài viết cần có nội dung. |
| Ảnh sai định dạng | Chỉ nhận ảnh JPG, PNG hoặc WebP, tối đa 5 MB. |
| Lưu nháp xong | Đã lưu nháp. |
| Xuất bản xong | Đã xuất bản bài viết. |
| Lỗi lưu | Chưa lưu được. Thử lại. Nội dung của bạn vẫn còn trên màn hình. |
| Rời trang khi chưa lưu | Bạn có thay đổi chưa lưu. Rời trang sẽ mất các thay đổi này. |

## 7. Trạng thái danh sách (ListState)

Chữ lấy từ bảng trạng thái trong Figma (`62:1027`). Quy tắc nằm trong `DESIGN-SPEC.md`, mục 8.

| Danh sách | Trạng thái | Tiêu đề | Câu | Nút |
| --- | --- | --- | --- | --- |
| Tin tức | Rỗng | CHƯA CÓ TIN | Mục này chưa có bài viết. Quay lại sau hoặc xem mục khác. | XEM TẤT CẢ TIN |
| Tin tức | Đang tải | ĐANG TẢI TIN | Chờ một chút, tin mới đang về. | Không có |
| Tin tức | Lỗi | KHÔNG TẢI ĐƯỢC TIN | Kết nối bị gián đoạn. Thử lại sau vài giây. | THỬ LẠI |
| Kho đồ | Rỗng | KHÔNG TÌM THẤY VẬT PHẨM | Không có vật phẩm khớp với bộ lọc. Thử từ khóa khác hoặc xóa bộ lọc. | XÓA BỘ LỌC |
| Kho đồ | Đang tải | ĐANG TẢI KHO ĐỒ | Chờ một chút, vật phẩm đang về. | Không có |
| Kho đồ | Lỗi | KHÔNG TẢI ĐƯỢC KHO ĐỒ | Kết nối bị gián đoạn. Thử lại sau vài giây. | THỬ LẠI |
| Xếp hạng | Rỗng | KHÔNG CÓ NGƯỜI CHƠI NÀY | Không tìm thấy tên này trong bảng xếp hạng. Kiểm tra lại chính tả. | XÓA TỪ KHÓA |
| Xếp hạng | Đang tải | ĐANG TẢI XẾP HẠNG | Chờ một chút, số liệu đang về. | Không có |
| Xếp hạng | Lỗi | KHÔNG TẢI ĐƯỢC XẾP HẠNG | Kết nối bị gián đoạn. Thử lại sau vài giây. | THỬ LẠI |

Ba trạng thái Lỗi dùng chung một câu trong Figma. Nếu cần câu riêng cho từng danh sách, đặt khi code.

Ba quy tắc chung ghi trong khung "QUY TẮC CHUNG" của Figma:

1. Nói rõ vì sao rỗng. Cho một nút để làm tiếp, ví dụ xóa bộ lọc.
2. Hiện thanh xám đúng chỗ dữ liệu sẽ về. Quá 8 giây thì chuyển sang trạng thái Lỗi. Nếu người dùng bật giảm chuyển động thì không nhấp nháy.
3. Luôn có nút Thử lại. Không hiện mã lỗi kỹ thuật. Giữ nguyên bộ lọc người dùng đã chọn.

Các danh sách khác (đề xuất): Nhân vật rỗng (chủ dự án chốt 29/10/2026): "CHƯA CÓ NHÂN VẬT", "Nhân vật được tạo khi bạn vào game lần đầu. Tải game và đăng nhập để bắt đầu." và nút TẢI GAME tới `/tai-game`. Bảng quản trị rỗng: "CHƯA CÓ BÀI VIẾT" và nút ĐĂNG BÀI MỚI.

## 8. Dữ liệu mẫu và quy tắc thay thế

- Tệp `sample-data.json` chứa dữ liệu mẫu khớp từng chữ với Figma: 8 bài viết trong danh sách công khai và 2 bài chỉ có ở quản trị hoặc trang chi tiết (`moreNews`), 12 dòng xếp hạng cộng dòng của tôi, 12 vật phẩm, 12 gia tộc (trường `clans`, dùng cho bảng xếp hạng gia tộc và huy hiệu ở hồ sơ), 1 tài khoản, 2 nhân vật, 6 kỹ năng, 3 banner, 7 người dùng quản trị, 8 dòng nhật ký, thông tin tải game. Nhóm `staticContent` giữ nội dung tĩnh: ba bước cài đặt, bốn câu hỏi thường gặp, kênh hỗ trợ (Facebook, Discord), quy tắc cộng đồng, bộ đồ khởi đầu và luật tạo nhân vật (tối đa 5, chỉ để tham khảo vì trang tạo nhân vật đã bỏ). Mục `meta.knownQuirks` ghi các chỗ bản vẽ không khớp nhau.
- Toàn bộ tên người chơi và gia tộc là tên tổng hợp. Không dùng tên thật từ site cũ hoặc từ bất kỳ nguồn nào.
- Dữ liệu mẫu chỉ dùng trong môi trường phát triển. Trước khi chạy thật phải thay bằng dữ liệu thật, hoặc ẩn khối chưa có dữ liệu.
- Ngày mẫu: bản MT dùng 30/10, 28/10, 27/10, 25/10, 22/10 cho năm tin đầu. Bản ĐT dùng ngày lệch vài ngày (28/10, 27/10, 25/10, 24/10, 22/10, 20/10). Đây chỉ là dữ liệu mẫu, không phải quy tắc.
- Bài nổi bật không lặp lại trong danh sách. Bản vẽ Figma lặp bài "Cuối tuần nhân đôi kinh nghiệm" chỉ vì dữ liệu mẫu.

## 9. Giả định cần chủ dự án xác nhận

Mỗi dòng dưới đây là điều bản vẽ đang nói như thể đã chắc. Cần chủ dự án xác nhận trước khi chạy thật.

| Mã | Giả định | Nơi xuất hiện | Nếu sai thì sửa thế nào |
| --- | --- | --- | --- |
| A-01 | Game miễn phí: "MIỄN PHÍ", "0 ĐỒNG", "Tạo tài khoản miễn phí" | Thanh trạng thái, hero, số liệu nhanh, khối cuối, Đăng ký | Bỏ các cụm này hoặc đổi thành mô tả đúng |
| A-02 | Máy chủ chạy "24/7" | Số liệu nhanh | Bỏ số liệu này |
| A-03 | Game chỉ chạy trên Windows | Ghi chú dưới nút hero | Sửa theo thực tế. Xem thêm G-03 (người dùng điện thoại vẫn thấy nút TẢI GAME) |
| A-04 | Số "34 NGƯỜI ĐANG CHƠI" lấy được theo thời gian thực | Thanh trạng thái, số liệu nhanh | Ẩn khi không có nguồn số |
| A-05 | Tổng "12.480 người chơi" lấy được | Xếp hạng ĐT | Ẩn dòng đếm |
| A-06 | Đã bỏ dòng pháp lý ở chân trang (chủ dự án chốt 29/10/2026). Câu "Bằng việc đăng ký, bạn đồng ý với quy tắc cộng đồng." ở form đăng ký vẫn giữ vì là liên kết tới `/quy-tac` | Chân trang, Đăng ký | Thêm lại dòng pháp lý khi chủ dự án có chữ |
| A-07 | Có ba kênh Facebook (group), Discord, YouTube. Đã bỏ Zalo (chủ dự án chốt 29/10/2026) | Chân trang | Chỉ giữ kênh có địa chỉ |
| A-08 | Có kênh "Liên hệ quản trị" | Chân trang | Dùng email hoặc ẩn |
| A-09 | Có bộ cài tải được và hướng dẫn cài | Nút TẢI GAME, bước 02 | Chủ dự án cung cấp bộ cài, dung lượng, phiên bản, cách tải |
| A-10 | Mật khẩu từ 8 ký tự trở lên | Đăng ký | Đổi theo quy định của hệ thống tài khoản |
| A-11 | Tên hiển thị 3 đến 16 ký tự, không dấu, không dấu cách | Đăng ký | Đổi theo quy định của game |
| A-12 | Nhân vật có cấp và nghề ("Thợ săn", "Người nhặt đồ") | Hồ sơ | Bỏ nghề nếu game không có |
| A-13 | Có thống kê "ĐÃ SỐNG SÓT" theo đêm | Hồ sơ | Bỏ dòng này nếu không có dữ liệu |
| A-14 | Tên sáu kỹ năng (THỂ LỰC đến CẬN CHIẾN) | Hồ sơ | Đối chiếu với danh sách kỹ năng thật của game |
| A-15 | Chỉ số và mô tả vật phẩm (sát thương, tầm xa, tốc độ bắn, băng đạn) | Kho đồ, Trang chủ | Dữ liệu thật phải lấy từ game hoặc do quản trị nhập |
| A-16 | Tên tiếng Việt của 41 vật phẩm ("Xà beng", "Rìu nhỏ", "Rìu cứu hỏa", "Ba lô 32 ô", "Bộ y tế") | Kho đồ, Trang chủ | Chủ dự án duyệt cột "Tên hiển thị gợi ý" trong `ASSET-MAP.md` |
| A-17 | Người đăng bài hiện là "Ban quản trị" | Tin tức, Quản trị | Đổi tên tác giả thật nếu muốn |
| A-18 | Giọng "Trạm trưởng" (lời nhắn từ trạm 88.1 MHz) hợp với chủ dự án | Trang chủ | Bỏ khối hoặc đổi lời |
| A-19 | Ba gia tộc mẫu (Bão Đêm, Thép Xám, Sống Sót) | Xếp hạng, Hồ sơ | Thay bằng gia tộc thật |
| A-20 | Quyền dùng hình vật phẩm và biểu tượng lấy từ client game | Mọi trang có hình | Chủ dự án xác nhận quyền dùng. Xem G-15 |
| A-21 | Thông tin bộ cài và yêu cầu máy: phiên bản 1.0.3, dung lượng 1,2 GB, ngày 28/10/2026, Windows 7 trở lên (64 bit), 4 GB RAM, 3 GB ổ đĩa trống, cần internet | Tải game, bài chi tiết | Thay bằng số thật từ bộ cài và client. Nếu chưa có bộ cài thì ẩn khối tải và hiện thông báo "sắp có" |
| A-22 | Chính sách bảo mật tài khoản: liên kết đặt lại dùng được 30 phút, gửi lại sau 60 giây, khóa đăng nhập 15 phút sau nhiều lần sai, mật khẩu tối thiểu 8 ký tự | Quên mật khẩu, Đặt lại, Đăng nhập, Đổi mật khẩu | Đổi theo hệ thống tài khoản thật. Số lần sai trước khi khóa chưa được chọn (đề xuất 5) |
| A-23 | Đã chốt 29/10/2026: bỏ trang Tạo nhân vật và nút "TẠO NHÂN VẬT". Nhân vật tạo trong game. Giới hạn mỗi tài khoản là 5 nhân vật (đổi từ 3). Tên nhân vật 3 đến 16 ký tự, không dấu, không đổi được sau khi tạo. Bộ đồ khởi đầu gồm ba lô 32 ô, bộ y tế, la bàn và hai đồ hộp | Hồ sơ (ghi chú mục 10.7) | Nếu muốn tạo nhân vật trên website, làm lại E2-S6 theo mục 10.7 |
| A-24 | "Banner" nghĩa là dải thông báo trên đầu mọi trang. Mỗi lần chỉ một banner đang bật. Bật banner mới thì banner cũ tự tắt | Quản trị Banner | Chủ dự án xác nhận ý nghĩa. Nếu Banner là ảnh quảng cáo thì thiết kế lại trang này |
| A-25 | Nội dung bốn quy tắc cộng đồng và mức xử lý (cảnh cáo, khóa 7 ngày, khóa vĩnh viễn) | Quy tắc cộng đồng, Tạo nhân vật | Ban quản trị viết lại. Mức xử lý phải khớp với cách quản trị thật |
| A-26 | Ba bước cài đặt, bốn câu hỏi thường gặp và hai kênh hỗ trợ (Facebook, Discord). Đã bỏ Zalo | Tải game, bài chi tiết | Viết lại theo cách cài thật. Chỉ giữ kênh có địa chỉ |
| A-27 | Hai vai trò (người chơi, quản trị) và hai trạng thái tài khoản (HOẠT ĐỘNG, BỊ KHÓA). Quản trị chọn tối đa 4 vật phẩm nổi bật cho trang chủ. Nhật ký ghi các hành động mẫu: ĐĂNG BÀI, BẬT NỔI BẬT, SỬA BANNER, KHÓA NGƯỜI DÙNG, ẨN BÀI, THÊM VẬT PHẨM, ĐĂNG NHẬP | Quản trị Vật phẩm, Người dùng, Nhật ký | Đổi theo quy trình quản trị thật |

## 10. Chữ trên các trang thiết kế ở vòng 3

Chữ lấy từng chữ từ Figma ngày 29/10/2026. Dấu "/" trong ô là xuống dòng. Nút giữ nguyên chữ hoa như trên giao diện. Các chữ có ghi "chú thích thiết kế" chỉ là ghi chú trên bản vẽ, không đưa lên trang thật.

### 10.1 Tải game (`/tai-game`)

| Vị trí | Chữ |
| --- | --- |
| Đường dẫn, tiêu đề, đoạn dẫn | TRANG CHỦ / TẢI GAME. TẢI GAME. Tải bộ cài, cài đặt và vào trận chỉ trong vài phút. |
| Khung tải (nhãn, tiêu đề) | BẢN CÀI ĐẶT MỚI NHẤT. TẢI BỘ CÀI / VÀO TRẬN NGAY |
| Khung tải (đoạn) | Một tệp duy nhất. Tải về, chạy bộ cài, rồi đăng nhập bằng tài khoản của bạn. |
| Khung tải (thông tin) | PHIÊN BẢN 1.0.3. DUNG LƯỢNG 1,2 GB. Ngày 28/10/2026 |
| Khung tải (nút, dòng nhỏ) | TẢI BỘ CÀI. XEM HƯỚNG DẪN. Miễn phí · Dành cho máy tính Windows |
| Yêu cầu máy | YÊU CẦU MÁY. HỆ ĐIỀU HÀNH: Windows 7 trở lên (64 bit). BỘ NHỚ: 4 GB RAM. Ổ ĐĨA: 3 GB trống. MẠNG: Cần kết nối internet |
| Mục cài đặt | 01 · CÀI ĐẶT. BA BƯỚC CÀI ĐẶT. Làm theo ba bước. Hầu hết người chơi vào được game trong vài phút. |
| Bước 01 | TẢI BỘ CÀI. Bấm TẢI BỘ CÀI ở đầu trang. Tệp có dung lượng khoảng 1,2 GB. Nút: TẢI BỘ CÀI |
| Bước 02 | CÀI ĐẶT GAME. Mở tệp vừa tải, chọn thư mục cài đặt và chờ cho tới khi cài xong. Nút: XEM LỖI THƯỜNG GẶP |
| Bước 03 | ĐĂNG NHẬP VÀ CHƠI. Mở game và đăng nhập bằng email, mật khẩu của tài khoản website. Nút: TẠO TÀI KHOẢN |
| Mục hỗ trợ | 02 · HỖ TRỢ. GẶP LỖI KHI CÀI ĐẶT? Các lỗi người mới hay gặp và cách xử lý nhanh. |
| Hỏi đáp 1 | KHÔNG MỞ ĐƯỢC BỘ CÀI. Bấm chuột phải vào tệp và chọn chạy bằng quyền quản trị. Nếu phần mềm diệt virus chặn tệp, hãy tạm tắt nó trong lúc cài. |
| Hỏi đáp 2 | KHÔNG ĐĂNG NHẬP ĐƯỢC. Dùng đúng email và mật khẩu của tài khoản website. Mật khẩu phân biệt chữ hoa và chữ thường. |
| Hỏi đáp 3 | QUÊN MẬT KHẨU. Dùng liên kết Quên mật khẩu ở trang đăng nhập. Nếu không thấy thư, hãy kiểm tra mục thư rác. |
| Hỏi đáp 4 | KHÔNG VÀO ĐƯỢC MÁY CHỦ. Xem thanh trạng thái ở đầu trang. Nếu máy chủ đang bảo trì, hãy thử lại sau ít phút. |
| Hỗ trợ | TRẠM TRƯỞNG · 88.1 MHz. Vẫn chưa vào được game? Nhắn kênh hỗ trợ, ban quản trị sẽ trả lời. Nút: FACEBOOK, DISCORD (đã bỏ ZALO) |
| ĐT: cảnh báo | GAME CHỈ CHẠY TRÊN WINDOWS. Bạn đang xem bằng điện thoại. Hãy sao chép liên kết và mở lại trên máy tính để tải bộ cài. Nút: SAO CHÉP LIÊN KẾT. Dòng nhỏ: Mở trang này trên máy tính Windows để tải. Miễn phí. |

### 10.2 Chi tiết bài viết (`/tin-tuc/:slug`)

| Vị trí | Chữ |
| --- | --- |
| Đường dẫn | TRANG CHỦ / TIN TỨC / BÀI VIẾT |
| Đầu bài | Tag CẬP NHẬT. 28/10/2026 · BAN QUẢN TRỊ · ĐỌC 3 PHÚT (ĐT: 28/10/2026 · ĐỌC 3 PHÚT). Tiêu đề: CẬP NHẬT 1.0.3: SỬA LỖI VÀ CÂN BẰNG LẠI VŨ KHÍ |
| Nội dung mẫu | Máy chủ sẽ bảo trì từ 04:00 đến 06:00 sáng thứ Sáu. Bản cập nhật 1.0.3 sửa các lỗi gây khó chịu nhất và cân bằng lại một số vũ khí. |
| Tiêu đề con và danh sách | SỬA LỖI: Sửa lỗi nhân vật bị kẹt khi trèo qua hàng rào. Sửa lỗi kho đồ không lưu đúng vị trí vật phẩm. Sửa lỗi mất kết nối khi nhiều người vào cùng một khu. |
| Tiêu đề con và đoạn | CÂN BẰNG VŨ KHÍ: Sát thương của AK-74 giảm nhẹ ở tầm xa. Súng ngắn chính xác hơn khi đứng yên. Hãy thử và gửi phản hồi cho chúng tôi. |
| Giọng Trạm trưởng | TRẠM TRƯỞNG · 88.1 MHz. Cần hỗ trợ sau khi cập nhật? Xem hướng dẫn tải game hoặc nhắn kênh hỗ trợ. |
| Cuối bài | BÀI KHÁC. ĐỌC THÊM TIN MỚI. Nút: QUAY LẠI TIN TỨC |

### 10.3 Chi tiết vật phẩm (`/kho-do/:slug`)

| Vị trí | Chữ |
| --- | --- |
| Đường dẫn | TRANG CHỦ / KHO ĐỒ / AK-74 |
| Khối chi tiết | Dùng lại chữ của khối Detail ở Kho đồ (mục 5.3): nhãn loại SÚNG TRƯỜNG, tên AK-74, mô tả, bốn chỉ số SÁT THƯƠNG 32, TẦM XA 120 m, TỐC ĐỘ BẮN 600/phút, BĂNG ĐẠN 30 viên |
| Cuối trang | CÙNG KHO ĐỒ. VẬT PHẨM KHÁC. Nút: QUAY LẠI KHO ĐỒ |

### 10.4 Quên mật khẩu và Đặt lại mật khẩu

| Trang | Chữ |
| --- | --- |
| Quên: Visual | KHÔI PHỤC TÀI KHOẢN. LẤY LẠI QUYỀN / VÀO GAME (ĐT: LẤY LẠI QUYỀN VÀO GAME). Quên mật khẩu không làm mất tài khoản. Chúng tôi chỉ cần email bạn đã đăng ký. |
| Quên: biểu mẫu | QUÊN MẬT KHẨU. Nhập email đã đăng ký. Chúng tôi sẽ gửi một liên kết để bạn đặt mật khẩu mới. Field EMAIL (giá trị mẫu nguoisongsot@email.com), gợi ý: Dùng email bạn đã đăng ký tài khoản. Nút: GỬI LIÊN KẾT. Dòng cuối: Nhớ mật khẩu rồi? và nút ĐĂNG NHẬP. Nút ở thanh trên (AuthBar): ĐĂNG NHẬP |
| Đặt lại: Visual | MẬT KHẨU MỚI. SẮP VÀO LẠI / ĐƯỢC RỒI (ĐT: SẮP VÀO LẠI ĐƯỢC RỒI). Chọn mật khẩu mới rồi đăng nhập như bình thường. Mỗi liên kết chỉ dùng được một lần. |
| Đặt lại: biểu mẫu | ĐẶT MẬT KHẨU MỚI. Chọn mật khẩu mới cho tài khoản n***@email.com. Field MẬT KHẨU MỚI, gợi ý: Tối thiểu 8 ký tự. Phân biệt chữ hoa và chữ thường. Field NHẬP LẠI MẬT KHẨU, gợi ý: Nhập lại đúng mật khẩu ở trên. Nút: LƯU MẬT KHẨU MỚI. Nút phụ trong ô: HIỆN |

### 10.5 Bảng trạng thái xác thực (sáu trạng thái)

| Số | Chữ |
| --- | --- |
| Đầu bảng | THÔNG BÁO XÁC THỰC. Sáu trạng thái của đăng nhập, quên mật khẩu và quyền truy cập. |
| 1 | SAU KHI GỬI YÊU CẦU QUÊN MẬT KHẨU. ĐÃ GỬI LIÊN KẾT. Nếu email này có tài khoản, bạn sẽ nhận thư trong vài phút. Liên kết dùng được trong 30 phút. Không thấy thư? Hãy xem mục thư rác. Nút: GỬI LẠI LIÊN KẾT (dòng nhỏ: Có thể gửi lại sau 60 giây.), QUAY LẠI ĐĂNG NHẬP |
| 2 | LIÊN KẾT HẾT HẠN HOẶC ĐÃ DÙNG. LIÊN KẾT KHÔNG DÙNG ĐƯỢC. Nhãn LIÊN KẾT HẾT HẠN. Liên kết đã quá 30 phút hoặc đã được dùng rồi. Hãy gửi liên kết mới. |
| 3 | ĐỔI MẬT KHẨU THÀNH CÔNG. ĐÃ ĐỔI MẬT KHẨU. Nhãn ĐÃ LƯU. Mật khẩu mới đã được lưu. Bạn có thể đăng nhập ngay. |
| 4 | ĐĂNG NHẬP SAI (THÔNG BÁO CHUNG). EMAIL HOẶC MẬT KHẨU CHƯA ĐÚNG. Hãy kiểm tra lại. Mật khẩu phân biệt chữ hoa và chữ thường. Field MẬT KHẨU ở trạng thái lỗi |
| 5 | TẠM KHÓA SAU NHIỀU LẦN SAI. TẠM KHÓA ĐĂNG NHẬP. BẠN NHẬP SAI QUÁ NHIỀU LẦN. Hãy thử lại sau 15 phút, hoặc đặt lại mật khẩu ngay. Nút: ĐẶT LẠI MẬT KHẨU |
| 6 | KHÔNG CÓ QUYỀN TRUY CẬP. KHÔNG ĐƯỢC PHÉP VÀO. TRANG NÀY CHỈ DÀNH CHO QUẢN TRỊ VIÊN. Tài khoản của bạn không có quyền xem trang quản trị. Nút: VỀ TRANG CHỦ |

### 10.6 Đổi mật khẩu (`/ho-so/doi-mat-khau`)

| Vị trí | Chữ |
| --- | --- |
| Đường dẫn, đoạn dẫn | TRANG CHỦ / HỒ SƠ / ĐỔI MẬT KHẨU (ĐT: HỒ SƠ / ĐỔI MẬT KHẨU). Dùng mật khẩu mạnh và chưa dùng ở nơi khác. |
| Field 1 | MẬT KHẨU HIỆN TẠI. Gợi ý: Nhập mật khẩu bạn đang dùng. |
| Field 2 | MẬT KHẨU MỚI. Gợi ý: Tối thiểu 8 ký tự. Phân biệt chữ hoa và chữ thường. |
| Field 3 | NHẬP LẠI MẬT KHẨU MỚI. Gợi ý: Nhập lại đúng mật khẩu mới. |
| Nút | LƯU MẬT KHẨU (Primary L). HỦY (Secondary L). Nút phụ trong ô: HIỆN. Đầu trang đã đăng nhập có nút TẢI GAME |
| Mẹo | MẸO CHỌN MẬT KHẨU. Dài từ 8 ký tự trở lên. Trộn chữ hoa, chữ thường và số. Không dùng lại mật khẩu của email hay của trang khác. Sau khi đổi, các thiết bị khác sẽ phải đăng nhập lại. |

### 10.7 Tạo nhân vật (`/ho-so/nhan-vat/moi`), đã bỏ khỏi bản code (A-23)

Chủ dự án chốt bỏ trang này ngày 29/10/2026. Bản vẽ Figma vẫn còn. Giữ bảng dưới để làm lại khi cần. Giới hạn nhân vật đã đổi từ 3 sang 5.

| Vị trí | Chữ |
| --- | --- |
| Đường dẫn, đoạn dẫn | TRANG CHỦ / HỒ SƠ / TẠO NHÂN VẬT (ĐT: HỒ SƠ / TẠO NHÂN VẬT). Đặt tên cho người sống sót mới. Tên không đổi được sau khi tạo. |
| Field | TÊN NHÂN VẬT. Giá trị mẫu: ThoSanDem03. Gợi ý: 3 đến 16 ký tự, không dấu, viết liền. |
| Số nhân vật | SỐ NHÂN VẬT 2 / 5 |
| Ô chọn và nút | Tôi đã đọc quy tắc cộng đồng. Nút: TẠO NHÂN VẬT (Primary L), HỦY (Secondary L) |
| Bộ đồ khởi đầu | BỘ ĐỒ KHỞI ĐẦU. Mọi nhân vật mới nhận bộ đồ này. Ba lô 32 ô x1. Bộ y tế x1. La bàn x1. Đồ hộp x2. Chú thích thiết kế: Danh sách mẫu, ban quản trị sẽ chốt sau. |

### 10.8 Quy tắc cộng đồng (`/quy-tac`)

| Vị trí | Chữ |
| --- | --- |
| Đầu trang | TRANG CHỦ / QUY TẮC. QUY TẮC CỘNG ĐỒNG. Cập nhật lần cuối 28/10/2026. Bốn quy tắc giúp máy chủ vui và công bằng. |
| Mục lục | MỤC LỤC. 1. TÔN TRỌNG NGƯỜI CHƠI KHÁC. 2. KHÔNG GIAN LẬN. 3. BẢO VỆ TÀI KHOẢN. 4. XỬ LÝ VI PHẠM |
| Quy tắc 1 | Đây là máy chủ của cộng đồng. Hãy cư xử như bạn muốn người khác cư xử với bạn. Không chửi bới, đe dọa hay kỳ thị người khác. Không chặn điểm xuất hiện để giết liên tục người chơi mới. Không phát tán nội dung nhạy cảm trong trò chuyện. |
| Quy tắc 2 | Mọi cách chơi không công bằng đều bị cấm. Không dùng phần mềm hack hoặc công cụ tự động. Không cố tình khai thác lỗi game. Nếu thấy lỗi, hãy báo cho ban quản trị. Không mua bán tài khoản hoặc vật phẩm bằng tiền thật. |
| Quy tắc 3 | Ban quản trị không bao giờ hỏi mật khẩu của bạn. Đừng chia sẻ mật khẩu cho bất kỳ ai. |
| Quy tắc 4 | Mỗi trường hợp được xem xét riêng. Mức xử lý thông thường như sau. LẦN 1: CẢNH CÁO. LẦN 2: KHÓA 7 NGÀY. LẦN 3: KHÓA VĨNH VIỄN. Gian lận nặng có thể bị khóa vĩnh viễn ngay lần đầu. |
| Cuối trang | TRẠM TRƯỞNG · 88.1 MHz. Thấy ai vi phạm? Báo cho ban quản trị qua kênh hỗ trợ. |

### 10.9 Trang 404 và 500

| Trang | Chữ |
| --- | --- |
| 404 | 404. KHÔNG TÌM THẤY TRANG. Trang bạn tìm không có hoặc đã được chuyển đi. Hãy quay lại trang chủ. Nút: VỀ TRANG CHỦ |
| 500 | 500. CÓ LỖI Ở MÁY CHỦ. Máy chủ gặp lỗi khi xử lý yêu cầu. Dữ liệu của bạn vẫn an toàn. Hãy thử lại sau ít phút. Nút: THỬ LẠI |

Chữ trong bản vẽ thay chữ đề xuất cũ ở mục 10 của bản trước ("Địa chỉ này không có hoặc đã bị chuyển đi", "Chúng tôi sẽ sớm khắc phục"). Dùng chữ trong bảng này.

### 10.10 Xếp hạng gia tộc

| Vị trí | Chữ |
| --- | --- |
| Đoạn dẫn | Bảng xếp hạng gia tộc theo GameDollar và kinh nghiệm (XP). |
| Điều khiển | Chip GIA TỘC đang chọn. Ô TÌM GIA TỘC, giá trị mẫu Bão Đêm, gợi ý: Nhập tên gia tộc. Dòng đếm ĐT: 86 gia tộc |
| Dòng của tôi | GIA TỘC CỦA TÔI. Tiêu đề cột: GIA TỘC |
| Dòng mẫu | Tên gia tộc, "N thành viên", GameDollar, XP. Mười hai gia tộc mẫu có trong `sample-data.json` (trường `clans`) |

### 10.11 Quản trị: các mục danh sách

| Trang | Chữ |
| --- | --- |
| Chung | Mục Sidebar: BÀI VIẾT, VẬT PHẨM, BANNER, NGƯỜI DÙNG, NHẬT KÝ. Phân trang: TRƯỚC, 1, 2, 3, SAU |
| Bài viết | BÀI VIẾT. ĐĂNG BÀI MỚI. Chip TẤT CẢ, ĐÃ ĐĂNG, BẢN NHÁP. Ô TÌM BÀI VIẾT, gợi ý: Gõ một phần tiêu đề. Cột TIÊU ĐỀ, LOẠI, NGÀY, TRẠNG THÁI. Nút SỬA, ẨN. Trạng thái ĐÃ ĐĂNG, BẢN NHÁP |
| Vật phẩm | VẬT PHẨM. THÊM VẬT PHẨM. NỔI BẬT TRÊN TRANG CHỦ: Chọn tối đa 4 vật phẩm nổi bật. Chúng hiện ở khối Vũ khí và đồ dùng trên trang chủ. Đang chọn 3 / 4. Chip TẤT CẢ, SÚNG TRƯỜNG, SÚNG NGẮN, CẬN CHIẾN. Ô TÌM VẬT PHẨM, gợi ý: Gõ tên vật phẩm. Cột ẢNH, VẬT PHẨM, NỔI BẬT, HIỂN THỊ. Nhãn Toggle: Nổi bật, Thường, Hiện, Ẩn. Nút SỬA |
| Banner | BANNER. THÊM BANNER. BANNER LÀ GÌ?: Dải thông báo hiện trên đầu mọi trang. Mỗi lần chỉ hiện một banner đang bật. XEM TRƯỚC. Cột NỘI DUNG, TRẠNG THÁI, BẬT / TẮT. Trạng thái ĐANG HIỆN, LÊN LỊCH, HẾT HẠN. Nhãn Toggle: Đang hiện, Tắt. Khung SỬA BANNER: NỘI DUNG (gợi ý Tối đa 120 ký tự), LIÊN KẾT (KHÔNG BẮT BUỘC) (gợi ý Trang sẽ mở khi bấm vào banner), HIỆN TỪ (gợi ý Ngày bắt đầu), ĐẾN (gợi ý Ngày kết thúc). Nút LƯU BANNER, HỦY. Banner mẫu: Bảo trì máy chủ lúc 04:00 sáng thứ Sáu. Cuối tuần nhân đôi kinh nghiệm. Chào mừng người chơi mới. Dải xem trước: Bảo trì máy chủ lúc 04:00 sáng thứ Sáu. Xem chi tiết. |
| Người dùng | NGƯỜI DÙNG. Chip TẤT CẢ, NGƯỜI CHƠI, QUẢN TRỊ, BỊ KHÓA. Ô TÌM NGƯỜI DÙNG, gợi ý: Tên hiển thị hoặc email. Cột TÊN HIỂN THỊ, EMAIL, VAI TRÒ, TRẠNG THÁI, NGÀY TẠO. Trạng thái HOẠT ĐỘNG, BỊ KHÓA. Nút KHÓA, MỞ KHÓA. ĐT: "Tạo 02/10/2026" |
| Nhật ký | NHẬT KÝ. Chip TẤT CẢ, BÀI VIẾT, VẬT PHẨM, BANNER, NGƯỜI DÙNG. Cột THỜI GIAN, NGƯỜI LÀM, HÀNH ĐỘNG, ĐỐI TƯỢNG. Hành động mẫu: ĐĂNG BÀI, BẬT NỔI BẬT, SỬA BANNER, KHÓA NGƯỜI DÙNG, ẨN BÀI, THÊM VẬT PHẨM, ĐĂNG NHẬP |
| Soạn bài ĐT | Thanh dính: LƯU NHÁP, ĐĂNG BÀI |

### 10.12 Đầu trang khi đã đăng nhập

| Vị trí | Chữ |
| --- | --- |
| Chip | Tên hiển thị (mẫu NguoiSongSot, cùng người dùng với trang Hồ sơ và dòng "của tôi" ở Xếp hạng). Nút kèm chip: TẢI GAME |
| Menu tài khoản | Tên. Email đã che (mẫu n***@email.com). HẠNG 128. HỒ SƠ. ĐỔI MẬT KHẨU. QUẢN TRỊ (chỉ quản trị viên). ĐĂNG XUẤT |
| Chú thích thiết kế | 1. TRANG CHỦ, ĐÃ ĐĂNG NHẬP. 2. MENU TÀI KHOẢN ĐANG MỞ. 3. THÀNH PHẦN. CÁCH DÙNG. QUYỀN QUẢN TRỊ. ĐIỆN THOẠI. Các chú thích này không đưa lên trang thật |

### 10.13 Quy tắc chữ cho trang thiết kế sau này

Khi thiết kế thêm trang, đối chiếu mục 1 (nguyên tắc) và mục 9 (giả định) của tệp này. Trang 403 dùng chữ ở mục 10.5, trạng thái số 6.
