import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, EASE, FONTS, FONT_SIZES, remap } from "../../design/tokens";

interface Props {
  from?:      number;
  to:         number;
  /** Đơn vị hiển thị sau số (e.g. "%", " triệu", " tỷ") */
  suffix?:    string;
  /** Tiền tố trước số (e.g. "+", "≈") */
  prefix?:    string;
  /** Frame bắt đầu đếm */
  startDelay?: number;
  /** Số frame để đếm từ 0 đến giá trị đích */
  countDuration?: number;
  /** Số chữ số thập phân */
  decimals?:  number;
  color?:     string;
  fontSize?:  number;
  fontFamily?: string;
}

export const AnimatedCounter: React.FC<Props> = ({
  from = 0,
  to,
  suffix = "",
  prefix = "",
  startDelay = 0,
  countDuration,
  decimals = 0,
  color = COLORS.gold,
  fontSize = FONT_SIZES.hero,
  fontFamily = FONTS.display,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = countDuration ?? Math.round(fps * 1.5); // mặc định 1.5s

  const f = Math.max(0, frame - startDelay);
  const value = remap(f, [0, duration], [from, to], EASE.out);

  const formatted =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString("vi-VN");

  return (
    <span
      style={{
        fontFamily,
        fontSize,
        fontWeight: 700,
        color,
        lineHeight: 1,
        letterSpacing: -2,
      }}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
