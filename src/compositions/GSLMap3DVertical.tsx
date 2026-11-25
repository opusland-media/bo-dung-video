import React, { useMemo } from "react";
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import MAP from "../data/map3dGreenSkyline.json";

/**
 * Green Skyline — VỊ TRÍ, bản đồ 3D nền tối (dọc 1080×1920, 30fps), khớp giọng thật (public/audio/loc/voice_vitri.wav).
 * Lời: "Green Skyline đã xây xong và nằm hiện hữu trên trục Phạm Văn Đồng nối dài. Kế bên là GO! Dĩ An và bệnh viện quốc tế
 *       Hoàn Mỹ, 5 phút di chuyển tới làng đại học và nếu anh chị ở đây và làm việc tại sân bay Tân Sơn Nhất thì chỉ mất
 *       25 phút là di chuyển về đến nhà."
 * Bản đồ: OpenStreetMap (world px @ z15), chiếu phối cảnh bằng camera tự viết (nét vector ở mọi độ phân giải).
 * Tuyến sân bay: Trường Sơn → Hồng Hà → Phạm Văn Đồng (thẳng, qua cầu Bình Lợi) → PVĐ nối dài (Hoàng Cầm) → dự án.
 * withVoice=false: không phát giọng (để ghép trong CapCut).
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["600", "700", "800", "900"], subsets: ["vietnamese", "latin"] });

export const MAP3D_FRAMES = 410;
const W = 1080, H = 1920, CX = 540, FOCAL = 1600;
const M_PER_PX = 4.69; // z15 @ lat 10.9
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

// ---------------- dữ liệu ----------------
type Poly = { a: Float32Array; cx: number; cy: number; r: number };
const mk = (arr: number[]): Poly => {
  const a = Float32Array.from(arr);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let i = 0; i < a.length; i += 2) { x0 = Math.min(x0, a[i]); x1 = Math.max(x1, a[i]); y0 = Math.min(y0, a[i + 1]); y1 = Math.max(y1, a[i + 1]); }
  return { a, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, r: Math.hypot(x1 - x0, y1 - y0) / 2 };
};
const D = MAP as unknown as {
  layers: Record<string, number[][]>; routes: Record<string, number[]>; poi: Record<string, [number, number]>;
  meta: { tsn_km: number; dhqg_km: number }; areas: Record<string, { name: string; pts: number[] }[]>;
  bld: { p: number[]; h: number; n: string; gs: boolean }[];
};
const LAYERS: Record<string, Poly[]> = Object.fromEntries(Object.entries(D.layers).map(([k, v]) => [k, v.map(mk)]));
const POI = D.poi;
const ROUTE = Object.fromEntries(Object.entries(D.routes).map(([k, v]) => [k, Float32Array.from(v)])) as Record<string, Float32Array>;
const AREAS = Object.fromEntries(Object.entries(D.areas).map(([k, v]) => [k, v.map((o) => mk(o.pts))])) as Record<string, Poly[]>;
const BLD = D.bld.map((b) => ({ ...mk(b.p), h: b.h, gs: b.gs }));

// cumulative length for progressive routes
const cum = (a: Float32Array) => { const c = [0]; for (let i = 2; i < a.length; i += 2) c.push(c[c.length - 1] + Math.hypot(a[i] - a[i - 2], a[i + 1] - a[i - 1])); return c; };
const RCUM = Object.fromEntries(Object.entries(ROUTE).map(([k, v]) => [k, cum(v)])) as Record<string, number[]>;
const subRoute = (k: string, p0: number, p1: number): number[] => {
  const a = ROUTE[k], c = RCUM[k], L = c[c.length - 1], s0 = p0 * L, s1 = p1 * L, out: number[] = [];
  for (let i = 0; i < c.length; i++) {
    if (c[i] >= s0 && c[i] <= s1) out.push(a[2 * i], a[2 * i + 1]);
    if (i < c.length - 1) {
      for (const s of [s0, s1]) if (c[i] < s && c[i + 1] > s) { const t = (s - c[i]) / (c[i + 1] - c[i]); out.push(a[2 * i] + (a[2 * i + 2] - a[2 * i]) * t, a[2 * i + 1] + (a[2 * i + 3] - a[2 * i + 1]) * t); }
    }
  }
  return out;
};
const pointAt = (k: string, p: number): [number, number] => { const s = subRoute(k, 0, Math.max(0.0005, p)); return [s[s.length - 2], s[s.length - 1]]; };

// ---------------- camera ----------------
type Cam = { x: number; y: number; s: number; p: number; b: number; cy: number };
const G = POI.gs, TSN = POI.tsn, DH = POI.dhqg;
const KEYS: (Cam & { f: number })[] = [
  { f: 0, x: G[0], y: G[1], s: 11, p: 0, b: 0, cy: 960 },
  { f: 30, x: G[0], y: G[1], s: 8, p: 6, b: -6, cy: 960 },
  { f: 64, x: G[0] - 4, y: G[1] + 4, s: 4.2, p: 54, b: -32, cy: 1080 },
  { f: 92, x: G[0] - 520, y: G[1] + 470, s: 0.62, p: 50, b: -138, cy: 1160 },
  { f: 112, x: G[0] - 560, y: G[1] + 500, s: 0.58, p: 52, b: -142, cy: 1160 },
  { f: 134, x: G[0], y: G[1], s: 3.1, p: 48, b: -20, cy: 1060 },
  { f: 186, x: G[0], y: G[1], s: 3.3, p: 50, b: 8, cy: 1060 },
  { f: 214, x: (G[0] + DH[0]) / 2, y: (G[1] + DH[1]) / 2, s: 1.05, p: 42, b: 108, cy: 1060 },
  { f: 244, x: (G[0] + DH[0]) / 2 + 30, y: (G[1] + DH[1]) / 2, s: 1.0, p: 44, b: 114, cy: 1060 },
  { f: 270, x: G[0] - 60, y: G[1] + 50, s: 1.4, p: 40, b: -136, cy: 1100 },
  { f: 318, x: (G[0] + TSN[0]) / 2, y: (G[1] + TSN[1]) / 2, s: 0.27, p: 34, b: -136, cy: 1020 },
  { f: 352, x: (G[0] + TSN[0]) / 2 + 60, y: (G[1] + TSN[1]) / 2 - 60, s: 0.26, p: 36, b: -138, cy: 1020 },
  { f: 382, x: G[0], y: G[1], s: 2.1, p: 52, b: -150, cy: 1100 },
  { f: 410, x: G[0], y: G[1], s: 2.4, p: 54, b: -160, cy: 1100 },
];
const camAt = (f: number): Cam => {
  let i = 0; while (i < KEYS.length - 2 && f > KEYS[i + 1].f) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const t = Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, (f - a.f) / (b.f - a.f))));
  const ls = Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * t;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, s: Math.exp(ls), p: a.p + (b.p - a.p) * t, b: a.b + (b.b - a.b) * t, cy: a.cy + (b.cy - a.cy) * t };
};

type Proj = { (x: number, y: number, z?: number): [number, number, number] };
const makeProj = (c: Cam): Proj => {
  const p = (c.p * Math.PI) / 180, b = (c.b * Math.PI) / 180, Dd = FOCAL / c.s;
  const gx = Math.sin(b), gy = -Math.cos(b);
  const Cx = c.x - gx * Dd * Math.sin(p), Cy = c.y - gy * Dd * Math.sin(p), Cz = Dd * Math.cos(p);
  const fx = gx * Math.sin(p), fy = gy * Math.sin(p), fz = -Math.cos(p);
  const rx = Math.cos(b), ry = Math.sin(b);
  // up = fwd × right
  const ux = fy * 0 - fz * ry, uy = fz * rx - fx * 0, uz = fx * ry - fy * rx;
  return (x, y, z = 0) => {
    const vx = x - Cx, vy = y - Cy, vz = z - Cz;
    const xc = vx * rx + vy * ry, yc = vx * ux + vy * uy + vz * uz, zc = vx * fx + vy * fy + vz * fz;
    return [CX + (FOCAL * xc) / zc, c.cy - (FOCAL * yc) / zc, zc];
  };
};

const NEAR = 40;
const polyD = (a: ArrayLike<number>, pr: Proj, close = false, z = 0) => {
  let d = "", pen = false, prev: [number, number, number] | null = null;
  for (let i = 0; i < a.length; i += 2) {
    const q = pr(a[i], a[i + 1], z);
    if (q[2] > NEAR) {
      if (prev && prev[2] <= NEAR) pen = false;
      d += (pen ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1); pen = true;
    } else pen = false;
    prev = q;
  }
  return d && close ? d + "Z" : d;
};

// ---------------- lớp bản đồ ----------------
const STYLE: Record<string, { c: string; w: number; fill?: boolean; o?: number }> = {
  water: { c: "#0D2C3D", w: 0, fill: true }, park: { c: "#0E2219", w: 0, fill: true }, river: { c: "#123A4F", w: 3 },
  minor: { c: "#1A2430", w: 0.8 }, tertiary: { c: "#222E3B", w: 1.1 }, secondary: { c: "#2A3746", w: 1.5 },
  primary: { c: "#354456", w: 2.0 }, trunk: { c: "#43566B", w: 2.6 }, runway: { c: "#3A3550", w: 6 },
};
const BaseMap: React.FC<{ c: Cam; pr: Proj }> = ({ c, pr }) => {
  const R = (1500 / c.s) * (1 + 2.2 * Math.sin((c.p * Math.PI) / 180));
  const ws = Math.pow(c.s, 0.35);
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
      {Object.entries(STYLE).map(([k, st]) => {
        if (k === "minor" && c.s < 0.45) return null;
        let d = "";
        for (const pl of LAYERS[k] || []) { if (Math.hypot(pl.cx - c.x, pl.cy - c.y) - pl.r > R) continue; d += polyD(pl.a, pr, !!st.fill); }
        return st.fill ? <path key={k} d={d} fill={st.c} /> : <path key={k} d={d} fill="none" stroke={st.c} strokeWidth={st.w * ws} strokeLinecap="round" strokeLinejoin="round" />;
      })}
    </svg>
  );
};

// ---------------- toà nhà 3D ----------------
const Buildings: React.FC<{ pr: Proj; c: Cam; grow: number; gsGlow: number }> = ({ pr, c, grow, gsGlow }) => {
  if (c.s < 0.9) return null;
  const items = BLD.map((b) => {
    const h = (b.h / M_PER_PX) * 1.25 * grow;
    const n = b.a.length / 2;
    const base: [number, number, number][] = [], top: [number, number, number][] = [];
    for (let i = 0; i < n; i++) { base.push(pr(b.a[2 * i], b.a[2 * i + 1], 0)); top.push(pr(b.a[2 * i], b.a[2 * i + 1], h)); }
    const depth = pr(b.cx, b.cy, h / 2)[2];
    return { b, base, top, depth, n };
  }).filter((o) => o.base.every((q) => q[2] > NEAR)).sort((p, q) => q.depth - p.depth);
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
      {items.map(({ b, base, top, n }, k) => {
        const gs = b.gs;
        const faces: React.ReactNode[] = [];
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          const cross = (base[j][0] - base[i][0]) * (top[i][1] - base[i][1]) - (base[j][1] - base[i][1]) * (top[i][0] - base[i][0]);
          const ex = b.a[2 * j] - b.a[2 * i], ey = b.a[2 * j + 1] - b.a[2 * i + 1];
          const shade = 0.55 + 0.45 * Math.abs(Math.cos(Math.atan2(ey, ex) - 0.6));
          const col = gs ? `rgba(${Math.round(30 + 60 * shade)},${Math.round(150 + 70 * shade)},${Math.round(110 + 50 * shade)},0.95)` : `rgba(${Math.round(28 * shade + 10)},${Math.round(38 * shade + 12)},${Math.round(50 * shade + 16)},0.96)`;
          faces.push(<path key={i} d={`M${base[i][0]} ${base[i][1]}L${base[j][0]} ${base[j][1]}L${top[j][0]} ${top[j][1]}L${top[i][0]} ${top[i][1]}Z`} fill={col} stroke={gs ? "rgba(180,255,220,0.35)" : "rgba(120,150,180,0.10)"} strokeWidth={0.6} opacity={cross === 0 ? 0 : 1} />);
        }
        const roof = "M" + top.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join("L") + "Z";
        return (
          <g key={k} filter={gs && gsGlow > 0 ? "url(#gsglow)" : undefined}>
            {faces}
            <path d={roof} fill={gs ? "#7DF2C2" : "#2B3949"} stroke={gs ? "#E9FFF5" : "rgba(140,170,200,0.25)"} strokeWidth={gs ? 1.2 : 0.6} />
          </g>
        );
      })}
      <defs><filter id="gsglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
    </svg>
  );
};

// ---------------- route phát sáng ----------------
const Glow: React.FC<{ d: string; color: string; w: number; o?: number }> = ({ d, color, w, o = 1 }) => (
  <g opacity={o}>
    <path d={d} fill="none" stroke={color} strokeWidth={w * 5} strokeOpacity={0.12} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={color} strokeWidth={w * 2.4} strokeOpacity={0.3} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke="#fff" strokeWidth={w * 0.35} strokeOpacity={0.85} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
const Comet: React.FC<{ x: number; y: number; color: string; r?: number }> = ({ x, y, color, r = 10 }) => (
  <g>
    <circle cx={x} cy={y} r={r * 3.2} fill={color} opacity={0.18} />
    <circle cx={x} cy={y} r={r * 1.6} fill={color} opacity={0.45} />
    <circle cx={x} cy={y} r={r * 0.7} fill="#fff" />
  </g>
);

// ---------------- UI ----------------
const Chip: React.FC<{ f: number; at: number; out: number; text: string; top?: number }> = ({ f, at, out, text, top = 300 }) => {
  const { fps } = useVideoConfig();
  if (f < at - 1 || f > out + 8) return null;
  const k = spring({ frame: f - at, fps, config: { damping: 15, stiffness: 190, mass: 0.6 } });
  const o = interpolate(f, [out, out + 8], [1, 0], clamp);
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin(f / 5));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: Math.min(1, k * 1.4) * o, transform: `translateY(${(1 - k) * -26}px) scale(${0.9 + 0.1 * k})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 30px", borderRadius: 40, background: "rgba(10,14,20,0.78)", border: "2px solid rgba(255,70,80,0.75)", boxShadow: "0 0 26px rgba(255,60,70,0.35)" }}>
        <div style={{ width: 20, height: 20, borderRadius: 20, background: "#FF3B47", boxShadow: `0 0 ${14 * pulse}px #FF3B47`, opacity: pulse }} />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: "#fff", letterSpacing: 1.5 }}>{text}</div>
      </div>
    </div>
  );
};

const Pin: React.FC<{ x: number; y: number; k: number; children: React.ReactNode; color: string; stem?: number }> = ({ x, y, k, children, color, stem = 90 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -100%) scale(${k})`, transformOrigin: "50% 100%", opacity: Math.min(1, k * 1.5) }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {children}
      <div style={{ width: 4, height: stem, background: `linear-gradient(${color}, rgba(255,255,255,0.1))` }} />
      <div style={{ width: 18, height: 18, borderRadius: 18, background: color, boxShadow: `0 0 18px ${color}`, marginTop: -9 }} />
    </div>
  </div>
);

const Card: React.FC<{ icon: React.ReactNode; title: string; sub: string; color: string }> = ({ icon, title, sub, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 22px 12px 12px", borderRadius: 22, background: "rgba(10,14,20,0.86)", border: `2px solid ${color}`, boxShadow: `0 0 24px ${color}55` }}>
    <div style={{ width: 60, height: 60, borderRadius: 60, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
    <div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: "#fff", whiteSpace: "nowrap" }}>{title}</div>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: "rgba(255,255,255,0.75)", whiteSpace: "nowrap" }}>{sub}</div>
    </div>
  </div>
);
const IcCart = <svg width="34" height="34" viewBox="0 0 24 24"><path d="M3 4h2l2.4 10.2a2 2 0 002 1.6h7.7a2 2 0 001.9-1.4L21 8H6.2" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="10" cy="20" r="1.6" fill="#fff" /><circle cx="17" cy="20" r="1.6" fill="#fff" /></svg>;
const IcCross = <svg width="34" height="34" viewBox="0 0 24 24"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" fill="#fff" /></svg>;
const IcCap = <svg width="36" height="36" viewBox="0 0 24 24"><path d="M12 4L1 9l11 5 9-4.1V16h2V9z" fill="#fff" /><path d="M5 12.2V16c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8l-7 3.2z" fill="#fff" /></svg>;
const IcPlane = <svg width="36" height="36" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" fill="#fff" /></svg>;

const Timer: React.FC<{ f: number; at: number; to: number; dur: number; label: string; color: string; out: number }> = ({ f, at, to, dur, label, color, out }) => {
  const { fps } = useVideoConfig();
  if (f < at - 1 || f > out + 8) return null;
  const k = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 180 } });
  const v = Math.round(interpolate(f, [at, at + dur], [0, to], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const o = interpolate(f, [out, out + 8], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1470, display: "flex", justifyContent: "center", opacity: Math.min(1, k * 1.4) * o, transform: `scale(${0.8 + 0.2 * k})` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "10px 40px 16px", borderRadius: 28, background: "rgba(10,14,20,0.82)", border: `3px solid ${color}`, boxShadow: `0 0 40px ${color}66` }}>
        <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 130, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{v}</span>
        <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 56, color: "#fff" }}>PHÚT</span>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: "rgba(255,255,255,0.75)", marginLeft: 6 }}>{label}</span>
      </div>
    </div>
  );
};

// ---------------- composition ----------------
export const GSLMap3DVertical: React.FC<{ withVoice?: boolean }> = ({ withVoice = true }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = camAt(f);
  const pr = useMemo(() => makeProj(c), [c.x, c.y, c.s, c.p, c.b, c.cy]);
  const sp = (at: number, damping = 13) => spring({ frame: f - at, fps, config: { damping, stiffness: 170, mass: 0.7 } });

  const introO = interpolate(f, [18, 34], [1, 0], clamp);
  const grow = interpolate(f, [30, 70], [0.02, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  // routes
  const axisP = ramp(f, 76, 104);
  const dhP = ramp(f, 200, 234);
  const tsnP = ramp(f, 296, 358);
  const axisD = axisP > 0 ? polyD(subRoute("axis", 0, axisP), pr) : "";
  const dhD = dhP > 0 ? polyD(subRoute("dhqg", 0, dhP), pr) : "";
  const tsnD = tsnP > 0 ? polyD(subRoute("tsn", 0, tsnP), pr) : "";
  // light pulses along axis (toward project)
  const pulses = f >= 100 && f < 118 + 40 ? [0, 0.33, 0.66].map((o) => ((f - 100) / 40 + o) % 1) : [];

  // radar ring on ground (250 m)
  const ringR = (250 / M_PER_PX) * ramp(f, 118, 136);
  const ring: number[] = [];
  for (let i = 0; i <= 96; i++) { const a = (i / 96) * Math.PI * 2; ring.push(G[0] + Math.cos(a) * ringR, G[1] + Math.sin(a) * ringR); }
  const sweepA = (f / 22) * Math.PI * 2;
  const wedge: number[] = [G[0], G[1]];
  for (let i = 0; i <= 16; i++) { const a = sweepA - (i / 16) * 0.9; wedge.push(G[0] + Math.cos(a) * ringR, G[1] + Math.sin(a) * ringR); }
  const showRing = f >= 118 && f < 200;
  const ringO = interpolate(f, [190, 200], [1, 0], clamp);

  const gsP = pr(G[0], G[1], (128 / M_PER_PX) * 1.25 * grow);
  const goP = pr(POI.go[0], POI.go[1]);
  const hmP = pr(POI.hoanmy[0], POI.hoanmy[1]);
  const dhqP = pr(DH[0], DH[1]);
  const tsnPt = pr(TSN[0], TSN[1]);

  const shock = (at: number) => { const t = (f - at) / 26; return t > 0 && t < 1 ? t : -1; };

  return (
    <AbsoluteFill style={{ background: "#070B10", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(120% 70% at 50% 60%, #0E1620 0%, #070B10 70%)" }} />
      <BaseMap c={c} pr={pr} />

      {/* vùng sáng: Làng ĐH, sân bay, phường Đông Hòa */}
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        {(AREAS.dhqg || []).map((a, i) => <path key={i} d={polyD(a.a, pr, true)} fill="#3FC6FF" fillOpacity={0.16 * ramp(f, 214, 230) * (1 - ramp(f, 262, 272))} stroke="#7FDBFF" strokeOpacity={0.8 * ramp(f, 214, 230) * (1 - ramp(f, 262, 272))} strokeWidth={2} />)}
        {(AREAS.tsn || []).map((a, i) => <path key={i} d={polyD(a.a, pr, true)} fill="#FF8A3D" fillOpacity={0.2 * ramp(f, 292, 304)} stroke="#FFB27A" strokeOpacity={0.9 * ramp(f, 292, 304)} strokeWidth={2} />)}
        {(AREAS.donghoa || []).map((a, i) => <path key={i} d={polyD(a.a, pr, true)} fill="none" stroke="#34E3A6" strokeOpacity={0.7 * ramp(f, 40, 60) * (1 - ramp(f, 110, 122))} strokeWidth={2.5} strokeDasharray="10 8" />)}
        {/* radar */}
        {showRing && <g opacity={ringO}>
          <path d={polyD(ring, pr, true)} fill="rgba(52,227,166,0.08)" stroke="#34E3A6" strokeWidth={3} />
          <path d={polyD(wedge, pr, true)} fill="rgba(52,227,166,0.22)" />
        </g>}
        {/* routes */}
        {axisD && <Glow d={axisD} color="#F2C14E" w={7} o={1 - ramp(f, 124, 136) * 0.75} />}
        {pulses.map((t, i) => { const q = pointAt("axis", t); const s = pr(q[0], q[1]); return s[2] > NEAR ? <Comet key={i} x={s[0]} y={s[1]} color="#FFE08A" r={7} /> : null; })}
        {dhD && <Glow d={dhD} color="#FF3B47" w={8} o={1 - ramp(f, 262, 272)} />}
        {dhP > 0 && dhP < 1 && (() => { const q = pointAt("dhqg", dhP); const s = pr(q[0], q[1]); return <Comet x={s[0]} y={s[1]} color="#FF3B47" />; })()}
        {tsnD && <Glow d={tsnD} color="#FF3B47" w={6} />}
        {tsnP > 0 && (() => { const q = pointAt("tsn", tsnP); const s = pr(q[0], q[1]); return s[2] > NEAR ? <Comet x={s[0]} y={s[1]} color="#FF3B47" r={tsnP < 1 ? 10 : 0} /> : null; })()}
        {/* sóng ghim */}
        {[30, 40].map((at) => { const t = shock(at); if (t < 0) return null; const rr = (40 + 260 * t) / M_PER_PX * 2; const pts: number[] = []; for (let i = 0; i <= 64; i++) { const a = (i / 64) * Math.PI * 2; pts.push(G[0] + Math.cos(a) * rr, G[1] + Math.sin(a) * rr); } return <path key={at} d={polyD(pts, pr, true)} fill="none" stroke="#7DF2C2" strokeWidth={4} opacity={1 - t} />; })}
      </svg>

      <Buildings pr={pr} c={c} grow={grow} gsGlow={1} />

      {/* nhãn đường PVĐ */}
      {f >= 82 && f < 132 && (() => {
        const q0 = pointAt("axis", 0.80), q1 = pointAt("axis", 0.86);
        const a = pr(q0[0], q0[1]), b = pr(q1[0], q1[1]);
        let ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI; if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
        const k = sp(82);
        return <div style={{ position: "absolute", left: (a[0] + b[0]) / 2, top: (a[1] + b[1]) / 2, transform: `translate(-50%,-140%) rotate(${ang}deg) scale(${k})`, opacity: Math.min(1, k * 1.4) * (1 - ramp(f, 122, 132)), fontFamily: SANS, fontWeight: 900, fontSize: 40, color: "#FFE08A", letterSpacing: 4, textShadow: "0 0 18px rgba(242,193,78,0.8), 0 3px 8px #000", whiteSpace: "nowrap" }}>PHẠM VĂN ĐỒNG</div>;
      })()}

      {/* ghim dự án */}
      {f >= 26 && gsP[2] > NEAR && (() => {
        const k = spring({ frame: f - 28, fps, config: { damping: 10, stiffness: 160, mass: 0.7 } });
        const drop = (1 - k) * -160;
        return <div style={{ position: "absolute", left: 0, top: drop, width: W, height: H }}>
          <Pin x={gsP[0]} y={gsP[1]} k={Math.min(1, k * 1.2)} color="#34E3A6" stem={70}>
            <div style={{ background: "#FBF7EE", borderRadius: 16, padding: "8px 14px", boxShadow: "0 0 0 3px #34E3A6, 0 0 30px rgba(52,227,166,0.6)" }}>
              <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 70, display: "block" }} />
            </div>
          </Pin>
        </div>;
      })()}

      {/* GO! & Hoàn Mỹ */}
      {f >= 128 && f < 200 && goP[2] > NEAR && <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: 1 - ramp(f, 190, 200) }}>
        <div style={{ position: "absolute", left: Math.min(goP[0], 1080 - 90 - 330), top: goP[1], transform: `translate(${sp(129) * 40}px, -50%) scale(${sp(129)})`, transformOrigin: "0 50%" }}>
          <Card icon={IcCart} title="GO! Dĩ An" sub="Cạnh bên dự án" color="#E8424B" />
        </div>
        <div style={{ position: "absolute", left: Math.max(90, hmP[0] - 470), top: hmP[1] + 70, transform: `translateY(${(1 - sp(153)) * 30}px) scale(${sp(153)})`, transformOrigin: "100% 0%" }}>
          <Card icon={IcCross} title="BV Quốc tế Hoàn Mỹ" sub="Cạnh bên dự án" color="#2F9BFF" />
        </div>
      </div>}

      {/* Làng ĐH */}
      {f >= 216 && f < 272 && dhqP[2] > NEAR && <div style={{ position: "absolute", left: dhqP[0], top: dhqP[1], transform: `translate(-50%, -150%) scale(${sp(216)})`, opacity: 1 - ramp(f, 262, 272) }}>
        <Card icon={IcCap} title="Làng Đại học" sub={`${String(D.meta.dhqg_km).replace(".", ",")} km`} color="#3FC6FF" />
      </div>}

      {/* sân bay */}
      {f >= 292 && f < 392 && tsnPt[2] > NEAR && (() => {
        const k = sp(293);
        const fly = ramp(f, 300, 340);
        return <div style={{ position: "absolute", left: tsnPt[0], top: tsnPt[1], opacity: 1 - ramp(f, 380, 392) }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -160%) scale(${k})` }}>
            <Card icon={IcPlane} title="Sân bay Tân Sơn Nhất" sub={`${String(D.meta.tsn_km).replace(".", ",")} km theo Phạm Văn Đồng`} color="#FF8A3D" />
          </div>
          <div style={{ position: "absolute", transform: `translate(${-40 - fly * 300}px, ${-10 - fly * 200}px) rotate(-55deg) scale(${0.8 + fly * 0.9})`, opacity: k * (1 - ramp(f, 336, 346)) }}>
            <svg width="70" height="70" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" fill="#fff" /></svg>
          </div>
        </div>;
      })()}

      {/* sương xa + tối mép */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,11,16,0.95) 0%, rgba(7,11,16,0.55) 16%, rgba(7,11,16,0) 32%, rgba(7,11,16,0) 82%, rgba(7,11,16,0.6) 100%)", pointerEvents: "none" }} />

      {/* flycam mở đầu */}
      {introO > 0.001 && <AbsoluteFill style={{ opacity: introO, transform: `scale(${interpolate(f, [0, 34], [1.18, 1.0], clamp)})`, filter: `blur(${interpolate(f, [20, 34], [0, 8], clamp)}px)` }}>
        <OffthreadVideo src={staticFile("video/gsl_bg/map_intro.mp4")} muted playbackRate={1.6} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>}
      {f >= 16 && f < 36 && <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(125,242,194,0.55), rgba(125,242,194,0) 60%)", opacity: interpolate(f, [16, 26, 36], [0, 1, 0]) }} />}

      {/* logo + chip tiêu đề */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 110, display: "flex", justifyContent: "center", opacity: ramp(f, 4, 14) }}>
        <div style={{ background: "#FBF7EE", borderRadius: 16, padding: "8px 14px", boxShadow: "0 0 0 3px #34E3A6" }}>
          <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 62, display: "block" }} />
        </div>
      </div>
      <Chip f={f} at={22} out={66} text="ĐÃ XÂY XONG · HIỆN HỮU" />
      <Chip f={f} at={70} out={112} text="TRỤC PHẠM VĂN ĐỒNG NỐI DÀI" />
      <Chip f={f} at={118} out={190} text="KẾ BÊN GO! & HOÀN MỸ" />
      <Chip f={f} at={198} out={246} text="5 PHÚT TỚI LÀNG ĐẠI HỌC" />
      <Chip f={f} at={252} out={372} text="VỀ TỪ SÂN BAY TÂN SƠN NHẤT" />
      <Timer f={f} at={200} to={5} dur={32} label="LÀNG ĐH" color="#FF3B47" out={246} />
      <Timer f={f} at={329} to={25} dur={22} label="VỀ NHÀ" color="#FF3B47" out={384} />

      {/* tổng kết */}
      {f >= 380 && (
        <div style={{ position: "absolute", left: 70, right: 70, top: 1340, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {[["Trục", "Phạm Văn Đồng"], ["Cạnh", "GO! & Hoàn Mỹ"], ["5 phút", "Làng Đại học"], ["25 phút", "Tân Sơn Nhất"]].map(([a, b], i) => {
            const k = sp(381 + i * 4, 12);
            return <div key={i} style={{ opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 40}px)`, padding: "16px 20px", borderRadius: 20, background: "rgba(10,14,20,0.85)", border: "2px solid rgba(52,227,166,0.7)" }}>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 38, color: "#34E3A6" }}>{a}</div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: "#fff" }}>{b}</div>
            </div>;
          })}
        </div>
      )}
      <div style={{ position: "absolute", right: 30, bottom: 26, fontFamily: SANS, fontWeight: 600, fontSize: 16, color: "rgba(255,255,255,0.4)" }}>Dữ liệu bản đồ © OpenStreetMap</div>

      {withVoice && <Audio src={staticFile("audio/loc/voice_vitri.wav")} />}
    </AbsoluteFill>
  );
};
