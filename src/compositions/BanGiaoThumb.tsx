import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Brush, GoldText, Flare, HEAVY } from "./SoSanhCover2";

/**
 * Thumbnail YouTube 1920×1080 cho video bàn giao nội thất Green Skyline (1PN+ / 2PN).
 * Phong cách user duyệt: chữ vàng kim loại trên dải cọ, người to, nền ảnh thật rực.
 */
const GREEN = "#14261D";
const VIVID = "saturate(1.3) contrast(1.08) brightness(1.06)";

const T: Record<string, { bg: string; unit: string; count: string }> = {
  "1pn": { bg: "thumb_bg_1pn.jpg", unit: "CĂN 1PN+", count: "27 MÓN" },
  "2pn": { bg: "thumb_bg_2pn.jpg", unit: "CĂN 2PN", count: "29 MÓN" },
};

const Chip: React.FC<{ top: string; bottom: string }> = ({ top, bottom }) => (
  <div style={{ width: 150, height: 150, borderRadius: 75, background: "rgba(20,38,29,0.9)", border: "5px solid #F1BC45", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 22px rgba(0,0,0,0.6)" }}>
    <div style={{ fontFamily: HEAVY, fontWeight: 900, fontSize: 30, color: "#FFE08A", lineHeight: 1 }}>{top}</div>
    <div style={{ fontFamily: HEAVY, fontWeight: 800, fontSize: 19, color: "#fff", marginTop: 6 }}>{bottom}</div>
  </div>
);

export const BanGiaoThumb: React.FC<{ unit: string }> = ({ unit }) => {
  const t = T[unit];
  return (
    <AbsoluteFill style={{ background: GREEN, overflow: "hidden" }}>
      <Img src={staticFile(`images/bangiao/${t.bg}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: VIVID }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(20,38,29,0.88) 0%, rgba(20,38,29,0.55) 42%, rgba(20,38,29,0) 66%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(20,38,29,0.6) 0%, rgba(20,38,29,0) 30%)" }} />

      {/* logo */}
      <div style={{ position: "absolute", top: 40, left: 56, background: "#F7F1E6", borderRadius: 14, padding: "10px 18px", boxShadow: "0 6px 18px rgba(0,0,0,0.5)" }}>
        <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 110 }} />
      </div>

      {/* nhãn loại căn */}
      <div style={{ position: "absolute", left: 300, top: 52, width: 520, height: 130 }}>
        <Brush id={`u${unit}`} w={520} h={130} fill="gold" rotate={-3} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-3deg)", fontFamily: HEAVY, fontWeight: 900, fontSize: 84, color: GREEN }}>{t.unit}</div>
      </div>

      {/* BÀN GIAO */}
      <div style={{ position: "absolute", left: 56, top: 250, width: 640, height: 150 }}>
        <Brush id={`b${unit}`} w={640} h={150} fill={GREEN} rotate={-4} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-4deg)", fontFamily: HEAVY, fontWeight: 900, fontSize: 104, color: "#fff", letterSpacing: 3 }}>BÀN GIAO</div>
      </div>
      <Flare x={210} y={500} s={1.1} />
      <div style={{ position: "absolute", left: 40, top: 390, transform: "rotate(-4deg)" }}>
        <GoldText size={260} style={{ letterSpacing: -4, filter: "drop-shadow(0 6px 0 #3a2400) drop-shadow(0 14px 26px rgba(0,0,0,0.75))" }}>{t.count}</GoldText>
      </div>
      <div style={{ position: "absolute", left: 56, top: 690, width: 900, height: 170 }}>
        <Brush id={`n${unit}`} w={900} h={170} fill="gold" rotate={-4} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-4deg)", fontFamily: HEAVY, fontWeight: 900, fontSize: 100, color: GREEN }}>NỘI THẤT XỊN</div>
      </div>

      {/* thương hiệu */}
      <div style={{ position: "absolute", left: 70, bottom: 30, display: "flex", gap: 22 }}>
        <Chip top="SEALY" bottom="nệm Mỹ" />
        <Chip top="PANA" bottom="bếp từ" />
        <Chip top="HAFELE" bottom="chậu rửa" />
        <Chip top="BLUM" bottom="tay nâng" />
      </div>

      {/* người */}
      <Img src={staticFile("images/sosanh/cover_face1.png")} style={{ position: "absolute", bottom: -40, right: -20, height: 1080, filter: "drop-shadow(0 0 26px rgba(0,0,0,0.85)) drop-shadow(0 0 4px rgba(0,0,0,0.9))" }} />
    </AbsoluteFill>
  );
};
