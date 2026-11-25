import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, Easing } from "remotion";
import { loadFont as loadPlex } from "@remotion/google-fonts/IBMPlexSans";
import { loadFont as loadPlexMono } from "@remotion/google-fonts/IBMPlexMono";

/**
 * GSLChinhSach — video dọc "toàn bộ chính sách bán hàng Green Skyline" (đoạn giữa, lồng tiếng).
 * Phong cách: ảnh thật + nhãn tối giản kiểu ghi chú bản vẽ. Không blur/glow/nảy.
 */
export const SANS = loadPlex("normal", { weights: ["300", "400", "500", "700"], subsets: ["vietnamese", "latin"] }).fontFamily;
export const MONO = loadPlexMono("normal", { weights: ["400", "500"], subsets: ["vietnamese", "latin"] }).fontFamily;

import { W, H } from "./GSLCSData";
import { HookText, HookStyle, hookTextSfx, thinSfx, SfxEv } from "./GSLCSHook";
const MOSS = "#B9C79A"; // xanh rêu nhạt lấy từ cây trong ảnh
const ease = Easing.bezier(0.2, 0.7, 0.2, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const prog = (f: number, a: number, d: number) => interpolate(f, [a, a + d], [0, 1], { ...clamp, easing: ease });

/* ---------------- ảnh thật: cover theo chiều cao, trôi nhẹ như máy cầm tay ---------------- */
export type PhotoProps = {
  src: string; iw: number; ih: number;
  fx0: number; fx1?: number; // tâm khung theo tỉ lệ chiều ngang ảnh (đầu → cuối shot)
  z0?: number; z1?: number; dur: number;
  children?: (map: (u: number, v: number) => [number, number]) => React.ReactNode;
};
export const Photo: React.FC<PhotoProps> = ({ src, iw, ih, fx0, fx1, z0 = 1.02, z1 = 1.06, dur, children }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const z = z0 + (z1 - z0) * t;
  const fx = fx0 + ((fx1 ?? fx0) - fx0) * t;
  const s = (H / ih) * z;
  const dw = iw * s, dh = ih * s;
  // rung tay rất nhẹ (vài px), không đều
  const jx = 0;
  const jy = 0;
  const ox = Math.min(0, Math.max(W - dw, W / 2 - fx * dw)) + jx;
  const oy = (H - dh) / 2 + jy;
  const map = (u: number, v: number): [number, number] => [ox + u * dw, oy + v * dh];
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", left: ox, top: oy, width: dw, height: dh }} />
      {children?.(map)}
    </AbsoluteFill>
  );
};

/* ---------------- lớp hạt + tối viền ---------------- */
export const FilmLook: React.FC<{ bottomShade?: number; topShade?: number }> = ({ bottomShade = 0, topShade = 0 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {topShade > 0 && <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${topShade}) 0%, rgba(0,0,0,0) 26%)` }} />}
      {bottomShade > 0 && <AbsoluteFill style={{ background: `linear-gradient(0deg, rgba(0,0,0,${bottomShade}) 0%, rgba(0,0,0,${bottomShade * 0.55}) 22%, rgba(0,0,0,0) 46%)` }} />}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.32) 100%)" }} />
      <svg width={W} height={H} style={{ position: "absolute", opacity: 0.09, mixBlendMode: "overlay" }}>
        <filter id={`g${f % 6}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 6} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter={`url(#g${f % 6})`} />
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- nhãn chỉ đồ vật: chấm → đường dẫn → chữ ---------------- */
export type PinSpec = { u: number; v: number; dx: number; dy: number; text: string; at: number; side?: "l" | "r"; out?: number };
export const Pin: React.FC<{ p: PinSpec; map: (u: number, v: number) => [number, number] }> = ({ p, map }) => {
  const f = useCurrentFrame();
  const [x, y] = map(p.u, p.v);
  const ex = x + p.dx, ey = y + p.dy;
  const side = p.side ?? (p.dx >= 0 ? "r" : "l");
  const tail = 34;
  const tx = side === "r" ? ex + tail : ex - tail;
  const a = prog(f, p.at, 3);          // chấm
  const b = prog(f, p.at + 2, 6);      // đường chéo
  const c = prog(f, p.at + 7, 4);      // đoạn ngang
  const d = prog(f, p.at + 8, 8);      // chữ lộ
  const edge = interpolate(x, [-20, 90, 990, 1100], [0, 1, 1, 0], clamp);
  const o = (p.out != null ? 1 - prog(f, p.out, 6) : 1) * edge;
  if (f < p.at) return null;
  const mx = x + (ex - x) * b, my = y + (ey - y) * b;
  const hx = ex + (tx - ex) * c;
  const sh = "drop-shadow(0 1px 3px rgba(0,0,0,0.55))";
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={W} height={H} style={{ position: "absolute", filter: sh }}>
        <circle cx={x} cy={y} r={9 * a} fill="none" stroke="#fff" strokeWidth={2} />
        <circle cx={x} cy={y} r={3.2 * a} fill="#fff" />
        {b > 0 && <line x1={x} y1={y} x2={mx} y2={my} stroke="#fff" strokeWidth={2} />}
        {c > 0 && <line x1={ex} y1={ey} x2={hx} y2={ey} stroke="#fff" strokeWidth={2} />}
      </svg>
      <div
        style={{
          position: "absolute", top: ey - 28, height: 56, display: "flex", alignItems: "center",
          ...(side === "r" ? { left: tx + 14 } : { right: W - tx + 14 }),
          fontFamily: SANS, fontWeight: 500, fontSize: 48, color: "#fff", whiteSpace: "nowrap",
          letterSpacing: 0.2, textShadow: "0 1px 3px rgba(0,0,0,0.7), 0 2px 14px rgba(0,0,0,0.55)",
          clipPath: side === "r" ? `inset(0 ${100 - d * 100}% 0 0)` : `inset(0 0 0 ${100 - d * 100}%)`,
        }}
      >
        {p.text}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- chú thích số lớn ở góc dưới ---------------- */
export const Caption: React.FC<{ kicker: string; big?: string; unit?: string; note?: string; at: number; bigAt?: number; noteAt?: number; out?: number; y?: number }> = ({ kicker, big, unit, note, at, bigAt, noteAt, out, y = 1330 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const k = prog(f, at, 8);
  const r = prog(f, at + 4, 12);
  const n = prog(f, (bigAt ?? at + 10), 12);
  const m = prog(f, noteAt ?? (bigAt ?? at) + 14, 10);
  const o = out != null ? 1 - prog(f, out, 6) : 1;
  return (
    <div style={{ position: "absolute", left: 120, top: y, width: 840, opacity: o, color: "#fff", textShadow: "0 1px 8px rgba(0,0,0,0.45)" }}>
      <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 36, letterSpacing: 3, opacity: k, transform: `translateY(${(1 - k) * 8}px)` }}>{kicker}</div>
      <div style={{ height: 2, background: "rgba(255,255,255,0.85)", width: `${r * 100}%`, marginTop: 18 }} />
      {big ? <div style={{ overflow: "hidden", height: 250 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 240, lineHeight: "250px", letterSpacing: -8, transform: `translateY(${(1 - n) * 250}px)`, display: "flex", alignItems: "baseline" }}>
          <span style={{ color: MOSS }}>{big}</span>
          {unit && <span style={{ fontSize: 60, letterSpacing: 0, marginLeft: 20, fontWeight: 500, color: "#fff" }}>{unit}</span>}
        </div>
      </div> : <div style={{ height: 20 }} />}
      {note && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 44, marginTop: 4, opacity: m }}>{note}</div>}
    </div>
  );
};

/* ---------------- tiêu đề mục góc trên ---------------- */
export const Heading: React.FC<{ idx: string; title: string; at: number; out?: number; sub?: string; subAt?: number }> = ({ idx, title, at, out, sub, subAt }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const a = prog(f, at, 8), b = prog(f, at + 5, 12);
  const o = out != null ? 1 - prog(f, out, 6) : 1;
  return (
    <div style={{ position: "absolute", left: 120, top: 230, color: "#fff", opacity: o, textShadow: "0 1px 8px rgba(0,0,0,0.45)" }}>
      <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: 4, opacity: a }}>{idx}</div>
      <div style={{ width: 70, height: 2, background: "#fff", margin: "14px 0 16px", transform: `scaleX(${a})`, transformOrigin: "left" }} />
      <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 64, clipPath: `inset(0 ${100 - b * 100}% 0 0)`, whiteSpace: "nowrap" }}>{title}</div>
      {sub && subAt != null && f >= subAt && <div style={{ fontFamily: MONO, fontSize: 32, letterSpacing: 3, marginTop: 14, opacity: prog(f, subAt, 10) }}>{sub}</div>}
    </div>
  );
};

export const RoomTag: React.FC<{ t: string; at: number }> = ({ t, at }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const a = prog(f, at, 10);
  return <div style={{ position: "absolute", left: 120, top: 230, fontFamily: MONO, fontWeight: 500, fontSize: 30, letterSpacing: 4, color: "#fff", opacity: a, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>{t}</div>;
};

/* ---------------- bảng ví dụ căn studio trên nền giấy ---------------- */
const INK = "#1E1F1C";
const MOSS_DK = "#5E6E48";
export const StudioSheet: React.FC<{ rows: { k: string; v: string; at: number; hi?: boolean }[]; at: number }> = ({ rows, at }) => {
  const f = useCurrentFrame();
  const a = prog(f, at, 12);
  const LWID = rows.length > 4 ? 660 : 760, LH = (LWID * 1400) / 1269;
  const dim = prog(f, at + 8, 14);
  return (
    <AbsoluteFill style={{ background: "#F2EFE7" }}>
      {/* lớp giấy */}
      <svg width={W} height={H} style={{ position: "absolute", opacity: 0.35, mixBlendMode: "multiply" }}>
        <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={3} seed={3} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={W} height={H} filter="url(#paper)" opacity={0.25} />
      </svg>
      <div style={{ position: "absolute", left: 120, top: 200, fontFamily: MONO, fontSize: 28, letterSpacing: 4, color: INK, opacity: a }}>VÍ DỤ · STUDIO · THÁP T2</div>
      <div style={{ position: "absolute", left: 120, top: 246, fontFamily: SANS, fontWeight: 400, fontSize: 72, color: INK, opacity: a }}>T2.21.03</div>
      {/* layout */}
      <Img src={staticFile("images/btgsl/layout_studio.jpg")} style={{ position: "absolute", left: (W - LWID) / 2, top: 380, width: LWID, height: LH, opacity: a, mixBlendMode: "multiply" }} />
      {/* đường dóng kích thước */}
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {(() => {
          const x1 = (W - LWID) / 2, x2 = x1 + LWID * dim, yy = 380 + LH + 34;
          return (
            <g stroke={INK} strokeWidth={1.5}>
              <line x1={x1} y1={yy - 12} x2={x1} y2={yy + 12} />
              <line x1={x1} y1={yy} x2={x2} y2={yy} />
              {dim > 0.98 && <line x1={x1 + LWID} y1={yy - 12} x2={x1 + LWID} y2={yy + 12} />}
            </g>
          );
        })()}
      </svg>
      <div style={{ position: "absolute", top: 380 + LH + 50, width: W, textAlign: "center", fontFamily: MONO, fontSize: 28, color: INK, opacity: dim, letterSpacing: 2 }}>
        40,1 m² TIM TƯỜNG · 36,0 m² THÔNG THỦY
      </div>
      {/* các dòng số */}
      <div style={{ position: "absolute", left: 120, top: 380 + LH + 130, width: 840 }}>
        {rows.map((r, i) => {
          const p = prog(f, r.at, 10);
          if (f < r.at) return <div key={i} style={{ height: 92 }} />;
          return (
            <div key={i} style={{ height: 92, display: "flex", alignItems: "baseline", borderTop: `1.5px solid rgba(30,31,28,${0.35 * p})`, paddingTop: 18, opacity: p }}>
              <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: 1.5, color: INK, flex: 1 }}>{r.k}</div>
              <div style={{ fontFamily: SANS, fontWeight: r.hi ? 500 : 400, fontSize: r.hi ? 56 : 48, color: r.hi ? MOSS_DK : INK, clipPath: `inset(0 0 0 ${100 - p * 100}%)` }}>{r.v}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 3 cảnh mẫu để duyệt ---------------- */
export const GSLChinhSachMau: React.FC<{ scene: "sofa" | "so" | "studio" }> = ({ scene }) => {
  if (scene === "sofa") {
    return (
      <AbsoluteFill>
        <Photo src="images/gslcs/p08.jpg" iw={2560} ih={1707} fx0={0.53} fx1={0.56} dur={120}>
          {(map) => (
            <>
              <Pin map={map} p={{ u: 0.655, v: 0.585, dx: -150, dy: -230, text: "Sofa", at: 2 }} />
              <Pin map={map} p={{ u: 0.515, v: 0.64, dx: -120, dy: 190, text: "Bàn sofa", at: 16 }} />
            </>
          )}
        </Photo>
        <FilmLook topShade={0.35} />
        <Heading idx="01 / 03" title="Phòng khách" at={0} />
      </AbsoluteFill>
    );
  }
  if (scene === "so") {
    return (
      <AbsoluteFill>
        <Photo src="images/gslcs/p07.jpg" iw={2560} ih={1707} fx0={0.5} dur={120} />
        <FilmLook bottomShade={0.62} topShade={0.35} />
        <Heading idx="01 / 03" title="Ưu đãi tân gia" at={0} />
        <Caption kicker="1PN+ · 2PN · THÁP T1" big="6%" unit="chiết khấu" note="Kèm gói full nội thất" at={2} />
      </AbsoluteFill>
    );
  }
  return (
    <StudioSheet
      at={0}
      rows={[
        { k: "CÁCH THANH TOÁN", v: "Vay ngân hàng", at: 6 },
        { k: "GIÁ SAU CHIẾT KHẤU", v: "≈ 2,69 tỷ", at: 12 },
        { k: "ĐÓNG 10%", v: "≈ 269 triệu", at: 18, hi: true },
        { k: "NHẬN NHÀ", v: "04/2027", at: 24 },
      ]}
    />
  );
};


/* =====================================================================
 * BẢN HOÀN CHỈNH — cắt nhanh kiểu máy quay, khớp giọng thật (whisper).
 * ===================================================================== */
import { FPS, CS_SEGS, CS_SHOTS, HOOK, estimateWords, mkWT, framing, At, WordTimes } from "./GSLCSData";
export { CS_SEGS, CS_SHOTS };
export const csFrames = (words?: WordTimes, endSec?: number) => {
  const e = words ? (endSec ?? 0) : estimateWords().end;
  return Math.ceil((e + 1.2) * FPS);
};

/* ảnh theo các nhát cắt */
const CutPhoto: React.FC<{ src: string; iw: number; ih: number; cuts: { from: number; fx: number; fy: number; z: number; dfx?: number }[]; dur: number;
  children?: (map: (u: number, v: number) => [number, number], k: number) => React.ReactNode }> = ({ src, iw, ih, cuts, dur, children }) => {
  const f = useCurrentFrame();
  const { ox, oy, dw, dh, k } = framing(iw, ih, cuts, f, dur);
  const map = (u: number, v: number): [number, number] => [ox + u * dw, oy + v * dh];
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", left: ox, top: oy, width: dw, height: dh }} />
      {children?.(map, k)}
    </AbsoluteFill>
  );
};

/* lia nhanh như máy thật: trượt ngang + nhoè theo chiều ngang */
const WIN = 5, WOUT = 4;
const Whip: React.FC<{ id: string; dur: number; inW: boolean; outW: boolean; children: React.ReactNode }> = ({ id, dur, inW, outW, children }) => {
  const f = useCurrentFrame();
  let x = 0, b = 0;
  if (inW && f < WIN) { const t = 1 - f / WIN; const e = t * t; x = e * W * 0.55; b = e * 70; }
  if (outW && f >= dur - WOUT) { const t = (f - (dur - WOUT) + 1) / WOUT; const e = t * t; x = -e * W * 0.55; b = e * 70; }
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#111" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x="-20%" y="0" width="140%" height="100%"><feGaussianBlur stdDeviation={`${b.toFixed(1)} 0`} /></filter>
      </svg>
      <AbsoluteFill style={{ transform: `translateX(${x}px)`, filter: b > 0.5 ? `url(#${id})` : undefined }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/* chữ mở đầu: đậm, lớn, lộ từ dưới mặt nạ */
const Line: React.FC<{ t: string; at: number; out?: number; size?: number; color?: string; weight?: number }> = ({ t, at, out, size = 104, color = "#fff", weight = 700 }) => {
  const f = useCurrentFrame();
  if (f < at || (out != null && f >= out)) return null;
  const p = prog(f, at, 7);
  return (
    <div style={{ overflow: "hidden", height: size * 1.18 }}>
      <div style={{ fontFamily: SANS, fontWeight: weight, fontSize: size, lineHeight: `${size * 1.18}px`, letterSpacing: -2, color, whiteSpace: "nowrap",
        transform: `translateY(${(1 - p) * size * 1.2}px)`, textShadow: "0 2px 18px rgba(0,0,0,0.45)" }}>{t}</div>
    </div>
  );
};
const HookOverlay: React.FC<{ wt: (a: At) => number }> = ({ wt }) => {
  const f = useCurrentFrame();
  const o1 = wt(HOOK.out1), o2 = wt(HOOK.out2), o3 = wt(HOOK.out3) - 3;
  const ch = wt(HOOK.chips);
  const chips: [string, string][] = [["6–8%", "CHIẾT KHẤU TÂN GIA"], ["+1,5%", "CỘNG THÊM KHI MUA NHIỀU"], ["+9%", "THANH TOÁN NHANH"]];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {f < o1 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 34%), linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 40%)" }} />}
      {f >= o1 && f < o2 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 36%)" }} />}
      {f >= wt(HOOK.name) && f < o3 && <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 40%)" }} />}
      <div style={{ position: "absolute", left: 110, top: 250 }}>
        <Line t="Mua lúc này" at={wt(HOOK.l1)} out={o1} />
        <Line t="được ưu đãi gì?" at={wt(HOOK.l2)} out={o1} color={MOSS} />
        <Line t="Tổng hợp" at={wt(HOOK.t1)} out={o2} size={96} />
        <Line t="toàn bộ chính sách" at={wt(HOOK.t2)} out={o2} size={96} weight={500} />
        <div style={{ display: "flex", gap: 22, marginTop: 18 }}>
          {["TÂN GIA", "CỘNG THÊM", "THANH TOÁN"].map((s, i) => {
            const a = wt(HOOK.s[i]);
            if (f < a || f >= o2) return null;
            return <div key={i} style={{ fontFamily: MONO, fontWeight: 500, fontSize: 34, letterSpacing: 3, color: "#fff", borderTop: "2px solid #fff", paddingTop: 10, opacity: prog(f, a, 4), textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>{s}</div>;
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: 110, top: 1270, width: 860 }}>
        {chips.map(([n, k], i) => {
          const a = ch + i * 3;
          if (f < a || f >= o1) return null;
          const p = prog(f, a, 5);
          return (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 24, borderTop: `2px solid rgba(255,255,255,${0.8 * p})`, padding: "8px 0 6px", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
              <div style={{ width: 290, fontFamily: SANS, fontWeight: 700, fontSize: 84, letterSpacing: -3, color: MOSS, clipPath: `inset(0 ${100 - p * 100}% 0 0)` }}>{n}</div>
              <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 32, letterSpacing: 2, color: "#fff", opacity: p }}>{k}</div>
            </div>
          );
        })}
      </div>
      {f >= wt(HOOK.name) && f < o3 && (
        <div style={{ position: "absolute", left: 110, top: 1420 }}>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 34, letterSpacing: 4, color: "#fff", opacity: prog(f, wt(HOOK.name), 6), marginBottom: 6 }}>CHÍNH SÁCH BÁN HÀNG</div>
          <Line t="Green Skyline" at={wt(HOOK.name) + 2} size={124} />
        </div>
      )}
    </AbsoluteFill>
  );
};

type Sfx = { f: number; src: string; v: number };
export const GSLCSToanBo: React.FC<{ voice?: string | null; words?: WordTimes; endSec?: number; sfx?: boolean; hook?: HookStyle }> = ({ voice, words, endSec, sfx = true, hook }) => {
  const W8 = words ?? estimateWords().words;
  const wt = mkWT(W8);
  const total = csFrames(words, endSec);
  const starts = CS_SHOTS.map((s, i) => (i === 0 ? 0 : Math.max(0, wt(s.at) - 3))); // cắt sớm 0,1s trước chữ
  const fx: Sfx[] = [];
  const cutEv: SfxEv[] = hook ? hookTextSfx(wt) : [];
  const S = (f: number, n: string, v: number) => fx.push({ f, src: `audio/cs_foley/${n}.wav`, v: hook ? Math.min(1, v * 1.8) : v });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {CS_SHOTS.map((s, i) => {
        const from = starts[i];
        const nextWhip = !!CS_SHOTS[i + 1]?.whip;
        const to = i + 1 < CS_SHOTS.length ? starts[i + 1] : total;
        const dur = to - from;
        const rel = (a: At) => wt(a) - from;
        const cuts = (s.cuts ?? [{ at: s.at }]).map((c, j) => ({ from: j === 0 ? 0 : Math.max(0, rel(c.at) - 2), fx: c.fx ?? 0.5, fy: c.fy ?? 0.5, z: c.z ?? 1.04, dfx: c.dfx }));
        const cutIdx = (fr: number) => { let k = 0; cuts.forEach((c, j) => { if (fr >= c.from) k = j; }); return k; };
        if (hook && s.whip) cutEv.push({ f: from - 7, n: "swoosh", v: 0.75 }); // chỉ lần lia lớn mới có swoosh
        if (s.head) S(from + 1, "shutter", 0.5);
        s.pins?.forEach((p) => { const a = wt(p.at); S(a, "pen_click", 0.45); S(a + 3, "pencil", 0.3); });
        if (s.cap?.big) S(wt(s.cap.bigAt ?? s.cap.at) + 3, "desk_thock", 0.55);
        if (s.sheet) { S(from, "paper_slide", 0.55); s.sheet.rows.forEach((r) => S(wt(r.at), "pencil", 0.3)); }
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Whip id={`wb${i}`} dur={dur} inW={!!s.whip} outW={nextWhip}>
              {s.sheet ? (
                <SheetCam zooms={(s.sheet.zoomAt ?? []).map((a) => rel(a) - 2)}>
                  <StudioSheet at={0} rows={s.sheet.rows.map((r) => ({ k: r.k, v: r.v, hi: r.hi, at: rel(r.at) }))} />
                </SheetCam>
              ) : (
                <>
                  <CutPhoto src={s.img!} iw={s.iw!} ih={s.ih!} cuts={cuts} dur={dur}>
                    {(map, k) => <>{s.pins?.map((p, j) => {
                      const at = rel(p.at);
                      if (s.cuts && s.cuts.length > 1 && cutIdx(at) !== k) return null;
                      return <Pin key={j} map={map} p={{ u: p.u, v: p.v, dx: p.dx, dy: p.dy, text: p.text, side: p.side, at }} />;
                    })}</>}
                  </CutPhoto>
                  <FilmLook bottomShade={s.shadeB ?? 0} topShade={s.shadeT ?? (s.head || s.room ? 0.38 : 0.12)} />
                  {s.room && <RoomTag t={s.room} at={0} />}
                  {s.head && <Heading idx={s.head.idx} title={s.head.title} at={0} sub={s.head.sub} subAt={s.head.subAt ? rel(s.head.subAt) : undefined} />}
                  {s.cap && (
                    <Caption kicker={s.cap.kicker} big={s.cap.big} unit={s.cap.unit} note={s.cap.note}
                      at={rel(s.cap.at)} bigAt={s.cap.bigAt ? rel(s.cap.bigAt) : undefined}
                      noteAt={s.cap.noteAt ? rel(s.cap.noteAt) : undefined} />
                  )}
                </>
              )}
            </Whip>
          </Sequence>
        );
      })}
      {hook ? <HookText wt={wt} st={hook} /> : <HookOverlay wt={wt} />}
      {sfx && hook && thinSfx(cutEv).map((e, i) => (
        <Sequence key={`c${i}`} from={Math.max(0, e.f)} durationInFrames={40}>
          <Audio src={staticFile(`audio/cs_cut/${e.n}.wav`)} volume={e.v} />
        </Sequence>
      ))}
      {sfx && fx.map((e, i) => (
        <Sequence key={`s${i}`} from={Math.max(0, e.f)} durationInFrames={40}>
          <Audio src={staticFile(e.src)} volume={e.v} />
        </Sequence>
      ))}
      {voice && <Audio src={staticFile(voice)} />}
    </AbsoluteFill>
  );
};

/* máy quay trên tờ giấy: đẩy cận vào phần số theo nhịp, cắt cứng */
const SheetCam: React.FC<{ zooms: number[]; children: React.ReactNode }> = ({ zooms, children }) => {
  const f = useCurrentFrame();
  let k = -1; zooms.forEach((z, i) => { if (f >= z) k = i; });
  const base = 1 + 0.025 * Math.min(1, f / 240); // chữ trên giấy phải nằm trong vùng an toàn → chỉ đẩy rất nhẹ
  // trước mốc đầu: cận vào layout (gốc phóng ở lề trái để chữ tiêu đề không bị cắt), sau đó cắt cứng ra toàn tờ
  const sc = k < 0 && zooms.length ? 1.22 : 1;
  const org = k < 0 && zooms.length ? "120px 560px" : "540px 960px";
  return <AbsoluteFill style={{ transform: `scale(${sc * base})`, transformOrigin: org }}>{children}</AbsoluteFill>;
};
