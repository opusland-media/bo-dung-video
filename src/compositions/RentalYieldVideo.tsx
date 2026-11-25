import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/BeVietnamPro";

const { fontFamily: VN } = loadFont("normal", { weights: ["400", "700", "900"] });

// ─── Palette ──────────────────────────────────────────────────────────────────
const BG    = "#07101C";
const GOLD  = "#C9A84C";
const GREEN = "#3DD68C";
const WHITE = "#F0EAD6";
const MUTED = "#8B949E";
const FPS   = 30;

function remap(v: number, [iL, iH]: [number, number], [oL, oH]: [number, number]) {
  return interpolate(v, [iL, iH], [oL, oH], {
    extrapolateLeft:  "clamp",
    extrapolateRight: "clamp",
  });
}

// ─── CountUp ─────────────────────────────────────────────────────────────────
const CountUp: React.FC<{ from: number; to: number; lf: number; start: number; dur: number }> = ({
  from, to, lf, start, dur,
}) => {
  const t     = Math.min(1, Math.max(0, (lf - start) / dur));
  const eased = 1 - Math.pow(1 - t, 3);
  return <>{Math.round(from + (to - from) * eased)}</>;
};

// ─── RentalCard ──────────────────────────────────────────────────────────────
const RentalCard: React.FC<{
  lf:          number;  // local frame (relative to this card's appearance)
  rooms:       string;
  badge:       string;
  min:         number;
  max:         number;
  accent:      string;
}> = ({ lf, rooms, badge, min, max, accent }) => {
  const s = spring({ fps: FPS, frame: lf, config: { damping: 14, mass: 0.8, stiffness: 160 } });

  const cardOpacity  = remap(lf, [0, 12], [0, 1]);
  const cardY        = interpolate(s, [0, 1], [70, 0]);
  const cardScale    = interpolate(s, [0, 1], [0.82, 1]);

  // Number count-up: min counts first (0→min over 50f), then separator, then max
  const numOpacity   = remap(lf, [8, 20], [0, 1]);
  const minVal       = <CountUp from={0} to={min} lf={lf} start={10} dur={55} />;
  const sepOpacity   = remap(lf, [55, 70], [0, 1]);
  const maxVal       = <CountUp from={min} to={max} lf={lf} start={55} dur={45} />;
  const unitOpacity  = remap(lf, [50, 70], [0, 1]);

  return (
    <div
      style={{
        flex:            1,
        opacity:         cardOpacity,
        transform:       `translateY(${cardY}px) scale(${cardScale})`,
        background:      "rgba(255,255,255,0.038)",
        backdropFilter:  "blur(10px)",
        border:          `1.5px solid ${accent}44`,
        borderRadius:    24,
        padding:         "44px 52px",
        display:         "flex",
        flexDirection:   "column",
        gap:             20,
        boxShadow:       `0 0 80px ${accent}14, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Room type badge */}
      <div
        style={{
          alignSelf:      "flex-start",
          display:        "flex",
          alignItems:     "center",
          gap:            10,
          background:     `${accent}1A`,
          border:         `1px solid ${accent}55`,
          borderRadius:   10,
          padding:        "9px 20px",
        }}
      >
        <span style={{ fontSize: 22 }}>🛏</span>
        <span
          style={{
            fontFamily:    VN,
            fontSize:      22,
            fontWeight:    800,
            color:         accent,
            letterSpacing: 1.5,
            textTransform: "uppercase" as const,
          }}
        >
          {rooms}
        </span>
      </div>

      {/* Sub-label */}
      <p
        style={{
          fontFamily: VN,
          fontSize:   24,
          fontWeight: 400,
          color:      MUTED,
          margin:     0,
          lineHeight: 1.5,
        }}
      >
        {badge}
      </p>

      {/* Price range — count up animation */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 0, opacity: numOpacity }}>
        <span
          style={{
            fontFamily:  VN,
            fontSize:    88,
            fontWeight:  900,
            color:       accent,
            lineHeight:  1,
            textShadow:  `0 0 60px ${accent}88`,
          }}
        >
          {minVal}
        </span>
        <span
          style={{
            fontFamily:  VN,
            fontSize:    56,
            fontWeight:  700,
            color:       accent,
            opacity:     sepOpacity,
            margin:      "0 10px",
            lineHeight:  1,
          }}
        >
          {" – "}
        </span>
        <span
          style={{
            fontFamily:  VN,
            fontSize:    88,
            fontWeight:  900,
            color:       accent,
            lineHeight:  1,
            opacity:     sepOpacity,
            textShadow:  `0 0 60px ${accent}88`,
          }}
        >
          {maxVal}
        </span>
      </div>

      {/* Unit */}
      <p
        style={{
          fontFamily: VN,
          fontSize:   30,
          fontWeight: 700,
          color:      WHITE,
          margin:     "-8px 0 0",
          opacity:    unitOpacity,
        }}
      >
        triệu{" "}
        <span style={{ color: MUTED, fontWeight: 400 }}>/tháng</span>
      </p>
    </div>
  );
};

// ─── Tagline ─────────────────────────────────────────────────────────────────
const TAGLINE_CHUNKS = [
  { text: "Tỷ suất lợi nhuận ròng", color: WHITE },
  { text: "ĐỀU ĐẶN · AN TOÀN · VƯỢT TRỘI", color: GOLD, bold: true },
];

const Tagline: React.FC<{ lf: number }> = ({ lf }) => (
  <div
    style={{
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      gap:            10,
      opacity:        remap(lf, [0, 16], [0, 1]),
      transform:      `translateY(${remap(lf, [0, 18], [24, 0])}px)`,
    }}
  >
    {/* Gold divider line */}
    <div
      style={{
        height:       2,
        width:        remap(lf, [0, 30], [0, 480]),
        background:   `linear-gradient(to right, transparent, ${GOLD}, transparent)`,
        borderRadius: 1,
        marginBottom: 4,
      }}
    />
    {TAGLINE_CHUNKS.map(({ text, color, bold }, i) => (
      <span
        key={i}
        style={{
          fontFamily:    VN,
          fontSize:      bold ? 44 : 30,
          fontWeight:    bold ? 900 : 400,
          color,
          letterSpacing: bold ? 3 : 0.5,
          textTransform: bold ? ("uppercase" as const) : undefined,
          textShadow:    bold ? `0 0 50px ${GOLD}66` : undefined,
          opacity:       remap(lf, [i * 10, i * 10 + 18], [0, 1]),
        }}
      >
        {text}
      </span>
    ))}
  </div>
);

// ─── AnimatedBackground ───────────────────────────────────────────────────────
// Subtle pulsing radial gradient — không cần video hoặc B-roll
const AnimBg: React.FC<{ f: number }> = ({ f }) => {
  const pulse = Math.sin(f * 0.04) * 0.5 + 0.5; // 0..1, slow oscillation
  return (
    <AbsoluteFill
      style={{
        background: [
          `radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,168,76,${0.04 + pulse * 0.04}) 0%, transparent 70%)`,
          `linear-gradient(180deg, ${BG} 0%, #0A1628 100%)`,
        ].join(", "),
      }}
    />
  );
};

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ f: number }> = ({ f }) => {
  const s = spring({ fps: FPS, frame: f - 5, config: { damping: 16, mass: 0.7 } });
  return (
    <div
      style={{
        opacity:       remap(f, [5, 18], [0, 1]),
        transform:     `scale(${interpolate(s, [0, 1], [0.7, 1])})`,
        display:       "flex",
        alignItems:    "center",
        gap:           14,
        justifyContent:"center",
      }}
    >
      <div style={{ height: 3, width: 60, background: GOLD, borderRadius: 2 }} />
      <span
        style={{
          fontFamily:    VN,
          fontSize:      26,
          fontWeight:    700,
          color:         GOLD,
          letterSpacing: 4,
          textTransform: "uppercase" as const,
        }}
      >
        KHẢO SÁT THỰC TẾ · 2 DỰ ÁN TRỤC QL13
      </span>
      <div style={{ height: 3, width: 60, background: GOLD, borderRadius: 2 }} />
    </div>
  );
};

// ─── RentalYieldVideo — 10s = 300 frames ─────────────────────────────────────
export const RentalYieldVideo: React.FC = () => {
  const f = useCurrentFrame();

  // Card 1: 2BR appears at frame 25, Card 2: 3BR at frame 50
  const card1LF = f - 25;
  const card2LF = f - 50;

  // Tagline appears at frame 185
  const taglineLF = f - 185;

  // Overall fade-in and hold (no fade-out needed — will be cut in editing)
  const globalOpacity = remap(f, [0, 10], [0, 1]);

  return (
    <AbsoluteFill style={{ background: BG, opacity: globalOpacity }}>

      {/* Animated gradient background */}
      <AnimBg f={f} />

      {/* Layout */}
      <AbsoluteFill
        style={{
          display:       "flex",
          flexDirection: "column",
          padding:       "60px 80px 72px",
          gap:           36,
        }}
      >
        {/* Header */}
        <SectionHeader f={f} />

        {/* Cards row */}
        <div style={{ display: "flex", gap: 36, flex: 1 }}>
          {card1LF >= 0 && (
            <RentalCard
              lf={card1LF}
              rooms="2 phòng ngủ"
              badge="Full nội thất · Sẵn khai thác ngay"
              min={12}
              max={15}
              accent={GOLD}
            />
          )}
          {card2LF >= 0 && (
            <RentalCard
              lf={card2LF}
              rooms="3 phòng ngủ"
              badge="Diện tích rộng · Phù hợp gia đình"
              min={16}
              max={18}
              accent={GREEN}
            />
          )}
        </div>

        {/* Tagline */}
        {taglineLF >= 0 && <Tagline lf={taglineLF} />}
      </AbsoluteFill>

      {/* Watermark */}
      <div
        style={{
          position:      "absolute",
          top:           26,
          right:         36,
          fontFamily:    VN,
          fontSize:      20,
          fontWeight:    700,
          color:         "rgba(255,255,255,0.3)",
          letterSpacing: 1,
        }}
      >
        batdongsan123.com
      </div>
    </AbsoluteFill>
  );
};
