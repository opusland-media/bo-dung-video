import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";

/** Thumbnail / ảnh bìa dọc video 1122 "Cư dân Green Skyline nhận sổ hồng" (23/11/2026).
 * Phong cách theo memory feedback-cover-thumbnail-style (như GSLThumbChinhSach): chữ vàng kim loại có viền,
 * dải cọ, người to nửa dưới, nền ảnh thật rực rỡ, huy hiệu tròn viền vàng. Chữ quan trọng nằm trong x108–972.
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["700", "800", "900"], subsets: ["vietnamese", "latin"] });

const GOLD_TEXT = "linear-gradient(180deg, #FFF6D2 0%, #F7D980 30%, #D59B2E 55%, #F3CF73 75%, #FFF0B8 100%)";
const DEEP = "#0F3B2A";
const GRADE = "contrast(1.08) saturate(1.3) brightness(1.02)";

const Brush: React.FC<{ color: string; w: number; h: number; rot?: number; seed?: number; children: React.ReactNode }> = ({ color, w, h, rot = -2, seed = 3, children }) => (
  <div style={{ position: "relative", width: w, height: h, transform: `rotate(${rot}deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
    <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 0.92, letterSpacing: ls, whiteSpace: "nowrap", backgroundImage: GOLD_TEXT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", padding: "0.2em 0.03em 0.05em" }}>{children}</div>
  </div>
);

const BADGES = [
  { n: "18%", t: "CHIẾT KHẤU" },
  { n: "4/2027", t: "NHẬN NHÀ" },
  { n: "0%", t: "LÃI 12 THÁNG" },
];

/** v3 (23/11/2026): sổ hồng thật lớn đặt SAU lưng (người tách nền nằm trên), chữ "ĐÃ CÓ SỔ HỒNG" ngang tay, bỏ huy hiệu tròn. */
const FR: React.CSSProperties = { position: "absolute", width: 1210, height: 2151, left: -65, top: 60 };
export const GSLThumbSoHong: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B1310", overflow: "hidden" }}>
    <Img src={staticFile("images/gslsh/frame.jpg")} style={{ ...FR, filter: "contrast(1.04) saturate(1.12) brightness(0.98)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(6,22,18,0.55) 0%, rgba(0,0,0,0) 25%)" }} />
    {/* real sổ hồng behind the shoulders */}
    <div style={{ position: "absolute", left: 540 - 345, top: 150, width: 690, transform: "rotate(-2.5deg)", borderRadius: 14, overflow: "hidden", boxShadow: "0 0 0 6px #E2B865, 0 30px 60px rgba(0,0,0,0.65)", background: "#fff" }}>
      <Img src={staticFile("images/gslsh/sohong.jpg")} style={{ width: 690, display: "block", filter: "contrast(1.06) saturate(1.08)" }} />
    </div>
    {/* the speaker cut out, in front of the document */}
    <Img src={staticFile("images/gslsh/frame_person.png")} style={{ ...FR, filter: "contrast(1.04) saturate(1.12) brightness(0.98) drop-shadow(0 0 30px rgba(0,0,0,0.55))" }} />
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(5,16,12,0.96) 0%, rgba(5,16,12,0.78) 18%, rgba(0,0,0,0) 38%)" }} />

    <div style={{ position: "absolute", left: 0, right: 0, top: 1280, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 46, color: "#fff", letterSpacing: 2, textShadow: "0 5px 0 #0F3B2A, 0 10px 24px rgba(0,0,0,0.7)" }}>CƯ DÂN GREEN SKYLINE</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1318, display: "flex", justifyContent: "center" }}>
      <GoldText size={90} ls={-3}>ĐÃ CÓ</GoldText>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1398, display: "flex", justifyContent: "center" }}>
      <GoldText size={156} ls={-6}>SỔ HỒNG</GoldText>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1628, display: "flex", justifyContent: "center" }}>
      <Brush color={DEEP} w={780} h={92} rot={-2} seed={7}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 46, color: "#fff", letterSpacing: 1, whiteSpace: "nowrap" }}>
          CHỈ SAU <span style={{ color: "#F5D27A" }}>20 NGÀY</span> BÀN GIAO
        </div>
      </Brush>
    </div>
  </AbsoluteFill>
);
