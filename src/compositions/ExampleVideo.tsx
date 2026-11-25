import React from "react";
import { Audio, staticFile } from "remotion";
import { SceneRenderer } from "./SceneRenderer";
import { THREE_MISTAKES_SCRIPT } from "../data/scenes/example-script";

/**
 * Composition mẫu: "3 Sai lầm khiến nhà đầu tư BĐS mất tiền"
 *
 * Render: npx remotion render src/index.ts ThreeMistakes out/three-mistakes.mp4
 * Preview: npm run dev → http://localhost:3000
 *
 * Để dùng giọng đọc thật:
 *   1. Đặt file audio vào public/audio/three-mistakes.mp3
 *   2. Uncomment dòng <Audio ... /> bên dưới
 *   3. Cập nhật startTime/endTime trong example-script.ts khớp với audio
 */
export const ExampleVideo: React.FC = () => {
  return (
    <>
      {/*
        <Audio
          src={staticFile("audio/three-mistakes.mp3")}
          startFrom={0}
          volume={1}
        />
      */}
      <SceneRenderer scenes={THREE_MISTAKES_SCRIPT} />
    </>
  );
};
