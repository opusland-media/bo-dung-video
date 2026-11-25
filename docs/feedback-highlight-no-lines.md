---
name: feedback-highlight-no-lines
description: "Làm nổi bật nội thất trong video: chỉ làm sáng vật thể + quầng sáng mềm, KHÔNG vẽ đường chỉ/viền line"
metadata:
  node_type: memory
  type: feedback
  originSessionId: a6823b23-a434-4014-9971-419063186c1b
  modified: 2026-10-29T08:22:11.077Z
---

Khi giới thiệu nội thất trong video (kiểu dừng hình + làm nổi bật món đồ), chỉ làm sáng vật thể trên nền tối kèm quầng sáng mềm (drop-shadow mờ). Không vẽ đường chỉ (leader line), chấm tròn hay viền trắng sắc quanh vật thể.

**Why:** User xem bản dọc 1PN+ Green Skyline (29/10/2026) nói "làm phát sáng vật thể đc rồi chứ vẽ đường line tôi thấy xấu quá".

**How to apply:** Áp dụng cho BanGiaoVertical và mọi video highlight nội thất sau này; nhãn chữ đặt trên/dưới vật thể, không nối bằng line. Bản ngang BanGiaoTour vẫn còn line — hỏi user nếu cần sửa. Xem [[project-green-skyline-consolidation]].
