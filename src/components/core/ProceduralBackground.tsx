import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { applyGradeOverlay, COLORS } from "../../design/tokens";

export type BgVariant = "dot-grid" | "flow-lines" | "aurora" | "blueprint";

// ─── Dot Grid ─────────────────────────────────────────────────────────────────
// Lưới chấm vàng mờ + 3 orb sáng thở nhẹ. Dùng cho title / map-pin.
const DotGrid: React.FC = () => {
  const frame = useCurrentFrame();

  const orbs = [
    { x: 14,  y: 22,  size: 560, color: COLORS.gold,    speed: 0.014, delay: 0   },
    { x: 82,  y: 60,  size: 420, color: "#3B82F6",      speed: 0.019, delay: 28  },
    { x: 48,  y: 88,  size: 380, color: COLORS.goldDim, speed: 0.011, delay: 55  },
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.bg, overflow: "hidden" }}>
      {/* Dot grid — radial-gradient trick cho lưới chấm tinh */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, ${COLORS.gold}1A 1.5px, transparent 1.5px)`,
          backgroundSize: "72px 72px",
        }}
      />

      {/* Đường chéo kết nối — tạo cảm giác circuit board */}
      <svg
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }}
      >
        {/* Một vài đường ngang + dọc accent */}
        {[144, 360, 720, 900].map((x) => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={1920}
            stroke={COLORS.gold} strokeWidth={0.8} />
        ))}
        {[240, 640, 960, 1280, 1680].map((y) => (
          <line key={`h${y}`} x1={0} y1={y} x2={1080} y2={y}
            stroke={COLORS.gold} strokeWidth={0.8} />
        ))}
        {/* Node circles tại giao điểm nổi bật */}
        {[
          [144, 240], [360, 640], [720, 960], [900, 1280], [144, 1680],
          [720, 240], [360, 1280], [900, 640],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={4} fill={COLORS.gold} opacity={0.5} />
        ))}
        {/* Diagonal accent lines */}
        <line x1={144} y1={240} x2={360} y2={640}   stroke={COLORS.gold} strokeWidth={0.6} />
        <line x1={360} y1={640} x2={720} y2={960}   stroke={COLORS.gold} strokeWidth={0.6} />
        <line x1={720} y1={960} x2={900} y2={1280}  stroke={COLORS.gold} strokeWidth={0.6} />
        <line x1={144} y1={240} x2={720} y2={240}   stroke={COLORS.gold} strokeWidth={0.6} />
        <line x1={900} y1={640} x2={360} y2={1280}  stroke={COLORS.gold} strokeWidth={0.6} />
      </svg>

      {/* Glowing orbs — thở nhẹ */}
      {orbs.map((orb, i) => {
        const t = frame * orb.speed + orb.delay;
        const scale = 0.82 + Math.sin(t) * 0.18;
        const opacity = 0.55 + Math.sin(t * 1.4 + 1) * 0.2;
        return (
          <div
            key={i}
            style={{
              position:     "absolute",
              left:         `${orb.x}%`,
              top:          `${orb.y}%`,
              width:        orb.size,
              height:       orb.size,
              borderRadius: "50%",
              background:   `radial-gradient(circle at 38% 38%, ${orb.color}2E, transparent 68%)`,
              transform:    `translate(-50%, -50%) scale(${scale})`,
              opacity,
              filter:       "blur(55px)",
            }}
          />
        );
      })}

      {/* Scan line mỏng chạy lên xuống — subtle */}
      <div
        style={{
          position:   "absolute",
          left:       0,
          right:      0,
          top:        `${30 + Math.sin(frame * 0.008) * 25}%`,
          height:     1,
          background: `linear-gradient(90deg, transparent 0%, ${COLORS.gold}20 40%, ${COLORS.gold}20 60%, transparent 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Flow Lines ────────────────────────────────────────────────────────────────
// Đường dữ liệu chảy ngang. Dùng cho chart / bullet-list.
const FlowLines: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 1080, H = 1920;

  const lines = [
    { y: 12,  color: COLORS.gold,    opacity: 0.45, speed: 1.1,  dash: 140, gap: 60  },
    { y: 26,  color: "#60A5FA",      opacity: 0.22, speed: 0.65, dash: 90,  gap: 180 },
    { y: 41,  color: COLORS.gold,    opacity: 0.32, speed: 0.85, dash: 60,  gap: 100 },
    { y: 54,  color: "#3DD68C",      opacity: 0.20, speed: 0.50, dash: 180, gap: 80  },
    { y: 67,  color: "#C084FC",      opacity: 0.18, speed: 1.3,  dash: 80,  gap: 200 },
    { y: 79,  color: COLORS.gold,    opacity: 0.40, speed: 0.95, dash: 220, gap: 50  },
    { y: 91,  color: "#60A5FA",      opacity: 0.15, speed: 0.55, dash: 100, gap: 140 },
  ];

  // Orb nhẹ ở góc để không hoàn toàn trống
  const pulse1 = 0.6 + Math.sin(frame * 0.016) * 0.2;
  const pulse2 = 0.5 + Math.sin(frame * 0.012 + 2) * 0.2;

  return (
    <AbsoluteFill style={{ background: "#080D16", overflow: "hidden" }}>
      {/* Grid dọc mờ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(90deg, ${COLORS.border}18 1px, transparent 1px)`,
          backgroundSize: "108px 100%",
        }}
      />

      {/* Orbs góc */}
      <div style={{
        position: "absolute", left: "10%", top: "15%",
        width: 480, height: 480, borderRadius: "50%",
        background: `radial-gradient(circle, ${COLORS.gold}1A, transparent 70%)`,
        filter: "blur(80px)",
        transform: `scale(${pulse1})`,
        opacity: pulse1,
      }} />
      <div style={{
        position: "absolute", right: "5%", bottom: "20%",
        width: 360, height: 360, borderRadius: "50%",
        background: `radial-gradient(circle, #3B82F620, transparent 70%)`,
        filter: "blur(80px)",
        transform: `scale(${pulse2})`,
        opacity: pulse2,
      }} />

      {/* Flowing dashed lines */}
      <svg viewBox={`0 0 ${W} ${H}`}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {lines.map((line, i) => {
          const y = (line.y / 100) * H;
          const offset = -((frame * line.speed) % (line.dash + line.gap));
          return (
            <line
              key={i}
              x1={0} y1={y} x2={W} y2={y}
              stroke={line.color}
              strokeWidth={1.5}
              strokeOpacity={line.opacity}
              strokeDasharray={`${line.dash} ${line.gap}`}
              strokeDashoffset={offset}
            />
          );
        })}

        {/* Điểm sáng chạy theo line chính */}
        {[0, 1, 2].map((i) => {
          const line = lines[i * 2];
          const y = (line.y / 100) * H;
          const x = ((frame * line.speed * 2) % W);
          return (
            <circle key={`dot${i}`} cx={x} cy={y} r={3}
              fill={line.color} opacity={0.7} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ─── Aurora ───────────────────────────────────────────────────────────────────
// Aurora borealis effect — blob gradient chuyển động. Dùng cho checklist / CTA.
const Aurora: React.FC = () => {
  const frame = useCurrentFrame();

  const blobs = [
    { x: 25,  y: 18,  w: 720, h: 520, color: "#0F2A4A", speedX: 0.008, speedY: 0.006 },
    { x: 72,  y: 45,  w: 640, h: 640, color: "#162A14", speedX: 0.011, speedY: 0.009 },
    { x: 18,  y: 72,  w: 560, h: 480, color: "#2A1A08", speedX: 0.007, speedY: 0.013 },
    { x: 78,  y: 80,  w: 480, h: 400, color: "#1A0A28", speedX: 0.013, speedY: 0.007 },
  ];

  return (
    <AbsoluteFill style={{ background: "#06080F", overflow: "hidden" }}>
      {blobs.map((blob, i) => {
        const tx = Math.sin(frame * blob.speedX + i * 1.5) * 60;
        const ty = Math.cos(frame * blob.speedY + i * 2.2) * 50;
        return (
          <div
            key={i}
            style={{
              position:     "absolute",
              left:         `${blob.x}%`,
              top:          `${blob.y}%`,
              width:        blob.w,
              height:       blob.h,
              borderRadius: "50%",
              background:   blob.color,
              transform:    `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`,
              filter:       "blur(90px)",
            }}
          />
        );
      })}

      {/* Gold shimmer dải dọc */}
      <div style={{
        position: "absolute",
        left: `${32 + Math.sin(frame * 0.007) * 8}%`,
        top: 0, bottom: 0,
        width: 2,
        background: `linear-gradient(180deg, transparent, ${COLORS.gold}22 30%, ${COLORS.gold}18 70%, transparent)`,
        filter: "blur(4px)",
      }} />
      <div style={{
        position: "absolute",
        left: `${68 + Math.sin(frame * 0.009 + 1) * 6}%`,
        top: 0, bottom: 0,
        width: 1,
        background: `linear-gradient(180deg, transparent, ${COLORS.gold}15 40%, transparent)`,
        filter: "blur(2px)",
      }} />
    </AbsoluteFill>
  );
};

// ─── Blueprint ─────────────────────────────────────────────────────────────────
// Lưới kỹ thuật architectural. Dùng cho map-pin / comparison.
const Blueprint: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 1080, H = 1920;
  const GRID = 90;

  const pulse = 0.7 + Math.sin(frame * 0.01) * 0.15;

  return (
    <AbsoluteFill style={{ background: "#050B18", overflow: "hidden" }}>
      <svg viewBox={`0 0 ${W} ${H}`}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {/* Major grid */}
        {Array.from({ length: Math.ceil(W / GRID) + 1 }, (_, i) => i * GRID).map((x) => (
          <line key={`mv${x}`} x1={x} y1={0} x2={x} y2={H}
            stroke="#2A4A7A" strokeWidth={0.5} />
        ))}
        {Array.from({ length: Math.ceil(H / GRID) + 1 }, (_, i) => i * GRID).map((y) => (
          <line key={`mh${y}`} x1={0} y1={y} x2={W} y2={y}
            stroke="#2A4A7A" strokeWidth={0.5} />
        ))}

        {/* Minor grid (45px) */}
        {Array.from({ length: Math.ceil(W / 45) + 1 }, (_, i) => i * 45)
          .filter((x) => x % GRID !== 0).map((x) => (
          <line key={`sv${x}`} x1={x} y1={0} x2={x} y2={H}
            stroke="#1A2E4A" strokeWidth={0.3} />
        ))}

        {/* Accent cross-hairs at key positions */}
        {[[540, 480], [270, 960], [810, 960], [540, 1440]].map(([cx, cy], i) => (
          <g key={i} opacity={pulse * 0.6}>
            <line x1={cx - 20} y1={cy} x2={cx + 20} y2={cy}
              stroke={COLORS.gold} strokeWidth={1} />
            <line x1={cx} y1={cy - 20} x2={cx} y2={cy + 20}
              stroke={COLORS.gold} strokeWidth={1} />
            <circle cx={cx} cy={cy} r={30} fill="none"
              stroke={COLORS.gold} strokeWidth={0.5} />
          </g>
        ))}

        {/* Dimension arrows */}
        <g opacity={0.3}>
          <line x1={40} y1={400} x2={40} y2={1520} stroke={COLORS.gold} strokeWidth={0.8}
            markerStart="url(#arrow)" markerEnd="url(#arrow)" />
          <line x1={200} y1={1850} x2={880} y2={1850} stroke={COLORS.gold} strokeWidth={0.8} />
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8" fill="none" stroke={COLORS.gold} strokeWidth="1" />
            </marker>
          </defs>
        </g>
      </svg>

      {/* Blue wash overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 40%, #0A2040 0%, transparent 70%)",
      }} />
    </AbsoluteFill>
  );
};

// ─── Main export ───────────────────────────────────────────────────────────────
export const ProceduralBackground: React.FC<{ variant?: BgVariant }> = ({
  variant = "dot-grid",
}) => {
  const Inner =
    variant === "flow-lines" ? FlowLines
    : variant === "aurora"   ? Aurora
    : variant === "blueprint" ? Blueprint
    : DotGrid;

  return (
    <AbsoluteFill>
      <Inner />
      {/* Grade overlay đồng nhất toàn hệ thống */}
      <div style={applyGradeOverlay()} />
    </AbsoluteFill>
  );
};
