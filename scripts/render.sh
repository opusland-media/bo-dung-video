#!/bin/bash
# Pipeline hoàn chỉnh: voiceover → render video
# Dùng: ./scripts/render.sh five-mistakes FiveMistakes
# Dùng: ./scripts/render.sh five-mistakes FiveMistakes --clean

set -e

VIDEO_KEY="${1:-five-mistakes}"
COMPOSITION="${2:-FiveMistakes}"
EXTRA_FLAGS="${@:3}"

REPO="$(cd "$(dirname "$0")/.." && pwd)"
OUT_FILE="$REPO/out/${VIDEO_KEY}.mp4"

echo ""
echo "═══════════════════════════════════════════"
echo "  BDS VIDEO ENGINE — Auto Render Pipeline"
echo "═══════════════════════════════════════════"
echo "  Video    : $VIDEO_KEY"
echo "  Comp     : $COMPOSITION"
echo "  Output   : $OUT_FILE"
echo ""

# Bước 1: Tạo voiceover
echo "[ 1/2 ] Tạo voiceover bằng giọng clone..."
python3 "$REPO/scripts/gen-voiceover.py" "$VIDEO_KEY" $EXTRA_FLAGS

# Bước 2: Render Remotion
echo ""
echo "[ 2/2 ] Render video Remotion..."
cd "$REPO"
npx remotion render src/index.ts "$COMPOSITION" "$OUT_FILE" \
  --log=verbose \
  --jpeg-quality=90

echo ""
echo "═══════════════════════════════════════════"
echo "  ✓ Video xong: $OUT_FILE"
echo "═══════════════════════════════════════════"
echo ""
