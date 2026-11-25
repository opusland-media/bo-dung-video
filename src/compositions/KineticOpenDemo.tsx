import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile } from "remotion";
import { KWord, F2, KCOL } from "../components/TitleFX";

/**
 * Demo mở đầu kiểu "kinetic" học từ 6 reel Pinterest (15/11/2026), dùng clip 1105 (anh Hoàng đi ở hồ bơi) + lớp người tách nền.
 * Chữ nằm SAU người (vẽ trước lớp person_top), từ nối nhỏ + từ khoá to, 3 câu thay nhau tại chỗ.
 */
export const KOD_FRAMES = 220;
const GRADE = "contrast(1.06) saturate(1.08)";

const Row: React.FC<{ top: number; left?: number; children: React.ReactNode }> = ({ top, left, children }) => (
  <div style={{ position: "absolute", top, left: left ?? 0, right: left === undefined ? 0 : undefined, display: "flex", justifyContent: left === undefined ? "center" : "flex-start" }}>{children}</div>
);
const W: React.FC<{ at: number; vol?: number }> = ({ at, vol = 0.32 }) => (
  <Sequence from={at} durationInFrames={40} layout="none"><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={vol} /></Sequence>
);

export const KineticOpenDemo: React.FC = () => (
  <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
    <AbsoluteFill style={{ filter: GRADE }}>
      <OffthreadVideo src={staticFile("video/op1105/base.mp4")} muted style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0) 55%)" }} />

    {/* Câu 1 — nhỏ "Đây là" + to nghiêng "căn hộ" (đầu người che chân chữ) */}
    <Row top={700} left={170}><KWord t="Đây là" at={4} out={58} size={70} weight={500} /></Row>
    <Row top={740} left={140}><KWord t="căn hộ" at={10} out={58} size={220} font={F2.interI} italic weight={900} /></Row>
    <Row top={985} left={730}><KWord t="có giá" at={22} out={58} size={70} weight={500} anim="wipe" /></Row>

    {/* Câu 2 — số tiền gradient san hô, từng chữ cái so le */}
    <Row top={560}><KWord t="đã gồm VAT · thanh toán nhanh" at={74} out={112} size={44} weight={500} /></Row>
    <Row top={600}><KWord t="2,4 TỶ" at={64} out={112} size={240} font={F2.interI} italic weight={900} g={KCOL.coral} anim="letters" /></Row>

    {/* Câu 3 — chữ hẹp đỏ đô + chữ rộng hoà vào cảnh */}
    <Row top={600}><KWord t="GREEN SKYLINE" at={118} out={214} size={110} font={F2.condensed} weight={700} g={KCOL.wine} anim="drop" ls={4} /></Row>
    <Row top={730}><KWord t="DĨ AN" at={128} out={214} size={200} font={F2.wide} weight={900} color="#ffffff" blend="overlay" shadow={false} /></Row>
    <Row top={730}><KWord t="DĨ AN" at={128} out={214} size={200} font={F2.wide} weight={900} color="#ffffff" opacity={0.6} shadow={false} /></Row>

    {/* LỚP NGƯỜI — che chữ phía sau */}
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1152, filter: GRADE }}>
      <OffthreadVideo src={staticFile("video/op1105/person_top.webm")} transparent muted style={{ width: "100%", height: "100%" }} />
    </div>

    <W at={8} /><W at={62} vol={0.4} /><W at={122} /><W at={138} vol={0.25} />
  </AbsoluteFill>
);
