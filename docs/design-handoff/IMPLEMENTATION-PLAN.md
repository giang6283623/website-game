# Kế hoạch triển khai

Tệp này là kế hoạch để một phiên làm việc sau này bắt đầu code ngay, không phải hỏi lại những điều đã có trong thiết kế. Phiên hiện tại chỉ làm thiết kế và tài liệu. Chưa có dòng code nào của website.

Chủ dự án đã chọn công nghệ giao diện ngày 29/10/2026: Bun, React, TypeScript, Zod, Axios và build tĩnh (D-11). Phần máy chủ API (D-12) và các chi tiết kỹ thuật tạm do trợ lý chọn (D-13) còn chờ chủ dự án xem lại ở mục 11. Mọi thứ khác trong tệp là **đề xuất**.

## 1. Cách dùng tài liệu bàn giao

| Cần làm gì | Mở tệp nào |
| --- | --- |
| Biết màu, chữ, khoảng cách | `design-values.json` và `DESIGN-SPEC.md` |
| Dựng một thành phần | `COMPONENTS.md` (mã Figma, kích thước, từng trạng thái) |
| Dựng một trang | `PAGES.md` và ảnh trong `SCREENS.md` |
| Điền chữ | `CONTENT-COPY.md` |
| Điền dữ liệu thử | `sample-data.json` |
| Dùng hình | `ASSET-MAP.md` |
| Làm đường dẫn, dữ liệu, API | `ROUTES-AND-DATA.md` |
| Biết chỗ nào chưa có thiết kế | `DESIGN-SPEC.md`, mục 12 (G-01 đến G-26) |
| Biết quyết định nào chưa chốt | `ROUTES-AND-DATA.md`, mục 12 (D-01 đến D-13) |

Thứ tự tin cậy khi hai nguồn khác nhau: Figma, rồi `design-values.json`, rồi `DESIGN-SPEC.md`, rồi PRD. Thấy mâu thuẫn thì ghi lại và hỏi chủ dự án, đừng tự đoán.

Bản gốc của bộ tài liệu nằm ở `.private/docs/design-handoff/`. Một bản sao được git theo dõi nằm ở `docs/design-handoff/` (không có ảnh chụp màn hình, vì ảnh làm từ hình game chưa rõ quyền, G-15). Khi hai bản khác nhau, bản trong `.private/docs/design-handoff/` là bản đúng.

## 2. Công nghệ giao diện (D-11 đã chọn, D-13 là mặc định tạm)

Chủ dự án chọn: **Bun, ReactJS, TypeScript, Zod (kiểm tra dữ liệu), Axios, build tĩnh**. Bảng dưới là cách dùng đề xuất. Các dòng "đã chọn" không đổi. Các dòng còn lại là mặc định tạm của trợ lý (D-13), có phương án thay khi sai.

| Chủ đề | Cách làm | Trạng thái | Nếu sai thì thay bằng |
| --- | --- | --- | --- |
| Công cụ gói, chạy lệnh, kiểm thử | Bun (`bun install`, `bun run`, `bun test`) | Đã chọn | Không |
| Khung giao diện và ngôn ngữ | React 19 và TypeScript chế độ `strict` | Đã chọn | Không |
| Gọi API | Axios, một khách dùng chung có bộ chặn (interceptor) cho CSRF, 401, 403, 429 | Đã chọn | Không |
| Kiểm tra dữ liệu | Zod cho biểu mẫu và cho phản hồi API | Đã chọn | Không |
| Kiểu build | Build tĩnh: thư mục ra chứa HTML, CSS, JS, hình, phông | Đã chọn | Không |
| Bộ dựng | Bộ dựng gốc của Bun với tệp HTML làm điểm vào | D-13 | Vite chạy bằng Bun, nếu bước thử E0-S1 không đạt |
| Định tuyến | React Router ở chế độ thư viện | D-13 | TanStack Router |
| Dựng sẵn HTML cho SEO | Tập lệnh chạy sau build, dùng `react-dom/server` dựng HTML cho từng đường dẫn công khai (tiêu đề, mô tả, địa chỉ chuẩn, Open Graph). Trang riêng tư gắn `noindex` | D-13 | Chỉ dựng sẵn phần `head`, nội dung do trình duyệt vẽ (SEO kém hơn) |
| Lấy dữ liệu và bộ nhớ đệm | Một hook nhỏ `useResource` bọc Axios và Zod, trả đủ ba trạng thái đang tải, rỗng, lỗi (khớp ListState) | D-13 | TanStack Query khi cần |
| Biểu mẫu | Tự viết nhẹ và dùng lược đồ Zod | D-13 | React Hook Form |
| Kiểu dáng | CSS thường và CSS Modules, biến CSS sinh từ `design-values.json` | D-13 | Không cần thư viện CSS |
| API giả khi chưa có máy chủ | Bộ chuyển đổi (adapter) của Axios đọc `sample-data.json`, có độ trễ và lỗi giả để thử ListState | D-13 | MSW |
| Kiểm thử | `bun test` cho đơn vị và thành phần (môi trường DOM giả), Playwright cho e2e và so hình | D-13 | Vitest |

Dù chọn gì, phải giữ:

- Trang công khai đọc được khi **không có JavaScript**: tiêu đề, đoạn chữ chính và liên kết nằm trong HTML dựng sẵn. Với danh sách lấy dữ liệu lúc chạy (Tin tức, Kho đồ, Xếp hạng), mục tiêu này chỉ đạt đủ khi API cho phép dựng sẵn dữ liệu trang đầu (D-12). Trước đó, trang hiện khung đang tải và một dòng `noscript` (chữ do chủ dự án duyệt khi code).
- Hợp đồng dữ liệu ở `ROUTES-AND-DATA.md`.
- Token từ `design-values.json` được chuyển thành biến CSS bằng một bước tự động, không chép tay.
- Mã quản trị tải lười (lazy) để không nằm trong gói JavaScript của trang công khai (ngân sách 150 KB ở mục 7).
- Không đặt bí mật nào trong mã giao diện. Mọi tệp tĩnh đều công khai.

## 3. Cấu trúc thư mục đề xuất

Quy ước của dự án: hỏi chủ dự án trước khi thêm thư mục mới ở cấp gốc. Cấu trúc dưới đây là đề xuất để duyệt. Thư mục ra của build đề xuất tên `out/`, vì `dist/` và `build/` nằm trong danh sách đường dẫn được bảo vệ của cấu hình dự án.

```text
package.json, bunfig.toml, tsconfig.json   gốc dự án (Bun)
src/
  main.tsx              điểm vào trình duyệt
  routes.tsx            bản đồ đường dẫn (theo ROUTES-AND-DATA mục 2)
  pages/                mỗi trang một thư mục (home, news, items, ranking, download, rules, auth, profile, admin, errors)
  components/           thành phần giao diện (22 bộ trong COMPONENTS.md)
  api/                  khách Axios, lược đồ Zod của hợp đồng, API giả đọc sample-data.json
  lib/                  định dạng ngày, số, hạng, tạo slug, hàm dùng chung
  content/              nội dung tĩnh (quy tắc cộng đồng, hỏi đáp tải game, ba bước cài đặt, bộ đồ khởi đầu)
  styles/               theme.css (sinh ra), global.css
scripts/
  gen-theme.ts          sinh theme.css từ design-values.json
  prerender.tsx         dựng sẵn HTML cho trang công khai
  build-images.ts       chuyển hình sang WebP theo ASSET-MAP.md
public/assets/          hình WebP, phông chữ
tests/                  kiểm thử đơn vị, thành phần, e2e
docs/design-handoff/    bản sao tài liệu bàn giao được git theo dõi
out/                    kết quả build (không đưa vào git)
```

Tên thành phần trong mã giữ đúng tên Figma (`Button`, `NavDial`, `ItemSlot`...) để dễ đối chiếu.

Hai việc cần chủ dự án duyệt trước (đường dẫn được bảo vệ trong cấu hình dự án):

- Tệp khóa của Bun (`bun.lock`) có chữ `lock` nên bị bảo vệ. Cần duyệt cho phép `bun install` tạo và cập nhật tệp này.
- Tệp mẫu biến môi trường đặt tên `env.example` (không có dấu chấm đầu), vì `.env*` bị bảo vệ.

## 4. Thiết lập ban đầu (E0)

| Mã | Việc | Cỡ | Tiêu chí chấp nhận |
| --- | --- | --- | --- |
| E0-S1 | Khởi tạo dự án Bun, React, TypeScript `strict`, lint và format, chạy thử, CI. Làm bước thử (spike) bộ dựng của Bun: tệp HTML làm điểm vào, CSS, phông, ảnh WebP | M | Lệnh `bun run validate` (kiểm kiểu, lint, `bun test`, build) chạy sạch trên máy sạch và trong CI. `out/index.html` mở được từ một máy chủ tĩnh. Nếu bộ dựng gốc của Bun không đáp ứng thì chuyển sang Vite chạy bằng Bun và ghi lý do vào mục 2. Ghi lệnh vào cấu hình dự án (`commands.validate`) sau khi chủ dự án duyệt |
| E0-S2 | Chuyển `design-values.json` thành `theme.css` (tập lệnh `gen-theme.ts`) | S | Tệp CSS tự sinh. Không có mã màu viết tay ngoài token. Có kiểm thử so khớp số liệu. Đặt tên `theme.css` (không dùng chữ "token") để không trùng danh sách đường dẫn được bảo vệ |
| E0-S3 | Phông chữ tự lưu | M | Bốn họ (Big Shoulders Stencil Display Black, Barlow Condensed Bold và SemiBold, Barlow Regular và SemiBold, Barlow Semi Condensed Medium và SemiBold). Bộ ký tự latin, latin-ext, vietnamese. `font-display: swap`. Tổng không quá 120 KB. Chữ "Ặ Ợ Ữ Ỵ" hiện đúng ở cỡ Display/XL |
| E0-S4 | Hình: chuyển 60 hình sang WebP, đặt tên theo `ASSET-MAP.md` | M | Mỗi hình có bản 1x và 2x khi cần. Thuộc tính `width`, `height` đủ để không nhảy bố cục. Hình ngoài màn hình tải lười (lazy) |
| E0-S5 | Thành phần nền: Button, Tag, Field (có nút HIỆN và ẨN), Chip, Checkbox, Toggle | M | Đủ trạng thái (Default, Hover, Focus, Disabled, Pressed, Selected, Error). Vòng focus 3 px `border/focus`. Bàn phím điều khiển được. Kiểm tra tương phản theo `DESIGN-SPEC.md` mục 9. Viền ô nhập và chip dùng `border/control` |
| E0-S6 | Khung trang: StatusStrip, Header (cả HeaderUser, UserChip, AccountMenu), NavDial, HeaderMobile (cả HeaderMobileUser), TabBar, Footer, Wordmark | L | Đổi bố cục đúng ở các mốc (`DESIGN-SPEC.md` mục 5.2). Có liên kết "Bỏ qua tới nội dung". TabBar không che nội dung cuối trang (đệm vùng an toàn). Biến thể `Active=None` dùng cho trang không thuộc mục nào |
| E0-S7 | Khách Axios, lược đồ Zod của hợp đồng và API giả | M | Một khách Axios dùng chung (`baseURL` `/api/v1`, `withCredentials`, gắn `X-CSRF-Token`). Lỗi API được chuẩn hóa theo `ROUTES-AND-DATA.md` mục 8.4. API giả đọc `sample-data.json`, có chế độ chậm, rỗng và lỗi. Giờ hiện tại của API giả là `meta.mockNow`, không phải giờ máy. Danh sách `meta.knownQuirks` ghi các chỗ dữ liệu mẫu lệch bản vẽ, đọc trước khi so ảnh. Phản hồi sai lược đồ Zod hiện trạng thái Lỗi. Có kiểm thử cho ba trạng thái |
| E0-S8 | Dựng sẵn HTML: thử trên Trang chủ | M | `out/index.html` có một `<h1>`, `title`, `meta description`, địa chỉ chuẩn và thẻ Open Graph. Khi tắt JavaScript vẫn đọc được tiêu đề và các liên kết. Trang riêng tư có `noindex`. Có 404.html |

## 5. Các hạng mục công việc theo nhóm

Mỗi hạng mục ghi "Phụ thuộc" (quyết định cần có, mã D-xx ở mục 11) và tiêu chí chấp nhận viết theo kiểu "Khi... thì...". Tất cả hạng mục E1 đến E4 làm với API giả trước. Nối với API thật là việc của E6.

### E1. Trang công khai

| Mã | Việc | Phụ thuộc | Cỡ | Tiêu chí chấp nhận |
| --- | --- | --- | --- | --- |
| E1-S1 | Trang chủ | E0, API giả | L | Khi mở `/` trên 390 và 1440 thì khớp ảnh trong `SCREENS.md` (sai lệch nhỏ hơn 2 px ở bố cục chính). Khi không có số người chơi thì cụm số liệu bị ẩn, không hiện "0" sai. Nút "TẢI GAME" tới `/tai-game` |
| E1-S2 | Tin tức: danh sách, lọc, phân trang, bài nổi bật | E0, API giả | L | Khi chọn chip "SỰ KIỆN" thì địa chỉ thành `?loai=su-kien` và chỉ còn bài SỰ KIỆN. Khi không có bài thì hiện ListState rỗng đúng chữ. Bài nổi bật chỉ hiện ở trang 1 khi không lọc |
| E1-S3 | Kho đồ: lọc nhóm, tìm, sắp xếp, phân trang, khối chi tiết | E0, API giả | L | Khi gõ "ak" thì chỉ còn vật phẩm có "ak" trong tên (không phân biệt hoa thường). Khi chọn thẻ thì khối chi tiết đổi và địa chỉ có `?chon=`. Khi không khớp thì hiện ListState "KHÔNG TÌM THẤY VẬT PHẨM" với nút "XÓA BỘ LỌC" |
| E1-S4 | Chi tiết bài viết (`109:1198`, `109:1679`) | E0, API giả | M | Khi mở `/tin-tuc/<slug>` thì có tiêu đề, ngày, loại, nội dung đã làm sạch, bài khác, thẻ chia sẻ. Bài nháp hoặc không có thì 404. Chữ ở `CONTENT-COPY.md` mục 10.2 |
| E1-S5 | Chi tiết vật phẩm (`110:1278`, `110:1814`) | E0, API giả | M | Khi mở `/kho-do/<slug>` thì hiện hình, chỉ số theo nhóm, mô tả. Dùng cho điện thoại và liên kết chia sẻ. Vật phẩm bị ẩn (`visible` sai) thì 404 |
| E1-S6 | Tải game và Hướng dẫn (`107:1097`, `108:310`) | D-04, D-05 (A-21) | M | Khi người dùng điện thoại mở trang thì thấy cảnh báo "GAME CHỈ CHẠY TRÊN WINDOWS", nút "TẢI BỘ CÀI" khóa và nút "SAO CHÉP LIÊN KẾT". Khi người dùng máy tính bấm tải thì tệp tải về đúng và có dung lượng, phiên bản hiển thị. Khi `available` sai thì ẩn khối tải. Mốc `#huong-dan` cuộn tới ba bước cài |
| E1-S7 | Quy tắc cộng đồng (`116:1623`, `116:2550`) | Nội dung từ chủ dự án (A-25) | S | Khi mở `/quy-tac` thì hiện nội dung. Mục lục MT nhảy tới đúng mục. Liên kết ở form đăng ký và tạo nhân vật hoạt động |
| E1-S8 | Trang 404, 403 và 500, ListState | E0 | S | Khi vào địa chỉ không có thì hiện 404 đúng chữ và nút "VỀ TRANG CHỦ". Khi người chơi vào quản trị thì hiện 403. Khi máy chủ lỗi thì hiện 500 và không lộ chi tiết kỹ thuật |
| E1-S9 | Dải Banner trên trang công khai | G-26, A-24 | S | Đã làm ở phiên 3 theo bản vẽ `155:385`. Khi có banner đang hiện thì hiện trên cùng mọi trang, đóng được trong phiên. Còn cần chủ dự án xác nhận ý nghĩa Banner (A-24) |

### E2. Tài khoản (giao diện làm với API giả, thật cần D-01)

| Mã | Việc | Phụ thuộc | Cỡ | Tiêu chí chấp nhận |
| --- | --- | --- | --- | --- |
| E2-S1 | Đăng ký | D-01, D-07 | L | Khi gửi form hợp lệ thì tạo tài khoản và đăng nhập, chuyển tới `/ho-so`. Khi tên có dấu thì hiện đúng câu lỗi ở ô tên và giữ lại dữ liệu đã gõ. Khi email trùng thì hiện câu "Email này đã có tài khoản..." (đánh đổi: lộ email đã đăng ký, giảm rủi ro bằng giới hạn tốc độ). Khi gửi hai lần liên tiếp thì chỉ tạo một tài khoản |
| E2-S2 | Đăng nhập, phiên, đăng xuất | D-01 | L | Khi sai email hoặc mật khẩu thì chỉ một thông báo chung. Khi thử quá 5 lần trong 15 phút thì trả 429 và hiện trạng thái "TẠM KHÓA ĐĂNG NHẬP". Khi `?tiep=//evil.com` thì bỏ qua và về `/ho-so`. Chip người dùng ở đầu trang hiện đúng tên (HeaderUser) |
| E2-S3 | Quên và đặt lại mật khẩu (`113:1398`, `113:1480`, bảng `114:1436`) | D-01, D-06 | M | Khi nhập bất kỳ email nào thì luôn hiện cùng một câu. Mã dùng một lần và hết hạn sau 30 phút. Mã hỏng hiện "LIÊN KẾT KHÔNG DÙNG ĐƯỢC". Nút gửi lại chỉ bấm được sau 60 giây. Đổi xong thì hủy mọi phiên khác |
| E2-S4 | Hồ sơ | D-01, D-02 | L | Khi chưa đăng nhập vào `/ho-so` thì chuyển tới `/dang-nhap?tiep=/ho-so`. Khi đã đăng nhập thì thấy đúng dữ liệu của mình, email đã che. Khi tài khoản chưa có nhân vật thì hiện trạng thái rỗng "CHƯA CÓ NHÂN VẬT" với nút "TẢI GAME" (không còn nút "TẠO NHÂN VẬT", A-23) |
| E2-S5 | Đổi mật khẩu (`115:1455`) | D-01 | S | Khi mật khẩu hiện tại sai thì báo lỗi. Khi đổi đúng thì thông báo thành công và các máy khác bị đăng xuất |
| E2-S6 | Tạo nhân vật (`115:1603`). ĐÃ BỎ (chủ dự án chốt 29/10/2026, A-23) | D-01, D-02 (A-23) | M | Không làm. Ghi lại để tham khảo: Chỉ làm khi game cho phép tạo nhân vật từ website. Nếu không, bỏ trang này và nút "TẠO NHÂN VẬT" ở Hồ sơ. Khi chưa tích "Tôi đã đọc quy tắc cộng đồng" thì nút tạo bị chặn. Tên 3 đến 16 ký tự không dấu |

### E3. Xếp hạng (giao diện làm với API giả, thật cần D-02)

| Mã | Việc | Phụ thuộc | Cỡ | Tiêu chí chấp nhận |
| --- | --- | --- | --- | --- |
| E3-S1 | Bảng xếp hạng và tab (GAMEDOLLAR, XP, GIA TỘC) | D-03 | L | Khi đổi tab thì địa chỉ thành `?bang=xp` và bảng đổi theo. Bảng GIA TỘC có cột huy hiệu và số thành viên (`116:2736`, `117:2636`). Mỗi trang 50 dòng. Số hiển thị có dấu chấm ngăn nghìn |
| E3-S2 | Tìm tên và "VỊ TRÍ CỦA TÔI" | E3-S1 | M | Khi gõ dưới 2 ký tự thì báo "Gõ ít nhất 2 ký tự.". Khi đã đăng nhập và có hạng thì dòng của mình được đánh dấu và nút "VỊ TRÍ CỦA TÔI" cuộn tới đó. Khi không thấy tên thì hiện ListState "KHÔNG CÓ NGƯỜI CHƠI NÀY" |

### E4. Quản trị (giao diện làm với API giả)

| Mã | Việc | Phụ thuộc | Cỡ | Tiêu chí chấp nhận |
| --- | --- | --- | --- | --- |
| E4-S1 | Vai trò và cổng chặn đường dẫn quản trị | E2 | M | Khi người chơi thường mở `/quan-tri/...` thì thấy trang 403. Khi khách mở thì chuyển tới đăng nhập. Mọi API quản trị kiểm tra quyền ở máy chủ |
| E4-S2 | Soạn và xuất bản bài (`38:954`, `71:279`) | E4-S1 | L | Khi bấm "LƯU NHÁP" thì bài ở trạng thái BẢN NHÁP và không hiện công khai. Khi bấm "XUẤT BẢN" thì hiện ở `/tin-tuc` và trang chủ. Tiêu đề trên 80 ký tự bị chặn. HTML nguy hiểm (`<script>`, `onerror=`) bị làm sạch. Trên ĐT có thanh dính LƯU NHÁP và ĐĂNG BÀI. Chọn thư viện soạn văn bản ở bước này |
| E4-S3 | Tải ảnh đại diện | E4-S1 | M | Chỉ nhận JPG, PNG, WebP tới 5 MB. Tệp giả đuôi bị từ chối. Ảnh được mã hóa lại, đổi tên ngẫu nhiên |
| E4-S4 | Danh sách bài (sửa, ẩn, tìm) (`118:2045`, `119:2856`) | E4-S1 | M | Ẩn bài cần xác nhận và ghi nhật ký. Chip lọc TẤT CẢ, ĐÃ ĐĂNG, BẢN NHÁP hoạt động. Ô tìm lọc theo tiêu đề |
| E4-S5 | Nhật ký hành động (`118:2607`, `119:3215`) | E4-S1 | S | Mọi hành động quản trị có một dòng ghi (ai, lúc nào, làm gì). Giao diện chỉ đọc, không sửa không xóa |
| E4-S6 | Quản trị vật phẩm (`118:2186`, `119:2937`) | E4-S1 (A-27) | M | Khi bật "NỔI BẬT" quá 4 vật phẩm thì bị chặn và báo. Khi tắt "HIỂN THỊ" thì vật phẩm biến khỏi Kho đồ công khai. Form thêm hoặc sửa đã làm ở phiên 3 theo bản vẽ `156:2378`, `156:2723`, `160:915`, `160:1145` (G-23) |
| E4-S7 | Quản trị Banner (`118:2356`, `119:3056`) | E4-S1 (A-24) | M | Khi bật banner mới thì banner đang bật tự tắt. Khối XEM TRƯỚC đổi theo nội dung đang gõ. Ngày kết thúc không sớm hơn ngày bắt đầu |
| E4-S8 | Quản trị người dùng (`118:2462`, `119:3131`) | E4-S1 (A-27) | M | Khóa và mở khóa có hộp xác nhận và ghi nhật ký. Không tự khóa chính mình. Email hiển thị đã che. Trang chi tiết người dùng `/quan-tri/nguoi-dung/:id` (G-23) đã vẽ ở phiên 4 (`171:2870`, `172:1027`) và đã code: thông tin tài khoản, xếp hạng và bang, nhân vật (tối đa 5), nhật ký thao tác, nút khóa hoặc mở khóa |

### E5. Hoàn thiện

| Mã | Việc | Cỡ | Tiêu chí chấp nhận |
| --- | --- | --- | --- |
| E5-S1 | SEO: tiêu đề, mô tả, sitemap, robots, Open Graph, dữ liệu có cấu trúc | M | Theo `ROUTES-AND-DATA.md` mục 5. Kiểm tra bằng công cụ chia sẻ và công cụ kiểm tra dữ liệu có cấu trúc. Dựng sẵn lại trang chi tiết khi có nội dung mới |
| E5-S2 | Hiệu năng | M | Đạt ngân sách ở mục 7 trên điện thoại giả lập mạng chậm. Đo riêng LCP của trang danh sách (dữ liệu lấy lúc chạy có thể làm LCP vượt 2,5 giây) |
| E5-S3 | Truy cập (a11y) | M | Kiểm tra tự động không có lỗi nghiêm trọng. Kiểm tra tay bằng bàn phím và trình đọc màn hình cho 5 luồng chính |
| E5-S4 | Chuyển hướng từ site cũ | S | Chỉ làm khi thay site cũ (D-08). Bảng ở `ROUTES-AND-DATA.md` mục 6. Với máy chủ web tĩnh, làm bằng quy tắc chuyển hướng của máy chủ web |
| E5-S5 | Theo dõi lỗi và số liệu truy cập | S | Có ghi nhận lỗi và số liệu ẩn danh. Không gửi mật khẩu hay email vào công cụ ngoài |
| E5-S6 | Triển khai, sao lưu, khôi phục | M | Có hướng dẫn chạy từ máy sạch. Máy chủ web tĩnh trả đúng 404. Có sao lưu cơ sở dữ liệu hằng ngày và đã thử khôi phục một lần (phần API) |

### E6. Dịch vụ API (cần D-12, D-01, D-02)

Nhóm này không thuộc giao diện tĩnh. Nó thực hiện hợp đồng ở `ROUTES-AND-DATA.md` mục 8. Chỉ bắt đầu khi D-12 được chọn.

| Mã | Việc | Phụ thuộc | Cỡ | Tiêu chí chấp nhận |
| --- | --- | --- | --- | --- |
| E6-S1 | Khung API, cấu hình, mã lỗi chuẩn, `Cache-Control`, CORS và CSRF | D-12 | L | Mọi đường ở mục 8.4 trả đúng dạng lỗi. Cookie phiên hoạt động với giao diện tĩnh (cùng site). Có kiểm thử hợp đồng so với lược đồ Zod của giao diện |
| E6-S2 | Tài khoản, phiên, quên và đặt lại mật khẩu, giới hạn tốc độ | D-01, D-06, D-07 | L | Theo `ROUTES-AND-DATA.md` mục 8.2 và 11. Có kiểm thử cho khóa sau nhiều lần sai và mã dùng một lần |
| E6-S3 | Tin tức, tải ảnh, quản trị bài | D-12 | L | Theo mục 8.1 và 8.3. HTML làm sạch ở máy chủ. Kích hoạt dựng sẵn lại trang chi tiết khi có bài mới |
| E6-S4 | Vật phẩm, Banner, người dùng, nhật ký (quản trị) và `download`, `banner` công khai | D-04, D-12 | L | Theo mục 8.1 và 8.3. Mọi hành động quản trị ghi AuditLog |
| E6-S5 | Xếp hạng, nhân vật, tác vụ đồng bộ từ game | D-02, D-03 | L | Tác vụ chạy định kỳ, chỉ đọc từ game. Khi nguồn lỗi thì giữ bảng cũ và ghi nhật ký, không xóa dữ liệu |

## 6. Thứ tự làm đề xuất

| Mốc | Nội dung | Làm được ngay khi chưa có quyết định nào |
| --- | --- | --- |
| M1 | E0 (nền tảng, API giả, dựng sẵn thử) | Có |
| M2 | E1-S1, E1-S3, E1-S8 với dữ liệu mẫu từ `sample-data.json` | Có |
| M3 | Phần còn lại của E1 (tin, chi tiết, tải game, quy tắc) với API giả | Có. Cần duyệt chữ giả định A-21 đến A-26 trước khi chạy thật |
| M4 | E2, E3, E4 phần giao diện với API giả | Có. Giao diện dùng được để duyệt, chưa có dữ liệu thật |
| M5 | E6 (API) và nối giao diện với API thật | Cần D-12, D-01, D-02 (chặn) |
| M6 | E5 (hoàn thiện, triển khai) | Cần D-08 |

Lợi ích của thứ tự này: sau M3 giao diện của phần "tin tức, hướng dẫn, kho đồ, tải game" đã duyệt được với dữ liệu mẫu, đúng mục tiêu số một của PRD (người mới hiểu game và tải được mà không cần đăng nhập). Phần cần dữ liệu thật đi sau, khi D-12 đã chọn.

## 7. Kế hoạch kiểm thử và ngân sách chất lượng

| Loại | Công cụ gợi ý | Phạm vi |
| --- | --- | --- |
| Kiểm thử đơn vị | `bun test` | Hàm định dạng (ngày, số, hạng), lược đồ Zod, làm sạch HTML, tạo `slug`, hook `useResource` |
| Kiểm thử thành phần | `bun test` với môi trường DOM giả, hoặc trang thử | Mọi trạng thái của 22 thành phần, đối chiếu `COMPONENTS.md` |
| Kiểm thử đầu cuối (e2e) | Playwright | Năm luồng: người mới tải game, đăng ký, đăng nhập rồi xem hồ sơ, tìm tên trên xếp hạng, quản trị đăng bài |
| So hình với thiết kế | Ảnh chụp Playwright so với ảnh trong `SCREENS.md` | Các trang chính ở 390 và 1440. Một lần cho mỗi trang, không lặp vô hạn |
| Truy cập (a11y) | axe và kiểm tra tay | Tương phản, tên của nút, thứ tự phím Tab, vòng focus, `lang="vi"` |
| Hiệu năng | Lighthouse CI | Trang chủ và Tin tức trên điện thoại giả lập |
| Bảo mật | Kiểm tra tay theo `ROUTES-AND-DATA.md` mục 11 | CSRF, giới hạn tốc độ, `?tiep=`, tải tệp, làm sạch HTML, quyền quản trị, không có bí mật trong gói giao diện |

Ngân sách (lấy từ `DESIGN-SPEC.md` mục 10):

| Chỉ số | Mức cần đạt |
| --- | --- |
| LCP (điện thoại, mạng chậm) | 2,5 giây hoặc ít hơn |
| CLS | 0,05 hoặc ít hơn |
| INP | 200 ms hoặc ít hơn |
| JavaScript tải ban đầu (nén) | 150 KB hoặc ít hơn |
| Phông chữ | 120 KB hoặc ít hơn |
| Tổng trang chủ trên điện thoại | 700 KB hoặc ít hơn |

React, React Router, Axios và Zod chiếm phần lớn ngân sách JavaScript. Vì thế mã quản trị phải tải lười, và E0-S1 phải đo kích thước gói trước khi thêm thư viện khác.

Các cỡ màn hình thử: 360, 390, 768, 1024, 1200, 1440, 1920. Trình duyệt: bản mới của Chrome, Edge, Firefox, Safari (máy tính và iPhone), Chrome trên Android.

Quy tắc chạy kiểm thử trong dự án này: mọi lệnh chạy kiểm thử, build dài, so hình hay đo hiệu năng trong vòng lặp phải qua một lệnh bọc có giới hạn thời gian (`--timeout-ms`) và bộ nhớ (`--max-rss-mb`) để một tiến trình treo không làm đầy bộ nhớ máy. Đo một lần trước, rồi đặt giới hạn khoảng 3 lần thời gian đó. Kết quả `timeout`, `memory`, `crashed` không được tính là đạt hay hỏng.

## 8. Định nghĩa "xong" cho mỗi hạng mục

1. Khớp ảnh thiết kế ở 390 và 1440 (chênh lệch bố cục nhỏ hơn 2 px, đúng token, đúng chữ trong `CONTENT-COPY.md`).
2. Đủ trạng thái: mặc định, rê chuột, focus, nhấn, vô hiệu, lỗi, rỗng, đang tải.
3. Dùng được bằng bàn phím. Có `alt` và nhãn đúng. Tương phản đạt.
4. Có kiểm thử (`bun test`) cho phần logic và ít nhất một kiểm thử đầu cuối cho luồng chính.
5. Đạt ngân sách ở mục 7.
6. Lệnh `validate` trong cấu hình dự án chạy sạch.
7. Tài liệu liên quan được cập nhật (đặc biệt `DESIGN-SPEC.md` khi gỡ một khoảng trống G-xx).

## 9. Cấu hình môi trường (tên biến, không ghi giá trị)

Giao diện tĩnh không giữ bí mật. Biến nào được nhúng vào gói giao diện thì ai cũng đọc được. Tiền tố biến được nhúng do cấu hình của bộ dựng quy định (kiểm tra ở E0-S1).

| Biến | Dùng cho | Thuộc phần |
| --- | --- | --- |
| `SITE_URL` | Địa chỉ gốc, dùng lúc build cho địa chỉ chuẩn, sitemap và thẻ chia sẻ | Giao diện (lúc build) |
| `DATABASE_URL` | Cơ sở dữ liệu của website | API |
| `GAME_DATABASE_READONLY_URL` | Cơ sở dữ liệu game, chỉ đọc (nếu chọn cách A hoặc B) | API |
| `SESSION_SECRET` | Khóa ký phiên | API |
| `MAIL_FROM`, `MAIL_TRANSPORT_URL` | Gửi thư quên mật khẩu | API |
| `UPLOAD_DIR` hoặc `STORAGE_BUCKET` | Nơi lưu ảnh tải lên | API |
| `ADMIN_BOOTSTRAP_EMAIL` | Email của quản trị viên đầu tiên | API |

Không để giá trị thật trong mã nguồn hay trong tài liệu. Có tệp mẫu `env.example` không chứa bí mật để người mới biết cần biến nào.

## 10. Rủi ro

| Rủi ro | Khả năng | Ảnh hưởng | Cách giảm |
| --- | --- | --- | --- |
| Không lấy được dữ liệu từ máy chủ game (D-01, D-02) | Cao | Chặn đăng nhập, hồ sơ, xếp hạng thật | Làm giao diện với API giả trước (M1 đến M4). Hỏi sớm người giữ máy chủ game. Chuẩn bị phương án dữ liệu nhập tay |
| Chưa chọn máy chủ API (D-12) | Cao | Giao diện chạy được nhưng chưa có dữ liệu thật | Chốt D-12 ở phiên sau. Giữ hợp đồng ở `ROUTES-AND-DATA.md` mục 8 làm cầu nối |
| API khác tên miền với giao diện | Vừa | Cookie phiên và CSRF không chạy | Đặt API cùng site (cùng tên miền gốc, ví dụ đường dẫn `/api` qua máy chủ trung gian). Ghi vào D-12 |
| Bộ dựng gốc của Bun chưa đủ cho dựng sẵn HTML | Vừa | Mất thời gian ở E0 | Làm bước thử ở E0-S1. Phương án dự phòng là Vite chạy bằng Bun |
| SEO yếu ở danh sách lấy dữ liệu lúc chạy | Vừa | Công cụ tìm kiếm thấy khung trống | Dựng sẵn dữ liệu trang đầu khi có API. Dựng sẵn đủ chữ cho trang chi tiết |
| Gói JavaScript vượt 150 KB | Vừa | Chậm trên điện thoại | Tải lười mã quản trị, đo ở E0-S1 và E5-S2 |
| Tài khoản website tách khỏi game | Vừa | Người chơi phải có hai tài khoản | Quyết định D-01 sớm. Nếu tách, nói rõ trên giao diện |
| Quyền dùng hình game chưa rõ | Vừa | Có thể phải gỡ hình | Xác nhận trước khi mở công khai. Giữ `ASSET-MAP.md` để thay hình nhanh |
| Phông chữ hiển thị sai dấu tiếng Việt | Thấp | Chữ xấu hoặc rơi sang phông khác | Kiểm tra bộ ký tự ở E0-S3 |
| Chữ "MIỄN PHÍ", "24/7", "Windows" sai sự thật | Vừa | Mất tin cậy | Chủ dự án duyệt `CONTENT-COPY.md` mục 9 trước khi chạy thật |
| Điện thoại không tải được game | Cao | Mất người mới truy cập từ điện thoại | Trang `/tai-game` có cảnh báo, nút tải khóa và nút sao chép liên kết (E1-S6) |
| Dữ liệu mẫu lọt vào bản chạy thật | Thấp | Hiện tên và số giả | API giả chỉ nạp ở môi trường phát triển. Có kiểm tra khi build bản chạy thật |
| Tấn công đoán mật khẩu hoặc thư rác đăng ký | Vừa | Khóa tài khoản, tốn thư | Giới hạn tốc độ (E6-S2). Có thể thêm captcha sau |
| Đường dẫn được bảo vệ chặn `bun.lock` hoặc tệp mẫu `.env` | Thấp | Lệnh cài đặt bị chặn | Xin duyệt một lần ở phiên sau (mục 3) |
| Thiết kế đổi sau khi code | Vừa | Làm lại | Đổi trong Figma trước, cập nhật tài liệu, rồi mới code |

## 11. Việc cần làm trước khi code (checklist)

Chủ dự án quyết hoặc cung cấp. Các việc này được dời xuống cuối phiên làm việc kế tiếp, vì chúng không chặn phần giao diện với API giả:

1. D-12: máy chủ API, nơi đặt, cách đặt cùng site với giao diện.
2. D-13: xem lại các mặc định kỹ thuật tạm (mục 2).
3. D-01: tài khoản sống ở đâu và cách băm mật khẩu.
4. D-02 và D-03: nguồn dữ liệu xếp hạng, nhân vật, vật phẩm và các bảng xếp hạng cần hiện.
5. D-04 và D-05: bộ cài game và cách xử lý người dùng điện thoại.
6. D-06 và D-07: dịch vụ gửi thư, quy tắc mật khẩu và tên hiển thị.
7. D-08: tên miền và nơi đặt website.
8. D-09: xác nhận quyền dùng hình game.
9. D-10: kênh "THÔNG BÁO TRONG GAME".
10. `CONTENT-COPY.md`, mục 9: duyệt các giả định A-01 đến A-27.
11. Xác nhận ý nghĩa Banner (A-24). Dải Banner công khai (G-26) đã vẽ và code ở phiên 3.
12. Duyệt cấu trúc thư mục, tên thư mục ra `out/`, việc tạo `bun.lock` và tệp `env.example` (mục 3).
13. Duyệt lệnh `commands.validate` mới trong cấu hình dự án (E0-S1).
14. Quyết định có commit thư mục `docs/design-handoff/` hay không.

Việc của người code ở phiên đầu:

1. Đọc cấu hình dự án và PRD.
2. Chạy lệnh kiểm tra tài liệu của dự án.
3. Bắt đầu từ E0-S1.

## 12. Quy trình làm việc

- Chia việc nhỏ. Mỗi hạng mục ở mục 5 là một thay đổi riêng có thể xem xét.
- Sau mỗi thay đổi lớn, chạy lệnh `validate` trong cấu hình dự án.
- Không tự đẩy mã lên kho từ xa. Trước mỗi lần đẩy phải hỏi chủ dự án (xem quy tắc làm việc).
- Đổi cấu hình dự án, quy tắc hoặc kỹ năng làm việc phải hỏi chủ dự án trước.
- Cấu hình dự án bảo vệ các đường dẫn có chữ `token`, `secret`, `lock` và `migrations`, cùng `.env*`, `dist`, `build`, `coverage` và `node_modules` (mục `policy.protected_paths`). Khi đặt tên tệp mới, tránh các chữ này hoặc xin duyệt trước. Riêng tệp lock của trình quản lý gói và thư mục migrations là tệp thật cần bảo vệ, không đổi tên để né.
- Không đưa tên người chơi thật, email thật hay bí mật vào mã, tài liệu hay nhật ký.
- Thư mục client game `InfestationVN` chỉ đọc. Không sửa.
- Kiểm tra giao diện bằng ảnh trong `SCREENS.md`. Không chạy vòng lặp tinh chỉnh thiết kế mặc định. Cần duyệt trước (quy tắc "cổng kiểm tra hình ảnh").
