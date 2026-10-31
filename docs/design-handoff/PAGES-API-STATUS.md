# Trang nào đang chạy API thật

Bản đồ này trả lời một câu: mỗi trang gọi endpoint nào, và endpoint đó hiện lấy dữ liệu từ đâu. Đọc cùng `API-DATA-REAL.md` (dữ liệu thật của hệ thống cũ) và `ROUTES-AND-DATA.md` (hợp đồng API).

Cập nhật: 29-10-2026, sau khi thêm tầng đọc nguồn game (phương án A).

## 1. Câu trả lời ngắn

**Hiện tại chỉ có một endpoint có thể trả dữ liệu thật: `GET /api/v1/server/status`.** Tất cả các trang còn lại vẫn dùng API giả.

Lý do: tầng đọc nguồn game đã dựng ba đường dẫn, nhưng giao diện mới nối đúng một đường dẫn vào. Hai đường dẫn còn lại đã chạy được nhưng chưa trang nào gọi tới.

Điều kiện để endpoint đó trả dữ liệu thật là **hai điều cùng lúc**:

1. Bản build có `API_MODE=real`. Tệp `.env.production` đang đặt `mock`, nên phải ghi rõ biến này trên dòng lệnh khi dựng.
2. Máy chủ chạy với `API_SOURCE=game`.

Thiếu một trong hai thì trang vẫn chạy nhưng dữ liệu là giả, hoặc báo lỗi.

## 2. Bảng tổng hợp theo trang

Cột "Nguồn" cho biết dữ liệu thực tế đang chảy vào trang.

| Trang | Endpoint gọi | Nguồn hiện tại | Nối được API thật? |
| --- | --- | --- | --- |
| `/` Trang chủ | `GET /server/status` | **Thật** khi bật `API_SOURCE=game` | Đã nối |
| `/` Trang chủ | `GET /news?trang=1&limit=5` | Giả | Chưa có nguồn |
| `/` Trang chủ | `GET /ranking?bang=gamedollar&limit=5` | Giả | Có nguồn, chưa nối |
| `/` Trang chủ | `GET /items/{slug}` cho 3 vật phẩm nổi bật | Giả | Chưa có tên, xem mục 4 |
| `/tin-tuc` | `GET /news?loai=&trang=&limit=` | Giả | Chưa có nguồn |
| `/tin-tuc/:slug` | `GET /news/{slug}` | Giả | Chưa có nguồn |
| `/kho-do` | `GET /items?loai=&q=&sap-xep=&trang=&limit=` | Giả | Một phần, xem mục 4 |
| `/kho-do/:slug` | `GET /items/{slug}` và `GET /items?loai=` | Giả | Một phần, xem mục 4 |
| `/xep-hang` | `GET /ranking?bang=&q=&trang=&limit=` | Giả | Có nguồn, chưa nối |
| `/tai-game` | `GET /download` | Giả | Có nguồn, chưa nối |
| `/quy-tac` | Không gọi API | Nội dung tĩnh, lấy từ `src/content/rules.ts` | Không cần |
| `/dang-nhap` | `POST /auth/login` | Giả | **Không nên nối**, xem mục 5 |
| `/dang-ky` | `POST /auth/register` | Giả | **Không nên nối** |
| `/quen-mat-khau` | `POST /auth/forgot` | Giả | **Không nên nối** |
| `/dat-lai-mat-khau` | `GET /auth/reset/{token}`, `POST /auth/reset` | Giả | **Không nên nối** |
| `/ho-so` | `GET /me`, `GET /me/characters`, `GET /items/{slug}` | Giả | Chưa lấy được, xem mục 5 |
| `/ho-so/doi-mat-khau` | `POST /account/password` | Giả | **Không nên nối** |
| `/quan-tri/*` (7 trang) | 16 endpoint `/admin/*` | Giả | Không có ở hệ thống cũ |
| Mọi trang công khai | `GET /banner` | Giả | Không có ở hệ thống cũ |
| Mọi trang công khai | `GET /server/status` (thanh trạng thái) | **Thật** khi bật `API_SOURCE=game` | Đã nối |

## 3. Chi tiết từng chỗ đã nối thật

### 3.1 `GET /api/v1/server/status`

Dùng ở hai chỗ, cùng một nguồn:

- `src/hooks/useServerStatus.tsx:25` cấp trạng thái cho toàn ứng dụng, làm mới mỗi 60 giây.
- `src/components/StatusStrip/StatusStrip.tsx` hiện chấm xanh và chữ ONLINE.
- `src/pages/Home/Home.tsx:66` hiện số người đang chơi trên trang chủ.

Đường đi của dữ liệu:

```
Máy chủ game  http://x.x.x.x/infestation/updater/api_getserverinfo.xml
   ↓  src/api/source/game-source.ts  (đọc XML, giới hạn 8 giây)
   ↓  src/api/source/map.ts          (đổi sang { online, playersOnline, updatedAt })
   ↓  src/api/source/handler.ts      (bộ nhớ đệm 30 giây)
GET /api/v1/server/status
   ↓  src/api/client.ts → parseResponse + serverStatusSchema
   ↓  useServerStatus → StatusStrip, trang chủ
```

Kết quả đo được khi chạy thật:

```json
{"online":true,"playersOnline":null,"updatedAt":"2026-10-29T12:53:28.940Z"}
```

`playersOnline` luôn là `null` vì máy chủ game không trả số người đang chơi. Thanh trạng thái đã có nhánh xử lý `null`: hiện ONLINE nhưng ẩn cụm số, thay vì hiện số sai.

### 3.2 Hai endpoint chạy được nhưng chưa trang nào gọi

| Endpoint | Trả về | Vì sao chưa nối |
| --- | --- | --- |
| `GET /api/v1/source/items-catalog` | 158 vật phẩm: 62 trang bị, 96 vũ khí | Hình dạng khác `itemSchema`. Thiếu `slug`, `name`, `imageKey`. Xem mục 4 |
| `GET /api/v1/source/manifests` | Phiên bản dữ liệu game và launcher | `downloadInfoSchema` cần `sizeLabel`, `requirements`, `installerUrl` mà nguồn này không có |

Kiểm tra nhanh hai đường dẫn này:

```sh
API_SOURCE=game bun run serve
curl -s http://127.0.0.1:4173/api/v1/source/manifests
curl -s http://127.0.0.1:4173/api/v1/source/items-catalog | head -c 400
```

## 4. Vì sao kho đồ chưa nối được ngay

`/api/v1/source/items-catalog` trả đúng thứ máy chủ game có, nhưng `itemSchema` cần nhiều trường hơn. Đây là danh sách đầy đủ chỗ lệch:

| Trường `itemSchema` cần | Nguồn game có | Cách xử lý |
| --- | --- | --- |
| `gameItemId` | Có, ví dụ `20006` | Dùng ngay |
| `group` | Không phân nhóm | Đã suy ra: trang bị → `giap-va-ba-lo`, vũ khí → `vu-khi` |
| `typeLabel` | Không có | Đã đặt: `TRANG BỊ`, `VŨ KHÍ` |
| `statLine`, `stats` | Có thông số thô | Đã đổi sang nhãn tiếng Việt |
| `slug` | **Không có** | Phải tự đặt, hoặc dùng `gameItemId` làm slug |
| `name` | **Không có** | Phải tự nhập. Nằm trong `WZ_*.bin`, chưa trích xuất |
| `imageKey`, `hudKey` | **Không có** | Phải tự nhập |
| `description` | **Không có** | Phải tự nhập |
| `publishedAt` | **Không có** | Lấy lúc nhập kho |
| `id`, `featured`, `visible` | **Không có** | Trường của website, không phải của game |

Nghĩa là: thông số thì lấy thật được, còn tên, hình, mô tả vẫn phải nhập tay. Một trang kho đồ chỉ có mã số và thông số, không có tên, thì người chơi không dùng được.

Ba cách đi tiếp, chọn một:

| Cách | Việc phải làm | Được gì | Mất gì |
| --- | --- | --- | --- |
| A1. Bảng đối chiếu thủ công | Tạo một tệp ánh xạ `gameItemId` → tên, slug, hình. Nhập cho 158 vật phẩm | Kho đồ thật, tên đúng | Công nhập một lần, phải cập nhật khi game thêm vật phẩm |
| A2. Chỉ hiện vật phẩm đã nhập | Giữ 12 vật phẩm mẫu, thêm trường `gameItemId` để nối thông số thật | Ít công, thông số chính xác | Kho đồ không đầy đủ |
| A3. Chờ đội game | Đề nghị trả kèm tên trong `api_GetItemsInfo.aspx` | Đầy đủ, tự động | Phụ thuộc bên thứ ba |

Khuyến nghị A2 trước, vì nó dùng được ngay và không sai dữ liệu. Làm A1 sau nếu cần đủ 158 món.

## 5. Vì sao không nên nối phần tài khoản

Ba lý do đã kiểm chứng, ghi ở `API-DATA-REAL.md` mục 4 và 7:

1. `api_Login.aspx` trả cùng chuỗi `WO_00 0 0` cho mật khẩu đúng, mật khẩu sai, tài khoản không tồn tại, và cả khi để rỗng. Không có cách nào biết đăng nhập thành công.
2. Trang đăng nhập web cũ trả HTML chứ không trả JSON, thành công là body rỗng kèm header `Refresh`, không có mã 302.
3. `.env.production` đang đặt `API_MODE=real`, nên nếu nối phần này mà chưa có máy chủ thì các trang Tin tức, Kho đồ, Xếp hạng, Hồ sơ sẽ **báo lỗi cho người chơi thật**.

Vì vậy phần tài khoản, tin tức, xếp hạng, quản trị vẫn để API giả cho tới khi đội game mở API JSON riêng.

## 6. Cảnh báo về bản production

`.env.production` đang đặt `API_MODE=real`. Nghĩa là bản build production sẽ gọi `/api/v1` thật. Hiện chỉ `/api/v1/server/status` có máy chủ trả lời, và chỉ khi chạy `API_SOURCE=game`.

Hệ quả: nếu phát hành bản `build:prod` lên một máy chủ tĩnh thường (không có `API_SOURCE=game`), thì:

- Trang Tin tức, Kho đồ, Xếp hạng, Hồ sơ hiện trạng thái lỗi.
- Thanh trạng thái ẩn cụm số.

Nếu cần phát hành bản xem thử có dữ liệu, đổi `API_MODE=mock`. Nhưng đừng phát hành công khai bản mock, vì người chơi sẽ thấy dữ liệu mẫu như dữ liệu thật.

## 7. Bảng kiểm nhanh cho từng trang

Dùng khi cần biết một trang cụ thể đang lấy dữ liệu từ đâu.

| Muốn biết | Xem ở |
| --- | --- |
| Trang này gọi endpoint nào | Bảng mục 2, hoặc `rg "api/" src/pages/TenTrang` |
| Endpoint trả dữ liệu gì | `src/api/endpoints.ts` và `src/api/schemas.ts` |
| Dữ liệu đó từ đâu | `API_MODE` trong `.env.*`, và `API_SOURCE` khi chạy máy chủ |
| Máy chủ game có endpoint gì | `API-DATA-REAL.md` mục 3 |
| Lỗi bảo mật của hệ thống cũ | `API-DATA-REAL.md` mục 7 |
