#!/usr/bin/env python3
"""
generate-beat-images.py
Sinh ảnh AI cho từng beat trong video script — dùng Pollinations.ai (miễn phí, không cần API key).

Usage:
  python3 scripts/generate-beat-images.py five-mistakes
  python3 scripts/generate-beat-images.py three-mistakes
"""

import sys, os, urllib.request, urllib.parse, time

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "beats")

# ─── Prompts theo script + beat ID ───────────────────────────────────────────
# Phong cách chung: cinematic, dark-moody, phù hợp làm background với text overlay
# Tránh: text trong ảnh, logo, watermark
SCRIPTS: dict[str, dict[str, str]] = {
    "five-mistakes": {
        "hook": (
            "cinematic aerial night view Ho Chi Minh City Vietnam skyline, "
            "golden city lights reflecting on river, dramatic storm clouds, "
            "high-rise buildings, 8k ultra realistic photography"
        ),
        "problem": (
            "stressed Vietnamese person reviewing legal documents at office desk, "
            "papers scattered, worried expression, dark moody cinematic lighting, "
            "urban window background, photorealistic"
        ),
        "tip-1": (
            "Vietnamese red book property certificate close-up, "
            "official government land title document texture, "
            "dark wooden table surface, dramatic side lighting, macro photography"
        ),
        "tip-2": (
            "financial planning concept, budget allocation chart on glass board, "
            "modern minimalist office, calculator and Vietnamese dong currency, "
            "blue teal color grading, cinematic"
        ),
        "tip-3": (
            "aerial drone view of Binh Duong Vietnam urban planning zone, "
            "construction cranes, infrastructure roads being built, "
            "golden hour light, bird's eye perspective, 4k cinematic"
        ),
        "tip-4": (
            "modern Vietnamese condominium apartment towers exterior, "
            "Binh Duong Thuan An skyline, blue sky with clouds, "
            "architectural photography, wide angle, premium real estate"
        ),
        "tip-5": (
            "Vietnamese lawyer reviewing property contract documents, "
            "close-up hands with pen on legal paper, dark leather desk, "
            "soft dramatic lighting, professional cinematic photography"
        ),
        "summary": (
            "happy Vietnamese young couple in bright modern apartment interior, "
            "floor-to-ceiling windows, city view, contemporary furniture, "
            "warm golden hour light, lifestyle photography"
        ),
        "cta": (
            "luxury high-rise condominium tower Thuan An Binh Duong Vietnam, "
            "glass facade reflecting sunset golden hour, palm trees, "
            "premium architecture, wide establishing shot, cinematic 8k"
        ),
    },
    "three-mistakes": {
        "hook": (
            "Vietnamese real estate investor at laptop, charts on screen, "
            "modern office, dramatic cinematic lighting, dark teal color grade"
        ),
        "stat-intro": (
            "data visualization concept, glowing bar charts floating in dark space, "
            "blue and gold color scheme, abstract financial data, cinematic"
        ),
        "mistake-1": (
            "urban Vietnamese apartment building under construction, scaffolding, "
            "incomplete structure, dramatic overcast sky, architectural photography"
        ),
        "solution-1": (
            "The Habitat Binh Duong luxury apartment complex exterior, "
            "modern architecture, green landscaping, golden hour, premium real estate"
        ),
        "mistake-2": (
            "Vietnamese family stressed about financial planning, budget calculations, "
            "bills and documents on table, worried expressions, warm indoor lighting"
        ),
        "mistake-3": (
            "aerial satellite view Binh Duong Vietnam industrial zone VSIP, "
            "highways infrastructure, urban expansion, drone photography"
        ),
        "solution-3": (
            "The Emerald Golf View luxury apartment Thuan An, "
            "golf course view, glass facade, premium architecture, dusk lighting"
        ),
        "cta": (
            "successful Vietnamese couple signing property agreement, "
            "celebrating new home, modern interior, champagne glasses, "
            "warm cinematic lighting"
        ),
    },
}

# ─── Download ─────────────────────────────────────────────────────────────────
def download_image(prompt: str, output_path: str, beat_id: str, seed: int = 42) -> bool:
    encoded = urllib.parse.quote(
        prompt + ", no text, no watermark, no logo",
    )
    url = (
        f"https://image.pollinations.ai/prompt/{encoded}"
        f"?width=1080&height=1920&nologo=true&seed={seed}&model=flux&enhance=true"
    )

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    for attempt in range(3):
        try:
            print(f"  [{attempt+1}/3] Generating '{beat_id}'...")
            req = urllib.request.Request(url, headers={"User-Agent": "BDSVideoEngine/1.0"})
            with urllib.request.urlopen(req, timeout=90) as resp:
                data = resp.read()
            if len(data) < 5000:
                raise ValueError(f"Response too small ({len(data)} bytes) — likely error")
            with open(output_path, "wb") as f:
                f.write(data)
            print(f"  ✓ {os.path.basename(output_path)} ({len(data) // 1024} KB)")
            return True
        except Exception as e:
            print(f"  ✗ Attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                time.sleep(5)
    return False


def main():
    script_id = sys.argv[1] if len(sys.argv) > 1 else "five-mistakes"
    beats = SCRIPTS.get(script_id)
    if not beats:
        print(f"Unknown script: '{script_id}'. Available: {list(SCRIPTS.keys())}")
        sys.exit(1)

    print(f"\n🎨 Generating {len(beats)} images for '{script_id}'")
    print(f"   Output: public/images/beats/{script_id}-*.jpg\n")

    ok = 0
    seeds = {bid: 100 + i * 7 for i, bid in enumerate(beats)}  # reproducible per beat
    for beat_id, prompt in beats.items():
        path = os.path.join(PUBLIC_DIR, f"{script_id}-{beat_id}.jpg")
        if os.path.exists(path):
            print(f"  ⏭  Skip '{beat_id}' (already exists)")
            ok += 1
            continue
        if download_image(prompt, path, beat_id, seed=seeds[beat_id]):
            ok += 1
        time.sleep(2)  # polite rate limit

    print(f"\n{'✅' if ok == len(beats) else '⚠️ '} Done: {ok}/{len(beats)} images")
    print(f"\nThêm vào script:\n")
    for beat_id in beats:
        print(f'    aiImage: "images/beats/{script_id}-{beat_id}.jpg",')


if __name__ == "__main__":
    main()
