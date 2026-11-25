import type { SceneBeat } from "./schema";

/**
 * Kịch bản: "5 Sai lầm khi mua nhà lần đầu"
 *
 * Audio: public/audio/five-mistakes.mp3 (41.09s)
 * Timing căn chỉnh theo silence detection từ file audio thật.
 * Video tổng: 46s (1380 frames @ 30fps) — 5s outro silent sau khi audio kết thúc.
 */
export const FIVE_MISTAKES_SCRIPT: SceneBeat[] = [
  // ─── HOOK (0 – 4.0s) ───────────────────────────────────────────────────────
  {
    id:            "hook",
    startTime:     0,
    endTime:       4.0,
    voiceoverText: "80% người mua nhà lần đầu ở Việt Nam mất tiền vì bỏ qua bước này",
    visualType:    "title",
    aiImage:       "images/beats/five-mistakes-hook.jpg",
    content: {
      badge:    "CẢNH BÁO",
      headline: "80%",
      subtitle: "Người Mua Nhà Lần Đầu\nMất Tiền Vì Bỏ Qua Bước Này",
    },
    transitionIn: "fade",
  },

  // ─── VẤN ĐỀ (4.0 – 7.2s) ──────────────────────────────────────────────────
  {
    id:            "problem",
    startTime:     4.0,
    endTime:       7.2,
    voiceoverText: "Vì thiếu kinh nghiệm, dễ dính pháp lý mập mờ, vượt ngân sách, hoặc chọn nhầm vị trí không có tiềm năng",
    visualType:    "bullet-list",
    aiImage:       "images/beats/five-mistakes-problem.jpg",
    content: {
      title: "Những Cạm Bẫy Thường Gặp",
      bullets: [
        { text: "Pháp lý mập mờ — không sổ hồng, không vay được ngân hàng", icon: "warning" },
        { text: "Vượt ngân sách — quên tính phí phát sinh 10–12% giá HĐ",   icon: "warning" },
        { text: "Chọn sai vị trí — không có hạ tầng, 10 năm không tăng giá", icon: "warning" },
      ],
    },
    transitionIn: "slide",
  },

  // ─── TIP 1 (7.2 – 13.4s) ─────────────────────────────────────────────────
  {
    id:            "tip-1",
    startTime:     7.2,
    endTime:       13.4,
    voiceoverText: "Một: Luôn kiểm tra sổ đỏ, sổ hồng chính chủ trước khi đặt cọc, đối chiếu tên trên sổ với căn cước công dân người bán",
    visualType:    "bullet-list",
    aiImage:       "images/beats/five-mistakes-tip-1.jpg",
    content: {
      title: "01 · KIỂM TRA SỔ ĐỎ",
      bullets: [
        { text: "Yêu cầu xem sổ gốc — không chấp nhận bản photo",          icon: "check" },
        { text: "Đối chiếu tên trên sổ với CCCD người bán",                  icon: "check" },
        { text: "Tra cứu quy hoạch sổ tại cổng VNPT hoặc cục đất đai tỉnh", icon: "arrow" },
      ],
    },
    transitionIn: "wipe",
  },

  // ─── TIP 2 (13.4 – 17.1s) ────────────────────────────────────────────────
  {
    id:            "tip-2",
    startTime:     13.4,
    endTime:       17.1,
    voiceoverText: "Hai: Tính tỷ lệ nợ trên thu nhập — khoản trả góp không nên vượt quá 40% thu nhập hàng tháng",
    visualType:    "chart",
    aiImage:       "images/beats/five-mistakes-tip-2.jpg",
    content: {
      title: "02 · TÍNH DTI — Khoản Trả Góp / Thu Nhập",
      bars: [
        { label: "Giới hạn an toàn (max)",      value: 40,  max: 100, color: "#3DD68C" },
        { label: "Mức trung bình người mua mới", value: 55,  max: 100, color: "#FBBF24" },
        { label: "Mức nguy hiểm (stress test)",  value: 70,  max: 100, color: "#EF4444" },
      ],
      unit: "%",
    },
    transitionIn: "slide",
  },

  // ─── TIP 3 (17.1 – 22.5s) ────────────────────────────────────────────────
  {
    id:            "tip-3",
    startTime:     17.1,
    endTime:       22.5,
    voiceoverText: "Ba: Khảo sát quy hoạch khu vực tại phòng tài nguyên môi trường quận, tránh mua nhầm đất quy hoạch treo",
    visualType:    "map-pin",
    aiImage:       "images/beats/five-mistakes-tip-3.jpg",
    content: {
      title:    "03 · KHẢO SÁT QUY HOẠCH",
      location: "Phòng TNMT Quận / Huyện",
      highlights: [
        "Đất quy hoạch treo → không được xây, không bán lại dễ",
        "Đất lộ giới → có thể bị thu hồi một phần không bồi thường đủ",
        "Tra cứu online tại cổng thông tin quy hoạch tỉnh",
        "Đặt cọc sau khi có xác nhận quy hoạch bằng văn bản",
      ],
    },
    transitionIn: "wipe",
  },

  // ─── TIP 4 (22.5 – 28.1s) ────────────────────────────────────────────────
  {
    id:            "tip-4",
    startTime:     22.5,
    endTime:       28.1,
    voiceoverText: "Bốn: So sánh giá ít nhất 3 căn cùng khu vực, cùng diện tích trước khi quyết định",
    visualType:    "chart",
    aiImage:       "images/beats/five-mistakes-tip-4.jpg",
    content: {
      title: "04 · SO SÁNH GIÁ — Ít Nhất 3 Căn",
      bars: [
        { label: "Căn A — tầng thấp, hướng Tây", value: 1650, max: 2200 },
        { label: "Căn B — tầng trung, hướng ĐN",  value: 1850, max: 2200 },
        { label: "Căn C — tầng cao, view hồ",      value: 2100, max: 2200 },
      ],
      unit: "triệu VNĐ",
    },
    transitionIn: "slide",
  },

  // ─── TIP 5 (28.1 – 33.4s) ────────────────────────────────────────────────
  {
    id:            "tip-5",
    startTime:     28.1,
    endTime:       33.4,
    voiceoverText: "Năm: Đọc kỹ hợp đồng đặt cọc, đặc biệt điều khoản phạt nếu hủy giao dịch",
    visualType:    "bullet-list",
    aiImage:       "images/beats/five-mistakes-tip-5.jpg",
    content: {
      title: "05 · ĐỌC KỸ HỢP ĐỒNG ĐẶT CỌC",
      bullets: [
        { text: "Điều khoản hủy cọc: người mua mất cọc, người bán hoàn cọc đôi", icon: "warning" },
        { text: "Thời hạn thanh toán đủ + lãi phạt chậm tiến độ",               icon: "warning" },
        { text: "Phải có HĐMB chính thức theo Luật Kinh doanh BĐS 2023",         icon: "check" },
        { text: "Nhờ luật sư hoặc sàn uy tín soát hợp đồng trước khi ký",        icon: "arrow" },
      ],
    },
    transitionIn: "wipe",
  },

  // ─── TÓM TẮT + CTA (33.4 – 41.0s) — audio vẫn phát ─────────────────────
  {
    id:            "summary",
    startTime:     33.4,
    endTime:       41.0,
    voiceoverText: "",
    visualType:    "checklist",
    aiImage:       "images/beats/five-mistakes-summary.jpg",
    content: {
      title: "5 Bước Mua Nhà An Toàn Lần Đầu",
      items: [
        "01 · Kiểm tra sổ đỏ / sổ hồng chính chủ trước khi đặt cọc",
        "02 · Giữ DTI ≤ 40% — khoản trả góp / thu nhập tháng",
        "03 · Khảo sát quy hoạch tại phòng TNMT quận / huyện",
        "04 · So sánh ít nhất 3 căn cùng khu trước khi quyết định",
        "05 · Đọc kỹ HĐ đặt cọc — chú ý điều khoản phạt hủy",
      ],
      ctaText: "batdongsan123.com",
      ctaUrl:  "https://batdongsan123.com",
    },
    transitionIn: "fade",
  },

  // ─── OUTRO SHOWCASE (41.0 – 46.0s) — silent, visual only ─────────────────
  {
    id:            "cta",
    startTime:     41.0,
    endTime:       46.0,
    voiceoverText: "",
    visualType:    "project-showcase",
    aiImage:       "images/beats/five-mistakes-cta.jpg",
    projectRef:    "emerald-golf-view",
    content: {
      highlights: [
        "Pháp lý chuẩn — đã có sổ hồng",
        "10% nhận nhà — chỉ ~260 triệu VNĐ",
        "DTI thấp — phù hợp người mua lần đầu",
      ],
      showBadge: "Đã có sổ hồng",
    },
    transitionIn: "fade",
  },
];
