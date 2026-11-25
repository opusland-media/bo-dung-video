import type { SceneBeat } from "./schema";

/**
 * Kịch bản mẫu: "3 Sai lầm khiến nhà đầu tư BĐS mất tiền"
 *
 * Cấu trúc: Hook → Stat → Sai lầm 1 (pháp lý) → Giải pháp 1 → Sai lầm 2 (ngân sách)
 *            → Sai lầm 3 (vị trí) → Giải pháp 3 → Checklist CTA
 *
 * Tổng thời lượng: 65 giây (1950 frames @ 30fps)
 *
 * CÁCH CẬP NHẬT TIMING:
 * 1. Thu voice-over trước
 * 2. Chạy Whisper để lấy timestamp từng câu (xem AUDIO_SYNC.md)
 * 3. Cập nhật startTime / endTime cho từng beat khớp với timestamp thật
 * 4. Cập nhật durationInFrames trong Root.tsx = endTime của beat cuối * 30
 */
export const THREE_MISTAKES_SCRIPT: SceneBeat[] = [
  // ─── HOOK ──────────────────────────────────────────────────────────────────
  {
    id:            "hook",
    startTime:     0,
    endTime:       5,
    voiceoverText: "Bạn có 500 triệu và đang nghĩ đến đầu tư bất động sản?",
    visualType:    "title",
    content: {
      badge:    "CẢNH BÁO",
      headline: "3 Sai Lầm",
      subtitle: "Khiến Nhà Đầu Tư BĐS Mất Tiền",
    },
    transitionIn: "fade",
  },

  // ─── STAT INTRO ────────────────────────────────────────────────────────────
  {
    id:            "stat-intro",
    startTime:     5,
    endTime:       12,
    voiceoverText: "70% nhà đầu tư mới mắc ít nhất một trong ba sai lầm này — và thường không nhận ra cho đến khi đã mất tiền.",
    visualType:    "chart",
    content: {
      title: "Tỷ lệ mắc sai lầm khi đầu tư BĐS lần đầu",
      bars: [
        { label: "Pháp lý không rõ ràng",    value: 68, max: 100 },
        { label: "Tính sai ngân sách",        value: 71, max: 100 },
        { label: "Chọn sai vị trí / khu vực", value: 54, max: 100 },
      ],
      unit: "%",
    },
    transitionIn: "slide",
  },

  // ─── SAI LẦM #1 — PHÁP LÝ ─────────────────────────────────────────────────
  {
    id:            "mistake-1",
    startTime:     12,
    endTime:       24,
    voiceoverText: "Sai lầm số một: mua căn hộ hoặc đất khi pháp lý chưa hoàn chỉnh. Không có sổ hồng — bạn không vay ngân hàng được, không đăng ký hộ khẩu được, và không bán lại dễ dàng được.",
    visualType:    "bullet-list",
    content: {
      title: "Sai Lầm #1 · Pháp Lý Mơ Hồ",
      bullets: [
        { text: "Căn hộ chưa có sổ hồng → ngân hàng từ chối cho vay thế chấp",   icon: "x" },
        { text: "Dự án chưa nghiệm thu → không đăng ký hộ khẩu, không ở hợp pháp", icon: "x" },
        { text: "Hợp đồng góp vốn ≠ Hợp đồng mua bán chính thức theo luật",        icon: "warning" },
        { text: "Chủ đầu tư chậm ra sổ → tài sản bị treo nhiều năm",               icon: "warning" },
      ],
    },
    transitionIn: "wipe",
  },

  // ─── GIẢI PHÁP #1 — HABITAT ────────────────────────────────────────────────
  {
    id:            "solution-1",
    startTime:     24,
    endTime:       33,
    voiceoverText: "Ví dụ điển hình: The Habitat giai đoạn 3 tại Bình Dương — một phần đã chính thức có sổ hồng. Đây là loại tài sản bạn có thể cầm cố ngân hàng ngay lập tức.",
    visualType:    "project-showcase",
    projectRef:    "the-habitat",
    content: {
      highlights: [
        "Một phần GĐ3 đã có sổ hồng chính thức",
        "Cầm cố ngân hàng được ngay",
        "Pháp lý minh bạch — an toàn 100%",
      ],
      showBadge: "Đã có sổ hồng GĐ3",
    },
    transitionIn: "fade",
  },

  // ─── SAI LẦM #2 — NGÂN SÁCH ───────────────────────────────────────────────
  {
    id:            "mistake-2",
    startTime:     33,
    endTime:       45,
    voiceoverText: "Sai lầm số hai: tính sai ngân sách. Nhiều người chỉ nhìn vào giá hợp đồng — nhưng thực tế còn phí sang tên, thuế trước bạ, lãi ngân hàng năm đầu, và phí quản lý chung cư.",
    visualType:    "chart",
    content: {
      title: "Chi phí thực tế khi mua căn hộ 1,8 tỷ (năm đầu)",
      bars: [
        { label: "Giá hợp đồng",           value: 1800, max: 2080 },
        { label: "+ Thuế & phí sang tên (2%)", value: 36,   max: 2080 },
        { label: "+ Lãi ngân hàng năm 1 (70% vay 8.5%)", value: 107, max: 2080 },
        { label: "+ Phí quản lý năm 1",    value: 18,   max: 2080 },
      ],
      unit: "triệu VNĐ",
    },
    transitionIn: "slide",
  },

  // ─── SAI LẦM #3 — VỊ TRÍ ─────────────────────────────────────────────────
  {
    id:            "mistake-3",
    startTime:     45,
    endTime:       55,
    voiceoverText: "Sai lầm số ba và nguy hiểm nhất: chọn vị trí không có tiềm năng hạ tầng. Đất rẻ nhưng không có đường quy hoạch, không gần khu công nghiệp, không có metro — 10 năm vẫn đứng giá.",
    visualType:    "map-pin",
    content: {
      title:    "Vị Trí Quyết Định 70% Tăng Giá",
      location: "Thuận An · Bình Dương",
      highlights: [
        "Gần VSIP 1 & 2 · 300.000+ công nhân",
        "Vành đai 3 TP.HCM đi qua khu vực",
        "Cầu Đại Phước nối với TP. Thủ Đức",
        "Bình Dương: 1 triệu dân nhập cư/năm",
      ],
    },
    transitionIn: "wipe",
  },

  // ─── GIẢI PHÁP #3 — EMERALD ───────────────────────────────────────────────
  {
    id:            "solution-3",
    startTime:     55,
    endTime:       63,
    voiceoverText: "The Emerald Golf View tại Thuận An hội đủ: hạ tầng đồng bộ, sổ hồng có sẵn, và chính sách 10% nhận nhà — chỉ khoảng 260 triệu đồng.",
    visualType:    "project-showcase",
    projectRef:    "emerald-golf-view",
    content: {
      highlights: [
        "10% nhận nhà — ~260 triệu VNĐ",
        "Đã có sổ hồng — thế chấp ngay",
        "Cách VSIP 1 chỉ 2km",
      ],
      showBadge: "Chỉ từ 260 triệu",
    },
    transitionIn: "fade",
  },

  // ─── CHECKLIST CTA ─────────────────────────────────────────────────────────
  {
    id:            "cta",
    startTime:     63,
    endTime:       72,
    voiceoverText: "Tránh được 3 sai lầm này, bạn đã an toàn hơn 70% nhà đầu tư trên thị trường. Xem thêm dự án và bảng giá thực tế tại batdongsan123.com.",
    visualType:    "checklist",
    content: {
      title: "Checklist Nhà Đầu Tư Thông Minh",
      items: [
        "Luôn kiểm tra sổ hồng / sổ đỏ trước khi đặt cọc",
        "Tính đủ chi phí phát sinh (tối thiểu +10-12% giá HĐ)",
        "Chọn khu vực có quy hoạch hạ tầng rõ ràng trong 5 năm",
      ],
      ctaText: "batdongsan123.com",
      ctaUrl:  "https://batdongsan123.com",
    },
    transitionIn: "fade",
  },
];
