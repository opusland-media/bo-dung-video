---
name: feedback-sfx-theo-mau-tiktok
description: SFX video BĐS theo mẫu kênh changquach.review — tiếng giòn khi chữ hiện, ít whoosh, âm lượng to gần bằng giọng vì user còn thêm nhạc nền
metadata:
  type: feedback
---
18/11/2026, user xem bản mở đầu video chính sách Green Skyline và góp ý: "tiếng woosh nhiều quá", "âm lượng nhỏ quá vì tôi còn làm nhạc nền nữa", "để dễ nghe như họ vậy đó".

Mẫu tham khảo là 2 video TikTok của kênh changquach.review:
- vt.tiktok.com/ZSp7HKnQQ
- video 7697544403820350726

Cách họ làm, em đo từ âm thanh của 2 video:
- **Khi chữ khoá hiện:** 1 tiếng giòn ngắn (snap/pop), dài 0,1–0,2s, tần số chính 3–5 kHz, to ngang giọng nói. Ví dụ chữ "2.4 TỶ", "6 TRIỆU", "300M".
- **Swoosh:** dài 0,5–0,9s, chỉ có ở lần chuyển cảnh lớn, khoảng 3–5s mới có một lần. Cắt hình bình thường thì không có tiếng.
- **Chữ:** sans trắng đậm có bóng, chữ khoá to, có 1 dòng nhỏ phía trên. Chữ vào bằng blur/scale, ra bằng blur.

**Why:** user còn tự thêm nhạc nền trong CapCut, nên SFX nhỏ sẽ bị chìm. Đặt whoosh ở mỗi lần cắt thì bị rối.

**How to apply:**
- Dùng bộ `public/audio/cs_cut/`:
  - `snap` khi chữ to hiện.
  - `hit` cho chữ nhấn hoặc số lớn.
  - `tick` cho nhãn nhỏ.
  - `swoosh` chỉ dùng ở whip/chuyển mục.
  - `rise` trước tên dự án.
- File SFX chuẩn hoá đỉnh −1 dB, đặt volume khoảng 0,75–0,8.
- Dùng `thinSfx` để trong 6 hình chỉ giữ 1 tiếng.
- Foley cũ thì nhân volume ×1,8.
- File tạo SFX nằm ở scratchpad `sfxgen/gen.py`, bằng numpy, không tải về.
- Bản xuất cuối nên chặn đỉnh, vì mix hiện chạm khoảng 0 dBFS.
- Chỉnh lại quy tắc "SFX nhỏ, ít" trong [[feedback-khong-giong-video-ai]]: vẫn tránh whoosh dày đặc, nhưng âm lượng phải rõ.
