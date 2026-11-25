import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS, FONT_SIZES, remap } from "../../design/tokens";
import type { ChecklistContentType } from "../../data/scenes/schema";

interface Props extends ChecklistContentType {
  startDelay?: number;
}

export const AnimatedChecklist: React.FC<Props> = ({
  title,
  items,
  ctaText,
  ctaUrl,
  startDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - startDelay);

  const titleOpacity = remap(f, [0, 10], [0, 1]);
  const ctaDelay = items.length * 14 + 16;
  const ctaOpacity = remap(f - ctaDelay, [0, 14], [0, 1]);
  const ctaScale = remap(f - ctaDelay, [0, 14], [0.9, 1]);

  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        gap:           24,
        width:         "100%",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontFamily:   FONTS.display,
          fontSize:     FONT_SIZES.h2,
          fontWeight:   700,
          color:        COLORS.textPrimary,
          opacity:      titleOpacity,
          lineHeight:   1.2,
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      {/* Items */}
      {items.map((item, i) => {
        const delay = i * 14 + 8;
        const itemProgress = spring({
          frame:  Math.max(0, f - delay),
          fps,
          config: { damping: 16, stiffness: 160 },
        });
        const checkProgress = spring({
          frame:  Math.max(0, f - delay - 4),
          fps,
          config: { damping: 12, stiffness: 300, mass: 0.5 },
        });

        return (
          <div
            key={i}
            style={{
              display:    "flex",
              alignItems: "flex-start",
              gap:        20,
              opacity:    itemProgress,
              transform:  `translateX(${(1 - itemProgress) * -40}px)`,
            }}
          >
            {/* Check circle */}
            <div
              style={{
                flexShrink:     0,
                width:          44,
                height:         44,
                borderRadius:   "50%",
                background:     `${COLORS.success}22`,
                border:         `2px solid ${COLORS.success}`,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                transform:      `scale(${checkProgress})`,
              }}
            >
              <span
                style={{
                  color:      COLORS.success,
                  fontSize:   22,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                ✓
              </span>
            </div>

            {/* Text */}
            <span
              style={{
                fontFamily:  FONTS.body,
                fontSize:    FONT_SIZES.body,
                color:       COLORS.textPrimary,
                lineHeight:  1.5,
                paddingTop:  8,
                fontWeight:  400,
              }}
            >
              {item}
            </span>
          </div>
        );
      })}

      {/* CTA */}
      {ctaText && (
        <div
          style={{
            opacity:        ctaOpacity,
            transform:      `scale(${ctaScale})`,
            marginTop:      16,
            padding:        "20px 40px",
            background:     `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
            borderRadius:   12,
            display:        "inline-flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:            12,
          }}
        >
          <span
            style={{
              fontFamily:   FONTS.body,
              fontSize:     FONT_SIZES.body,
              fontWeight:   700,
              color:        COLORS.bg,
              letterSpacing: 0.5,
            }}
          >
            🔗 {ctaText}
          </span>
        </div>
      )}
    </div>
  );
};
