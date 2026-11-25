---
name: reference-phong-cach-mo-dau
description: Gói phong cách mở đầu video BĐS user thích (6 reel Pinterest + reel template chữ CapCut, 15/11/2026) — font, cách chữ xuất hiện, màu, chuyển cảnh, SFX; dùng để gợi ý user chọn khi làm video
metadata:
  type: reference
---
Nguồn (15/11/2026):
- 6 reel Pinterest: pin.it/SQMDMjbqQ, 5clXk9Ela, 4PT2ljYRJ, 5RSYWQw1c, 3ZCh2MDxN, 3zIVCWWeT. Đều là video giới thiệu nhà ở Miami/Florida, có 1 video tiếng Tây Ban Nha.
- 1 reel template chữ CapCut của HC Film.
User nói: "học hết đi để sau này làm video cho tôi".

## Điểm chung của 6 mở đầu Pinterest
- **0–5s:** câu hook của lời thoại được cắt thành từng cụm 1–3 từ, mỗi cụm là một "thẻ chữ" hiện **đúng lúc nói**. Ví dụ: "Imagine / owning / THE MIAMI SKYLINE / for under / $4,500,000".
- **Bố cục chữ:**
  - Từ nối nhỏ (sans 400–500), từ khoá rất to (900), xếp 2–3 tầng lệch nhau.
  - Chữ đặt ở nửa trên hoặc giữa khung.
  - Môi giới **đi bộ tới camera** (gimbal, góc rộng, thấp), nên **đầu người che một phần chữ**: chữ nằm sau người.
- **Vào – ra:**
  - Vào bằng blur + phóng nhẹ → nét, hoặc từng chữ cái so le, hoặc quét lộ (wipe).
  - Ra bằng mờ + blur nhanh 6–8 frame. Câu sau hiện ngay tại chỗ.
- **Màu chữ:** chủ đạo trắng. Chữ khoá lấy màu từ cảnh (đỏ đô, navy, nâu espresso, cam san hô) và hay **hoà texture cảnh vào chữ** (blend overlay/multiply), nên chữ trông như "in" lên cảnh.
- **Khoảng 5–6s:** cắt sang flycam, FPV bay xuyên nhà, hoặc cận nội thất.
- **Chuyển cảnh:**
  - Whip-pan nhòe chuyển động.
  - Speed ramp.
  - FPV xuyên cửa.
  - Đổi trời ngày → hoàng hôn → đêm trong ~0,5s.
  - Chèn nhanh cảnh đen trắng có chữ màu.
- **Âm thanh:** dẫn bằng lời thoại, nhạc cinematic nhỏ, tiếng whoosh/swoosh ở mỗi lần cắt, riser trước cảnh reveal. Đây là suy ra từ các đỉnh năng lượng âm thanh trùng nhịp cắt, chưa nghe trực tiếp.

## 7 gói phong cách (đặt tên để user chọn)
1. **"Bảng hiệu đỏ"** (p1):
   - Chữ hẹp in hoa: Oswald 700, trắng + đỏ đô.
   - Số khoá rất to màu đỏ, chữ nhỏ trên và dưới (in under / **60** / DAYS).
   - Chữ 3D dựng trên mái nhà.
   - Kết hook bằng "Và đây là cách tụi mình làm" rồi FPV vào nhà.
2. **"Texture & đen trắng"** (p2):
   - Sans đen đậm Montserrat 900, kèm script bút lông nhỏ chồng lên.
   - Chữ khoá tô bằng texture cảnh.
   - Cảnh chèn đen trắng + chữ màu đỏ san hô.
   - Phụ đề hiện từng từ một.
3. **"Tối giản Apple"** (p3):
   - Inter/SF: chữ mảnh nhỏ + chữ đậm vừa, 3 tầng ở giữa, bóng mềm.
   - Gạch nhấn màu xanh lá dưới từ khoá.
   - Chuyển trời ngày→đêm, FPV lượn.
   - Người nói trước camera.
4. **"Chữ rộng skyline"** (p4):
   - Chữ siêu rộng Unbounded 900 in hoa + script "THE".
   - Chữ hoà texture navy hoặc xám đậm.
   - Giá **chạy số tăng dần** tới con số cuối.
   - Flycam skyline, đổi tông ngày/đêm.
5. **"Nghiêng espresso"** (p5):
   - Inter đậm nghiêng chữ thường to + chữ nhỏ thường.
   - Tông nâu espresso, đỏ đô.
   - Chữ khổng lồ "THIS" hoà texture nằm sau người.
   - Flycam kéo lùi, FPV nội thất.
6. **"San hô sang trọng"** (p6):
   - Inter đậm nghiêng.
   - Giá và địa danh tô gradient cam → hồng tím (KCOL.coral).
   - Chữ nối "in" rất nhỏ.
   - Whip-pan sang du thuyền/flycam, đi xuyên cửa.
7. **"Template chữ CapCut"** (HC Film), xem [[reference-titlefx-chu-dong]]:
   - Dòng dẫn mảnh + chữ khoá gradient + script viết tay.
   - Số bật lên kèm lấp lánh.
   - Nền tối, hợp chèn chữ nhấn giữa video.

## Công cụ đã có trong repo
- `src/components/TitleFX.tsx`:
  - `KWord`: chữ kinetic, anim blur/letters/wipe/drop, có `blend` để hoà vào cảnh, có `italic`.
  - `F2`: font inter / interI / condensed (Oswald) / wide (Unbounded).
  - `KCOL`: wine, coral, navy, espresso.
  - 5 mẫu T*: các mẫu CapCut.
- **Chữ sau người:** cần clip người đã tách nền (webm alpha), như `video/op1105/person_top.webm` trong `GSLOpening1105.tsx`. Với clip mới thì phải tách nền. Công cụ tách nền cho video (RVM) cần **tải model, phải xin phép user**.
- **Chữ 3D bám vào nhà (p1):** Remotion không có camera tracking, chỉ làm gần đúng bằng keyframe perspective.
- Demo đã có: `TitleFXDemo`, `KineticOpenDemo` (bản nháp, chưa chốt).

**How to apply:** xem [[feedback-goi-y-phong-cach]].
