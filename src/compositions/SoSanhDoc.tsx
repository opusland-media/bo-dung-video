import React, { createContext, useContext } from "react";
import { AbsoluteFill, Audio, Img, Loop, OffthreadVideo, Sequence, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBVP } from "@remotion/google-fonts/BeVietnamPro";
import { SHOTS, PANELS, LEN, type Shot, type PanelDef, type Brand } from "./SoSanh";
import { SS_CAPS } from "../data/sosanh-caps";

/**
 * "The Privé hay Palm River?" — bản ngắn khung dọc 9:16 (1080×1920) cho Reels / Shorts / TikTok.
 * Nguồn: bản user đã xuất (public/video/sosanh/final.mp4, 4K, đã chỉnh màu + SFX).
 *  - Đoạn nhìn camera: crop dọc theo người.
 *  - Đoạn đọc kịch bản: dựng lại hình dự án theo khung dọc (ảnh trên, thông tin dưới).
 * Dữ liệu SHOTS/PANELS dùng chung với SoSanh.tsx (theo thời gian bản gốc) → map sang thời gian bản user xuất.
 */
const { fontFamily: SERIF } = loadPlayfair("normal", { weights: ["500", "600", "700"], subsets: ["vietnamese", "latin"] });
const { fontFamily: SERIF_I } = loadPlayfair("italic", { weights: ["500", "600"], subsets: ["vietnamese", "latin"] });
const { fontFamily: SANS } = loadBVP("normal", { weights: ["400", "500", "600", "700"], subsets: ["vietnamese", "latin"] });

const FPS = 30;
const NAVY = "11,24,46";
const GOLD = "#E3C27A";
const AQUA = "#9FD8E8";
const WHITE = "#FFFFFF";
const SOFT = "rgba(255,255,255,0.85)";
const DIM = "rgba(255,255,255,0.62)";
const accent = (b: Brand) => (b === "pr" ? AQUA : GOLD);
const brandName = (b: Brand) => (b === "pr" ? "PALM RIVER" : b === "pv" ? "THE PRIVÉ" : "");

// ── map thời gian: bản gốc (old) ↔ bản user xuất (new) ──────────────────────
const ANCH: [number, number][] = [
  [0, -0.52], [0.52, 0], [13.9, 13.2], [29.18, 28.6], [35.0, 34.3], [50.14, 49.5], [64.52, 64.0], [70.1, 69.4], [80.5, 79.8],
  [102.6, 101.9], [120.2, 119.5], [138.36, 137.3], [152.86, 151.5], [167.44, 166.2], [178.5, 177.3], [193.1, 191.6],
  [197.48, 195.9], [206.36, 204.7], [225.98, 224.4], [242.68, 240.9], [269.0, 267.1], [270.7, 268.8],
];
const lerpMap = (x: number, from: 0 | 1) => {
  const to = from === 0 ? 1 : 0;
  for (let i = 0; i < ANCH.length - 1; i++) {
    const a = ANCH[i], b = ANCH[i + 1];
    if (x >= a[from] && x <= b[from]) return a[to] + ((x - a[from]) * (b[to] - a[to])) / (b[from] - a[from]);
  }
  return x + (from === 0 ? -1.9 : 1.9);
};
const oldToNew = (x: number) => lerpMap(x, 0);
const newToOld = (x: number) => lerpMap(x, 1);

// thời gian hiện tại (theo bản user xuất) + hàm đổi "thời gian new" → giây output
type Ctx = { tNew: number; outOf: (tNew: number) => number };
const TC = createContext<Ctx>({ tNew: 0, outOf: (x) => x });
const useNew = () => useContext(TC).tNew;
const useOld = () => newToOld(useContext(TC).tNew);

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const prog = (t: number, at: number, dur = 0.6) => interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing: ease });
const win = (t: number, a: number, b: number, f = 0.3) => interpolate(t, [a - f, a, b, b + f], [0, 1, 1, 0], clamp);

const Fade: React.FC<{ at: number; t: number; y?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, t, y = 16, children, style }) => {
  const p = prog(t, at);
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * y}px)`, ...style }}>{children}</div>;
};

// ── bố cục ───────────────────────────────────────────────────────────────────
const IMG_TOP = 400;
const FACE_TOP = 430;
const FACE_H = 920; // khung người 1080×980, nền là chính video làm mờ
const IMG_H = 900; // vùng hình dự án 1080×900
const PANEL_TOP = IMG_TOP + IMG_H + 20;

const BLOCKS_NEW: [number, number][] = [
  [34.3, 130.8],
  [137.3, 191.6],
  [195.9, 240.9],
];
const inBroll = (tn: number) => BLOCKS_NEW.some(([a, b]) => tn >= a - 0.05 && tn < b);

// ── nền: video user (crop dọc theo người) ───────────────────────────────────
// dải trên: flycam The Privé · dải dưới: phối cảnh Palm River (lấp khoảng trống quanh khung người)
const BandTop: React.FC = () => {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: FACE_TOP, overflow: "hidden" }}>
      <Loop durationInFrames={Math.round(5.7 * 2 * FPS)}>
        <OffthreadVideo src={staticFile("video/prive/garden_aerial.mp4")} muted playbackRate={0.5}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 40%", filter: "brightness(0.62) saturate(1.1)" }} />
      </Loop>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(${NAVY},0.35) 0%, rgba(${NAVY},0) 50%, rgba(${NAVY},0.55) 100%)` }} />
      <Img src={staticFile("images/sosanh/prive_logo_white.png")} style={{ position: "absolute", right: 40, bottom: 22, width: 230, opacity: 0.9 }} />
    </div>
  );
};
const BandBottom: React.FC = () => {
  const f = useCurrentFrame();
  const x = 50 + Math.sin(f / 300) * 12;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: FACE_TOP + FACE_H, bottom: 0, overflow: "hidden" }}>
      <Img src={src("pr_t049")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${x}% 55%`, transform: "scale(1.15)", filter: "brightness(0.58) saturate(1.05)" }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(${NAVY},0.6) 0%, rgba(${NAVY},0.1) 35%, rgba(${NAVY},0.45) 100%)` }} />
      <Img src={staticFile("images/sosanh/palm_logo_white.png")} style={{ position: "absolute", right: 40, top: 230, width: 260, opacity: 0.9 }} />
    </div>
  );
};

// Hình người lấy từ BẢN USER ĐÃ CHỈNH (màu + làm nét + làm đẹp). Chữ chèn sẵn trong bản đó được che
// bằng mảng nền sạch lấy từ chính video (khung 24s, góc máy cố định) — chỉ ở vùng và thời điểm có chữ.
const SRC_W = 3840, SRC_H = 2160;
const WIN_X = 0.215, WIN_W = 0.62, WIN_Y = 0.0; // cửa sổ cắt trên video gốc (tỉ lệ) — bỏ 6% đáy (dòng lưu ý cuối video)
// 1,0–4,2s: chữ "Nam Rạch Chiếc / Song Hành" của anh nằm sát rèm và máy đang zoom → cắt cận vào người (punch-in) để chữ ra ngoài khung
const PUNCH = { x: WIN_X, w: WIN_W, y: WIN_Y }; // không zoom (user không muốn) — chữ được đè bằng thẻ LocTag
const winAt = (tn: number) => {
  const p = interpolate(tn, [0.95, 1.3, 3.95, 4.3], [0, 1, 1, 0], { ...clamp, easing: ease });
  return { x: WIN_X + (PUNCH.x - WIN_X) * p, w: WIN_W + (PUNCH.w - WIN_W) * p, y: WIN_Y + (PUNCH.y - WIN_Y) * p };
};
const PATCHES: { a: number; b: number; r: [number, number, number, number]; zoom?: boolean }[] = [
  ...([
    [5.0, 13.8, [0.02, 0.2, 0.26, 0.62]],
    [15.8, 22.0, [0.02, 0.24, 0.34, 0.62]],
    [29.4, 34.9, [0.02, 0.32, 0.38, 0.49]],
    [132.0, 138.3, [0.02, 0.25, 0.34, 0.53]],
    [193.2, 197.4, [0.02, 0.25, 0.41, 0.53]],
    [242.8, 261.6, [0.02, 0.11, 0.33, 0.53]],
    [254.0, 261.6, [0.67, 0.19, 0.99, 0.53]],
    [261.8, 270.6, [0.02, 0.75, 0.34, 0.93]],
  ] as [number, number, [number, number, number, number]][]).map(([a, b, r]) => ({ a: oldToNew(a) - 0.4, b: oldToNew(b) + 0.4, r })),
];
const FLASHES: [number, number][] = [[9.7, 10.15], [33.6, 34.45]];
// thẻ đè lên chữ "Nam Rạch Chiếc / Song Hành" của anh ở 1–4s (cùng nội dung, kiểu chữ đồng bộ)
const LocTag: React.FC = () => {
  const tn = useNew();
  const a = 1.15, b = 4.0;
  if (tn < a - 0.2 || tn > b + 0.3) return null;
  const o = interpolate(tn, [a - 0.15, a + 0.05, b, b + 0.25], [0, 1, 1, 0], clamp);
  const p = prog(tn, a - 0.15, 0.5);
  return (
    <div style={{ position: "absolute", left: -14, top: 270, width: 330, height: 220, opacity: o, transform: `translateX(${(1 - p) * -30}px)`,
      background: `rgba(${NAVY},0.92)`, borderRadius: "0 14px 14px 0", borderLeft: `6px solid ${GOLD}`, padding: "34px 26px 0 40px", boxShadow: "0 12px 40px rgba(0,0,0,0.35)" }}>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: 4, color: GOLD }}>📍 VỊ TRÍ</div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: WHITE, lineHeight: 1.12, marginTop: 10 }}>Nam Rạch Chiếc</div>
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: SOFT, marginTop: 8 }}>Trục Song Hành</div>
    </div>
  );
};

const SrcLayer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const w = winAt(useNew());
  const k = 1080 / (w.w * SRC_W);
  return <div style={{ position: "absolute", left: -w.x * SRC_W * k, top: -w.y * SRC_H * k, width: SRC_W * k, height: SRC_H * k }}>{children}</div>;
};
const FaceVideo: React.FC<{ from: number; to: number }> = ({ from }) => {
  const tn = useNew();
  const full: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };
  return (
    <AbsoluteFill style={{ background: `rgb(${NAVY})` }}>
      <BandTop />
      <BandBottom />
      <div style={{ position: "absolute", left: 0, right: 0, top: FACE_TOP, height: FACE_H, overflow: "hidden", boxShadow: "0 0 50px rgba(0,0,0,0.6)", borderTop: `3px solid ${GOLD}`, borderBottom: `3px solid ${AQUA}` }}>
        <SrcLayer>
          <OffthreadVideo src={staticFile("video/sosanh/final.mp4")} muted startFrom={Math.round(from * FPS)} style={full} />
          {PATCHES.map(({ a, b, r, zoom }, i) => {
            const flash = FLASHES.some(([fa, fb]) => tn > fa && tn < fb); // chuyển cảnh lóe trắng của anh → không che
            const o = flash ? 0 : interpolate(tn, [a - 0.15, a, b, b + 0.15], [0, 1, 1, 0], clamp);
            if (o <= 0) return null;
            const z = zoom ? 1 + 0.0135 * (tn - 0.2) : undefined;
            const [x0, y0, x1, y1] = r;
            const F = "6%"; // viền mềm để mảng che hòa vào nền
            const mask = `linear-gradient(to right, ${x0 > 0.01 ? `transparent, black ${F}` : "black, black"}, black ${x1 < 0.99 ? `calc(100% - ${F}), transparent` : "100%"}), linear-gradient(to bottom, transparent, black ${F}, black calc(100% - ${F}), transparent)`;
            return (
              <div key={i} style={{ position: "absolute", left: `${x0 * 100}%`, top: `${y0 * 100}%`, width: `${(x1 - x0) * 100}%`, height: `${(y1 - y0) * 100}%`, overflow: "hidden", opacity: o,
                WebkitMaskImage: mask, WebkitMaskComposite: "source-in", maskComposite: "intersect" }}>
                <Img src={staticFile("images/sosanh/plate24.png")}
                  style={{ position: "absolute", left: `${(-x0 / (x1 - x0)) * 100}%`, top: `${(-y0 / (y1 - y0)) * 100}%`, width: `${100 / (x1 - x0)}%`, height: `${100 / (y1 - y0)}%`,
                    transform: z ? `scale(${z})` : undefined, transformOrigin: `${((0.525 - x0) / (x1 - x0)) * 100}% ${((0.5 - y0) / (y1 - y0)) * 100}%` }} />
              </div>
            );
          })}
        </SrcLayer>
        <LocTag />
      </div>
    </AbsoluteFill>
  );
};

// ── B-roll dọc ───────────────────────────────────────────────────────────────
const src = (n: string) => staticFile(`images/sosanh/${n}.jpg`);
const VShot: React.FC<{ s: Shot }> = ({ s }) => {
  const t = useOld();
  const { outOf } = useContext(TC);
  if (t < s.a - 0.5 || t > s.b + 0.5) return null;
  const o = interpolate(t, [s.a - 0.35, s.a + 0.05], [0, 1], clamp);
  const z = interpolate(t, [s.a - 0.4, s.b + 0.4], [s.z0 ?? 1.0, s.z1 ?? 1.08], clamp);
  const origin = `${s.fx ?? 50}% ${s.fy ?? 50}%`;
  const fill: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", objectPosition: origin, transform: `scale(${z})`, transformOrigin: origin };
  let body: React.ReactNode;
  if (s.mode === "card" || s.mode === "cards2") {
    const cards = s.mode === "cards2" ? [s.img!, s.img2!] : [s.img!];
    body = (
      <>
        <Img src={src(s.img!)} style={{ ...fill, filter: "blur(30px) brightness(0.45)", transform: "scale(1.2)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", gap: 20, alignItems: "center", justifyContent: "center", padding: 30 }}>
          {cards.map((c, i) => (
            <Img key={c} src={src(c)} style={{ maxHeight: IMG_H - 60, maxWidth: cards.length > 1 ? 500 : 1000, borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", opacity: prog(t, s.a + i * 0.5) }} />
          ))}
        </div>
      </>
    );
  } else if (s.vid) {
    const startOut = outOf(oldToNew(Math.max(0, s.a - 0.4)));
    const rate = Math.min(1, ((LEN[s.vid] ?? 4) - 0.15) / (s.b - s.a + 0.8));
    body = (
      <Sequence from={Math.round(startOut * FPS)} layout="none">
        <OffthreadVideo src={staticFile(`video/prive/${s.vid}.mp4`)} muted playbackRate={rate} style={fill} />
      </Sequence>
    );
  } else body = <Img src={src(s.img!)} style={fill} />;
  return <AbsoluteFill style={{ opacity: o, overflow: "hidden" }}>{body}</AbsoluteFill>;
};

const VPanel: React.FC<{ p: PanelDef }> = ({ p }) => {
  const t = useOld();
  if (t < p.a - 0.5 || t > p.b + 0.5) return null;
  const ac = accent(p.brand);
  const lines = p.lines.filter((l) => t > l.at - 0.6);
  const big = lines.filter((l) => l.big).slice(-1)[0];
  const small = lines.filter((l) => !l.big).slice(-4);
  return (
    <div style={{ position: "absolute", left: 64, right: 64, top: PANEL_TOP, opacity: win(t, p.a, p.b, 0.3) }}>
      <Fade at={p.a} t={t}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: 4, color: ac }}>{p.tag}</div>
        <div style={{ height: 2, width: 90 * prog(t, p.a + 0.1, 0.9), background: ac, margin: "12px 0 14px" }} />
      </Fade>
      {p.title && (
        <Fade at={p.titleAt ?? p.a + 0.15} t={t}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 60, color: WHITE, lineHeight: 1.1, marginBottom: 6 }}>{p.title}</div>
        </Fade>
      )}
      {big && (
        <Fade at={big.at} t={t}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: SOFT }}>{big.text}</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 104, color: ac, lineHeight: 1.05 }}>{big.big}</div>
          {big.note && <div style={{ fontFamily: SANS, fontSize: 24, color: DIM }}>{big.note}</div>}
        </Fade>
      )}
      {small.map((l) => (
        <Fade key={l.text} at={l.at} t={t} style={{ marginTop: 10 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
            <span style={{ color: ac, fontSize: 20 }}>◆</span>
            <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 36, color: WHITE, lineHeight: 1.28 }}>{l.text}</span>
          </div>
        </Fade>
      ))}
    </div>
  );
};

// cảnh đặc biệt (thời gian old)
const VCompare: React.FC = () => {
  const t = useOld();
  if (useNew() > 69.35) return null; // không tràn sang clip 2
  const a = 64.5, b = 70.1;
  if (t < a - 0.5 || t > b + 0.5) return null;
  const Row: React.FC<{ brand: Brand; at: number; price: string; area: string; img: string }> = ({ brand, at, price, area, img }) => (
    <div style={{ position: "relative", height: 560, overflow: "hidden", borderRadius: 18, marginBottom: 26 }}>
      <Img src={src(img)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(10px) brightness(0.4)", transform: "scale(1.1)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <Fade at={at} t={t}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 46, letterSpacing: 10, color: WHITE }}>{brandName(brand)}</div>
            <div style={{ fontFamily: SANS, fontSize: 28, color: SOFT, marginTop: 8 }}>Căn 2PN · {area}</div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 150, color: accent(brand), lineHeight: 1.1 }}>{price}</div>
          </div>
        </Fade>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: `rgb(${NAVY})`, padding: "380px 50px 0", opacity: interpolate(t, [a - 0.35, a + 0.05], [0, 1], clamp) }}>
      <Row brand="pv" at={a + 0.05} price="≈ 7,5 tỷ" area="≈ 65 m² thông thủy" img="pv_037" />
      <Row brand="pr" at={a + 0.35} price="≈ 11 tỷ" area="75,8 m² thông thủy" img="pr_t049" />
      <Fade at={a + 1.2} t={t}>
        <div style={{ textAlign: "center", fontFamily: SERIF_I, fontWeight: 500, fontSize: 64, color: WHITE }}>
          Chênh lệch <span style={{ fontFamily: SERIF, fontWeight: 700, color: GOLD }}>≈ 3,7 tỷ</span>
        </div>
      </Fade>
    </AbsoluteFill>
  );
};

const VHandover: React.FC = () => {
  const tn = useNew();
  const a = 195.9, b = 199.6;
  if (tn < a - 0.4 || tn > b + 0.4) return null;
  const o = win(tn, a, b, 0.3);
  const Row: React.FC<{ brand: Brand; at: number; img: string; marks: string[] }> = ({ brand, at, img, marks }) => (
    <div style={{ position: "relative", height: 560, overflow: "hidden", borderRadius: 18, marginBottom: 26 }}>
      <Img src={staticFile(img)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.38)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <Fade at={at} t={tn}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, letterSpacing: 6, color: accent(brand), textAlign: "center" }}>{brandName(brand)}</div>
        </Fade>
        {marks.map((m, i) => (
          <Fade key={m} at={at + 0.2 + i * 0.18} t={tn}>
            <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 56, letterSpacing: 8, color: WHITE, textAlign: "center", marginTop: 8 }}>{m}</div>
          </Fade>
        ))}
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: `rgb(${NAVY})`, padding: "330px 50px 0", opacity: o }}>
      <Fade at={a} t={tn}>
        <div style={{ textAlign: "center", fontFamily: SERIF_I, fontWeight: 500, fontSize: 50, color: WHITE, marginBottom: 26 }}>Bàn giao nội thất cơ bản cao cấp</div>
      </Fade>
      <Row brand="pv" at={a + 0.3} img="images/sosanh/pv_kitchen_frame.jpg" marks={["OPPEIN · BOSCH", "GROHE · DURAVIT"]} />
      <Row brand="pr" at={a + 0.8} img="images/sosanh/pr_m_kitchen.jpg" marks={["HANSGROHE · KOHLER", "AXOR · SMEG"]} />
    </AbsoluteFill>
  );
};
const VComment: React.FC = () => {
  const tn = useNew();
  const a = 199.6, b = 204.65;
  if (tn < a - 0.4 || tn > b + 0.4) return null;
  const o = win(tn, a, b, 0.3);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Img src={staticFile("images/sosanh/pr_m_bath.jpg")} style={{ position: "absolute", top: 0, height: "50%", width: "100%", objectFit: "cover", filter: "blur(14px) brightness(0.35)" }} />
      <Img src={staticFile("images/sosanh/pv_091.jpg")} style={{ position: "absolute", bottom: 0, height: "50%", width: "100%", objectFit: "cover", filter: "blur(14px) brightness(0.35)" }} />
      <AbsoluteFill style={{ background: `rgba(${NAVY},0.55)`, alignItems: "center", justifyContent: "center", textAlign: "center", padding: 70 }}>
        <Fade at={a} t={tn}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, letterSpacing: 5, color: GOLD }}>BẢNG VẬT LIỆU BÀN GIAO CHI TIẾT</div>
        </Fade>
        <Fade at={a + 0.3} t={tn}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 84, color: WHITE, lineHeight: 1.15, marginTop: 24 }}>
            Bình luận <span style={{ fontFamily: SERIF_I, color: GOLD }}>dự án anh chị quan tâm</span>
          </div>
        </Fade>
        <Fade at={a + 1.0} t={tn}>
          <div style={{ fontFamily: SANS, fontSize: 36, color: SOFT, marginTop: 22 }}>Hoàng gửi bảng vật liệu chi tiết của dự án đó</div>
        </Fade>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── tiêu đề clip + phụ đề + kết ─────────────────────────────────────────────
const Header: React.FC<{ title: string; sub: string; tOut: number; part?: number; parts?: number; delay?: number; t0?: number }> = ({ title, sub, tOut, part, parts = 6, delay = 0, t0 = 0 }) => {
  const p = prog(tOut, Math.max(0.1 + delay, t0), 0.7);
  return (
    <div style={{ position: "absolute", top: 150, left: 50, right: 50, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * -20}px)` }}>
      <div style={{ display: "inline-block", background: `rgba(${NAVY},0.86)`, borderRadius: 14, padding: "18px 30px 20px", borderBottom: `3px solid ${GOLD}` }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: 5, color: GOLD }}>
          {part ? <span style={{ background: GOLD, color: `rgb(${NAVY})`, borderRadius: 6, padding: "2px 10px", marginRight: 12, letterSpacing: 2 }}>PHẦN {part}/{parts}</span> : null}
          {sub}
        </div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 54, color: WHITE, lineHeight: 1.15, marginTop: 6 }}>{title}</div>
      </div>
    </div>
  );
};

const Caption: React.FC<{ broll: boolean }> = ({ broll }) => {
  const tn = useNew();
  const c = SS_CAPS.find(([a, b]) => tn >= a && tn < b);
  if (!c || (tn > 63.8 && tn < 69.5) || (tn > 195.85 && tn < 204.65)) return null; // ẩn khi cảnh so sánh giá chiếm toàn màn hình
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: broll ? IMG_TOP + IMG_H - 120 : FACE_TOP + FACE_H + 40, textAlign: "center" }}>
      <span
        style={{
          fontFamily: SANS, fontWeight: 600, fontSize: 40, lineHeight: 1.35, color: WHITE,
          background: "rgba(110,110,115,0.62)", padding: "6px 16px", borderRadius: 10,
          boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone",
        }}
      >
        {c[2]}
      </span>
    </div>
  );
};

// câu mở 1,5s đầu (series TikTok)
const OpenCard: React.FC<{ tOut: number; part: number; parts?: number; l1: string; l2: string; l3: string }> = ({ tOut, part, parts = 6, l1, l2, l3 }) => {
  const o = interpolate(tOut, [0, 0.12, 1.45, 1.75], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  const sc = interpolate(tOut, [0, 0.35], [0.92, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: o, background: `rgba(${NAVY},${0.35 * o})` }}>
      <div style={{ transform: `scale(${sc})`, width: 900, textAlign: "center", background: `rgba(${NAVY},0.93)`, borderRadius: 22, padding: "44px 40px 50px", borderTop: `4px solid ${GOLD}`, boxShadow: "0 30px 90px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "inline-block", background: GOLD, color: `rgb(${NAVY})`, borderRadius: 8, padding: "6px 18px", fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: 3 }}>PHẦN {part}/{parts}</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: 3, color: SOFT, marginTop: 24 }}>{l1}</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 92, color: WHITE, lineHeight: 1.08, marginTop: 10 }}>{l2}</div>
        <div style={{ fontFamily: SERIF_I, fontWeight: 500, fontSize: 52, color: GOLD, marginTop: 14 }}>{l3}</div>
      </div>
    </AbsoluteFill>
  );
};

const NextCard: React.FC<{ tOut: number; total: number; next: string }> = ({ tOut, total, next }) => {
  const o = interpolate(tOut, [total - 2.6, total - 2.2], [0, 1], clamp);
  if (o <= 0) return null;
  const last = next === "CMT";
  return (
    <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1500, bottom: 0, opacity: o, background: `linear-gradient(180deg, rgba(${NAVY},0) 0%, rgb(${NAVY}) 12%, rgb(${NAVY}) 100%)` }} />
    <div style={{ position: "absolute", left: 60, right: 60, top: 1590, textAlign: "center", opacity: o, transform: `translateY(${(1 - o) * 20}px)` }}>
      <div style={{ display: "inline-block", background: GOLD, color: `rgb(${NAVY})`, borderRadius: 12, padding: "14px 30px", fontFamily: SANS, fontWeight: 700, fontSize: 36 }}>
        {last ? "Bình luận PRIVÉ hay PALM 👇" : <>{next} →</>}
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: WHITE, marginTop: 12, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
        {last ? "▶ Bản đầy đủ trên YouTube Minh Hoàng BĐS" : "Xem tiếp trên trang của Hoàng 👆"}
      </div>
    </div>
    </>
  );
};

const EndCard: React.FC<{ tOut: number; total: number }> = ({ tOut, total }) => {
  const o = interpolate(tOut, [total - 3.2, total - 2.7], [0, 1], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1590, textAlign: "center", opacity: o }}>
      <div style={{ display: "inline-block", background: GOLD, color: `rgb(${NAVY})`, borderRadius: 12, padding: "14px 30px", fontFamily: SANS, fontWeight: 700, fontSize: 34 }}>
        ▶ Xem bản đầy đủ trên YouTube
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: WHITE, marginTop: 12, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>Minh Hoàng BĐS</div>
    </div>
  );
};

const Logos: React.FC = () => {
  const tn = useNew();
  const a = 15.0, b = 21.2;
  if (tn < a - 0.4 || tn > b + 0.4) return null;
  return (
    <div style={{ position: "absolute", left: 140, right: 140, top: 420, opacity: win(tn, a, b, 0.35), display: "flex", flexDirection: "column", alignItems: "center", background: `rgba(${NAVY},0.84)`, borderRadius: 14, padding: "34px 30px", borderTop: `3px solid ${GOLD}` }}>
      <Img src={staticFile("images/sosanh/prive_logo_gold.png")} style={{ width: 520 }} />
      <div style={{ fontFamily: SERIF_I, fontSize: 36, color: SOFT, margin: "16px 0" }}>hay</div>
      <Img src={staticFile("images/sosanh/palm_logo_white.png")} style={{ width: 500 }} />
    </div>
  );
};

// ── 1 đoạn (range) của clip ─────────────────────────────────────────────────
const Segment: React.FC<{ from: number; to: number; outStart: number }> = ({ from, to, outStart }) => {
  const f = useCurrentFrame(); // trong Sequence
  const tNew = from + f / FPS;
  const outOf = (x: number) => x - from; // giây tính từ đầu Segment (Sequence lồng trong Segment)
  const broll = inBroll(tNew);
  return (
    <TC.Provider value={{ tNew, outOf }}>
      <AbsoluteFill style={{ background: `rgb(${NAVY})` }}>
        <AbsoluteFill style={{ opacity: broll ? 0 : 1 }}>
          <FaceVideo from={from} to={to} />
        </AbsoluteFill>
        {broll && (
          <>
            <div style={{ position: "absolute", left: 0, right: 0, top: IMG_TOP, height: IMG_H, overflow: "hidden" }}>
              {SHOTS.map((s, i) => (
                <VShot key={i} s={s} />
              ))}
              <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(${NAVY},0.5) 0%, rgba(${NAVY},0) 18%, rgba(${NAVY},0) 70%, rgba(${NAVY},1) 100%)` }} />
            </div>
            {PANELS.map((p, i) => (
              <VPanel key={i} p={p} />
            ))}
          </>
        )}
        <VCompare />
        <VHandover />
        <VComment />
        <Logos />
        <Caption broll={broll} />
      </AbsoluteFill>
    </TC.Provider>
  );
};

export type SoSanhDocProps = { ranges: [number, number][]; title: string; sub: string; part?: number; parts?: number; open?: [string, string, string]; next?: string; sections?: [number, string, string][] };

export const ssDocFrames = (ranges: [number, number][]) => Math.round(ranges.reduce((s, [a, b]) => s + (b - a), 0) * FPS);

export const SoSanhDoc: React.FC<SoSanhDocProps> = ({ ranges, title, sub, part, parts = 6, open, next, sections }) => {
  const frame = useCurrentFrame();
  const tOut = frame / FPS;
  const total = ranges.reduce((s, [a, b]) => s + (b - a), 0);
  let acc = 0;
  return (
    <AbsoluteFill style={{ background: "black" }}>
      {ranges.map(([a, b]) => {
        const start = acc;
        acc += b - a;
        return (
          <Sequence key={a} from={Math.round(start * FPS)} durationInFrames={Math.round((b - a) * FPS)}>
            <Segment from={a} to={b} outStart={start} />
            <Sequence from={0} layout="none">
              <AudioOf from={a} />
            </Sequence>
          </Sequence>
        );
      })}
      {(() => {
        // tiêu đề đổi theo từng mục (chỉ dùng cho clip 1 đoạn liền)
        const tn = ranges[0][0] + tOut;
        const sec = sections ? [...sections].reverse().find(([a]) => tn >= a) : undefined;
        const t0 = sec ? sec[0] - ranges[0][0] : 0;
        return <Header key={sec ? sec[0] : 0} title={sec ? sec[2] : title} sub={sec ? sec[1] : sub} tOut={tOut} part={part} parts={parts} delay={open ? 1.5 : 0} t0={t0} />;
      })()}
      {next ? <NextCard tOut={tOut} total={total} next={next} /> : <EndCard tOut={tOut} total={total} />}
      {open && part ? <OpenCard tOut={tOut} part={part} parts={parts} l1={open[0]} l2={open[1]} l3={open[2]} /> : null}
    </AbsoluteFill>
  );
};

// âm thanh lấy từ chính video user (đã có SFX/nhạc)
const AudioOf: React.FC<{ from: number }> = ({ from }) => <Audio src={staticFile("video/sosanh/final.mp4")} startFrom={Math.round(from * FPS)} />;

export const SS_DOC_CLIPS: { id: string; ranges: [number, number][]; title: string; sub: string }[] = [
  { id: "1-chenh-3-7-ty", ranges: [[0, 13.1], [28.5, 69.3]], title: "Chênh 3,7 tỷ đổi lấy điều gì?", sub: "THE PRIVÉ hay PALM RIVER" },
  { id: "2-vi-tri", ranges: [[69.3, 101.8]], title: "Cùng khu – vị trí khác gì?", sub: "1 · VỊ TRÍ" },
  { id: "3-quy-mo", ranges: [[101.8, 137.2]], title: "12 tháp hay 4 tháp?", sub: "2 · QUY MÔ & CỘNG ĐỒNG" },
  { id: "4-thiet-ke", ranges: [[137.2, 166.1]], title: "Căn vừa phải hay căn rộng 111 m²?", sub: "3 · THIẾT KẾ CĂN HỘ" },
  { id: "5-tien-ich", ranges: [[166.1, 195.8]], title: "99 tiện ích vs Onsen trên không", sub: "4 · TIỆN ÍCH" },
  { id: "6-chon-du-an-nao", ranges: [[240.8, 268.7]], title: "Ai hợp dự án nào?", sub: "THE PRIVÉ hay PALM RIVER" },
];
