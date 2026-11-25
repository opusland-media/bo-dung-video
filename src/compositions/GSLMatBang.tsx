import React from "react";
import {
  AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing,
} from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import TIMING from "../data/mb_timing.json";

/**
 * Green Skyline — TỔNG HỢP CĂN GIÁ TỐT NHẤT (studio → 3PN) + 3 phương án thanh toán. Dọc 1080×1920, 30fps, lồng tiếng Hoàng.
 * Flycam tổng (dừng hình ở "gồm 4 tháp", gắn nhãn tháp + số tầng) → mặt bằng tổng (36%, hồ) → công viên →
 * mỗi căn: vị trí trên mặt bằng → bảng chiết khấu + Nhanh / Chuẩn / Vay trên cảnh thật → tổng kết vay 10% → nhắn mã căn.
 * Giá = gồm VAT ước tính (×1,0908), chưa KPBT. CK: 8%+1% (T2), 6%+1%+full nội thất (T1 Skyline Central); nhanh +9%, chuẩn +3%,
 * vay theo bảng giá vay không có CK phương thức. CSBH 149/2026.
 * Mốc thời gian: src/data/mb_timing.json (ước lượng; có giọng thật thì thay bằng whisper).
 * Vùng an toàn TikTok: chữ trong x 108–972, y 150–1770 — kiểm bằng props safeCheck (log SAFE_FAIL).
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["500", "600", "700", "800", "900"], subsets: ["vietnamese", "latin"] });
const { fontFamily: SERIF } = loadPlayfair("normal", { weights: ["700"], subsets: ["vietnamese", "latin"] });

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, b: number, ease = Easing.out(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });
const sp = (f: number, at: number, damping = 14, stiffness = 160) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness, mass: 0.7 } });
const inR = (f: number, a: number, b: number) => f >= a && f < b;

const CREAM = "#FBF8F1";
const GOLD = "#E2B865";
const MINT = "#5CCB92";
const GOLDGRAD = "linear-gradient(180deg,#FFF3D1 0%,#F2D08A 35%,#D9A649 62%,#B9842F 82%,#F1CE85 100%)";
const MX = 112; // lề an toàn ~10% (TikTok phóng to cắt mép) — chữ phải nằm trong x 108–972
const PAPER = "rgb(250,248,244)";
const INKG = "#1F2E27";

// ===== mốc thời gian =====
type Sent = { start: number; end: number; beats: Record<string, number> };
const SENTS = TIMING.sents as unknown as Record<string, Sent>;
const VO_LEAD = 0.4;
const F = (id: string, beat?: string) => s(VO_LEAD + SENTS[id].start + (beat ? SENTS[id].beats[beat] ?? 0 : 0));
const E = (id: string) => s(VO_LEAD + SENTS[id].end);
const END_HOLD = 3.0;
export const MB_FRAMES = s(VO_LEAD + TIMING.total + END_HOLD);

const T = {
  freeze: F("m4") - 4,          // flycam dừng hình
  plan: F("m6") - 8,            // mặt bằng tổng
  park: F("m6", "ho") - 2,      // công viên nội khu
  sIntro: F("s1") - 8, sPlan: F("s2") - 8, sBoard: F("s3") - 8,
  aPlan: F("a1") - 8, aBoard: F("a2") - 8,
  cPlan: F("c1") - 8, cBoard: F("c2") - 8,
  ePlan: F("e1") - 8, eBoard: F("e3") - 8,
  sum: F("z1") - 8,
  end: MB_FRAMES,
};

// ===== dữ liệu căn =====
type Cam = { cx: number; cy: number; z: number };
type Row = { sid: string; price: number; tot: string };
type Unit = {
  n: string; type: string; short: string; code: string; floor: string; tower: string;
  plan: string; rect: { x: number; y: number; w: number; h: number; rot?: number }; camFrom: Cam; camTo: Cam;
  planSid: string;                          // câu có mã căn
  ck: { t: string; v: string; sid: string; beat: string }[];
  rows: { nhanh: Row; chuan: Row; vay: Row & { ten: number } };
  bg: string; bgNote: string; tag?: string; view: string;
};
const UNITS: Unit[] = [
  { n: "01", type: "CĂN STUDIO", short: "STUDIO", code: "T2.21.03", floor: "TẦNG 21", tower: "THÁP T2", planSid: "s2",
    plan: "plan927", rect: { x: 917, y: 982, w: 133, h: 72 }, camFrom: { cx: 1054, cy: 1152, z: 0.95 }, camTo: { cx: 985, cy: 1030, z: 1.6 },
    ck: [{ t: "TÂN GIA", v: "8%", sid: "s3", beat: "ck" }, { t: "ĐỦ 10% TRONG 72 GIỜ", v: "+1%", sid: "s3", beat: "plus" }],
    rows: { nhanh: { sid: "s4", price: 2400, tot: "18%" }, chuan: { sid: "s5", price: 2558, tot: "12%" }, vay: { sid: "s6", price: 2690, tot: "9%", ten: 269 } },
    bg: "video/mb/studio_bg.mp4", bgNote: "Hình ảnh thực tế tiện ích dự án", view: "← HƯỚNG TP.HCM" },
  { n: "02", type: "CĂN 1 PHÒNG NGỦ+", short: "1PN+", code: "T2.04.04", floor: "TẦNG 4", tower: "THÁP T2", planSid: "a1",
    plan: "plan48", rect: { x: 917, y: 885, w: 135, h: 100 }, camFrom: { cx: 1052, cy: 1150, z: 0.95 }, camTo: { cx: 990, cy: 960, z: 1.6 },
    ck: [{ t: "TÂN GIA", v: "8%", sid: "a2", beat: "ck" }, { t: "ĐỦ 10% TRONG 72 GIỜ", v: "+1%", sid: "a2", beat: "plus" }],
    rows: { nhanh: { sid: "a3", price: 2911, tot: "18%" }, chuan: { sid: "a4", price: 3103, tot: "12%" }, vay: { sid: "a5", price: 3263, tot: "9%", ten: 326 } },
    bg: "video/mb/1pn_bg.mp4", bgNote: "Hình ảnh thực tế nhà mẫu 1PN+", view: "← HƯỚNG TP.HCM" },
  { n: "03", type: "CĂN 2 PHÒNG NGỦ", short: "2PN", code: "T1.04.08", floor: "TẦNG 4", tower: "THÁP T1", planSid: "c1",
    plan: "plan48", rect: { x: 1838, y: 1448, w: 112, h: 150, rot: -50 }, camFrom: { cx: 1880, cy: 1300, z: 0.95 }, camTo: { cx: 1830, cy: 1420, z: 1.6 },
    ck: [{ t: "TÂN GIA", v: "6%", sid: "c2", beat: "ck" }, { t: "TẶNG", v: "FULL NỘI THẤT", sid: "c2", beat: "full" }, { t: "ĐỦ 10% TRONG 72 GIỜ", v: "+1%", sid: "c3", beat: "plus" }],
    rows: { nhanh: { sid: "c4", price: 3831, tot: "16%" }, chuan: { sid: "c5", price: 4084, tot: "10%" }, vay: { sid: "c6", price: 4295, tot: "7%", ten: 430 } },
    bg: "video/mb/2pn_bg.mp4", bgNote: "Hình ảnh thực tế nhà mẫu 2PN", tag: "TẶNG FULL NỘI THẤT", view: "↘ CĂN GÓC · VIEW QL1K & ĐƯỜNG GS1" },
  { n: "04", type: "CĂN 3 PHÒNG NGỦ", short: "3PN", code: "T2.25.12", floor: "TẦNG 25", tower: "THÁP T2", planSid: "e1",
    plan: "plan927", rect: { x: 1060, y: 1380, w: 125, h: 100 }, camFrom: { cx: 1054, cy: 1152, z: 0.95 }, camTo: { cx: 1125, cy: 1400, z: 1.6 },
    ck: [{ t: "TÂN GIA", v: "8%", sid: "e3", beat: "ck" }, { t: "ĐỦ 10% TRONG 72 GIỜ", v: "+1%", sid: "e3", beat: "plus" }],
    rows: { nhanh: { sid: "e4", price: 4813, tot: "18%" }, chuan: { sid: "e5", price: 5130, tot: "12%" }, vay: { sid: "e6", price: 5394, tot: "9%", ten: 539 } },
    bg: "video/mb/3pn_bg.mp4", bgNote: "Hình ảnh thực tế tiện ích dự án", tag: "CĂN GÓC · VIEW HỒ BƠI", view: "↘ VIEW HỒ BƠI NỘI KHU · QL1K" },
];

const PLAN_W: Record<string, number> = { plan48: 2446, plan927: 2450 };
const PLAN_H: Record<string, number> = { plan48: 1730, plan927: 1730 };
const FULL: Cam = { cx: 1553, cy: 840, z: 0.5 }; // trọn mặt bằng (x 775–2330) trong vùng an toàn TikTok
const LAKE = { x: 1610, y: 840 };
const Y0 = 1000;

// tháp trên khung flycam dừng hình (vay_bg giây 8, toạ độ khung 1080×1920)
const FREEZE_SRC = 240;
const FLY_TOWERS = [
  { id: "t1", name: "T1", floors: "28 TẦNG", roof: { x: 518, y: 1065 }, pill: { x: 640, y: 1000 } },
  { id: "t2", name: "T2", floors: "28 TẦNG", roof: { x: 280, y: 1055 }, pill: { x: 262, y: 985 } },
  { id: "t3a", name: "T3A", floors: "40 TẦNG", roof: { x: 447, y: 888 }, pill: { x: 330, y: 800 } },
  { id: "t3b", name: "T3B", floors: "40 TẦNG", roof: { x: 615, y: 885 }, pill: { x: 760, y: 800 } },
];

const camAt = (f: number, keys: { at: number; c: Cam; dur?: number }[]): Cam => {
  let c = keys[0].c;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    const t = ramp(f, k.at, k.at + (k.dur ?? 26), Easing.inOut(Easing.cubic));
    c = { cx: c.cx + (k.c.cx - c.cx) * t, cy: c.cy + (k.c.cy - c.cy) * t, z: c.z + (k.c.z - c.z) * t };
  }
  return c;
};
const toScreen = (c: Cam, x: number, y: number) => ({ x: 540 + (x - c.cx) * c.z, y: Y0 + (y - c.cy) * c.z });
const ty = (v: number) => (v / 1000).toFixed(2).replace(".", ","); // 2400 -> "2,40"

// ===== khối dùng chung =====
const GradText: React.FC<{ size: number; children: React.ReactNode; grad?: string; style?: React.CSSProperties }> = ({ size, children, grad = GOLDGRAD, style }) => (
  <div style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.5))", ...style }}>
    <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 1.04, backgroundImage: grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", padding: "0.04em 0.02em", whiteSpace: "nowrap" }}>{children}</div>
  </div>
);

const Logo: React.FC<{ top?: number; h?: number }> = ({ top = 130, h = 54 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center" }}>
    <div style={{ background: "#FBF7EE", borderRadius: 14, padding: "7px 15px", boxShadow: `0 0 0 2px ${GOLD}, 0 10px 26px rgba(0,0,0,0.35)` }}>
      <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: h, display: "block" }} />
    </div>
  </div>
);

const Pill: React.FC<{ f: number; at: number; children: React.ReactNode; dark?: boolean; size?: number; style?: React.CSSProperties }> = ({ f, at, children, dark, size = 38, style }) => {
  const k = sp(f, at, 13, 180);
  return (
    <div style={{
      opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 26}px) scale(${0.86 + 0.14 * Math.min(1, k)})`,
      background: dark ? "rgba(10,22,16,0.86)" : CREAM, color: dark ? CREAM : "#16261E",
      border: dark ? `2px solid ${GOLD}` : "none", borderRadius: 999, padding: `${size * 0.32}px ${size * 0.7}px`,
      fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: 1, whiteSpace: "nowrap",
      boxShadow: "0 10px 26px rgba(0,0,0,0.35)", ...style,
    }}>{children}</div>
  );
};

const Note: React.FC<{ children: React.ReactNode; bottom?: number; dark?: boolean }> = ({ children, bottom = 175, dark }) => (
  <div style={{ position: "absolute", left: MX, right: MX, bottom, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 24, color: dark ? "rgba(31,46,39,0.75)" : "rgba(251,248,241,0.82)", textShadow: dark ? "none" : "0 2px 8px rgba(0,0,0,0.85)" }}>{children}</div>
);

const useCut = (f: number, from: number, len: number) => {
  const g = f - from;
  const punch = interpolate(g, [0, 9], [1.08, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const drift = 1 + 0.04 * ramp(g, 0, len, Easing.inOut(Easing.quad));
  const blur = interpolate(g, [0, 5], [7, 0], clamp);
  return { transform: `scale(${punch * drift})`, filter: `blur(${blur}px)` };
};

const VertVideo: React.FC<{ src: string; startFrom?: number; f: number; from: number; to: number; rate?: number }> = ({ src, startFrom = 0, f, from, to, rate = 1 }) => (
  <AbsoluteFill style={useCut(f, from, to - from)}>
    <OffthreadVideo src={staticFile(src)} startFrom={startFrom} playbackRate={rate} muted style={{ width: 1080, height: 1920, objectFit: "cover" }} />
  </AbsoluteFill>
);

const K = 1920 / 1080;
const LandVideo: React.FC<{ src: string; startFrom?: number; cx?: number; f: number; from: number; to: number }> = ({ src, startFrom = 0, cx = 960, f, from, to }) => (
  <AbsoluteFill style={useCut(f, from, to - from)}>
    <div style={{ position: "absolute", left: 540 - cx * K, top: 0, width: 1920, height: 1080, transform: `scale(${K})`, transformOrigin: "0 0" }}>
      <OffthreadVideo src={staticFile(src)} startFrom={startFrom} muted style={{ width: 1920, height: 1080 }} />
    </div>
  </AbsoluteFill>
);

const Shade: React.FC<{ top?: number; bottom?: number }> = ({ top = 0.55, bottom = 0.7 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(4,10,7,${top}) 0%, rgba(4,10,7,0) 30%, rgba(4,10,7,0) 52%, rgba(4,10,7,${bottom}) 100%)` }} />
);

// ===== CẢNH 1: FLYCAM → DỪNG HÌNH 4 THÁP =====
const Fly: React.FC<{ f: number }> = ({ f }) => {
  // chạy chậm để đúng lúc "gồm 4 tháp" thì tới giây 8 của flycam, rồi dừng hình
  const rate = Math.min(1, FREEZE_SRC / Math.max(1, T.freeze));
  const frozen = f >= T.freeze;
  const zoom = 1 + 0.05 * ramp(f, T.freeze, T.freeze + 30, Easing.inOut(Easing.cubic));
  const flash = interpolate(f - T.freeze, [0, 2, 10], [0, 0.35, 0], clamp);
  const out = 1 - ramp(f, T.plan - 6, T.plan + 4);
  const titleOut = 1 - ramp(f, F("m3") - 8, F("m3"));
  const tw = FLY_TOWERS.reduce((acc, t, i) => (f >= F("m5", t.id) - 3 ? i : acc), -1);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 52%" }}>
        {frozen ? (
          <Freeze frame={FREEZE_SRC}>
            <OffthreadVideo src={staticFile("video/gsl_bg/vay_bg.mp4")} muted style={{ width: 1080, height: 1920, objectFit: "cover" }} />
          </Freeze>
        ) : (
          <OffthreadVideo src={staticFile("video/gsl_bg/vay_bg.mp4")} playbackRate={rate} muted style={{ width: 1080, height: 1920, objectFit: "cover" }} />
        )}
        {/* làm sáng tháp đang được nhắc */}
        {frozen && tw >= 0 && f < E("m5") + 10 && (
          <AbsoluteFill style={{ background: `radial-gradient(circle 300px at ${FLY_TOWERS[tw].roof.x}px ${FLY_TOWERS[tw].roof.y + 260}px, rgba(4,10,7,0) 0%, rgba(4,10,7,0) 45%, rgba(4,10,7,0.38) 100%)`, opacity: ramp(f, F("m5") - 4, F("m5") + 6) * (1 - ramp(f, E("m5"), E("m5") + 10)) }} />
        )}
        {/* nhãn tháp + chấm nóc */}
        {frozen && (
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            {FLY_TOWERS.map((t) => {
              const o = ramp(f, F("m5", t.id) - 2, F("m5", t.id) + 6);
              if (o <= 0) return null;
              const pulse = 0.5 + 0.5 * Math.sin((f - F("m5", t.id)) / 6);
              return (
                <g key={t.id} opacity={o}>
                  <line x1={t.pill.x} y1={t.pill.y + 26} x2={t.roof.x} y2={t.roof.y} stroke={GOLD} strokeWidth={4} strokeLinecap="round" />
                  <circle cx={t.roof.x} cy={t.roof.y} r={10 + 6 * pulse} fill="rgba(226,184,101,0.35)" />
                  <circle cx={t.roof.x} cy={t.roof.y} r={8} fill={GOLD} stroke="#fff" strokeWidth={3} />
                </g>
              );
            })}
          </svg>
        )}
      </AbsoluteFill>
      {frozen && FLY_TOWERS.map((t) => f >= F("m5", t.id) - 2 && (
        <div key={t.id} style={{ position: "absolute", left: t.pill.x, top: t.pill.y, transform: "translate(-50%,-50%)" }}>
          <Pill f={f} at={F("m5", t.id)} dark size={32}><span style={{ color: GOLD }}>{t.name}</span> · {t.floors}</Pill>
        </div>
      ))}
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      <Shade top={0.55} bottom={0.72} />
      <Logo />
      {/* h1–h2: tiêu đề */}
      <div style={{ position: "absolute", left: MX, right: MX, top: 1250, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: titleOut }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: CREAM, letterSpacing: 2, opacity: ramp(f, 4, 14), textShadow: "0 4px 18px rgba(0,0,0,0.7)" }}>TỔNG HỢP CĂN</div>
        <div style={{ transform: `scale(${0.7 + 0.3 * sp(f, F("h1", "gia") - 3, 11, 150)})`, opacity: ramp(f, F("h1", "gia") - 3, F("h1", "gia") + 3) }}>
          <GradText size={96}>GIÁ TỐT NHẤT</GradText>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
          {["STUDIO", "1PN+", "2PN", "3PN"].map((t, i) => <Pill key={t} f={f} at={F("h1", "studio") + i * 5} size={32}>{t}</Pill>)}
        </div>
        {f >= F("h2") - 2 && (
          <div style={{ marginTop: 14 }}>
            <Pill f={f} at={F("h2")} dark size={32}>Căn nào hợp với gia đình mình?</Pill>
          </div>
        )}
      </div>
      {/* m3–m4: tổng quan */}
      {f >= F("m3") - 2 && (
        <div style={{ position: "absolute", left: MX, right: MX, top: 1400, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: GOLD, opacity: ramp(f, F("m3"), F("m3") + 8), textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>TỔNG QUAN DỰ ÁN</div>
          <div style={{ display: "flex", gap: 18 }}>
            <Pill f={f} at={F("m4", "ha")}>1,32 HA</Pill>
            <Pill f={f} at={F("m4", "thap")}>4 THÁP</Pill>
          </div>
        </div>
      )}
      <Note>Hình ảnh thực tế dự án</Note>
    </AbsoluteFill>
  );
};

// ===== mặt bằng + camera =====
const PlanView: React.FC<{ plan: string; c: Cam; children?: React.ReactNode; spot?: { x: number; y: number; r: number; o: number } }> = ({ plan, c, children, spot }) => {
  const sc = spot ? toScreen(c, spot.x, spot.y) : null;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <div style={{ position: "absolute", left: 540 - c.cx * c.z, top: Y0 - c.cy * c.z, width: PLAN_W[plan], height: PLAN_H[plan], transform: `scale(${c.z})`, transformOrigin: "0 0" }}>
        <Img src={staticFile(`images/mb/${plan}.png`)} style={{ width: PLAN_W[plan], height: PLAN_H[plan], display: "block" }} />
        {/* che tiêu đề / logo / lưu ý in sẵn của ảnh gốc */}
        <div style={{ position: "absolute", left: 0, top: 240, width: 960, height: 260, background: PAPER }} />
        {plan === "plan927" && <div style={{ position: "absolute", left: 0, top: 0, width: 768, height: PLAN_H[plan], background: PAPER }} />}
        <div style={{ position: "absolute", left: 0, top: 1612, width: 1110, height: 130, background: PAPER }} />
        {children}
      </div>
      {sc && spot!.o > 0 && (
        <AbsoluteFill style={{ background: `radial-gradient(circle ${spot!.r}px at ${sc.x}px ${sc.y}px, rgba(22,38,30,0) 0%, rgba(22,38,30,0) 55%, rgba(22,38,30,0.3) 100%)`, opacity: spot!.o }} />
      )}
    </AbsoluteFill>
  );
};

const UnitGlow: React.FC<{ f: number; at: number; r: Unit["rect"] }> = ({ f, at, r }) => {
  const o = ramp(f, at - 2, at + 10);
  const pulse = 0.5 + 0.5 * Math.sin((f - at) / 7);
  const rot = r.rot ?? 0;
  const style: React.CSSProperties = rot
    ? { left: r.x - r.w / 2, top: r.y - r.h / 2, width: r.w, height: r.h, transform: `rotate(${rot}deg)` }
    : { left: r.x, top: r.y, width: r.w, height: r.h };
  return (
    <div style={{
      position: "absolute", ...style, opacity: o, borderRadius: 6,
      background: `rgba(242,208,138,${0.38 + 0.12 * pulse})`, mixBlendMode: "multiply",
      boxShadow: `0 0 ${18 + 14 * pulse}px ${6 + 4 * pulse}px rgba(242,196,98,0.75), inset 0 0 0 3px rgba(217,166,73,0.95)`,
    }} />
  );
};

const PlanHeader: React.FC<{ f: number; from: number; kicker: string; title: string }> = ({ f, from, kicker, title }) => {
  const k = sp(f, from + 2, 15, 150);
  return (
    <>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${PAPER} 0%, rgba(250,248,244,0.92) 17%, rgba(250,248,244,0) 25%)` }} />
      <div style={{ position: "absolute", left: MX, right: MX, top: 210, textAlign: "center", opacity: Math.min(1, k * 1.3), transform: `translateY(${(1 - k) * -24}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: "#9A7428" }}>{kicker}</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: INKG, marginTop: 6, whiteSpace: "nowrap" }}>{title}</div>
        <div style={{ width: 120, height: 4, borderRadius: 2, background: GOLDGRAD, margin: "16px auto 0" }} />
      </div>
    </>
  );
};

// ===== CẢNH 2: MẶT BẰNG TỔNG =====
const Master: React.FC<{ f: number }> = ({ f }) => {
  const enter = ramp(f, T.plan - 6, T.plan + 10);
  const c = camAt(f, [{ at: 0, c: { ...FULL, z: FULL.z * 1.12 } }, { at: T.plan - 6, c: FULL, dur: 30 }]);
  const lakeOn = ramp(f, F("m6", "pct") + 20, F("m6", "pct") + 34);
  return (
    <AbsoluteFill style={{ opacity: enter, background: PAPER }}>
      <AbsoluteFill style={{ filter: `blur(${(1 - enter) * 10}px)` }}>
        <PlanView plan="plan927" c={c} spot={lakeOn > 0 ? { x: LAKE.x, y: LAKE.y, r: 640, o: lakeOn * 0.85 } : undefined} />
      </AbsoluteFill>
      {/* 4 hướng xung quanh dự án */}
      {(() => {
        const o = ramp(f, T.plan + 6, T.plan + 18);
        const lab: React.CSSProperties = { fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: 2, color: "#8E2B1F", whiteSpace: "nowrap" };
        const top = toScreen(c, 0, 40).y, bot = toScreen(c, 0, 1640).y;
        return (
          <AbsoluteFill style={{ opacity: o }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: top - 52, textAlign: "center", ...lab }}>▲ TRUNG TÂM HÀNH CHÍNH DĨ AN</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: bot + 10, textAlign: "center", ...lab }}>▼ QUỐC LỘ 1K</div>
            <div style={{ position: "absolute", left: 128, top: 980, transform: "translate(-50%,-50%) rotate(-90deg)", ...lab }}>◀ TP. HỒ CHÍ MINH</div>
            <div style={{ position: "absolute", left: 952, top: 980, transform: "translate(-50%,-50%) rotate(90deg)", ...lab }}>ĐƯỜNG GS1 – SIÊU THỊ GO ▶</div>
          </AbsoluteFill>
        );
      })()}
      <PlanHeader f={f} from={T.plan} kicker="GREEN SKYLINE" title="MẶT BẰNG TỔNG THỂ" />
      <div style={{ position: "absolute", left: MX, right: MX, bottom: 250, display: "flex", justifyContent: "center" }}>
        <div style={{ background: "rgba(10,22,16,0.9)", border: `2px solid ${GOLD}`, borderRadius: 28, padding: "22px 40px", display: "flex", alignItems: "center", gap: 26, opacity: ramp(f, F("m6") - 2, F("m6") + 8), transform: `translateY(${(1 - sp(f, F("m6"), 14, 160)) * 40}px)`, boxShadow: "0 18px 40px rgba(0,0,0,0.35)" }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: CREAM, lineHeight: 1.2 }}>MẬT ĐỘ<br />XÂY DỰNG</div>
          <GradText size={110}>~{Math.round(36 * ramp(f, F("m6", "pct") - 6, F("m6", "pct") + 14))}%</GradText>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ===== CẢNH 3: CÔNG VIÊN NỘI KHU =====
const Park: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <VertVideo src="video/gsl_bg/lai_bg.mp4" startFrom={30} f={f} from={T.park} to={T.sIntro} />
    <Shade top={0.5} bottom={0.7} />
    <Logo />
    <div style={{ position: "absolute", left: MX, right: MX, top: 1300, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <Pill f={f} at={T.park + 6} dark size={34}>CHIẾM PHẦN LỚN DIỆN TÍCH</Pill>
      <div style={{ opacity: ramp(f, T.park + 10, T.park + 20), transform: `translateY(${(1 - sp(f, T.park + 10)) * 30}px)`, textAlign: "center" }}>
        <GradText size={84}>HỒ CẢNH QUAN</GradText>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: CREAM, textShadow: "0 4px 18px rgba(0,0,0,0.7)" }}>& công viên nội khu</div>
      </div>
    </div>
    <Note>Hình ảnh thực tế tại dự án</Note>
  </AbsoluteFill>
);

// ===== CẢNH 4: MỞ ĐẦU PHẦN CĂN (studio) =====
const StudioIntro: React.FC<{ f: number }> = ({ f }) => {
  const from = T.sIntro;
  const k = sp(f, from + 2, 14, 140);
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <div style={{ position: "absolute", left: MX, right: MX, top: 260, textAlign: "center", opacity: Math.min(1, k * 1.3), transform: `translateY(${(1 - k) * 30}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: "#9A7428" }}>CĂN GIÁ TỐT NHẤT · 01/04</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 92, color: INKG, marginTop: 10 }}>Studio</div>
      </div>
      <div style={{ position: "absolute", left: 150, right: 150, top: 560, height: 1060, display: "flex", justifyContent: "center", alignItems: "center", opacity: ramp(f, from + 6, from + 18), transform: `scale(${0.9 + 0.1 * sp(f, from + 6, 16, 120)})` }}>
        <Img src={staticFile("images/gslposter/layout_studio.jpg")} style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 22, boxShadow: `0 0 0 3px ${GOLD}, 0 26px 60px rgba(0,0,0,0.3)` }} />
      </div>
      <Note bottom={190} dark>Layout minh họa loại căn</Note>
    </AbsoluteFill>
  );
};

// ===== CẢNH 5: CĂN TRÊN MẶT BẰNG =====
const UnitPlan: React.FC<{ f: number; u: Unit; from: number; to: number; extra?: (f: number, c: Cam) => React.ReactNode; camExtra?: { at: number; c: Cam; dur?: number }[] }> = ({ f, u, from, to, extra, camExtra }) => {
  const codeAt = F(u.planSid, "code");
  const c = camAt(f, [{ at: 0, c: u.camFrom }, { at: Math.max(from + 6, codeAt - 18), c: u.camTo, dur: 30 }, ...(camExtra ?? [])]);
  const ux = u.rect.rot ? u.rect.x : u.rect.x + u.rect.w / 2;
  const uy = u.rect.rot ? u.rect.y : u.rect.y + u.rect.h / 2;
  const p = toScreen(c, ux, uy);
  const spotO = ramp(f, codeAt - 6, codeAt + 8);
  const st = useCut(f, from, to - from);
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <AbsoluteFill style={{ filter: st.filter }}>
        <PlanView plan={u.plan} c={c} spot={{ x: ux, y: uy, r: 380, o: spotO * 0.95 }}>
          <UnitGlow f={f} at={codeAt - 2} r={u.rect} />
        </PlanView>
      </AbsoluteFill>
      {f >= codeAt - 4 && (
        <div style={{ position: "absolute", left: p.x, top: p.y - 70, transform: "translate(-50%,-100%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ transform: `scale(${Math.min(1, sp(f, codeAt - 2, 12, 170))})`, transformOrigin: "50% 100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ background: "rgba(10,22,16,0.92)", border: `3px solid ${GOLD}`, borderRadius: 22, padding: "12px 30px", boxShadow: "0 16px 36px rgba(0,0,0,0.4)" }}>
              <GradText size={74}>{u.code}</GradText>
            </div>
            <div style={{ width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: `20px solid ${GOLD}` }} />
          </div>
        </div>
      )}
      <PlanHeader f={f} from={from} kicker={`CĂN GIÁ TỐT NHẤT · ${u.n}/04`} title={u.type} />
      <div style={{ position: "absolute", left: MX, right: MX, bottom: 270, display: "flex", justifyContent: "center", gap: 18 }}>
        <Pill f={f} at={F(u.planSid, "tang")}>{u.floor}</Pill>
        <Pill f={f} at={F(u.planSid, "tang") + 6}>{u.tower}</Pill>
      </div>
      <div style={{ position: "absolute", left: MX, right: MX, bottom: 360, display: "flex", justifyContent: "center" }}>
        <Pill f={f} at={F(u.planSid, "tang") + 14} dark size={34}>{u.view}</Pill>
      </div>
      {extra?.(f, c)}
      <Note bottom={190} dark>Vị trí căn trên mặt bằng tầng điển hình</Note>
    </AbsoluteFill>
  );
};

// mũi tên view hồ (căn 3PN)
const ViewArrow: React.FC<{ f: number; c: Cam }> = ({ f, c }) => {
  const at = F("e2", "ho") - 4;
  if (f < at) return null;
  const u = UNITS[3];
  const a = toScreen(c, u.rect.x + u.rect.w, u.rect.y + u.rect.h * 0.4);
  const b = toScreen(c, LAKE.x - 60, LAKE.y + 60);
  const t = ramp(f, at, at + 18, Easing.inOut(Easing.cubic));
  const mx = (a.x + b.x) / 2 + 60, my = (a.y + b.y) / 2 + 40;
  const len = 900;
  const lab0 = toScreen(c, LAKE.x, LAKE.y);
  const lab = { x: Math.min(lab0.x, 972 - 200), y: lab0.y };
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs><marker id="ah" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={GOLD} /></marker></defs>
        <path d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`} stroke={GOLD} strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - t)} markerEnd={t > 0.95 ? "url(#ah)" : undefined} style={{ filter: "drop-shadow(0 0 10px rgba(242,196,98,0.9))" }} />
      </svg>
      <div style={{ position: "absolute", left: lab.x, top: lab.y - 40, transform: "translate(-50%,-100%)" }}>
        <Pill f={f} at={at + 14} dark size={36}>VIEW HỒ BƠI NỘI KHU</Pill>
      </div>
    </AbsoluteFill>
  );
};
const EExtra = (f: number, c: Cam) => (
  <>
    {f >= F("e2", "goc") - 3 && f < F("e2", "ho") - 6 && (
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center", opacity: 1 - ramp(f, F("e2", "ho") - 12, F("e2", "ho") - 6) }}>
        <div style={{ transform: `scale(${0.6 + 0.4 * Math.min(1, sp(f, F("e2", "goc") - 2, 11, 160))})` }}>
          <div style={{ background: GOLDGRAD, borderRadius: 24, padding: "14px 40px", fontFamily: SANS, fontWeight: 900, fontSize: 58, color: "#1E1608", boxShadow: "0 14px 36px rgba(0,0,0,0.3)" }}>CĂN GÓC</div>
        </div>
      </div>
    )}
    <ViewArrow f={f} c={c} />
  </>
);

// ===== CẢNH 6: BẢNG CHIẾT KHẤU + 3 PHƯƠNG ÁN =====
const PRICE_NOTE = "Tạm tính theo CSBH 149/2026 · gồm VAT, chưa phí bảo trì";
const FURN_LABELS = [ // khớp 2pn_bg.mp4 (giây bắt đầu từng đoạn)
  { at: 3.2, t: "Sofa" }, { at: 6.5, t: "Tủ lạnh · bếp từ" }, { at: 9.8, t: "Giường · nệm" }, { at: 13.1, t: "Bàn ăn 4 ghế" }, { at: 16.1, t: "Kệ tivi" }, { at: 20.1, t: "Tủ áo" },
];

const PayRow: React.FC<{ f: number; label: string; sub: string; chip: string; row: Row; active: boolean; extra?: React.ReactNode }> = ({ f, label, sub, chip, row, active, extra }) => {
  const at = F(row.sid);
  const k = sp(f, at - 6, 14, 160);
  const numAt = F(row.sid, "num");
  const v = row.price * (0.85 + 0.15 * ramp(f, numAt - 6, numAt + 12, Easing.out(Easing.quad)));
  const numO = ramp(f, numAt - 6, numAt + 2);
  const numS = 0.75 + 0.25 * Math.min(1, sp(f, numAt - 6, 12, 170));
  const on = f >= at - 6;
  return (
    <div style={{
      opacity: on ? Math.min(1, k * 1.4) * (active ? 1 : 0.72) : 0, transform: `translateY(${(1 - Math.min(1, k)) * 40}px) scale(${active ? 1 : 0.97})`,
      background: active ? "rgba(251,248,241,0.97)" : "rgba(10,22,16,0.84)", border: `2px solid ${active ? GOLD : "rgba(226,184,101,0.55)"}`,
      borderRadius: 28, padding: "20px 28px", boxShadow: active ? "0 18px 44px rgba(0,0,0,0.45)" : "0 10px 26px rgba(0,0,0,0.3)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 36, color: active ? INKG : CREAM, whiteSpace: "nowrap" }}>{label}</div>
          <div style={{ display: "inline-block", marginTop: 8, background: active ? "#1F2E27" : "rgba(226,184,101,0.18)", color: active ? GOLD : "#F2D08A", borderRadius: 999, padding: "5px 16px", fontFamily: SANS, fontWeight: 800, fontSize: 24, whiteSpace: "nowrap" }}>{chip}</div>
        </div>
        <div style={{ textAlign: "right", whiteSpace: "nowrap", opacity: numO, transform: `scale(${numS})`, transformOrigin: "100% 50%" }}>
          <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64, color: active ? "#9A6A1C" : CREAM }}>~{ty(v)}</span>
          <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 32, color: active ? "#9A6A1C" : GOLD, marginLeft: 8 }}>TỶ</span>
        </div>
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: active ? "rgba(31,46,39,0.8)" : "rgba(251,248,241,0.78)", marginTop: 10 }}>{sub}</div>
      {extra}
    </div>
  );
};

const Board: React.FC<{ f: number; u: Unit; from: number; to: number }> = ({ f, u, from, to }) => {
  const R = u.rows;
  const rowsOn = F(R.nhanh.sid) - 8;
  const dim = 0.25 + 0.3 * ramp(f, rowsOn - 6, rowsOn + 8);
  const active = f >= F(R.vay.sid) - 4 ? "vay" : f >= F(R.chuan.sid) - 4 ? "chuan" : "nhanh";
  const ckK = sp(f, F(u.ck[0].sid) - 6, 14, 150);
  const is2 = u.short === "2PN";
  const vidSec = (f - from) / FPS;
  const furn = is2 ? [...FURN_LABELS].reverse().find((x) => vidSec >= x.at) : undefined;
  return (
    <AbsoluteFill>
      <LandVideo src={u.bg} f={f} from={from} to={to} cx={960} />
      <AbsoluteFill style={{ background: "#040A07", opacity: dim }} />
      <Shade top={0.6} bottom={0.75} />
      <Logo />
      <div style={{ position: "absolute", left: 0, right: 0, top: 232, display: "flex", justifyContent: "center" }}>
        <Pill f={f} at={from + 2} dark size={34}><span style={{ color: GOLD }}>{u.short}</span> · {u.code} · {u.floor}</Pill>
      </div>
      {/* chiết khấu căn này */}
      <div style={{ position: "absolute", left: MX, right: MX, top: 330, opacity: Math.min(1, ckK * 1.4), transform: `translateY(${(1 - Math.min(1, ckK)) * 30}px)` }}>
        <div style={{ textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 6, color: GOLD, textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>CHIẾT KHẤU CĂN NÀY</div>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 14, marginTop: 14 }}>
          {u.ck.map((c, i) => {
            const at = F(c.sid, c.beat);
            const kk = sp(f, at - 3, 12, 180);
            const big = c.v.length > 4;
            return (
              <div key={i} style={{ opacity: Math.min(1, kk * 1.5), transform: `scale(${0.7 + 0.3 * Math.min(1, kk)})`, background: big ? GOLDGRAD : "rgba(10,22,16,0.9)", border: big ? "none" : `2px solid ${GOLD}`, borderRadius: 22, padding: "10px 22px", display: "flex", alignItems: "baseline", gap: 12, boxShadow: "0 10px 26px rgba(0,0,0,0.35)" }}>
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, color: big ? "#3A2A0C" : "rgba(251,248,241,0.85)" }}>{c.t}</span>
                <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: big ? 34 : 44, color: big ? "#1E1608" : GOLD }}>{c.v}</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* 2PN: tên món nội thất theo cảnh, trước khi hiện bảng */}
      {is2 && furn && f < rowsOn && f >= F("c2", "full") - 4 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1180, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: CREAM, opacity: ramp(f, F("c2", "don") - 2, F("c2", "don") + 8), textShadow: "0 4px 18px rgba(0,0,0,0.7)" }}>Dọn vào ở luôn</div>
          <Pill key={furn.t} f={f} at={from + Math.round(furn.at * FPS) + 2} size={38}>✓ {furn.t}</Pill>
        </div>
      )}
      {/* 3 phương án */}
      {f >= rowsOn - 8 && (
        <div style={{ position: "absolute", left: MX, right: MX, top: 600, display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 6, color: GOLD, opacity: ramp(f, rowsOn - 8, rowsOn + 4), textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>3 PHƯƠNG ÁN THANH TOÁN</div>
          <PayRow f={f} label="THANH TOÁN NHANH" chip={`+9% · TỔNG CK ${R.nhanh.tot}`} sub="Đóng 40% trong 11 ngày đầu" row={R.nhanh} active={active === "nhanh"} />
          <PayRow f={f} label="THANH TOÁN CHUẨN" chip={`+3% · TỔNG CK ${R.chuan.tot}`} sub="Đóng theo tiến độ · 2 tháng/đợt" row={R.chuan} active={active === "chuan"} />
          <PayRow f={f} label="VAY NGÂN HÀNG" chip={`TỔNG CK ${R.vay.tot} · GIÁ VAY`} sub="Lãi 0% tới 12–18 tháng · Shinhan, VCB, VietinBank" row={R.vay} active={active === "vay"}
            extra={
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, background: active === "vay" ? "#1F2E27" : "rgba(226,184,101,0.15)", borderRadius: 18, padding: "10px 18px", opacity: ramp(f, F(R.vay.sid, "num") + 6, F(R.vay.sid, "num") + 16) }}>
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, color: CREAM, whiteSpace: "nowrap" }}>Đóng trước 10%</span>
                <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 40, color: GOLD, whiteSpace: "nowrap" }}>~{u.rows.vay.ten} TRIỆU</span>
              </div>
            } />
        </div>
      )}
      {u.tag && f < rowsOn && !is2 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", justifyContent: "center" }}>
          <Pill f={f} at={from + 10} dark size={36}>{u.tag}</Pill>
        </div>
      )}
      <Note bottom={212}>{u.bgNote}</Note>
      <Note bottom={175}>{PRICE_NOTE}</Note>
    </AbsoluteFill>
  );
};

// ===== CẢNH 7: TỔNG KẾT + NHẮN MÃ CĂN =====
const Summary: React.FC<{ f: number }> = ({ f }) => {
  const cta = F("z2") - 4;
  return (
    <AbsoluteFill>
      <VertVideo src="video/gsl_bg/ttn_bg.mp4" rate={Math.min(1, (11 * FPS - 6) / Math.max(1, T.end - T.sum))} f={f} from={T.sum} to={T.end} />
      <AbsoluteFill style={{ background: "#040A07", opacity: 0.55 }} />
      <Logo />
      <div style={{ position: "absolute", left: MX, right: MX, top: 250, textAlign: "center", opacity: ramp(f, T.sum, T.sum + 10) }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: GOLD }}>CHỌN VAY NGÂN HÀNG</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: CREAM, marginTop: 10 }}>CHỈ ĐÓNG TRƯỚC</div>
        <div style={{ transform: `scale(${0.7 + 0.3 * Math.min(1, sp(f, F("z1", "pct") - 3, 11, 150))})`, opacity: ramp(f, F("z1", "pct") - 3, F("z1", "pct") + 4), display: "flex", justifyContent: "center" }}>
          <GradText size={150}>10%</GradText>
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: CREAM, opacity: ramp(f, F("z1", "nhan") - 4, F("z1", "nhan") + 6) }}>Nhận nhà mới đóng tiếp</div>
      </div>
      <div style={{ position: "absolute", left: MX, right: MX, top: 760, display: "flex", flexDirection: "column", gap: 22 }}>
        {UNITS.map((u, i) => {
          const at = F("z1") + 10 + i * 6;
          const k = sp(f, at, 14, 150);
          return (
            <div key={u.code} style={{
              display: "flex", alignItems: "center", gap: 22, background: "rgba(10,22,16,0.86)", border: `2px solid rgba(226,184,101,0.8)`,
              borderRadius: 26, padding: "18px 28px", opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - Math.min(1, k)) * 40}px)`,
            }}>
              <div style={{ width: 190, textAlign: "center", display: "flex", justifyContent: "center" }}><GradText size={40}>{u.short}</GradText></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: CREAM }}>{u.code}</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: "rgba(251,248,241,0.75)", marginTop: 2 }}>{u.floor} · {u.tower} · {u.view.replace(/^[^A-ZĐ]+/, "")}</div>
              </div>
              <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 48, color: CREAM }}>~{u.rows.vay.ten}</span>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 24, color: GOLD, marginLeft: 6 }}>TR</span>
              </div>
            </div>
          );
        })}
      </div>
      {f >= cta && (
        <div style={{ position: "absolute", left: MX, right: MX, top: 1420, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ transform: `scale(${0.7 + 0.3 * Math.min(1, sp(f, F("z2", "nhan") - 3, 11, 160))})`, opacity: ramp(f, F("z2", "nhan") - 3, F("z2", "nhan") + 4) }}>
            <div style={{ background: GOLDGRAD, borderRadius: 26, padding: "16px 40px", fontFamily: SANS, fontWeight: 900, fontSize: 50, color: "#1E1608", boxShadow: "0 16px 40px rgba(0,0,0,0.45)", whiteSpace: "nowrap" }}>NHẮN HOÀNG MÃ CĂN</div>
          </div>
          <Pill f={f} at={F("z3", "bt")} dark size={30}>Nhận bảng tính chi tiết từng đợt thanh toán</Pill>
        </div>
      )}
      <Note bottom={175}>{PRICE_NOTE}</Note>
    </AbsoluteFill>
  );
};

// ===== kiểm tra vùng an toàn TikTok =====
const SAFE = { l: 108, r: 972, t: 150, b: 1770 };
const useSafeCheck = (on: boolean, f: number) => {
  React.useEffect(() => {
    if (!on) return;
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const bad: string[] = [];
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const txt = (n.textContent ?? "").trim();
      if (!txt) continue;
      const el = n.parentElement as HTMLElement;
      if (!el || getComputedStyle(el).opacity === "0") continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      const r = rg.getBoundingClientRect();
      if (r.width < 1) continue;
      if (r.left < SAFE.l - 0.5 || r.right > SAFE.r + 0.5 || r.top < SAFE.t || r.bottom > SAFE.b)
        bad.push(`"${txt.slice(0, 40)}" [${Math.round(r.left)},${Math.round(r.top)} → ${Math.round(r.right)},${Math.round(r.bottom)}]`);
    }
    if (bad.length) console.log(`SAFE_FAIL f=${f} :: ` + bad.join(" | "));
  });
};

// ===== GỐC =====
export const GSLMatBang: React.FC<{ voice: string | null; safeCheck?: boolean }> = ({ voice, safeCheck = false }) => {
  const f = useCurrentFrame();
  useSafeCheck(safeCheck, f);
  const U = UNITS;
  const cuts = [T.freeze, T.plan, T.park, T.sIntro, T.sPlan, T.sBoard, T.aPlan, T.aBoard, T.cPlan, T.cBoard, T.ePlan, T.eBoard, T.sum];
  const pops = [F("h1", "gia"), F("m4", "ha"), F("m4", "thap"), ...FLY_TOWERS.map((t) => F("m5", t.id)), F("m6", "pct"),
    ...U.map((u) => F(u.planSid, "code")), ...U.flatMap((u) => u.ck.map((c) => F(c.sid, c.beat))),
    ...U.flatMap((u) => [F(u.rows.nhanh.sid, "num"), F(u.rows.chuan.sid, "num"), F(u.rows.vay.sid, "num")]),
    F("e2", "goc"), F("e2", "ho"), F("z1", "pct"), F("z2", "nhan")];
  const ticks = [...U.map((u) => F(u.planSid, "tang")), ...[0, 1, 2, 3].map((i) => F("h1", "studio") + i * 5)];
  const board = (u: Unit, from: number, to: number) => inR(f, from, to) && <Sequence from={from} layout="none"><Board f={f} u={u} from={from} to={to} /></Sequence>;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {inR(f, 0, T.plan + 6) && <Fly f={f} />}
      {inR(f, T.plan - 6, T.park) && <Master f={f} />}
      {inR(f, T.park, T.sIntro) && <Sequence from={T.park} layout="none"><Park f={f} /></Sequence>}
      {inR(f, T.sIntro, T.sPlan) && <StudioIntro f={f} />}
      {inR(f, T.sPlan, T.sBoard) && <UnitPlan f={f} u={U[0]} from={T.sPlan} to={T.sBoard} />}
      {board(U[0], T.sBoard, T.aPlan)}
      {inR(f, T.aPlan, T.aBoard) && <UnitPlan f={f} u={U[1]} from={T.aPlan} to={T.aBoard} />}
      {board(U[1], T.aBoard, T.cPlan)}
      {inR(f, T.cPlan, T.cBoard) && <UnitPlan f={f} u={U[2]} from={T.cPlan} to={T.cBoard} />}
      {board(U[2], T.cBoard, T.ePlan)}
      {inR(f, T.ePlan, T.eBoard) && (
        <UnitPlan f={f} u={U[3]} from={T.ePlan} to={T.eBoard} extra={EExtra}
          camExtra={[{ at: F("e2", "ho") - 14, c: { cx: 1330, cy: 1110, z: 0.95 }, dur: 24 }]} />
      )}
      {board(U[3], T.eBoard, T.sum)}
      {inR(f, T.sum, T.end) && <Sequence from={T.sum} layout="none"><Summary f={f} /></Sequence>}

      {voice && <Sequence from={s(VO_LEAD)}><Audio src={staticFile(voice)} /></Sequence>}
    </AbsoluteFill>
  );
};
