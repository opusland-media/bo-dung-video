import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { TLuxeStack, TBigNumber, TScriptBold, TSerifScript, TStair } from "../components/TitleFX";

/** Demo bộ tiêu đề TitleFX trên nền Green Skyline (dọc 1080×1920). */
export const TFX_SEG = 72;
export const TFX_FRAMES = TFX_SEG * 5 + 20;

const Bg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Img src={staticFile("images/gslposter/bg_pool.jpg")} style={{ width: 1080, height: 1920, objectFit: "cover", transform: `scale(${1.05 + f * 0.0004})`, filter: "brightness(0.45) saturate(1.1)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(70% 45% at 50% 50%, rgba(0,0,0,0.15), rgba(0,0,0,0.65))" }} />
    </AbsoluteFill>
  );
};

const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>{children}</AbsoluteFill>
);

export const TitleFXDemo: React.FC = () => {
  const out = TFX_SEG - 12;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Bg />
      <Sequence durationInFrames={TFX_SEG}><Center><TLuxeStack at={4} outAt={out} lead={["Sống", "Chuẩn"]} key1="Resort Xanh" /></Center></Sequence>
      <Sequence from={TFX_SEG} durationInFrames={TFX_SEG}><Center><div style={{ marginLeft: -60 }}><TBigNumber at={4} outAt={out} pre="Chỉ từ" num="47" unit="Triệu/m²" post="Full nội thất" size={280} /></div></Center></Sequence>
      <Sequence from={TFX_SEG * 2} durationInFrames={TFX_SEG}><Center><TScriptBold at={4} outAt={out} script="view" key1="HỒ BƠI" size={170} /></Center></Sequence>
      <Sequence from={TFX_SEG * 3} durationInFrames={TFX_SEG}><Center><div style={{ marginLeft: -80 }}><TSerifScript at={4} outAt={out} serif="Đánh Thức" script1="Mọi" script2="Giác Quan" size={84} /></div></Center></Sequence>
      <Sequence from={TFX_SEG * 4} durationInFrames={TFX_SEG + 20}><Center><div style={{ marginLeft: -120 }}><TStair at={4} lines={[{ small: "Chỉ đóng" }, { small: "trước", big: "10%" }, { small: "tới khi", big: "NHẬN NHÀ" }]} size={96} /></div></Center></Sequence>
    </AbsoluteFill>
  );
};
