---
name: feedback-gia-can-image-style
description: "Quy trình + phong cách làm ảnh \"mặt bằng căn + bảng giá\" kiểu Salepro (Vinhomes Green Paradise, Pearl Bay...) cho các dự án sau"
metadata:
  node_type: memory
  type: feedback
  originSessionId: fa3d8a63-9c2c-4618-9811-a56b0b2b4421
  modified: 2026-10-02T10:06:42.654Z
---

Khi user đưa ảnh mặt bằng căn (Salepro.com) + phiếu tính giá và yêu cầu "làm giá lên ảnh" cho dự án mới, làm theo phong cách đã chốt ngày 02/10/2026 (căn VT47A-27 Vinhomes Green Paradise; ảnh tham chiếu thứ hai là Pearl Bay NT8A-45 với "GIÁ FULL: 22.192 tỷ" chữ vàng gradient nằm ngay trong khối thông tin căn).

**Why:** user bán BĐS, gửi ảnh qua Zalo/Facebook, xem trên điện thoại. Bản đầu quá dài, nhiều chữ → user yêu cầu bỏ tiến độ, thêm đơn vị, rồi chốt bản "đơn giản, không sáng tạo thêm".

**How to apply:**
- **Giữ nguyên ảnh gốc**, chỉ chèn một dải giá ngay dưới khung mã căn + thông tin căn (tách ảnh ở khoảng trống giữa khung thông tin và sơ đồ, nối dải bằng cách kéo giãn 1 hàng pixel của nền để liền mạch). Không thêm nhãn giá lên sơ đồ, không thêm bảng tiến độ, không thêm khối ghi chú dài.
- **4 ô giá** một hàng: Tổng giá trị BĐS · Thanh toán sớm (tô vàng, nổi bật) · Thanh toán chuẩn (= "Theo tiến độ" trong phiếu) · Vay hỗ trợ lãi suất 18 tháng. Mỗi ô CHỈ gồm nhãn xanh mint 21px + giá vàng 62px + "tỷ" 32px — user đã yêu cầu BỎ dòng chú thích nhỏ dưới giá và thu nhỏ số (bản chốt 02/10/2026); ô cao 168px, dải chèn 200px (ảnh 1600×2200).
- **Luôn có đơn vị** ("38,83 tỷ", "−742,5 triệu"), dấu thập phân là dấu phẩy, làm tròn 2 chữ số.
- **Màu theo ảnh gốc của từng dự án** (Green Paradise = xanh ngọc đậm + vàng; Pearl Bay = teal + vàng): lấy màu nền từ ảnh, chữ giá vàng #ffd36b/#f0b429, nhãn mint #8ff0c4.
- Số liệu phải đối chiếu lại với phiếu tính giá; "Tổng giá trị" = đã gồm VAT + KPBT. Mốc quy ước: Thanh toán sớm = giá đã trừ chiết khấu 0,5% BLNH + dòng tiền; HTLS 18T = phụ phí +3,5%.
- Muốn bản vuông 1:1 cho điện thoại thì dùng `square-card.html` (1080×1080, render ở scale 2): hero giá lớn + 6 phương án dạng dòng, ảnh cắt vị trí căn.
- Đầu ra: JPG (nhẹ, gửi Zalo) + PNG vào `/Users/hoangle/Downloads/`, gửi bằng SendUserFile.

**Công cụ:** template đầy đủ ở `~/.claude/projects/-Users-CLAUDE/memory/gia-can-template/` (`price-strip.html` = bản 4 ô chuẩn, `square-card.html`, `fonts.css` + `fonts/` Be Vietnam Pro đã tải local, `render.sh file.html out.png [scale]` dùng Chrome headless đo `data-h`). Phải chép ra thư mục làm việc rồi sửa đường dẫn ảnh nền (`base3.png`) — ảnh nền được tạo bằng PIL: cắt ảnh gốc tại y≈407 (trước bản đồ), chèn 200px dải kéo giãn từ hàng pixel y=407. Với dự án khác phải tự tìm đúng điểm tách bằng cách xem ảnh.
