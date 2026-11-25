import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { COLORS, EASE, FONTS, remap } from "../design/tokens";

const { fontFamily: FONT_MONT } = loadMontserrat();

export const FENICA_PRICE_FRAMES = 540; // 18s @ 30fps

const GOLD  = COLORS.gold;
const GOLD2 = COLORS.goldLight;
const BG    = COLORS.bg;
const WHITE = COLORS.textPrimary;
const DIM   = COLORS.textSecondary;

function bounceAt(f: number, triggerF: number): number {
  if (f < triggerF) return 1;
  const t = f - triggerF;
  if (t <= 8)  return 1 + remap(t, [0, 8],  [0, 0.18]);
  if (t <= 20) return 1 + remap(t, [8, 20], [0.18, 0]);
  return 1;
}

// Gold gradient applied to text via background-clip trick
const goldGrad: React.CSSProperties = {
  background: "linear-gradient(158deg, #FFE566 0%, #C9A227 38%, #F0D060 72%, #FFE566 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

// ─── Scene 1 — Price Reveal (0–200f) ─────────────────────────────────────
function PriceScene() {
  const f = useCurrentFrame();

  const fadeIn  = Math.min(1, remap(f, [0, 22], [0, 1]));
  const fadeOut = f > 178 ? Math.max(0, remap(f, [178, 200], [1, 0])) : 1;

  const bgZoom  = 1 + remap(f, [0, 200], [0, 0.06]);

  // Badge
  const badgeOp = Math.min(1, remap(f, [5, 25], [0, 1]));
  const badgeY  = remap(f, [5, 25], [20, 0]);

  // CHỈ TỪ
  const lb1Op = Math.min(1, remap(f, [15, 35], [0, 1]));

  // Price counter 0 → 36.5
  const priceVal = Math.min(36.5, remap(f, [22, 65], [0, 36.5]));
  const priceSc  = bounceAt(f, 65);
  const unitOp   = Math.min(1, remap(f, [55, 75], [0, 1]));
  const sweepX   = f >= 70 && f <= 90 ? remap(f, [70, 90], [-90, 500]) : f < 70 ? -200 : 600;

  // TỔNG GIÁ TỪ + 1,79 TỶ
  const lb2Op    = Math.min(1, remap(f, [78, 98],  [0, 1]));
  const totalOp  = Math.min(1, remap(f, [88, 108], [0, 1]));
  const totalSc  = f < 88 ? 0.75 : bounceAt(f, 108);
  const divOp    = Math.min(1, remap(f, [72, 92],  [0, 1]));

  // Floor plan image
  const imgOp    = Math.min(1, remap(f, [108, 135], [0, 1]));
  const imgY     = remap(f, [108, 135], [35, 0]);
  const imgLbOp  = Math.min(1, remap(f, [132, 155], [0, 1]));

  return (
    <AbsoluteFill style={{ background: BG, opacity: fadeIn * fadeOut }}>
      {/* BG photo */}
      <AbsoluteFill style={{ transform: `scale(${bgZoom})`, transformOrigin: "center" }}>
        <Img src={staticFile("images/fenica-aerial-day.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{
        background: `linear-gradient(to bottom, rgba(13,17,23,0.55) 0%, rgba(13,17,23,0.18) 28%, rgba(13,17,23,0.75) 62%, ${BG} 100%)`,
      }} />

      {/* Badge */}
      <div style={{
        position: "absolute", top: 230, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: badgeOp, transform: `translateY(${badgeY}px)`,
      }}>
        <div style={{
          background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`,
          borderRadius: 100, padding: "12px 44px",
          fontFamily: FONTS.body, fontSize: 26, fontWeight: 900,
          color: "#0D1117", letterSpacing: 2,
        }}>FENICA DĨ AN</div>
      </div>

      {/* CHỈ TỪ */}
      <div style={{
        position: "absolute", top: 350, left: 0, right: 0, textAlign: "center",
        opacity: lb1Op,
        fontFamily: FONTS.body, fontSize: 30, fontWeight: 700,
        color: DIM, letterSpacing: 5,
      }}>CHỈ TỪ</div>

      {/* 36,5 TRIỆU/M² */}
      <div style={{
        position: "absolute", top: 400, left: 0, right: 0,
        display: "flex", justifyContent: "center", alignItems: "baseline", gap: 8,
      }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <span style={{
            ...goldGrad,
            fontFamily: FONT_MONT, fontSize: 116, fontWeight: 900,
            lineHeight: 1, display: "inline-block",
            transform: `scale(${priceSc})`,
            filter: "drop-shadow(0 3px 16px rgba(0,0,0,0.75))",
          }}>{priceVal.toFixed(1).replace(".", ",")}</span>
          <div style={{
            position: "absolute", top: "-10%", bottom: "-10%",
            left: sweepX, width: 55,
            background: "linear-gradient(105deg, transparent, rgba(255,255,255,0.22), transparent)",
            pointerEvents: "none",
          }} />
        </div>
        <span style={{
          fontFamily: FONT_MONT, fontSize: 30, fontWeight: 700,
          color: WHITE, opacity: unitOp, paddingBottom: 10,
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.8))",
        }}>TRIỆU/M²</span>
      </div>

      {/* Divider */}
      <div style={{
        position: "absolute", top: 550, left: 80, right: 80, height: 1,
        background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
        opacity: divOp,
      }} />

      {/* TỔNG GIÁ TỪ */}
      <div style={{
        position: "absolute", top: 570, left: 0, right: 0, textAlign: "center",
        opacity: lb2Op,
        fontFamily: FONTS.body, fontSize: 27, fontWeight: 600,
        color: DIM, letterSpacing: 3,
      }}>TỔNG GIÁ TỪ</div>

      {/* 1,79 TỶ */}
      <div style={{
        position: "absolute", top: 612, left: 0, right: 0, textAlign: "center",
        opacity: totalOp, transform: `scale(${totalSc})`,
      }}>
        <span style={{
          ...goldGrad,
          fontFamily: FONT_MONT, fontSize: 90, fontWeight: 900,
          filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.8))",
        }}>1,79 TỶ</span>
      </div>

      {/* Floor plan */}
      <div style={{
        position: "absolute", top: 790, left: 60, right: 60,
        opacity: imgOp, transform: `translateY(${imgY}px)`,
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 8px 48px rgba(0,0,0,0.65)",
        border: `1.5px solid rgba(201,162,39,0.35)`,
      }}>
        <Img src={staticFile("images/fenica-can1pn.png")}
          style={{ width: "100%", display: "block" }} />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(transparent, rgba(0,0,0,0.82))",
          padding: "30px 28px 20px",
          opacity: imgLbOp,
        }}>
          <div style={{
            fontFamily: FONTS.body, fontSize: 22, fontWeight: 800,
            color: GOLD, letterSpacing: 3,
          }}>CĂN 1PN+  ·  43–50 M²</div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 2 — Payment Breakdown (183–378f) ───────────────────────────────
function PaymentScene() {
  const f = useCurrentFrame();

  const fadeIn  = Math.min(1, remap(f, [0, 22], [0, 1]));
  const fadeOut = f > 173 ? Math.max(0, remap(f, [173, 195], [1, 0])) : 1;

  const bgZoom  = 1 + remap(f, [0, 195], [0, 0.05]);

  // VỐN BAN ĐẦU
  const h1Op = Math.min(1, remap(f, [10, 30], [0, 1]));
  const h1Y  = remap(f, [10, 30], [18, 0]);

  // CHỈ 20% — scale-spring entry
  const pctOp = Math.min(1, remap(f, [18, 42], [0, 1]));
  const pctSc = remap(f, [18, 42], [0.72, 1.0], EASE.spring);

  // ≈ 358 TRIỆU
  const sub1Op = Math.min(1, remap(f, [46, 66], [0, 1]));
  const sub1Y  = remap(f, [46, 66], [14, 0]);

  // Divider
  const divOp  = Math.min(1, remap(f, [62, 82], [0, 1]));

  // PTTT image
  const imgOp  = Math.min(1, remap(f, [64, 92], [0, 1]));
  const imgY   = remap(f, [64, 92], [28, 0]);
  const imgZoom = 1 + remap(f, [0, 195], [0, 0.04]);

  // Bottom callout
  const btOp   = Math.min(1, remap(f, [98, 122], [0, 1]));
  const btY    = remap(f, [98, 122], [18, 0]);

  return (
    <AbsoluteFill style={{ background: BG, opacity: fadeIn * fadeOut }}>
      {/* BG */}
      <AbsoluteFill style={{ transform: `scale(${bgZoom})`, transformOrigin: "center" }}>
        <Img src={staticFile("images/fenica-aerial-night.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.48 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{
        background: `linear-gradient(180deg, rgba(13,17,23,0.50) 0%, rgba(13,17,23,0.20) 30%, rgba(13,17,23,0.88) 70%, ${BG} 100%)`,
      }} />

      {/* VỐN BAN ĐẦU */}
      <div style={{
        position: "absolute", top: 230, left: 0, right: 0, textAlign: "center",
        opacity: h1Op, transform: `translateY(${h1Y}px)`,
        fontFamily: FONTS.body, fontSize: 30, fontWeight: 700,
        color: DIM, letterSpacing: 4,
      }}>VỐN BAN ĐẦU</div>

      {/* CHỈ 20% */}
      <div style={{
        position: "absolute", top: 290, left: 0, right: 0, textAlign: "center",
        opacity: pctOp, transform: `scale(${pctSc})`,
      }}>
        <span style={{
          ...goldGrad,
          fontFamily: FONT_MONT, fontSize: 120, fontWeight: 900, lineHeight: 1,
          filter: "drop-shadow(0 3px 16px rgba(0,0,0,0.80))",
        }}>CHỈ 20%</span>
      </div>

      {/* ≈ 358 TRIỆU */}
      <div style={{
        position: "absolute", top: 470, left: 0, right: 0, textAlign: "center",
        opacity: sub1Op, transform: `translateY(${sub1Y}px)`,
        fontFamily: FONTS.body, fontSize: 30, fontWeight: 700, color: WHITE,
      }}>≈ 358 TRIỆU — đặt cọc &amp; ký HĐMB</div>

      {/* Divider */}
      <div style={{
        position: "absolute", top: 543, left: 80, right: 80, height: 1,
        background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
        opacity: divOp,
      }} />

      {/* PTTT image */}
      <div style={{
        position: "absolute", top: 563, left: 40, right: 40,
        opacity: imgOp, transform: `translateY(${imgY}px)`,
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 8px 48px rgba(0,0,0,0.68)",
        border: `1.5px solid rgba(201,162,39,0.30)`,
      }}>
        <div style={{
          overflow: "hidden",
          transform: `scale(${imgZoom})`,
          transformOrigin: "center center",
        }}>
          <Img src={staticFile("images/fenica-pttt.png")}
            style={{ width: "100%", display: "block" }} />
        </div>
      </div>

      {/* Callout */}
      <div style={{
        position: "absolute", top: 1100, left: 60, right: 60,
        opacity: btOp, transform: `translateY(${btY}px)`,
        background: "rgba(201,162,39,0.10)",
        border: `1px solid rgba(201,162,39,0.42)`,
        borderRadius: 18, padding: "22px 32px", textAlign: "center",
      }}>
        <div style={{
          fontFamily: FONTS.body, fontSize: 28, fontWeight: 700,
          color: WHITE, lineHeight: 1.55,
        }}>
          Phần còn lại{" "}
          <span style={{ color: GOLD, fontWeight: 900 }}>trả góp đều đặn</span>
          {" "}—<br />mỗi đợt chỉ{" "}
          <span style={{ color: GOLD, fontWeight: 900 }}>6 triệu đồng</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 3 — Monthly + 2027 (362–540f) ─────────────────────────────────
function MonthlyScene() {
  const f = useCurrentFrame();

  const fadeIn  = Math.min(1, remap(f, [0, 22], [0, 1]));
  const bgZoom  = 1 + remap(f, [0, 178], [0, 0.05]);

  // Label top
  const h1Op = Math.min(1, remap(f, [8, 28], [0, 1]));
  const h1Y  = remap(f, [8, 28], [18, 0]);

  // "6" counter
  const countVal = Math.min(6, Math.round(remap(f, [22, 55], [0, 6])));
  const countSc  = bounceAt(f, 55);
  const shimmerX = f > 22 ? ((f - 22) % 52) / 52 * 380 - 90 : -200;

  // TRIỆU unit
  const unitOp = Math.min(1, remap(f, [48, 68], [0, 1]));

  // Sub label
  const subOp = Math.min(1, remap(f, [62, 82], [0, 1]));

  // 3 chips
  const chip = [
    Math.min(1, remap(f, [70, 85], [0, 1])),
    Math.min(1, remap(f, [78, 93], [0, 1])),
    Math.min(1, remap(f, [86, 101], [0, 1])),
  ];
  const chipY = [
    remap(f, [70, 85], [16, 0]),
    remap(f, [78, 93], [16, 0]),
    remap(f, [86, 101], [16, 0]),
  ];

  // Divider
  const divOp = Math.min(1, remap(f, [98, 118], [0, 1]));

  // "NHẬN NHÀ CUỐI 2027" badge
  const badgeOp  = Math.min(1, remap(f, [108, 130], [0, 1]));
  const badgeSc  = f < 108 ? 0.75 : bounceAt(f, 130);
  const badgeShX = f > 120 ? ((f - 120) % 55) / 55 * 700 - 100 : -200;

  // CTA
  const ctaOp = Math.min(1, remap(f, [134, 157], [0, 1]));
  const ctaY  = remap(f, [134, 157], [16, 0]);

  const CHIPS = [
    { icon: "📋", label: "ĐỢT 1", sub: "Ký HĐMB" },
    { icon: "📅", label: "ĐỢT 2–20", sub: "6 Triệu/đợt" },
    { icon: "🏠", label: "BÀN GIAO", sub: "Cuối 2027" },
  ];

  return (
    <AbsoluteFill style={{ background: BG, opacity: fadeIn }}>
      {/* BG */}
      <AbsoluteFill style={{ transform: `scale(${bgZoom})`, transformOrigin: "center" }}>
        <Img src={staticFile("images/fenica-pool.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.42 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{
        background: `linear-gradient(180deg, rgba(13,17,23,0.55) 0%, rgba(13,17,23,0.18) 28%, rgba(13,17,23,0.82) 68%, ${BG} 100%)`,
      }} />

      {/* THANH TOÁN SIÊU NHẸ NHÀNG */}
      <div style={{
        position: "absolute", top: 222, left: 0, right: 0, textAlign: "center",
        opacity: h1Op, transform: `translateY(${h1Y}px)`,
        fontFamily: FONTS.body, fontSize: 28, fontWeight: 700,
        color: DIM, letterSpacing: 4,
      }}>THANH TOÁN SIÊU NHẸ NHÀNG</div>

      {/* 6 + TRIỆU */}
      <div style={{
        position: "absolute", top: 298, left: 0, right: 0,
        display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 12,
      }}>
        <div style={{ position: "relative", overflow: "hidden", lineHeight: 1 }}>
          <span style={{
            ...goldGrad,
            fontFamily: FONT_MONT, fontSize: 170, fontWeight: 900, lineHeight: 1,
            display: "inline-block", transform: `scale(${countSc})`,
            filter: "drop-shadow(0 3px 20px rgba(0,0,0,0.80))",
          }}>{countVal}</span>
          <div style={{
            position: "absolute", top: "-5%", bottom: "-5%",
            left: shimmerX, width: 60,
            background: "linear-gradient(105deg, transparent, rgba(255,255,255,0.22), transparent)",
            pointerEvents: "none",
          }} />
        </div>
        <div style={{
          paddingBottom: 22, opacity: unitOp,
          fontFamily: FONTS.body, fontSize: 44, fontWeight: 700, color: WHITE,
        }}>TRIỆU</div>
      </div>

      {/* MỖI ĐỢT */}
      <div style={{
        position: "absolute", top: 520, left: 0, right: 0, textAlign: "center",
        opacity: subOp,
        fontFamily: FONTS.body, fontSize: 29, fontWeight: 600,
        color: DIM, letterSpacing: 3,
      }}>MỖI ĐỢT · GÓP ĐỀU 30 NGÀY/ĐỢT</div>

      {/* 3 chips */}
      <div style={{
        position: "absolute", top: 614, left: 52, right: 52,
        display: "flex", gap: 14,
      }}>
        {CHIPS.map((c, i) => (
          <div key={i} style={{
            flex: 1, borderRadius: 14,
            border: `1.5px solid rgba(201,162,39,0.38)`,
            background: "rgba(201,162,39,0.09)",
            padding: "20px 10px", textAlign: "center",
            opacity: chip[i], transform: `translateY(${chipY[i]}px)`,
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
            <div style={{
              fontFamily: FONTS.body, fontSize: 17, fontWeight: 800,
              color: GOLD, letterSpacing: 1,
            }}>{c.label}</div>
            <div style={{
              fontFamily: FONTS.body, fontSize: 15, fontWeight: 600,
              color: WHITE, marginTop: 5, opacity: 0.70,
            }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{
        position: "absolute", top: 815, left: 80, right: 80, height: 1,
        background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
        opacity: divOp,
      }} />

      {/* NHẬN NHÀ CUỐI 2027 */}
      <div style={{
        position: "absolute", top: 852, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: badgeOp, transform: `scale(${badgeSc})`,
      }}>
        <div style={{
          position: "relative", overflow: "hidden",
          background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`,
          borderRadius: 100, padding: "22px 52px",
          fontFamily: FONTS.display, fontSize: 36, fontWeight: 900,
          color: "#0D1117", letterSpacing: 2,
          boxShadow: `0 4px 24px rgba(201,162,39,0.50)`,
        }}>
          NHẬN NHÀ CUỐI 2027
          <div style={{
            position: "absolute", top: 0, bottom: 0,
            left: badgeShX, width: 80,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.48), transparent)",
            pointerEvents: "none",
          }} />
        </div>
      </div>

      {/* CTA */}
      <div style={{
        position: "absolute", top: 1016, left: 60, right: 60, textAlign: "center",
        opacity: ctaOp, transform: `translateY(${ctaY}px)`,
        fontFamily: FONTS.body, fontSize: 26, fontWeight: 600,
        color: DIM, lineHeight: 1.6,
      }}>
        Liên hệ ngay để nhận<br />
        <span style={{ color: WHITE, fontWeight: 700 }}>bảng giá &amp; chính sách ưu đãi</span>
      </div>
    </AbsoluteFill>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────
export const FenicaPrice: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Scene 1: 0–200f */}
      <Sequence from={0} durationInFrames={200}>
        <PriceScene />
      </Sequence>
      {/* Scene 2: 183–378f (17f crossfade with Scene 1) */}
      <Sequence from={183} durationInFrames={195}>
        <PaymentScene />
      </Sequence>
      {/* Scene 3: 362–540f (16f crossfade with Scene 2) */}
      <Sequence from={362} durationInFrames={178}>
        <MonthlyScene />
      </Sequence>
    </AbsoluteFill>
  );
};
