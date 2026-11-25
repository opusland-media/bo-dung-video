import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { UNITS } from "./GSLBangTinhCan";

/**
 * Bảng tính NGANG 3 phương án (Nhanh · Chuẩn · Vay 70%) — Green Skyline.
 * Thiết kế 2400×1500, render --scale=2 → 4800×3000.
 * Số liệu: giỏ hàng độc quyền 13/11/2026, CSBH 149/2026. VAT tạm tính ×1,0908, KPBT 2% giá sau CK chưa VAT.
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["500", "600", "700", "800", "900"], subsets: ["vietnamese", "latin"] });

export const BTN_W = 2400;
export const BTN_H = 1700;

// mặt bằng tổng + khung vị trí căn (toạ độ theo tỉ lệ ảnh mặt bằng)
const PLAN: Record<string, { src: string; name: string; x0: number; y0: number; x1: number; y1: number }> = {
  studio: { src: "images/btgsl/plan_9_27.jpg", name: "MẶT BẰNG TẦNG 9 – 27", x0: 921 / 2450, y0: 983 / 1730, x1: 1043 / 2450, y1: 1058 / 1730 },
  "3pn": { src: "images/btgsl/plan_9_27.jpg", name: "MẶT BẰNG TẦNG 9 – 27", x0: 1068 / 2450, y0: 1380 / 1730, x1: 1185 / 2450, y1: 1495 / 1730 },
  "3pn-t3a": { src: "images/btgsl/plan_9_27.jpg", name: "MẶT BẰNG TẦNG 9 – 27", x0: 1392 / 2450, y0: 344 / 1730, x1: 1522 / 2450, y1: 474 / 1730 },
  "2pnp-t1": { src: "images/btgsl/plan_9_27.jpg", name: "MẶT BẰNG TẦNG 9 – 27", x0: 2020 / 2450, y0: 1105 / 1730, x1: 2178 / 2450, y1: 1248 / 1730 },
  "1pn": { src: "images/btgsl/plan_4_8.jpg", name: "MẶT BẰNG TẦNG 4 – 8", x0: 921 / 2446, y0: 910 / 1730, x1: 1043 / 2446, y1: 986 / 1730 },
};

const GREEN = "#0F3B2A";
const GREEN2 = "#1D5A41";
const GOLD = "#C9A04A";
const GOLD_L = "#F3E3B5";
const INK = "#1C2420";
const MUTED = "#5E6B64";
const PAPER = "#FAF8F3";
const LINE = "#E3DDCF";
const BLUE = "#1F4E79";
const RED = "#B3261E";
const AMBER = "#9A5B10";

const V = 1.0908;
const r = (x: number) => Math.round(x / 1000) * 1000;
const fm = (x: number) => r(x).toLocaleString("de-DE") + " đ";
const tr = (x: number) => (x >= 1e9 ? (Math.round(x / 1e7) / 100).toLocaleString("de-DE") + " tỷ" : Math.round(x / 1e6).toLocaleString("de-DE") + " triệu");

type Step = { t: string; sub?: string; pct: string; amt: number; bank?: boolean };

const Col: React.FC<{
  n: string; title: string; color: string; ck: string; head: [string, string][]; total: number; steps: Step[];
  before: number; handover: string; note: React.ReactNode; best?: string;
}> = ({ n, title, color, ck, head, total, steps, before, handover, note, best }) => (
  <div style={{ flex: 1, minWidth: 0, background: "#fff", borderRadius: 24, overflow: "hidden", border: `2px solid ${LINE}`, boxShadow: "0 6px 22px rgba(15,59,42,0.10)", display: "flex", flexDirection: "column", position: "relative" }}>
    <div style={{ background: color, padding: "20px 26px 18px", color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 3, opacity: 0.85 }}>PHƯƠNG ÁN {n}</div>
        {best && <div style={{ background: GOLD, color: INK, fontSize: 16, fontWeight: 900, borderRadius: 999, padding: "5px 14px", letterSpacing: 1 }}>{best}</div>}
      </div>
      <div style={{ fontSize: 36, fontWeight: 900, marginTop: 2, whiteSpace: "nowrap" }}>{title}</div>
      <div style={{ fontSize: 19, fontWeight: 700, marginTop: 4, color: GOLD_L }}>{ck}</div>
    </div>
    <div style={{ padding: "14px 26px 4px" }}>
      {head.map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0", borderBottom: `1.5px dashed ${LINE}`, fontSize: 20 }}>
          <span style={{ color: MUTED, fontWeight: 600 }}>{k}</span>
          <span style={{ fontWeight: 700, color: INK, fontVariantNumeric: "tabular-nums" }}>{v}</span>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, padding: "12px 16px", background: GOLD_L, borderRadius: 14 }}>
        <span style={{ fontSize: 19, fontWeight: 800, whiteSpace: "nowrap" }}>Tổng thanh toán</span>
        <span style={{ fontSize: 25, fontWeight: 900, color: GREEN, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fm(total)}</span>
      </div>
    </div>
    <div style={{ padding: "12px 26px 0", fontSize: 17, fontWeight: 800, letterSpacing: 2.5, color }}>LỊCH THANH TOÁN</div>
    <div style={{ padding: "4px 26px 0" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", padding: "9px 0", borderBottom: `1.5px solid ${LINE}`, background: s.bank ? "#EEF3F8" : "transparent", margin: s.bank ? "0 -10px" : 0, paddingLeft: s.bank ? 10 : 0, paddingRight: s.bank ? 10 : 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.bank ? BLUE : INK }}>{s.t}</div>
            {s.sub && <div style={{ fontSize: 15.5, fontWeight: 500, color: MUTED, marginTop: 2 }}>{s.sub}</div>}
          </div>
          <div style={{ width: 64, textAlign: "center", fontSize: 20, fontWeight: 800, color: s.bank ? BLUE : color }}>{s.pct}</div>
          <div style={{ width: 196, textAlign: "right", fontSize: 21, fontWeight: 800, color: s.bank ? BLUE : INK, fontVariantNumeric: "tabular-nums" }}>{fm(s.amt)}</div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: "auto", padding: "14px 26px 22px" }}>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1.25, background: `${color}12`, border: `2px solid ${color}33`, borderRadius: 14, padding: "10px 14px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: MUTED, whiteSpace: "nowrap" }}>Đóng trước nhận nhà</div>
          <div style={{ fontSize: 25, fontWeight: 900, color, marginTop: 2 }}>~{tr(before)}</div>
        </div>
        <div style={{ flex: 1, background: `${color}12`, border: `2px solid ${color}33`, borderRadius: 14, padding: "10px 14px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: MUTED, whiteSpace: "nowrap" }}>Nhận nhà dự kiến</div>
          <div style={{ fontSize: 25, fontWeight: 900, color, marginTop: 2 }}>{handover}</div>
        </div>
      </div>
      <div style={{ fontSize: 16.5, color: MUTED, fontWeight: 600, lineHeight: 1.45, marginTop: 10 }}>{note}</div>
    </div>
  </div>
);

export const GSLBangTinhNgang: React.FC<{ unit: string }> = ({ unit }) => {
  const u = UNITS[unit];
  const CK = u.ck ?? 0.91, TG = u.tg ?? "8%";
  // VAT: theo phiếu tính giá CĐT nếu có NFA (trừ giá trị đất 5.327.432 đ/m² NFA), không thì ×1,0908
  const vat = (g: number) => (u.nfaN ? g + (g - 5327432 * u.nfaN) * 0.1 : g * V);
  const n0 = u.ny * CK * 0.91, nV = vat(n0), nK = n0 * 0.02;
  const c0 = u.ny * CK * 0.97, cV = vat(c0), cK = c0 * 0.02;
  const v0 = u.vay * CK, vV = vat(v0), vK = v0 * 0.02;
  const dot1 = "Gồm 50 triệu giữ chỗ · đủ trong 72 giờ";
  const nSteps: Step[] = [
    { t: "Đợt 1 · Ký HĐMB", sub: dot1, pct: "10%", amt: nV * 0.1 },
    { t: "Đợt 2", sub: "Trong 4 ngày sau ký HĐMB", pct: "30%", amt: nV * 0.3 },
    { t: "Nhận nhà", sub: "Dự kiến 04/2027 · gồm phí bảo trì", pct: "55%", amt: nV * 0.55 + nK },
    { t: "Nhận sổ hồng", pct: "5%", amt: nV * 0.05 },
  ];
  const cSteps: Step[] = [
    { t: "Đợt 1 · Ký HĐMB", sub: dot1, pct: "10%", amt: cV * 0.1 },
    ...[2, 3, 4, 5, 6, 7].map((k) => ({ t: `Đợt ${k}`, sub: `${(k - 1) * 2} tháng sau ký HĐMB`, pct: "5%", amt: cV * 0.05 })),
    { t: "Nhận nhà", sub: "Dự kiến 12/2027 · gồm phí bảo trì", pct: "55%", amt: cV * 0.55 + cK },
    { t: "Nhận sổ hồng", pct: "5%", amt: cV * 0.05 },
  ];
  const vSteps: Step[] = [
    { t: "Đợt 1 · Ký HĐMB", sub: dot1, pct: "10%", amt: vV * 0.1 },
    { t: "Nhận nhà", sub: "Dự kiến 04/2027 · gồm phí bảo trì", pct: "15%", amt: vV * 0.15 + vK },
    { t: "NH giải ngân", sub: "Shinhan · VCB · VietinBank", pct: "70%", amt: vV * 0.7, bank: true },
    { t: "Nhận sổ hồng", pct: "5%", amt: vV * 0.05 },
  ];
  const pl = PLAN[unit];
  const LW = 720;
  const layoutMaxH = 740;
  const lh = Math.min(layoutMaxH, (LW * u.layoutH) / u.layoutW);
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: SANS, color: INK, display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN2} 100%)`, padding: "30px 60px", display: "flex", alignItems: "center", gap: 30 }}>
        <div style={{ background: "#FBF7EE", borderRadius: 16, padding: "8px 14px", boxShadow: `0 0 0 4px ${GOLD}` }}>
          <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 78, display: "block" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 5, color: GOLD }}>BẢNG TÍNH 3 PHƯƠNG ÁN THANH TOÁN · GREEN SKYLINE</div>
          <div style={{ fontSize: 60, fontWeight: 900, color: "#fff", lineHeight: 1.05, marginTop: 4 }}>
            CĂN {u.type} <span style={{ color: GOLD }}>{u.code}</span>
          </div>
        </div>
        <div style={{ textAlign: "right", color: "#fff" }}>
          <div style={{ fontSize: 20, fontWeight: 700, opacity: 0.8 }}>Tư vấn: Minh Hoàng</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: GOLD }}>0906 827 986</div>
          <div style={{ fontSize: 18, fontWeight: 700, opacity: 0.8 }}>Call / Zalo</div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", gap: 30, padding: "28px 60px 0", minHeight: 0 }}>
        {/* CỘT TRÁI */}
        <div style={{ width: LW, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ background: "#fff", border: `2px solid ${LINE}`, borderRadius: 22, overflow: "hidden", position: "relative", height: lh, display: "flex", justifyContent: "center" }}>
            <Img src={staticFile(u.layout)} style={{ height: lh, width: (lh * u.layoutW) / u.layoutH, display: "block" }} />
            <div style={{ position: "absolute", left: 14, top: 14, background: GREEN, color: "#fff", borderRadius: 10, padding: "7px 14px", fontSize: 19, fontWeight: 800 }}>LAYOUT {u.mau.toUpperCase()}</div>
            <div style={{ position: "absolute", left: 14, bottom: 10, fontSize: 15, fontWeight: 600, color: MUTED }}>Nội thất mang tính minh họa</div>
          </div>
          <div style={{ background: "#fff", border: `2px solid ${LINE}`, borderRadius: 22, overflow: "hidden" }}>
            <div style={{ position: "relative", width: LW - 4, height: ((LW - 4) * 1730) / 2450 }}>
              <Img src={staticFile(pl.src)} style={{ width: "100%", height: "100%", display: "block" }} />
              <div style={{ position: "absolute", left: `${pl.x0 * 100}%`, top: `${pl.y0 * 100}%`, width: `${(pl.x1 - pl.x0) * 100}%`, height: `${(pl.y1 - pl.y0) * 100}%`, border: "4px solid #D62828", borderRadius: 3, boxShadow: "0 0 0 3px rgba(255,255,255,0.9), 0 0 18px rgba(214,40,40,0.55)" }} />
              {pl.x1 > 0.8 ? (
              <div style={{ position: "absolute", right: `${(1 - pl.x0) * 100 + 0.8}%`, top: `${((pl.y0 + pl.y1) / 2) * 100}%`, transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                <div style={{ background: "#D62828", color: "#fff", fontSize: 17, fontWeight: 900, borderRadius: 8, padding: "6px 12px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}>CĂN {u.code}</div>
                <div style={{ width: 0, height: 0, borderTop: "11px solid transparent", borderBottom: "11px solid transparent", borderLeft: "14px solid #D62828" }} />
              </div>
              ) : (
              <div style={{ position: "absolute", left: `${pl.x1 * 100 + 0.8}%`, top: `${((pl.y0 + pl.y1) / 2) * 100}%`, transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                <div style={{ width: 0, height: 0, borderTop: "11px solid transparent", borderBottom: "11px solid transparent", borderRight: "14px solid #D62828" }} />
                <div style={{ background: "#D62828", color: "#fff", fontSize: 17, fontWeight: 900, borderRadius: 8, padding: "6px 12px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}>CĂN {u.code}</div>
              </div>
              )}
            </div>
            <div style={{ padding: "8px 18px 10px", fontSize: 16, fontWeight: 700, color: GREEN, borderTop: `1.5px solid ${LINE}` }}>{pl.name} · Căn {u.code}: {u.wing ?? "tháp T2, dãy nhìn về TP.HCM"}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
            {[["Vị trí", `${u.floor} · ${u.tower.replace("Tháp ", "")}`], ["View", u.viewShort ?? "TP.HCM"], ["Tim tường", `${u.gfa} m²`], ["Thông thủy", `${u.nfa} m²`]].map(([k, v]) => (
              <div key={k} style={{ background: "#fff", border: `2px solid ${LINE}`, borderRadius: 14, padding: "10px 12px" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: MUTED }}>{k}</div>
                <div style={{ fontSize: 21, fontWeight: 800, color: GREEN, marginTop: 2, whiteSpace: "nowrap" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 PHƯƠNG ÁN */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ background: "#fff", border: `2px solid ${LINE}`, borderRadius: 20, padding: "16px 26px", display: "flex", alignItems: "center", gap: 30 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: GREEN, letterSpacing: 1 }}>GIÁ NIÊM YẾT (CHƯA VAT)</div>
            <div style={{ fontSize: 21, marginTop: 4 }}><span style={{ color: MUTED, fontWeight: 600 }}>Không vay </span><b>{r(u.ny).toLocaleString("de-DE")} đ{u.nyNote ?? ""}</b><span style={{ color: MUTED, fontWeight: 600 }}>  ·  Có vay </span><b>{r(u.vay).toLocaleString("de-DE")} đ</b></div>
          </div>
          <div style={{ width: 2, alignSelf: "stretch", background: LINE }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: GREEN, letterSpacing: 1 }}>CHIẾT KHẤU</div>
            <div style={{ fontSize: 19.5, fontWeight: 600, marginTop: 4 }}>Tân gia <b style={{ color: RED }}>{TG}</b>{u.gift ? <> + <b style={{ color: RED }}>{u.gift}</b></> : null} · Đóng đủ 10% trong 72 giờ <b style={{ color: RED }}>1%</b> · Nhanh thêm <b style={{ color: RED }}>9%</b> · Chuẩn thêm <b style={{ color: RED }}>3%</b></div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", gap: 22, minHeight: 0 }}>
          <Col n="1" title="THANH TOÁN NHANH" color={AMBER} ck={`CK ${TG} + 1% + 9%`} best="GIÁ TỐT NHẤT"
            head={[["Giá sau CK (chưa VAT)", fm(n0)], ["Giá gồm VAT (tạm tính)", fm(nV)], ["Phí bảo trì 2%", fm(nK)]]}
            total={nV + nK} steps={nSteps} before={nV * 0.4} handover="04/2027"
            note={<>Đóng 40% trong 4 ngày đầu. Rẻ hơn vay khoảng <b style={{ color: INK }}>{tr(vV + vK - nV - nK)}</b>.</>} />
          <Col n="2" title="THANH TOÁN CHUẨN" color={GREEN} ck={`CK ${TG} + 1% + 3%`}
            head={[["Giá sau CK (chưa VAT)", fm(c0)], ["Giá gồm VAT (tạm tính)", fm(cV)], ["Phí bảo trì 2%", fm(cK)]]}
            total={cV + cK} steps={cSteps} before={cV * 0.4} handover="12/2027"
            note={<>Đóng giãn theo tiến độ, <b style={{ color: INK }}>~{tr(cV * 0.05)} mỗi 2 tháng</b>.</>} />
          <Col n="3" title="VAY NGÂN HÀNG 70%" color={BLUE} ck={`CK ${TG} + 1% · tính trên giá vay`} best="ĐÓNG ÍT NHẤT"
            head={[["Giá sau CK (chưa VAT)", fm(v0)], ["Giá gồm VAT (tạm tính)", fm(vV)], ["Phí bảo trì 2%", fm(vK)]]}
            total={vV + vK} steps={vSteps} before={vV * 0.1} handover="04/2027"
            note={<>Hỗ trợ lãi suất <b style={{ color: INK }}>0% trong 12 tháng</b> hoặc <b style={{ color: INK }}>cố định 5,5% trong 24 tháng</b>.</>} />
        </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ padding: "16px 60px 22px", fontSize: 15.5, color: MUTED, fontWeight: 500, lineHeight: 1.45 }}>
        {u.nyNote ? "(*) Giá không vay tạm suy từ giá có vay (chênh 2% như các căn cùng giỏ), chờ CĐT xác nhận. " : ""}Tạm tính ngày {u.ngay ?? "13/11/2026"} theo chính sách bán hàng 149/2026 (áp dụng từ 16/10/2026){u.nfaN ? ", diện tích theo số đo ra sổ" : ""}. VAT tạm tính, số chính xác theo phiếu tính giá của chủ đầu tư. Phí bảo trì 2% tính trên giá sau chiết khấu chưa VAT.
        Thời gian nhận nhà là dự kiến, theo HĐMB. Lãi suất hỗ trợ theo chính sách CĐT và điều kiện ngân hàng. CĐT có thể điều chỉnh chính sách.
      </div>
    </AbsoluteFill>
  );
};
