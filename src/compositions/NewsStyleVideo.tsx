import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Img,
  Audio,
  staticFile,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSans";

const { fontFamily: VN } = loadFont("normal", { weights: ["400", "700", "900"] });

// ─── Palette — OPUS LAND: Xanh rừng + Vàng ───────────────────────────────────
const BG_TOP    = "#B8D9C8"; // xanh sage — gradient góc trên
const BG_CENTER = "#EBF6F0"; // trắng xanh nhạt — trung tâm
const GOLD      = "#C9A84C"; // vàng OPUS LAND — label, divider, highlight, pills
const DARK      = "#0B3D2E"; // xanh rừng đậm — headline
const BODY_COL  = "#1E4435"; // xanh đậm — body text
const MUTED     = "#6D9882"; // xanh muted — caption, credit ảnh
const FPS       = 30;

// Stagger giữa mỗi dòng headline (frames)
const HL_STAGGER = 8;

// ─── Helper: smooth interpolation 0→1 ─────────────────────────────────────────
function smoothIn(
  lf: number,
  startFrame: number,
  duration = 18,
  easing: (t: number) => number = Easing.out(Easing.cubic)
) {
  return interpolate(lf, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
}

// ─── Data types ───────────────────────────────────────────────────────────────
export interface SceneImage {
  src: string;
  caption?: string;
}

export interface SubtitleLine {
  text: string;
  startFrame: number; // local frame within scene
  endFrame: number;
}

export interface SceneData {
  label: string;
  headline: string[];
  headlineGold?: boolean;
  body?: string;
  highlights?: string[];
  bodyAccent?: string;
  pills?: string[];
  image?: SceneImage;
  images?: SceneImage[];
  imageSlideshow?: SceneImage[]; // lướt qua nhiều ảnh, crossfade tự động trong suốt scene — objectFit: contain, luôn hiện trọn ảnh
  subtitles?: SubtitleLine[]; // auto-synced subtitle segments
  durationFrames: number;
}

// ─── Background ───────────────────────────────────────────────────────────────
const NewsBackground: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 140% 72% at 50% 0%, ${BG_TOP} 0%, ${BG_CENTER} 58%)`,
    }}
  >
    <AbsoluteFill
      style={{
        backgroundImage: [
          `linear-gradient(rgba(40,110,70,0.05) 1px, transparent 1px)`,
          `linear-gradient(90deg, rgba(40,110,70,0.05) 1px, transparent 1px)`,
        ].join(","),
        backgroundSize: "130px 130px",
      }}
    />
  </AbsoluteFill>
);

// ─── Highlight helper ─────────────────────────────────────────────────────────
function renderHighlighted(text: string, highlights: string[], color: string) {
  if (!highlights.length) return <>{text}</>;
  const escaped = highlights.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "g");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        highlights.includes(part) ? (
          <span key={i} style={{ color, fontWeight: 700 }}>{part}</span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

// ─── SceneCard — sequential text reveal (label → headline stagger → body) ────
const SceneCard: React.FC<{ scene: SceneData; lf: number }> = ({ scene, lf }) => {
  const numLines  = scene.headline.length;
  const bodyStart = numLines * HL_STAGGER + 14;

  const slideIn = (startF: number, dur = 18, dy = -20) => {
    const p  = smoothIn(lf, startF, dur);
    const ty = Math.round(interpolate(p, [0, 1], [dy, 0]));
    return {
      opacity:            p >= 1 ? 1 : p,
      transform:          `translateY(${ty}px) translateZ(0)`,
      willChange:         "transform, opacity" as const,
      backfaceVisibility: "hidden" as const,
    };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", transform: "translateZ(0)", isolation: "isolate" as const }}>

      {/* LABEL */}
      <span
        style={{
          ...slideIn(0, 14, -12),
          fontFamily:    VN,
          fontSize:      22,
          fontWeight:    700,
          color:         GOLD,
          letterSpacing: 1.5,
          textTransform: "uppercase" as const,
          marginBottom:  22,
        }}
      >
        {scene.label}
      </span>

      {/* HEADLINE — từng dòng xuất hiện lần lượt */}
      {scene.headline.map((line, i) => {
        const isLast     = i === numLines - 1;
        const lineColor  = (scene.headlineGold && isLast) ? GOLD : DARK;
        return (
          <div
            key={i}
            style={{
              ...slideIn(i * HL_STAGGER + 4, 20, -26),
              fontFamily:    VN,
              fontSize:      80,
              fontWeight:    900,
              color:         lineColor,
              lineHeight:    1.2,
              letterSpacing: -0.5,
              textTransform: "uppercase" as const,
            }}
          >
            {line}
          </div>
        );
      })}

      {/* DIVIDER */}
      <div
        style={{
          opacity:      smoothIn(lf, bodyStart - 6, 10),
          width:        36,
          height:       3,
          background:   GOLD,
          borderRadius: 2,
          margin:       "36px 0 36px",
        }}
      />

      {/* PILLS */}
      {scene.pills && scene.pills.length > 0 && (
        <div
          style={{
            opacity:      smoothIn(lf, bodyStart, 14),
            display:      "flex",
            gap:          10,
            flexWrap:     "wrap" as const,
            marginBottom: 16,
          }}
        >
          {scene.pills.map((pill, i) => (
            <span
              key={i}
              style={{
                fontFamily:    VN,
                fontSize:      20,
                fontWeight:    700,
                color:         GOLD,
                border:        `1.5px solid ${GOLD}`,
                borderRadius:  24,
                padding:       "6px 18px",
                textTransform: "uppercase" as const,
                letterSpacing: 0.5,
              }}
            >
              {pill}
            </span>
          ))}
        </div>
      )}

      {/* BODY */}
      {scene.body && (
        <p
          style={{
            ...slideIn(bodyStart, 20, -10),
            fontFamily: VN,
            fontSize:   28,
            fontWeight: 400,
            color:      BODY_COL,
            lineHeight: 1.85,
            margin:     "0 0 8px",
          }}
        >
          {renderHighlighted(scene.body, scene.highlights ?? [], GOLD)}
        </p>
      )}

      {/* BODY ACCENT — đoạn vàng đậm */}
      {scene.bodyAccent && (
        <p
          style={{
            ...slideIn(bodyStart + 6, 18, -10),
            fontFamily: VN,
            fontSize:   26,
            fontWeight: 700,
            color:      GOLD,
            lineHeight: 1.55,
            margin:     0,
          }}
        >
          {scene.bodyAccent}
        </p>
      )}
    </div>
  );
};

// ─── ImageCard — wipe trái→phải + Ken Burns zoom chậm ────────────────────────
const ImageCard: React.FC<{
  image: SceneImage;
  lf: number;
  delay?: number;
  totalFrames?: number;
}> = ({ image, lf, delay = 0, totalFrames = 450 }) => {
  const localLF = Math.max(0, lf - delay);

  // Wipe reveal: clip từ phải thu dần về 0 trong 26 frames
  const wipe     = smoothIn(localLF, 0, 26);
  const clipRight = ((1 - wipe) * 100).toFixed(2);

  // Ken Burns: zoom chậm từ 1.0 → 1.08 suốt cả scene
  const kb = interpolate(lf, [delay, totalFrames], [1.0, 1.08], {
    extrapolateLeft:  "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div>
      <div
        style={{
          clipPath:     `inset(0 ${clipRight}% 0 0 round 12px)`,
          overflow:     "hidden",
          borderRadius: 12,
          background:   "rgba(255,255,255,0.5)",
        }}
      >
        {/* objectFit: contain — luôn hiện trọn ảnh, không cắt mất phần trên/dưới dù ảnh vuông hay ngang */}
        <Img
          src={staticFile(image.src)}
          style={{
            width:           "100%",
            display:         "block",
            objectFit:       "contain" as const,
            maxHeight:       620,
            transform:       `scale(${kb.toFixed(4)})`,
            transformOrigin: "center center",
          }}
        />
      </div>
      {image.caption && (
        <p
          style={{
            opacity:       smoothIn(localLF, 26, 12),
            fontFamily:    VN,
            fontSize:      18,
            fontWeight:    400,
            color:         MUTED,
            margin:        "6px 0 0",
            letterSpacing: 0.3,
          }}
        >
          Ảnh: {image.caption}
        </p>
      )}
    </div>
  );
};

// ─── SlideshowCard — lướt qua nhiều ảnh, crossfade tự động ───────────────────
const SlideshowCard: React.FC<{
  images: SceneImage[];
  lf: number;
  delay?: number;
  totalFrames?: number;
}> = ({ images, lf, delay = 0, totalFrames = 450 }) => {
  const localLF = Math.max(0, lf - delay);
  const n = Math.max(1, images.length);
  const activeSpan = Math.max(30, totalFrames - delay);
  const slideFrames = activeSpan / n;
  const CROSSFADE = 14; // frames chồng mờ giữa 2 ảnh

  const idx     = Math.min(n - 1, Math.floor(localLF / slideFrames));
  const nextIdx = Math.min(n - 1, idx + 1);
  const posInSlide = localLF - idx * slideFrames;

  const fadeStart   = slideFrames - CROSSFADE;
  const crossOpacity = idx === nextIdx
    ? 0
    : interpolate(posInSlide, [fadeStart, slideFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const wipe      = smoothIn(localLF, 0, 26);
  const clipRight = ((1 - wipe) * 100).toFixed(2);

  return (
    <div>
      <div
        style={{
          position:     "relative" as const,
          height:       480,
          background:   "rgba(255,255,255,0.5)",
          clipPath:     `inset(0 ${clipRight}% 0 0 round 12px)`,
          overflow:     "hidden",
          borderRadius: 12,
        }}
      >
        {/* objectFit: contain — luôn hiện trọn ảnh, không cắt mất phần trên/dưới dù ảnh vuông hay ngang */}
        <Img
          src={staticFile(images[idx].src)}
          style={{
            position:        "absolute" as const,
            inset:            0,
            width:           "100%",
            height:          "100%",
            objectFit:       "contain" as const,
          }}
        />
        {crossOpacity > 0 && (
          <Img
            src={staticFile(images[nextIdx].src)}
            style={{
              position:        "absolute" as const,
              inset:            0,
              width:           "100%",
              height:          "100%",
              objectFit:       "contain" as const,
              opacity:          crossOpacity,
            }}
          />
        )}
      </div>
      {images[idx].caption && (
        <p
          style={{
            opacity:       smoothIn(localLF, 26, 12),
            fontFamily:    VN,
            fontSize:      18,
            fontWeight:    400,
            color:         MUTED,
            margin:        "6px 0 0",
            letterSpacing: 0.3,
          }}
        >
          Ảnh: {images[idx].caption}
        </p>
      )}
    </div>
  );
};

// ─── SubtitleBar — tự động sync theo giọng đọc ───────────────────────────────
const SubtitleBar: React.FC<{ subtitles?: SubtitleLine[]; lf: number }> = ({ subtitles, lf }) => {
  if (!subtitles || subtitles.length === 0) return null;

  const sub = subtitles.find(s => lf >= s.startFrame && lf <= s.endFrame);
  if (!sub) return null;

  const opacity = Math.min(
    interpolate(lf, [sub.startFrame, sub.startFrame + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(lf, [sub.endFrame - 8, sub.endFrame],    [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );

  return (
    <div
      style={{
        position:       "absolute" as const,
        bottom:         340,
        left:           80,
        right:          80,
        display:        "flex",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          background:   "rgba(255, 255, 255, 0.82)",
          borderRadius: 10,
          padding:      "16px 30px",
          maxWidth:     "92%",
          boxShadow:    "0 2px 12px rgba(0,0,0,0.12)",
        }}
      >
        <p
          style={{
            fontFamily: VN,
            fontSize:   30,
            fontWeight: 500,
            color:      DARK,
            textAlign:  "center" as const,
            lineHeight: 1.5,
            margin:     0,
          }}
        >
          {sub.text}
        </p>
      </div>
    </div>
  );
};

// ─── NewsScene ────────────────────────────────────────────────────────────────
const NewsScene: React.FC<{ scene: SceneData }> = ({ scene }) => {
  const lf         = useCurrentFrame();
  const imageDelay = scene.headline.length * HL_STAGGER + 20;

  // Progress bar — dải vàng lấp đầy từ trái theo thời gian
  const progressPct = interpolate(lf, [0, scene.durationFrames], [0, 100], {
    extrapolateLeft:  "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Text block */}
      <div style={{ padding: "180px 80px 0", transform: "translateZ(0)" }}>
        <SceneCard scene={scene} lf={lf} />
      </div>

      {/* Single image — anchored at 40% vertical = ~768px */}
      {scene.image && !scene.images && !scene.imageSlideshow && (
        <div style={{ position: "absolute" as const, top: "40%", left: 80, right: 80 }}>
          <ImageCard
            image={scene.image}
            lf={lf}
            delay={imageDelay}
            totalFrames={scene.durationFrames}
          />
        </div>
      )}

      {/* Slideshow — lướt qua nhiều ảnh, crossfade tự động */}
      {scene.imageSlideshow && scene.imageSlideshow.length > 0 && (
        <div style={{ position: "absolute" as const, top: "40%", left: 80, right: 80 }}>
          <SlideshowCard
            images={scene.imageSlideshow}
            lf={lf}
            delay={imageDelay}
            totalFrames={scene.durationFrames}
          />
        </div>
      )}

      {/* 2-column image grid */}
      {scene.images && scene.images.length > 0 && (
        <div
          style={{
            position: "absolute" as const,
            top:      "44%",
            left:     80,
            right:    80,
            display:  "flex",
            gap:      16,
          }}
        >
          {scene.images.map((img, i) => (
            <div key={i} style={{ flex: 1 }}>
              <ImageCard
                image={img}
                lf={lf}
                delay={imageDelay + i * 10}
                totalFrames={scene.durationFrames}
              />
            </div>
          ))}
        </div>
      )}

      {/* Subtitle — tự động sync theo giọng */}
      <SubtitleBar subtitles={scene.subtitles} lf={lf} />

      {/* Progress bar — dải vàng mảnh ở đáy */}
      <div
        style={{
          position:   "absolute" as const,
          bottom:     0,
          left:       0,
          right:      0,
          height:     3,
          background: `rgba(201,168,76,0.18)`,
        }}
      >
        <div
          style={{
            height:     "100%",
            width:      `${progressPct.toFixed(2)}%`,
            background: GOLD,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ─── SCENES DATA ──────────────────────────────────────────────────────────────
//
//   label       → "• DANH MỤC · NGUỒN"
//   headline    → mỗi phần tử = 1 dòng, xuất hiện lần lượt
//   headlineGold→ true → dòng cuối màu vàng
//   body        → đoạn mô tả (ngắn, 1–3 câu)
//   highlights  → từ/cụm trong body sẽ được tô vàng
//   bodyAccent  → đoạn vàng-đậm (disclaimer)
//   pills       → row tags
//   image       → { src, caption } — một ảnh full width
//   images      → 2-col grid — mảng 2 SceneImage
//   captionText → phụ đề TTS phía dưới
//   captionBold → từ in đậm trong phụ đề

// Timing lấy từ Whisper word-level timestamps (public/audio/voiceover-monrei-saigon.mp3)
// Scene boundaries = midpoint giữa 2 câu (silence thực tế trong giọng đọc)
export const NEWS_SCENES: SceneData[] = [
  // ── SCENE 1 ──
  {
    label:    "• TỔNG QUAN · CAFELAND",
    headline: ["VÀNH ĐAI 4 & 5", "TP.HCM TĂNG TỐC"],
    headlineGold: true,
    body:     "Sở Xây dựng TP.HCM lấy ý kiến quy hoạch Vành đai 4 và Vành đai 5, hai trục cao tốc đô thị lớn kết nối TP.HCM với Đồng Nai và Tây Ninh.",
    highlights: ["Vành đai 4 và Vành đai 5"],
    pills:    ["QUY HOẠCH", "KẾT NỐI VÙNG"],
    image:    { src: "images/vanhdai45-thuthiem4-1.png", caption: "Nguồn: CafeLand" },
    subtitles: [
      { text: "Sở Xây dựng TP.HCM vừa lấy ý kiến các địa", startFrame: 0, endFrame: 80 },
      { text: "phương về quy hoạch Vành đai 4 và Vành đai 5", startFrame: 80, endFrame: 167 },
      { text: "TP.HCM. Đây là hai trục cao tốc đô thị quy", startFrame: 167, endFrame: 249 },
      { text: "mô lớn, kết nối TP.HCM với Đồng Nai và Tây Ninh.", startFrame: 249, endFrame: 343 },
    ],
    durationFrames: 343,
  },
  // ── SCENE 2 ──
  {
    label:    "• VÀNH ĐAI 4",
    headline: ["192KM", "8 LÀN XE"],
    headlineGold: true,
    body:     "Đi theo Quốc lộ 56 và 56B, nối Vành đai 5 tại Biên Hòa - Vũng Tàu đến Gò Dầu. Tốc độ 80-100km/h, bề rộng 62-80m.",
    highlights: ["192km", "80-100km/h"],
    pills:    ["QL56", "QL56B"],
    image:    { src: "images/vanhdai45-thuthiem4-2.png", caption: "Nguồn: CafeLand" },
    subtitles: [
      { text: "Vành đai 4 dài khoảng 192km, đi theo Quốc lộ", startFrame: 0, endFrame: 103 },
      { text: "56 và 56B, nối từ Vành đai 5 tại Biên Hòa -", startFrame: 103, endFrame: 204 },
      { text: "Vũng Tàu đến khu vực Gò Dầu. Tuyến thiết kế", startFrame: 204, endFrame: 305 },
      { text: "8 làn xe, tốc độ 80 đến 100km/h, bề rộng 62 đến 80 mét.", startFrame: 305, endFrame: 434 },
    ],
    durationFrames: 434,
  },
  // ── SCENE 3 ──
  {
    label:    "• VÀNH ĐAI 5",
    headline: ["440-487KM", "6-8 LÀN XE"],
    body:     "Cao tốc đô thị tốc độ 100km/h, bề rộng tối thiểu 74,5m. Hai phương án hướng tuyến, kết nối nhiều tỉnh phía Nam.",
    highlights: ["100km/h", "74,5m"],
    pills:    ["2 PHƯƠNG ÁN"],
    image:    { src: "images/vanhdai45-thuthiem4-3.png", caption: "Nguồn: CafeLand" },
    subtitles: [
      { text: "Vành đai 5 được nghiên cứu theo hướng cao", startFrame: 0, endFrame: 93 },
      { text: "tốc đô thị 6 đến 8 làn xe, tốc độ 100km/h,", startFrame: 93, endFrame: 189 },
      { text: "bề rộng tối thiểu 74,5 mét. Tuyến có hai", startFrame: 189, endFrame: 280 },
      { text: "phương án hướng đi, dài từ 440 đến 487km,", startFrame: 280, endFrame: 373 },
      { text: "kết nối nhiều tỉnh phía Nam.", startFrame: 373, endFrame: 437 },
    ],
    durationFrames: 437,
  },
  // ── SCENE 4 ──
  {
    label:    "• CẦU THỦ THIÊM 4",
    headline: ["8 LÀN XE", "5.063 TỶ ĐỒNG"],
    headlineGold: true,
    body:     "TP.HCM đã phê duyệt phương án kiến trúc. Cầu dài hơn 1,6km trong tổng chiều dài 2,16km, nối Tân Thuận - An Khánh.",
    highlights: ["5.063 tỷ đồng"],
    pills:    ["ĐÃ PHÊ DUYỆT KIẾN TRÚC"],
    image:    { src: "images/vanhdai45-thuthiem4-4.png", caption: "Nguồn: CafeLand" },
    subtitles: [
      { text: "Cùng lúc đó, cầu Thủ Thiêm 4 có bước tiến", startFrame: 0, endFrame: 91 },
      { text: "mới khi TP.HCM phê duyệt phương án kiến", startFrame: 91, endFrame: 177 },
      { text: "trúc. Cầu dài hơn 1,6km trong tổng chiều dài", startFrame: 177, endFrame: 275 },
      { text: "2,16km, thiết kế 8 làn xe, tổng vốn đầu tư", startFrame: 275, endFrame: 368 },
      { text: "hơn 5.063 tỷ đồng.", startFrame: 368, endFrame: 408 },
    ],
    durationFrames: 408,
  },
  // ── SCENE 5 ──
  {
    label:    "• KẾT NỐI VÙNG",
    headline: ["NGUYỄN VĂN LINH", "→ NGUYỄN CƠ THẠCH"],
    body:     "Cầu Thủ Thiêm 4 sẽ tăng kết nối giữa khu Nam Sài Gòn và Khu đô thị mới Thủ Thiêm.",
    highlights: ["khu Nam Sài Gòn", "Thủ Thiêm"],
    image:    { src: "images/vanhdai45-thuthiem4-4.png", caption: "Nguồn: CafeLand" },
    subtitles: [
      { text: "Khi hoàn thành, cầu Thủ Thiêm 4 sẽ nối trực", startFrame: 0, endFrame: 71 },
      { text: "tiếp đường Nguyễn Văn Linh với Nguyễn Cơ", startFrame: 71, endFrame: 137 },
      { text: "Thạch, tăng kết nối giữa khu Nam Sài Gòn và", startFrame: 137, endFrame: 209 },
      { text: "Khu đô thị mới Thủ Thiêm.", startFrame: 209, endFrame: 250 },
    ],
    durationFrames: 250,
  },
  // ── SCENE 6 ──
  {
    label:    "• GÓC NHÌN BĐS",
    headline: ["HẠ TẦNG TĂNG TỐC", "CƠ HỘI CHO BĐS"],
    headlineGold: true,
    body:     "Ba dự án hạ tầng lớn cùng lúc tăng tốc là tín hiệu tích cực cho bất động sản dọc các trục kết nối này.",
    highlights: ["tín hiệu tích cực"],
    image:    { src: "images/vanhdai45-thuthiem4-1.png", caption: "Nguồn: CafeLand" },
    subtitles: [
      { text: "Ba dự án hạ tầng cùng lúc tăng tốc cho thấy", startFrame: 0, endFrame: 74 },
      { text: "TP.HCM đang dồn lực hoàn thiện mạng lưới", startFrame: 74, endFrame: 143 },
      { text: "vành đai và cầu vượt sông. Đây là tín hiệu", startFrame: 143, endFrame: 215 },
      { text: "tích cực cho bất động sản dọc các trục kết", startFrame: 215, endFrame: 287 },
      { text: "nối này trong thời gian tới.", startFrame: 287, endFrame: 335 },
    ],
    durationFrames: 335,
  },
];

export const NEWS_TOTAL_FRAMES = NEWS_SCENES.reduce((s, sc) => s + sc.durationFrames, 0);
// 4092 frames = 136.4s

// ─── NewsStyleVideo — Main composition ───────────────────────────────────────
export const NewsStyleVideo: React.FC = () => {
  let cursor = 0;
  const starts = NEWS_SCENES.map(s => {
    const start = cursor;
    cursor += s.durationFrames;
    return start;
  });

  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/voiceover-vanhdai45-thuthiem4.mp3")} />
      <NewsBackground />
      {NEWS_SCENES.map((scene, i) => (
        <Sequence
          key={i}
          from={starts[i]}
          durationInFrames={scene.durationFrames}
          layout="none"
        >
          <NewsScene scene={scene} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
