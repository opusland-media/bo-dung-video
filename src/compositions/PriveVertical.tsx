import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBVP } from "@remotion/google-fonts/BeVietnamPro";

/**
 * The Privé Tháp 9 — bản dọc đầy đủ (đang dựng: 30s đầu để duyệt phong cách).
 * 1080×1920 · 30fps · giọng thật Minh Hoàng, audio ghép ngoài.
 * Nền là video TVC chuyển động (public/video/prive/*), chữ serif vàng–trắng, không nhạc/SFX.
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

// ── timeline (giây đầu ra) ───────────────────────────────────────────────────
const HOOK = (s: number) => 0.3 + (s - 189.85); // clean voice 189.85 → 197.45
const FACE0 = 8.15; // face intro 0 → 7.5
const LOC = (s: number) => 15.9 + s; // clean voice 0.0 → 10.65

export const PV_TOTAL_SEC = 28.8;
export const PV_TOTAL_FRAMES = Math.round(PV_TOTAL_SEC * FPS);

const SC = {
  hook: [0, 8.0],
  face: [8.4, 15.75],
  loc: [15.75, PV_TOTAL_SEC],
} as const;

const CAPS: [number, number, string][] = [
  [HOOK(189.85), HOOK(193.45), "1 căn 2 phòng ngủ sau khi áp hết chiết khấu 23,5%"],
  [HOOK(193.45), HOOK(197.45), "giá chỉ còn khoảng 7,5 tới 8,5 tỷ, chưa VAT"],
  [FACE0 + 0.0, FACE0 + 4.45, "Xin chào quý anh chị, hôm nay Hoàng sẽ đưa anh chị đi một vòng đầy đủ về dự án The Privé"],
  [FACE0 + 4.45, FACE0 + 7.5, "dự án đang là tâm điểm của khu Đông TP. Hồ Chí Minh"],
  [LOC(0.0), LOC(4.55), "The Privé tọa lạc tại mặt tiền đường Song Hành, cao tốc TP.HCM – Long Thành – Dầu Giây"],
  [LOC(4.55), LOC(8.6), "thuộc khu dân cư Nam Rạch Chiếc, phường Bình Trưng – tên gọi mới sau sáp nhập"],
  [LOC(8.6), LOC(10.65), "trước đây là phường An Phú, TP. Hồ Chí Minh"],
];

// ── helpers ──────────────────────────────────────────────────────────────────
const useT = () => useCurrentFrame() / FPS;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const prog = (t: number, at: number, dur = 0.8) => interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing: ease });
const sceneO = (t: number, [a, b]: readonly [number, number]) => interpolate(t, [a - 0.25, a + 0.15, b - 0.2, b + 0.15], [0, 1, 1, 0], clamp);
const live = (t: number, [a, b]: readonly [number, number]) => t > a - 0.3 && t < b + 0.2;
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

/** Nền video TVC: crossfade theo khoảng [a,b], zoom nhẹ, cắt dọc theo objectPosition. */
const Clip: React.FC<{ src: string; a: number; b: number; x?: number; rate?: number; z0?: number; z1?: number }> = ({ src, a, b, x = 50, rate = 1, z0 = 1.0, z1 = 1.06 }) => {
  const t = useT();
  if (t < a - 0.5 || t > b + 0.5) return null;
  const o = interpolate(t, [a - 0.35, a + 0.1, b - 0.1, b + 0.35], [0, 1, 1, 0], clamp);
  const z = interpolate(t, [a - 0.35, b + 0.35], [z0, z1], clamp);
  return (
    <Sequence from={Math.round(Math.max(0, a - 0.5) * FPS)} layout="none">
      <AbsoluteFill style={{ opacity: a <= 0 && t < b ? 1 : o }}>
        <OffthreadVideo
          src={staticFile(`video/prive/${src}.mp4`)}
          muted
          playbackRate={rate}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${x}% 50%`, transform: `scale(${z})` }}
        />
      </AbsoluteFill>
    </Sequence>
  );
};

const Shade: React.FC<{ strength?: number }> = ({ strength = 1 }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, rgba(${NAVY},${0.55 * strength}) 0%, rgba(${NAVY},0.05) 15%, rgba(${NAVY},0) 34%, rgba(${NAVY},${0.55 * strength}) 49%, rgba(${NAVY},${0.9 * strength}) 61%, rgba(${NAVY},0.96) 100%)`,
    }}
  />
);

const Brand: React.FC = () => {
  const t = useT();
  const o = Math.min(interpolate(t, [0.2, 1.0], [0, 1], clamp), 1 - interpolate(t, [SC.face[0] - 0.2, SC.face[0] + 0.2, SC.face[1] - 0.2, SC.face[1] + 0.2], [0, 1, 1, 0], clamp));
  return (
    <div style={{ position: "absolute", top: 104, left: 72, opacity: o }}>
      <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 40, letterSpacing: 10, color: WHITE }}>THE PRIVÉ</div>
      <div style={{ height: 1, width: 64, background: GOLD, margin: "12px 0 10px" }} />
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: 5, color: GOLD }}>THÁP 9 · BÁN ĐẢO 3 MẶT SÔNG</div>
    </div>
  );
};

// ── scene 1: mở bằng giá ─────────────────────────────────────────────────────
const Hook: React.FC = () => {
  const t = useT();
  if (!live(t, SC.hook)) return null;
  const at = HOOK(194.34);
  const lo = interpolate(t, [at, at + 1.0], [0, 7.5], { ...clamp, easing: ease });
  const hi = prog(t, HOOK(195.32), 0.7);
  return (
    <AbsoluteFill style={{ opacity: sceneO(t, SC.hook) }}>
      <div style={{ position: "absolute", top: 1000, left: 72, right: 72 }}>
        <Fade at={0.15}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: 6, color: GOLD }}>GIÁ THẬT SAU CHIẾT KHẤU</div>
        </Fade>
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

// ── scene 2: Hoàng chào (mặt thật, khung dọc) ────────────────────────────────
const Face: React.FC = () => {
  const t = useT();
  if (!live(t, SC.face)) return null;
  return (
    <AbsoluteFill style={{ opacity: sceneO(t, SC.face) }}>
      <Sequence from={Math.round(FACE0 * FPS)} layout="none">
        <AbsoluteFill style={{ backgroundColor: `rgb(${NAVY})` }} />
        {/* dải flycam dự án phía trên */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 1080, height: 470, WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 62%, transparent 100%)", maskImage: "linear-gradient(180deg, #000 0%, #000 62%, transparent 100%)" }}>
          <OffthreadVideo src={staticFile("video/prive/river.mp4")} muted playbackRate={0.7} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "60% 55%", transform: `scale(${1.04 + 0.04 * prog(t, FACE0, 7.5)})` }} />
          <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(${NAVY},0.35) 0%, rgba(${NAVY},0.55) 100%)` }} />
        </div>
        <div style={{ position: "absolute", top: 380, left: 0, width: 1080, height: 864, WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 18%, #000 80%, transparent 100%)", maskImage: "linear-gradient(180deg, transparent 0%, #000 18%, #000 80%, transparent 100%)" }}>
          <OffthreadVideo src={staticFile("video/prive/face_intro.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </Sequence>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(${NAVY},0) 55%, rgba(${NAVY},0.75) 78%, rgba(${NAVY},0.9) 100%)` }} />
      {/* logo + tiêu đề chồng lên dải flycam */}
      <div style={{ position: "absolute", top: 118, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", textShadow: "0 2px 14px rgba(0,0,0,0.55)" }}>
        <Fade at={FACE0 + 0.1} y={10}>
          <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 64, letterSpacing: 16, paddingLeft: 16, color: WHITE }}>THE PRIVÉ</div>
        </Fade>
        <div style={{ display: "flex", justifyContent: "center", width: 300 }}>
          <GoldRule at={FACE0 + 0.4} width={110} style={{ margin: "14px 0 16px" }} />
        </div>
        <Fade at={FACE0 + 0.6} y={10}>
          <div style={{ fontFamily: SERIF_I, fontWeight: 500, fontSize: 38, color: GOLD }}>Giá thật Tháp 9 sau chiết khấu</div>
        </Fade>
      </div>
      <div style={{ position: "absolute", top: 1270, left: 72 }}>
        <Reveal at={FACE0 + 0.4}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 60, color: WHITE }}>Minh Hoàng</div>
        </Reveal>
        <GoldRule at={FACE0 + 0.7} width={90} style={{ margin: "4px 0 12px" }} />
        <Fade at={FACE0 + 0.9}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: 4, color: GOLD }}>TƯ VẤN DỰ ÁN THE PRIVÉ</div>
        </Fade>
      </div>
    </AbsoluteFill>
  );
};

// ── scene 3: vị trí ──────────────────────────────────────────────────────────
const LOC_CHIPS = [
  { at: LOC(1.8), main: "Mặt tiền đường Song Hành", sub: "" },
  { at: LOC(2.52), main: "Cao tốc TP.HCM – Long Thành", sub: "– Dầu Giây" },
  { at: LOC(5.32), main: "Khu Nam Rạch Chiếc", sub: "" },
  { at: LOC(6.32), main: "Phường Bình Trưng", sub: "(An Phú cũ)" },
];
const MAP_AT = LOC(5.1);

const Location: React.FC = () => {
  const t = useT();
  if (!live(t, SC.loc)) return null;
  const card = prog(t, MAP_AT, 0.9);
  const pulse = (((t - MAP_AT) * 1.1) % 1 + 1) % 1;
  return (
    <AbsoluteFill style={{ opacity: sceneO(t, SC.loc) }}>
      {/* bản đồ có ghim */}
      <div
        style={{
          position: "absolute",
          top: 330,
          left: 72,
          width: 936,
          height: 560,
          overflow: "hidden",
          border: `1.5px solid ${GOLD}`,
          boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
          opacity: card,
          transform: `translateY(${(1 - card) * 30}px)`,
        }}
      >
        <Img src={staticFile("images/prive235/map_prive.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1 + 0.06 * prog(t, MAP_AT, 6)})`, transformOrigin: "50% 64%" }} />
        <div style={{ position: "absolute", left: 464 - 70 * pulse, top: 360 - 70 * pulse, width: 140 * pulse, height: 140 * pulse, borderRadius: "50%", border: `3px solid ${GOLD}`, opacity: 1 - pulse }} />
        <div style={{ position: "absolute", left: 452, top: 348, width: 24, height: 24, borderRadius: 12, background: GOLD, boxShadow: `0 0 20px ${GOLD}` }} />
      </div>
      <div style={{ position: "absolute", top: 1000, left: 72, right: 72 }}>
        <Fade at={SC.loc[0] + 0.1}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: 6, color: GOLD }}>VỊ TRÍ</div>
        </Fade>
        <Reveal at={SC.loc[0] + 0.3} style={{ marginTop: 2 }}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 64, color: WHITE, lineHeight: 1.15 }}>
            Bán đảo <span style={{ fontFamily: SERIF_I, color: GOLD }}>3 mặt sông</span>
          </div>
        </Reveal>
        <GoldRule at={SC.loc[0] + 0.7} width={936} style={{ opacity: 0.3, margin: "18px 0 4px" }} />
        {LOC_CHIPS.map((c, i) => (
          <Fade key={i} at={c.at} style={{ display: "flex", alignItems: "center", height: 74, borderBottom: "1px solid rgba(227,194,122,0.2)" }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: GOLD, marginRight: 22 }} />
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, color: WHITE }}>
              {c.main} <span style={{ color: DIM, fontWeight: 400 }}>{c.sub}</span>
            </div>
          </Fade>
        ))}
      </div>
    </AbsoluteFill>
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
  return <div style={{ position: "absolute", top: 0, left: 0, height: 4, width: `${(t / PV_TOTAL_SEC) * 100}%`, background: GOLD, opacity: 0.85 }} />;
};

export const PriveVertical: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: `rgb(${NAVY})` }}>
    {/* nền video theo cảnh */}
    <Clip src="living" a={0} b={SC.hook[1]} x={50} z0={1.04} z1={1.0} />
    <Clip src="river" a={SC.loc[0]} b={LOC(3.3)} x={70} />
    <Clip src="station" a={LOC(3.3)} b={LOC(6.1)} x={45} z0={1.05} z1={1.0} />
    <Clip src="nightpen" a={LOC(6.1)} b={PV_TOTAL_SEC} x={55} rate={0.5} />
    <Shade />
    <Hook />
    <Face />
    <Location />
    <Brand />
    <Captions />
    <Progress />
  </AbsoluteFill>
);
