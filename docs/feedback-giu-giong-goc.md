---
name: feedback-giu-giong-goc
description: Khi ghép giọng thu âm của user vào video, dùng giọng GỐC, không lọc ồn, EQ hay nén; kiểm tra điểm cắt không làm cụt chữ cuối
metadata:
  type: feedback
---
Giọng thu âm của user ghép nguyên bản. Không áp lọc ồn (afftdn), EQ, compressor, de-clip lên giọng. Chỉ được phép:
- cắt bỏ đoạn đọc lặp, rút ngắn khoảng lặng dài;
- chỉnh độ lớn bằng gain thuần (volume) và loudnorm chế độ linear cho cả bản mix.

Mỗi điểm cắt phải đo mức âm (rms) quanh điểm cắt và đặt vào chỗ lặng thật. Mốc thời gian của Whisper hay lệch khoảng 0,3–0,5 giây ở cuối câu, nên dễ cụt chữ cuối (vd "mét vuông").

**Why:** ngày 07/11/2026, ở video bảng tính căn 2PN T2.07.13, user nói "lấy giọng gốc đi đừng chỉnh giọng tôi". Câu "68,31 m²" bị cắt cụt vì điểm cắt dựa trên mốc Whisper.

**How to apply:** áp dụng cho mọi video có giọng user thu riêng. Liên quan: [[feedback-video-render-normalize]]
