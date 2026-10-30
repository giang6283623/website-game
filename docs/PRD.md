# Website Game ISSVN - Product Requirements

> Trạng thái (29/10/2026): chủ dự án đã duyệt PRD này. Thiết kế Figma đã xong đủ 24 trang MT và ĐT (xem mục 9). Công nghệ giao diện đã chọn: Bun, React, TypeScript, Zod, Axios, build tĩnh.
> Bộ tài liệu bàn giao để code sau nằm ở `.private/docs/design-handoff/` (bắt đầu từ `README.md`), kèm một bản sao git theo dõi ở `docs/design-handoff/`. Chưa viết code.

## 1. Tóm tắt

Website cho máy chủ game sinh tồn Infestation tại Việt Nam (tên trong client: "InfestationMMO Viet Nam"). Dành cho người chơi và quản trị viên. Giao diện hoàn toàn bằng tiếng Việt.

Ba phần trong một website:

- A. Website chính thức: giới thiệu game, hướng dẫn tải và cài.
- B. Cổng người chơi: tài khoản, nhân vật, cửa hàng.
- C. Cộng đồng: tin tức, xếp hạng, danh mục vật phẩm.

Có thêm một trang riêng cho quản trị viên để đăng bài.

## 2. Problem & goal

- Problem it solves:
  - Site cũ (`infestation.vn`, tự chuyển sang `MOCKAPI`) bị chủ dự án đánh giá là quá tệ.
  - Tin tức, bài viết và trang tải game bắt đăng nhập mới xem được. Người mới không thể tìm hiểu hay tải game trước khi có tài khoản.
  - Không có API JSON. Dữ liệu chỉ đi qua trang dựng sẵn và biểu mẫu.
  - Chạy PHP 5.3.28 (rất cũ) sau Cloudflare. Liên kết mạng xã hội trên trang chủ vẫn là `#`.
- Primary goal / focus right now: có bản thiết kế Figma sáng tạo, đúng chất sinh tồn nguyên bản của Infestation, dùng hình game đã lấy (trừ ảnh nền ConnectScreen và các vật phẩm màu mè).
- Why now / motivation: chốt giao diện bằng thiết kế trước, tránh viết code rồi sửa lại.

## 3. Users & use cases

- Primary users:
  - Người chơi mới: chưa biết game, cần hiểu nhanh và tải được.
  - Người chơi cũ: xem tin, xem xếp hạng, tra vật phẩm, quản lý tài khoản.
  - Quản trị viên: đăng và sửa bài mà không cần sửa code.
- Top use cases:
  1. Người mới mở trang trên điện thoại, hiểu game là gì, tải bản cài trong vài phút.
  2. Người chơi tìm tên mình trên bảng xếp hạng và tra vật phẩm.
  3. Quản trị viên đăng một bài tin và một thay đổi vật phẩm.

## 4. Success criteria

- What good looks like:
  - Người mới hiểu game và tải được bản cài trong vài phút, không cần đăng nhập để xem tin và hướng dẫn.
  - Trang mở nhanh, chữ dễ đọc trên điện thoại.
  - Chủ dự án tự cập nhật tin tức và vật phẩm, không cần sửa code.
  - Số người ghé và số lượt đăng ký tăng (chưa có số đo cho site cũ, cần đo trước).
- How we will know we shipped the right thing: chủ dự án duyệt thiết kế Figma. Sau khi có code, thử với vài người chơi mới và đo thời gian từ lúc mở trang đến lúc tải xong.

## 5. Scope

- In scope (this iteration):
  - Thiết kế Figma: 24 trang, mỗi trang có bản máy tính (1440 px) và bản điện thoại (390 px). Tám trang đầu: Trang chủ, Tin tức, Kho đồ, Xếp hạng, Hồ sơ, Đăng nhập, Đăng ký, Admin đăng bài. Vòng 3 thêm: Tải game, chi tiết bài viết, chi tiết vật phẩm, quên và đặt lại mật khẩu, đổi mật khẩu, tạo nhân vật, quy tắc cộng đồng, 404, 500, xếp hạng gia tộc, năm trang danh sách quản trị (bài viết, vật phẩm, banner, người dùng, nhật ký) và bảng đầu trang khi đã đăng nhập. Đã xong.
  - Bộ thành phần dùng chung (22 thành phần) với đủ trạng thái, và bảng trạng thái rỗng, đang tải, lỗi của danh sách. Đã xong.
  - Bộ tài liệu bàn giao để code sau: đặc tả, token, thành phần, trang, chữ, đường dẫn và dữ liệu, kế hoạch triển khai. Đã xong, nằm ở `.private/docs/design-handoff/`.
- Out of scope / non-goals:
  - Viết code website trong vòng thiết kế này. Vòng sau bắt đầu code giao diện theo `design-handoff/IMPLEMENTATION-PLAN.md`.
  - Cửa hàng và nạp tiền (để sau, cần quyết định về thanh toán).
  - Kết nối với cơ sở dữ liệu máy chủ game.
  - Dùng nội dung, hình hay thiết kế của site cũ. Chỉ tham khảo đường dẫn và biểu mẫu.

## 6. Constraints & assumptions

- Technical / platform constraints:
  - Giao diện dùng Bun, React, TypeScript, Zod (kiểm tra dữ liệu), Axios và build tĩnh (chủ dự án chọn ngày 29/10/2026). Máy chủ API chưa chọn. Chi tiết trong `design-handoff/IMPLEMENTATION-PLAN.md`, mục 2.
  - Chỉ tiếng Việt trên giao diện.
  - Chạy tốt trên điện thoại, chữ không nhỏ hơn 16 px.
  - Thư mục client game `InfestationVN` chỉ đọc, không sửa.
  - Hình game nằm trong kho riêng `.private/local/game-website-assets/`, không đưa vào git.
- Deadlines, budget, compliance, or other constraints:
  - Quyền dùng hình game chưa xác nhận. Nhóm `store-icons-cobranded` và `store-icons-custom` bị đánh dấu có thể dính quyền của bên khác, không dùng.
  - Không đưa tên người chơi thật từ site cũ vào thiết kế hay tài liệu. Dùng tên giả.
- Assumptions to validate:
  - Chủ dự án có quyền dùng hình lấy từ client game cho website.
  - Cần một nguồn dữ liệu mới cho xếp hạng, tài khoản và vật phẩm, vì site cũ không có API.
  - Chữ "miễn phí", "24/7" và "dành cho Windows" trong thiết kế là giả định, cần xác nhận.
  - Tên người chơi, số liệu, tin bài và chỉ số vật phẩm trong thiết kế là dữ liệu mẫu, chưa phải dữ liệu thật.
  - Danh sách đầy đủ 27 giả định (A-01 đến A-27) nằm ở `design-handoff/CONTENT-COPY.md`, mục 9. Chủ dự án cần duyệt trước khi chạy thật.

### Tham chiếu site cũ (chỉ đọc, không dùng lại)

Tên miền cần nhớ: `infestation.vn`. Địa chỉ thật sau chuyển hướng: `https://MOCKAPI/`.

Công nghệ quan sát được: PHP/5.3.28, khung CodeIgniter (cookie `ci_session`), Cloudflare, LiteSpeed. Trình duyệt không gọi API JSON nào. Chỉ có một lời gọi đo của Cloudflare.

| Đường dẫn | Phương thức | Việc làm | Trường dữ liệu | Quan sát |
| --- | --- | --- | --- | --- |
| `/` | GET | Trang chủ: số người chơi trực tuyến, vài tin mới | không | Công khai |
| `/announcement` | GET | Danh sách tin | không | Bị chuyển sang `/ide/login?required` |
| `/announcement/view/<slug>-<id>` | GET | Một bài viết | không | Bị chuyển sang `/ide/login?required` |
| `/announcement/download` | GET | Tải game | không | Bị chuyển sang `/ide/login?required` |
| `/ranking?b=gd&q=<tên>` | GET | Bảng xếp hạng: Hạng, Người chơi, Gia tộc, GameDollar, XP | `b` (loại bảng, thấy giá trị `gd`), `q` (tìm theo tên) | Công khai. Người đăng nhập thấy thêm khối "Vị trí của tôi" |
| `/ide/login` | GET, POST | Đăng nhập | `prependedUsername` (email), `prependedPassword` | Công khai |
| `/ide/register` | GET, POST | Đăng ký | `email`, `usrname` (tên hiển thị, không dấu, viết liền), `password1`, `password2` | Công khai |
| `/ide/forgotpass` | GET | Quên mật khẩu | chưa rõ | Trang trống khi tải bằng công cụ |
| `/ide/language`, `/ide/login/en` | GET | Đổi ngôn ngữ Việt hoặc Anh | không | Công khai |

Ghi chú:

- Không gửi biểu mẫu nào lên site cũ khi kiểm tra. Chỉ đọc.
- Mã mẫu còn sót (`assets/php/form-process.php`, đường dẫn MailChimp của mẫu giao diện) không được dùng.
- `robots.txt` chỉ có chú thích của Cloudflare, không có luật chặn.

## 7. Focus area (brownfield)

Không áp dụng. Đây là dự án mới. Site cũ chỉ để tham khảo đường dẫn và biểu mẫu.

## 8. Open questions

- Dữ liệu thật cho xếp hạng, tài khoản và vật phẩm lấy từ đâu (cơ sở dữ liệu máy chủ game hay một API mới)?
- Quy tắc tên hiển thị "không dấu, viết liền" của site cũ có giữ lại không?
- Cửa hàng và nạp tiền: dùng cổng thanh toán nào, quy định ra sao?
- Tệp cài đặt game đặt ở đâu và dung lượng bao nhiêu (để viết hướng dẫn tải)?
- Có giữ công tắc ngôn ngữ Việt/Anh như site cũ không? (Hiện thiết kế chỉ có tiếng Việt.)
- Hình giao diện của game (nút, khung) nằm trong tệp Flash `.swf` và chưa được lấy. Có cần lấy để khớp 100% với game không?
- Tên người chơi dài tối đa bao nhiêu ký tự, và hạng có tối đa bao nhiêu chữ số? (Thiết kế đang chịu được hạng đến 99.999.)

Câu hỏi bổ sung sau khi có thiết kế đầy đủ (chi tiết và hậu quả nằm ở `design-handoff/ROUTES-AND-DATA.md`, mục 12, mã D-01 đến D-13). Theo yêu cầu của chủ dự án, các câu hỏi này được hỏi ở cuối phiên làm việc kế tiếp, không chặn phần giao diện làm với API giả:

- Chặn việc code. Tài khoản website dùng chung với game hay riêng, và game băm mật khẩu bằng cách nào (D-01)? Lấy dữ liệu xếp hạng, nhân vật, vật phẩm bằng cách nào (D-02)?
- Hiện những bảng xếp hạng nào? Site cũ có 8 bảng, thiết kế chỉ có 3 tab (D-03).
- Game chỉ chạy trên máy tính. Người dùng điện thoại bấm "TẢI GAME" thì xử lý ra sao (D-05)? Bộ cài đặt ở đâu (D-04)?
- Dùng dịch vụ gửi email nào cho chức năng quên mật khẩu (D-06)? Quy tắc mật khẩu và tên hiển thị thật là gì (D-07)?
- Dùng lại tên miền `infestation.vn` hay tên miền mới, hạ tầng đặt ở đâu (D-08)?
- Chủ dự án có quyền dùng hình lấy từ client game không (D-09)? "Thông báo trong game" gửi bằng kênh nào (D-10)?
- Công nghệ giao diện đã chọn (D-11): Bun, React, TypeScript, Zod, Axios, build tĩnh. Máy chủ API dùng công nghệ nào, đặt ở đâu và có cùng site với giao diện không (D-12)? Các mặc định kỹ thuật tạm của trợ lý (bộ dựng, định tuyến, dựng sẵn HTML, API giả, kiểm thử) có hợp lý không (D-13)?
- Ý nghĩa của "Banner" trong quản trị (dải thông báo trên đầu trang hay ảnh quảng cáo) và có vẽ dải này trên trang công khai không (A-24, G-26)?
- Đã chốt 29/10/2026: nhân vật tạo trong game (A-23). Bỏ trang Tạo nhân vật và nút "TẠO NHÂN VẬT". Giới hạn 5 nhân vật mỗi tài khoản.
- Đã xong: đổi viền ô nhập sang token `border/control` để đạt tương phản 3:1 (G-01).

## 9. Thiết kế tham chiếu (Figma, bản đầy đủ)

- Tệp: liên kết Figma đã ẩn
- Hướng đã chọn: "Tần số sinh tồn". Thanh điều hướng là núm dò tần số, thẻ nội dung là thẻ kho đồ, lưới chữ thập chỉ làm nền.
- Đã dựng: 22 thành phần dùng chung, 24 trang sản phẩm có đủ bản máy tính (1440 px) và điện thoại (390 px), cùng 3 bảng tham chiếu (trạng thái danh sách, trạng thái xác thực, đầu trang khi đã đăng nhập). Thành phần chính có đủ trạng thái rê chuột, focus, nhấn, vô hiệu.
- Chưa dựng: dải Banner trên trang công khai (G-26), vài trạng thái phụ (G-10, G-24, G-25) và nguyên mẫu tương tác. Trang ngoại tuyến không làm vì website không phải PWA.
- Nút, ô nhập và bảng dùng nền phẳng và họa tiết, chưa dùng hình khung gốc của game (nằm trong `.swf`).
- Số đo: chữ nhỏ nhất 16 px, mọi cặp màu chữ và nền đang dùng đạt 4,5:1 trở lên (trừ chữ vô hiệu), 100% chữ gắn biến màu. Viền ô nhập và chip đã đổi sang `border/control` (3,27 đến 3,70 so với nền).
- Tài liệu bàn giao: `.private/docs/design-handoff/README.md` (mục lục) gồm đặc tả thiết kế, token, thành phần, trang, chữ nội dung, đường dẫn và dữ liệu, dữ liệu mẫu, bản đồ hình, thư viện ảnh và kế hoạch triển khai.

---

Linked context: bảng thuật ngữ nằm ở `docs/CONTEXT.md` (đã có dòng "Tần số sinh tồn").
Xem cấu hình dự án cho bản đồ dự án (`project.mode`, `project.prd`, quy ước, lệnh).
