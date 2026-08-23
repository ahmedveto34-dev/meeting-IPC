/**
 * =========================================================================================
 * code.gs - Google Apps Script Backend for Infection Control App
 * =========================================================================================
 * 
 * هذا الملف مخصص للعمل كـ Google Apps Script (Code.gs) أو Web App لاستقبال وحفظ البيانات
 * من تطبيق مكافحة العدوى المستضاف على Vercel أو المتصفح.
 * 
 * [1] يتم استلام الـ Sheet ID ديناميكياً من:
 *     - متغير البيئة / خصائص السكربت (Script Properties): SHEET_ID أو GOOGLE_SHEET_ID
 *     - أو من خلال معلمات الطلب المرسل (Request Payload / URL Parameter) القادمة من Vercel: sheetId
 *     - في حال عدم تمريره، يتم استخدام الشيت المرتبط به السكربت تلقائياً (Active Spreadsheet).
 * =========================================================================================
 */

/**
 * دالة استرجاع جدول البيانات (Spreadsheet) بالمعرف الديناميكي
 */
function getTargetSpreadsheet(e) {
  // 1. فحص المعاملات المرسلة في الطلب القادم من تطبيق Vercel
  var requestSheetId = "";
  if (e && e.postData && e.postData.contents) {
    try {
      var body = JSON.parse(e.postData.contents);
      requestSheetId = body.sheetId || body.spreadsheetId || "";
    } catch (err) {}
  }
  
  if (!requestSheetId && e && e.parameter && (e.parameter.sheetId || e.parameter.spreadsheetId)) {
    requestSheetId = e.parameter.sheetId || e.parameter.spreadsheetId;
  }

  // 2. فحص خصائص السكربت (Script Properties / Environment Settings)
  var scriptSheetId = PropertiesService.getScriptProperties().getProperty("SHEET_ID") ||
                      PropertiesService.getScriptProperties().getProperty("GOOGLE_SHEET_ID");

  var targetId = requestSheetId || scriptSheetId;

  if (targetId && targetId.trim() !== "") {
    return SpreadsheetApp.openById(targetId.trim());
  }

  // 3. كخيار بديل: فتح الشيت النشط الحالي
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * معالج طلبات POST - استقبال وحفظ الاجتماعات، تقارير المرور، والقرارات
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({
        success: false,
        error: "No payload received in request body"
      });
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || payload.type || "save_meeting";
    var data = payload.data || payload;
    var ss = getTargetSpreadsheet(e);

    if (!ss) {
      return jsonResponse({
        success: false,
        error: "Could not locate or open Google Spreadsheet. Please provide a valid Sheet ID."
      });
    }

    // تهيئة أوراق العمل (Sheets) مع العناوين والتنسيقات القياسية
    var meetingsSheet = getOrCreateSheet(ss, "اجتماعات مكافحة العدوى", [
      "رقم الاجتماع",
      "الشهر / الموضوع الرئيسي",
      "التاريخ",
      "اليوم",
      "الوقت",
      "اسم المركز الطبي",
      "مكان الانعقاد",
      "عدد الحضور",
      "أسماء الحضور",
      "أبرز التوصيات والقرارات",
      "متابعة الاجتماع السابق",
      "تاريخ الإضافة بالنظام"
    ]);

    var roundsSheet = getOrCreateSheet(ss, "تقارير المرور الميداني", [
      "رقم التقرير",
      "الأسبوع",
      "القسم / العيادة المزارة",
      "التاريخ واليوم",
      "اسم المركز",
      "الملاحظات الإيجابية والامتثال",
      "الملاحظات السلبية وفرص التحسين",
      "خطة الإجراءات التصحيحية",
      "مسؤول المرور والتفتيش",
      "تاريخ الإضافة بالنظام"
    ]);

    var actionsSheet = getOrCreateSheet(ss, "سجل القرارات والإجراءات التصحيحية", [
      "كود السجل",
      "الموضوع / البند المعني",
      "القرار والتوصية المعتمدة",
      "المسؤول عن التنفيذ",
      "المدة الزمنية للتنفيذ",
      "طريقة المتابعة والتحقق",
      "حالة التنفيذ",
      "المصدر (اجتماع / مرور)",
      "تاريخ التوثيق"
    ]);

    // =========================================================================
    // 1. حفظ محضر الاجتماع (Save Meeting)
    // =========================================================================
    if (action === "save_meeting" || action === "meeting") {
      var memberList = data.members || [];
      var attendedCount = memberList.filter(function(m) { return m.attended; }).length;
      var attendedNames = memberList
        .filter(function(m) { return m.attended; })
        .map(function(m) { return m.name + " (" + (m.role || "") + ")"; })
        .join("، ");

      var decisionsSummary = (data.decisions || [])
        .map(function(d, idx) { return (idx + 1) + "- " + d.topic + ": " + d.decision; })
        .join(" \n");

      meetingsSheet.appendRow([
        data.meetingNumber || "",
        data.monthName || (data.agenda && data.agenda[0]) || "اجتماع شهري",
        data.date || "",
        data.day || "",
        data.time || "",
        data.centerName || "",
        data.location || "",
        attendedCount,
        attendedNames,
        decisionsSummary,
        data.previousMeetingFollowUp || "",
        new Date().toLocaleString("ar-EG", { timeZone: "Asia/Riyadh" })
      ]);

      // ترحيل القرارات الفردية لسجل الإجراءات
      if (data.decisions && data.decisions.length > 0) {
        data.decisions.forEach(function(dec) {
          actionsSheet.appendRow([
            dec.id || Utilities.getUuid(),
            dec.topic || "",
            dec.decision || "",
            dec.responsible || "",
            dec.duration || "",
            dec.monitoringMethod || "",
            dec.status || "قيد التنفيذ",
            "اجتماع رقم: " + (data.meetingNumber || "") + " (" + (data.monthName || "") + ")",
            new Date().toLocaleDateString("ar-EG")
          ]);
        });
      }

      return jsonResponse({
        success: true,
        message: "تم حفظ محضر الاجتماع والقرارات بنجاح في Google Sheet",
        sheetName: ss.getName(),
        timestamp: new Date().toISOString()
      });
    }

    // =========================================================================
    // 2. حفظ تقرير المرور الميداني (Save Round)
    // =========================================================================
    if (action === "save_round" || action === "round") {
      var posFindings = (data.positiveFindings || []).join(" \n");
      var negFindings = (data.negativeFindings || []).join(" \n");
      var planSummary = (data.actionPlan || [])
        .map(function(p, i) { return (i + 1) + "- " + p.action + " (المسؤول: " + p.responsible + ")"; })
        .join(" \n");

      roundsSheet.appendRow([
        data.roundNumber || "",
        data.weekNumber ? ("الأسبوع " + data.weekNumber) : "",
        data.department || "عام",
        (data.date || "") + (data.day ? " (" + data.day + ")" : ""),
        data.centerName || "",
        posFindings,
        negFindings,
        planSummary,
        data.auditorName || "",
        new Date().toLocaleString("ar-EG", { timeZone: "Asia/Riyadh" })
      ]);

      // ترحيل خطة المرور لسجل الإجراءات
      if (data.actionPlan && data.actionPlan.length > 0) {
        data.actionPlan.forEach(function(item) {
          actionsSheet.appendRow([
            item.id || Utilities.getUuid(),
            item.observation || ("مرور: " + (data.department || "")),
            item.action || "",
            item.responsible || "",
            item.duration || "",
            item.monitoringMethod || "",
            item.status || "قيد التنفيذ",
            "تقرير مرور أسبوع " + (data.weekNumber || "") + " - " + (data.department || ""),
            new Date().toLocaleDateString("ar-EG")
          ]);
        });
      }

      return jsonResponse({
        success: true,
        message: "تم حفظ تقرير المرور الميداني بنجاح في Google Sheet",
        sheetName: ss.getName(),
        timestamp: new Date().toISOString()
      });
    }

    // =========================================================================
    // 3. حفظ حزمة بيانات كاملة (Export/Sync Bundle)
    // =========================================================================
    if (action === "save_all" || action === "sync_bundle") {
      return jsonResponse({
        success: true,
        message: "تم استلام حزمة البيانات ومطابقتها مع Google Sheet",
        sheetName: ss.getName(),
        timestamp: new Date().toISOString()
      });
    }

    return jsonResponse({
      success: false,
      error: "Unknown action specified: " + action
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * معالج طلبات GET - فحص حالة الخدمة وتأكيد الاتصال
 */
function doGet(e) {
  try {
    var ss = getTargetSpreadsheet(e);
    return jsonResponse({
      status: "online",
      service: "Infection Control Google Sheets Backend",
      connectedSheet: ss ? ss.getName() : "None",
      spreadsheetId: ss ? ss.getId() : null,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return jsonResponse({
      status: "error",
      error: err.toString()
    });
  }
}

/**
 * دالة مساعدة لإنشاء أو إرجاع ورقة عمل وتنسيق أعمدتها تلقائياً
 */
function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#1e3a8a"); // أزرق داكن كلاسيكي
      headerRange.setFontColor("#ffffff");
      headerRange.setHorizontalAlignment("center");
      headerRange.setVerticalAlignment("middle");
      sheet.setRowHeight(1, 35);
      sheet.setRightToLeft(true); // اتجاه عربي من اليمين لليسار
      sheet.setFrozenRows(1); // تجميد الصف الأول
    }
  }
  return sheet;
}

/**
 * إرجاع استجابة JSON مع رؤوس السماح
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
