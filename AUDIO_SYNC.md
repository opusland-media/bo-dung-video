# Hướng dẫn đồng bộ giọng đọc với hình ảnh

## Quy trình chuẩn (3 bước)

### Bước 1 — Thu voice-over

Thu từng video hoàn chỉnh vào 1 file .mp3 (không cắt từng đoạn).  
Đặt file vào: `public/audio/<tên-video>.mp3`

**Công cụ gợi ý:**
- ElevenLabs (chất lượng cao, có tiếng Việt)
- Groq Whisper TTS (miễn phí)  
- Tự thu bằng micro → export mp3

---

### Bước 2 — Lấy timestamp từng câu bằng Whisper

Chạy lệnh sau để xuất timestamp từng câu thoại (cần Groq API key trong `~/.config/watch/.env`):

```bash
python3 ~/.claude/skills/watch/scripts/watch.py \
  "public/audio/three-mistakes.mp3" \
  --detail transcript \
  --no-whisper
```

Hoặc dùng Whisper trực tiếp nếu có API key:

```bash
python3 -c "
import json, sys
sys.path.insert(0, '/Users/CLAUDE/.claude/skills/watch/scripts')
from whisper import transcribe_video, load_api_key
from pathlib import Path

backend, key = load_api_key()
segs, _ = transcribe_video('public/audio/three-mistakes.mp3', Path('/tmp/audio.mp3'), backend, key)
for s in segs:
    print(f'{s[\"start\"]:.2f}\t{s[\"end\"]:.2f}\t{s[\"text\"]}')
"
```

Output mẫu:
```
0.00    4.80    Bạn có 500 triệu và đang nghĩ đến đầu tư bất động sản?
4.80    12.10   70% nhà đầu tư mới mắc ít nhất một trong ba sai lầm này...
12.10   24.50   Sai lầm số một: mua căn hộ hoặc đất khi pháp lý chưa hoàn chỉnh...
```

---

### Bước 3 — Cập nhật timing trong script

Mở `src/data/scenes/<tên-video>.ts`, cập nhật `startTime` / `endTime` theo timestamp thật:

```ts
// TRƯỚC (timing ước lượng)
{ id: "hook", startTime: 0, endTime: 5, ... }

// SAU (timing thật từ Whisper)
{ id: "hook", startTime: 0, endTime: 4.8, ... }
```

Sau đó cập nhật `durationInFrames` trong `Root.tsx`:
```ts
// durationInFrames = endTime của beat cuối * fps
// Ví dụ: beat cuối kết thúc lúc 72.4s → 72.4 * 30 = 2172 frames
durationInFrames={2172}
```

---

## Kích hoạt audio trong video

Mở `src/compositions/ExampleVideo.tsx`, bỏ comment phần Audio:

```tsx
<Audio
  src={staticFile("audio/three-mistakes.mp3")}
  startFrom={0}
  volume={1}
/>
```

---

## Tips

- Thu voice-over xong trước, THEN mới chạy Whisper để lấy timing — đừng viết timing trước khi có audio thật.  
- Nếu cần điều chỉnh một beat cụ thể, chỉ thay đổi `startTime`/`endTime` của beat đó, không cần sửa code component.  
- Có thể thêm `startDelay` vào từng component (vd: `MiniBudgetBars startDelay={6}`) để hình animate hơi trễ sau khi beat bắt đầu — tạo cảm giác tự nhiên hơn.
