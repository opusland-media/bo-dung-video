import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Brush, GoldText, Flare, HEAVY } from "./SoSanhCover2";

/**
 * Ảnh bìa dọc 1080×1920 cho video dọc bàn giao nội thất Green Skyline.
 * Cùng phong cách thumbnail ngang (BanGiaoThumb); chữ giữ trong vùng an toàn TikTok (lưới hồ sơ cắt 3:4 ở giữa).
 */
const GREEN = "#14261D";
const VIVID = "saturate(1.3) contrast(1.08) brightness(1.06)";

const T: Record<string, { bg: string; unit: string; count: string }> = {
  "1pn": { bg: "thumb_bg_1pn.jpg", unit: "CĂN 1PN+", count: "27 MÓN" },
  "2pn": { bg: "thumb_bg_2pn.jpg", unit: "CĂN 2PN", count: "29 MÓN" },
};

const Chip: React.FC<{ top: string; bottom: string }> = ({ top, bottom }) => (
  <div style={{ width: 196, height: 196, borderRadius: 98, background: "rgba(20,38,29,0.92)", border: "5px solid #F1BC45", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 22px rgba(0,0,0,0.6)" }}>
    <div style={{ fontFamily: HEAVY, fontWeight: 900, fontSize: 37, color: "#FFE08A", lineHeight: 1 }}>{top}</div>
    <div style={{ fontFamily: HEAVY, fontWeight: 800, fontSize: 24, color: "#fff", marginTop: 6 }}>{bottom}</div>
  </div>
);

export const BanGiaoCoverV: React.FC<{ unit: string }> = ({ unit }) => {
  const t = T[unit];
  return (
    <AbsoluteFill style={{ background: GREEN, overflow: "hidden" }}>
      <Img src={staticFile(`images/bangiao/${t.bg}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "40% 50%", filter: VIVID }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,38,29,0.92) 0%, rgba(20,38,29,0.7) 32%, rgba(20,38,29,0.05) 56%, rgba(20,38,29,0.05) 66%, rgba(20,38,29,0.75) 100%)" }} />


      {/* logo + loại căn */}
      <div style={{ position: "absolute", top: 170, left: 80, background: "#F7F1E6", borderRadius: 14, padding: "8px 14px", boxShadow: "0 6px 18px rgba(0,0,0,0.5)" }}>
        <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 112 }} />
      </div>
      <div style={{ position: "absolute", left: 320, top: 172, width: 660, height: 136 }}>
        <Brush id={`vu${unit}`} w={660} h={136} fill="gold" rotate={-3} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-3deg)", fontFamily: HEAVY, fontWeight: 900, fontSize: 92, color: GREEN }}>{t.unit}</div>
      </div>

      {/* BÀN GIAO — 29 MÓN — NỘI THẤT XỊN */}
      <div style={{ position: "absolute", left: 90, top: 380, width: 720, height: 160 }}>
        <Brush id={`vb${unit}`} w={720} h={160} fill={GREEN} rotate={-4} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-4deg)", fontFamily: HEAVY, fontWeight: 900, fontSize: 118, color: "#fff", letterSpacing: 3 }}>BÀN GIAO</div>
      </div>
      <Flare x={230} y={650} s={1.1} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, display: "flex", justifyContent: "center", transform: "rotate(-4deg)" }}>
        <GoldText size={232} style={{ letterSpacing: -4, filter: "drop-shadow(0 6px 0 #3a2400) drop-shadow(0 14px 26px rgba(0,0,0,0.75))" }}>{t.count}</GoldText>
      </div>
      <div style={{ position: "absolute", left: 80, top: 800, width: 920, height: 176 }}>
        <Brush id={`vn${unit}`} w={920} h={176} fill="gold" rotate={-4} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-4deg)", fontFamily: HEAVY, fontWeight: 900, fontSize: 108, color: GREEN }}>NỘI THẤT XỊN</div>
      </div>

      {/* thương hiệu */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, display: "flex", justifyContent: "center", gap: 26 }}>
        <Chip top="SEALY" bottom="nệm Mỹ" />
        <Chip top="PANA" bottom="bếp từ" />
        <Chip top="HAFELE" bottom="chậu rửa" />
        <Chip top="BLUM" bottom="tay nâng" />
      </div>
    </AbsoluteFill>
  );
};
