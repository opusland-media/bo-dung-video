# BỘ DỰNG VIDEO OPUS LAND (dùng chung cho team)

Bộ dựng video, thumbnail, ảnh giá, bảng tính bằng Remotion (React). Người dùng ra lệnh bằng tiếng Việt, Claude dựng, rồi chỉnh sửa theo yêu cầu.

## Luôn làm
- Trả lời bằng **tiếng Việt**, gọi người dùng là "anh/chị", xưng "em".
- **Đầu phiên làm việc, hỏi tên + số điện thoại** của người dùng (nếu chưa nói), để đưa vào sản phẩm. KHÔNG dùng tên/SĐT của Minh Hoàng (0906 827 986) cho người khác.
- Số liệu dự án, chính sách, giá: chỉ lấy từ `docs/reference-chinh-sach-du-an.md` hoặc tài liệu người dùng gửi. Không bịa. Giá luôn kèm "khoảng".
- Video quảng cáo chỉ nói lợi ích (`docs/feedback-video-chi-noi-loi-ich.md`).
- Video dọc: chữ nằm trong vùng an toàn TikTok x108–972, y150–1770 (`docs/feedback-vertical-video-framing.md`).
- Thumbnail/ảnh bìa: phong cách chữ vàng kim loại, dải cọ, nền rực (`docs/feedback-cover-thumbnail-style.md`), xuất PNG (FB/TikTok) + JPG <2MB (YouTube).
- SFX: tiếng "tách" giòn khi chữ hiện, swoosh chỉ khi chuyển lớn, âm lượng rõ (`docs/feedback-sfx-theo-mau-tiktok.md`). Bộ SFX tự tạo ở `public/audio/cs_cut/`, `public/audio/cs_foley/`.
- Giữ nguyên giọng gốc người dùng, không lọc/EQ (`docs/feedback-giu-giong-goc.md`).
- Nhạc YouTube: chỉ dùng nhạc Thư viện âm thanh YouTube (`docs/feedback-nhac-ban-quyen-youtube.md`).

## Cách làm việc
- Cài lần đầu: `npm ci`. Cần `ffmpeg`.
- Xem thử: `npx remotion still src/index.ts <Composition> outputs/x.png --scale=1`
- Xuất video: `npx remotion render src/index.ts <Composition> outputs/x.mp4` (1080p; 4K thêm `--scale=2`, chỉ khi người dùng cần).
- File đầu ra để trong `outputs/` (không commit lên git). File người dùng gửi (thu âm, ảnh) để trong `inbox/`.
- Danh sách mẫu có sẵn: `src/Root.tsx`. Mẫu Green Skyline: `src/compositions/GSL*.tsx`.
- Phong cách tham khảo: `docs/reference-phong-cach-*.md`, bộ chữ động `src/components/TitleFX.tsx`.
- Không commit mật khẩu, token, file khách hàng.

## Chạy trên đám mây (claude.ai/code)
- Chromium có sẵn ở `/opt/pw-browsers/chromium`, đã cấu hình tự dùng trong `remotion.config.ts`.
- Video ngắn 1080p xuất được (thử 25/11/2026: 10 giây video mất ~42 giây; thumbnail ~9 giây; bảng tính ~3 giây).
- File thu âm, video gốc, ảnh lớn KHÔNG có trong repo → người dùng phải gửi vào `inbox/` (hoặc link Drive) trước khi dựng.
- Trả kết quả: đọc (mở) ảnh/khung hình để người dùng xem ngay trong chat; file để người dùng tải về thì đẩy lên nhánh riêng `outputs/<tên-người>` hoặc Drive theo hướng dẫn của Minh Hoàng.
