import React from "react";
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import TIMING from "../data/bt2pn_timing.json";

/**
 * Green Skyline — BẢNG TÍNH CĂN 2PN T2.07.13 (dọc 1080×1920, 30fps).
 * Phần 1: clip Hoàng nói (đã cắt sẵn public/video/bt2pn/intro.mp4, 15,4s).
 * Phần 2: bảng chạy chữ, nền sạch (không flycam). Lời thu sau → mốc thời gian theo ước lượng 4 âm tiết/giây, retime khi có giọng.
 * Số liệu: giỏ hàng chung 07/11/2026, CSBH 149/2026. VAT ước tính 9,08%.
 * Layout căn: vẽ lại vector theo đúng mặt bằng tầng 4–8 (file MBT 260127), toạ độ px của vùng cắt 300×240 tại 300dpi.
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["500", "600", "700", "800", "900"], subsets: ["vietnamese", "latin"] });

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, b: number, ease = Easing.out(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

// màu
const BG0 = "#0B1A13", BG1 = "#12291E";
const INK = "#16261E";          // chữ đậm trên nền kem
const CREAM = "#FBF8F1";
const GOLD = "#E2B865";
const MINT = "#5CCB92";
const MINT_D = "#1D7A4E";
const GRAD = "linear-gradient(180deg,#EAFFF2 0%,#9BE8BE 26%,#3FB57A 52%,#1D7A4E 74%,#5CCB92 100%)";
const MX = 96; // lề an toàn TikTok ≥ 8%

// ===== thời lượng =====
export const INTRO_F = s(15.4);
// mốc theo giọng thu thật (file 1107, đã cắt ghép) — src/data/bt2pn_timing.json
const VO_LEAD = 0.5; // giọng bắt đầu sau khi vào phần 2
type SceneKey = "unit" | "nhanh" | "chuan" | "vay" | "tong" | "cta";
const KEYS: SceneKey[] = ["unit", "nhanh", "chuan", "vay", "tong", "cta"];
const TM = TIMING.scenes as Record<SceneKey, { voiceStart: number; voiceEnd: number; beats: Record<string, number> }>;
const START: Record<string, number> = {};
KEYS.forEach((k, i) => { START[k] = i === 0 ? INTRO_F : INTRO_F + s(VO_LEAD + TM[k].voiceStart - 0.35); });
const END_F = INTRO_F + s(VO_LEAD + TM.cta.voiceEnd + 2.6);
const SC = KEYS.map((k, i) => ({ key: k, dur: ((i < KEYS.length - 1 ? START[KEYS[i + 1]] : END_F) - START[k]) / FPS }));
export const BT2PN_FRAMES = END_F;
// frame (tính từ đầu cảnh) của một mốc lời nói
const B = (k: SceneKey, beat: string) => INTRO_F + s(VO_LEAD + TM[k].voiceStart + TM[k].beats[beat]) - START[k];

// ===== hiệu ứng chung =====
const useSp = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (at: number, damping = 14, stiffness = 160) => spring({ frame: f - at, fps, config: { damping, stiffness, mass: 0.7 } });
};

const GradText: React.FC<{ size: number; children: React.ReactNode; weight?: number; ls?: number; style?: React.CSSProperties }> = ({ size, children, weight = 900, ls = 0, style }) => (
  <div style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.45))", ...style }}>
    <div style={{ fontFamily: SANS, fontWeight: weight, fontSize: size, lineHeight: 1.02, letterSpacing: ls, backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", padding: "0.04em 0.02em" }}>{children}</div>
  </div>
);

// =====================================================================
// PHẦN 1 — CLIP MỞ ĐẦU
// =====================================================================
// các đoạn trong intro.mp4 (giây): A 0–5.5 | B1 5.5–7.1 | B2 7.1–10.1 | C 10.1–15.4
const CUTS = [
  { a: 0, b: 5.5, z0: 1.0, z1: 1.06 },
  { a: 5.5, b: 7.1, z0: 1.14, z1: 1.16 },
  { a: 7.1, b: 10.1, z0: 1.05, z1: 1.09 },
  { a: 10.1, b: 15.4, z0: 1.12, z1: 1.18 },
];
const zoomAt = (t: number) => {
  const c = CUTS.find((c) => t >= c.a && t < c.b) ?? CUTS[CUTS.length - 1];
  const p = (t - c.a) / (c.b - c.a);
  let z = c.z0 + (c.z1 - c.z0) * Easing.inOut(Easing.quad)(Math.min(1, Math.max(0, p)));
  // punch nhẹ ngay điểm cắt
  const dt = t - c.a; if (c.a > 0 && dt < 0.25) z *= 1 + 0.035 * (1 - dt / 0.25);
  if (t < 0.6) z *= interpolate(t, [0, 0.6], [1.18, 1], { ...clamp, easing: Easing.out(Easing.cubic) }); // zoom-out đầu video
  return z;
};

// phụ đề theo lời thật (mốc = giây trong intro)
const SUBS: { t0: number; t1: number; text: string; hi?: string[] }[] = [
  { t0: 0.1, t1: 2.45, text: "Rất nhiều anh chị đang quan tâm đến Green Skyline,", hi: ["Green Skyline"] },
  { t0: 2.45, t1: 5.5, text: "nhưng vẫn còn một câu hỏi quan trọng: giá chính xác là bao nhiêu?", hi: ["giá chính xác"] },
  { t0: 5.5, t1: 10.15, text: "Giá sẽ tùy vào căn và phương án thanh toán mà anh chị chọn.", hi: ["căn", "phương án thanh toán"] },
  { t0: 10.15, t1: 12.6, text: "Video này Hoàng sẽ tính giá của một căn cụ thể,", hi: ["một căn cụ thể"] },
  { t0: 12.6, t1: 15.35, text: "để anh chị chọn cho mình phương án thanh toán phù hợp.", hi: ["phù hợp"] },
];

const Sub: React.FC<{ t: number }> = ({ t }) => {
  const cur = SUBS.find((x) => t >= x.t0 && t < x.t1);
  if (!cur) return null;
  const k = ramp(t * FPS, cur.t0 * FPS, cur.t0 * FPS + 6);
  // tô từ khoá
  let parts: (string | React.ReactElement)[] = [cur.text];
  for (const h of cur.hi ?? []) {
    parts = parts.flatMap((p) => typeof p !== "string" ? [p] : p.split(h).flatMap((seg, i, arr) => i < arr.length - 1 ? [seg, <span key={h + i} style={{ color: "#9BE8BE" }}>{h}</span>] : [seg]));
  }
  return (
    <div style={{ position: "absolute", left: MX, right: MX, top: 1345, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${(1 - k) * 14}px)` }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, lineHeight: 1.28, color: "#fff", textAlign: "center", textShadow: "0 3px 0 rgba(0,0,0,0.55), 0 0 18px rgba(0,0,0,0.55)" }}>{parts}</div>
    </div>
  );
};

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const t = f / FPS;
  const z = zoomAt(t);
  const out = ramp(f, INTRO_F - 8, INTRO_F, Easing.in(Easing.cubic)); // chuyển cảnh
  // khối chữ
  const qA = sp(s(1.45), 12), qB = sp(s(3.62), 11), qC = sp(s(4.9), 10);
  const aOut = ramp(f, s(5.3), s(5.55));
  const b1 = sp(s(7.1), 12), b2 = sp(s(8.35), 12);
  const bOut = ramp(f, s(9.95), s(10.15));
  const c1 = sp(s(11.1), 12), c2 = sp(s(13.7), 13);
  const chips = ["NHANH", "CHUẨN", "VAY 70%"];
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${z * (1 + out * 0.25)})`, transformOrigin: "50% 42%", filter: `contrast(1.07) saturate(1.12) brightness(1.02) blur(${out * 14}px)` }}>
        <OffthreadVideo src={staticFile("video/bt2pn/intro.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.3) 22%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.5) 100%)" }} />

      {/* logo */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center", opacity: ramp(f, 4, 16) }}>
        <div style={{ background: "#FBF7EE", borderRadius: 16, padding: "9px 18px", boxShadow: `0 0 0 3px ${GOLD}, 0 12px 30px rgba(0,0,0,0.4)` }}>
          <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 72, display: "block" }} />
        </div>
      </div>

      {/* A: GIÁ CHÍNH XÁC BAO NHIÊU? */}
      <div style={{ position: "absolute", left: MX, right: MX, top: 300, textAlign: "center", opacity: 1 - aOut }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: 6, color: "#fff", opacity: Math.min(1, qA * 1.4), transform: `translateY(${(1 - qA) * 24}px)`, textShadow: "0 3px 14px rgba(0,0,0,0.6)" }}>CÂU HỎI QUAN TRỌNG</div>
        <div style={{ transform: `scale(${0.6 + 0.4 * qB})`, opacity: Math.min(1, qB * 1.5), marginTop: 6 }}><GradText size={104}>GIÁ CHÍNH XÁC</GradText></div>
        <div style={{ transform: `translateY(${(1 - qC) * 60}px) rotate(${(1 - qC) * -6}deg)`, opacity: Math.min(1, qC * 1.5) }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 92, color: "#fff", lineHeight: 1.05, textShadow: "0 6px 22px rgba(0,0,0,0.55)" }}>BAO NHIÊU?</div>
        </div>
      </div>

      {/* B: TÙY CĂN + PHƯƠNG ÁN THANH TOÁN */}
      <div style={{ position: "absolute", left: MX, right: MX, top: 330, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, opacity: f < s(5.5) ? 0 : 1 - bOut }}>
        {[["TÙY", "CĂN NÀO", b1], ["&", "PHƯƠNG ÁN THANH TOÁN", b2]].map(([a, b, k], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, transform: `translateX(${(1 - (k as number)) * (i ? 120 : -120)}px)`, opacity: Math.min(1, (k as number) * 1.4) }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: "#fff", textShadow: "0 3px 12px rgba(0,0,0,0.6)" }}>{a as string}</div>
            <div style={{ background: "rgba(10,26,19,0.78)", border: `2px solid ${MINT}`, borderRadius: 16, padding: "10px 24px" }}>
              <GradText size={i ? 50 : 62}>{b as string}</GradText>
            </div>
          </div>
        ))}
      </div>

      {/* C: TÍNH GIÁ 1 CĂN CỤ THỂ */}
      <div style={{ position: "absolute", left: MX, right: MX, top: 320, textAlign: "center", opacity: f < s(10.1) ? 0 : 1 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, letterSpacing: 5, color: "#fff", opacity: Math.min(1, c1 * 1.4), textShadow: "0 3px 12px rgba(0,0,0,0.6)" }}>HOÀNG TÍNH GIÁ</div>
        <div style={{ transform: `scale(${0.7 + 0.3 * c1})`, opacity: Math.min(1, c1 * 1.5) }}><GradText size={96}>1 CĂN CỤ THỂ</GradText></div>
        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 18 }}>
          {chips.map((c, i) => {
            const k = spring({ frame: f - s(13.7) - i * 5, fps: FPS, config: { damping: 12, stiffness: 180, mass: 0.6 } });
            return <div key={c} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: INK, background: CREAM, borderRadius: 999, padding: "10px 24px", opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 40}px)`, boxShadow: "0 8px 22px rgba(0,0,0,0.35)" }}>{c}</div>;
          })}
        </div>
        <div style={{ opacity: c2 > 0 ? 1 : 0 }} />
      </div>

      <Sub t={t} />
      {/* flash xanh khi chuyển */}
      <AbsoluteFill style={{ background: BG0, opacity: out }} />
    </AbsoluteFill>
  );
};

// =====================================================================
// PHẦN 2 — NỀN, KHUNG CHUNG
// =====================================================================
const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  const x = Math.sin(f / 140) * 80, y = Math.cos(f / 170) * 60;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 0%, ${BG1} 0%, ${BG0} 60%, #06100B 100%)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(40% 25% at ${30 + x / 20}% ${22 + y / 20}%, rgba(92,203,146,0.16), rgba(92,203,146,0) 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(35% 22% at ${78 - x / 25}% ${80 - y / 25}%, rgba(226,184,101,0.10), rgba(226,184,101,0) 70%)` }} />
      {/* lưới mảnh kiểu bản vẽ */}
      <AbsoluteFill style={{ opacity: 0.07, backgroundImage: "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)", backgroundSize: "60px 60px", backgroundPosition: `${(f * 0.3) % 60}px ${(f * 0.3) % 60}px` }} />
    </AbsoluteFill>
  );
};

const Header: React.FC<{ step?: number }> = ({ step }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: MX, right: MX, top: 150, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ background: "#FBF7EE", borderRadius: 14, padding: "7px 14px", boxShadow: `0 0 0 2px ${GOLD}` }}>
        <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 54, display: "block" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, color: "rgba(255,255,255,0.75)", letterSpacing: 2 }}>CĂN T2.07.13 · 2PN</div>
        {step ? <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>{[1, 2, 3].map((i) => (
          <div key={i} style={{ width: i === step ? 34 : 12, height: 12, borderRadius: 6, background: i <= step ? MINT : "rgba(255,255,255,0.25)", transition: "none" }} />
        ))}</div> : null}
      </div>
      <div style={{ display: "none" }}>{f}</div>
    </div>
  );
};

const Foot: React.FC = () => (
  <div style={{ position: "absolute", left: MX, right: MX, top: 1478, fontFamily: SANS, fontWeight: 500, fontSize: 20, lineHeight: 1.35, color: "rgba(255,255,255,0.55)", textAlign: "center" }}>
    Giá theo giỏ hàng 07/11/2026, đã gồm CK tân gia 8% + đóng đủ 10% trong 72h (1%). VAT ước tính, KPBT 2%. CĐT có thể điều chỉnh.
  </div>
);

// ===== SCENE 1: CĂN TRÊN MẶT BẰNG + LAYOUT =====
// toạ độ căn CH.13 trong vùng cắt 300×240 (u13) và offset trong t2_plan (1210×1680)
const U_OFF = { x: 320, y: 1210 };
const OUTER = "M17 15 H259 V197 H241 V222 H45 A28 28 0 0 1 17 194 Z";

const UnitPlan: React.FC<{ draw: number; fill: number; labels: number; refOpacity?: number }> = ({ draw, fill, labels, refOpacity = 0 }) => {
  const W = "#1F2E27";
  const dash = (len: number) => ({ strokeDasharray: len, strokeDashoffset: len * (1 - draw) });
  const furn = { stroke: "#8FA097", strokeWidth: 0.7, fill: "none", opacity: fill } as const;
  const lab = (x: number, y: number, t: string, sz = 7.2, sub?: string) => (
    <g opacity={labels} transform={`translate(${x} ${y})`}>
      <text textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={sz} fill={INK} letterSpacing={0.3}>{t}</text>
      {sub ? <text y={sz * 1.15} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={sz * 0.72} fill={MINT_D}>{sub}</text> : null}
    </g>
  );
  return (
    <svg viewBox="4 4 284 232" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      {refOpacity > 0 ? <image href={staticFile("images/bt2pn/u13_ref.png")} x={0} y={0} width={300} height={240} opacity={refOpacity} /> : null}
      {/* nền phòng */}
      <g opacity={fill}>
        <path d={OUTER} fill="#F3EEE2" />
        <rect x={17} y={15} width={29} height={86} fill="#E4EFE6" />{/* lô gia */}
        <rect x={221} y={129} width={38} height={68} fill="#ECE8DD" />{/* giặt */}
        <path d="M17 101 H115 V222 H45 A28 28 0 0 1 17 194 Z" fill="#F7F1E4" />{/* PN1 */}
        <rect x={115} y={134} width={106} height={88} fill="#F7F1E4" />{/* PN2 */}
        <rect x={115} y={134} width={27} height={14} fill="#F3EEE2" />
        <rect x={142} y={100} width={79} height={48} fill="#E6ECEE" />{/* WC */}
      </g>
      {/* nội thất */}
      <g {...furn}>
        <rect x={54} y={22} width={58} height={21} rx={3} /><line x1={73} y1={24} x2={73} y2={41} /><line x1={92} y1={24} x2={92} y2={41} />
        <ellipse cx={83} cy={60} rx={16} ry={7.5} />
        <rect x={68} y={95} width={24} height={4} />
        <rect x={137} y={22} width={18} height={44} rx={7} />
        {[28, 40, 52].map((y) => <g key={y}><rect x={131} y={y} width={4} height={8} rx={1} /><rect x={157} y={y} width={4} height={8} rx={1} /></g>)}
        <rect x={157} y={21} width={73} height={16} /><circle cx={166} cy={26.5} r={2.6} /><circle cx={174} cy={26.5} r={2.6} /><circle cx={166} cy={32.5} r={2.6} /><circle cx={174} cy={32.5} r={2.6} />
        <rect x={203} y={24} width={22} height={10} rx={1.5} /><line x1={214} y1={24} x2={214} y2={34} />
        <rect x={231} y={21} width={23} height={19} /><line x1={231} y1={24} x2={254} y2={24} />
        {/* PN1 */}
        <rect x={37} y={160} width={49} height={54} rx={2} /><rect x={39} y={203} width={21} height={9} rx={2} /><rect x={63} y={203} width={21} height={9} rx={2} /><line x1={37} y1={170} x2={86} y2={170} />
        <circle cx={28} cy={198} r={5.5} />
        <rect x={22} y={112} width={14} height={28} /><circle cx={40} cy={126} r={3.6} />
        <rect x={96} y={136} width={18} height={80} />{Array.from({ length: 9 }).map((_, i) => <line key={i} x1={98} y1={142 + i * 8.4} x2={112} y2={142 + i * 8.4} />)}
        {/* PN2 */}
        <rect x={117} y={166} width={17} height={50} />{Array.from({ length: 5 }).map((_, i) => <line key={i} x1={119} y1={172 + i * 9} x2={132} y2={172 + i * 9} />)}
        <rect x={144} y={205} width={46} height={11} /><circle cx={157} cy={200} r={3.6} /><circle cx={177} cy={200} r={3.6} />
        <rect x={192} y={158} width={27} height={58} rx={2} /><rect x={196} y={205} width={19} height={8} rx={2} />
        {/* WC */}
        <circle cx={157} cy={137} r={5} /><circle cx={182} cy={137} r={2.2} /><rect x={202} y={127} width={8} height={15} rx={3} />
        {/* giặt + hộp kỹ thuật */}
        <rect x={234} y={179} width={16} height={15} /><circle cx={242} cy={186.5} r={5} />
        <rect x={222} y={166} width={9} height={30} /><line x1={222} y1={166} x2={231} y2={196} /><line x1={231} y1={166} x2={222} y2={196} />
      </g>
      {/* cửa (cánh + cung mở) */}
      <g stroke={W} strokeWidth={0.8} fill="none" opacity={fill}>
        <line x1={255} y1={90} x2={226} y2={90} /><path d="M255 61 A29 29 0 0 0 226 90" strokeDasharray="2 1.5" />{/* cửa chính */}
        <line x1={114} y1={101} x2={114} y2={125} /><path d="M90 101 A24 24 0 0 0 114 125" strokeDasharray="2 1.5" />
        <line x1={117} y1={134} x2={117} y2={158} /><path d="M141 134 A24 24 0 0 1 117 158" strokeDasharray="2 1.5" />
        <line x1={145} y1={104} x2={167} y2={104} /><path d="M145 126 A22 22 0 0 0 167 104" strokeDasharray="2 1.5" />
        <line x1={228} y1={129} x2={228} y2={152} /><path d="M252 129 A24 24 0 0 1 228 153" strokeDasharray="2 1.5" />
      </g>
      {/* kính lô gia + vách kính WC */}
      <g stroke="#6FA7C6" strokeWidth={1.3} opacity={fill}>
        <line x1={46} y1={21} x2={46} y2={98} /><line x1={18.5} y1={30} x2={18.5} y2={92} />
        <line x1={170} y1={104} x2={170} y2={145} strokeWidth={0.8} /><line x1={194} y1={104} x2={194} y2={145} strokeWidth={0.8} />
      </g>
      {/* tường — vẽ dần */}
      <g stroke={W} strokeLinecap="square" fill="none">
        <path d={OUTER} strokeWidth={4.2} style={dash(1000)} />
        <path d="M17 101 H90 M112 101 H116 M115 101 V222" strokeWidth={2.6} style={dash(300)} />
        <path d="M142 100 H221 V148 H142 V126 M142 104 V100" strokeWidth={2.6} style={dash(300)} />
        <path d="M221 148 V222 M221 129 H228 M252 129 H259" strokeWidth={2.6} style={dash(200)} />
        <path d="M46 15 V21 M46 98 V101" strokeWidth={2.6} style={dash(40)} />
        <rect x={222} y={197} width={19} height={25} fill={W} opacity={draw} stroke="none" />
      </g>
      {/* khe cửa chính trên tường ngoài: phủ nền để mở lối vào */}
      <rect x={256.5} y={61} width={5} height={29} fill={CREAM} opacity={fill} />
      {/* nhãn phòng */}
      {lab(88, 76, "PHÒNG KHÁCH", 7.6)}
      {lab(193, 52, "BẾP", 7.2)}
      {lab(66, 150, "PHÒNG NGỦ 1", 7)}
      {lab(160, 186, "PHÒNG NGỦ 2", 6.6)}
      {lab(182, 115, "WC", 6.4)}
      {lab(240, 150, "GIẶT", 5.6)}
      <g opacity={labels}><text x={31.5} y={58} transform="rotate(-90 31.5 58)" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={6} fill={MINT_D}>LÔ GIA</text></g>
      {/* lối vào */}
      <g opacity={labels}>
        <path d="M282 75.5 H266 M271 70.5 L265 75.5 L271 80.5" stroke={GOLD} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x={276} y={66} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={5.4} fill={GOLD}>LỐI VÀO</text>
      </g>
    </svg>
  );
};

const SceneUnit: React.FC<{ refOpacity?: number }> = ({ refOpacity = 0 }) => {
  const f = useCurrentFrame();
  const sp = useSp();
  const inK = sp(0, 16);
  // pha 1: mặt bằng tháp T2 → zoom vào CH.13
  const bz = B("unit", "zoom"), bh = B("unit", "hl"), bl = B("unit", "layout");
  const zoomK = ramp(f, bz, bz + s(1.5), Easing.inOut(Easing.cubic));
  const hlK = ramp(f, bh, bh + s(0.6));
  const toLayout = ramp(f, bl, bl + s(0.8), Easing.inOut(Easing.cubic));
  // khung ảnh mặt bằng: 760 × 1055
  const PW = 760, PH = 1680 * (760 / 1210), PS = 760 / 1210;
  // tâm căn trong ảnh (px khung)
  const cx = (U_OFF.x + 138) * PS, cy = (U_OFF.y + 118) * PS;
  const Z = 1 + 1.75 * zoomK;
  const ty0 = (980 - PH) / 2;
  const tx = interpolate(zoomK, [0, 1], [0, PW / 2 - cx * 2.75]), ty = interpolate(zoomK, [0, 1], [ty0, 450 - cy * 2.75]);
  const pulse = 0.5 + 0.5 * Math.sin(f / 6);
  // pha 2: layout vector
  const draw = ramp(f, bl + s(0.5), bl + s(2.1), Easing.inOut(Easing.cubic));
  const fillK = ramp(f, bl + s(1.3), bl + s(2.1));
  const labK = ramp(f, bl + s(1.7), bl + s(2.5));
  const info = [["THÔNG THỦY", "61,31 m²"], ["TIM TƯỜNG", "68,05 m²"], ["TẦNG / THÁP", "7 / T2"], ["LOẠI CĂN", "2PN · A1"]];
  return (
    <AbsoluteFill>
      <Header />
      {/* tiêu đề */}
      <div style={{ position: "absolute", left: MX, right: MX, top: 262, textAlign: "center", opacity: Math.min(1, inK * 1.4), transform: `translateY(${(1 - inK) * 30}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: GOLD }}>{toLayout < 0.5 ? "MẶT BẰNG TẦNG 4–8 · TÒA T2" : "LAYOUT CĂN T2.07.13"}</div>
        <GradText size={68} style={{ marginTop: 4, whiteSpace: "nowrap" }}>CĂN GÓC 2PN · TẦNG 7</GradText>
      </div>

      {/* pha 1 */}
      <div style={{ position: "absolute", left: (1080 - PW) / 2, top: 440, width: PW, height: 980, overflow: "hidden", borderRadius: 26, background: CREAM, boxShadow: "0 30px 80px rgba(0,0,0,0.5)", opacity: (1 - toLayout) * Math.min(1, inK * 1.3), transform: `scale(${(0.92 + 0.08 * inK) * (1 - 0.06 * toLayout)})` }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: PH, transform: `translate(${tx}px, ${ty}px) scale(${Z})`, transformOrigin: "0 0" }}>
          <Img src={staticFile("images/bt2pn/t2_plan.png")} style={{ width: PW, height: PH, display: "block" }} />
          <svg viewBox="0 0 1210 1680" style={{ position: "absolute", inset: 0, width: PW, height: PH }}>
            {/* làm mờ phần còn lại */}
            <defs><mask id="hole"><rect width={1210} height={1680} fill="#fff" /><path d={OUTER} transform={`translate(${U_OFF.x} ${U_OFF.y})`} fill="#000" /></mask></defs>
            <rect width={1210} height={1680} fill="#0B1A13" opacity={0.42 * hlK} mask="url(#hole)" />
            <path d={OUTER} transform={`translate(${U_OFF.x} ${U_OFF.y})`} fill={`rgba(226,184,101,${0.18 * hlK})`} stroke={GOLD} strokeWidth={5 + 3 * pulse} opacity={hlK} />
          </svg>
        </div>
        {/* tag */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", opacity: hlK }}>
          <div style={{ background: INK, color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 32, borderRadius: 14, padding: "12px 26px", boxShadow: `0 0 0 3px ${GOLD}` }}>CĂN SỐ 13 · <span style={{ color: GOLD }}>2PN A1</span></div>
        </div>
      </div>

      {/* pha 2 */}
      <div style={{ position: "absolute", left: MX - 20, right: MX - 20, top: 450, height: 760, borderRadius: 26, background: CREAM, boxShadow: "0 30px 80px rgba(0,0,0,0.5)", opacity: toLayout, transform: `scale(${0.94 + 0.06 * toLayout})`, padding: 34 }}>
        <UnitPlan draw={draw} fill={fillK} labels={labK} refOpacity={refOpacity} />
      </div>
      <div style={{ position: "absolute", left: MX - 20, right: MX - 20, top: 1236, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, opacity: toLayout }}>
        {info.map(([a, b], i) => {
          const k = spring({ frame: f - bl - s(2.1) - i * 4, fps: FPS, config: { damping: 13, stiffness: 170, mass: 0.6 } });
          return (
            <div key={a} style={{ background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(155,232,190,0.35)", borderRadius: 16, padding: "14px 8px", textAlign: "center", opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 30}px)` }}>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 18, color: "rgba(255,255,255,0.65)", letterSpacing: 1 }}>{a}</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 31, color: "#fff", marginTop: 4 }}>{b}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ===== BẢNG PHƯƠNG ÁN =====
type Row = { at: number; pct: string; title: string; sub?: string; amt: string; unit: string; tone?: "bank" | "hi"; dots?: number };
const Price: React.FC<{ at: number; label: string; value: number; dec: number; note: string }> = ({ at, label, value, dec, note }) => {
  const f = useCurrentFrame(); const sp = useSp();
  const k = sp(at, 12);
  const v = interpolate(f, [at, at + 28], [value * 0.7, value], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: MX, right: MX, top: 420, height: 196, borderRadius: 26, background: CREAM, boxShadow: "0 24px 60px rgba(0,0,0,0.45)", opacity: Math.min(1, k * 1.4), transform: `scale(${0.9 + 0.1 * k})`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px" }}>
      <div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, color: MINT_D, letterSpacing: 2 }}>{label}</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: "#6B7A72", marginTop: 6 }}>{note}</div>
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 104, color: INK, fontVariantNumeric: "tabular-nums", letterSpacing: -2 }}>
        {v.toFixed(dec).replace(".", ",")}<span style={{ fontSize: 46, color: MINT_D, marginLeft: 8 }}>TỶ</span>
      </div>
    </div>
  );
};

const Rows: React.FC<{ rows: Row[]; top?: number; rowH?: number }> = ({ rows, top = 660, rowH = 150 }) => {
  const f = useCurrentFrame();
  const first = rows[0].at, last = rows[rows.length - 1].at;
  const lineP = interpolate(f, [first, last + 12], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: MX, right: MX, top }}>
      {/* trục dọc */}
      <div style={{ position: "absolute", left: 47, top: 48, width: 4, height: (rows.length - 1) * rowH, background: "rgba(255,255,255,0.12)", borderRadius: 2 }}>
        <div style={{ width: "100%", height: `${lineP * 100}%`, background: `linear-gradient(180deg, ${MINT}, ${GOLD})`, borderRadius: 2 }} />
      </div>
      {rows.map((r, i) => {
        const k = spring({ frame: f - r.at, fps: FPS, config: { damping: 14, stiffness: 170, mass: 0.7 } });
        const active = f >= r.at && (i === rows.length - 1 || f < rows[i + 1].at);
        const bank = r.tone === "bank";
        return (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: i * rowH, height: rowH - 22, display: "flex", alignItems: "center", gap: 22, opacity: f < r.at ? 0 : Math.min(1, k * 1.4) * (active ? 1 : 0.78), transform: `translateX(${(1 - k) * 80}px)` }}>
            <div style={{ width: 98, height: 98, flex: "0 0 98px", borderRadius: 49, background: bank ? GOLD : active ? MINT : "#2B4A3B", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: r.pct.length > 4 ? 25 : 31, color: bank || active ? INK : "#fff", boxShadow: active ? `0 0 0 6px rgba(92,203,146,0.22)` : "none", transform: `scale(${0.6 + 0.4 * k})` }}>{r.pct}</div>
            <div style={{ flex: 1, height: "100%", borderRadius: 22, background: active ? "rgba(251,248,241,0.98)" : "rgba(255,255,255,0.08)", border: active ? "none" : "1.5px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px" }}>
              <div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: active ? INK : "#fff" }}>{r.title}</div>
                {r.sub ? <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: active ? MINT_D : "rgba(255,255,255,0.6)", marginTop: 4 }}>{r.sub}</div> : null}
                {r.dots ? <div style={{ display: "flex", gap: 8, marginTop: 8 }}>{Array.from({ length: r.dots }).map((_, d) => {
                  const on = f >= r.at + 10 + d * 9;
                  return <div key={d} style={{ width: 30, height: 12, borderRadius: 6, background: on ? MINT : "rgba(0,0,0,0.12)", transform: `scaleX(${on ? 1 : 0.6})` }} />;
                })}</div> : null}
              </div>
              <div style={{ textAlign: "right", fontFamily: SANS, fontWeight: 900, fontSize: 44, color: active ? INK : "#fff", whiteSpace: "nowrap" }}>
                {r.amt}<span style={{ fontSize: 24, fontWeight: 700, color: active ? MINT_D : "rgba(255,255,255,0.65)", marginLeft: 6 }}>{r.unit}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PlanTitle: React.FC<{ n: number; name: string }> = ({ n, name }) => {
  const sp = useSp(); const k = sp(0, 13);
  return (
    <div style={{ position: "absolute", left: MX, right: MX, top: 250, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 30}px)` }}>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 26, color: INK, background: GOLD, borderRadius: 10, padding: "6px 16px", letterSpacing: 2, whiteSpace: "nowrap" }}>PHƯƠNG ÁN {n}/3</div>
      <GradText size={68} style={{ whiteSpace: "nowrap" }}>{name}</GradText>
    </div>
  );
};

const Badge: React.FC<{ at: number; top: number; children: React.ReactNode }> = ({ at, top, children }) => {
  const sp = useSp(); const k = sp(at, 11);
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: MX, right: MX, top, display: "flex", justifyContent: "center", opacity: f < at ? 0 : Math.min(1, k * 1.4), transform: `scale(${0.7 + 0.3 * k})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(10,26,19,0.9)", border: `2px solid ${GOLD}`, borderRadius: 18, padding: "14px 28px", fontFamily: SANS, fontWeight: 800, fontSize: 32, color: "#fff" }}>{children}</div>
    </div>
  );
};

const KeyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 64 64"><g fill="none" stroke={GOLD} strokeWidth="6" strokeLinecap="round"><circle cx="20" cy="32" r="11" /><line x1="31" y1="32" x2="58" y2="32" /><line x1="49" y1="32" x2="49" y2="43" /><line x1="58" y1="32" x2="58" y2="41" /></g></svg>
);

// --- phương án 1: nhanh ---
const SceneNhanh: React.FC = () => (
  <AbsoluteFill>
    <Header step={1} />
    <PlanTitle n={1} name="THANH TOÁN NHANH" />
    <Price at={B("nhanh", "price")} label="GIÁ GỒM VAT" note="CK thêm 9% · chưa KPBT" value={3.815} dec={3} />
    <Rows rows={[
      { at: B("nhanh", "r1"), pct: "10%", title: "Ký HĐMB", sub: "Đã gồm 50 triệu giữ chỗ", amt: "381", unit: "TRIỆU" },
      { at: B("nhanh", "r2"), pct: "30%", title: "Trong 4 ngày", sub: "Sau khi ký HĐMB", amt: "1,14", unit: "TỶ" },
      { at: B("nhanh", "r3"), pct: "55%", title: "Nhận nhà", sub: "Dự kiến 04/2027 · cộng KPBT 70tr", amt: "2,17", unit: "TỶ" },
      { at: B("nhanh", "r4"), pct: "5%", title: "Nhận sổ hồng", sub: "Đợt cuối", amt: "191", unit: "TRIỆU" },
    ]} />
    <Badge at={B("nhanh", "r3") + 12} top={1290}><KeyIcon />NHẬN NHÀ <span style={{ color: GOLD }}>04/2027</span></Badge>
    <Foot />
  </AbsoluteFill>
);

// --- phương án 2: chuẩn ---
const SceneChuan: React.FC = () => (
  <AbsoluteFill>
    <Header step={2} />
    <PlanTitle n={2} name="THANH TOÁN CHUẨN" />
    <Price at={B("chuan", "price")} label="GIÁ GỒM VAT" note="CK thêm 3% · chưa KPBT" value={4.067} dec={3} />
    <Rows rows={[
      { at: B("chuan", "r1"), pct: "10%", title: "Ký HĐMB", sub: "Đã gồm 50 triệu giữ chỗ", amt: "407", unit: "TRIỆU" },
      { at: B("chuan", "r2"), pct: "6×5%", title: "Mỗi 2 tháng", sub: "6 đợt, tới lúc nhận nhà", amt: "203", unit: "TR/ĐỢT", dots: 6 },
      { at: B("chuan", "r3"), pct: "55%", title: "Nhận nhà", sub: "Dự kiến 12/2027 · cộng KPBT 75tr", amt: "2,31", unit: "TỶ" },
      { at: B("chuan", "r3") + 30, pct: "5%", title: "Nhận sổ hồng", sub: "Đợt cuối", amt: "203", unit: "TRIỆU" },
    ]} />
    <Badge at={B("chuan", "badge")} top={1290}><KeyIcon />NHẬN NHÀ <span style={{ color: GOLD }}>CUỐI 2027</span></Badge>
    <Foot />
  </AbsoluteFill>
);

// --- phương án 3: vay ---
const SceneVay: React.FC = () => {
  const f = useCurrentFrame(); const sp = useSp();
  const bq = B("vay", "q"), bc = B("vay", "calm"), c1 = B("vay", "c1"), c2 = B("vay", "c2");
  const k1 = sp(c1, 11), k2 = sp(c2, 11);
  const rowsOut = ramp(f, bq - 8, bq + 6);
  const qK = sp(bq, 10), qOut = ramp(f, bc - 2, bc + 8);
  const calmK = sp(bc, 13);
  return (
    <AbsoluteFill>
      <Header step={3} />
      <PlanTitle n={3} name="VAY NGÂN HÀNG" />
      <Price at={B("vay", "price")} label="GIÁ VAY GỒM VAT" note="Vay 70% · chưa KPBT" value={4.318} dec={3} />
      <div style={{ opacity: 1 - rowsOut, transform: `translateY(${-rowsOut * 20}px)` }}>
        <Rows rows={[
          { at: B("vay", "r1"), pct: "10%", title: "Ký HĐMB", sub: "Đóng tới lúc nhận nhà", amt: "432", unit: "TRIỆU" },
          { at: B("vay", "r2"), pct: "15%", title: "Nhận nhà", sub: "Dự kiến 04/2027 · cộng KPBT 79tr", amt: "727", unit: "TRIỆU" },
          { at: B("vay", "r3"), pct: "70%", title: "Ngân hàng giải ngân", sub: "Shinhan · Vietcombank · VietinBank", amt: "3,02", unit: "TỶ", tone: "bank" },
          { at: B("vay", "r3") + 36, pct: "5%", title: "Nhận sổ hồng", sub: "Đợt cuối", amt: "216", unit: "TRIỆU" },
        ]} />
      </div>
      {/* "LÃI CAO?" */}
      <div style={{ position: "absolute", left: MX, right: MX, top: 760, textAlign: "center", opacity: f < bq ? 0 : Math.min(1, qK * 1.5) * (1 - qOut), transform: `scale(${0.6 + 0.4 * qK}) rotate(${(1 - qK) * -8}deg)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, letterSpacing: 4, color: "rgba(255,255,255,0.75)" }}>NHẮC TỚI NGÂN HÀNG LÀ NGHĨ…</div>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 170, lineHeight: 1.05, color: "#FF6B5E", textShadow: "0 10px 40px rgba(255,80,60,0.35)" }}>LÃI CAO?</div>
      </div>
      {/* hỗ trợ lãi suất */}
      <div style={{ position: "absolute", left: MX, right: MX, top: 700, display: "flex", flexDirection: "column", gap: 26, opacity: f < bc ? 0 : 1 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: GOLD, textAlign: "center", opacity: Math.min(1, calmK * 1.4) }}>YÊN TÂM · CHỦ ĐẦU TƯ HỖ TRỢ LÃI SUẤT</div>
        {[[k1, "0%", "LÃI SUẤT", "TỐI ĐA 18 THÁNG"], [k2, "5,5%", "CỐ ĐỊNH", "TRONG 24 THÁNG"]].map(([k, big, a, b], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 30, background: i ? "rgba(255,255,255,0.08)" : CREAM, border: i ? `2px solid ${MINT}` : "none", borderRadius: 26, padding: "26px 40px", opacity: f < (i ? c2 : c1) ? 0 : Math.min(1, (k as number) * 1.4), transform: `translateY(${(1 - (k as number)) * 60}px) scale(${0.9 + 0.1 * (k as number)})`, boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
            <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 130, lineHeight: 1, color: i ? "#fff" : INK, letterSpacing: -3 }}>{big as string}</div>
            <div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: i ? "rgba(255,255,255,0.7)" : MINT_D, letterSpacing: 2 }}>{a as string}</div>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 44, color: i ? "#fff" : INK }}>{b as string}</div>
            </div>
            {i === 0 ? <div style={{ marginLeft: "auto", fontFamily: SANS, fontWeight: 800, fontSize: 30, color: GOLD }}>HOẶC</div> : null}
          </div>
        ))}
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 21, lineHeight: 1.45, color: "rgba(255,255,255,0.65)", textAlign: "center", opacity: Math.min(1, k2) }}>Vay 50%: 0% tối đa 18 tháng · Vay 70%: 0% 12 tháng hoặc 5,5% cố định 24 tháng<br />Áp dụng theo điều kiện của ngân hàng</div>
      </div>
      <Foot />
    </AbsoluteFill>
  );
};

// --- tổng kết ---
const SceneTong: React.FC = () => {
  const f = useCurrentFrame(); const sp = useSp();
  const kT = sp(0, 13);
  const cols = [
    { n: "NHANH", price: "3,82", before: "1,53 tỷ", key: "04/2027", tag: "Giá tốt nhất" },
    { n: "CHUẨN", price: "4,07", before: "1,63 tỷ", key: "Cuối 2027", tag: "Giãn 1 năm" },
    { n: "VAY 70%", price: "4,32", before: "432 tr", key: "04/2027", tag: "Vốn ít nhất" },
  ];
  return (
    <AbsoluteFill>
      <Header />
      <div style={{ position: "absolute", left: MX, right: MX, top: 262, textAlign: "center", opacity: Math.min(1, kT * 1.4), transform: `translateY(${(1 - kT) * 30}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: GOLD }}>TỔNG KẾT CĂN T2.07.13</div>
        <GradText size={60} style={{ marginTop: 4, whiteSpace: "nowrap" }}>MỖI CÁCH MỘT LỢI THẾ</GradText>
      </div>
      <div style={{ position: "absolute", left: MX - 30, right: MX - 30, top: 470, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
        {cols.map((c, i) => {
          const k = spring({ frame: f - B("tong", "cards") - i * 8, fps: FPS, config: { damping: 13, stiffness: 160, mass: 0.7 } });
          const hi = ramp(f, B("tong", "cards") + s(1.0) + i * 14, B("tong", "cards") + s(1.4) + i * 14);
          return (
            <div key={c.n} style={{ borderRadius: 26, background: CREAM, padding: "30px 14px 28px", textAlign: "center", opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 80}px)`, boxShadow: `0 0 0 ${4 * hi}px ${GOLD}, 0 24px 60px rgba(0,0,0,0.45)` }}>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 34, color: INK }}>{c.n}</div>
              <div style={{ height: 2, background: "rgba(0,0,0,0.1)", margin: "18px 10px" }} />
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, color: "#6B7A72" }}>GIÁ GỒM VAT</div>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 60, color: INK, lineHeight: 1.1 }}>{c.price}<span style={{ fontSize: 26, color: MINT_D }}> tỷ</span></div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, color: "#6B7A72", marginTop: 20 }}>ĐÓNG TRƯỚC<br />NHẬN NHÀ</div>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 40, color: INK, marginTop: 4 }}>{c.before}</div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, color: "#6B7A72", marginTop: 20 }}>NHẬN NHÀ</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: INK, marginTop: 4 }}>{c.key}</div>
              <div style={{ marginTop: 24, display: "inline-block", fontFamily: SANS, fontWeight: 800, fontSize: 22, color: "#fff", background: MINT_D, borderRadius: 999, padding: "8px 16px" }}>{c.tag}</div>
            </div>
          );
        })}
      </div>
      <Badge at={B("tong", "badge")} top={1300}>Chọn theo <span style={{ color: GOLD }}>dòng tiền</span> của gia đình mình</Badge>
      <Foot />
    </AbsoluteFill>
  );
};

// --- kêu gọi ---
const SceneCTA: React.FC = () => {
  const f = useCurrentFrame(); const sp = useSp();
  const bch = B("cta", "chips"), bct = B("cta", "cta");
  const k0 = sp(Math.max(0, bch - 10), 13), kC = sp(bct, 11);
  const types = ["STUDIO", "1PN+", "2PN", "3PN"];
  const sel = Math.floor(Math.max(0, f - bch - 12) / 12) % 4;
  return (
    <AbsoluteFill>
      <Header />
      <div style={{ position: "absolute", left: MX, right: MX, top: 380, textAlign: "center", opacity: Math.min(1, k0 * 1.4), transform: `translateY(${(1 - k0) * 30}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: 4, color: "#fff" }}>ANH CHỊ ĐANG QUAN TÂM</div>
        <GradText size={86} style={{ marginTop: 6 }}>CĂN MẤY PHÒNG?</GradText>
      </div>
      <div style={{ position: "absolute", left: MX, right: MX, top: 620, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {types.map((t, i) => {
          const k = spring({ frame: f - bch - i * 5, fps: FPS, config: { damping: 12, stiffness: 180, mass: 0.6 } });
          const on = f < bct - 6 ? sel === i : t === "2PN";
          return <div key={t} style={{ height: 130, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 52, color: on ? INK : "#fff", background: on ? CREAM : "rgba(255,255,255,0.07)", border: on ? `3px solid ${GOLD}` : "2px solid rgba(255,255,255,0.18)", opacity: Math.min(1, k * 1.4), transform: `scale(${(0.7 + 0.3 * k) * (on ? 1.03 : 1)})` }}>{t}</div>;
        })}
      </div>
      <div style={{ position: "absolute", left: MX, right: MX, top: 980, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: f < bct ? 0 : Math.min(1, kC * 1.4), transform: `scale(${0.8 + 0.2 * kC})` }}>
        <div style={{ background: GOLD, borderRadius: 22, padding: "24px 44px", fontFamily: SANS, fontWeight: 900, fontSize: 50, color: INK, boxShadow: `0 0 0 ${6 + 6 * (0.5 + 0.5 * Math.sin(f / 5))}px rgba(226,184,101,0.25)` }}>💬 NHẮN TIN CHO HOÀNG</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, color: "#fff", textAlign: "center", lineHeight: 1.3 }}>Nhận <span style={{ color: "#9BE8BE" }}>bảng tính dòng tiền</span><br />đúng căn anh chị chọn</div>
      </div>
      <Foot />
    </AbsoluteFill>
  );
};

// chuyển cảnh giữa các scene: trượt + mờ
const Trans: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const inK = ramp(f, 0, 12, Easing.out(Easing.cubic));
  const outK = ramp(f, dur - 10, dur, Easing.in(Easing.cubic));
  return <AbsoluteFill style={{ opacity: Math.min(inK, 1 - outK), transform: `translateY(${(1 - inK) * 40 - outK * 40}px)`, filter: `blur(${(1 - inK) * 8 + outK * 8}px)` }}>{children}</AbsoluteFill>;
};

// ===== SFX =====
const SFX: [number, string, number][] = [];
const add = (at: number, id: string, v: number) => SFX.push([at, id, v]);
// intro
add(s(0), "1492", 0.35); add(s(1.45), "166", 0.3); add(s(3.62), "3114", 0.32); add(s(4.9), "2568", 0.4);
add(s(5.5), "174", 0.28); add(s(7.1), "2568", 0.35); add(s(8.35), "2568", 0.35);
add(s(10.1), "166", 0.3); add(s(11.1), "3114", 0.3); [0, 5, 10].forEach((d) => add(s(13.7) + d, "1120", 0.35));
add(INTRO_F - 12, "2608", 0.42);
// scene (theo mốc giọng)
{
  const at = (k: SceneKey, beat: string) => START[k] + B(k, beat);
  const U = START.unit; add(U, "1120", 0.3); add(at("unit", "zoom"), "174", 0.3); add(at("unit", "hl"), "2568", 0.4); add(at("unit", "layout"), "166", 0.3); add(at("unit", "layout") + s(0.5), "1464", 0.3);
  [0, 4, 8, 12].forEach((d) => add(at("unit", "layout") + s(2.1) + d, "1120", 0.28));
  const plans: [SceneKey, string[]][] = [["nhanh", ["r1", "r2", "r3", "r4"]], ["chuan", ["r1", "r2", "r3"]], ["vay", ["r1", "r2", "r3"]]];
  for (const [k, rs] of plans) {
    const S0 = START[k]; add(S0, "1492", 0.3); add(S0 + 2, "166", 0.25);
    const p = at(k, "price"); add(p, "3114", 0.28); for (let i = 0; i < 6; i++) add(p + i * 4, i % 2 ? "1384" : "1382", 0.12);
    rs.forEach((r) => add(at(k, r), "2568", 0.38));
  }
  add(at("chuan", "r3") + 30, "2568", 0.3); add(at("nhanh", "r3") + 12, "1120", 0.25); add(at("chuan", "badge"), "1120", 0.25);
  for (let d = 0; d < 6; d++) add(at("chuan", "r2") + 10 + d * 9, "1120", 0.22);
  add(at("vay", "r3") + 36, "2568", 0.3);
  add(at("vay", "q"), "3114", 0.34); add(at("vay", "calm"), "174", 0.28); add(at("vay", "c1"), "3120", 0.32); add(at("vay", "c2"), "3114", 0.3);
  const T = START.tong; add(T, "1492", 0.3); [0, 8, 16].forEach((d) => add(at("tong", "cards") + d, "2568", 0.38)); add(at("tong", "badge"), "1120", 0.28);
  const C = START.cta; add(C, "1492", 0.3); [0, 5, 10, 15].forEach((d) => add(at("cta", "chips") + d, "1120", 0.25)); add(at("cta", "cta"), "3114", 0.32);
}

export const GSLBangTinh2PN: React.FC<{ refOpacity?: number; voice?: string | null }> = ({ refOpacity = 0, voice = "audio/bt2pn/voice.wav" }) => {
  return (
    <AbsoluteFill style={{ background: BG0 }}>
      <Sequence from={INTRO_F - 1} layout="none"><Backdrop /></Sequence>
      <Sequence durationInFrames={INTRO_F}><Intro /></Sequence>
      {SC.map((c) => {
        const dur = s(c.dur);
        const El = { unit: () => <SceneUnit refOpacity={refOpacity} />, nhanh: SceneNhanh, chuan: SceneChuan, vay: SceneVay, tong: SceneTong, cta: SceneCTA }[c.key];
        return <Sequence key={c.key} from={START[c.key]} durationInFrames={dur}><Trans dur={dur}><El /></Trans></Sequence>;
      })}
      {SFX.map(([at, id, v], i) => <Sequence key={i} from={at} layout="none"><Audio src={staticFile(`audio/sfx_bt/${id}.wav`)} volume={v} /></Sequence>)}
      {voice ? <Sequence from={INTRO_F + s(VO_LEAD)} layout="none"><Audio src={staticFile(voice)} /></Sequence> : null}
    </AbsoluteFill>
  );
};

// still kiểm tra layout đè lên bản gốc
export const GSLBangTinhUnitCheck: React.FC = () => (
  <AbsoluteFill style={{ background: CREAM, padding: 40 }}>
    <UnitPlan draw={1} fill={1} labels={0} refOpacity={0.5} />
  </AbsoluteFill>
);
