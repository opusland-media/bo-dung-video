import React from "react";
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";

/**
 * Green Skyline — ĐƠN GIÁ 47TR/M² + PHƯƠNG ÁN THANH TOÁN NHANH (dọc 1080×1920, 30fps).
 * Lời: "Giá 47tr/m2 chưa bao gồm VAT và áp dụng cho phương án thanh toán nhanh."
 * Nền: flycam DJI 0561 (bay thấp qua hàng cọ hướng vào tháp) — khác 2 đoạn vay/lãi suất.
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["600", "700", "800"], subsets: ["vietnamese", "latin"] });

const GOLD = "#E2B865";
const GREEN = "#1F2E27";
const MX = 96;

export const TT = { price: 6, vat: 46, plan: 84, s1: 112, s2: 134, s3: 156, s4: 182, sum: 214, end: 300 };
export const GSL_TTN_FRAMES = TT.end;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

type Step = { pct: number; at: number; title: string; sub: string; hi?: boolean };
const STEPS: Step[] = [
  { pct: 10, at: TT.s1, title: "Ký HĐMB", sub: "Đợt 1" },
  { pct: 30, at: TT.s2, title: "Trong vòng 4 ngày", sub: "Đợt 2 · sau đợt 1" },
  { pct: 55, at: TT.s3, title: "Khi nhận nhà", sub: "Dự kiến 04/2027", hi: true },
  { pct: 5, at: TT.s4, title: "Khi nhận sổ hồng", sub: "Đợt cuối" },
];

const PANEL_TOP = 700, ROW_H = 158, ROW0 = PANEL_TOP + 120;

export const GSLTTNhanhVertical: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (at: number, damping = 14) => spring({ frame: f - at, fps, config: { damping, stiffness: 170, mass: 0.7 } });

  const priceK = sp(TT.price, 12);
  const price = Math.round(interpolate(f, [TT.price, TT.price + 26], [0, 47], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const vatK = sp(TT.vat, 12);
  const panelK = sp(TT.plan - 6, 16);
  const planK = sp(TT.plan, 13);
  const sumK = sp(TT.sum, 10);
  // đường nối dọc chạy xuống theo từng đợt
  const lineP = interpolate(f, [TT.s1, TT.s4 + 10], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  // thanh tỉ lệ 100% dưới cùng
  let acc = 0;

  return (
    <AbsoluteFill style={{ background: "#0B1310", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${interpolate(f, [0, TT.end], [1.0, 1.06])})` }}>
        <OffthreadVideo src={staticFile("video/gsl_bg/ttn_bg.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,18,15,0.66) 0%, rgba(10,18,15,0.32) 30%, rgba(10,18,15,0.14) 55%, rgba(10,18,15,0.4) 100%)" }} />

      {/* logo — cùng vị trí với video vay / lãi suất */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center" }}>
        <div style={{ background: "#FBF7EE", borderRadius: 20, padding: "12px 22px", boxShadow: `0 0 0 3px ${GOLD}, 0 14px 40px rgba(0,0,0,0.45)` }}>
          <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 104, display: "block" }} />
        </div>
      </div>

      {/* giá */}
      <div style={{ position: "absolute", left: MX, right: MX, top: 318, textAlign: "center", opacity: Math.min(1, priceK * 1.3), transform: `scale(${0.8 + 0.2 * priceK})` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 8, color: GOLD, textShadow: "0 3px 14px rgba(0,0,0,0.7)" }}>ĐƠN GIÁ CHỈ TỪ</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 150, lineHeight: 1, color: "#fff", marginTop: 6, textShadow: "0 8px 34px rgba(0,0,0,0.6)" }}>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{price}</span>
          <span style={{ fontSize: 76, color: GOLD }}> TR/M²</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center" }}>
        <div style={{
          background: "rgba(10,18,15,0.82)", border: `2px solid ${GOLD}`, borderRadius: 14, padding: "8px 24px",
          fontFamily: SANS, fontWeight: 700, fontSize: 28, color: "#fff", letterSpacing: 1,
          opacity: Math.min(1, vatK * 1.4), transform: `translateY(${(1 - vatK) * 20}px)`,
        }}>Chưa bao gồm <span style={{ color: GOLD, fontWeight: 800 }}>VAT</span></div>
      </div>

      {/* panel phương án */}
      <div style={{
        position: "absolute", left: 66, right: 66, top: PANEL_TOP, height: 860, borderRadius: 34,
        background: "rgba(12,22,18,0.55)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.18)",
        opacity: Math.min(1, panelK * 1.3), transform: `translateY(${(1 - panelK) * 60}px)`,
      }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: PANEL_TOP + 34, display: "flex", justifyContent: "center", opacity: Math.min(1, planK * 1.4), transform: `scale(${0.85 + 0.15 * planK})` }}>
        <div style={{ background: GOLD, color: GREEN, borderRadius: 14, padding: "8px 26px", fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: 2 }}>PHƯƠNG ÁN THANH TOÁN NHANH</div>
      </div>

      {/* đường nối */}
      <div style={{ position: "absolute", left: MX + 58, top: ROW0 + 58, width: 4, height: 3 * ROW_H * lineP, background: GOLD, borderRadius: 4, boxShadow: `0 0 12px ${GOLD}` }} />

      {STEPS.map((s, i) => {
        const k = sp(s.at, 13);
        if (f < s.at - 1) return null;
        const y = ROW0 + i * ROW_H;
        return (
          <div key={s.pct + s.title} style={{
            position: "absolute", left: MX, right: MX, top: y, height: 118, display: "flex", alignItems: "center", gap: 26,
            opacity: Math.min(1, k * 1.4), transform: `translateX(${(1 - k) * 60}px)`,
          }}>
            <div style={{
              width: 120, height: 118, borderRadius: 26, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: s.hi ? `linear-gradient(180deg, #F1D08E, ${GOLD})` : "rgba(14,23,20,0.95)", border: `3px solid ${GOLD}`,
              boxShadow: s.hi ? `0 0 36px ${GOLD}88` : "0 10px 26px rgba(0,0,0,0.4)", transform: `scale(${0.6 + 0.4 * k})`,
            }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: s.pct >= 10 ? 40 : 46, color: s.hi ? GREEN : GOLD }}>{s.pct}%</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 42, color: s.hi ? GOLD : "#fff", lineHeight: 1.1 }}>{s.title}</div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: "rgba(255,255,255,0.72)", marginTop: 6 }}>{s.sub}</div>
            </div>
          </div>
        );
      })}

      {/* thanh tỉ lệ 100% */}
      <div style={{ position: "absolute", left: MX, right: MX, top: ROW0 + 4 * ROW_H - 4, height: 26, borderRadius: 26, background: "rgba(255,255,255,0.1)", overflow: "hidden", display: "flex" }}>
        {STEPS.map((s) => {
          const w = s.pct * ramp(f, s.at, s.at + 14);
          acc += s.pct;
          return <div key={s.pct + "b"} style={{ width: `${w}%`, height: "100%", background: s.hi ? `linear-gradient(90deg, #F1D08E, ${GOLD})` : "rgba(226,184,101,0.55)", borderRight: "3px solid rgba(12,22,18,0.9)" }} />;
        })}
      </div>
      <div style={{ position: "absolute", right: MX, top: ROW0 + 4 * ROW_H + 34, display: "flex", alignItems: "center", gap: 14, opacity: Math.min(1, sumK * 1.5), transform: `scale(${1.6 - 0.6 * sumK}) rotate(${(1 - sumK) * -8}deg)`, transformOrigin: "right center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: GOLD, border: `3px solid ${GOLD}`, borderRadius: 12, padding: "2px 18px" }}>= 100%</div>
      </div>

      {/* chú thích */}
      <div style={{ position: "absolute", left: MX, right: MX, bottom: 150, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 22, color: "rgba(255,255,255,0.8)", textShadow: "0 2px 8px rgba(0,0,0,0.8)", opacity: ramp(f, TT.vat + 10, TT.vat + 22) }}>
        <span style={{ background: "rgba(10,18,15,0.72)", borderRadius: 10, padding: "6px 16px" }}>*Giá chưa gồm VAT · Áp dụng cho phương án thanh toán nhanh</span>
      </div>

      {/* SFX */}
      <Sequence from={TT.price}><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.3} /></Sequence>
      <Sequence from={TT.plan - 6}><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.25} /></Sequence>
      {[TT.vat, ...STEPS.map((s) => s.at)].map((s) => (
        <Sequence key={`t${s}`} from={s}><Audio src={staticFile("audio/sfx_tick.wav")} volume={0.45} /></Sequence>
      ))}
      <Sequence from={TT.sum}><Audio src={staticFile("audio/sfx_chime.wav")} volume={0.35} /></Sequence>
    </AbsoluteFill>
  );
};
