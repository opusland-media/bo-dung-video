import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadScript } from "@remotion/google-fonts/DancingScript";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";

/**
 * Ảnh bìa dọc TikTok — phong cách user duyệt (mẫu ChatGPT 13/10/2026):
 * chữ vàng ánh kim trên dải nét cọ, người to nửa dưới, nền rực, icon tròn viền vàng.
 * Dùng ảnh THẬT của dự án + hình người tách nền từ video (không vẽ lại).
 */
export const { fontFamily: HEAVY } = loadMont("normal", { weights: ["800", "900"], subsets: ["vietnamese", "latin"] });
export const { fontFamily: SCRIPT } = loadScript("normal", { weights: ["700"], subsets: ["vietnamese", "latin"] });
const { fontFamily: SERIF } = loadPlayfair("normal", { weights: ["600"], subsets: ["vietnamese", "latin"] });

const NAVY = "#0B1830";
const img = (n: string) => staticFile(`images/sosanh/${n}`);
const GOLD_GRAD = "linear-gradient(180deg, #FFF7D1 0%, #FFE08A 28%, #F2B93B 55%, #C8891C 78%, #FFE7A0 100%)";

// dải nét cọ (mép răng cưa bằng feTurbulence)
export const Brush: React.FC<{ id: string; w: number; h: number; fill: string; style?: React.CSSProperties; rotate?: number }> = ({ id, w, h, fill, style, rotate = -3 }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", overflow: "visible", transform: `rotate(${rotate}deg)`, ...style }}>
    <defs>
      <filter id={`rough-${id}`} x="-10%" y="-30%" width="120%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035 0.6" numOctaves="3" seed={id.length * 7} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <linearGradient id={`gold-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFE9A6" />
        <stop offset="0.45" stopColor="#F1BC45" />
        <stop offset="1" stopColor="#B57A16" />
      </linearGradient>
    </defs>
    <path
      d={`M ${w * 0.02} ${h * 0.18} L ${w * 0.97} ${h * 0.06} L ${w} ${h * 0.5} L ${w * 0.985} ${h * 0.92} L ${w * 0.04} ${h} L 0 ${h * 0.55} Z`}
      fill={fill === "gold" ? `url(#gold-${id})` : fill}
      filter={`url(#rough-${id})`}
    />
  </svg>
);

export const GoldText: React.FC<{ children: React.ReactNode; size: number; style?: React.CSSProperties }> = ({ children, size, style }) => (
  <div style={{ fontFamily: HEAVY, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: 1, color: "transparent", backgroundImage: GOLD_GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", filter: "drop-shadow(0 4px 0 #3a2400) drop-shadow(0 10px 18px rgba(0,0,0,0.65))", ...style }}>
    {children}
  </div>
);

export const Flare: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <div style={{ position: "absolute", left: x - 160 * s, top: y - 160 * s, width: 320 * s, height: 320 * s, background: "radial-gradient(circle, rgba(255,240,200,0.95) 0%, rgba(255,210,120,0.45) 18%, rgba(255,200,100,0) 60%)", mixBlendMode: "screen" }} />
);

// icon tròn viền vàng
const ICONS: Record<string, React.ReactNode> = {
  money: <path d="M4 7h16v10H4z M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z M7 7v10 M17 7v10" />,
  pin: <path d="M12 21s-6-5.6-6-10a6 6 0 1 1 12 0c0 4.4-6 10-6 10z M12 8.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />,
  towers: <path d="M4 20V9l4-2v13 M10 20V4l5 2v14 M17 20v-9l3 1.5V20 M3 20h18" />,
  layout: <path d="M4 4h16v16H4z M4 12h9 M13 4v16 M13 15h7" />,
  pool: <path d="M3 17c2 0 2-1.5 4.5-1.5S9.5 17 12 17s2.5-1.5 4.5-1.5S19 17 21 17 M7 14V5a2 2 0 0 1 4 0 M13 14V5a2 2 0 0 1 4 0 M7 9h6" />,
  key: <path d="M8 14a4 4 0 1 1 3.5-6H21v3h-2v2h-3v-2h-4.5A4 4 0 0 1 8 14z" />,
  crane: <path d="M5 21V4h2v17 M3 21h8 M7 5h13 M17 5v6 M15 11h4v3h-4z M7 9l4-4" />,
  people: <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6 M17 11a2.5 2.5 0 1 0 0-5 M16 14c2.8 0 5 2.2 5 5" />,
};
const IconItem: React.FC<{ icon: string; a: string; b: string }> = ({ icon, a, b }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
    <div style={{ width: 92, height: 92, borderRadius: "50%", border: "4px solid #F1BC45", background: "rgba(11,24,48,0.85)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 18px rgba(241,188,69,0.45)" }}>
      <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#F6CB5A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        {ICONS[icon]}
      </svg>
    </div>
    <div style={{ fontFamily: HEAVY, fontWeight: 800, fontSize: 30, lineHeight: 1.12, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
      {a}
      <br />
      {b}
    </div>
  </div>
);

export type Cover2Props = { part: 1 | 2 };

export const SoSanhCover2: React.FC<Cover2Props> = ({ part }) => {
  const p1 = part === 1;
  return (
    <AbsoluteFill style={{ background: NAVY, overflow: "hidden" }}>
      {/* ── nền trên: 2 dự án chia chéo bằng tia sáng ── */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1060, overflow: "hidden" }}>
        <Img src={img(p1 ? "pv_river_frame.jpg" : "pv_048.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: p1 ? "30% 50%" : "50% 60%", clipPath: "polygon(0 0, 62% 0, 38% 100%, 0 100%)", filter: "saturate(1.35) contrast(1.08) brightness(1.02)" }} />
        <Img src={img(p1 ? "pr_t049.jpg" : "pr_t079.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: p1 ? "62% 50%" : "50% 50%", clipPath: "polygon(62% 0, 100% 0, 100% 100%, 38% 100%)", filter: "saturate(1.35) contrast(1.08) brightness(1.02)" }} />
        {/* tia sáng chéo */}
        <div style={{ position: "absolute", left: "50%", top: -100, width: 10, height: 1300, background: "linear-gradient(180deg, rgba(255,255,255,0), #fff6d0 40%, #FFD36A 60%, rgba(255,255,255,0))", transform: "translateX(-50%) rotate(12.5deg)", boxShadow: "0 0 40px 12px rgba(255,214,120,0.7)" }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,24,48,0.55) 0%, rgba(11,24,48,0) 22%, rgba(11,24,48,0) 70%, rgba(11,24,48,0.9) 100%)" }} />
      </div>
      {/* ── nền dưới: phòng khách (video) làm mờ ── */}
      <Img src={img("room26.png")} style={{ position: "absolute", top: 1000, left: 0, width: "100%", height: 920, objectFit: "cover", objectPosition: "52% 60%", filter: "blur(10px) brightness(0.7)", transform: "scale(1.1)" }} />
      <div style={{ position: "absolute", top: 960, left: 0, right: 0, height: 160, background: `linear-gradient(180deg, ${NAVY}, rgba(11,24,48,0))` }} />

      {/* ── logo 2 góc ── */}
      <Img src={img("prive_logo_white.png")} style={{ position: "absolute", top: 70, left: 50, width: 330, filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.7))" }} />
      <Img src={img("palm_logo_white.png")} style={{ position: "absolute", top: 82, right: 50, width: 320, filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.7))" }} />

      {/* ── PHẦN x/2 ── */}
      <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 470, height: 130 }}>
          <Brush id={`p${part}`} w={470} h={130} fill="gold" />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAVY, fontWeight: 900, fontSize: 64, color: "#111", transform: "rotate(-3deg)" }}>PHẦN {part}/2</div>
        </div>
      </div>

      {/* ── khối chữ chính ── */}
      {p1 ? (
        <div style={{ position: "absolute", top: 420, left: 0, right: 0, height: 470 }}>
          <Brush id="main1" w={1040} h={430} fill={NAVY} style={{ left: 20, top: 20, opacity: 0.92 }} rotate={-4} />
          <Flare x={190} y={95} s={0.9} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: "rotate(-4deg)" }}>
            <GoldText size={150}>THE PRIVÉ</GoldText>
            <div style={{ fontFamily: SCRIPT, fontWeight: 700, fontSize: 104, color: "#fff", margin: "-18px 0 -24px", textShadow: "0 4px 14px rgba(0,0,0,0.8)" }}>hay</div>
            <GoldText size={136}>PALM RIVER?</GoldText>
          </div>
        </div>
      ) : (
        <div style={{ position: "absolute", top: 410, left: 0, right: 0, height: 520 }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, textAlign: "center", fontFamily: SERIF, fontWeight: 600, fontSize: 46, letterSpacing: 6, color: "#FFE7A0", textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}>THE PRIVÉ hay PALM RIVER</div>
          <Brush id="w2" w={900} h={190} fill="#FFFFFF" style={{ left: 90, top: 80 }} rotate={-3} />
          <div style={{ position: "absolute", top: 80, left: 90, width: 900, height: 190, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-3deg)", fontFamily: HEAVY, fontWeight: 900, fontSize: 132, color: NAVY }}>TIỆN ÍCH</div>
          <Brush id="g2" w={900} h={190} fill="gold" style={{ left: 90, top: 270 }} rotate={-3} />
          <Flare x={950} y={290} s={0.8} />
          <div style={{ position: "absolute", top: 270, left: 90, width: 900, height: 190, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-3deg)", fontFamily: HEAVY, fontWeight: 900, fontSize: 132, color: NAVY }}>TIẾN ĐỘ</div>
        </div>
      )}

      {/* ── người (tách nền từ video thật) ── */}
      <Img src={img(p1 ? "cover_face1.png" : "cover_face2.png")} style={{ position: "absolute", bottom: 0, left: p1 ? "40%" : "40%", height: 1000, transform: "translateX(-50%)", filter: "drop-shadow(0 0 30px rgba(0,0,0,0.75))" }} />

      {/* ── cột icon (khớp nội dung video) ── */}
      <div style={{ position: "absolute", right: 30, top: p1 ? 1010 : 1000, display: "flex", flexDirection: "column", gap: 26, padding: "26px 26px", background: "linear-gradient(90deg, rgba(11,24,48,0.15), rgba(11,24,48,0.82))", borderRadius: 18 }}>
        {p1 ? (
          <>
            <IconItem icon="money" a="GIÁ" b="CĂN 2PN" />
            <IconItem icon="pin" a="VỊ TRÍ" b="KẾT NỐI" />
            <IconItem icon="towers" a="QUY MÔ" b="CỘNG ĐỒNG" />
          </>
        ) : (
          <>
            <IconItem icon="layout" a="THIẾT KẾ" b="CĂN HỘ" />
            <IconItem icon="pool" a="TIỆN ÍCH" b="NỘI KHU" />
            <IconItem icon="key" a="BÀN GIAO" b="NỘI THẤT" />
            <IconItem icon="crane" a="TIẾN ĐỘ" b="CHÍNH SÁCH" />
          </>
        )}
      </div>

      {/* ── câu hỏi đáy ── */}
      <div style={{ position: "absolute", bottom: 120, left: 0, right: 0, height: 190 }}>
        <Brush id={`b${part}`} w={1060} h={190} fill={p1 ? NAVY : "gold"} style={{ left: 10, top: 0, opacity: p1 ? 0.95 : 1 }} rotate={-4} />
        <Flare x={900} y={20} s={0.7} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-4deg)" }}>
          {p1 ? (
            <GoldText size={76}>NÊN CHỌN DỰ ÁN NÀO?</GoldText>
          ) : (
            <div style={{ fontFamily: HEAVY, fontWeight: 900, fontSize: 84, color: NAVY }}>AI HỢP DỰ ÁN NÀO?</div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
