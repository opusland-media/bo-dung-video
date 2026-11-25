import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, Easing } from "remotion";
import { Photo, FilmLook, Heading, SANS, MONO } from "./GSLCSToanBo";
import { W, H } from "./GSLCSData";

/**
 * Green Skyline — "4 cách thanh toán" cho 1 căn cụ thể (dọc 1080×1920, 30fps, không lời).
 * Số liệu lấy từ phiếu tính giá (PTG) của căn, đã tính lại cho từng lịch thanh toán.
 * Phong cách: ảnh thật + nhãn tối giản (xem docs/feedback-khong-giong-video-ai.md).
 */

const MOSS = "#B9C79A";
const INK = "#1E1F1C";
const MOSS_DK = "#5E6E48";
const ease = Easing.bezier(0.2, 0.7, 0.2, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const prog = (f: number, a: number, d: number) => interpolate(f, [a, a + d], [0, 1], { ...clamp, easing: ease });
const SAFE = { l: 108, r: 972, t: 150, b: 1770 };

/* ---------------- dữ liệu căn T2.03.02 (PTG ngày 16/10/2026) ---------------- */
type Row = { pct: string; label: string; sub?: string; amt: string; hi?: boolean };
type Plan = { name: string; tag: string; total: string; rows: Row[]; note?: string[]; img: string; iw: number; ih: number; fx: number };
const PLANS: Plan[] = [
  {
    name: "Thanh toán nhanh", tag: "CHIẾT KHẤU THÊM 9%", total: "2,94", img: "images/gslcs/p08.jpg", iw: 2560, ih: 1707, fx: 0.55,
    rows: [
      { pct: "10%", label: "Ký hợp đồng", amt: "≈ 294 tr" },
      { pct: "30%", label: "Sau 4 ngày", amt: "≈ 881 tr" },
      { pct: "55%", label: "Nhận nhà", sub: "DỰ KIẾN 04/2027", amt: "≈ 1,62 tỷ", hi: true },
      { pct: "5%", label: "Nhận sổ hồng", amt: "≈ 147 tr" },
    ],
  },
  {
    name: "Thanh toán chuẩn", tag: "CHIẾT KHẤU THÊM 3%", total: "3,13", img: "images/gslcs/p13.jpg", iw: 2560, ih: 1707, fx: 0.5,
    rows: [
      { pct: "10%", label: "Ký hợp đồng", amt: "≈ 313 tr" },
      { pct: "6×5%", label: "Mỗi 2 tháng", sub: "6 ĐỢT · ĐẾN 10/2027", amt: "≈ 157 tr" },
      { pct: "55%", label: "Nhận nhà", sub: "ĐỢT DỰ KIẾN 12/2027", amt: "≈ 1,72 tỷ", hi: true },
      { pct: "5%", label: "Nhận sổ hồng", amt: "≈ 157 tr" },
    ],
  },
  {
    name: "Vay ngân hàng 50%", tag: "LÃI SUẤT 0% · 18 THÁNG", total: "3,23", img: "images/gslcs/p10.jpg", iw: 2560, ih: 1707, fx: 0.5,
    rows: [
      { pct: "10%", label: "Ký hợp đồng", amt: "≈ 323 tr" },
      { pct: "35%", label: "Nhận nhà", sub: "DỰ KIẾN 04/2027", amt: "≈ 1,13 tỷ" },
      { pct: "50%", label: "Ngân hàng", sub: "GIẢI NGÂN KHI NHẬN NHÀ", amt: "≈ 1,62 tỷ", hi: true },
      { pct: "5%", label: "Nhận sổ hồng", amt: "≈ 162 tr" },
    ],
  },
  {
    name: "Vay ngân hàng 70%", tag: "LÃI 0% 12 THÁNG HOẶC 5,5% 24 THÁNG", total: "3,23", img: "images/gslcs/p25.jpg", iw: 2048, ih: 1365, fx: 0.5,
    rows: [
      { pct: "10%", label: "Ký hợp đồng", amt: "≈ 323 tr" },
      { pct: "15%", label: "Nhận nhà", sub: "DỰ KIẾN 04/2027", amt: "≈ 485 tr" },
      { pct: "70%", label: "Ngân hàng", sub: "GIẢI NGÂN KHI NHẬN NHÀ", amt: "≈ 2,26 tỷ", hi: true },
      { pct: "5%", label: "Nhận sổ hồng", amt: "≈ 162 tr" },
    ],
  },
];

/* ---------------- mốc thời gian ---------------- */
const T = { unit: 100, plan0: 250, planLen: 210, sum: 1090, end: 1330, total: 1440 };
export const GSL_CACHTT_FRAMES = T.total;
const planAt = (i: number) => T.plan0 + i * T.planLen;
const ROW0 = 34, ROWGAP = 14;

/* ---------------- kiểm tra vùng an toàn TikTok ---------------- */
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

/* chữ lộ từ dưới mặt nạ */
const Line: React.FC<{ t: string; at: number; size?: number; color?: string; weight?: number }> = ({ t, at, size = 100, color = "#fff", weight = 700 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = prog(f, at, 8);
  return (
    <div style={{ overflow: "hidden", height: size * 1.2 }}>
      <div style={{ fontFamily: SANS, fontWeight: weight, fontSize: size, lineHeight: `${size * 1.2}px`, letterSpacing: -2, color, whiteSpace: "nowrap",
        transform: `translateY(${(1 - p) * size * 1.2}px)`, textShadow: "0 2px 18px rgba(0,0,0,0.45)" }}>{t}</div>
    </div>
  );
};

const Mono: React.FC<{ t: string; at: number; size?: number; color?: string; style?: React.CSSProperties }> = ({ t, at, size = 32, color = "#fff", style }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  return <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: size, letterSpacing: 3, color, opacity: prog(f, at, 8), textShadow: color === "#fff" ? "0 1px 8px rgba(0,0,0,0.5)" : undefined, ...style }}>{t}</div>;
};

/* ---------------- cảnh 0: mở đầu ---------------- */
const Hook: React.FC = () => (
  <AbsoluteFill>
    <Photo src="images/gslcs/q01.jpg" iw={810} ih={1080} fx0={0.5} z0={1.0} z1={1.06} dur={T.unit} />
    <FilmLook topShade={0.5} bottomShade={0.6} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0) 50%)" }} />
    <div style={{ position: "absolute", left: 120, top: 260 }}>
      <Mono t="CĂN T2.03.02 · GREEN SKYLINE" at={2} />
      <div style={{ height: 18 }} />
      <Line t="4 cách" at={8} size={150} />
      <Line t="thanh toán" at={13} size={150} color={MOSS} />
    </div>
    <div style={{ position: "absolute", left: 120, top: 1420, width: 840 }}>
      <Line t="Chọn cách nào" at={30} size={76} weight={500} />
      <Line t="hợp túi tiền?" at={36} size={76} weight={500} />
    </div>
  </AbsoluteFill>
);

/* ---------------- cảnh 1: thông tin căn ---------------- */
const Unit: React.FC = () => {
  const f = useCurrentFrame();
  const rows: [string, string, boolean?][] = [
    ["TIM TƯỜNG", "54,22 m²"],
    ["THÔNG THỦY", "49,41 m²"],
    ["SÂN VƯỜN RIÊNG", "+ 7,51 m²", true],
  ];
  return (
    <AbsoluteFill>
      <Photo src="images/gslcs/p07.jpg" iw={2560} ih={1707} fx0={0.48} fx1={0.54} dur={T.plan0 - T.unit} />
      <FilmLook topShade={0.42} bottomShade={0.72} />
      <Heading idx="T2.03.02" title="1PN+ · Tháp T2 · Tầng 3" at={0} />
      <div style={{ position: "absolute", left: 120, top: 1190, width: 840 }}>
        {rows.map(([k, v, hi], i) => {
          const a = 14 + i * 12;
          if (f < a) return <div key={i} style={{ height: 120 }} />;
          const p = prog(f, a, 10);
          return (
            <div key={i} style={{ height: 120, display: "flex", alignItems: "baseline", borderTop: `2px solid rgba(255,255,255,${0.8 * p})`, paddingTop: 22, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
              <div style={{ flex: 1, fontFamily: MONO, fontWeight: 500, fontSize: 32, letterSpacing: 3, color: "#fff", opacity: p }}>{k}</div>
              <div style={{ fontFamily: SANS, fontWeight: hi ? 700 : 500, fontSize: hi ? 72 : 60, color: hi ? MOSS : "#fff", clipPath: `inset(0 0 0 ${100 - p * 100}%)` }}>{v}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- cảnh 2–5: từng cách thanh toán ---------------- */
const PlanScene: React.FC<{ p: Plan; idx: number }> = ({ p, idx }) => {
  const f = useCurrentFrame();
  const bigP = prog(f, 18, 12);
  return (
    <AbsoluteFill>
      <Photo src={p.img} iw={p.iw} ih={p.ih} fx0={p.fx} fx1={p.fx + 0.03} dur={T.planLen} />
      <AbsoluteFill style={{ background: "rgba(8,10,8,0.5)" }} />
      <FilmLook topShade={0.4} bottomShade={0.55} />
      <Heading idx={`0${idx + 1} / 04`} title={p.name} at={0} sub={p.tag} subAt={8} />
      {/* tổng giá */}
      <div style={{ position: "absolute", left: 120, top: 600, width: 840, textShadow: "0 1px 8px rgba(0,0,0,0.45)" }}>
        <Mono t="GIÁ CĂN SAU CHIẾT KHẤU" at={14} />
        <div style={{ height: 2, background: "rgba(255,255,255,0.85)", width: `${prog(f, 16, 12) * 100}%`, marginTop: 16 }} />
        <div style={{ overflow: "hidden", height: 200 }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 180, lineHeight: "200px", letterSpacing: -6, color: "#fff", transform: `translateY(${(1 - bigP) * 200}px)`, display: "flex", alignItems: "baseline" }}>
            <span style={{ fontSize: 110, fontWeight: 500, marginRight: 18 }}>≈</span>
            <span style={{ color: MOSS }}>{p.total}</span>
            <span style={{ fontSize: 64, letterSpacing: 0, marginLeft: 20, fontWeight: 500 }}>tỷ</span>
          </div>
        </div>
      </div>
      {/* lịch đóng tiền */}
      <div style={{ position: "absolute", left: 120, top: 990, width: 840 }}>
        {p.rows.map((r, i) => {
          const a = ROW0 + i * ROWGAP;
          if (f < a) return <div key={i} style={{ height: 150 }} />;
          const k = prog(f, a, 10);
          return (
            <div key={i} style={{ height: 150, display: "flex", alignItems: "center", borderTop: `2px solid rgba(255,255,255,${0.55 * k})`, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
              <div style={{ width: 230, fontFamily: SANS, fontWeight: 700, fontSize: 68, letterSpacing: -2, color: r.hi ? MOSS : "#fff", clipPath: `inset(0 ${100 - k * 100}% 0 0)` }}>{r.pct}</div>
              <div style={{ flex: 1, opacity: k }}>
                <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 42, color: "#fff", lineHeight: 1.1 }}>{r.label}</div>
                {r.sub && <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 24, letterSpacing: 2, color: "rgba(255,255,255,0.8)", marginTop: 8 }}>{r.sub}</div>}
              </div>
              <div style={{ fontFamily: SANS, fontWeight: r.hi ? 700 : 500, fontSize: 44, color: r.hi ? MOSS : "#fff", whiteSpace: "nowrap", clipPath: `inset(0 0 0 ${100 - k * 100}%)` }}>{r.amt}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- cảnh 6: so sánh trên nền giấy ---------------- */
const SUM: { n: string; v: string; s: string; hi?: boolean }[] = [
  { n: "Thanh toán nhanh", v: "≈ 2,94 tỷ", s: "GIÁ TỐT NHẤT · CK THÊM 9%", hi: true },
  { n: "Thanh toán chuẩn", v: "≈ 3,13 tỷ", s: "GIÃN 9 ĐỢT · CK THÊM 3%" },
  { n: "Vay 50%", v: "≈ 3,23 tỷ", s: "TỰ TRẢ 45% ĐẾN KHI NHẬN NHÀ" },
  { n: "Vay 70%", v: "≈ 3,23 tỷ", s: "CHỈ CẦN TRẢ TRƯỚC 25%" },
];
const Summary: React.FC = () => {
  const f = useCurrentFrame();
  const a = prog(f, 0, 12);
  return (
    <AbsoluteFill style={{ background: "#F2EFE7" }}>
      <svg width={W} height={H} style={{ position: "absolute", opacity: 0.35, mixBlendMode: "multiply" }}>
        <filter id="paperTT"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={3} seed={5} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={W} height={H} filter="url(#paperTT)" opacity={0.25} />
      </svg>
      <div style={{ position: "absolute", left: 120, top: 250, opacity: a }}>
        <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: 4, color: INK }}>T2.03.02 · 1PN+ · SÂN VƯỜN</div>
        <div style={{ width: 70, height: 2, background: INK, margin: "16px 0 18px" }} />
        <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 80, color: INK, lineHeight: 1.1 }}>So sánh</div>
        <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 80, color: INK, lineHeight: 1.1 }}>4 cách thanh toán</div>
      </div>
      <div style={{ position: "absolute", left: 120, top: 640, width: 840 }}>
        {SUM.map((r, i) => {
          const at = 18 + i * 16;
          if (f < at) return <div key={i} style={{ height: 210 }} />;
          const p = prog(f, at, 10);
          return (
            <div key={i} style={{ height: 210, borderTop: `1.5px solid rgba(30,31,28,${0.45 * p})`, paddingTop: 28, opacity: p }}>
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <div style={{ flex: 1, fontFamily: SANS, fontWeight: 500, fontSize: 48, color: INK }}>{r.n}</div>
                <div style={{ fontFamily: SANS, fontWeight: r.hi ? 700 : 500, fontSize: r.hi ? 64 : 56, color: r.hi ? MOSS_DK : INK, clipPath: `inset(0 0 0 ${100 - p * 100}%)` }}>{r.v}</div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: 2, color: r.hi ? MOSS_DK : INK, marginTop: 14 }}>{r.s}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 120, top: 1560, width: 840, fontFamily: MONO, fontSize: 22, lineHeight: 1.5, color: "rgba(30,31,28,0.75)", opacity: prog(f, 90, 12) }}>
        *Giá gồm VAT, đã trừ ưu đãi 9% của chương trình bán hàng, chưa gồm 2% phí bảo trì. Số tạm tính theo phiếu tính giá, làm tròn.
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- cảnh 7: kết ---------------- */
const End: React.FC<{ ten?: string; sdt?: string }> = ({ ten, sdt }) => (
  <AbsoluteFill>
    <Photo src="images/gslcs/q02.jpg" iw={810} ih={1080} fx0={0.5} z0={1.02} z1={1.07} dur={T.total - T.end} />
    <FilmLook topShade={0.5} bottomShade={0.65} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0) 50%)" }} />
    <div style={{ position: "absolute", left: 120, top: 260 }}>
      <Mono t="GIỮ CHỖ CHỈ" at={2} />
      <div style={{ height: 10 }} />
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <Line t="50" at={6} size={200} color={MOSS} />
        <div style={{ width: 20 }} />
        <Line t="triệu" at={10} size={80} weight={500} />
      </div>
    </div>
    <div style={{ position: "absolute", left: 120, top: 1400, width: 840 }}>
      <Line t="Nhắn để nhận" at={22} size={68} weight={500} />
      <Line t="phiếu tính giá chi tiết" at={27} size={68} weight={500} />
      {sdt ? <Mono t={`${ten ? ten.toUpperCase() + " · " : ""}${sdt}`} at={36} size={36} style={{ marginTop: 22 }} /> : null}
    </div>
  </AbsoluteFill>
);

/* ---------------- gốc ---------------- */
export const GSLCachTT: React.FC<{ safeCheck?: boolean; sfx?: boolean; ten?: string; sdt?: string }> = ({ safeCheck = false, sfx = true, ten, sdt }) => {
  const f = useCurrentFrame();
  useSafeCheck(safeCheck, f);
  const ev: { f: number; n: string; v: number }[] = [];
  const E = (fr: number, n: string, v = 0.78) => ev.push({ f: fr, n, v });
  // mở đầu
  E(8, "snap"); E(13, "snap"); E(30, "tick", 0.7);
  // thông tin căn
  E(T.unit, "swoosh", 0.7); [0, 1, 2].forEach((i) => E(T.unit + 14 + i * 12, i === 2 ? "snap" : "tick", 0.75));
  // từng cách
  PLANS.forEach((p, i) => {
    const s = planAt(i);
    E(s - 6, "swoosh", 0.7);
    E(s + 20, "hit", 0.8);
    p.rows.forEach((r, j) => E(s + ROW0 + j * ROWGAP, r.hi ? "snap" : "tick", 0.75));
  });
  E(T.sum - 6, "swoosh", 0.7);
  SUM.forEach((_, i) => E(T.sum + 18 + i * 16, i === 0 ? "snap" : "tick", 0.75));
  E(T.end - 6, "swoosh", 0.7); E(T.end + 6, "hit", 0.8);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence from={0} durationInFrames={T.unit}><Hook /></Sequence>
      <Sequence from={T.unit} durationInFrames={T.plan0 - T.unit}><Unit /></Sequence>
      {PLANS.map((p, i) => (
        <Sequence key={i} from={planAt(i)} durationInFrames={T.planLen}><PlanScene p={p} idx={i} /></Sequence>
      ))}
      <Sequence from={T.sum} durationInFrames={T.end - T.sum}><Summary /></Sequence>
      <Sequence from={T.end} durationInFrames={T.total - T.end}><End ten={ten} sdt={sdt} /></Sequence>
      {sfx && ev.map((e, i) => (
        <Sequence key={`x${i}`} from={Math.max(0, e.f)} durationInFrames={40}>
          <Audio src={staticFile(`audio/cs_cut/${e.n}.wav`)} volume={e.v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
