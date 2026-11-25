import React from "react";
import { AbsoluteFill, Img, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBVP } from "@remotion/google-fonts/BeVietnamPro";

/**
 * "Chiết khấu 23,5% đến từ đâu?" — The Privé Tháp 9-10-11 (v2 — phong cách sang trọng)
 * 1080×1920 · 30fps · giọng thật Minh Hoàng, audio ghép ngoài.
 * Nguyên tắc: hình dự án làm chủ đạo, chữ serif vàng–trắng, chuyển động vén mở mượt, không nảy/xoay.
 */
const { fontFamily: SERIF } = loadPlayfair("normal", { weights: ["500", "600", "700"], subsets: ["vietnamese", "latin"] });
const { fontFamily: SERIF_I } = loadPlayfair("italic", { weights: ["500", "600"], subsets: ["vietnamese", "latin"] });
const { fontFamily: SANS } = loadBVP("normal", { weights: ["400", "500", "600"], subsets: ["vietnamese", "latin"] });

const FPS = 30;
const NAVY = "11,24,46";
const GOLD = "#E3C27A";
const WHITE = "#FFFFFF";
const SOFT = "rgba(255,255,255,0.78)";
const DIM = "rgba(255,255,255,0.5)";

const P2 = (s: number) => 2.6 + (s - 167.4);
const P1 = (s: number) => 22.3 + (s - 187.4);
const P3 = (s: number) => 34.5 + (s - 206.05);

export const CK_TOTAL_SEC = 51;
export const CK_TOTAL_FRAMES = CK_TOTAL_SEC * FPS;

const SC = {
  title: [0, 2.6],
  breakdown: [2.6, 22.15],
  price: [22.15, 34.35],
  timeline: [34.35, 46.85],
  end: [46.85, CK_TOTAL_SEC],
} as const;

const LAYERS = [
  { label: "Quà tặng sinh nhật Bluemarq", pct: 9, row: P2(172.66), val: P2(174.84) },
  { label: "Mua sỉ từ 3 căn", pct: 1.5, row: P2(176.06), val: P2(178.0) },
  { label: "Khách hàng thân thiết", pct: 1, row: P2(178.94), val: P2(180.86) },
  { label: "Thanh toán nhanh", pct: 12, row: P2(181.56), val: P2(182.46) },
];
const TOTAL_AT = P2(184.84);
const STEPS = [
  { date: "08/09 – 15/10", pct: "9%", at: P3(206.96), now: true },
  { date: "16/10 – 31/10", pct: "8%", at: P3(210.02), now: false },
  { date: "01/11 – 08/11", pct: "6%", at: P3(212.32), now: false },
];
const CLOSE_AT = P3(214.86);

// Hình nền theo từng ý (giây đầu ra) — x = objectPosition ngang (%)
const SHOTS: { src: string; a: number; b: number; x: number; z0: number; z1: number }[] = [
  { src: "tvc_213.8", a: 0, b: 2.6, x: 50, z0: 1.12, z1: 1.02 },
  { src: "tvc_59.1", a: 2.6, b: LAYERS[0].row - 0.2, x: 79, z0: 1.0, z1: 1.08 },
  { src: "tvc_86.4", a: LAYERS[0].row - 0.2, b: LAYERS[1].row - 0.2, x: 50, z0: 1.08, z1: 1.0 },
  { src: "tvc_68.2", a: LAYERS[1].row - 0.2, b: LAYERS[2].row - 0.2, x: 50, z0: 1.0, z1: 1.08 },
  { src: "tvc_95.5", a: LAYERS[2].row - 0.2, b: LAYERS[3].row - 0.2, x: 21, z0: 1.08, z1: 1.0 },
  { src: "tvc_77.3", a: LAYERS[3].row - 0.2, b: TOTAL_AT - 0.3, x: 21, z0: 1.0, z1: 1.06 },
  { src: "tvc_186.5", a: TOTAL_AT - 0.3, b: SC.price[0], x: 50, z0: 1.06, z1: 1.0 },
  { src: "tvc_150.1", a: SC.price[0], b: P1(193.4), x: 50, z0: 1.0, z1: 1.08 },
  { src: "tvc_159.2", a: P1(193.4), b: SC.timeline[0], x: 50, z0: 1.08, z1: 1.0 },
  { src: "tvc_204.7", a: SC.timeline[0], b: CLOSE_AT - 0.4, x: 50, z0: 1.0, z1: 1.07 },
  { src: "tvc_213.8", a: CLOSE_AT - 0.4, b: SC.end[0], x: 79, z0: 1.07, z1: 1.0 },
  { src: "tvc_59.1", a: SC.end[0], b: CK_TOTAL_SEC, x: 50, z0: 1.0, z1: 1.06 },
];

const CAPS: [number, number, string][] = [
  [P2(167.4), P2(172.6), "Nếu cộng dồn toàn bộ chính sách chiết khấu đang chạy song song"],
  [P2(172.6), P2(175.9), "quà tặng sinh nhật Bluemarq 9%"],
  [P2(175.9), P2(178.9), "chính sách mua sỉ từ 3 căn trở lên 1,5%"],
  [P2(178.9), P2(181.5), "khách hàng thân thiết 1%"],
  [P2(181.5), P2(183.2), "và thanh toán nhanh 12%"],
  [P2(183.2), P2(186.75), "tổng chiết khấu có thể lên đến 23,5% trên giá bán"],
  [P1(187.4), P1(189.8), "Để anh chị dễ hình dung bằng con số thực tế"],
  [P1(189.8), P1(193.4), "1 căn 2 phòng ngủ sau khi áp hết chiết khấu 23,5%"],
  [P1(193.4), P1(196.6), "giá chỉ còn khoảng 7,5 tới 8,5 tỷ"],
  [P1(196.6), P1(199.25), "chưa VAT, so với mức giá niêm yết ban đầu"],
  [P3(206.05), P3(209.6), "Lưu ý, mức 9% quà sinh nhật sẽ giảm dần theo mốc thời gian"],
  [P3(209.6), P3(211.9), "xuống 8% từ 16/10"],
  [P3(211.9), P3(214.5), "và 6% từ tháng 11 trở đi"],
  [P3(214.5), P3(218.3), "nên xuống tiền càng sớm thì chiết khấu càng cao"],
];

// ── helpers ──────────────────────────────────────────────────────────────────
const useT = () => useCurrentFrame() / FPS;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const prog = (t: number, at: number, dur = 0.8) =>
  interpolate(t, [at, at + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
const inScene = (t: number, [a, b]: readonly [number, number]) =>
  interpolate(t, [a - 0.3, a + 0.2, b - 0.25, b + 0.15], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const show = (t: number, [a, b]: readonly [number, number]) => t > a - 0.35 && t < b + 0.2;
const vn = (v: number, d = 1) => v.toFixed(d).replace(".", ",").replace(/,0$/, "");

/** Chữ vén từ dưới lên trong một khung che (kiểu title sequence). */
const Reveal: React.FC<{ at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  at,
  dur = 0.9,
  children,
  style,
}) => {
  const t = useT();
  const p = prog(t, at, dur);
  return (
    <div style={{ overflow: "hidden", paddingTop: 10, paddingBottom: 14, ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)`, opacity: Math.min(1, p * 1.6) }}>{children}</div>
    </div>
  );
};

const Fade: React.FC<{ at: number; dur?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  at,
  dur = 0.7,
  y = 18,
  children,
  style,
}) => {
  const t = useT();
  const p = prog(t, at, dur);
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * y}px)`, ...style }}>{children}</div>;
};

const GoldRule: React.FC<{ at: number; width?: number; style?: React.CSSProperties }> = ({ at, width = 120, style }) => {
  const t = useT();
  return <div style={{ height: 2, width: width * prog(t, at, 1.0), background: GOLD, ...style }} />;
};

// ── background ───────────────────────────────────────────────────────────────
const Shots: React.FC = () => {
  const t = useT();
  return (
    <>
      {SHOTS.map((s, i) => {
        if (t < s.a - 0.6 || t > s.b + 0.6) return null;
        const o = interpolate(t, [s.a - 0.5, s.a + 0.1, s.b - 0.1, s.b + 0.5], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const z = interpolate(t, [s.a - 0.5, s.b + 0.5], [s.z0, s.z1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <AbsoluteFill key={i} style={{ opacity: i === 0 && t < s.b - 0.1 ? 1 : o }}>
            <Img
              src={staticFile(`images/prive235/${s.src}.jpg`)}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${s.x}% 50%`, transform: `scale(${z})` }}
            />
          </AbsoluteFill>
        );
      })}
      {/* lớp phủ: sáng ở nửa trên để thấy dự án, đậm dần ở nửa dưới cho chữ */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(${NAVY},0.55) 0%, rgba(${NAVY},0.05) 16%, rgba(${NAVY},0.0) 36%, rgba(${NAVY},0.55) 50%, rgba(${NAVY},0.9) 62%, rgba(${NAVY},0.96) 100%)`,
        }}
      />
    </>
  );
};

const Brand: React.FC = () => {
  const t = useT();
  const o = interpolate(t, [0.2, 1.0, SC.end[0] - 0.4, SC.end[0]], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 104, left: 72, opacity: o }}>
      <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 40, letterSpacing: 10, color: WHITE }}>THE PRIVÉ</div>
      <div style={{ height: 1, width: 64, background: GOLD, margin: "12px 0 10px" }} />
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: 5, color: GOLD }}>CHÍNH SÁCH THÁP 9 · 10 · 11</div>
    </div>
  );
};

// ── scenes ───────────────────────────────────────────────────────────────────
const CONTENT_TOP = 1000;

const Title: React.FC = () => {
  const t = useT();
  if (!show(t, SC.title)) return null;
  const v = interpolate(t, [0.5, 1.9], [0, 23.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <AbsoluteFill style={{ opacity: inScene(t, SC.title) }}>
      <div style={{ position: "absolute", top: 930, left: 72, right: 72 }}>
        <Reveal at={0.2}>
          <div style={{ fontFamily: SERIF_I, fontWeight: 500, fontSize: 76, color: WHITE }}>Chiết khấu</div>
        </Reveal>
        <Reveal at={0.45}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 250, lineHeight: 1.0, color: GOLD, fontVariantNumeric: "lining-nums tabular-nums" }}>
            {vn(v)}%
          </div>
        </Reveal>
        <Reveal at={1.2}>
          <div style={{ fontFamily: SERIF_I, fontWeight: 500, fontSize: 76, color: WHITE }}>đến từ đâu?</div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

const Breakdown: React.FC = () => {
  const t = useT();
  if (!show(t, SC.breakdown)) return null;
  const sum = LAYERS.reduce((s, l) => s + l.pct * prog(t, l.val, 0.6), 0);
  const tot = prog(t, TOTAL_AT, 0.9);
  return (
    <AbsoluteFill style={{ opacity: inScene(t, SC.breakdown) }}>
      <div style={{ position: "absolute", top: CONTENT_TOP - 30, left: 72, right: 72 }}>
        <Reveal at={SC.breakdown[0] + 0.15}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 62, color: WHITE, lineHeight: 1.15 }}>
            4 lớp chiết khấu <span style={{ fontFamily: SERIF_I, color: GOLD }}>cộng dồn</span>
          </div>
        </Reveal>
        <GoldRule at={SC.breakdown[0] + 0.5} width={936} style={{ opacity: 0.35, margin: "18px 0 6px" }} />
        {LAYERS.map((l, i) => {
          const active = t >= l.row && (i === LAYERS.length - 1 ? t < TOTAL_AT : t < LAYERS[i + 1].row);
          const val = l.pct * prog(t, l.val, 0.6);
          return (
            <Fade key={i} at={l.row} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 80, borderBottom: "1px solid rgba(227,194,122,0.22)" }}>
              <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, color: active || t >= TOTAL_AT ? WHITE : SOFT }}>{l.label}</div>
              <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 52, color: GOLD, opacity: prog(t, l.val, 0.4), fontVariantNumeric: "lining-nums tabular-nums" }}>
                {vn(val)}%
              </div>
            </Fade>
          );
        })}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 130, opacity: prog(t, LAYERS[0].val, 0.6) }}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: 6, color: GOLD }}>TỔNG</div>
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 64 + 40 * tot,
              color: GOLD,
              fontVariantNumeric: "lining-nums tabular-nums",
              textShadow: tot > 0 ? `0 0 ${30 * tot}px rgba(227,194,122,0.45)` : "none",
            }}
          >
            {vn(t >= TOTAL_AT ? sum + (23.5 - sum) * tot : sum)}%
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Price: React.FC = () => {
  const t = useT();
  if (!show(t, SC.price)) return null;
  const at = P1(194.34);
  const lo = interpolate(t, [at, at + 1.0], [0, 7.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const hi = prog(t, P1(195.32), 0.7);
  return (
    <AbsoluteFill style={{ opacity: inScene(t, SC.price) }}>
      <div style={{ position: "absolute", top: CONTENT_TOP, left: 72, right: 72 }}>
        <Fade at={SC.price[0] + 0.1}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: 6, color: GOLD }}>VÍ DỤ THỰC TẾ</div>
        </Fade>
        <Reveal at={SC.price[0] + 0.35} style={{ marginTop: 4 }}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 76, color: WHITE }}>Căn 2 phòng ngủ</div>
        </Reveal>
        <Fade at={P1(191.0)}>
          <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 32, color: SOFT }}>
            sau khi áp đủ <span style={{ color: GOLD, fontWeight: 600 }}>23,5%</span> chiết khấu
          </div>
        </Fade>
        <GoldRule at={P1(193.3)} width={160} style={{ margin: "36px 0 18px" }} />
        <Fade at={P1(193.5)}>
          <div style={{ fontFamily: SERIF_I, fontWeight: 500, fontSize: 40, color: SOFT }}>giá chỉ còn khoảng</div>
        </Fade>
        <Reveal at={at - 0.1} dur={0.8}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 132, lineHeight: 1.05, color: GOLD, whiteSpace: "nowrap", fontVariantNumeric: "lining-nums tabular-nums" }}>
            {vn(lo)}
            <span style={{ display: "inline-block", verticalAlign: "bottom", overflow: "hidden", maxWidth: 360 * hi, opacity: hi, whiteSpace: "nowrap" }}>&nbsp;– 8,5</span>
            <span style={{ fontSize: 76, fontFamily: SERIF_I }}> tỷ</span>
          </div>
        </Reveal>
        <Fade at={P1(196.76)}>
          <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 26, color: DIM }}>Chưa bao gồm VAT</div>
        </Fade>
      </div>
    </AbsoluteFill>
  );
};

const Timeline: React.FC = () => {
  const t = useT();
  if (!show(t, SC.timeline)) return null;
  const line = interpolate(t, [STEPS[0].at - 0.2, STEPS[2].at + 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const COLW = 312;
  return (
    <AbsoluteFill style={{ opacity: inScene(t, SC.timeline) }}>
      <div style={{ position: "absolute", top: CONTENT_TOP - 20, left: 72, right: 72 }}>
        <Reveal at={SC.timeline[0] + 0.15}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 62, color: WHITE, lineHeight: 1.15 }}>
            Quà sinh nhật <span style={{ fontFamily: SERIF_I, color: GOLD }}>giảm dần</span>
          </div>
        </Reveal>
        <div style={{ position: "relative", height: 250, marginTop: 44 }}>
          <div style={{ position: "absolute", top: 9, left: 9, height: 2, width: COLW * 2 * line, background: GOLD, opacity: 0.6 }} />
          {STEPS.map((s, i) => {
            const p = prog(t, s.at, 0.7);
            return (
              <div key={i} style={{ position: "absolute", left: i * COLW, top: 0, width: COLW, opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
                <div style={{ width: 20, height: 20, borderRadius: 10, background: s.now ? GOLD : `rgb(${NAVY})`, border: `2px solid ${GOLD}` }} />
                <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, color: DIM, marginTop: 22, letterSpacing: 1 }}>{s.date}</div>
                <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 96, lineHeight: 1.1, color: s.now ? GOLD : WHITE, fontVariantNumeric: "lining-nums" }}>{s.pct}</div>
                {s.now && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, letterSpacing: 4, color: GOLD }}>HIỆN TẠI</div>}
              </div>
            );
          })}
        </div>
        <GoldRule at={CLOSE_AT - 0.1} width={160} style={{ margin: "26px 0 6px" }} />
        <Reveal at={CLOSE_AT}>
          <div style={{ fontFamily: SERIF_I, fontWeight: 500, fontSize: 70, color: WHITE }}>
            Chốt sớm, <span style={{ color: GOLD }}>lợi hơn.</span>
          </div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const t = useT();
  if (!show(t, SC.end)) return null;
  const a = SC.end[0];
  return (
    <AbsoluteFill style={{ opacity: inScene(t, SC.end) }}>
      <div style={{ position: "absolute", top: 1010, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Reveal at={a + 0.15}>
          <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 104, letterSpacing: 18, color: WHITE, paddingLeft: 18 }}>THE PRIVÉ</div>
        </Reveal>
        <GoldRule at={a + 0.5} width={140} style={{ margin: "10px 0 22px" }} />
        <Fade at={a + 0.7}>
          <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 30, letterSpacing: 2, color: SOFT }}>Bán đảo 3 mặt sông · Khu Đông TP.HCM</div>
        </Fade>
        <Fade at={a + 1.2} style={{ marginTop: 52 }}>
          <div style={{ border: `1.5px solid ${GOLD}`, padding: "20px 40px", fontFamily: SANS, fontWeight: 500, fontSize: 32, color: WHITE }}>
            Bình luận <span style={{ color: GOLD, fontWeight: 600 }}>“THÁP 9”</span> để nhận bảng tính dòng tiền
          </div>
        </Fade>
        <Fade at={a + 1.6} style={{ marginTop: 40, maxWidth: 860 }}>
          <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 21, lineHeight: 1.5, color: DIM }}>
            Chính sách áp dụng đến 08/11/2026 · Quà sinh nhật 9% đến 15/10/2026 · Chiết khấu tính trên giá bán chưa VAT
          </div>
        </Fade>
      </div>
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => {
  const t = useT();
  const c = CAPS.find(([a, b]) => t >= a && t < b);
  if (!c) return null;
  const o = interpolate(t, [c[0], c[0] + 0.2, c[1] - 0.12, c[1]], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 1585, left: 90, right: 90, textAlign: "center", opacity: o }}>
      <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 36, lineHeight: 1.45, color: WHITE, textShadow: "0 2px 10px rgba(0,0,0,0.85)" }}>
        {c[2]}
      </span>
    </div>
  );
};

const Progress: React.FC = () => {
  const t = useT();
  return <div style={{ position: "absolute", top: 0, left: 0, height: 4, width: `${(t / CK_TOTAL_SEC) * 100}%`, background: GOLD, opacity: 0.85 }} />;
};

export const ChietKhau235: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: `rgb(${NAVY})` }}>
    <Shots />
    <Brand />
    <Title />
    <Breakdown />
    <Price />
    <Timeline />
    <End />
    <Captions />
    <Progress />
  </AbsoluteFill>
);
