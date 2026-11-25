import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBVP } from "@remotion/google-fonts/BeVietnamPro";

/**
 * "The Privé hay Palm River?" — lớp phủ cho video quay thật của Minh Hoàng (4:31, 30fps).
 * Thiết kế 1920×1080, render --scale=2 → 3840×2160, ProRes 4444 nền trong suốt.
 *  - SoSanhBroll: hình/video phủ kín ở các đoạn anh đọc kịch bản; trong suốt ở đoạn nhìn camera.
 *  - SoSanhText : chữ nổi nhẹ ở các đoạn nhìn camera (file riêng, có thể bỏ).
 * Mốc thời gian = thời gian trong file "prive so sanh.mp4" (Whisper).
 */
const { fontFamily: SERIF } = loadPlayfair("normal", { weights: ["500", "600", "700"], subsets: ["vietnamese", "latin"] });
const { fontFamily: SERIF_I } = loadPlayfair("italic", { weights: ["500", "600"], subsets: ["vietnamese", "latin"] });
const { fontFamily: SANS } = loadBVP("normal", { weights: ["400", "500", "600"], subsets: ["vietnamese", "latin"] });

const FPS = 30;
export const SS_TOTAL_SEC = 270.7;
export const SS_TOTAL_FRAMES = Math.round(SS_TOTAL_SEC * FPS);

const NAVY = "11,24,46";
const GOLD = "#E3C27A"; // The Privé
const AQUA = "#9FD8E8"; // Palm River
const WHITE = "#FFFFFF";
const SOFT = "rgba(255,255,255,0.82)";
const DIM = "rgba(255,255,255,0.6)";

export type Brand = "pv" | "pr" | "none";
const accent = (b: Brand) => (b === "pr" ? AQUA : GOLD);
const brandName = (b: Brand) => (b === "pr" ? "PALM RIVER" : b === "pv" ? "THE PRIVÉ" : "");

// ── helpers ──────────────────────────────────────────────────────────────────
const useT = () => useCurrentFrame() / FPS;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const prog = (t: number, at: number, dur = 0.7) => interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing: ease });
const win = (t: number, a: number, b: number, f = 0.3) => interpolate(t, [a - f, a, b, b + f], [0, 1, 1, 0], clamp);

const Fade: React.FC<{ at: number; dur?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, dur = 0.6, y = 14, children, style }) => {
  const p = prog(useT(), at, dur);
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * y}px)`, ...style }}>{children}</div>;
};
const Reveal: React.FC<{ at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, dur = 0.8, children, style }) => {
  const p = prog(useT(), at, dur);
  return (
    <div style={{ overflow: "hidden", paddingTop: 6, paddingBottom: 10, ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)`, opacity: Math.min(1, p * 1.6) }}>{children}</div>
    </div>
  );
};
const Rule: React.FC<{ at: number; w?: number; color?: string }> = ({ at, w = 90, color = GOLD }) => (
  <div style={{ height: 2, width: w * prog(useT(), at, 0.9), background: color, margin: "10px 0 12px" }} />
);

// ── shots (nền hình / video) ─────────────────────────────────────────────────
export const LEN: Record<string, number> = {
  garden_aerial: 5.9, river: 3.4, sunset_river: 2.2, pool_aerial: 4.6, pool_night: 2.2, park_river: 1.6, banquet: 2.6, sports: 2.3, golf: 1.6,
  gym: 1.1, living: 8.9, kitchen: 4.6, towers_glow: 1.5, celebrate: 3.8, nightpen: 3.7, tower_up: 1.6,
};
export type Shot = {
  a: number; b: number;
  img?: string; vid?: string;
  fx?: number; fy?: number; z0?: number; z1?: number;
  mode?: "cover" | "card" | "cards2";
  img2?: string;
};
const src = (n: string) => staticFile(`images/sosanh/${n}.jpg`);

const Cover: React.FC<{ s: Shot; t: number }> = ({ s, t }) => {
  const z = interpolate(t, [s.a - 0.4, s.b + 0.4], [s.z0 ?? 1.0, s.z1 ?? 1.08], clamp);
  const origin = `${s.fx ?? 50}% ${s.fy ?? 50}%`;
  const style: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", objectPosition: origin, transform: `scale(${z})`, transformOrigin: origin };
  if (s.vid) {
    const span = s.b - s.a + 0.8;
    const rate = Math.min(1, ((LEN[s.vid] ?? 4) - 0.15) / span);
    return (
      <Sequence from={Math.round(Math.max(0, s.a - 0.4) * FPS)} layout="none">
        <OffthreadVideo src={staticFile(`video/prive/${s.vid}.mp4`)} muted playbackRate={rate} style={style} />
      </Sequence>
    );
  }
  return <Img src={src(s.img!)} style={style} />;
};

const CardShot: React.FC<{ s: Shot; t: number }> = ({ s, t }) => {
  const z = interpolate(t, [s.a - 0.4, s.b + 0.4], [1.0, 1.04], clamp);
  const cards = s.mode === "cards2" ? [s.img!, s.img2!] : [s.img!];
  return (
    <AbsoluteFill>
      <Img src={src(s.img!)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(38px) brightness(0.45)", transform: "scale(1.15)" }} />
      <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(${NAVY},0.85) 0%, rgba(${NAVY},0.35) 45%, rgba(${NAVY},0.1) 100%)` }} />
      <div style={{ position: "absolute", right: 90, top: 70, bottom: 70, display: "flex", gap: 34, alignItems: "center", transform: `scale(${z})`, transformOrigin: "80% 50%" }}>
        {cards.map((c, i) => (
          <Img key={c} src={src(c)} style={{ height: 940, borderRadius: 14, boxShadow: "0 30px 80px rgba(0,0,0,0.55)", opacity: prog(t, s.a + i * 0.5, 0.6) }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Shots: React.FC<{ list: Shot[] }> = ({ list }) => {
  const t = useT();
  return (
    <>
      {list.map((s, i) => {
        if (t < s.a - 0.5 || t > s.b + 0.5) return null;
        const o = interpolate(t, [s.a - 0.35, s.a + 0.05], [0, 1], clamp);
        return (
          <AbsoluteFill key={i} style={{ opacity: o }}>
            {s.mode === "card" || s.mode === "cards2" ? <CardShot s={s} t={t} /> : <Cover s={s} t={t} />}
          </AbsoluteFill>
        );
      })}
    </>
  );
};

// ── info panel ───────────────────────────────────────────────────────────────
export type Line = { at: number; text: string; big?: string; note?: string };
export type PanelDef = { a: number; b: number; brand: Brand; tag: string; title?: string; titleAt?: number; lines: Line[]; pos?: "bl" | "br" | "tl" };

const Panel: React.FC<{ p: PanelDef }> = ({ p }) => {
  const t = useT();
  if (t < p.a - 0.5 || t > p.b + 0.5) return null;
  const o = win(t, p.a, p.b, 0.35);
  const ac = accent(p.brand);
  const pos = p.pos ?? "bl";
  const right = pos === "br";
  const top = pos === "tl";
  return (
    <>
      <AbsoluteFill
        style={{
          opacity: o,
          background: top
            ? `linear-gradient(180deg, rgba(${NAVY},0.82) 0%, rgba(${NAVY},0.35) 38%, rgba(${NAVY},0) 60%)`
            : right
              ? `linear-gradient(270deg, rgba(${NAVY},0.88) 0%, rgba(${NAVY},0.45) 32%, rgba(${NAVY},0) 55%)`
              : `linear-gradient(90deg, rgba(${NAVY},0.88) 0%, rgba(${NAVY},0.45) 32%, rgba(${NAVY},0) 55%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          opacity: o,
          width: 640,
          ...(top ? { left: 96, top: 84 } : right ? { right: 96, bottom: 96, textAlign: "right" } : { left: 96, bottom: 96 }),
        }}
      >
        <Fade at={p.a}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 19, letterSpacing: 5, color: ac }}>{p.tag}</div>
        </Fade>
        <div style={{ display: "flex", justifyContent: right ? "flex-end" : "flex-start" }}>
          <Rule at={p.a + 0.1} color={ac} />
        </div>
        {p.title && (
          <Reveal at={p.titleAt ?? p.a + 0.15}>
            <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 50, color: WHITE, lineHeight: 1.12 }}>{p.title}</div>
          </Reveal>
        )}
        {p.lines.map((l, i) => (
          <Fade key={i} at={l.at} style={{ marginTop: l.big ? 14 : 10 }}>
            {l.big ? (
              <div>
                <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 21, color: SOFT, letterSpacing: 1 }}>{l.text}</div>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 84, color: ac, lineHeight: 1.05 }}>{l.big}</div>
                {l.note && <div style={{ fontFamily: SANS, fontSize: 18, color: DIM, marginTop: 4 }}>{l.note}</div>}
              </div>
            ) : (
              <div style={{ display: "flex", gap: 14, alignItems: "baseline", justifyContent: right ? "flex-end" : "flex-start" }}>
                {!right && <span style={{ color: ac, fontSize: 18 }}>◆</span>}
                <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 27, color: WHITE, lineHeight: 1.3 }}>{l.text}</span>
                {right && <span style={{ color: ac, fontSize: 18 }}>◆</span>}
              </div>
            )}
          </Fade>
        ))}
      </div>
    </>
  );
};

// ── special scenes ───────────────────────────────────────────────────────────
const Compare: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const t = useT();
  if (t < a - 0.5 || t > b + 0.5) return null;
  const o = interpolate(t, [a - 0.35, a + 0.05], [0, 1], clamp);
  const Col: React.FC<{ brand: Brand; at: number; price: string; area: string }> = ({ brand, at, price, area }) => (
    <div style={{ width: 560, textAlign: "center" }}>
      <Fade at={at}>
        <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 40, letterSpacing: 9, color: WHITE }}>{brandName(brand)}</div>
        <div style={{ height: 2, width: 70, background: accent(brand), margin: "16px auto 22px" }} />
        <div style={{ fontFamily: SANS, fontSize: 24, color: SOFT }}>Căn 2PN · {area}</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 120, color: accent(brand), lineHeight: 1.1, marginTop: 6 }}>{price}</div>
        <div style={{ fontFamily: SANS, fontSize: 21, color: DIM }}>Thanh toán nhanh</div>
      </Fade>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Img src={src("pv_037")} style={{ position: "absolute", left: 0, width: "50%", height: "100%", objectFit: "cover", filter: "blur(18px) brightness(0.35)" }} />
      <Img src={src("pr_t049")} style={{ position: "absolute", right: 0, width: "50%", height: "100%", objectFit: "cover", filter: "blur(18px) brightness(0.35)" }} />
      <AbsoluteFill style={{ background: `rgba(${NAVY},0.45)` }} />
      <div style={{ position: "absolute", top: 200, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 220 }}>
        <Col brand="pv" at={a + 0.05} price="≈ 7,5 tỷ" area="≈ 65 m² thông thủy" />
        <Col brand="pr" at={a + 0.35} price="≈ 11 tỷ" area="75,8 m² thông thủy" />
      </div>
      <div style={{ position: "absolute", left: 958, top: 230, width: 2, height: 330, background: "rgba(255,255,255,0.25)" }} />
      <div style={{ position: "absolute", bottom: 150, left: 0, right: 0, textAlign: "center" }}>
        <Reveal at={a + 1.3}>
          <div style={{ fontFamily: SERIF_I, fontWeight: 500, fontSize: 64, color: WHITE }}>
            Chênh lệch <span style={{ fontFamily: SERIF, fontWeight: 700, color: GOLD }}>≈ 3,7 tỷ</span>
          </div>
        </Reveal>
        <Fade at={a + 2.2}>
          <div style={{ fontFamily: SANS, fontSize: 18, color: DIM, marginTop: 10 }}>Giá Palm River tạm tính theo giá thị trường tham khảo 168 tr/m² thông thủy</div>
        </Fade>
      </div>
    </AbsoluteFill>
  );
};

const Handover: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const t = useT();
  if (t < a - 0.5 || t > b + 0.5) return null;
  const o = interpolate(t, [a - 0.35, a + 0.05], [0, 1], clamp);
  const Side: React.FC<{ brand: Brand; at: number; marks: string[] }> = ({ brand, at, marks }) => (
    <div style={{ width: "50%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Fade at={at}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, letterSpacing: 6, color: accent(brand), textAlign: "center" }}>{brandName(brand)}</div>
      </Fade>
      <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
        {marks.map((m, i) => (
          <Fade key={m} at={at + 0.25 + i * 0.22}>
            <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 52, letterSpacing: 8, color: WHITE }}>{m}</div>
          </Fade>
        ))}
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ left: 0, width: "50%" }}>
        <Sequence from={Math.round((a - 0.4) * FPS)} layout="none">
          <OffthreadVideo src={staticFile("video/prive/kitchen.mp4")} muted playbackRate={0.9} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.4)" }} />
        </Sequence>
      </AbsoluteFill>
      <Img src={src("pr_m_kitchen")} style={{ position: "absolute", right: 0, width: "50%", height: "100%", objectFit: "cover", filter: "brightness(0.4)" }} />
      <AbsoluteFill style={{ background: `rgba(${NAVY},0.35)` }} />
      <div style={{ position: "absolute", top: 90, left: 0, right: 0, textAlign: "center" }}>
        <Reveal at={a}>
          <div style={{ fontFamily: SERIF_I, fontWeight: 500, fontSize: 46, color: WHITE }}>Bàn giao nội thất cơ bản cao cấp</div>
        </Reveal>
      </div>
      <AbsoluteFill style={{ flexDirection: "row", top: 90 }}>
        <Side brand="pv" at={a + 0.4} marks={["OPPEIN", "BOSCH", "GROHE", "DURAVIT"]} />
        <Side brand="pr" at={a + 0.9} marks={["HANSGROHE", "KOHLER", "AXOR", "SMEG"]} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 959, top: 300, width: 2, height: 560, background: "rgba(255,255,255,0.22)" }} />
    </AbsoluteFill>
  );
};

const CommentCard: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const t = useT();
  if (t < a - 0.5 || t > b + 0.5) return null;
  const o = interpolate(t, [a - 0.35, a + 0.05], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Img src={src("pr_m_bath")} style={{ position: "absolute", left: 0, width: "50%", height: "100%", objectFit: "cover", filter: "blur(16px) brightness(0.35)" }} />
      <Img src={src("pv_091")} style={{ position: "absolute", right: 0, width: "50%", height: "100%", objectFit: "cover", filter: "blur(16px) brightness(0.35)" }} />
      <AbsoluteFill style={{ background: `rgba(${NAVY},0.5)`, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <Fade at={a}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 21, letterSpacing: 6, color: GOLD }}>BẢNG VẬT LIỆU BÀN GIAO CHI TIẾT</div>
        </Fade>
        <div style={{ height: 2, width: 90 * prog(t, a + 0.2, 0.9), background: GOLD, margin: "18px auto 22px" }} />
        <Reveal at={a + 0.3}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 64, color: WHITE, lineHeight: 1.15 }}>
            Bình luận <span style={{ fontFamily: SERIF_I, color: GOLD }}>dự án anh chị quan tâm</span>
          </div>
        </Reveal>
        <Fade at={a + 1.0}>
          <div style={{ fontFamily: SANS, fontSize: 27, color: SOFT, marginTop: 14 }}>Hoàng gửi bảng vật liệu chi tiết của dự án đó</div>
        </Fade>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── timeline: B-roll ─────────────────────────────────────────────────────────
export const BLOCKS: [number, number][] = [
  [35.0, 131.75],
  [138.36, 193.05],
  [197.48, 242.65],
];

export const SHOTS: Shot[] = [
  // GIÁ – The Privé
  { a: 35.0, b: 40.6, vid: "garden_aerial" },
  { a: 40.6, b: 45.8, img: "pv_051", fx: 50, fy: 60 },
  { a: 45.8, b: 50.1, img: "pv_064", fx: 60, fy: 55 },
  // GIÁ – Palm River
  { a: 50.1, b: 56.3, img: "pr_t049", fx: 60, fy: 50, z0: 1.0, z1: 1.12 },
  { a: 56.3, b: 64.5, img: "pr_m_living", fx: 40, fy: 50 },
  // 1. VỊ TRÍ – hạ tầng chung
  { a: 70.1, b: 77.3, img: "pv_032", fx: 30, fy: 55, z0: 1.0, z1: 1.35 },
  { a: 77.3, b: 80.5, img: "pr_masterplan", fx: 58, fy: 14, z0: 1.05, z1: 1.45 },
  // môi trường xung quanh
  { a: 80.5, b: 83.0, vid: "river" },
  { a: 83.0, b: 85.8, img: "pv_039", fx: 60, fy: 40 },
  { a: 85.8, b: 89.8, img: "pr_t060", fx: 62, fy: 50 },
  { a: 89.8, b: 91.9, img: "pr_t047", fx: 55, fy: 60, z0: 1.05, z1: 1.18 },
  { a: 91.9, b: 94.2, img: "pr_t034", fx: 50, fy: 45 },
  { a: 94.2, b: 95.8, img: "pr_masterplan", fx: 84, fy: 22, z0: 1.3, z1: 1.45 },
  { a: 95.8, b: 99.2, img: "pr_masterplan", fx: 62, fy: 55, z0: 1.25, z1: 1.35 },
  { a: 99.2, b: 102.6, img: "pr_masterplan", fx: 60, fy: 32, z0: 1.3, z1: 1.4 },
  // 2. QUY MÔ – The Privé
  { a: 102.6, b: 110.8, img: "pv_038", fx: 50, fy: 40 },
  { a: 110.8, b: 113.7, vid: "pool_night" },
  { a: 113.7, b: 120.2, img: "pv_040", fx: 80, fy: 55, z0: 1.0, z1: 1.4 },
  // Palm River
  { a: 120.2, b: 125.9, img: "pr_saban4", fx: 50, fy: 50 },
  { a: 125.9, b: 131.75, img: "pr_floor", fx: 50, fy: 50, z0: 1.0, z1: 1.06 },
  // 3. THIẾT KẾ – The Privé
  { a: 138.36, b: 142.0, img: "pv_042", fx: 50, fy: 50 },
  { a: 142.0, b: 144.3, img: "pv_044", fx: 75, fy: 55, z0: 1.0, z1: 1.05 },
  { a: 144.3, b: 146.6, img: "pv_069", fx: 75, fy: 55, z0: 1.0, z1: 1.05 },
  { a: 146.6, b: 152.85, vid: "living" },
  // Palm River
  { a: 152.85, b: 158.9, img: "pr_card2pngoc", img2: "pr_card2pndb", mode: "cards2" },
  { a: 158.9, b: 161.9, img: "pr_card3pndb", mode: "card" },
  { a: 161.9, b: 165.0, img: "pr_t058", fx: 60, fy: 50 },
  { a: 165.0, b: 167.44, img: "pr_m_living", fx: 30, fy: 50, z0: 1.05, z1: 1.15 },
  // 4. TIỆN ÍCH – The Privé
  { a: 167.44, b: 169.7, img: "pv_048", fx: 50, fy: 55 },
  { a: 169.7, b: 172.1, vid: "pool_night" },
  { a: 172.1, b: 174.8, vid: "park_river", fx: 30 },
  { a: 174.8, b: 176.1, vid: "banquet" },
  { a: 176.1, b: 177.2, vid: "sports", fx: 40 },
  { a: 177.2, b: 178.5, vid: "gym" },
  // Palm River
  { a: 178.5, b: 182.5, img: "pr_t068", fx: 50, fy: 50 },
  { a: 182.5, b: 183.7, img: "pr_t087", fx: 55, fy: 55 },
  { a: 183.7, b: 184.8, img: "pr_t070", fx: 45, fy: 55 },
  { a: 184.8, b: 187.5, img: "pr_t079", fx: 50, fy: 55 },
  { a: 187.5, b: 188.4, img: "pr_t089", fx: 50, fy: 50 },
  { a: 188.4, b: 189.1, img: "pr_t088", fx: 50, fy: 50 },
  { a: 189.1, b: 190.2, img: "pr_t082", fx: 50, fy: 50 },
  { a: 190.2, b: 193.05, img: "pr_t064", fx: 50, fy: 50 },
  // 6. TIẾN ĐỘ – The Privé (5. BÀN GIAO + CTA là scene riêng)
  { a: 206.36, b: 209.2, img: "pv_016", fx: 60, fy: 50 },
  { a: 209.2, b: 214.2, img: "pv_td3", fx: 50, fy: 45 },
  { a: 214.2, b: 219.0, img: "pv_td5", fx: 50, fy: 40 },
  { a: 219.0, b: 226.0, img: "pv_051", fx: 50, fy: 55, z0: 1.05, z1: 1.15 },
  // Palm River
  { a: 226.0, b: 228.3, img: "pr_saban4", fx: 50, fy: 55, z0: 1.1, z1: 1.18 },
  { a: 228.3, b: 230.4, img: "pr_reception", fx: 50, fy: 50 },
  { a: 230.4, b: 238.8, img: "pr_finance", mode: "card" },
  { a: 238.8, b: 242.65, img: "pr_t049", fx: 40, fy: 50 },
];

export const PANELS: PanelDef[] = [
  {
    a: 35.0, b: 50.1, brand: "pv", tag: "THE PRIVÉ · GIAI ĐOẠN 2", title: "Căn 2 phòng ngủ",
    lines: [
      { at: 37.2, text: "Đang bán tháp 9 · 10 · 11 · sắp mở tháp 12" },
      { at: 43.6, text: "Thông thủy ≈ 65 m²" },
      { at: 46.2, text: "Giá niêm yết 9,3 tỷ" },
      { at: 48.6, text: "Thanh toán nhanh còn khoảng", big: "7,5 tỷ" },
    ],
  },
  {
    a: 50.1, b: 64.5, brand: "pr", tag: "PALM RIVER · CHƯA MỞ BÁN CHÍNH THỨC", title: "Căn 2PN góc",
    lines: [
      { at: 53.3, text: "Giá thị trường tham khảo 168 tr/m² thông thủy" },
      { at: 57.8, text: "Thông thủy 75,8 m²" },
      { at: 61.2, text: "Thanh toán nhanh khoảng", big: "11 tỷ", note: "≈ 146 triệu / m² thông thủy" },
    ],
  },
  {
    a: 70.1, b: 80.5, brand: "none", tag: "1 · VỊ TRÍ — HẠ TẦNG DÙNG CHUNG", pos: "tl",
    lines: [
      { at: 72.9, text: "Đường Song Hành" },
      { at: 73.9, text: "Cao tốc TP.HCM – Long Thành" },
      { at: 75.5, text: "Nút giao An Phú" },
      { at: 77.6, text: "Ga Bình Trưng – đường sắt Thủ Thiêm – Long Thành (tương lai)" },
    ],
  },
  {
    a: 80.5, b: 85.8, brand: "pv", tag: "THE PRIVÉ", title: "Bán đảo 3 mặt sông", titleAt: 83.3, pos: "tl",
    lines: [{ at: 85.0, text: "Tách biệt · nhiều không gian mặt nước" }],
  },
  {
    a: 85.8, b: 102.6, brand: "pr", tag: "PALM RIVER", title: "Ven sông Giồng Ông Tố", titleAt: 88.1,
    lines: [
      { at: 90.0, text: "Bến du thuyền riêng" },
      { at: 92.0, text: "Trong đô thị Palm City ≈ 30 ha" },
      { at: 94.8, text: "Đã có trường quốc tế Mỹ" },
      { at: 96.4, text: "Palm Residence · Palm Heights đã có cư dân" },
      { at: 99.3, text: "Bệnh viện quốc tế · TTTM: trong lộ trình" },
    ],
  },
  {
    a: 102.6, b: 120.2, brand: "pv", tag: "2 · QUY MÔ & CỘNG ĐỒNG — THE PRIVÉ", pos: "tl", title: "Một đại đô thị", titleAt: 105.0,
    lines: [
      { at: 105.8, text: "6,7 ha · 12 tháp" },
      { at: 108.6, text: "Mật độ xây dựng ≈ 25%" },
      { at: 111.5, text: "Phần lớn dành cho cây xanh & hồ bơi" },
      { at: 114.5, text: "Giai đoạn 2: tháp 9 · 10 · 11 · 12 — mũi bán đảo" },
    ],
  },
  {
    a: 120.2, b: 131.75, brand: "pr", tag: "PALM RIVER", title: "Hướng đi khác", titleAt: 120.9, pos: "br",
    lines: [
      { at: 122.1, text: "1,89 ha · 4 tháp" },
      { at: 124.4, text: "≈ 620 căn hộ" },
      { at: 126.5, text: "Chỉ 4 – 6 căn mỗi sàn" },
      { at: 128.2, text: "5 thang máy mỗi tháp" },
      { at: 129.9, text: "1 chỗ đậu ô tô / căn" },
    ],
  },
  {
    a: 138.36, b: 152.85, brand: "pv", tag: "3 · THIẾT KẾ CĂN HỘ — THE PRIVÉ", title: "Dải sản phẩm rộng", titleAt: 140.6,
    lines: [
      { at: 142.0, text: "1PN ≈ 45 m² → 3PN góc ≈ 89 m² thông thủy" },
      { at: 146.8, text: "Layout vuông" },
      { at: 148.0, text: "Logia & sân phơi tách riêng" },
      { at: 149.9, text: "Hợp gia đình trẻ · diện tích vừa phải" },
    ],
  },
  {
    a: 152.85, b: 167.44, brand: "pr", tag: "PALM RIVER", title: "Thiên về căn rộng", titleAt: 153.5,
    lines: [
      { at: 154.8, text: "2PN: 76 → 111 m² thông thủy" },
      { at: 158.9, text: "3PN: lên tới 145 m²" },
      { at: 161.9, text: "Gần 80% là căn góc · 2 mặt thoáng" },
      { at: 165.0, text: "Trần 3 m · kính từ sàn tới trần" },
    ],
  },
  {
    a: 167.44, b: 178.5, brand: "pv", tag: "4 · TIỆN ÍCH — THE PRIVÉ",
    lines: [
      { at: 168.3, text: "Hơn", big: "99 tiện ích" },
      { at: 169.7, text: "3 hồ bơi điện phân muối > 3.000 m²" },
      { at: 172.1, text: "Công viên ven sông gần 1 km" },
      { at: 174.8, text: "5 phòng tiệc riêng cho cư dân" },
      { at: 176.1, text: "Pickleball · gym · golf 3D" },
    ],
  },
  {
    a: 178.5, b: 193.05, brand: "pr", tag: "PALM RIVER · CHĂM SÓC SỨC KHỎE",
    lines: [
      { at: 179.3, text: "Hơn", big: "68 tiện ích" },
      { at: 182.5, text: "Onsen trên không" },
      { at: 183.7, text: "Hồ bơi 70 m" },
      { at: 184.8, text: "Hồ bơi vô cực · nước ấm 27°C" },
      { at: 187.5, text: "Gym trên cao · thư viện · rạp phim riêng" },
      { at: 190.2, text: "Khối đế thương mại ≈ 30.000 m²" },
    ],
  },
  {
    a: 206.36, b: 226.0, brand: "pv", tag: "6 · TIẾN ĐỘ & CHÍNH SÁCH — THE PRIVÉ",
    lines: [
      { at: 207.5, text: "Giai đoạn 2 do CSCEC thi công" },
      { at: 210.5, text: "Giai đoạn 1 đã vượt tầng 20" },
      { at: 212.5, text: "Đang bán tháp 9 · 10 · 11 · sắp mở tháp 12" },
      { at: 220.6, text: "Thanh toán nhanh" },
      { at: 222.0, text: "Vay hỗ trợ lãi suất 24 tháng" },
      { at: 224.2, text: "Quà sinh nhật tập đoàn" },
    ],
  },
  {
    a: 226.0, b: 242.65, brand: "pr", tag: "PALM RIVER",
    lines: [
      { at: 226.5, text: "Khởi công tháng 6/2026" },
      { at: 228.5, text: "Dự kiến bàn giao cuối năm 2028" },
      { at: 231.5, text: "Vay tới 75%" },
      { at: 232.8, text: "Hỗ trợ lãi suất 24 tháng" },
      { at: 235.3, text: "Ân hạn nợ gốc 36 – 60 tháng" },
      { at: 239.2, text: "Ưu đãi: chờ CĐT công bố khi mở bán" },
    ],
  },
];

/** solid=true: xuất MP4 từng khối (không mờ dần về trong suốt ở 2 đầu). */
export const SoSanhBroll: React.FC<{ solid?: boolean }> = ({ solid }) => {
  const t = useT();
  const blk = BLOCKS.find(([a, b]) => t > a - 0.4 && t < b + 0.4);
  if (!blk) return <AbsoluteFill />;
  const o = solid ? 1 : win(t, blk[0], blk[1], 0.25);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: `rgb(${NAVY})` }} />
      <Shots list={SHOTS} />
      <Compare a={64.5} b={70.1} />
      <Handover a={197.48} b={201.28} />
      <CommentCard a={201.28} b={206.36} />
      {PANELS.map((p, i) => (
        <Panel key={i} p={p} />
      ))}
    </AbsoluteFill>
  );
};

// ── timeline: chữ nổi đoạn nhìn camera ───────────────────────────────────────
const Tag: React.FC<{ at: number; brand: Brand; label: string; value?: string; size?: number }> = ({ at, brand, label, value, size = 64 }) => (
  <Fade at={at} y={20}>
    <div style={{ display: "inline-block", padding: "16px 26px 18px", background: `rgba(${NAVY},0.72)`, borderLeft: `3px solid ${accent(brand)}`, borderRadius: 6, marginBottom: 16 }}>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 18, letterSpacing: 4, color: accent(brand) }}>{label}</div>
      {value && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, color: WHITE, lineHeight: 1.1, marginTop: 4 }}>{value}</div>}
    </div>
  </Fade>
);

const Group: React.FC<{ a: number; b: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ a, b, style, children }) => {
  const t = useT();
  if (t < a - 0.5 || t > b + 0.5) return null;
  return <div style={{ position: "absolute", opacity: win(t, a, b, 0.3), ...style }}>{children}</div>;
};

const SumCard: React.FC<{ at: number; brand: Brand; items: [number, string][] }> = ({ at, brand, items }) => (
  <Fade at={at} y={24}>
    <div style={{ width: 470, padding: "26px 30px 22px", background: `rgba(${NAVY},0.78)`, borderTop: `3px solid ${accent(brand)}`, borderRadius: 8 }}>
      <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 34, letterSpacing: 7, color: WHITE }}>{brandName(brand)}</div>
      <div style={{ height: 1, width: 60, background: accent(brand), margin: "12px 0 14px" }} />
      {items.map(([t0, s]) => (
        <Fade key={s} at={t0} style={{ marginTop: 8 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
            <span style={{ color: accent(brand), fontSize: 15 }}>◆</span>
            <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 25, color: WHITE, lineHeight: 1.3 }}>{s}</span>
          </div>
        </Fade>
      ))}
    </div>
  </Fade>
);

export const SoSanhText: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Mở đầu: 2 mức giá */}
      <Group a={5.0} b={13.8} style={{ left: 90, top: 250 }}>
        <Tag at={6.0} brand="pv" label="CĂN 2 PHÒNG NGỦ" value="≈ 7,5 tỷ" />
        <br />
        <Tag at={8.9} brand="pr" label="CĂN 2 PHÒNG NGỦ" value="≈ 11 tỷ" />
        <br />
        <Fade at={10.8}>
          <div style={{ fontFamily: SERIF_I, fontWeight: 500, fontSize: 46, color: GOLD, marginTop: 6 }}>Chênh gần 4 tỷ?</div>
        </Fade>
      </Group>
      {/* Tên 2 dự án — logo trên thẻ nền tối để không chìm vào tường */}
      <Group a={15.8} b={22.0} style={{ left: 90, top: 290 }}>
        <div style={{ width: 520, padding: "34px 40px 36px", background: `rgba(${NAVY},0.82)`, borderRadius: 8, borderTop: `3px solid ${GOLD}`, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Fade at={16.2}>
            <Img src={staticFile("images/sosanh/prive_logo_gold.png")} style={{ width: 420 }} />
          </Fade>
          <Fade at={16.9}>
            <div style={{ fontFamily: SERIF_I, fontSize: 30, color: SOFT, margin: "18px 0 20px" }}>hay</div>
          </Fade>
          <Fade at={17.4}>
            <Img src={staticFile("images/sosanh/palm_logo_white.png")} style={{ width: 400 }} />
          </Fade>
        </div>
      </Group>
      {/* Giá */}
      <Group a={29.4} b={34.9} style={{ left: 90, top: 380 }}>
        <Tag at={29.5} brand="pv" label="1 · SO SÁNH GIÁ" value="Căn 2PN · thanh toán nhanh" size={40} />
      </Group>
      {/* Cộng đồng */}
      <Group a={132.0} b={138.3} style={{ left: 90, top: 300 }}>
        <Tag at={132.6} brand="pv" label="THE PRIVÉ" value="Cộng đồng lớn, rộng rãi" size={40} />
        <br />
        <Tag at={135.5} brand="pr" label="PALM RIVER" value="Nhỏ hơn, riêng tư hơn" size={40} />
      </Group>
      {/* Tiện ích chốt */}
      <Group a={193.2} b={197.4} style={{ left: 90, top: 300 }}>
        <Tag at={193.4} brand="pv" label="THE PRIVÉ" value="Rộng · nhiều cây xanh" size={40} />
        <br />
        <Tag at={194.9} brand="pr" label="PALM RIVER" value="Tinh gọn · nghỉ dưỡng trong nhà" size={40} />
      </Group>
      {/* Kết: ai hợp dự án nào */}
      <Group a={242.8} b={261.6} style={{ left: 90, top: 150 }}>
        <Fade at={242.9}>
          <div style={{ fontFamily: SERIF_I, fontWeight: 500, fontSize: 46, color: WHITE, marginBottom: 22 }}>Chọn dự án nào?</div>
        </Fade>
        <SumCard
          at={244.4}
          brand="pv"
          items={[
            [244.9, "Mua ngay, chính sách có sẵn"],
            [247.2, "Không gian xanh, nhiều tiện ích"],
            [249.6, "1 – 2 phòng ngủ · ≈ 6 – 8 tỷ"],
          ]}
        />
      </Group>
      <Group a={254.0} b={261.6} style={{ right: 90, top: 236 }}>
        <SumCard
          at={254.2}
          brand="pr"
          items={[
            [254.9, "Không gian rộng rãi hơn"],
            [256.6, "Riêng tư · nhiều căn góc"],
            [258.4, "Tiện ích chăm sóc sức khỏe"],
          ]}
        />
      </Group>
      {/* CTA cuối */}
      <Group a={261.8} b={270.6} style={{ left: 90, bottom: 120 }}>
        <Tag at={261.9} brand="pv" label="ANH CHỊ NGHIÊNG VỀ DỰ ÁN NÀO?" value="Bình luận bên dưới" size={44} />
      </Group>
      <Group a={262.5} b={270.6} style={{ left: 0, right: 0, bottom: 40, textAlign: "center" }}>
        <Fade at={262.6}>
          <div style={{ fontFamily: SANS, fontSize: 17, color: SOFT, textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}>
            Giá Palm River là giá thị trường tham khảo, chưa phải giá chính thức của chủ đầu tư. Chính sách The Privé tháp 9 – 10 – 11 áp dụng đến 08/11/2026.
          </div>
        </Fade>
      </Group>
    </AbsoluteFill>
  );
};
