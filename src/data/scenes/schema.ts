import { z } from "zod";

// ─── Project slugs ──────────────────────────────────────────────────────────────
export const ProjectRefSchema = z.enum([
  "the-habitat",
  "emerald-golf-view",
  "happy-one-mori",
  "vinhomes-hoc-mon",
]);
export type ProjectRef = z.infer<typeof ProjectRefSchema>;

// ─── Visual type content schemas ────────────────────────────────────────────────

const TitleContent = z.object({
  headline:    z.string(),
  subtitle:    z.string().optional(),
  badge:       z.string().optional(),  // label nhỏ phía trên headline (e.g. "CẢNH BÁO")
  bgImage:     z.string().optional(),  // path trong public/images/backgrounds/
});

const BulletItem = z.object({
  text: z.string(),
  icon: z.enum(["check", "x", "warning", "arrow"]).optional(),
});

const BulletListContent = z.object({
  title:   z.string(),
  bullets: z.array(BulletItem),
  bgImage: z.string().optional(),
});

const BarItem = z.object({
  label: z.string(),
  value: z.number(),
  max:   z.number(),
  color: z.string().optional(),  // override màu mặc định từ COLORS.chart
});

const ChartContent = z.object({
  title:  z.string(),
  bars:   z.array(BarItem),
  unit:   z.string().optional(),  // "triệu VNĐ", "%", v.v.
});

const ChecklistContent = z.object({
  title:   z.string(),
  items:   z.array(z.string()),
  ctaText: z.string().optional(),  // text CTA xuất hiện sau checklist
  ctaUrl:  z.string().optional(),
});

const MapPinContent = z.object({
  title:      z.string(),
  location:   z.string(),          // tên khu vực hiển thị trên pin
  highlights: z.array(z.string()), // bullet list bên cạnh map
  bgImage:    z.string().optional(),
});

const ComparisonContent = z.object({
  title: z.string(),
  left:  z.object({ label: z.string(), points: z.array(z.string()) }),
  right: z.object({ label: z.string(), points: z.array(z.string()) }),
});

const ProjectShowcaseContent = z.object({
  highlights:  z.array(z.string()),
  imageIndex:  z.number().optional(),  // dùng ảnh thứ N trong thư mục dự án (mặc định: 0)
  showBadge:   z.string().optional(),  // badge nổi bật (e.g. "Đã có sổ hồng")
});

const NarrationContent = z.object({
  badge:    z.string(),           // label topic (e.g. "HỒ BƠI VÔ CỰC 50M")
  subtitle: z.string().optional(), // text phụ đề hiện cuối màn hình
  bgImage:  z.string().optional(),
});

// ─── Main SceneBeat ─────────────────────────────────────────────────────────────
export const SceneBeatSchema = z.object({
  id:            z.string(),
  startTime:     z.number(), // giây từ đầu video — khớp với voice-over thật
  endTime:       z.number(),
  voiceoverText: z.string(), // câu thoại đúng đoạn này — đối chiếu khi edit timing
  visualType: z.enum([
    "title",
    "bullet-list",
    "project-showcase",
    "chart",
    "checklist",
    "map-pin",
    "comparison-table",
    "narration",
  ]),
  projectRef:   ProjectRefSchema.optional(), // nếu có → tự load ảnh + thông tin dự án
  aiImage:      z.string().optional(),       // path trong public/images/beats/ — override procedural bg
  content:      z.record(z.unknown()),       // typed riêng trong từng component
  transitionIn: z.enum(["fade", "slide", "wipe"]).optional().default("fade"),
});

export type SceneBeat = z.infer<typeof SceneBeatSchema>;

// ─── Typed content helpers — dùng trong components ─────────────────────────────
// Các helper này cast content từ Record<string, unknown> sang đúng shape
export type TitleContentType           = z.infer<typeof TitleContent>;
export type BulletListContentType      = z.infer<typeof BulletListContent>;
export type ChartContentType           = z.infer<typeof ChartContent>;
export type ChecklistContentType       = z.infer<typeof ChecklistContent>;
export type MapPinContentType          = z.infer<typeof MapPinContent>;
export type ComparisonContentType      = z.infer<typeof ComparisonContent>;
export type ProjectShowcaseContentType = z.infer<typeof ProjectShowcaseContent>;
export type NarrationContentType       = z.infer<typeof NarrationContent>;

export function parseTitleContent(c: Record<string, unknown>): TitleContentType {
  return TitleContent.parse(c);
}
export function parseBulletListContent(c: Record<string, unknown>): BulletListContentType {
  return BulletListContent.parse(c);
}
export function parseChartContent(c: Record<string, unknown>): ChartContentType {
  return ChartContent.parse(c);
}
export function parseChecklistContent(c: Record<string, unknown>): ChecklistContentType {
  return ChecklistContent.parse(c);
}
export function parseMapPinContent(c: Record<string, unknown>): MapPinContentType {
  return MapPinContent.parse(c);
}
export function parseComparisonContent(c: Record<string, unknown>): ComparisonContentType {
  return ComparisonContent.parse(c);
}
export function parseProjectShowcaseContent(c: Record<string, unknown>): ProjectShowcaseContentType {
  return ProjectShowcaseContent.parse(c);
}
export function parseNarrationContent(c: Record<string, unknown>): NarrationContentType {
  return NarrationContent.parse(c);
}

// ─── Project metadata registry ──────────────────────────────────────────────────
export const PROJECT_META: Record<ProjectRef, { name: string; tagline: string; imageCount: number }> = {
  "the-habitat": {
    name:       "The Habitat Bình Dương",
    tagline:    "Giai đoạn 3 · Đã có sổ hồng",
    imageCount: 3,
  },
  "emerald-golf-view": {
    name:       "The Emerald Golf View",
    tagline:    "Thuận An · 10% nhận nhà · Đã có sổ hồng",
    imageCount: 3,
  },
  "happy-one-mori": {
    name:       "Happy One Mori",
    tagline:    "Thủ Dầu Một · Căn hộ cao cấp",
    imageCount: 2,
  },
  "vinhomes-hoc-mon": {
    name:       "Vinhomes Hóc Môn",
    tagline:    "Tây TP.HCM · Đón đầu Vành đai 4",
    imageCount: 3,
  },
};
