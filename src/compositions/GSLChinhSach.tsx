import React from "react";
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing,
} from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import TIMING from "../data/cspol_timing.json";
import d1pn from "../data/bangiao_1pn.json";
import d2pn from "../data/bangiao_2pn.json";

/**
 * Green Skyline — CHÍNH SÁCH BÁN HÀNG MỚI (CSBH 149/2026) · phần giữa (lồng tiếng), dọc 1080×1920, 30fps.
 * Đoạn đầu + đoạn cuối Hoàng quay trước camera, video này trám vào giữa: ưu đãi tân gia → nội thất nhà mẫu → cộng thêm → thanh toán.
 * Nội thất: clip 4K nhà mẫu thật (thực tế 1PN+/2PN) chạy tới món → dừng hình, làm sáng món (cutout + quầng mềm, không vẽ line).
 * Mốc thời gian: src/data/cspol_timing.json (ước lượng; có giọng thật thì thay bằng whisper).
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["500", "600", "700", "800", "900"], subsets: ["vietnamese", "latin"] });
const { fontFamily: SERIF } = loadPlayfair("normal", { weights: ["700"], subsets: ["vietnamese", "latin"] });

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, b: number, ease = Easing.out(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });
const sp = (f: number, at: number, damping = 14, stiffness = 160) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness, mass: 0.7 } });

const BG0 = "#0B1A13", BG1 = "#14301F";
const INK = "#16261E";
const CREAM = "#FBF8F1";
const GOLD = "#E2B865";
const MINT = "#5CCB92";
const MINT_D = "#1D7A4E";
const GRAD = "linear-gradient(180deg,#EAFFF2 0%,#9BE8BE 26%,#3FB57A 52%,#1D7A4E 74%,#5CCB92 100%)";
const GOLDGRAD = "linear-gradient(180deg,#FFF3D1 0%,#F2D08A 35%,#D9A649 62%,#B9842F 82%,#F1CE85 100%)";
const MX = 96; // lề an toàn ≥ 8%

// ===== mốc thời gian =====
type Sent = { start: number; end: number; beats: Record<string, number> };
const SENTS = TIMING.sents as unknown as Record<string, Sent>;
const VO_LEAD = 0.4;
const F = (id: string, beat?: string) => s(VO_LEAD + SENTS[id].start + (beat ? SENTS[id].beats[beat] ?? 0 : 0));
export const CSPOL_FRAMES = s(VO_LEAD + TIMING.total + 0.5);

const T = {
  walk: F("s3") - 6, furn: F("s4") - 6, c2: F("s8") - 8, gift: F("s9") - 6, c3: F("s11") - 8, plus: F("s13") - 10, pay: F("s17") - 10, end: CSPOL_FRAMES,
};

// ===== dữ liệu điểm dừng (ảnh still 4K + cutout món) =====
type StopItem = { title: string; bbox: number[]; cut: string; cutBox: number[] };
type Stop = { img: string; items: StopItem[] };
const STOPS: Record<string, Stop> = {};
(d1pn as any).stops.forEach((st: Stop, i: number) => (STOPS[`1pn_s${i + 1}`] = st));
(d2pn as any).stops.forEach((st: Stop, i: number) => (STOPS[`2pn_s${i + 1}`] = st));
const CLIP_FREEZE = 75; // clip lead cắt sẵn: khung dừng hình nằm ở frame 75 (2,5s)

const K = 1920 / 1080; // khung 1920×1080 phóng tràn chiều cao dọc
const HALF = 540 / K;
const clampX = (x: number) => Math.max(HALF, Math.min(1920 - HALF, x));
const cxOf = (it: StopItem) => clampX((it.bbox[0] + it.bbox[2]) / 2);

type Shot = {
  from: number; to: number;
  stop?: string;                 // ảnh dừng hình
  clip?: string; leadEnd?: number; // clip chạy tới lúc dừng hình
  live?: string; liveFrom?: number; // clip thuần (không dừng hình)
  glows?: { item: number; at: number }[];
  cams?: { item?: number; x?: number; at: number }[];
};

const Frame1920: React.FC<{ cx: number; children: React.ReactNode }> = ({ cx, children }) => (
  <div style={{ position: "absolute", left: 540 - cx * K, top: 0, width: 1920, height: 1080, transform: `scale(${K})`, transformOrigin: "0 0" }}>{children}</div>
);

const ShotView: React.FC<{ sh: Shot; f: number }> = ({ sh, f }) => {
  const g = f - sh.from;
  const len = sh.to - sh.from;
  // đẩy vào khi cắt cảnh + trôi nhẹ
  const punch = interpolate(g, [0, 8], [1.08, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const drift = 1 + 0.035 * ramp(g, 0, len, Easing.inOut(Easing.quad));
  const blur = interpolate(g, [0, 4], [6, 0], clamp);
  if (sh.live) {
    return (
      <AbsoluteFill style={{ transform: `scale(${punch * drift})`, filter: `blur(${blur}px)` }}>
        <Frame1920 cx={sh.cams?.[0]?.x ?? 960}>
          <OffthreadVideo src={staticFile(`video/cspol/${sh.live}.mp4`)} startFrom={sh.liveFrom ?? 0} muted style={{ width: 1920, height: 1080 }} />
        </Frame1920>
      </AbsoluteFill>
    );
  }
  const st = STOPS[sh.stop!];
  const freeze = sh.leadEnd ?? sh.from;
  const stillO = sh.clip ? ramp(f, freeze - 5, freeze + 3, Easing.inOut(Easing.quad)) : 1;
  // camera: lia giữa các món
  const cams = sh.cams ?? [{ item: sh.glows?.[0]?.item ?? 0, at: sh.from }];
  const camX = (c: { item?: number; x?: number }) => c.x ?? cxOf(st.items[c.item ?? 0]);
  let cx = camX(cams[0]);
  for (let i = 1; i < cams.length; i++) cx = cx + (camX(cams[i]) - cx) * ramp(f, cams[i].at - 4, cams[i].at + 10, Easing.inOut(Easing.cubic));
  const firstGlow = Math.min(...(sh.glows ?? []).map((x) => x.at));
  const dim = ramp(f, Math.max(freeze, firstGlow - 4), Math.max(freeze, firstGlow - 4) + 10) * 0.42;
  return (
    <AbsoluteFill style={{ transform: `scale(${punch * drift})`, filter: `blur(${blur}px)` }}>
      <Frame1920 cx={cx}>
        {sh.clip && (
          <OffthreadVideo src={staticFile(`video/cspol/${sh.clip}.mp4`)} startFrom={Math.max(0, CLIP_FREEZE - (freeze - sh.from))} muted
            style={{ position: "absolute", inset: 0, width: 1920, height: 1080, opacity: 1 - stillO * 0.999 }} />
        )}
        <div style={{ position: "absolute", inset: 0, opacity: stillO }}>
          <Img src={staticFile(st.img)} style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }} />
          <div style={{ position: "absolute", inset: 0, background: "#050807", opacity: dim }} />
          {(sh.glows ?? []).map((gl) => {
            const it = st.items[gl.item];
            const [c0, c1, c2, c3] = it.cutBox;
            const o = ramp(f, gl.at - 3, gl.at + 7);
            const pulse = Math.sin((f - gl.at) / 6);
            return (
              <Img key={gl.item} src={staticFile(it.cut)} style={{
                position: "absolute", left: c0, top: c1, width: c2 - c0, height: c3 - c1, opacity: o,
                filter: `brightness(1.22) saturate(1.08) drop-shadow(0 0 ${9 + 3 * pulse}px rgba(255,242,210,0.95)) drop-shadow(0 0 28px rgba(255,232,180,0.5))`,
              }} />
            );
          })}
        </div>
      </Frame1920>
    </AbsoluteFill>
  );
};

// ===== danh sách cảnh nội thất / quà tặng =====
const FURN_SHOTS: Shot[] = [
  // PHÒNG KHÁCH
  { from: T.furn, to: F("s4", "i1") - 3, stop: "2pn_s4", clip: "2pn_s4", leadEnd: F("s4", "i0") - 4, glows: [{ item: 0, at: F("s4", "i0") }] },
  { from: F("s4", "i1") - 3, to: F("s4", "i2") - 3, stop: "2pn_s10", glows: [{ item: 0, at: F("s4", "i1") }] },
  { from: F("s4", "i2") - 3, to: F("s5") - 6, stop: "2pn_s3", glows: [{ item: 2, at: F("s4", "i2") }] },
  // BẾP
  { from: F("s5") - 6, to: F("s5", "i2") - 3, stop: "2pn_s2", clip: "2pn_s2", leadEnd: Math.max(F("s5") + 10, F("s5", "i0") - 4),
    glows: [{ item: 0, at: F("s5", "i0") }, { item: 1, at: F("s5", "i1") }], cams: [{ item: 0, at: 0 }, { item: 1, at: F("s5", "i1") }] },
  { from: F("s5", "i2") - 3, to: F("s6") - 6, stop: "2pn_s3", glows: [{ item: 0, at: F("s5", "i2") }] },
  // PHÒNG NGỦ
  { from: F("s6") - 6, to: F("s6", "i2") - 3, stop: "2pn_s8", clip: "2pn_s8", leadEnd: F("s6", "i0") - 4, glows: [{ item: 0, at: F("s6", "i0") }] },
  { from: F("s6", "i2") - 3, to: F("s7") - 6, stop: "2pn_s9", glows: [{ item: 0, at: F("s6", "i2") }, { item: 1, at: F("s6", "i3") }],
    cams: [{ item: 0, at: 0 }, { x: 1300, at: F("s6", "i3") }] },
  // KHÁC
  { from: F("s7") - 6, to: F("s7", "i1") - 3, stop: "1pn_s4", clip: "1pn_s4", leadEnd: Math.max(F("s7") + 8, F("s7", "i0") - 4), glows: [{ item: 0, at: Math.max(F("s7") + 8, F("s7", "i0")) }] },
  { from: F("s7", "i1") - 3, to: T.c2, live: "entry", liveFrom: 0, cams: [{ x: 960, at: 0 }] },
];
const GIFT_SHOTS: Shot[] = [
  { from: T.gift, to: F("s9", "i1") - 3, stop: "2pn_s2", clip: "2pn_s2", leadEnd: Math.max(F("s9") + 10, F("s9", "i0") - 4), glows: [{ item: 0, at: Math.max(F("s9") + 10, F("s9", "i0")) }] },
  { from: F("s9", "i1") - 3, to: F("s10") - 6, stop: "1pn_s4", glows: [{ item: 0, at: F("s9", "i1") }, { item: 1, at: F("s9", "i2") }] },
  { from: F("s10") - 6, to: T.c3, stop: "1pn_s8", clip: "1pn_s8", leadEnd: F("s10", "all") - 6,
    glows: [{ item: 0, at: F("s10", "all") }, { item: 1, at: F("s10", "all") + 8 }], cams: [{ item: 0, at: 0 }, { item: 1, at: F("s10", "all") + 10 }] },
];

type Zone = { name: string; from: number; to: number; items: { t: string; at: number }[] };
const ZONES: Zone[] = [
  { name: "Phòng khách", from: T.furn, to: F("s5") - 6, items: [{ t: "Sofa", at: F("s4", "i0") }, { t: "Kệ tivi", at: F("s4", "i1") }, { t: "Máy lạnh", at: F("s4", "i2") }] },
  { name: "Bếp", from: F("s5") - 6, to: F("s6") - 6, items: [{ t: "Tủ lạnh", at: F("s5", "i0") }, { t: "Bếp từ", at: F("s5", "i1") }, { t: "Bàn ăn 4 ghế", at: F("s5", "i2") }] },
  { name: "Phòng ngủ", from: F("s6") - 6, to: F("s7") - 6, items: [{ t: "Giường", at: F("s6", "i0") }, { t: "Nệm", at: F("s6", "i1") }, { t: "Tủ áo", at: F("s6", "i2") }, { t: "Máy lạnh", at: F("s6", "i3") }] },
  { name: "Tiện ích khác", from: F("s7") - 6, to: T.c2, items: [{ t: "Máy giặt", at: Math.max(F("s7") + 8, F("s7", "i0")) }, { t: "Tủ giày", at: F("s7", "i1") }] },
];
const GIFT_ZONE: Zone = {
  name: "Quà tặng thiết bị", from: T.gift, to: T.c3,
  items: [{ t: "Tủ lạnh", at: Math.max(F("s9") + 10, F("s9", "i0")) }, { t: "Máy giặt", at: F("s9", "i1") }, { t: "Máy sấy", at: F("s9", "i2") }, { t: "Máy lạnh tất cả các phòng", at: F("s10", "all") }],
};

// ===== chữ =====
const GradText: React.FC<{ size: number; children: React.ReactNode; grad?: string; style?: React.CSSProperties }> = ({ size, children, grad = GRAD, style }) => (
  <div style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.45))", ...style }}>
    <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 1.04, backgroundImage: grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", padding: "0.04em 0.02em", whiteSpace: "nowrap" }}>{children}</div>
  </div>
);

const Logo: React.FC<{ top?: number; h?: number }> = ({ top = 150, h = 60 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center" }}>
    <div style={{ background: "#FBF7EE", borderRadius: 14, padding: "7px 15px", boxShadow: `0 0 0 2px ${GOLD}, 0 10px 26px rgba(0,0,0,0.35)` }}>
      <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: h, display: "block" }} />
    </div>
  </div>
);

const Bg: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: `radial-gradient(120% 75% at 50% 8%, ${BG1} 0%, ${BG0} 58%, #050D09 100%)` }}>
    {/* quầng sáng trôi chậm */}
    <div style={{ position: "absolute", width: 900, height: 900, borderRadius: 450, left: 90 + 160 * Math.sin(f / 90), top: 300 + 90 * Math.cos(f / 110), background: "radial-gradient(circle, rgba(92,203,146,0.13) 0%, rgba(92,203,146,0) 65%)" }} />
    <div style={{ position: "absolute", width: 700, height: 700, borderRadius: 350, left: 380 - 140 * Math.cos(f / 100), top: 1100 + 80 * Math.sin(f / 80), background: "radial-gradient(circle, rgba(226,184,101,0.10) 0%, rgba(226,184,101,0) 65%)" }} />
    {/* lưới mảnh */}
    <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />
  </AbsoluteFill>
);

// ===== CẢNH: 4 ƯU ĐÃI TÂN GIA =====
const CARDS = [
  { n: "1", pct: 6, type: "1PN+ · 2PN", tower: "THÁP SKYLINE CENTRAL", tag: "+ FULL NỘI THẤT", sid: "s2" },
  { n: "2", pct: 7, type: "2PN+ · 3PN", tower: "THÁP SKYLINE CENTRAL", tag: "+ QUÀ THIẾT BỊ", sid: "s8" },
  { n: "3", pct: 7, type: "SHOP · DELUXE · PENTHOUSE", tower: "", tag: "", sid: "s11" },
  { n: "4", pct: 8, type: "CÁC CĂN CÒN LẠI", tower: "", tag: "", sid: "s12" },
];

const TanGia: React.FC<{ f: number }> = ({ f }) => {
  const inK = sp(f, 0, 16);
  const chon = F("s1", "chon");
  const activeIdx = CARDS.reduce((acc, c, i) => (f >= F(c.sid) - 4 ? i : acc), -1);
  return (
    <AbsoluteFill>
      <Logo />
      <div style={{ position: "absolute", left: MX, right: MX, top: 262, textAlign: "center", opacity: Math.min(1, inK * 1.4), transform: `translateY(${(1 - inK) * 30}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 7, color: GOLD }}>CHÍNH SÁCH 149/2026</div>
        <GradText size={88} style={{ marginTop: 2 }}>ƯU ĐÃI TÂN GIA</GradText>
        <div style={{ display: "inline-block", marginTop: 14, background: GOLD, color: INK, fontFamily: SANS, fontWeight: 900, fontSize: 38, borderRadius: 14, padding: "6px 26px", transform: `scale(${sp(f, chon, 11)})` }}>CHỌN 1 TRONG 4</div>
      </div>
      <div style={{ position: "absolute", left: MX - 16, right: MX - 16, top: 600 }}>
        {CARDS.map((c, i) => {
          const k = sp(f, chon + 4 + i * 4, 13);
          const rev = F(c.sid, "pct");
          const revealed = f >= rev - 2;
          const rk = sp(f, rev - 2, 11);
          const active = i === activeIdx;
          const cnt = Math.round(interpolate(f, [rev - 2, rev + 12], [0, c.pct], clamp));
          const best = i === 3 && f >= rev + 6;
          return (
            <div key={c.n} style={{
              position: "relative", height: 196, marginBottom: 26, borderRadius: 26,
              background: active ? CREAM : "rgba(255,255,255,0.06)", border: active ? "none" : "1.5px solid rgba(255,255,255,0.14)",
              boxShadow: active ? `0 0 0 4px ${GOLD}, 0 24px 60px rgba(0,0,0,0.5)` : "none",
              display: "flex", alignItems: "center", padding: "0 34px", gap: 28,
              opacity: f < chon + 4 + i * 4 ? 0 : Math.min(1, k * 1.4) * (active || activeIdx < 0 ? 1 : 0.72),
              transform: `translateX(${(1 - k) * 90}px) scale(${active ? 1.03 : 1})`,
            }}>
              <div style={{ width: 82, height: 82, flex: "0 0 82px", borderRadius: 41, background: active ? INK : "rgba(255,255,255,0.1)", color: active ? GOLD : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 40 }}>{c.n}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: c.type.length > 16 ? 33 : 40, color: active ? INK : "#fff", whiteSpace: "nowrap" }}>{c.type}</div>
                {c.tower && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 2, color: active ? MINT_D : "rgba(255,255,255,0.6)", marginTop: 6 }}>{c.tower}</div>}
                {c.tag && revealed && (
                  <div style={{ display: "inline-block", marginTop: 10, background: active ? MINT_D : "rgba(92,203,146,0.2)", color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 22, borderRadius: 10, padding: "4px 14px", opacity: rk, transform: `translateY(${(1 - rk) * 10}px)` }}>{c.tag}</div>
                )}
                {best && <div style={{ display: "inline-block", marginTop: 10, background: GOLD, color: INK, fontFamily: SANS, fontWeight: 800, fontSize: 22, borderRadius: 10, padding: "4px 14px", transform: `scale(${sp(f, rev + 6, 11)})` }}>CHIẾT KHẤU CAO NHẤT</div>}
              </div>
              <div style={{ textAlign: "right", minWidth: 190 }}>
                {revealed ? (
                  <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 104, letterSpacing: -3, color: active ? INK : "#fff", transform: `scale(${0.6 + 0.4 * rk})`, transformOrigin: "right center", fontVariantNumeric: "tabular-nums" }}>
                    {cnt}<span style={{ fontSize: 58, color: active ? MINT_D : MINT }}>%</span>
                  </div>
                ) : (
                  <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 84, color: "rgba(255,255,255,0.22)" }}>?%</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: MX, right: MX, top: 1520, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 21, color: "rgba(255,255,255,0.5)" }}>
        Chiết khấu trừ vào giá bán chưa VAT, chưa phí bảo trì
      </div>
    </AbsoluteFill>
  );
};

// ===== lớp chữ trên cảnh nhà mẫu =====
const FootageOverlay: React.FC<{ f: number; zone: Zone; badge: string; zones?: Zone[] }> = ({ f, zone, badge, zones }) => {
  const zk = sp(f, zone.from + 2, 15);
  const cur = zone.items.reduce((acc, it, i) => (f >= it.at - 2 ? i : acc), -1);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,10,8,0.62) 0%, rgba(5,10,8,0.1) 22%, rgba(5,10,8,0) 40%, rgba(5,10,8,0) 56%, rgba(5,10,8,0.5) 72%, rgba(5,10,8,0.75) 100%)" }} />
      <Logo h={52} top={140} />
      {/* badge ưu đãi */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 236, display: "flex", justifyContent: "center" }}>
        <div style={{ background: "rgba(11,26,19,0.82)", border: `2px solid ${GOLD}`, borderRadius: 40, padding: "8px 24px", fontFamily: SANS, fontWeight: 800, fontSize: 26, color: "#fff", letterSpacing: 1 }}>{badge}</div>
      </div>
      {/* các khu vực */}
      {zones && (
        <div style={{ position: "absolute", left: MX, right: MX, top: 318, display: "flex", justifyContent: "center", gap: 10 }}>
          {zones.map((z) => {
            const on = z === zone;
            const done = z.to <= f;
            return <div key={z.name} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, padding: "6px 14px", borderRadius: 20, background: on ? GOLD : "rgba(0,0,0,0.45)", color: on ? INK : done ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)" }}>{done ? "✓ " : ""}{z.name.toUpperCase()}</div>;
          })}
        </div>
      )}
      {/* tên khu + checklist */}
      <div style={{ position: "absolute", left: MX, right: MX, top: 1290 }}>
        <div style={{ opacity: Math.min(1, zk * 1.4), transform: `translateX(${(1 - zk) * -40}px)` }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 7, color: GOLD, textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}>{zones ? "KHU VỰC" : "TẶNG KÈM"}</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 70, color: "#fff", lineHeight: 1.08, textShadow: "0 3px 18px rgba(0,0,0,0.7)" }}>{zone.name}</div>
          <div style={{ height: 4, width: 110 * zk, background: GOLD, marginTop: 10, borderRadius: 2 }} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 26 }}>
          {zone.items.map((it, i) => {
            if (f < it.at - 2) return null;
            const k = sp(f, it.at - 2, 13);
            const on = i === cur;
            return (
              <div key={it.t} style={{
                display: "flex", alignItems: "center", gap: 12, borderRadius: 16, padding: "10px 22px 10px 12px",
                background: on ? CREAM : "rgba(14,23,20,0.78)", border: on ? "none" : "1.5px solid rgba(255,255,255,0.18)",
                opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 24}px) scale(${0.9 + 0.1 * k})`,
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 19, background: on ? MINT_D : GOLD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={on ? "#fff" : INK} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: on ? INK : "#fff", whiteSpace: "nowrap" }}>{it.t}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", right: MX, top: 1640, fontFamily: SANS, fontWeight: 600, fontSize: 19, color: "rgba(255,255,255,0.6)" }}>Hình ảnh thực tế nhà mẫu</div>
    </AbsoluteFill>
  );
};

const WalkOverlay: React.FC<{ f: number }> = ({ f }) => {
  const a = sp(f, T.walk + 6, 12), b = sp(f, F("s3", "don") - 2, 12);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,10,8,0.6) 0%, rgba(5,10,8,0) 26%, rgba(5,10,8,0) 50%, rgba(5,10,8,0.6) 78%, rgba(5,10,8,0.8) 100%)" }} />
      <Logo h={52} top={140} />
      <div style={{ position: "absolute", left: MX, right: MX, top: 1130, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 6, color: "#fff", opacity: Math.min(1, a * 1.4), textShadow: "0 3px 14px rgba(0,0,0,0.7)" }}>KÈM GÓI</div>
        <div style={{ display: "inline-block", marginTop: 10, background: GOLDGRAD, borderRadius: 20, padding: "8px 34px", transform: `scale(${0.7 + 0.3 * a})`, opacity: Math.min(1, a * 1.4), boxShadow: "0 16px 40px rgba(0,0,0,0.45)" }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 84, color: INK, whiteSpace: "nowrap" }}>FULL NỘI THẤT</div>
        </div>
        <div style={{ marginTop: 22, opacity: Math.min(1, b * 1.4), transform: `translateY(${(1 - b) * 26}px)` }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64, color: "#fff", textShadow: "0 4px 18px rgba(0,0,0,0.7)" }}>DỌN VÀO Ở LUÔN</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1640, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 19, color: "rgba(255,255,255,0.6)" }}>Nhà mẫu căn 2PN · tháp Skyline Central</div>
    </AbsoluteFill>
  );
};

// ===== CẢNH: CỘNG THÊM =====
const House: React.FC<{ on: boolean }> = ({ on }) => (
  <svg width={50} height={50} viewBox="0 0 24 24" fill={on ? GOLD : "rgba(255,255,255,0.18)"}><path d="M12 3 2 11h3v9h5v-6h4v6h5v-9h3z" /></svg>
);

const Plus: React.FC<{ f: number }> = ({ f }) => {
  const from = T.plus;
  const inK = sp(f, from, 16);
  const a = sp(f, F("s14") - 4, 13), aP = sp(f, F("s14", "plus") - 2, 10);
  const b = sp(f, F("s15") - 4, 13), b1 = sp(f, F("s15", "plus") - 2, 10), b2 = sp(f, F("s16", "plus") - 2, 10);
  const ring = ramp(f, F("s14"), F("s14") + s(1.4), Easing.inOut(Easing.cubic));
  const R = 66, C = 2 * Math.PI * R;
  const box = (k: number): React.CSSProperties => ({ opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 60}px)` });
  return (
    <AbsoluteFill>
      <Logo />
      <div style={{ position: "absolute", left: MX, right: MX, top: 262, textAlign: "center", opacity: Math.min(1, inK * 1.4), transform: `translateY(${(1 - inK) * 30}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 7, color: GOLD }}>NGOÀI RA CÒN</div>
        <GradText size={96} style={{ marginTop: 2 }}>CỘNG THÊM</GradText>
      </div>
      {/* thẻ 72h */}
      <div style={{ position: "absolute", left: MX - 16, right: MX - 16, top: 520, height: 330, borderRadius: 28, background: CREAM, boxShadow: "0 24px 60px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", padding: "0 40px", gap: 34, ...box(a) }}>
        <div style={{ position: "relative", width: 160, height: 160, flex: "0 0 160px" }}>
          <svg width={160} height={160} viewBox="0 0 160 160" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
            <circle cx={80} cy={80} r={R} fill="none" stroke="rgba(22,38,30,0.12)" strokeWidth={14} />
            <circle cx={80} cy={80} r={R} fill="none" stroke={MINT_D} strokeWidth={14} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - ring)} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 50, color: INK, lineHeight: 1 }}>72</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 22, color: MINT_D }}>GIỜ</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: MINT_D }}>ĐÓNG ĐỦ 10%</div>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 46, color: INK, lineHeight: 1.1, marginTop: 4 }}>TRONG 72 GIỜ</div>
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 110, color: INK, letterSpacing: -3, transform: `scale(${aP})`, opacity: f >= F("s14", "plus") - 2 ? 1 : 0 }}>+1<span style={{ fontSize: 60, color: MINT_D }}>%</span></div>
      </div>
      {/* thẻ mua sỉ */}
      <div style={{ position: "absolute", left: MX - 16, right: MX - 16, top: 890, borderRadius: 28, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.16)", padding: "30px 40px", ...box(b) }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: GOLD }}>MUA CÙNG LÚC NHIỀU CĂN</div>
        {[{ n: 2, t: "2 CĂN", p: "+1", k: b1, at: F("s15", "plus") }, { n: 3, t: "TỪ 3 CĂN", p: "+1,5", k: b2, at: F("s16", "plus") }].map((r) => {
          const vis = f >= r.at - 8;
          const act = f >= r.at - 2;
          return (
            <div key={r.t} style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 22, height: 130, borderRadius: 20, padding: "0 28px", background: act ? CREAM : "rgba(255,255,255,0.05)", opacity: vis ? 1 : 0.25 }}>
              <div style={{ display: "flex", gap: 4 }}>{Array.from({ length: r.n }).map((_, i) => <House key={i} on={act} />)}</div>
              <div style={{ flex: 1, fontFamily: SANS, fontWeight: 900, fontSize: 44, color: act ? INK : "#fff" }}>{r.t}</div>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 84, color: act ? INK : "rgba(255,255,255,0.2)", letterSpacing: -2, transform: `scale(${act ? r.k : 1})`, transformOrigin: "right center" }}>{act ? r.p : "?"}<span style={{ fontSize: 46, color: act ? MINT_D : "rgba(255,255,255,0.2)" }}>%</span></div>
            </div>
          );
        })}
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 21, color: "rgba(255,255,255,0.55)", marginTop: 18 }}>Mua cùng thời điểm, đứng tên trực tiếp</div>
      </div>
    </AbsoluteFill>
  );
};

// ===== CẢNH: THEO CÁCH THANH TOÁN =====
const Pay: React.FC<{ f: number }> = ({ f }) => {
  const from = T.pay;
  const inK = sp(f, from, 16);
  const toLoan = ramp(f, F("s22") - 10, F("s22") + 6, Easing.inOut(Easing.cubic));
  const rows = [
    { k: "NHANH", sub: "Đóng sớm 40%", pct: "+9", at: F("s18", "pct"), show: F("s18") - 4 },
    { k: "CHUẨN", sub: "Đóng theo tiến độ, 2 tháng/đợt", pct: "+3", at: F("s19", "pct"), show: F("s19") - 4 },
    { k: "VAY NGÂN HÀNG", sub: "Không có chiết khấu thanh toán", pct: "0", at: F("s20", "no"), show: F("s20") - 4, bank: true },
  ];
  const activeRow = rows.reduce((acc, r, i) => (f >= r.show ? i : acc), -1);
  const sumK = sp(f, F("s18", "pct") + s(1.0), 13);
  const ten = ramp(f, F("s21", "pct"), F("s21", "pct") + 18);
  return (
    <AbsoluteFill>
      <Logo />
      <div style={{ position: "absolute", left: MX, right: MX, top: 262, textAlign: "center", opacity: Math.min(1, inK * 1.4), transform: `translateY(${(1 - inK) * 30}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: GOLD }}>{toLoan < 0.5 ? "CHIẾT KHẤU LỚN NHẤT NẰM Ở" : "VAY NGÂN HÀNG · HỖ TRỢ LÃI SUẤT"}</div>
        <GradText size={toLoan < 0.5 ? 80 : 84} style={{ marginTop: 2 }}>{toLoan < 0.5 ? "CÁCH THANH TOÁN" : "LÃI 0%"}</GradText>
      </div>

      {/* 3 phương án */}
      <div style={{ position: "absolute", left: MX - 16, right: MX - 16, top: 520, opacity: 1 - toLoan, transform: `translateY(${-toLoan * 80}px)` }}>
        {rows.map((r, i) => {
          const k = sp(f, r.show, 13);
          const act = i === activeRow;
          const pk = sp(f, r.at - 2, 10);
          const shown = f >= r.at - 2;
          return (
            <div key={r.k} style={{
              minHeight: 176, paddingTop: 14, paddingBottom: 14, boxSizing: "border-box", marginBottom: 24, borderRadius: 26, display: "flex", alignItems: "center", padding: "0 36px", gap: 24,
              background: act ? (r.bank ? "rgba(226,184,101,0.14)" : CREAM) : "rgba(255,255,255,0.06)",
              border: act && r.bank ? `2.5px solid ${GOLD}` : act ? "none" : "1.5px solid rgba(255,255,255,0.14)",
              boxShadow: act && !r.bank ? `0 0 0 4px ${GOLD}, 0 22px 56px rgba(0,0,0,0.5)` : "none",
              opacity: f < r.show ? 0 : Math.min(1, k * 1.4) * (act ? 1 : 0.75), transform: `translateX(${(1 - k) * 90}px)`,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 48, color: act && !r.bank ? INK : "#fff" }}>{r.k}</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: act && !r.bank ? MINT_D : "rgba(255,255,255,0.62)", marginTop: 4 }}>{r.sub}</div>
                {i === 0 && f >= F("s18", "pct") + s(1.0) && (
                  <div style={{ display: "inline-block", marginTop: 10, background: GOLDGRAD, borderRadius: 12, padding: "5px 16px", fontFamily: SANS, fontWeight: 900, fontSize: 24, color: INK, whiteSpace: "nowrap", transform: `scale(${sumK})`, transformOrigin: "left center" }}>CỘNG DỒN TỐI ĐA 18%</div>
                )}
              </div>
              {shown && (r.bank ? (
                <div style={{ position: "relative", fontFamily: SANS, fontWeight: 900, fontSize: 72, color: "rgba(255,255,255,0.55)", transform: `scale(${pk})` }}>
                  CK<div style={{ position: "absolute", left: -8, right: -8, top: "52%", height: 7, borderRadius: 4, background: "#FF6B5B", transform: `rotate(-12deg) scaleX(${ramp(f, r.at + 2, r.at + 12)})` }} />
                </div>
              ) : (
                <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 108, letterSpacing: -3, color: act ? INK : "#fff", transform: `scale(${0.6 + 0.4 * pk})`, transformOrigin: "right center" }}>{r.pct}<span style={{ fontSize: 58, color: act ? MINT_D : MINT }}>%</span></div>
              ))}
            </div>
          );
        })}
        {/* vay: chỉ đóng 10% tới lúc nhận nhà */}
        {f >= F("s21") - 4 && (
          <div style={{ marginTop: -4, borderRadius: 26, background: CREAM, padding: "26px 36px", boxShadow: `0 0 0 4px ${GOLD}, 0 22px 56px rgba(0,0,0,0.5)`, opacity: Math.min(1, sp(f, F("s21") - 4, 13) * 1.4), transform: `translateY(${(1 - sp(f, F("s21") - 4, 13)) * 40}px)` }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: INK }}>BÙ LẠI · CHỈ ĐÓNG</div>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64, color: MINT_D }}>10%</div>
            </div>
            <div style={{ position: "relative", height: 26, borderRadius: 13, background: "rgba(22,38,30,0.1)", marginTop: 12, overflow: "hidden" }}>
              <div style={{ width: `${10 * ten}%`, height: "100%", background: MINT_D, borderRadius: 13 }} />
              <div style={{ position: "absolute", left: "10%", right: 0, top: 0, bottom: 0, backgroundImage: "repeating-linear-gradient(135deg, rgba(29,122,78,0.18) 0 10px, transparent 10px 20px)", opacity: ten }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontFamily: SANS, fontWeight: 700, fontSize: 22, color: "#6B7A72" }}>
              <span>Mình đóng</span><span>Ngân hàng giải ngân · tới lúc nhận nhà</span>
            </div>
          </div>
        )}
      </div>

      {/* hỗ trợ lãi suất */}
      {toLoan > 0 && (
        <div style={{ position: "absolute", left: MX - 16, right: MX - 16, top: 520, opacity: toLoan, transform: `translateY(${(1 - toLoan) * 80}px)` }}>
          {[
            { v: "VAY 70%", lines: [{ a: "LÃI 0%", b: "12 THÁNG", at: F("s22", "rate") }, { a: "HOẶC CỐ ĐỊNH 5,5%", b: "24 THÁNG", at: F("s23", "rate") }], show: F("s22") },
            { v: "VAY 50%", lines: [{ a: "LÃI 0%", b: "TỐI ĐA 18 THÁNG", at: F("s24", "rate") }], show: F("s24") - 4 },
          ].map((c, ci) => {
            const k = sp(f, c.show, 13);
            const act = ci === (f >= F("s24") - 4 ? 1 : 0);
            return (
              <div key={c.v} style={{
                borderRadius: 28, marginBottom: 30, padding: "28px 36px", background: act ? CREAM : "rgba(255,255,255,0.06)",
                border: act ? "none" : "1.5px solid rgba(255,255,255,0.14)", boxShadow: act ? `0 0 0 4px ${GOLD}, 0 22px 56px rgba(0,0,0,0.5)` : "none",
                opacity: f < c.show ? 0 : Math.min(1, k * 1.4) * (act ? 1 : 0.75), transform: `translateY(${(1 - k) * 50}px)`,
              }}>
                <div style={{ display: "inline-block", background: act ? INK : "rgba(255,255,255,0.12)", color: GOLD, fontFamily: SANS, fontWeight: 900, fontSize: 34, borderRadius: 12, padding: "4px 18px" }}>{c.v}</div>
                {c.lines.map((l) => {
                  const lk = sp(f, l.at - 3, 12);
                  return (
                    <div key={l.a} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 18, opacity: f < l.at - 3 ? 0 : Math.min(1, lk * 1.4), transform: `translateX(${(1 - lk) * 50}px)` }}>
                      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: l.a.length > 8 ? 44 : 76, color: act ? INK : "#fff", letterSpacing: -1 }}>{l.a}</div>
                      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: act ? MINT_D : MINT, whiteSpace: "nowrap" }}>{l.b}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div style={{ textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>SHINHAN · VIETCOMBANK · VIETINBANK</div>
        </div>
      )}
      <div style={{ position: "absolute", left: MX, right: MX, top: 1560, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 20, lineHeight: 1.35, color: "rgba(255,255,255,0.5)" }}>
        Theo CSBH 149/2026 · Ưu đãi lãi suất theo điều kiện ngân hàng
      </div>
    </AbsoluteFill>
  );
};

// ===== tổng =====
const inRange = (f: number, a: number, b: number) => f >= a && f < b;
const SceneFade: React.FC<{ f: number; a: number; b: number; children: React.ReactNode }> = ({ f, a, b, children }) => {
  const k = ramp(f, a, a + 8) * (1 - ramp(f, b - 6, b));
  return <AbsoluteFill style={{ opacity: k, transform: `scale(${1.04 - 0.04 * ramp(f, a, a + 10)})` }}>{children}</AbsoluteFill>;
};

export const GSLChinhSach: React.FC<{ voice?: string | null }> = ({ voice = null }) => {
  const f = useCurrentFrame();
  const furnShot = FURN_SHOTS.find((x) => f >= x.from && f < x.to);
  const giftShot = GIFT_SHOTS.find((x) => f >= x.from && f < x.to);
  const zone = ZONES.find((z) => f >= z.from && f < z.to);
  const graphic = inRange(f, 0, T.walk) || inRange(f, T.c2, T.gift) || inRange(f, T.c3, T.end);
  const cuts = [T.walk, T.furn, ...FURN_SHOTS.slice(1).map((x) => x.from), T.c2, T.gift, ...GIFT_SHOTS.slice(1).map((x) => x.from), T.c3, T.plus, T.pay];
  const ticks = [...ZONES.flatMap((z) => z.items.map((i) => i.at)), ...GIFT_ZONE.items.map((i) => i.at)];
  const pops = [...CARDS.map((c) => F(c.sid, "pct")), F("s14", "plus"), F("s15", "plus"), F("s16", "plus"), F("s18", "pct"), F("s19", "pct"), F("s21", "pct"), F("s22", "rate"), F("s23", "rate"), F("s24", "rate")];
  return (
    <AbsoluteFill style={{ background: BG0, overflow: "hidden" }}>
      {graphic && <Bg f={f} />}
      {inRange(f, 0, T.walk) && <SceneFade f={f} a={-10} b={T.walk}><TanGia f={f} /></SceneFade>}
      {inRange(f, T.c2, T.gift) && <SceneFade f={f} a={T.c2} b={T.gift}><TanGia f={f} /></SceneFade>}
      {inRange(f, T.c3, T.plus) && <SceneFade f={f} a={T.c3} b={T.plus}><TanGia f={f} /></SceneFade>}
      {inRange(f, T.plus, T.pay) && <SceneFade f={f} a={T.plus} b={T.pay}><Plus f={f} /></SceneFade>}
      {inRange(f, T.pay, T.end) && <SceneFade f={f} a={T.pay} b={T.end + 10}><Pay f={f} /></SceneFade>}

      {/* nhà mẫu: đi vào căn */}
      {inRange(f, T.walk, T.furn) && (
        <>
          <ShotView sh={{ from: T.walk, to: T.furn, live: "walkin", liveFrom: 0, cams: [{ x: 1000, at: 0 }] }} f={f} />
          <WalkOverlay f={f} />
        </>
      )}
      {furnShot && <ShotView sh={furnShot} f={f} />}
      {zone && <FootageOverlay f={f} zone={zone} zones={ZONES} badge="① CHIẾT KHẤU 6% + FULL NỘI THẤT" />}
      {giftShot && <ShotView sh={giftShot} f={f} />}
      {giftShot && <FootageOverlay f={f} zone={GIFT_ZONE} badge="② CHIẾT KHẤU 7% + QUÀ THIẾT BỊ" />}

      {/* âm thanh */}
      {voice && <Sequence from={s(VO_LEAD)}><Audio src={staticFile(voice)} /></Sequence>}
      {cuts.map((c, i) => <Sequence key={"w" + i} from={Math.max(0, c - 5)} durationInFrames={25}><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.16} /></Sequence>)}
      {ticks.map((c, i) => <Sequence key={"t" + i} from={c} durationInFrames={12}><Audio src={staticFile("audio/sfx_tick.wav")} volume={0.22} /></Sequence>)}
      {pops.map((c, i) => <Sequence key={"p" + i} from={Math.max(0, c - 2)} durationInFrames={15}><Audio src={staticFile("audio/sfx_pop.wav")} volume={0.2} /></Sequence>)}
    </AbsoluteFill>
  );
};
