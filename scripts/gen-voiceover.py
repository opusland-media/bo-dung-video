#!/usr/bin/env python3
"""
Pipeline: voiceover-data.json → OmniVoice → ffmpeg ghép timing → audio output

Dùng:
  python3 scripts/gen-voiceover.py five-mistakes
  python3 scripts/gen-voiceover.py five-mistakes --ref /path/to/voice-ref.wav
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

# ── Cấu hình ──────────────────────────────────────────────────────────────────
REPO_ROOT    = Path(__file__).parent.parent
DATA_FILE    = Path(__file__).parent / "voiceover-data.json"
OMNIVOICE    = Path.home() / "omnivoice-env/bin/omnivoice-infer"
DEFAULT_REF  = Path.home() / "Desktop/voice-ref-10s.wav"
LANGUAGE     = "vi"

def log(msg: str):
    print(f"  {msg}", flush=True)

def run(cmd: list, desc: str) -> subprocess.CompletedProcess:
    log(f"→ {desc}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"\n[LỖI] {desc}")
        print(result.stderr[-800:])
        sys.exit(1)
    return result

def generate_beat_audio(beat: dict, ref_audio: Path, out_dir: Path) -> Path:
    out_file = out_dir / f"{beat['id']}.wav"
    if out_file.exists():
        log(f"skip {beat['id']} (đã có)")
        return out_file

    run([
        str(OMNIVOICE),
        "--text",      beat["text"],
        "--ref_audio", str(ref_audio),
        "--output",    str(out_file),
        "--language",  LANGUAGE,
    ], f"Tổng hợp giọng: [{beat['id']}] {beat['text'][:40]}...")

    return out_file

def get_duration(path: Path) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(path)],
        capture_output=True, text=True
    )
    return float(result.stdout.strip())

def stitch_audio(beats: list, beat_files: dict, total_duration: float, output: Path):
    """Ghép các beat vào đúng vị trí thời gian bằng ffmpeg adelay."""
    log("Ghép audio theo timing...")

    inputs = []
    filter_parts = []
    mix_labels = []

    for i, beat in enumerate(beats):
        f = beat_files[beat["id"]]
        inputs += ["-i", str(f)]
        delay_ms = int(beat["startTime"] * 1000)
        label = f"[a{i}]"
        filter_parts.append(f"[{i}]adelay={delay_ms}|{delay_ms}[a{i}]")
        mix_labels.append(label)

    n = len(beats)
    amix = "".join(mix_labels) + f"amix=inputs={n}:duration=longest:normalize=0[out]"
    filter_complex = ";".join(filter_parts) + ";" + amix

    output.parent.mkdir(parents=True, exist_ok=True)

    run([
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "[out]",
        "-t", str(total_duration),
        "-ar", "44100", "-ac", "2",
        "-codec:a", "libmp3lame", "-q:a", "2",
        str(output),
    ], f"ffmpeg mix → {output.name}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("video", help="Tên video trong voiceover-data.json (vd: five-mistakes)")
    parser.add_argument("--ref",   default=str(DEFAULT_REF), help="File giọng tham chiếu (.wav)")
    parser.add_argument("--clean", action="store_true",      help="Xoá cache beat audio, tạo lại từ đầu")
    args = parser.parse_args()

    # Load data
    with open(DATA_FILE) as f:
        data = json.load(f)

    if args.video not in data["videos"]:
        print(f"[LỖI] Không tìm thấy '{args.video}' trong voiceover-data.json")
        sys.exit(1)

    cfg      = data["videos"][args.video]
    beats    = [b for b in cfg["beats"] if b.get("text", "").strip()]
    output   = REPO_ROOT / cfg["output"]
    ref      = Path(args.ref)

    print(f"\n{'─'*50}")
    print(f"  Video    : {args.video}")
    print(f"  Beats    : {len(beats)} đoạn cần tổng hợp")
    print(f"  Ref audio: {ref}")
    print(f"  Output   : {output}")
    print(f"{'─'*50}\n")

    if not ref.exists():
        print(f"[LỖI] Không tìm thấy file ref audio: {ref}")
        sys.exit(1)

    if not OMNIVOICE.exists():
        print(f"[LỖI] Không tìm thấy omnivoice-infer tại: {OMNIVOICE}")
        sys.exit(1)

    # Thư mục cache beat audio
    cache_dir = REPO_ROOT / f".voiceover-cache/{args.video}"
    if args.clean and cache_dir.exists():
        import shutil
        shutil.rmtree(cache_dir)
    cache_dir.mkdir(parents=True, exist_ok=True)

    # Tổng hợp từng beat
    beat_files = {}
    for beat in beats:
        beat_files[beat["id"]] = generate_beat_audio(beat, ref, cache_dir)

    # Ghép theo timing
    stitch_audio(beats, beat_files, cfg["totalDuration"], output)

    print(f"\n✓ Hoàn thành → {output}")
    print(f"  Duration: {get_duration(output):.2f}s")

if __name__ == "__main__":
    main()
