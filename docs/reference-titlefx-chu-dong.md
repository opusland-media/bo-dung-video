---
name: reference-titlefx-chu-dong
description: Bộ tiêu đề động TitleFX (học từ reel template chữ CapCut BĐS 15/11/2026) — font, hiệu ứng, SFX, file nằm ở src/components/TitleFX.tsx
metadata:
  type: reference
---
Ngày 15/11/2026, user gửi reel quảng cáo "55 template chữ CapCut" của HC Film (facebook.com/share/r/1KGjEReofZ) và nhờ học font, hiệu ứng, SFX. Em đã dựng lại thành bộ component Remotion **`src/components/TitleFX.tsx`**. Demo: composition `TitleFXDemo`, file `Desktop/mau-hieu-ung-chu-BDS.mp4`.

**Công thức chữ:** 3 tầng chữ trên 1 cụm.
- Dòng dẫn nhỏ, sans mảnh: Lexend 300.
- Chữ khoá to, sans đen đậm: Montserrat 800/900. Có gradient và bóng đổ, kèm vệt sáng quét qua (glint).
- Chữ script viết tay đặt chồng lệch: Great Vibes / Alex Brush.
- Biến thể serif đậm: Playfair Display 800.

**Bảng màu gradient** (hằng `GRAD`):
- gold: vàng
- fire: đỏ → cam, dùng cho số tiền
- sky: xanh dương, cho "xa hoa"
- lime: xanh chanh, cho script
- white

**Hiệu ứng:**
- `In`: mờ → rõ, blur → nét, trượt ngắn.
- `Write`: script lộ dần trái → phải như đang viết tay.
- `Pop`: số to bật scale có overshoot nhẹ.
- `Sparkles`: hạt lấp lánh.
- Chữ vào lần lượt từng chữ/dòng, mỗi nhịp cách nhau 6–8 frame.

**5 mẫu dựng sẵn:**
- `TLuxeStack`: kiểu "Nghỉ dưỡng Chuẩn / THƯỢNG LƯU" + icon.
- `TBigNumber`: kiểu "Chỉ từ / 47 / Triệu/m² / Full nội thất".
- `TScriptBold`: kiểu "view / HỒ BƠI".
- `TSerifScript`: kiểu "Đánh Thức / Mọi Giác Quan".
- `TStair`: bậc thang "Chỉ đóng / trước 10% / tới khi NHẬN NHÀ".

**SFX** (file trong `public/audio/`):
- `sfx_whoosh` khi chữ khoá vào.
- `sfx_swish` khi chữ lao ngang vào.
- `sfx_impact` khi số to bật.
- `sfx_chime` khi có lấp lánh hoặc icon.
- Video mẫu: mỗi lần chữ khoá vào đều có một tiếng whoosh/shimmer ngắn đè lên nhạc nền.

**How to apply:**
- Dùng các mẫu này cho chữ nhấn trong video BĐS: giá, %, tiện ích, CTA.
- Vẫn giữ vùng an toàn TikTok ([[feedback-vertical-video-framing]]).
- Video nào user tự thêm SFX/nhạc trong CapCut thì truyền `sfx={false}`.
- Không sao chép nhạc hay SFX từ video mẫu, vì là nội dung có bản quyền.
