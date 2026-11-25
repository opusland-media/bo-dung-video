import React from "react";
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Loop,
} from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import d1pn from "../data/bangiao_1pn.json";
import d2pn from "../data/bangiao_2pn.json";

/**
 * Video tour căn hộ mẫu Green Skyline — thể hiện danh mục nội thất bàn giao (Bộ sưu tập Skyline Central).
 * Nền: clip thô đã cắt + chỉnh màu bằng scripts/bangiao/build.py. Thiết kế ở hệ 1920×1080, phóng ×2 ra 4K.
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["500", "600", "700", "800"], subsets: ["vietnamese", "latin"] });
const { fontFamily: SERIF } = loadPlayfair("normal", { weights: ["600", "700"], subsets: ["vietnamese", "latin"] });

const GREEN = "#1F2E27";
const CREAM = "#F7F1E6";
const GOLD = "#C9A25C";
const SAGE = "#5E8B6E";
const GREY = "#8A8A8A";

export const FPS = 30;
const INTRO = 6 * FPS;
const SUMMARY = 14 * FPS;

export type Tier = "goi" | "coban" | "khong" | "info";
export type Data = { tourFrames: number; zones: { at: number; label: string }[]; stops: Stop[] };

export const TIER: Record<Tier, { color: string; tag: string }> = {
  goi: { color: GOLD, tag: "BÀN GIAO HOÀN THIỆN" },
  coban: { color: SAGE, tag: "CÓ CẢ Ở BÀN GIAO CƠ BẢN" },
  khong: { color: GREY, tag: "KHÔNG BÀN GIAO" },
  info: { color: "#7FA7C9", tag: "THỰC TẾ" },
};

type Group = { zone: string; items: [string, Tier?][] };
export const UNITS: Record<string, { data: Data; name: string; music: string; area: string; summary: Group[] }> = {
  "1pn": {
    data: d1pn as Data, name: "Căn hộ 1PN+", music: "yt_way_back_home.mp3", area: "1 phòng ngủ + phòng làm việc",
    summary: [
      { zone: "Phòng khách", items: [["Tủ kệ TV"], ["Vách TV + chỉ trang trí"], ["Sofa"], ["Bàn sofa đá nung kết"], ["Máy lạnh"]] },
      { zone: "Bếp & phòng ăn", items: [["Tủ bếp + tủ kính Blum", "coban"], ["Chậu rửa Hafele", "coban"], ["Bếp từ Panasonic", "coban"], ["Hút mùi Panasonic", "coban"], ["Kệ úp chén Hafele"], ["Tủ lạnh"], ["Bàn ăn đá nung kết"], ["4 ghế ăn"], ["Tranh trang trí"]] },
      { zone: "Phòng ngủ", items: [["Giường 1m6 × 2m"], ["Nệm Sealy 28 cm"], ["Tủ áo"], ["Bàn trang điểm"], ["Gương trang điểm"], ["Ghế trang điểm"], ["Máy lạnh"], ["Tranh trang trí"]] },
      { zone: "Phòng làm việc", items: [["Bàn đọc sách"], ["Tủ sách"], ["Tranh trang trí"]] },
      { zone: "Khu vực khác", items: [["Tủ giày"], ["Máy giặt"]] },
    ],
  },
  "2pn": {
    data: d2pn as Data, name: "Căn hộ 2PN", music: "yt_way_back_home.mp3", area: "2 phòng ngủ · 2 phòng tắm",
    summary: [
      { zone: "Phòng khách", items: [["Tủ kệ TV"], ["Vách TV + chỉ trang trí"], ["Sofa"], ["Bàn sofa đá nung kết"], ["Máy lạnh"], ["Tranh trang trí"]] },
      { zone: "Bếp & phòng ăn", items: [["Tủ bếp + tủ kính Blum", "coban"], ["Chậu rửa Hafele", "coban"], ["Bếp từ Panasonic", "coban"], ["Hút mùi Panasonic", "coban"], ["Kệ úp chén Hafele"], ["Tủ lạnh"], ["Bàn ăn đá nung kết"], ["4 ghế ăn"], ["Tranh trang trí"]] },
      { zone: "Phòng ngủ master", items: [["Giường 1m6 × 2m"], ["Nệm Sealy 28 cm"], ["Bàn làm việc"], ["Tủ áo"], ["Máy lạnh"], ["Tranh trang trí"]] },
      { zone: "Phòng ngủ 2", items: [["Giường 1m4 × 2m"], ["Nệm Sealy 28 cm"], ["Bàn học"], ["Tủ áo"], ["Máy lạnh"], ["Tranh trang trí"]] },
      { zone: "Khu vực khác", items: [["Tủ giày"], ["Máy giặt"]] },
    ],
  },
};

export const bangiaoFrames = (unit: string) => INTRO + UNITS[unit].data.tourFrames + SUMMARY;

/** Lớp thiết kế 1920×1080 phóng lên khung 4K */
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: "0 0" }}>
      {children}
    </div>
  );
};

const ease = (f: number, from: number, to: number) => interpolate(f, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Logo: React.FC<{ h: number }> = ({ h }) => <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: h }} />;

// ---------- INTRO ----------
const Intro: React.FC<{ unit: string }> = ({ unit }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = UNITS[unit];
  const total = u.summary.reduce((s, g) => s + g.items.length, 0);
  const a = spring({ frame: f - 8, fps, config: { damping: 200 } });
  const b = spring({ frame: f - 22, fps, config: { damping: 200 } });
  const c = spring({ frame: f - 70, fps, config: { damping: 200 } });
  const out = 1 - ease(f, INTRO - 12, INTRO);
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(`video/bangiao/${unit}_hook.mp4`)} muted style={{ transform: `scale(${1.08 - 0.06 * ease(f, 0, INTRO)})` }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(20,30,25,0.78) 0%, rgba(20,30,25,0.45) 45%, rgba(20,30,25,0) 75%)", opacity: out }} />
      <Stage>
        <div style={{ opacity: out }}>
          <div style={{ position: "absolute", left: 110, top: 120, background: CREAM, borderRadius: 14, padding: "14px 22px", opacity: a, transform: `translateY(${(1 - a) * 20}px)` }}>
            <Logo h={96} />
          </div>
          <div style={{ position: "absolute", left: 110, top: 330, opacity: a, transform: `translateX(${(1 - a) * -40}px)` }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 8, color: GOLD }}>THÁP SKYLINE CENTRAL · NHÀ MẪU THỰC TẾ</div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 132, color: "#fff", lineHeight: 1.05, marginTop: 14 }}>{u.name}</div>
          </div>
          <div style={{ position: "absolute", left: 110, top: 540, opacity: b, transform: `translateX(${(1 - b) * -40}px)` }}>
            <div style={{ width: 120, height: 4, background: GOLD, marginBottom: 26 }} />
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 46, color: "#fff" }}>Bàn giao những gì?</div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 32, color: "rgba(255,255,255,0.85)", marginTop: 10 }}>
              {total} hạng mục nội thất · Bộ sưu tập Japandi
            </div>
          </div>
          <div style={{ position: "absolute", left: 110, top: 760, display: "flex", gap: 16, opacity: c, transform: `translateY(${(1 - c) * 20}px)` }}>
            {(["goi", "coban", "khong"] as Tier[]).map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(20,30,25,0.6)", border: `2px solid ${TIER[t].color}`, borderRadius: 40, padding: "10px 22px" }}>
                <div style={{ width: 16, height: 16, borderRadius: 8, background: TIER[t].color }} />
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 21, color: "#fff", letterSpacing: 1 }}>{TIER[t].tag}</div>
              </div>
            ))}
          </div>
        </div>
      </Stage>
    </AbsoluteFill>
  );
};

// ---------- TOUR OVERLAY ----------
const ZoneLabel: React.FC<{ zones: Data["zones"] }> = ({ zones }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const idx = zones.reduce((acc, z, i) => (f >= z.at ? i : acc), -1);
  if (idx < 0) return null;
  const z = zones[idx];
  const s = spring({ frame: f - z.at, fps, config: { damping: 200 } });
  return (
    <div style={{ position: "absolute", left: 70, top: 56, opacity: s, transform: `translateX(${(1 - s) * -30}px)` }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: 7, color: GOLD, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>KHU VỰC</div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 58, color: "#fff", textShadow: "0 3px 18px rgba(0,0,0,0.65)", marginTop: 2 }}>{z.label}</div>
      <div style={{ height: 3, width: 90 * s, background: GOLD, marginTop: 8 }} />
    </div>
  );
};

export type StopItem = { title: string; sub: string; tier: Tier; n: number; bbox: number[]; mask: string; glow: string; cut: string; cutBox: number[] };
export type Stop = { at: number; dur: number; img: string; items: StopItem[] };
const ITEM_GAP = 16;
const itemStart = (i: number) => 12 + i * ITEM_GAP;

type Rect = { x: number; y: number; w: number; h: number };
const overlap = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
const RESERVED: Rect[] = [{ x: 0, y: 0, w: 620, h: 190 }, { x: 1500, y: 0, w: 420, h: 190 }];

/** Đặt nhãn quanh món đồ: thử trên / dưới / phải / trái, tránh đè nhau và tránh góc tên khu + bộ đếm */
const layoutLabels = (items: StopItem[]) => {
  const placed: Rect[] = [];
  return items.map((it) => {
    const [x0, y0, x1, y1] = it.bbox;
    const bw = x1 - x0, bh = y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const w = Math.min(600, Math.max(280, Math.max(it.title.length * 17.5, it.sub.length * 10.5) + 64));
    const h = it.sub ? 112 : 82;
    const cands: Rect[] = [
      { x: cx - w / 2, y: y0 - h - 70, w, h },
      { x: x1 + 70, y: cy - h / 2 - 50, w, h },
      { x: x0 - w - 70, y: cy - h / 2 - 50, w, h },
      { x: cx - w / 2, y: y1 + 60, w, h },
      { x: cx - w / 2, y: y0 + Math.min(80, bh * 0.15), w, h },
      { x: cx - w / 2, y: cy - h / 2, w, h },
    ].map((r) => ({ ...r, x: Math.max(40, Math.min(1880 - r.w, r.x)), y: Math.max(60, Math.min(1040 - r.h, r.y)) }));
    let best = cands[0], bestScore = Infinity;
    cands.forEach((r, k) => {
      const ov = [...placed, ...RESERVED].reduce((s, p) => s + overlap(r, p), 0);
      const onObj = overlap(r, { x: x0, y: y0, w: bw, h: bh }) / (r.w * r.h);
      const score = ov * 4 + onObj * 30000 * (k < 4 ? 1 : 0.25) + k * 900;
      if (score < bestScore) { best = r; bestScore = score; }
    });
    placed.push(best);
    const lx = best.x + best.w / 2, ly = best.y + best.h / 2;
    const ax = Math.max(x0 + bw * 0.22, Math.min(x1 - bw * 0.22, lx));
    const ay = Math.max(y0 + bh * 0.22, Math.min(y1 - bh * 0.22, ly));
    // điểm nối trên khung nhãn: cạnh gần món đồ nhất
    const ex = ax < best.x ? best.x : ax > best.x + best.w ? best.x + best.w : ax;
    const ey = ay < best.y ? best.y : ay > best.y + best.h ? best.y + best.h : best.y + best.h / 2;
    return { rect: best, ax, ay, ex, ey };
  });
};

const StopLayer: React.FC<{ stop: Stop }> = ({ stop }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = stop.dur;
  const dimIn = ease(f, 0, 10) * (1 - ease(f, d - 10, d));
  const fadeOut = 1 - ease(f, d - 10, d);
  const zoom = 1 + 0.035 * interpolate(f, [0, d - 14, d], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  const lay = layoutLabels(stop.items);
  const still = staticFile(stop.img);
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      <Img src={still} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <Img src={still} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "brightness(0.42) saturate(0.65)", opacity: dimIn }} />
      <Stage>
        {stop.items.map((it, i) => {
          const o = ease(f, itemStart(i), itemStart(i) + 8) * fadeOut;
          const [cx0, cy0, cx1, cy1] = it.cutBox;
          return (
            <React.Fragment key={i}>
              <Img src={staticFile(it.cut)} style={{ position: "absolute", left: cx0, top: cy0, width: cx1 - cx0, height: cy1 - cy0, opacity: o, filter: it.tier === "khong" ? "grayscale(0.6) brightness(0.85)" : `brightness(1.1) drop-shadow(0 0 ${8 + 3 * Math.sin((f - itemStart(i)) / 6)}px rgba(255,240,205,0.75)) drop-shadow(0 0 22px rgba(255,235,190,0.35))` }} />
            </React.Fragment>
          );
        })}
      </Stage>
      <Stage>
        {stop.items.map((it, i) => {
          const L = lay[i];
          const s = spring({ frame: f - itemStart(i) - 12, fps, config: { damping: 200 } });
          const t = TIER[it.tier];
          return (
            <div key={i} style={{ position: "absolute", left: L.rect.x, top: L.rect.y, width: L.rect.w, height: L.rect.h, opacity: s * fadeOut, transform: `translateY(${(1 - s) * 10}px)` }}>
              <div style={{ position: "absolute", inset: 0, transform: "translate(8px, 8px)", border: "1.5px solid rgba(255,255,255,0.45)", borderRadius: 6 }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(18,24,21,0.62)", backdropFilter: "blur(10px)", border: "2px solid rgba(255,255,255,0.92)", borderRadius: 6, padding: "12px 20px", boxSizing: "border-box", boxShadow: "0 0 18px rgba(255,255,255,0.18)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 5, background: t.color }} />
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, letterSpacing: 2, color: t.color }}>{t.tag}</div>
                  {it.n > 1 && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, color: GREEN, background: t.color, borderRadius: 8, padding: "1px 8px" }}>{it.n} món</div>}
                </div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, color: "#fff", marginTop: 4, whiteSpace: "nowrap", textDecoration: it.tier === "khong" ? "line-through" : "none", textDecorationThickness: 2 }}>{it.title}</div>
                {it.sub && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 18, color: "rgba(255,255,255,0.82)", marginTop: 2, whiteSpace: "nowrap" }}>{it.sub}</div>}
              </div>
            </div>
          );
        })}
      </Stage>
      {stop.items.map((it, i) => it.tier !== "khong" && (
        <Sequence key={"t" + i} from={itemStart(i) + 12} durationInFrames={10}><Audio src={staticFile("audio/sfx_tick.wav")} volume={0.25} /></Sequence>
      ))}
      <Sequence from={0} durationInFrames={30}><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.18} /></Sequence>
    </AbsoluteFill>
  );
};

const Counter: React.FC<{ stops: Stop[] }> = ({ stops }) => {
  const f = useCurrentFrame();
  const events = stops.flatMap((s) => s.items.map((it, i) => ({ at: s.at + itemStart(i) + 12, n: it.n })));
  const n = events.filter((e) => e.at <= f).reduce((s, e) => s + e.n, 0);
  const last = [...events].reverse().find((e) => e.at <= f && e.n > 0);
  const bump = last ? 1 + 0.14 * Math.max(0, 1 - (f - last.at) / 8) : 1;
  return (
    <div style={{ position: "absolute", right: 64, top: 56, opacity: ease(f, 0, 15), display: "flex", alignItems: "center", gap: 18, background: "rgba(31,46,39,0.82)", borderRadius: 18, padding: "14px 26px", border: `2px solid ${GOLD}` }}>
      <div style={{ width: 46, height: 46, borderRadius: 23, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: GREEN, fontWeight: 800, fontFamily: SANS }}>✓</div>
      <div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, color: "#fff", lineHeight: 1, transform: `scale(${bump})`, transformOrigin: "left center" }}>{n}</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 17, color: "rgba(255,255,255,0.8)", letterSpacing: 1, marginTop: 4 }}>hạng mục bàn giao</div>
      </div>
    </div>
  );
};

const Tour: React.FC<{ unit: string }> = ({ unit }) => {
  const u = UNITS[unit];
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(`video/bangiao/${unit}_tour.mp4`)} muted />
      {u.data.stops.map((s) => (
        <Sequence key={s.at} from={s.at} durationInFrames={s.dur}><StopLayer stop={s} /></Sequence>
      ))}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0) 22%)" }} />
      <Stage>
        <ZoneLabel zones={u.data.zones} />
        <Counter stops={u.data.stops} />
      </Stage>
      {u.data.zones.map((z) => (
        <Sequence key={"w" + z.at} from={Math.max(0, z.at - 8)} durationInFrames={30}>
          <Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.35} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ---------- SUMMARY ----------
const Summary: React.FC<{ unit: string }> = ({ unit }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = UNITS[unit];
  const total = u.summary.reduce((s, g) => s + g.items.length, 0);
  const head = spring({ frame: f - 4, fps, config: { damping: 200 } });
  let k = 0;
  return (
    <AbsoluteFill style={{ background: GREEN }}>
      <Loop durationInFrames={Math.round(8 * FPS)}>
        <OffthreadVideo src={staticFile(`video/bangiao/${unit}_hook.mp4`)} muted style={{ filter: "blur(28px) brightness(0.45)", transform: "scale(1.15)" }} />
      </Loop>
      <AbsoluteFill style={{ background: "rgba(31,46,39,0.55)" }} />
      <Stage>
        <div style={{ position: "absolute", left: 90, top: 70, opacity: head, transform: `translateY(${(1 - head) * 20}px)` }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 7, color: GOLD }}>TỔNG KẾT · BỘ SƯU TẬP SKYLINE CENTRAL</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: "#fff", marginTop: 6 }}>
            {u.name}: {total} hạng mục nội thất bàn giao
          </div>
        </div>
        <div style={{ position: "absolute", left: 90, right: 90, top: 270, display: "flex", gap: 22 }}>
          {u.summary.map((g, gi) => {
            const gs = spring({ frame: f - 14 - gi * 6, fps, config: { damping: 200 } });
            return (
              <div key={g.zone} style={{ flex: 1, background: "rgba(250,246,238,0.96)", borderRadius: 16, padding: "22px 20px 18px", opacity: gs, transform: `translateY(${(1 - gs) * 30}px)` }}>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, color: GREEN }}>{g.zone}</div>
                <div style={{ height: 3, width: 60, background: GOLD, margin: "10px 0 14px" }} />
                {g.items.map(([name, tier]) => {
                  const d = 30 + k++ * 3;
                  const is = ease(f, d, d + 8);
                  const col = tier === "coban" ? SAGE : GOLD;
                  return (
                    <div key={name} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, opacity: is, transform: `translateX(${(1 - is) * -12}px)` }}>
                      <div style={{ flex: "none", width: 24, height: 24, borderRadius: 12, background: col, color: "#fff", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, marginTop: 2 }}>✓</div>
                      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: "#2b2b2b", lineHeight: 1.25 }}>{name}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 90, bottom: 60, display: "flex", gap: 34, opacity: ease(f, 60, 80) }}>
          {(["goi", "coban"] as Tier[]).map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, background: t === "goi" ? GOLD : SAGE }} />
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 21, color: "rgba(255,255,255,0.9)" }}>
                {t === "goi" ? "Bàn giao hoàn thiện (gói nội thất)" : "Có cả ở bàn giao cơ bản"}
              </div>
            </div>
          ))}
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 21, color: "rgba(255,255,255,0.7)" }}>Tivi, máy sấy, rèm và đồ decor không thuộc danh mục</div>
        </div>
      </Stage>
      <Sequence from={10} durationInFrames={20}><Audio src={staticFile("audio/sfx_chime.wav")} volume={0.25} /></Sequence>
    </AbsoluteFill>
  );
};

export const BanGiaoTour: React.FC<{ unit: string }> = ({ unit }) => {
  const u = UNITS[unit];
  const tour = u.data.tourFrames;
  const total = bangiaoFrames(unit);
  const f = useCurrentFrame();
  const musicVol = (fr: number) => 0.5 * interpolate(fr, [0, 30, total - 75, total - 5], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const end = INTRO + tour + SUMMARY;
  const fadeBlack = Math.max(
    interpolate(f, [INTRO + tour - 10, INTRO + tour, INTRO + tour + 10], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(f, [end - 20, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence from={INTRO - 12} durationInFrames={tour + 12}><Tour unit={unit} /></Sequence>
      <Sequence durationInFrames={INTRO}><AbsoluteFill style={{ opacity: 1 - ease(f, INTRO - 12, INTRO) }}><Intro unit={unit} /></AbsoluteFill></Sequence>
      <Sequence from={INTRO + tour} durationInFrames={SUMMARY}><Summary unit={unit} /></Sequence>
      <AbsoluteFill style={{ background: "#000", opacity: fadeBlack, pointerEvents: "none" }} />
      <Audio src={staticFile(`audio/${u.music}`)} volume={musicVol} />
      <Sequence from={INTRO - 10} durationInFrames={30}><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.4} /></Sequence>
    </AbsoluteFill>
  );
};
