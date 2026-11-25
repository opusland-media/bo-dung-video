import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, Easing } from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";

/**
 * Reel thử "Thuê nhà 7 triệu/tháng" (dọc 1080×1920, 30fps).
 * Hướng "Ảnh thật + nhãn tối giản": ảnh dự án tràn màn hình, lia chậm; nhãn kiểu tài liệu kiến trúc.
 * Mốc câu lấy từ public/reel1/timing.json (giọng tạm). Thay giọng thật: đổi `voice` + cập nhật S.
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["500", "600", "700", "800"], subsets: ["vietnamese", "latin"] });

const FPS = 30;
const SAFE = { l: 108, r: 972, t: 150, b: 1770 };
// [start(s), dur(s)] của 9 câu
const S: [number, number][] = [
  [0.4, 2.968], [3.718, 3.99], [8.058, 4.926], [13.334, 1.525], [15.209, 3.193],
  [18.753, 3.596], [22.698, 3.21], [26.258, 4.385], [30.993, 4.716],
];
export const REEL_THUE_FRAMES = Math.round(36.7 * FPS);

type Scene = { img: string; from: "l" | "r" | "c"; kick: string; big: string; small?: string; note?: string; beat: number };
// beat: giây (tính từ đầu câu) lúc số khoá hiện — khớp chữ được đọc
const SC: Scene[] = [
  { img: "s0.jpg", from: "l", kick: "TIỀN THUÊ NHÀ", big: "7 triệu", small: "mỗi tháng", beat: 1.4 },
  { img: "s1.jpg", from: "r", kick: "SAU 10 NĂM", big: "840 triệu", small: "mà nhà vẫn là của chủ", beat: 0.9 },
  { img: "s2.jpg", from: "c", kick: "GREEN SKYLINE · DĨ AN", big: "Căn studio", small: "Ảnh thực tế dự án", beat: 2.6 },
  { img: "s3.jpg", from: "l", kick: "BƯỚC 1", big: "50 triệu", small: "giữ chỗ", beat: 0.2 },
  { img: "s4.jpg", from: "r", kick: "BƯỚC 2", big: "≈270 triệu", small: "ký hợp đồng mua bán", beat: 0.5 },
  { img: "s5.jpg", from: "l", kick: "BƯỚC 3", big: "Vay 70%", small: "năm đầu lãi 0%", beat: 0.4 },
  { img: "s6.jpg", from: "r", kick: "SAU ƯU ĐÃI", big: "≈15,8 tr", small: "mỗi tháng", note: "Giả định lãi 9%/năm sau ưu đãi, vay 25 năm, trả đều", beat: 1.2 },
  { img: "s7.jpg", from: "l", kick: "SO VỚI TIỀN THUÊ", big: "+9 triệu", small: "mà nhà đứng tên mình", beat: 0.9 },
  { img: "s8.jpg", from: "c", kick: "COMMENT", big: "TÍNH GIÚP", small: "Hoàng gửi bảng góp riêng", beat: 1.6 },
];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.2, 0.7, 0.2, 1);

const useSafeCheck = (on: boolean, f: number) => {
  React.useEffect(() => {
    if (!on) return;
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const bad: string[] = [];
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const txt = (n.textContent ?? "").trim();
      if (!txt) continue;
      const el = n.parentElement as HTMLElement;
      if (!el || Number(getComputedStyle(el).opacity) === 0) continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      const r = rg.getBoundingClientRect();
      if (r.width < 1) continue;
      if (r.left < SAFE.l - 0.5 || r.right > SAFE.r + 0.5 || r.top < SAFE.t || r.bottom > SAFE.b)
        bad.push(`"${txt.slice(0, 40)}" [${Math.round(r.left)},${Math.round(r.top)} → ${Math.round(r.right)},${Math.round(r.bottom)}]`);
    }
    if (bad.length) console.log(`SAFE_FAIL f=${f} :: ` + bad.join(" | "));
  });
};

const Photo: React.FC<{ s: Scene; len: number }> = ({ s, len }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, len], [0, 1], clamp);
  const scale = 1.04 + 0.06 * p;
  const pos = s.from === "l" ? 30 + 30 * p : s.from === "r" ? 70 - 30 * p : 50;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img src={staticFile(`reel1/${s.img}`)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${pos}% 50%`, transform: `scale(${scale})` }} />
      {/* làm tối nhẹ phía dưới cho chữ đọc rõ — không dùng mảng màu đặc */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.28) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 48%, rgba(0,0,0,.42) 72%, rgba(0,0,0,.55) 100%)" }} />
    </AbsoluteFill>
  );
};

const Label: React.FC<{ s: Scene; beatF: number }> = ({ s, beatF }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: ease });
  const b = interpolate(f, [beatF, beatF + 7], [0, 1], { ...clamp, easing: ease });
  const line = interpolate(f, [0, 10], [0, 72], { ...clamp, easing: ease });
  const shadow = "0 2px 4px rgba(0,0,0,.55), 0 6px 24px rgba(0,0,0,.35)";
  return (
    <div style={{ position: "absolute", left: 120, right: 120, top: 1150, fontFamily: SANS, color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: k, transform: `translateY(${(1 - k) * 14}px)` }}>
        <div style={{ width: line, height: 3, background: "#fff", boxShadow: shadow }} />
        <div style={{ fontWeight: 700, fontSize: 30, letterSpacing: 4, textShadow: shadow }}>{s.kick}</div>
      </div>
      <div style={{ fontWeight: 800, fontSize: 124, lineHeight: 1.05, marginTop: 22, letterSpacing: -1, whiteSpace: "nowrap",
        opacity: b, transform: `translateY(${(1 - b) * 22}px)`, textShadow: shadow }}>{s.big}</div>
      {s.small && <div style={{ fontWeight: 600, fontSize: 44, marginTop: 14, opacity: b, textShadow: shadow }}>{s.small}</div>}
      {s.note && <div style={{ fontWeight: 500, fontSize: 24, marginTop: 26, opacity: 0.85 * b, textShadow: shadow, maxWidth: 820 }}>{s.note}</div>}
    </div>
  );
};

export const ReelThue7tr: React.FC<{ voice?: string; safeCheck?: boolean }> = ({ voice = "reel1/voice-tam.wav", safeCheck = false }) => {
  const f = useCurrentFrame();
  useSafeCheck(safeCheck, f);
  const starts = S.map(([st], i) => (i === 0 ? 0 : Math.round((st - 0.15) * FPS)));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SC.map((s, i) => {
        const from = starts[i];
        const to = i + 1 < SC.length ? starts[i + 1] : REEL_THUE_FRAMES;
        const len = to - from;
        return (
          <Sequence key={i} from={from} durationInFrames={len + 6}>
            <AbsoluteFill style={{ opacity: interpolate(f - from, [0, 6], [i === 0 ? 1 : 0, 1], clamp) }}>
              <Photo s={s} len={len + 6} />
              <Label s={s} beatF={i === 0 ? Math.round((0.4 + s.beat) * FPS) : Math.round((0.15 + s.beat) * FPS)} />
            </AbsoluteFill>
            <Sequence from={i === 0 ? Math.round((0.4 + s.beat) * FPS) : Math.round((0.15 + s.beat) * FPS)} durationInFrames={20}>
              <Audio src={staticFile("audio/cs_cut/snap.wav")} volume={0.75} />
            </Sequence>
            {(i === 2 || i === 8) && (
              <Sequence from={0} durationInFrames={30}><Audio src={staticFile("audio/cs_cut/swoosh.wav")} volume={0.6} /></Sequence>
            )}
          </Sequence>
        );
      })}
      {/* nguồn ảnh, trong vùng an toàn */}
      <div style={{ position: "absolute", right: 120, top: 190, fontFamily: SANS, fontWeight: 600, fontSize: 22, color: "rgba(255,255,255,.8)",
        textShadow: "0 1px 3px rgba(0,0,0,.6)" }}>Ảnh: TBS Land</div>
      <Audio src={staticFile(voice)} />
    </AbsoluteFill>
  );
};
