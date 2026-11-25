import type { SceneBeat } from "./schema";

/**
 * Kịch bản: "Tiện ích The Habitat Giai đoạn 3 — Resort Tại Gia"
 * Audio: public/audio/habitat-amenities.mp3
 * Video tổng: 70s = 2100 frames @ 30fps
 */
export const HABITAT_AMENITIES_SCRIPT: SceneBeat[] = [
  // ─── HOOK (0 – 7s) ──────────────────────────────────────────────────────────
  {
    id:            "hook",
    startTime:     0,
    endTime:       7,
    voiceoverText: "Nói về TIỆN ÍCH, The Habitat Giai đoạn 3 thực sự định nghĩa lại khái niệm Resort tại gia. Trải nghiệm sống của cư dân được nâng tầm với những đặc quyền vô cùng đắt giá.",
    visualType:    "narration",
    aiImage:       "images/habitat/overview.jpg",
    content: {
      badge:    "THE HABITAT BÌNH DƯƠNG · GIAI ĐOẠN 3",
      subtitle: 'Định nghĩa lại khái niệm "Resort Tại Gia"',
    },
    transitionIn: "fade",
  },

  // ─── HỒ BƠI + GYM (7 – 27s) ────────────────────────────────────────────────
  {
    id:            "pool-gym",
    startTime:     7,
    endTime:       27,
    voiceoverText: "Buổi chiều mát trời, anh chị có thể thả mình dưới làn nước mát của hồ bơi vô cực dài đến 50m chuẩn Olympic, hoặc rèn luyện sức khỏe tại phòng gym hiện đại với đầy đủ trang thiết bị chuẩn quốc tế.",
    visualType:    "narration",
    aiImage:       "images/habitat/pool.jpg",
    content: {
      badge:    "🏊 HỒ BƠI VÔ CỰC 50M · GYM CHUẨN QUỐC TẾ",
      subtitle: "Hồ bơi vô cực 50m chuẩn Olympic · Phòng gym hiện đại trang thiết bị quốc tế",
    },
    transitionIn: "wipe",
  },

  // ─── CÔNG VIÊN (27 – 42s) ───────────────────────────────────────────────────
  {
    id:            "park",
    startTime:     27,
    endTime:       42,
    voiceoverText: "Ngay dưới chân tòa nhà là công viên cây xanh nhiệt đới — nơi cực kỳ lý tưởng để dạo bộ hay thư giãn cùng gia đình sau một ngày làm việc mệt mỏi.",
    visualType:    "narration",
    aiImage:       "images/habitat/park.jpg",
    content: {
      badge:    "🌿 CÔNG VIÊN CÂY XANH NHIỆT ĐỚI",
      subtitle: "Ngay dưới chân tòa nhà · Không gian thư giãn lý tưởng cho cả gia đình",
    },
    transitionIn: "fade",
  },

  // ─── AN NINH (42 – 63s) ─────────────────────────────────────────────────────
  {
    id:            "security",
    startTime:     42,
    endTime:       63,
    voiceoverText: "Và một điểm đặc biệt giúp The Habitat luôn là lựa chọn hàng đầu của các chuyên gia nước ngoài chính là hệ thống an ninh 3 lớp cực kỳ nghiêm ngặt, hoạt động 24/7. Sự an toàn, riêng tư và yên tĩnh của anh chị luôn được đặt lên hàng đầu.",
    visualType:    "narration",
    aiImage:       "images/habitat/exterior.jpg",
    content: {
      badge:    "🔒 AN NINH 3 LỚP · 24/7",
      subtitle: "Hệ thống an ninh nghiêm ngặt · Lựa chọn hàng đầu của chuyên gia nước ngoài",
    },
    transitionIn: "wipe",
  },

  // ─── CTA (63 – 70s) ─────────────────────────────────────────────────────────
  {
    id:            "cta",
    startTime:     63,
    endTime:       70,
    voiceoverText: "",
    visualType:    "project-showcase",
    aiImage:       "images/habitat/overview.jpg",
    projectRef:    "the-habitat",
    content: {
      highlights: [
        "Một phần GĐ3 đã có sổ hồng",
        "Hồ bơi 50m · Gym · Công viên nhiệt đới",
        "An ninh 3 lớp · 24/7",
      ],
      showBadge: "Resort Tại Gia",
    },
    transitionIn: "fade",
  },
];
