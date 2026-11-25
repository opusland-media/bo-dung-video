import React from "react";
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";

/**
 * Green Skyline — loại hình căn + nội thất bàn giao (dọc 1080×1920, 30fps).
 * Lời thoại: "Căn hộ Green Skyline với đa dạng loại hình từ căn studio cho tới 3PN, bàn giao đầy đủ nội thất,
 *  nhận nhà là có thể dọn vào ở ngay. Bếp có sẵn tủ trên dưới, bếp từ, hút mùi, tủ lạnh. Phòng khách có sofa, kệ tivi.
 *  Phòng ngủ bàn giao giường, nệm, tủ quần áo. Máy lạnh, máy giặt, thiết bị vệ sinh Kohler."
 * Cảnh: mặt bằng tầng 9-27/39 + clip iPhone thực tế (quang cao fb), máy giặt lấy từ still nhà mẫu 1PN+.
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["600", "700", "800"], subsets: ["vietnamese", "latin"] });

const GOLD = "#E2B865";
const GREEN = "#1F2E27";
const MX = 96;
const V = (n: string) => staticFile(`video/gsl_noithat4k/${n}.mp4`);

// ---- mốc cảnh (frame) ----
export const S = {
  plan: 0, door: 132, kitchen: 246, sofa: 354, tv: 390, bed: 426, ac: 510, washer: 540, wc: 570, end: 636,
};
export const GSL_NOITHAT_FRAMES = S.end;

type Item = { t: string; at: number };
const ZONES: { from: number; to: number; zone: string; items: Item[] }[] = [
  { from: S.kitchen, to: S.sofa, zone: "BẾP", items: [{ t: "Tủ bếp trên & dưới", at: 256 }, { t: "Bếp từ", at: 284 }, { t: "Hút mùi", at: 306 }, { t: "Tủ lạnh", at: 328 }] },
  { from: S.sofa, to: S.bed, zone: "PHÒNG KHÁCH", items: [{ t: "Sofa", at: 360 }, { t: "Kệ tivi", at: 394 }] },
  { from: S.bed, to: S.ac, zone: "PHÒNG NGỦ", items: [{ t: "Giường", at: 434 }, { t: "Nệm", at: 456 }, { t: "Tủ quần áo", at: 480 }] },
  { from: S.ac, to: S.end, zone: "TIỆN NGHI", items: [{ t: "Máy lạnh", at: 512 }, { t: "Máy giặt", at: 542 }, { t: "Thiết bị vệ sinh Kohler", at: 574 }] },
];

// layout 3D lấy từ bộ "TL MBCH FINAL" (Drive 3. MẶT BẰNG / 2. MẶT BẰNG CĂN HỘ)
const TYPES = [
  { t: "STUDIO", img: "layout_studio", at: 34 },
  { t: "1PN+", img: "layout_1pn", at: 58 },
  { t: "2PN", img: "layout_2pn", at: 82 },
  { t: "3PN", img: "layout_3pn", at: 104 },
];

// bóng đổ: bản video dùng bóng mềm; bản overlay dùng bóng gọn
let SOFT = true;
const sh = (soft: string, tight: string) => (SOFT ? soft : tight);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

/** clip có cú "đẩy" nhẹ lúc vào cảnh */
const Clip: React.FC<{ src: string; dur: number; zoom?: number; origin?: string }> = ({ src, dur, zoom = 1, origin = "50% 50%" }) => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, 9], [1.07, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const drift = interpolate(f, [0, dur], [1, 1.03], clamp);
  return (
    <AbsoluteFill style={{ transform: `scale(${push * drift * zoom})`, transformOrigin: origin }}>
      <OffthreadVideo src={src} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  );
};

const Check: React.FC<{ text: string; k: number }> = ({ text, k }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 14, background: "rgba(14,23,20,0.82)", borderRadius: 16, padding: "12px 24px 12px 14px",
    opacity: Math.min(1, k * 1.5), transform: `translateX(${(1 - k) * -50}px)`, boxShadow: sh("0 10px 30px rgba(0,0,0,0.35)", "none"), alignSelf: "flex-start",
  }}>
    <div style={{ width: 40, height: 40, borderRadius: 40, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.5 + 0.5 * k})` }}>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    </div>
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: "#fff" }}>{text}</div>
  </div>
);

export type NoiThatMode = "video" | "green" | "alpha";
export const GSLNoiThatVertical: React.FC<{ mode?: NoiThatMode }> = ({ mode = "video" }) => {
  const useClips = mode === "video";
  SOFT = useClips; // bản phông xanh / trong suốt: bỏ bóng mờ rộng (CapCut hiện thành khối/vạch)
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (at: number, damping = 14) => spring({ frame: f - at, fps, config: { damping, stiffness: 170, mass: 0.7 } });

  const zone = ZONES.find((z) => f >= z.from && f < z.to);
  const doorA = sp(S.door + 8, 12) * (1 - ramp(f, S.door + 56, S.door + 64));
  const doorB = sp(S.door + 62, 12) * (1 - ramp(f, S.kitchen - 6, S.kitchen));

  return (
    <AbsoluteFill style={{ background: mode === "green" ? "#00B140" : mode === "alpha" ? "transparent" : "#0B1310", overflow: "hidden" }}>
      {/* ---------- CẢNH ---------- */}
      <Sequence from={S.plan} durationInFrames={S.door}>
        <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 35%, #2A3D33 0%, #1F2E27 55%, #16211C 100%)" }} />
      </Sequence>
      {useClips && (<>
      <Sequence from={S.door} durationInFrames={S.kitchen - S.door}><Clip src={V("b_dining")} dur={S.kitchen - S.door} /></Sequence>
      <Sequence from={S.kitchen} durationInFrames={S.sofa - S.kitchen}><Clip src={V("k_0409")} dur={S.sofa - S.kitchen} /></Sequence>
      <Sequence from={S.sofa} durationInFrames={S.tv - S.sofa}><Clip src={V("d_sofa")} dur={S.tv - S.sofa} /></Sequence>
      <Sequence from={S.tv} durationInFrames={S.bed - S.tv}><Clip src={V("d_tv")} dur={S.bed - S.tv} /></Sequence>
      <Sequence from={S.bed} durationInFrames={51}><Clip src={V("b1_0404")} dur={51} /></Sequence>
      <Sequence from={S.bed + 51} durationInFrames={S.ac - S.bed - 51}><Clip src={V("b2_0403")} dur={S.ac - S.bed - 51} /></Sequence>
      <Sequence from={S.ac} durationInFrames={S.washer - S.ac}><Clip src={V("f_ac")} dur={S.washer - S.ac} zoom={1.35} origin="20% 20%" /></Sequence>
      <Sequence from={S.washer} durationInFrames={S.wc - S.washer}><Clip src={V("f_washer")} dur={S.wc - S.washer} /></Sequence>
      <Sequence from={S.wc} durationInFrames={S.end - S.wc}><Clip src={V("w_0407")} dur={S.end - S.wc} /></Sequence>
      </>)}

      {/* lớp tối trên/dưới cho chữ dễ đọc */}
      {mode === "video" && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,14,12,0.55) 0%, rgba(8,14,12,0) 22%, rgba(8,14,12,0) 52%, rgba(8,14,12,0.55) 82%, rgba(8,14,12,0.7) 100%)" }} />}

      {/* logo */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center" }}>
        <div style={{ background: "#FBF7EE", borderRadius: 16, padding: "9px 16px", boxShadow: sh(`0 0 0 3px ${GOLD}, 0 10px 30px rgba(0,0,0,0.4)`, `0 0 0 3px ${GOLD}`) }}>
          <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 76, display: "block" }} />
        </div>
      </div>

      {/* ---------- CẢNH 1: loại hình ---------- */}
      {f < S.door && (() => {
        const k = sp(10);
        return (
          <>
            <div style={{ position: "absolute", left: MX, right: MX, top: 268, textAlign: "center", opacity: Math.min(1, k), transform: `translateY(${(1 - k) * 30}px)` }}>
              <div style={{ display: "inline-block", padding: "0 10px" }}>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 7, color: GOLD }}>ĐA DẠNG LOẠI HÌNH</div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 60, color: "#fff", marginTop: 4 }}>TỪ STUDIO ĐẾN 3PN</div>
              </div>
            </div>
            <div style={{ position: "absolute", left: MX, right: MX, top: 470, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {TYPES.map((t) => {
                const kk = sp(t.at, 13);
                const zoomIn = interpolate(f, [t.at, S.door], [1.0, 1.05], clamp);
                return (
                  <div key={t.t} style={{
                    height: 540, borderRadius: 22, background: "#F4EFE4", overflow: "hidden", position: "relative",
                    boxShadow: sh(`0 0 0 2px ${GOLD}, 0 18px 40px rgba(0,0,0,0.45)`, `0 0 0 2px ${GOLD}`),
                    opacity: Math.min(1, kk * 1.5), transform: `translateY(${(1 - kk) * 40}px) scale(${0.9 + 0.1 * kk})`,
                  }}>
                    <Img src={staticFile(`images/gslposter/${t.img}.jpg`)} style={{
                      position: "absolute", left: 18, right: 18, top: 16, height: 440, width: "calc(100% - 36px)", objectFit: "contain",
                      transform: `scale(${zoomIn})`,
                    }} />
                    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 72, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, letterSpacing: 4, color: GOLD }}>{t.t}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        );
      })()}

      {/* ---------- CẢNH 2: full nội thất / vào ở ngay ---------- */}
      {doorA > 0.01 && (
        <div style={{ position: "absolute", left: MX, right: MX, top: 1180, textAlign: "center", opacity: Math.min(1, doorA * 1.4), transform: `scale(${0.85 + 0.15 * doorA})` }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, color: "#fff", letterSpacing: 3, textShadow: sh("0 4px 20px rgba(0,0,0,0.6)", "0 2px 3px rgba(0,0,0,0.7)") }}>BÀN GIAO</div>
          <div style={{ display: "inline-block", marginTop: 8, background: GOLD, color: GREEN, borderRadius: 18, padding: "6px 30px", fontFamily: SANS, fontWeight: 800, fontSize: 72 }}>FULL NỘI THẤT</div>
        </div>
      )}
      {doorB > 0.01 && (
        <div style={{ position: "absolute", left: MX, right: MX, top: 1180, textAlign: "center", opacity: Math.min(1, doorB * 1.4), transform: `scale(${0.85 + 0.15 * doorB})` }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, color: "#fff", letterSpacing: 3, textShadow: sh("0 4px 20px rgba(0,0,0,0.6)", "0 2px 3px rgba(0,0,0,0.7)") }}>NHẬN NHÀ</div>
          <div style={{ display: "inline-block", marginTop: 8, background: GOLD, color: GREEN, borderRadius: 18, padding: "6px 30px", fontFamily: SANS, fontWeight: 800, fontSize: 72 }}>VÀO Ở NGAY</div>
        </div>
      )}
      {f >= S.door + 0 && f < S.kitchen && (
        <div style={{ position: "absolute", right: MX, bottom: 120, fontFamily: SANS, fontWeight: 600, fontSize: 20, color: "rgba(255,255,255,0.7)", opacity: ramp(f, S.door + 10, S.door + 20) }}>
          *Theo chính sách bàn giao hiện hành
        </div>
      )}

      {/* ---------- CẢNH 3+: checklist theo khu vực ---------- */}
      {zone && (
        <>
          <div style={{ position: "absolute", left: MX, top: 262 }}>
            <div style={{
              fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 4, color: GREEN, background: GOLD, borderRadius: 14, padding: "8px 22px",
              opacity: ramp(f, zone.from, zone.from + 6), transform: `translateY(${(1 - ramp(f, zone.from, zone.from + 8)) * -20}px)`,
            }}>{zone.zone}</div>
          </div>
          <div style={{ position: "absolute", left: MX, right: MX, top: 1130, display: "flex", flexDirection: "column", gap: 14 }}>
            {zone.items.filter((it) => f >= it.at - 1).map((it) => <Check key={it.t} text={it.t} k={sp(it.at, 13)} />)}
          </div>
        </>
      )}

      {/* ---------- SFX ---------- */}
      {[S.door, S.kitchen, S.sofa, S.bed, S.ac].map((s) => (
        <Sequence key={`w${s}`} from={Math.max(0, s - 6)}><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.28} /></Sequence>
      ))}
      {[...TYPES.map((t) => t.at), ...ZONES.flatMap((z) => z.items.map((i) => i.at))].map((s) => (
        <Sequence key={`t${s}`} from={s}><Audio src={staticFile("audio/sfx_tick.wav")} volume={0.4} /></Sequence>
      ))}
      <Sequence from={S.door + 8}><Audio src={staticFile("audio/sfx_chime.wav")} volume={0.3} /></Sequence>
    </AbsoluteFill>
  );
};
