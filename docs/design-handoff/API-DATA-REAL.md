# API và data thực tế của ISSVN

Tài liệu này ghi lại những gì **đã kiểm chứng được** về hệ thống API và dữ liệu của Infestation Việt Nam, từ ba nguồn: client game trên máy, trang web đang chạy `MOCKAPI`, và repo website mới. Mục đích là làm căn cứ để chọn cách gọi API an toàn cho website mới.

Ngày khảo sát: 29-10-2026. Mọi kết luận dưới đây đều kèm bằng chứng. Chỗ nào chưa chứng minh được thì ghi rõ UNVERIFIED.

## 1. Tóm tắt cho người không code

Hệ thống hiện tại có **hai backend tách rời**, không phải một:

1. **Backend game** chạy trên `x.x.x.x`, dùng IIS 8.5 và ASP.NET. Đây là nơi giữ tài khoản game, nhân vật, vật phẩm, clan, xếp hạng. API là các tệp `api_*.aspx`. Định dạng trả về là **XML nén gzip**, không phải JSON.
2. **Backend web** chạy trên `MOCKAPI`, dùng PHP CodeIgniter sau Cloudflare. Đây là nơi có trang đăng nhập, hồ sơ, cửa hàng, nạp thẻ, giftcode. **Không có API JSON công khai.** Mọi thứ là form HTML gửi thẳng lên máy chủ.

Ba điều quan trọng nhất cho website mới:

- **Không thể gọi API game trực tiếp từ trình duyệt.** Máy chủ game không trả header CORS, chứng chỉ TLS không hợp lệ công khai, và nội dung là gzip XML chứ không phải JSON. Trình duyệt sẽ chặn.
- **Tài khoản web và tài khoản game không chắc là một.** Đăng nhập web bằng tài khoản test thành công, nhưng cùng bộ thông tin đó gọi `api_Login.aspx` trả về `WO_00 0 0` giống hệt khi nhập sai mật khẩu, nên không thể xác nhận.
- **Endpoint `api_GetItemsInfo.aspx` cho phép đọc toàn bộ danh mục vật phẩm mà không cần đăng nhập.** Đây là lỗ hổng đang tồn tại, và cũng là nguồn dữ liệu duy nhất hiện có thể dùng công khai một cách hợp pháp.

## 2. Bản đồ hai backend

| Thuộc tính | Backend game | Backend web |
| --- | --- | --- |
| Tên miền | `x.x.x.x` (địa chỉ IP, không có tên miền) | `MOCKAPI` |
| Máy chủ | Microsoft IIS 8.5, `X-Powered-By: ASP.NET` | Cloudflare phía trước, gốc là PHP CodeIgniter |
| Ngôn ngữ | ASP.NET (C#), thư viện HTTP Chilkat | PHP |
| Định dạng | XML nén gzip, tiền tố 2 byte `$1` | HTML do máy chủ dựng sẵn |
| Xác thực | Tham số `s_id` và `s_key` trong body POST | Cookie phiên `ci_session` |
| TLS | Chứng chỉ tự ký hoặc CA nội bộ. Cho phép TLS 1.0, 1.1, 1.2. Không hỗ trợ TLS 1.3 | Chứng chỉ hợp lệ qua Cloudflare. Chỉ HTTPS |
| HTTP thường | Có phục vụ nội dung qua HTTP cổng 80, không chuyển hướng | Không |
| CORS | Không có header `Access-Control-*` | Không áp dụng, mọi thứ same-origin |

Bằng chứng TLS: `curl -k --tlsv1.0`, `--tlsv1.1`, `--tlsv1.2` đều trả HTTP 200. `--tlsv1.3` trả mã 000 (không kết nối được). `curl` không có `-k` báo `SSL certificate problem: unable to get local issuer certificate`.

Bằng chứng CORS: gửi `Origin: https://evil.example` tới `api_GetItemsInfo.aspx` không nhận lại header `Access-Control-Allow-Origin` nào.

## 3. API backend game: danh sách đầy đủ

Đường dẫn gốc: `/infestation/api/` trên host `x.x.x.x`. Biến toàn cục trong client tên `g_api_ip`.

Phương thức: **POST**, mã hóa `application/x-www-form-urlencoded`. Client dùng thư viện Chilkat với User-Agent `Chilkat/1.0.0`.

### 3.1 Nhóm công khai (đã kiểm chứng, không cần đăng nhập)

| Endpoint | Trả về | Đã kiểm chứng |
| --- | --- | --- |
| `api_GetItemsInfo.aspx` | Toàn bộ danh mục vật phẩm dạng XML gzip | Có. Body chỉ cần `x=1`, không cần session |
| `api_GetShop2.aspx` | Blob nhị phân độc quyền bắt đầu `WO_0SHO1`, nén gzip | Có. Không cần session, nhưng không đọc được bằng mắt |
| `api_GetDataGameRewards.aspx` | XML thưởng, hiện trả về rỗng `<rewards></rewards>` | Có. Không cần session |

Cấu trúc `api_GetItemsInfo.aspx` sau khi giải nén, dài 9.205 byte:

```xml
<?xml version="1.0"?>
<items>
  <gears>    <!-- 62 phần tử <g ID="..." lv=".." wg=".." dp=".." dm=".."/> -->
  <weapons>  <!-- 96 phần tử <w ID="..." lv=".." d1=".." d2=".." rf=".." sp=".." rc=".."/> -->
  <generics></generics>
  <packages></packages>
</items>
```

Ý nghĩa các trường theo suy ra từ tên và giá trị:

- `g` = gear (trang bị). `ID` mã vật phẩm. `lv` cấp yêu cầu. `wg` khối lượng. `dp` độ bền. `dm` độ bền tối đa.
- `w` = weapon (vũ khí). `d1` sát thương. `d2` tầm bắn. `rf` tốc độ bắn. `sp` tốc độ di chuyển khi cầm. `rc` độ giật.
- `generics` và `packages` hiện rỗng.

Lưu ý: danh mục này **không có tên vật phẩm**, chỉ có mã số và thông số. Tên hiển thị nằm trong gói dữ liệu game `WZ_*.bin`, không lấy qua API.

### 3.2 Nhóm cần session

Tất cả endpoint sau trả `WO_5no parameter s_id` khi thiếu session, và `WO_6 ` khi có `s_id`/`s_key` nhưng sai.

| Endpoint | Chức năng | Trường đã chứng minh |
| --- | --- | --- |
| `api_Login.aspx` | Đăng nhập | Xem mục 4 |
| `api_LoginSessionPoller.aspx` | Giữ phiên, client gọi lặp | `LoginAuth: %d` |
| `api_GetProfile1.aspx` | Hồ sơ, nhân vật, túi đồ | Xem mục 5 |
| `api_LeaderboardGet.aspx` | Bảng xếp hạng | `TableID`, `leaderboard` |
| `api_ServersMgr.aspx` | Thuê máy chủ riêng, danh sách server | `func`, `mapID`, `regionID`, `slotID`, `GSID`, `ServerName`, `AdminKey` |
| `api_ClanCreate.aspx` | Tạo clan | `func=create`, `CharID`, `ClanName`, `ClanTag`, `ClanEmblemID`, `ClanLore` |
| `api_ClanGetInfo.aspx` | Thông tin clan | `info`, `GetMembers` |
| `api_ClanMgr.aspx` | Quản lý clan | `func` = `leave`, `setrank`, `setlore`, `gpclan`, `gpmember`, `buyslot` |
| `api_ClanInvites.aspx` | Lời mời clan | `send`, `answer`, `Gamertag`, `InviteID` |
| `api_ClanApply.aspx` | Xin vào clan | `apply`, `ApplID` |
| `api_ClanGetStatus.aspx` | Thông báo clan | Trả `cldata`, `clinvites`, `clapps` |
| `api_CharSlots.aspx` | Thao tác nhân vật | `skin`, `rename`, `delete`, `revcheck`, `revive` |
| `api_CharBackpack.aspx` | Túi đồ | `InventoryID`, `GridFrom`, `GridTo`, `quantity` |
| `api_Skills.aspx` | Học kỹ năng | `learn`, `SkillID`, `SkillLevel` |
| `api_GetShop2.aspx` | Cửa hàng trong game | Trả blob `blinf` |
| `api_BuyItem3.aspx` | Mua vật phẩm | Mã vật phẩm và số lượng |
| `api_BuyPremiumPlan.aspx` | Mua VIP | Gói 3 ngày giá 500, gói 30 ngày giá 3000 |
| `api_PremiumTime.aspx` | Đồng bộ thời gian VIP | `VIP time sync failed: %d` |
| `api_MysteryBox.aspx` | Mở hộp quà | `func`, `ItemID`, `BuyIdx` |
| `api_GPConvert.aspx` | Đổi GP | `func=rates`, `convert`, `Rate` |
| `api_GetGPTransactions.aspx` | Lịch sử GP | Trả `gplog`, `balance` |
| `api_SteamBuyGP.aspx` | Mua GP qua Steam | `auth`, `steamId`, `country`, `price`, `orderId` |
| `api_AccApplyKey.aspx` | Kích hoạt serial | `serial` |
| `api_ReportHWInfo.aspx` | Báo cáo cấu hình máy | Nhận `s_id` |

### 3.3 Nhóm chỉ có trong launcher

| Endpoint | Chức năng | Trường |
| --- | --- | --- |
| `api_AccCheckKey.aspx` | Kiểm tra serial trước khi đăng nhập | `email`, `serial`. **Rò rỉ lỗi SQL, xem mục 8** |
| `api_SteamLogin.aspx` | Đăng nhập bằng Steam | `ticket` |
| `api_ReportHWInfo.aspx` | Khảo sát máy | `s_id` |

### 3.4 Anticheat

`http://x.x.x.x/infestation/api_Anticheat.php` dùng **HTTP thường, không có TLS**. Đây là endpoint duy nhất dùng PHP, tách khỏi nhóm ASP.NET.

Client gửi multipart với các trường `upload_file`, `filename`, `submit`, và các tệp `screen.jpeg` (ảnh chụp màn hình) và `dlls.txt` (danh sách thư viện đang nạp). Tên bản ghi theo mẫu `Cheat_CustomerID_%d_Date_%02d%02d%02d_Time_%02d%02d%02d`.

Trong binary có một chuỗi bí mật nhúng cạnh cụm anticheat này. Không ghi giá trị vào tài liệu. Cần coi là đã lộ và phải thu hồi.

### 3.5 Updater và manifest (công khai, không cần đăng nhập)

| Đường dẫn | Trả về | Nội dung thực tế ngày 29-10-2026 |
| --- | --- | --- |
| `http://x.x.x.x/infestation/data/wz.xml` | Manifest dữ liệu game | `<p><d ver="169672992" base=".../data/wz0A0C0407" inc=".../data/wz0A1D0120"/></p>` |
| `http://x.x.x.x/infestation/updater/wzupd.xml` | Manifest tự cập nhật launcher | `<p><u url=".../InfestationLauncher.exe_5.17.exe" crc="1555945230" ver="5.17" size="8436224"/></p>` |
| `https://x.x.x.x/infestation/updater/api_getserverinfo.xml` | Tin tức và trạng thái server | Xem bên dưới |
| `http://x.x.x.x/infestation/updater/` | Danh sách thư mục | HTTP 403, bị chặn đúng cách |

Nội dung `api_getserverinfo.xml` đầy đủ:

```xml
<info>
  <news>
    <news name="Infestation VN Xin Chao Cac Chien Binh" url="https://www.facebook.com/groups/infestationsmmovietnam" date=""/>
    <news name="Open Offcial 13/10/2026" url="https://www.facebook.com/groups/infestationsmmovietnam" date="13.10.2026"/>
    <news name="Su Kien Hallowen Keo Dai Tu 21-10-2026 Den 01-11-2026" url="https://www.facebook.com/groups/infestationsmmovietnam" date="21.10.2026"/>
  </news>
  <SurveyIn link="https://infestation.vn/"/>
  <SurveyOut link=""/>
  <ServerInfo status="ONLINE"/>
</info>
```

Đây là **nguồn trạng thái server duy nhất đọc được công khai**, và nó chỉ có một trường `status` với giá trị `ONLINE`. Không có số người online, không có danh sách server.

## 4. Luồng đăng nhập của client game

### 4.1 Tham số bắt buộc, đúng thứ tự

Máy chủ kiểm tra lần lượt và báo tên tham số còn thiếu. Thứ tự đã kiểm chứng bằng cách gửi dần từng tham số:

1. `username`
2. `password`
3. `computerid`
4. `Identifier`
5. `mac`
6. `ComputerName`

Thiếu tham số nào thì trả `WO_5no parameter <tên>` với HTTP 200. Đủ sáu tham số thì trả chuỗi cố định 9 byte: `WO_00 0 0`.

Tham số tùy chọn có trong launcher: `ticket`, `Lockinventory`, `hardwareid`, `email`.

### 4.2 Điều bất thường quan trọng nhất

`api_Login.aspx` trả **cùng một chuỗi `WO_00 0 0`** cho cả ba trường hợp sau, đã kiểm chứng:

- Mật khẩu đúng của tài khoản test (giá trị không ghi trong tài liệu)
- Mật khẩu sai: `definitelywrong999`
- Tài khoản không tồn tại: `zzz-nonexistent-9182@example.com`
- Tên đăng nhập và mật khẩu đều rỗng

Cũng thử với mật khẩu băm MD5 và SHA1, đều cho cùng kết quả. Không có trường hợp nào trả khác.

Nghĩa là: qua API này **không thể xác nhận được đăng nhập thành công hay thất bại**, và cũng không có nghĩa tài khoản web dùng được cho game. Client game thật gửi thêm dữ liệu trong `ticket` (do launcher truyền qua dòng lệnh `-WOLogin`), nên khả năng cao có một lớp xác thực thứ hai chưa lộ ra.

Kết luận thực tế: **không dùng `api_Login.aspx` để đăng nhập cho website.**

### 4.3 Sau đăng nhập

Theo chuỗi trong binary, client nhận `CustomerID` và `SessionID`, lưu `LoginToken` vào registry tại khóa `Software\Arktos Entertainment Group\WarZ`, rồi gọi `api_LoginSessionPoller.aspx` định kỳ để giữ phiên. Mất phiên thì mọi lệnh gọi khác trả `WO_API: session disconnected`.

Phiên truyền đi qua hai tham số `s_id` và `s_key` trong body POST.

## 5. Dữ liệu hồ sơ từ `api_GetProfile1.aspx`

Chưa lấy được dữ liệu thật vì cần `s_id`/`s_key` hợp lệ. Cấu trúc dưới đây lấy từ tên trường trong binary, tại cụm mã nguồn `.\Sources\GameCode\UserProfile.cpp`.

```
api_GetProfile1 response
├── CustomerID
├── DataDirty
├── AccountStatus
├── AccountType
├── GamePoints          (GP)
├── GameDollars         (GD)
├── IsDeveloper
├── TimePlayed
├── PremiumLeft
├── ResWood, ResStone, ResMetal
├── time
├── inventory
├── backpacks
└── chars[]
    ├── CharID, Gamertag, Name, LoadoutID
    ├── Alive, Hardcore, Health, Hunger, Toxic
    ├── Reputation, DeathTime, SecToRevive
    ├── GameMapId, GameServerId, GamePos, GameFlags
    ├── HeroItemID, HeadIdx, BodyIdx, LegsIdx
    ├── ClanRank
    ├── Skills, BackpackID, BackpackSize
    ├── recipes, stats, medsys, blinf
    └── attm1, attm2
```

Trường `ResWood` (gỗ), `ResStone` (đá), `ResMetal` (kim loại) không có tương ứng nào trong thiết kế website mới.

## 6. Trang web `MOCKAPI`: những gì thật sự chạy được

### 6.1 Đăng nhập

Form POST tới chính `/ide/login`, hai trường `prependedUsername` và `prependedPassword`. Không có trường ẩn CSRF, không có captcha, không có mã thông báo.

Ba kiểu phản hồi, đã kiểm chứng:

| Trường hợp | HTTP | Body | Header |
| --- | --- | --- | --- |
| Thành công | 200 | **Rỗng, 0 byte** | `Refresh: 0;url=https://MOCKAPI/` |
| Sai thông tin | 200 | HTML đầy đủ có script `toastr.error(...)` | Không có `Refresh` |
| Email sai cú pháp | 200 | HTML có `toastr.error("Nhập không đúng cú pháp E-mail, độ dài ký tự từ 5-15")` | Không có `Refresh` |

Không có mã 302. Thành công hay thất bại đều là HTTP 200, phải đọc body và header mới phân biệt được.

Mật khẩu thật của tài khoản test viết hoa chữ cái đầu (`N...`), không phải viết thường toàn bộ. Giá trị đầy đủ không ghi vào tài liệu này vì tệp nằm trong git. Đáng chú ý: trang đăng nhập **phân biệt chữ hoa chữ thường** nhưng thông báo lỗi lại ghi chung chung, nên rất dễ tưởng là sai mật khẩu.

### 6.2 Các đường dẫn đã xác nhận

Công khai, trả dữ liệu thật:

| Đường dẫn | Nội dung |
| --- | --- |
| `/` | Trang chủ, có dòng `Chơi Miễn Phí - Trực Tuyến: 36` (số người online thật) |
| `/ranking?b=...&q=...&p=...` | Bảng xếp hạng, 50 dòng mỗi trang, tổng 353 người chơi |
| `/ide/login`, `/ide/login/en` | Form đăng nhập, hai ngôn ngữ |
| `/ide/register` | Form đăng ký với `email`, `usrname`, `password1`, `password2` |
| `/ide/forgotpassword` | Form quên mật khẩu với `prependedUsername` |
| `/announcement/category/cap-nhat`, `/announcement/category/huong-dan` | Danh sách tin |

Công khai nhưng **trả rỗng**, phải có phiên mới xem được:

| Đường dẫn | Hành vi |
| --- | --- |
| `/announcement`, `/announcement/download`, `/ide` | HTTP 200, body 0 byte, kèm `Refresh: 0;url=.../ide/login` |

Bắt buộc đăng nhập, đã xem được với phiên thật:

| Đường dẫn | Nội dung |
| --- | --- |
| `/profile` | Hồ sơ: email, tên hiển thị, ngày tham gia, loại tài khoản VIP và số ngày còn lại, thông tin cá nhân |
| `/profile/changepwd` | Đổi mật khẩu: `presentPass`, `prependedPassword`, `confirmprependedPassword`, `txtCaptcha` |
| `/ide/security_code` | Ảnh captcha JPEG cho form đổi mật khẩu |
| `/store` | Cửa hàng, có số dư GC và Dollar |
| `/topup` | Nạp thẻ cào: `choose`, `amount`, `Seri`, `Pinz` |
| `/giftcode` | Nhập mã quà tặng: `ivb` |
| `/trade` | Giao dịch Dollar, hiện đang đóng |
| `/clan-challenge` | Khiêu chiến gia tộc |
| `/ide/logout` | Đăng xuất, chỉ cần GET |

Đường dẫn không tồn tại trả về trang 404 với HTTP 200. Ví dụ `/ide/dashboard`, `/ide/profile`, `/account` đều là 404 nhưng mã trạng thái vẫn 200. Đây là lỗi thiết kế, không phải trang thật.

### 6.3 Dữ liệu thật lấy được từ tài khoản test

Từ `/profile`:

- Email: che một phần bằng cơ chế bảo vệ email của Cloudflare
- Tên hiển thị: rỗng, hiện là `Chưa Đặt Tên`
- Ngày tham gia: `13-10-2026 21:16:38`
- Loại tài khoản: `VIP`, còn 17 ngày
- Thời gian đã chơi: 2 ngày 4 giờ 15 phút 26 giây
- Link Facebook, họ tên, giới tính, tuổi, số điện thoại, địa chỉ: đều `Chưa Cập Nhật`

Từ `/store`:

- Số dư: **20 GC**, **2.485 Dollar**
- Ba mặt hàng đang bán, mã deal 20, 11, 21: Air horn 500 GC (giảm từ 1.000, đã bán 4), Personal locker 750 GC, Spidermen 3.500 GC
- Flash sale có đồng hồ đếm ngược, hết hạn tại Unix timestamp `1793552340`

Từ `/ranking` khi đã đăng nhập, khối "Hạng Của Tôi": hạng `#281`, tên nhân vật `BaotranXyynh`, GameDollar `$2,485`.

Đáng chú ý: tên nhân vật hiện trong xếp hạng là **BaotranXyynh**, khác với tên hiển thị web đang rỗng. Số Dollar 2.485 khớp giữa hai nơi, nên dữ liệu ví là dùng chung giữa web và game.

### 6.4 Bảng xếp hạng: tham số và dữ liệu

Tham số truy vấn, đã kiểm chứng từng giá trị:

| Tham số | Giá trị hợp lệ | Ghi chú |
| --- | --- | --- |
| `b` | `gd`, `xp`, `time`, `zombie`, `survivor`, `killbandit`, `hero`, `bandits` | `gd` là mặc định |
| `q` | chuỗi tìm kiếm | Tìm theo tên người chơi |
| `p` | số trang, từ 1 | **Tên là `p`, không phải `page`**. `?page=2` trả về trang 1 |

Mỗi trang 50 dòng, tổng 353 người chơi, 8 trang. Cột hiển thị thay đổi theo bảng: bảng `gd` có Hạng, Người Chơi, Gia Tộc, GameDollar, XP. Bảng `hero` và `bandits` có thêm Danh Tiếng, Zombie, Survivor.

Toàn bộ là HTML dựng sẵn. Không có JSON.

### 6.5 Frontend của trang cũ

Quét toàn bộ JavaScript trong `/assets/js/`: **không có lệnh AJAX nào tới API của chính trang**. Chỉ có hai chỗ:

- `main.js` gọi Mailchimp tại `list-manage.com` cho form newsletter, nhưng form này không xuất hiện trên trang nào đã kiểm tra.
- `contact-form-script.js` gọi tương đối `assets/php/form-process.php`, nhưng không form liên hệ nào được nối vào.

Kết luận: trang cũ **không có API JSON nào để tái sử dụng**. Mọi thứ là form HTML gửi thẳng lên máy chủ PHP.

## 7. Vấn đề bảo mật đã xác nhận trên hệ thống đang chạy

Đây là quan sát, không phải khuyến nghị tấn công. Mỗi mục đều có bằng chứng kiểm chứng được.

### 7.1 Nghiêm trọng

| Vấn đề | Bằng chứng | Ảnh hưởng |
| --- | --- | --- |
| Danh mục vật phẩm đọc được không cần đăng nhập | POST `api_GetItemsInfo.aspx` với body `x=1` trả về 62 trang bị và 96 vũ khí | Lộ toàn bộ thông số cân bằng game. Đây cũng là dữ liệu duy nhất dùng được cho website |
| Đăng xuất bằng GET, không có CSRF | `GET /ide/logout` với `Referer: https://evil.example/` trả 302 và phiên bị hủy ngay | Kẻ tấn công chèn một thẻ ảnh là đăng xuất được người dùng |
| Rò rỉ lỗi SQL nội bộ | `api_AccCheckKey.aspx` với `email` và `serial` trả `WO_5SQL Select Failed: Database 'BreezeNet' does not exist` | Lộ tên cơ sở dữ liệu và lộ việc API đang lỗi cấu hình |
| Phiên không đổi sau khi đăng nhập | So sánh giá trị `ci_session` trước và sau khi đăng nhập: giống hệt nhau, cùng 32 ký tự | Mở đường cho tấn công cố định phiên (session fixation) |

### 7.2 Trung bình

| Vấn đề | Bằng chứng |
| --- | --- |
| Không có giới hạn số lần đăng nhập | Sáu lần sai liên tiếp không bị chặn, không captcha, lần đăng nhập đúng ngay sau đó vẫn thành công |
| Không có CSRF token ở mọi form đã kiểm tra | Form đăng nhập, đăng ký, quên mật khẩu, đổi mật khẩu, giftcode, nạp thẻ đều không có trường ẩn chống CSRF. Riêng đổi mật khẩu có captcha |
| Cookie phiên thiếu cờ `Secure` | `ci_session` chỉ có `HttpOnly` và `SameSite=Lax`, không có `Secure` |
| Thiếu HSTS và CSP | Không có `Strict-Transport-Security`, không có `Content-Security-Policy`, không có `Permissions-Policy` |
| Anticheat chạy trên HTTP thường | `http://x.x.x.x/infestation/api_Anticheat.php` không có TLS |
| Máy chủ game cho phép TLS 1.0 và 1.1 | Đã thử, cả hai đều bắt tay thành công |
| Chứng chỉ TLS không hợp lệ công khai | `curl` không có `-k` báo `unable to get local issuer certificate` |
| Trang không tồn tại trả HTTP 200 | `/ide/dashboard` trả trang 404 với mã 200 |

### 7.3 Ghi chú

Email trong trang hồ sơ được Cloudflare che bằng cơ chế `email-protection`, nhưng đây chỉ là che khỏi bot quét, không phải bảo vệ thật. Chuỗi `data-cfemail` giải mã được dễ dàng.

Trong binary client có một chuỗi bí mật nhúng gần cụm anticheat. Giá trị không ghi vào tài liệu này. Cần coi như đã lộ.

## 8. So sánh với hợp đồng API của website mới

Website mới đang định nghĩa 17 endpoint công khai và 16 endpoint quản trị, tất cả dưới `/api/v1`, trả JSON, xác thực bằng cookie với header `X-CSRF-Token`. Xem `src/api/endpoints.ts` và `src/api/admin-endpoints.ts`.

Không có endpoint nào trong hợp đồng mới khớp trực tiếp với backend cũ. Bảng dưới đây chỉ ra chỗ lệch:

| Website mới cần | Backend cũ có | Khoảng cách |
| --- | --- | --- |
| `GET /server/status` → `online`, `playersOnline`, `updatedAt` | `api_getserverinfo.xml` chỉ có `status="ONLINE"` | Thiếu số người online. May là trang chủ cũ có hiển thị `Trực Tuyến: 36`, nhưng phải đọc HTML mới lấy được |
| `GET /ranking?bang=gamedollar\|xp\|gia-toc` | `api_LeaderboardGet.aspx` cần `s_id`/`s_key`, hoặc HTML `/ranking` | Tên bảng khác nhau. Bảng `gia-toc` không có endpoint tương ứng |
| `GET /me` → `emailMasked`, `role`, `stats.gameDollar` | `/profile` HTML có email che, loại tài khoản, VIP | Không có `role`, không có `xp`, không có `level`. Số Dollar phải đọc từ `/store` hoặc `/ranking` |
| `GET /me/characters` | `api_GetProfile1.aspx` có `chars[]` | Cần `s_id`/`s_key`, không lấy được từ web |
| `GET /items`, `GET /items/{slug}` | `api_GetItemsInfo.aspx` có ID và thông số | Thiếu tên, thiếu mô tả, thiếu hình, thiếu slug. Phải tự xây kho vật phẩm riêng |
| `GET /news`, `GET /news/{slug}` | `/announcement` HTML | Không có JSON, phải đọc HTML hoặc tự nhập nội dung |
| `GET /download` | `wz.xml`, `wzupd.xml` | Có phiên bản và link, nhưng link trỏ tới IP trần, HTTP thường |
| `POST /auth/login` | Form POST `/ide/login` | Trả HTML chứ không trả JSON. Không có CSRF token để dùng |
| `POST /auth/logout` | `GET /ide/logout` | Đăng xuất bằng GET |

Điểm thuận lợi: số Dollar khớp giữa `/store`, `/ranking` và tên nhân vật trong game, nên dữ liệu ví ít nhất là nhất quán trong nội bộ hệ thống cũ.

## 9. Hướng an toàn để gọi API

### 9.1 Nguyên tắc

Ba điều bắt buộc, không thương lượng:

1. **Máy chủ website gọi backend cũ, không phải trình duyệt.** Người dùng chỉ nói chuyện với `/api/v1` của website. Mọi lệnh gọi sang `x.x.x.x` hay `MOCKAPI` do máy chủ thực hiện.
2. **Không đưa `s_id` và `s_key` của game xuống trình duyệt.** Nếu phải dùng API game, chỉ dùng trong tiến trình máy chủ, lưu trong bộ nhớ có thời hạn.
3. **Không dùng mật khẩu người dùng để gọi API game.** Vì `api_Login.aspx` không phân biệt đúng sai, không có cách nào biết đăng nhập game thành công, và không nên lưu mật khẩu game.

### 9.2 Bốn phương án

| Phương án | Cách làm | Chi phí | Rủi ro | Khuyến nghị |
| --- | --- | --- | --- | --- |
| A. Chỉ đọc dữ liệu công khai, phần còn lại dùng API giả | Chỉ lấy `api_getserverinfo.xml` cho trạng thái server và `api_GetItemsInfo.aspx` cho danh mục vật phẩm. Tự nhập tin tức, tự xây kho vật phẩm. Đăng nhập, hồ sơ, xếp hạng tạm dùng dữ liệu mẫu | Thấp | Website chưa có tài khoản thật | **Có, nên làm trước** |
| B. Proxy đọc HTML của trang cũ | Máy chủ tải `/ranking`, `/profile`, `/store` rồi bóc dữ liệu ra JSON | Trung bình | Vỡ mỗi lần trang cũ đổi giao diện. Không có cam kết ổn định. Phải xử lý phiên | Chỉ khi cần số liệu thật gấp |
| C. Đề nghị đội game mở API JSON riêng | Yêu cầu một endpoint mới trả JSON cho website, xác thực bằng token riêng | Trung bình, phụ thuộc bên thứ ba | Không tự quyết được. Chờ đợi | **Đúng về dài hạn, cần đề xuất sớm** |
| D. Gọi thẳng API game từ trình duyệt | Bỏ qua proxy, để trình duyệt POST tới `x.x.x.x` | Thấp | Không chạy được: không có CORS, chứng chỉ hỏng, dữ liệu XML nén. Nếu có vá bằng cách tắt kiểm tra chứng chỉ thì thành lỗ hổng nghiêm trọng | **Không làm** |

Khuyến nghị: làm A ngay để website chạy được, đề xuất C song song, dự phòng B ở mức tối thiểu. Không bao giờ làm D.

### 9.3 Nếu chọn A, các bước cụ thể

1. Viết một adapter phía máy chủ, chỉ đọc ba endpoint công khai: `api_getserverinfo.xml`, `api_GetItemsInfo.aspx`, `wz.xml`.
2. Với `api_getserverinfo.xml`: dùng HTTPS với kiểm tra chứng chỉ tắt có kiểm soát, hoặc pin chứng chỉ. Ghi rõ lý do trong mã.
3. Với `api_GetItemsInfo.aspx`: nhớ cắt 2 byte đầu `$1` trước khi giải nén gzip. Có bộ nhớ đệm vì danh mục ít đổi.
4. Giới hạn thời gian chờ 8 giây cho mọi lệnh gọi, khớp với `REQUEST_TIMEOUT_MS` trong `src/api/client.ts`.
5. Không bao giờ gọi `api_Anticheat.php`, `api_AccCheckKey.aspx`, `api_Login.aspx` từ website.
6. Ghi rõ trong tài liệu nội bộ rằng danh mục vật phẩm lấy từ endpoint công khai chỉ có ID và thông số, không có tên. Tên phải tự nhập và tự chịu trách nhiệm bản quyền.

### 9.4 Những gì phải làm ở phía website mới

Độc lập với backend cũ, các điểm sau đã có sẵn trong mã và cần giữ:

- `withCredentials: true` và header `X-CSRF-Token` đã có trong `src/api/client.ts`.
- Kiểm tra quyền quản trị phải ở máy chủ, không chỉ ở `AdminGate`. Hiện API giả đã kiểm tra, nhưng API thật phải làm giống.
- Thời gian chờ 8 giây đã đặt, phù hợp với backend cũ chậm.
- Mọi phản hồi phải qua Zod. Backend cũ trả XML nên adapter phải chuyển sang JSON đúng schema trước khi trả về trình duyệt.

### 9.5 Đã triển khai: tầng đọc nguồn game

Phương án A đã có mã trong repo. Ba tệp mới, chỉ chạy ở máy chủ:

| Tệp | Việc nó làm |
| --- | --- |
| `src/api/source/game-source.ts` | Gọi ba endpoint công khai, cắt tiền tố `$1`, giải nén gzip, đọc XML, giới hạn thời gian 8 giây |
| `src/api/source/map.ts` | Đổi dữ liệu thô sang hình dạng hợp đồng `/api/v1`. Nhãn tiếng Việt nằm ở đây |
| `src/api/source/handler.ts` | Dựng phản hồi JSON, bộ nhớ đệm, và che chi tiết lỗi của máy chủ game |

Ba đường dẫn mới, chỉ đọc:

| Đường dẫn | Trả về |
| --- | --- |
| `GET /api/v1/server/status` | `{ online, playersOnline, updatedAt }`, đúng `serverStatusSchema` có sẵn |
| `GET /api/v1/source/items-catalog` | 158 vật phẩm (62 trang bị, 96 vũ khí) với `gameItemId`, `group`, `typeLabel`, `statLine`, `stats` |
| `GET /api/v1/source/manifests` | `{ game: { version, baseUrl, incrementalUrl }, launcher: { version, url, size, crc } }` |

Bật bằng biến môi trường khi chạy máy chủ thử:

```sh
API_SOURCE=game bun run serve
```

Hai điểm cần biết khi vận hành:

- Máy chủ game chỉ đọc được qua **HTTP cổng 80**. Bun không bắt tay TLS được với máy chủ đó (lỗi `KEY_USAGE_BIT_INCORRECT` khi tắt kiểm tra chứng chỉ). Vì vậy `GAME_ORIGIN` mặc định là `http://x.x.x.x`. Dữ liệu này chỉ đọc và không có bí mật, nhưng nếu cần chống sửa nội dung trên đường truyền thì phải đặt một reverse proxy có TLS hợp lệ ở giữa.
- Phần còn lại của `/api/v1` (tài khoản, tin tức, xếp hạng, quản trị) **chưa có máy chủ thật** và vẫn dùng API giả. Đây là giới hạn có chủ ý của phương án A.

Kiểm thử: `tests/source.test.ts` có 13 bài, không gọi mạng, thay `fetch` bằng dữ liệu dựng sẵn.

## 10. Việc chưa làm được và cần quyết

| Việc | Vì sao chưa làm | Cần gì |
| --- | --- | --- |
| Lấy dữ liệu thật từ `api_GetProfile1.aspx` | Cần `s_id`/`s_key` hợp lệ, chỉ có sau khi đăng nhập game thật | Chạy client game một lần và bắt lưu lượng, hoặc đề nghị đội game cấp |
| Xác nhận tài khoản web và tài khoản game là một | `api_Login.aspx` trả cùng kết quả cho mọi trường hợp | Xác nhận với đội vận hành game |
| Danh sách server từ `api_ServersMgr.aspx` | Cần session | Như trên |
| Nội dung đầy đủ của `api_GetShop2.aspx` | Blob nhị phân độc quyền, không có định dạng công khai | Cần tài liệu từ đội game |
| Ý nghĩa các mã `ANS_*` và `WO_*` | Chỉ tìm thấy `ANS_Unactive` và `ANS_Processing` trong binary | Cần tài liệu hoặc bắt lưu lượng |
| Tên và mô tả vật phẩm | Không có trong bất kỳ API nào, nằm trong `WZ_*.bin` | Phải trích xuất từ gói dữ liệu game, cần xác nhận quyền |

## 11. Phụ lục: cách tái lập

Toàn bộ kết quả trên tái lập được bằng các lệnh sau. Chỗ có `<host>` là `x.x.x.x`, chỗ có `<tài khoản>` là tài khoản test.

Đọc danh mục vật phẩm công khai:

```sh
curl -k -X POST -d "x=1" \
  https://x.x.x.x/infestation/api/api_GetItemsInfo.aspx \
  | tail -c +3 | gunzip
```

Đọc trạng thái server công khai:

```sh
curl -k https://x.x.x.x/infestation/updater/api_getserverinfo.xml
```

Dò tham số bắt buộc của `api_Login.aspx`:

```sh
curl -k -X POST -d "username=a@b.co" -d "password=x" \
  https://x.x.x.x/infestation/api/api_Login.aspx
# trả: WO_5no parameter computerid
```

Đăng nhập web và giữ phiên:

```sh
curl -c jar.txt -b jar.txt https://MOCKAPI/ide/login
curl -c jar.txt -b jar.txt -e https://MOCKAPI/ide/login \
  --data-urlencode "prependedUsername=<email>" \
  --data-urlencode "prependedPassword=<mật khẩu>" \
  https://MOCKAPI/ide/login -D -
# thành công: body rỗng, header Refresh: 0;url=https://MOCKAPI/
```

Đọc bảng xếp hạng công khai, trang 2:

```sh
curl "https://MOCKAPI/ranking?b=gd&p=2"
```

Kiểm tra máy chủ còn sống:

```sh
curl -b jar.txt -o /dev/null -D - https://MOCKAPI/profile
# còn phiên: khoảng 30 KB, không có Refresh
# hết phiên: 0 byte, có Refresh: 0;url=.../ide/login?required
```

Đọc qua tầng adapter của website (chạy máy chủ thử trước):

```sh
API_SOURCE=game bun run serve
curl -s http://127.0.0.1:4173/api/v1/server/status
curl -s http://127.0.0.1:4173/api/v1/source/manifests
curl -s http://127.0.0.1:4173/api/v1/source/items-catalog | head -c 400
```

## 12. Bảng thuật ngữ

- **Backend game** - máy chủ ASP.NET trên `x.x.x.x` giữ tài khoản game, nhân vật, vật phẩm. Tránh dùng: server game, API game (khi nói về máy chủ).
- **Backend web** - máy chủ PHP trên `MOCKAPI` phục vụ trang web, hồ sơ, cửa hàng. Tránh dùng: site cũ, portal.
- **`s_id` và `s_key`** - cặp tham số phiên của backend game, gửi trong body POST. Tránh dùng: token game, session id game.
- **`ci_session`** - cookie phiên của backend web. Tránh dùng: cookie đăng nhập.
- **GC** - tiền tệ mua bằng tiền thật trong cửa hàng. **Dollar** (GD) - tiền tệ kiếm trong game. Hai loại khác nhau, không đổi lẫn.
- **UNVERIFIED** - chưa chứng minh được, khác với "đã kiểm tra và thấy sai".
