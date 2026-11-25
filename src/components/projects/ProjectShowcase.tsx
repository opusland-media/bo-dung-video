import React from "react";
import {
  AbsoluteFill, Img, Sequence, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from "remotion";
import { applyGradeOverlay, COLORS, FONTS, FONT_SIZES, remap } from "../../design/tokens";
import { PROJECT_META } from "../../data/scenes/schema";
import type { ProjectRef, ProjectShowcaseContentType } from "../../data/scenes/schema";

interface Props {
  projectRef:        ProjectRef;
  content:           ProjectShowcaseContentType;
  durationInFrames:  number;
  aiImage?:          string;
  /** Hiển thị 2 dự án song song (so sánh) */
  secondProjectRef?: ProjectRef;
  secondContent?:    ProjectShowcaseContentType;
}

// ─── Single project panel ──────────────────────────────────────────────────────
const ProjectPanel: React.FC<{
  projectRef:       ProjectRef;
  content:          ProjectShowcaseContentType;
  durationInFrames: number;
  aiImage?:         string;
  panDirection?:    "right" | "left";
}> = ({ projectRef, content, durationInFrames, aiImage, panDirection = "right" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame;

  const meta = PROJECT_META[projectRef];
  const imgIndex = content.imageIndex ?? 0;
  // aiImage override → dùng ảnh AI-generated; fallback → project image
  const imageSrc = aiImage ?? `images/projects/${projectRef}/${projectRef}-${imgIndex}.jpg`;

  // Ken Burns — zoom + pan chậm
  const progress  = remap(f, [0, durationInFrames], [0, 1]);
  const scale     = remap(progress, [0, 1], [1, 1.07]);
  const translateX = panDirection === "right"
    ? remap(progress, [0, 1], [0, -20])
    : remap(progress, [0, 1], [0, 20]);

  // Info card slide up from bottom
  const cardDelay    = 10;
  const cardProgress = spring({
    frame:  Math.max(0, f - cardDelay),
    fps,
    config: { damping: 18, stiffness: 120 },
  });
  const cardY = (1 - cardProgress) * 80;

  // Badge pop in
  const badgeProgress = spring({
    frame:  Math.max(0, f - 6),
    fps,
    config: { damping: 14, stiffness: 260, mass: 0.5 },
  });

  // Highlights stagger
  const highlightStart = 14;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Project image with Ken Burns */}
      <Img
        src={staticFile(imageSrc)}
        style={{
          width:     "100%",
          height:    "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translateX(${translateX}px)`,
          transformOrigin: "center center",
        }}
        // Fallback khi chưa có ảnh thật — hiển thị gradient placeholder
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />

      {/* Placeholder nền khi chưa có ảnh */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${COLORS.surface} 0%, ${COLORS.bg} 100%)`,
          zIndex: -1,
        }}
      />

      {/* Color grade overlay */}
      <div style={applyGradeOverlay()} />

      {/* Badge nổi bật */}
      {content.showBadge && (
        <div
          style={{
            position:  "absolute",
            top:       40,
            right:     40,
            transform: `scale(${badgeProgress})`,
            background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
            color:      COLORS.bg,
            fontFamily: FONTS.body,
            fontSize:   FONT_SIZES.caption,
            fontWeight: 800,
            padding:    "10px 20px",
            borderRadius: 8,
            letterSpacing: 0.5,
            zIndex:     10,
          }}
        >
          {content.showBadge}
        </div>
      )}

      {/* Info card bottom */}
      <div
        style={{
          position:      "absolute",
          bottom:        0,
          left:          0,
          right:         0,
          padding:       "40px 48px 56px",
          transform:     `translateY(${cardY}px)`,
          opacity:       cardProgress,
        }}
      >
        {/* Project name */}
        <div
          style={{
            fontFamily:   FONTS.display,
            fontSize:     FONT_SIZES.h2,
            fontWeight:   700,
            color:        COLORS.textPrimary,
            lineHeight:   1.2,
            marginBottom: 8,
          }}
        >
          {meta.name}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily:   FONTS.body,
            fontSize:     FONT_SIZES.caption,
            color:        COLORS.gold,
            fontWeight:   600,
            letterSpacing: 1,
            marginBottom: 24,
          }}
        >
          {meta.tagline}
        </div>

        {/* Gold divider */}
        <div
          style={{
            width:       80,
            height:      3,
            background:  `linear-gradient(90deg, ${COLORS.gold}, transparent)`,
            borderRadius: 2,
            marginBottom: 24,
          }}
        />

        {/* Highlights */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {content.highlights.map((hl, i) => {
            const hlDelay = highlightStart + i * 8;
            const hlProgress = spring({
              frame:  Math.max(0, f - hlDelay),
              fps,
              config: { damping: 16, stiffness: 140 },
            });

            return (
              <div
                key={i}
                style={{
                  display:   "flex",
                  alignItems: "center",
                  gap:       12,
                  opacity:   hlProgress,
                  transform: `translateX(${(1 - hlProgress) * -24}px)`,
                }}
              >
                <div
                  style={{
                    width:        6,
                    height:       6,
                    borderRadius: "50%",
                    background:   COLORS.gold,
                    flexShrink:   0,
                  }}
                />
                <span
                  style={{
                    fontFamily: FONTS.body,
                    fontSize:   FONT_SIZES.body,
                    color:      COLORS.textPrimary,
                    fontWeight: 500,
                  }}
                >
                  {hl}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main ProjectShowcase — hỗ trợ 1 hoặc 2 dự án ────────────────────────────
export const ProjectShowcase: React.FC<Props> = ({
  projectRef,
  content,
  durationInFrames,
  aiImage,
  secondProjectRef,
  secondContent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Split screen divider animate vào giữa (nếu có 2 dự án)
  const dividerProgress = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 120 },
  });

  if (secondProjectRef && secondContent) {
    // Split screen layout
    return (
      <AbsoluteFill>
        {/* Left panel */}
        <div
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: 0,
            width: "50%",
            overflow: "hidden",
          }}
        >
          <ProjectPanel
            projectRef={projectRef}
            content={content}
            durationInFrames={durationInFrames}
            panDirection="right"
          />
        </div>

        {/* Animated divider line */}
        <div
          style={{
            position:  "absolute",
            top:       0,
            bottom:    0,
            left:      "50%",
            width:     2,
            transform: `scaleY(${dividerProgress})`,
            transformOrigin: "center",
            background: `linear-gradient(180deg, transparent, ${COLORS.gold}, transparent)`,
            zIndex: 10,
          }}
        />

        {/* Right panel */}
        <div
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            right: 0,
            width: "50%",
            overflow: "hidden",
          }}
        >
          <Sequence from={4}>
            <ProjectPanel
              projectRef={secondProjectRef}
              content={secondContent}
              durationInFrames={durationInFrames}
              panDirection="left"
            />
          </Sequence>
        </div>
      </AbsoluteFill>
    );
  }

  // Single project
  return (
    <ProjectPanel
      projectRef={projectRef}
      content={content}
      durationInFrames={durationInFrames}
      aiImage={aiImage}
    />
  );
};
