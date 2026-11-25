import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS, FONT_SIZES, remap } from "../../design/tokens";

interface Props {
  headline: string;
  subtitle?: string;
  badge?: string;
  /** Delay trước khi bắt đầu animate (frames) */
  startDelay?: number;
  align?: "left" | "center";
}

export const KineticTitle: React.FC<Props> = ({
  headline,
  subtitle,
  badge,
  startDelay = 0,
  align = "center",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - startDelay);

  // Badge animate in đầu tiên
  const badgeProgress = spring({ frame: f, fps, config: { damping: 18, stiffness: 200 } });

  // Headline: mỗi từ animate vào theo thứ tự với spring
  const words = headline.split(" ");

  // Subtitle fade in sau cùng
  const subtitleDelay = words.length * 4 + 8;
  const subtitleOpacity = remap(f - subtitleDelay, [0, 12], [0, 1]);

  // Gold underline draw in dưới headline
  const underlineDelay = words.length * 4 + 2;
  const underlineWidth = remap(f - underlineDelay, [0, 16], [0, 100]);

  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        alignItems:    align === "center" ? "center" : "flex-start",
        gap:           16,
        padding:       "0 60px",
      }}
    >
      {/* Badge */}
      {badge && (
        <div
          style={{
            opacity:         badgeProgress,
            transform:       `scale(${0.7 + 0.3 * badgeProgress})`,
            background:      COLORS.danger,
            color:           COLORS.textPrimary,
            fontFamily:      FONTS.body,
            fontSize:        FONT_SIZES.tiny,
            fontWeight:      700,
            letterSpacing:   4,
            padding:         "8px 20px",
            borderRadius:    4,
            textTransform:   "uppercase" as const,
          }}
        >
          {badge}
        </div>
      )}

      {/* Headline — kinetic word reveal */}
      <div
        style={{
          overflow:   "hidden",
          display:    "flex",
          flexWrap:   "wrap" as const,
          gap:        "0 16px",
          justifyContent: align === "center" ? "center" : "flex-start",
        }}
      >
        {words.map((word, i) => {
          const wordDelay = i * 4 + (badge ? 6 : 0);
          const wordSpring = spring({
            frame:  Math.max(0, f - wordDelay),
            fps,
            config: { damping: 15, stiffness: 150 },
          });
          return (
            <span
              key={i}
              style={{
                fontFamily:  FONTS.display,
                fontSize:    FONT_SIZES.h1,
                fontWeight:  700,
                color:       COLORS.textPrimary,
                lineHeight:  1.1,
                transform:   `translateY(${(1 - wordSpring) * 80}px)`,
                opacity:     wordSpring,
                display:     "inline-block",
                textAlign:   align,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Gold underline */}
      <div
        style={{
          height:      4,
          width:       `${underlineWidth}%`,
          background:  `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldLight})`,
          borderRadius: 2,
          maxWidth:    320,
        }}
      />

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            fontFamily:    FONTS.body,
            fontSize:      FONT_SIZES.h3,
            fontWeight:    400,
            color:         COLORS.textSecondary,
            opacity:       subtitleOpacity,
            textAlign:     align,
            letterSpacing: 1,
            lineHeight:    1.4,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
