"""Dựng nền video bàn giao Green Skyline (1PN+ / 2PN).

Cắt các đoạn từ clip thô, chỉnh màu, nối bằng crossfade -> public/video/bangiao/<unit>_tour.mp4
và xuất timeline chú thích (đổi từ giây clip gốc sang frame video dựng) -> src/data/bangiao_<unit>.json

Chạy:  python3 scripts/bangiao/build.py 1pn   |   python3 scripts/bangiao/build.py 2pn
"""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC_DIR = Path("/Users/hoangle/Desktop/GREEN SKYLINE/video yt")
FPS = 30
XF = 0.5  # crossfade giữa các đoạn (giây)
GRADE = ("curves=master='0/0.01 0.25/0.265 0.5/0.545 0.8/0.855 1/0.98',"
         "colorbalance=rm=0.012:bm=-0.015:bs=0.01,eq=contrast=1.04:saturation=1.07,cas=0.35")

G, B, X, I = "goi", "coban", "khong", "info"  # gói nội thất / tiêu chuẩn cơ bản / không thuộc danh mục / thông tin

UNITS = {
    "1pn": {
        "file": "thực tế 1PN+.MOV",
        "segments": [(0.0, 13.0, 1), (13.0, 26.0, 1.25), (27.0, 39.0, 1), (39.0, 47.0, 1), (47.0, 66.0, 1), (66.0, 76.0, 1)],
        "hook": (56.0, 63.0),
        "zones": [(1.0, "Bếp & phòng ăn"), (13.2, "Khu vực khác"), (27.5, "Phòng làm việc"), (39.3, "Phòng khách"), (47.3, "Phòng ngủ")],
        "callouts": [
            (2.6, "Tủ lạnh", "Panasonic / Samsung hoặc tương đương", G, 1),
            (3.8, "Tủ bếp + tủ kính tay nâng Blum", "Gỗ công nghiệp E1, mặt laminate", B, 1),
            (5.4, "Chậu rửa 1 hộc Hafele", "", B, 1),
            (6.6, "Kệ úp chén Hafele", "Hoặc tương đương", G, 1),
            (8.0, "Bếp từ Panasonic", "3 vùng nấu", B, 1),
            (9.0, "Máy hút mùi Panasonic", "", B, 1),
            (10.2, "Bàn ăn + 4 ghế", "Mặt đá nung kết, ghế bọc vải", G, 2),
            (11.4, "Tranh trang trí", "", G, 1),
            (14.4, "Máy giặt", "Panasonic / Samsung hoặc tương đương", G, 1),
            (16.6, "Máy sấy", "Không thuộc danh mục bàn giao", X, 0),
            (19.0, "Tủ giày", "Gỗ công nghiệp E1, mặt laminate", G, 1),
            (29.0, "Bàn đọc sách", "Gỗ công nghiệp E1, mặt laminate", G, 1),
            (30.6, "Tủ sách", "Gỗ công nghiệp E1, mặt laminate", G, 1),
            (32.6, "Tranh trang trí", "", G, 1),
            (40.0, "Sofa phòng khách", "Bọc vải / da nhân tạo", G, 1),
            (41.0, "Bàn sofa", "Mặt đá nung kết", G, 1),
            (42.2, "Tủ kệ TV + vách TV", "Gỗ E1, mặt đá nung kết, chỉ trang trí", G, 2),
            (43.4, "Tivi", "Không thuộc danh mục bàn giao", X, 0),
            (44.6, "Máy lạnh phòng khách", "Daikin / Mitsubishi / Samsung / LG", G, 1),
            (48.4, "Giường ngủ 1m6 × 2m", "", G, 1),
            (50.0, "Nệm lò xo Sealy (Mỹ)", "Avenue Pillow Top, dày 28 cm", G, 1),
            (52.0, "Máy lạnh phòng ngủ", "Daikin / Mitsubishi / Samsung / LG", G, 1),
            (54.4, "Tủ áo kịch trần", "Gỗ công nghiệp E1, mặt laminate", G, 1),
            (57.6, "Bàn trang điểm + gương + ghế", "", G, 3),
            (61.0, "Tranh trang trí", "", G, 1),
        ],
    },
    "2pn": {
        "file": "thực tế 2PN.MOV",
        "segments": [(0.0, 20.0, 1), (20.0, 27.0, 1), (27.5, 38.0, 1.3), (40.0, 58.0, 1), (66.0, 92.0, 1),
                     (92.0, 104.0, 1.3), (104.0, 113.0, 1), (113.0, 133.5, 1)],
        "hook": (125.0, 133.5),
        "zones": [(0.6, "Bếp & phòng ăn"), (14.8, "Khu vực khác"), (20.3, "Phòng khách"), (28.0, "Phòng tắm chung"),
                  (40.4, "Phòng ngủ 2"), (66.4, "Phòng ngủ master"), (92.4, "Phòng tắm master"), (104.3, "Phòng khách"),
                  (113.5, "Ban công · view nội khu")],
        "callouts": [
            (1.5, "Tủ bếp + tủ kính tay nâng Blum", "Gỗ công nghiệp E1, mặt laminate", B, 1),
            (3.2, "Chậu rửa 1 hộc Hafele", "", B, 1),
            (4.4, "Kệ úp chén Hafele", "Hoặc tương đương", G, 1),
            (6.4, "Tủ lạnh", "Panasonic / Samsung hoặc tương đương", G, 1),
            (8.2, "Bếp từ Panasonic", "3 vùng nấu", B, 1),
            (9.4, "Máy hút mùi Panasonic", "", B, 1),
            (12.0, "Bàn ăn + 4 ghế", "Mặt đá nung kết, ghế bọc vải", G, 2),
            (13.4, "Tranh trang trí", "", G, 1),
            (15.2, "Máy giặt", "Panasonic / Samsung hoặc tương đương", G, 1),
            (17.0, "Tủ giày", "Gỗ công nghiệp E1, mặt laminate", G, 1),
            (21.0, "Sofa phòng khách", "Bọc vải / da nhân tạo", G, 1),
            (22.2, "Bàn sofa", "Mặt đá nung kết", G, 1),
            (23.4, "Tủ kệ TV + vách TV", "Gỗ E1, mặt đá nung kết, chỉ trang trí", G, 2),
            (24.8, "Tivi", "Không thuộc danh mục bàn giao", X, 0),
            (42.0, "Giường ngủ 1m4 × 2m", "", G, 1),
            (44.0, "Nệm lò xo Sealy (Mỹ)", "Avenue Pillow Top, dày 28 cm", G, 1),
            (46.4, "Tranh trang trí", "", G, 1),
            (50.4, "Bàn học", "Gỗ công nghiệp E1, mặt laminate", G, 1),
            (52.6, "Tủ áo kịch trần", "Gỗ công nghiệp E1, mặt laminate", G, 1),
            (54.6, "Máy lạnh phòng ngủ 2", "Daikin / Mitsubishi / Samsung / LG", G, 1),
            (68.0, "Giường ngủ 1m6 × 2m", "", G, 1),
            (70.0, "Nệm lò xo Sealy (Mỹ)", "Avenue Pillow Top, dày 28 cm", G, 1),
            (72.4, "Bàn làm việc", "Gỗ công nghiệp E1, mặt laminate", G, 1),
            (76.0, "Tranh trang trí", "", G, 1),
            (78.8, "Tủ áo kịch trần", "Gỗ công nghiệp E1, mặt laminate", G, 1),
            (81.0, "Máy lạnh phòng ngủ master", "Daikin / Mitsubishi / Samsung / LG", G, 1),
            (105.4, "Máy lạnh phòng khách", "Daikin / Mitsubishi / Samsung / LG", G, 1),
            (107.6, "Tranh trang trí", "", G, 1),
            (118.0, "View trực diện hồ bơi nội khu", "Cảnh quan và cầu nối giữa các tháp", I, 0),
        ],
    },
}


def run(cmd):
    print(" ".join(map(str, cmd))[:300], flush=True)
    subprocess.run(cmd, check=True)


def build(unit):
    u = UNITS[unit]
    segs = u["segments"]
    src = str(SRC_DIR / u["file"])
    out_dir = ROOT / "public/video/bangiao"

    # timeline: thời điểm bắt đầu mỗi đoạn trên video dựng
    lens = [(b - a) / sp for a, b, sp in segs]
    starts, t = [], 0.0
    for i, L in enumerate(lens):
        starts.append(t)
        t += L - XF
    total = t + XF

    def map_t(s):
        for (a, b, sp), st in zip(segs, starts):
            if a <= s < b:
                return st + (s - a) / sp
        raise ValueError(f"{s}s không nằm trong đoạn nào")

    fr = lambda s: round(s * FPS)
    data = {
        "tourFrames": fr(total),
        "zones": [{"at": fr(map_t(s)), "label": l} for s, l in u["zones"]],
        "callouts": [{"at": fr(map_t(s)), "title": ti, "sub": su, "tier": tr, "n": n} for s, ti, su, tr, n in u["callouts"]],
    }
    (ROOT / f"src/data/bangiao_{unit}.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))
    print("tour", round(total, 2), "s; items", sum(c["n"] for c in data["callouts"]))

    enc = ["-c:v", "h264_videotoolbox", "-b:v", "70M", "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart"]
    # đoạn chính
    parts, fc = [], []
    for i, (a, b, sp) in enumerate(segs):
        parts += ["-ss", str(a), "-t", str(b - a), "-i", src]
        fc.append(f"[{i}:v]setpts=(PTS-STARTPTS)/{sp},fps={FPS},{GRADE},format=yuv420p,settb=1/{FPS}[v{i}]")
    prev = "v0"
    for i in range(1, len(segs)):
        off = starts[i]
        fc.append(f"[{prev}][v{i}]xfade=transition=fade:duration={XF}:offset={off:.3f}[x{i}]")
        prev = f"x{i}"
    run(["ffmpeg", "-v", "error", "-y", *parts, "-filter_complex", ";".join(fc), "-map", f"[{prev}]", *enc,
         str(out_dir / f"{unit}_tour.mp4")])
    # cảnh mở đầu (hook)
    a, b = u["hook"]
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(a), "-t", str(b - a), "-i", src, "-vf", f"fps={FPS},{GRADE},format=yuv420p",
         *enc, str(out_dir / f"{unit}_hook.mp4")])


if __name__ == "__main__":
    for un in sys.argv[1:]:
        build(un)
