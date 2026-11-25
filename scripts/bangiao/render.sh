#!/bin/zsh
# Render 4K + chuẩn hóa âm lượng 2-pass (-14 LUFS) -> Desktop
set -e
cd /Users/CLAUDE/bots/bds-video-engine
OUT="/Users/hoangle/Desktop/GREEN SKYLINE/video yt/XUAT BAN"
mkdir -p "$OUT"
for pair in "BanGiao1PN:Green-Skyline-can-1PN-ban-giao-noi-that-4K" "BanGiao2PN:Green-Skyline-can-2PN-ban-giao-noi-that-4K"; do
  id=${pair%%:*}; name=${pair#*:}
  npx remotion render $id out/$id.mp4 --codec=h264 --crf=16 --concurrency=4 --timeout=180000 --log=error
  J=$(ffmpeg -hide_banner -i out/$id.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  mi=$(echo $J | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
  set -- ${=mi}
  ffmpeg -v error -y -i out/$id.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$1:measured_TP=$2:measured_LRA=$3:measured_thresh=$4:offset=$5:linear=true" -c:a aac -b:a 256k -ar 48000 -movflags +faststart "$OUT/$name.mp4"
  echo "DONE $OUT/$name.mp4"
done
