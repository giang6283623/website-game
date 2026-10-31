# Dựng và triển khai lên Ubuntu

Tài liệu này hướng dẫn dựng website thành tệp tĩnh, chép lên máy chủ Ubuntu và phát bằng nginx.

Đây là mẫu minh họa. Mọi tên miền, tài khoản và đường dẫn đều là ví dụ. Hãy thay bằng giá trị của bạn:

| Ví dụ | Thay bằng |
| --- | --- |
| `demo.example.com` | Tên miền của bạn |
| `<tai-khoan>@<may-chu>` | Tài khoản SSH và địa chỉ máy chủ |
| `<duong-dan-khoa>` | Đường dẫn tệp khóa SSH trên máy bạn |
| `/home/issvn-site` | Thư mục đặt website trên máy chủ |
| `<phien-ban>` | Tên bản dựng. Nên dùng mã commit rút gọn |

Không ghi địa chỉ máy chủ thật, khóa hay mật khẩu vào kho mã.

## 1. Chọn loại bản dựng

`API_MODE` quyết định website lấy dữ liệu từ đâu.

| `API_MODE` | Dữ liệu | Máy chủ cần gì | Dùng khi |
| --- | --- | --- | --- |
| `mock` | Dữ liệu mẫu chạy ngay trong trình duyệt | Chỉ nginx | Bản mẫu cho khách xem |
| `real` | API thật | nginx và máy chủ API | Bản chính thức, xem [REAL-API.md](REAL-API.md) |
| `mock-server` | Máy chủ giả có lưu dữ liệu | Không dùng trên mạng | Chỉ thử trên máy của bạn |

Tài liệu này dùng `mock`. Người xem bản `mock` sẽ thấy:

- Website đầy đủ, gồm đăng nhập mẫu và khu quản trị.
- Mỗi người xem có dữ liệu riêng. Máy chủ không lưu gì.
- Tải lại trang thì đăng xuất, và mọi thay đổi biến mất.
- Công cụ tìm kiếm bị chặn. `robots.txt` chỉ có `Disallow: /`, mọi trang có thẻ `noindex` và không có `sitemap.xml`.

## 2. Cần chuẩn bị

Trên máy dựng:

- Bun, đã thử với bản 1.4.4.
- Lệnh `trash`. README có cách cài.
- Hình game trong `public/assets/game/`. Thư mục này không có trong git. Bản clone thiếu nó vẫn dựng được, nhưng website sẽ không có hình game. Ảnh trang trí trong `public/assets/art/` đã có trong git.

Trên máy chủ:

- Ubuntu có nginx và quyền `sudo`.
- Tên miền đã trỏ về máy chủ. Kiểm tra bằng `dig +short demo.example.com`.
- Cổng 80 và 443 mở. Kiểm tra bằng `sudo ufw status`.

Máy chủ không cần Bun, Node.js hay mã nguồn. Máy chủ chỉ giữ các tệp trong `out/`.

## 3. Dựng bản tĩnh

Chạy ở thư mục dự án trên máy dựng:

```sh
bun install --frozen-lockfile
NODE_ENV=production API_MODE=mock SITE_URL=https://demo.example.com bun run build
bun run measure
```

Luôn ghi rõ `API_MODE` và `SITE_URL` trên dòng lệnh. Lệnh `bun run build:prod` lấy hai giá trị này từ `.env.production`, nên có thể không phải tên miền của bạn.

Dòng đầu của lệnh dựng phải in đúng giá trị bạn đã chọn:

```text
build: NODE_ENV=production API_MODE=mock SITE_URL=https://demo.example.com
```

Kiểm tra nhanh kết quả:

```sh
cat out/robots.txt
ls out/assets/adapter-*.js
ls out/sitemap.xml
```

| Lệnh | Bản `mock` phải cho kết quả |
| --- | --- |
| `cat out/robots.txt` | Có dòng `Disallow: /` |
| `ls out/assets/adapter-*.js` | Có một tệp. Đây là gói API giả |
| `ls out/sitemap.xml` | Không có tệp này |

Lưu ý: `bun run build` xóa `out/` cũ. Nếu `bun run mock` đang chạy, hãy tắt trước khi dựng.

## 4. Đóng gói và chép lên máy chủ

Trên macOS, tắt siêu dữ liệu của hệ điều hành để giải nén trên Ubuntu không sinh tệp rác:

```sh
COPYFILE_DISABLE=1 tar --no-xattrs --no-mac-metadata --exclude=.DS_Store -czf issvn-site.tar.gz -C out .
shasum -a 256 issvn-site.tar.gz
```

Trên Linux:

```sh
tar -czf issvn-site.tar.gz -C out .
sha256sum issvn-site.tar.gz
```

Chép lên máy chủ:

```sh
scp -i <duong-dan-khoa> issvn-site.tar.gz <tai-khoan>@<may-chu>:/tmp/
```

Trên máy chủ, so mã băm với mã trên máy dựng:

```sh
sha256sum /tmp/issvn-site.tar.gz
```

## 5. Đặt tệp trên máy chủ

Mỗi bản dựng nằm trong một thư mục riêng. Liên kết `current` trỏ tới bản đang chạy, nhờ vậy có thể quay lại bản cũ ngay.

```text
/home/issvn-site/
  current -> releases/<phien-ban>
  releases/
    <phien-ban>/
      index.html
      200.html
      404.html
      assets/
```

Chạy trên máy chủ:

```sh
sudo mkdir -p /home/issvn-site/releases/<phien-ban>
sudo tar -xzf /tmp/issvn-site.tar.gz -C /home/issvn-site/releases/<phien-ban>
sudo chown -R root:root /home/issvn-site
sudo find /home/issvn-site/releases/<phien-ban> -type d -exec chmod 755 {} +
sudo find /home/issvn-site/releases/<phien-ban> -type f -exec chmod 644 {} +
sudo ln -sfn releases/<phien-ban> /home/issvn-site/current
```

Kiểm tra nginx đọc được tệp. Mọi dòng trong kết quả phải cho phép người khác đi qua (có chữ `x` ở cuối):

```sh
namei -l /home/issvn-site/current/index.html
```

## 6. Cấu hình nginx

Xem máy chủ đang tổ chức thế nào trước khi thêm gì. Không sửa cấu hình của website khác.

```sh
sudo nginx -T | grep -E "server_name|listen|include"
ls /etc/nginx/sites-enabled /etc/nginx/conf.d
```

Ubuntu thường dùng `sites-available` và `sites-enabled`. Nếu máy chủ của bạn dùng `conf.d`, hãy đặt tệp ở đó và bỏ bước tạo liên kết.

Tạo tệp `/etc/nginx/sites-available/issvn-site.conf`:

```nginx
# Bảng Cache-Control theo đường dẫn. Khối map phải đứng ngoài khối server.
# Chỉ tệp có mã băm ngay dưới /assets/ mới được giữ lâu. HTML và ảnh phải hỏi lại máy chủ.
map $uri $issvn_cache_control {
    default "no-cache";
    "~^/assets/[^/]+-[a-z0-9]{8}\.[a-z0-9]+$" "public, max-age=31536000, immutable";
}

server {
    listen 80;
    listen [::]:80;
    server_name demo.example.com;

    root /home/issvn-site/current;
    index index.html;
    charset utf-8;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/css text/javascript application/javascript application/json image/svg+xml;

    # Không thêm add_header trong từng location: nginx sẽ bỏ hết các dòng ở đây.
    add_header Cache-Control $issvn_cache_control always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Frame-Options "DENY" always;
    # Chỉ dùng cho bản mẫu. Bản thật phải xóa dòng này.
    add_header X-Robots-Tag "noindex, nofollow" always;

    # Đường dẫn không có trả 404.html kèm mã 404. Thư mục không có index.html cũng vậy.
    error_page 404 /404.html;
    error_page 403 =404 /404.html;

    # Tệp có thật và trang dựng sẵn. /tin-tuc phục vụ tin-tuc/index.html, không chuyển hướng.
    location / {
        try_files $uri $uri/index.html =404;
    }

    # Trang chi tiết chưa dựng sẵn: trình duyệt tự dựng từ 200.html.
    location ~ "^/(tin-tuc|kho-do)/[^/.]+/?$" {
        try_files $uri $uri/index.html /200.html;
    }

    # Trang tài khoản và hồ sơ.
    location ~ "^/(dang-nhap|dang-ky|quen-mat-khau|dat-lai-mat-khau|ho-so|ho-so/doi-mat-khau)/?$" {
        try_files /200.html =404;
    }

    # Khu quản trị.
    location ~ "^/quan-tri(/(bai-viet|vat-pham|nguoi-dung)(/[^/.]+)?|/banner|/nhat-ky)?/?$" {
        try_files /200.html =404;
    }
}
```

Cấu hình này làm giống quy tắc trong `scripts/lib/static-site.ts`: tệp có thật thì trả tệp, trang của ứng dụng trả `200.html`, còn lại trả `404.html` kèm mã 404. Khi thêm trang mới vào `src/routes.ts`, hãy thêm đường dẫn đó vào các khối `location` ở trên.

Chưa bật `Content-Security-Policy`. Chính sách `default-src 'self'` nguyên văn sẽ chặn một phần website. Xem `docs/design-handoff/ROUTES-AND-DATA.md` mục 11.

Bật website và nạp lại nginx. Dùng `reload`, không dùng `restart`, để các website khác không bị ngắt:

```sh
sudo ln -s /etc/nginx/sites-available/issvn-site.conf /etc/nginx/sites-enabled/issvn-site.conf
sudo nginx -t
sudo systemctl reload nginx
```

Chỉ chạy `reload` khi `nginx -t` báo `test is successful`.

Thử ngay trên máy chủ, chưa cần tên miền:

```sh
curl -I -H "Host: demo.example.com" http://127.0.0.1/
```

## 7. Bật HTTPS

Nếu chưa có chứng chỉ, dùng Certbot:

```sh
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d demo.example.com
sudo certbot renew --dry-run
```

Certbot tự sửa tệp cấu hình và thêm chuyển hướng từ HTTP sang HTTPS.

Nếu máy chủ đã có chứng chỉ dùng chung cho nhiều tên miền con, hãy chép các dòng `listen 443`, `ssl_certificate` và `ssl_certificate_key` từ website bên cạnh.

Sau khi đổi cấu hình, luôn chạy `sudo nginx -t` rồi `sudo systemctl reload nginx`.

## 8. Kiểm tra sau khi lên

| Lệnh | Kết quả đúng |
| --- | --- |
| `curl -I https://demo.example.com/` | `200`, có `cache-control: no-cache` và `x-robots-tag: noindex, nofollow` |
| `curl -I https://demo.example.com/tin-tuc` | `200`, không chuyển hướng |
| `curl -I https://demo.example.com/kho-do/ak-74` | `200` |
| `curl -I https://demo.example.com/dang-nhap` | `200` |
| `curl -I https://demo.example.com/quan-tri/bai-viet` | `200` |
| `curl -I https://demo.example.com/khong-co` | `404` |
| `curl -s https://demo.example.com/robots.txt` | Có dòng `Disallow: /` |

Sau đó mở trình duyệt và thử:

- Mở trang chủ, tin tức, kho đồ và xếp hạng. Hình phải hiện đủ.
- Đăng nhập bằng tài khoản mẫu trong README. Người chơi về `/ho-so`. Quản trị vào được `/quan-tri`.
- Mở trên điện thoại. Trang không được tràn ngang.

Bản `mock` có thể thử các trạng thái bằng tham số trên địa chỉ. Ví dụ `/?mock=slow` trả chậm 3 giây, `/?mock=empty` cho danh sách rỗng, `/?mock=error` báo lỗi dữ liệu.

## 9. Cập nhật và quay lại bản cũ

Cập nhật:

1. Dựng và đóng gói bản mới như mục 3 và 4.
2. Giải nén vào thư mục `releases/<phien-ban-moi>` như mục 5.
3. Đổi liên kết:

```sh
sudo ln -sfn releases/<phien-ban-moi> /home/issvn-site/current
```

Không cần nạp lại nginx. Website đổi ngay ở yêu cầu kế tiếp.

Quay lại bản cũ cũng chỉ là đổi liên kết:

```sh
ls /home/issvn-site/releases
sudo ln -sfn releases/<phien-ban-cu> /home/issvn-site/current
```

Giữ lại hai hoặc ba bản gần nhất. Xóa bản cũ bằng `trash`, không dùng `rm`. Trên Ubuntu, cài bằng `sudo apt install trash-cli`.

## 10. Gỡ website

```sh
sudo trash-put /etc/nginx/sites-enabled/issvn-site.conf
sudo nginx -t
sudo systemctl reload nginx
```

Tệp trong `sites-available` và thư mục website vẫn còn, nên có thể bật lại. Bước này chỉ gỡ liên kết, không gỡ chứng chỉ.

## 11. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Mọi trang trả 404 hoặc 403 | nginx không đọc được thư mục. Ubuntu thường đặt thư mục nhà riêng là 750 | Chạy `namei -l` ở mục 5 rồi sửa quyền |
| Hiện website khác | Trùng `server_name`, hoặc yêu cầu rơi vào `default_server` | Kiểm tra `sudo nginx -T` |
| `nginx -t` báo lỗi ở khối `map` | Tệp không nằm trong khối `http` | Đặt tệp ở `sites-enabled` hoặc `conf.d`. Đừng dán vào trong khối `server` |
| `/kho-do/ak-74` trả 404 | Thiếu khối `location` của trang chi tiết | So lại với cấu hình ở mục 6 |
| `/tin-tuc` chuyển hướng sang `/tin-tuc/` | `try_files` dùng `$uri/` | Dùng đúng `$uri/index.html` |
| Mất tiêu đề bảo mật ở một số trang | Có `add_header` trong một khối `location` | Chỉ đặt `add_header` ở cấp `server` |
| Trang trắng sau khi cập nhật | Trình duyệt giữ HTML cũ, hoặc thiếu tệp trong `assets/` | Kiểm tra `cache-control: no-cache` trên HTML và giải nén lại gói |
| Thiếu hình | Máy dựng thiếu `public/assets/game/` hoặc `public/assets/art/` | Chép hai thư mục đó rồi dựng lại |
| Đăng nhập rồi bị đăng xuất | Bản `mock` giữ phiên trong bộ nhớ của trang | Đúng thiết kế của bản mẫu. Đi bằng liên kết trên trang, đừng tải lại |

## 12. Lưu ý với bản mẫu

- Mật khẩu mẫu là công khai. Không dùng bản mẫu để lưu dữ liệu thật.
- Không đưa `bun run mock` lên mạng. Máy chủ giả chỉ nhận `localhost` và chỉ dùng trên máy của bạn.
- Không chép `.mock-data/`, `.env*` hay mã nguồn lên máy chủ. Website chỉ cần nội dung của `out/`.
- Website công khai sẽ phát cả hình game. Hãy đọc mục "Lưu ý về hình ảnh và tài sản của game" trong README trước khi mở cho người ngoài. Muốn giới hạn người xem, hãy thêm `auth_basic` vào khối `server`.
- Khi có API thật, làm theo [REAL-API.md](REAL-API.md) và xóa dòng `X-Robots-Tag`. Nếu không, công cụ tìm kiếm vẫn bị chặn.
