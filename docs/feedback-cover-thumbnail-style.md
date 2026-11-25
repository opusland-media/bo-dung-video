---
name: feedback-cover-thumbnail-style
description: "Phong cách ảnh bìa/thumbnail user thích (mẫu ChatGPT 13/10/2026) — ảnh bìa kiểu tối giản/sang của Claude bị chê \"xấu\""
metadata:
  node_type: memory
  type: feedback
  originSessionId: a6823b23-a434-4014-9971-419063186c1b
  modified: 2026-10-13T12:50:45.097Z
---

Ngày 13/10/2026 user (Minh Hoàng) chê ảnh bìa dọc TikTok tôi làm cho video "The Privé hay Palm River" là xấu, rồi tự nhờ ChatGPT làm lại. Mẫu ChatGPT lưu tại `~/Desktop/PRIVE/tiktok-2-phan/` (2 file .png tên dạng uuid). Từ nay ảnh bìa và thumbnail phải theo phong cách đó:

- **Chữ:** chữ chính rất to, sans đậm (heavy), **vàng gradient kim loại có viền hoặc bóng tối**. Nằm trên **dải cọ quét (brush stroke)** màu navy hoặc vàng, có hiệu ứng lóe sáng. Từ nối kiểu "hay" viết **script trắng nghiêng**.
- **Nhãn:** "PHẦN x/2" là chữ đen trên dải cọ vàng, góc trên. Câu hỏi CTA ở đáy ảnh cũng trên dải cọ vàng hoặc navy, chữ hoa to (vd "ĐÂU LÀ LỰA CHỌN TỐT HƠN?", "AI HỢP DỰ ÁN NÀO?").
- **Người:** to, chiếm 1/2 dưới khung, cắt ngang ngực, nhìn thẳng camera.
- **Nền:** phối cảnh rực rỡ (hoàng hôn, hồ bơi, cây cọ, nhiều màu). Chia đôi 2 dự án bằng tia sáng chéo. Logo 2 dự án đặt 2 góc trên.
- **Icon:** một hàng hoặc cột icon tròn viền vàng kèm nhãn ngắn (Vị trí kết nối / Tiện ích đẳng cấp / Bàn giao / Chính sách…).
- **Tổng thể:** dày đặc, tương phản cao, "bắt mắt kiểu YouTube/TikTok BĐS". Không làm kiểu tối giản, sang, nhạt màu.

**Why:** user thấy kiểu tối giản/sang của tôi "xấu", phải nhờ ChatGPT làm.

**How to apply:** khi làm ảnh bìa/thumbnail (Remotion/HTML), dựng theo các yếu tố trên. Luôn soát chính tả tiếng Việt: bản ChatGPT ghi sai "TIỀN ÍCH / TIỀN ĐỘ", đúng phải là "TIỆN ÍCH / TIẾN ĐỘ". Dùng ảnh thật của dự án, không dùng phối cảnh AI bịa.

Liên quan: [[project-palm-river-facts]]

**Cập nhật 23/11/2026, thumbnail video talking head sổ hồng GSL đã duyệt:** `src/compositions/GSLThumbSoHong.tsx`, file ở `Desktop/GREEN SKYLINE/video chinh sach/thumbnail-so-hong.*`.
- **Nền:** dùng đúng khung video user chọn (đã chỉnh màu, có đèn), không dùng ảnh người cắt rời trên phối cảnh.
- **Giấy tờ hoặc ảnh minh họa:** đặt lớn SAU lưng người, từ vai trở lên. Người được tách nền (Apple Vision) và nằm đè lên trên.
- **Cấm** đặt thẻ ảnh hay giấy tờ cạnh mặt. User chê "không thể để sổ hồng ngay cạnh mặt".
- **Tiêu đề vàng:** đặt ngang tay, ở nửa dưới khung.
- **Không dùng huy hiệu tròn** khi khung đã đủ chi tiết. User bảo bỏ.
