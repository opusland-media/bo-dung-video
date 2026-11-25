import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Design ────────────────────────────────────────────────────────────────────
const C = {
  bg:        "#07101C",
  bgCard:    "rgba(255,255,255,0.055)",
  border:    "rgba(255,255,255,0.10)",
  gold:      "#C9A84C",
  goldLight: "#E8C96E",
  white:     "#FFFFFF",
  muted:     "rgba(255,255,255,0.48)",
  success:   "#3DD68C",
  blue:      "#4A9EFF",
  danger:    "#EF4444",
};
const FONT = "'Inter','Helvetica Neue',Arial,sans-serif";

// ── Spring helpers ─────────────────────────────────────────────────────────────
function spr(frame: number, fps: number, delaySec = 0, cfg: object = {}) {
  return spring({
    frame: Math.max(0, frame - delaySec * fps),
    fps,
    config: { damping: 18, stiffness: 110, mass: 1, ...cfg },
  });
}

function fadeSlide(
  frame: number,
  fps: number,
  delaySec = 0,
  dist = 28,
  dir: "up" | "down" = "up"
) {
  const f = Math.max(0, frame - delaySec * fps);
  const p = spring({ frame: f, fps, config: { damping: 20, stiffness: 130 } });
  const sign = dir === "up" ? 1 : -1;
  return {
    opacity:   interpolate(p, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(p, [0, 1], [sign * dist, 0])}px)`,
  };
}

function phaseOpacity(frame: number, inStart: number, inEnd: number, outStart: number, outEnd: number) {
  if (frame < inStart) return 0;
  if (frame < inEnd)   return interpolate(frame, [inStart, inEnd], [0, 1], { extrapolateRight: "clamp" });
  if (frame < outStart) return 1;
  if (frame < outEnd)  return interpolate(frame, [outStart, outEnd], [1, 0], { extrapolateRight: "clamp" });
  return 0;
}

// ── Background ────────────────────────────────────────────────────────────────
const Background: React.FC = () => (
  <AbsoluteFill>
    {/* Ảnh thực */}
    <Img
      src={staticFile("images/habitat/pool-sunset.jpg")}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
    />
    {/* Dark overlay để đọc được text */}
    <AbsoluteFill style={{ background: "rgba(4, 10, 20, 0.72)" }} />
    {/* Gradient bổ sung — tối hơn ở vùng text trung tâm */}
    <AbsoluteFill style={{
      background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0,0,0,0.30) 0%, transparent 100%)",
    }} />
  </AbsoluteFill>
);

// ── Watermark ─────────────────────────────────────────────────────────────────
const Watermark: React.FC = () => (
  <div style={{
    position:      "absolute",
    bottom:        28,
    right:         40,
    fontFamily:    FONT,
    fontSize:      15,
    fontWeight:    600,
    color:         "rgba(255,255,255,0.22)",
    letterSpacing: 2,
  }}>
    batdongsan123.com
  </div>
);

// ── House SVG icon ────────────────────────────────────────────────────────────
const HouseIcon: React.FC<{ size?: number; color?: string }> = ({ size = 64, color = C.gold }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M6 20L24 6L42 20V42H30V30H18V42H6V20Z" stroke={color} strokeWidth={2.5} strokeLinejoin="round" fill={`${color}22`} />
    <rect x={19} y={30} width={10} height={12} rx={1} stroke={color} strokeWidth={2} fill={`${color}33`} />
    <path d="M24 6L42 20" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </svg>
);

// ── Certificate SVG icon ───────────────────────────────────────────────────────
const CertIcon: React.FC<{ size?: number; color?: string }> = ({ size = 56, color = C.success }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x={6} y={8} width={36} height={28} rx={3} stroke={color} strokeWidth={2} fill={`${color}15`} />
    <path d="M13 20h22M13 26h14" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <circle cx={35} cy={35} r={8} fill={C.bg} stroke={color} strokeWidth={2} />
    <path d="M31 35l2.5 2.5L39 31" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Payment block card ─────────────────────────────────────────────────────────
interface BlockProps {
  label:     string;
  pct:       string;
  note?:     string;
  gold?:     boolean;
  green?:    boolean;
  dim?:      boolean;
  delay:     number;
  frame:     number;
  fps:       number;
  w?:        number;
}

const Block: React.FC<BlockProps> = ({ label, pct, note, gold, green, dim, delay, frame, fps, w = 148 }) => {
  const f  = Math.max(0, frame - delay * fps);
  const sp = spring({ frame: f, fps, config: { damping: 16, stiffness: 90 } });

  const bg     = gold  ? `linear-gradient(145deg,${C.gold}28,${C.gold}0a)`
               : green ? `linear-gradient(145deg,${C.success}22,${C.success}08)`
               : C.bgCard;
  const bd     = gold  ? `1.5px solid ${C.gold}70`
               : green ? `1.5px solid ${C.success}55`
               : `1px solid ${C.border}`;
  const color  = gold ? C.goldLight : green ? C.success : dim ? C.muted : C.white;

  return (
    <div style={{
      opacity:       interpolate(sp, [0, 1], [0, dim ? 0.45 : 1]),
      transform:     `translateY(${interpolate(sp, [0, 1], [36, 0])}px) scale(${interpolate(sp, [0, 1], [0.92, 1])})`,
      width:         w,
      background:    bg,
      border:        bd,
      borderRadius:  14,
      padding:       "18px 14px 16px",
      display:       "flex",
      flexDirection: "column",
      alignItems:    "center",
      gap:           6,
      backdropFilter:"blur(10px)",
      flexShrink:    0,
    }}>
      <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 2.5, textTransform: "uppercase" as const }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT, fontSize: 44, fontWeight: 900, color, lineHeight: 1, letterSpacing: -1 }}>
        {pct}
      </div>
      {note && (
        <div style={{ fontFamily: FONT, fontSize: 11, color: C.muted, textAlign: "center" as const, lineHeight: 1.4 }}>
          {note}
        </div>
      )}
    </div>
  );
};

// ── Progress bar ───────────────────────────────────────────────────────────────
const ProgressBar: React.FC<{ progress: number; label: string }> = ({ progress, label }) => (
  <div style={{ width: 880 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
      <span style={{ fontFamily: FONT, fontSize: 13, color: C.muted }}>0%</span>
      <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: C.gold }}>{label}</span>
      <span style={{ fontFamily: FONT, fontSize: 13, color: C.muted }}>100%</span>
    </div>
    <div style={{ height: 7, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{
        width:        `${Math.min(progress * 100, 100)}%`,
        height:       "100%",
        background:   `linear-gradient(90deg,${C.gold},${C.success})`,
        borderRadius: 4,
      }} />
    </div>
  </div>
);

// ── Phase 1: Title (0–8s) ─────────────────────────────────────────────────────
const Phase1: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scaleP = spr(frame, fps, 0, { damping: 22, stiffness: 70 });
  const scale  = interpolate(scaleP, [0, 1], [0.82, 1]);
  const op1    = scaleP;
  const sub    = fadeSlide(frame, fps, 1.4);
  const line   = spr(frame, fps, 0.6);
  const badge  = fadeSlide(frame, fps, 0.3);

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {/* Badge */}
      <div style={{ ...badge, display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ width: 32, height: 1, background: C.gold }} />
        <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: C.gold, letterSpacing: 5, textTransform: "uppercase" as const }}>
          The Habitat · Giai Đoạn 3
        </span>
        <div style={{ width: 32, height: 1, background: C.gold }} />
      </div>

      {/* Gold line expand */}
      <div style={{
        width:        `${interpolate(line, [0, 1], [0, 260])}px`,
        height:       2,
        background:   `linear-gradient(90deg,transparent,${C.gold},transparent)`,
        marginBottom: 36,
      }} />

      {/* Main title */}
      <div style={{ opacity: op1, transform: `scale(${scale})`, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontSize: 84, fontWeight: 900, color: C.white, letterSpacing: 8, textTransform: "uppercase" as const, lineHeight: 1.05 }}>
          CHÍNH SÁCH
        </div>
        <div style={{ fontFamily: FONT, fontSize: 84, fontWeight: 900, letterSpacing: 8, textTransform: "uppercase" as const, lineHeight: 1.05, backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent", backgroundImage: `linear-gradient(90deg,${C.gold},${C.goldLight},${C.gold})` }}>
          THANH TOÁN
        </div>
      </div>

      {/* Subtitle */}
      <div style={{ ...sub, marginTop: 32, textAlign: "center" }}>
        <span style={{ fontFamily: FONT, fontSize: 22, fontWeight: 400, color: C.muted, letterSpacing: 3 }}>
          Linh hoạt · Minh bạch · Dễ dàng sở hữu
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── Phase 2: 30% Nhận Nhà (8–18s) ────────────────────────────────────────────
const Phase2: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const lf = frame - 8 * fps;

  const header   = fadeSlide(lf, fps, 0);
  const barOp    = fadeSlide(lf, fps, 2.8);
  const barProg  = interpolate(Math.max(0, lf - 2.8 * fps), [0, 1.8 * fps], [0, 0.30], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 44 }}>
      {/* Header */}
      <div style={{ ...header, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: C.gold, letterSpacing: 5, textTransform: "uppercase" as const, marginBottom: 10 }}>
          Chỉ cần thanh toán
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, justifyContent: "center" }}>
          <span style={{ fontFamily: FONT, fontSize: 120, fontWeight: 900, lineHeight: 1, color: C.gold, letterSpacing: -4 }}>30%</span>
          <div>
            <div style={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, color: C.success, letterSpacing: 2 }}>NHẬN NHÀ</div>
            <div style={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, color: C.success, letterSpacing: 2 }}>NGAY</div>
          </div>
        </div>
      </div>

      {/* 3 blocks + arrows */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Block label="Đợt 1" pct="10%" note="Ký HĐMB"       delay={1.0} frame={lf} fps={fps} gold />
        <div style={{ color: C.muted, fontSize: 28, fontWeight: 200 }}>＋</div>
        <Block label="Đợt 2" pct="10%" note="Sau 3 tháng"   delay={1.6} frame={lf} fps={fps} gold />
        <div style={{ color: C.muted, fontSize: 28, fontWeight: 200 }}>＋</div>
        <Block label="Đợt 3" pct="10%" note="Sau 6 tháng"   delay={2.2} frame={lf} fps={fps} gold />
        <div style={{ color: C.gold, fontSize: 22, fontWeight: 800, marginLeft: 8 }}>
          = <span style={{ fontSize: 32 }}>30%</span>
        </div>
        <div style={{
          opacity:    spr(lf, fps, 2.4),
          background: `linear-gradient(135deg,${C.success}25,${C.success}08)`,
          border:     `1.5px solid ${C.success}55`,
          borderRadius: 12,
          padding:    "14px 20px",
          display:    "flex",
          alignItems: "center",
          gap:        12,
          marginLeft: 12,
        }}>
          <HouseIcon size={40} color={C.success} />
          <div>
            <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: C.success, letterSpacing: 2 }}>NHẬN NHÀ</div>
            <div style={{ fontFamily: FONT, fontSize: 12, color: C.muted }}>Ở / Cho thuê ngay</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ ...barOp }}>
        <ProgressBar progress={barProg} label="30% — Nhận nhà ngay" />
      </div>
    </AbsoluteFill>
  );
};

// ── Phase 3: Sau khi nhận nhà (18–30s) ───────────────────────────────────────
const Phase3: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const lf = frame - 18 * fps;

  const houseAnim = fadeSlide(lf, fps, 0, 20);
  const titleAnim = fadeSlide(lf, fps, 0.3);
  const barProg   = interpolate(Math.max(0, lf - 0.5 * fps), [0, 9 * fps], [0.30, 0.95], { extrapolateRight: "clamp" });

  const blocks = [
    { label: "Đợt 4", pct: "10%", note: "Sau 9 tháng",  delay: 0.8 },
    { label: "Đợt 5", pct: "10%", note: "Sau 12 tháng", delay: 1.6 },
    { label: "Đợt 6", pct: "10%", note: "Sau 15 tháng", delay: 2.4 },
    { label: "Đợt 7", pct: "35%", note: "Sau 18 tháng", delay: 3.2, w: 180 },
  ];

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
      {/* "Đã nhận nhà" banner */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ ...houseAnim }}>
          <div style={{
            background: `linear-gradient(135deg,${C.gold}22,${C.gold}08)`,
            border:     `2px solid ${C.gold}55`,
            borderRadius: 16,
            padding:    "20px 28px",
            display:    "flex",
            alignItems: "center",
            gap:        16,
          }}>
            <HouseIcon size={52} color={C.gold} />
            <div>
              <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: C.gold, letterSpacing: 4, textTransform: "uppercase" as const }}>Đã nhận nhà</div>
              <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 800, color: C.white }}>Ở · Cho thuê</div>
              <div style={{ fontFamily: FONT, fontSize: 12, color: C.muted }}>Khai thác giá trị ngay từ tháng 7</div>
            </div>
          </div>
        </div>

        <div style={{ width: 2, height: 80, background: C.border, marginInline: 12 }} />

        <div style={{ ...titleAnim }}>
          <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: C.muted, letterSpacing: 3, marginBottom: 6 }}>
            TIẾP TỤC THANH TOÁN
          </div>
          <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 800, color: C.white }}>
            Phần còn lại — <span style={{ color: C.gold }}>70%</span>
          </div>
        </div>
      </div>

      {/* Remaining blocks */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {/* Completed blocks (dim) */}
        <Block label="Đợt 1–3" pct="30%" note="Đã thanh toán" delay={0} frame={lf} fps={fps} dim w={160} />
        <div style={{ color: C.border, fontSize: 24, fontWeight: 200 }}>│</div>
        {blocks.map((b) => (
          <Block key={b.label} label={b.label} pct={b.pct} note={b.note} delay={b.delay} frame={lf} fps={fps} green w={b.w} />
        ))}
        {/* 5% dim placeholder */}
        <Block label="Đợt 8" pct="5%" note="Nhận sổ hồng" delay={4.0} frame={lf} fps={fps} dim w={128} />
      </div>

      {/* Progress bar */}
      <ProgressBar progress={barProg} label={`${Math.round(barProg * 100)}% đã thanh toán`} />
    </AbsoluteFill>
  );
};

// ── Phase 4: Nhận Sổ Hồng (30–36s) ──────────────────────────────────────────
const Phase4: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const lf = frame - 30 * fps;

  const mainSp = spr(lf, fps, 0, { damping: 14, stiffness: 80 });
  const certSp = spr(lf, fps, 0.6);
  const scale  = interpolate(mainSp, [0, 1], [0.88, 1]);

  const badgeOp = fadeSlide(lf, fps, 1.0);
  const ctaSp   = spr(lf, fps, 1.8);
  const barProg = interpolate(Math.max(0, lf - 0.2 * fps), [0, 2 * fps], [0.95, 1.0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
      {/* Central highlight */}
      <div style={{ opacity: mainSp, transform: `scale(${scale})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        {/* Glowing circle around cert icon */}
        <div style={{
          position:     "relative",
          width:        160,
          height:       160,
          borderRadius: "50%",
          background:   `radial-gradient(circle,${C.success}18,transparent 70%)`,
          border:       `2px solid ${C.success}40`,
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          boxShadow:    `0 0 60px ${C.success}25`,
          opacity:      certSp,
        }}>
          <CertIcon size={72} color={C.success} />
        </div>

        {/* Big percentage */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: C.success, letterSpacing: 5, textTransform: "uppercase" as const, marginBottom: 8 }}>
            Thanh toán đợt cuối
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, justifyContent: "center" }}>
            <span style={{ fontFamily: FONT, fontSize: 110, fontWeight: 900, lineHeight: 1, color: C.success, letterSpacing: -3 }}>5%</span>
          </div>
        </div>
      </div>

      {/* Sổ hồng badge */}
      <div style={{ ...badgeOp }}>
        <div style={{
          background:   `linear-gradient(135deg,${C.success}22,${C.success}08)`,
          border:       `2px solid ${C.success}55`,
          borderRadius: 14,
          padding:      "16px 36px",
          display:      "flex",
          alignItems:   "center",
          gap:          14,
        }}>
          <span style={{ fontSize: 28 }}>🏆</span>
          <div>
            <div style={{ fontFamily: FONT, fontSize: 26, fontWeight: 900, color: C.success, letterSpacing: 2 }}>
              NHẬN SỔ HỒNG
            </div>
            <div style={{ fontFamily: FONT, fontSize: 13, color: C.muted }}>
              Pháp lý hoàn chỉnh · Toàn quyền sở hữu
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar: full */}
      <ProgressBar progress={barProg} label="100% — Hoàn tất · Nhận Sổ Hồng ✓" />

      {/* CTA */}
      <div style={{
        opacity:   ctaSp,
        transform: `translateY(${interpolate(ctaSp, [0, 1], [20, 0])}px)`,
        fontFamily: FONT,
        fontSize:  16,
        color:     C.muted,
        letterSpacing: 2,
      }}>
        Tư vấn chi tiết · <span style={{ color: C.gold }}>batdongsan123.com</span>
      </div>
    </AbsoluteFill>
  );
};

// ── Top badge (always visible) ─────────────────────────────────────────────────
const TopBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const op = spr(frame, fps, 0.5);
  return (
    <div style={{
      position:   "absolute",
      top:        32,
      left:       48,
      opacity:    op,
      display:    "flex",
      alignItems: "center",
      gap:        10,
    }}>
      <div style={{ width: 4, height: 28, background: C.gold, borderRadius: 2 }} />
      <div>
        <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: C.gold, letterSpacing: 2 }}>THE HABITAT</div>
        <div style={{ fontFamily: FONT, fontSize: 11, color: C.muted, letterSpacing: 1 }}>Giai Đoạn 3 · VSIP</div>
      </div>
    </div>
  );
};

// ── Step indicator ──────────────────────────────────────────────────────────────
const StepDot: React.FC<{ active: boolean; done: boolean; label: string }> = ({ active, done, label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
    <div style={{
      width:        12,
      height:       12,
      borderRadius: "50%",
      background:   done ? C.success : active ? C.gold : "rgba(255,255,255,0.18)",
      boxShadow:    active ? `0 0 12px ${C.gold}80` : done ? `0 0 8px ${C.success}60` : "none",
      transition:   "all 0.3s",
    }} />
    <span style={{ fontFamily: FONT, fontSize: 10, color: active ? C.gold : done ? C.success : C.muted, letterSpacing: 1 }}>
      {label}
    </span>
  </div>
);

const StepIndicator: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sec    = frame / fps;
  const phase  = sec < 8 ? 0 : sec < 18 ? 1 : sec < 30 ? 2 : 3;
  const labels = ["TỔNG QUAN", "30% NHẬN NHÀ", "TIẾN ĐỘ", "SỔ HỒNG"];
  const op     = spr(frame, fps, 0.8);

  return (
    <div style={{
      position:   "absolute",
      top:        36,
      right:      48,
      opacity:    op,
      display:    "flex",
      alignItems: "center",
      gap:        20,
    }}>
      {labels.map((label, i) => (
        <React.Fragment key={label}>
          <StepDot active={phase === i} done={phase > i} label={label} />
          {i < labels.length - 1 && (
            <div style={{ width: 28, height: 1, background: phase > i ? C.success : C.border }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── Main composition ───────────────────────────────────────────────────────────
export const PaymentScheduleVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const p1Op = phaseOpacity(frame, 0,       12,       7 * fps,  8 * fps);
  const p2Op = phaseOpacity(frame, 8 * fps, 9 * fps,  17 * fps, 18 * fps);
  const p3Op = phaseOpacity(frame, 18 * fps,19 * fps, 29 * fps, 30 * fps);
  const p4Op = phaseOpacity(frame, 30 * fps,31 * fps, 99 * fps, 100 * fps);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Background />
      <TopBadge frame={frame} fps={fps} />
      <StepIndicator frame={frame} fps={fps} />
      <Watermark />

      {p1Op > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: p1Op }}>
          <Phase1 frame={frame} fps={fps} />
        </div>
      )}
      {p2Op > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: p2Op }}>
          <Phase2 frame={frame} fps={fps} />
        </div>
      )}
      {p3Op > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: p3Op }}>
          <Phase3 frame={frame} fps={fps} />
        </div>
      )}
      {p4Op > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: p4Op }}>
          <Phase4 frame={frame} fps={fps} />
        </div>
      )}
    </AbsoluteFill>
  );
};
