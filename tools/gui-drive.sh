#!/usr/bin/env bash
# Gửi file thành phẩm về Google Drive của người dùng (thư mục "Video thành phẩm").
# Cần biến môi trường DRIVE_HOP_URL và DRIVE_HOP_KEY (đặt trong cài đặt môi trường đám mây).
# Dùng: tools/gui-drive.sh outputs/video.mp4 [outputs/thumb.png ...]
set -euo pipefail
: "${DRIVE_HOP_URL:?Chưa có DRIVE_HOP_URL — người dùng cần cài Hộp nhận file (tools/drive-hop)}"
: "${DRIVE_HOP_KEY:?Chưa có DRIVE_HOP_KEY}"
for f in "$@"; do
  [ -f "$f" ] || { echo "Không thấy file: $f" >&2; exit 1; }
  name=$(basename "$f")
  size=$(wc -c < "$f" | tr -d ' ')
  mime=$(file -b --mime-type "$f")
  req=$(python3 -c 'import json,sys; print(json.dumps({"key":sys.argv[1],"action":"start","name":sys.argv[2],"mimeType":sys.argv[3],"size":int(sys.argv[4])}))' "$DRIVE_HOP_KEY" "$name" "$mime" "$size")
  resp=$(curl -sSL -H 'Content-Type: application/json' --data "$req" "$DRIVE_HOP_URL")
  up=$(printf '%s' "$resp" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["uploadUrl"]) if d.get("ok") else sys.exit("Lỗi hộp nhận: "+json.dumps(d,ensure_ascii=False))')
  out=$(curl -sS -X PUT -H "Content-Type: $mime" --upload-file "$f" "$up")
  link=$(printf '%s' "$out" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("webViewLink") or d)')
  echo "$name → $link"
done
