import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { EASE, FONTS, remap } from "../design/tokens";

// ─── Scene boundaries (global frames @ 30 fps) ───────────────────────────────
const S = {
  hook: { from: 0,    dur: 221 },
  prob: { from: 221,  dur: 342 },
  pa1:  { from: 563,  dur: 323 },
  pa2:  { from: 886,  dur: 292 },
  cred: { from: 1178, dur: 336 },
  cta:  { from: 1514, dur: 241 },
} as const;

export const FENICA_TOTAL_FRAMES = 1755;

// ─── Subtitles (global frames) ────────────────────────────────────────────────
const SUBS = [
  { t: "Mỗi tháng bay mất 6 triệu tiền thuê nhà thì tiếc...",               s: 0,    e: 67   },
  { t: "Dùng 6 triệu đó sở hữu căn hộ sát Thủ Đức — chốt ngay!",           s: 76,   e: 221  },
  { t: "Rất nhiều người muốn mua nhà nhưng ngại thủ tục ngân hàng rườm rà,", s: 221,  e: 274  },
  { t: "sợ lãi suất thả nổi. Nắm được tâm lý đó,",                          s: 275,  e: 364  },
  { t: "Fenica Dĩ An tung ra 2 phương án thanh toán trực tiếp, cực kỳ an toàn,", s: 366, e: 427 },
  { t: "tổng giá chỉ từ... MỘT TỶ SÁU!",                                    s: 429,  e: 563  },
  { t: "Phương án 1: Trả góp siêu nhẹ nhàng! Đóng đợt đầu xong,",          s: 563,  e: 635  },
  { t: "mỗi tháng chỉ cần bỏ lợn đúng 6 triệu — y như tiền thuê trọ.",     s: 637,  e: 792  },
  { t: "Cứ thế thong thả thanh toán rải đều theo tiến độ xây dựng.",        s: 794,  e: 886  },
  { t: "Phương án 2: Trả 30% nhận nhà!",                                    s: 886,  e: 953  },
  { t: "Chỉ cần đóng đúng 30% giá trị căn hộ... rồi — NGƯNG HOÀN TOÀN!",  s: 955,  e: 1046 },
  { t: "Chủ đầu tư cất nóc, hoàn thiện, trao tận tay chìa khóa — mới đóng tiếp.", s: 1048, e: 1178 },
  { t: "Không áp lực tài chính, không lo lãi suất!",                        s: 1178, e: 1244 },
  { t: "Căn hộ 4 mặt tiền sát Vành đai 3, thi công bởi PTCONS, vận hành bởi CBRE.", s: 1246, e: 1421 },
  { t: "Pháp lý minh bạch, tiến độ xây dựng đang lên tầng ầm ầm!",         s: 1423, e: 1514 },
  { t: "Bài toán quá đẹp cho người mua ở thực!",                            s: 1514, e: 1622 },
  { t: "Nhấp ngay vào link bên dưới — nhận bảng tính dòng tiền 6 triệu/tháng!", s: 1624, e: 1748 },
];

// ─── Subtitle overlay ─────────────────────────────────────────────────────────
const SubtitleOverlay: React.FC<{ frame: number }> = ({ frame }) => {
  const sub = SUBS.find((s) => frame >= s.s && frame <= s.e);
  if (!sub) return null;
  const opacity = interpolate(frame, [sub.s, sub.s + 5], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", bottom: 260, left: 50, right: 50,
      textAlign: "center", opacity, pointerEvents: "none",
    }}>
      <div style={{
        background: "rgba(0,0,0,0.78)", borderRadius: 14,
        padding: "12px 24px", display: "inline-block", maxWidth: "100%",
      }}>
        <span style={{
          fontFamily: FONTS.body, fontSize: 33, fontWeight: 600,
          color: "#FFFFFF", lineHeight: 1.45,
        }}>{sub.t}</span>
      </div>
    </div>
  );
};

// ─── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{
    position: "absolute", bottom: 0, left: 0,
    height: 5, width: `${(frame / FENICA_TOTAL_FRAMES) * 100}%`,
    background: "linear-gradient(90deg, #C9A227, #E8C547)",
    borderRadius: "0 3px 0 0",
  }} />
);

// ─── Background image helper ──────────────────────────────────────────────────
const SceneBg: React.FC<{
  src: string;
  overlay?: string;
  position?: string;
}> = ({ src, overlay = "rgba(13,17,23,0.60)", position = "center" }) => (
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

// ─── Scene 1: Hook — Split Screen ─────────────────────────────────────────────
const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const divH      = remap(f, [0, 14], [0, 100], EASE.out);
  const leftX     = remap(f, [5, 22], [-550, 0], EASE.out);
  const rightX    = remap(f, [10, 27], [550, 0], EASE.out);
  const contentOp = remap(f, [28, 50], [0, 1]);
  const bannerOp  = remap(f, [42, 64], [0, 1]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Aerial day photo — full bleed */}
      <SceneBg src="images/fenica-aerial-day.jpg" overlay="" position="center 55%" />

      {/* Left panel — red tint over photo */}
      <div style={{
        position: "absolute", left: 0, top: 0, width: "50%", height: "100%",
        background: "rgba(88,10,10,0.82)",
        transform: `translateX(${leftX}px)`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ opacity: contentOp, textAlign: "center", padding: "0 36px" }}>
          <div style={{ fontSize: 108, lineHeight: 1, marginBottom: 20 }}>💸</div>
          <div style={{ fontFamily: FONTS.body, fontSize: 46, fontWeight: 900, color: "#FF6B6B", letterSpacing: -1 }}>
            6.000.000đ
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 22, color: "#FF9999", marginTop: 10, fontWeight: 600, letterSpacing: 2 }}>
            TIỀN THUÊ / THÁNG
          </div>
          <div style={{
            fontFamily: FONTS.body, fontSize: 34, fontWeight: 900, color: "#E03434",
            marginTop: 24, background: "rgba(224,52,52,0.22)", borderRadius: 14, padding: "10px 24px",
          }}>
            BAY MẤT 🚀
          </div>
        </div>
      </div>

      {/* Gold divider */}
      <div style={{
        position: "absolute", left: "calc(50% - 3px)", top: 0,
        width: 6, height: `${divH}%`,
        background: "linear-gradient(180deg, #C9A227, #E8C547)",
        boxShadow: "0 0 20px rgba(201,162,39,0.7)",
      }} />

      {/* Right panel — green tint over photo */}
      <div style={{
        position: "absolute", left: "50%", top: 0, width: "50%", height: "100%",
        background: "rgba(10,70,22,0.82)",
        transform: `translateX(${rightX}px)`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ opacity: contentOp, textAlign: "center", padding: "0 36px" }}>
          <div style={{ fontSize: 108, lineHeight: 1, marginBottom: 20 }}>🔑</div>
          <div style={{ fontFamily: FONTS.body, fontSize: 46, fontWeight: 900, color: "#C9A227", letterSpacing: -1 }}>
            6.000.000đ
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 22, color: "#90D4A0", marginTop: 10, fontWeight: 600, letterSpacing: 2 }}>
            HÀNG THÁNG
          </div>
          <div style={{
            fontFamily: FONTS.body, fontSize: 34, fontWeight: 900, color: "#3DD68C",
            marginTop: 24, background: "rgba(61,214,140,0.22)", borderRadius: 14, padding: "10px 24px",
          }}>
            SỞ HỮU 🏠
          </div>
        </div>
      </div>

      {/* Top banner */}
      <div style={{
        position: "absolute", top: 72, left: 0, right: 0,
        textAlign: "center", opacity: bannerOp,
      }}>
        <div style={{
          display: "inline-block", background: "#C9A227", borderRadius: 100,
          padding: "10px 32px",
          fontFamily: FONTS.body, fontSize: 22, fontWeight: 800,
          color: "#0D1117", letterSpacing: 0.5,
        }}>
          ĐÓNG TIỀN THUÊ • hay • ĐÓNG TIỀN NHÀ MÌNH?
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Problem — Card flip ─────────────────────────────────────────────
const ProblemScene: React.FC = () => {
  const f = useCurrentFrame();

  const c1RotY  = remap(f, [80, 108], [0, 90], EASE.inOut);
  const c1Op    = remap(f, [95,  110], [1, 0]);
  const c2RotY  = remap(f, [90, 128], [90, 0], EASE.out);
  const c2Op    = remap(f, [90,  115], [0, 1]);
  const c2Scale = remap(f, [90,  140], [0.85, 1], EASE.out);

  const priceOp  = remap(f, [145, 165], [0, 1]);
  const priceVal = Math.round(remap(f, [150, 252], [0, 1600000000]));
  const tagOp    = remap(f, [200, 230], [0, 1]);
  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  return (
    <AbsoluteFill>
      {/* Living room photo */}
      <SceneBg src="images/fenica-living.jpg" overlay="rgba(8,14,28,0.65)" position="center 40%" />

      {/* Price — top */}
      <div style={{
        position: "absolute", top: 100, left: 0, right: 0,
        textAlign: "center", opacity: priceOp,
      }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 24, color: "#8B949E", letterSpacing: 3, marginBottom: 8 }}>
          TỔNG GIÁ TỪ
        </div>
        <div style={{
          fontFamily: FONTS.display, fontSize: 76, fontWeight: 900,
          color: "#C9A227", letterSpacing: -2,
          textShadow: "0 0 50px rgba(201,162,39,0.5)",
        }}>
          {f >= 150 ? fmt(priceVal) : ""}
        </div>
      </div>

      {/* Card 1 — fear */}
      {f < 115 && (
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: `translate(-50%, -50%) perspective(1200px) rotateY(${c1RotY}deg)`,
          width: 900, borderRadius: 36,
          background: "linear-gradient(135deg, rgba(42,8,8,0.92) 0%, rgba(22,4,4,0.92) 100%)",
          border: "3px solid #E03434",
          padding: "64px 72px", textAlign: "center",
          opacity: c1Op,
          boxShadow: "0 30px 80px rgba(224,52,52,0.35)",
          backdropFilter: "blur(4px)",
        }}>
          <div style={{ fontSize: 80 }}>😰</div>
          <div style={{ fontFamily: FONTS.body, fontSize: 54, fontWeight: 900, color: "#FF6B6B", marginTop: 20, lineHeight: 1.2 }}>
            SỢ VAY NGÂN HÀNG?
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 28, color: "#FF9999", marginTop: 20, lineHeight: 1.6 }}>
            Thủ tục rườm rà · Lãi suất thả nổi<br />Áp lực tài chính hàng tháng
          </div>
        </div>
      )}

      {/* Card 2 — solution */}
      {f >= 85 && (
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: `translate(-50%, -50%) perspective(1200px) rotateY(${c2RotY}deg) scale(${c2Scale})`,
          width: 900, borderRadius: 36,
          background: "linear-gradient(135deg, rgba(10,31,45,0.92) 0%, rgba(5,16,24,0.92) 100%)",
          border: "3px solid #C9A227",
          padding: "64px 72px", textAlign: "center",
          opacity: c2Op,
          boxShadow: "0 30px 80px rgba(201,162,39,0.30)",
          backdropFilter: "blur(4px)",
        }}>
          <div style={{ fontSize: 80 }}>✅</div>
          <div style={{ fontFamily: FONTS.body, fontSize: 52, fontWeight: 900, color: "#C9A227", marginTop: 20, lineHeight: 1.2 }}>
            FENICA DĨ AN
          </div>
          <div style={{
            fontFamily: FONTS.body, fontSize: 38, fontWeight: 800, color: "#3DD68C", marginTop: 16,
            background: "rgba(61,214,140,0.15)", borderRadius: 14, padding: "8px 28px",
          }}>
            KHÔNG CẦN NGÂN HÀNG!
          </div>
        </div>
      )}

      {/* Tagline — bottom */}
      <div style={{
        position: "absolute", bottom: 200, left: 60, right: 60,
        textAlign: "center", opacity: tagOp,
      }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 30, color: "#F0EAD6", lineHeight: 1.6 }}>
          2 phương án thanh toán trực tiếp
        </div>
        <div style={{ fontFamily: FONTS.body, fontSize: 26, color: "#8B949E", marginTop: 8 }}>
          An toàn · Không lãi suất · Linh hoạt
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: PA1 — Calendar ──────────────────────────────────────────────────
const PA1Scene: React.FC = () => {
  const f = useCurrentFrame();
  const bgIn    = remap(f, [0, 16], [0, 1]);
  const titleY  = remap(f, [6, 24], [-80, 0], EASE.out);
  const titleOp = remap(f, [6, 24], [0, 1]);

  const cellFill = (i: number) => remap(f, [40 + i * 11, 52 + i * 11], [0, 1]);

  const summaryOp = remap(f, [210, 240], [0, 1]);
  const emojiOp   = remap(f, [245, 275], [0, 1]);

  return (
    <AbsoluteFill>
      {/* Real showroom photo */}
      <div style={{ opacity: bgIn, position: "absolute", inset: 0 }}>
        <SceneBg src="images/fenica-showroom.jpg" overlay="rgba(8,14,28,0.62)" position="center 40%" />
      </div>

      {/* Title */}
      <div style={{
        position: "absolute", top: 72, left: 0, right: 0,
        textAlign: "center",
        transform: `translateY(${titleY}px)`, opacity: titleOp,
      }}>
        <div style={{
          display: "inline-block", background: "#1A3D5C", borderRadius: 100,
          padding: "14px 52px",
          fontFamily: FONTS.body, fontSize: 30, fontWeight: 900,
          color: "#FFFFFF", letterSpacing: 1,
        }}>PHƯƠNG ÁN 1 — TRẢ GÓP</div>
      </div>

      {/* Calendar grid */}
      <div style={{
        position: "absolute", top: 200, left: 60, right: 60,
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18,
      }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const fill = cellFill(i);
          return (
            <div key={i} style={{
              height: 130, borderRadius: 22,
              border: `3px solid ${fill > 0 ? "rgba(201,162,39,0.7)" : "rgba(255,255,255,0.18)"}`,
              background: fill > 0 ? `rgba(201,162,39,${Math.min(fill, 1) * 0.88})` : "rgba(255,255,255,0.06)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}>
              {fill > 0.4 && (
                <>
                  <div style={{ fontFamily: FONTS.body, fontSize: 18, fontWeight: 600, color: "#0D1117" }}>
                    T.{i + 1}
                  </div>
                  <div style={{ fontFamily: FONTS.body, fontSize: 22, fontWeight: 900, color: "#0D1117" }}>
                    6tr
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{
        position: "absolute", top: 700, left: 0, right: 0,
        textAlign: "center", opacity: summaryOp,
      }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 30, fontWeight: 900, color: "#FFFFFF" }}>
          Mỗi tháng bỏ lợn
        </div>
        <div style={{ fontFamily: FONTS.display, fontSize: 84, fontWeight: 900, color: "#C9A227", letterSpacing: -2 }}>
          6.000.000đ
        </div>
        <div style={{ fontFamily: FONTS.body, fontSize: 26, color: "#B0BEC5", marginTop: 6 }}>
          = Đúng bằng tiền thuê trọ
        </div>
      </div>

      {/* Emoji */}
      <div style={{
        position: "absolute", top: 980, left: 0, right: 0,
        textAlign: "center", opacity: emojiOp, fontSize: 72,
      }}>
        🐷 → 🏠
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: PA2 — Progress bar + STOP ───────────────────────────────────────
const PA2Scene: React.FC = () => {
  const f = useCurrentFrame();

  const titleOp  = remap(f, [0, 20], [0, 1]);
  const barW     = remap(f, [20, 100], [0, 30], EASE.inOut);
  const labelsOp = remap(f, [25, 50], [0, 1]);
  const stopSc   = remap(f, [105, 128], [0, 1], EASE.spring);
  const stopOp   = remap(f, [105, 120], [0, 1]);
  const keyOp    = remap(f, [200, 230], [0, 1]);

  return (
    <AbsoluteFill>
      {/* Bedroom photo */}
      <SceneBg src="images/fenica-bedroom.jpg" overlay="rgba(8,14,28,0.68)" position="center 35%" />

      {/* Title */}
      <div style={{ position: "absolute", top: 92, left: 0, right: 0, textAlign: "center", opacity: titleOp }}>
        <div style={{
          display: "inline-block", background: "#C9A227", borderRadius: 100,
          padding: "12px 48px",
          fontFamily: FONTS.body, fontSize: 30, fontWeight: 900,
          color: "#0D1117", letterSpacing: 1,
        }}>PHƯƠNG ÁN 2 — NGƯNG Ở 30%</div>
      </div>

      {/* Progress bar */}
      <div style={{ position: "absolute", top: 430, left: 64, right: 64 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, opacity: labelsOp }}>
          <span style={{ fontFamily: FONTS.body, fontSize: 24, color: "#8B949E" }}>Ký HĐ</span>
          <span style={{ fontFamily: FONTS.body, fontSize: 24, color: "#C9A227", fontWeight: 800 }}>30% 🛑</span>
          <span style={{ fontFamily: FONTS.body, fontSize: 24, color: "#3DD68C" }}>Nhận nhà</span>
        </div>
        <div style={{
          width: "100%", height: 42, borderRadius: 21,
          background: "rgba(255,255,255,0.07)",
          border: "2px solid rgba(255,255,255,0.12)",
          overflow: "hidden", position: "relative",
        }}>
          <div style={{
            width: `${barW}%`, height: "100%",
            background: "linear-gradient(90deg, #C9A227, #E8C547)",
            borderRadius: 21, boxShadow: "0 0 24px rgba(201,162,39,0.6)",
          }} />
          <div style={{ position: "absolute", left: "30%", top: 0, bottom: 0, width: 3, background: "#FFFFFF88" }} />
        </div>
        <div style={{ marginTop: 10, marginLeft: "31%", fontFamily: FONTS.body, fontSize: 20, color: "#484F58", opacity: labelsOp }}>
          - - - chủ đầu tư lo tiếp - - -
        </div>
      </div>

      {/* STOP card */}
      {f >= 100 && (
        <div style={{
          position: "absolute", top: 680, left: 60, right: 60,
          borderRadius: 36,
          background: "rgba(42,8,8,0.90)",
          border: "4px solid #E03434",
          padding: "52px 64px", textAlign: "center",
          transform: `scale(${stopSc})`,
          opacity: stopOp,
          boxShadow: "0 40px 100px rgba(224,52,52,0.5)",
          backdropFilter: "blur(6px)",
        }}>
          <div style={{ fontSize: 88, lineHeight: 1 }}>🛑</div>
          <div style={{ fontFamily: FONTS.body, fontSize: 60, fontWeight: 900, color: "#FF4444", marginTop: 16, letterSpacing: -1 }}>
            NGƯNG HOÀN TOÀN!
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 26, color: "#FF9999", marginTop: 14, lineHeight: 1.6 }}>
            Chủ đầu tư lo toàn bộ cho đến khi<br />anh chị nhận nhà
          </div>
        </div>
      )}

      {/* Key handover */}
      <div style={{
        position: "absolute", bottom: 148, left: 64, right: 64,
        textAlign: "center", opacity: keyOp,
      }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 26, fontWeight: 700, color: "#3DD68C", lineHeight: 1.6 }}>
          🏗️ Cất nóc → Hoàn thiện → 🔑 Nhận nhà → Tiếp tục đóng
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: Credibility ─────────────────────────────────────────────────────
const CredibilityScene: React.FC = () => {
  const f = useCurrentFrame();

  const bgIn     = remap(f, [0, 16], [0, 1]);
  const headerOp = remap(f, [0, 20], [0, 1]);
  const badgesOp = remap(f, [20, 50], [0, 1]);
  const cbreX    = remap(f, [20, 52], [-500, 0], EASE.out);
  const ptcX     = remap(f, [26, 58], [500, 0], EASE.out);
  const fourOp   = remap(f, [65, 95], [0, 1]);
  const fourSc   = remap(f, [65, 95], [0.5, 1], EASE.spring);
  const statsOp  = remap(f, [110, 148], [0, 1]);
  const pulse    = 1 + Math.sin(f * 0.15) * 0.04;

  return (
    <AbsoluteFill>
      {/* Night aerial — highway + tower */}
      <div style={{ opacity: bgIn, position: "absolute", inset: 0 }}>
        <SceneBg src="images/fenica-aerial-night.jpg" overlay="rgba(5,10,20,0.52)" position="center 60%" />
      </div>

      {/* Header */}
      <div style={{ position: "absolute", top: 80, left: 0, right: 0, textAlign: "center", opacity: headerOp }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 26, color: "#8B949E", letterSpacing: 4 }}>
          BẢO CHỨNG ĐẦU TƯ
        </div>
      </div>

      {/* Badges */}
      <div style={{
        position: "absolute", top: 200, left: 60, right: 60,
        display: "flex", gap: 36, opacity: badgesOp,
      }}>
        <div style={{
          transform: `translateX(${cbreX}px)`,
          flex: 1, borderRadius: 28,
          background: "rgba(0,51,102,0.88)",
          border: "2px solid #4A90D9",
          padding: "36px 40px", textAlign: "center",
          boxShadow: "0 20px 60px rgba(74,144,217,0.25)",
          backdropFilter: "blur(6px)",
        }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 60, fontWeight: 900, color: "#FFFFFF" }}>CBRE</div>
          <div style={{ fontFamily: FONTS.body, fontSize: 22, color: "#90B8D8", marginTop: 8 }}>Đơn vị vận hành</div>
        </div>
        <div style={{
          transform: `translateX(${ptcX}px)`,
          flex: 1, borderRadius: 28,
          background: "rgba(20,16,8,0.88)",
          border: "2px solid #C9A227",
          padding: "36px 40px", textAlign: "center",
          boxShadow: "0 20px 60px rgba(201,162,39,0.25)",
          backdropFilter: "blur(6px)",
        }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 56, fontWeight: 900, color: "#C9A227" }}>PTCONS</div>
          <div style={{ fontFamily: FONTS.body, fontSize: 22, color: "#A08030", marginTop: 8 }}>Đơn vị thi công</div>
        </div>
      </div>

      {/* 4 mặt tiền */}
      <div style={{
        position: "absolute", top: 560, left: 0, right: 0,
        textAlign: "center",
        opacity: fourOp, transform: `scale(${fourSc})`,
      }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 92, fontWeight: 900, color: "#C9A227", lineHeight: 1 }}>
          4 MẶT TIỀN
        </div>
        <div style={{ fontFamily: FONTS.body, fontSize: 26, color: "#8B949E", marginTop: 8 }}>
          ↑ ↓ ← → Tiếp giáp 4 tuyến đường lớn
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        position: "absolute", top: 860, left: 60, right: 60,
        display: "flex", gap: 36, opacity: statsOp,
      }}>
        {[
          { val: "VĐ3",  label: "Kề cận Vành Đai 3", p: false },
          { val: "✅",    label: "Pháp lý minh bạch",  p: false },
          { val: "↑↑↑",  label: "Đang lên tầng",       p: true  },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, textAlign: "center",
            background: "rgba(255,255,255,0.06)", borderRadius: 22,
            padding: "24px 16px",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(4px)",
          }}>
            <div style={{
              fontFamily: FONTS.display, fontSize: 44, fontWeight: 900, color: "#C9A227",
              display: "inline-block",
              transform: s.p ? `scale(${pulse})` : undefined,
            }}>{s.val}</div>
            <div style={{ fontFamily: FONTS.body, fontSize: 20, color: "#8B949E", marginTop: 10 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 6: CTA Gold ────────────────────────────────────────────────────────
const CTAScene: React.FC = () => {
  const f = useCurrentFrame();

  const cardSc  = remap(f, [0, 22], [0.4, 1], EASE.spring);
  const cardOp  = remap(f, [0, 16], [0, 1]);
  const textOp  = remap(f, [22, 45], [0, 1]);
  const arrowOp = remap(f, [45, 65], [0, 1]);
  const arrowY  = Math.sin(f * 0.2) * 18;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {/* Pool night — luxury atmosphere */}
      <SceneBg src="images/fenica-pool.jpg" overlay="rgba(5,10,20,0.48)" position="center 40%" />

      <div style={{
        width: 960, borderRadius: 52,
        background: "linear-gradient(135deg, #D4A820 0%, #8A6F1A 100%)",
        padding: "80px 80px", textAlign: "center",
        transform: `scale(${cardSc})`,
        opacity: cardOp,
        boxShadow: "0 50px 140px rgba(201,162,39,0.5)",
      }}>
        <div style={{ opacity: textOp }}>
          <div style={{ fontFamily: FONTS.body, fontSize: 24, fontWeight: 700, color: "#1A0D00", letterSpacing: 1.5, marginBottom: 20 }}>
            BÀI TOÁN QUÁ ĐẸP CHO NGƯỜI MUA Ở THỰC!
          </div>
          <div style={{ fontFamily: FONTS.display, fontSize: 60, fontWeight: 900, color: "#0D1117", lineHeight: 1.2, marginBottom: 28 }}>
            NHẬN BẢNG TÍNH<br />DÒNG TIỀN
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 26, color: "#2D1A00", lineHeight: 1.7, marginBottom: 32 }}>
            6 triệu/tháng · Ưu đãi đợt 1<br />Chi tiết tiến độ thanh toán
          </div>
          <div style={{ opacity: arrowOp, transform: `translateY(${arrowY}px)`, fontSize: 60, marginBottom: 28, lineHeight: 1 }}>↓</div>
          <div style={{
            display: "inline-block", background: "rgba(0,0,0,0.18)", borderRadius: 18,
            padding: "16px 48px",
            fontFamily: FONTS.body, fontSize: 40, fontWeight: 900, color: "#0D1117",
          }}>📞 0906 827 986</div>
          <div style={{ marginTop: 14, fontFamily: FONTS.body, fontSize: 24, color: "#2D1A00", opacity: 0.75 }}>
            batdongsan123.com
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────
export const FenicaReel: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0D1117" }}>
      <Audio src={staticFile("audio/voiceover-fenica.mp3")} />
      <Sequence from={S.hook.from} durationInFrames={S.hook.dur}><HookScene /></Sequence>
      <Sequence from={S.prob.from} durationInFrames={S.prob.dur}><ProblemScene /></Sequence>
      <Sequence from={S.pa1.from}  durationInFrames={S.pa1.dur}><PA1Scene /></Sequence>
      <Sequence from={S.pa2.from}  durationInFrames={S.pa2.dur}><PA2Scene /></Sequence>
      <Sequence from={S.cred.from} durationInFrames={S.cred.dur}><CredibilityScene /></Sequence>
      <Sequence from={S.cta.from}  durationInFrames={S.cta.dur}><CTAScene /></Sequence>
      <SubtitleOverlay frame={frame} />
      <ProgressBar frame={frame} />
    </AbsoluteFill>
  );
};
