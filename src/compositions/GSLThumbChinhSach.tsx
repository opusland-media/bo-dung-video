import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadScript } from "@remotion/google-fonts/DancingScript";

/** Thumbnail video "Toàn bộ chính sách bán hàng" Green Skyline (18/11/2026) — dựa trên GSLThumbMatBang.
 * Gốc phong cách từ GSLThumb1105.
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
// const IMG_TF = "translate(110px, 340px) scale(1.32)";
// const IMG_ORIGIN = "490px 1150px";

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
      padding: "0.2em 0.03em 0.05em",
    }}>{children}</div>
  </div>
);


const CARDS = [
  { n: "6–8%", t: "CHIẾT KHẤU", s: "ƯU ĐÃI TÂN GIA" },
  { n: "+1,5%", t: "MUA NHIỀU CĂN", s: "CỘNG THÊM" },
  { n: "9%", t: "THANH TOÁN NHANH", s: "CHIẾT KHẤU" },
  { n: "0%", t: "LÃI SUẤT 12 THÁNG", s: "KHI VAY 70%" },
];

export const GSLThumbChinhSach: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B1310", overflow: "hidden" }}>
    <Img src={staticFile("images/gslcs/thumb_bg.jpg")} style={{ position: "absolute", height: 1920, width: 2878, left: -1000, top: 0, filter: GRADE }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(6,32,26,0.92) 0%, rgba(8,48,40,0.7) 26%, rgba(0,0,0,0) 46%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(50% 22% at 70% 50%, rgba(255,205,110,0.35), rgba(255,205,110,0) 70%)", mixBlendMode: "screen" }} />
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(5,20,15,0.9) 0%, rgba(5,20,15,0.6) 22%, rgba(0,0,0,0) 42%)" }} />

    <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#FBF7EE", borderRadius: 16, padding: "8px 14px", boxShadow: "0 0 0 4px #E2B865, 0 10px 26px rgba(0,0,0,0.45)" }}>
        <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 66, display: "block" }} />
      </div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 60, color: "#fff", letterSpacing: 2, textShadow: "0 5px 0 #0F3B2A, 0 10px 24px rgba(0,0,0,0.6)" }}>TỔNG HỢP TOÀN BỘ</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 356, display: "flex", justifyContent: "center" }}>
      <GoldText size={112} ls={-3}>CHÍNH SÁCH</GoldText>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 476, display: "flex", justifyContent: "center" }}>
      <GoldText size={186} ls={-5}>ƯU ĐÃI</GoldText>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 730, display: "flex", justifyContent: "center" }}>
      <Brush color={DEEP} w={820} h={100} rot={-2.5} seed={7}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 50, color: "#fff", letterSpacing: 1 }}>
          MUA LÚC NÀY <span style={{ color: "#F5D27A" }}>ĐƯỢC GÌ?</span>
        </div>
      </Brush>
    </div>

    <div style={{ position: "absolute", left: 116, right: 116, top: 1170, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      {CARDS.map((c) => (
        <div key={c.n} style={{ borderRadius: 22, background: "linear-gradient(180deg, rgba(15,59,42,0.96), rgba(8,32,22,0.96))", boxShadow: "0 0 0 4px #E2B865, 0 14px 30px rgba(0,0,0,0.55)", padding: "8px 8px 16px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center" }}><GoldText size={92} ls={-3}>{c.n}</GoldText></div>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 31, color: "#fff", marginTop: 6 }}>{c.t}</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, color: "#F5D27A", marginTop: 6, letterSpacing: 0.5 }}>{c.s}</div>
        </div>
      ))}
    </div>

    <div style={{ position: "absolute", left: 0, right: 0, top: 1636, display: "flex", justifyContent: "center" }}>
      <Brush color="#E9BC52" w={820} h={110} rot={-1.5} seed={9}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 56, color: "#101010", letterSpacing: 1 }}>CHỈ ĐÓNG TRƯỚC 10%</div>
      </Brush>
    </div>
  </AbsoluteFill>
);
