import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBVP } from "@remotion/google-fonts/BeVietnamPro";
import { BODY_CAPS } from "../data/prive-body-caps";

/**
 * The Privé Tháp 9 — bản dọc đầy đủ (~5 phút), chuyển từ video YouTube ngang.
 * 1080×1920 · 30fps · giọng thật Minh Hoàng (audio ghép ngoài, không nhạc/SFX).
 * Phong cách đã duyệt ở PriveVertical (30s): serif vàng–trắng, nền video TVC, chữ vén mượt.
 */
const { fontFamily: SERIF } = loadPlayfair("normal", { weights: ["500", "600", "700"], subsets: ["vietnamese", "latin"] });
const { fontFamily: SERIF_I } = loadPlayfair("italic", { weights: ["500", "600"], subsets: ["vietnamese", "latin"] });
const { fontFamily: SANS } = loadBVP("normal", { weights: ["400", "500", "600"], subsets: ["vietnamese", "latin"] });

const FPS = 30;
const NAVY = "11,24,46";
const GOLD = "#E3C27A";
const WHITE = "#FFFFFF";
const SOFT = "rgba(255,255,255,0.8)";
const DIM = "rgba(255,255,255,0.55)";

// ── timeline ─────────────────────────────────────────────────────────────────
const HOOK = (s: number) => 0.3 + (s - 189.85); // clean voice 189.85 → 197.45
const FACE0 = 8.15; // face_intro 0 → 7.5
/** clean voice time → output time (bỏ đoạn giá 187–199.6 đã dùng ở hook) */
const B = (s: number) => (s < 187 ? 15.9 + s : 202.96 + (s - 199.6));
const OUT0 = 290.3; // face_outro (15.06s)
export const PF_TOTAL_SEC = 306.6;
export const PF_TOTAL_FRAMES = Math.round(PF_TOTAL_SEC * FPS);

type R = readonly [number, number];
const SC: Record<string, R> = {
  hook: [0, 8.0],
  face: [8.4, 15.75],
  loc1: [15.75, B(11.3)],
  loc2: [B(11.3), B(25.2)],
  infra1: [B(25.2), B(43.2)],
  infra2: [B(43.2), B(58.4)],
  amen: [B(58.4), B(85.6)],
  payIntro: [B(85.6), B(99.0)],
  pay: [B(99.0), B(128.1)],
  s24: [B(128.1), B(167.3)],
  cum: [B(167.3), B(186.9)],
  save: [B(199.4), B(206.0)],
  time: [B(206.0), B(218.6)],
  t9a: [B(218.6), B(231.1)],
  t9b1: [B(231.1), B(244.4)],
  t9b2: [B(244.4), B(251.3)],
  hand: [B(251.3), B(263.7)],
  partner: [B(263.7), OUT0 - 0.2],
  outro: [OUT0, PF_TOTAL_SEC],
};

const CAPS: [number, number, string][] = [
  [HOOK(189.85), HOOK(193.45), "1 căn 2 phòng ngủ sau khi áp hết chiết khấu 23,5%"],
  [HOOK(193.45), HOOK(197.45), "giá chỉ còn khoảng 7,5 tới 8,5 tỷ, chưa VAT"],
  [FACE0 + 0.0, FACE0 + 4.45, "Xin chào quý anh chị, hôm nay Hoàng sẽ đưa anh chị đi một vòng đầy đủ về dự án The Privé"],
  [FACE0 + 4.45, FACE0 + 7.5, "dự án đang là tâm điểm của khu Đông TP. Hồ Chí Minh"],
  ...BODY_CAPS,
  [OUT0 + 0.0, OUT0 + 5.0, "Và đó là toàn bộ thông tin quan trọng nhất về The Privé mà Hoàng muốn chia sẻ tới anh chị."],
  [OUT0 + 5.0, OUT0 + 9.67, "Nếu anh chị đang quan tâm bảng giá giai đoạn 2 hoặc muốn tham quan thực tế dự án,"],
  [OUT0 + 9.67, OUT0 + 10.84, "hãy nhắn tin cho Hoàng."],
  [OUT0 + 10.84, OUT0 + 13.2, "Hoàng sẽ tư vấn cụ thể theo nhu cầu của anh chị."],
  [OUT0 + 13.2, OUT0 + 15.2, "Hẹn gặp anh chị ở video tiếp theo!"],
];

// ── helpers ──────────────────────────────────────────────────────────────────
const useT = () => useCurrentFrame() / FPS;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const prog = (t: number, at: number, dur = 0.8) => interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing: ease });
const sceneO = (t: number, [a, b]: R) => interpolate(t, [a - 0.25, a + 0.15, b - 0.2, b + 0.15], [0, 1, 1, 0], clamp);
const live = (t: number, [a, b]: R) => t > a - 0.3 && t < b + 0.2;
const vn = (v: number, d = 1) => v.toFixed(d).replace(".", ",").replace(/,0$/, "");

const Reveal: React.FC<{ at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, dur = 0.9, children, style }) => {
  const p = prog(useT(), at, dur);
  return (
    <div style={{ overflow: "hidden", paddingTop: 10, paddingBottom: 14, ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)`, opacity: Math.min(1, p * 1.6) }}>{children}</div>
    </div>
  );
};
const Fade: React.FC<{ at: number; dur?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, dur = 0.7, y = 18, children, style }) => {
  const p = prog(useT(), at, dur);
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * y}px)`, ...style }}>{children}</div>;
};
const GoldRule: React.FC<{ at: number; width?: number; style?: React.CSSProperties }> = ({ at, width = 120, style }) => (
  <div style={{ height: 2, width: width * prog(useT(), at, 1.0), background: GOLD, ...style }} />
);
const Label: React.FC<{ at: number; text: string }> = ({ at, text }) => (
  <Fade at={at}>
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: 6, color: GOLD }}>{text}</div>
  </Fade>
);
const Title: React.FC<{ at: number; a: string; b?: string; size?: number }> = ({ at, a, b, size = 64 }) => (
  <Reveal at={at} style={{ marginTop: 2 }}>
    <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: size, color: WHITE, lineHeight: 1.15 }}>
      {a} {b && <span style={{ fontFamily: SERIF_I, color: GOLD }}>{b}</span>}
    </div>
  </Reveal>
);

// ── background video ─────────────────────────────────────────────────────────
const LEN: Record<string, number> = {
  living: 8.9, river: 3.4, station: 4.0, nightpen: 3.7, garden_aerial: 5.9, v4_nrc: 8.2, v4_connect: 18.0, metro_view: 1.6,
  sunset_river: 2.2, city_road: 2.2, pool_aerial: 4.6, pool_night: 2.2, park_river: 1.6, banquet: 2.6, sports: 2.3, golf: 1.6,
  gym: 1.1, celebrate: 3.8, lobby: 1.8, lobby2: 2.6, bedroom: 2.5, dining: 1.8, kitchen: 4.6, towers_glow: 1.5, night_city: 3.4,
  river_park2: 2.2, tower_up: 1.6,
};
const rateFor = (src: string, span: number) => Math.min(1, (LEN[src] - 0.15) / (span + 0.9));

const Clip: React.FC<{ src: string; a: number; b: number; x?: number; z0?: number; z1?: number }> = ({ src, a, b, x = 50, z0 = 1.0, z1 = 1.06 }) => {
  const t = useT();
  if (t < a - 0.5 || t > b + 0.5) return null;
  const o = interpolate(t, [a - 0.35, a + 0.1, b - 0.1, b + 0.35], [0, 1, 1, 0], clamp);
  const z = interpolate(t, [a - 0.35, b + 0.35], [z0, z1], clamp);
  return (
    <Sequence from={Math.round(Math.max(0, a - 0.45) * FPS)} layout="none">
      <AbsoluteFill style={{ opacity: a <= 0 && t < b ? 1 : o }}>
        <OffthreadVideo
          src={staticFile(`video/prive/${src}.mp4`)}
          muted
          playbackRate={rateFor(src, b - a)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${x}% 50%`, transform: `scale(${z})` }}
        />
      </AbsoluteFill>
    </Sequence>
  );
};

type BG = [string, number, number, number?];
const BGS: BG[] = [
  ["living", 0, SC.hook[1], 50],
  ["river", SC.loc1[0], B(3.3), 70],
  ["station", B(3.3), B(6.1), 45],
  ["nightpen", B(6.1), B(11.3), 55],
  ["garden_aerial", B(11.3), B(19.0), 50],
  ["sunset_river", B(19.0), B(25.2), 60],
  ["city_road", B(25.2), B(33.8), 40],
  ["station", B(33.8), B(39.4), 45],
  ["metro_view", B(39.4), B(43.2), 45],
  ["night_city", B(43.2), B(50.3), 50],
  ["river_park2", B(50.3), B(58.4), 50],
  ["pool_aerial", B(58.4), B(66.8), 50],
  ["golf", B(66.8), B(69.0), 50],
  ["gym", B(69.0), B(71.2), 50],
  ["pool_night", B(71.2), B(75.3), 50],
  ["park_river", B(75.3), B(77.7), 30],
  ["banquet", B(77.7), B(79.0), 50],
  ["sports", B(79.0), B(81.0), 40],
  ["celebrate", B(81.0), B(85.6), 55],
  ["lobby2", B(85.6), B(92.0), 50],
  ["lobby", B(92.0), B(99.0), 50],
  ["living", B(99.0), B(108.4), 50],
  ["kitchen", B(108.4), B(119.0), 50],
  ["dining", B(119.0), B(128.1), 50],
  ["towers_glow", B(128.1), B(136.2), 50],
  ["bedroom", B(136.2), B(146.4), 50],
  ["river", B(146.4), B(158.2), 70],
  ["sunset_river", B(158.2), B(167.3), 60],
  ["garden_aerial", B(167.3), B(176.0), 50],
  ["pool_night", B(176.0), B(181.5), 50],
  ["park_river", B(181.5), B(186.9), 30],
  ["nightpen", B(199.4), B(206.0), 55],
  ["night_city", B(206.0), B(218.6), 50],
  ["river", B(218.6), B(231.1), 70],
  ["bedroom", B(231.1), B(244.4), 50],
  ["living", B(244.4), B(251.3), 50],
  ["kitchen", B(251.3), B(257.8), 50],
  ["lobby2", B(257.8), B(263.7), 50],
  ["tower_up", B(263.7), B(269.2), 50],
  ["towers_glow", B(269.2), B(277.3), 50],
  ["nightpen", B(277.3), OUT0 - 0.2, 55],
];

const Shade: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, rgba(${NAVY},0.55) 0%, rgba(${NAVY},0.05) 15%, rgba(${NAVY},0) 34%, rgba(${NAVY},0.55) 48%, rgba(${NAVY},0.9) 59%, rgba(${NAVY},0.96) 100%)`,
    }}
  />
);

const Brand: React.FC = () => {
  const t = useT();
  const hide = t > SC.face[0] - 0.2 && t < SC.face[1] + 0.2 ? 1 - sceneO(t, SC.face) : 1;
  const o = Math.min(interpolate(t, [0.2, 1.0, OUT0 - 0.3, OUT0], [0, 1, 1, 0], clamp), hide);
  return (
    <div style={{ position: "absolute", top: 104, left: 72, opacity: o }}>
      <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 40, letterSpacing: 10, color: WHITE }}>THE PRIVÉ</div>
      <div style={{ height: 1, width: 64, background: GOLD, margin: "12px 0 10px" }} />
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: 5, color: GOLD }}>THÁP 9 · BÁN ĐẢO 3 MẶT SÔNG</div>
    </div>
  );
};

// ── generic panel ────────────────────────────────────────────────────────────
type Item = { at: number; main: string; sub?: string };
type Stat = { at: number; value: string; label: string };
type CardSpec =
  | { kind: "img"; src: string; top?: number; h?: number; fit?: "cover" | "contain"; zoom?: { x: number; y: number; to: number; a: number; b: number }; pin?: { x: number; y: number; at: number } }
  | { kind: "video"; src: string; top?: number; h?: number }
  | { kind: "slides"; slides: { src: string; at: number }[]; top?: number; h?: number };

const Card: React.FC<{ r: R; c: CardSpec }> = ({ r, c }) => {
  const t = useT();
  const top = c.top ?? 330;
  const h = c.h ?? 527;
  const p = prog(t, r[0] + 0.05, 0.9);
  let inner: React.ReactNode = null;
  if (c.kind === "img") {
    const z = c.zoom ? 1 + (c.zoom.to - 1) * interpolate(t, [c.zoom.a, c.zoom.b], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 1 + 0.05 * prog(t, r[0], r[1] - r[0]);
    const origin = c.zoom ? `${c.zoom.x * 100}% ${c.zoom.y * 100}%` : "50% 50%";
    inner = (
      <>
        <Img src={staticFile(`images/prive235/${c.src}`)} style={{ width: "100%", height: "100%", objectFit: c.fit ?? "cover", transform: `scale(${z})`, transformOrigin: origin }} />
        {c.pin && t > c.pin.at && <Pin x={c.pin.x} y={c.pin.y} at={c.pin.at} />}
      </>
    );
  } else if (c.kind === "video") {
    inner = (
      <Sequence from={Math.round(Math.max(0, r[0] - 0.4) * FPS)} layout="none">
        <OffthreadVideo src={staticFile(`video/prive/${c.src}.mp4`)} muted playbackRate={rateFor(c.src, r[1] - r[0])} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Sequence>
    );
  } else {
    inner = (
      <>
        {c.slides.map((s, i) => {
          const next = c.slides[i + 1]?.at ?? r[1] + 1;
          const o = interpolate(t, [s.at - 0.4, s.at, next - 0.4, next], [0, 1, 1, 0], clamp);
          if (o <= 0 && !(i === 0 && t < s.at)) return null;
          return (
            <AbsoluteFill key={i} style={{ opacity: i === 0 && t < s.at ? 1 : o }}>
              <Img src={staticFile(`images/prive235/${s.src}`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1 + 0.05 * prog(t, s.at, 5)})` }} />
            </AbsoluteFill>
          );
        })}
      </>
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 72,
        width: 936,
        height: h,
        overflow: "hidden",
        border: `1.5px solid ${GOLD}`,
        background: `rgb(${NAVY})`,
        boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      {inner}
    </div>
  );
};

const Pin: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const t = useT();
  const pulse = (((t - at) * 1.1) % 1 + 1) % 1;
  return (
    <>
      <div style={{ position: "absolute", left: x - 70 * pulse, top: y - 70 * pulse, width: 140 * pulse, height: 140 * pulse, borderRadius: "50%", border: `3px solid ${GOLD}`, opacity: 1 - pulse }} />
      <div style={{ position: "absolute", left: x - 12, top: y - 12, width: 24, height: 24, borderRadius: 12, background: GOLD, boxShadow: `0 0 20px ${GOLD}` }} />
    </>
  );
};

const Panel: React.FC<{ r: R; label: string; title: [string, string?]; card?: CardSpec; items?: Item[]; stats?: Stat[]; top?: number; children?: React.ReactNode }> = ({
  r,
  label,
  title,
  card,
  items = [],
  stats = [],
  top = 1000,
  children,
}) => {
  const t = useT();
  if (!live(t, r)) return null;
  return (
    <AbsoluteFill style={{ opacity: sceneO(t, r) }}>
      {card && <Card r={r} c={card} />}
      <div style={{ position: "absolute", top, left: 72, right: 72 }}>
        <Label at={r[0] + 0.1} text={label} />
        <Title at={r[0] + 0.3} a={title[0]} b={title[1]} />
        <GoldRule at={r[0] + 0.7} width={936} style={{ opacity: 0.3, margin: "16px 0 4px" }} />
        {items.map((c, i) => (
          <Fade key={i} at={c.at} style={{ display: "flex", alignItems: "center", minHeight: 72, borderBottom: "1px solid rgba(227,194,122,0.2)" }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: GOLD, marginRight: 22, flexShrink: 0 }} />
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 33, color: WHITE, lineHeight: 1.3 }}>
              {c.main} {c.sub && <span style={{ color: DIM, fontWeight: 400 }}>{c.sub}</span>}
            </div>
          </Fade>
        ))}
        {stats.map((s, i) => (
          <Fade key={i} at={s.at} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 78, borderBottom: "1px solid rgba(227,194,122,0.2)" }}>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 32, color: SOFT }}>{s.label}</div>
            <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 54, color: GOLD, fontVariantNumeric: "lining-nums" }}>{s.value}</div>
          </Fade>
        ))}
        {children}
      </div>
    </AbsoluteFill>
  );
};

// ── special scenes ───────────────────────────────────────────────────────────
const Hook: React.FC = () => {
  const t = useT();
  if (!live(t, SC.hook)) return null;
  const at = HOOK(194.34);
  const lo = interpolate(t, [at, at + 1.0], [0, 7.5], { ...clamp, easing: ease });
  const hi = prog(t, HOOK(195.32), 0.7);
  return (
    <AbsoluteFill style={{ opacity: sceneO(t, SC.hook) }}>
      <div style={{ position: "absolute", top: 1000, left: 72, right: 72 }}>
        <Label at={0.15} text="GIÁ THẬT SAU CHIẾT KHẤU" />
        <Reveal at={HOOK(189.9)} style={{ marginTop: 4 }}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 78, color: WHITE }}>Căn 2 phòng ngủ</div>
        </Reveal>
        <Fade at={HOOK(192.0)}>
          <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 32, color: SOFT }}>
            sau khi áp đủ <span style={{ color: GOLD, fontWeight: 600 }}>23,5%</span> chiết khấu
          </div>
        </Fade>
        <GoldRule at={HOOK(193.4)} width={160} style={{ margin: "34px 0 16px" }} />
        <Fade at={HOOK(193.5)}>
          <div style={{ fontFamily: SERIF_I, fontWeight: 500, fontSize: 40, color: SOFT }}>giá chỉ còn khoảng</div>
        </Fade>
        <Reveal at={at - 0.1} dur={0.8}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 132, lineHeight: 1.05, color: GOLD, whiteSpace: "nowrap", fontVariantNumeric: "lining-nums tabular-nums" }}>
            {vn(lo)}
            <span style={{ display: "inline-block", verticalAlign: "bottom", overflow: "hidden", maxWidth: 360 * hi, opacity: hi, whiteSpace: "nowrap" }}>&nbsp;– 8,5</span>
            <span style={{ fontSize: 76, fontFamily: SERIF_I }}> tỷ</span>
          </div>
        </Reveal>
        <Fade at={HOOK(196.76)}>
          <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 26, color: DIM }}>Chưa bao gồm VAT</div>
        </Fade>
      </div>
    </AbsoluteFill>
  );
};

/** Cảnh có mặt Hoàng: dải flycam + logo phía trên, khung hình giữa, tên phía dưới. */
const FaceScene: React.FC<{ r: R; src: string; start: number; tagline: string }> = ({ r, src, start, tagline }) => {
  const t = useT();
  if (!live(t, r)) return null;
  return (
    <AbsoluteFill style={{ opacity: sceneO(t, r) }}>
      <AbsoluteFill style={{ backgroundColor: `rgb(${NAVY})` }} />
      <Sequence from={Math.round(start * FPS)} layout="none">
        <div style={{ position: "absolute", top: 0, left: 0, width: 1080, height: 470, WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 62%, transparent 100%)", maskImage: "linear-gradient(180deg, #000 0%, #000 62%, transparent 100%)" }}>
          <OffthreadVideo src={staticFile("video/prive/river.mp4")} muted playbackRate={Math.min(1, 3.25 / (r[1] - r[0] + 0.6))} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "60% 55%", transform: `scale(${1.04 + 0.04 * prog(t, start, r[1] - r[0])})` }} />
          <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(${NAVY},0.35) 0%, rgba(${NAVY},0.55) 100%)` }} />
        </div>
        <div style={{ position: "absolute", top: 380, left: 0, width: 1080, height: 864, WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 18%, #000 80%, transparent 100%)", maskImage: "linear-gradient(180deg, transparent 0%, #000 18%, #000 80%, transparent 100%)" }}>
          <OffthreadVideo src={staticFile(`video/prive/${src}.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </Sequence>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(${NAVY},0) 55%, rgba(${NAVY},0.75) 78%, rgba(${NAVY},0.9) 100%)` }} />
      <div style={{ position: "absolute", top: 118, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", textShadow: "0 2px 14px rgba(0,0,0,0.55)" }}>
        <Fade at={start + 0.1} y={10}>
          <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 64, letterSpacing: 16, paddingLeft: 16, color: WHITE }}>THE PRIVÉ</div>
        </Fade>
        <div style={{ display: "flex", justifyContent: "center", width: 300 }}>
          <GoldRule at={start + 0.4} width={110} style={{ margin: "14px 0 16px" }} />
        </div>
        <Fade at={start + 0.6} y={10}>
          <div style={{ fontFamily: SERIF_I, fontWeight: 500, fontSize: 38, color: GOLD }}>{tagline}</div>
        </Fade>
      </div>
      <div style={{ position: "absolute", top: 1270, left: 72 }}>
        <Reveal at={start + 0.4}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 60, color: WHITE }}>Minh Hoàng</div>
        </Reveal>
        <GoldRule at={start + 0.7} width={90} style={{ margin: "4px 0 12px" }} />
        <Fade at={start + 0.9}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: 4, color: GOLD }}>TƯ VẤN DỰ ÁN THE PRIVÉ</div>
        </Fade>
      </div>
    </AbsoluteFill>
  );
};

const PAYS = [
  { at: B(103.4), name: "Thanh toán theo thời gian", valAt: B(106.8), val: "−6%", steps: [{ at: B(104.8), s: "Đóng dần theo tiến độ" }] },
  {
    at: B(108.5),
    name: "Thanh toán nhanh",
    valAt: B(118.0),
    val: "−12%",
    steps: [
      { at: B(110.0), s: "10% ký HĐMB" },
      { at: B(111.5), s: "· 60% sau 30 ngày" },
      { at: B(113.2), s: "· 25% bàn giao" },
      { at: B(115.8), s: "· 5% nhận sổ" },
    ],
  },
  {
    at: B(119.1),
    name: "Vay ngân hàng",
    valAt: B(125.5),
    val: "HTLS 100%",
    steps: [
      { at: B(121.5), s: "10% ban đầu" },
      { at: B(122.5), s: "· 60% ngân hàng giải ngân" },
      { at: B(126.8), s: "· 24 tháng" },
    ],
  },
];

const Payments: React.FC = () => {
  const t = useT();
  const r = SC.pay;
  if (!live(t, r)) return null;
  return (
    <AbsoluteFill style={{ opacity: sceneO(t, r) }}>
      <div style={{ position: "absolute", top: 930, left: 72, right: 72 }}>
        <Label at={r[0] + 0.1} text="CHÍNH SÁCH THÁP 9 · 10 · 11" />
        <Title at={r[0] + 0.3} a="3 phương án" b="thanh toán" />
        {PAYS.map((p, i) => {
          const on = t >= p.at;
          const active = on && (i === PAYS.length - 1 || t < PAYS[i + 1].at);
          return (
            <Fade
              key={i}
              at={p.at}
              style={{
                marginTop: 16,
                padding: "16px 26px",
                border: `1.5px solid ${active ? GOLD : "rgba(227,194,122,0.3)"}`,
                background: active ? "rgba(227,194,122,0.08)" : "rgba(11,24,46,0.5)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: active ? WHITE : SOFT }}>
                  <span style={{ fontFamily: SERIF, color: GOLD, marginRight: 14 }}>0{i + 1}</span>
                  {p.name}
                </div>
                <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 48, color: GOLD, opacity: prog(t, p.valAt, 0.6) }}>{p.val}</div>
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 25, color: DIM, marginTop: 4, minHeight: 34 }}>
                {p.steps.map((s, k) => (
                  <span key={k} style={{ opacity: prog(t, s.at, 0.5) }}>
                    {s.s}{" "}
                  </span>
                ))}
              </div>
            </Fade>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const BARS = [
  { pct: 5, at: B(137.9) },
  { pct: 5, at: B(139.1) },
  { pct: 5, at: B(140.3) },
  { pct: 5, at: B(141.5) },
  { pct: 4, at: B(142.7) },
  { pct: 71, at: B(146.5) },
  { pct: 5, at: B(150.9) },
];
const S24_LINES: [number, number, React.ReactNode][] = [
  [B(137.9), B(146.4), <><span style={{ color: GOLD }}>24%</span> trải đều 5 đợt trước khi nhận nhà</>],
  [B(146.4), B(158.2), <><span style={{ color: GOLD }}>71%</span> khi nhận nhà · <span style={{ color: GOLD }}>5%</span> khi nhận sổ</>],
  [B(158.2), B(167.4), <>Tặng thêm chiết khấu <span style={{ color: GOLD }}>2,4%</span></>],
];
const Suat24: React.FC = () => {
  const t = useT();
  const r = SC.s24;
  if (!live(t, r)) return null;
  const MAXH = 250;
  const line = S24_LINES.find(([a, b]) => t >= a && t < b);
  return (
    <AbsoluteFill style={{ opacity: sceneO(t, r) }}>
      <div style={{ position: "absolute", top: 930, left: 72, right: 72 }}>
        <Label at={r[0] + 0.1} text="CHÍNH SÁCH GIỚI HẠN" />
        <Title at={r[0] + 0.3} a="24 suất" b="đặc biệt" />
        <Fade at={B(133.0)}>
          <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 28, color: SOFT }}>Mừng Bluemarq tròn 24 tuổi · dành cho 24 khách hàng đầu tiên</div>
        </Fade>
        <div style={{ position: "relative", height: MAXH + 90, marginTop: 30, display: "flex", alignItems: "flex-end", gap: 28 }}>
          {BARS.map((b, i) => {
            const g = prog(t, b.at, 0.8);
            const big = b.pct === 71;
            const hl = (i < 5 && t < B(146.4)) || (big && t >= B(146.4));
            return (
              <div key={i} style={{ width: 108, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: big ? 52 : 34, color: hl ? GOLD : WHITE, opacity: g, marginBottom: 6 }}>{b.pct}%</div>
                <div style={{ width: "100%", height: Math.max(8, (b.pct / 71) * MAXH) * g, background: hl ? GOLD : "rgba(255,255,255,0.45)" }} />
                <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 20, color: DIM, marginTop: 10, opacity: Math.max(0.35, g) }}>Đợt {i + 1}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 18, minHeight: 44 }}>
          {line && (
            <div key={line[0]} style={{ fontFamily: SANS, fontWeight: 500, fontSize: 32, color: WHITE, opacity: prog(t, line[0], 0.5) }}>
              {line[2]}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LAYERS = [
  { label: "Quà tặng sinh nhật Bluemarq", pct: 9, row: B(172.66), val: B(174.84) },
  { label: "Mua sỉ từ 3 căn", pct: 1.5, row: B(176.06), val: B(178.0) },
  { label: "Khách hàng thân thiết", pct: 1, row: B(178.94), val: B(180.86) },
  { label: "Thanh toán nhanh", pct: 12, row: B(181.56), val: B(182.46) },
];
const TOTAL_AT = B(184.84);
const Breakdown: React.FC = () => {
  const t = useT();
  const r = SC.cum;
  if (!live(t, r)) return null;
  const sum = LAYERS.reduce((s, l) => s + l.pct * prog(t, l.val, 0.6), 0);
  const tot = prog(t, TOTAL_AT, 0.9);
  return (
    <AbsoluteFill style={{ opacity: sceneO(t, r) }}>
      <div style={{ position: "absolute", top: 970, left: 72, right: 72 }}>
        <Title at={r[0] + 0.15} a="4 lớp chiết khấu" b="cộng dồn" size={62} />
        <GoldRule at={r[0] + 0.5} width={936} style={{ opacity: 0.35, margin: "18px 0 6px" }} />
        {LAYERS.map((l, i) => {
          const active = t >= l.row && (i === LAYERS.length - 1 ? t < TOTAL_AT : t < LAYERS[i + 1].row);
          return (
            <Fade key={i} at={l.row} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 80, borderBottom: "1px solid rgba(227,194,122,0.22)" }}>
              <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, color: active || t >= TOTAL_AT ? WHITE : SOFT }}>{l.label}</div>
              <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 52, color: GOLD, opacity: prog(t, l.val, 0.4), fontVariantNumeric: "lining-nums tabular-nums" }}>
                {vn(l.pct * prog(t, l.val, 0.6))}%
              </div>
            </Fade>
          );
        })}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 130, opacity: prog(t, LAYERS[0].val, 0.6) }}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: 6, color: GOLD }}>TỔNG</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64 + 40 * tot, color: GOLD, fontVariantNumeric: "lining-nums tabular-nums", textShadow: tot > 0 ? `0 0 ${30 * tot}px rgba(227,194,122,0.45)` : "none" }}>
            {vn(t >= TOTAL_AT ? sum + (23.5 - sum) * tot : sum)}%
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const STEPS = [
  { date: "08/09 – 15/10", pct: "9%", at: B(206.96), now: true },
  { date: "16/10 – 31/10", pct: "8%", at: B(210.02), now: false },
  { date: "01/11 – 08/11", pct: "6%", at: B(212.32), now: false },
];
const CLOSE_AT = B(214.86);
const Timeline: React.FC = () => {
  const t = useT();
  const r = SC.time;
  if (!live(t, r)) return null;
  const line = interpolate(t, [STEPS[0].at - 0.2, STEPS[2].at + 0.6], [0, 1], { ...clamp, easing: ease });
  const COLW = 312;
  return (
    <AbsoluteFill style={{ opacity: sceneO(t, r) }}>
      <div style={{ position: "absolute", top: 980, left: 72, right: 72 }}>
        <Title at={r[0] + 0.15} a="Quà sinh nhật" b="giảm dần" size={62} />
        <div style={{ position: "relative", height: 250, marginTop: 44 }}>
          <div style={{ position: "absolute", top: 9, left: 9, height: 2, width: COLW * 2 * line, background: GOLD, opacity: 0.6 }} />
          {STEPS.map((s, i) => {
            const p = prog(t, s.at, 0.7);
            return (
              <div key={i} style={{ position: "absolute", left: i * COLW, top: 0, width: COLW, opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
                <div style={{ width: 20, height: 20, borderRadius: 10, background: s.now ? GOLD : `rgb(${NAVY})`, border: `2px solid ${GOLD}` }} />
                <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, color: DIM, marginTop: 22, letterSpacing: 1 }}>{s.date}</div>
                <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 96, lineHeight: 1.1, color: s.now ? GOLD : WHITE }}>{s.pct}</div>
                {s.now && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, letterSpacing: 4, color: GOLD }}>HIỆN TẠI</div>}
              </div>
            );
          })}
        </div>
        <GoldRule at={CLOSE_AT - 0.1} width={160} style={{ margin: "26px 0 6px" }} />
        <Reveal at={CLOSE_AT}>
          <div style={{ fontFamily: SERIF_I, fontWeight: 500, fontSize: 70, color: WHITE }}>
            Chốt sớm, <span style={{ color: GOLD }}>lợi hơn.</span>
          </div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

const Save: React.FC = () => {
  const t = useT();
  const r = SC.save;
  if (!live(t, r)) return null;
  return (
    <AbsoluteFill style={{ opacity: sceneO(t, r) }}>
      <div style={{ position: "absolute", top: 1010, left: 72, right: 72 }}>
        <Label at={r[0] + 0.1} text="TỔNG CHIẾT KHẤU" />
        <Reveal at={r[0] + 0.25}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 170, lineHeight: 1, color: GOLD }}>23,5%</div>
        </Reveal>
        <Fade at={B(200.2)}>
          <div style={{ fontFamily: SERIF_I, fontWeight: 500, fontSize: 52, color: WHITE }}>Khoản tiết kiệm rất lớn</div>
        </Fade>
        <Fade at={B(202.7)}>
          <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 30, color: SOFT, marginTop: 12 }}>Thời điểm đáng để cân nhắc nghiêm túc</div>
        </Fade>
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const t = useT();
  const r = SC.outro;
  return (
    <>
      <FaceScene r={r} src="face_outro" start={OUT0} tagline="Bình luận “THÁP 9” để nhận bảng giá" />
      {live(t, r) && (
        <div style={{ position: "absolute", bottom: 64, left: 90, right: 90, textAlign: "center", opacity: prog(t, OUT0 + 1.0, 0.8) * sceneO(t, r) }}>
          <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 19, lineHeight: 1.5, color: DIM }}>
            Thông tin theo tài liệu chủ đầu tư tháng 9/2026 · Chính sách áp dụng đến 08/11/2026 · Quà sinh nhật 9% đến 15/10/2026 · Chi tiết theo HĐMB
          </div>
        </div>
      )}
    </>
  );
};

const Captions: React.FC = () => {
  const t = useT();
  const c = CAPS.find(([a, b]) => t >= a && t < b);
  if (!c) return null;
  const o = interpolate(t, [c[0], c[0] + 0.2, c[1] - 0.12, c[1]], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 1585, left: 90, right: 90, textAlign: "center", opacity: o }}>
      <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 36, lineHeight: 1.45, color: WHITE, textShadow: "0 2px 10px rgba(0,0,0,0.85)" }}>{c[2]}</span>
    </div>
  );
};

const Progress: React.FC = () => {
  const t = useT();
  return <div style={{ position: "absolute", top: 0, left: 0, height: 4, width: `${(t / PF_TOTAL_SEC) * 100}%`, background: GOLD, opacity: 0.85 }} />;
};

export const PriveFull: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: `rgb(${NAVY})` }}>
    {BGS.map(([s, a, b, x], i) => (
      <Clip key={i} src={s} a={a} b={b} x={x ?? 50} z0={i % 2 ? 1.06 : 1.0} z1={i % 2 ? 1.0 : 1.06} />
    ))}
    <Shade />
    <Hook />
    <FaceScene r={SC.face} src="face_intro" start={FACE0} tagline="Giá thật Tháp 9 sau chiết khấu" />

    <Panel
      r={SC.loc1}
      label="VỊ TRÍ"
      title={["Bán đảo", "3 mặt sông"]}
      card={{ kind: "img", src: "map_prive.jpg", pin: { x: 464, y: 360, at: B(5.1) } }}
      items={[
        { at: B(1.8), main: "Mặt tiền đường Song Hành" },
        { at: B(2.52), main: "Cao tốc TP.HCM – Long Thành", sub: "– Dầu Giây" },
        { at: B(5.32), main: "Khu Nam Rạch Chiếc" },
        { at: B(6.32), main: "Phường Bình Trưng", sub: "(An Phú cũ)" },
      ]}
    />
    <Panel
      r={SC.loc2}
      label="VỊ TRÍ"
      title={["Thế đất", "hiếm có"]}
      card={{ kind: "video", src: "v4_nrc" }}
      items={[
        { at: B(17.2), main: "3 mặt giáp sông Giồng Ông Tố" },
        { at: B(19.6), main: "Không gian sống biệt lập, mát mẻ" },
        { at: B(21.7), main: "Giữ trọn phong thủy & sự riêng tư" },
      ]}
    />
    <Panel
      r={SC.infra1}
      label="HẠ TẦNG"
      title={["Át chủ bài", "tăng giá"]}
      card={{ kind: "video", src: "v4_connect" }}
      items={[
        { at: B(31.0), main: "Song Hành & cao tốc TP.HCM – Long Thành" },
        { at: B(34.7), main: "Trung tâm tài chính Thủ Thiêm", sub: "~5 phút" },
        { at: B(37.8), main: "Sân bay quốc tế Long Thành", sub: "~30 phút" },
        { at: B(39.5), main: "Ga Bình Trưng", sub: "~2 phút" },
      ]}
    />
    <Panel
      r={SC.infra2}
      label="HẠ TẦNG"
      title={["Sống cạnh", "nhà ga"]}
      card={{ kind: "img", src: "infra.jpg" }}
      items={[
        { at: B(45.2), main: "Vài bước chân tới ga", sub: "(khi tuyến vận hành)" },
        { at: B(47.2), main: "Mô hình TOD như Singapore, châu Âu" },
        { at: B(51.1), main: "Đường sắt Bắc – Nam & nút giao An Phú" },
        { at: B(53.3), main: "Kết nối đường bộ · đường sắt · hàng không" },
      ]}
    />
    <Panel
      r={SC.amen}
      label="TIỆN ÍCH"
      title={["Nghỉ dưỡng", "riêng tư"]}
      top={930}
      stats={[
        { at: B(63.7), value: "25%", label: "Mật độ xây dựng" },
        { at: B(65.8), value: "6,7 ha", label: "Quy mô dự án" },
        { at: B(74.1), value: "3.000 m²", label: "3 hồ bơi điện phân muối" },
        { at: B(76.6), value: "1 km", label: "Công viên ven sông" },
        { at: B(77.7), value: "5", label: "Phòng tiệc riêng cư dân" },
      ]}
    />
    <Panel
      r={SC.payIntro}
      label="THANH TOÁN & CHIẾT KHẤU"
      title={["Tháp 9 · 10 · 11", "nhiều lớp ưu đãi"]}
      items={[
        { at: B(92.1), main: "Áp dụng đồng thời nhiều lớp chính sách" },
        { at: B(95.8), main: "Thời gian: 08/09 – 08/11/2026" },
      ]}
    />
    <Payments />
    <Suat24 />
    <Breakdown />
    <Save />
    <Timeline />
    <Panel
      r={SC.t9a}
      label="TÂM ĐIỂM GIAI ĐOẠN 2"
      title={["Tháp 9", "trung tâm dự án"]}
      card={{ kind: "img", src: "masterplan.jpg", zoom: { x: 0.672, y: 0.472, to: 2.0, a: B(220.7), b: B(224.4) } }}
      items={[
        { at: B(221.3), main: "Tòa tháp đang mở bán giai đoạn 2" },
        { at: B(225.5), main: "Bao quanh bởi hồ bơi, công viên nội khu" },
        { at: B(227.8), main: "View sông Giồng Ông Tố & trung tâm Thủ Thiêm" },
      ]}
    />
    <Panel
      r={SC.t9b1}
      label="CĂN MẪU THÁP 9"
      title={["Căn 1", "phòng ngủ"]}
      card={{ kind: "img", src: "unit_1pn.jpg", top: 560, h: 291, fit: "cover" }}
      stats={[
        { at: B(235.3), value: "49,8 m²", label: "Diện tích" },
        { at: B(237.0), value: "Sông + nội khu", label: "View" },
        { at: B(241.9), value: "7,1 tỷ", label: "Giá niêm yết (chưa VAT)" },
      ]}
    />
    <Panel
      r={SC.t9b2}
      label="CĂN MẪU THÁP 9"
      title={["Căn 2", "phòng ngủ"]}
      card={{ kind: "img", src: "unit_2pn.jpg", top: 540, h: 319, fit: "cover" }}
      stats={[
        { at: B(247.0), value: "71,5 m²", label: "Diện tích" },
        { at: B(249.6), value: "9,3 tỷ", label: "Giá niêm yết (chưa VAT)" },
      ]}
    />
    <Panel
      r={SC.hand}
      label="TIÊU CHUẨN BÀN GIAO"
      title={["Nội thất", "cao cấp"]}
      card={{
        kind: "slides",
        slides: [
          { src: "h_kitchen.jpg", at: SC.hand[0] },
          { src: "h_bath.jpg", at: B(255.3) },
          { src: "h_bed.jpg", at: B(259.3) },
        ],
      }}
      items={[
        { at: B(251.5), main: "Bàn giao nội thất cao cấp" },
        { at: B(253.7), main: "Xem thực tế tại căn hộ mẫu" },
        { at: B(259.4), main: "Thiết bị thương hiệu châu Âu", sub: "Bosch · Grohe · Duravit" },
      ]}
    />
    <Panel
      r={SC.partner}
      label="ĐỐI TÁC QUỐC TẾ"
      title={["Dàn đối tác", "đứng sau dự án"]}
      top={930}
      card={{ kind: "img", src: "partners.jpg", top: 560, h: 171, fit: "cover" }}
      items={[
        { at: B(269.3), main: "CSCEC", sub: "Kết cấu · top đầu châu Á" },
        { at: B(273.2), main: "OPPEIN", sub: "Nội thất · số 1 toàn cầu" },
        { at: B(277.4), main: "CPG Consultants", sub: "Kiến trúc · Singapore" },
        { at: B(279.3), main: "CNA-HTE & ASAHI ETIC", sub: "Cảnh quan · Nhật Bản" },
        { at: B(281.8), main: "Savills", sub: "Tư vấn quản lý vận hành" },
      ]}
    />
    <Outro />
    <Brand />
    <Captions />
    <Progress />
  </AbsoluteFill>
);
