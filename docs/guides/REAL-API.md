# Nối API thật thay API giả

Tài liệu này dành cho người làm máy chủ API và người sửa giao diện. Nó nói cần làm gì để website chuyển từ dữ liệu mẫu sang dữ liệu thật, và những chỗ dễ sai.

Đây là mẫu minh họa. Tên miền và đường dẫn đều là ví dụ. Tài liệu không mô tả một máy chủ cụ thể nào.

Đọc kèm:

- [ROUTES-AND-DATA.md](../design-handoff/ROUTES-AND-DATA.md): hợp đồng API, kiểu dữ liệu và luật bảo mật.
- [DEPLOY-UBUNTU.md](DEPLOY-UBUNTU.md): dựng và đưa website lên máy chủ.

## 1. Tóm tắt

Các trang không gọi mạng trực tiếp. Mọi yêu cầu đi qua `src/api/`, nên không phải sửa từng trang.

```text
Trang  ->  src/api/endpoints.ts  ->  src/api/client.ts  ->  API
                                                           |
                 API_MODE=mock: API giả trong trình duyệt (src/api/mock/)
                 API_MODE=real: gọi /api/v1 trên cùng tên miền
```

Việc cần làm gồm ba phần:

1. Làm máy chủ API đúng hợp đồng.
2. Cho nginx chuyển `/api/v1/` tới máy chủ API.
3. Dựng lại website với `API_MODE=real`.

`API_MODE` được nhúng lúc dựng. Muốn đổi thì phải dựng lại.

## 2. Những quyết định cần chốt trước

Các mã này nằm ở `ROUTES-AND-DATA.md` mục 12.

| Mã | Câu hỏi | Ảnh hưởng |
| --- | --- | --- |
| D-01 | Tài khoản sống ở đâu, băm mật khẩu thế nào? | Đăng ký, đăng nhập, hồ sơ |
| D-02 | Lấy xếp hạng, nhân vật, vật phẩm từ đâu? | Xếp hạng, hồ sơ, kho đồ |
| D-04 | Bộ cài game đặt ở đâu? | Trang tải game |
| D-06 | Gửi thư quên mật khẩu bằng gì? | Quên mật khẩu |
| D-08 | Tên miền chính thức là gì? | `SITE_URL`, HTTPS, chuyển hướng |
| D-12 | API dùng công nghệ gì, có cùng site với giao diện không? | Cookie phiên và mọi phần còn lại |

## 3. Các bước

### Bước 1: Làm API theo hợp đồng

Mục 7 liệt kê đúng những gì giao diện gọi. Dạng dữ liệu chính xác nằm ở `src/api/schemas.ts`.

Giao diện kiểm mọi phản hồi bằng lược đồ Zod. Thiếu trường hoặc sai kiểu thì giao diện coi là lỗi máy chủ và hiện trạng thái Lỗi. Khi `ROUTES-AND-DATA.md` và `schemas.ts` khác nhau, `schemas.ts` là thứ chạy thật.

Thử một phản hồi với lược đồ, chạy ở thư mục dự án:

```ts
import { newsListSchema } from "./src/api/schemas.ts";

const reply = await fetch("https://api-thu.example.com/api/v1/news");
const result = newsListSchema.safeParse(await reply.json());
console.log(result.success ? "đúng dạng" : result.error.issues);
```

Lỗi phải theo một dạng duy nhất, xem `ROUTES-AND-DATA.md` mục 8.4:

```json
{ "error": { "code": "validation_failed", "message": "Kiểm tra lại các ô được đánh dấu.", "fields": { "email": "Sai dạng." } } }
```

`fields` được gắn vào đúng ô nhập, nên tên khóa phải trùng tên trường gửi lên.

### Bước 2: Chốt cách đăng nhập

Chỉ cần sửa một tệp: `src/api/auth-transport.ts`. Bảng lựa chọn ở `ROUTES-AND-DATA.md` mục 8.5.

Nếu dùng cookie phiên như hiện tại, API phải làm đủ các việc sau:

- Đặt cookie phiên `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`.
- Đặt cookie đọc được tên `csrf_token`. Giao diện đọc cookie này và gửi lại trong đầu `X-CSRF-Token` ở mọi yêu cầu ghi.
- Kiểm tra `Origin` và mã CSRF ở mọi yêu cầu ghi.

Bắt buộc đặt `csrf_token` ngay cho cả khách. Đăng nhập và đăng ký cũng là yêu cầu ghi. Máy chủ giả đặt cookie này khi phát HTML, nhưng nginx phát HTML tĩnh nên không làm được việc đó. Cách đơn giản nhất: API đặt `csrf_token` trong phản hồi `GET /api/v1/me`, kể cả khi trả 401.

Ở `API_MODE=real`, giao diện luôn gọi `GET /api/v1/me` khi mở trang. Khách nhận 401 ở mỗi lần tải trang là bình thường. Vì vậy `/me` phải nhanh và không tính vào giới hạn tốc độ của đăng nhập.

### Bước 3: Thêm đường API vào nginx

Giao diện gọi `/api/v1` trên cùng tên miền, đặt ở `API_BASE_URL` trong `src/api/client.ts`. Dùng nginx chuyển tiếp thì không cần CORS, và cookie hoạt động đúng.

Thêm vào cấu hình ở `DEPLOY-UBUNTU.md` mục 6. Đổi `<cong-api>` thành cổng của máy chủ API.

Trong khối `map`, thêm dòng cho API:

```nginx
map $uri $issvn_cache_control {
    default "no-cache";
    "~^/assets/[^/]+-[a-z0-9]{8}\.[a-z0-9]+$" "public, max-age=31536000, immutable";
    # Phản hồi API tự quyết Cache-Control. Giá trị rỗng thì nginx không thêm dòng nào.
    "~^/api/" "";
}
```

Thiếu dòng này thì phản hồi API có hai dòng `Cache-Control` trái nhau: `private, no-store` của API và `no-cache` của nginx.

Trong khối `server`, thêm hai `location`:

```nginx
    # Ảnh tải lên nằm ngoài bản dựng, nên cập nhật website không làm mất ảnh.
    location /assets/game/uploads/ {
        alias /home/issvn-site/uploads/;
        try_files $uri =404;
    }

    location /api/v1/ {
        proxy_pass http://127.0.0.1:<cong-api>;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 6m;
    }
```

- `client_max_body_size 6m` cho phép ảnh 5 MB cộng phần bao của biểu mẫu. Ảnh lớn hơn nhận mã 413.
- Máy chủ API chỉ nên nghe `127.0.0.1`, không mở cổng ra ngoài.
- Xóa dòng `X-Robots-Tag` ở bản chính thức. Giữ dòng đó ở máy chủ thử để bản thử không vào kết quả tìm kiếm.

### Bước 4: Dựng với API thật

```sh
NODE_ENV=production API_MODE=real SITE_URL=https://demo.example.com bun run build
bun run measure
```

Bản `real` khác bản `mock` như sau:

| Mục | `mock` | `real` |
| --- | --- | --- |
| `out/assets/adapter-*.js` | Có | Không có |
| `robots.txt` | `Disallow: /` | Cho phép, chặn `/quan-tri/` và `/api/`, có dòng `Sitemap` |
| `sitemap.xml` | Không có | Có 6 trang công khai |
| Thẻ trên trang công khai | `noindex` | `canonical`, không có `noindex` |
| Tham số `?mock=` | Có tác dụng | Không có tác dụng |

Giá trị trong `.env*` được nhúng vào gói JavaScript và ai cũng đọc được. Không đặt khóa, mật khẩu hay địa chỉ nội bộ ở đó. Bí mật của API nằm trên máy chủ API.

`.env.production` hiện có `API_MODE=mock`. Hãy ghi rõ biến trên dòng lệnh như trên, hoặc sửa tệp này khi đã có API thật.

### Bước 5: Gắn các liên kết thật

Các chỗ này không lấy từ API:

- `src/content/site-links.ts`: `INSTALLER_URL` hiện là `#`, tìm dấu `LINK-TAI-GAME`. Sửa xong thì sửa kiểm thử trong `tests/download.test.tsx`.
- Liên kết Discord và YouTube cũng đang là `#`.

Nút tải đọc `INSTALLER_URL`, không đọc `installerUrl` của `GET /download`. Muốn API quyết định link tải thì phải sửa `src/pages/Download/DownloadCard.tsx`.

### Bước 6: Thử rồi mới mở

Không có cách đổi từng endpoint. `API_MODE=real` áp dụng cho toàn bộ website, nên endpoint chưa làm sẽ hiện trạng thái Lỗi. Hãy thử trên một tên miền phụ, giữ `X-Robots-Tag`, cho đến khi mọi trang công khai đủ dữ liệu.

## 4. Những điểm dễ sai

| Điểm | Điều phải đúng |
| --- | --- |
| Thời gian chờ | Giao diện bỏ cuộc sau 8 giây (`REQUEST_TIMEOUT_MS`) và hiện trạng thái Lỗi |
| Đăng nhập và đăng ký | Trả về đối tượng tài khoản (`accountSchema`), không chỉ trả mã 200 rỗng |
| Giới hạn tốc độ | Trả 429 kèm `Retry-After` để giao diện hiện đúng thông báo khóa |
| Email | Luôn trả dạng đã che trong `emailMasked`. Không trả email đầy đủ |
| Ngày giờ | Trạng thái banner do API tính. Bản `real` dùng giờ thật, không dùng ngày mẫu `meta.mockNow` |
| Nội dung bài viết | Giao diện có lọc `bodyHtml`, nhưng API vẫn phải làm sạch theo danh sách cho phép ở mục 11 |
| Bộ nhớ đệm | Dữ liệu công khai và dữ liệu cá nhân dùng `Cache-Control` khác nhau, xem mục 8.4 |
| Quyền | Cổng chặn trên trình duyệt chỉ để điều hướng. Mọi đường `/me` và `/admin` phải tự kiểm quyền |

## 5. Ảnh tải lên

Giao diện ghép mọi khóa hình thành `/assets/game/<khóa>`, xem `src/lib/assets.ts`. Vì vậy:

- `POST /api/v1/admin/uploads` nhận biểu mẫu nhiều phần, tên trường là `file`, và trả `{ "imageKey": "uploads/ten-ngau-nhien.webp" }`.
- API lưu tệp vào `/home/issvn-site/uploads/`, ngoài thư mục `releases/`. Lưu trong `releases/` thì mất ảnh sau mỗi lần cập nhật.
- API phải kiểm nội dung tệp, mã hóa lại ảnh, xóa EXIF và đặt tên ngẫu nhiên.

## 6. SEO khi lên thật

- Trang công khai có HTML dựng sẵn, nên `/`, `/tin-tuc`, `/kho-do`, `/xep-hang`, `/tai-game`, `/quy-tac` lên tìm kiếm ổn.
- Trang chi tiết `/tin-tuc/:slug` và `/kho-do/:slug` đi qua `200.html`, tệp này có `noindex`. Giao diện đặt lại thẻ sau khi JavaScript chạy, nhưng công cụ không chạy JavaScript sẽ chỉ thấy `noindex`.
- `sitemap.xml` hiện chỉ có 6 trang công khai, chưa có bài viết và vật phẩm.

Muốn bài viết và vật phẩm lên tìm kiếm chắc chắn, phải dựng sẵn hai loại trang này từ API lúc build, xem `ROUTES-AND-DATA.md` mục 5.

## 7. Giao diện gọi những gì

Đường dẫn tính từ `/api/v1`. Cột Lược đồ là tên trong `src/api/schemas.ts`. Dòng "Không kiểm" nghĩa là giao diện chỉ cần mã thành công.

Công khai, trong `src/api/endpoints.ts`:

| Hàm | Yêu cầu | Lược đồ |
| --- | --- | --- |
| `getServerStatus` | `GET /server/status` | `serverStatusSchema` |
| `getNewsList` | `GET /news` | `newsListSchema` |
| `getNewsDetail` | `GET /news/{slug}` | `newsDetailSchema` |
| `getItemList` | `GET /items` | `itemListSchema` |
| `getItem` | `GET /items/{slug}` | `itemSchema` |
| `getRanking` | `GET /ranking` | `rankingSchema` |
| `getDownloadInfo` | `GET /download` | `downloadInfoSchema` |
| `getBanner` | `GET /banner` | `bannerResponseSchema` |

Tài khoản, cũng trong `src/api/endpoints.ts`:

| Hàm | Yêu cầu | Lược đồ |
| --- | --- | --- |
| `getMe` | `GET /me` | `accountSchema` |
| `getMyCharacters` | `GET /me/characters` | `charactersSchema` |
| `postLogin` | `POST /auth/login` | `accountSchema` |
| `postRegister` | `POST /auth/register` | `accountSchema` |
| `postLogout` | `POST /auth/logout` | Không kiểm |
| `postForgot` | `POST /auth/forgot` | Không kiểm |
| `getResetCheck` | `GET /auth/reset/{token}` | `resetCheckSchema` |
| `postReset` | `POST /auth/reset` | Không kiểm |
| `postChangePassword` | `POST /account/password` | Không kiểm |

Quản trị, trong `src/api/admin-endpoints.ts`:

| Hàm | Yêu cầu | Lược đồ |
| --- | --- | --- |
| `getAdminNews` | `GET /admin/news` | `adminNewsListSchema` |
| `getAdminNewsPost` | `GET /admin/news/{id}` | `newsPostSchema` |
| `createAdminNews` | `POST /admin/news` | `newsPostSchema` |
| `updateAdminNews` | `PUT /admin/news/{id}` | `newsPostSchema` |
| `uploadImage` | `POST /admin/uploads` | `uploadResultSchema` |
| `getAdminItems` | `GET /admin/items` | `adminItemListSchema` |
| `getAdminItem` | `GET /admin/items/{id}` | `itemSchema` |
| `createAdminItem` | `POST /admin/items` | `itemSchema` |
| `patchAdminItem` | `PATCH /admin/items/{id}` | `itemSchema` |
| `getAdminBanners` | `GET /admin/banners` | `adminBannerListSchema` |
| `createAdminBanner` | `POST /admin/banners` | `adminBannerSchema` |
| `patchAdminBanner` | `PATCH /admin/banners/{id}` | `adminBannerSchema` |
| `getAdminUsers` | `GET /admin/users` | `adminUserListSchema` |
| `getAdminUser` | `GET /admin/users/{id}` | `adminUserDetailSchema` |
| `lockAdminUser` | `POST /admin/users/{id}/lock` | `adminUserSchema` |
| `unlockAdminUser` | `POST /admin/users/{id}/unlock` | `adminUserSchema` |
| `getAudit` | `GET /admin/audit` | `auditListSchema` |

Những chỗ mã và `ROUTES-AND-DATA.md` chưa khớp:

- Mã gọi nhưng bảng mục 8 không ghi: `GET /auth/reset/{token}`, `GET /admin/users/{id}`, trường `remember` khi đăng nhập, tham số `status` và `q` của `GET /admin/news`.
- Bảng mục 8 có nhưng giao diện chưa gọi: `DELETE /admin/news/{id}`, `DELETE /admin/banners/{id}`, `POST /me/characters`.

## 8. Mã API giả sau khi lên thật

Không cần xóa `src/api/mock/`. Bản `real` không chứa gói API giả, và kiểm thử vẫn dùng nó (`tests/setup.ts` đặt `API_MODE=mock`).

Máy chủ giả (`scripts/mock-server.ts`) và dữ liệu `.mock-data/` chỉ dùng trên máy phát triển. Không đưa chúng lên máy chủ.

## 9. Danh sách kiểm tra trước khi mở thật

- [ ] Đã chốt D-01, D-02, D-04, D-06, D-08, D-12.
- [ ] Mọi endpoint ở mục 7 qua được lược đồ Zod bằng dữ liệu thật.
- [ ] Lỗi trả đúng dạng ở mục 8.4, kể cả 401, 403, 422, 429.
- [ ] `csrf_token` có ngay cho khách, đăng nhập và đăng ký chạy được từ trình duyệt mới.
- [ ] Cookie phiên có `HttpOnly`, `Secure`, `SameSite=Lax`. Website chạy HTTPS.
- [ ] Yêu cầu ghi thiếu `Origin` đúng hoặc thiếu mã CSRF bị từ chối.
- [ ] Mọi đường `/admin` trả 401 hoặc 403 khi thiếu quyền.
- [ ] Ảnh tải lên nằm ngoài `releases/`, tải lên 5 MB được, 7 MB nhận 413.
- [ ] Bản dựng có `API_MODE=real` và đúng `SITE_URL`. Không còn `out/assets/adapter-*.js`.
- [ ] Đã xóa `X-Robots-Tag` ở nginx. `robots.txt` không còn `Disallow: /`.
- [ ] Đã bật `Strict-Transport-Security` sau khi HTTPS chạy ổn, xem `ROUTES-AND-DATA.md` mục 11.
- [ ] Đã thay link tải, Discord và YouTube.
- [ ] Đã xác nhận quyền dùng hình game (D-09).
- [ ] Mật khẩu mẫu và tài khoản mẫu không tồn tại trên API thật.
