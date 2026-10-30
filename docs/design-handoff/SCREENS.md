# Thư viện ảnh màn hình

Tệp này liệt kê từng trang thiết kế kèm mã node Figma để mở đúng chỗ (cập nhật 29/10/2026, vòng 3). Bản sao này nằm trong kho git nên không chứa ảnh chụp. Ảnh chụp nằm ở thư mục riêng tư `.private/local/figma-design/shots/screens/` (không đưa vào git) vì được làm từ hình lấy từ client game chưa rõ quyền sử dụng (G-15). Muốn xem ảnh, mở đúng node trong Figma hoặc dùng cách chụp lại ở mục 4.

Tệp Figma: riêng tư, mã đã ẩn. Mở đúng node bằng cách thêm `?node-id=` vào địa chỉ, đổi dấu hai chấm thành gạch ngang (ví dụ `24:2` thành `node-id=24-2`).

Lưu ý khi xem ảnh dài của bản điện thoại: thanh TabBar nằm cố định ở đáy màn hình, nên trong ảnh chụp cả trang nó hiện chồng giữa nội dung. Khi code, TabBar luôn dính đáy cửa sổ.

## 1. Bảng tra nhanh

| # | Trang | MT (1440) | ĐT (390) |
| --- | --- | --- | --- |
| 1 | Trang chủ | `24:2` (4057) | `39:2` (5855) |
| 2 | Tin tức | `30:224` (1981) | `65:110` (2239) |
| 3 | Kho đồ | `32:365` (2508) | `41:46` (2049) |
| 4 | Xếp hạng | `34:571` (2187) | `66:393` (2180) |
| 5 | Đăng nhập | `36:808` (935) | `67:190` (1092) |
| 6 | Đăng ký | `36:869` (1179) | `67:234` (1384) |
| 7 | Hồ sơ | `37:856` (1743) | `68:294` (2698) |
| 8 | Quản trị (đăng bài) | `38:954` (1395) | `71:279` (2414) |
| 9 | Bảng trạng thái danh sách | `62:1027` (1850) | Không có |
| 10 | Tải game | `107:1097` (3011) | `108:310` (4556) |
| 11 | Chi tiết bài viết | `109:1198` (2500) | `109:1679` (2424) |
| 12 | Chi tiết vật phẩm | `110:1278` (1763) | `110:1814` (2001) |
| 13 | Quên mật khẩu | `113:1398` (815) | `113:1941` (1012) |
| 14 | Đặt lại mật khẩu | `113:1480` (834) | `113:2003` (1007) |
| 15 | Bảng trạng thái xác thực | `114:1436` (1454) | `114:1940` (3030) |
| 16 | Đổi mật khẩu | `115:1455` (1510) | `115:2215` (1830) |
| 17 | Tạo nhân vật | `115:1603` (1386) | `115:2271` (1729) |
| 18 | Quy tắc cộng đồng | `116:1623` (2084) | `116:2550` (2217) |
| 19 | Trang 404 | `116:1760` (1177) | `116:2516` (1177) |
| 20 | Trang 500 | `116:1836` (1177) | `116:2533` (1177) |
| 21 | Xếp hạng gia tộc | `116:2736` (2187) | `117:2636` (2180) |
| 22 | Quản trị: Bài viết | `118:2045` (909) | `119:2856` (1328) |
| 23 | Quản trị: Vật phẩm | `118:2186` (1047) | `119:2937` (1539) |
| 24 | Quản trị: Banner | `118:2356` (1128) | `119:3056` (1871) |
| 25 | Quản trị: Người dùng | `118:2462` (978) | `119:3131` (1403) |
| 26 | Quản trị: Nhật ký | `118:2607` (853) | `119:3215` (1175) |
| 27 | Bảng đầu trang khi đã đăng nhập | `120:3042` (1252) | `120:3221` (778) |

Số trong ngoặc là chiều cao khung (đơn vị px). Chiều rộng cố định 1440 (MT) và 390 (ĐT).

## 2. Các trang khác trong tệp Figma

| Trang Figma | Nội dung | Mã node |
| --- | --- | --- |
| Cover | Bìa tệp | `48:2` |
| Directions | Ba hướng thiết kế đã thử (A Núm dò đài, B Bản đồ khu vực, C Sổ tay sinh tồn) | `43:2` |
| Foundations | Màu, chữ, khoảng cách | `9:2` và `11:2` |
| 20 Components | 22 thành phần (16 bộ biến thể và 6 thành phần đơn, xem `COMPONENTS.md`) | Từng thành phần có mã riêng trong `COMPONENTS.md` |
| 30 Screens 1440 | 27 khung MT (24 trang và 3 bảng tham chiếu) | Bảng 1 |
| 31 Screens 390 | 26 khung ĐT (24 trang và 2 bảng tham chiếu) | Bảng 1 |
| 40 Assets | 60 hình đã tải lên | `14:2` và `16:2` (xem `ASSET-MAP.md`) |

## 3. Cách chụp lại khi thiết kế đổi

1. Mở tệp Figma và chọn đúng frame (mã node ở bảng 1).
2. Dùng công cụ chụp của Figma (hoặc `get_screenshot` qua MCP với `fileKey`, `nodeId` và `maxDimension` 6000. Giá trị lớn chỉ đặt trần, ảnh vẫn giữ đúng cỡ khung).
3. Lưu đè vào thư mục `.private/local/figma-design/shots/screens/` với đúng tên tệp đã ghi ở các liên kết của bảng 1 (dạng `desktop-NN-ten-trang.png` và `mobile-NN-ten-trang.png`).
4. Địa chỉ ảnh do công cụ trả về chỉ sống trong thời gian ngắn và coi như bí mật. Tải về ngay, đừng dán vào tài liệu.
