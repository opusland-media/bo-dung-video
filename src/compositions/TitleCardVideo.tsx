import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";

const FONT_STYLE = `
  @font-face { font-family: 'BVP-Black';       src: url('${staticFile("fonts/BeVietnamPro-Black.ttf")}')       format('truetype'); }
  @font-face { font-family: 'BVP-BlackItalic'; src: url('${staticFile("fonts/BeVietnamPro-BlackItalic.ttf")}') format('truetype'); }
  @font-face { font-family: 'BVP-Italic';      src: url('${staticFile("fonts/BeVietnamPro-Italic.ttf")}')      format('truetype'); }
  @font-face { font-family: 'AlexBrush';       src: url('${staticFile("fonts/AlexBrush-Regular.ttf")}')        format('truetype'); }
`;

const CYAN_NEON =
  "drop-shadow(0 0 8px #00E5FF) drop-shadow(0 0 22px #00C8FF) drop-shadow(0 0 60px rgba(0,200,255,0.9)) drop-shadow(0 0 120px rgba(0,160,255,0.45))";

export const TitleCardVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp = (startF: number, damping = 12, stiffness = 190) =>
    spring({ frame: Math.max(0, frame - startF), fps, from: 0, to: 1, config: { damping, stiffness } });

  // "top 2" — wide letter-spacing collapses in
  const p1   = sp(4, 16, 200);
  const ls1  = interpolate(p1, [0, 1], [40, 8]);
  const op1  = p1;

  // "DỰ ÁN" — scale explodes from center
  const p2   = sp(14, 8, 200);
  const sc2  = interpolate(p2, [0, 1], [0.12, 1]);
  const op2  = interpolate(p2, [0, 0.15, 1], [0, 1, 1]);

  // cyan line under DỰ ÁN — draws left→right
  const p2b  = sp(18, 18, 220);
  const lw   = interpolate(p2b, [0, 1], [0, 100]);

  // "đáng mua nhất" — slides up
  const p3   = sp(26, 14, 195);
  const y3   = interpolate(p3, [0, 1], [50, 0]);

  // "trục quốc lộ 13" — fades in
  const p4   = sp(36, 16, 180);

  // neon pulse after settle
  const tick = frame > 55
    ? 1 + 0.05 * Math.sin(frame * 0.13) * Math.sin(frame * 0.39)
    : 1;

  const fadeOut = interpolate(frame, [80, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <style>{FONT_STYLE}</style>

      {/* ── Dark grid ── */}
      <AbsoluteFill style={{
        background: "#0e0e0e",
        backgroundImage: [
          "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          "linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
        ].join(", "),
        backgroundSize: "70px 70px",
      }} />

      {/* ── Vignette ── */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 10%, rgba(0,0,0,0.85) 100%)",
      }} />

      {/* ── Cyan ambient glow (behind DỰ ÁN) ── */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse 520px 320px at 50% 50%, rgba(0,180,255,0.07) 0%, transparent 70%)",
        opacity: p2,
      }} />

      {/* ── Centered column ── */}
      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>

        {/* "top 2" — small white caps, letter-spacing animates in */}
        <div style={{
          fontFamily: "'BVP-Black', sans-serif",
          fontSize: 48,
          color: "rgba(255,255,255,0.65)",
          letterSpacing: ls1,
          opacity: op1,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          marginBottom: 2,
        }}>top 2</div>

        {/* "DỰ ÁN" — HUGE cyan neon, scale pop */}
        <div style={{
          fontFamily: "'BVP-BlackItalic', sans-serif",
          fontStyle: "italic",
          fontSize: 236,
          lineHeight: 0.84,
          color: "#00E0FF",
          whiteSpace: "nowrap",
          letterSpacing: -5,
          transform: `scale(${sc2})`,
          opacity: op2,
          filter: `${CYAN_NEON} brightness(${tick})`,
          textAlign: "center",
        }}>DỰ ÁN</div>

        {/* cyan accent line */}
        <div style={{
          width: 680,
          height: 2,
          marginTop: 10,
          marginBottom: 18,
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${lw}%`,
            background: "linear-gradient(90deg, transparent 0%, #00E0FF 30%, #00E0FF 70%, transparent 100%)",
            boxShadow: "0 0 12px rgba(0,220,255,0.8)",
          }} />
        </div>

        {/* "đáng mua nhất" — white cursive, slides up */}
        <div style={{
          fontFamily: "'AlexBrush', cursive",
          fontSize: 76,
          color: "rgba(255,255,255,0.92)",
          letterSpacing: 2,
          transform: `translateY(${y3}px)`,
          opacity: p3,
          textShadow: "0 0 30px rgba(0,200,255,0.2)",
          whiteSpace: "nowrap",
        }}>đáng mua nhất</div>

        {/* "trục quốc lộ 13" — small, fades in */}
        <div style={{
          fontFamily: "'BVP-Italic', sans-serif",
          fontStyle: "italic",
          fontSize: 42,
          color: "rgba(255,255,255,0.45)",
          letterSpacing: 3,
          marginTop: 8,
          opacity: p4,
          whiteSpace: "nowrap",
        }}>trục quốc lộ 13</div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const TITLE_CARD_DEFAULTS = {};
