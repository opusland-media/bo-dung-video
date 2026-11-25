"""Dựng nền video bàn giao Green Skyline (1PN+ / 2PN) — bản "dừng hình làm nổi bật nội thất".

1. Cắt các đoạn từ clip thô, chỉnh màu, chèn khoảng DỪNG HÌNH tại mỗi điểm giới thiệu nội thất,
   nối đoạn bằng crossfade -> public/video/bangiao/<unit>_tour.mp4 (+ <unit>_hook.mp4)
2. Trích ảnh tĩnh tại mỗi điểm dừng -> public/images/bangiao/stops/<unit>_<id>.jpg
3. Chạy SAM tách mask từng món -> public/images/bangiao/stops/<unit>_<id>_<i>_{mask,glow}.png
4. Xuất timeline -> src/data/bangiao_<unit>.json

Chạy:  python3 scripts/bangiao/build.py 1pn 2pn
"""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC_DIR = Path("/Users/hoangle/Desktop/GREEN SKYLINE/video yt")
SCRATCH = Path("/private/tmp/claude-501/-Users-CLAUDE/a6823b23-a434-4014-9971-419063186c1b/scratchpad/stops_run")
VENV_PY = ROOT / ".whisper-venv/bin/python"
FPS = 30
XF = 0.5  # crossfade giữa các đoạn (giây)
GRADE = ("curves=master='0/0.01 0.25/0.265 0.5/0.545 0.8/0.855 1/0.98',"
         "colorbalance=rm=0.012:bm=-0.015:bs=0.01,eq=contrast=1.04:saturation=1.07,cas=0.35")

G, B, X = "goi", "coban", "khong"  # gói nội thất / có cả ở bàn giao cơ bản / không thuộc danh mục


def it(title, sub, tier, n, *boxes, rect=False):
    return {"title": title, "sub": sub, "tier": tier, "n": n, "boxes": [list(b) for b in boxes], "rect": rect}


DAIKIN = "Daikin / Mitsubishi / Samsung / LG"
E1 = "Gỗ công nghiệp E1, mặt laminate"
UNITS = {
    "1pn": {
        "file": "thực tế 1PN+.MOV",
        "segments": [(0.0, 13.0, 1), (13.0, 26.0, 1.25), (27.0, 39.0, 1), (39.0, 47.0, 1), (47.0, 66.0, 1), (66.0, 76.0, 1)],
        "hook": (56.0, 63.0),
        "zones": [(1.0, "Bếp & phòng ăn"), (13.2, "Khu vực khác"), (27.5, "Phòng làm việc"), (39.3, "Phòng khách"), (47.3, "Phòng ngủ")],
        "stops": [
            (4.0, [it("Tủ lạnh", "Panasonic / Samsung hoặc tương đương", G, 1, (305, 125, 680, 1080)),
                   it("Tủ bếp + tủ kính tay nâng Blum", E1, B, 1, (645, 0, 1015, 430), (670, 585, 1065, 1080))]),
            (8.5, [it("Chậu rửa 1 hộc Hafele", "", B, 1, (70, 720, 630, 950), (270, 455, 385, 765)),
                   it("Bếp từ Panasonic", "3 vùng nấu", B, 1, (780, 600, 1110, 680)),
                   it("Máy hút mùi Panasonic", "", B, 1, (765, 320, 1125, 382))]),
            (11.5, [it("Bàn ăn + 4 ghế", "Mặt đá nung kết, ghế bọc vải", G, 2, (770, 630, 1170, 720), (735, 690, 915, 1000), (910, 680, 1095, 1010), (840, 605, 960, 660), (960, 605, 1080, 660)),
                    it("Tranh trang trí", "", G, 1, (668, 180, 775, 500))]),
            (15.0, [it("Máy giặt", "Panasonic / Samsung hoặc tương đương", G, 1, (1100, 700, 1490, 1080)),
                    it("Máy sấy", "Không thuộc danh mục bàn giao", X, 0, (1100, 120, 1490, 665))]),
            (31.0, [it("Bàn đọc sách", E1, G, 1, (575, 610, 1160, 840)),
                    it("Tủ sách", E1, G, 1, (1135, 0, 1280, 780)),
                    it("Tranh trang trí", "", G, 1, (695, 215, 880, 478))]),
            (42.0, [it("Tivi", "Không thuộc danh mục bàn giao", X, 0, (480, 370, 585, 560))]),
            (44.5, [it("Sofa phòng khách", "Bọc vải / da nhân tạo", G, 1, (520, 650, 1090, 1080)),
                    it("Bàn sofa", "Mặt đá nung kết", G, 1, (40, 795, 455, 1080))]),
            (52.0, [it("Máy lạnh phòng ngủ", DAIKIN, G, 1, (1160, 105, 1390, 285)),
                    it("Máy lạnh phòng khách", DAIKIN, G, 1, (1535, 10, 1830, 220)),
                    it("Tủ áo kịch trần", E1, G, 1, (905, 175, 1200, 920))]),
            (55.5, [it("Giường 1m6 + nệm Sealy (Mỹ)", "Nệm lò xo Avenue Pillow Top, dày 28 cm", G, 2, (0, 625, 1075, 1080)),
                    it("Tranh trang trí", "", G, 1, (120, 220, 545, 508))]),
            (59.0, [it("Bàn trang điểm + gương + ghế", "", G, 3, (400, 645, 770, 975), (550, 410, 750, 610), (398, 840, 670, 1080))]),
        ],
    },
    "2pn": {
        "file": "thực tế 2PN.MOV",
        "segments": [(0.0, 20.0, 1), (20.0, 27.0, 1), (27.5, 38.0, 1.3), (40.0, 58.0, 1), (66.0, 92.0, 1),
                     (92.0, 104.0, 1.3), (104.0, 113.0, 1), (113.0, 133.5, 1)],
        "hook": (125.0, 133.5),
        "zones": [(0.6, "Bếp & phòng ăn"), (20.3, "Phòng khách"), (28.0, "Phòng tắm chung"),
                  (40.4, "Phòng ngủ 2"), (66.4, "Phòng ngủ master"), (92.4, "Phòng tắm master"), (104.3, "Phòng khách"),
                  (113.5, "Ban công · view nội khu")],
        "stops": [
            (2.5, [it("Tủ bếp + tủ kính tay nâng Blum", E1, B, 1, (0, 0, 643, 307), (125, 538, 691, 845))]),
            (8.5, [it("Tủ lạnh", "Panasonic / Samsung hoặc tương đương", G, 1, (672, 336, 922, 845)),
                   it("Bếp từ Panasonic", "3 vùng nấu", B, 1, (374, 605, 712, 668)),
                   it("Máy hút mùi Panasonic", "", B, 1, (451, 346, 739, 396)),
                   it("Chậu rửa 1 hộc Hafele", "", B, 1, (0, 715, 225, 810))]),
            (13.0, [it("Bàn ăn + 4 ghế", "Mặt đá nung kết, ghế bọc vải", G, 2, (925, 625, 1455, 720), (985, 690, 1235, 1075), (1200, 665, 1420, 1060), (925, 600, 1075, 930), (1075, 595, 1205, 640)),
                    it("Tranh trang trí", "", G, 1, (1315, 54, 1536, 467)),
                    it("Máy lạnh phòng khách", DAIKIN, G, 1, (173, 6, 384, 160))]),
            (24.0, [it("Sofa phòng khách", "Bọc vải / da nhân tạo", G, 1, (1052, 480, 1363, 749)),
                    it("Bàn sofa", "Mặt đá nung kết", G, 1, (826, 576, 998, 720)),
                    it("Tivi", "Không thuộc danh mục bàn giao", X, 0, (480, 298, 605, 480))]),
            (46.0, [it("Giường 1m4 + nệm Sealy (Mỹ)", "Nệm lò xo Avenue Pillow Top, dày 28 cm", G, 2, (691, 528, 1555, 1018)),
                    it("Tranh trang trí", "", G, 1, (749, 221, 989, 432))]),
            (52.5, [it("Bàn học", E1, G, 1, (1152, 660, 1585, 1000))]),
            (54.5, [it("Tủ áo kịch trần", E1, G, 1, (495, 0, 1110, 780)),
                    it("Máy lạnh phòng ngủ 2", DAIKIN, G, 1, (150, 0, 425, 75))]),
            (72.5, [it("Giường 1m6 + nệm Sealy (Mỹ)", "Nệm lò xo Avenue Pillow Top, dày 28 cm", G, 2, (720, 576, 1565, 1018)),
                    it("Tranh trang trí", "", G, 1, (1229, 259, 1459, 480))]),
            (81.0, [it("Tủ áo kịch trần", E1, G, 1, (758, 38, 1325, 960)),
                    it("Máy lạnh phòng ngủ master", DAIKIN, G, 1, (1344, 29, 1680, 182))]),
            (109.5, [it("Tủ kệ TV + vách TV", "Gỗ E1, mặt đá nung kết, chỉ trang trí", G, 2, (806, 534, 1114, 687)),
                     it("Tivi", "Không thuộc danh mục bàn giao", X, 0, (845, 284, 1075, 457))]),
        ],
    },
}


def hold_len(items):
    return round(min(4.8, 1.3 + 0.9 * len(items)), 2)


def run(cmd):
    subprocess.run(cmd, check=True)


def build(unit, skip_video=False):
    u = UNITS[unit]
    segs = u["segments"]
    src = str(SRC_DIR / u["file"])
    vid_dir = ROOT / "public/video/bangiao"
    img_dir = ROOT / "public/images/bangiao/stops"
    img_dir.mkdir(parents=True, exist_ok=True)
    scratch = SCRATCH / unit
    scratch.mkdir(parents=True, exist_ok=True)

    stops = [(t, items, hold_len(items)) for t, items in u["stops"]]
    seg_of = lambda t: next(i for i, (a, b, _) in enumerate(segs) if a <= t < b)

    # độ dài mỗi đoạn trên video dựng = phần chạy (theo tốc độ) + các khoảng dừng hình
    lens = []
    for i, (a, b, sp) in enumerate(segs):
        lens.append((b - a) / sp + sum(h for t, _, h in stops if seg_of(t) == i))
    starts, cur = [], 0.0
    for L in lens:
        starts.append(cur)
        cur += L - XF
    total = cur + XF

    def map_t(s):
        """giây clip gốc -> giây video dựng (thời điểm khung đó xuất hiện lần đầu)"""
        i = seg_of(s)
        a, b, sp = segs[i]
        return starts[i] + (s - a) / sp + sum(h for t, _, h in stops if seg_of(t) == i and t < s)

    fr = lambda x: round(x * FPS)

    if not skip_video:
        enc = ["-c:v", "h264_videotoolbox", "-b:v", "70M", "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart"]
        parts, fc, n_in = [], [], 0
        for i, (a, b, sp) in enumerate(segs):
            cuts = [a] + [t for t, _, _ in stops if seg_of(t) == i] + [b]
            pieces = []
            for k in range(len(cuts) - 1):
                p0, p1 = cuts[k], cuts[k + 1]
                parts += ["-ss", f"{p0:.3f}", "-t", f"{p1 - p0:.3f}", "-i", src]
                f = f"[{n_in}:v]setpts=(PTS-STARTPTS)/{sp},fps={FPS},{GRADE},format=yuv420p,settb=1/{FPS}"
                hold = next((h for t, _, h in stops if abs(t - p1) < 1e-6), None)
                if hold:
                    f += f",tpad=stop_mode=clone:stop_duration={hold}"
                fc.append(f + f"[p{i}_{k}]")
                pieces.append(f"[p{i}_{k}]")
                n_in += 1
            if len(pieces) == 1:
                fc.append(f"{pieces[0]}null[v{i}]")
            else:
                fc.append(f"{''.join(pieces)}concat=n={len(pieces)}:v=1:a=0,settb=1/{FPS}[v{i}]")
        prev = "v0"
        for i in range(1, len(segs)):
            fc.append(f"[{prev}][v{i}]xfade=transition=fade:duration={XF}:offset={starts[i]:.3f}[x{i}]")
            prev = f"x{i}"
        run(["ffmpeg", "-v", "error", "-y", *parts, "-filter_complex", ";".join(fc), "-map", f"[{prev}]", *enc,
             str(vid_dir / f"{unit}_tour.mp4")])
        a, b = u["hook"]
        run(["ffmpeg", "-v", "error", "-y", "-ss", str(a), "-t", str(b - a), "-i", src, "-vf", f"fps={FPS},{GRADE},format=yuv420p",
             *enc, str(vid_dir / f"{unit}_hook.mp4")])

    # ảnh tĩnh tại điểm dừng (lấy từ chính video dựng để khớp từng điểm ảnh)
    sam_in = []
    for k, (t, items, h) in enumerate(stops):
        sid = f"s{k + 1}"
        at = map_t(t)
        grab = (fr(at) + 4) / FPS
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{grab:.3f}", "-i", str(vid_dir / f"{unit}_tour.mp4"), "-frames:v", "1",
             "-q:v", "2", str(img_dir / f"{unit}_{sid}.jpg")])
        run(["ffmpeg", "-v", "error", "-y", "-i", str(img_dir / f"{unit}_{sid}.jpg"), "-vf", "scale=1920:1080", str(scratch / f"{sid}.png")])
        sam_in.append({"id": sid, "items": [{"boxes": x["boxes"], "rect": x["rect"]} for x in items]})
    (scratch / "stops.json").write_text(json.dumps(sam_in))
    run([str(VENV_PY), str(ROOT / "scripts/bangiao/sam_masks.py"), str(scratch / "stops.json"), str(scratch), str(scratch / "masks")])
    bboxes = json.loads((scratch / "masks/bbox.json").read_text())
    for k in range(len(stops)):
        sid = f"s{k + 1}"
        for i in range(len(stops[k][1])):
            for kind in ("mask", "glow"):
                (img_dir / f"{unit}_{sid}_{i}_{kind}.png").write_bytes((scratch / f"masks/{sid}_{i}_{kind}.png").read_bytes())

    data = {
        "tourFrames": fr(total),
        "zones": [{"at": fr(map_t(s)), "label": l} for s, l in u["zones"]],
        "stops": [{
            "at": fr(map_t(t)), "dur": fr(h), "img": f"images/bangiao/stops/{unit}_s{k + 1}.jpg",
            "items": [{"title": x["title"], "sub": x["sub"], "tier": x["tier"], "n": x["n"], "bbox": bboxes[f"s{k + 1}"][i],
                       "mask": f"images/bangiao/stops/{unit}_s{k + 1}_{i}_mask.png", "glow": f"images/bangiao/stops/{unit}_s{k + 1}_{i}_glow.png"}
                      for i, x in enumerate(items)],
        } for k, (t, items, h) in enumerate(stops)],
    }
    (ROOT / f"src/data/bangiao_{unit}.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))
    run(["python3", str(ROOT / "scripts/bangiao/cutouts.py"), unit])
    print(unit, "tour", round(total, 2), "s; stops", len(stops), "; items", sum(x["n"] for _, its, _ in stops for x in its), flush=True)


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    for un in args:
        build(un, skip_video="--skip-video" in sys.argv)
