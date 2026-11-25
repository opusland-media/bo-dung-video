import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../design/tokens";
import type { SceneBeat } from "../data/scenes/schema";
import {
  parseBulletListContent,
  parseChartContent,
  parseChecklistContent,
  parseMapPinContent,
  parseNarrationContent,
  parseProjectShowcaseContent,
  parseTitleContent,
} from "../data/scenes/schema";

// Core components
import { KineticTitle }        from "../components/core/KineticTitle";
import { ParallaxBackground }  from "../components/core/ParallaxBackground";
import { TransitionWrapper }   from "../components/core/TransitionWrapper";

// Visual components
import { AnimatedChecklist }   from "../components/visuals/AnimatedChecklist";
import { MiniBudgetBars }      from "../components/visuals/MiniBudgetBars";
import { MiniMapPinDrop }      from "../components/visuals/MiniMapPinDrop";

// Project component
import { ProjectShowcase }     from "../components/projects/ProjectShowcase";

import { COLORS as C, FONTS, FONT_SIZES, remap } from "../design/tokens";

// ─── Beat content renderers ─────────────────────────────────────────────────────

const TitleBeat: React.FC<{ beat: SceneBeat; durationInFrames: number }> = ({
  beat,
  durationInFrames,
}) => {
  const c = parseTitleContent(beat.content);
  return (
    <AbsoluteFill>
      <ParallaxBackground
        imageSrc={beat.aiImage ?? c.bgImage}
        variant="dot-grid"
        durationInFrames={durationInFrames}
        panDirection="right"
      />
      <AbsoluteFill
        style={{
          display:        "flex",
          flexDirection:  "column",
          justifyContent: "center",
          alignItems:     "center",
          padding:        "0 60px",
        }}
      >
        <KineticTitle
          headline={c.headline}
          subtitle={c.subtitle}
          badge={c.badge}
          align="center"
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const BulletListBeat: React.FC<{ beat: SceneBeat; durationInFrames: number }> = ({
  beat,
  durationInFrames,
}) => {
  const c = parseBulletListContent(beat.content);

  const ICON_MAP: Record<string, { glyph: string; color: string }> = {
    x:       { glyph: "✕", color: C.danger },
    check:   { glyph: "✓", color: C.success },
    warning: { glyph: "⚠", color: C.warning },
    arrow:   { glyph: "→", color: C.gold },
  };

  return (
    <AbsoluteFill>
      <ParallaxBackground imageSrc={beat.aiImage ?? c.bgImage} variant="flow-lines" durationInFrames={durationInFrames} />
      <AbsoluteFill
        style={{
          display:        "flex",
          flexDirection:  "column",
          justifyContent: "center",
          padding:        "60px 72px",
          gap:            40,
        }}
      >
        {/* Section label */}
        <div
          style={{
            fontFamily:   FONTS.body,
            fontSize:     FONT_SIZES.caption,
            fontWeight:   700,
            color:        C.gold,
            letterSpacing: 3,
            textTransform: "uppercase" as const,
          }}
        >
          {c.title}
        </div>

        {/* Bullets */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {c.bullets.map((bullet, i) => {
            const iconConf = ICON_MAP[bullet.icon ?? "arrow"];
            return (
              <div
                key={i}
                style={{
                  display:    "flex",
                  alignItems: "flex-start",
                  gap:        24,
                }}
              >
                {/* Icon badge */}
                <div
                  style={{
                    flexShrink:     0,
                    width:          48,
                    height:         48,
                    borderRadius:   "50%",
                    background:     `${iconConf.color}22`,
                    border:         `1.5px solid ${iconConf.color}66`,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    marginTop:      2,
                  }}
                >
                  <span
                    style={{
                      fontSize:   22,
                      color:      iconConf.color,
                      fontWeight: 700,
                    }}
                  >
                    {iconConf.glyph}
                  </span>
                </div>

                <span
                  style={{
                    fontFamily:  FONTS.body,
                    fontSize:    FONT_SIZES.body,
                    color:       C.textPrimary,
                    lineHeight:  1.55,
                    paddingTop:  10,
                    fontWeight:  400,
                  }}
                >
                  {bullet.text}
                </span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ChartBeat: React.FC<{ beat: SceneBeat; durationInFrames: number }> = ({ beat }) => {
  const c = parseChartContent(beat.content);
  return (
    <AbsoluteFill>
      <ParallaxBackground imageSrc={beat.aiImage} variant="flow-lines" durationInFrames={beat.endTime - beat.startTime} />
      <AbsoluteFill
        style={{
          display:        "flex",
          flexDirection:  "column",
          justifyContent: "center",
          padding:        "60px 72px",
        }}
      >
        <MiniBudgetBars {...c} startDelay={6} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ChecklistBeat: React.FC<{ beat: SceneBeat }> = ({ beat }) => {
  const c = parseChecklistContent(beat.content);
  return (
    <AbsoluteFill>
      <ParallaxBackground imageSrc={beat.aiImage} variant="aurora" durationInFrames={beat.endTime - beat.startTime} />
      <AbsoluteFill
        style={{
          display:        "flex",
          flexDirection:  "column",
          justifyContent: "center",
          padding:        "60px 72px",
        }}
      >
        <AnimatedChecklist {...c} startDelay={6} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const MapPinBeat: React.FC<{ beat: SceneBeat; durationInFrames: number }> = ({
  beat,
  durationInFrames,
}) => {
  const c = parseMapPinContent(beat.content);
  return (
    <AbsoluteFill>
      <ParallaxBackground imageSrc={beat.aiImage ?? c.bgImage} variant="blueprint" durationInFrames={durationInFrames} />
      <AbsoluteFill
        style={{
          display:        "flex",
          flexDirection:  "column",
          justifyContent: "center",
          padding:        "60px 72px",
        }}
      >
        <MiniMapPinDrop {...c} startDelay={4} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Narration Beat ─────────────────────────────────────────────────────────────
const NarrationBeat: React.FC<{ beat: SceneBeat; durationInFrames: number }> = ({
  beat,
  durationInFrames,
}) => {
  const c = parseNarrationContent(beat.content);
  const f = useCurrentFrame();

  const badgeOpacity  = Math.min(1, f / 12);
  const badgeY        = remap(Math.min(f, 12), [0, 12], [-20, 0]);
  const subOpacity    = Math.min(1, Math.max(0, (f - 8) / 14));
  const subY          = remap(Math.min(Math.max(f - 8, 0), 14), [0, 14], [24, 0]);

  return (
    <AbsoluteFill>
      <ParallaxBackground
        imageSrc={beat.aiImage ?? c.bgImage}
        variant="dot-grid"
        durationInFrames={durationInFrames}
        panDirection="right"
      />

      {/* Gradient overlay — trong suốt trên, tối dưới */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.82) 100%)",
        }}
      />

      {/* Topic badge — góc trên trái */}
      <div
        style={{
          position:      "absolute",
          top:           52,
          left:          48,
          opacity:       badgeOpacity,
          transform:     `translateY(${badgeY}px)`,
          background:    "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          border:        `1.5px solid ${C.gold}88`,
          borderRadius:  8,
          padding:       "10px 20px",
        }}
      >
        <span style={{
          fontFamily:    FONTS.body,
          fontSize:      FONT_SIZES.caption,
          fontWeight:    700,
          color:         C.gold,
          letterSpacing: 2,
          textTransform: "uppercase" as const,
        }}>
          {c.badge}
        </span>
      </div>

      {/* Subtitle — phần dưới màn hình */}
      {c.subtitle && (
        <div
          style={{
            position:   "absolute",
            bottom:     72,
            left:       48,
            right:      48,
            opacity:    subOpacity,
            transform:  `translateY(${subY}px)`,
          }}
        >
          <p style={{
            fontFamily:  FONTS.body,
            fontSize:    FONT_SIZES.body,
            color:       C.textPrimary,
            lineHeight:  1.6,
            margin:      0,
            textShadow:  "0 2px 8px rgba(0,0,0,0.8)",
            fontWeight:  400,
          }}>
            {c.subtitle}
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Beat dispatcher ────────────────────────────────────────────────────────────
const BeatContent: React.FC<{ beat: SceneBeat; durationInFrames: number }> = ({
  beat,
  durationInFrames,
}) => {
  switch (beat.visualType) {
    case "title":
      return <TitleBeat beat={beat} durationInFrames={durationInFrames} />;

    case "bullet-list":
      return <BulletListBeat beat={beat} durationInFrames={durationInFrames} />;

    case "chart":
      return <ChartBeat beat={beat} durationInFrames={durationInFrames} />;

    case "checklist":
      return <ChecklistBeat beat={beat} />;

    case "map-pin":
      return <MapPinBeat beat={beat} durationInFrames={durationInFrames} />;

    case "project-showcase": {
      if (!beat.projectRef) {
        return <div style={{ background: COLORS.bg, width: "100%", height: "100%" }} />;
      }
      const c = parseProjectShowcaseContent(beat.content);
      return (
        <ProjectShowcase
          projectRef={beat.projectRef}
          content={c}
          durationInFrames={durationInFrames}
          aiImage={beat.aiImage}
        />
      );
    }

    case "narration":
      return <NarrationBeat beat={beat} durationInFrames={durationInFrames} />;

    case "comparison-table":
      // Placeholder — implement khi cần
      return (
        <AbsoluteFill style={{ background: COLORS.bg, justifyContent: "center", alignItems: "center" }}>
          <div style={{ color: COLORS.textSecondary, fontFamily: FONTS.body, fontSize: FONT_SIZES.body }}>
            comparison-table — coming soon
          </div>
        </AbsoluteFill>
      );

    default:
      return null;
  }
};

// ─── Watermark ─────────────────────────────────────────────────────────────────
const Watermark: React.FC = () => (
  <div
    style={{
      position:   "absolute",
      top:        36,
      left:       40,
      fontFamily: FONTS.body,
      fontSize:   FONT_SIZES.tiny,
      fontWeight: 600,
      color:      `${C.textMuted}CC`,
      letterSpacing: 1,
      zIndex:     100,
      pointerEvents: "none",
    }}
  >
    batdongsan123.com
  </div>
);

// ─── SceneRenderer — engine chính ──────────────────────────────────────────────
export const SceneRenderer: React.FC<{ scenes: SceneBeat[] }> = ({ scenes }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Watermark luôn hiện */}
      <Watermark />

      {scenes.map((beat) => {
        const startFrame    = Math.round(beat.startTime * fps);
        const durationFrames = Math.max(1, Math.round((beat.endTime - beat.startTime) * fps));

        return (
          <Sequence
            key={beat.id}
            from={startFrame}
            durationInFrames={durationFrames}
            layout="none"
          >
            <TransitionWrapper type={beat.transitionIn ?? "fade"}>
              <BeatContent beat={beat} durationInFrames={durationFrames} />
            </TransitionWrapper>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
