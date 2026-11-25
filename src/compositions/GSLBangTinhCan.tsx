import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";

/**
 * Bảng tính thanh toán gửi khách (ảnh tĩnh) — Green Skyline, 2 phương án: Chuẩn & Vay 70%.
 * Số liệu: giỏ hàng độc quyền 13/11/2026, CSBH 149/2026. VAT tạm tính ×1,0908, KPBT 2% giá sau CK chưa VAT.
 */
const { fontFamily: SANS } = loadMont("normal", { weights: ["500", "600", "700", "800", "900"], subsets: ["vietnamese", "latin"] });

export const BT_W = 1600;
export const BT_H = 3010;

const GREEN = "#0F3B2A";
const GREEN2 = "#1D5A41";
const GOLD = "#C9A04A";
const GOLD_L = "#F3E3B5";
const INK = "#1C2420";
const MUTED = "#5E6B64";
const PAPER = "#FAF8F3";
const LINE = "#E3DDCF";
const BLUE = "#1F4E79";

const V = 1.0908;
const r = (x: number) => Math.round(x / 1000) * 1000;
const fm = (x: number) => r(x).toLocaleString("de-DE") + " đ";
const ty = (x: number) => (Math.round(x / 1e7) / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " tỷ";

export type U = {
  code: string; type: string; floor: string; tower: string; gfa: string; nfa: string; view: string; mau: string; tangPlan: string;
  ny: number; vay: number; layout: string; key: string; layoutW: number; layoutH: number;
  ck?: number; tg?: string; viewShort?: string; wing?: string; gift?: string;
  nfaN?: number; ngay?: string; nyNote?: string;
};
export const UNITS: Record<string, U> = {
  studio: {
    code: "T2.21.03", type: "STUDIO", floor: "Tầng 21", tower: "Tháp T2", gfa: "40,09", nfa: "35,98", view: "Hướng TP.HCM", mau: "Studio (CH.03)", tangPlan: "Mặt bằng tầng 9 – 27",
    ny: 2657004840, vay: 2710164180, layout: "images/btgsl/layout_studio.jpg", key: "images/btgsl/key_studio.png", layoutW: 1269, layoutH: 1400,
  },
  "1pn": {
    code: "T2.04.04", type: "1PN+", floor: "Tầng 4", tower: "Tháp T2", gfa: "50,54", nfa: "46,06", view: "Hướng TP.HCM", mau: "1PN+ A1 (CH.04)", tangPlan: "Mặt bằng tầng 4 – 8",
    ny: 3223137960, vay: 3287600720, layout: "images/btgsl/layout_1pn.jpg", key: "images/btgsl/key_1pn.png", layoutW: 1044, layoutH: 1400,
  },
  "3pn": {
    code: "T2.25.12", type: "3PN", floor: "Tầng 25", tower: "Tháp T2", gfa: "79,44", nfa: "72,12", view: "Căn góc · view hồ bơi", mau: "3PN A1 (CH.12)", tangPlan: "Mặt bằng tầng 9 – 27",
    ny: 5327961360, vay: 5434490000, layout: "images/btgsl/layout_3pn.jpg", key: "", layoutW: 1349, layoutH: 1400,
    viewShort: "Hồ bơi · QL1K", wing: "căn góc tháp T2, view hồ bơi",
  },
  "3pn-t3a": {
    code: "T3A.12.08", type: "3PN", floor: "Tầng 12", tower: "Tháp T3A", gfa: "79,6", nfa: "71,8", view: "Căn góc · Đông Nam", mau: "3PN A1 (CH.08)", tangPlan: "Mặt bằng tầng 9 – 27",
    ny: Math.round(71932000 / 1.02 / 1000) * 1000 * 79.6, vay: 71932000 * 79.6, layout: "images/btgsl/layout_3pn.jpg", key: "", layoutW: 1349, layoutH: 1400,
    viewShort: "Đông Nam", wing: "căn góc tháp T3A, hướng Đông Nam nhìn hồ bơi nội khu",
    nfaN: 71.8, ngay: "20/11/2026", nyNote: "*",
  },
  "2pnp-t1": {
    code: "T1.17.04", type: "2PN+", floor: "Tầng 17", tower: "Tháp T1", gfa: "79", nfa: "71,5", view: "Hướng Đông · GS1", mau: "2PN+ A (CH.04)", tangPlan: "Mặt bằng tầng 9 – 27",
    ny: 5410868000, vay: 5519098000, layout: "images/btgsl/layout_2pnplus_a.png", key: "", layoutW: 1000, layoutH: 820,
    ck: 0.92, tg: "7%", gift: "quà Samsung + máy lạnh Daikin",
    viewShort: "Đông · GS1", wing: "đầu Bắc tháp T1, mặt Đông nhìn đường GS1 – GO! Dĩ An",
    nfaN: 71.5, ngay: "20/11/2026",
  },
};

type Step = { t: string; sub?: string; pct: string; amt: number; you?: boolean; bank?: boolean };

const Card: React.FC<{ title: string; tag: string; color: string; head: [string, string][]; total: [string, string]; steps: Step[]; foot: React.ReactNode }> = ({ title, tag, color, head, total, steps, foot }) => (
  <div style={{ flex: 1, background: "#fff", borderRadius: 26, overflow: "hidden", boxShadow: "0 6px 24px rgba(15,59,42,0.10)", border: `2px solid ${LINE}`, display: "flex", flexDirection: "column" }}>
    <div style={{ background: color, padding: "26px 34px 22px", color: "#fff" }}>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, opacity: 0.85 }}>{tag}</div>
      <div style={{ fontSize: 44, fontWeight: 900, marginTop: 4 }}>{title}</div>
    </div>
    <div style={{ padding: "22px 34px 10px" }}>
      {head.map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "11px 0", borderBottom: `1.5px dashed ${LINE}`, fontSize: 25 }}>
          <span style={{ color: MUTED, fontWeight: 600 }}>{k}</span>
          <span style={{ fontWeight: 700, color: INK }}>{v}</span>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, padding: "16px 20px", background: GOLD_L, borderRadius: 16 }}>
        <span style={{ fontSize: 25, fontWeight: 800, color: INK }}>{total[0]}</span>
        <span style={{ fontSize: 33, fontWeight: 900, color: GREEN }}>{total[1]}</span>
      </div>
    </div>
    <div style={{ padding: "18px 34px 0", fontSize: 22, fontWeight: 800, letterSpacing: 2.5, color: color }}>LỊCH THANH TOÁN</div>
    <div style={{ padding: "10px 34px 8px" }}>
      <div style={{ display: "flex", fontSize: 19, fontWeight: 700, color: MUTED, padding: "8px 0", borderBottom: `2px solid ${LINE}` }}>
        <span style={{ flex: 1 }}>Đợt / thời điểm</span><span style={{ width: 92, textAlign: "center" }}>Tỷ lệ</span><span style={{ width: 228, textAlign: "right" }}>Số tiền</span>
      </div>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", padding: "13px 0", borderBottom: `1.5px solid ${LINE}`, background: s.bank ? "#EEF3F8" : "transparent", margin: s.bank ? "0 -12px" : 0, paddingLeft: s.bank ? 12 : 0, paddingRight: s.bank ? 12 : 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.bank ? BLUE : INK }}>{s.t}</div>
            {s.sub && <div style={{ fontSize: 19, fontWeight: 500, color: MUTED, marginTop: 3 }}>{s.sub}</div>}
          </div>
          <div style={{ width: 92, textAlign: "center", fontSize: 24, fontWeight: 800, color: s.bank ? BLUE : color }}>{s.pct}</div>
          <div style={{ width: 228, textAlign: "right", fontSize: 25, fontWeight: 800, color: s.bank ? BLUE : INK, fontVariantNumeric: "tabular-nums" }}>{fm(s.amt)}</div>
        </div>
      ))}
    </div>
    <div style={{ padding: "14px 34px 28px", marginTop: "auto" }}>{foot}</div>
  </div>
);

export const GSLBangTinhCan: React.FC<{ unit: string }> = ({ unit }) => {
  const u = UNITS[unit];
  // Chuẩn
  const c0 = u.ny * 0.91 * 0.97, cV = c0 * V, cK = c0 * 0.02;
  // Vay
  const v0 = u.vay * 0.91, vV = v0 * V, vK = v0 * 0.02;
  const cSteps: Step[] = [
    { t: "Đợt 1 · Ký HĐMB", sub: "Đã gồm 50 triệu giữ chỗ · đóng đủ trong 72 giờ", pct: "10%", amt: cV * 0.1 },
    ...[2, 3, 4, 5, 6, 7].map((n) => ({ t: `Đợt ${n}`, sub: `${(n - 1) * 2} tháng sau ký HĐMB`, pct: "5%", amt: cV * 0.05 })),
    { t: "Nhận nhà", sub: "Dự kiến 12/2027 · gồm phí bảo trì 2%", pct: "55%", amt: cV * 0.55 + cK },
    { t: "Nhận sổ hồng", pct: "5%", amt: cV * 0.05 },
  ];
  const vSteps: Step[] = [
    { t: "Đợt 1 · Ký HĐMB", sub: "Đã gồm 50 triệu giữ chỗ · đóng đủ trong 72 giờ", pct: "10%", amt: vV * 0.1 },
    { t: "Nhận nhà", sub: "Dự kiến 04/2027 · gồm phí bảo trì 2%", pct: "15%", amt: vV * 0.15 + vK },
    { t: "Ngân hàng giải ngân", sub: "Shinhan · VCB · VietinBank", pct: "70%", amt: vV * 0.7, bank: true },
    { t: "Nhận sổ hồng", pct: "5%", amt: vV * 0.05 },
  ];
  const lw = 760, lh = (lw * u.layoutH) / u.layoutW;
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: SANS, color: INK, display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN2} 100%)`, padding: "52px 70px 46px", display: "flex", alignItems: "center", gap: 36 }}>
        <div style={{ background: "#FBF7EE", borderRadius: 18, padding: "10px 16px", boxShadow: `0 0 0 4px ${GOLD}` }}>
          <Img src={staticFile("images/bangiao/gs_logo.png")} style={{ height: 96, display: "block" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 5, color: GOLD }}>BẢNG TÍNH THANH TOÁN · GREEN SKYLINE</div>
          <div style={{ fontSize: 76, fontWeight: 900, color: "#fff", lineHeight: 1.05, marginTop: 6 }}>
            CĂN {u.type} <span style={{ color: GOLD }}>{u.code}</span>
          </div>
        </div>
      </div>
      {/* INFO CHIPS */}
      <div style={{ display: "flex", gap: 18, padding: "34px 70px 0" }}>
        {[["Vị trí", `${u.floor} · ${u.tower}`], ["DT tim tường", `${u.gfa} m²`], ["DT thông thủy", `${u.nfa} m²`], ["View", u.view]].map(([k, v]) => (
          <div key={k} style={{ flex: 1, background: "#fff", border: `2px solid ${LINE}`, borderRadius: 18, padding: "18px 22px" }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: MUTED }}>{k}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: GREEN, marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>
      {/* LAYOUT + VỊ TRÍ */}
      <div style={{ display: "flex", gap: 34, padding: "34px 70px 0", alignItems: "stretch" }}>
        <div style={{ width: lw, background: "#fff", border: `2px solid ${LINE}`, borderRadius: 22, overflow: "hidden", position: "relative" }}>
          <Img src={staticFile(u.layout)} style={{ width: lw, height: lh, display: "block" }} />
          <div style={{ position: "absolute", left: 18, top: 18, background: GREEN, color: "#fff", borderRadius: 12, padding: "8px 16px", fontSize: 22, fontWeight: 800 }}>LAYOUT {u.mau.toUpperCase()}</div>
          <div style={{ position: "absolute", left: 18, bottom: 14, fontSize: 17, fontWeight: 600, color: MUTED }}>Nội thất mang tính minh họa</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ background: "#fff", border: `2px solid ${LINE}`, borderRadius: 22, overflow: "hidden" }}>
            <div style={{ padding: "16px 22px 10px", fontSize: 22, fontWeight: 800, color: GREEN }}>VỊ TRÍ CĂN · {u.tangPlan.toUpperCase()}</div>
            <Img src={staticFile(u.key)} style={{ width: "100%", display: "block" }} />
            <div style={{ padding: "10px 22px 16px", fontSize: 19, color: MUTED, fontWeight: 600 }}>
              <span style={{ display: "inline-block", width: 22, height: 14, border: "4px solid #D62828", marginRight: 10, verticalAlign: "middle" }} />
              Căn {u.code} – tháp T2, dãy nhìn về TP.HCM
            </div>
          </div>
          <div style={{ background: "#fff", border: `2px solid ${LINE}`, borderRadius: 22, padding: "22px 26px", flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: GREEN, letterSpacing: 1 }}>GIÁ NIÊM YẾT (CHƯA VAT)</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 24 }}>
              <span style={{ color: MUTED, fontWeight: 600 }}>Giá không vay</span><span style={{ fontWeight: 800 }}>{u.ny.toLocaleString("de-DE")} đ</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 24 }}>
              <span style={{ color: MUTED, fontWeight: 600 }}>Giá có vay</span><span style={{ fontWeight: 800 }}>{u.vay.toLocaleString("de-DE")} đ</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: GREEN, letterSpacing: 1, marginTop: 22 }}>CHIẾT KHẤU ÁP DỤNG</div>
            {[["Ưu đãi tân gia", "8%"], ["Đóng đủ 10% trong 72 giờ", "1%"], ["Thanh toán chuẩn (chỉ PA Chuẩn)", "3%"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 23 }}>
                <span style={{ fontWeight: 600 }}>{k}</span><span style={{ fontWeight: 900, color: "#B3261E" }}>−{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* 2 PHƯƠNG ÁN */}
      <div style={{ display: "flex", gap: 34, padding: "34px 70px 34px" }}>
        <Card
          tag="PHƯƠNG ÁN 1" title="THANH TOÁN CHUẨN" color={GREEN}
          head={[["Giá sau CK (chưa VAT)", fm(c0)], ["Giá gồm VAT (tạm tính)", fm(cV)], ["Phí bảo trì 2%", fm(cK)]]}
          total={["Tổng thanh toán", fm(cV + cK)]}
          steps={cSteps}
          foot={<div style={{ fontSize: 21, color: MUTED, fontWeight: 600, lineHeight: 1.45 }}>Đóng theo tiến độ, <b style={{ color: INK }}>~{Math.round(r(cV * 0.05) / 1e6)} triệu mỗi 2 tháng</b>. Trước khi nhận nhà đóng tổng 40%.</div>}
        />
        <Card
          tag="PHƯƠNG ÁN 2" title="VAY NGÂN HÀNG 70%" color={BLUE}
          head={[["Giá vay sau CK (chưa VAT)", fm(v0)], ["Giá gồm VAT (tạm tính)", fm(vV)], ["Phí bảo trì 2%", fm(vK)]]}
          total={["Tổng thanh toán", fm(vV + vK)]}
          steps={vSteps}
          foot={<div>
            <div style={{ background: GOLD_L, borderRadius: 16, padding: "16px 20px", fontSize: 24, fontWeight: 800, color: INK, lineHeight: 1.35 }}>
              Chỉ đóng trước <span style={{ color: "#B3261E" }}>10% (~{Math.round(r(vV * 0.1) / 1e6)} triệu)</span> tới khi nhận nhà
            </div>
            <div style={{ fontSize: 21, color: MUTED, fontWeight: 600, lineHeight: 1.45, marginTop: 14 }}>Hỗ trợ lãi suất: <b style={{ color: INK }}>0% trong 12 tháng</b> hoặc <b style={{ color: INK }}>cố định 5,5% trong 24 tháng</b>.</div>
          </div>}
        />
      </div>
      {/* FOOTER */}
      <div style={{ margin: "auto 70px 0", paddingBottom: 44 }}>
        <div style={{ fontSize: 19, color: MUTED, fontWeight: 500, lineHeight: 1.5 }}>
          Tạm tính ngày 13/11/2026 theo chính sách bán hàng 149/2026 (áp dụng từ 16/10/2026). VAT tạm tính, số chính xác theo phiếu tính giá của chủ đầu tư.
          Phí bảo trì 2% tính trên giá sau chiết khấu chưa VAT. Thời gian nhận nhà là dự kiến, theo HĐMB. Lãi suất hỗ trợ theo chính sách CĐT và điều kiện ngân hàng. CĐT có thể điều chỉnh chính sách.
        </div>
        <div style={{ marginTop: 20, background: GREEN, borderRadius: 20, padding: "20px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>MINH HOÀNG · Tư vấn Green Skyline</div>
          <div style={{ fontSize: 34, fontWeight: 900, color: GOLD }}>0906 827 986 <span style={{ fontSize: 24, color: "#fff", fontWeight: 700 }}>(Call/Zalo)</span></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
