/**
 * Utility for syncing Infection Control Meetings, Field Rounds, and Action Plans
 * with Google Sheets via the Apps Script Web App endpoint.
 */
import { Meeting, RoundReport, WHOObservationSession, CenterSettings } from "../types";
import {
  calculateWHOBasicCompliance,
  calculateWHOIndicationCompliance,
} from "./whoHandHygieneCalculator";

export const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw8Un6zsH3kMX-ieKRW_ImtbdaR4STr3IxxVglEAUkru1Le28ZNtc8QLfncOAD0Cly-/exec";

export const DEFAULT_GOOGLE_SHEET_ID = "1njEum9YRO5PTqNufQ3iCFTb7K_1ZsEulb7HFr0VY-Ow";

const STORAGE_KEY_SHEET_ID = "inf_ctrl_google_sheet_id_v2";

/**
 * Get configured Google Apps Script Web App URL
 */
export function getGoogleSheetUrl(): string {
  return GOOGLE_APPS_SCRIPT_URL;
}

/**
 * Get configured Google Sheet ID from environment variables, localStorage or default fallback
 */
export function getGoogleSheetId(): string {
  const metaEnv = (import.meta as any)?.env || {};
  const procEnv = (typeof process !== "undefined" && process.env) ? process.env : {};
  
  const envId =
    metaEnv.SHEET_ID ||
    metaEnv.VITE_SHEET_ID ||
    procEnv.SHEET_ID ||
    procEnv.VITE_SHEET_ID ||
    "";

  if (typeof envId === "string" && envId.trim()) {
    return envId.trim();
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY_SHEET_ID);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch (e) {}

  return DEFAULT_GOOGLE_SHEET_ID;
}

/**
 * Update and store custom Google Sheet ID
 */
export function setCustomGoogleSheetId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_SHEET_ID, id.trim());
  } catch (e) {}
}

/**
 * Get direct Google Spreadsheet web URL
 */
export function getGoogleSpreadsheetDirectUrl(customSheetId?: string): string {
  const id = customSheetId || getGoogleSheetId() || DEFAULT_GOOGLE_SHEET_ID;
  return `https://docs.google.com/spreadsheets/d/${id}/edit`;
}

export interface SyncResponse {
  success: boolean;
  message?: string;
  error?: string;
  sheetName?: string;
  timestamp?: string;
}

/**
 * Save / Sync a single Meeting to Google Sheets
 */
export async function syncMeetingToGoogleSheets(
  meeting: Meeting,
  customSheetId?: string
): Promise<SyncResponse> {
  const url = getGoogleSheetUrl();
  const sheetId = customSheetId || getGoogleSheetId();

  try {
    const payload = {
      action: "save_meeting",
      sheetId: sheetId || undefined,
      data: {
        meetingNumber: meeting.meetingNumber,
        monthName: meeting.agenda && meeting.agenda.length > 0 ? meeting.agenda[0] : "اجتماع شهري",
        date: meeting.date,
        day: meeting.day,
        time: meeting.time,
        centerName: meeting.centerName,
        location: meeting.location,
        agenda: meeting.agenda,
        previousMeetingFollowUp: meeting.previousMeetingFollowUp,
        members: meeting.members,
        kpis: meeting.kpis,
        decisions: meeting.decisions,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Error syncing meeting to Google Sheets:", error);
    return {
      success: false,
      error: error?.message || "فشل الاتصال بـ Google Sheets",
    };
  }
}

/**
 * Save / Sync a single Field Round Report to Google Sheets
 */
export async function syncRoundToGoogleSheets(
  round: RoundReport,
  customSheetId?: string
): Promise<SyncResponse> {
  const url = getGoogleSheetUrl();
  const sheetId = customSheetId || getGoogleSheetId();

  try {
    const payload = {
      action: "save_round",
      sheetId: sheetId || undefined,
      data: {
        title: round.title,
        department: round.department || "عام",
        date: round.date,
        day: round.day,
        period: round.period,
        inspector: round.inspector,
        supervisorRole: round.supervisorRole,
        centerName: round.centerName,
        generalRecommendation: round.generalRecommendation,
        observations: round.observations,
        actionPlan: (round.observations || []).map((obs) => ({
          id: obs.id,
          observation: obs.observation,
          action: obs.recommendation,
          responsible: obs.responsible,
          status: obs.status,
          dueDate: obs.dueDate,
          location: obs.location,
        })),
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Error syncing round to Google Sheets:", error);
    return {
      success: false,
      error: error?.message || "فشل الاتصال بـ Google Sheets",
    };
  }
}

/**
 * Save / Sync a single WHO Hand Hygiene Observation Session to Google Sheets
 */
export async function syncHandHygieneSessionToGoogleSheets(
  session: WHOObservationSession,
  customSheetId?: string
): Promise<SyncResponse> {
  const url = getGoogleSheetUrl();
  const sheetId = customSheetId || getGoogleSheetId();

  // Compute metrics for this single session
  let oppCount = 0;
  let hwCount = 0;
  let hrCount = 0;
  let missedCount = 0;
  let glovesMisuse = 0;

  (session.columns || []).forEach((col) => {
    (col.opportunities || []).forEach((opp) => {
      const hasInd = opp.indications && opp.indications.length > 0;
      const hasAct = opp.action === "HR" || opp.action === "HW" || opp.action === "missed";
      if (hasInd || hasAct) {
        oppCount += 1;
        if (opp.action === "HR") hrCount += 1;
        if (opp.action === "HW") hwCount += 1;
        if (opp.action === "missed") missedCount += 1;
        if (opp.gloves) glovesMisuse += 1;
      }
    });
  });

  const actCount = hrCount + hwCount;
  const complianceRate = oppCount > 0 ? Math.round((actCount / oppCount) * 1000) / 10 : 0;

  try {
    const payload = {
      action: "save_hand_hygiene_session",
      sheetId: sheetId || undefined,
      data: {
        sessionNumber: session.sessionNumber,
        facility: session.facility || "المركز الطبي",
        service: session.service || "",
        ward: session.ward || "",
        department: session.department || "عام",
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        sessionDuration: session.sessionDuration || 20,
        observer: session.observer || "فريق مكافحة العدوى",
        periodNumber: session.periodNumber || "1",
        notes: session.notes || "",
        oppCount,
        actCount,
        hrCount,
        hwCount,
        missedCount,
        glovesMisuse,
        complianceRate: `${complianceRate}%`,
        columns: (session.columns || []).map((col) => ({
          columnNumber: col.columnNumber,
          profCatCode: col.profCatCode,
          profCatName: col.profCatName,
          workersCount: col.workersCount,
          opportunitiesCount: (col.opportunities || []).filter(
            (o) => (o.indications && o.indications.length > 0) || o.action
          ).length,
        })),
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Error syncing Hand Hygiene session to Google Sheets:", error);
    return {
      success: false,
      error: error?.message || "فشل الاتصال بـ Google Sheets",
    };
  }
}

/**
 * Save / Sync All WHO Hand Hygiene Sessions & Full Compliance Analysis (Page 3 & Page 4) to Google Sheets
 */
export async function syncAllHandHygieneToGoogleSheets(
  sessions: WHOObservationSession[],
  centerSettings: CenterSettings,
  customSheetId?: string
): Promise<SyncResponse> {
  const url = getGoogleSheetUrl();
  const sheetId = customSheetId || getGoogleSheetId();

  // Run official WHO compliance calculations
  const basicCalc = calculateWHOBasicCompliance(
    sessions,
    centerSettings.centerName,
    "الفترة الحالية (2026)",
    centerSettings.departmentTitle
  );

  const indicationCalc = calculateWHOIndicationCompliance(
    sessions,
    centerSettings.centerName,
    "الفترة الحالية (2026)",
    centerSettings.departmentTitle
  );

  try {
    const payload = {
      action: "save_hand_hygiene_all",
      sheetId: sheetId || undefined,
      data: {
        centerName: centerSettings.centerName,
        departmentTitle: centerSettings.departmentTitle,
        syncedAt: new Date().toISOString(),
        totalSessionsCount: sessions.length,
        overallComplianceRate: `${basicCalc.overallComplianceRate}%`,
        grandTotal: {
          opportunities: basicCalc.grandTotal.oppCount,
          actions: basicCalc.grandTotal.actCount,
          handrub: basicCalc.grandTotal.hrCount,
          handwash: basicCalc.grandTotal.hwCount,
          complianceRate: `${basicCalc.grandTotal.complianceRate}%`,
        },
        professionsSummary: {
          nurses: {
            opp: basicCalc.totalNurse.oppCount,
            act: basicCalc.totalNurse.actCount,
            rate: `${basicCalc.totalNurse.complianceRate}%`,
          },
          auxiliary: {
            opp: basicCalc.totalAuxiliary.oppCount,
            act: basicCalc.totalAuxiliary.actCount,
            rate: `${basicCalc.totalAuxiliary.complianceRate}%`,
          },
          doctors: {
            opp: basicCalc.totalDoctor.oppCount,
            act: basicCalc.totalDoctor.actCount,
            rate: `${basicCalc.totalDoctor.complianceRate}%`,
          },
          other: {
            opp: basicCalc.totalOther.oppCount,
            act: basicCalc.totalOther.actCount,
            rate: `${basicCalc.totalOther.complianceRate}%`,
          },
        },
        fiveMomentsSummary: {
          moment1_beforePatient: {
            opp: indicationCalc.totalBefPat.indicCount,
            act: indicationCalc.totalBefPat.actCount,
            rate: `${indicationCalc.totalBefPat.ratio}%`,
          },
          moment2_beforeAseptic: {
            opp: indicationCalc.totalBefAsept.indicCount,
            act: indicationCalc.totalBefAsept.actCount,
            rate: `${indicationCalc.totalBefAsept.ratio}%`,
          },
          moment3_afterBodyFluid: {
            opp: indicationCalc.totalAftBf.indicCount,
            act: indicationCalc.totalAftBf.actCount,
            rate: `${indicationCalc.totalAftBf.ratio}%`,
          },
          moment4_afterPatient: {
            opp: indicationCalc.totalAftPat.indicCount,
            act: indicationCalc.totalAftPat.actCount,
            rate: `${indicationCalc.totalAftPat.ratio}%`,
          },
          moment5_afterSurroundings: {
            opp: indicationCalc.totalAftSurr.indicCount,
            act: indicationCalc.totalAftSurr.actCount,
            rate: `${indicationCalc.totalAftSurr.ratio}%`,
          },
        },
        sessionsList: sessions.map((sess) => {
          let opp = 0;
          let hw = 0;
          let hr = 0;
          (sess.columns || []).forEach((c) => {
            (c.opportunities || []).forEach((o) => {
              if ((o.indications && o.indications.length > 0) || o.action) {
                opp += 1;
                if (o.action === "HR") hr += 1;
                if (o.action === "HW") hw += 1;
              }
            });
          });
          const act = hw + hr;
          const rate = opp > 0 ? Math.round((act / opp) * 1000) / 10 : 0;
          return {
            sessionNumber: sess.sessionNumber,
            date: sess.date,
            ward: sess.ward,
            department: sess.department,
            observer: sess.observer,
            durationMin: sess.sessionDuration || 20,
            oppCount: opp,
            actCount: act,
            hrCount: hr,
            hwCount: hw,
            rate: `${rate}%`,
          };
        }),
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Error syncing full Hand Hygiene to Google Sheets:", error);
    return {
      success: false,
      error: error?.message || "فشل الاتصال بـ Google Sheets",
    };
  }
}

/**
 * Test connectivity with Google Apps Script Web App
 */
export async function testGoogleSheetsConnection(customSheetId?: string): Promise<{
  connected: boolean;
  statusText: string;
  sheetIdConfigured: boolean;
}> {
  const url = getGoogleSheetUrl();
  const sheetId = customSheetId || getGoogleSheetId();

  try {
    const testUrl = sheetId ? `${url}?sheetId=${encodeURIComponent(sheetId)}` : url;
    const response = await fetch(testUrl, { method: "GET" });
    const data = await response.json();

    return {
      connected: data.status === "online" || data.status === "ok" || Boolean(data.service),
      statusText: data.connectedSheet ? `متصل بالشيت: ${data.connectedSheet}` : "الخدمة متصلة وجاهزة للعمل",
      sheetIdConfigured: Boolean(sheetId),
    };
  } catch (error: any) {
    return {
      connected: false,
      statusText: error?.message || "تعذر الاتصال بالرابط",
      sheetIdConfigured: Boolean(sheetId),
    };
  }
}

/**
 * Google Apps Script Reference Code for Google Sheets (Extensions -> Apps Script)
 */
export function getGoogleAppsScriptTemplateCode(): string {
  return `/**
 * =========================================================================
 * نظام مزامنة مكافحة العدوى وإحصائيات غسيل الأيدي (WHO) مع Google Sheets
 * Infection Control & WHO Hand Hygiene Compliance Sync Web App
 * =========================================================================
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Infection Control & WHO Hand Hygiene Google Sheets Sync",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var data = contents.data;
    var customSheetId = contents.sheetId;

    var ss = customSheetId ? SpreadsheetApp.openById(customSheetId) : SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }

    if (action === "save_meeting") {
      saveMeeting(ss, data);
      return responseSuccess("تم حفظ محضر الاجتماع بنجاح في الشيت");
    } else if (action === "save_round") {
      saveRound(ss, data);
      return responseSuccess("تم حفظ تقرير المرور الميداني وخطة العمل بنجاح");
    } else if (action === "save_hand_hygiene_session") {
      saveHandHygieneSession(ss, data);
      return responseSuccess("تم حفظ جلسة رصد غسيل الأيدي بنجاح في الشيت");
    } else if (action === "save_hand_hygiene_all") {
      saveHandHygieneAll(ss, data);
      return responseSuccess("تم حفظ كافة إحصائيات غسيل الأيدي ومعدلات الامتثال بنجاح");
    }

    return responseError("Unknown action: " + action);
  } catch (err) {
    return responseError(err.toString());
  }
}

function saveHandHygieneSession(ss, data) {
  var sheetName = "سجل_جلسات_غسيل_الأيدي_WHO";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.setRightToLeft(true);
    sheet.appendRow([
      "رقم الجلسة", "التاريخ", "القسم / التخصص", "الوحدة / الجناح", "الراصد",
      "المدة (دقيقة)", "وقت البدء", "وقت الانتهاء", "إجمالي الفرص", "إجمالي الإجراءات",
      "فرك كحولي (HR)", "غسيل بالماء (HW)", "فرص ضائعة (Missed)", "سوء استخدام القفازات", "معدل الامتثال %", "ملاحظات", "تاريخ المزامنة"
    ]);
    sheet.getRange(1, 1, 1, 17).setBackground("#ea580c").setFontColor("#ffffff").setFontWeight("bold");
  }

  sheet.appendRow([
    data.sessionNumber || "1",
    data.date || "",
    data.department || "",
    data.ward || "",
    data.observer || "",
    data.sessionDuration || 20,
    data.startTime || "",
    data.endTime || "",
    data.oppCount || 0,
    data.actCount || 0,
    data.hrCount || 0,
    data.hwCount || 0,
    data.missedCount || 0,
    data.glovesMisuse || 0,
    data.complianceRate || "0%",
    data.notes || "",
    new Date()
  ]);
}

function saveHandHygieneAll(ss, data) {
  var sheetName = "ملخص_إحصائيات_غسيل_الأيدي_WHO";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.setRightToLeft(true);
  } else {
    sheet.clear();
  }

  sheet.appendRow(["📊 ملخص إحصائيات ونسب امتثال غسيل الأيدي (WHO Compliance Report)"]);
  sheet.appendRow(["المنشأة الطبية:", data.centerName || "", "الجهة / الإدارة:", data.departmentTitle || "", "تاريخ المزامنة:", new Date()]);
  sheet.appendRow(["إجمالي الجلسات:", data.totalSessionsCount || 0, "معدل الامتثال العام:", data.overallComplianceRate || "0%"]);
  sheet.appendRow([]);

  // Professions Table
  sheet.appendRow(["1. معدل الامتثال حسب الفئات المهنية (Basic Compliance - Page 3)"]);
  sheet.appendRow(["الفئة المهنية", "عدد الفرص (Opportunities)", "عدد الإجراءات (Actions)", "معدل الامتثال (%)"]);
  sheet.appendRow(["التمريض والقبالة (Nurses)", data.professionsSummary.nurses.opp, data.professionsSummary.nurses.act, data.professionsSummary.nurses.rate]);
  sheet.appendRow(["مساعد صحي / خدمات معاونة (Auxiliary)", data.professionsSummary.auxiliary.opp, data.professionsSummary.auxiliary.act, data.professionsSummary.auxiliary.rate]);
  sheet.appendRow(["الأطباء البشريون (Medical Doctors)", data.professionsSummary.doctors.opp, data.professionsSummary.doctors.act, data.professionsSummary.doctors.rate]);
  sheet.appendRow(["كوادر صحية أخرى (Other HCW)", data.professionsSummary.other.opp, data.professionsSummary.other.act, data.professionsSummary.other.rate]);
  sheet.appendRow(["الإجمالي العام (Grand Total)", data.grandTotal.opportunities, data.grandTotal.actions, data.grandTotal.complianceRate]);
  sheet.appendRow([]);

  // 5 Moments Table
  sheet.appendRow(["2. معدل الامتثال حسب دواعي الغسيل الخمسة (WHO 5 Moments - Page 4)"]);
  sheet.appendRow(["الداعي (Indication)", "عدد الفرص", "عدد الإجراءات", "معدل الامتثال (%)"]);
  sheet.appendRow(["قبل ملامسة المريض (Moment 1)", data.fiveMomentsSummary.moment1_beforePatient.opp, data.fiveMomentsSummary.moment1_beforePatient.act, data.fiveMomentsSummary.moment1_beforePatient.rate]);
  sheet.appendRow(["قبل الإجراء النظيف / المعقم (Moment 2)", data.fiveMomentsSummary.moment2_beforeAseptic.opp, data.fiveMomentsSummary.moment2_beforeAseptic.act, data.fiveMomentsSummary.moment2_beforeAseptic.rate]);
  sheet.appendRow(["بعد خطر التعرض لسوائل الجسم (Moment 3)", data.fiveMomentsSummary.moment3_afterBodyFluid.opp, data.fiveMomentsSummary.moment3_afterBodyFluid.act, data.fiveMomentsSummary.moment3_afterBodyFluid.rate]);
  sheet.appendRow(["بعد ملامسة المريض (Moment 4)", data.fiveMomentsSummary.moment4_afterPatient.opp, data.fiveMomentsSummary.moment4_afterPatient.act, data.fiveMomentsSummary.moment4_afterPatient.rate]);
  sheet.appendRow(["بعد ملامسة محيط وبيئة المريض (Moment 5)", data.fiveMomentsSummary.moment5_afterSurroundings.opp, data.fiveMomentsSummary.moment5_afterSurroundings.act, data.fiveMomentsSummary.moment5_afterSurroundings.rate]);
  sheet.appendRow([]);

  // Sessions Log
  sheet.appendRow(["3. سجل الجلسات الميدانية المفصل"]);
  sheet.appendRow(["رقم الجلسة", "التاريخ", "القسم", "الوحدة", "الراصد", "المدة (دقيقة)", "الفرص", "الإجراءات", "فرك كحولي (HR)", "غسيل ماء (HW)", "معدل الامتثال"]);
  (data.sessionsList || []).forEach(function(s) {
    sheet.appendRow([s.sessionNumber, s.date, s.department, s.ward, s.observer, s.durationMin, s.oppCount, s.actCount, s.hrCount, s.hwCount, s.rate]);
  });
}

function saveMeeting(ss, data) {
  var sheetName = "محاضر_اجتماعات_مكافحة_العدوى";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.setRightToLeft(true);
    sheet.appendRow(["رقم الاجتماع", "الشهر / البند", "التاريخ", "اليوم", "المنشأة", "جدول الأعمال", "متابعة السابق", "تاريخ المزامنة"]);
  }
  sheet.appendRow([
    data.meetingNumber || "",
    data.monthName || "",
    data.date || "",
    data.day || "",
    data.centerName || "",
    (data.agenda || []).join(" | "),
    data.previousMeetingFollowUp || "",
    new Date()
  ]);
}

function saveRound(ss, data) {
  var sheetName = "تقارير_المرور_الميداني";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.setRightToLeft(true);
    sheet.appendRow(["العنوان", "القسم", "التاريخ", "المشرف", "المنشأة", "عدد الملاحظات", "التوصية العامة", "تاريخ المزامنة"]);
  }
  sheet.appendRow([
    data.title || "",
    data.department || "",
    data.date || "",
    data.inspector || "",
    data.centerName || "",
    (data.observations || []).length,
    data.generalRecommendation || "",
    new Date()
  ]);
}

function responseSuccess(msg) {
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: msg, timestamp: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}

function responseError(err) {
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: err, timestamp: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
}


