import React from "react";
import { interpolate, Easing, useCurrentFrame, Audio, Sequence, staticFile } from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadLexend } from "@remotion/google-fonts/Lexend";
import { loadFont as loadGreat } from "@remotion/google-fonts/GreatVibes";
import { loadFont as loadAlex } from "@remotion/google-fonts/AlexBrush";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadUnbounded } from "@remotion/google-fonts/Unbounded";

/**
 * Bộ tiêu đề động kiểu "template chữ CapCut BĐS" (học từ reel HC Film 15/11/2026).
 * Công thức chung: 1 dòng dẫn nhỏ (sans mảnh) + 1 chữ khoá to (sans đen đậm, gradient) + 1 chữ script viết tay chồng lệch.
 * Mỗi chữ vào bằng: mờ→rõ + blur→nét + trượt ngắn; script lộ dần trái→phải (như đang viết); số to thì bật scale.
 * SFX: whoosh nhẹ ở chữ khoá, "ting"/chime khi có lấp lánh. Font đều có subset tiếng Việt.
 */
export const F = {
  sans: loadMont("normal", { weights: ["400", "600", "800", "900"], subsets: ["vietnamese", "latin"] }).fontFamily,
  light: loadLexend("normal", { weights: ["300", "400"], subsets: ["vietnamese", "latin"] }).fontFamily,
  script: loadGreat("normal", { weights: ["400"], subsets: ["vietnamese", "latin"] }).fontFamily,
  brush: loadAlex("normal", { weights: ["400"], subsets: ["vietnamese", "latin"] }).fontFamily,
  serif: loadPlayfair("normal", { weights: ["700", "800"], subsets: ["vietnamese", "latin"] }).fontFamily,
};

export const GRAD = {
  gold: "linear-gradient(180deg, #FFF4C2 0%, #F7D35C 45%, #E0A92B 100%)",
  fire: "linear-gradient(180deg, #FF2A1A 0%, #F2441C 45%, #F59A2A 100%)",
  sky: "linear-gradient(180deg, #7FD3FF 0%, #2E8BFF 60%, #1D5FE0 100%)",
  lime: "linear-gradient(180deg, #E4FF7A 0%, #9BE33A 100%)",
  white: "linear-gradient(180deg, #FFFFFF 0%, #D9DEE6 100%)",
};

const ez = Easing.bezier(0.22, 1, 0.36, 1);
const p = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ez });

/** Chữ vào: mờ + blur + trượt (dx,dy). Ra: mờ dần ở cuối (outAt). */
export const In: React.FC<{ at: number; dur?: number; dx?: number; dy?: number; blur?: number; outAt?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, dur = 12, dx = 0, dy = 24, blur = 14, outAt, children, style }) => {
  const f = useCurrentFrame();
  const t = p(f, at, at + dur);
  const o = outAt !== undefined ? 1 - p(f, outAt, outAt + 8) : 1;
  return (
    <div style={{ opacity: t * o, filter: `blur(${(1 - t) * blur}px)`, transform: `translate(${(1 - t) * dx}px, ${(1 - t) * dy}px)`, ...style }}>{children}</div>
  );
};

/** Script lộ dần trái→phải như đang viết tay. */
export const Write: React.FC<{ at: number; dur?: number; outAt?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, dur = 18, outAt, children, style }) => {
  const f = useCurrentFrame();
  const t = p(f, at, at + dur);
  const o = outAt !== undefined ? 1 - p(f, outAt, outAt + 8) : 1;
  const edge = t * 120 - 10;
  return (
    <div style={{ opacity: o, WebkitMaskImage: `linear-gradient(90deg, #000 ${edge}%, transparent ${edge + 12}%)`, maskImage: `linear-gradient(90deg, #000 ${edge}%, transparent ${edge + 12}%)`, ...style }}>{children}</div>
  );
};

/** Số/chữ to bật scale (overshoot nhẹ). */
export const Pop: React.FC<{ at: number; outAt?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, outAt, children, style }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [at, at + 7, at + 12], [0.55, 1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = p(f, at, at + 5) * (outAt !== undefined ? 1 - p(f, outAt, outAt + 8) : 1);
  return <div style={{ opacity: o, transform: `scale(${s})`, transformOrigin: "50% 70%", ...style }}>{children}</div>;
};

/** Chữ gradient đổ khối + vệt sáng quét qua (glint). */
export const GradText: React.FC<{ g: string; size: number; font?: string; weight?: number; stroke?: string; glintAt?: number; ls?: number; children: React.ReactNode }> = ({ g, size, font = F.sans, weight = 900, stroke = "rgba(0,0,0,0.55)", glintAt, ls = 0, children }) => {
  const f = useCurrentFrame();
  const gx = glintAt !== undefined ? interpolate(f, [glintAt, glintAt + 16], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : -100;
  const bg = glintAt !== undefined ? `linear-gradient(100deg, transparent ${gx - 12}%, rgba(255,255,255,0.85) ${gx}%, transparent ${gx + 12}%), ${g}` : g;
  return (
    <div style={{ filter: `drop-shadow(0 3px 0 ${stroke}) drop-shadow(0 10px 22px rgba(0,0,0,0.5))` }}>
      <div style={{ fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 1, letterSpacing: ls, backgroundImage: bg, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", padding: "0.12em 0.04em 0.06em", whiteSpace: "nowrap" }}>{children}</div>
    </div>
  );
};

/** Hạt lấp lánh quanh chữ script. */
export const Sparkles: React.FC<{ at: number; n?: number; w: number; h: number; color?: string }> = ({ at, n = 10, w, h, color = "#FFFFFF" }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const d = at + (i * 37) % 22;
        const life = interpolate(f, [d, d + 8, d + 22], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const x = ((i * 97) % 100) / 100 * w, y = ((i * 53) % 100) / 100 * h;
        const s = 6 + (i % 3) * 4;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, opacity: life, transform: `scale(${0.4 + life}) rotate(45deg)`, background: color, boxShadow: `0 0 ${s * 2}px ${color}`, borderRadius: 2 }} />;
      })}
    </div>
  );
};

/* ============ 5 MẪU TIÊU ĐỀ ============ */
type Base = { at?: number; outAt?: number; sfx?: boolean };
const Sfx: React.FC<{ at: number; src: string; vol?: number }> = ({ at, src, vol = 0.5 }) => (
  <Sequence from={at} durationInFrames={45} layout="none"><Audio src={staticFile(src)} volume={vol} /></Sequence>
);

/** 1. "Nghỉ dưỡng Chuẩn / THƯỢNG LƯU" — dẫn mảnh từng chữ + chữ khoá trượt lên + icon bật. */
export const TLuxeStack: React.FC<Base & { lead: string[]; key1: string; g?: string; icon?: React.ReactNode; size?: number }> = ({ at = 0, outAt, sfx = true, lead, key1, g = GRAD.gold, icon, size = 118 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
    <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
      {lead.map((w, i) => (
        <In key={i} at={at + i * 6} dy={10} outAt={outAt}>
          <div style={{ fontFamily: i === lead.length - 1 ? F.sans : F.light, fontWeight: i === lead.length - 1 ? 600 : 300, fontSize: size * 0.48, color: "#fff" }}>{w}</div>
        </In>
      ))}
    </div>
    <In at={at + lead.length * 6 + 2} dy={40} blur={18} outAt={outAt} style={{ marginTop: -size * 0.08 }}>
      <GradText g={g} size={size} weight={800} glintAt={at + lead.length * 6 + 16}>{key1}</GradText>
    </In>
    {icon && <div style={{ position: "absolute", right: -size * 0.55, top: -size * 0.25 }}><Pop at={at + lead.length * 6 + 12} outAt={outAt}>{icon}</Pop></div>}
    {sfx && <><Sfx at={at + lead.length * 6} src="audio/sfx_whoosh.wav" vol={0.45} />{icon && <Sfx at={at + lead.length * 6 + 12} src="audio/sfx_chime.wav" vol={0.35} />}</>}
  </div>
);

/** 2. "Chỉ với / 50 / Triệu / Booking" — số to bật, đơn vị trượt từ phải, script viết dưới. */
export const TBigNumber: React.FC<Base & { pre: string; num: string; unit: string; post?: string; g?: string; size?: number }> = ({ at = 0, outAt, sfx = true, pre, num, unit, post, g = GRAD.fire, size = 300 }) => (
  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
    <div style={{ position: "absolute", left: size * 0.02, top: -size * 0.12 }}>
      <In at={at} dy={0} dx={-20} outAt={outAt}><div style={{ fontFamily: F.script, fontSize: size * 0.26, color: "#E7B36A" }}>{pre}</div></In>
    </div>
    <Pop at={at + 8} outAt={outAt}><GradText g={g} size={size} ls={-size * 0.03}>{num}</GradText></Pop>
    <div style={{ display: "flex", flexDirection: "column", marginLeft: size * 0.04 }}>
      <In at={at + 16} dx={40} dy={0} outAt={outAt}><GradText g={GRAD.fire} size={size * 0.2} weight={800}>{unit}</GradText></In>
    </div>
    {post && <div style={{ position: "absolute", left: size * 0.75, bottom: -size * 0.16 }}>
      <Write at={at + 22} outAt={outAt}><div style={{ fontFamily: F.script, fontSize: size * 0.28, color: "#fff", whiteSpace: "nowrap" }}>{post}</div></Write>
    </div>}
    {sfx && <Sfx at={at + 8} src="audio/sfx_impact.wav" vol={0.4} />}
  </div>
);

/** 3. "penthouse / XA HOA" — script nhỏ viết trước, chữ khoá lao từ trái vào (blur ngang). */
export const TScriptBold: React.FC<Base & { script: string; key1: string; g?: string; size?: number }> = ({ at = 0, outAt, sfx = true, script, key1, g = GRAD.sky, size = 150 }) => (
  <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
    <Write at={at} dur={16} outAt={outAt} style={{ marginBottom: -size * 0.12, marginLeft: -size * 1.1 }}>
      <div style={{ fontFamily: F.script, fontSize: size * 0.42, color: "#fff" }}>{script}</div>
    </Write>
    <In at={at + 10} dx={-160} dy={0} blur={26} dur={10} outAt={outAt}><GradText g={g} size={size} weight={900} font={F.sans} glintAt={at + 24}>{key1}</GradText></In>
    {sfx && <Sfx at={at + 9} src="audio/sfx_swish.wav" vol={0.5} />}
  </div>
);

/** 4. "Đánh Thức / Mọi Giác Quan" — serif đậm hiện từ blur, script màu chanh viết tay + lấp lánh. */
export const TSerifScript: React.FC<Base & { serif: string; script1: string; script2?: string; color?: string; size?: number }> = ({ at = 0, outAt, sfx = true, serif, script1, script2, color = "#A8EB45", size = 90 }) => (
  <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 10 }}>
    <In at={at} dy={0} blur={22} dur={14} outAt={outAt} style={{ marginTop: size * 0.35 }}><div style={{ fontFamily: F.serif, fontWeight: 800, fontSize: size, color: "#fff", textShadow: "0 6px 18px rgba(0,0,0,0.6)" }}>{serif}</div></In>
    <div style={{ position: "relative", marginTop: -size * 0.2 }}>
      <Write at={at + 12} outAt={outAt}><div style={{ fontFamily: F.script, fontSize: size * 1.25, color, lineHeight: 0.9, textShadow: `0 0 18px ${color}55` }}>{script1}</div></Write>
      {script2 && <Write at={at + 20} outAt={outAt} style={{ marginLeft: -size * 0.9, marginTop: size * 0.12 }}><div style={{ fontFamily: F.script, fontSize: size * 1.05, color, lineHeight: 0.9, whiteSpace: "nowrap", textShadow: `0 0 18px ${color}55` }}>{script2}</div></Write>}
      <Sparkles at={at + 22} w={size * 3} h={size * 1.8} color="#F4FFD0" />
    </div>
    {sfx && <Sfx at={at + 14} src="audio/sfx_chime.wav" vol={0.35} />}
  </div>
);

/** 5. "Tinh Tế / Là ĐỈNH CAO / Của XA XỈ" — bậc thang, mỗi dòng 1 nhịp, chữ khoá gradient + glint. */
export const TStair: React.FC<Base & { lines: { small: string; big?: string }[]; g?: string; size?: number }> = ({ at = 0, outAt, sfx = true, lines, g = GRAD.fire, size = 88 }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    {lines.map((l, i) => (
      <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 14, marginLeft: i * size * 0.7, marginTop: i ? -size * 0.12 : 0 }}>
        <In at={at + i * 8} dy={14} outAt={outAt}><div style={{ fontFamily: F.light, fontWeight: 300, fontSize: size * (l.big ? 0.5 : 0.85), color: "#fff" }}>{l.small}</div></In>
        {l.big && <In at={at + i * 8 + 4} dy={30} outAt={outAt}><GradText g={g} size={size} weight={900} glintAt={at + i * 8 + 14}>{l.big}</GradText></In>}
        {sfx && l.big && <Sfx at={at + i * 8 + 4} src="audio/sfx_whoosh.wav" vol={0.35} />}
      </div>
    ))}
  </div>
);

/* ============ KIỂU MỞ ĐẦU "KINETIC" (học từ 6 reel Pinterest BĐS, 15/11/2026) ============
 * - Chữ chạy theo từng từ lời thoại; từ nối nhỏ (sans 500), từ khoá rất to (900), xếp 2–3 tầng lệch nhau.
 * - Chữ đặt ở nửa trên khung, người đi tới camera che một phần chữ (chữ sau người → cần lớp người tách nền).
 * - Chữ khoá hay "ăn" vào cảnh: hoà trộn texture (mix-blend overlay/multiply) hoặc màu lấy từ cảnh (đỏ đô, navy, nâu espresso, cam san hô).
 * - Vào: blur+phóng nhẹ → nét; hoặc từng chữ cái so le; Ra: mờ+blur nhanh 6–8 frame, câu sau hiện tại chỗ.
 */

export const F2 = {
  inter: loadInter("normal", { weights: ["400", "500", "700", "800", "900"], subsets: ["vietnamese", "latin"] }).fontFamily,
  interI: loadInter("italic", { weights: ["700", "800", "900"], subsets: ["vietnamese", "latin"] }).fontFamily,
  condensed: loadOswald("normal", { weights: ["600", "700"], subsets: ["vietnamese", "latin"] }).fontFamily,
  wide: loadUnbounded("normal", { weights: ["800", "900"], subsets: ["vietnamese", "latin"] }).fontFamily,
};

export const KCOL = {
  wine: "linear-gradient(180deg, #B3262B 0%, #7E1418 100%)",
  coral: "linear-gradient(90deg, #F2703A 0%, #E2465A 55%, #B9437E 100%)",
  navy: "linear-gradient(180deg, #2C4E8C 0%, #16294F 100%)",
  espresso: "linear-gradient(180deg, #5A3523 0%, #2E1A10 100%)",
  white: "linear-gradient(180deg, #FFFFFF 0%, #EDEDED 100%)",
};

type KAnim = "blur" | "letters" | "wipe" | "drop";
/** Một từ kinetic: anim vào, out = frame bắt đầu ra (mờ+blur). blend = hoà trộn vào cảnh (overlay/multiply/soft-light). */
export const KWord: React.FC<{
  t: string; at: number; out?: number; size: number; font?: string; weight?: number; g?: string; color?: string; italic?: boolean;
  anim?: KAnim; blend?: React.CSSProperties["mixBlendMode"]; opacity?: number; ls?: number; shadow?: boolean; style?: React.CSSProperties;
}> = ({ t, at, out, size, font = F2.inter, weight = 900, g, color = "#fff", italic, anim = "blur", blend, opacity = 1, ls = 0, shadow = true, style }) => {
  const f = useCurrentFrame();
  const o = out !== undefined ? 1 - p(f, out, out + 7) : 1;
  const ob = out !== undefined ? p(f, out, out + 7) * 16 : 0;
  const base: React.CSSProperties = {
    fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 0.95, letterSpacing: ls, whiteSpace: "nowrap", fontStyle: italic ? "italic" : "normal",
    ...(g ? { backgroundImage: g, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } : { color }),
    padding: "0.2em 0.06em 0.06em",
  };
  const wrap: React.CSSProperties = { mixBlendMode: blend, opacity: opacity * o, filter: `${shadow && !blend ? "drop-shadow(0 4px 14px rgba(0,0,0,0.35))" : ""} blur(${ob}px)`, ...style };
  if (anim === "letters") {
    return (
      <div style={wrap}><div style={{ ...base, display: "flex", backgroundImage: undefined, color: undefined }}>
        {[...t].map((ch, i) => {
          const tt = p(f, at + i * 2, at + i * 2 + 9);
          return <span key={i} style={{ ...base, padding: 0, display: "inline-block", opacity: tt, transform: `translateY(${(1 - tt) * size * 0.35}px)`, filter: `blur(${(1 - tt) * 10}px)`, whiteSpace: "pre" }}>{ch}</span>;
        })}
      </div></div>
    );
  }
  const tt = p(f, at, at + (anim === "drop" ? 8 : 11));
  const tf = anim === "blur" ? `scale(${1 + (1 - tt) * 0.18})` : anim === "drop" ? `translateY(${(tt - 1) * size * 0.5}px)` : "none";
  const mask = anim === "wipe" ? { WebkitMaskImage: `linear-gradient(90deg, #000 ${tt * 115 - 10}%, transparent ${tt * 115 + 5}%)` } : {};
  return (
    <div style={{ ...wrap, opacity: (anim === "wipe" ? 1 : tt) * opacity * o, ...mask }}>
      <div style={{ ...base, transform: tf, filter: anim === "blur" ? `blur(${(1 - tt) * 18}px)` : undefined }}>{t}</div>
    </div>
  );
};
