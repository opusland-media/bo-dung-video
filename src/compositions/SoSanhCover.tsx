import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBVP } from "@remotion/google-fonts/BeVietnamPro";

/** Ảnh bìa dọc TikTok cho 2 phần "The Privé hay Palm River?" — 1080×1920 (render --scale=2). */
const { fontFamily: SERIF } = loadPlayfair("normal", { weights: ["700", "900"], subsets: ["vietnamese", "latin"] });
const { fontFamily: SERIF_I } = loadPlayfair("italic", { weights: ["600"], subsets: ["vietnamese", "latin"] });
const { fontFamily: SANS } = loadBVP("normal", { weights: ["600", "700", "800"], subsets: ["vietnamese", "latin"] });

const NAVY = "11,24,46";
const GOLD = "#E3C27A";
const AQUA = "#9FD8E8";
const img = (n: string) => staticFile(`images/sosanh/${n}`);

export type CoverProps = { part: 1 | 2 };

export const SoSanhCover: React.FC<CoverProps> = ({ part }) => {
  const p1 = part === 1;
  return (
    <AbsoluteFill style={{ background: `rgb(${NAVY})`, overflow: "hidden" }}>
      {/* nền: The Privé (trên) · Palm River (dưới), chia chéo */}
      <Img src={img(p1 ? "pv_aerial_frame.jpg" : "pv_048.jpg")} style={{ position: "absolute", width: "100%", height: "58%", top: 0, objectFit: "cover", objectPosition: "60% 50%", clipPath: "polygon(0 0,100% 0,100% 82%,0 100%)", filter: "brightness(0.62) saturate(1.1)" }} />
      <Img src={img(p1 ? "pr_t049.jpg" : "pr_t079.jpg")} style={{ position: "absolute", width: "100%", height: "56%", bottom: 0, objectFit: "cover", objectPosition: "55% 50%", clipPath: "polygon(0 18%,100% 0,100% 100%,0 100%)", filter: "brightness(0.55) saturate(1.1)" }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(${NAVY},0.55) 0%, rgba(${NAVY},0) 25%, rgba(${NAVY},0) 60%, rgba(${NAVY},0.75) 100%)` }} />
      {/* đường chéo vàng */}
      <div style={{ position: "absolute", left: -40, right: -40, top: 1040, height: 6, background: `linear-gradient(90deg, ${GOLD}, ${AQUA})`, transform: "rotate(-10deg)", boxShadow: "0 0 30px rgba(227,194,122,0.6)" }} />

      {/* logo 2 dự án */}
      <Img src={img("prive_logo_gold.png")} style={{ position: "absolute", top: 270, left: 0, right: 0, margin: "0 auto", width: 360 }} />
      <Img src={img("palm_logo_white.png")} style={{ position: "absolute", top: 1010, right: 50, width: 330 }} />

      {/* người */}
      <Img src={img(p1 ? "cover_face1.png" : "cover_face2.png")} style={{ position: "absolute", bottom: 0, left: "50%", height: 960, transform: "translateX(-50%)", filter: "drop-shadow(0 0 40px rgba(0,0,0,0.7))" }} />

      {/* PHẦN x/2 */}
      <div style={{ position: "absolute", top: 150, left: 0, right: 0, textAlign: "center" }}>
        <span style={{ background: GOLD, color: `rgb(${NAVY})`, fontFamily: SANS, fontWeight: 800, fontSize: 46, letterSpacing: 4, padding: "10px 30px", borderRadius: 12 }}>PHẦN {part}/2</span>
      </div>

      {/* chữ chính (vùng giữa an toàn 3:4) */}
      {p1 ? (
        <div style={{ position: "absolute", top: 400, left: 40, right: 40, textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 150, lineHeight: 1, color: GOLD, textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>7,5 TỶ</div>
          <div style={{ fontFamily: SERIF_I, fontWeight: 600, fontSize: 70, color: "#fff", margin: "6px 0", textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>vs</div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 150, lineHeight: 1, color: AQUA, textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>11 TỶ</div>
        </div>
      ) : (
        <div style={{ position: "absolute", top: 470, left: 40, right: 40, textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 112, lineHeight: 1.05, color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,0.85)" }}>
            TIỆN ÍCH
            <br />
            <span style={{ color: GOLD }}>TIẾN ĐỘ</span>
          </div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: AQUA, marginTop: 14, letterSpacing: 2, textShadow: "0 4px 16px rgba(0,0,0,0.9)" }}>THIẾT KẾ · BÀN GIAO · CHÍNH SÁCH</div>
        </div>
      )}

      {/* câu hỏi dưới */}
      <div style={{ position: "absolute", bottom: 150, left: 40, right: 40, textAlign: "center" }}>
        <span style={{ display: "inline-block", background: "#FFD23F", color: "#111", fontFamily: SANS, fontWeight: 800, fontSize: 76, padding: "10px 34px", borderRadius: 14, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
          {p1 ? "NÊN CHỌN BÊN NÀO?" : "AI HỢP DỰ ÁN NÀO?"}
        </span>
      </div>
    </AbsoluteFill>
  );
};
