import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { EASE, FONTS, remap } from "../design/tokens";

export const FENICA_SPECS_FRAMES = 490; // 16.3s @ 30fps

// ─── Background helper ────────────────────────────────────────────────────────
const SceneBg: React.FC<{
  src: string;
  overlay?: string;
  position?: string;
}> = ({ src, overlay = "rgba(8,12,22,0.62)", position = "center" }) => (
  <>
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute", top: 0, left: 0,
        width: "100%", height: "100%",
        objectFit: "cover", objectPosition: position,
      }}
    />
    {overlay && <div style={{ position: "absolute", inset: 0, background: overlay }} />}
  </>
);

// ─── Bounce helper ────────────────────────────────────────────────────────────
function bounceAt(f: number, triggerF: number): number {
  if (f < triggerF) return 1;
  const t = f - triggerF;
  if (t <= 8)  return 1 + remap(t, [0, 8],  [0, 0.20]);
  if (t <= 20) return 1 + remap(t, [8, 20], [0.20, 0]);
  return 1;
}

// ─── Scene 1: Stats + Room cards (0-175f / 0-5.8s) ──────────────────────────
const StatsScene: React.FC = () => {
  const f = useCurrentFrame();

  const zoom     = 1 + remap(f, [0, 170], [0, 0.10]);
  const headerOp = remap(f, [0, 18], [0, 1]);
  const headerY  = remap(f, [0, 18], [-40, 0], EASE.out);
  const statsOp  = remap(f, [14, 32], [0, 1]);

  // Counters
  const block = Math.min(2,   Math.round(remap(f, [16, 44],  [0, 2])));
  const floor = Math.min(22,  Math.round(remap(f, [22, 58],  [0, 22])));
  const units = Math.min(579, Math.round(remap(f, [28, 75],  [0, 579])));

  // B — Bounce pop when each counter hits max
  const blockSc = bounceAt(f, 44);
  const floorSc = bounceAt(f, 58);
  const unitsSc = bounceAt(f, 75);

  // A — Light sweep on stat boxes, staggered (fires once after counters done)
  const sweep0 = remap(f, [78,  96],  [-90, 400]);
  const sweep1 = remap(f, [83,  101], [-90, 400]);
  const sweep2 = remap(f, [88,  106], [-90, 400]);

  // E — Badge shimmer: loops every 52 frames after badge appears
  const shimmerX = f > 22 ? ((f - 22) % 52) / 52 * 480 - 90 : -200;

  const STATS = [
    { val: block, label: "BLOCK",  scale: blockSc, sweep: sweep0 },
    { val: floor, label: "TẦNG",   scale: floorSc, sweep: sweep1 },
    { val: units, label: "CĂN HỘ", scale: unitsSc, sweep: sweep2 },
  ];

  const ROOM_TYPES = [
    { img: "images/fenica-room-1pn.jpg", label: "1 PHÒNG NGỦ", area: "43 – 50 m²" },
    { img: "images/fenica-bedroom.jpg",  label: "2 PHÒNG NGỦ", area: "66 m²"      },
    { img: "images/fenica-room-3pn.jpg", label: "3 PHÒNG NGỦ", area: "99 m²"      },
  ];

  const taglineOp = remap(f, [110, 128], [0, 1]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Ken Burns — BG only */}
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "center 55%" }}>
        <SceneBg src="images/fenica-aerial-day.jpg" overlay="rgba(8,12,24,0.58)" position="center 55%" />
      </AbsoluteFill>

      {/* E — Badge with shimmer loop — y≈380 */}
      <div style={{
        position: "absolute", top: 380, left: 0, right: 0,
        textAlign: "center", opacity: headerOp,
        transform: `translateY(${headerY}px)`,
      }}>
        <div style={{
          display: "inline-block", position: "relative", overflow: "hidden",
          background: "linear-gradient(90deg, #C9A227, #E8C547)",
          borderRadius: 100, padding: "14px 52px",
          fontFamily: FONTS.body, fontSize: 30, fontWeight: 900,
          color: "#0D1117", letterSpacing: 2,
        }}>
          FENICA DĨ AN
          <div style={{
            position: "absolute", top: 0, bottom: 0,
            left: shimmerX, width: 80,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.52), transparent)",
            pointerEvents: "none",
          }} />
        </div>
      </div>

      {/* A+B — Stat boxes with sweep + bounce — y≈550 */}
      <div style={{
        position: "absolute",
        top: 550, left: 44, right: 44,
        display: "flex", gap: 18,
        opacity: statsOp,
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            flex: 1, textAlign: "center",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(201,162,39,0.40)",
            borderRadius: 24, padding: "28px 8px",
            backdropFilter: "blur(8px)",
            overflow: "hidden", position: "relative",
          }}>
            {/* B — number with bounce scale */}
            <div style={{
              fontFamily: FONTS.display, fontSize: 88, fontWeight: 900,
              color: "#C9A227", lineHeight: 1,
              textShadow: "0 0 40px rgba(201,162,39,0.45)",
              transform: `scale(${s.scale})`,
              display: "inline-block",
            }}>{s.val}</div>
            <div style={{
              fontFamily: FONTS.body, fontSize: 22, fontWeight: 700,
              color: "#8B949E", marginTop: 10, letterSpacing: 2,
            }}>{s.label}</div>
            {/* A — diagonal light sweep */}
            <div style={{
              position: "absolute", top: "-10%", bottom: "-10%",
              left: s.sweep, width: 55,
              background: "linear-gradient(105deg, transparent, rgba(255,255,255,0.20), transparent)",
              pointerEvents: "none",
            }} />
          </div>
        ))}
      </div>

      {/* Room-type photo cards — y≈838 */}
      <div style={{
        position: "absolute",
        top: 838, left: 44, right: 44,
        display: "flex", gap: 16,
      }}>
        {ROOM_TYPES.map((rt, i) => {
          const d  = i * 18;
          const op = remap(f, [78 + d, 96 + d], [0, 1]);
          const ty = remap(f, [78 + d, 96 + d], [24, 0], EASE.out);
          return (
            <div key={i} style={{
              flex: 1, height: 310,
              borderRadius: 18, overflow: "hidden",
              position: "relative",
              opacity: op, transform: `translateY(${ty}px)`,
            }}>
              <Img
                src={staticFile(rt.img)}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.84) 100%)",
              }} />
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: "#C9A227",
              }} />
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "0 12px 14px", textAlign: "center",
              }}>
                <div style={{
                  fontFamily: FONTS.body, fontSize: 18, fontWeight: 800,
                  color: "#FFFFFF", letterSpacing: 0.5,
                }}>{rt.label}</div>
                <div style={{
                  fontFamily: FONTS.body, fontSize: 15,
                  color: "#C9A227", marginTop: 3, fontWeight: 600,
                }}>{rt.area}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tagline — y≈1200 */}
      <div style={{
        position: "absolute", top: 1200, left: 0, right: 0,
        textAlign: "center", opacity: taglineOp,
      }}>
        <div style={{
          fontFamily: FONTS.body, fontSize: 34, color: "#FFFFFF", fontWeight: 500,
        }}>
          Thiết kế tối ưu cho{" "}
          <span style={{ color: "#C9A227", fontWeight: 800 }}>gia đình trẻ</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Photo grid 2+2+1 (125-310f / 4.2-10.3s) ───────────────────────
// Layout: header y=180, grid y=300, card H=330, grid H=330×3+18×2=1026, grid end=1326
// Center: (180+1326)/2 = 753 → acceptable (main weight in upper-center, consistent with TikTok feel)
const AmenitiesScene: React.FC = () => {
  const f = useCurrentFrame();

  const AMENITIES = [
    { icon: "🏊", label: "Hồ bơi vô cực",     sub: "Sky pool tầng cao",       img: "images/fenica-pool.jpg"      },
    { icon: "🌳", label: "Công viên cảnh quan", sub: "Không gian xanh nội khu", img: "images/fenica-landscape.jpg" },
    { icon: "🔥", label: "Khu BBQ nướng",       sub: "Trải nghiệm ngoài trời",  img: "images/fenica-pool2.jpg"     },
    { icon: "👶", label: "Nhà trẻ & Kid Zone",  sub: "An toàn cho bé yêu",      img: "images/fenica-kidzone.jpg"   },
    { icon: "🏪", label: "Khối đế thương mại",  sub: "Tiện ích sầm uất 24/7",   img: "images/fenica-shophouse.jpg" },
  ];

  const CARD_H = 330;
  const GAP    = 18;
  const PAD    = 44;

  const headerOp = remap(f, [0, 18], [0, 1]);
  const headerY  = remap(f, [0, 18], [-28, 0], EASE.out);

  // Rows stagger in
  const row1Op = remap(f, [15, 33], [0, 1]);
  const row1Y  = remap(f, [15, 33], [32, 0], EASE.out);
  const row2Op = remap(f, [40, 58], [0, 1]);
  const row2Y  = remap(f, [40, 58], [32, 0], EASE.out);
  const row3Op = remap(f, [65, 83], [0, 1]);
  const row3Y  = remap(f, [65, 83], [32, 0], EASE.out);

  const rows = [
    { items: [AMENITIES[0], AMENITIES[1]], op: row1Op, ty: row1Y, twoCol: true },
    { items: [AMENITIES[2], AMENITIES[3]], op: row2Op, ty: row2Y, twoCol: true },
    { items: [AMENITIES[4]],               op: row3Op, ty: row3Y, twoCol: false },
  ];

  return (
    <AbsoluteFill>
      {/* Dark BG — keep it behind the grid */}
      <SceneBg src="images/fenica-aerial-day.jpg" overlay="rgba(5,8,18,0.85)" position="center 38%" />

      {/* Header — y≈180 */}
      <div style={{
        position: "absolute", top: 180, left: 0, right: 0,
        textAlign: "center",
        opacity: headerOp, transform: `translateY(${headerY}px)`,
      }}>
        <div style={{
          fontFamily: FONTS.body, fontSize: 22, color: "#8B949E",
          letterSpacing: 4, marginBottom: 10,
        }}>TIỆN ÍCH NỘI KHU</div>
        <div style={{
          fontFamily: FONTS.body, fontSize: 38, fontWeight: 800, color: "#FFFFFF",
        }}>Bước xuống là trọn bộ</div>
      </div>

      {/* Photo grid — starts at y≈310 */}
      <div style={{
        position: "absolute",
        top: 310, left: PAD, right: PAD,
        display: "flex", flexDirection: "column", gap: GAP,
      }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{
            display: "flex", gap: GAP,
            opacity: row.op, transform: `translateY(${row.ty}px)`,
          }}>
            {row.items.map((a, ai) => (
              <div key={ai} style={{
                flex: 1,
                height: CARD_H,
                borderRadius: 20,
                overflow: "hidden",
                position: "relative",
              }}>
                {/* Amenity photo */}
                <Img
                  src={staticFile(a.img)}
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover", objectPosition: "center",
                  }}
                />
                {/* Bottom gradient for text legibility */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.82) 100%)",
                }} />
                {/* Gold top accent bar */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0,
                  height: 3,
                  background: "linear-gradient(90deg, #C9A227, transparent)",
                }} />
                {/* Icon + label */}
                <div style={{
                  position: "absolute", bottom: 18, left: 20,
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{ fontSize: 36, lineHeight: 1 }}>{a.icon}</div>
                  <div>
                    <div style={{
                      fontFamily: FONTS.body, fontSize: row.twoCol ? 22 : 26,
                      fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2,
                    }}>{a.label}</div>
                    <div style={{
                      fontFamily: FONTS.body, fontSize: row.twoCol ? 16 : 19,
                      color: "#B0BEC5", marginTop: 3,
                    }}>{a.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Tagline (300-450f / 10-15s) ────────────────────────────────────
// Content: y=380 to y=1460, center≈920 → well-centered
const TaglineScene: React.FC = () => {
  const f = useCurrentFrame();

  const bgOp    = remap(f, [0, 22], [0, 1]);
  const line1Op = remap(f, [12, 28], [0, 1]);
  const line1Y  = remap(f, [12, 28], [40, 0], EASE.out);
  const line2Op = remap(f, [26, 46], [0, 1]);
  const line2Y  = remap(f, [26, 46], [40, 0], EASE.out);
  const divW    = remap(f, [50, 88], [0, 580], EASE.out);
  const subOp   = remap(f, [58, 78], [0, 1]);
  const badgeOp = remap(f, [84, 108], [0, 1]);
  const badgeSc = remap(f, [84, 108], [0.82, 1], EASE.out);

  return (
    <AbsoluteFill>
      <div style={{ opacity: bgOp, position: "absolute", inset: 0 }}>
        <SceneBg src="images/fenica-living.jpg" overlay="rgba(8,12,22,0.68)" position="center 38%" />
      </div>

      {/* Main tagline — y≈360 */}
      <div style={{
        position: "absolute", top: 360, left: 0, right: 0,
        textAlign: "center",
      }}>
        <div style={{
          opacity: line1Op, transform: `translateY(${line1Y}px)`,
          fontFamily: FONTS.body, fontSize: 40, fontWeight: 600,
          color: "#B0BEC5", letterSpacing: 4, marginBottom: 20,
        }}>DÀNH CHO</div>
        <div style={{
          opacity: line2Op, transform: `translateY(${line2Y}px)`,
          fontFamily: FONTS.display, fontSize: 120, fontWeight: 900,
          color: "#C9A227", lineHeight: 1.0,
          textShadow: "0 0 60px rgba(201,162,39,0.42)",
        }}>GIA ĐÌNH<br />TRẺ</div>
      </div>

      {/* Gold divider — y≈860 */}
      <div style={{
        position: "absolute", top: 870, left: "50%",
        transform: "translateX(-50%)",
        height: 3, width: divW,
        background: "linear-gradient(90deg, transparent, #C9A227, transparent)",
        borderRadius: 2,
      }} />

      {/* Sub text — y≈920 */}
      <div style={{
        position: "absolute", top: 920, left: 60, right: 60,
        textAlign: "center", opacity: subOp,
      }}>
        <div style={{
          fontFamily: FONTS.body, fontSize: 32, color: "#FFFFFF",
          lineHeight: 1.7,
        }}>
          Bước xuống là trọn bộ tiện ích
        </div>
        <div style={{
          fontFamily: FONTS.body, fontSize: 26, color: "#8B949E",
          marginTop: 14, letterSpacing: 1,
        }}>
          2 Block · 22 Tầng · 579 Căn hộ
        </div>
      </div>

      {/* Brand badge — y≈1350 */}
      <div style={{
        position: "absolute", top: 1350, left: 0, right: 0,
        textAlign: "center",
        opacity: badgeOp, transform: `scale(${badgeSc})`,
      }}>
        <div style={{
          display: "inline-block",
          background: "rgba(201,162,39,0.14)",
          border: "2px solid #C9A227",
          borderRadius: 100, padding: "16px 60px",
          fontFamily: FONTS.body, fontSize: 30, fontWeight: 900,
          color: "#E8C547", letterSpacing: 2,
        }}>FENICA DĨ AN</div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────
export const FenicaSpecs: React.FC = () => (
  <AbsoluteFill style={{ background: "#0D1117" }}>
    <Sequence from={0}   durationInFrames={175}><StatsScene /></Sequence>
    <Sequence from={158} durationInFrames={190}><AmenitiesScene /></Sequence>
    <Sequence from={332} durationInFrames={158}><TaglineScene /></Sequence>
  </AbsoluteFill>
);
