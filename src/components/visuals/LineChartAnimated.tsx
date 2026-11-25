import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS, FONT_SIZES, remap } from "../../design/tokens";

interface DataPoint {
  label: string;
  value: number;
}

interface Props {
  title:       string;
  data:        DataPoint[];
  unit?:       string;
  lineColor?:  string;
  startDelay?: number;
  /** Chiều cao chart SVG (px) */
  chartHeight?: number;
}

export const LineChartAnimated: React.FC<Props> = ({
  title,
  data,
  unit = "",
  lineColor = COLORS.gold,
  startDelay = 0,
  chartHeight = 280,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - startDelay);

  const titleOpacity  = remap(f, [0, 10], [0, 1]);
  // Tốc độ draw line: 1.5s
  const drawProgress  = remap(f - 8, [0, fps * 1.5], [0, 1]);

  const W        = 900;
  const H        = chartHeight;
  const padL     = 20;
  const padR     = 20;
  const padT     = 20;
  const padB     = 40;
  const plotW    = W - padL - padR;
  const plotH    = H - padT - padB;

  const minVal   = Math.min(...data.map((d) => d.value));
  const maxVal   = Math.max(...data.map((d) => d.value));
  const range    = maxVal - minVal || 1;

  // Tọa độ SVG cho từng điểm
  const points   = data.map((d, i) => ({
    x: padL + (i / (data.length - 1)) * plotW,
    y: padT + plotH - ((d.value - minVal) / range) * plotH,
    ...d,
  }));

  // Polyline path
  const fullPath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  // Số điểm hiển thị dựa vào drawProgress
  const visibleCount = Math.max(2, Math.ceil(drawProgress * (data.length - 1)) + 1);
  const visiblePoints = points.slice(0, visibleCount);
  const partialPath   = visiblePoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  // Area fill (fill dưới đường)
  const areaPath =
    partialPath +
    ` L${visiblePoints[visiblePoints.length - 1].x},${padT + plotH} L${padL},${padT + plotH} Z`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
      <div
        style={{
          fontFamily:  FONTS.body,
          fontSize:    FONT_SIZES.h3,
          fontWeight:  600,
          color:       COLORS.textPrimary,
          opacity:     titleOpacity,
          lineHeight:  1.3,
        }}
      >
        {title}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", overflow: "visible" }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padT + plotH * (1 - t);
          const val = minVal + range * t;
          return (
            <g key={t}>
              <line
                x1={padL} y1={y} x2={W - padR} y2={y}
                stroke={COLORS.border}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={padL - 8} y={y + 5}
                fontSize={18}
                fill={COLORS.textMuted}
                textAnchor="end"
                fontFamily={FONTS.body}
              >
                {Math.round(val)}{unit}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill={`${lineColor}18`} />

        {/* Line */}
        <path
          d={partialPath}
          fill="none"
          stroke={lineColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 6px ${lineColor}66)` }}
        />

        {/* Data point dots */}
        {visiblePoints.map((p, i) => {
          const dotOpacity = remap(drawProgress - i / (data.length - 1), [0, 0.05], [0, 1]);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={6} fill={lineColor} opacity={dotOpacity} />
              <circle cx={p.x} cy={p.y} r={3} fill={COLORS.bg}  opacity={dotOpacity} />
            </g>
          );
        })}

        {/* X labels */}
        {points.map((p, i) => {
          const labelOpacity = remap(drawProgress - i / (data.length - 1), [0, 0.1], [0, 1]);
          return (
            <text
              key={i}
              x={p.x}
              y={H - 4}
              fontSize={18}
              fill={COLORS.textSecondary}
              textAnchor="middle"
              fontFamily={FONTS.body}
              opacity={labelOpacity}
            >
              {p.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
