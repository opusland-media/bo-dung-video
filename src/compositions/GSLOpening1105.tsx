import React from "react";
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadScript } from "@remotion/google-fonts/DancingScript";

/**
 * Green Skyline — MỞ ĐẦU (clip 1105, dọc 1080×1920, 30fps).
 * v2: chữ nhỏ hơn, mỗi khối một kiểu vào, chữ nhấn gradient XANH, mở đầu chỉ zoom ra (không lóe trắng/nhòe),
 *     camera chuyển động rõ hơn theo từng đoạn + giật zoom ở điểm nhấn.
 * layer: "full" (preview) | "behind" (chữ sau người) | "front" (chữ trước người) — ghép 4K bằng scratchpad/op/comp.py
 * Camera (scale/camY) cũng xuất sang tf.json qua cameraAt() để comp.py dùng đúng giá trị.
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["700", "800", "900"], subsets: ["vietnamese", "latin"] });
const { fontFamily: ANTON } = loadAnton("normal", { weights: ["400"], subsets: ["vietnamese", "latin"] });
const { fontFamily: SCRIPT } = loadScript("normal", { weights: ["700"], subsets: ["vietnamese", "latin"] });

export const OP_FRAMES = 220;
const GREEN_GRAD = "linear-gradient(180deg, #EAFFF2 0%, #9BE8BE 26%, #3FB57A 52%, #1D7A4E 74%, #5CCB92 100%)";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GRADE = "contrast(1.07) saturate(1.14) brightness(1.02)";

// ---------- CAMERA ----------
// mỗi đoạn câu một hướng zoom (cắt zoom ở ranh giới đoạn), + giật nhẹ ở điểm nhấn
const SEGS: [number, number, number, number][] = [
  [0, 58, 1.0, 1.07],     // chỉ từ 47 triệu — đẩy vào
  [58, 92, 1.13, 1.06],   // full nội thất — cắt zoom vào rồi lùi ra
  [92, 128, 1.03, 1.11],  // Green Skyline — đẩy vào
  [128, 174, 1.14, 1.05], // vị trí, chất lượng — lùi ra
  [174, 220, 1.04, 1.12], // quá tốt — đẩy vào
];
const PUNCH = [22, 68, 140, 187];
export const cameraAt = (f: number, fps = 30) => {
  const seg = SEGS.find(([a, b]) => f >= a && f < b) ?? SEGS[SEGS.length - 1];
  let s = interpolate(f, [seg[0], seg[1]], [seg[2], seg[3]], { ...clamp, easing: Easing.inOut(Easing.sin) });
  // mở đầu: zoom ra từ 1.28
  s *= interpolate(f, [0, 14], [1.28, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const punch = PUNCH.reduce((acc, b) => acc + (f >= b ? 0.06 * spring({ frame: f - b, fps, config: { damping: 9, stiffness: 260, mass: 0.5 } }) * Math.exp(-(f - b) / 8) : 0), 0);
  return { scale: s + punch, camY: interpolate(f, [0, OP_FRAMES], [0, -20]) };
};

type Anim = "slam" | "rise" | "left" | "right" | "track" | "wipeX" | "wipeUp" | "flip" | "drop" | "letters" | "fade";
type Exit = "blur" | "up" | "left";

const W: React.FC<{ at: number; out: number; anim: Anim; exit?: Exit; top: number; align?: "center" | "left" | "right"; inset?: number; children: React.ReactNode }> = ({ at, out, anim, exit = "blur", top, align = "center", inset = 70, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < at - 1 || f > out + 7) return null;
  const k = spring({ frame: f - at, fps, config: { damping: 16, stiffness: 190, mass: 0.6 } });
  const lin = interpolate(f, [at, at + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const o = interpolate(f, [out, out + 7], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  let tf = "", blur = 0, clip: string | undefined, persp = "";
  let op = Math.min(1, interpolate(f, [at - 1, at + 3], [0, 1], clamp));
  switch (anim) {
    case "slam": tf = `scale(${1.35 - 0.35 * k})`; blur = (1 - lin) * 18; break;
    case "rise": tf = `translateY(${(1 - k) * 70}px)`; break;
    case "left": tf = `translateX(${(1 - k) * -240}px)`; blur = (1 - lin) * 10; break;
    case "right": tf = `translateX(${(1 - k) * 240}px)`; blur = (1 - lin) * 10; break;
    case "track": op = lin; break;
    case "wipeX": clip = `inset(-30% ${(1 - lin) * 100}% -30% -5%)`; op = 1; break;
    case "wipeUp": clip = `inset(${(1 - lin) * 100}% -5% -20% -5%)`; tf = `translateY(${(1 - lin) * 30}px)`; op = 1; break;
    case "flip": persp = "perspective(900px) "; tf = `rotateX(${(1 - k) * 85}deg)`; break;
    case "drop": tf = `translateY(${(1 - k) * -120}px)`; blur = (1 - lin) * 8; break;
    case "fade": op = lin; tf = `translateY(${(1 - lin) * -14}px)`; break;
    case "letters": op = 1; break;
  }
  let xo = "";
  if (exit === "blur") { blur += o * 12; xo = `scale(${1 + o * 0.1})`; }
  if (exit === "up") { xo = `translateY(${-o * 80}px)`; blur += o * 6; }
  if (exit === "left") { xo = `translateX(${-o * 200}px)`; blur += o * 6; }
  const just = align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end";
  return (
    <div style={{
      position: "absolute", top, left: align === "right" ? "auto" : align === "left" ? inset : 0, right: align === "left" ? "auto" : align === "right" ? inset : 0,
      display: "flex", justifyContent: just, opacity: op * (1 - o), transform: `${persp}${tf} ${xo}`, transformOrigin: "50% 50%",
      filter: blur > 0.2 ? `blur(${blur}px)` : undefined, clipPath: clip,
    }}>
      {anim === "track" ? <Track f={f} at={at}>{children}</Track> : anim === "letters" ? <Letters f={f} at={at} fps={fps}>{children}</Letters> : children}
    </div>
  );
};

const Track: React.FC<{ f: number; at: number; children: React.ReactNode }> = ({ f, at, children }) => {
  const ls = interpolate(f, [at, at + 14], [34, 12], { ...clamp, easing: Easing.out(Easing.cubic) });
  return <div style={{ letterSpacing: ls }}>{children}</div>;
};
const Letters: React.FC<{ f: number; at: number; fps: number; children: React.ReactNode }> = ({ f, at, fps, children }) => {
  const el = children as React.ReactElement<{ children: string }>;
  const txt = String(el.props.children);
  return React.cloneElement(el, {}, txt.split("").map((ch, i) => {
    const kk = spring({ frame: f - at - i * 2, fps, config: { damping: 12, stiffness: 220, mass: 0.5 } });
    return <span key={i} style={{ display: "inline-block", opacity: Math.min(1, kk * 1.5), transform: `translateY(${(1 - kk) * 60}px) scale(${0.7 + 0.3 * kk})` }}>{ch === " " ? " " : ch}</span>;
  }));
};

const Small: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: 12, color: "#fff", textShadow: "0 3px 14px rgba(0,0,0,0.55)" }}>{children}</div>
);
const Script: React.FC<{ size: number; rot: number; children: React.ReactNode }> = ({ size, rot, children }) => (
  <div style={{ fontFamily: SCRIPT, fontWeight: 700, fontSize: size, color: "#fff", transform: `rotate(${rot}deg)`, textShadow: "0 5px 22px rgba(0,0,0,0.55)", padding: "0 14px" }}>{children}</div>
);
const Green: React.FC<{ size: number; font?: string; weight?: number; shineAt: number; children: React.ReactNode; ls?: number }> = ({ size, font = SANS, weight = 900, shineAt, children, ls = 0 }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [shineAt, shineAt + 24], [130, -30], clamp);
  return (
    <div style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.42))" }}>
      <div style={{
        fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 1, letterSpacing: ls,
        backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) 42%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 58%), ${GREEN_GRAD}`,
        backgroundSize: "260% 100%, 100% 100%", backgroundPosition: `${x}% 0, 0 0`, backgroundRepeat: "no-repeat",
        WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", padding: "0.04em 0.02em",
      }}>{children}</div>
    </div>
  );
};
const White: React.FC<{ size: number; font?: string; weight?: number; ls?: number; children: React.ReactNode }> = ({ size, font = SANS, weight = 900, ls = 0, children }) => (
  <div style={{ fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 1, letterSpacing: ls, color: "#fff", textShadow: "0 8px 28px rgba(0,0,0,0.42)" }}>{children}</div>
);

export const GSLOpening1105: React.FC<{ layer?: "full" | "behind" | "front" }> = ({ layer = "full" }) => {
  const showV = layer === "full", showB = layer !== "front", showF = layer !== "behind";
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam = cameraAt(f, fps);

  return (
    <AbsoluteFill style={{ background: showV ? "#000" : "transparent", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${cam.scale}) translateY(${cam.camY}px)` }}>
        {showV && <AbsoluteFill style={{ filter: GRADE }}>
          <OffthreadVideo src={staticFile("video/op1105/base.mp4")} style={{ width: "100%", height: "100%" }} />
        </AbsoluteFill>}
        {showB && (<>
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(6,12,10,0.40) 0%, rgba(6,12,10,0.20) 30%, rgba(6,12,10,0.0) 52%)" }} />
          {/* CHỮ SAU NGƯỜI */}
          <W at={22} out={56} anim="slam" exit="up" top={414}><Green size={380} shineAt={30} ls={-10}>47</Green></W>
          <W at={68} out={90} anim="letters" top={390}><White size={240} ls={-4}>FULL</White></W>
          <W at={75} out={90} anim="wipeUp" top={632}><Green size={125} font={ANTON} weight={400} shineAt={82} ls={4}>NỘI THẤT</Green></W>
          <W at={109} out={126} anim="left" exit="left" top={390}><White size={205} font={ANTON} weight={400} ls={6}>GREEN</White></W>
          <W at={116} out={126} anim="right" exit="left" top={606}><Green size={205} font={ANTON} weight={400} shineAt={120} ls={6}>SKYLINE</Green></W>
          <W at={140} out={152} anim="flip" exit="up" top={536}><White size={225} ls={-3}>VỊ TRÍ</White></W>
          <W at={156} out={172} anim="wipeX" top={420}><Green size={165} font={ANTON} weight={400} shineAt={162} ls={4}>CHẤT LƯỢNG</Green></W>
          <W at={163} out={172} anim="rise" top={606}><White size={155} font={ANTON} weight={400} ls={4}>BÀN GIAO</White></W>
          <W at={180} out={240} anim="drop" top={548} align="left" inset={150}><White size={205} font={ANTON} weight={400}>QUÁ</White></W>
          <W at={187} out={240} anim="slam" top={548} align="right" inset={150}><Green size={205} font={ANTON} weight={400} shineAt={193}>TỐT</Green></W>
        </>)}
        {showV && <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1152, filter: GRADE }}>
          <OffthreadVideo src={staticFile("video/op1105/person_top.webm")} transparent muted style={{ width: "100%", height: "100%" }} />
        </div>}
        {showF && (<>
        {/* CHỮ TRƯỚC NGƯỜI */}
        <W at={1} out={56} anim="track" exit="up" top={322}><Small>CHỈ TỪ</Small></W>
        <W at={32} out={56} anim="wipeX" exit="up" top={718} align="right" inset={150}><Script size={96} rot={-8}>triệu/m²</Script></W>
        <W at={60} out={90} anim="fade" top={322}><Small>BÀN GIAO</Small></W>
        <W at={95} out={126} anim="track" exit="left" top={322}><Small>GIÁ BÁN CỦA</Small></W>
        <W at={128} out={172} anim="fade" top={322}><Small>XÉT VỀ</Small></W>
        <W at={192} out={240} anim="wipeX" top={430}><Script size={76} rot={-5}>ở thời điểm hiện tại</Script></W>

        </>)}
      </AbsoluteFill>

      {showF && (<>
        {f >= 95 && (() => {
          const k = spring({ frame: f - 95, fps, config: { damping: 14, stiffness: 180 } });
          return (
            <div style={{ position: "absolute", left: 0, right: 0, top: 84, display: "flex", justifyContent: "center", opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * -30}px)` }}>
              <div style={{ background: "#FBF7EE", borderRadius: 16, padding: "9px 16px", boxShadow: "0 0 0 3px #3FB57A, 0 12px 34px rgba(0,0,0,0.4)" }}>
                <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 66, display: "block" }} />
              </div>
            </div>
          );
        })()}
        <AbsoluteFill style={{ background: "radial-gradient(120% 85% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.26) 100%)" }} />
      </>)}

      {/* SFX — tiết chế: mỗi điểm một tiếng khác nhau */}
      <Sequence from={0}><Audio src={staticFile("audio/sfx_swish.wav")} volume={0.28} /></Sequence>
      <Sequence from={22}><Audio src={staticFile("audio/sfx_impact.wav")} volume={0.34} /></Sequence>
      <Sequence from={66}><Audio src={staticFile("audio/sfx_pop.wav")} volume={0.15} /></Sequence>
      <Sequence from={106}><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.18} /></Sequence>
      <Sequence from={140}><Audio src={staticFile("audio/sfx_tick.wav")} volume={0.22} /></Sequence>
      <Sequence from={168}><Audio src={staticFile("audio/sfx_riser.wav")} volume={0.2} /></Sequence>
      <Sequence from={187}><Audio src={staticFile("audio/sfx_impact.wav")} volume={0.4} /></Sequence>
    </AbsoluteFill>
  );
};
