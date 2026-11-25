import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";

/**
 * Bảng tính KHOẢN VAY — Green Skyline căn 3PN.
 * Vay 3 tỷ · 15 năm (180 tháng) · gốc chia đều, lãi trên dư nợ giảm dần.
 * Lãi 5,5% cố định 24 tháng đầu (CSBH 149/2026), sau đó tạm tính 10%/năm.
 * Giải ngân khi nhận nhà 04/2027 → kỳ trả đầu 05/2027. Thiết kế 1800×2400, render --scale=2.
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["500", "600", "700", "800", "900"], subsets: ["vietnamese", "latin"] });
export const BTV_W = 1800;
export const BTV_H = 1960;

const GREEN = "#0F3B2A", GREEN2 = "#1D5A41", GOLD = "#C9A04A", GOLD_L = "#F3E3B5", INK = "#1C2420", MUTED = "#5E6B64",
  PAPER = "#FAF8F3", LINE = "#E3DDCF", BLUE = "#1F4E79", AMBER = "#9A5B10";

const LOAN = 3_000_000_000, N = 180, FIX_M = 24, R1 = 0.055, R2 = 0.10;
const START = { m: 5, y: 2027 }; // kỳ trả đầu tiên
const mon = (k: number) => { const t = START.m - 1 + (k - 1); return `${String((t % 12) + 1).padStart(2, "0")}/${START.y + Math.floor(t / 12)}`; };
const f = (x: number) => Math.round(x).toLocaleString("de-DE");

type Row = { k: number; open: number; prin: number; int: number; pay: number; rate: number };
const rows: Row[] = [];
{
  let bal = LOAN;
  const g = LOAN / N; // gốc đều (giữ số lẻ để tổng gốc đúng 3 tỷ, chỉ làm tròn khi hiển thị)
  for (let k = 1; k <= N; k++) {
    const rate = k <= FIX_M ? R1 : R2;
    const prin = g;
    const int = (bal * rate) / 12;
    rows.push({ k, open: bal, prin, int, pay: prin + int, rate });
    bal -= prin;
  }
}
const years = Array.from({ length: 15 }, (_, i) => {
  const rs = rows.slice(i * 12, i * 12 + 12);
  return {
    y: i + 1, from: mon(rs[0].k), to: mon(rs[11].k), rate: rs[0].rate, open: rs[0].open,
    prin: rs.reduce((s, r) => s + r.prin, 0), int: rs.reduce((s, r) => s + r.int, 0), pay: rs.reduce((s, r) => s + r.pay, 0),
    hi: rs[0].pay, lo: rs[11].pay,
  };
});
const totInt = rows.reduce((s, r) => s + r.int, 0);
const intFix = rows.slice(0, FIX_M).reduce((s, r) => s + r.int, 0);

const Card: React.FC<{ k: string; v: React.ReactNode; sub?: string }> = ({ k, v, sub }) => (
  <div style={{ flex: 1, background: "#fff", border: `2px solid ${LINE}`, borderRadius: 20, padding: "20px 24px" }}>
    <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: 2, color: MUTED }}>{k}</div>
    <div style={{ fontSize: 38, fontWeight: 900, color: GREEN, marginTop: 6, lineHeight: 1.1 }}>{v}</div>
    {sub && <div style={{ fontSize: 18, fontWeight: 600, color: MUTED, marginTop: 6 }}>{sub}</div>}
  </div>
);

const tr1 = (x: number) => (x / 1e6).toLocaleString("de-DE", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

const Phase: React.FC<{ tag: string; title: string; rate: string; a: number; b: number; la: string; lb: string; c: string; bg: string; note: string }> = ({ tag, title, rate, a, b, la, lb, c, bg, note }) => (
  <div style={{ flex: 1, background: bg, border: `3px solid ${c}`, borderRadius: 26, padding: "30px 34px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 3, color: c }}>{tag}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", background: c, borderRadius: 10, padding: "4px 14px" }}>{rate}</div>
    </div>
    <div style={{ fontSize: 40, fontWeight: 900, color: INK, marginTop: 8 }}>{title}</div>
    <div style={{ fontSize: 22, fontWeight: 700, color: MUTED, marginTop: 22 }}>Mỗi tháng trả (gốc + lãi)</div>
    <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: 6 }}>
      <div>
        <div style={{ fontSize: 84, fontWeight: 900, color: c, letterSpacing: -2, lineHeight: 1 }}>{tr1(a)}<span style={{ fontSize: 36 }}> triệu</span></div>
        <div style={{ fontSize: 19, fontWeight: 700, color: MUTED, marginTop: 6 }}>{la}</div>
      </div>
      <div style={{ fontSize: 46, fontWeight: 800, color: MUTED, paddingBottom: 34 }}>→</div>
      <div>
        <div style={{ fontSize: 56, fontWeight: 900, color: INK, letterSpacing: -1, lineHeight: 1 }}>{tr1(b)}<span style={{ fontSize: 28 }}> triệu</span></div>
        <div style={{ fontSize: 19, fontWeight: 700, color: MUTED, marginTop: 6 }}>{lb}</div>
      </div>
    </div>
    <div style={{ fontSize: 20, fontWeight: 600, color: INK, marginTop: 22, lineHeight: 1.45 }}>{note}</div>
  </div>
);

export const GSLBangTinhVay: React.FC = () => {
  const th: React.CSSProperties = { fontSize: 20, fontWeight: 800, letterSpacing: 1, color: "#fff", padding: "18px 22px", textAlign: "right", whiteSpace: "nowrap" };
  const td: React.CSSProperties = { fontSize: 26, fontWeight: 600, padding: "15px 22px", textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: SANS, color: INK, display: "flex", flexDirection: "column" }}>
      <div style={{ background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN2} 100%)`, padding: "30px 60px", display: "flex", alignItems: "center", gap: 30 }}>
        <div style={{ background: "#FBF7EE", borderRadius: 16, padding: "8px 14px", boxShadow: `0 0 0 4px ${GOLD}` }}>
          <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 78, display: "block" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 5, color: GOLD }}>BẢNG TÍNH TRẢ GÓP NGÂN HÀNG · GREEN SKYLINE</div>
          <div style={{ fontSize: 58, fontWeight: 900, color: "#fff", lineHeight: 1.05, marginTop: 4 }}>
            CĂN 3PN · VAY <span style={{ color: GOLD }}>3 TỶ</span> · 15 NĂM
          </div>
        </div>
        <div style={{ textAlign: "right", color: "#fff" }}>
          <div style={{ fontSize: 20, fontWeight: 700, opacity: 0.8 }}>Tư vấn: Minh Hoàng</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: GOLD }}>0906 827 986</div>
          <div style={{ fontSize: 18, fontWeight: 700, opacity: 0.8 }}>Call / Zalo</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "34px 60px 0", display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: MUTED }}>
          Vay <b style={{ color: GREEN }}>3.000.000.000 đ</b> · giải ngân khi nhận nhà <b style={{ color: GREEN }}>04/2027</b> · bắt đầu trả từ <b style={{ color: GREEN }}>05/2027</b>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <Phase tag="24 THÁNG ĐẦU" title="Đang được ưu đãi" rate="LÃI 5,5% CỐ ĐỊNH" a={rows[0].pay} b={rows[23].pay}
            la={`Tháng đầu · ${mon(1)}`} lb={`Tháng 24 · ${mon(24)}`} c={AMBER} bg="#FBF1E2"
            note="Lãi cố định, không lo biến động. Khoảng 29–30 triệu mỗi tháng." />
          <Phase tag="TỪ THÁNG 25 ĐẾN HẾT" title="Hết ưu đãi" rate="LÃI TẠM TÍNH 10%" a={rows[24].pay} b={rows[179].pay}
            la={`Tháng 25 · ${mon(25)}`} lb={`Tháng cuối · ${mon(180)}`} c={BLUE} bg="#E8EFF6"
            note="Cao nhất ở tháng 25, sau đó mỗi năm giảm khoảng 1,7 triệu/tháng do nợ gốc giảm dần." />
        </div>
        <div style={{ background: GOLD_L, borderRadius: 16, padding: "18px 28px", fontSize: 23, fontWeight: 700, color: GREEN, lineHeight: 1.45 }}>
          Vì sao số tiền giảm dần? Mỗi tháng trả gốc cố định <b style={{ fontWeight: 900 }}>{f(LOAN / N)} đ</b>, lãi chỉ tính trên phần nợ còn lại, nên càng về sau càng trả ít.
        </div>

        <div style={{ background: "#fff", border: `2px solid ${LINE}`, borderRadius: 22, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: GREEN }}>
                <th style={{ ...th, textAlign: "left" }}>NĂM</th>
                <th style={{ ...th, textAlign: "left" }}>THỜI GIAN</th>
                <th style={{ ...th, textAlign: "center" }}>LÃI SUẤT</th>
                <th style={th}>THÁNG ĐẦU NĂM TRẢ</th>
                <th style={th}>THÁNG CUỐI NĂM TRẢ</th>
              </tr>
            </thead>
            <tbody>
              {years.map((y, i) => {
                const fix = y.rate === R1;
                return (
                  <tr key={i} style={{ background: fix ? "#FBF1E2" : i % 2 ? "#FAF8F3" : "#fff", borderTop: `1.5px solid ${LINE}` }}>
                    <td style={{ ...td, textAlign: "left", fontWeight: 900, color: GREEN }}>Năm {y.y}</td>
                    <td style={{ ...td, textAlign: "left", color: MUTED, fontSize: 23 }}>{y.from} – {y.to}</td>
                    <td style={{ ...td, textAlign: "center", fontWeight: 800, color: fix ? AMBER : BLUE }}>{fix ? "5,5% ưu đãi" : "10% tạm tính"}</td>
                    <td style={{ ...td, fontWeight: 800 }}>{f(y.hi)} đ</td>
                    <td style={td}>{f(y.lo)} đ</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ padding: "22px 60px 30px", fontSize: 17, fontWeight: 500, color: MUTED, lineHeight: 1.5 }}>
        Tạm tính ngày 18/11/2026 theo chính sách bán hàng 149/2026. Lãi 5,5% cố định 24 tháng theo gói hỗ trợ của CĐT và ngân hàng liên kết (Shinhan · VCB · VietinBank).
        Sau 24 tháng lãi thả nổi theo ngân hàng, bảng dùng mức tham khảo 10%/năm. Số tiền mỗi tháng tạm tính = gốc đều + dư nợ × lãi năm ÷ 12; số thực tế theo hợp đồng tín dụng.
        Hạn mức và thời hạn vay theo thẩm định của ngân hàng.
      </div>
    </AbsoluteFill>
  );
};
