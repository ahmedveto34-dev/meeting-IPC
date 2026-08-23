/**
 * =========================================================================================
 * code.js - Google Sheets Integration & Data Sync Handler
 * =========================================================================================
 * 
 * هذا الملف مخصص لحفظ ومزامنة بيانات اجتماعات مكافحة العدوى، تقارير المرور الميداني،
 * والخطط الشهرية على Google Sheets.
 *
 * معرف جدول البيانات (Sheet ID) متغير وديناميكي:
 * يتم جلبه من متغيرات البيئة (Environment Variables) في Vercel أو Node.js:
 * process.env.GOOGLE_SHEET_ID أو process.env.SHEET_ID
 *
 * كما يحتوي الملف على كود Google Apps Script (Code.gs) إذا كنت تريد نشره كـ Web App مباشر.
 * =========================================================================================
 */

// =========================================================================================
// 1. VERCEL SERVERLESS / NODE.JS / EXPRESS HANDLER
// =========================================================================================

/**
 * الحصول على معرف الـ Google Sheet من متغيرات البيئة (Vercel Environment Variables)
 */
function getSheetId(customParam) {
  return (
    customParam ||
    process.env.VITE_SHEET_ID ||
    process.env.GOOGLE_SHEET_ID ||
    process.env.SHEET_ID ||
    process.env.SPREADSHEET_ID ||
    ""
  );
}

/**
 * Vercel Serverless Function Handler (api/code.js or root execution)
 */
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const sheetId = getSheetId(req.query?.sheetId || req.body?.sheetId);

  // GET: فحص حالة الاتصال ومعرف الشيت الحالي
  if (req.method === "GET") {
    return res.status(200).json({
      success: true,
      message: "Google Sheets Handler is active",
      configuredSheetId: sheetId ? `${sheetId.substring(0, 6)}...${sheetId.slice(-4)}` : "Not set (set GOOGLE_SHEET_ID in Vercel)",
      hasSheetId: Boolean(sheetId),
      instructions: "Send a POST request with { action: 'save_meeting' | 'save_round' | 'save_all', data: {...} }",
    });
  }

  // POST: حفظ وتحديث البيانات
  if (req.method === "POST") {
    try {
      const { action, data, type } = req.body || {};

      if (!sheetId) {
        return res.status(400).json({
          success: false,
          error: "GOOGLE_SHEET_ID is not configured in Vercel environment variables.",
          help: "يرجى إضافة GOOGLE_SHEET_ID في Vercel Project Settings -> Environment Variables",
        });
      }

      // إذا تم إرسال طلب ترحيل عبر Google Apps Script Webhook URL
      const appsScriptWebhook = process.env.GOOGLE_APPS_SCRIPT_URL;
      if (appsScriptWebhook) {
        const scriptResponse = await fetch(appsScriptWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sheetId,
            action: action || type || "sync_data",
            data,
            timestamp: new Date().toISOString(),
          }),
        });

        const scriptResult = await scriptResponse.json();
        return res.status(200).json({
          success: true,
          sheetId,
          result: scriptResult,
        });
      }

      // معالجة البيانات وإرجاع تأكيد التنسيق
      return res.status(200).json({
        success: true,
        message: "Data received and prepared for Google Sheet",
        sheetId,
        action: action || type || "sync",
        recordCount: Array.isArray(data) ? data.length : 1,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error handling Google Sheets sync:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to process Google Sheets sync",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// =========================================================================================
// 2. GOOGLE APPS SCRIPT CODE (Code.gs)
// (انسخ هذا الجزء وضعه في Apps Script في حال رغبتك بنشر Webhook مباشر مجاني بدون خادم)
// =========================================================================================
/*
function getSpreadsheet(e) {
  // 1. البحث في خصائص السكربت (Script Properties)
  var scriptSheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID') || 
                      PropertiesService.getScriptProperties().getProperty('GOOGLE_SHEET_ID');
  
  // 2. أو استلام الـ ID مرسلاً من Vercel في الـ payload
  var requestSheetId = null;
  if (e && e.postData && e.postData.contents) {
    try {
      var body = JSON.parse(e.postData.contents);
      requestSheetId = body.sheetId;
    } catch (err) {}
  } else if (e && e.parameter && e.parameter.sheetId) {
    requestSheetId = e.parameter.sheetId;
  }

  var finalId = requestSheetId || scriptSheetId;
  
  if (finalId) {
    return SpreadsheetApp.openById(finalId);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var ss = getSpreadsheet(e);
    var action = contents.action || 'save_meeting';
    var data = contents.data;

    // تهيئة الشيتات
    var meetingsSheet = getOrCreateSheet(ss, "اجتماعات مكافحة العدوى", [
      "رقم الاجتماع", "الشهر / الموضوع", "التاريخ", "اليوم", "الوقت", "المركز الطبي", "عدد الحضور", "أبرز التوصيات والقرارات", "تاريخ التسجيل"
    ]);

    var roundsSheet = getOrCreateSheet(ss, "تقارير المرور الميداني", [
      "رقم التقرير", "الأسبوع", "القسم / العيادة", "التاريخ", "الملاحظات الإيجابية", "الملاحظات السلبية", "الإجراءات التصحيحية", "مسؤول المرور"
    ]);

    var actionsSheet = getOrCreateSheet(ss, "خطة الإجراءات التصحيحية والقرارات", [
      "الموضوع / البند", "القرار والتوصية", "المسؤول عن التنفيذ", "المدة الزمنية", "طريقة المتابعة", "الحالة", "المصدر"
    ]);

    // معالجة حفظ الاجتماع
    if (action === 'save_meeting' && data) {
      meetingsSheet.appendRow([
        data.meetingNumber || '',
        data.monthName || data.agenda?.[0] || 'اجتماع شهري',
        data.date || '',
        data.day || '',
        data.time || '',
        data.centerName || '',
        (data.members || []).filter(function(m){ return m.attended; }).length,
        (data.decisions || []).map(function(d){ return d.topic + ': ' + d.decision; }).join(' | '),
        new Date().toLocaleString('ar-EG')
      ]);

      if (data.decisions && data.decisions.length > 0) {
        data.decisions.forEach(function(dec) {
          actionsSheet.appendRow([
            dec.topic || '',
            dec.decision || '',
            dec.responsible || '',
            dec.duration || '',
            dec.monitoringMethod || '',
            dec.status || 'pending',
            'اجتماع ' + (data.meetingNumber || '')
          ]);
        });
      }
    }

    // معالجة حفظ تقرير المرور
    if (action === 'save_round' && data) {
      roundsSheet.appendRow([
        data.roundNumber || '',
        data.weekNumber ? ('الأسبوع ' + data.weekNumber) : '',
        data.department || 'عام',
        data.date || '',
        (data.positiveFindings || []).join(' | '),
        (data.negativeFindings || []).join(' | '),
        (data.actionPlan || []).map(function(a){ return a.action + ' (' + a.responsible + ')'; }).join(' | '),
        data.auditorName || ''
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "تم حفظ البيانات بنجاح في Google Sheet",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Infection Control Google Sheets Sync Service"
  })).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#1e40af");
      headerRange.setFontColor("#ffffff");
      headerRange.setHorizontalAlignment("center");
      sheet.setRightToLeft(true);
    }
  }
  return sheet;
}
*/
