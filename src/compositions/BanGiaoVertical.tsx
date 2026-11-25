import React from "react";
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Loop,
} from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { UNITS, TIER, Stop, StopItem } from "./BanGiaoTour";

/**
 * Bản dọc 9:16 "đếm món bàn giao" — dùng lại dữ liệu điểm dừng (still + cutout + glow) của BanGiaoTour.
 * Thiết kế ở hệ 1080×1920; ảnh nền là khung 1920×1080 phóng ×K, khung dọc trượt theo món đang giới thiệu.
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["500", "600", "700", "800"], subsets: ["vietnamese", "latin"] });
const { fontFamily: SERIF } = loadPlayfair("normal", { weights: ["600", "700"], subsets: ["vietnamese", "latin"] });

const GREEN = "#1F2E27";
const GOLD = "#C9A25C";
const SAGE = "#5E8B6E";

const K = 1920 / 1080; // ảnh tràn full khung dọc
const KS = K;
const TOPY = 0;
const HALF = 540 / KS; // nửa bề rộng khung dọc tính theo hệ 1920
const HOOK = 90;
const LEAD = 90;
const ITEM = 60;
const TAIL = 20;
const XF = 14; // chồng mờ giữa 2 điểm dừng
const TR = 20; // khung hình lia sang món kế tiếp
const EXTRA = 110;
const SUM = 225;

type VUnit = { label: string; music: string; extra: string[]; cols: string[][]; outro?: { from: number; len: number; zone: string } };
const VUNITS: Record<string, VUnit> = {
  "1pn": {
    label: "1PN+", music: "bg_1pn_user.m4a", extra: ["Tủ kệ TV", "Vách TV + chỉ trang trí", "Kệ úp chén Hafele", "Tủ giày"],
    cols: [["Bếp & phòng ăn", "Phòng làm việc", "Khu vực khác"], ["Phòng khách", "Phòng ngủ"]],
  },
  "2pn": {
    label: "2PN", music: "bg_2pn_user.m4a", extra: ["Kệ úp chén Hafele", "Tranh phòng khách", "Bàn làm việc phòng master", "Tủ giày", "Máy giặt"],
    cols: [["Bếp & phòng ăn", "Phòng khách"], ["Phòng ngủ master", "Phòng ngủ 2", "Khu vực khác"]],
    outro: { from: 3830, len: 150, zone: "Ban công · view nội khu" },
  },
};

const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const ss = (t: number) => t * t * (3 - 2 * t);
const clampX = (x: number) => Math.max(HALF, Math.min(1920 - HALF, x));
/** Đoạn quay thật chạy vào điểm dừng: tối đa 3s, không lấn vào khoảng đứng hình của điểm dừng trước */
const leadOf = (stops: Stop[], i: number) => (i === 0 ? Math.min(LEAD, stops[0].at) : Math.min(LEAD, stops[i].at - (stops[i - 1].at + stops[i - 1].dur)));
const stopLen = (s: Stop, lead: number) => lead + s.items.length * ITEM + TAIL;
const total = (unit: string) => UNITS[unit].summary.reduce((s, g) => s + g.items.length, 0);

/** Mốc thời gian: các điểm dừng chồng mờ XF khung lên nhau, sau cùng là đoạn outro (nếu có) */
const timeline = (unit: string) => {
  const stops = UNITS[unit].data.stops;
  const leads = stops.map((_, i) => leadOf(stops, i));
  const starts: number[] = [];
  let acc = HOOK - XF; // điểm dừng đầu chồng mờ lên cảnh mở đầu
  stops.forEach((s, i) => { starts.push(acc); acc += stopLen(s, leads[i]) - XF; });
  const outro = VUNITS[unit].outro;
  const outroStart = acc;
  const tourEnd = outro ? outroStart + outro.len : acc + XF;
  return { leads, starts, outroStart, tourEnd };
};

export const bangiaoVerticalFrames = (unit: string) => timeline(unit).tourEnd + EXTRA + SUM;

const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Camera: món rộng hơn khung thì lia từ trái sang phải trong nhịp của món */
const camPath = (it: StopItem) => {
  const [x0, , x1] = it.bbox;
  if (x1 - x0 > HALF * 2 - 60) return [clampX(x0 + HALF - 20), clampX(x1 - HALF + 20)];
  const c = clampX((x0 + x1) / 2);
  return [c, c];
};

const camAt = (items: StopItem[], i: number, g: number) => {
  const [s, e] = camPath(items[i]);
  const prev = i === 0 ? s : camPath(items[i - 1])[1];
  if (g < TR) return prev + (s - prev) * inOut(g / TR);
  return s + (e - s) * inOut(Math.min(1, (g - TR) / (ITEM - TR - 4)));
};

const Header: React.FC<{ zone: string; zoneO: number; count: number; bump: number; total: number }> = ({ zone, zoneO, count, bump, total }) => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%)" }} />
    <div style={{ position: "absolute", left: 90, top: 230, opacity: zoneO, transform: `translateX(${(1 - zoneO) * -20}px)` }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 7, color: GOLD, textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}>KHU VỰC</div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 56, color: "#fff", textShadow: "0 3px 18px rgba(0,0,0,0.7)", lineHeight: 1.1 }}>{zone}</div>
    </div>
    <div style={{ position: "absolute", right: 90, top: 220, background: "rgba(31,46,39,0.88)", border: `3px solid ${GOLD}`, borderRadius: 22, padding: "12px 24px", textAlign: "center" }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 66, color: "#fff", lineHeight: 1, transform: `scale(${bump})` }}>
        {count}<span style={{ fontSize: 34, color: GOLD }}>/{total}</span>
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 19, color: "rgba(255,255,255,0.85)", marginTop: 6 }}>món bàn giao</div>
    </div>
  </>
);

const Frame1920: React.FC<{ cx: number; k?: number; top?: number; children: React.ReactNode }> = ({ cx, k = K, top = 0, children }) => (
  <div style={{ position: "absolute", left: 540 - cx * k, top, width: 1920, height: 1080, transform: `scale(${k})`, transformOrigin: "0 0" }}>
    {children}
  </div>
);

const StopV: React.FC<{ unit: string; stop: Stop; lead: number }> = ({ unit, stop, lead: LEAD }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = stopLen(stop, LEAD);
  const items = stop.items;
  const live = f < LEAD;
  const i = Math.max(0, Math.min(items.length - 1, Math.floor((f - LEAD) / ITEM)));
  const g = f - LEAD - i * ITEM;
  const cx = live ? 960 + (camPath(items[0])[0] - 960) * ss(ease(f, LEAD - 24, LEAD)) : camAt(items, i, Math.min(g, ITEM));
  const dim = ease(f, LEAD, LEAD + 14) * (1 - ease(f, len - XF - 6, len - XF + 6));
  const push = live ? 1 : 1 + 0.035 * ss(ease(f, LEAD, len));
  const it = items[i];
  const itemO = live ? 0 : ease(g, 2, 14) * (i < items.length - 1 ? 1 - ease(g, ITEM - 10, ITEM) : 1) * (1 - ease(f, len - XF - 8, len - XF + 4));
  const khong = it.tier === "khong";

  // nhãn: món nằm nửa dưới -> nhãn lên trên, ngược lại nhãn xuống dưới
  const [x0, y0, x1, y1] = it.bbox;
  const sy0 = TOPY + y0 * KS, sy1 = TOPY + y1 * KS;
  const ov = (a: number, b: number) => Math.max(0, Math.min(sy1, b) - Math.max(sy0, a));
  const top = ov(390, 650) < ov(1170, 1430) || (ov(390, 650) === ov(1170, 1430) && (sy0 + sy1) / 2 > 960);
  const cardY = top ? 390 : 1170;
  const cardH = 260;
  const card = spring({ frame: g - 8, fps, config: { damping: 200 } });
  const t = TIER[it.tier];

  return (
    <AbsoluteFill style={{ background: "#000", opacity: ease(f, 0, XF) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: TOPY, height: 1080 * KS, overflow: "hidden", transform: `scale(${push})` }}>
      {live ? (
        <Frame1920 cx={cx} k={KS}>
          <OffthreadVideo src={staticFile(`video/bangiao/${unit}_tour.mp4`)} startFrom={stop.at - LEAD} muted style={{ width: 1920, height: 1080 }} />
        </Frame1920>
      ) : (
        <Frame1920 cx={cx} k={KS}>
          <Img src={staticFile(stop.img)} style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }} />
          <Img src={staticFile(stop.img)} style={{ position: "absolute", inset: 0, width: 1920, height: 1080, filter: "brightness(0.4) saturate(0.6)", opacity: dim }} />
          {(() => {
            const [c0, c1, c2, c3] = it.cutBox;
            return (
              <>
                <Img src={staticFile(it.cut)} style={{ position: "absolute", left: c0, top: c1, width: c2 - c0, height: c3 - c1, opacity: itemO, filter: khong ? "grayscale(0.6) brightness(0.85)" : `brightness(1.12) drop-shadow(0 0 ${14 + 6 * Math.sin(g / 6)}px rgba(255,240,205,0.75)) drop-shadow(0 0 40px rgba(255,235,190,0.35))` }} />
              </>
            );
          })()}
        </Frame1920>
      )}
      </div>
      {!live && (
        <>
          <div style={{ position: "absolute", left: 90, width: 880, top: cardY, height: cardH, opacity: card * itemO, transform: `translateY(${(1 - card) * 16}px)` }}>
            <div style={{ position: "absolute", inset: 0, transform: "translate(12px, 12px)", border: "2px solid rgba(255,255,255,0.45)", borderRadius: 10 }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(18,24,21,0.72)", backdropFilter: "blur(12px)", border: "3px solid rgba(255,255,255,0.92)", borderRadius: 10, padding: "22px 32px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 18, height: 18, borderRadius: 9, background: t.color }} />
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: t.color }}>{t.tag}</div>
                {it.n > 1 && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 22, color: GREEN, background: t.color, borderRadius: 10, padding: "2px 12px" }}>{it.n} món</div>}
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: it.title.length > 22 ? 46 : 58, color: "#fff", marginTop: 8, lineHeight: 1.12, textDecoration: khong ? "line-through" : "none", textDecorationThickness: 4 }}>{it.title}</div>
              {it.sub && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: "rgba(255,255,255,0.85)", marginTop: 6 }}>{it.sub}</div>}
            </div>
          </div>
        </>
      )}
      {items.map((x, j) => (
        <Sequence key={j} from={LEAD + j * ITEM + 10} durationInFrames={10}>
          <Audio src={staticFile("audio/sfx_tick.wav")} volume={x.tier === "khong" ? 0.12 : 0.3} />
        </Sequence>
      ))}
      <Sequence from={LEAD - 6} durationInFrames={30}><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.22} /></Sequence>
    </AbsoluteFill>
  );
};

const Hook: React.FC<{ unit: string }> = ({ unit }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f - 4, fps, config: { damping: 200 } });
  const b = spring({ frame: f - 14, fps, config: { damping: 11 } });
  const c = spring({ frame: f - 30, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Frame1920 cx={960}>
        <OffthreadVideo src={staticFile(`video/bangiao/${unit}_hook.mp4`)} muted style={{ width: 1920, height: 1080, transform: `scale(${1.1 - 0.08 * ease(f, 0, HOOK)})` }} />
      </Frame1920>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(15,22,18,0.2) 0%, rgba(15,22,18,0.75) 38%, rgba(15,22,18,0.75) 68%, rgba(15,22,18,0.2) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#F7F1E6", borderRadius: 14, padding: "12px 22px", opacity: a }}>
          <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 80 }} />
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: 6, color: GOLD, marginTop: 36, opacity: a }}>CĂN {VUNITS[unit].label} · SKYLINE CENTRAL</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 96, color: "#fff", marginTop: 20, opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>BÀN GIAO</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 180, color: GOLD, lineHeight: 1, transform: `scale(${b})`, textShadow: "0 6px 30px rgba(0,0,0,0.5)" }}>{total(unit)} MÓN</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 58, color: "#fff", marginTop: 22, opacity: c, transform: `translateY(${(1 - c) * 20}px)` }}>nội thất gì? Đếm thử nhé</div>
      </div>
      <Sequence from={12} durationInFrames={20}><Audio src={staticFile("audio/sfx_chime.wav")} volume={0.25} /></Sequence>
    </AbsoluteFill>
  );
};

const BlurBg: React.FC<{ unit: string }> = ({ unit }) => (
  <>
    <Loop durationInFrames={Math.round(6.5 * 30)}>
      <Frame1920 cx={960}>
        <OffthreadVideo src={staticFile(`video/bangiao/${unit}_hook.mp4`)} muted style={{ width: 1920, height: 1080, filter: "blur(20px) brightness(0.45)", transform: "scale(1.15)" }} />
      </Frame1920>
    </Loop>
    <AbsoluteFill style={{ background: "rgba(31,46,39,0.6)" }} />
  </>
);

const Extra: React.FC<{ unit: string; base: number }> = ({ unit, base }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const list = VUNITS[unit].extra;
  const h = spring({ frame: f - 2, fps, config: { damping: 200 } });
  const shown = list.filter((_, i) => f >= 22 + i * 12).length;
  return (
    <AbsoluteFill>
      <BlurBg unit={unit} />
      <Header zone="Chưa lọt khung quay" zoneO={1} count={base + shown} bump={1} total={total(unit)} />
      <div style={{ position: "absolute", left: 110, right: 110, top: 560, opacity: h, transform: `translateY(${(1 - h) * 20}px)` }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 74, color: "#fff", lineHeight: 1.15 }}>Và còn {list.length} món nữa</div>
        <div style={{ height: 5, width: 120, background: GOLD, margin: "26px 0 40px" }} />
        {list.map((name, i) => {
          const s = spring({ frame: f - 22 - i * 12, fps, config: { damping: 200 } });
          return (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 30, opacity: s, transform: `translateX(${(1 - s) * -30}px)` }}>
              <div style={{ width: 54, height: 54, borderRadius: 27, background: GOLD, color: GREEN, fontFamily: SANS, fontWeight: 800, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 50, color: "#fff" }}>{name}</div>
            </div>
          );
        })}
      </div>
      {list.map((_, i) => (
        <Sequence key={i} from={22 + i * 12} durationInFrames={10}><Audio src={staticFile("audio/sfx_tick.wav")} volume={0.3} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

const SummaryV: React.FC<{ unit: string }> = ({ unit }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = UNITS[unit];
  const head = spring({ frame: f - 4, fps, config: { damping: 200 } });
  const by = (z: string) => u.summary.find((g) => g.zone === z)!;
  const cols = VUNITS[unit].cols.map((c) => c.map(by));
  const big = total(unit) <= 27;
  let k = 0;
  return (
    <AbsoluteFill>
      <BlurBg unit={unit} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 230, opacity: head, transform: `translateY(${(1 - head) * 20}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 5, color: GOLD }}>GREEN SKYLINE · SKYLINE CENTRAL</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 54, color: "#fff", lineHeight: 1.12, marginTop: 8 }}>{u.name}: {total(unit)} món bàn giao</div>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 420, display: "flex", gap: 20, alignItems: "flex-start" }}>
        {cols.map((col, ci) => (
          <div key={ci} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
            {col.map((g) => {
              const gs = spring({ frame: f - 10 - ci * 6, fps, config: { damping: 200 } });
              return (
                <div key={g.zone} style={{ background: "rgba(250,246,238,0.96)", borderRadius: 16, padding: "22px 20px 12px", opacity: gs, transform: `translateY(${(1 - gs) * 30}px)` }}>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: GREEN }}>{g.zone}</div>
                  <div style={{ height: 3, width: 54, background: GOLD, margin: "8px 0 12px" }} />
                  {g.items.map(([name, tier]) => {
                    const d = 22 + k++ * 3;
                    const is = ease(f, d, d + 8);
                    return (
                      <div key={name} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: big ? 12 : 8, opacity: is }}>
                        <div style={{ flex: "none", width: 32, height: 32, borderRadius: 16, background: tier === "coban" ? SAGE : GOLD, color: "#fff", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, marginTop: 2 }}>✓</div>
                        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: big ? 27 : 25, color: "#2b2b2b", lineHeight: 1.22 }}>{name}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, bottom: 340, opacity: ease(f, 60, 80), fontFamily: SANS, fontWeight: 500, fontSize: 25, color: "rgba(255,255,255,0.85)", lineHeight: 1.45 }}>
        <span style={{ color: GOLD, fontWeight: 700 }}>●</span> Bàn giao hoàn thiện (gói nội thất) &nbsp; <span style={{ color: SAGE, fontWeight: 700 }}>●</span> Có cả ở bàn giao cơ bản
        <br />Tivi, máy sấy, rèm và đồ decor không thuộc danh mục
      </div>
      <Sequence from={8} durationInFrames={20}><Audio src={staticFile("audio/sfx_chime.wav")} volume={0.25} /></Sequence>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ unit: string; from: number }> = ({ unit, from }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000", opacity: ease(f, 0, XF) }}>
      <Frame1920 cx={960}>
        <OffthreadVideo src={staticFile(`video/bangiao/${unit}_tour.mp4`)} startFrom={from} muted style={{ width: 1920, height: 1080 }} />
      </Frame1920>
    </AbsoluteFill>
  );
};

export const BanGiaoVertical: React.FC<{ unit: string; music?: string }> = ({ unit, music }) => {
  const f = useCurrentFrame();
  const u = UNITS[unit];
  const vu = VUNITS[unit];
  const stops = u.data.stops;
  const dur = bangiaoVerticalFrames(unit);
  const { leads, starts, outroStart, tourEnd } = timeline(unit);
  const events = stops.flatMap((s, si) => s.items.map((it, j) => ({ at: starts[si] + leads[si] + j * ITEM + 10, n: it.tier === "khong" ? 0 : it.n })));
  const count = events.filter((e) => e.at <= f).reduce((s, e) => s + e.n, 0);
  const last = [...events].reverse().find((e) => e.at <= f && e.n > 0);
  const bump = last ? 1 + 0.18 * Math.max(0, 1 - (f - last.at) / 8) : 1;
  const zoneOf = (i: number) => [...u.data.zones].reverse().find((z) => z.at <= stops[i].at + 1)?.label ?? u.data.zones[0].label;
  const inOutro = !!vu.outro && f >= outroStart;
  const si = starts.reduce((acc, s, i) => (f >= s ? i : acc), 0);
  const zone = inOutro ? vu.outro!.zone : zoneOf(si);
  // tên khu vực hiện mờ dần khi đổi khu
  let k = si;
  while (k > 0 && zoneOf(k - 1) === zone) k--;
  const zoneFrom = inOutro ? outroStart : starts[k];
  const zoneO = !inOutro && k === 0 ? 1 : ease(f, zoneFrom, zoneFrom + 16);
  const musicVol = (fr: number) => 0.55 * interpolate(fr, [0, 10, dur - 45, dur - 2], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={HOOK}><Hook unit={unit} /></Sequence>
      {stops.map((s, i) => (
        <Sequence key={s.at} from={starts[i]} durationInFrames={stopLen(s, leads[i])}><StopV unit={unit} stop={s} lead={leads[i]} /></Sequence>
      ))}
      {vu.outro && <Sequence from={outroStart} durationInFrames={vu.outro.len + XF}><Outro unit={unit} from={vu.outro.from} /></Sequence>}
      {f >= HOOK - XF && f < tourEnd && <AbsoluteFill style={{ opacity: ease(f, HOOK, HOOK + 12) * (1 - ease(f, tourEnd - 10, tourEnd)) }}><Header zone={zone} zoneO={zoneO} count={count} bump={bump} total={total(unit)} /></AbsoluteFill>}
      <Sequence from={tourEnd - XF} durationInFrames={EXTRA + XF}><AbsoluteFill style={{ opacity: ease(f, tourEnd - XF, tourEnd) }}><Extra unit={unit} base={count} /></AbsoluteFill></Sequence>
      <Sequence from={tourEnd + EXTRA - XF} durationInFrames={SUM + XF}><AbsoluteFill style={{ opacity: ease(f, tourEnd + EXTRA - XF, tourEnd + EXTRA) }}><SummaryV unit={unit} /></AbsoluteFill></Sequence>
      <AbsoluteFill style={{ background: "#000", opacity: ease(f, dur - 15, dur), pointerEvents: "none" }} />
      <Audio src={staticFile(`audio/${music ?? vu.music}`)} volume={musicVol} />
    </AbsoluteFill>
  );
};
