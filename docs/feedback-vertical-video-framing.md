---
name: feedback-vertical-video-framing
description: "Video dọc TikTok: ảnh luôn full màn hình (không thu nhỏ + nền mờ trên/dưới), chữ lùi xa mép vì TikTok phóng to"
metadata:
  node_type: memory
  type: feedback
  originSessionId: a6823b23-a434-4014-9971-419063186c1b
  modified: 2026-10-29T08:34:18.577Z
---

Video dọc 9:16 phải để cảnh quay tràn full màn hình. Không thu nhỏ ảnh rồi lấp trên/dưới bằng nền mờ. Mọi chữ/nhãn phải lùi vào trong (lề ≥ ~8% mỗi cạnh, ~90px trên khung 1080 ngang, header từ y≈220) vì TikTok phóng to video lên một chút, chữ sát mép sẽ bị che.

**Why:** 29/10/2026 user xem bản dọc 1PN+ Green Skyline có nền mờ trên dưới: "thu nhỏ lại xấu lắm phải để full màn hình… khi đăng tiktok nó sẽ bị zoom to lên 1 chút… văn bản sát bìa quá nó sẽ bị che khuất".

**How to apply:** Mọi video dọc (BanGiaoVertical, SocialReel, tao-video-bao…). Muốn góc nhìn rộng thì dùng lia camera, không thu nhỏ. Liên quan [[feedback-highlight-no-lines]].

**Bổ sung 12/11/2026 (video mặt bằng Green Skyline):**
- Ảnh đồ họa phải thấy trọn (mặt bằng tổng, sơ đồ) thì đặt **toàn bộ ảnh trong vùng an toàn**, chừa ≥8% mỗi mép ngang.
- Phần còn trống lấp bằng **màu nền của chính ảnh** (vd màu giấy của mặt bằng) cho liền mạch, tràn màn hình.
- Không dùng nền đen, không để T2 hay tháp nào bị cắt.
- User nói: "tiktok nó sẽ bị zoom… chỗ mặt bằng tổng phải thấy đc toàn bộ"; trước đó chê "nền đen xấu quá, mặt bằng T2 bị mất khá nhiều".

**BẮT BUỘC từ 12/11/2026 — user nhắc nhiều lần, đã bực:**
- **Vùng an toàn cho chữ:** mọi chữ phải nằm trong x 108–972, y 150–1770 (khung 1080×1920), **kể cả chữ cỡ lớn**.
- **Lỗi đã mắc:** "GIÁ TỐT NHẤT?" 128px nowrap kéo gần sát mép. Lề MX=96 vẫn không cứu được, vì chữ to tự tràn ra.
- **Quy trình trước khi gửi bất kỳ bản video dọc nào:**
  - Composition có hook `useSafeCheck` (mẫu trong `src/compositions/GSLMatBang.tsx`): đo Range của từng text node, log `SAFE_FAIL`.
  - Render kiểm tra bằng lệnh dưới đây. Kết quả phải ra 0 dòng mới được gửi user.
    `npx remotion render src/index.ts <Comp> <scratch>/check.mp4 --scale=0.25 --props='{"safeCheck":true,...}' --log=verbose --muted | grep SAFE_FAIL`
- **Hiệu ứng:** không cho chữ hoặc thẻ trượt vào từ ngoài mép (translateX lớn). Dùng trượt dọc hoặc phóng to dần.
