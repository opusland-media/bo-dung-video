import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Brush, GoldText, Flare, HEAVY } from "./SoSanhCover2";

/**
 * Poster 1080×1350 gửi khách cũ — điểm mạnh Green Skyline theo CSBH 16/10/2026.
 * Phong cách user duyệt: chữ vàng kim loại trên dải cọ, nền ảnh thật rực, icon tròn viền vàng. Không có hình người.
 */
const GREEN = "#14261D";
const img = (n: string) => staticFile(`images/gslposter/${n}`);

const ICONS: Record<string, React.ReactNode> = {
  pct: <path d="M5 19L19 5 M7.5 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M16.5 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />,
  bank: <path d="M3 10l9-6 9 6 M5 10v8 M9.5 10v8 M14.5 10v8 M19 10v8 M3 20h18" />,
  sofa: <path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3 M2 12a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2z M5 17v2 M19 17v2" />,
  key: <path d="M8 14a4 4 0 1 1 3.5-6H21v3h-2v2h-3v-2h-4.5A4 4 0 0 1 8 14z" />,
  pool: <path d="M3 17c2 0 2-1.5 4.5-1.5S9.5 17 12 17s2.5-1.5 4.5-1.5S19 17 21 17 M7 14V5a2 2 0 0 1 4 0 M13 14V5a2 2 0 0 1 4 0 M7 9h6" />,
};

const Icon: React.FC<{ icon: string; a: string; b: string }> = ({ icon, a, b }) => (
  <div style={{ width: 204, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
    <div style={{ width: 112, height: 112, borderRadius: "50%", border: "5px solid #F1BC45", background: "rgba(20,38,29,0.92)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(241,188,69,0.5)" }}>
      <svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="#F6CB5A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{ICONS[icon]}</svg>
    </div>
    <div style={{ fontFamily: HEAVY, fontWeight: 900, fontSize: 27, color: "#FFE08A", lineHeight: 1.05, whiteSpace: "nowrap", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.95)" }}>{a}</div>
    <div style={{ fontFamily: HEAVY, fontWeight: 800, fontSize: 21, color: "#fff", lineHeight: 1.15, whiteSpace: "nowrap", textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.95)", marginTop: -6 }}>{b}</div>
  </div>
);

const Band: React.FC<{ id: string; x: number; y: number; w: number; h: number; fill: string; rot: number; size: number; color: string; children: React.ReactNode }> = ({ id, x, y, w, h, fill, rot, size, color, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
    <Brush id={id} w={w} h={h} fill={fill} rotate={rot} />
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${rot}deg)`, fontFamily: HEAVY, fontWeight: 900, fontSize: size, color, whiteSpace: "nowrap" }}>{children}</div>
  </div>
);

export const GSLPoster: React.FC = () => (
  <AbsoluteFill style={{ background: GREEN, overflow: "hidden" }}>
    <Img src={img("bg_pool.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 60%", filter: "saturate(1.3) contrast(1.06) brightness(1.04)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,38,29,0.94) 0%, rgba(20,38,29,0.82) 36%, rgba(20,38,29,0.15) 56%, rgba(20,38,29,0.35) 70%, rgba(20,38,29,0.95) 100%)" }} />

    {/* logo + sắp bàn giao */}
    <div style={{ position: "absolute", top: 56, left: 64, background: "#F7F1E6", borderRadius: 14, padding: "8px 14px", boxShadow: "0 6px 18px rgba(0,0,0,0.5)" }}>
      <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 104 }} />
    </div>
    <Band id="p1" x={300} y={64} w={716} h={120} fill="gold" rot={-3} size={58} color={GREEN}>SẮP NHẬN NHÀ 2027</Band>

    {/* headline */}
    <Band id="p2" x={56} y={236} w={500} h={132} fill={GREEN} rot={-4} size={84} color="#fff">CHỈ ĐÓNG</Band>
    <Flare x={760} y={300} s={1} />
    <div style={{ position: "absolute", left: 590, top: 196, transform: "rotate(-4deg)" }}>
      <GoldText size={226} style={{ letterSpacing: -6, filter: "drop-shadow(0 6px 0 #3a2400) drop-shadow(0 14px 26px rgba(0,0,0,0.75))" }}>10%</GoldText>
    </div>
    <Band id="p3" x={64} y={420} w={952} h={146} fill="gold" rot={-3} size={78} color={GREEN}>ĐẾN KHI NHẬN NHÀ</Band>
    <div style={{ position: "absolute", left: 0, right: 0, top: 600, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(20,38,29,0.88)", border: "3px solid #F1BC45", borderRadius: 40, padding: "12px 34px", fontFamily: HEAVY, fontWeight: 800, fontSize: 36, color: "#fff" }}>
        Căn Studio – 3PN · chỉ từ <span style={{ color: "#FFE08A" }}>~250 triệu</span>
      </div>
    </div>

    {/* ảnh nhà mẫu */}
    <div style={{ position: "absolute", right: 64, top: 700, width: 380, height: 260, borderRadius: 18, overflow: "hidden", border: "5px solid #F7F1E6", boxShadow: "0 12px 30px rgba(0,0,0,0.6)", transform: "rotate(3deg)" }}>
      <Img src={img("living.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "rgba(20,38,29,0.85)", fontFamily: HEAVY, fontWeight: 800, fontSize: 22, color: "#FFE08A", textAlign: "center", padding: "6px 0" }}>NHÀ MẪU THỰC TẾ</div>
    </div>

    {/* điểm mạnh */}
    <div style={{ position: "absolute", left: 30, right: 30, top: 1000, display: "flex", justifyContent: "space-between" }}>
      <Icon icon="pct" a="CK tới 18%" b="khi TT nhanh" />
      <Icon icon="bank" a="Lãi suất 0%" b="tới 18 tháng" />
      <Icon icon="sofa" a="Tặng nội thất" b="Skyline Central*" />
      <Icon icon="pool" a="Hồ bơi" b="nội khu xanh" />
      <Icon icon="key" a="Đã cất nóc" b="sắp bàn giao" />
    </div>

    <div style={{ position: "absolute", left: 64, right: 64, bottom: 26, fontFamily: HEAVY, fontWeight: 600, fontSize: 17, color: "rgba(255,255,255,0.75)", textAlign: "center" }}>
      *Căn 1PN+, 2PN tháp Skyline Central (chọn CK 6% + gói nội thất). Theo CSBH 149/2026 từ 16/10/2026 – CĐT TBS Land có thể điều chỉnh.
    </div>
  </AbsoluteFill>
);
