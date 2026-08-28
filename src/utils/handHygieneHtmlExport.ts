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

  const totalIndicationsCount =
    indicationCalcData.totalBefPat.indicCount +
    indicationCalcData.totalBefAsept.indicCount +
    indicationCalcData.totalAftBf.indicCount +
    indicationCalcData.totalAftPat.indicCount +
    indicationCalcData.totalAftSurr.indicCount;

  const totalIndicationActionsCount =
    indicationCalcData.totalBefPat.actCount +
    indicationCalcData.totalBefAsept.actCount +
    indicationCalcData.totalAftBf.actCount +
    indicationCalcData.totalAftPat.actCount +
    indicationCalcData.totalAftSurr.actCount;

  const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>التقرير الإحصائي الشامل لنظافة وتطهير الأيدي - ${facilityName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
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
      font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f1f5f9;
      color: #0f172a;
      direction: rtl;
      text-align: right;
      line-height: 1.5;
      padding: 20px;
    }
    .top-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #0f172a;
      color: white;
      padding: 12px 20px;
      border-radius: 14px;
      margin-bottom: 25px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
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
      padding: 8px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      font-family: inherit;
    }
    .btn-print {
      background: linear-gradient(135deg, #059669, #0d9488);
      color: white;
    }
    .btn-print:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    .doc-container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 18px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      border: 1px solid #cbd5e1;
      padding: 35px;
    }
    .page-section {
      margin-bottom: 40px;
      padding-bottom: 35px;
      border-bottom: 2px dashed #cbd5e1;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .page-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .who-banner {
      background: #E65100;
      color: white;
      padding: 16px 20px;
      border-radius: 10px 10px 0 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 4px solid #BF360C;
    }
    .who-logo {
      width: 46px;
      height: 46px;
      background: white;
      color: #E65100;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 13px;
    }
    .header-info {
      text-align: center;
      padding: 15px 0;
      border-bottom: 2px solid #0f172a;
    }
    .header-info .sub {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .header-info h2 {
      font-size: 22px;
      font-weight: 900;
      color: #020617;
      margin: 4px 0;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 20px 0;
      text-align: center;
    }
    .kpi-card {
      padding: 14px;
      border-radius: 12px;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
    }
    .kpi-card.highlight {
      border: 2px solid #059669;
      background: #ecfdf5;
    }
    .kpi-label {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
    }
    .kpi-value {
      font-size: 28px;
      font-weight: 900;
      color: #0f172a;
      font-family: monospace;
      margin: 4px 0;
    }
    .kpi-value.green {
      color: #047857;
    }
    .kpi-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 800;
      background: #d1fae5;
      color: #065f46;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 11px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      text-align: center;
    }
    th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 800;
    }
    .table-dark-header th {
      background: #1e293b;
      color: white;
    }
    .table-green-header th {
      background: #047857;
      color: white;
    }
    .table-orange-header th {
      background: #c2410c;
      color: white;
    }
    .tag {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 800;
    }
    .tag-blue { background: #dbeafe; color: #1e40af; }
    .tag-purple { background: #f3e8ff; color: #6b21a8; }
    .tag-emerald { background: #d1fae5; color: #065f46; }
    .tag-amber { background: #fef3c7; color: #92400e; }
    .section-title {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8fafc;
      padding: 8px 12px;
      border-radius: 8px;
      border-right: 4px solid #059669;
      margin: 15px 0 10px 0;
    }
    .signatures-box {
      border: 2px solid #cbd5e1;
      border-radius: 12px;
      padding: 18px;
      background: #f8fafc;
      margin-top: 20px;
    }
    .signatures-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 25px;
      text-align: center;
      padding-top: 10px;
    }
    .page-footer {
      text-align: center;
      font-size: 10px;
      color: #64748b;
      padding-top: 15px;
    }
    @media print {
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
        padding-top: 10px;
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
      <span style="font-size: 11px; color: #94a3b8;">تقرير رسمي كامل مكوّن من 5 صفحات مطابق تماماً لمعايير منظمة الصحة العالمية</span>
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="btn btn-print" onclick="window.print()">
        🖨️ طباعة أو حفظ كـ PDF
      </button>
    </div>
  </div>

  <div class="doc-container">
    
    <!-- PAGE 1: EXECUTIVE SUMMARY & KPIS -->
    <div class="page-section">
      <div class="who-banner">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="who-logo">WHO</div>
          <div>
            <h3 style="font-size: 15px; font-weight: 900;">World Health Organization</h3>
            <p style="font-size: 11px; opacity: 0.9;">Patient Safety • A World Alliance for Safer Health Care</p>
          </div>
        </div>
        <div style="text-align: left;">
          <h4 style="font-size: 13px; font-weight: 900;">SAVE LIVES</h4>
          <span style="font-size: 11px; color: #fde68a; font-weight: 700;">Clean Your Hands</span>
        </div>
      </div>

      <div class="header-info">
        <div class="sub">${facilityName} — ${centerSettings.departmentTitle || "قسم مكافحة العدوى"}</div>
        <h2>التقرير الإحصائي الشامل ومعدلات الامتثال لنظافة وتطهير الأيدي</h2>
        <div style="font-size: 12px; font-weight: 700; color: #475569;">
          الفترة الإحصائية: ${periodTitle} | الهدف الاستراتيجي المعتمد: ≥ %${targetCompliance}
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card highlight">
          <div class="kpi-label">المعدل العام للامتثال</div>
          <div class="kpi-value green">%${overallRate}</div>
          <span class="kpi-badge">${isTargetAchieved ? "✓ محقق للمستهدف" : "تحت المستهدف"}</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">إجمالي الفرص المرصودة</div>
          <div class="kpi-value">${totalOpportunities}</div>
          <span style="font-size: 10px; color: #64748b;">فرصة رصد</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">إجمالي الإجراءات المطبقة</div>
          <div class="kpi-value">${totalActions}</div>
          <span style="font-size: 10px; color: #64748b;">(HR + HW)</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">عدد جلسات الرصد</div>
          <div class="kpi-value">${totalSessionsCount}</div>
          <span style="font-size: 10px; color: #64748b;">استمارة رصد</span>
        </div>
      </div>

      <div class="section-title">
        <span>ملخص الامتثال حسب الفئات المهنية الأربعة (WHO Categories)</span>
        <span style="font-size: 11px; font-weight: 700; color: #059669;">المعدلات المحققة</span>
      </div>

      <table class="table-green-header">
        <thead>
          <tr>
            <th>تمريض وقبالة (Nurse)</th>
            <th>مساعدو الخدمات (Auxiliary)</th>
            <th>الأطباء البشريين (Doctor)</th>
            <th>الكادر الصحي الآخر (Other)</th>
            <th>المعدل الإجمالي العام</th>
          </tr>
        </thead>
        <tbody>
          <tr style="font-size: 13px; font-weight: 800;">
            <td style="color: #047857;">%${basicCalcData.totalNurse.complianceRate}</td>
            <td style="color: #047857;">%${basicCalcData.totalAuxiliary.complianceRate}</td>
            <td style="color: #047857;">%${basicCalcData.totalDoctor.complianceRate}</td>
            <td style="color: #047857;">%${basicCalcData.totalOther.complianceRate}</td>
            <td style="color: #047857; background: #ecfdf5; font-size: 15px;">%${overallRate}</td>
          </tr>
          <tr style="font-size: 10px; color: #64748b;">
            <td>${basicCalcData.totalNurse.actCount} من ${basicCalcData.totalNurse.oppCount} فرصة</td>
            <td>${basicCalcData.totalAuxiliary.actCount} من ${basicCalcData.totalAuxiliary.oppCount} فرصة</td>
            <td>${basicCalcData.totalDoctor.actCount} من ${basicCalcData.totalDoctor.oppCount} فرصة</td>
            <td>${basicCalcData.totalOther.actCount} من ${basicCalcData.totalOther.oppCount} فرصة</td>
            <td style="font-weight: 700; color: #065f46;">${totalActions} من ${totalOpportunities} فرصة</td>
          </tr>
        </tbody>
      </table>

      <div class="section-title" style="margin-top: 20px;">
        <span>ملخص الامتثال حسب دواعي ولحظات غسيل الأيدي الخمسة (WHO 5 Moments)</span>
      </div>

      <table class="table-dark-header">
        <thead>
          <tr>
            <th>1. قبل ملامسة المريض</th>
            <th>2. قبل الإجراء النظيف</th>
            <th>3. بعد التعرض لسوائل الجسم</th>
            <th>4. بعد ملامسة المريض</th>
            <th>5. بعد ملامسة بيئة المريض</th>
          </tr>
        </thead>
        <tbody>
          <tr style="font-size: 13px; font-weight: 800;">
            <td style="color: #047857;">%${indicationCalcData.totalBefPat.ratio}</td>
            <td style="color: #047857;">%${indicationCalcData.totalBefAsept.ratio}</td>
            <td style="color: #047857;">%${indicationCalcData.totalAftBf.ratio}</td>
            <td style="color: #047857;">%${indicationCalcData.totalAftPat.ratio}</td>
            <td style="color: #047857;">%${indicationCalcData.totalAftSurr.ratio}</td>
          </tr>
          <tr style="font-size: 10px; color: #64748b;">
            <td>${indicationCalcData.totalBefPat.actCount} إجراء / ${indicationCalcData.totalBefPat.indicCount} داعي</td>
            <td>${indicationCalcData.totalBefAsept.actCount} إجراء / ${indicationCalcData.totalBefAsept.indicCount} داعي</td>
            <td>${indicationCalcData.totalAftBf.actCount} إجراء / ${indicationCalcData.totalAftBf.indicCount} داعي</td>
            <td>${indicationCalcData.totalAftPat.actCount} إجراء / ${indicationCalcData.totalAftPat.indicCount} داعي</td>
            <td>${indicationCalcData.totalAftSurr.actCount} إجراء / ${indicationCalcData.totalAftSurr.indicCount} داعي</td>
          </tr>
        </tbody>
      </table>

      <div class="page-footer">
        الصفحة 1 من 5 • الملخص التنفيذي ومؤشرات الامتثال المعتمدة • منظمة الصحة العالمية WHO
      </div>
    </div>

    <!-- PAGE 2: WHO BASIC COMPLIANCE CALCULATION FORM (Page 3) -->
    <div class="page-section">
      <div style="background: #1e293b; color: white; padding: 12px 18px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 900; font-size: 14px;">WHO Hand Hygiene - Basic Compliance Calculation Form</span>
        <span style="font-size: 12px; font-weight: 700; color: #94a3b8;">الصفحة 2: استمارة حساب الامتثال الأساسي للفئات المهنية (Page 3)</span>
      </div>

      <div style="margin: 15px 0; padding: 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 11px;">
        <div><b>المنشأة:</b> ${facilityName}</div>
        <div><b>القسم:</b> ${centerSettings.departmentTitle || "قسم مكافحة العدوى"}</div>
        <div><b>الفترة الإحصائية:</b> ${periodTitle}</div>
        <div><b>المستهدف:</b> ≥ %${targetCompliance}</div>
      </div>

      <table class="table-dark-header">
        <thead>
          <tr>
            <th rowspan="2">جلسة الرصد (Session N°)</th>
            <th colspan="2">1. تمريض وقبالة (Nurse)</th>
            <th colspan="2">2. مساعدو الخدمات (Auxiliary)</th>
            <th colspan="2">3. الأطباء البشريين (Doctor)</th>
            <th colspan="2">4. كوادر أخرى (Other HCW)</th>
            <th colspan="2" style="background: #047857;">الإجمالي للجلسة (Total)</th>
          </tr>
          <tr>
            <th>الفرص (Opp)</th>
            <th>الإجراءات (Act)</th>
            <th>الفرص (Opp)</th>
            <th>الإجراءات (Act)</th>
            <th>الفرص (Opp)</th>
            <th>الإجراءات (Act)</th>
            <th>الفرص (Opp)</th>
            <th>الإجراءات (Act)</th>
            <th style="background: #065f46;">الفرص</th>
            <th style="background: #065f46;">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          ${basicCalcData.sessions
            .map(
              (r) => `
            <tr>
              <td style="font-weight: 700; text-align: right;">جلسة #${r.sessionNumber} ${r.department ? `(${r.department})` : ""}</td>
              <td>${r.nurse.oppCount || "-"}</td>
              <td>${r.nurse.actCount || "-"}</td>
              <td>${r.auxiliary.oppCount || "-"}</td>
              <td>${r.auxiliary.actCount || "-"}</td>
              <td>${r.doctor.oppCount || "-"}</td>
              <td>${r.doctor.actCount || "-"}</td>
              <td>${r.other.oppCount || "-"}</td>
              <td>${r.other.actCount || "-"}</td>
              <td style="font-weight: 700; background: #f8fafc;">${r.total.oppCount || "-"}</td>
              <td style="font-weight: 700; background: #f8fafc;">${r.total.actCount || "-"}</td>
            </tr>
          `
            )
            .join("")}
          <tr style="background: #f1f5f9; font-weight: 900;">
            <td style="text-align: right;">إجمالي الفرص والإجراءات</td>
            <td>${basicCalcData.totalNurse.oppCount}</td>
            <td>${basicCalcData.totalNurse.actCount}</td>
            <td>${basicCalcData.totalAuxiliary.oppCount}</td>
            <td>${basicCalcData.totalAuxiliary.actCount}</td>
            <td>${basicCalcData.totalDoctor.oppCount}</td>
            <td>${basicCalcData.totalDoctor.actCount}</td>
            <td>${basicCalcData.totalOther.oppCount}</td>
            <td>${basicCalcData.totalOther.actCount}</td>
            <td style="background: #dcfce7; color: #166534;">${totalOpportunities}</td>
            <td style="background: #dcfce7; color: #166534;">${totalActions}</td>
          </tr>
          <tr style="background: #ecfdf5; font-weight: 900; font-size: 13px;">
            <td style="text-align: right; color: #047857;">نسبة الامتثال % (Compliance Rate)</td>
            <td colspan="2" style="color: #047857;">%${basicCalcData.totalNurse.complianceRate}</td>
            <td colspan="2" style="color: #047857;">%${basicCalcData.totalAuxiliary.complianceRate}</td>
            <td colspan="2" style="color: #047857;">%${basicCalcData.totalDoctor.complianceRate}</td>
            <td colspan="2" style="color: #047857;">%${basicCalcData.totalOther.complianceRate}</td>
            <td colspan="2" style="color: #047857; font-size: 15px; background: #bbf7d0;">%${overallRate}</td>
          </tr>
        </tbody>
      </table>

      <div class="page-footer">
        الصفحة 2 من 5 • استمارة الحساب الأساسي للفئات المهنية المعتمدة من WHO • Page 3
      </div>
    </div>

    <!-- PAGE 3: WHO 5 MOMENTS INDICATION CALCULATION FORM (Page 4) -->
    <div class="page-section">
      <div style="background: #1e293b; color: white; padding: 12px 18px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 900; font-size: 14px;">WHO 5 Moments Indication Calculation Form</span>
        <span style="font-size: 12px; font-weight: 700; color: #94a3b8;">الصفحة 3: استمارة حساب نسب دواعي الغسيل الخمسة (Page 4)</span>
      </div>

      <div style="margin: 15px 0 10px 0; font-size: 12px; font-weight: 700; color: #475569;">
        توزيع دواعي الغسيل الخمسة والإجراءات ونسبة الامتثال (Ratio act / indic %) لكل داعٍ:
      </div>

      <table class="table-orange-header">
        <thead>
          <tr>
            <th>داعي ولحظة نظافة الأيدي (Indication / Moment)</th>
            <th>الرمز المعتمد</th>
            <th>عدد الدواعي (Indic)</th>
            <th>الإجراءات المطبقة (Act)</th>
            <th>نسبة الامتثال % (Ratio)</th>
            <th>التقييم الفني</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: right; font-weight: 700;">1. قبل ملامسة المريض (Before touching a patient)</td>
            <td><span class="tag tag-blue">bef.pat</span></td>
            <td>${indicationCalcData.totalBefPat.indicCount}</td>
            <td>${indicationCalcData.totalBefPat.actCount}</td>
            <td style="font-weight: 800; color: #047857;">%${indicationCalcData.totalBefPat.ratio}</td>
            <td><span class="tag tag-emerald">مستقر</span></td>
          </tr>
          <tr>
            <td style="text-align: right; font-weight: 700;">2. قبل الإجراء النظيف / المعقم (Before clean/aseptic procedure)</td>
            <td><span class="tag tag-purple">bef.asept</span></td>
            <td>${indicationCalcData.totalBefAsept.indicCount}</td>
            <td>${indicationCalcData.totalBefAsept.actCount}</td>
            <td style="font-weight: 800; color: #047857;">%${indicationCalcData.totalBefAsept.ratio}</td>
            <td><span class="tag tag-emerald">حرجة جداً</span></td>
          </tr>
          <tr>
            <td style="text-align: right; font-weight: 700;">3. بعد التعرض لسوائل الجسم (After body fluid exposure)</td>
            <td><span class="tag tag-amber">aft.b.f</span></td>
            <td>${indicationCalcData.totalAftBf.indicCount}</td>
            <td>${indicationCalcData.totalAftBf.actCount}</td>
            <td style="font-weight: 800; color: #047857;">%${indicationCalcData.totalAftBf.ratio}</td>
            <td><span class="tag tag-emerald">وقاية ذاتية</span></td>
          </tr>
          <tr>
            <td style="text-align: right; font-weight: 700;">4. بعد ملامسة المريض (After touching a patient)</td>
            <td><span class="tag tag-blue">aft.pat</span></td>
            <td>${indicationCalcData.totalAftPat.indicCount}</td>
            <td>${indicationCalcData.totalAftPat.actCount}</td>
            <td style="font-weight: 800; color: #047857;">%${indicationCalcData.totalAftPat.ratio}</td>
            <td><span class="tag tag-emerald">مستقر</span></td>
          </tr>
          <tr>
            <td style="text-align: right; font-weight: 700;">5. بعد ملامسة بيئة ومحيط المريض (After touching surroundings)</td>
            <td><span class="tag tag-purple">aft.surr</span></td>
            <td>${indicationCalcData.totalAftSurr.indicCount}</td>
            <td>${indicationCalcData.totalAftSurr.actCount}</td>
            <td style="font-weight: 800; color: #047857;">%${indicationCalcData.totalAftSurr.ratio}</td>
            <td><span class="tag tag-emerald">مستقر</span></td>
          </tr>
          <tr style="background: #ecfdf5; font-weight: 900;">
            <td colspan="2" style="text-align: right; color: #047857;">الإجمالي العام للامتثال بالدواعي</td>
            <td>${totalIndicationsCount}</td>
            <td>${totalIndicationActionsCount}</td>
            <td colspan="2" style="color: #047857; font-size: 14px;">%${indicationCalcData.overallRatio}</td>
          </tr>
        </tbody>
      </table>

      <div class="page-footer">
        الصفحة 3 من 5 • استمارة حساب نسب دواعي نظافة الأيدي الخمسة • Page 4
      </div>
    </div>

    <!-- PAGE 4: FIELD OBSERVATION SESSIONS REGISTER -->
    <div class="page-section">
      <div style="background: #1e293b; color: white; padding: 12px 18px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 900; font-size: 14px;">Field Observation Sessions Register</span>
        <span style="font-size: 12px; font-weight: 700; color: #94a3b8;">الصفحة 4: سجل وتفاصيل جلسات الرصد الميداني</span>
      </div>

      <table class="table-dark-header" style="margin-top: 15px;">
        <thead>
          <tr>
            <th>رقم الجلسة</th>
            <th>التاريخ</th>
            <th>القسم / الجناح</th>
            <th>الفترة والوقت</th>
            <th>راصد المكافحة</th>
            <th>إجمالي الفرص</th>
            <th>الإجراءات (HR+HW)</th>
            <th>نسبة الامتثال</th>
          </tr>
        </thead>
        <tbody>
          ${sessions
            .map((s, idx) => {
              let opps = 0;
              let acts = 0;
              s.columns.forEach((c) => {
                c.opportunities.forEach((o) => {
                  if (o.action) {
                    opps++;
                    if (o.action === "HR" || o.action === "HW") acts++;
                  }
                });
              });
              const rate = opps > 0 ? Math.round((acts / opps) * 1000) / 10 : 0;
              return `
              <tr>
                <td style="font-weight: 800;">جلسة #${s.sessionNumber || idx + 1}</td>
                <td>${s.date}</td>
                <td>${s.ward}</td>
                <td>${s.startTime || "-"} - ${s.endTime || "-"}</td>
                <td>${s.observer}</td>
                <td style="font-weight: 700;">${opps}</td>
                <td style="font-weight: 700; color: #047857;">${acts}</td>
                <td style="font-weight: 800; color: ${rate >= targetCompliance ? "#047857" : "#d97706"};">%${rate}</td>
              </tr>
            `;
            })
            .join("")}
        </tbody>
      </table>

      <div class="page-footer">
        الصفحة 4 من 5 • سجل وتفاصيل جلسات الرصد الميداني
      </div>
    </div>

    <!-- PAGE 5: RECOMMENDATIONS, ACTION PLAN & SIGNATURES -->
    <div class="page-section">
      <div style="background: #1e293b; color: white; padding: 12px 18px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 900; font-size: 14px;">Analysis, Recommendations, Action Plan & Signatures</span>
        <span style="font-size: 12px; font-weight: 700; color: #94a3b8;">الصفحة 5: التوصيات وخطة التحسين والاعتمادات</span>
      </div>

      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; margin-top: 15px;">
        <h3 style="font-size: 14px; font-weight: 900; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">
          التوصيات وخطة العمل لتحسين ممارسات نظافة وتطهير الأيدي:
        </h3>
        <div style="font-size: 12px; color: #334155; line-height: 1.7; font-weight: 600;">
          <p>1. الاستمرار في تدريب الكوادر الطبية والتمريضية على دواعي غسيل الأيدي الخمسة (WHO 5 Moments) مع التركيز على دافع ما قبل ملامسة المريض وما بعد ملامسة البيئة المحيطة.</p>
          <p>2. التأكد من توفر المطهرات الكحولية عند نقاط تقديم الخدمة (Point of Care) وفي كافة العربات العلاجية وغرف المرضى.</p>
          <p>3. تطبيق آلية التغذية الراجعة الفورية بعد كل جلسة رصد وتكريم الأقسام والفئات المهنية المحققة لأعلى نسب امتثال لتحفيز الالتزام المستمر.</p>
          <p>4. الالتزام بعدم ارتداء القفازات كبديل لنظافة وتطهير الأيدي والحرص على التطهير قبل وبعد نزع القفازات.</p>
          ${
            customNotes
              ? `<div style="margin-top: 10px; padding: 10px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; color: #92400e; font-weight: 700;">
                  ${customNotes}
                 </div>`
              : ""
          }
        </div>
      </div>

      <div class="signatures-box">
        <h4 style="text-align: center; font-size: 14px; font-weight: 900; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px;">
          الاعتمادات والتوقيعات الرسمية
        </h4>
        <div class="signatures-grid">
          <div>
            <div style="font-size: 12px; font-weight: 800; color: #475569;">مسؤول / راصد مكافحة العدوى</div>
            <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 4px;">${centerSettings.infectionControlLead || "م/ أحمد وحيد شعبان"}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 25px;">التوقيع: .......................................</div>
          </div>
          <div>
            <div style="font-size: 12px; font-weight: 800; color: #475569;">مدير المركز / المستشفى</div>
            <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 4px;">${centerSettings.medicalDirector || "د/ إيناس"}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 25px;">التوقيع والاعتماد: ............................</div>
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
