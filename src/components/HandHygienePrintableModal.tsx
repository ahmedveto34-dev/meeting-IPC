import React, { useState } from "react";
import {
  Printer,
  X,
  FileDown,
  Layers,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  Sparkles,
  Archive,
  Check,
} from "lucide-react";
import {
  WHOObservationSession,
  WHOBasicComplianceSheetData,
  WHOIndicationComplianceSheetData,
  CenterSettings,
} from "../types";
import { WHOObservationFormSheet } from "./WHOObservationFormSheet";
import { exportHandHygieneStatisticsToFullHtml } from "../utils/handHygieneHtmlExport";
import {
  exportHandHygieneStatisticsToWord,
  exportSingleHandHygieneSessionToWord,
} from "../utils/handHygieneDocxExport";

type DocType = "all-pages" | "session-form" | "basic-calc" | "indication-calc" | "summary-signatures";

interface HandHygienePrintableModalProps {
  isOpen?: boolean;
  session?: WHOObservationSession | null;
  allSessions?: WHOObservationSession[];
  basicCalcData: WHOBasicComplianceSheetData;
  indicationCalcData: WHOIndicationComplianceSheetData;
  centerSettings: CenterSettings;
  periodTitle?: string;
  targetCompliance?: number;
  customNotes?: string;
  defaultDocType?: DocType;
  onSaveToArchive?: () => void;
  onClose: () => void;
}

export const HandHygienePrintableModal: React.FC<HandHygienePrintableModalProps> = ({
  session,
  allSessions = [],
  basicCalcData,
  indicationCalcData,
  centerSettings,
  periodTitle = "الفترة الإحصائية الحالية (2026)",
  targetCompliance = 85,
  customNotes = "",
  defaultDocType = "all-pages",
  onSaveToArchive,
  onClose,
}) => {
  const [docType, setDocType] = useState<DocType>(defaultDocType);
  const [isExportingWord, setIsExportingWord] = useState(false);

  // Use the passed session or first session from list
  const activeSession = session || allSessions[0];
  const [selectedSessionIndex, setSelectedSessionIndex] = useState<number>(0);
  const currentSessionList = allSessions.length > 0 ? allSessions : activeSession ? [activeSession] : [];
  const currentDisplayedSession = currentSessionList[selectedSessionIndex] || activeSession || currentSessionList[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportHtml = () => {
    exportHandHygieneStatisticsToFullHtml({
      sessions: allSessions.length > 0 ? allSessions : activeSession ? [activeSession] : [],
      basicCalcData,
      indicationCalcData,
      centerSettings,
      periodTitle,
      targetCompliance,
      customNotes,
    });
  };

  const handleExportWord = async () => {
    setIsExportingWord(true);
    try {
      if (docType === "session-form" && activeSession) {
        await exportSingleHandHygieneSessionToWord(activeSession, centerSettings);
      } else {
        await exportHandHygieneStatisticsToWord({
          sessions: allSessions.length > 0 ? allSessions : activeSession ? [activeSession] : [],
          basicCalcData,
          indicationCalcData,
          centerSettings,
          periodTitle,
          targetCompliance,
          customNotes,
        });
      }
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء تصدير ملف Word. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsExportingWord(false);
    }
  };

  const overallRate = basicCalcData.overallComplianceRate;
  const isTargetMet = overallRate >= targetCompliance;
  const totalOpportunities = basicCalcData.grandTotal.oppCount;
  const totalActions = basicCalcData.grandTotal.actCount;
  const totalSessionsCount = allSessions.length > 0 ? allSessions.length : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-['Cairo',sans-serif]">
      <div className="bg-slate-100 rounded-3xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white p-4 flex flex-col lg:flex-row items-center justify-between gap-3 shrink-0 print:hidden shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black flex items-center gap-2">
                <span>طباعة وتحميل تقارير واستمارات منظمة الصحة العالمية (WHO)</span>
                <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
                  كافة الصفحات والألوان الأصلية
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">تنسيق وتصميم معتمد مطابق تماماً لملف الـ PDF الرسمي لمنظمة الصحة العالمية</p>
            </div>
          </div>

          {/* Document Switcher */}
          <div className="flex items-center flex-wrap gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setDocType("all-pages")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                docType === "all-pages" ? "bg-orange-600 text-white shadow-sm font-black" : "text-slate-300 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>التقرير الشامل (كافة الصفحات 5)</span>
            </button>
            <button
              onClick={() => setDocType("session-form")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                docType === "session-form" ? "bg-orange-600 text-white shadow-sm font-black" : "text-slate-300 hover:text-white"
              }`}
            >
              استمارة الرصد (Form 1)
            </button>
            <button
              onClick={() => setDocType("basic-calc")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                docType === "basic-calc" ? "bg-orange-600 text-white shadow-sm font-black" : "text-slate-300 hover:text-white"
              }`}
            >
              الامتثال الأساسي (Page 3)
            </button>
            <button
              onClick={() => setDocType("indication-calc")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                docType === "indication-calc" ? "bg-orange-600 text-white shadow-sm font-black" : "text-slate-300 hover:text-white"
              }`}
            >
              دواعي الغسيل (Page 4)
            </button>
            <button
              onClick={() => setDocType("summary-signatures")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                docType === "summary-signatures" ? "bg-orange-600 text-white shadow-sm font-black" : "text-slate-300 hover:text-white"
              }`}
            >
              التحليل والاعتمادات (Page 5)
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {onSaveToArchive && (
              <button
                onClick={onSaveToArchive}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-98"
                title="حفظ وأرشفة هذه الإحصائية تلقائياً للرجوع إليها في أي وقت"
              >
                <Archive className="w-4 h-4 text-amber-200" />
                <span>الأرشيف (حفظ الإحصائية)</span>
              </button>
            )}

            <button
              onClick={handleExportHtml}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-98"
              title="تنزيل التقرير الشامل كملف ويب ملون ومستقل بدقة كاملة لكافة الصفحات والتصميم طبق الأصل"
            >
              <FileText className="w-4 h-4 text-purple-200" />
              <span>تحميل تقرير ملون (HTML/PDF)</span>
            </button>

            <button
              onClick={handleExportWord}
              disabled={isExportingWord}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-98"
              title="تصدير المستند الحالي إلى ملف Microsoft Word (.docx) منسق وشامل لكافة الصفحات"
            >
              {isExportingWord ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 text-blue-200" />
              )}
              <span>تحميل Word (.docx)</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-98"
              title="طباعة أو حفظ التقرير بكامل صفحاته بصيغة PDF بالألوان والتصميم الكامل"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-300/70 flex justify-center">
          <div className="bg-white w-full max-w-[860px] min-h-[1100px] p-6 sm:p-8 rounded-xl shadow-lg border border-slate-300 text-slate-900 text-xs font-sans print:shadow-none print:border-none print:p-0 print:m-0 print:w-full space-y-8">
            
            {/* ========================================================= */}
            {/* DOCUMENT: ALL PAGES (COMPREHENSIVE 5-PAGE WHO REPORT)     */}
            {/* ========================================================= */}
            {docType === "all-pages" && (
              <div className="space-y-12">
                
                {/* ----------------------------------------------------- */}
                {/* PAGE 1: OFFICIAL WHO OBSERVATION FORM (Form 1)        */}
                {/* ----------------------------------------------------- */}
                <div className="print-page print-page-break pb-4 border-b-2 border-dashed border-slate-400 print:border-none">
                  <WHOObservationFormSheet
                    session={currentSessionList[0] || activeSession}
                    pageNumber="1"
                    totalPages="5"
                  />
                  <div className="text-[10px] text-slate-500 text-center pt-2 print:hidden font-bold">
                    الصفحة 1 من 5 • استمارة الرصد الميداني الرسمية لمنظمة الصحة العالمية (WHO Observation Form - Form 1)
                  </div>
                </div>

                {/* ----------------------------------------------------- */}
                {/* PAGE 2: WHO BASIC COMPLIANCE CALCULATION SHEET (PAGE 3)*/}
                {/* ----------------------------------------------------- */}
                <div className="print-page print-page-break space-y-4 pb-6 border-b-2 border-dashed border-slate-400 print:border-none">
                  <div className="bg-[#E65100] text-white p-3.5 rounded-t-lg flex items-center justify-between border-b-4 border-[#BF360C]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-[#E65100] font-black text-xs text-center leading-tight shadow-sm shrink-0">
                        WHO
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black tracking-tight leading-snug">
                          World Health Organization
                        </h3>
                        <p className="text-[10.5px] font-semibold opacity-90">
                          Patient Safety • A World Alliance for Safer Health Care
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs sm:text-sm font-black tracking-wider uppercase">
                        SAVE LIVES
                      </h4>
                      <p className="text-[11px] font-bold text-amber-200">
                        Clean Your Hands
                      </p>
                    </div>
                  </div>

                  <div className="text-center py-1 border-b-2 border-slate-900">
                    <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-wide">
                      Observation Form – Basic Compliance Calculation
                    </h2>
                    <p className="text-[11px] font-bold text-slate-600">
                      استمارة حساب الامتثال الأساسي للفئات المهنية (Page 3)
                    </p>
                  </div>

                  {/* Header Information */}
                  <div className="grid grid-cols-3 gap-4 text-xs font-bold border-1.5 border-slate-700 p-2.5 rounded-lg bg-slate-50">
                    <div>Facility: <span className="font-black text-slate-900">{basicCalcData.facility || centerSettings.centerName || "Waheed IPC"}</span></div>
                    <div>Period: <span className="font-black text-slate-900">{basicCalcData.period || periodTitle}</span></div>
                    <div>Setting: <span className="font-black text-slate-900">{basicCalcData.setting || "Inpatient Care"}</span></div>
                  </div>

                  {/* Matrix Table */}
                  <div className="border-2 border-slate-700 rounded-lg overflow-x-auto">
                    <table className="w-full text-center text-[9.5px] border-collapse">
                      <thead>
                        <tr className="bg-amber-100/90 border-b border-slate-500 font-black text-amber-950">
                          <th rowSpan={2} className="border-r border-slate-400 p-1.5 w-14">
                            Session N°
                          </th>
                          <th colSpan={3} className="border-r border-slate-400 p-1.5">
                            Prof.cat 1 (Nurse/Midwife)
                          </th>
                          <th colSpan={3} className="border-r border-slate-400 p-1.5">
                            Prof.cat 2 (Auxiliary)
                          </th>
                          <th colSpan={3} className="border-r border-slate-400 p-1.5">
                            Prof.cat 3 (Medical Doctor)
                          </th>
                          <th colSpan={3} className="border-r border-slate-400 p-1.5">
                            Prof.cat 4 (Other HCW)
                          </th>
                          <th colSpan={3} className="p-1.5 bg-amber-200/90 text-amber-950">
                            Total per session
                          </th>
                        </tr>
                        <tr className="bg-slate-100 border-b border-slate-500 text-[8.5px] font-bold">
                          <th className="border-r border-slate-300 p-1">Opp (n)</th>
                          <th className="border-r border-slate-300 p-1">HW (n)</th>
                          <th className="border-r border-slate-300 p-1">HR (n)</th>

                          <th className="border-r border-slate-300 p-1">Opp (n)</th>
                          <th className="border-r border-slate-300 p-1">HW (n)</th>
                          <th className="border-r border-slate-300 p-1">HR (n)</th>

                          <th className="border-r border-slate-300 p-1">Opp (n)</th>
                          <th className="border-r border-slate-300 p-1">HW (n)</th>
                          <th className="border-r border-slate-300 p-1">HR (n)</th>

                          <th className="border-r border-slate-300 p-1">Opp (n)</th>
                          <th className="border-r border-slate-300 p-1">HW (n)</th>
                          <th className="border-r border-slate-300 p-1">HR (n)</th>

                          <th className="border-r border-slate-300 p-1 bg-amber-100 font-black">Opp</th>
                          <th className="border-r border-slate-300 p-1 bg-amber-100 font-black">HW</th>
                          <th className="p-1 bg-amber-100 font-black">HR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300 font-mono text-[9px]">
                        {basicCalcData.sessions.map((row) => (
                          <tr key={row.sessionNumber} className="hover:bg-slate-50">
                            <td className="border-r border-slate-400 font-black p-1 bg-slate-50">{row.sessionNumber}</td>
                            <td className="border-r border-slate-200 p-1">{row.nurse.oppCount || "-"}</td>
                            <td className="border-r border-slate-200 p-1">{row.nurse.hwCount || "-"}</td>
                            <td className="border-r border-slate-300 p-1">{row.nurse.hrCount || "-"}</td>

                            <td className="border-r border-slate-200 p-1">{row.auxiliary.oppCount || "-"}</td>
                            <td className="border-r border-slate-200 p-1">{row.auxiliary.hwCount || "-"}</td>
                            <td className="border-r border-slate-300 p-1">{row.auxiliary.hrCount || "-"}</td>

                            <td className="border-r border-slate-200 p-1">{row.doctor.oppCount || "-"}</td>
                            <td className="border-r border-slate-200 p-1">{row.doctor.hwCount || "-"}</td>
                            <td className="border-r border-slate-300 p-1">{row.doctor.hrCount || "-"}</td>

                            <td className="border-r border-slate-200 p-1">{row.other.oppCount || "-"}</td>
                            <td className="border-r border-slate-200 p-1">{row.other.hwCount || "-"}</td>
                            <td className="border-r border-slate-300 p-1">{row.other.hrCount || "-"}</td>

                            <td className="border-r border-slate-200 p-1 font-black bg-amber-50/70">{row.total.oppCount}</td>
                            <td className="border-r border-slate-200 p-1 font-black bg-amber-50/70">{row.total.hwCount}</td>
                            <td className="p-1 font-black bg-amber-50/70">{row.total.hrCount}</td>
                          </tr>
                        ))}

                        {/* Total Calculation Row */}
                        <tr className="bg-amber-100/90 font-bold border-t-2 border-slate-600 text-[9.5px]">
                          <td className="border-r border-slate-400 p-2 font-black text-slate-950">Total Calculation</td>
                          <td colSpan={3} className="border-r border-slate-400 p-1.5 text-left px-2">
                            <div>Act = {basicCalcData.totalNurse.actCount} | Opp = {basicCalcData.totalNurse.oppCount}</div>
                          </td>
                          <td colSpan={3} className="border-r border-slate-400 p-1.5 text-left px-2">
                            <div>Act = {basicCalcData.totalAuxiliary.actCount} | Opp = {basicCalcData.totalAuxiliary.oppCount}</div>
                          </td>
                          <td colSpan={3} className="border-r border-slate-400 p-1.5 text-left px-2">
                            <div>Act = {basicCalcData.totalDoctor.actCount} | Opp = {basicCalcData.totalDoctor.oppCount}</div>
                          </td>
                          <td colSpan={3} className="border-r border-slate-400 p-1.5 text-left px-2">
                            <div>Act = {basicCalcData.totalOther.actCount} | Opp = {basicCalcData.totalOther.oppCount}</div>
                          </td>
                          <td colSpan={3} className="p-1.5 text-left px-2 bg-amber-200 font-black">
                            <div>Act = {basicCalcData.grandTotal.actCount} | Opp = {basicCalcData.grandTotal.oppCount}</div>
                          </td>
                        </tr>

                        {/* Compliance Row with clear bold percentages */}
                        <tr className="bg-orange-50 font-black border-t border-slate-400 text-xs">
                          <td className="border-r border-slate-400 p-2 text-orange-950 font-black">Compliance (%)</td>
                          <td colSpan={3} className="border-r border-slate-400 p-1.5 text-emerald-800 text-sm">
                            %{basicCalcData.totalNurse.complianceRate}
                          </td>
                          <td colSpan={3} className="border-r border-slate-400 p-1.5 text-emerald-800 text-sm">
                            %{basicCalcData.totalAuxiliary.complianceRate}
                          </td>
                          <td colSpan={3} className="border-r border-slate-400 p-1.5 text-emerald-800 text-sm">
                            %{basicCalcData.totalDoctor.complianceRate}
                          </td>
                          <td colSpan={3} className="border-r border-slate-400 p-1.5 text-emerald-800 text-sm">
                            %{basicCalcData.totalOther.complianceRate}
                          </td>
                          <td colSpan={3} className="p-1.5 bg-orange-100 text-emerald-900 text-base font-black">
                            %{basicCalcData.overallComplianceRate}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Formula Callout */}
                  <div className="border-1.5 border-slate-600 p-2.5 rounded-lg flex items-center justify-center gap-4 bg-slate-50 font-black text-xs text-slate-900 shadow-2xs">
                    <span>Compliance (%) = (Actions ÷ Opportunities) × 100</span>
                  </div>

                  <div className="text-[10px] text-slate-500 text-center pt-1">
                    الصفحة 2 من 5 • استمارة حساب الامتثال الأساسي الرسمية (WHO Basic Compliance Calculation - Page 3)
                  </div>
                </div>

                {/* ----------------------------------------------------- */}
                {/* PAGE 3: WHO INDICATION COMPLIANCE SHEET (PAGE 4)      */}
                {/* ----------------------------------------------------- */}
                <div className="print-page print-page-break space-y-4 pb-6 border-b-2 border-dashed border-slate-400 print:border-none">
                  <div className="bg-[#E65100] text-white p-3.5 rounded-t-lg flex items-center justify-between border-b-4 border-[#BF360C]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-[#E65100] font-black text-xs text-center leading-tight shadow-sm shrink-0">
                        WHO
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black tracking-tight leading-snug">
                          World Health Organization
                        </h3>
                        <p className="text-[10.5px] font-semibold opacity-90">
                          Patient Safety • A World Alliance for Safer Health Care
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs sm:text-sm font-black tracking-wider uppercase">
                        SAVE LIVES
                      </h4>
                      <p className="text-[11px] font-bold text-amber-200">
                        Clean Your Hands
                      </p>
                    </div>
                  </div>

                  <div className="text-center py-1 border-b-2 border-slate-900">
                    <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-wide">
                      Observation Form – Optional Calculation Form
                    </h2>
                    <p className="text-[11px] font-bold text-slate-600">
                      (Indication-related compliance with hand hygiene / 5 Moments - Page 4)
                    </p>
                  </div>

                  {/* Header Information */}
                  <div className="grid grid-cols-3 gap-4 text-xs font-bold border-1.5 border-slate-700 p-2.5 rounded-lg bg-slate-50">
                    <div>Facility: <span className="font-black text-slate-900">{indicationCalcData.facility || centerSettings.centerName || "Waheed IPC"}</span></div>
                    <div>Period: <span className="font-black text-slate-900">{indicationCalcData.period || periodTitle}</span></div>
                    <div>Setting: <span className="font-black text-slate-900">{indicationCalcData.setting || "Inpatient Care"}</span></div>
                  </div>

                  {/* Matrix Table */}
                  <div className="border-2 border-slate-700 rounded-lg overflow-x-auto">
                    <table className="w-full text-center text-[9.5px] border-collapse">
                      <thead>
                        <tr className="bg-amber-100/90 border-b border-slate-500 font-black text-amber-950">
                          <th rowSpan={2} className="border-r border-slate-400 p-1.5 w-14">
                            Session N°
                          </th>
                          <th colSpan={3} className="border-r border-slate-400 p-1.5">
                            Before touching a patient (1)
                          </th>
                          <th colSpan={3} className="border-r border-slate-400 p-1.5">
                            Before clean/aseptic (2)
                          </th>
                          <th colSpan={3} className="border-r border-slate-400 p-1.5">
                            After body fluid risk (3)
                          </th>
                          <th colSpan={3} className="border-r border-slate-400 p-1.5">
                            After touching a patient (4)
                          </th>
                          <th colSpan={3} className="p-1.5">
                            After touching surroundings (5)
                          </th>
                        </tr>
                        <tr className="bg-slate-100 border-b border-slate-500 text-[8.5px] font-bold">
                          <th className="border-r border-slate-300 p-1">Indic (n)</th>
                          <th className="border-r border-slate-300 p-1">HW (n)</th>
                          <th className="border-r border-slate-300 p-1">HR (n)</th>

                          <th className="border-r border-slate-300 p-1">Indic (n)</th>
                          <th className="border-r border-slate-300 p-1">HW (n)</th>
                          <th className="border-r border-slate-300 p-1">HR (n)</th>

                          <th className="border-r border-slate-300 p-1">Indic (n)</th>
                          <th className="border-r border-slate-300 p-1">HW (n)</th>
                          <th className="border-r border-slate-300 p-1">HR (n)</th>

                          <th className="border-r border-slate-300 p-1">Indic (n)</th>
                          <th className="border-r border-slate-300 p-1">HW (n)</th>
                          <th className="border-r border-slate-300 p-1">HR (n)</th>

                          <th className="border-r border-slate-300 p-1">Indic (n)</th>
                          <th className="border-r border-slate-300 p-1">HW (n)</th>
                          <th className="p-1">HR (n)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300 font-mono text-[9px]">
                        {indicationCalcData.sessions.map((row) => (
                          <tr key={row.sessionNumber} className="hover:bg-slate-50">
                            <td className="border-r border-slate-400 font-black p-1 bg-slate-50">{row.sessionNumber}</td>
                            <td className="border-r border-slate-200 p-1">{row.befPat.indicCount || "-"}</td>
                            <td className="border-r border-slate-200 p-1">{row.befPat.hwCount || "-"}</td>
                            <td className="border-r border-slate-300 p-1">{row.befPat.hrCount || "-"}</td>

                            <td className="border-r border-slate-200 p-1">{row.befAsept.indicCount || "-"}</td>
                            <td className="border-r border-slate-200 p-1">{row.befAsept.hwCount || "-"}</td>
                            <td className="border-r border-slate-300 p-1">{row.befAsept.hrCount || "-"}</td>

                            <td className="border-r border-slate-200 p-1">{row.aftBf.indicCount || "-"}</td>
                            <td className="border-r border-slate-200 p-1">{row.aftBf.hwCount || "-"}</td>
                            <td className="border-r border-slate-300 p-1">{row.aftBf.hrCount || "-"}</td>

                            <td className="border-r border-slate-200 p-1">{row.aftPat.indicCount || "-"}</td>
                            <td className="border-r border-slate-200 p-1">{row.aftPat.hwCount || "-"}</td>
                            <td className="border-r border-slate-300 p-1">{row.aftPat.hrCount || "-"}</td>

                            <td className="border-r border-slate-200 p-1">{row.aftSurr.indicCount || "-"}</td>
                            <td className="border-r border-slate-200 p-1">{row.aftSurr.hwCount || "-"}</td>
                            <td className="p-1">{row.aftSurr.hrCount || "-"}</td>
                          </tr>
                        ))}

                        {/* Total Calculation Row */}
                        <tr className="bg-amber-100/90 font-bold border-t-2 border-slate-600 text-[9.5px]">
                          <td className="border-r border-slate-400 p-2 font-black text-slate-950">Total Calculation</td>
                          <td colSpan={3} className="border-r border-slate-400 p-1.5 text-left px-2">
                            <div>Act = {indicationCalcData.totalBefPat.actCount} | Indic = {indicationCalcData.totalBefPat.indicCount}</div>
                          </td>
                          <td colSpan={3} className="border-r border-slate-400 p-1.5 text-left px-2">
                            <div>Act = {indicationCalcData.totalBefAsept.actCount} | Indic = {indicationCalcData.totalBefAsept.indicCount}</div>
                          </td>
                          <td colSpan={3} className="border-r border-slate-400 p-1.5 text-left px-2">
                            <div>Act = {indicationCalcData.totalAftBf.actCount} | Indic = {indicationCalcData.totalAftBf.indicCount}</div>
                          </td>
                          <td colSpan={3} className="border-r border-slate-400 p-1.5 text-left px-2">
                            <div>Act = {indicationCalcData.totalAftPat.actCount} | Indic = {indicationCalcData.totalAftPat.indicCount}</div>
                          </td>
                          <td colSpan={3} className="p-1.5 text-left px-2">
                            <div>Act = {indicationCalcData.totalAftSurr.actCount} | Indic = {indicationCalcData.totalAftSurr.indicCount}</div>
                          </td>
                        </tr>

                        {/* Ratio Row with clear percentages */}
                        <tr className="bg-orange-50 font-black border-t border-slate-400 text-xs">
                          <td className="border-r border-slate-400 p-2 text-orange-950 font-black">Ratio act/indic (%)</td>
                          <td colSpan={3} className="border-r border-slate-400 p-1.5 text-blue-900 text-sm">
                            %{indicationCalcData.totalBefPat.ratio}
                          </td>
                          <td colSpan={3} className="border-r border-slate-400 p-1.5 text-blue-900 text-sm">
                            %{indicationCalcData.totalBefAsept.ratio}
                          </td>
                          <td colSpan={3} className="border-r border-slate-400 p-1.5 text-blue-900 text-sm">
                            %{indicationCalcData.totalAftBf.ratio}
                          </td>
                          <td colSpan={3} className="border-r border-slate-400 p-1.5 text-blue-900 text-sm">
                            %{indicationCalcData.totalAftPat.ratio}
                          </td>
                          <td colSpan={3} className="p-1.5 text-blue-900 text-sm">
                            %{indicationCalcData.totalAftSurr.ratio}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-[10px] space-y-1 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-300">
                    <p className="font-semibold leading-relaxed">
                      * <strong>Note:</strong> This calculation gives an overall idea of health-care worker’s behaviour towards each type of indication.
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-500 text-center pt-1">
                    الصفحة 3 من 5 • استمارة حساب الامتثال بدواعي غسيل الأيدي الخمسة (WHO 5 Moments Calculation - Page 4)
                  </div>
                </div>

                {/* ----------------------------------------------------- */}
                {/* PAGE 4: DETAILED OBSERVATION SESSIONS (AUTHENTIC WHO) */}
                {/* ----------------------------------------------------- */}
                <div className="print-page print-page-break space-y-6 pb-6 border-b-2 border-dashed border-slate-400 print:border-none">
                  
                  {/* Summary Register Table */}
                  <div className="space-y-3">
                    <div className="bg-[#E65100] text-white p-3.5 rounded-t-lg flex items-center justify-between border-b-4 border-[#BF360C]">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-[#E65100] font-black text-xs text-center leading-tight shadow-sm shrink-0">
                          WHO
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-black tracking-tight leading-snug">
                            World Health Organization
                          </h3>
                          <p className="text-[10.5px] font-semibold opacity-90">
                            Patient Safety • A World Alliance for Safer Health Care
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs sm:text-sm font-black tracking-wider uppercase">
                          SAVE LIVES
                        </h4>
                        <p className="text-[11px] font-bold text-amber-200">
                          Clean Your Hands
                        </p>
                      </div>
                    </div>

                    <div className="text-center py-1 border-b-2 border-slate-900">
                      <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-wide">
                        Field Observation Sessions Register
                      </h2>
                      <p className="text-[11px] font-bold text-slate-600">
                        سجل وجدول استمارات جلسات الرصد الميداني ({totalSessionsCount} جلسة رصد معتمدة)
                      </p>
                    </div>

                    <div className="border-1.5 border-slate-700 rounded-lg overflow-hidden">
                      <table className="w-full text-right text-xs border-collapse">
                        <thead className="bg-amber-100/90 text-slate-900 font-black border-b border-slate-400">
                          <tr>
                            <th className="p-2 text-center w-12 border-l border-slate-300">رقم</th>
                            <th className="p-2 border-l border-slate-300">القسم / الجناح / التاريخ</th>
                            <th className="p-2 text-center border-l border-slate-300">الراصد والمدة</th>
                            <th className="p-2 border-l border-slate-300">تفاصيل الفئات والفرص المرصودة</th>
                            <th className="p-2 text-center w-28 bg-amber-200/90 text-amber-950 font-black">نسبة الامتثال %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-[11px]">
                          {currentSessionList.map((sess, sIdx) => {
                            const matchedBasic = basicCalcData.sessions.find((b) => b.sessionNumber === sess.sessionNumber);
                            const sessionRate = matchedBasic ? matchedBasic.total.complianceRate : 0;
                            const sessionOpp = matchedBasic ? matchedBasic.total.oppCount : 0;
                            const sessionAct = matchedBasic ? matchedBasic.total.actCount : 0;

                            return (
                              <tr key={sess.id || sIdx} className="hover:bg-slate-50">
                                <td className="p-2 text-center font-black font-mono bg-slate-50 border-l border-slate-200">{sess.sessionNumber || sIdx + 1}</td>
                                <td className="p-2 border-l border-slate-200">
                                  <div className="font-bold text-slate-900">{sess.ward || sess.department || "قسم رصد"}</div>
                                  <div className="text-[10.5px] text-slate-500 font-mono">تاريخ: {sess.date} {sess.startTime ? `(${sess.startTime})` : ""}</div>
                                </td>
                                <td className="p-2 text-center border-l border-slate-200">
                                  <div className="font-semibold text-slate-800">{sess.observer || "مكافحة العدوى"}</div>
                                  <div className="text-[10px] text-slate-500">{sess.sessionDuration || 20} دقيقة</div>
                                </td>
                                <td className="p-2 text-[10.5px] text-slate-600 border-l border-slate-200">
                                  {(sess.columns || []).map((c) => {
                                    const oppCount = (c.opportunities || []).filter((o) => (o.indications && o.indications.length > 0) || !!o.action).length;
                                    return (
                                      <span key={c.id} className="inline-block bg-slate-100 rounded px-1.5 py-0.5 ml-1 mb-1 font-mono border border-slate-200">
                                        {c.profCatCode}: {oppCount} فرص
                                      </span>
                                    );
                                  })}
                                </td>
                                <td className="p-2 text-center font-mono font-black text-emerald-800 bg-emerald-50/50">
                                  <div className="text-sm">%{sessionRate}</div>
                                  <div className="text-[10px] text-slate-500 font-semibold">({sessionAct}/{sessionOpp})</div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Individual Authentic WHO Observation Sheets for each session */}
                  <div className="space-y-6 pt-4">
                    <div className="text-center py-1">
                      <span className="text-xs font-black bg-orange-100 text-orange-900 px-3 py-1 rounded-full border border-orange-300">
                        استمارات الرصد الميداني الأصلية المعتمدة (WHO Observation Form Sheets)
                      </span>
                    </div>

                    {currentSessionList.map((sess, sIdx) => (
                      <div
                        key={sess.id || sIdx}
                        className="print-page print-page-break pt-2 border-t-2 border-dashed border-slate-300 print:border-none"
                      >
                        <WHOObservationFormSheet
                          session={sess}
                          pageNumber={sIdx + 1}
                          totalPages={currentSessionList.length}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-500 text-center pt-1 print:hidden font-bold">
                    الصفحة 4 من 5 • سجل واستمارات جلسات الرصد الميداني (WHO Observation Sessions)
                  </div>
                </div>

                {/* ----------------------------------------------------- */}
                {/* PAGE 5: RECOMMENDATIONS, ACTION PLAN & SIGNATURES     */}
                {/* ----------------------------------------------------- */}
                <div className="print-page space-y-5">
                  <div className="bg-[#E65100] text-white p-3.5 rounded-t-lg flex items-center justify-between border-b-4 border-[#BF360C]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-[#E65100] font-black text-xs text-center leading-tight shadow-sm shrink-0">
                        WHO
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black tracking-tight leading-snug">
                          World Health Organization
                        </h3>
                        <p className="text-[10.5px] font-semibold opacity-90">
                          Patient Safety • A World Alliance for Safer Health Care
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs sm:text-sm font-black tracking-wider uppercase">
                        SAVE LIVES
                      </h4>
                      <p className="text-[11px] font-bold text-amber-200">
                        Clean Your Hands
                      </p>
                    </div>
                  </div>

                  <div className="text-center py-1 border-b-2 border-slate-900">
                    <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-wide">
                      Analysis, Action Plan & Official Signatures
                    </h2>
                    <p className="text-[11px] font-bold text-slate-600">
                      التقرير التنفيذي الشامل، خطة التحسين المعتمدة، والاعتمادات الرسمية
                    </p>
                  </div>

                  {/* Key KPI Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-xl border-2 border-emerald-600 bg-emerald-50/70 space-y-1">
                      <div className="text-[10.5px] font-bold text-emerald-900">معدل الامتثال الكلي العام</div>
                      <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
                        %{overallRate}
                      </div>
                      <div className={`text-[9.5px] font-black px-2 py-0.5 rounded-full inline-block ${
                        isTargetMet ? "bg-emerald-200 text-emerald-900" : "bg-amber-200 text-amber-900"
                      }`}>
                        {isTargetMet ? "✓ محقق للمستهدف" : "تحت المستهدف"}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-300 bg-slate-50 space-y-1">
                      <div className="text-[10.5px] font-bold text-slate-700">إجمالي الفرص المرصودة</div>
                      <div className="text-2xl font-black text-slate-900 font-mono">
                        {totalOpportunities}
                      </div>
                      <div className="text-[9.5px] text-slate-500 font-semibold">فرصة رصد معتمدة</div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-300 bg-slate-50 space-y-1">
                      <div className="text-[10.5px] font-bold text-slate-700">إجمالي الإجراءات المطبقة</div>
                      <div className="text-2xl font-black text-slate-900 font-mono">
                        {totalActions}
                      </div>
                      <div className="text-[9.5px] text-slate-500 font-semibold">تطهير كحولي + غسيل</div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-300 bg-slate-50 space-y-1">
                      <div className="text-[10.5px] font-bold text-slate-700">عدد جلسات الرصد</div>
                      <div className="text-2xl font-black text-slate-900 font-mono">
                        {totalSessionsCount}
                      </div>
                      <div className="text-[9.5px] text-slate-500 font-semibold">استمارة رصد ميداني</div>
                    </div>
                  </div>

                  {/* Recommendations Box */}
                  <div className="border-1.5 border-slate-700 rounded-xl p-4 bg-slate-50 space-y-2.5">
                    <h4 className="font-black text-xs sm:text-sm text-slate-900 border-b border-slate-200 pb-1.5">
                      التوصيات وخطة العمل لتحسين ممارسات نظافة وتطهير الأيدي:
                    </h4>
                    <div className="space-y-1.5 text-[11px] text-slate-700 leading-relaxed font-semibold">
                      <p>1. الاستمرار في تدريب الكوادر الطبية والتمريضية على دواعي غسيل الأيدي الخمسة (WHO 5 Moments) مع التركيز على دافع ما قبل ملامسة المريض وما بعد ملامسة البيئة المحيطة.</p>
                      <p>2. التأكد من توفر المطهرات الكحولية عند نقاط تقديم الخدمة (Point of Care) وفي كافة العربات العلاجية وغرف المرضى.</p>
                      <p>3. تطبيق آلية التغذية الراجعة الفورية بعد كل جلسة رصد وتكريم الأقسام والفئات المهنية المحققة لأعلى نسب امتثال لتحفيز الالتزام المستمر.</p>
                      <p>4. الالتزام بعدم ارتداء القفازات كبديل لنظافة وتطهير الأيدي والحرص على التطهير قبل وبعد نزع القفازات.</p>
                      {customNotes && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 mt-2 font-bold">
                          {customNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Signatures Section */}
                  <div className="signatures-section border-1.5 border-slate-700 rounded-xl p-4 bg-white space-y-3 mt-4">
                    <h4 className="font-black text-xs sm:text-sm text-slate-900 text-center border-b border-slate-200 pb-1.5">
                      الاعتمادات والتوقيعات الرسمية
                    </h4>
                    <div className="grid grid-cols-2 gap-8 text-center pt-1">
                      <div className="space-y-2">
                        <div className="font-black text-xs text-slate-800">مسؤول / راصد مكافحة العدوى</div>
                        <div className="font-bold text-sm text-slate-900">{centerSettings.infectionControlLead || "م/ أحمد وحيد شعبان"}</div>
                        <div className="text-[11px] text-slate-400 pt-5">التوقيع: .......................................</div>
                      </div>
                      <div className="space-y-2">
                        <div className="font-black text-xs text-slate-800">مدير المركز / المستشفى</div>
                        <div className="font-bold text-sm text-slate-900">{centerSettings.medicalDirector || "د/ إيناس"}</div>
                        <div className="text-[11px] text-slate-400 pt-5">التوقيع والاعتماد: ............................</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 text-center pt-2">
                    الصفحة 5 من 5 • ختام التقرير والاعتمادات الرسمية • صادر وفقاً لمعايير منظمة الصحة العالمية WHO
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* DOCUMENT 1: WHO OBSERVATION FORM (Authentic WHO Sheet)    */}
            {/* ========================================================= */}
            {docType === "session-form" && (
              <div className="space-y-4">
                
                {/* Interactive Session Switcher (Hidden when printing) */}
                {currentSessionList.length > 1 && (
                  <div className="bg-slate-100 p-3 rounded-xl border border-slate-300 flex flex-wrap items-center justify-between gap-2 print:hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-700">اختر الجلسة للعرض والطباعة:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentSessionList.map((s, idx) => (
                          <button
                            key={s.id || idx}
                            onClick={() => setSelectedSessionIndex(idx)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                              selectedSessionIndex === idx
                                ? "bg-orange-600 text-white shadow-sm ring-2 ring-orange-300"
                                : "bg-white text-slate-700 hover:bg-orange-50 border border-slate-300"
                            }`}
                          >
                            جلسة #{s.sessionNumber || idx + 1} ({s.ward || s.department || "قسم"})
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 font-bold">
                      جلسة {selectedSessionIndex + 1} من أصل {currentSessionList.length}
                    </div>
                  </div>
                )}

                {/* The Authentic WHO Observation Form Sheet */}
                <WHOObservationFormSheet
                  session={currentDisplayedSession}
                  pageNumber={selectedSessionIndex + 1}
                  totalPages={currentSessionList.length}
                />
              </div>
            )}

            {/* ========================================================= */}
            {/* DOCUMENT 2: BASIC COMPLIANCE CALCULATION (Single Sheet)   */}
            {/* ========================================================= */}
            {docType === "basic-calc" && (
              <div className="space-y-4">
                
                {/* Official WHO Header Banner */}
                <div className="bg-[#E65100] text-white p-3.5 rounded-t-lg flex items-center justify-between border-b-4 border-[#BF360C]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-[#E65100] font-black text-xs text-center leading-tight shadow-sm shrink-0">
                      WHO
                    </div>
                    <div>
                      <h1 className="text-sm sm:text-base font-black tracking-tight leading-snug">
                        World Health Organization
                      </h1>
                      <p className="text-[10.5px] font-semibold opacity-90">
                        Patient Safety • A World Alliance for Safer Health Care
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase">
                      SAVE LIVES
                    </h2>
                    <p className="text-[11px] font-bold text-amber-200">
                      Clean Your Hands
                    </p>
                  </div>
                </div>

                <div className="text-center py-1 border-b-2 border-slate-900">
                  <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-wide">
                    Observation Form – Basic Compliance Calculation
                  </h2>
                  <p className="text-[11px] font-bold text-slate-600">
                    استمارة حساب الامتثال الأساسي للفئات المهنية (Page 3)
                  </p>
                </div>

                {/* Header Information */}
                <div className="grid grid-cols-3 gap-4 text-xs font-bold border-1.5 border-slate-700 p-2.5 rounded-lg bg-slate-50">
                  <div>Facility: <span className="font-black text-slate-900">{basicCalcData.facility || centerSettings.centerName || "Waheed IPC"}</span></div>
                  <div>Period: <span className="font-black text-slate-900">{basicCalcData.period || periodTitle}</span></div>
                  <div>Setting: <span className="font-black text-slate-900">{basicCalcData.setting || "Inpatient Care"}</span></div>
                </div>

                {/* Matrix Table */}
                <div className="border-2 border-slate-700 rounded-lg overflow-x-auto">
                  <table className="w-full text-center text-[9.5px] border-collapse">
                    <thead>
                      <tr className="bg-amber-100/90 border-b border-slate-500 font-black text-amber-950">
                        <th rowSpan={2} className="border-r border-slate-400 p-1.5 w-14">
                          Session N°
                        </th>
                        <th colSpan={3} className="border-r border-slate-400 p-1.5">
                          Prof.cat 1 (Nurse/Midwife)
                        </th>
                        <th colSpan={3} className="border-r border-slate-400 p-1.5">
                          Prof.cat 2 (Auxiliary)
                        </th>
                        <th colSpan={3} className="border-r border-slate-400 p-1.5">
                          Prof.cat 3 (Medical Doctor)
                        </th>
                        <th colSpan={3} className="border-r border-slate-400 p-1.5">
                          Prof.cat 4 (Other HCW)
                        </th>
                        <th colSpan={3} className="p-1.5 bg-amber-200/90 text-amber-950">
                          Total per session
                        </th>
                      </tr>
                      <tr className="bg-slate-100 border-b border-slate-500 text-[8.5px] font-bold">
                        <th className="border-r border-slate-300 p-1">Opp (n)</th>
                        <th className="border-r border-slate-300 p-1">HW (n)</th>
                        <th className="border-r border-slate-300 p-1">HR (n)</th>

                        <th className="border-r border-slate-300 p-1">Opp (n)</th>
                        <th className="border-r border-slate-300 p-1">HW (n)</th>
                        <th className="border-r border-slate-300 p-1">HR (n)</th>

                        <th className="border-r border-slate-300 p-1">Opp (n)</th>
                        <th className="border-r border-slate-300 p-1">HW (n)</th>
                        <th className="border-r border-slate-300 p-1">HR (n)</th>

                        <th className="border-r border-slate-300 p-1">Opp (n)</th>
                        <th className="border-r border-slate-300 p-1">HW (n)</th>
                        <th className="border-r border-slate-300 p-1">HR (n)</th>

                        <th className="border-r border-slate-300 p-1 bg-amber-100 font-black">Opp</th>
                        <th className="border-r border-slate-300 p-1 bg-amber-100 font-black">HW</th>
                        <th className="p-1 bg-amber-100 font-black">HR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 font-mono text-[9px]">
                      {basicCalcData.sessions.map((row) => (
                        <tr key={row.sessionNumber} className="hover:bg-slate-50">
                          <td className="border-r border-slate-400 font-black p-1 bg-slate-50">{row.sessionNumber}</td>
                          <td className="border-r border-slate-200 p-1">{row.nurse.oppCount || "-"}</td>
                          <td className="border-r border-slate-200 p-1">{row.nurse.hwCount || "-"}</td>
                          <td className="border-r border-slate-300 p-1">{row.nurse.hrCount || "-"}</td>

                          <td className="border-r border-slate-200 p-1">{row.auxiliary.oppCount || "-"}</td>
                          <td className="border-r border-slate-200 p-1">{row.auxiliary.hwCount || "-"}</td>
                          <td className="border-r border-slate-300 p-1">{row.auxiliary.hrCount || "-"}</td>

                          <td className="border-r border-slate-200 p-1">{row.doctor.oppCount || "-"}</td>
                          <td className="border-r border-slate-200 p-1">{row.doctor.hwCount || "-"}</td>
                          <td className="border-r border-slate-300 p-1">{row.doctor.hrCount || "-"}</td>

                          <td className="border-r border-slate-200 p-1">{row.other.oppCount || "-"}</td>
                          <td className="border-r border-slate-200 p-1">{row.other.hwCount || "-"}</td>
                          <td className="border-r border-slate-300 p-1">{row.other.hrCount || "-"}</td>

                          <td className="border-r border-slate-200 p-1 font-black bg-amber-50/70">{row.total.oppCount}</td>
                          <td className="border-r border-slate-200 p-1 font-black bg-amber-50/70">{row.total.hwCount}</td>
                          <td className="p-1 font-black bg-amber-50/70">{row.total.hrCount}</td>
                        </tr>
                      ))}

                      {/* Total Calculation Row */}
                      <tr className="bg-amber-100/90 font-bold border-t-2 border-slate-600 text-[9.5px]">
                        <td className="border-r border-slate-400 p-2 font-black text-slate-950">Total Calculation</td>
                        <td colSpan={3} className="border-r border-slate-400 p-1.5 text-left px-2">
                          <div>Act = {basicCalcData.totalNurse.actCount} | Opp = {basicCalcData.totalNurse.oppCount}</div>
                        </td>
                        <td colSpan={3} className="border-r border-slate-400 p-1.5 text-left px-2">
                          <div>Act = {basicCalcData.totalAuxiliary.actCount} | Opp = {basicCalcData.totalAuxiliary.oppCount}</div>
                        </td>
                        <td colSpan={3} className="border-r border-slate-400 p-1.5 text-left px-2">
                          <div>Act = {basicCalcData.totalDoctor.actCount} | Opp = {basicCalcData.totalDoctor.oppCount}</div>
                        </td>
                        <td colSpan={3} className="border-r border-slate-400 p-1.5 text-left px-2">
                          <div>Act = {basicCalcData.totalOther.actCount} | Opp = {basicCalcData.totalOther.oppCount}</div>
                        </td>
                        <td colSpan={3} className="p-1.5 text-left px-2 bg-amber-200 font-black">
                          <div>Act = {basicCalcData.grandTotal.actCount} | Opp = {basicCalcData.grandTotal.oppCount}</div>
                        </td>
                      </tr>

                      {/* Compliance Row with clear bold percentages */}
                      <tr className="bg-orange-50 font-black border-t border-slate-400 text-xs">
                        <td className="border-r border-slate-400 p-2 text-orange-950 font-black">Compliance (%)</td>
                        <td colSpan={3} className="border-r border-slate-400 p-1.5 text-emerald-800 text-sm">
                          %{basicCalcData.totalNurse.complianceRate}
                        </td>
                        <td colSpan={3} className="border-r border-slate-400 p-1.5 text-emerald-800 text-sm">
                          %{basicCalcData.totalAuxiliary.complianceRate}
                        </td>
                        <td colSpan={3} className="border-r border-slate-400 p-1.5 text-emerald-800 text-sm">
                          %{basicCalcData.totalDoctor.complianceRate}
                        </td>
                        <td colSpan={3} className="border-r border-slate-400 p-1.5 text-emerald-800 text-sm">
                          %{basicCalcData.totalOther.complianceRate}
                        </td>
                        <td colSpan={3} className="p-1.5 bg-orange-100 text-emerald-900 text-base font-black">
                          %{basicCalcData.overallComplianceRate}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* WHO Official Formula Callout */}
                <div className="border-1.5 border-slate-600 p-2.5 rounded-lg flex items-center justify-center gap-4 bg-slate-50 font-black text-xs text-slate-900">
                  <span>Compliance (%) = (Actions ÷ Opportunities) × 100</span>
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* DOCUMENT 3: INDICATION COMPLIANCE (Single Sheet)          */}
            {/* ========================================================= */}
            {docType === "indication-calc" && (
              <div className="space-y-4">
                
                {/* Official WHO Header Banner */}
                <div className="bg-[#E65100] text-white p-3.5 rounded-t-lg flex items-center justify-between border-b-4 border-[#BF360C]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-[#E65100] font-black text-xs text-center leading-tight shadow-sm shrink-0">
                      WHO
                    </div>
                    <div>
                      <h1 className="text-sm sm:text-base font-black tracking-tight leading-snug">
                        World Health Organization
                      </h1>
                      <p className="text-[10.5px] font-semibold opacity-90">
                        Patient Safety • A World Alliance for Safer Health Care
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase">
                      SAVE LIVES
                    </h2>
                    <p className="text-[11px] font-bold text-amber-200">
                      Clean Your Hands
                    </p>
                  </div>
                </div>

                <div className="text-center py-1 border-b-2 border-slate-900">
                  <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-wide">
                    Observation Form – Optional Calculation Form
                  </h2>
                  <p className="text-[11px] font-bold text-slate-600">
                    (Indication-related compliance with hand hygiene / 5 Moments - Page 4)
                  </p>
                </div>

                {/* Header Information */}
                <div className="grid grid-cols-3 gap-4 text-xs font-bold border-1.5 border-slate-700 p-2.5 rounded-lg bg-slate-50">
                  <div>Facility: <span className="font-black text-slate-900">{indicationCalcData.facility || centerSettings.centerName || "Waheed IPC"}</span></div>
                  <div>Period: <span className="font-black text-slate-900">{indicationCalcData.period || periodTitle}</span></div>
                  <div>Setting: <span className="font-black text-slate-900">{indicationCalcData.setting || "Inpatient Care"}</span></div>
                </div>

                {/* Matrix Table */}
                <div className="border-2 border-slate-700 rounded-lg overflow-x-auto">
                  <table className="w-full text-center text-[9.5px] border-collapse">
                    <thead>
                      <tr className="bg-amber-100/90 border-b border-slate-500 font-black text-amber-950">
                        <th rowSpan={2} className="border-r border-slate-400 p-1.5 w-14">
                          Session N°
                        </th>
                        <th colSpan={3} className="border-r border-slate-400 p-1.5">
                          Before touching a patient (1)
                        </th>
                        <th colSpan={3} className="border-r border-slate-400 p-1.5">
                          Before clean/aseptic (2)
                        </th>
                        <th colSpan={3} className="border-r border-slate-400 p-1.5">
                          After body fluid risk (3)
                        </th>
                        <th colSpan={3} className="border-r border-slate-400 p-1.5">
                          After touching a patient (4)
                        </th>
                        <th colSpan={3} className="p-1.5">
                          After touching surroundings (5)
                        </th>
                      </tr>
                      <tr className="bg-slate-100 border-b border-slate-500 text-[8.5px] font-bold">
                        <th className="border-r border-slate-300 p-1">Indic (n)</th>
                        <th className="border-r border-slate-300 p-1">HW (n)</th>
                        <th className="border-r border-slate-300 p-1">HR (n)</th>

                        <th className="border-r border-slate-300 p-1">Indic (n)</th>
                        <th className="border-r border-slate-300 p-1">HW (n)</th>
                        <th className="border-r border-slate-300 p-1">HR (n)</th>

                        <th className="border-r border-slate-300 p-1">Indic (n)</th>
                        <th className="border-r border-slate-300 p-1">HW (n)</th>
                        <th className="border-r border-slate-300 p-1">HR (n)</th>

                        <th className="border-r border-slate-300 p-1">Indic (n)</th>
                        <th className="border-r border-slate-300 p-1">HW (n)</th>
                        <th className="border-r border-slate-300 p-1">HR (n)</th>

                        <th className="border-r border-slate-300 p-1">Indic (n)</th>
                        <th className="border-r border-slate-300 p-1">HW (n)</th>
                        <th className="p-1">HR (n)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 font-mono text-[9px]">
                      {indicationCalcData.sessions.map((row) => (
                        <tr key={row.sessionNumber} className="hover:bg-slate-50">
                          <td className="border-r border-slate-400 font-black p-1 bg-slate-50">{row.sessionNumber}</td>
                          <td className="border-r border-slate-200 p-1">{row.befPat.indicCount || "-"}</td>
                          <td className="border-r border-slate-200 p-1">{row.befPat.hwCount || "-"}</td>
                          <td className="border-r border-slate-300 p-1">{row.befPat.hrCount || "-"}</td>

                          <td className="border-r border-slate-200 p-1">{row.befAsept.indicCount || "-"}</td>
                          <td className="border-r border-slate-200 p-1">{row.befAsept.hwCount || "-"}</td>
                          <td className="border-r border-slate-300 p-1">{row.befAsept.hrCount || "-"}</td>

                          <td className="border-r border-slate-200 p-1">{row.aftBf.indicCount || "-"}</td>
                          <td className="border-r border-slate-200 p-1">{row.aftBf.hwCount || "-"}</td>
                          <td className="border-r border-slate-300 p-1">{row.aftBf.hrCount || "-"}</td>

                          <td className="border-r border-slate-200 p-1">{row.aftPat.indicCount || "-"}</td>
                          <td className="border-r border-slate-200 p-1">{row.aftPat.hwCount || "-"}</td>
                          <td className="border-r border-slate-300 p-1">{row.aftPat.hrCount || "-"}</td>

                          <td className="border-r border-slate-200 p-1">{row.aftSurr.indicCount || "-"}</td>
                          <td className="border-r border-slate-200 p-1">{row.aftSurr.hwCount || "-"}</td>
                          <td className="p-1">{row.aftSurr.hrCount || "-"}</td>
                        </tr>
                      ))}

                      {/* Total Calculation Row */}
                      <tr className="bg-amber-100/90 font-bold border-t-2 border-slate-600 text-[9.5px]">
                        <td className="border-r border-slate-400 p-2 font-black text-slate-950">Total Calculation</td>
                        <td colSpan={3} className="border-r border-slate-400 p-1.5 text-left px-2">
                          <div>Act = {indicationCalcData.totalBefPat.actCount} | Indic = {indicationCalcData.totalBefPat.indicCount}</div>
                        </td>
                        <td colSpan={3} className="border-r border-slate-400 p-1.5 text-left px-2">
                          <div>Act = {indicationCalcData.totalBefAsept.actCount} | Indic = {indicationCalcData.totalBefAsept.indicCount}</div>
                        </td>
                        <td colSpan={3} className="border-r border-slate-400 p-1.5 text-left px-2">
                          <div>Act = {indicationCalcData.totalAftBf.actCount} | Indic = {indicationCalcData.totalAftBf.indicCount}</div>
                        </td>
                        <td colSpan={3} className="border-r border-slate-400 p-1.5 text-left px-2">
                          <div>Act = {indicationCalcData.totalAftPat.actCount} | Indic = {indicationCalcData.totalAftPat.indicCount}</div>
                        </td>
                        <td colSpan={3} className="p-1.5 text-left px-2">
                          <div>Act = {indicationCalcData.totalAftSurr.actCount} | Indic = {indicationCalcData.totalAftSurr.indicCount}</div>
                        </td>
                      </tr>

                      {/* Ratio Row */}
                      <tr className="bg-orange-50 font-black border-t border-slate-400 text-xs">
                        <td className="border-r border-slate-400 p-2 text-orange-950 font-black">Ratio act/indic (%)</td>
                        <td colSpan={3} className="border-r border-slate-400 p-1.5 text-blue-900 text-sm">
                          %{indicationCalcData.totalBefPat.ratio}
                        </td>
                        <td colSpan={3} className="border-r border-slate-400 p-1.5 text-blue-900 text-sm">
                          %{indicationCalcData.totalBefAsept.ratio}
                        </td>
                        <td colSpan={3} className="border-r border-slate-400 p-1.5 text-blue-900 text-sm">
                          %{indicationCalcData.totalAftBf.ratio}
                        </td>
                        <td colSpan={3} className="border-r border-slate-400 p-1.5 text-blue-900 text-sm">
                          %{indicationCalcData.totalAftPat.ratio}
                        </td>
                        <td colSpan={3} className="p-1.5 text-blue-900 text-sm">
                          %{indicationCalcData.totalAftSurr.ratio}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-[10px] space-y-1 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-300">
                  <p className="font-semibold leading-relaxed">
                    *<strong>Note:</strong> This calculation gives an overall idea of health-care worker’s behaviour towards each type of indication.
                  </p>
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* DOCUMENT 4: SUMMARY & SIGNATURES (Single Sheet)           */}
            {/* ========================================================= */}
            {docType === "summary-signatures" && (
              <div className="space-y-5">
                <div className="bg-[#E65100] text-white p-3.5 rounded-t-lg flex items-center justify-between border-b-4 border-[#BF360C]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-[#E65100] font-black text-xs text-center leading-tight shadow-sm shrink-0">
                      WHO
                    </div>
                    <div>
                      <h1 className="text-sm sm:text-base font-black tracking-tight leading-snug">
                        World Health Organization
                      </h1>
                      <p className="text-[10.5px] font-semibold opacity-90">
                        Patient Safety • A World Alliance for Safer Health Care
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase">
                      SAVE LIVES
                    </h2>
                    <p className="text-[11px] font-bold text-amber-200">
                      Clean Your Hands
                    </p>
                  </div>
                </div>

                <div className="text-center py-1 border-b-2 border-slate-900">
                  <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-wide">
                    Analysis, Action Plan & Official Signatures
                  </h2>
                  <p className="text-[11px] font-bold text-slate-600">
                    التقرير التنفيذي الشامل، خطة التحسين المعتمدة، والاعتمادات الرسمية (Page 5)
                  </p>
                </div>

                {/* Key KPI Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl border-2 border-emerald-600 bg-emerald-50/70 space-y-1">
                    <div className="text-[10.5px] font-bold text-emerald-900">معدل الامتثال الكلي العام</div>
                    <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
                      %{overallRate}
                    </div>
                    <div className={`text-[9.5px] font-black px-2 py-0.5 rounded-full inline-block ${
                      isTargetMet ? "bg-emerald-200 text-emerald-900" : "bg-amber-200 text-amber-900"
                    }`}>
                      {isTargetMet ? "✓ محقق للمستهدف" : "تحت المستهدف"}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-300 bg-slate-50 space-y-1">
                    <div className="text-[10.5px] font-bold text-slate-700">إجمالي الفرص المرصودة</div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      {totalOpportunities}
                    </div>
                    <div className="text-[9.5px] text-slate-500 font-semibold">فرصة رصد معتمدة</div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-300 bg-slate-50 space-y-1">
                    <div className="text-[10.5px] font-bold text-slate-700">إجمالي الإجراءات المطبقة</div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      {totalActions}
                    </div>
                    <div className="text-[9.5px] text-slate-500 font-semibold">تطهير كحولي + غسيل</div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-300 bg-slate-50 space-y-1">
                    <div className="text-[10.5px] font-bold text-slate-700">عدد جلسات الرصد</div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      {totalSessionsCount}
                    </div>
                    <div className="text-[9.5px] text-slate-500 font-semibold">استمارة رصد ميداني</div>
                  </div>
                </div>

                {/* Recommendations Box */}
                <div className="border-1.5 border-slate-700 rounded-xl p-4 bg-slate-50 space-y-2.5">
                  <h4 className="font-black text-xs sm:text-sm text-slate-900 border-b border-slate-200 pb-1.5">
                    التوصيات وخطة العمل لتحسين ممارسات نظافة وتطهير الأيدي:
                  </h4>
                  <div className="space-y-1.5 text-[11px] text-slate-700 leading-relaxed font-semibold">
                    <p>1. الاستمرار في تدريب الكوادر الطبية والتمريضية على دواعي غسيل الأيدي الخمسة (WHO 5 Moments) مع التركيز على دافع ما قبل ملامسة المريض وما بعد ملامسة البيئة المحيطة.</p>
                    <p>2. التأكد من توفر المطهرات الكحولية عند نقاط تقديم الخدمة (Point of Care) وفي كافة العربات العلاجية وغرف المرضى.</p>
                    <p>3. تطبيق آلية التغذية الراجعة الفورية بعد كل جلسة رصد وتكريم الأقسام والفئات المهنية المحققة لأعلى نسب امتثال لتحفيز الالتزام المستمر.</p>
                    <p>4. الالتزام بعدم ارتداء القفازات كبديل لنظافة وتطهير الأيدي والحرص على التطهير قبل وبعد نزع القفازات.</p>
                    {customNotes && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 mt-2 font-bold">
                        {customNotes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Signatures Section */}
                <div className="signatures-section border-1.5 border-slate-700 rounded-xl p-4 bg-white space-y-3 mt-4">
                  <h4 className="font-black text-xs sm:text-sm text-slate-900 text-center border-b border-slate-200 pb-1.5">
                    الاعتمادات والتوقيعات الرسمية
                  </h4>
                  <div className="grid grid-cols-2 gap-8 text-center pt-1">
                    <div className="space-y-2">
                      <div className="font-black text-xs text-slate-800">مسؤول / راصد مكافحة العدوى</div>
                      <div className="font-bold text-sm text-slate-900">{centerSettings.infectionControlLead || "م/ أحمد وحيد شعبان"}</div>
                      <div className="text-[11px] text-slate-400 pt-5">التوقيع: .......................................</div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-black text-xs text-slate-800">مدير المركز / المستشفى</div>
                      <div className="font-bold text-sm text-slate-900">{centerSettings.medicalDirector || "د/ إيناس"}</div>
                      <div className="text-[11px] text-slate-400 pt-5">التوقيع والاعتماد: ............................</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
