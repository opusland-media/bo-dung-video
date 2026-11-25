import cv2, numpy as np, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

SRC, OUT = sys.argv[1], sys.argv[2]
SS, DUR = float(sys.argv[3]), float(sys.argv[4])
import os; DEBUG=os.environ.get('DEBUG')
W, H, FPS = 1080, 1920, 30
SW, SH = 2160, 3840

# --- 4K coords at first frame
UNIT = np.float32([[463, 2276], [522, 2276], [522, 2304], [463, 2304]])
NET_X0, NET_X1, NET_Y0, NET_Y1, SHIFT = 853, 908, 2128, 3015, 49
SLOW = 2.0

def decoder(w, h):
    return subprocess.Popen(["ffmpeg", "-loglevel", "error", "-ss", str(SS), "-t", str(DUR), "-i", SRC,
        "-vf", f"setpts={SLOW}*PTS,fps={FPS},scale={w}:{h}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
def rd(p, w, h):
    b = p.stdout.read(w * h * 3)
    return None if len(b) < w * h * 3 else np.frombuffer(b, np.uint8).reshape(h, w, 3)

# ---------- pass 1: track two planes in 1080 space
def mk_mask(shape, x0, y0, x1, y1, excl=None):
    m = np.zeros(shape, np.uint8); m[y0:y1, x0:x1] = 255
    if excl: m[excl[1]:excl[3], excl[0]:excl[2]] = 0
    return m
p = decoder(W, H); f = rd(p, W, H); prev = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
trk = {}
trk["t2"] = cv2.goodFeaturesToTrack(prev, 500, 0.01, 6, mask=mk_mask(prev.shape, 190, 1050, 360, 1500))
trk["t1"] = cv2.goodFeaturesToTrack(prev, 500, 0.01, 6, mask=mk_mask(prev.shape, 360, 1060, 640, 1500, (420, 1050, 460, 1520)))
state = {k: (v.copy(), v.copy()) for k, v in trk.items()}
Hs = {k: [np.eye(3)] for k in trk}
while True:
    f = rd(p, W, H)
    if f is None: break
    g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
    for k in trk:
        ref, cur = state[k]
        nxt, st, _ = cv2.calcOpticalFlowPyrLK(prev, g, cur, None, winSize=(31, 31), maxLevel=4)
        st = st.reshape(-1) == 1
        ref, cur = ref[st], nxt[st]; state[k] = (ref, cur)
        Hm, _ = cv2.findHomography(ref, cur, cv2.RANSAC, 1.5)
        Hs[k].append(Hm)
    prev = g
N = len(Hs["t2"])
S2 = np.diag([2.0, 2.0, 1.0]); Si = np.linalg.inv(S2)
def smooth(lst, k=4):
    a = np.array(lst); o = a.copy()
    for t in range(len(a)): o[t] = a[max(0, t - k):t + k + 1].mean(0)
    return o
H2 = smooth([S2 @ h @ Si for h in Hs["t2"]])
H1 = smooth([S2 @ h @ Si for h in Hs["t1"]], 2)
print("tracked", N, {k: len(state[k][1]) for k in state})

# ---------- pass 2: render
def ease(x): x = min(max(x, 0), 1); return x * x * (3 - 2 * x)
fT = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 46)
fS = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 30)
enc = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24",
    "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "16", "-preset", "medium",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
p = decoder(SW, SH)
R = (560, 1950, 1060, 3560)          # ROI for netting fix (x0,y0,x1,y1)
clean0 = mask0 = None
for t in range(N):
    fr = rd(p, SW, SH)
    if fr is None: break
    fr = fr.copy(); sec = t / FPS
    # netting removal: per-frame horizontal clone from the clean wall bay on the left
    rect = np.float32([[NET_X0, NET_Y0], [NET_X1, NET_Y0], [NET_X1, NET_Y1], [NET_X0, NET_Y1]]).reshape(-1, 1, 2)
    q = cv2.perspectiveTransform(rect, H1[t]).reshape(-1, 2)
    sc = np.sqrt(abs(np.linalg.det(H1[t][:2, :2])))
    sh = int(round(SHIFT * sc))
    qx0, qx1 = int(q[:, 0].min()), int(q[:, 0].max()); qy0, qy1 = int(q[:, 1].min()), int(q[:, 1].max())
    x0, y0 = max(qx0 - sh - 80, 0), max(qy0 - int(500 * sc), 0)
    x1, y1 = min(qx1 + 60, SW), min(qy1 + 20, SH)
    roi = fr[y0:y1, x0:x1].copy()
    m = np.zeros(roi.shape[:2], np.uint8)
    cv2.fillPoly(m, [(q - [x0, y0]).astype(np.int32)], 255)
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    g = cv2.inRange(hsv, (38, 50, 35), (95, 255, 230))
    g[:, :max(qx0 - x0 - 20, 0)] = 0; g[:, qx1 - x0 + 8:] = 0
    g = cv2.morphologyEx(g, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    ys = np.where(g.max(1) > 0)[0]
    if len(ys):
        top = ys.min() - int(14 * sc)
        cv2.rectangle(m, (qx0 - x0 - int(4 * sc), max(top, 0)), (qx1 - x0 + int(2 * sc), qy0 - y0 + 5), 255, -1)
        m = cv2.bitwise_or(m, cv2.dilate(g, np.ones((15, 15), np.uint8)))
    mf = cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), 2.5)[..., None]
    src = np.roll(roi, sh, axis=1)
    fr[y0:y1, x0:x1] = (roi * (1 - mf) + src * mf).astype(np.uint8)
    if DEBUG:
        cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE); cv2.drawContours(fr[y0:y1, x0:x1], cs, -1, (0, 0, 255), 3)
    # unit highlight
    P = cv2.perspectiveTransform(UNIT.reshape(-1, 1, 2), H2[t]).reshape(-1, 2)
    a = ease((sec - 2.5) / 1.0)
    out = fr.astype(np.float32)
    if a > 0:
        bx0, by0 = int(P[:, 0].min()) - 140, int(P[:, 1].min()) - 140
        bx1, by1 = int(P[:, 0].max()) + 140, int(P[:, 1].max()) + 140
        bx0, by0 = max(bx0, 0), max(by0, 0)
        roi = out[by0:by1, bx0:bx1]
        m = np.zeros(roi.shape[:2], np.float32)
        cv2.fillPoly(m, [(P - [bx0, by0]).astype(np.int32)], 1.0)
        m = cv2.GaussianBlur(m, (0, 0), 1.5)
        glow = cv2.GaussianBlur(m, (0, 0), 24)
        lit = np.clip(roi * 1.22 + np.array([10, 70, 125], np.float32), 0, 255)
        roi = roi * (1 - m[..., None] * a) + lit * (m[..., None] * a)
        roi = roi + glow[..., None] * np.array([60, 150, 230], np.float32) * 0.9 * a
        out[by0:by1, bx0:bx1] = np.clip(roi, 0, 255)
    # push-in toward unit
    TT = DUR * SLOW
    z = 1.0 + 1.25 * ease(sec / TT)
    k = ease(sec / (TT * 0.8))
    uc = P.mean(0); c = np.array([SW / 2, SH / 2]) * (1 - k) + uc * k
    cw_, ch_ = SW / z, SH / z
    cx = np.clip(c[0], cw_ / 2, SW - cw_ / 2); cy = np.clip(c[1] + ch_ * 0.1 * k, ch_ / 2, SH - ch_ / 2)
    M = np.float32([[W / cw_, 0, -(cx - cw_ / 2) * W / cw_], [0, H / ch_, -(cy - ch_ / 2) * H / ch_]])
    o = np.clip(cv2.warpAffine(out, M, (W, H), flags=cv2.INTER_AREA), 0, 255).astype(np.uint8)
    al = ease((sec - 3.2) / 0.8)
    if al > 0:
        Po = (P - [cx - cw_ / 2, cy - ch_ / 2]) * (W / cw_)
        img = Image.fromarray(cv2.cvtColor(o, cv2.COLOR_BGR2RGB)).convert("RGBA")
        ov = Image.new("RGBA", img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
        t1, t2 = "CĂN T2.25.12", "3PN góc · Tầng 25 · Ban công nhìn T1"
        w = int(max(d.textlength(t1, font=fT), d.textlength(t2, font=fS)) + 60)
        lx = int(np.clip(Po[:, 0].min() - 50, 120, 960 - w))
        ly = int(np.clip(Po[:, 1].min() - 400 - 24 * (1 - al), 170, 1600))
        A = int(235 * al)
        d.rounded_rectangle([lx, ly, lx + w, ly + 122], 20, fill=(255, 255, 255, A))
        d.rounded_rectangle([lx, ly, lx + 10, ly + 122], 5, fill=(214, 160, 40, A))
        tx = int(np.clip(Po[:, 0].mean(), lx + 30, lx + w - 30)); d.polygon([(tx - 16, ly + 121), (tx + 16, ly + 121), (tx, ly + 142)], fill=(255, 255, 255, A))
        d.text((lx + 30, ly + 14), t1, font=fT, fill=(20, 40, 30, int(255 * al)))
        d.text((lx + 30, ly + 74), t2, font=fS, fill=(70, 80, 75, int(255 * al)))
        o = cv2.cvtColor(np.array(Image.alpha_composite(img, ov).convert("RGB")), cv2.COLOR_RGB2BGR)
    enc.stdin.write(np.ascontiguousarray(o).tobytes())
enc.stdin.close(); enc.wait(); print("done")
