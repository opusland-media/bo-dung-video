import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TRANSITION } from "../../design/tokens";

interface Props {
  type?: "fade" | "slide" | "wipe";
  /** Direction cho slide transition */
  slideFrom?: "right" | "left" | "bottom";
  children: React.ReactNode;
}

/**
 * Bọc quanh mỗi SceneBeat — xử lý entry animation mượt.
 * Không cần config gì thêm; chỉ cần đặt vào là có transition.
 */
export const TransitionWrapper: React.FC<Props> = ({
  type = "fade",
  slideFrom = "right",
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: {
      damping:   22,
      stiffness: 160,
      mass:      0.8,
    },
    durationInFrames: TRANSITION.normal,
  });

  let style: React.CSSProperties = {};

  switch (type) {
    case "fade":
      style = { opacity: progress };
      break;

    case "slide": {
      const distance = 120; // px
      const tx =
        slideFrom === "right" ? (1 - progress) * distance
        : slideFrom === "left"  ? (1 - progress) * -distance
        : 0;
      const ty = slideFrom === "bottom" ? (1 - progress) * distance : 0;
      style = {
        opacity:   progress,
        transform: `translate(${tx}px, ${ty}px)`,
      };
      break;
    }

    case "wipe": {
      // Wipe từ trái sang phải bằng clip-path
      const pct = Math.round(progress * 100);
      style = {
        clipPath: `inset(0 ${100 - pct}% 0 0)`,
      };
      break;
    }
  }

  return (
    <AbsoluteFill style={style}>
      {children}
    </AbsoluteFill>
  );
};
