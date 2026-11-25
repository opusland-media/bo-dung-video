/* Dữ liệu kịch bản + cảnh cho GSLCSToanBo (không import remotion để chạy kiểm tra bằng node). */
export const FPS = 30;
import { VOICE_SEGS } from "./GSLCSVoice";
export const CS_SEGS: string[] = VOICE_SEGS;
const SYL: Record<string, number> = {
  "1PN+": 4, "2PN": 3, "2PN+": 4, "3PN": 3, T1: 2, T2: 2, "6%": 3, "7%": 3, "8%": 3, "9%": 3, "3%": 3, "1%": 3,
  "10%": 4, "1,5%": 5, "5,5%": 5, "0%": 3, "50%": 5, "70%": 5, "72": 3, "12": 2, "24": 3, "18": 2, "269": 6, "69": 3,
  sofa: 2, studio: 3, Deluxe: 2, Penthouse: 2, full: 1,
};
export const tok = (s: string) => s.split(/\s+/).filter(Boolean);
const clean = (w: string) => w.replace(/[.,;:?!]+$/, "");
const syl = (w: string) => SYL[clean(w)] ?? (/\d/.test(w) ? clean(w).length : 1);
export type WordTimes = number[][]; // giây, mỗi câu một mảng mốc đầu từ
const LEAD = 0.35, GAP = 0.32, RATE = 4.1;
export const estimateWords = (): { words: WordTimes; end: number } => {
  let t = LEAD;
  const words: WordTimes = [];
  for (const sg of CS_SEGS) {
    const ws = tok(sg);
    const arr: number[] = [];
    for (const w of ws) { arr.push(t); t += syl(w) / RATE; }
    words.push(arr);
    t += GAP + (/[.?!]$/.test(sg) ? 0.08 : 0);
  }
  return { words, end: t };
};

export type At = [number, string, number?]; // [câu, từ bắt đầu bằng, lần thứ]
export type PinD = { at: At; u: number; v: number; dx: number; dy: number; text: string; side?: "l" | "r" };
/* một nhát cắt trong cùng ảnh: tâm khung (fx, fy theo tỉ lệ ảnh) + độ phóng */
export type Cut = { at: At; fx?: number; fy?: number; z?: number; dfx?: number };
export type ShotD = {
  at: At; img?: string; iw?: number; ih?: number;
  cuts?: Cut[]; whip?: boolean;
  pins?: PinD[]; room?: string;
  cap?: { at: At; kicker: string; big?: string; bigAt?: At; unit?: string; note?: string; noteAt?: At };
  head?: { idx: string; title: string; sub?: string; subAt?: At };
  sheet?: { rows: { k: string; v: string; at: At; hi?: boolean }[]; zoomAt?: At[] };
  shadeB?: number; shadeT?: number;
};
const IS: Record<string, [number, number]> = {};
for (let i = 1; i <= 28; i++) IS[`p${String(i).padStart(2, "0")}`] = i <= 6 ? [2048, 1366] : i <= 21 ? [2560, 1707] : [2048, 1365];
const QS: [number, number][] = [[810, 1080], [810, 1080], [1280, 960], [1107, 1476], [1477, 1108], [1107, 1476], [1107, 1476], [1477, 1108], [1477, 1108]];
QS.forEach((s, i) => (IS[`q0${i + 1}`] = s));
const ph = (id: string) => ({ img: `images/gslcs/${id}.jpg`, iw: IS[id][0], ih: IS[id][1] });
const c = (at: At, fx = 0.5, fy = 0.5, z = 1.04, dfx?: number): Cut => ({ at, fx, fy, z, dfx });

/* khung hình tại frame f (tính từ đầu shot): mỗi nhát cắt có một cú đẩy máy ngắn */
export const W = 1080, H = 1920;
const cl = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
export const framing = (iw: number, ih: number, cuts: { from: number; fx: number; fy: number; z: number; dfx?: number }[], f: number, dur: number) => {
  let k = 0;
  for (let i = 0; i < cuts.length; i++) if (f >= cuts[i].from) k = i;
  const cu = cuts[k];
  const end = k + 1 < cuts.length ? cuts[k + 1].from : dur;
  const t0 = cl((f - cu.from) / Math.max(1, end - cu.from), 0, 1);
  const t = Math.sin((t0 * Math.PI) / 2); // chậm dần
  const z = cu.z * (1 + 0.045 * t);
  const fx = cu.fx + (cu.dfx ?? (k % 2 ? -0.015 : 0.015)) * t;
  const sc = (H / ih) * z, dw = iw * sc, dh = ih * sc;
  const ox = cl(W / 2 - fx * dw, W - dw, 0), oy = cl(H / 2 - cu.fy * dh, H - dh, 0);
  return { ox, oy, dw, dh, k };
};

export const CS_SHOTS: ShotD[] = [
  /* ---------- MỞ ĐẦU: cắt theo nhịp giọng ---------- */
  { at: [0, "Mua"], ...ph("q01"), cuts: [c([0, "Mua"], 0.5, 0.45, 1.0, 0)] },
  { at: [0, "lúc"], ...ph("q07"), cuts: [c([0, "lúc"], 0.5, 0.4, 1.02)] },
  { at: [0, "ưu"], whip: true, ...ph("p26"), cuts: [c([0, "ưu"], 0.5, 0.5, 1.02), c([0, "những"], 0.6, 0.45, 1.25)] },
  { at: [1, "sau"], whip: true, ...ph("q05"), cuts: [c([1, "sau"], 0.5, 0.5, 1.0), c([1, "toàn"], 0.5, 0.58, 1.22)] },
  { at: [1, "chính"], ...ph("q02"), cuts: [c([1, "chính"], 0.5, 0.55, 1.02)] },
  { at: [1, "dành"], ...ph("p25"), cuts: [c([1, "dành"], 0.45, 0.5, 1.05)] },
  { at: [1, "những"], ...ph("p13"), cuts: [c([1, "những"], 0.45, 0.5, 1.06)] },
  { at: [1, "đang"], ...ph("p17"), cuts: [c([1, "đang"], 0.5, 0.5, 1.06)] },
  { at: [1, "đến"], whip: true, ...ph("q04"), cuts: [c([1, "đến"], 0.5, 0.45, 1.0), c([1, "Green"], 0.5, 0.35, 1.18)] },

  /* ---------- 01 ƯU ĐÃI TÂN GIA ---------- */
  { at: [2, "Đầu"], whip: true, ...ph("p06"), cuts: [c([2, "Đầu"], 0.5, 0.5, 1.04), c([3, "chọn"], 0.45, 0.55, 1.22)],
    head: { idx: "01 / 03", title: "Ưu đãi tân gia", sub: "CHỌN 1 TRONG 4", subAt: [3, "chọn"] } },
  { at: [4, "căn"], ...ph("p07"), shadeB: 0.62, cuts: [c([4, "căn"], 0.5, 0.5, 1.03), c([4, "6"], 0.58, 0.45, 1.2), c([5, "kèm"], 0.7, 0.55, 1.12)],
    cap: { at: [4, "căn"], kicker: "1PN+ · 2PN · THÁP T1", big: "6%", bigAt: [4, "6"], unit: "chiết khấu", note: "Kèm gói full nội thất", noteAt: [5, "kèm"] } },
  { at: [6, "Phòng"], ...ph("p08"), room: "PHÒNG KHÁCH",
    cuts: [c([6, "Phòng"], 0.48, 0.5, 1.03), c([6, "sofa"], 0.6, 0.55, 1.32), c([6, "kệ"], 0.37, 0.47, 1.32)],
    pins: [
      { at: [6, "sofa"], u: 0.61, v: 0.57, dx: -170, dy: 230, text: "Sofa" },
      { at: [6, "kệ"], u: 0.355, v: 0.47, dx: 160, dy: -250, text: "Kệ tivi" },
    ] },
  { at: [6, "máy"], ...ph("p18"), room: "PHÒNG KHÁCH", cuts: [c([6, "máy"], 0.68, 0.3, 1.25)],
    pins: [{ at: [6, "máy"], u: 0.71, v: 0.205, dx: -190, dy: 200, text: "Máy lạnh" }] },
  { at: [7, "bếp"], ...ph("p20"), room: "BẾP",
    cuts: [c([7, "bếp"], 0.25, 0.5, 1.03), c([7, "tủ"], 0.3, 0.45, 1.3), c([7, "bếp", 1], 0.17, 0.58, 1.3)],
    pins: [
      { at: [7, "tủ"], u: 0.30, v: 0.43, dx: 90, dy: -250, text: "Tủ lạnh" },
      { at: [7, "bếp", 1], u: 0.13, v: 0.58, dx: 140, dy: -220, text: "Bếp từ" },
    ] },
  { at: [7, "bàn"], ...ph("p20"), room: "BẾP", cuts: [c([7, "bàn"], 0.6, 0.55, 1.3, -0.01)],
    pins: [{ at: [7, "bàn"], u: 0.62, v: 0.56, dx: -40, dy: 270, side: "r", text: "Bàn ăn" }] },
  { at: [8, "Phòng"], ...ph("p12"), room: "PHÒNG NGỦ",
    cuts: [c([8, "Phòng"], 0.5, 0.5, 1.03), c([8, "giường"], 0.5, 0.68, 1.3), c([8, "tủ"], 0.6, 0.4, 1.3), c([8, "máy"], 0.4, 0.3, 1.3)],
    pins: [
      { at: [8, "giường"], u: 0.5, v: 0.78, dx: -80, dy: -220, text: "Giường, nệm" },
      { at: [8, "tủ"], u: 0.6, v: 0.36, dx: 120, dy: 250, text: "Tủ quần áo" },
      { at: [8, "máy"], u: 0.39, v: 0.25, dx: 120, dy: 250, text: "Máy lạnh" },
    ] },
  { at: [9, "căn"], ...ph("p15"), shadeB: 0.62, cuts: [c([9, "căn"], 0.5, 0.5, 1.03)],
    cap: { at: [9, "căn"], kicker: "2PN+ · 3PN · THÁP T1" } },
  { at: [10, "Ở"], ...ph("q06"), shadeB: 0.62, cuts: [c([10, "Ở"], 0.5, 0.4, 1.0), c([10, "7"], 0.5, 0.3, 1.16)],
    cap: { at: [9, "căn"], kicker: "2PN+ · 3PN · THÁP T1", big: "7%", bigAt: [10, "7"], unit: "chiết khấu" } },
  { at: [11, "tặng"], ...ph("p21"), room: "QUÀ TẶNG", cuts: [c([11, "tặng"], 0.78, 0.46, 1.28)],
    pins: [{ at: [11, "tủ"], u: 0.79, v: 0.46, dx: -150, dy: 250, text: "Tủ lạnh" }] },
  { at: [11, "máy"], ...ph("p09"), room: "QUÀ TẶNG", cuts: [c([11, "máy"], 0.67, 0.45, 1.18), c([11, "máy", 1], 0.67, 0.32, 1.32)],
    pins: [
      { at: [11, "máy"], u: 0.69, v: 0.5, dx: -160, dy: 200, text: "Máy giặt" },
      { at: [11, "máy", 1], u: 0.69, v: 0.28, dx: -200, dy: 220, text: "Máy sấy" },
    ] },
  { at: [12, "kèm"], ...ph("p14"), room: "QUÀ TẶNG", shadeB: 0.55, cuts: [c([12, "kèm"], 0.58, 0.32, 1.28), c([12, "tất"], 0.55, 0.5, 1.02)],
    pins: [{ at: [12, "máy"], u: 0.577, v: 0.3, dx: 110, dy: 230, text: "Máy lạnh" }],
    cap: { at: [12, "tất"], kicker: "MÁY LẠNH", note: "Cho tất cả các phòng", noteAt: [12, "tất"] } },
  { at: [13, "Khối"], ...ph("q03"), shadeB: 0.62, cuts: [c([13, "Khối"], 0.5, 0.5, 1.0)],
    cap: { at: [13, "Khối"], kicker: "KHỐI ĐẾ · DELUXE · PENTHOUSE" } },
  { at: [13, "Penthouse"], ...ph("q01"), shadeB: 0.62, cuts: [c([13, "Penthouse"], 0.5, 0.12, 1.28), c([13, "7"], 0.5, 0.25, 1.08)],
    cap: { at: [13, "Khối"], kicker: "KHỐI ĐẾ · DELUXE · PENTHOUSE", big: "7%", bigAt: [13, "7"], unit: "chiết khấu" } },
  { at: [14, "còn"], ...ph("p23"), shadeB: 0.62, cuts: [c([14, "còn"], 0.5, 0.5, 1.03), c([14, "8"], 0.45, 0.5, 1.2)],
    cap: { at: [14, "còn"], kicker: "CÁC CĂN CÒN LẠI", big: "8%", bigAt: [14, "8"], unit: "chiết khấu" } },

  /* ---------- 02 CỘNG THÊM ---------- */
  { at: [15, "Ngoài"], whip: true, ...ph("p28"), cuts: [c([15, "Ngoài"], 0.5, 0.5, 1.04), c([15, "cộng"], 0.58, 0.55, 1.22)], head: { idx: "02 / 03", title: "Cộng thêm" } },
  { at: [16, "đóng"], ...ph("p05"), shadeB: 0.62, cuts: [c([16, "đóng"], 0.45, 0.5, 1.03), c([16, "trong"], 0.52, 0.45, 1.15), c([16, "1", 1], 0.5, 0.4, 1.28)],
    cap: { at: [16, "đóng"], kicker: "ĐÓNG ĐỦ 10% TRONG 72 GIỜ", big: "+1%", bigAt: [16, "1", 1] } },
  { at: [17, "Mua"], ...ph("q08"), shadeB: 0.62, cuts: [c([17, "Mua"], 0.5, 0.5, 1.0), c([17, "1"], 0.5, 0.4, 1.18)],
    cap: { at: [17, "Mua"], kicker: "MUA CÙNG LÚC 2 CĂN", big: "+1%", bigAt: [17, "1"] } },
  { at: [18, "hoặc"], ...ph("p01"), shadeB: 0.62, cuts: [c([18, "hoặc"], 0.5, 0.5, 1.03), c([18, "1"], 0.42, 0.5, 1.22)],
    cap: { at: [18, "từ"], kicker: "TỪ 3 CĂN TRỞ LÊN", big: "+1,5%", bigAt: [18, "1"] } },

  /* ---------- 03 THANH TOÁN ---------- */
  { at: [19, "Phần"], whip: true, ...ph("p27"), cuts: [c([19, "Phần"], 0.5, 0.5, 1.04), c([19, "lớn"], 0.5, 0.55, 1.25)], head: { idx: "03 / 03", title: "Cách thanh toán" } },
  { at: [20, "cách"], ...ph("p03"), shadeB: 0.62, cuts: [c([20, "cách"], 0.5, 0.5, 1.03), c([20, "nhanh"], 0.56, 0.5, 1.15), c([20, "9"], 0.5, 0.45, 1.3)],
    cap: { at: [20, "cách"], kicker: "THANH TOÁN NHANH", big: "+9%", bigAt: [20, "9"], unit: "chiết khấu" } },
  { at: [21, "Cách"], whip: true, ...ph("p22"), shadeB: 0.62, cuts: [c([21, "Cách"], 0.5, 0.5, 1.03), c([21, "3"], 0.45, 0.5, 1.22)],
    cap: { at: [21, "Cách"], kicker: "THANH TOÁN CHUẨN", big: "+3%", bigAt: [21, "3"], unit: "chiết khấu" } },
  { at: [22, "còn"], ...ph("p24"), shadeB: 0.62, cuts: [c([22, "còn"], 0.5, 0.5, 1.03), c([22, "không"], 0.56, 0.5, 1.2)],
    cap: { at: [22, "còn"], kicker: "VAY NGÂN HÀNG", note: "Không áp dụng chiết khấu thanh toán", noteAt: [22, "không"] } },
  { at: [23, "Vay"], ...ph("p10"), shadeB: 0.62, cuts: [c([23, "Vay"], 0.52, 0.5, 1.03), c([23, "2"], 0.48, 0.5, 1.2)],
    cap: { at: [23, "Vay"], kicker: "VAY 70%", big: "2", bigAt: [23, "2"], unit: "lựa chọn hỗ trợ lãi" } },
  { at: [24, "1"], ...ph("p11"), shadeB: 0.62, cuts: [c([24, "1"], 0.5, 0.5, 1.03), c([24, "0"], 0.56, 0.48, 1.2), c([24, "12"], 0.45, 0.55, 1.12)],
    cap: { at: [24, "1"], kicker: "VAY 70% · LỰA CHỌN 1", big: "0%", bigAt: [24, "0"], unit: "lãi suất", note: "Trong 12 tháng", noteAt: [24, "12"] } },
  { at: [25, "2"], ...ph("p16"), shadeB: 0.62, cuts: [c([25, "2"], 0.5, 0.5, 1.03), c([25, "5"], 0.45, 0.5, 1.2), c([25, "24"], 0.55, 0.45, 1.1)],
    cap: { at: [25, "2"], kicker: "VAY 70% · LỰA CHỌN 2", big: "5,5%", bigAt: [25, "5"], unit: "cố định", note: "Trong 24 tháng", noteAt: [25, "24"] } },
  { at: [26, "Vay"], ...ph("p19"), shadeB: 0.62, cuts: [c([26, "Vay"], 0.5, 0.5, 1.03), c([26, "0"], 0.56, 0.5, 1.2), c([27, "18"], 0.45, 0.5, 1.1)],
    cap: { at: [26, "Vay"], kicker: "VAY 50%", big: "0%", bigAt: [26, "0"], unit: "lãi suất", note: "Tối đa 18 tháng", noteAt: [27, "18"] } },
  { at: [28, "ví"], whip: true, sheet: { zoomAt: [[29, "chọn"]], rows: [
    { k: "CÁCH THANH TOÁN", v: "Vay ngân hàng", at: [29, "vay"] },
    { k: "GIÁ SAU CHIẾT KHẤU", v: "≈ 2,69 tỷ", at: [29, "2"] },
    { k: "ĐÓNG 10%", v: "≈ 269 triệu", at: [30, "10"], hi: true },
  ] } },
  { at: [31, "rồi"], ...ph("q09"), shadeB: 0.62, cuts: [c([31, "rồi"], 0.5, 0.5, 1.0), c([31, "nhận"], 0.5, 0.5, 1.15)],
    cap: { at: [31, "rồi"], kicker: "ĐÓNG TIẾP", note: "Khi nhận nhà", noteAt: [31, "nhận"] } },
  { at: [32, "Tháng"], whip: true, ...ph("q02"), shadeB: 0.62, cuts: [c([32, "Tháng"], 0.5, 0.5, 1.02), c([32, "nhận"], 0.5, 0.42, 1.15)],
    cap: { at: [32, "Tháng"], kicker: "NHẬN NHÀ", big: "4/2027", bigAt: [32, "4"] } },
  { at: [33, "anh"], whip: true, ...ph("q04"), shadeB: 0.62, cuts: [c([33, "anh"], 0.5, 0.42, 1.04)],
    cap: { at: [33, "anh"], kicker: "NHẮN LOẠI CĂN ANH CHỊ THÍCH" } },
  { at: [33, "gửi"], ...ph("p18"), shadeB: 0.62, cuts: [c([33, "gửi"], 0.5, 0.5, 1.04), c([33, "dòng"], 0.62, 0.45, 1.2), c([33, "từng"], 0.4, 0.5, 1.1)],
    cap: { at: [33, "anh"], kicker: "NHẮN LOẠI CĂN ANH CHỊ THÍCH", note: "Nhận bảng tính dòng tiền chi tiết", noteAt: [33, "gửi"] } },
];

/* lớp chữ mở đầu (đè lên các nhát cắt) */
export const HOOK = {
  l1: [0, "Mua"] as At, l2: [0, "ưu"] as At, chips: [0, "gì"] as At, out1: [1, "sau"] as At,
  t1: [1, "tổng"] as At, t2: [1, "toàn"] as At, s: [[1, "chính"], [1, "sách"], [1, "bán"]] as At[], out2: [1, "dành"] as At,
  name: [1, "Green"] as At, out3: [2, "Đầu"] as At,
};

const norm = (w: string) => clean(w).toLowerCase();
export const mkWT = (words: WordTimes) => (a: At): number => {
  const [si, w, nth = 0] = a;
  const ws = tok(CS_SEGS[si]);
  let k = -1, c = 0;
  for (let i = 0; i < ws.length; i++) if (norm(ws[i]).startsWith(norm(w))) { if (c === nth) { k = i; break; } c++; }
  if (k < 0) throw new Error(`Không thấy từ "${w}" trong câu ${si}`);
  return Math.round(words[si][k] * FPS);
};

