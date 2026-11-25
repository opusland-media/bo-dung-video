import React, { useMemo } from "react";
import {
  AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from "remotion";
import { getLength, getPointAtLength, getTangentAtLength } from "@remotion/paths";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import MAP from "../data/mapGreenSkyline.json";

/**
 * Bản đồ vị trí Green Skyline — dọc 1080×1920, 30fps.
 * Lời thoại: "Green Skyline … hiện hữu trên trục Phạm Văn Đồng nối dài. Kế bên là GO! Dĩ An và BV quốc tế Hoàn Mỹ,
 * 5 phút tới Làng Đại học … sân bay Tân Sơn Nhất chỉ mất 25 phút về đến nhà."
 * Dữ liệu nền: OpenStreetMap (ODbL). Tuyến đường: OSRM (dữ liệu OSM).
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["600", "700", "800"], subsets: ["vietnamese", "latin"] });

export const GSL_MAP_FRAMES = 630;

const BG = "#101B17";
const GOLD = "#E2B865";
const GOLD_D = "#C9A25C";
const GREEN = "#1F2E27";
const W = 1080, H = 1920;
const MX = 96; // lề chữ ≥ 8%

type P2 = [number, number];
const POI = MAP.poi as unknown as Record<string, P2>;
const GS = POI.gs;

/* ---------------- camera ---------------- */
type Key = { f: number; x: number; y: number; s: number };
const OVER: Omit<Key, "f"> = { x: 2090, y: 1560, s: 0.31 };
const KEYS: Key[] = [
  { f: 0, x: GS[0], y: GS[1] + 40, s: 1.6 },
  { f: 70, x: GS[0], y: GS[1] + 20, s: 2.4 },
  { f: 112, x: 2470, y: 900, s: 0.44 },
  { f: 152, x: 2490, y: 890, s: 0.46 },
  { f: 192, x: GS[0] + 4, y: GS[1] + 6, s: 7.2 },
  { f: 252, x: GS[0] + 4, y: GS[1] + 6, s: 7.8 },
  { f: 284, x: 3620, y: 860, s: 1.75 },
  { f: 352, x: 3625, y: 860, s: 1.85 },
  { f: 396, ...OVER },
  { f: 540, x: OVER.x + 10, y: OVER.y, s: 0.33 },
  { f: 584, x: GS[0], y: GS[1] + 30, s: 2.6 },
  { f: 630, x: GS[0], y: GS[1] + 30, s: 3.0 },
];
const ease = Easing.inOut(Easing.cubic);
function camera(f: number) {
  let i = 0;
  while (i < KEYS.length - 2 && f > KEYS[i + 1].f) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const t = ease(Math.min(1, Math.max(0, (f - a.f) / (b.f - a.f))));
  const s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * t);
  // pan follows zoom so the move feels like a flight (screen-space blend)
  const x = a.x + (b.x - a.x) * t;
  const y = a.y + (b.y - a.y) * t;
  return { x, y, s };
}
const toScreen = (p: P2, c: { x: number; y: number; s: number }): P2 => [W / 2 + (p[0] - c.x) * c.s, H * 0.44 + (p[1] - c.y) * c.s];

/* ---------------- helpers ---------------- */
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const pop = (f: number, at: number, fps: number) => spring({ frame: f - at, fps, config: { damping: 12, stiffness: 160, mass: 0.7 } });

const LAYERS = MAP.layers as Record<string, string[]>;
const ROUTES = MAP.routes as Record<string, string>;

/* ---------------- icons ---------------- */
const Icon: React.FC<{ kind: "cart" | "cross" | "cap" | "plane"; size: number; color: string }> = ({ kind, size, color }) => {
  const s = size;
  if (kind === "cross") return (
    <svg width={s} height={s} viewBox="0 0 24 24"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" fill={color} /></svg>);
  if (kind === "cart") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h3l2.6 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 7H6.2" /><circle cx="10" cy="20" r="1.4" fill={color} /><circle cx="17" cy="20" r="1.4" fill={color} /></svg>);
  if (kind === "cap") return (
    <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 3 1 9l11 6 9-4.9V17h2V9z" fill={color} /><path d="M5 12.5V17c0 1.7 3.1 3.5 7 3.5s7-1.8 7-3.5v-4.5l-7 3.8z" fill={color} /></svg>);
  return (
    <svg width={s} height={s} viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" fill={color} /></svg>);
};

const Badge: React.FC<{ icon: "cart" | "cross" | "cap" | "plane"; color: string; k: number; size?: number }> = ({ icon, color, k, size = 92 }) => (
  <div style={{
    width: size, height: size, borderRadius: size, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: `0 0 0 6px ${color}55, 0 10px 30px rgba(0,0,0,0.5)`, transform: `scale(${k})`,
  }}>
    <Icon kind={icon} size={size * 0.56} color={color} />
  </div>
);

const Chip: React.FC<{ children: React.ReactNode; k: number; dark?: boolean; size?: number }> = ({ children, k, dark, size = 34 }) => (
  <div style={{
    fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: 1, color: dark ? GREEN : "#fff",
    background: dark ? GOLD : "rgba(14,23,20,0.88)", border: dark ? "none" : `2px solid ${GOLD}`,
    padding: "12px 24px", borderRadius: 16, whiteSpace: "nowrap", opacity: Math.min(1, k * 1.4),
    transform: `translateY(${(1 - k) * 24}px) scale(${0.9 + 0.1 * k})`, boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
  }}>{children}</div>
);

/** place an element centred on a screen point, clamped inside the safe margins */
const At: React.FC<{ p: P2; dx?: number; dy?: number; w?: number; children: React.ReactNode; anchor?: "center" | "left" | "right" }> = ({ p, dx = 0, dy = 0, children, anchor = "center" }) => {
  const tx = anchor === "center" ? "-50%" : anchor === "left" ? "0%" : "-100%";
  return (
    <div style={{ position: "absolute", left: p[0] + dx, top: p[1] + dy, transform: `translate(${tx}, -50%)` }}>{children}</div>
  );
};
const safeX = (x: number, half: number) => Math.max(MX + half, Math.min(W - MX - half, x));

/* ---------------- route stroke ---------------- */
const RouteLine: React.FC<{ d: string; prog: number; s: number; width: number; color?: string }> = ({ d, prog, s, width, color = GOLD }) => {
  const len = useMemo(() => getLength(d), [d]);
  const dash = { strokeDasharray: `${len} ${len}`, strokeDashoffset: len * (1 - prog) };
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={color} strokeOpacity={0.22} strokeWidth={(width * 3.2) / s} style={dash} />
      <path d={d} stroke={color} strokeWidth={width / s} style={dash} />
      <path d={d} stroke="#FFF6DD" strokeWidth={(width * 0.32) / s} style={dash} />
    </g>
  );
};

/* ---------------- counter ---------------- */
const Timer: React.FC<{ value: number; label: string; k: number }> = ({ value, label, k }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 18, background: GOLD, color: GREEN, borderRadius: 22, padding: "14px 28px 14px 18px",
    fontFamily: SANS, transform: `scale(${0.6 + 0.4 * k})`, opacity: Math.min(1, k * 1.5), boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
  }}>
    <svg width={60} height={60} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth={2.4} strokeLinecap="round">
      <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5M9.5 2.5h5" />
    </svg>
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <span style={{ fontWeight: 800, fontSize: 96, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <span style={{ fontWeight: 800, fontSize: 44 }}>PHÚT</span>
    </div>
    <div style={{ fontWeight: 700, fontSize: 28, lineHeight: 1.15, maxWidth: 260, marginLeft: 6 }}>{label}</div>
  </div>
);

/* ================================================================ */
export const GSLMapVertical: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = camera(f);

  const roadW = (px: number) => (px * Math.pow(Math.min(c.s, 8), 0.28)) / c.s;
  const joined = useMemo(() => Object.fromEntries(Object.entries(LAYERS).map(([k, v]) => [k, v.join("")])), []);

  // timeline
  const pinK = pop(f, 10, fps);
  const titleK = ramp(f, 22, 40) * (1 - ramp(f, 150, 162));
  const axisP = interpolate(f, [92, 150], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const axisChip = ramp(f, 112, 126) * (1 - ramp(f, 172, 184));
  const goK = pop(f, 196, fps) * (1 - ramp(f, 262, 272));
  const hmK = pop(f, 210, fps) * (1 - ramp(f, 262, 272));
  const nextK = ramp(f, 222, 236) * (1 - ramp(f, 262, 272));
  const dhP = interpolate(f, [282, 330], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const dhK = pop(f, 280, fps) * (1 - ramp(f, 372, 384));
  const tsnK = pop(f, 392, fps) * (1 - ramp(f, 556, 568));
  const tsnP = interpolate(f, [410, 528], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const tsnTimer = pop(f, 410, fps) * (1 - ramp(f, 556, 568));
  const endK = ramp(f, 574, 592);

  // fade the axis highlight once we leave that beat, keep the routes visible at the end summary
  const axisOpacity = 1 - 0.65 * ramp(f, 176, 196);
  const dhOpacity = 1 - 0.55 * ramp(f, 380, 400);

  // plane along airport route
  const tsnLen = useMemo(() => getLength(ROUTES.tsn), []);
  const pl = getPointAtLength(ROUTES.tsn, tsnLen * Math.max(0.001, tsnP));
  const tg = getTangentAtLength(ROUTES.tsn, tsnLen * Math.max(0.001, tsnP));
  const planeAng = (Math.atan2(tg.y, tg.x) * 180) / Math.PI + 90;
  const planeS = toScreen([pl.x, pl.y], c);

  const sGS = toScreen(GS, c), sGO = toScreen(POI.go, c), sHM = toScreen(POI.hoanmy, c), sDH = toScreen(POI.dhqg, c), sTSN = toScreen(POI.tsn, c);
  const intro = ramp(f, 0, 14);

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* --------- MAP --------- */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: intro }}>
        <defs>
          <radialGradient id="vig" cx="50%" cy="44%" r="75%">
            <stop offset="55%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.6} />
          </radialGradient>
        </defs>
        <g transform={`translate(${W / 2} ${H * 0.44}) scale(${c.s}) translate(${-c.x} ${-c.y})`}>
          <path d={joined.park} fill="#5E8B6E" fillOpacity={0.22} />
          <path d={joined.water} fill="#1F4F5A" />
          <path d={joined.river} fill="none" stroke="#1F4F5A" strokeWidth={roadW(7)} strokeLinecap="round" />
          <path d={joined.runway} fill="none" stroke="#3A4A44" strokeWidth={roadW(10)} />
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={joined.minor} stroke="#FFFFFF" strokeOpacity={0.14 * ramp(c.s, 0.9, 2.5)} strokeWidth={roadW(1.6)} />
            <path d={joined.tertiary} stroke="#FFFFFF" strokeOpacity={0.17} strokeWidth={roadW(1.6)} />
            <path d={joined.secondary} stroke="#FFFFFF" strokeOpacity={0.26} strokeWidth={roadW(2.1)} />
            <path d={joined.primary} stroke="#EDE6D3" strokeOpacity={0.42} strokeWidth={roadW(3)} />
            <path d={joined.trunk} stroke="#EDE6D3" strokeOpacity={0.55} strokeWidth={roadW(4)} />
          </g>
          <g opacity={axisOpacity}><RouteLine d={ROUTES.axis} prog={axisP} s={c.s} width={10} /></g>
          <g opacity={dhOpacity}><RouteLine d={ROUTES.dhqg} prog={dhP} s={c.s} width={9} color="#8FD3A8" /></g>
          <RouteLine d={ROUTES.tsn} prog={tsnP} s={c.s} width={10} />
        </g>
        <rect width={W} height={H} fill="url(#vig)" />
      </svg>

      {/* --------- HOÀN MỸ + GO! --------- */}
      <At p={sHM}><Badge icon="cross" color="#D64545" k={hmK} size={96} /></At>
      <At p={sGO}><Badge icon="cart" color="#1F8A4C" k={goK} size={96} /></At>
      {hmK > 0.01 && (
        <div style={{ position: "absolute", left: Math.max(MX, sHM[0] - 190), top: sHM[1] + 72 }}>
          <Chip k={hmK} size={30}>BV QUỐC TẾ HOÀN MỸ</Chip>
        </div>
      )}
      {goK > 0.01 && (
        <div style={{ position: "absolute", left: Math.min(sGO[0] + 70, W - MX), top: sGO[1] - 130, transform: "translateX(-100%)" }}>
          <Chip k={goK} size={30}>GO! DĨ AN</Chip>
        </div>
      )}

      {/* --------- ĐHQG --------- */}
      <At p={sDH}><Badge icon="cap" color="#2E7D5B" k={dhK} size={100} /></At>
      {dhK > 0.01 && (
        <div style={{ position: "absolute", left: safeX(sDH[0], 170), top: sDH[1] + 90, transform: "translateX(-50%)" }}>
          <Chip k={dhK} size={32}>LÀNG ĐẠI HỌC</Chip>
        </div>
      )}

      {/* --------- TÂN SƠN NHẤT --------- */}
      <At p={sTSN}><Badge icon="plane" color="#2B6CB0" k={tsnK} size={100} /></At>
      {tsnK > 0.01 && (
        <div style={{ position: "absolute", left: safeX(sTSN[0], 210), top: sTSN[1] + 92, transform: "translateX(-50%)" }}>
          <Chip k={tsnK} size={32}>SÂN BAY TÂN SƠN NHẤT</Chip>
        </div>
      )}
      {tsnP > 0.002 && tsnP < 0.999 && (
        <div style={{ position: "absolute", left: planeS[0], top: planeS[1], transform: `translate(-50%,-50%) rotate(${planeAng}deg)` }}>
          <div style={{ width: 70, height: 70, borderRadius: 70, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 10px rgba(226,184,101,0.25)" }}>
            <Icon kind="plane" size={44} color={GREEN} />
          </div>
        </div>
      )}

      {/* --------- GREEN SKYLINE PIN --------- */}
      <Pin p={sGS} k={pinK} f={f} />

      {/* --------- TOP CARDS (screen space) --------- */}
      <div style={{ position: "absolute", left: MX, right: MX, top: 230, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        {titleK > 0.01 && (
          <div style={{ textAlign: "center", opacity: titleK, transform: `translateY(${(1 - titleK) * 30}px)` }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 92, color: "#fff", letterSpacing: 2, textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>GREEN SKYLINE</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, color: GOLD, letterSpacing: 6, marginTop: 6 }}>DỰ ÁN HIỆN HỮU · ĐÔNG HÒA</div>
          </div>
        )}
        {axisChip > 0.01 && <Chip k={axisChip} dark size={40}>TRỤC PHẠM VĂN ĐỒNG NỐI DÀI</Chip>}
        {nextK > 0.01 && <Chip k={nextK} dark size={44}>NGAY KẾ BÊN</Chip>}
        {dhK > 0.01 && <Timer value={Math.round(interpolate(f, [282, 330], [0, 5], clamp))} label="tới Làng Đại học" k={dhK} />}
        {tsnTimer > 0.01 && <Timer value={Math.round(interpolate(f, [410, 528], [0, 25], clamp))} label="từ sân bay về nhà" k={tsnTimer} />}
      </div>

      {/* --------- END SUMMARY --------- */}
      {endK > 0.01 && (
        <div style={{ position: "absolute", left: MX, right: MX, top: 210, opacity: endK, transform: `translateY(${(1 - endK) * 30}px)`, textAlign: "center" }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 92, color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>GREEN SKYLINE</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 22 }}>
            {["Kế bên GO! & Hoàn Mỹ", "5' Làng Đại học", "25' Tân Sơn Nhất"].map((t, i) => (
              <Chip key={t} k={ramp(f, 580 + i * 6, 594 + i * 6)} size={32}>{t}</Chip>
            ))}
          </div>
        </div>
      )}

      <div style={{ position: "absolute", right: MX, bottom: 70, fontFamily: SANS, fontWeight: 600, fontSize: 18, color: "rgba(255,255,255,0.45)" }}>
        Dữ liệu bản đồ © OpenStreetMap
      </div>

      {/* --------- SFX --------- */}
      <Sequence from={8}><Audio src={staticFile("audio/sfx_chime.wav")} volume={0.35} /></Sequence>
      {[84, 162, 258, 362, 548].map((s) => (
        <Sequence key={s} from={s}><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.4} /></Sequence>
      ))}
      {[196, 210, 280, 392].map((s) => (
        <Sequence key={s} from={s}><Audio src={staticFile("audio/sfx_tick.wav")} volume={0.5} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

const Pin: React.FC<{ p: P2; k: number; f: number }> = ({ p, k, f }) => {
  const ring = (off: number) => {
    const t = ((f + off) % 48) / 48;
    return (
      <div style={{ position: "absolute", left: -90 * t, top: -90 * t * 0.45, width: 180 * t, height: 180 * t * 0.45, borderRadius: "50%", border: `3px solid ${GOLD}`, opacity: (1 - t) * 0.8 * k }} />
    );
  };
  return (
    <div style={{ position: "absolute", left: p[0], top: p[1] }}>
      {ring(0)}{ring(24)}
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(-50%, -100%) translateY(${(1 - k) * -120}px) scale(${0.4 + 0.6 * k})`, transformOrigin: "50% 100%", opacity: Math.min(1, k * 2) }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ background: "#fff", borderRadius: 26, padding: "14px 20px", boxShadow: `0 0 0 5px ${GOLD}, 0 18px 40px rgba(0,0,0,0.55)` }}>
            <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 96, display: "block" }} />
          </div>
          <svg width={44} height={30} viewBox="0 0 44 30"><path d="M0 0h44L22 30z" fill={GOLD} /></svg>
          <div style={{ width: 22, height: 22, borderRadius: 22, background: GOLD, border: "4px solid #fff", marginTop: 2, boxShadow: `0 0 18px ${GOLD}` }} />
        </div>
      </div>
    </div>
  );
};
