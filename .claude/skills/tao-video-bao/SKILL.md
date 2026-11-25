---
name: tao-video-bao
description: Tạo video TikTok/Reels 1080×1920 từ link bài báo. Tự động scrape nội dung, viết kịch bản 4 cảnh, đợi user ghi giọng, sync phụ đề theo silencedetect, render MP4 hoàn chỉnh.
---

## HỆ THỐNG

- **Project:** `./`
- **Composition:** `NewsStyle` (1080×1920, 30fps)
- **File chính:** `src/compositions/NewsStyleVideo.tsx` — sửa `NEWS_SCENES` và `<Audio src>`
- **Ảnh:** `public/images/`
- **Audio:** `public/audio/`
- **Output:** `out/[slug].mp4`

---

## QUY TRÌNH ĐẦY ĐỦ

### BƯỚC 1 — Scrape bài báo

```python
import urllib.request, re

url = "<URL_BÀI_BÁO>"
req = urllib.request.Request(url, headers={
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept-Language": "vi-VN,vi;q=0.9",
})
html = urllib.request.urlopen(req, timeout=15).read().decode("utf-8")

# Lấy ảnh (ưu tiên data-src cho lazy-load)
imgs = re.findall(r'data-src="(https://[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"', html, re.IGNORECASE)
imgs += re.findall(r'src="(https://[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"', html, re.IGNORECASE)
imgs = list(dict.fromkeys(imgs))  # dedup, giữ thứ tự

# Lấy tiêu đề
titles = re.findall(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)

# Lấy đoạn văn body (>60 ký tự)
paras = re.findall(r'<p[^>]*>(.*?)</p>', html, re.DOTALL)
body  = [re.sub(r'<[^>]+>', '', p).strip() for p in paras if len(re.sub(r'<[^>]+>', '', p).strip()) > 60]
```

Lọc ảnh theo domain của báo (cafeland, vnexpress, tuoitre, v.v.). Lấy **4 ảnh đầu** liên quan đến bài.

### BƯỚC 2 — Tải ảnh về

```python
headers = {
    "User-Agent": "Mozilla/5.0 ...",
    "Referer": "<domain_bao>/",
}
# Lưu vào: ./public/images/[slug]-1.jpg ...
```

Đặt tên file: `[slug]-1.jpg`, `[slug]-2.jpg`, `[slug]-3.jpg`, `[slug]-4.jpg`  
Nếu không đủ 4 ảnh từ bài → dùng `[slug]-4.jpg` = ảnh từ bài trước đó hoặc ảnh liên quan đã có sẵn.

### BƯỚC 3 — Viết kịch bản (số cảnh tùy loại nguồn)

**Bài báo / tin tức:** 4–6 cảnh, tổng voiceover **không quá 60 giây**
**Trang dự án BĐS:** 6–10 cảnh, tổng voiceover **không quá 120 giây** — cần trình bày đủ các khía cạnh chi tiết

Mỗi cảnh ~2–3 câu.

**Cấu trúc gợi ý — bài báo (4 cảnh):**
| Cảnh | Nội dung |
|---|---|
| 1 | Tổng quan: tiêu đề lớn, thông tin đầu tiên nổi bật |
| 2 | Chi tiết: tiến độ, hạng mục, số liệu chính |
| 3 | Quy mô: con số đầu tư, diện tích, công suất |
| 4 | Góc nhìn BĐS: hạ tầng → cơ hội → khu vực hưởng lợi |

**Mở rộng bài báo (thêm cảnh 5–6):**
| Cảnh | Nội dung |
|---|---|
| 5 | Phân tích sâu hơn: pháp lý, chính sách, rủi ro |
| 6 | Tổng kết / lời khuyên / câu hỏi mở cho viewer |

**Cấu trúc gợi ý — trang dự án BĐS (8–10 cảnh):**
| Cảnh | Nội dung |
|---|---|
| 1 | Hook mở đầu: tên dự án, điểm nổi bật nhất |
| 2 | Quy mô tổng quan: diện tích, số block, chủ đầu tư |
| 3 | Vị trí & kết nối: đường lớn, khoảng cách trung tâm |
| 4 | Hạ tầng tương lai: Metro, quy hoạch, KCN lân cận |
| 5 | Tiện ích nội khu (phần 1): hồ bơi, cảnh quan, nghỉ dưỡng |
| 6 | Tiện ích nội khu (phần 2): gym, thể thao, thương mại |
| 7 | Mặt bằng & loại hình căn hộ |
| 8 | Chủ đầu tư & tiêu chuẩn xây dựng |
| 9 | Bảng giá & chính sách thanh toán (có thể nhắc nhẹ tiến độ pháp lý) |
| 10 | Tổng kết điểm mạnh — tại sao nên quan tâm dự án này (kết thúc tích cực, không cảnh báo rủi ro) |

**In kịch bản ra cho user đọc** — chờ user ghi âm. Không tự render trước khi có voiceover.

### BƯỚC 4 — Đợi user ghi âm

Yêu cầu user:
> Đọc xong đặt file MP3 ngoài Desktop tên **`voiceover-[slug].mp3`**

### BƯỚC 5 — Copy audio + Silencedetect

```bash
# Copy về project
cp inbox/voiceover-[slug].mp3 \
   ./public/audio/voiceover-[slug].mp3

# Phát hiện khoảng lặng
ffmpeg -i public/audio/voiceover-[slug].mp3 \
       -af silencedetect=noise=-35dB:d=0.25 -f null - 2>&1 | grep -E "silence_(start|end)|Duration"
```

### BƯỚC 6 — Tính frame timing

**Tổng frames** = `round(duration_giây × 30)`

**Ranh giới scene** = midpoint của các khoảng lặng **> 0.9s**  
(thường có đúng 3 điểm chia → 4 scene)

```
midpoint = (silence_start + silence_end) / 2
scene_N_frames = round(midpoint_N × 30) - round(midpoint_{N-1} × 30)
```

**Ranh giới subtitle** = các khoảng lặng nhỏ hơn (0.25–0.9s) bên trong mỗi scene  
→ local frame = `round((global_time - scene_start_time) × 30)`

**Quy tắc subtitle:**
- 3 dòng/scene là chuẩn (tối đa 4 dòng nếu scene dài >400f)
- Mỗi dòng ≤ 45 ký tự — tách ra nếu dài hơn
- `startFrame` = frame sau khi khoảng lặng kết thúc
- `endFrame` = frame trước khi khoảng lặng bắt đầu

### BƯỚC 7 — Cập nhật NewsStyleVideo.tsx

Sửa 2 chỗ trong `./src/compositions/NewsStyleVideo.tsx`:

**1. Audio src:**
```tsx
<Audio src={staticFile("audio/voiceover-[slug].mp3")} />
```

**2. NEWS_SCENES array** — thay toàn bộ với nội dung mới:

```tsx
export const NEWS_SCENES: SceneData[] = [
  {
    label:    "• DANH MỤC · NGUỒN BÁO",
    headline: ["DÒNG TIÊU ĐỀ 1", "DÒNG TIÊU ĐỀ 2"],
    headlineGold: true,           // dòng cuối headline màu vàng (tùy scene)
    body:     "Nội dung mô tả ngắn 1–2 câu.",
    highlights: ["từ cần tô vàng"],
    pills:    ["TAG 1", "TAG 2"], // tùy chọn
    image:    { src: "images/[slug]-1.jpg", caption: "Nguồn: Tên báo" },
    subtitles: [
      { text: "Dòng phụ đề 1",  startFrame: 0,  endFrame: 80  },
      { text: "Dòng phụ đề 2",  startFrame: 90, endFrame: 200 },
      { text: "Dòng phụ đề 3",  startFrame: 210, endFrame: 300 },
    ],
    durationFrames: 327,
  },
  // ... 3 scene còn lại
];
```

**Palette màu mặc định** (giữ nguyên, không sửa):
- BG: `#EBF6F0` (xanh sage)
- Headline: `#0B3D2E` (xanh rừng)
- Gold: `#C9A84C` (vàng OPUS LAND)

### BƯỚC 8 — Render + Normalize (một bước duy nhất)

Chuẩn TikTok / Reels / Shorts: **-14 LUFS, -1 dBTP**. Normalize ngay sau render, ghi đè lên cùng file, không tạo file thứ hai.

```bash
cd .

# 1. Render
npx remotion render src/index.ts NewsStyle out/[slug].mp4

# 2. Normalize audio in-place (single-pass, đủ chuẩn cho TikTok)
ffmpeg -y -i out/[slug].mp4 -c:v copy \
  -af "loudnorm=I=-14:TP=-1:LRA=11" \
  out/[slug]-norm.mp4 && mv out/[slug]-norm.mp4 out/[slug].mp4
```

File duy nhất để đăng là `out/[slug].mp4`. Không copy ra Desktop.

### BƯỚC 9 — Kiểm tra quảng cáo TTS ở cuối

Nếu user báo có tiếng quảng cáo ở cuối (thường từ giây 44 trở đi nếu dùng TTSMaker demo):

```bash
# Mute đoạn cụ thể (VD: 44→47s)
ffmpeg -y -i inbox/voiceover-[slug].mp3 \
  -af "volume=enable='between(t,44,47)':volume=0" \
  public/audio/voiceover-[slug].mp3

# Render lại
npx remotion render src/index.ts NewsStyle out/[slug]-v2.mp4
```

---

## CẤU TRÚC SceneData (tham khảo nhanh)

```tsx
interface SceneData {
  label:          string;          // "• DANH MỤC · NGUỒN"
  headline:       string[];        // mỗi phần tử = 1 dòng chữ to
  headlineGold?:  boolean;         // dòng cuối headline = màu vàng
  body?:          string;          // đoạn mô tả
  highlights?:    string[];        // từ tô vàng trong body
  bodyAccent?:    string;          // đoạn vàng đậm riêng
  pills?:         string[];        // tag chips
  image?:         SceneImage;      // { src, caption }
  images?:        SceneImage[];    // 2 ảnh layout 2 cột
  subtitles?:     SubtitleLine[];  // { text, startFrame, endFrame }
  durationFrames: number;
}
```

---

## LƯU Ý QUAN TRỌNG

- **Không thêm link/CTA** vào video (đã bỏ từ tháng 7/2026)
- **Padding ngang: 80px** mỗi bên (đã fix cho TikTok, không sửa lại)
- **Phụ đề: bottom 340px** tính từ đáy màn hình — gần ảnh, không chạm progress bar
- Nếu bài báo có **ít hơn 4 ảnh** → dùng picsum hoặc ảnh cùng chủ đề đã tải trước
- Subtitle dòng ngắn hơn, rõ ràng hơn bao giờ cũng tốt hơn dòng dài
