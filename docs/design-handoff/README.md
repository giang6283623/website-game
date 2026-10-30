# Bộ tài liệu bàn giao thiết kế ISSVN

Đây là bộ tài liệu để lập trình viên (hoặc một phiên làm việc sau) dựng website game ISSVN từ bản thiết kế "Tần số sinh tồn" mà không cần hỏi lại. Thiết kế Figma đã xong ngày 29/10/2026 (vòng 3). Mã giao diện đã được dựng theo thiết kế này và chạy bằng API giả. Chưa có máy chủ API thật.

Website là máy chủ Infestation bản tiếng Việt. Có trang chủ, tin tức, kho đồ, xếp hạng, tải game, quy tắc cộng đồng, đăng nhập, đăng ký, quên và đổi mật khẩu, hồ sơ người chơi, tạo nhân vật và khu quản trị (bài viết, vật phẩm, banner, người dùng, nhật ký). Mục tiêu chính (PRD): người mới hiểu game và tải được trong vài phút, không cần đăng nhập để xem tin và hướng dẫn.

Công nghệ giao diện đã chọn (29/10/2026): **Bun, React, TypeScript, Zod, Axios, build tĩnh**. Máy chủ API chưa chọn (D-12).

## 1. Danh mục tài liệu

| Tệp | Nội dung | Đọc khi |
| --- | --- | --- |
| `README.md` | Tệp này. Mục lục và thứ tự đọc | Bắt đầu |
| `DESIGN-SPEC.md` | Khái niệm thiết kế, màu, chữ, khoảng cách, bố cục, chuyển động, truy cập, hiệu năng. Mục 12 là bảng khoảng trống (G-01 đến G-26) | Trước khi viết CSS |
| `design-values.json` | Toàn bộ giá trị token (màu, chữ, khoảng cách, bo góc, đề xuất mốc đáp ứng). Dùng để sinh CSS | Khi dựng nền tảng |
| `COMPONENTS.md` | 22 thành phần dùng chung và các mẫu cục bộ: mã Figma, kích thước, từng trạng thái, cách viết HTML | Khi dựng thành phần |
| `PAGES.md` | Từng trang (24 trang, MT và ĐT): khối, kích thước, dữ liệu, hành vi, khác biệt máy tính và điện thoại | Khi dựng trang |
| `CONTENT-COPY.md` | Toàn bộ chữ trên giao diện, thông báo lỗi, trạng thái danh sách, giả định cần xác nhận (A-01 đến A-27) | Khi điền nội dung |
| `ROUTES-AND-DATA.md` | Đường dẫn, tham số, SEO, chuyển hướng từ site cũ, thực thể dữ liệu, hợp đồng API, bảo mật, các quyết định (D-01 đến D-13) | Khi làm máy chủ và dữ liệu |
| `sample-data.json` | Dữ liệu mẫu khớp Figma, tên trường theo hợp đồng API: bài viết, xếp hạng, vật phẩm, gia tộc, nhân vật, kỹ năng, banner, người dùng quản trị, nhật ký, thông tin tải game và nội dung tĩnh (ba bước cài, hỏi đáp, quy tắc cộng đồng, bộ đồ khởi đầu). Đọc `meta.knownQuirks` trước | Khi thử giao diện và dựng API giả |
| `ASSET-MAP.md` | 60 hình đã chọn: đường dẫn riêng tư, nhóm lọc, tên tệp web gợi ý, trang dùng | Khi xử lý hình |
| `SCREENS.md` | Ảnh chụp 53 khung (27 MT và 26 ĐT) kèm mã node | Khi đối chiếu bằng mắt |
| `IMPLEMENTATION-PLAN.md` | Công nghệ, cấu trúc thư mục, các hạng mục công việc (E0 đến E6), tiêu chí chấp nhận, kiểm thử, rủi ro, danh sách việc cần quyết | Khi lên kế hoạch và bắt đầu code |

Tài liệu liên quan nằm ngoài thư mục này:

- `docs/PRD.md`: mục tiêu sản phẩm, phạm vi, câu hỏi mở.
- `docs/CONTEXT.md`: bảng thuật ngữ của dự án.
- Tệp Figma: riêng tư, mã đã ẩn.

## 2. Thứ tự đọc đề xuất

1. `README.md` (tệp này) và PRD (5 phút).
2. `SCREENS.md`: xem ảnh để hiểu tổng thể.
3. `IMPLEMENTATION-PLAN.md`: biết công nghệ, thứ tự làm và cần quyết gì.
4. `DESIGN-SPEC.md` và `design-values.json`: nền tảng giao diện.
5. `COMPONENTS.md`, rồi `PAGES.md`: dựng từng phần.
6. `CONTENT-COPY.md` và `sample-data.json`: điền chữ và dữ liệu.
7. `ROUTES-AND-DATA.md`: làm đường dẫn, dữ liệu, API.
8. `ASSET-MAP.md`: xử lý hình.

## 3. Con số chính

| Hạng mục | Số lượng |
| --- | --- |
| Thành phần dùng chung trong Figma | 22 (16 bộ biến thể và 6 thành phần đơn) |
| Trang sản phẩm đã thiết kế | 24, mỗi trang có bản MT (1440) và ĐT (390) |
| Khung trong Figma | 27 khung MT và 26 khung ĐT (gồm 3 bảng tham chiếu) |
| Hình game đã chọn và tải lên Figma | 60 |
| Token màu | 17 nền tảng và 25 ngữ nghĩa |
| Kiểu chữ | 14 |
| Khoảng trống thiết kế đã biết (G-xx) | 26 (4 đã đóng, 11 đã thiết kế, 11 còn mở) |
| Quyết định (D-xx) | 13 (1 đã chọn, 1 mặc định tạm, 11 chưa chốt) |
| Giả định cần xác nhận (A-xx) | 27 |

Kết quả kiểm tra thiết kế: chữ nhỏ nhất 16 px, mọi cặp màu chữ và nền đang dùng đạt tương phản 4,5:1 trở lên, mọi chữ gắn biến màu. Viền ô nhập và chip đã đổi sang `border/control` (tỉ lệ 3,27 đến 3,70) nên đạt mức 3 cho thành phần giao diện. Kiểm tra lại ngày 29/10/2026 trên cả 53 khung (2.998 dòng chữ): không có chữ dưới 16 px, không có chữ chưa gắn biến màu, không có chữ tràn khung cha, không còn khung tạm. Ngoại lệ có chủ ý: trên ĐT các hàng chip cuộn ngang (Kho đồ, Tin tức, thanh điều hướng quản trị) chạy ra mép phải của khung (19 dòng chữ ở 8 khung, xem G-11).

## 4. Những gì chưa có (nói thẳng)

- **Chưa có máy chủ API thật.** Giao diện đã có mã và chạy bằng API giả. Nối API thật là hạng mục E6 trong `IMPLEMENTATION-PLAN.md`.
- Phiên 5 đã vẽ và code các trạng thái Hover, Focus, Disabled còn thiếu (G-10, G-24). Bảng tham chiếu cho NavDial, TabBar và AccountMenu là `184:363`. Phiên 3 đã vẽ dải Banner công khai (G-26), form vật phẩm (G-23) và biến thể "MÁY CHỦ NGOẠI TUYẾN" (G-25). Phiên 4 đã vẽ chi tiết người dùng trong quản trị (G-23, `171:2870` và `172:1027`). Trang ngoại tuyến không làm vì website không phải PWA.
- Chưa có nguyên mẫu tương tác trong Figma (rê chuột, thanh dưới cố định, chip cuộn ngang chỉ có ở dạng tĩnh).
- Khung nút, ô nhập của game gốc nằm trong tệp Flash (`.swf`) nên website dùng khung phẳng riêng, không sao chép giao diện trong game.
- Nhiều chữ là giả định hoặc dữ liệu giả: "miễn phí", "24/7", "dành cho Windows", kênh mạng xã hội (đã bỏ dòng pháp lý và Zalo), thông tin bộ cài (1.0.3, 1,2 GB), yêu cầu máy, quy tắc cộng đồng và mức xử lý, bộ đồ khởi đầu, giới hạn 5 nhân vật (đổi từ 3), thời hạn liên kết 30 phút, khóa 15 phút, ý nghĩa của Banner (A-01 đến A-27).
- Chưa quyết nguồn dữ liệu tài khoản, xếp hạng, nhân vật (D-01, D-02), máy chủ API (D-12) và các quyết định D-03 đến D-10. Công nghệ giao diện đã chọn (D-11). Chi tiết kỹ thuật tạm (D-13) chờ chủ dự án xem lại.
- Quyền dùng hình lấy từ client game chưa được xác nhận (A-20, G-15).

## 5. Quy tắc khi dùng bộ tài liệu

- Chữ trong tài liệu là tiếng Việt. Tên đường dẫn, tên token và tên trường dữ liệu là tiếng Anh hoặc tiếng Việt không dấu như đã ghi.
- Không đưa tên người chơi thật hay email thật vào bất kỳ đâu. Mọi tên trong tài liệu là tên tổng hợp.
- Thư mục client game `InfestationVN` chỉ đọc. Không sửa. Hình lấy từ đó nằm trong kho riêng `.private/local/game-website-assets/` và không đưa vào git.
- Thư mục `.private/` không nằm trong git (đã loại trừ trong `.git/info/exclude`). Bản gốc của bộ tài liệu này nằm ở `.private/docs/design-handoff/`. Một bản sao nằm ở `docs/design-handoff/` để git theo dõi (không có ảnh chụp). Khi hai bản khác nhau, bản gốc là bản đúng. Bản sao được làm lại bằng tập lệnh `.private/local/figma-design/work/sync-docs.mjs`.
- Khi thiết kế Figma đổi: sửa Figma trước, rồi cập nhật đúng tệp liên quan (màu, chữ: `design-values.json` và `DESIGN-SPEC.md`. Thành phần: `COMPONENTS.md`. Trang: `PAGES.md`. Chữ: `CONTENT-COPY.md`), rồi chụp lại ảnh trong `SCREENS.md`.

## 6. Hướng thiết kế

Tên: **Tần số sinh tồn**. Thanh điều hướng là núm dò tần số (NavDial). Thẻ nội dung giống thẻ trong kho đồ. Lưới chữ thập chỉ làm nền. Màu chính là đen than, tro và cam gỉ. Màu xanh moss chỉ dùng cho trạng thái trực tuyến.

Tránh nói: "giao diện radio", "theme radio", "điện đài".
