import saveAs from "file-saver";
import {
  WHOObservationSession,
  WHOBasicComplianceSheetData,
  WHOIndicationComplianceSheetData,
  CenterSettings,
} from "../types";

export function exportHandHygieneStatisticsToFullHtml({
  sessions,
  basicCalcData,
  indicationCalcData,
  centerSettings,
  periodTitle = "الفترة الإحصائية الحالية (2026)",
  targetCompliance = 85,
  customNotes = "",
}: {
  sessions: WHOObservationSession[];
  basicCalcData: WHOBasicComplianceSheetData;
  indicationCalcData: WHOIndicationComplianceSheetData;
  centerSettings: CenterSettings;
  periodTitle?: string;
  targetCompliance?: number;
  customNotes?: string;
}) {
  const facilityName = centerSettings.centerName || "Waheed IPC";
  const overallRate = basicCalcData.overallComplianceRate;
  const isTargetAchieved = overallRate >= targetCompliance;
  const totalOpportunities = basicCalcData.grandTotal.oppCount;
  const totalActions = basicCalcData.grandTotal.actCount;
  const totalSessionsCount = sessions.length;

  const firstSession = sessions[0];

  const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>التقرير الإحصائي الشامل لنظافة وتطهير الأيدي - ${facilityName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    body {
      font-family: 'Cairo', 'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #334155;
      color: #0f172a;
      direction: rtl;
      text-align: right;
      line-height: 1.45;
      padding: 20px;
    }
    .top-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      max-width: 900px;
      margin: 0 auto 20px auto;
      background: #0f172a;
      color: white;
      padding: 12px 20px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);
    }
    .top-toolbar h1 {
      font-size: 15px;
      font-weight: 800;
      color: #f8fafc;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 20px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      font-family: inherit;
    }
    .btn-print {
      background: linear-gradient(135deg, #e65100, #c2410c);
      color: white;
      box-shadow: 0 4px 12px rgba(230,81,0,0.4);
    }
    .btn-print:hover {
      opacity: 0.95;
      transform: translateY(-1px);
    }
    .doc-container {
      max-width: 880px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.25);
      border: 1px solid #cbd5e1;
      padding: 30px;
    }
    .page-section {
      margin-bottom: 40px;
      padding-bottom: 35px;
      border-bottom: 2px dashed #94a3b8;
      page-break-inside: avoid;
      break-inside: avoid;
      min-height: 1050px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .page-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
      min-height: auto;
    }
    
    /* Official WHO Banner */
    .who-banner {
      background: #E65100;
      color: white;
      padding: 14px 18px;
      border-radius: 8px 8px 0 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 4px solid #BF360C;
    }
    .who-logo-badge {
      width: 44px;
      height: 44px;
      background: white;
      color: #E65100;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 13px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.15);
      flex-shrink: 0;
    }
    .who-banner h3 {
      font-size: 14px;
      font-weight: 900;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }
    .who-banner p {
      font-size: 10px;
      font-weight: 600;
      opacity: 0.92;
    }
    .who-banner-right {
      text-align: left;
    }
    .who-banner-right h4 {
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.05em;
    }
    .who-banner-right span {
      font-size: 10.5px;
      font-weight: 800;
      color: #fff59d;
    }
    
    .page-title-bar {
      text-align: center;
      padding: 8px 0;
      border-bottom: 1.5px solid #0f172a;
      margin-bottom: 12px;
    }
    .page-title-bar h2 {
      font-size: 17px;
      font-weight: 900;
      color: #0f172a;
    }
    .page-title-bar p {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
    }
    
    /* Header Info Box */
    .header-info-box {
      border: 1.5px solid #475569;
      background: #f8fafc;
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 12px;
      font-size: 10.5px;
    }
    .info-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .info-grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #e2e8f0;
      padding: 2px 0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 700;
      color: #475569;
    }
    .info-value {
      font-weight: 900;
      color: #0f172a;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5px;
      text-align: center;
      border: 1.5px solid #475569;
      background: white;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 4px 5px;
      vertical-align: middle;
    }
    th {
      font-weight: 800;
    }
    .th-who-amber {
      background: #fef3c7 !important;
      color: #78350f !important;
      font-weight: 900;
      border-color: #94a3b8;
    }
    .th-sub {
      background: #f1f5f9 !important;
      color: #1e293b !important;
      font-size: 8.5px;
      font-weight: 800;
    }
    .row-total {
      background: #fef3c7 !important;
      font-weight: 900;
      font-size: 10px;
      border-top: 1.5px solid #64748b;
    }
    .row-compliance {
      background: #ffedd5 !important;
      font-weight: 900;
      font-size: 11.5px;
      border-top: 1px solid #cbd5e1;
    }
    .rate-highlight {
      color: #047857;
      font-weight: 900;
    }
    
    /* Formula Box */
    .formula-box {
      border: 1.5px solid #64748b;
      background: #f8fafc;
      padding: 6px 12px;
      border-radius: 6px;
      text-align: center;
      font-size: 10.5px;
      font-weight: 800;
      color: #0f172a;
      margin: 10px 0;
    }

    /* Checkbox & Indication Boxes */
    .chk-box {
      display: inline-block;
      width: 10px;
      height: 10px;
      border: 1px solid #000;
      line-height: 9px;
      font-size: 8px;
      font-weight: 900;
      text-align: center;
      margin-left: 3px;
      background: white;
    }
    .chk-box.checked {
      background: #000;
      color: #fff;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 15px 0;
      text-align: center;
    }
    .kpi-card {
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
    }
    .kpi-card.highlight {
      border: 2px solid #059669;
      background: #ecfdf5;
    }
    .kpi-label {
      font-size: 10px;
      font-weight: 700;
      color: #475569;
    }
    .kpi-value {
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
      font-family: monospace;
      margin: 2px 0;
    }
    .kpi-value.green {
      color: #047857;
    }

    /* Signatures Section */
    .signatures-box {
      border: 1.5px solid #475569;
      border-radius: 8px;
      padding: 14px;
      background: #f8fafc;
      margin-top: 15px;
    }
    .signatures-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px;
      text-align: center;
      padding-top: 8px;
    }

    .page-footer {
      text-align: center;
      font-size: 9.5px;
      color: #64748b;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      margin-top: 10px;
    }

    @media print {
      @page {
        size: A4 portrait;
        margin: 8mm 10mm 8mm 10mm;
      }
      body {
        background: white !important;
        padding: 0 !important;
      }
      .top-toolbar {
        display: none !important;
      }
      .doc-container {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      .page-section {
        page-break-after: always !important;
        break-after: page !important;
        border-bottom: none !important;
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
        min-height: 270mm !important;
        height: auto !important;
      }
      .page-section:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
    }
  </style>
</head>
<body>

  <div class="top-toolbar">
    <div>
      <h1>التقرير الإحصائي الشامل لنظافة وتطهير الأيدي (WHO Hand Hygiene Official Report)</h1>
      <span style="font-size: 11px; color: #94a3b8;">ملف رسمي شامل مكوّن من 5 صفحات مطابق تماماً لمعايير منظمة الصحة العالمية</span>
    </div>
    <div>
      <button class="btn btn-print" onclick="window.print()">
        🖨️ طباعة التقرير أو حفظ كـ PDF (كافة الصفحات)
      </button>
    </div>
  </div>

  <div class="doc-container">
    
    <!-- ============================================================= -->
    <!-- PAGE 1: OFFICIAL WHO OBSERVATION FORM (Form 1)                -->
    <!-- ============================================================= -->
    <div class="page-section">
      <div>
        <div class="who-banner">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="who-logo-badge">WHO</div>
            <div>
              <h3>World Health Organization</h3>
              <p>Patient Safety • A World Alliance for Safer Health Care</p>
            </div>
          </div>
          <div class="who-banner-right">
            <h4>SAVE LIVES</h4>
            <span>Clean Your Hands</span>
          </div>
        </div>

        <div class="page-title-bar">
          <h2>Observation Form</h2>
          <p>استمارة الرصد الميداني الرسمية لنظافة وتطهير الأيدي</p>
        </div>

        <!-- Facility Info Box -->
        <div class="header-info-box">
          <div class="info-grid-2">
            <div>
              <div class="info-row">
                <span class="info-label">Facility:</span>
                <span class="info-value">${firstSession?.facility || facilityName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Service:</span>
                <span class="info-value">${firstSession?.service || "Inpatient Care"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Ward:</span>
                <span class="info-value">${firstSession?.ward || "General Ward"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Department:</span>
                <span class="info-value">${firstSession?.department || centerSettings.departmentTitle || "قسم مكافحة العدوى"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Country:</span>
                <span class="info-value">${firstSession?.country || "Egypt"}</span>
              </div>
            </div>

            <div>
              <div class="info-row">
                <span class="info-label">Period Number*:</span>
                <span class="info-value">${firstSession?.periodNumber || "1"} (${periodTitle})</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date (dd/mm/yy):</span>
                <span class="info-value">${firstSession?.date || new Date().toISOString().slice(0, 10)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Start/End time:</span>
                <span class="info-value">${firstSession?.startTime || "09:00"} / ${firstSession?.endTime || "09:20"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Session duration (mm):</span>
                <span class="info-value">${firstSession?.sessionDuration || 20} min</span>
              </div>
              <div class="info-row">
                <span class="info-label">Observer (initials):</span>
                <span class="info-value">${firstSession?.observer || centerSettings.infectionControlLead || "IPC"}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 4 Column Observation Form Grid -->
        <div style="border: 1.5px solid #475569; border-radius: 6px; overflow: hidden;">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); direction: ltr; text-align: left;">
            ${(firstSession?.columns || [
              { id: "c1", profCatCode: "1.1", profCatName: "Nurse", workersCount: 1, opportunities: [] },
              { id: "c2", profCatCode: "2.0", profCatName: "Auxiliary", workersCount: 1, opportunities: [] },
              { id: "c3", profCatCode: "3.1", profCatName: "Medical Doctor", workersCount: 1, opportunities: [] },
              { id: "c4", profCatCode: "4.1", profCatName: "Other HCW", workersCount: 1, opportunities: [] },
            ])
              .map(
                (col, cIdx) => `
              <div style="border-right: ${cIdx < 3 ? "1.5px solid #cbd5e1" : "none"}; display: flex; flex-direction: column;">
                <div style="background: #f8fafc; padding: 4px 6px; border-bottom: 1.5px solid #cbd5e1; font-size: 8.5px;">
                  <div><b>Prof.cat:</b> ${col.profCatName || "Category"}</div>
                  <div><b>Code:</b> <span style="font-family: monospace; font-weight: 900;">${col.profCatCode || "1.1"}</span> &nbsp;|&nbsp; <b>N°:</b> ${col.workersCount || 1}</div>
                </div>

                <div style="display: grid; grid-template-columns: 20px 1fr 50px; background: #e2e8f0; font-size: 8px; font-weight: 900; padding: 2px 4px; border-bottom: 1px solid #cbd5e1; text-align: center;">
                  <div>Opp</div>
                  <div>Indication</div>
                  <div>HH Action</div>
                </div>

                <div style="font-size: 8px;">
                  ${Array.from({ length: 8 })
                    .map((_, oIdx) => {
                      const opp = col.opportunities?.[oIdx];
                      const indications = opp?.indications || [];
                      const action = opp?.action;
                      const hasGloves = opp?.gloves;

                      return `
                      <div style="display: grid; grid-template-columns: 20px 1fr 50px; padding: 2px 4px; border-bottom: 1px solid #f1f5f9; align-items: center;">
                        <div style="font-weight: 800; text-align: center; font-family: monospace;">${oIdx + 1}</div>
                        <div style="line-height: 1.15; font-size: 7.5px;">
                          <div><span class="chk-box ${indications.includes("bef_pat") ? "checked" : ""}">✓</span>bef-pat.</div>
                          <div><span class="chk-box ${indications.includes("bef_asept") ? "checked" : ""}">✓</span>bef-asept.</div>
                          <div><span class="chk-box ${indications.includes("aft_bf") ? "checked" : ""}">✓</span>aft-b.f.</div>
                          <div><span class="chk-box ${indications.includes("aft_pat") ? "checked" : ""}">✓</span>aft-pat.</div>
                          <div><span class="chk-box ${indications.includes("aft_surr") ? "checked" : ""}">✓</span>aft.p.surr.</div>
                        </div>
                        <div style="line-height: 1.2; font-size: 7.5px;">
                          <div><span class="chk-box ${action === "HR" ? "checked" : ""}">✓</span>HR</div>
                          <div><span class="chk-box ${action === "HW" ? "checked" : ""}">✓</span>HW</div>
                          <div><span class="chk-box ${action === "missed" ? "checked" : ""}">✓</span>missed</div>
                          ${hasGloves ? '<div style="color: #6b21a8; font-weight: 800;"><span class="chk-box checked">✓</span>gloves</div>' : ""}
                        </div>
                      </div>
                    `;
                    })
                    .join("")}
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <div style="font-size: 8px; color: #64748b; margin-top: 8px; line-height: 1.3;">
          <p>* To be completed by the data manager. ** Optional, to be used if appropriate.</p>
          <p>All reasonable precautions have been taken by the World Health Organization to verify the information contained in this document. Revised August 2009.</p>
        </div>
      </div>

      <div class="page-footer">
        الصفحة 1 من 5 • استمارة الرصد الميداني الرسمية (WHO Observation Form) • منظمة الصحة العالمية
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- PAGE 2: BASIC COMPLIANCE CALCULATION FORM (Page 3 of Manual)  -->
    <!-- ============================================================= -->
    <div class="page-section">
      <div>
        <div class="who-banner">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="who-logo-badge">WHO</div>
            <div>
              <h3>World Health Organization</h3>
              <p>Patient Safety • A World Alliance for Safer Health Care</p>
            </div>
          </div>
          <div class="who-banner-right">
            <h4>SAVE LIVES</h4>
            <span>Clean Your Hands</span>
          </div>
        </div>

        <div class="page-title-bar">
          <h2>Observation Form – Basic Compliance Calculation</h2>
          <p>استمارة حساب الامتثال الأساسي للفئات المهنية (Page 3)</p>
        </div>

        <div class="header-info-box">
          <div class="info-grid-3">
            <div><b>Facility:</b> ${basicCalcData.facility || facilityName}</div>
            <div><b>Period:</b> ${basicCalcData.period || periodTitle}</div>
            <div><b>Setting:</b> ${basicCalcData.setting || "Inpatient Care"}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th rowspan="2" class="th-who-amber" style="width: 50px;">Session N°</th>
              <th colspan="3" class="th-who-amber">Prof.cat 1 (Nurse/Midwife)</th>
              <th colspan="3" class="th-who-amber">Prof.cat 2 (Auxiliary)</th>
              <th colspan="3" class="th-who-amber">Prof.cat 3 (Medical Doctor)</th>
              <th colspan="3" class="th-who-amber">Prof.cat 4 (Other HCW)</th>
              <th colspan="3" class="th-who-amber" style="background: #fde68a !important;">Total per session</th>
            </tr>
            <tr>
              <th class="th-sub">Opp (n)</th><th class="th-sub">HW (n)</th><th class="th-sub">HR (n)</th>
              <th class="th-sub">Opp (n)</th><th class="th-sub">HW (n)</th><th class="th-sub">HR (n)</th>
              <th class="th-sub">Opp (n)</th><th class="th-sub">HW (n)</th><th class="th-sub">HR (n)</th>
              <th class="th-sub">Opp (n)</th><th class="th-sub">HW (n)</th><th class="th-sub">HR (n)</th>
              <th class="th-sub" style="background: #fef3c7 !important;">Opp</th>
              <th class="th-sub" style="background: #fef3c7 !important;">HW</th>
              <th class="th-sub" style="background: #fef3c7 !important;">HR</th>
            </tr>
          </thead>
          <tbody>
            ${basicCalcData.sessions
              .map(
                (row) => `
              <tr>
                <td style="font-weight: 800; background: #f8fafc;">${row.sessionNumber}</td>
                <td>${row.nurse.oppCount || "-"}</td><td>${row.nurse.hwCount || "-"}</td><td>${row.nurse.hrCount || "-"}</td>
                <td>${row.auxiliary.oppCount || "-"}</td><td>${row.auxiliary.hwCount || "-"}</td><td>${row.auxiliary.hrCount || "-"}</td>
                <td>${row.doctor.oppCount || "-"}</td><td>${row.doctor.hwCount || "-"}</td><td>${row.doctor.hrCount || "-"}</td>
                <td>${row.other.oppCount || "-"}</td><td>${row.other.hwCount || "-"}</td><td>${row.other.hrCount || "-"}</td>
                <td style="font-weight: 800; background: #fffbeb;">${row.total.oppCount}</td>
                <td style="font-weight: 800; background: #fffbeb;">${row.total.hwCount}</td>
                <td style="font-weight: 800; background: #fffbeb;">${row.total.hrCount}</td>
              </tr>
            `
              )
              .join("")}
            <tr class="row-total">
              <td style="font-weight: 900;">Total Calculation</td>
              <td colspan="3" style="text-align: left; padding-left: 8px;">Act = ${basicCalcData.totalNurse.actCount} | Opp = ${basicCalcData.totalNurse.oppCount}</td>
              <td colspan="3" style="text-align: left; padding-left: 8px;">Act = ${basicCalcData.totalAuxiliary.actCount} | Opp = ${basicCalcData.totalAuxiliary.oppCount}</td>
              <td colspan="3" style="text-align: left; padding-left: 8px;">Act = ${basicCalcData.totalDoctor.actCount} | Opp = ${basicCalcData.totalDoctor.oppCount}</td>
              <td colspan="3" style="text-align: left; padding-left: 8px;">Act = ${basicCalcData.totalOther.actCount} | Opp = ${basicCalcData.totalOther.oppCount}</td>
              <td colspan="3" style="text-align: left; padding-left: 8px; background: #fde68a;">Act = ${basicCalcData.grandTotal.actCount} | Opp = ${basicCalcData.grandTotal.oppCount}</td>
            </tr>
            <tr class="row-compliance">
              <td style="font-weight: 900; color: #7c2d12;">Compliance (%)</td>
              <td colspan="3" class="rate-highlight">%${basicCalcData.totalNurse.complianceRate}</td>
              <td colspan="3" class="rate-highlight">%${basicCalcData.totalAuxiliary.complianceRate}</td>
              <td colspan="3" class="rate-highlight">%${basicCalcData.totalDoctor.complianceRate}</td>
              <td colspan="3" class="rate-highlight">%${basicCalcData.totalOther.complianceRate}</td>
              <td colspan="3" class="rate-highlight" style="font-size: 13px; background: #fed7aa;">%${basicCalcData.overallComplianceRate}</td>
            </tr>
          </tbody>
        </table>

        <div class="formula-box">
          Compliance (%) = (Actions ÷ Opportunities) × 100
        </div>
      </div>

      <div class="page-footer">
        الصفحة 2 من 5 • استمارة حساب الامتثال الأساسي الرسمية (WHO Basic Compliance Calculation - Page 3)
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- PAGE 3: OPTIONAL CALCULATION FORM (5 MOMENTS - Page 4)        -->
    <!-- ============================================================= -->
    <div class="page-section">
      <div>
        <div class="who-banner">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="who-logo-badge">WHO</div>
            <div>
              <h3>World Health Organization</h3>
              <p>Patient Safety • A World Alliance for Safer Health Care</p>
            </div>
          </div>
          <div class="who-banner-right">
            <h4>SAVE LIVES</h4>
            <span>Clean Your Hands</span>
          </div>
        </div>

        <div class="page-title-bar">
          <h2>Observation Form – Optional Calculation Form</h2>
          <p>Indication-related compliance with hand hygiene (5 Moments - Page 4)</p>
        </div>

        <div class="header-info-box">
          <div class="info-grid-3">
            <div><b>Facility:</b> ${indicationCalcData.facility || facilityName}</div>
            <div><b>Period:</b> ${indicationCalcData.period || periodTitle}</div>
            <div><b>Setting:</b> ${indicationCalcData.setting || "Inpatient Care"}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th rowspan="2" class="th-who-amber" style="width: 50px;">Session N°</th>
              <th colspan="3" class="th-who-amber">Before touching a patient (1)</th>
              <th colspan="3" class="th-who-amber">Before clean/aseptic (2)</th>
              <th colspan="3" class="th-who-amber">After body fluid risk (3)</th>
              <th colspan="3" class="th-who-amber">After touching a patient (4)</th>
              <th colspan="3" class="th-who-amber">After touching surroundings (5)</th>
            </tr>
            <tr>
              <th class="th-sub">Indic (n)</th><th class="th-sub">HW (n)</th><th class="th-sub">HR (n)</th>
              <th class="th-sub">Indic (n)</th><th class="th-sub">HW (n)</th><th class="th-sub">HR (n)</th>
              <th class="th-sub">Indic (n)</th><th class="th-sub">HW (n)</th><th class="th-sub">HR (n)</th>
              <th class="th-sub">Indic (n)</th><th class="th-sub">HW (n)</th><th class="th-sub">HR (n)</th>
              <th class="th-sub">Indic (n)</th><th class="th-sub">HW (n)</th><th class="th-sub">HR (n)</th>
            </tr>
          </thead>
          <tbody>
            ${indicationCalcData.sessions
              .map(
                (row) => `
              <tr>
                <td style="font-weight: 800; background: #f8fafc;">${row.sessionNumber}</td>
                <td>${row.befPat.indicCount || "-"}</td><td>${row.befPat.hwCount || "-"}</td><td>${row.befPat.hrCount || "-"}</td>
                <td>${row.befAsept.indicCount || "-"}</td><td>${row.befAsept.hwCount || "-"}</td><td>${row.befAsept.hrCount || "-"}</td>
                <td>${row.aftBf.indicCount || "-"}</td><td>${row.aftBf.hwCount || "-"}</td><td>${row.aftBf.hrCount || "-"}</td>
                <td>${row.aftPat.indicCount || "-"}</td><td>${row.aftPat.hwCount || "-"}</td><td>${row.aftPat.hrCount || "-"}</td>
                <td>${row.aftSurr.indicCount || "-"}</td><td>${row.aftSurr.hwCount || "-"}</td><td>${row.aftSurr.hrCount || "-"}</td>
              </tr>
            `
              )
              .join("")}
            <tr class="row-total">
              <td style="font-weight: 900;">Total Calculation</td>
              <td colspan="3" style="text-align: left; padding-left: 6px;">Act = ${indicationCalcData.totalBefPat.actCount} | Indic = ${indicationCalcData.totalBefPat.indicCount}</td>
              <td colspan="3" style="text-align: left; padding-left: 6px;">Act = ${indicationCalcData.totalBefAsept.actCount} | Indic = ${indicationCalcData.totalBefAsept.indicCount}</td>
              <td colspan="3" style="text-align: left; padding-left: 6px;">Act = ${indicationCalcData.totalAftBf.actCount} | Indic = ${indicationCalcData.totalAftBf.indicCount}</td>
              <td colspan="3" style="text-align: left; padding-left: 6px;">Act = ${indicationCalcData.totalAftPat.actCount} | Indic = ${indicationCalcData.totalAftPat.indicCount}</td>
              <td colspan="3" style="text-align: left; padding-left: 6px;">Act = ${indicationCalcData.totalAftSurr.actCount} | Indic = ${indicationCalcData.totalAftSurr.indicCount}</td>
            </tr>
            <tr class="row-compliance">
              <td style="font-weight: 900; color: #7c2d12;">Ratio act/indic (%)</td>
              <td colspan="3" class="rate-highlight">%${indicationCalcData.totalBefPat.ratio}</td>
              <td colspan="3" class="rate-highlight">%${indicationCalcData.totalBefAsept.ratio}</td>
              <td colspan="3" class="rate-highlight">%${indicationCalcData.totalAftBf.ratio}</td>
              <td colspan="3" class="rate-highlight">%${indicationCalcData.totalAftPat.ratio}</td>
              <td colspan="3" class="rate-highlight">%${indicationCalcData.totalAftSurr.ratio}</td>
            </tr>
          </tbody>
        </table>

        <div style="font-size: 9.5px; color: #475569; background: #f8fafc; padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; margin-top: 10px;">
          * <b>Note:</b> This calculation gives an overall idea of health-care worker’s behaviour towards each type of indication.
        </div>
      </div>

      <div class="page-footer">
        الصفحة 3 من 5 • استمارة حساب الامتثال حسب دواعي الغسيل الخمسة (WHO 5 Moments Calculation - Page 4)
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- PAGE 4: DETAILED SESSIONS BREAKDOWN REGISTER                  -->
    <!-- ============================================================= -->
    <div class="page-section">
      <div>
        <div class="who-banner">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="who-logo-badge">WHO</div>
            <div>
              <h3>World Health Organization</h3>
              <p>Patient Safety • A World Alliance for Safer Health Care</p>
            </div>
          </div>
          <div class="who-banner-right">
            <h4>SAVE LIVES</h4>
            <span>Clean Your Hands</span>
          </div>
        </div>

        <div class="page-title-bar">
          <h2>Field Observation Sessions Register</h2>
          <p>سجل وجدول استمارات جلسات الرصد الميداني (${totalSessionsCount} جلسة رصد معتمدة)</p>
        </div>

        <table>
          <thead>
            <tr>
              <th class="th-who-amber" style="width: 40px;">جلسة</th>
              <th class="th-who-amber" style="text-align: right; width: 140px;">القسم / الجناح</th>
              <th class="th-who-amber">التاريخ والوقت</th>
              <th class="th-who-amber">الراصد والمدة</th>
              <th class="th-who-amber">توزيع الفرص حسب الفئات</th>
              <th class="th-who-amber" style="width: 80px;">الامتثال %</th>
            </tr>
          </thead>
          <tbody>
            ${sessions
              .map((s, idx) => {
                const matched = basicCalcData.sessions.find((b) => b.sessionNumber === s.sessionNumber);
                const opps = matched ? matched.total.oppCount : 0;
                const acts = matched ? matched.total.actCount : 0;
                const rate = matched ? matched.total.complianceRate : 0;

                return `
                <tr>
                  <td style="font-weight: 900; background: #f8fafc;">${s.sessionNumber || idx + 1}</td>
                  <td style="text-align: right; font-weight: 700;">${s.ward || s.department || "قسم رصد"}</td>
                  <td style="font-family: monospace;">${s.date} ${s.startTime ? `(${s.startTime})` : ""}</td>
                  <td>${s.observer || "مكافحة العدوى"} (${s.sessionDuration || 20} د)</td>
                  <td style="font-size: 8.5px; text-align: right;">
                    ${(s.columns || [])
                      .map((c) => {
                        const oCount = (c.opportunities || []).filter((o) => o.action).length;
                        return `<span style="background: #f1f5f9; padding: 1px 4px; border-radius: 3px; margin-left: 2px;">${c.profCatCode}: ${oCount}</span>`;
                      })
                      .join("")}
                  </td>
                  <td style="font-weight: 900; font-size: 11px; color: ${rate >= targetCompliance ? "#047857" : "#b45309"}; background: #f8fafc;">
                    %${rate}
                    <div style="font-size: 8px; color: #64748b; font-weight: normal;">(${acts}/${opps})</div>
                  </td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>

      <div class="page-footer">
        الصفحة 4 من 5 • سجل وتفاصيل جلسات الرصد الميداني المعتمدة
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- PAGE 5: EXECUTIVE SUMMARY, RECOMMENDATIONS & SIGNATURES       -->
    <!-- ============================================================= -->
    <div class="page-section">
      <div>
        <div class="who-banner">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="who-logo-badge">WHO</div>
            <div>
              <h3>World Health Organization</h3>
              <p>Patient Safety • A World Alliance for Safer Health Care</p>
            </div>
          </div>
          <div class="who-banner-right">
            <h4>SAVE LIVES</h4>
            <span>Clean Your Hands</span>
          </div>
        </div>

        <div class="page-title-bar">
          <h2>Analysis, Action Plan & Official Signatures</h2>
          <p>التحليل التنفيذي والتوصيات وخطة التحسين والاعتمادات الرسمية</p>
        </div>

        <!-- Key KPIs -->
        <div class="kpi-grid">
          <div class="kpi-card highlight">
            <div class="kpi-label">معدل الامتثال العام</div>
            <div class="kpi-value green">%${overallRate}</div>
            <span style="font-size: 9px; font-weight: 800; color: #047857;">${isTargetAchieved ? "✓ محقق للمستهدف" : "تحت المستهدف"}</span>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">إجمالي الفرص</div>
            <div class="kpi-value">${totalOpportunities}</div>
            <span style="font-size: 9px; color: #64748b;">فرصة رصد</span>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">الإجراءات المطبقة</div>
            <div class="kpi-value">${totalActions}</div>
            <span style="font-size: 9px; color: #64748b;">(HR + HW)</span>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">جلسات الرصد</div>
            <div class="kpi-value">${totalSessionsCount}</div>
            <span style="font-size: 9px; color: #64748b;">استمارة رصد</span>
          </div>
        </div>

        <!-- Action Plan & Recommendations -->
        <div style="border: 1.5px solid #475569; border-radius: 8px; padding: 12px; background: #f8fafc; margin-top: 10px;">
          <h3 style="font-size: 12px; font-weight: 900; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 8px;">
            التوصيات وخطة العمل لتحسين ممارسات نظافة وتطهير الأيدي:
          </h3>
          <div style="font-size: 10.5px; color: #334155; line-height: 1.6; font-weight: 600;">
            <p>1. الاستمرار في تدريب الكوادر الطبية والتمريضية على دواعي غسيل الأيدي الخمسة (WHO 5 Moments) مع التركيز على دافع ما قبل ملامسة المريض وما بعد ملامسة البيئة المحيطة.</p>
            <p>2. التأكد من توفر المطهرات الكحولية عند نقاط تقديم الخدمة (Point of Care) وفي كافة العربات العلاجية وغرف المرضى.</p>
            <p>3. تطبيق آلية التغذية الراجعة الفورية بعد كل جلسة رصد وتكريم الأقسام والفئات المهنية المحققة لأعلى نسب امتثال لتحفيز الالتزام المستمر.</p>
            <p>4. الالتزام بعدم ارتداء القفازات كبديل لنظافة وتطهير الأيدي والحرص على التطهير قبل وبعد نزع القفازات.</p>
            ${
              customNotes
                ? `<div style="margin-top: 8px; padding: 8px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; color: #92400e; font-weight: 700;">
                    ${customNotes}
                   </div>`
                : ""
            }
          </div>
        </div>

        <!-- Signatures Box -->
        <div class="signatures-box">
          <h4 style="text-align: center; font-size: 12px; font-weight: 900; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 10px;">
            الاعتمادات والتوقيعات الرسمية
          </h4>
          <div class="signatures-grid">
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #475569;">مسؤول / راصد مكافحة العدوى</div>
              <div style="font-size: 12px; font-weight: 900; color: #0f172a; margin-top: 2px;">${centerSettings.infectionControlLead || "م/ أحمد وحيد شعبان"}</div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 20px;">التوقيع: .......................................</div>
            </div>
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #475569;">مدير المركز / المستشفى</div>
              <div style="font-size: 12px; font-weight: 900; color: #0f172a; margin-top: 2px;">${centerSettings.medicalDirector || "د/ إيناس"}</div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 20px;">التوقيع والاعتماد: ............................</div>
            </div>
          </div>
        </div>
      </div>

      <div class="page-footer">
        الصفحة 5 من 5 • ختام التقرير والاعتمادات الرسمية • صادر وفقاً لمعايير منظمة الصحة العالمية WHO
      </div>
    </div>

  </div>

</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const filename = `تقرير_نظافة_الأيدي_الشامل_WHO_${facilityName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.html`;
  saveAs(blob, filename);
}
