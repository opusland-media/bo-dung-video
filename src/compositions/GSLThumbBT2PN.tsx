import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";

/** Thumbnail dọc 1080×1920 — video bảng tính căn 2PN T2.07.13 (3 phương án). Ảnh người: ảnh user gửi 07/11/2026, đã tách nền. */
const { fontFamily: SANS } = loadMont("normal", { weights: ["700", "800", "900"], subsets: ["vietnamese", "latin"] });
const GOLD_TEXT = "linear-gradient(180deg, #FFF6D2 0%, #F7D980 30%, #D59B2E 55%, #F3CF73 75%, #FFF0B8 100%)";
const DEEP = "#0F3B2A";

const Brush: React.FC<{ color: string; w: number; h: number; rot?: number; seed?: number; children: React.ReactNode }> = ({ color, w, h, rot = -2, seed = 3, children }) => (
  <div style={{ position: "relative", width: w, height: h, transform: `rotate(${rot}deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={w + 60} height={h + 40} style={{ position: "absolute", left: -30, top: -20, overflow: "visible" }}>
      <defs>
        <filter id={`b${seed}`} x="-10%" y="-30%" width="120%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.22" numOctaves="3" seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="24" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#b${seed})`}><path d={`M30 24 Q ${(w + 60) / 2} 6 ${w + 36} 22 L ${w + 50} ${h + 18} Q ${(w + 60) / 2} ${h + 34} 14 ${h + 16} Z`} fill={color} /></g>
    </svg>
    <div style={{ position: "relative" }}>{children}</div>
  </div>
);
const GoldText: React.FC<{ size: number; children: React.ReactNode; ls?: number }> = ({ size, children, ls = 0 }) => (
  <div style={{ filter: "drop-shadow(2px 0 0 #4A2E08) drop-shadow(-2px 0 0 #4A2E08) drop-shadow(0 2px 0 #4A2E08) drop-shadow(0 -2px 0 #4A2E08) drop-shadow(0 6px 0 #3A2406) drop-shadow(0 14px 26px rgba(0,0,0,0.55))" }}>
    <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 0.95, letterSpacing: ls, backgroundImage: GOLD_TEXT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", padding: "0.05em 0.03em", whiteSpace: "nowrap" }}>{children}</div>
  </div>
);

const GRADE = "contrast(1.1) saturate(1.15) brightness(1.18)";
const SKIN = "contrast(1.12) saturate(0.9) brightness(1.33)"; // khớp màu da ảnh chụp màn hình user gửi (đo trung bình vùng da)
// phóng người to + hạ xuống: gốc phóng ở đáy giữa khung
const IMG_TF = "translate(0px, 120px) scale(1.3)";
const IMG_ORIGIN = "540px 1920px";

export const GSLThumbBT2PN: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B1310", overflow: "hidden" }}>
    <AbsoluteFill style={{ transform: IMG_TF, transformOrigin: IMG_ORIGIN }}>
      <Img src={staticFile("images/bt2pn/th_bg.jpg")} style={{ width: 1080, height: 1920, filter: `${GRADE} blur(2px)` }} />
    </AbsoluteFill>
    {/* trời/cây phía trên: phủ xanh đậm để chữ nổi */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(6,45,32,0.85) 0%, rgba(8,60,42,0.6) 22%, rgba(255,200,100,0.12) 34%, rgba(0,0,0,0) 44%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(50% 26% at 54% 36%, rgba(255,214,120,0.38), rgba(255,214,120,0) 70%)", mixBlendMode: "screen" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 70%, rgba(4,20,14,0.5) 100%)" }} />

    {/* CHỮ SAU NGƯỜI */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 236, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 50, color: "#fff", letterSpacing: 1, textShadow: "0 5px 0 #0F3B2A, 0 10px 24px rgba(0,0,0,0.6)" }}>CÙNG 1 CĂN, CHÊNH TỚI</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 14 }}>
      <GoldText size={290} ls={-12}>500</GoldText>
      <div style={{ marginBottom: 52 }}><GoldText size={104}>TRIỆU</GoldText></div>
    </div>

    {/* người */}
    <AbsoluteFill style={{ transform: IMG_TF, transformOrigin: IMG_ORIGIN }}>
      <Img src={staticFile("images/bt2pn/th_person.png")} style={{ width: 1080, height: 1920, filter: SKIN }} />
    </AbsoluteFill>

    {/* logo */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 140, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#FBF7EE", borderRadius: 14, padding: "6px 14px", boxShadow: "0 0 0 4px #E2B865, 0 10px 26px rgba(0,0,0,0.45)" }}>
        <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 62, display: "block" }} />
      </div>
    </div>

    {/* dải giữa */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1150, display: "flex", justifyContent: "center" }}>
      <Brush color={DEEP} w={900} h={112} rot={-2.5} seed={7}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 56, color: "#fff", letterSpacing: 1, whiteSpace: "nowrap" }}>
          CĂN 2PN · <span style={{ color: "#F5D27A" }}>3 CÁCH TRẢ</span>
        </div>
      </Brush>
    </div>

    {/* CTA đáy */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1560, display: "flex", justifyContent: "center" }}>
      <Brush color="#E9BC52" w={860} h={124} rot={-1.5} seed={9}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 62, color: "#101010", letterSpacing: 1 }}>CHỌN CÁCH NÀO?</div>
      </Brush>
    </div>
  </AbsoluteFill>
);
