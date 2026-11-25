import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS, FONT_SIZES, remap } from "../../design/tokens";
import type { ChartContentType } from "../../data/scenes/schema";

interface Props extends ChartContentType {
  /** Delay (frames) trước khi các bar bắt đầu animate */
  startDelay?: number;
}

const ICON_MAP: Record<string, string> = {
  x:       "✕",
  check:   "✓",
  warning: "⚠",
  arrow:   "→",
};

export const MiniBudgetBars: React.FC<Props> = ({ title, bars, unit, startDelay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - startDelay);

  // Title fade in
  const titleOpacity = remap(f, [0, 10], [0, 1]);

  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        gap:           FONT_SIZES.tiny,
        width:         "100%",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontFamily:    FONTS.body,
          fontSize:      FONT_SIZES.h3,
          fontWeight:    600,
          color:         COLORS.textPrimary,
          opacity:       titleOpacity,
          marginBottom:  16,
          lineHeight:    1.3,
        }}
      >
        {title}
      </div>

      {/* Bars */}
      {bars.map((bar, i) => {
        const barDelay  = i * 10 + 6;
        const barSpring = spring({
          frame:  Math.max(0, f - barDelay),
          fps,
          config: { damping: 14, stiffness: 100 },
        });

        const widthPct  = (bar.value / bar.max) * 100;
        const fillColor = bar.color ?? COLORS.chart[i % COLORS.chart.length];
        const labelOpacity = remap(f - barDelay, [0, 8], [0, 1]);
        const valueOpacity = remap(f - barDelay - 6, [0, 8], [0, 1]);

        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {/* Label row */}
            <div
              style={{
                display:        "flex",
                justifyContent: "space-between",
                opacity:        labelOpacity,
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.body,
                  fontSize:   FONT_SIZES.caption,
                  color:      COLORS.textSecondary,
                  fontWeight: 500,
                }}
              >
                {bar.label}
              </span>
              <span
                style={{
                  fontFamily: FONTS.body,
                  fontSize:   FONT_SIZES.caption,
                  color:      fillColor,
                  fontWeight: 700,
                  opacity:    valueOpacity,
                }}
              >
                {typeof bar.value === "number"
                  ? bar.value.toLocaleString("vi-VN")
                  : bar.value}
                {unit ? ` ${unit}` : ""}
              </span>
            </div>

            {/* Bar track */}
            <div
              style={{
                width:        "100%",
                height:       10,
                background:   COLORS.surface,
                borderRadius: 6,
                overflow:     "hidden",
              }}
            >
              <div
                style={{
                  width:        `${barSpring * widthPct}%`,
                  height:       "100%",
                  background:   `linear-gradient(90deg, ${fillColor}CC, ${fillColor})`,
                  borderRadius: 6,
                  boxShadow:    `0 0 12px ${fillColor}66`,
                  transition:   "width 0s",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
