import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadScript } from "@remotion/google-fonts/DancingScript";

/**
 * Thumbnail / ảnh bìa dọc 1080×1920 cho video mở đầu 1105 (Green Skyline).
 * Phong cách theo memory feedback-cover-thumbnail-style: chữ to vàng kim loại có viền, dải cọ, người to, nền rực, icon tròn viền vàng.
 * Ảnh: khung đầu tiên gốc 4K của clip 1105-1 (nét hơn khung đầu video đã zoom), người tách nền để chữ nằm sau đầu.
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["700", "800", "900"], subsets: ["vietnamese", "latin"] });
const { fontFamily: SCRIPT } = loadScript("normal", { weights: ["700"], subsets: ["vietnamese", "latin"] });

const GOLD_TEXT = "linear-gradient(180deg, #FFF6D2 0%, #F7D980 30%, #D59B2E 55%, #F3CF73 75%, #FFF0B8 100%)";
const DEEP = "#0F3B2A";
const GRADE = "contrast(1.1) saturate(1.35) brightness(1.03)";
// người: giữ đúng tông da như video (GSLOpening1105 GRADE), sáng nhẹ hơn chút
const SKIN = "contrast(1.05) saturate(1.1) brightness(1.05)";
// đưa người lên to + lệch phải
const IMG_TF = "translate(110px, 340px) scale(1.32)";
const IMG_ORIGIN = "490px 1150px";

const Brush: React.FC<{ color: string; w: number; h: number; rot?: number; seed?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ color, w, h, rot = -2, seed = 3, children, style }) => (
  <div style={{ position: "relative", width: w, height: h, transform: `rotate(${rot}deg)`, display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
    <svg width={w + 60} height={h + 40} style={{ position: "absolute", left: -30, top: -20, overflow: "visible" }}>
      <defs>
        <filter id={`b${seed}`} x="-10%" y="-30%" width="120%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.22" numOctaves="3" seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`s${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.004 0.6" numOctaves="2" seed={seed + 5} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.16 0" /></filter>
      </defs>
      <g filter={`url(#b${seed})`}>
        <path d={`M30 ${24} Q ${(w + 60) / 2} 6 ${w + 36} 22 L ${w + 50} ${h + 18} Q ${(w + 60) / 2} ${h + 34} 14 ${h + 16} Z`} fill={color} />
      </g>
      <rect x="30" y="22" width={w} height={h - 4} filter={`url(#s${seed})`} />
    </svg>
    <div style={{ position: "relative" }}>{children}</div>
  </div>
);

const GoldText: React.FC<{ size: number; children: React.ReactNode; ls?: number }> = ({ size, children, ls = 0 }) => (
  <div style={{ filter: "drop-shadow(2px 0 0 #4A2E08) drop-shadow(-2px 0 0 #4A2E08) drop-shadow(0 2px 0 #4A2E08) drop-shadow(0 -2px 0 #4A2E08) drop-shadow(0 6px 0 #3A2406) drop-shadow(0 14px 26px rgba(0,0,0,0.55))" }}>
    <div style={{
      fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 0.92, letterSpacing: ls,
      backgroundImage: GOLD_TEXT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
      padding: "0.05em 0.03em",
    }}>{children}</div>
  </div>
);

const Icon: React.FC<{ kind: "pin" | "sofa" | "pct" | "key" }> = ({ kind }) => {
  const c = "#F5D27A";
  const p: Record<string, React.ReactNode> = {
    pin: <path d="M32 8c-9 0-16 7-16 16 0 12 16 30 16 30s16-18 16-30c0-9-7-16-16-16zm0 22a6 6 0 110-12 6 6 0 010 12z" fill={c} />,
    sofa: <g fill={c}><rect x="10" y="26" width="44" height="14" rx="4" /><rect x="6" y="22" width="8" height="22" rx="3" /><rect x="50" y="22" width="8" height="22" rx="3" /><rect x="14" y="16" width="36" height="12" rx="4" /><rect x="12" y="44" width="4" height="6" /><rect x="48" y="44" width="4" height="6" /></g>,
    pct: <g fill="none" stroke={c} strokeWidth="5" strokeLinecap="round"><circle cx="20" cy="20" r="6" /><circle cx="44" cy="44" r="6" /><line x1="46" y1="14" x2="18" y2="50" /></g>,
    key: <g fill="none" stroke={c} strokeWidth="5" strokeLinecap="round"><circle cx="22" cy="32" r="10" /><line x1="32" y1="32" x2="56" y2="32" /><line x1="48" y1="32" x2="48" y2="42" /><line x1="56" y1="32" x2="56" y2="40" /></g>,
  };
  return <svg width="64" height="64" viewBox="0 0 64 64">{p[kind]}</svg>;
};

const ICONS: { kind: "pin" | "sofa" | "pct" | "key"; t1: string; t2: string }[] = [
  { kind: "pin", t1: "CẠNH GO!", t2: "& Hoàn Mỹ" },
  { kind: "sofa", t1: "FULL", t2: "nội thất" },
  { kind: "pct", t1: "LÃI 0%", t2: "18 tháng" },
  { kind: "key", t1: "CHỈ 10%", t2: "ký HĐMB" },
];

export const GSLThumb1105: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B1310", overflow: "hidden" }}>
    {/* nền */}
    <AbsoluteFill style={{ transform: IMG_TF, transformOrigin: IMG_ORIGIN }}>
      <Img src={staticFile("images/op1105/bg0.jpg")} style={{ width: 1080, height: 1920, filter: GRADE }} />
    </AbsoluteFill>
    {/* trời: phủ màu rực (xanh ngọc → vàng nắng) */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,70,60,0.78) 0%, rgba(20,110,90,0.45) 22%, rgba(255,190,90,0.18) 34%, rgba(0,0,0,0) 44%)", mixBlendMode: "multiply" }} />
    <AbsoluteFill style={{ background: "radial-gradient(60% 30% at 80% 34%, rgba(255,214,120,0.45), rgba(255,214,120,0) 70%)", mixBlendMode: "screen" }} />

    {/* CHỮ SAU NGƯỜI */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 404, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 18 }}>
      <GoldText size={330} ls={-14}>47</GoldText>
      <div style={{ marginBottom: 40 }}>
        <GoldText size={98}>TRIỆU</GoldText>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 80, color: "#fff", lineHeight: 1, textAlign: "center", textShadow: "0 5px 0 #0F3B2A, 0 10px 24px rgba(0,0,0,0.6)" }}>/M²</div>
      </div>
    </div>

    {/* người */}
    <AbsoluteFill style={{ transform: IMG_TF, transformOrigin: IMG_ORIGIN }}>
      <Img src={staticFile("images/op1105/person0.png")} style={{ width: 1080, height: 1920, filter: SKIN }} />
    </AbsoluteFill>

    {/* logo + nhãn dự án */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 214, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
      <div style={{ background: "#FBF7EE", borderRadius: 16, padding: "8px 14px", boxShadow: "0 0 0 4px #E2B865, 0 10px 26px rgba(0,0,0,0.45)" }}>
        <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 78, display: "block" }} />
      </div>
    </div>
    {/* "chỉ từ" */}
    <div style={{ position: "absolute", left: 110, top: 356, fontFamily: SCRIPT, fontWeight: 700, fontSize: 96, color: "#fff", transform: "rotate(-9deg)", textShadow: "0 4px 0 #0F3B2A, 0 8px 22px rgba(0,0,0,0.6)" }}>chỉ từ</div>

    {/* dải: bàn giao full nội thất */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 742, display: "flex", justifyContent: "center" }}>
      <Brush color={DEEP} w={860} h={104} rot={-2.5} seed={7}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 54, color: "#fff", letterSpacing: 1 }}>
          BÀN GIAO <span style={{ color: "#F5D27A" }}>FULL NỘI THẤT</span>
        </div>
      </Brush>
    </div>

    {/* CTA đáy */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1570, display: "flex", justifyContent: "center" }}>
      <Brush color="#E9BC52" w={900} h={124} rot={-1.5} seed={9}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64, color: "#101010", letterSpacing: 1 }}>CÓ NÊN MUA LÚC NÀY?</div>
      </Brush>
    </div>
  </AbsoluteFill>
);
