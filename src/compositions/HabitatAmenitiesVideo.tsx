import React from "react";
import { Audio, staticFile } from "remotion";
import { SceneRenderer } from "./SceneRenderer";
import { HABITAT_AMENITIES_SCRIPT } from "../data/scenes/habitat-amenities-script";

export const HabitatAmenitiesVideo: React.FC = () => {
  return (
    <>
      <Audio
        src={staticFile("audio/habitat-amenities.mp3")}
        startFrom={0}
        volume={1}
      />
      <SceneRenderer scenes={HABITAT_AMENITIES_SCRIPT} />
    </>
  );
};
