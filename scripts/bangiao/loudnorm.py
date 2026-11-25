"""Chuẩn hóa âm lượng 2-pass (-14 LUFS), giữ nguyên hình. python3 loudnorm.py in.mp4 out.mp4"""
import json, re, subprocess, sys
src, dst = sys.argv[1:3]
F = "loudnorm=I=-14:TP=-1.5:LRA=11"
err = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-vn", "-af", F + ":print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*target_offset[^{}]*\}", err).group(0))
af = f"{F}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-c:v", "copy", "-af", af, "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart", dst], check=True)
print("DONE", dst, m["input_i"], "->", -14)
