import { Easing, interpolate } from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

// Load fonts once at module level — Remotion caches these
const { fontFamily: FONT_DISPLAY } = loadPlayfair();
const { fontFamily: FONT_BODY } = loadInter();

// ─── Colour palette ────────────────────────────────────────────────────────────
export const COLORS = {
  // Backgrounds
  bg:          "#0D1117",   // deep navy — thống nhất toàn hệ thống
  surface:     "#161B22",   // surface card
  surfaceHi:   "#21262D",   // elevated card / hover
  border:      "#30363D",   // border nhẹ

  // Brand / accent
  gold:        "#C9A227",   // vàng đồng — CTA, số liệu
  goldLight:   "#E8C547",   // highlight khi hover / emphasis
  goldDim:     "#8A6F1A",   // gold mờ cho underline / divider

  // Status
  danger:      "#E85D5D",   // rủi ro, cảnh báo
  warning:     "#E8A23D",   // lưu ý vừa phải
  success:     "#3DD68C",   // xác nhận tích cực (sổ hồng, hoàn thành)

  // Text
  textPrimary:   "#F0EAD6", // trắng ngà — text chính, không chói
  textSecondary: "#8B949E", // phụ đề, mô tả
  textMuted:     "#484F58", // gợi ý, watermark

  // Chart colors — thứ tự dùng lần lượt
  chart: ["#C9A227", "#E8A23D", "#3DD68C", "#60A5FA", "#E85D5D"],
} as const;

// ─── Typography ────────────────────────────────────────────────────────────────
export const FONTS = {
  display: FONT_DISPLAY, // Playfair Display — tiêu đề, số lớn
  body:    FONT_BODY,    // Inter — phụ đề, số liệu, bullet
} as const;

export const FONT_SIZES = {
  hero:    120,
  h1:      72,
  h2:      52,
  h3:      38,
  body:    30,
  caption: 24,
  tiny:    20,
} as const;

// ─── Spacing ───────────────────────────────────────────────────────────────────
export const SPACE = {
  xs:  12,
  sm:  24,
  md:  40,
  lg:  64,
  xl:  96,
  xxl: 128,
} as const;

// ─── Video format ──────────────────────────────────────────────────────────────
export const VIDEO = {
  width:  1080,
  height: 1920,
  fps:    30,
} as const;

// ─── Transition durations (frames) ─────────────────────────────────────────────
export const TRANSITION = {
  fast:   8,   // ~0.27s
  normal: 12,  // 0.4s
  slow:   20,  // 0.67s
} as const;

// ─── Easing presets ────────────────────────────────────────────────────────────
export const EASE = {
  out:    Easing.out(Easing.cubic),
  inOut:  Easing.inOut(Easing.cubic),
  spring: Easing.out(Easing.back(1.2)),
} as const;

// ─── Color grade overlay ───────────────────────────────────────────────────────
// Dùng chung cho mọi ảnh nền — đảm bảo tông màu đồng nhất xuyên suốt hệ thống.
// gradient từ navy tối phía dưới + vignette nhẹ xung quanh.
export function applyGradeOverlay(): React.CSSProperties {
  return {
    position:        "absolute",
    inset:           0,
    background: [
      // Vignette tối 4 góc
      `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)`,
      // Gradient navy từ dưới lên — text đặt ở dưới luôn đọc được
      `linear-gradient(to top, ${COLORS.bg}F0 0%, ${COLORS.bg}80 35%, transparent 65%)`,
      // Tint navy nhẹ overlay toàn màn hình
      `linear-gradient(180deg, rgba(13,17,23,0.3) 0%, rgba(13,17,23,0.15) 100%)`,
    ].join(", "),
    pointerEvents: "none",
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
/** Clamp interpolate — shorthand hay dùng */
export function remap(
  value: number,
  inputRange: [number, number],
  outputRange: [number, number],
  easing?: (t: number) => number
): number {
  return interpolate(value, inputRange, outputRange, {
    extrapolateLeft:  "clamp",
    extrapolateRight: "clamp",
    easing,
  });
}
