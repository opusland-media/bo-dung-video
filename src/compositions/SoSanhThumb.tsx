import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Brush, GoldText, Flare, HEAVY } from "./SoSanhCover2";

/**
 * Thumbnail YouTube ngang 1920×1080 cho video "The Privé hay Palm River" — 2 mẫu A/B để Test & Compare.
 * Phong cách user duyệt (chữ vàng kim loại trên dải cọ, người to, nền rực) — ảnh dự án THẬT + người tách nền từ video.
 */
const NAVY = "#0B1830";
const img = (n: string) => staticFile(`images/sosanh/${n}`);
const VIVID = "saturate(1.35) contrast(1.1) brightness(1.03)";

const Person: React.FC<{ src: string; left: number; h: number }> = ({ src, left, h }) => (
  <Img src={img(src)} style={{ position: "absolute", bottom: -40, left, height: h, filter: "drop-shadow(0 0 26px rgba(0,0,0,0.85)) drop-shadow(0 0 4px rgba(0,0,0,0.9))" }} />
);

// Mẫu A — "CHÊNH 3,7 TỶ / ĐỔI LẤY GÌ?"
const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY, overflow: "hidden" }}>
    <Img src={img("pv_river_frame.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "40% 50%", clipPath: "polygon(0 0, 56% 0, 44% 100%, 0 100%)", filter: VIVID }} />
    <Img src={img("pr_t049.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "60% 50%", clipPath: "polygon(56% 0, 100% 0, 100% 100%, 44% 100%)", filter: VIVID }} />
    <div style={{ position: "absolute", left: "50%", top: -100, width: 9, height: 1300, background: "linear-gradient(180deg, rgba(255,255,255,0), #fff6d0 35%, #FFD36A 65%, rgba(255,255,255,0))", transform: "translateX(-50%) rotate(6.3deg)", boxShadow: "0 0 40px 12px rgba(255,214,120,0.7)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(11,24,48,0.7) 0%, rgba(11,24,48,0.35) 38%, rgba(11,24,48,0) 58%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,24,48,0.5) 0%, rgba(11,24,48,0) 25%)" }} />

    {/* logo 2 dự án */}
    <Img src={img("prive_logo_white.png")} style={{ position: "absolute", top: 48, left: 60, width: 330, filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.8))" }} />
    <Img src={img("palm_logo_white.png")} style={{ position: "absolute", top: 56, left: 1090, width: 290, filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.8))" }} />

    <Person src="cover_face1.png" left={1080} h={1120} />

    {/* CHÊNH */}
    <div style={{ position: "absolute", left: 70, top: 200, width: 520, height: 150 }}>
      <Brush id="aChenh" w={520} h={150} fill={NAVY} rotate={-4} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-4deg)", fontFamily: HEAVY, fontWeight: 900, fontSize: 104, color: "#fff", letterSpacing: 4 }}>CHÊNH</div>
    </div>
    {/* 3,7 TỶ */}
    <Flare x={180} y={420} s={1.1} />
    <div style={{ position: "absolute", left: 40, top: 330, transform: "rotate(-4deg)" }}>
      <GoldText size={330} style={{ letterSpacing: -4, filter: "drop-shadow(0 6px 0 #3a2400) drop-shadow(0 14px 26px rgba(0,0,0,0.75))" }}>3,7 TỶ</GoldText>
    </div>
    {/* ĐỔI LẤY GÌ? */}
    <div style={{ position: "absolute", left: 50, top: 730, width: 980, height: 220 }}>
      <Brush id="aDoi" w={980} h={220} fill="gold" rotate={-4} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-4deg)", fontFamily: HEAVY, fontWeight: 900, fontSize: 132, color: NAVY }}>ĐỔI LẤY GÌ?</div>
    </div>
  </AbsoluteFill>
);

// Mẫu B — 2 dải so giá, người bên trái
const Strip: React.FC<{ src: string; pos: string; logo: string; price: string; top: number; brushFill: string; textColor: string; id: string }> = ({ src, pos, logo, price, top, brushFill, textColor, id }) => (
  <div style={{ position: "absolute", left: 700, right: 40, top, height: 400 }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 26, overflow: "hidden", border: "6px solid #F1BC45", boxShadow: "0 12px 40px rgba(0,0,0,0.7)" }}>
      <Img src={img(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, filter: VIVID }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(11,24,48,0.85) 0%, rgba(11,24,48,0.35) 45%, rgba(11,24,48,0) 70%)" }} />
    </div>
    <Img src={img(logo)} style={{ position: "absolute", left: 40, top: 34, width: 330, filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.9))" }} />
    <div style={{ position: "absolute", left: 30, bottom: 30, width: 560, height: 190 }}>
      <Brush id={id} w={560} h={190} fill={brushFill} rotate={-3} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-3deg)", fontFamily: HEAVY, fontWeight: 900, fontSize: 150, color: textColor }}>{price}</div>
    </div>
  </div>
);

const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY, overflow: "hidden" }}>
    <Img src={img("room26.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(14px) brightness(0.45)", transform: "scale(1.1)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 22% 45%, rgba(241,188,69,0.35) 0%, rgba(11,24,48,0) 55%)" }} />

    <Strip id="bPv" src="pv_aerial_frame.jpg" pos="50% 45%" logo="prive_logo_white.png" price="7,5 TỶ" top={40} brushFill="gold" textColor={NAVY} />
    <Strip id="bPr" src="pr_t050.jpg" pos="50% 35%" logo="palm_logo_white.png" price="11 TỶ" top={470} brushFill="#FFFFFF" textColor={NAVY} />

    {/* VS */}
    <div style={{ position: "absolute", left: 1180, top: 375, width: 190, height: 190, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #FFF2B8, #F1BC45 45%, #A86C10)", border: "6px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(255,210,110,0.8), 0 10px 30px rgba(0,0,0,0.6)" }}>
      <div style={{ fontFamily: HEAVY, fontWeight: 900, fontSize: 96, color: NAVY, fontStyle: "italic" }}>VS</div>
    </div>

    <Person src="cover_face2.png" left={-170} h={1120} />

    {/* câu hỏi */}
    <div style={{ position: "absolute", left: 20, top: 900, width: 1060, height: 170 }}>
      <Brush id="bQ" w={1060} h={170} fill={NAVY} rotate={-3} style={{ opacity: 0.96 }} />
      <Flare x={980} y={20} s={0.7} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-3deg)" }}>
        <GoldText size={108}>CHỌN BÊN NÀO?</GoldText>
      </div>
    </div>
  </AbsoluteFill>
);

export type ThumbProps = { v: "A" | "B" };
export const SoSanhThumb: React.FC<ThumbProps> = ({ v }) => (v === "A" ? <ThumbA /> : <ThumbB />);
