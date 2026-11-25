import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Video,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/BeVietnamPro";

// Load Be Vietnam Pro — full Vietnamese diacritics support
const { fontFamily: VN } = loadFont("normal", { weights: ["700", "900"] });

// ─── Constants ────────────────────────────────────────────────────────────────
const FPS   = 30;
const GOLD  = "#C9A84C";
const RED   = "#E53935";
const WHITE = "#FFFFFF";

/** Clamped interpolate */
function remap(
  v: number,
  [iL, iH]: [number, number],
  [oL, oH]: [number, number]
): number {
  return interpolate(v, [iL, iH], [oL, oH], {
    extrapolateLeft:  "clamp",
    extrapolateRight: "clamp",
  });
}

// ─── Keyword schedule — word-level timestamps từ Whisper ─────────────────────
const KEYWORDS = [
  { text: "MINH HOÀNG BĐS",      startSec: 5.18,  style: "B" as const, color: WHITE },
  { text: "DÒNG TIỀN THONG THẢ", startSec: 7.24,  style: "A" as const, color: GOLD  },
  { text: "CHO THUÊ",             startSec: 11.30, style: "C" as const, color: GOLD  },
  { text: "QUỐC LỘ 13",          startSec: 13.26, style: "B" as const, color: RED   },
  { text: "HÀNG CHỤC DỰ ÁN",    startSec: 16.62, style: "A" as const, color: WHITE  },
  { text: "CHỌN MẶT GỬI VÀNG",  startSec: 20.02, style: "GLITCH" as const, color: GOLD },
] as const;

// Hold frames per keyword (before fade-out)
const KEYWORD_TOTAL = 44; // 1.47s for normal
const GLITCH_TOTAL  = 56; // 1.87s for glitch (slower drama)

// ─── Title card words — grouped for cleaner spring ────────────────────────────
const TITLE_GROUPS = ["TOP 2", "DỰ ÁN", "ĐÁNG MUA NHẤT"];

// ─── TitleCard (0 → 3.24s = frames 0-97) ────────────────────────────────────
const TitleCard: React.FC = () => {
  const f = useCurrentFrame();

  // Fade entire title out right before MC segment starts (frames 85-97)
  const exitOpacity = remap(f, [85, 97], [1, 0]);

  return (
    <AbsoluteFill
      style={{
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        justifyContent:"center",
        gap:           12,
        opacity:       exitOpacity,
      }}
    >
      {/* LINE 1 — TOP 2 DỰ ÁN ĐÁNG MUA NHẤT */}
      <div style={{ display: "flex", gap: 24, alignItems: "baseline", flexWrap: "wrap", justifyContent: "center" }}>
        {TITLE_GROUPS.map((group, i) => {
          const delay = i * 5; // 5 frames ≈ 167ms stagger
          const s = spring({
            fps:    FPS,
            frame:  f - delay,
            config: { damping: 14, mass: 0.7, stiffness: 180 },
          });
          const opacity   = remap(f - delay, [0, 10], [0, 1]);
          const translateY = interpolate(s, [0, 1], [70, 0]);
          const scale      = interpolate(s, [0, 1], [0.75, 1]);

          return (
            <span
              key={group}
              style={{
                fontFamily:  VN,
                fontSize:    i === 2 ? 82 : 100,
                fontWeight:  900,
                color:       WHITE,
                opacity,
                transform:   `translateY(${translateY}px) scale(${scale})`,
                display:     "inline-block",
                lineHeight:  1,
                letterSpacing: -1,
                textTransform: "uppercase" as const,
                textShadow:  "0 4px 32px rgba(0,0,0,0.9)",
              }}
            >
              {group}
            </span>
          );
        })}
      </div>

      {/* LINE 2 — TRỤC QUỐC LỘ 13 — appears at frame 74 (2.48s) in gold */}
      {(() => {
        const delay = 74;
        const s = spring({
          fps:    FPS,
          frame:  f - delay,
          config: { damping: 9, mass: 0.6, stiffness: 220 },
        });
        const opacity = remap(f - delay, [0, 6], [0, 1]);
        const scale   = interpolate(s, [0, 1], [0.45, 1]);
        // Expanding decorative lines
        const lineW   = remap(f - delay, [0, 18], [0, 100]);

        return (
          <div
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        18,
              opacity,
              transform:  `scale(${scale})`,
              marginTop:  8,
            }}
          >
            <div style={{ height: 3, width: lineW, background: GOLD, borderRadius: 2, flexShrink: 0 }} />
            <span
              style={{
                fontFamily:    VN,
                fontSize:      68,
                fontWeight:    700,
                color:         GOLD,
                letterSpacing: 5,
                textTransform: "uppercase" as const,
                textShadow:    `0 0 50px ${GOLD}88, 0 4px 20px rgba(0,0,0,0.9)`,
                whiteSpace:    "nowrap",
              }}
            >
              TRỤC QUỐC LỘ 13
            </span>
            <div style={{ height: 3, width: lineW, background: GOLD, borderRadius: 2, flexShrink: 0 }} />
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};

// ─── KeywordOverlay ───────────────────────────────────────────────────────────
type KwStyle = "A" | "B" | "C" | "GLITCH";

interface KwProps {
  text:        string;
  color:       string;
  style:       KwStyle;
  totalFrames: number;
}

const KeywordOverlay: React.FC<KwProps> = ({ text, color, style, totalFrames }) => {
  const f = useCurrentFrame();

  // Fade out tail (last 8 frames for normal, last 10 for glitch)
  const fadeFrames = style === "GLITCH" ? 12 : 8;
  const fadeOpacity = remap(f, [totalFrames - fadeFrames, totalFrames], [1, 0]);

  if (style === "A") {
    // STYLE A — Slide up from below + scale
    const s = spring({ fps: FPS, frame: f, config: { damping: 13, mass: 0.7, stiffness: 200 } });
    const translateY = interpolate(s, [0, 1], [50, 0]);
    const scale      = interpolate(s, [0, 1], [0.8, 1]);
    const opacity    = remap(f, [0, 8], [0, 1]) * fadeOpacity;

    return (
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 140 }}>
        <div
          style={{
            opacity,
            transform: `translateY(${translateY}px) scale(${scale})`,
          }}
        >
          <KeywordChip text={text} color={color} size={72} />
        </div>
      </AbsoluteFill>
    );
  }

  if (style === "B") {
    // STYLE B — Punch scale from center (stiff spring, slight overshoot)
    const s = spring({ fps: FPS, frame: f, config: { damping: 8, mass: 0.55, stiffness: 280 } });
    const scale   = interpolate(s, [0, 1], [0.1, 1]);
    const opacity = remap(f, [0, 5], [0, 1]) * fadeOpacity;

    return (
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 100 }}>
        <div style={{ opacity, transform: `scale(${scale})` }}>
          <KeywordChip text={text} color={color} size={68} />
        </div>
      </AbsoluteFill>
    );
  }

  if (style === "C") {
    // STYLE C — Slide in from right
    const s = spring({ fps: FPS, frame: f, config: { damping: 15, mass: 0.9, stiffness: 180 } });
    const translateX = interpolate(s, [0, 1], [140, 0]);
    const opacity    = remap(f, [0, 8], [0, 1]) * fadeOpacity;

    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-end", paddingRight: 80, paddingBottom: 80 }}>
        <div style={{ opacity, transform: `translateX(${translateX}px)` }}>
          <KeywordChip text={text} color={color} size={68} />
        </div>
      </AbsoluteFill>
    );
  }

  // STYLE GLITCH — Slow spring + RGB split + screen shake
  const s = spring({ fps: FPS, frame: f, config: { damping: 22, mass: 1.4, stiffness: 120 } });
  const scale      = interpolate(s, [0, 1], [0.55, 1]);
  const opacity    = remap(f, [0, 6], [0, 1]) * fadeOpacity;

  // Deterministic noise (no Math.random — Remotion requires determinism)
  const glitch = Math.abs(Math.sin(f * 0.9)) > 0.65 ? 1 : 0;
  const noiseX1 = Math.sin(f * 13.73 + 1.1) * 9 * glitch;
  const noiseX2 = Math.sin(f * 7.31  + 2.3) * 7 * glitch;
  const shakeX  = Math.sin(f * 19.47 + 0.5) * 3 * glitch;
  const shakeY  = Math.sin(f * 11.23 + 3.1) * 2 * glitch;

  // Flash white overlay on heavy glitch frames
  const flashOpacity = Math.abs(Math.sin(f * 2.1)) > 0.88 ? 0.15 * glitch : 0;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems:     "center",
        transform:      `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* White flash */}
      <AbsoluteFill style={{ background: `rgba(255,255,255,${flashOpacity})`, pointerEvents: "none" }} />

      <div style={{ opacity, transform: `scale(${scale})`, position: "relative" }}>
        {/* Red channel (offset left) */}
        <div
          style={{
            position:  "absolute",
            inset:     0,
            color:     "#ff2020",
            opacity:   0.65,
            transform: `translateX(${noiseX1}px)`,
          }}
        >
          <KeywordChip text={text} color="#ff2020" size={80} nobg />
        </div>
        {/* Cyan channel (offset right) */}
        <div
          style={{
            position:  "absolute",
            inset:     0,
            opacity:   0.55,
            transform: `translateX(${-noiseX2}px)`,
          }}
        >
          <KeywordChip text={text} color="#00e5ff" size={80} nobg />
        </div>
        {/* Main text */}
        <KeywordChip text={text} color={color} size={80} />
      </div>
    </AbsoluteFill>
  );
};

// ─── KeywordChip — reusable pill with gold border ────────────────────────────
const KeywordChip: React.FC<{
  text:   string;
  color:  string;
  size:   number;
  nobg?:  boolean;
}> = ({ text, color, size, nobg = false }) => (
  <div
    style={{
      display:         "inline-block",
      background:      nobg ? "transparent" : "rgba(0,0,0,0.72)",
      backdropFilter:  nobg ? undefined : "blur(4px)",
      border:          nobg ? "none" : `2px solid ${color}66`,
      borderRadius:    12,
      padding:         nobg ? "0" : "12px 32px",
    }}
  >
    <span
      style={{
        fontFamily:    VN,
        fontSize:      size,
        fontWeight:    900,
        color:         color,
        letterSpacing: 2,
        textTransform: "uppercase" as const,
        textShadow:    nobg ? "none" : `0 0 40px ${color}66, 0 2px 12px rgba(0,0,0,0.9)`,
        whiteSpace:    "nowrap",
        display:       "block",
      }}
    >
      {text}
    </span>
  </div>
);

// ─── QL13IntroVideo — Main composition ───────────────────────────────────────
export const QL13IntroVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>

      {/* ─ Base video — plays full duration ─ */}
      <Video
        src={staticFile("video/ql13-intro.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        volume={1}
      />

      {/* ─ Dark overlay for title card segment (0-3.24s) ─ */}
      <Sequence from={0} durationInFrames={97} layout="none">
        <AbsoluteFill
          style={{ background: "rgba(0,0,0,0.65)" }}
        />
      </Sequence>

      {/* ─ Title card (0-3.24s + 0.4s overlap for exit) ─ */}
      <Sequence from={0} durationInFrames={110} layout="none">
        <TitleCard />
      </Sequence>

      {/* ─ Keyword overlays ─ */}
      {KEYWORDS.map((kw) => {
        const startFrame = Math.round(kw.startSec * FPS);
        const total      = kw.style === "GLITCH" ? GLITCH_TOTAL : KEYWORD_TOTAL;
        return (
          <Sequence key={kw.text} from={startFrame} durationInFrames={total} layout="none">
            <KeywordOverlay
              text={kw.text}
              color={kw.color}
              style={kw.style}
              totalFrames={total}
            />
          </Sequence>
        );
      })}

      {/* ─ Subtle watermark ─ */}
      <div
        style={{
          position:   "absolute",
          bottom:     28,
          right:      36,
          fontFamily: VN,
          fontSize:   22,
          fontWeight: 700,
          color:      "rgba(255,255,255,0.45)",
          letterSpacing: 1,
          pointerEvents: "none",
        }}
      >
        batdongsan123.com
      </div>
    </AbsoluteFill>
  );
};
