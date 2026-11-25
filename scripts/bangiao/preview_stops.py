"""Ảnh xem nhanh mask các điểm dừng: python3 preview_stops.py <unit> <out.jpg>"""
import json, sys
from pathlib import Path
from PIL import Image, ImageEnhance
R = Path(__file__).resolve().parents[2]
unit, out = sys.argv[1:3]
d = json.loads((R / f"src/data/bangiao_{unit}.json").read_text())
tiles = []
for s in d["stops"]:
    base = Image.open(R / "public" / s["img"]).convert("RGB").resize((1920, 1080))
    o = ImageEnhance.Brightness(base).enhance(0.38)
    for it in s["items"]:
        m = Image.open(R / "public" / it["mask"]).convert("L"); o.paste(base, (0, 0), m)
        g = Image.open(R / "public" / it["glow"]); o.paste(g, (0, 0), g)
    tiles.append(o.resize((640, 360)))
cols = 3; rows = (len(tiles) + cols - 1) // cols
sheet = Image.new("RGB", (640 * cols, 360 * rows))
for i, t in enumerate(tiles): sheet.paste(t, ((i % cols) * 640, (i // cols) * 360))
sheet.save(out, quality=82)
