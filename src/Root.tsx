import React from "react";
import { Composition } from "remotion";
import { ExampleVideo } from "./compositions/ExampleVideo";
import { FiveMistakesVideo } from "./compositions/FiveMistakesVideo";
import { HabitatAmenitiesVideo } from "./compositions/HabitatAmenitiesVideo";
import { PaymentScheduleVideo } from "./compositions/PaymentScheduleVideo";
import { QL13IntroVideo } from "./compositions/QL13IntroVideo";
import { RentalYieldVideo } from "./compositions/RentalYieldVideo";
import { NewsStyleVideo, NEWS_TOTAL_FRAMES } from "./compositions/NewsStyleVideo";
import { TitleCardVideo, TITLE_CARD_DEFAULTS } from "./compositions/TitleCardVideo";
import { FenicaReel, FENICA_TOTAL_FRAMES } from "./compositions/FenicaReel";
import { FenicaSpecs, FENICA_SPECS_FRAMES } from "./compositions/FenicaSpecs";
import { FenicaPrice, FENICA_PRICE_FRAMES } from "./compositions/FenicaPrice";
import { ChietKhau235, CK_TOTAL_FRAMES } from "./compositions/ChietKhau235";
import { PriveVertical, PV_TOTAL_FRAMES } from "./compositions/PriveVertical";
import { PriveFull, PF_TOTAL_FRAMES } from "./compositions/PriveFull";
import { SoSanhBroll, SoSanhText, SS_TOTAL_FRAMES } from "./compositions/SoSanh";
import { SoSanhDoc, SS_DOC_CLIPS, ssDocFrames } from "./compositions/SoSanhDoc";
import { SoSanhCover } from "./compositions/SoSanhCover";
import { SoSanhCover2 } from "./compositions/SoSanhCover2";
import { SoSanhThumb } from "./compositions/SoSanhThumb";
import { BanGiaoTour, bangiaoFrames } from "./compositions/BanGiaoTour";
import { BanGiaoThumb } from "./compositions/BanGiaoThumb";
import { BanGiaoCoverV } from "./compositions/BanGiaoCoverV";
import { GSLPoster } from "./compositions/GSLPoster";
import { BanGiaoVertical, bangiaoVerticalFrames } from "./compositions/BanGiaoVertical";
import { GSLMapVertical, GSL_MAP_FRAMES } from "./compositions/GSLMapVertical";
import { GSLVayVertical, GSL_VAY_FRAMES } from "./compositions/GSLVayVertical";
import { ReelThue7tr, REEL_THUE_FRAMES } from "./compositions/ReelThue7tr";
import { GSLLaiSuatVertical, GSL_LAI_FRAMES } from "./compositions/GSLLaiSuatVertical";
import { GSLNoiThatVertical, GSL_NOITHAT_FRAMES } from "./compositions/GSLNoiThatVertical";
import { GSLTTNhanhVertical, GSL_TTN_FRAMES } from "./compositions/GSLTTNhanhVertical";
import { GSLOpening1105, OP_FRAMES } from "./compositions/GSLOpening1105";
import { GSLThumb1105 } from "./compositions/GSLThumb1105";
import { GSLThumbBT2PN } from "./compositions/GSLThumbBT2PN";
import { GSLChinhSach, CSPOL_FRAMES } from "./compositions/GSLChinhSach";
import { GSLBangTinhCan, BT_W, BT_H } from "./compositions/GSLBangTinhCan";
import { GSLBangTinhNgang, BTN_W, BTN_H } from "./compositions/GSLBangTinhNgang";
import { GSLBangTinhVay, BTV_W, BTV_H } from "./compositions/GSLBangTinhVay";
import { TitleFXDemo, TFX_FRAMES } from "./compositions/TitleFXDemo";
import { KineticOpenDemo, KOD_FRAMES } from "./compositions/KineticOpenDemo";
import { GSLThumbMatBang } from "./compositions/GSLThumbMatBang";
import { GSLThumbChinhSach } from "./compositions/GSLThumbChinhSach";
import { GSLThumbSoHong } from "./compositions/GSLThumbSoHong";
import { GSLMatBang, MB_FRAMES } from "./compositions/GSLMatBang";
import { GSLBangTinh2PN, GSLBangTinhUnitCheck, BT2PN_FRAMES } from "./compositions/GSLBangTinh2PN";
import { GSLMap3DVertical, MAP3D_FRAMES } from "./compositions/GSLMap3DVertical";
import { GSLChinhSachMau, GSLCSToanBo, csFrames } from "./compositions/GSLCSToanBo";
import { VOICE_WORDS, VOICE_END } from "./compositions/GSLCSVoice";
import { VIDEO } from "./design/tokens";

/**
 * Root.tsx — đăng ký tất cả compositions.
 *
 * Để thêm video mới:
 *   1. Tạo file kịch bản trong src/data/scenes/my-script.ts
 *   2. Tạo composition wrapper trong src/compositions/MyVideo.tsx
 *   3. Đăng ký <Composition ... /> bên dưới
 *   4. durationInFrames = endTime của beat cuối cùng * fps
 */
export const Root: React.FC = () => {
  return (
    <>
      {/*
       * Video mẫu: "3 Sai lầm khiến nhà đầu tư BĐS mất tiền"
       * Tổng: 72s = 2160 frames @ 30fps
       * Format: TikTok dọc 1080×1920
       */}
      <Composition
        id="ThreeMistakes"
        component={ExampleVideo}
        durationInFrames={2160}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{}}
      />

      {/*
       * Video: "5 Sai lầm khi mua nhà lần đầu"
       * Tổng: 55s = 1650 frames @ 30fps
       * Format: TikTok dọc 1080×1920
       */}
      <Composition
        id="FiveMistakes"
        component={FiveMistakesVideo}
        durationInFrames={1380}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{}}
      />
      {/*
       * Video: "Tiện ích The Habitat GĐ3 — Resort Tại Gia"
       * Tổng: 70s = 2100 frames @ 30fps
       * Format: TikTok dọc 1080×1920
       */}
      {/*
       * Video: "Chính Sách Thanh Toán — The Habitat GĐ3"
       * 1920×1080 landscape · 36s = 1080 frames @ 30fps
       */}
      <Composition
        id="PaymentSchedule"
        component={PaymentScheduleVideo}
        durationInFrames={1080}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/*
       * Video: "Top 2 dự án QL13 — Intro 20s"
       * 1920×1080 landscape · 21s = 629 frames @ 30fps
       */}
      <Composition
        id="QL13Intro"
        component={QL13IntroVideo}
        durationInFrames={629}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/*
       * Video: "Tỷ suất sinh lời — Dòng tiền cho thuê QL13"
       * 1920×1080 · 10s = 300 frames @ 30fps
       */}
      <Composition
        id="RentalYield"
        component={RentalYieldVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/*
       * Video: Editorial News Style — 9:16 Shorts/TikTok
       * Style: nền hồng nhạt, headline đen bold, accent đỏ
       * Thời lượng: ~70s = 2100 frames @ 30fps (tính từ NEWS_TOTAL_FRAMES)
       */}
      <Composition
        id="NewsStyle"
        component={NewsStyleVideo}
        durationInFrames={NEWS_TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      <Composition
        id="HabitatAmenities"
        component={HabitatAmenitiesVideo}
        durationInFrames={2100}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{}}
      />

      {/* TitleCard: chữ động nền xanh lá (green screen) cho CapCut — 3s hold */}
      <Composition
        id="FenicaReel"
        component={FenicaReel}
        durationInFrames={FENICA_TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      <Composition
        id="FenicaSpecs"
        component={FenicaSpecs}
        durationInFrames={FENICA_SPECS_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      <Composition
        id="FenicaPrice"
        component={FenicaPrice}
        durationInFrames={FENICA_PRICE_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      {/* The Privé — "Chiết khấu 23,5% đến từ đâu?" · 9:16 · ~51s (giọng thật, audio ghép ngoài) */}
      <Composition
        id="ChietKhau235"
        component={ChietKhau235}
        durationInFrames={CK_TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      {/* The Privé Tháp 9 — bản dọc đầy đủ (đang dựng) · 9:16 */}
      <Composition
        id="PriveVertical"
        component={PriveVertical}
        durationInFrames={PV_TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      {/* The Privé Tháp 9 — bản dọc đầy đủ ~5 phút · 9:16 (audio ghép ngoài) */}
      <Composition
        id="PriveFull"
        component={PriveFull}
        durationInFrames={PF_TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      {/* The Privé hay Palm River? — lớp phủ trong suốt cho video quay thật (render --scale=2 → 4K) */}
      <Composition id="SoSanhBroll" component={SoSanhBroll} durationInFrames={SS_TOTAL_FRAMES} fps={30} width={1920} height={1080} defaultProps={{}} />
      {/* Bản ngắn khung dọc 9:16 — render --scale=2 → 2160×3840 */}
      <Composition
        id="SoSanhDoc"
        component={SoSanhDoc}
        durationInFrames={ssDocFrames(SS_DOC_CLIPS[0].ranges)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={SS_DOC_CLIPS[0]}
        calculateMetadata={({ props }) => ({ durationInFrames: ssDocFrames(props.ranges) })}
      />
      <Composition id="SoSanhCover" component={SoSanhCover} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ part: 1 as 1 | 2 }} />
      <Composition id="SoSanhCover2" component={SoSanhCover2} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ part: 1 as 1 | 2 }} />
      <Composition id="BanGiao1PN" component={BanGiaoTour} durationInFrames={bangiaoFrames("1pn")} fps={30} width={3840} height={2160} defaultProps={{ unit: "1pn" }} />
      <Composition id="BanGiao2PN" component={BanGiaoTour} durationInFrames={bangiaoFrames("2pn")} fps={30} width={3840} height={2160} defaultProps={{ unit: "2pn" }} />
      <Composition id="BanGiaoThumb" component={BanGiaoThumb} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ unit: "1pn" }} />
      <Composition id="BanGiaoCoverV" component={BanGiaoCoverV} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ unit: "1pn" }} />
      <Composition id="GSLMapVertical" component={GSLMapVertical} durationInFrames={GSL_MAP_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="ReelThue7tr" component={ReelThue7tr} durationInFrames={REEL_THUE_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ voice: "reel1/voice-tam.wav", safeCheck: false }} />
      <Composition id="GSLVayVertical" component={GSLVayVertical} durationInFrames={GSL_VAY_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="GSLLaiSuatVertical" component={GSLLaiSuatVertical} durationInFrames={GSL_LAI_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="GSLNoiThatVertical" component={GSLNoiThatVertical} durationInFrames={GSL_NOITHAT_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="GSLNoiThatGreen" component={GSLNoiThatVertical} defaultProps={{ mode: "green" as const }} durationInFrames={GSL_NOITHAT_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="GSLNoiThatAlpha" component={GSLNoiThatVertical} defaultProps={{ mode: "alpha" as const }} durationInFrames={GSL_NOITHAT_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="GSLTTNhanhVertical" component={GSLTTNhanhVertical} durationInFrames={GSL_TTN_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="GSLOpening1105" component={GSLOpening1105} durationInFrames={OP_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="GSLOpening1105Behind" component={GSLOpening1105} defaultProps={{ layer: "behind" as const }} durationInFrames={OP_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="GSLOpening1105Front" component={GSLOpening1105} defaultProps={{ layer: "front" as const }} durationInFrames={OP_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="GSLThumb1105" component={GSLThumb1105} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="GSLThumbBT2PN" component={GSLThumbBT2PN} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="GSLChinhSach" component={GSLChinhSach} durationInFrames={CSPOL_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ voice: null as string | null }} />
      <Composition id="GSLBangTinhStudio" component={GSLBangTinhCan} durationInFrames={1} fps={30} width={BT_W} height={BT_H} defaultProps={{ unit: "studio" }} />
      <Composition id="GSLBangTinh1PN" component={GSLBangTinhCan} durationInFrames={1} fps={30} width={BT_W} height={BT_H} defaultProps={{ unit: "1pn" }} />
      <Composition id="GSLBangTinhNgangStudio" component={GSLBangTinhNgang} durationInFrames={1} fps={30} width={BTN_W} height={BTN_H} defaultProps={{ unit: "studio" }} />
      <Composition id="GSLBangTinhNgang1PN" component={GSLBangTinhNgang} durationInFrames={1} fps={30} width={BTN_W} height={BTN_H} defaultProps={{ unit: "1pn" }} />
      <Composition id="GSLBangTinhVay3PN" component={GSLBangTinhVay} durationInFrames={1} fps={30} width={BTV_W} height={BTV_H} />
      <Composition id="GSLBangTinhNgang3PN" component={GSLBangTinhNgang} durationInFrames={1} fps={30} width={BTN_W} height={BTN_H} defaultProps={{ unit: "3pn" }} />
      <Composition id="GSLBangTinhNgangT3A1208" component={GSLBangTinhNgang} durationInFrames={1} fps={30} width={BTN_W} height={BTN_H} defaultProps={{ unit: "3pn-t3a" }} />
      <Composition id="GSLBangTinhNgangT11704" component={GSLBangTinhNgang} durationInFrames={1} fps={30} width={BTN_W} height={BTN_H} defaultProps={{ unit: "2pnp-t1" }} />
      <Composition id="TitleFXDemo" component={TitleFXDemo} durationInFrames={TFX_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="KineticOpenDemo" component={KineticOpenDemo} durationInFrames={KOD_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="GSLThumbChinhSach" component={GSLThumbChinhSach} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="GSLThumbSoHong" component={GSLThumbSoHong} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="GSLThumbMatBang" component={GSLThumbMatBang} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="GSLCSToanBo" component={GSLCSToanBo} durationInFrames={csFrames(VOICE_WORDS, VOICE_END)} fps={30} width={1080} height={1920} defaultProps={{ voice: "audio/gslcs_voice.wav" as string | null, words: VOICE_WORDS, endSec: VOICE_END, hook: "A" as const }} />
      <Composition id="GSLCSHookA" component={GSLCSToanBo} durationInFrames={csFrames(VOICE_WORDS, VOICE_END)} fps={30} width={1080} height={1920} defaultProps={{ voice: "audio/gslcs_voice.wav" as string | null, words: VOICE_WORDS, endSec: VOICE_END, hook: "A" as const }} />
      <Composition id="GSLCSHookB" component={GSLCSToanBo} durationInFrames={csFrames(VOICE_WORDS, VOICE_END)} fps={30} width={1080} height={1920} defaultProps={{ voice: "audio/gslcs_voice.wav" as string | null, words: VOICE_WORDS, endSec: VOICE_END, hook: "B" as const }} />
      <Composition id="GSLCSHookC" component={GSLCSToanBo} durationInFrames={csFrames(VOICE_WORDS, VOICE_END)} fps={30} width={1080} height={1920} defaultProps={{ voice: "audio/gslcs_voice.wav" as string | null, words: VOICE_WORDS, endSec: VOICE_END, hook: "C" as const }} />
      <Composition id="GSLChinhSachMau" component={GSLChinhSachMau} durationInFrames={120} fps={30} width={1080} height={1920} defaultProps={{ scene: "sofa" as "sofa" | "so" | "studio" }} />
      <Composition id="GSLMatBang" component={GSLMatBang} durationInFrames={MB_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ voice: null as string | null }} />
      <Composition id="GSLBangTinh2PN" component={GSLBangTinh2PN} durationInFrames={BT2PN_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ refOpacity: 0, voice: "audio/bt2pn/voice.wav" as string | null }} />
      <Composition id="GSLBangTinhUnitCheck" component={GSLBangTinhUnitCheck} durationInFrames={1} fps={30} width={1200} height={1040} />
      <Composition id="GSLMap3DVertical" component={GSLMap3DVertical} durationInFrames={MAP3D_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="GSLMap3DSilent" component={GSLMap3DVertical} defaultProps={{ withVoice: false }} durationInFrames={MAP3D_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="GSLPoster" component={GSLPoster} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="BanGiaoVertical1PN" component={BanGiaoVertical} durationInFrames={bangiaoVerticalFrames("1pn")} fps={30} width={1080} height={1920} defaultProps={{ unit: "1pn" }} />
      <Composition id="BanGiaoVertical2PN" component={BanGiaoVertical} durationInFrames={bangiaoVerticalFrames("2pn")} fps={30} width={1080} height={1920} defaultProps={{ unit: "2pn" }} />
      <Composition id="SoSanhThumb" component={SoSanhThumb} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ v: "A" as "A" | "B" }} />
      <Composition id="SoSanhText" component={SoSanhText} durationInFrames={SS_TOTAL_FRAMES} fps={30} width={1920} height={1080} defaultProps={{}} />

      <Composition
        id="TitleCard"
        component={TitleCardVideo}
        durationInFrames={90}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={TITLE_CARD_DEFAULTS}
      />
    </>
  );
};
