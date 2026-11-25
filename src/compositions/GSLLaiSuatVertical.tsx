import React from "react";
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";

/**
 * Green Skyline — 2 gói HỖ TRỢ LÃI VAY (dọc 1080×1920, 30fps). Nối tiếp ngay sau GSLVayVertical
 * (cùng nền, logo đứng yên đúng vị trí để cú cắt liền mạch).
 * Lời thoại: "Về lãi vay thì gần như không phải lo, vì chủ đầu tư có 2 gói hỗ trợ để chọn:
 *             lãi suất 0% tới 18 tháng, hoặc chỉ 5,5% trong 24 tháng."
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["600", "700", "800"], subsets: ["vietnamese", "latin"] });

const GOLD = "#E2B865";
const GREEN = "#1F2E27";
const MINT = "#5FD394";
const MX = 96;

export const TL = {
  title: 4,     // "Về lãi vay thì gần như không phải lo"
  goi: 70,      // "vì chủ đầu tư có 2 gói hỗ trợ để chọn"
  c1: 134,      // "lãi suất 0% tới 18 tháng"
  hoac: 190,    // "hoặc"
  c2: 204,      // "chỉ 5,5% trong 24 tháng"
  end: 320,
};
export const GSL_LAI_FRAMES = TL.end;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const Card: React.FC<{ k: number; f: number; at: number; rate: string; months: number; maxMonths: number; tag: string; accent: string; label: string }> = ({ k, f, at, rate, months, maxMonths, tag, accent, label }) => {
  const fill = interpolate(f, [at + 8, at + 44], [0, months / maxMonths], { ...clamp, easing: Easing.out(Easing.cubic) });
  const count = Math.round(interpolate(f, [at + 8, at + 44], [0, months], clamp));
  return (
    <div style={{
      background: "rgba(14,23,20,0.9)", border: `3px solid ${accent}`, borderRadius: 30, padding: "26px 34px 30px",
      opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 50}px) scale(${0.92 + 0.08 * k})`,
      boxShadow: `0 0 50px ${accent}33, 0 20px 60px rgba(0,0,0,0.5)`,
    }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 5, color: accent }}>{tag}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 6 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 112, lineHeight: 1, color: accent }}>{rate}</div>
        <div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: "#fff", lineHeight: 1.15 }}>{label}</div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, color: "#fff", lineHeight: 1.1, marginTop: 4 }}>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{count}</span> THÁNG
          </div>
        </div>
      </div>
      {/* thanh tháng */}
      <div style={{ position: "relative", height: 16, borderRadius: 16, background: "rgba(255,255,255,0.1)", marginTop: 22 }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, borderRadius: 16, background: accent, boxShadow: `0 0 18px ${accent}` }} />
        {[6, 12, 18, 24].map((m) => (
          <div key={m} style={{ position: "absolute", left: `${(m / maxMonths) * 100}%`, top: 24, transform: "translateX(-50%)", fontFamily: SANS, fontWeight: 600, fontSize: 20, color: m <= months ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.3)" }}>{m}</div>
        ))}
      </div>
      <div style={{ height: 22 }} />
    </div>
  );
};

export const GSLLaiSuatVertical: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (at: number, damping = 14) => spring({ frame: f - at, fps, config: { damping, stiffness: 150, mass: 0.8 } });

  const titleK = sp(TL.title);
  const goiK = sp(TL.goi);
  const c1 = sp(TL.c1, 13);
  const hoac = sp(TL.hoac, 10);
  const c2 = sp(TL.c2, 13);

  return (
    <AbsoluteFill style={{ background: "#0B1310", overflow: "hidden" }}>
      {/* nền giống hệt GSLVayVertical (zoom tiếp nối từ frame cuối của đoạn trước) */}
      {/* nền: flycam thật của dự án, chỉ phủ tối nhẹ phía trên cho chữ */}
      <AbsoluteFill>
        <OffthreadVideo src={staticFile("video/gsl_bg/lai_bg.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,18,15,0.62) 0%, rgba(10,18,15,0.28) 26%, rgba(10,18,15,0.12) 55%, rgba(10,18,15,0.38) 100%)" }} />

      {/* logo — cùng vị trí với đoạn trước */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center" }}>
        <div style={{ background: "#FBF7EE", borderRadius: 20, padding: "12px 22px", boxShadow: `0 0 0 3px ${GOLD}, 0 14px 40px rgba(0,0,0,0.45)` }}>
          <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 104, display: "block" }} />
        </div>
      </div>

      {/* tiêu đề */}
      <div style={{ position: "absolute", left: MX, right: MX, top: 318, textAlign: "center", opacity: Math.min(1, titleK), transform: `translateY(${(1 - titleK) * 30}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 8, color: GOLD }}>CHỦ ĐẦU TƯ</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 70, color: "#fff", lineHeight: 1.05, marginTop: 4 }}>HỖ TRỢ LÃI VAY</div>
      </div>

      {/* "gần như không phải lo" trước khi hiện 2 gói */}
      <div style={{ position: "absolute", left: MX, right: MX, top: 486, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.88)",
        opacity: ramp(f, TL.title + 14, TL.title + 26) * (1 - ramp(f, TL.goi - 6, TL.goi + 4)) }}>
        <span style={{ display: "inline-block", background: "rgba(10,18,15,0.78)", borderRadius: 14, padding: "8px 22px" }}>Gần như <span style={{ color: GOLD, fontWeight: 800 }}>không phải lo</span></span>
      </div>

      {/* chip 2 gói */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 476, display: "flex", justifyContent: "center" }}>
        <div style={{
          background: GOLD, color: GREEN, borderRadius: 16, padding: "8px 26px", fontFamily: SANS, fontWeight: 800, fontSize: 30,
          opacity: Math.min(1, goiK * 1.4), transform: `scale(${0.8 + 0.2 * goiK})`, boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
        }}>2 GÓI · CHỌN 1</div>
      </div>

      {/* 2 thẻ */}
      <div style={{ position: "absolute", left: MX, right: MX, top: 600 }}>
        <Card k={c1} f={f} at={TL.c1} rate="0%" months={18} maxMonths={24} tag="GÓI 1" accent={GOLD} label="LÃI SUẤT" />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, display: "flex", justifyContent: "center" }}>
        <div style={{
          width: 110, height: 110, borderRadius: 110, background: "#FBF7EE", color: GREEN, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: SANS, fontWeight: 800, fontSize: 30, boxShadow: `0 0 0 4px ${GOLD}, 0 12px 30px rgba(0,0,0,0.45)`,
          opacity: Math.min(1, hoac * 1.5), transform: `scale(${0.4 + 0.6 * hoac}) rotate(${(1 - hoac) * -30}deg)`,
        }}>HOẶC</div>
      </div>
      <div style={{ position: "absolute", left: MX, right: MX, top: 1100 }}>
        <Card k={c2} f={f} at={TL.c2} rate="5,5%" months={24} maxMonths={24} tag="GÓI 2" accent={MINT} label="LÃI SUẤT" />
      </div>

      {/* SFX */}
      <Sequence from={TL.goi}><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.3} /></Sequence>
      {[TL.c1, TL.c2].map((s) => (
        <Sequence key={s} from={s}><Audio src={staticFile("audio/sfx_tick.wav")} volume={0.55} /></Sequence>
      ))}
      <Sequence from={TL.hoac}><Audio src={staticFile("audio/sfx_tick.wav")} volume={0.35} /></Sequence>
      <Sequence from={TL.c2 + 46}><Audio src={staticFile("audio/sfx_chime.wav")} volume={0.35} /></Sequence>
    </AbsoluteFill>
  );
};
