# STYLE GUIDE — Editorial News Shorts
## Nguồn tham khảo: https://www.youtube.com/shorts/oWXeXEG4DjM
## Phân tích: Claude Code, 2026-07-28

---

## 1. FORMAT

| Thuộc tính | Giá trị |
|---|---|
| Định dạng | Dọc 9:16 (YouTube Shorts / TikTok / Reels) |
| Resolution | 1080 × 1920 px |
| FPS | 30 |
| Thời lượng mẫu | ~70s |
| Số scenes | 5–6 scenes, mỗi scene 8–17s |

---

## 2. MÀU SẮC (HEX)

| Tên | Hex | Dùng cho |
|---|---|---|
| `BG_TOP` | `#FBE4E4` | Gradient nền phía trên (góc trên) |
| `BG_CENTER` | `#FEFAFA` | Gradient nền trung tâm / phần trắng |
| `RED` | `#E8355E` | Accent chính: label, số nổi bật, divider, pill border, highlight text |
| `BLACK` | `#1A1A1A` | Headline text |
| `GRAY` | `#3D3D3D` | Body paragraph text |
| `MUTED` | `#9B9B9B` | TTS caption text (phụ đề bottom) |
| `GRID` | `rgba(200,140,140,0.07)` | Đường kẻ grid nền |

**Gradient nền:**
```
radial-gradient(ellipse 120% 80% at 50% 0%, #FBE4E4 0%, #FEFAFA 60%)
```

**Grid overlay:**
```
background-image:
  linear-gradient(rgba(200,140,140,0.07) 1px, transparent 1px),
  linear-gradient(90deg, rgba(200,140,140,0.07) 1px, transparent 1px);
background-size: 130px 130px;
```

---

## 3. TYPOGRAPHY

| Element | Font | Weight | Size (1080px canvas) | Color |
|---|---|---|---|---|
| Category label | Be Vietnam Pro | 700 | 22px | `#E8355E` |
| Headline H1 | Be Vietnam Pro | 900 | 68–80px | `#1A1A1A` |
| Body paragraph | Be Vietnam Pro | 400 | 26px | `#3D3D3D` |
| Highlighted word | Be Vietnam Pro | 700 | 26px | `#E8355E` |
| Red body (disclaimer) | Be Vietnam Pro | 700 | 26px | `#E8355E` |
| Pill tag | Be Vietnam Pro | 700 | 20px | `#E8355E` |
| Image caption | Be Vietnam Pro | 400 | 18px | `#9B9B9B` |
| TTS subtitle | Be Vietnam Pro | 400 | 24px | `#9B9B9B` |
| TTS bold word | Be Vietnam Pro | 900 | 24px | `#1A1A1A` |

**Tất cả text chính: UPPERCASE. Body và caption: mixed case bình thường.**

---

## 4. LAYOUT PER SCENE

Padding ngoài cùng: `64px top / 44px sides / 120px bottom` (để TTS caption không đè)

```
┌──────────────────────────────────┐
│ 64px                             │
│  • CATEGORY LABEL [RED 22px]     │
│  HEADLINE LINE 1 [BLACK 68-80px] │
│  HEADLINE LINE 2                 │
│  HEADLINE LINE 3                 │
│  ───── [RED divider 36×3px]      │
│  [PILLS nếu có]                  │
│  Body paragraph text             │
│  [hoặc RED disclaimer text]      │
│                                  │
│  ┌────────────────────────────┐  │
│  │   IMAGE / 2-column grid   │  │
│  └────────────────────────────┘  │
│  Ảnh: Caption source text        │
│                                  │
│  (white space)                   │
│                                  │
│  TTS caption [MUTED] bold [BLK]  │
│ 48px bottom                      │
└──────────────────────────────────┘
```

---

## 5. CÁC LOẠI SCENE

### Scene A — Text + Image (phổ biến nhất)
- Label + Headline + Divider + Body text
- Một ảnh landscape với rounded corners (border-radius: 12px)
- Caption nguồn ảnh nhỏ bên dưới ảnh

### Scene B — Text Only (số liệu lớn)
- Label + BIG NUMBER (100px+) + NOUN (70px)
- Divider
- Body text 2 dòng với highlights đỏ
- KHÔNG có ảnh — white space phần dưới rất nhiều

### Scene C — Pills + Double Image
- Label + Headline
- Row of pill tags (border: 1.5px solid RED, borderRadius: 24px)
- Body text
- 2 ảnh side-by-side (flex, gap: 16px) với staggered entrance

### Scene D — Red Disclaimer
- Label + Headline (có thể 3 dòng)
- RED body paragraph (không phải gray)
- Gray secondary body paragraph bên dưới
- Không có ảnh

---

## 6. ANIMATION SYSTEM

### Scene entrance (mỗi khi Sequence bắt đầu):
- Text block: `translateY(-28px → 0)` + `opacity 0→1`
- Spring config: `{ damping: 16, mass: 0.7, stiffness: 180 }`
- Duration: 0.4–0.5s

### Image entrance (delay 10 frames sau text):
- `translateY(+40px → 0)` + `opacity 0→1`
- Spring config: `{ damping: 15, mass: 0.8, stiffness: 160 }`

### 2-column images: stagger +8 frames per image

### Scene transition: Sequence hard-cut hoặc 6-frame cross-fade giữa Sequences

### TTS caption: fade in `opacity 0→1` trong 10 frames đầu mỗi scene

---

## 7. PILL TAGS

```css
border: 1.5px solid #E8355E;
border-radius: 24px;
padding: 6px 16px;
color: #E8355E;
font-weight: 700;
font-size: 20px;
text-transform: uppercase;
letter-spacing: 0.5px;
background: transparent;
```

---

## 8. IMAGE STYLE

```css
border-radius: 12px;
width: 100%;
object-fit: cover;
display: block;
```
Caption bên dưới: 18px, #9B9B9B, format "Ảnh: Tên nguồn"

---

## 9. RED DIVIDER

```css
width: 36px;
height: 3px;
background: #E8355E;
border-radius: 2px;
margin: 14px 0 16px;
```

---

## 10. GIỌNG ĐỌC / TTS STYLE

- Tone: Đọc tin tức — khách quan, rõ ràng, tốc độ vừa phải
- Không có cảm xúc cá nhân, không giật tít
- Giọng nữ hoặc nam đều phù hợp
- TTS caption synced word-by-word: từ hiện tại **bold** màu đen, phần còn lại muted gray

---

## 11. REMOTION FILE

- Component: `NewsStyleVideo` trong `src/compositions/NewsStyleVideo.tsx`
- Composition ID: `NewsStyle`
- Format: 1080×1920, 30fps
- Total frames: sum của `durationFrames` trong mảng `NEWS_SCENES`
- Data: điền vào `NEWS_SCENES` array trong file đó

---

## 12. TÁI TẠO NHANH

Checklist khi build video mới theo style này:

- [ ] Background: radial gradient hồng nhạt + grid overlay
- [ ] Font: Be Vietnam Pro 400/700/900
- [ ] Label: đỏ, uppercase, bullet point prefix "• "
- [ ] Headline: đen, 900 weight, uppercase, 68–80px
- [ ] Red divider 36×3px sau headline
- [ ] Body: gray 400 weight, highlights đỏ 700 weight
- [ ] Pills: border đỏ, transparent fill, uppercase
- [ ] Images: rounded-12, full width hoặc 2-col grid
- [ ] TTS caption: bottom 48px, word bold animation
- [ ] Scene padding: 64px top, 44px sides, 120px bottom
