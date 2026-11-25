import React from "react";
import { Audio, staticFile } from "remotion";
import { SceneRenderer } from "./SceneRenderer";
import { FIVE_MISTAKES_SCRIPT } from "../data/scenes/five-mistakes-script";

/**
 * Composition: "5 Sai lầm khi mua nhà lần đầu"
 *
 * Render:  npx remotion render src/index.ts FiveMistakes out/five-mistakes.mp4
 * Preview: npm run dev → http://localhost:3000 → chọn FiveMistakes
 *
 * Để dùng giọng đọc thật:
 *   1. Đặt file audio vào public/audio/five-mistakes.mp3
 *   2. Uncomment dòng <Audio ... /> bên dưới
 *   3. Cập nhật startTime/endTime trong five-mistakes-script.ts khớp với audio
 */
export const FiveMistakesVideo: React.FC = () => {
  return (
    <>
      <Audio
        src={staticFile("audio/five-mistakes.mp3")}
        startFrom={0}
        volume={1}
      />
      <SceneRenderer scenes={FIVE_MISTAKES_SCRIPT} />
    </>
  );
};
