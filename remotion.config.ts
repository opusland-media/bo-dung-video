import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setPixelFormat("yuv420p");
Config.setConcurrency(4);

// Chạy trên đám mây (claude.ai/code): mạng chặn tải Chrome của Remotion → dùng Chromium có sẵn
import { existsSync } from "fs";
if (existsSync("/opt/pw-browsers/chromium")) {
  Config.setBrowserExecutable("/opt/pw-browsers/chromium");
}
