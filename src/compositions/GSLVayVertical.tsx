import React from "react";
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";

/**
 * Green Skyline — lộ trình VAY NGÂN HÀNG (dọc 1080×1920, 30fps), đồ họa cho đoạn lồng tiếng:
 * "Còn nếu anh chị có nhu cầu vay ngân hàng thì chỉ cần thanh toán 10%, rồi chờ tới khi nhận nhà, dự kiến tháng 4/2027,
 *  mới đóng thêm 15%. 70% ngân hàng cho vay, và 5% cuối cùng đóng khi nhận sổ hồng."
 * Mốc thời gian (frame) chỉnh trong T để khớp giọng thật.
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["600", "700", "800"], subsets: ["vietnamese", "latin"] });

const GOLD = "#E2B865";
const GREEN = "#1F2E27";
const BANK = "#3FA672";
const W = 1080;
const MX = 96;

export const T = {
  title: 6,      // "Còn nếu anh chị có nhu cầu vay ngân hàng"
  p10: 100,      // "…thanh toán 10%"
  wait: 136,     // "rồi chờ tới khi nhận nhà, dự kiến tháng 4/2027"
  p15: 234,      // "mới đóng thêm 15%"
  p70: 258,      // "70% ngân hàng cho vay"
  p5: 328,       // "5% cuối cùng đóng khi nhận sổ hồng"
  sum: 386,      // tổng kết
  end: 456,
};
export const GSL_VAY_FRAMES = T.end;

// thanh dọc: đỉnh y=600, đáy y=1500 → 900px = 100%, lấp TỪ TRÊN XUỐNG
const BAR_X = MX + 10, BAR_W = 210, TOP = 600, FULL = 900, BOT = TOP + FULL;
type Seg = { pct: number; at: number; color: string; big: string; title: string; sub: string; icon: "pen" | "key" | "bank" | "book" };
const SEGS: Seg[] = [
  { pct: 10, at: T.p10, color: GOLD, big: "10%", title: "Ký HĐMB", sub: "Anh chị thanh toán", icon: "pen" },
  { pct: 15, at: T.p15, color: GOLD, big: "15%", title: "Nhận nhà", sub: "Dự kiến 04/2027", icon: "key" },
  { pct: 70, at: T.p70, color: BANK, big: "70%", title: "Ngân hàng", sub: "Cho vay khi nhận nhà", icon: "bank" },
  { pct: 5, at: T.p5, color: GOLD, big: "5%", title: "Nhận sổ hồng", sub: "Đợt cuối cùng", icon: "book" },
];

const LABEL_Y = [648, 872, 1140, 1452]; // vị trí nhãn cố định, nối về thanh bằng đường dẫn
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const Icon: React.FC<{ k: Seg["icon"] | "hourglass"; size: number; color: string }> = ({ k, size, color }) => {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (k === "pen") return <svg {...common}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M14 6l4 4" /></svg>;
  if (k === "key") return <svg {...common}><circle cx="8" cy="15" r="4" /><path d="M11 12l8-8M16 7l2 2M14 9l2 2" /></svg>;
  if (k === "bank") return <svg {...common}><path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" /></svg>;
  if (k === "book") return <svg {...common}><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M5 17a3 3 0 0 1 3-3h11" /></svg>;
  return <svg {...common}><path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9" /></svg>;
};

export const GSLVayVertical: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (at: number, damping = 14) => spring({ frame: f - at, fps, config: { damping, stiffness: 150, mass: 0.8 } });

  const intro = ramp(f, 0, 12);
  const titleK = sp(T.title);
  const sumK = sp(T.sum, 12);

  // segment geometry
  let acc = 0;
  const geo = SEGS.map((s) => {
    const y0 = TOP + (acc / 100) * FULL; // mép trên của khúc
    acc += s.pct;
    const h = (s.pct / 100) * FULL;
    return { ...s, y0, h, k: sp(s.at, s.pct === 70 ? 18 : 13) };
  });
  const paid = geo.reduce((t, g) => t + g.pct * Math.min(1, g.k), 0);

  // "chờ" bracket between 10% and 15%
  const waitK = sp(T.wait);
  const waitBig = waitK * (1 - ramp(f, T.p15 - 14, T.p15 + 4)); // big centre card, then shrinks to the bracket
  const bracketK = ramp(f, T.p15 - 10, T.p15 + 6);

  return (
    <AbsoluteFill style={{ background: "#0B1310", overflow: "hidden" }}>
      {/* nền: ảnh dự án mờ + phủ tối */}
      {/* nền: flycam thật của dự án, chỉ phủ tối nhẹ phía trên cho chữ */}
      <AbsoluteFill>
        <OffthreadVideo src={staticFile("video/gsl_bg/vay_bg.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,18,15,0.62) 0%, rgba(10,18,15,0.28) 26%, rgba(10,18,15,0.12) 55%, rgba(10,18,15,0.38) 100%)" }} />
      <div style={{ position: "absolute", left: 66, top: 560, width: 948, height: 1030, borderRadius: 36,
        background: "rgba(12,22,18,0.46)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.18)",
        opacity: intro }} />

      {/* logo */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center", opacity: intro }}>
        <div style={{ background: "#FBF7EE", borderRadius: 20, padding: "12px 22px", boxShadow: `0 0 0 3px ${GOLD}, 0 14px 40px rgba(0,0,0,0.45)` }}>
          <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 104, display: "block" }} />
        </div>
      </div>

      {/* tiêu đề */}
      <div style={{ position: "absolute", left: MX, right: MX, top: 318, textAlign: "center", opacity: Math.min(1, titleK) * (1 - sumK), transform: `translateY(${(1 - titleK) * 30}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 8, color: GOLD }}>PHƯƠNG ÁN</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 70, color: "#fff", lineHeight: 1.05, marginTop: 4 }}>VAY NGÂN HÀNG</div>
      </div>

      {/* tổng kết */}
      {sumK > 0.01 && (
        <div style={{ position: "absolute", left: MX, right: MX, top: 316, textAlign: "center", opacity: Math.min(1, sumK * 1.3), transform: `scale(${0.85 + 0.15 * sumK})` }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: "#fff", letterSpacing: 3 }}>TỰ ĐÓNG TRƯỚC NHẬN NHÀ</div>
          <div style={{ display: "inline-block", marginTop: 8, background: GOLD, color: GREEN, borderRadius: 18, padding: "4px 28px", fontFamily: SANS, fontWeight: 800, fontSize: 72, lineHeight: 1.15, boxShadow: "0 16px 50px rgba(0,0,0,0.5)" }}>CHỈ 10%</div>
        </div>
      )}

      {/* thanh dọc */}
      <div style={{ position: "absolute", left: BAR_X, top: BOT - FULL, width: BAR_W, height: FULL, borderRadius: 26, background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.14)", opacity: intro }} />
      {geo.map((g, i) => {
        const hh = g.h * Math.max(0, g.k);
        return (
          <div key={i} style={{
            position: "absolute", left: BAR_X, width: BAR_W, top: g.y0, height: hh,
            background: g.color === BANK ? `linear-gradient(180deg, #4CC184, ${BANK})` : `linear-gradient(180deg, #F1D08E, ${GOLD})`,
            borderRadius: i === 0 ? "24px 24px 0 0" : i === 3 ? "0 0 24px 24px" : 0,
            borderTop: i > 0 ? "3px solid #0B1310" : "none",
            boxShadow: g.k > 0.05 ? `0 0 40px ${g.color}55` : "none",
            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
          }}>
            {g.h > 80 && <Icon k={g.icon} size={Math.min(84, g.h * 0.5)} color={GREEN} />}
          </div>
        );
      })}
      {/* % đã lấp */}
      <div style={{ position: "absolute", left: BAR_X, width: BAR_W, top: BOT + 18, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 32, color: "#fff", opacity: ramp(f, T.p10, T.p10 + 8) }}>
        {Math.round(paid)}%
      </div>

      {/* đường dẫn từ thanh tới nhãn */}
      <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
        {geo.map((g, i) => {
          const k = Math.min(1, Math.max(0, g.k));
          const x0 = BAR_X + BAR_W + 6, y0 = g.y0 + g.h / 2, x1 = BAR_X + BAR_W + 34, y1 = LABEL_Y[i];
          return <path key={i} d={`M${x0} ${y0} C ${x0 + 16} ${y0}, ${x1 - 16} ${y1}, ${x1} ${y1}`} stroke={g.color} strokeWidth={3} fill="none" opacity={k * 0.8} />;
        })}
      </svg>
      {/* nhãn bên phải */}
      {geo.map((g, i) => {
        const k = Math.min(1, g.k);
        const y = LABEL_Y[i];
        const big = g.pct === 70;
        return (
          <div key={i} style={{ position: "absolute", left: BAR_X + BAR_W + 40, right: MX, top: y, transform: `translate(${(1 - k) * 60}px, -50%)`, opacity: k, display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: big ? 84 : 64, lineHeight: 1, color: g.color === BANK ? "#5FD394" : GOLD, minWidth: big ? 0 : 118 }}>{g.big}</div>
            <div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: big ? 32 : 30, color: "#fff", lineHeight: 1.15 }}>{g.title}</div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: "rgba(255,255,255,0.72)", marginTop: 3 }}>{g.sub}</div>
            </div>
          </div>
        );
      })}

      {bracketK > 0.01 && (
        <div style={{ position: "absolute", left: BAR_X + BAR_W + 44, top: 760, transform: "translateY(-50%)", opacity: bracketK, display: "flex", alignItems: "center", gap: 10, fontFamily: SANS, fontWeight: 700, fontSize: 24, color: GOLD }}>
          <Icon k="hourglass" size={26} color={GOLD} /> Không đóng thêm đến khi nhận nhà
        </div>
      )}

      {/* thẻ lớn "chờ đến khi nhận nhà" */}
      {waitBig > 0.01 && (
        <div style={{ position: "absolute", left: BAR_X + BAR_W + 30, right: MX - 20, top: 960, display: "flex", justifyContent: "center" }}>
          <div style={{
            background: "rgba(14,23,20,0.94)", border: `3px solid ${GOLD}`, borderRadius: 30, padding: "28px 34px", textAlign: "center",
            transform: `scale(${0.7 + 0.3 * waitBig})`, opacity: Math.min(1, waitBig * 1.4), boxShadow: "0 24px 70px rgba(0,0,0,0.6)",
          }}>
            <div style={{ display: "flex", justifyContent: "center", transform: `rotate(${interpolate(f, [T.wait, T.wait + 40], [0, 180], { ...clamp, easing: Easing.inOut(Easing.cubic) })}deg)` }}>
              <Icon k="hourglass" size={84} color={GOLD} />
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 38, color: "#fff", marginTop: 12, lineHeight: 1.15 }}>KHÔNG ĐÓNG THÊM</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 27, color: GOLD, marginTop: 8, lineHeight: 1.3 }}>đến khi nhận nhà<br />dự kiến 04/2027</div>
          </div>
        </div>
      )}

      {/* SFX */}
      <Sequence from={T.title}><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.35} /></Sequence>
      {[T.p10, T.p15, T.p70, T.p5].map((s) => (
        <Sequence key={s} from={s}><Audio src={staticFile("audio/sfx_tick.wav")} volume={0.55} /></Sequence>
      ))}
      <Sequence from={T.wait}><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.25} /></Sequence>
      <Sequence from={T.sum}><Audio src={staticFile("audio/sfx_chime.wav")} volume={0.4} /></Sequence>
    </AbsoluteFill>
  );
};
