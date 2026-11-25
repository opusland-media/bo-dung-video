"""Tạo ảnh cắt 4K (RGBA) cho từng món từ ảnh dừng + mask: python3 cutouts.py <unit>"""
import json, sys
from pathlib import Path
from PIL import Image
R = Path(__file__).resolve().parents[2]
unit = sys.argv[1]
p = R / f"src/data/bangiao_{unit}.json"
d = json.loads(p.read_text())
for s in d["stops"]:
    still = Image.open(R / "public" / s["img"]).convert("RGB")
    for it in s["items"]:
        m = Image.open(R / "public" / it["mask"]).convert("L").resize(still.size, Image.LANCZOS)
        cut = still.copy(); cut.putalpha(m)
        bb = m.getbbox() or (0, 0, 1, 1)
        out = it["mask"].replace("_mask.png", "_cut.png")
        cut.crop(bb).save(R / "public" / out, optimize=False, compress_level=3)
        sx = 1920 / still.size[0]
        it["cut"] = out
        it["cutBox"] = [round(bb[0] * sx, 2), round(bb[1] * sx, 2), round(bb[2] * sx, 2), round(bb[3] * sx, 2)]
p.write_text(json.dumps(d, ensure_ascii=False, indent=1))
print("cutouts", unit, sum(len(s["items"]) for s in d["stops"]))
