import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadUnb } from "@remotion/google-fonts/Unbounded";
import { At } from "./GSLCSData";

/**
 * Chữ mở đầu (8 giây đầu) — 3 kiểu để chọn:
 *  A "Chữ hẹp đóng khung": Anton in hoa rất to, hiện cứng đúng nhịp nói + đẩy nhẹ như máy dí vào.
 *  B "Serif biên tập": Fraunces nghiêng to + Inter mảnh, lộ bằng mặt nạ quét trái→phải.
 *  C "Chữ rộng": Unbounded đậm in hoa, trồi lên từ mặt nạ.
 * Không blur / glow / gradient / nảy.
 */
const VI = { subsets: ["vietnamese", "latin"] as ("vietnamese" | "latin")[] };
const ANTON = loadAnton("normal", { weights: ["400"], ...VI }).fontFamily;
const FRA = loadFraunces("italic", { weights: ["500", "600"], ...VI }).fontFamily;
const INTER = loadInter("normal", { weights: ["300", "500", "600", "700"], ...VI }).fontFamily;
const UNB = loadUnb("normal", { weights: ["300", "500", "800"], ...VI }).fontFamily;

export type HookStyle = "A" | "B" | "C";
const MOSS = "#C3D29E";
const CREAM = "#EADBB8";
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pr = (f: number, a: number, d: number) => interpolate(f, [a, a + d], [0, 1], { ...clamp, easing: ease });

type Role = "s" | "b" | "x"; // nhỏ / to / to-nhấn màu
type Row = { t: string; role: Role; at: At; size?: number };
type Card = { from: At; to: At; toOff?: number; top: number; rows: Row[]; chips?: At; tags?: At[] };

/* lời thoại: "Mua Green Skyline lúc này mình sẽ được ưu đãi những gì, sau đây là tổng hợp toàn bộ chính sách bán hàng … dự án Green Skyline." */
const CARDS: Card[] = [
  { from: [0, "Mua"], to: [0, "lúc"], top: 250, rows: [
    { t: "Mua", role: "s", at: [0, "Mua"] },
    { t: "Green", role: "b", at: [0, "Green"] },
    { t: "Skyline", role: "b", at: [0, "Skyline"] } ] },
  { from: [0, "lúc"], to: [0, "được"], top: 250, rows: [
    { t: "lúc này", role: "x", at: [0, "lúc"] } ] },
  { from: [0, "được"], to: [1, "sau"], top: 250, chips: [0, "gì"], rows: [
    { t: "được", role: "s", at: [0, "được"] },
    { t: "ưu đãi", role: "x", at: [0, "ưu"] },
    { t: "gì?", role: "b", at: [0, "gì"] } ] },
  { from: [1, "tổng"], to: [1, "dành"], top: 250, tags: [[1, "sách"], [1, "bán"], [1, "hàng"]], rows: [
    { t: "tổng hợp", role: "s", at: [1, "tổng"] },
    { t: "toàn bộ", role: "b", at: [1, "toàn"] },
    { t: "chính sách", role: "x", at: [1, "chính"] } ] },
  { from: [1, "Green"], to: [2, "Đầu"], toOff: -3, top: 1060, rows: [
    { t: "Chính sách bán hàng", role: "s", at: [1, "Green"] },
    { t: "Green", role: "b", at: [1, "Green"] },
    { t: "Skyline", role: "x", at: [1, "Skyline"] } ] },
];

type Spec = { font: string; weight: number; size: number; lh: number; ls: number; upper: boolean; color: string };
const SPEC: Record<HookStyle, Record<Role, Spec>> = {
  A: {
    s: { font: INTER, weight: 600, size: 44, lh: 1.25, ls: 5, upper: true, color: "#fff" },
    b: { font: ANTON, weight: 400, size: 150, lh: 1.08, ls: 0, upper: true, color: "#fff" },
    x: { font: ANTON, weight: 400, size: 150, lh: 1.08, ls: 0, upper: true, color: "#fff" },
  },
  B: {
    s: { font: INTER, weight: 300, size: 70, lh: 1.2, ls: 0, upper: false, color: "#fff" },
    b: { font: FRA, weight: 500, size: 210, lh: 1.08, ls: -4, upper: false, color: "#fff" },
    x: { font: FRA, weight: 600, size: 210, lh: 1.08, ls: -4, upper: false, color: CREAM },
  },
  C: {
    s: { font: UNB, weight: 300, size: 46, lh: 1.3, ls: 2, upper: true, color: "#fff" },
    b: { font: UNB, weight: 800, size: 128, lh: 1.15, ls: -3, upper: true, color: "#fff" },
    x: { font: UNB, weight: 800, size: 128, lh: 1.15, ls: -3, upper: true, color: MOSS },
  },
};
/* chữ quá dài so với khung 860px thì thu nhỏ theo từng kiểu */
const FIT: Record<HookStyle, Record<string, number>> = {
  A: {},
  B: { "chính sách": 175 },
  C: { "chính sách": 110, "skyline": 118 },
};

const RowView: React.FC<{ r: Row; at: number; st: HookStyle }> = ({ r, at, st }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const sp = SPEC[st][r.role];
  const size = FIT[st][r.t.toLowerCase()] && r.role !== "s" ? FIT[st][r.t.toLowerCase()] : sp.size;
  const h = Math.round(size * sp.lh);
  const t = sp.upper ? r.t.toUpperCase() : r.t;
  const shadow = "0 2px 4px rgba(0,0,0,0.35), 0 6px 30px rgba(0,0,0,0.35)";
  const base: React.CSSProperties = { fontFamily: sp.font, fontWeight: sp.weight, fontSize: size, lineHeight: `${h}px`, letterSpacing: sp.ls, color: sp.color, whiteSpace: "nowrap", textShadow: shadow };
  if (st === "A") {
    // hiện cứng đúng khung hình, đẩy 1.07 → 1 trong 4 hình (như máy dí vào), không mờ dần
    const k = pr(f, at, 4);
    const sc = r.role === "s" ? 1 : 1.07 - 0.07 * k;
    return <div style={{ ...base, height: h, transform: `scale(${sc})`, transformOrigin: "0% 80%" }}>{t}</div>;
  }
  if (st === "B") {
    const k = pr(f, at, r.role === "s" ? 5 : 7);
    return <div style={{ ...base, height: h, paddingRight: 30, clipPath: `inset(-20% ${100 - k * 100}% -20% 0)`, transform: `translateX(${(1 - k) * -18}px)` }}>{t}</div>;
  }
  const k = pr(f, at, 6);
  return (
    <div style={{ overflow: "hidden", height: h, paddingTop: 0 }}>
      <div style={{ ...base, transform: `translateY(${(1 - k) * h}px)` }}>{t}</div>
    </div>
  );
};

export const HookText: React.FC<{ wt: (a: At) => number; st: HookStyle }> = ({ wt, st }) => {
  const f = useCurrentFrame();
  const sp = SPEC[st];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {CARDS.map((c, i) => {
        const a = wt(c.from) - 1, b = wt(c.to) + (c.toOff ?? -2);
        if (f < a || f >= b) return null;
        const low = c.top > 900;
        return (
          <React.Fragment key={i}>
            <AbsoluteFill style={{ background: low
              ? "linear-gradient(0deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.25) 34%, rgba(0,0,0,0) 52%)"
              : "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0) 48%)" }} />
            <div style={{ position: "absolute", left: 112, top: c.top, width: 860 }}>
              {c.rows.map((r, j) => <RowView key={j} r={r} at={wt(r.at)} st={st} />)}
              {c.tags && (
                <div style={{ display: "flex", gap: 26, marginTop: 26 }}>
                  {["TÂN GIA", "CỘNG THÊM", "THANH TOÁN"].map((s, j) => {
                    const t0 = wt(c.tags![j]);
                    if (f < t0) return null;
                    return <div key={j} style={{ fontFamily: st === "C" ? UNB : INTER, fontWeight: 500, fontSize: 32, letterSpacing: 3, color: "#fff", borderTop: "3px solid #fff", paddingTop: 10, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>{s}</div>;
                  })}
                </div>
              )}
            </div>
            {c.chips && <Chips at={wt(c.chips)} st={st} />}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/* ba con số ưu đãi chạy dọc dưới khung — hiện cứng cách nhau 3 hình */
const Chips: React.FC<{ at: number; st: HookStyle }> = ({ at, st }) => {
  const f = useCurrentFrame();
  const rows: [string, string][] = [["6–8%", "CHIẾT KHẤU TÂN GIA"], ["+1,5%", "CỘNG THÊM KHI MUA NHIỀU"], ["+9%", "THANH TOÁN NHANH"]];
  const numF = st === "A" ? ANTON : st === "B" ? FRA : UNB;
  const numS = st === "A" ? 78 : st === "B" ? 112 : 62;
  const numW = st === "A" ? 210 : st === "B" ? 330 : 290;
  const numC = st === "B" ? CREAM : st === "A" ? "#fff" : MOSS;
  return (
    <div style={{ position: "absolute", left: 112, top: 1180, width: 860 }}>
      {rows.map(([n, k], i) => {
        const a = at + i * 3;
        if (f < a) return null;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, borderTop: "2px solid rgba(255,255,255,0.85)", padding: "6px 0 4px", textShadow: "0 2px 12px rgba(0,0,0,0.55)" }}>
            <div style={{ width: numW, fontFamily: numF, fontWeight: st === "C" ? 800 : st === "B" ? 600 : 400, fontSize: numS, lineHeight: `${numS * 1.12}px`, letterSpacing: st === "C" ? -2 : 0, color: numC }}>{n}</div>
            <div style={{ fontFamily: st === "C" ? UNB : INTER, fontWeight: 500, fontSize: st === "C" ? 26 : 30, letterSpacing: st === "C" ? 1 : 2, color: "#fff", whiteSpace: "nowrap" }}>{k}</div>
          </div>
        );
      })}
    </div>
  );
};

/* mốc âm thanh cho chữ mở đầu (theo mẫu TikTok): mỗi cụm chữ khoá 1 tiếng "tách" giòn, chữ nhấn màu → "hit",
   số/nhãn nhỏ → "tick"; tên dự án → hơi dâng + hit. Không đặt tiếng ở mỗi lần cắt hình. */
export type SfxEv = { f: number; n: string; v: number };
export const hookTextSfx = (wt: (a: At) => number): SfxEv[] => {
  const out: SfxEv[] = [];
  CARDS.forEach((c) => {
    c.rows.forEach((r) => {
      if (r.role === "x") out.push({ f: wt(r.at), n: "hit", v: 0.8 });
      else if (r.role === "b") out.push({ f: wt(r.at), n: "snap", v: 0.78 });
    });
    c.tags?.forEach((a) => out.push({ f: wt(a), n: "tick", v: 0.75 }));
  });
  const ch = wt([0, "gì"]);
  [0, 1, 2].forEach((i) => out.push({ f: ch + 3 + i * 3, n: "tick", v: 0.8 }));
  out.push({ f: wt([1, "Green"]) - 18, n: "rise", v: 0.75 });
  return out;
};
const PRI: Record<string, number> = { hit: 4, swoosh: 3, snap: 2, rise: 1, tick: 0 };
/* bỏ bớt tiếng chồng nhau: trong 6 hình chỉ giữ 1 tiếng mạnh nhất (rise là tiếng nền dâng, không tính) */
export const thinSfx = (ev: SfxEv[], gap = 6): SfxEv[] => {
  const keep: SfxEv[] = [];
  [...ev].sort((a, b) => PRI[b.n] - PRI[a.n]).forEach((e) => {
    if (e.n === "rise" || e.n === "tick" || !keep.some((k) => k.n !== "rise" && k.n !== "tick" && Math.abs(k.f - e.f) < gap)) keep.push(e);
  });
  return keep.sort((a, b) => a.f - b.f);
};
