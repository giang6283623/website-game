# Bản đồ tài sản hình ảnh

Tệp này được sinh bằng script từ dữ liệu có sẵn (kế hoạch tài sản, mã băm Figma, manifest của kho hình). Không sửa tay các bảng. Nếu danh sách đổi, sinh lại.

## 1. Quy tắc dùng hình

- Hình gốc nằm trong kho riêng `.private/local/game-website-assets/`. Kho này không vào Git. Khi viết code, chép các hình cần dùng sang thư mục công khai của website (ví dụ `public/assets/`).
- Quyền dùng hình chưa được xác nhận. Đọc `.private/local/game-website-assets/NOTICE.md` trước khi đưa website lên mạng. Hai nhóm `store-icons-cobranded/` và `store-icons-custom/` và ảnh `ConnectScreen.png` không dùng trong thiết kế và không được đưa vào website.
- Nếu quyền dùng bị từ chối, thay bằng hình tự làm cùng kích thước. Thiết kế không phụ thuộc vào hình cụ thể nào.
- Không dùng hình có logo hãng thật hay nhân vật của bên thứ ba.

## 2. Tổng quan

Có 60 hình được tải lên Figma (trang `40 Assets`). Trong đó 29 hình đang được dùng trên màn hình hoặc thành phần, 31 hình là kho dự phòng.

Bảng "Đang dùng ở" được quét lại từ Figma ngày 29/10/2026, sau khi vẽ đủ 24 trang. Các trang thêm ở vòng 3 (tải game, chi tiết bài viết, chi tiết vật phẩm, xếp hạng gia tộc, quản trị vật phẩm) dùng lại các hình này, không thêm hình mới.

| Nhóm | Số hình | Thư mục riêng tư | Kích thước gốc thường gặp |
| --- | --- | --- | --- |
| Vật phẩm (cửa hàng) | 41 | `store-icons/` | 512x312, 512x156, 152x152 |
| Bóng súng HUD | 3 | `hud-icons/` | 206x60, 200x64 |
| Huy hiệu gia tộc | 3 | `clan-icons/` | 256x256 |
| Icon bước | 7 | `mission-icons/` | 128x128 |
| Icon kỹ năng | 6 | `skill-icons/` | 128x128 |

## 3. Họa tiết nền (tự làm, không có vấn đề quyền)

Hai họa tiết nhỏ do dự án tự tạo. Bản PNG nằm ở `.private/local/game-website-assets/textures/`.

| Tên | Tệp | Kích thước tệp | Cách dùng | Mô tả hình học |
| --- | --- | --- | --- | --- |
| Thước dò tần số | `tex-ruler.png` | 80x28 px | Lặp ngang, hiển thị 40x14 px CSS (tỉ lệ 0,5). Dùng trong NavDial, TabBar, Footer, thanh Ticks trên đầu thẻ | Mỗi 40 px CSS có một vạch lớn ở x=0 (rộng 1 px, cao 14 px, màu `text/muted` #A29E8E) và bốn vạch nhỏ ở x=8, 16, 24, 32 (rộng 1 px, cao 6 px, nằm sát đáy, màu #6F6C60) |
| Lưới chữ thập | `tex-cross.png` | 192x192 px | Lặp hai chiều. Thẻ và khung dùng 96x96 px CSS (tỉ lệ 0,5). Nền trang lớn (Hero, PageTitle) dùng 192x192 px CSS (tỉ lệ 1) | Một dấu cộng 21x21 px ở tâm ô, màu #A29E8E. Hai cánh độ mờ khoảng 22 phần trăm, điểm giữa khoảng 39 phần trăm |

Gợi ý: tự vẽ lại bằng SVG hoặc CSS gradient thay vì tải PNG, để nét sắc ở mọi mật độ điểm ảnh. Hai họa tiết chỉ là trang trí, đặt `aria-hidden` hoặc dùng làm `background-image`.

## 4. Công thức xuất hình cho web

| Việc | Quy tắc |
| --- | --- |
| Định dạng | WebP có kênh trong suốt (lossless với icon dưới 100 KB, chất lượng 90 với hình lớn hơn). Có thể thêm AVIF. Giữ PNG làm dự phòng nếu cần |
| Kích thước | Giữ nguyên kích thước gốc, không phóng to. Đa số icon vật phẩm là 512x312. Một số súng dài là 512x156 và vài món nhỏ là 152x152. Ô vật phẩm trên máy tính hiển thị trong khung 272x160 px CSS với `object-fit: contain`, nên bản rộng 512 px là đủ cho màn hình 1,5x đến 2x. Món 152x152 sẽ hơi mềm khi phóng, chấp nhận hoặc thay hình |
| Tên tệp | Chữ thường, gạch nối, không dấu: cột "Tên tệp web gợi ý" trong bảng dưới |
| Thuộc tính ảnh | Luôn có `width` và `height` để tránh nhảy bố cục. `loading="lazy"` cho ảnh dưới màn hình đầu. `decoding="async"`. Ảnh đầu trang không lazy |
| Chữ thay thế (`alt`) | Hình vật phẩm: `alt` là tên vật phẩm. Họa tiết và hình chỉ trang trí: `alt=""` |
| Nội dung của khung chứa | Các icon cửa hàng có vùng nội dung chỉ khoảng 37 phần trăm khung 512x312. Căn giữa và dùng `object-fit: contain`. Không cắt |
| Bóng súng HUD | Trắng trên nền trong suốt. Chỉ đặt trên nền tối (bg/raised hoặc bg/inset) |
| Kỹ năng chưa mở | Dùng bản đen trắng (`BW`), không dùng bộ lọc CSS làm xám |

## 5. Danh sách hình

Cột "Mã Figma" là mã node trong trang `40 Assets`. Cột "Mã băm" là 10 ký tự đầu của mã băm ảnh trong Figma. Viết tắt: MT là bản máy tính, ĐT là bản điện thoại.

Cột "Nhóm lọc Kho đồ" khớp với số lượng trong thiết kế: VŨ KHÍ 17, GIÁP VÀ BA LÔ 5, Y TẾ VÀ ĐỒ ĂN 6, DỤNG CỤ 5, VẬT LIỆU 3, THUỐC NỔ 4, ĐẠN 1. Tổng 41. Nhóm này do dự án đặt dựa trên tên tệp, chưa đối chiếu với dữ liệu thật của game.

### Vật phẩm (cửa hàng) (41)

| # | Mã tài sản | Tên hiển thị gợi ý | Nhóm lọc Kho đồ | Tệp riêng tư | Nguồn trong client | Kích thước | Dung lượng | Mã Figma | Mã băm | Tên tệp web gợi ý | Đang dùng ở |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `store/ASR_AK74` | AK-74 | VŨ KHÍ | `store-icons/ASR_AK74.png` | `Data/Weapons/StoreIcons/ASR_AK74.dds` | 512x312 | 59.2 KB | 14:11 | `d5c5a5a492` | `items/asr-ak74.webp` | Trang chủ (MT, ĐT), Kho đồ (MT, ĐT), Chi tiết vật phẩm (MT, ĐT), Quản trị: Vật phẩm (MT, ĐT), thành phần ItemSlot |
| 2 | `store/ASR_AKM` | AKM | VŨ KHÍ | `store-icons/ASR_AKM.png` | `Data/Weapons/StoreIcons/ASR_AKM.dds` | 512x312 | 59.2 KB | 14:14 | `91dc46c83c` | `items/asr-akm.webp` | Kho đồ (MT, ĐT), Chi tiết vật phẩm (MT), Quản trị: Vật phẩm (MT, ĐT) |
| 3 | `store/ASR_FAL` | FAL | VŨ KHÍ | `store-icons/ASR_FAL.png` | `Data/Weapons/StoreIcons/ASR_FAL.dds` | 512x156 | 17.8 KB | 14:17 | `a6ba2b0a84` | `items/asr-fal.webp` | Kho đồ (MT, ĐT), Chi tiết vật phẩm (MT, ĐT), Quản trị: Vật phẩm (MT, ĐT) |
| 4 | `store/SMG_MP5A4` | MP5A4 | VŨ KHÍ | `store-icons/SMG_MP5A4.png` | `Data/Weapons/StoreIcons/SMG_MP5A4.dds` | 512x312 | 70.9 KB | 14:20 | `7f211d5198` | `items/smg-mp5a4.webp` | Kho đồ (MT, ĐT), Chi tiết vật phẩm (MT, ĐT), Quản trị: Vật phẩm (MT) |
| 5 | `store/SMG_UZI` | UZI | VŨ KHÍ | `store-icons/SMG_UZI.png` | `Data/Weapons/StoreIcons/SMG_UZI.dds` | 512x312 | 62.2 KB | 14:23 | `026728a3a8` | `items/smg-uzi.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 6 | `store/HG_Glock` | Glock | VŨ KHÍ | `store-icons/HG_Glock.png` | `Data/Weapons/StoreIcons/HG_Glock.dds` | 152x152 | 10.1 KB | 14:27 | `93eb6bf1b3` | `items/hg-glock.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 7 | `store/HG_Desert_Eagle` | Desert Eagle | VŨ KHÍ | `store-icons/HG_Desert_Eagle.png` | `Data/Weapons/StoreIcons/HG_Desert_Eagle.dds` | 512x312 | 80.2 KB | 14:30 | `904a3fd6be` | `items/hg-desert-eagle.webp` | Kho đồ (MT, ĐT), Chi tiết vật phẩm (MT, ĐT), Quản trị: Vật phẩm (MT, ĐT) |
| 8 | `store/HG_Beretta92F` | Beretta 92F | VŨ KHÍ | `store-icons/HG_Beretta92F.png` | `Data/Weapons/StoreIcons/HG_Beretta92F.dds` | 512x312 | 77.7 KB | 14:33 | `c8857e6f97` | `items/hg-beretta92f.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 9 | `store/SHG_Benelli_M1` | Benelli M1 | VŨ KHÍ | `store-icons/SHG_Benelli_M1.png` | `Data/Weapons/StoreIcons/SHG_Benelli_M1.dds` | 512x156 | 30.4 KB | 14:36 | `b7fcf76103` | `items/shg-benelli-m1.webp` | Kho đồ (MT, ĐT), Quản trị: Vật phẩm (MT, ĐT), Chi tiết vật phẩm (ĐT) |
| 10 | `store/SHG_DoubleBarrel` | Shotgun hai nòng | VŨ KHÍ | `store-icons/SHG_DoubleBarrel.png` | `Data/Weapons/StoreIcons/SHG_DoubleBarrel.dds` | 512x312 | 73 KB | 14:39 | `be3b72627a` | `items/shg-doublebarrel.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 11 | `store/MG_M249_SAW` | M249 SAW | VŨ KHÍ | `store-icons/MG_M249_SAW.png` | `Data/Weapons/StoreIcons/MG_M249_SAW.dds` | 512x312 | 61.1 KB | 14:43 | `2c09eed547` | `items/mg-m249-saw.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 12 | `store/SNP_M82` | M82 | VŨ KHÍ | `store-icons/SNP_M82.png` | `Data/Weapons/StoreIcons/SNP_M82.dds` | 512x312 | 46.7 KB | 14:46 | `a2161c2039` | `items/snp-m82.webp` | Kho đồ (MT, ĐT) |
| 13 | `store/SNP_CrossBow` | Nỏ | VŨ KHÍ | `store-icons/SNP_CrossBow.png` | `Data/Weapons/StoreIcons/SNP_CrossBow.dds` | 512x312 | 70.9 KB | 14:49 | `7a49d24ece` | `items/snp-crossbow.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 14 | `store/MEL_Hatchet` | Rìu nhỏ | VŨ KHÍ | `store-icons/MEL_Hatchet.png` | `Data/Weapons/StoreIcons/MEL_Hatchet.dds` | 512x312 | 106.7 KB | 14:52 | `9fa6611ea9` | `items/mel-hatchet.webp` | Kho đồ (MT, ĐT) |
| 15 | `store/Mel_Crowbar` | Xà beng | VŨ KHÍ | `store-icons/Mel_Crowbar.png` | `Data/Weapons/StoreIcons/Mel_Crowbar.dds` | 512x312 | 52.2 KB | 14:55 | `5fb142d0d9` | `items/mel-crowbar.webp` | Kho đồ (MT) |
| 16 | `store/Mel_FireAxe` | Rìu cứu hỏa | VŨ KHÍ | `store-icons/Mel_FireAxe.png` | `Data/Weapons/StoreIcons/Mel_FireAxe.dds` | 512x312 | 64.8 KB | 14:59 | `506801ed92` | `items/mel-fireaxe.webp` | Trang chủ (MT, ĐT) |
| 17 | `store/MEL_BaseballBat_Spikes_01` | Gậy bóng chày gắn đinh | VŨ KHÍ | `store-icons/MEL_BaseballBat_Spikes_01.png` | `Data/Weapons/StoreIcons/MEL_BaseballBat_Spikes_01.dds` | 512x312 | 74.3 KB | 14:62 | `6d7846fbd9` | `items/mel-baseballbat-spikes-01.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 18 | `store/ARMOR_Light_Forest` | Áo giáp nhẹ (rừng) | GIÁP VÀ BA LÔ | `store-icons/ARMOR_Light_Forest.png` | `Data/Weapons/StoreIcons/ARMOR_Light_Forest.dds` | 512x312 | 77 KB | 14:65 | `ea2c4aefa3` | `items/armor-light-forest.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 19 | `store/Armor_MTV_01_Forest` | Áo giáp MTV (rừng) | GIÁP VÀ BA LÔ | `store-icons/Armor_MTV_01_Forest.png` | `Data/Weapons/StoreIcons/Armor_MTV_01_Forest.dds` | 512x312 | 55.3 KB | 14:68 | `143cbed08c` | `items/armor-mtv-01-forest.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 20 | `store/Gear_Backpack_8slots` | Ba lô 8 ô | GIÁP VÀ BA LÔ | `store-icons/Gear_Backpack_8slots.png` | `Data/Weapons/StoreIcons/Gear_Backpack_8slots.dds` | 512x312 | 85.7 KB | 14:71 | `14528d9809` | `items/gear-backpack-8slots.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 21 | `store/Gear_Backpack_16slots` | Ba lô 16 ô | GIÁP VÀ BA LÔ | `store-icons/Gear_Backpack_16slots.png` | `Data/Weapons/StoreIcons/Gear_Backpack_16slots.dds` | 512x312 | 79.3 KB | 14:75 | `820dcd8929` | `items/gear-backpack-16slots.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 22 | `store/Gear_Backpack_32slots` | Ba lô 32 ô | GIÁP VÀ BA LÔ | `store-icons/Gear_Backpack_32slots.png` | `Data/Weapons/StoreIcons/Gear_Backpack_32slots.dds` | 512x312 | 90.4 KB | 14:78 | `1c7ff32abc` | `items/gear-backpack-32slots.webp` | Trang chủ (MT, ĐT), Đăng nhập (MT, ĐT), Đăng ký (MT, ĐT), Quên mật khẩu (MT, ĐT), Đặt lại mật khẩu (MT, ĐT) |
| 23 | `store/Item_Bandage_Improvised` | Băng gạc tự chế | Y TẾ VÀ ĐỒ ĂN | `store-icons/Item_Bandage_Improvised.png` | `Data/Weapons/StoreIcons/Item_Bandage_Improvised.dds` | 512x312 | 104.2 KB | 14:81 | `3f1e9595ca` | `items/item-bandage-improvised.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 24 | `store/Item_Binocular` | Ống nhòm | DỤNG CỤ | `store-icons/Item_Binocular.png` | `Data/Weapons/StoreIcons/Item_Binocular.dds` | 512x312 | 97.6 KB | 14:84 | `0d6ba64584` | `items/item-binocular.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 25 | `store/item_compass` | La bàn | DỤNG CỤ | `store-icons/item_compass.png` | `Data/Weapons/StoreIcons/item_compass.dds` | 512x312 | 67.6 KB | 14:87 | `fbc4b1c993` | `items/item-compass.webp` | Trang chủ (MT, ĐT), Đăng nhập (MT, ĐT), Đăng ký (MT, ĐT), Trạng thái danh sách (MT), Quên mật khẩu (MT, ĐT), Đặt lại mật khẩu (MT, ĐT), thành phần ListState |
| 26 | `store/Item_BlowTorch_01` | Đèn khò | DỤNG CỤ | `store-icons/Item_BlowTorch_01.png` | `Data/Weapons/StoreIcons/Item_BlowTorch_01.dds` | 512x312 | 24.7 KB | 14:91 | `896d32af13` | `items/item-blowtorch-01.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 27 | `store/Item_Barricade_BarbWire` | Rào dây thép gai | DỤNG CỤ | `store-icons/Item_Barricade_BarbWire.png` | `Data/Weapons/StoreIcons/Item_Barricade_BarbWire.dds` | 512x312 | 100.7 KB | 14:94 | `6abf45b416` | `items/item-barricade-barbwire.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 28 | `store/item_barricade_Sandbag` | Bao cát | DỤNG CỤ | `store-icons/item_barricade_Sandbag.png` | `Data/Weapons/StoreIcons/item_barricade_Sandbag.dds` | 512x312 | 132.1 KB | 14:97 | `840af97913` | `items/item-barricade-sandbag.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 29 | `store/Consumables_Bag_MRE_01` | Khẩu phần ăn MRE | Y TẾ VÀ ĐỒ ĂN | `store-icons/Consumables_Bag_MRE_01.png` | `Data/Weapons/StoreIcons/Consumables_Bag_MRE_01.dds` | 512x312 | 99.7 KB | 14:100 | `93302a2e60` | `items/consumables-bag-mre-01.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 30 | `store/consumables_can_pasta_01` | Đồ hộp mì | Y TẾ VÀ ĐỒ ĂN | `store-icons/consumables_can_pasta_01.png` | `Data/Weapons/StoreIcons/consumables_can_pasta_01.dds` | 512x312 | 59 KB | 14:103 | `ee49378150` | `items/consumables-can-pasta-01.webp` | Trang chủ (MT, ĐT), Đăng nhập (MT), Đăng ký (MT), Quên mật khẩu (MT), Đặt lại mật khẩu (MT) |
| 31 | `store/Consumables_water_L_01` | Nước uống (bình lớn) | Y TẾ VÀ ĐỒ ĂN | `store-icons/Consumables_water_L_01.png` | `Data/Weapons/StoreIcons/Consumables_water_L_01.dds` | 512x312 | 26.7 KB | 14:107 | `f68a928095` | `items/consumables-water-l-01.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 32 | `store/Consumables_PainKiller_01` | Thuốc giảm đau | Y TẾ VÀ ĐỒ ĂN | `store-icons/Consumables_PainKiller_01.png` | `Data/Weapons/StoreIcons/Consumables_PainKiller_01.dds` | 512x312 | 39 KB | 14:110 | `a384bb5c10` | `items/consumables-painkiller-01.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 33 | `store/Consumables_Med_01` | Bộ y tế | Y TẾ VÀ ĐỒ ĂN | `store-icons/Consumables_Med_01.png` | `Data/Weapons/StoreIcons/Consumables_Med_01.dds` | 512x312 | 39.1 KB | 14:113 | `86b74f4934` | `items/consumables-med-01.webp` | Trang chủ (MT, ĐT), Đăng nhập (MT, ĐT), Đăng ký (MT, ĐT), Quên mật khẩu (MT, ĐT), Đặt lại mật khẩu (MT, ĐT) |
| 34 | `store/Craft_DuckTape_01` | Băng keo | VẬT LIỆU | `store-icons/Craft_DuckTape_01.png` | `Data/Weapons/StoreIcons/Craft_DuckTape_01.dds` | 512x312 | 81.9 KB | 14:116 | `7ad25744cd` | `items/craft-ducktape-01.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 35 | `store/Craft_MetalScrap_01` | Sắt vụn | VẬT LIỆU | `store-icons/Craft_MetalScrap_01.png` | `Data/Weapons/StoreIcons/Craft_MetalScrap_01.dds` | 512x312 | 93.4 KB | 14:119 | `e658f92a4a` | `items/craft-metalscrap-01.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 36 | `store/Craft_Nails_01` | Đinh | VẬT LIỆU | `store-icons/Craft_Nails_01.png` | `Data/Weapons/StoreIcons/Craft_Nails_01.dds` | 512x312 | 83.6 KB | 14:123 | `33b4063f15` | `items/craft-nails-01.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 37 | `store/EXP_M67` | Lựu đạn M67 | THUỐC NỔ | `store-icons/EXP_M67.png` | `Data/Weapons/StoreIcons/EXP_M67.dds` | 512x312 | 71.6 KB | 14:126 | `533a2da5c6` | `items/exp-m67.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 38 | `store/EXP_Flare` | Pháo sáng | THUỐC NỔ | `store-icons/EXP_Flare.png` | `Data/Weapons/StoreIcons/EXP_Flare.dds` | 512x312 | 60.1 KB | 14:129 | `2b18c62ab5` | `items/exp-flare.webp` | bài nổi bật. Tin tức (MT, ĐT), Chi tiết bài viết (MT, ĐT) |
| 39 | `store/EXP_FlashBang` | Lựu đạn chớp sáng | THUỐC NỔ | `store-icons/EXP_FlashBang.png` | `Data/Weapons/StoreIcons/EXP_FlashBang.dds` | 512x312 | 48.6 KB | 14:132 | `6f9e5a106d` | `items/exp-flashbang.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 40 | `store/EXP_Claymore` | Mìn Claymore | THUỐC NỔ | `store-icons/EXP_Claymore.png` | `Data/Weapons/StoreIcons/EXP_Claymore.dds` | 512x312 | 67.1 KB | 14:135 | `4698c295dc` | `items/exp-claymore.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 41 | `store/Ammo_Box_01_762x51` | Hộp đạn 7,62x51 | ĐẠN | `store-icons/Ammo_Box_01_762x51.png` | `Data/Weapons/StoreIcons/Ammo_Box_01_762x51.dds` | 512x312 | 116.8 KB | 14:139 | `5fad6e2c38` | `items/ammo-box-01-762x51.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |

### Bóng súng HUD (3)

| # | Mã tài sản | Tên hiển thị gợi ý | Tệp riêng tư | Nguồn trong client | Kích thước | Dung lượng | Mã Figma | Mã băm | Tên tệp web gợi ý | Đang dùng ở |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 42 | `hud/ASR_AK74` | AK-74 | `hud-icons/ASR_AK74.png` | `Data/Weapons/HudIcons/ASR_AK74.dds` | 206x60 | 3 KB | 14:147 | `c5963ff7c6` | `hud/asr-ak74.webp` | Kho đồ (MT), Hồ sơ (MT, ĐT), Chi tiết vật phẩm (MT) |
| 43 | `hud/SNP_M82` | M82 | `hud-icons/SNP_M82.png` | `Data/Weapons/HudIcons/SNP_M82.dds` | 200x64 | 3.3 KB | 14:150 | `5905bd7090` | `hud/snp-m82.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 44 | `hud/HG_Beretta92F` | Beretta 92F | `hud-icons/HG_Beretta92F.png` | `Data/Weapons/HudIcons/HG_Beretta92F.dds` | 206x60 | 2.4 KB | 14:153 | `1865d0ffa9` | `hud/hg-beretta92f.webp` | Hồ sơ (MT, ĐT) |

### Huy hiệu gia tộc (3)

| # | Mã tài sản | Tên hiển thị gợi ý | Tệp riêng tư | Nguồn trong client | Kích thước | Dung lượng | Mã Figma | Mã băm | Tên tệp web gợi ý | Đang dùng ở |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 45 | `clan/clan_bandit` | Huy hiệu bandit | `clan-icons/clan_bandit.png` | `Data/Menu/clanIcons/clan_bandit.dds` | 256x256 | 72 KB | 14:161 | `7a5692ac71` | `clans/clan-bandit.webp` | Trang chủ (MT, ĐT), Xếp hạng (MT, ĐT), Xếp hạng gia tộc (MT, ĐT) |
| 46 | `clan/clan_lawman` | Huy hiệu lawman | `clan-icons/clan_lawman.png` | `Data/Menu/clanIcons/clan_lawman.dds` | 256x256 | 76.8 KB | 14:164 | `f8f3fe903b` | `clans/clan-lawman.webp` | Trang chủ (MT, ĐT), Xếp hạng (MT, ĐT), Xếp hạng gia tộc (MT, ĐT) |
| 47 | `clan/clan_survivor` | Huy hiệu survivor | `clan-icons/clan_survivor.png` | `Data/Menu/clanIcons/clan_survivor.dds` | 256x256 | 64.3 KB | 14:167 | `41ba05a049` | `clans/clan-survivor.webp` | 7 màn hình: Trang chủ, Xếp hạng, Hồ sơ, Đổi mật khẩu, Tạo nhân vật, Xếp hạng gia tộc, Đầu trang đã đăng nhập, thành phần RankRow, UserChip, HeaderUser, HeaderMobileUser |

### Icon bước (7)

| # | Mã tài sản | Tên hiển thị gợi ý | Tệp riêng tư | Nguồn trong client | Kích thước | Dung lượng | Mã Figma | Mã băm | Tên tệp web gợi ý | Đang dùng ở |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 48 | `mission/Collect` | Icon nhiệm vụ: nhặt | `mission-icons/Collect.png` | `Data/Weapons/Mission_Icons/Collect.png` | 128x128 | 66.9 KB | 14:175 | `4224f316af` | `steps/collect.webp` | bước 2 trong Ba bước. Trang chủ (MT, ĐT), Tải game (MT, ĐT) |
| 49 | `mission/Drop` | Icon nhiệm vụ: thả | `mission-icons/Drop.png` | `Data/Weapons/Mission_Icons/Drop.png` | 128x128 | 66.9 KB | 14:178 | `af148a9352` | `steps/drop.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 50 | `mission/GoTo` | Icon nhiệm vụ: đi tới | `mission-icons/GoTo.png` | `Data/Weapons/Mission_Icons/GoTo.png` | 128x128 | 66.9 KB | 14:181 | `dc44252f1a` | `steps/goto.webp` | bước 3 trong Ba bước. Trang chủ (MT, ĐT), Tải game (MT, ĐT) |
| 51 | `mission/Kill` | Icon nhiệm vụ: tiêu diệt | `mission-icons/Kill.png` | `Data/Weapons/Mission_Icons/Kill.png` | 128x128 | 66.9 KB | 14:184 | `ad9e743e3d` | `steps/kill.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 52 | `mission/Off` | Icon nhiệm vụ: tắt | `mission-icons/Off.png` | `Data/Weapons/Mission_Icons/Off.png` | 128x128 | 66.9 KB | 14:187 | `470f0631cd` | `steps/off.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 53 | `mission/On` | Icon nhiệm vụ: bật | `mission-icons/On.png` | `Data/Weapons/Mission_Icons/On.png` | 128x128 | 66.9 KB | 14:190 | `0fea418875` | `steps/on.webp` | Chưa dùng trên màn hình (kho dự phòng, có trong trang Assets) |
| 54 | `mission/Use` | Icon nhiệm vụ: dùng | `mission-icons/Use.png` | `Data/Weapons/Mission_Icons/Use.png` | 128x128 | 66.9 KB | 14:193 | `7c594f8826` | `steps/use.webp` | bước 1 trong Ba bước. Trang chủ (MT, ĐT), Tải game (MT, ĐT) |

### Icon kỹ năng (6)

| # | Mã tài sản | Tên hiển thị gợi ý | Tệp riêng tư | Nguồn trong client | Kích thước | Dung lượng | Mã Figma | Mã băm | Tên tệp web gợi ý | Đang dùng ở |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 55 | `skill/Skill0` | Kỹ năng Thể lực (màu) | `skill-icons/Skill0.png` | `Data/Menu/skillIcons/Skill0.dds` | 128x128 | 21.7 KB | 14:201 | `7d49e15c5b` | `skills/skill0.webp` | kỹ năng đã mở. Hồ sơ (MT, ĐT) |
| 56 | `skill/Skill2` | Kỹ năng Bắn súng (màu) | `skill-icons/Skill2.png` | `Data/Menu/skillIcons/Skill2.dds` | 128x128 | 21.5 KB | 14:204 | `0b5b7d2cf6` | `skills/skill2.webp` | kỹ năng đã mở. Hồ sơ (MT, ĐT) |
| 57 | `skill/Skill6` | Kỹ năng Sinh tồn (màu) | `skill-icons/Skill6.png` | `Data/Menu/skillIcons/Skill6.dds` | 128x128 | 21.7 KB | 14:207 | `7089a54212` | `skills/skill6.webp` | kỹ năng đã mở. Hồ sơ (MT, ĐT) |
| 58 | `skill/Skill2BW` | Kỹ năng Y tế (đen trắng) | `skill-icons/Skill2BW.png` | `Data/Menu/skillIcons/Skill2BW.dds` | 128x128 | 21.9 KB | 14:210 | `ed01de50d1` | `skills/skill2bw.webp` | kỹ năng chưa mở. Hồ sơ (MT, ĐT) |
| 59 | `skill/Skill4BW` | Kỹ năng Chế tạo (đen trắng) | `skill-icons/Skill4BW.png` | `Data/Menu/skillIcons/Skill4BW.dds` | 128x128 | 21 KB | 14:213 | `c939e7eda7` | `skills/skill4bw.webp` | kỹ năng chưa mở. Hồ sơ (MT, ĐT) |
| 60 | `skill/Skill7BW` | Kỹ năng Cận chiến (đen trắng) | `skill-icons/Skill7BW.png` | `Data/Menu/skillIcons/Skill7BW.dds` | 128x128 | 21.9 KB | 14:216 | `84bb680e8a` | `skills/skill7bw.webp` | kỹ năng chưa mở. Hồ sơ (MT, ĐT) |

## 6. Việc cần làm khi code

1. Chọn nơi lưu hình trên website (thư mục tĩnh hoặc kho lưu trữ đối tượng) và chép các hình đang dùng.
2. Viết một script xuất hàng loạt: đọc danh sách trong tệp này, đổi PNG sang WebP, ghi tên tệp theo cột gợi ý, ghi `width` và `height` vào một tệp dữ liệu để thành phần ảnh đọc.
3. Kiểm tra quyền dùng hình trước khi công khai (xem mục Câu hỏi mở trong PRD).
4. Dữ liệu vật phẩm thật cần cột `imageKey` trỏ tới tên tệp web. Xem `ROUTES-AND-DATA.md`, bảng `Item`.
