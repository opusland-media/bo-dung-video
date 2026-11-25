"""Tách mask đồ nội thất bằng SAM (prompt = khung chữ nhật) cho các điểm dừng.

python sam_masks.py <stops.json> <frames_dir> <out_dir>
stops.json: [{"id": "s1", "items": [{"boxes": [[x0,y0,x1,y1], ...], "rect": false}, ...]}, ...] (toạ độ hệ 1920×1080)
frames_dir/<id>.png: khung hình gốc tại điểm dừng.
Xuất <out_dir>/<id>_<i>_mask.png (alpha) và <id>_<i>_glow.png (viền sáng).
"""
import json, sys
from pathlib import Path
import numpy as np
import torch
from PIL import Image, ImageFilter, ImageDraw
from transformers import SamModel, SamProcessor

W, H = 1920, 1080
stops = json.loads(Path(sys.argv[1]).read_text())
frames, out = Path(sys.argv[2]), Path(sys.argv[3])
out.mkdir(parents=True, exist_ok=True)
dev = "mps" if torch.backends.mps.is_available() else "cpu"
model = SamModel.from_pretrained("facebook/sam-vit-large").to(dev).eval()
proc = SamProcessor.from_pretrained("facebook/sam-vit-large")


def sam_box(img, box):
    raw = proc(img, input_boxes=[[box]], return_tensors="pt")
    inp = {k: (v.float() if v.is_floating_point() else v).to(dev) for k, v in raw.items()}
    with torch.no_grad():
        o = model(**inp, multimask_output=True)
    masks = proc.image_processor.post_process_masks(o.pred_masks.cpu(), inp["original_sizes"].cpu(), inp["reshaped_input_sizes"].cpu())[0][0]
    scores = o.iou_scores.cpu()[0][0]
    # chọn mask điểm cao nhưng không tràn quá khung
    best, bs = None, -1
    x0, y0, x1, y1 = box
    area_box = (x1 - x0) * (y1 - y0)
    for m, s in zip(masks, scores):
        m = m.numpy()
        inside = m[int(y0):int(y1), int(x0):int(x1)].sum()
        total = m.sum() + 1
        fill = inside / area_box
        sc = float(s) * (inside / total) * (0.3 + min(fill, 1.0))
        if sc > bs:
            best, bs = m, sc
    return best


for st in stops:
    img = Image.open(frames / f"{st['id']}.png").convert("RGB").resize((W, H))
    for i, it in enumerate(st["items"]):
        acc = np.zeros((H, W), bool)
        for b in it["boxes"]:
            if it.get("rect"):
                m = np.zeros((H, W), bool); m[int(b[1]):int(b[3]), int(b[0]):int(b[2])] = True
            else:
                m = sam_box(img, b)
            acc |= m
        mask = Image.fromarray((acc * 255).astype(np.uint8))
        mask = mask.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
        mask.save(out / f"{st['id']}_{i}_mask.png")
        # viền sáng: đường biên + quầng mờ
        edge = mask.filter(ImageFilter.MaxFilter(5))
        e = np.array(edge, np.int16) - np.array(mask.filter(ImageFilter.MinFilter(3)), np.int16)
        e = Image.fromarray(np.clip(e * 1.6, 0, 255).astype(np.uint8))
        glow = e.filter(ImageFilter.GaussianBlur(9))
        a = np.clip(np.array(e, np.float32) * 0.95 + np.array(glow, np.float32) * 1.1, 0, 255).astype(np.uint8)
        rgba = np.zeros((H, W, 4), np.uint8); rgba[..., :3] = (255, 248, 225); rgba[..., 3] = a
        Image.fromarray(rgba).save(out / f"{st['id']}_{i}_glow.png")
        ys, xs = np.nonzero(acc)
        it["bbox"] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())] if len(xs) else it["boxes"][0]
        print(st["id"], i, it["bbox"], flush=True)

Path(out / "bbox.json").write_text(json.dumps({st["id"]: [it["bbox"] for it in st["items"]] for st in stops}))
