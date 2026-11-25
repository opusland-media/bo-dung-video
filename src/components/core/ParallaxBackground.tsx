import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { applyGradeOverlay, COLORS, remap } from "../../design/tokens";
import { ProceduralBackground } from "./ProceduralBackground";
import type { BgVariant } from "./ProceduralBackground";

interface Props {
  /** Path tương đối trong public/images/ (e.g. "backgrounds/cityscape.jpg") */
  imageSrc?: string;
  /** Variant background khi không có ảnh thật */
  variant?: BgVariant;
  /** Hướng pan Ken Burns: "right" (mặc định) | "left" | "up" | "down" */
  panDirection?: "right" | "left" | "up" | "down";
  /** Scale zoom range: [start, end] — mặc định [1, 1.08] */
  zoomRange?: [number, number];
  durationInFrames: number;
}

export const ParallaxBackground: React.FC<Props> = ({
  imageSrc,
  variant = "dot-grid",
  panDirection = "right",
  zoomRange = [1, 1.08],
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const progress = remap(frame, [0, durationInFrames], [0, 1]);

  // Nếu không có ảnh thật → dùng procedural background
  if (!imageSrc) {
    return <ProceduralBackground variant={variant} />;
  }

  // Ken Burns cho ảnh thật
  const scale = remap(progress, [0, 1], zoomRange);
  const panAmount = 30;
  const tx =
    panDirection === "right" ? remap(progress, [0, 1], [0, -panAmount])
    : panDirection === "left" ? remap(progress, [0, 1], [0, panAmount])
    : 0;
  const ty =
    panDirection === "up"   ? remap(progress, [0, 1], [0, panAmount])
    : panDirection === "down" ? remap(progress, [0, 1], [0, -panAmount])
    : 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(imageSrc)}
        style={{
          width:     "100%",
          height:    "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
          transformOrigin: "center center",
        }}
      />
      <div style={applyGradeOverlay()} />
    </AbsoluteFill>
  );
};
