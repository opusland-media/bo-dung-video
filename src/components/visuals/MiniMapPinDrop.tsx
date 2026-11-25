import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS, FONT_SIZES, remap } from "../../design/tokens";
import type { MapPinContentType } from "../../data/scenes/schema";

interface Props extends MapPinContentType {
  startDelay?: number;
}

export const MiniMapPinDrop: React.FC<Props> = ({
  title,
  location,
  highlights,
  startDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - startDelay);

  // Title
  const titleOpacity = remap(f, [0, 10], [0, 1]);

  // Pin drop animation
  const pinDelay = 8;
  const pinDrop = spring({
    frame:  Math.max(0, f - pinDelay),
    fps,
    config: { damping: 10, stiffness: 180, mass: 0.6 }, // bouncy
  });
  const pinY = (1 - pinDrop) * -120;

  // Pulse rings after pin lands
  const pulseDelay = pinDelay + 14;

  // Location label
  const locationDelay = pinDelay + 10;
  const locationOpacity = remap(f - locationDelay, [0, 12], [0, 1]);

  // Highlights stagger in
  const highlightStartDelay = pulseDelay + 8;

  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        gap:           28,
        width:         "100%",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontFamily:  FONTS.display,
          fontSize:    FONT_SIZES.h2,
          fontWeight:  700,
          color:       COLORS.textPrimary,
          opacity:     titleOpacity,
          lineHeight:  1.2,
        }}
      >
        {title}
      </div>

      {/* Map pin visual */}
      <div
        style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          position:       "relative",
          marginBottom:   16,
        }}
      >
        {/* Pin */}
        <div
          style={{
            transform:    `translateY(${pinY}px)`,
            display:      "flex",
            flexDirection: "column",
            alignItems:   "center",
          }}
        >
          {/* Pin head */}
          <div
            style={{
              width:          56,
              height:         56,
              borderRadius:   "50% 50% 50% 0",
              transform:      "rotate(-45deg)",
              background:     `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
              boxShadow:      `0 8px 24px ${COLORS.gold}66`,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              marginBottom:   4,
            }}
          >
            <span
              style={{
                transform:  "rotate(45deg)",
                fontSize:   24,
                lineHeight: 1,
              }}
            >
              📍
            </span>
          </div>

          {/* Pin tail */}
          <div
            style={{
              width:              2,
              height:             24,
              background:         COLORS.gold,
              borderRadius:       1,
            }}
          />
        </div>

        {/* Pulse rings */}
        {[0, 1, 2].map((i) => {
          const ringDelay = pulseDelay + i * 6;
          const ringProgress = remap(f - ringDelay, [0, 20], [0, 1]);
          const ringScale = remap(ringProgress, [0, 1], [0.2, 2.5]);
          const ringOpacity = remap(ringProgress, [0, 1], [0.7, 0]);
          return (
            <div
              key={i}
              style={{
                position:     "absolute",
                bottom:       0,
                left:         "50%",
                transform:    `translateX(-50%) scale(${ringScale})`,
                width:        60,
                height:       60,
                borderRadius: "50%",
                border:       `2px solid ${COLORS.gold}`,
                opacity:      ringOpacity,
              }}
            />
          );
        })}

        {/* Location label */}
        <div
          style={{
            opacity:        locationOpacity,
            background:     `${COLORS.gold}22`,
            border:         `1px solid ${COLORS.gold}66`,
            borderRadius:   8,
            padding:        "10px 20px",
            marginTop:      8,
          }}
        >
          <span
            style={{
              fontFamily:   FONTS.body,
              fontSize:     FONT_SIZES.caption,
              fontWeight:   700,
              color:        COLORS.gold,
              letterSpacing: 1,
            }}
          >
            {location}
          </span>
        </div>
      </div>

      {/* Highlights */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {highlights.map((point, i) => {
          const hDelay = highlightStartDelay + i * 10;
          const hProgress = spring({
            frame:  Math.max(0, f - hDelay),
            fps,
            config: { damping: 16, stiffness: 140 },
          });

          return (
            <div
              key={i}
              style={{
                display:    "flex",
                alignItems: "center",
                gap:        16,
                opacity:    hProgress,
                transform:  `translateX(${(1 - hProgress) * 40}px)`,
              }}
            >
              <div
                style={{
                  width:          8,
                  height:         8,
                  borderRadius:   "50%",
                  background:     COLORS.gold,
                  flexShrink:     0,
                  boxShadow:      `0 0 8px ${COLORS.gold}`,
                }}
              />
              <span
                style={{
                  fontFamily:  FONTS.body,
                  fontSize:    FONT_SIZES.body,
                  color:       COLORS.textPrimary,
                  lineHeight:  1.4,
                }}
              >
                {point}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
