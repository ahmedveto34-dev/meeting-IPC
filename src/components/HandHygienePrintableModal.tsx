import React, { useState } from "react";
import {
  WHOObservationSession,
  WHOBasicComplianceSheetData,
  WHOIndicationComplianceSheetData,
  CenterSettings,
  WHO_FIVE_MOMENTS,
  WHO_PROF_CATEGORIES,
} from "../types";
import {
  X,
  Printer,
  FileDown,
  Sparkles,
  Layers,
  FileText,
  Calculator,
  PieChart,
  Download,
  Loader2,
  CheckCircle2,
  TrendingUp,
  Award,
  AlertTriangle,
  Building2,
  Calendar,
  Users,
} from "lucide-react";
import {
  exportHandHygieneStatisticsToWord,
  exportSingleHandHygieneSessionToWord,
} from "../utils/handHygieneDocxExport";
import { exportHandHygieneStatisticsToFullHtml } from "../utils/handHygieneHtmlExport";

interface HandHygienePrintableModalProps {
  session: WHOObservationSession | null;
  allSessions: WHOObservationSession[];
  basicCalcData: WHOBasicComplianceSheetData;
  indicationCalcData: WHOIndicationComplianceSheetData;
  isOpen: boolean;
  onClose: () => void;
  defaultDocType?: "all-pages" | "session-form" | "basic-calc" | "indication-calc";
  centerSettings?: CenterSettings;
  periodTitle?: string;
  targetCompliance?: number;
  customNotes?: string;
}

export const HandHygienePrintableModal: React.FC<HandHygienePrintableModalProps> = ({
  session,
  allSessions,
  basicCalcData,
  indicationCalcData,
  isOpen,
  onClose,
  defaultDocType = "all-pages",
  centerSettings = {
    centerName: "Waheed IPC",
    departmentTitle: "قسم مكافحة العدوى",
    medicalDirector: "د/ إيناس",
    infectionControlLead: "م/ أحمد وحيد شعبان",
    qualityLead: "د/ مروة",
    nursingSupervisor: "م/ فاطمة",
    defaultMembers: [],
    departments: ["surgery", "icu", "outpatient", "emergency", "dental", "lab", "dialysis"],
  },
  periodTitle = "الفترة الحالية (2026)",
  targetCompliance = 85,
  customNotes,
}) => {
  const [docType, setDocType] = useState<"all-pages" | "session-form" | "basic-calc" | "indication-calc">(defaultDocType);
  const [isExportingWord, setIsExportingWord] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportHtml = () => {
    exportHandHygieneStatisticsToFullHtml({
      sessions: allSessions,
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
      if (docType === "session-form" && session) {
        await exportSingleHandHygieneSessionToWord(session, centerSettings);
      } else {
        await exportHandHygieneStatisticsToWord({
          sessions: allSessions,
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
  const totalSessionsCount = allSessions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto font-['Cairo',sans-serif]">
      <div className="bg-slate-100 rounded-3xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white p-4 flex flex-col lg:flex-row items-center justify-between gap-3 shrink-0 print:hidden shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black flex items-center gap-2">
                <span>معاينة الطباعة وتحميل التقارير (WHO Official Printout & PDF)</span>
                <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
                  كافة الصفحات والمعدلات
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">تنسيق معتمد ومطابق لنماذج منظمة الصحة العالمية الرسمية بالكامل</p>
            </div>
          </div>

          {/* Document Switcher */}
          <div className="flex items-center flex-wrap gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setDocType("all-pages")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                docType === "all-pages" ? "bg-orange-600 text-white shadow-sm" : "text-slate-300 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>التقرير الشامل (كافة الصفحات)</span>
            </button>
            <button
              onClick={() => setDocType("basic-calc")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                docType === "basic-calc" ? "bg-orange-600 text-white shadow-sm" : "text-slate-300 hover:text-white"
              }`}
            >
              الامتثال الأساسي (Page 3)
            </button>
            <button
              onClick={() => setDocType("indication-calc")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                docType === "indication-calc" ? "bg-orange-600 text-white shadow-sm" : "text-slate-300 hover:text-white"
              }`}
            >
              دواعي الغسيل (Page 4)
            </button>
            <button
              onClick={() => setDocType("session-form")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                docType === "session-form" ? "bg-orange-600 text-white shadow-sm" : "text-slate-300 hover:text-white"
              }`}
            >
              نموذج الرصد (Session Form)
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
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
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-200/60 flex justify-center">
          <div className="bg-white w-full max-w-[850px] min-h-[1100px] p-6 sm:p-8 rounded-xl shadow-lg border border-slate-300 text-slate-900 text-xs font-sans print:shadow-none print:border-none print:p-0 print:m-0 print:w-full space-y-8">
            
            {/* ========================================================= */}
            {/* DOCUMENT: ALL PAGES (COMPREHENSIVE MULTI-PAGE REPORT)     */}
            {/* ========================================================= */}
            {docType === "all-pages" && (
              <div className="space-y-10">
                
                {/* PAGE 1: COVER & EXECUTIVE SUMMARY & KPIS */}
                <div className="print-page print-page-break space-y-5 pb-6 border-b-2 border-dashed border-slate-300 print:border-none">
                  
                  {/* Official WHO Header Banner */}
                  <div className="bg-[#E65100] text-white p-4 rounded-t-lg flex items-center justify-between border-b-4 border-[#BF360C]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#E65100] font-black text-xs text-center leading-tight shadow-sm">
                        WHO
                      </div>
                      <div>
                        <h1 className="text-base font-black tracking-tight leading-snug">
                          World Health Organization
                        </h1>
                        <p className="text-[11px] font-semibold opacity-90">
                          Patient Safety • A World Alliance for Safer Health Care
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <h2 className="text-sm font-black tracking-wider uppercase">
                        SAVE LIVES
                      </h2>
                      <p className="text-xs font-bold text-amber-200">
                        Clean Your Hands
                      </p>
                    </div>
                  </div>

                  {/* Header Title & Facility */}
                  <div className="text-center py-2 border-b-2 border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {centerSettings.centerName || "Waheed IPC"} — {centerSettings.departmentTitle || "قسم مكافحة العدوى"}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                      التقرير الإحصائي الشامل ومعدلات الامتثال لنظافة وتطهير الأيدي
                    </h2>
                    <p className="text-xs font-bold text-slate-600">
                      الفترة الإحصائية: {periodTitle} | الهدف الاستراتيجي للامتثال: %{targetCompliance}
                    </p>
                  </div>

                  {/* Key KPI Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    
                    {/* Overall Compliance */}
                    <div className="p-3.5 rounded-xl border-2 border-emerald-600 bg-emerald-50/70 space-y-1">
                      <div className="text-[11px] font-bold text-emerald-900">معدل الامتثال الكلي العام</div>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono tracking-tight">
                        %{overallRate}
                      </div>
                      <div className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block ${
                        isTargetMet ? "bg-emerald-200 text-emerald-900" : "bg-amber-200 text-amber-900"
                      }`}>
                        {isTargetMet ? "✓ محقق للمستهدف" : "تحت المستهدف"}
                      </div>
                    </div>

                    {/* Total Opportunities */}
                    <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 space-y-1">
                      <div className="text-[11px] font-bold text-slate-700">إجمالي الفرص المرصودة</div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                        {totalOpportunities}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold">فرصة رصد معتمدة</div>
                    </div>

                    {/* Total Actions */}
                    <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 space-y-1">
                      <div className="text-[11px] font-bold text-slate-700">إجمالي الإجراءات المطبقة</div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                        {totalActions}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold">تطهير كحولي + غسيل</div>
                    </div>

                    {/* Observation Sessions */}
                    <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 space-y-1">
                      <div className="text-[11px] font-bold text-slate-700">عدد جلسات الرصد</div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                        {totalSessionsCount}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold">استمارة رصد ميداني</div>
                    </div>
                  </div>

                  {/* Summary Comparison Tables */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Compliance By Professional Category */}
                    <div className="border border-slate-300 rounded-xl overflow-hidden">
                      <div className="bg-slate-800 text-white px-3 py-2 text-xs font-black flex items-center justify-between">
                        <span>معدل الامتثال حسب الفئات المهنية</span>
                        <Users className="w-4 h-4 text-slate-300" />
                      </div>
                      <table className="w-full text-xs text-right border-collapse">
                        <tbody className="divide-y divide-slate-200">
                          <tr className="p-2 hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-700">1. التمريض والولادة (Nurse/Midwife)</td>
                            <td className="p-2 font-mono text-center text-slate-600">{basicCalcData.totalNurse.actCount}/{basicCalcData.totalNurse.oppCount}</td>
                            <td className="p-2 font-black text-left text-emerald-700 text-sm font-mono">%{basicCalcData.totalNurse.complianceRate}</td>
                          </tr>
                          <tr className="p-2 hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-700">2. الفئات المساعدة (Auxiliary)</td>
                            <td className="p-2 font-mono text-center text-slate-600">{basicCalcData.totalAuxiliary.actCount}/{basicCalcData.totalAuxiliary.oppCount}</td>
                            <td className="p-2 font-black text-left text-emerald-700 text-sm font-mono">%{basicCalcData.totalAuxiliary.complianceRate}</td>
                          </tr>
                          <tr className="p-2 hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-700">3. الأطباء البشريون (Medical Doctor)</td>
                            <td className="p-2 font-mono text-center text-slate-600">{basicCalcData.totalDoctor.actCount}/{basicCalcData.totalDoctor.oppCount}</td>
                            <td className="p-2 font-black text-left text-emerald-700 text-sm font-mono">%{basicCalcData.totalDoctor.complianceRate}</td>
                          </tr>
                          <tr className="p-2 hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-700">4. كوادر صحية أخرى (Other HCW)</td>
                            <td className="p-2 font-mono text-center text-slate-600">{basicCalcData.totalOther.actCount}/{basicCalcData.totalOther.oppCount}</td>
                            <td className="p-2 font-black text-left text-emerald-700 text-sm font-mono">%{basicCalcData.totalOther.complianceRate}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Compliance By WHO 5 Moments */}
                    <div className="border border-slate-300 rounded-xl overflow-hidden">
                      <div className="bg-amber-800 text-white px-3 py-2 text-xs font-black flex items-center justify-between">
                        <span>معدل الامتثال لدواعي الغسيل الخمسة (5 Moments)</span>
                        <Award className="w-4 h-4 text-amber-200" />
                      </div>
                      <table className="w-full text-xs text-right border-collapse">
                        <tbody className="divide-y divide-slate-200 text-[11px]">
                          <tr className="p-1.5 hover:bg-slate-50">
                            <td className="p-1.5 font-bold text-slate-700">1. قبل ملامسة المريض</td>
                            <td className="p-1.5 font-mono text-center text-slate-600">{indicationCalcData.totalBefPat.actCount}/{indicationCalcData.totalBefPat.indicCount}</td>
                            <td className="p-1.5 font-black text-left text-amber-800 font-mono">%{indicationCalcData.totalBefPat.ratio}</td>
                          </tr>
                          <tr className="p-1.5 hover:bg-slate-50">
                            <td className="p-1.5 font-bold text-slate-700">2. قبل الإجراء النظيف / المعقم</td>
                            <td className="p-1.5 font-mono text-center text-slate-600">{indicationCalcData.totalBefAsept.actCount}/{indicationCalcData.totalBefAsept.indicCount}</td>
                            <td className="p-1.5 font-black text-left text-amber-800 font-mono">%{indicationCalcData.totalBefAsept.ratio}</td>
                          </tr>
                          <tr className="p-1.5 hover:bg-slate-50">
                            <td className="p-1.5 font-bold text-slate-700">3. بعد التعرض لسوائل الجسم</td>
                            <td className="p-1.5 font-mono text-center text-slate-600">{indicationCalcData.totalAftBf.actCount}/{indicationCalcData.totalAftBf.indicCount}</td>
                            <td className="p-1.5 font-black text-left text-amber-800 font-mono">%{indicationCalcData.totalAftBf.ratio}</td>
                          </tr>
                          <tr className="p-1.5 hover:bg-slate-50">
                            <td className="p-1.5 font-bold text-slate-700">4. بعد ملامسة المريض</td>
                            <td className="p-1.5 font-mono text-center text-slate-600">{indicationCalcData.totalAftPat.actCount}/{indicationCalcData.totalAftPat.indicCount}</td>
                            <td className="p-1.5 font-black text-left text-amber-800 font-mono">%{indicationCalcData.totalAftPat.ratio}</td>
                          </tr>
                          <tr className="p-1.5 hover:bg-slate-50">
                            <td className="p-1.5 font-bold text-slate-700">5. بعد ملامسة محيط وبيئة المريض</td>
                            <td className="p-1.5 font-mono text-center text-slate-600">{indicationCalcData.totalAftSurr.actCount}/{indicationCalcData.totalAftSurr.indicCount}</td>
                            <td className="p-1.5 font-black text-left text-amber-800 font-mono">%{indicationCalcData.totalAftSurr.ratio}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                  </div>

                  <div className="text-[10px] text-slate-500 text-center pt-2">
                    الصفحة 1 من 5 • الملخص التنفيذي ومؤشرات الأداء المعتمدة
                  </div>
                </div>

                {/* PAGE 2: WHO BASIC COMPLIANCE CALCULATION SHEET (PAGE 3) */}
                <div className="print-page print-page-break space-y-4 pb-6 border-b-2 border-dashed border-slate-300 print:border-none">
                  <div className="bg-[#E65100] text-white p-3 rounded-t-lg flex items-center justify-between">
                    <span className="font-black text-xs">WHO Observation Form – Basic Compliance Calculation (Page 3)</span>
                    <span className="text-[11px] font-bold text-amber-200">الصفحة 2: استمارة حساب الامتثال الأساسي</span>
                  </div>

                  {/* Header Information */}
                  <div className="grid grid-cols-3 gap-4 text-xs font-bold border border-slate-300 p-2.5 rounded-lg bg-slate-50">
                    <div>Facility: <span className="font-black text-slate-900">{basicCalcData.facility}</span></div>
                    <div>Period: <span className="font-black text-slate-900">{basicCalcData.period}</span></div>
                    <div>Setting: <span className="font-black text-slate-900">{basicCalcData.setting}</span></div>
                  </div>

                  {/* Matrix Table */}
                  <div className="border-2 border-slate-400 rounded-lg overflow-x-auto">
                    <table className="w-full text-center text-[10px] border-collapse">
                      <thead>
                        <tr className="bg-amber-100/70 border-b border-slate-400 font-black">
                          <th rowSpan={2} className="border-r border-slate-300 p-1.5 w-16">
                            Session N°
                          </th>
                          <th colSpan={3} className="border-r border-slate-300 p-1.5">
                            Prof.cat 1 (Nurse/Midwife)
                          </th>
                          <th colSpan={3} className="border-r border-slate-300 p-1.5">
                            Prof.cat 2 (Auxiliary)
                          </th>
                          <th colSpan={3} className="border-r border-slate-300 p-1.5">
                            Prof.cat 3 (Medical Doctor)
                          </th>
                          <th colSpan={3} className="border-r border-slate-300 p-1.5">
                            Prof.cat 4 (Other HCW)
                          </th>
                          <th colSpan={3} className="p-1.5 bg-amber-200/70">
                            Total per session
                          </th>
                        </tr>
                        <tr className="bg-slate-100 border-b border-slate-400 text-[9px] font-bold">
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

                          <th className="border-r border-slate-300 p-1 bg-amber-100">Opp (n)</th>
                          <th className="border-r border-slate-300 p-1 bg-amber-100">HW (n)</th>
                          <th className="p-1 bg-amber-100">HR (n)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300 font-mono text-[9.5px]">
                        {basicCalcData.sessions.map((row) => (
                          <tr key={row.sessionNumber} className="hover:bg-slate-50">
                            <td className="border-r border-slate-300 font-bold p-1 bg-slate-50">{row.sessionNumber}</td>
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

                            <td className="border-r border-slate-200 p-1 font-bold bg-amber-50/50">{row.total.oppCount}</td>
                            <td className="border-r border-slate-200 p-1 font-bold bg-amber-50/50">{row.total.hwCount}</td>
                            <td className="p-1 font-bold bg-amber-50/50">{row.total.hrCount}</td>
                          </tr>
                        ))}

                        {/* Total Calculation Row */}
                        <tr className="bg-amber-100 font-bold border-t-2 border-slate-500 text-[10px]">
                          <td className="border-r border-slate-300 p-2 font-black text-slate-900">Total Calculation</td>
                          <td colSpan={3} className="border-r border-slate-300 p-2 text-left px-3">
                            <div>Act = {basicCalcData.totalNurse.actCount} | Opp = {basicCalcData.totalNurse.oppCount}</div>
                          </td>
                          <td colSpan={3} className="border-r border-slate-300 p-2 text-left px-3">
                            <div>Act = {basicCalcData.totalAuxiliary.actCount} | Opp = {basicCalcData.totalAuxiliary.oppCount}</div>
                          </td>
                          <td colSpan={3} className="border-r border-slate-300 p-2 text-left px-3">
                            <div>Act = {basicCalcData.totalDoctor.actCount} | Opp = {basicCalcData.totalDoctor.oppCount}</div>
                          </td>
                          <td colSpan={3} className="border-r border-slate-300 p-2 text-left px-3">
                            <div>Act = {basicCalcData.totalOther.actCount} | Opp = {basicCalcData.totalOther.oppCount}</div>
                          </td>
                          <td colSpan={3} className="p-2 text-left px-3 bg-amber-200 font-black">
                            <div>Act = {basicCalcData.grandTotal.actCount} | Opp = {basicCalcData.grandTotal.oppCount}</div>
                          </td>
                        </tr>

                        {/* Compliance Row with clear bold percentages */}
                        <tr className="bg-orange-50 font-black border-t border-slate-300 text-xs">
                          <td className="border-r border-slate-300 p-2 text-orange-950 font-black">Compliance (%)</td>
                          <td colSpan={3} className="border-r border-slate-300 p-2 text-emerald-800 text-sm">
                            %{basicCalcData.totalNurse.complianceRate}
                          </td>
                          <td colSpan={3} className="border-r border-slate-300 p-2 text-emerald-800 text-sm">
                            %{basicCalcData.totalAuxiliary.complianceRate}
                          </td>
                          <td colSpan={3} className="border-r border-slate-300 p-2 text-emerald-800 text-sm">
                            %{basicCalcData.totalDoctor.complianceRate}
                          </td>
                          <td colSpan={3} className="border-r border-slate-300 p-2 text-emerald-800 text-sm">
                            %{basicCalcData.totalOther.complianceRate}
                          </td>
                          <td colSpan={3} className="p-2 bg-orange-100 text-emerald-800 text-base font-black">
                            %{basicCalcData.overallComplianceRate}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Formula Callout */}
                  <div className="border border-slate-300 p-2.5 rounded-lg flex items-center justify-center gap-4 bg-slate-50 font-bold text-xs">
                    <span>Compliance (%) = (Actions ÷ Opportunities) × 100</span>
                  </div>

                  <div className="text-[10px] text-slate-500 text-center pt-2">
                    الصفحة 2 من 5 • استمارة حساب الامتثال الأساسي الرسمية (WHO Basic Compliance Calculation)
                  </div>
                </div>

                {/* PAGE 3: WHO INDICATION COMPLIANCE SHEET (PAGE 4) */}
                <div className="print-page print-page-break space-y-4 pb-6 border-b-2 border-dashed border-slate-300 print:border-none">
                  <div className="bg-[#D97706] text-white p-3 rounded-t-lg flex items-center justify-between">
                    <span className="font-black text-xs">WHO Observation Form – Optional Calculation Form / 5 Moments (Page 4)</span>
                    <span className="text-[11px] font-bold text-amber-100">الصفحة 3: حساب الامتثال لدواعي الغسيل الخمسة</span>
                  </div>

                  {/* Header Information */}
                  <div className="grid grid-cols-3 gap-4 text-xs font-bold border border-slate-300 p-2.5 rounded-lg bg-slate-50">
                    <div>Facility: <span className="font-black text-slate-900">{indicationCalcData.facility}</span></div>
                    <div>Period: <span className="font-black text-slate-900">{indicationCalcData.period}</span></div>
                    <div>Setting: <span className="font-black text-slate-900">{indicationCalcData.setting}</span></div>
                  </div>

                  {/* Matrix Table */}
                  <div className="border-2 border-slate-400 rounded-lg overflow-x-auto">
                    <table className="w-full text-center text-[10px] border-collapse">
                      <thead>
                        <tr className="bg-amber-100/70 border-b border-slate-400 font-black">
                          <th rowSpan={2} className="border-r border-slate-300 p-1.5 w-16">
                            Session N°
                          </th>
                          <th colSpan={3} className="border-r border-slate-300 p-1.5">
                            Before touching a patient (1)
                          </th>
                          <th colSpan={3} className="border-r border-slate-300 p-1.5">
                            Before clean/aseptic (2)
                          </th>
                          <th colSpan={3} className="border-r border-slate-300 p-1.5">
                            After body fluid risk (3)
                          </th>
                          <th colSpan={3} className="border-r border-slate-300 p-1.5">
                            After touching a patient (4)
                          </th>
                          <th colSpan={3} className="p-1.5">
                            After touching surroundings (5)
                          </th>
                        </tr>
                        <tr className="bg-slate-100 border-b border-slate-400 text-[9px] font-bold">
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
                      <tbody className="divide-y divide-slate-300 font-mono text-[9.5px]">
                        {indicationCalcData.sessions.map((row) => (
                          <tr key={row.sessionNumber} className="hover:bg-slate-50">
                            <td className="border-r border-slate-300 font-bold p-1 bg-slate-50">{row.sessionNumber}</td>
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
                        <tr className="bg-amber-100 font-bold border-t-2 border-slate-500 text-[10px]">
                          <td className="border-r border-slate-300 p-2 font-black text-slate-900">Total Calculation</td>
                          <td colSpan={3} className="border-r border-slate-300 p-2 text-left px-2">
                            <div>Act = {indicationCalcData.totalBefPat.actCount} | Indic = {indicationCalcData.totalBefPat.indicCount}</div>
                          </td>
                          <td colSpan={3} className="border-r border-slate-300 p-2 text-left px-2">
                            <div>Act = {indicationCalcData.totalBefAsept.actCount} | Indic = {indicationCalcData.totalBefAsept.indicCount}</div>
                          </td>
                          <td colSpan={3} className="border-r border-slate-300 p-2 text-left px-2">
                            <div>Act = {indicationCalcData.totalAftBf.actCount} | Indic = {indicationCalcData.totalAftBf.indicCount}</div>
                          </td>
                          <td colSpan={3} className="border-r border-slate-300 p-2 text-left px-2">
                            <div>Act = {indicationCalcData.totalAftPat.actCount} | Indic = {indicationCalcData.totalAftPat.indicCount}</div>
                          </td>
                          <td colSpan={3} className="p-2 text-left px-2">
                            <div>Act = {indicationCalcData.totalAftSurr.actCount} | Indic = {indicationCalcData.totalAftSurr.indicCount}</div>
                          </td>
                        </tr>

                        {/* Ratio Row with clear percentages */}
                        <tr className="bg-orange-50 font-black border-t border-slate-300 text-xs">
                          <td className="border-r border-slate-300 p-2 text-orange-950 font-black">Ratio act / indic (%)</td>
                          <td colSpan={3} className="border-r border-slate-300 p-2 text-blue-900 text-sm">
                            %{indicationCalcData.totalBefPat.ratio}
                          </td>
                          <td colSpan={3} className="border-r border-slate-300 p-2 text-blue-900 text-sm">
                            %{indicationCalcData.totalBefAsept.ratio}
                          </td>
                          <td colSpan={3} className="border-r border-slate-300 p-2 text-blue-900 text-sm">
                            %{indicationCalcData.totalAftBf.ratio}
                          </td>
                          <td colSpan={3} className="border-r border-slate-300 p-2 text-blue-900 text-sm">
                            %{indicationCalcData.totalAftPat.ratio}
                          </td>
                          <td colSpan={3} className="p-2 text-blue-900 text-sm">
                            %{indicationCalcData.totalAftSurr.ratio}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-[10px] text-slate-500 text-center pt-2">
                    الصفحة 3 من 5 • استمارة حساب الامتثال بدواعي غسيل الأيدي الخمسة (WHO 5 Moments Calculation)
                  </div>
                </div>

                {/* PAGE 4: DETAILED OBSERVATION SESSIONS BREAKDOWN */}
                <div className="print-page print-page-break space-y-4 pb-6 border-b-2 border-dashed border-slate-300 print:border-none">
                  <div className="bg-slate-900 text-white p-3 rounded-t-lg flex items-center justify-between">
                    <span className="font-black text-xs">Detailed Observation Sessions Breakdown Table</span>
                    <span className="text-[11px] font-bold text-slate-300">الصفحة 4: سجل واستمارات جلسات الرصد الميداني ({allSessions.length} جلسة)</span>
                  </div>

                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <table className="w-full text-right text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-900 font-black border-b border-slate-300">
                        <tr>
                          <th className="p-2 text-center w-12">رقم</th>
                          <th className="p-2">القسم / الجناح / التاريخ</th>
                          <th className="p-2 text-center">الراصد والمدة</th>
                          <th className="p-2">تفاصيل الفئات والفرص المرصودة</th>
                          <th className="p-2 text-center w-28 bg-emerald-100 text-emerald-950">نسبة الامتثال %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {allSessions.map((sess, sIdx) => {
                          const matchedBasic = basicCalcData.sessions.find((b) => b.sessionNumber === sess.sessionNumber);
                          const sessionRate = matchedBasic ? matchedBasic.total.complianceRate : 0;
                          const sessionOpp = matchedBasic ? matchedBasic.total.oppCount : 0;
                          const sessionAct = matchedBasic ? matchedBasic.total.actCount : 0;

                          return (
                            <tr key={sess.id || sIdx} className="hover:bg-slate-50">
                              <td className="p-2 text-center font-black font-mono bg-slate-50">{sess.sessionNumber}</td>
                              <td className="p-2">
                                <div className="font-bold text-slate-900">{sess.ward || sess.department || "قسم رصد"}</div>
                                <div className="text-[11px] text-slate-500 font-mono">تاريخ: {sess.date}</div>
                              </td>
                              <td className="p-2 text-center">
                                <div className="font-semibold text-slate-800">{sess.observer || "مكافحة العدوى"}</div>
                                <div className="text-[10px] text-slate-500">{sess.sessionDuration || 20} دقيقة</div>
                              </td>
                              <td className="p-2 text-[11px] text-slate-600">
                                {(sess.columns || []).map((c) => {
                                  const oppCount = (c.opportunities || []).filter((o) => (o.indications && o.indications.length > 0) || !!o.action).length;
                                  return (
                                    <span key={c.id} className="inline-block bg-slate-100 rounded px-1.5 py-0.5 ml-1 mb-1 font-mono">
                                      {c.profCatCode}: {oppCount} فرص
                                    </span>
                                  );
                                })}
                              </td>
                              <td className="p-2 text-center font-mono font-black text-emerald-800 bg-emerald-50/50">
                                <div className="text-sm">%{sessionRate}</div>
                                <div className="text-[10px] text-slate-500">({sessionAct}/{sessionOpp})</div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="text-[10px] text-slate-500 text-center pt-2">
                    الصفحة 4 من 5 • سجل وتفاصيل جلسات الرصد الميداني
                  </div>
                </div>

                {/* PAGE 5: RECOMMENDATIONS, ACTION PLAN & OFFICIAL SIGNATURES */}
                <div className="print-page space-y-5">
                  <div className="bg-slate-900 text-white p-3 rounded-t-lg flex items-center justify-between">
                    <span className="font-black text-xs">Analysis, Recommendations, Action Plan & Signatures</span>
                    <span className="text-[11px] font-bold text-slate-300">الصفحة 5: التحليل والتوصيات وخطة التحسين والاعتمادات</span>
                  </div>

                  <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 space-y-3">
                    <h4 className="font-black text-sm text-slate-900 border-b border-slate-200 pb-1.5">
                      التوصيات وخطة العمل لتحسين ممارسات نظافة وتطهير الأيدي:
                    </h4>
                    <div className="space-y-2 text-xs text-slate-700 leading-relaxed font-medium">
                      <p>1. الاستمرار في تدريب الكوادر الطبية والتمريضية على دواعي غسيل الأيدي الخمسة (WHO 5 Moments) مع التركيز على دافع ما قبل ملامسة المريض وما بعد ملامسة البيئة المحيطة.</p>
                      <p>2. التأكد من توفر المطهرات الكحولية عند نقاط تقديم الخدمة (Point of Care) وفي كافة العربات العلاجية وغرف المرضى.</p>
                      <p>3. تطبيق آلية التغذية الراجعة الفورية بعد كل جلسة رصد وتكريم الأقسام والفئات المهنية المحققة لأعلى نسب امتثال لتحفيز الالتزام المستمر.</p>
                      <p>4. الالتزام بعدم ارتداء القفازات كبديل لنظافة وتطهير الأيدي والحرص على التطهير قبل وبعد نزع القفازات.</p>
                      {customNotes && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 mt-2 font-bold">
                          {customNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Signatures Section */}
                  <div className="signatures-section border-2 border-slate-300 rounded-xl p-5 bg-white space-y-4 mt-6">
                    <h4 className="font-black text-sm text-slate-900 text-center border-b border-slate-200 pb-2">
                      الاعتمادات والتوقيعات الرسمية
                    </h4>
                    <div className="grid grid-cols-2 gap-8 text-center pt-2">
                      <div className="space-y-3">
                        <div className="font-black text-xs text-slate-800">مسؤول / راصد مكافحة العدوى</div>
                        <div className="font-bold text-sm text-slate-900">{centerSettings.infectionControlLead || "م/ أحمد وحيد شعبان"}</div>
                        <div className="text-xs text-slate-400 pt-6">التوقيع: .......................................</div>
                      </div>
                      <div className="space-y-3">
                        <div className="font-black text-xs text-slate-800">مدير المركز / المستشفى</div>
                        <div className="font-bold text-sm text-slate-900">{centerSettings.medicalDirector || "د/ إيناس"}</div>
                        <div className="text-xs text-slate-400 pt-6">التوقيع والاعتماد: ............................</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 text-center pt-4">
                    الصفحة 5 من 5 • ختام التقرير والاعتمادات الرسمية • صادر وفقاً لمعايير WHO
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* DOCUMENT 1: WHO OBSERVATION FORM (Single Session Form)    */}
            {/* ========================================================= */}
            {docType === "session-form" && (
              <div className="space-y-4">
                
                {/* Official WHO Header Banner */}
                <div className="bg-[#E65100] text-white p-4 rounded-t-lg flex items-center justify-between border-b-4 border-[#BF360C]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#E65100] font-black text-xs text-center leading-tight shadow-sm">
                      WHO
                    </div>
                    <div>
                      <h1 className="text-base font-black tracking-tight leading-snug">
                        World Health Organization
                      </h1>
                      <p className="text-[11px] font-semibold opacity-90">
                        Patient Safety • A World Alliance for Safer Health Care
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-sm font-black tracking-wider uppercase">
                      SAVE LIVES
                    </h2>
                    <p className="text-xs font-bold text-amber-200">
                      Clean Your Hands
                    </p>
                  </div>
                </div>

                <div className="text-center py-1 border-b border-slate-300">
                  <h2 className="text-lg font-black text-slate-900 tracking-wide">
                    Observation Form
                  </h2>
                </div>

                {/* Header Information Grid */}
                {session && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] border border-slate-300 p-3 rounded-lg bg-slate-50/50">
                    <div className="space-y-1.5">
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="font-bold text-slate-600">Facility:</span>
                        <span className="font-black text-slate-900">{session.facility}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="font-bold text-slate-600">Service:</span>
                        <span className="font-semibold text-slate-900">{session.service}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="font-bold text-slate-600">Ward:</span>
                        <span className="font-semibold text-slate-900">{session.ward}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="font-bold text-slate-600">Department:</span>
                        <span className="font-semibold text-slate-900">{session.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-600">Country:</span>
                        <span className="font-semibold text-slate-900">{session.country || "Egypt"}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="font-bold text-slate-600">Period Number*:</span>
                        <span className="font-black text-slate-900">{session.periodNumber}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="font-bold text-slate-600">Date:</span>
                        <span className="font-black text-slate-900">{session.date}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="font-bold text-slate-600">Start/End time:</span>
                        <span className="font-semibold text-slate-900">{session.startTime} / {session.endTime}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="font-bold text-slate-600">Session duration (mm):</span>
                        <span className="font-bold text-slate-900">{session.sessionDuration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-600">Observer (initials/name):</span>
                        <span className="font-black text-slate-900">{session.observer}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4 Column Observation Form Table */}
                {session && (
                  <div className="border border-slate-400 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-4 divide-x divide-slate-300">
                      {session.columns.map((col) => (
                        <div key={col.id} className="flex flex-col">
                          
                          {/* Column Header */}
                          <div className="bg-slate-100 p-2 text-center border-b border-slate-300 text-[10px] space-y-0.5">
                            <div className="font-bold text-slate-700">Prof.cat: <span className="text-slate-900 font-black">{col.profCatName}</span></div>
                            <div className="font-bold text-slate-600">Code: <span className="font-mono font-black text-slate-900">{col.profCatCode}</span></div>
                            <div className="font-bold text-slate-600">N°: <span className="font-black text-slate-900">{col.workersCount}</span></div>
                          </div>

                          {/* Table Subheader */}
                          <div className="grid grid-cols-12 bg-slate-200/80 text-[9px] font-black py-1 px-1 text-center border-b border-slate-300">
                            <div className="col-span-2">Opp</div>
                            <div className="col-span-6">Indication</div>
                            <div className="col-span-4">HH Action</div>
                          </div>

                          {/* 8 Opportunity Rows */}
                          <div className="divide-y divide-slate-200 text-[9px]">
                            {col.opportunities.map((opp) => (
                              <div key={opp.id} className="p-1 grid grid-cols-12 gap-0.5 items-center">
                                <div className="col-span-2 font-bold text-center font-mono">
                                  {opp.oppNumber}
                                </div>
                                <div className="col-span-6 space-y-0.5 font-mono text-[8.5px]">
                                  {["bef_pat", "bef_asept", "aft_bf", "aft_pat", "aft_surr"].map((k) => {
                                    const isSet = opp.indications.includes(k as any);
                                    const codeMap: Record<string, string> = {
                                      bef_pat: "bef-pat.",
                                      bef_asept: "bef-asept.",
                                      aft_bf: "aft-b.f.",
                                      aft_pat: "aft-pat.",
                                      aft_surr: "aft.p.surr.",
                                    };
                                    return (
                                      <div key={k} className="flex items-center gap-1">
                                        <span className={`w-2.5 h-2.5 border text-center leading-none text-[8px] font-bold ${isSet ? "bg-black text-white border-black" : "border-slate-400"}`}>
                                          {isSet ? "✓" : ""}
                                        </span>
                                        <span className={isSet ? "font-bold text-black" : "text-slate-500"}>
                                          {codeMap[k]}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="col-span-4 space-y-0.5 text-[8.5px] font-mono">
                                  <div className="flex items-center gap-1">
                                    <span className={`w-2.5 h-2.5 border text-center leading-none text-[8px] font-bold ${opp.action === "HR" ? "bg-black text-white border-black" : "border-slate-400"}`}>
                                      {opp.action === "HR" ? "✓" : ""}
                                    </span>
                                    <span>HR</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className={`w-2.5 h-2.5 border text-center leading-none text-[8px] font-bold ${opp.action === "HW" ? "bg-black text-white border-black" : "border-slate-400"}`}>
                                      {opp.action === "HW" ? "✓" : ""}
                                    </span>
                                    <span>HW</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className={`w-2.5 h-2.5 rounded-full border text-center leading-none text-[8px] font-bold ${opp.action === "missed" ? "bg-black text-white border-black" : "border-slate-400"}`}>
                                      {opp.action === "missed" ? "✓" : ""}
                                    </span>
                                    <span>missed</span>
                                  </div>
                                  {opp.gloves && (
                                    <div className="flex items-center gap-1 text-purple-800 font-bold">
                                      <span className="w-2.5 h-2.5 rounded-full bg-purple-700 text-white text-[8px] text-center leading-none">✓</span>
                                      <span>gloves</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Notes */}
                <div className="text-[9px] text-slate-500 pt-2 border-t border-slate-200 space-y-0.5">
                  <p>* To be completed by the data manager.</p>
                  <p>** Optional, to be used if appropriate, according to the local needs and regulations.</p>
                  <p className="font-semibold pt-1">
                    All reasonable precautions have been taken by the World Health Organization to verify the information contained in this document. Revised August 2009.
                  </p>
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* DOCUMENT 2: BASIC COMPLIANCE CALCULATION (Single Sheet)   */}
            {/* ========================================================= */}
            {docType === "basic-calc" && (
              <div className="space-y-4">
                
                {/* Official WHO Header Banner */}
                <div className="bg-[#E65100] text-white p-4 rounded-t-lg flex items-center justify-between border-b-4 border-[#BF360C]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#E65100] font-black text-xs text-center leading-tight shadow-sm">
                      WHO
                    </div>
                    <div>
                      <h1 className="text-base font-black tracking-tight leading-snug">
                        World Health Organization
                      </h1>
                      <p className="text-[11px] font-semibold opacity-90">
                        Patient Safety • A World Alliance for Safer Health Care
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-sm font-black tracking-wider uppercase">
                      SAVE LIVES
                    </h2>
                    <p className="text-xs font-bold text-amber-200">
                      Clean Your Hands
                    </p>
                  </div>
                </div>

                <div className="text-center py-1 border-b border-slate-300">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-wide">
                    Observation Form – Basic Compliance Calculation
                  </h2>
                </div>

                {/* Header Information */}
                <div className="grid grid-cols-3 gap-4 text-xs font-bold border border-slate-300 p-2.5 rounded-lg bg-slate-50">
                  <div>Facility: <span className="font-black text-slate-900">{basicCalcData.facility}</span></div>
                  <div>Period: <span className="font-black text-slate-900">{basicCalcData.period}</span></div>
                  <div>Setting: <span className="font-black text-slate-900">{basicCalcData.setting}</span></div>
                </div>

                {/* Calculation Matrix Table matching Page 3 */}
                <div className="border-2 border-slate-400 rounded-lg overflow-x-auto">
                  <table className="w-full text-center text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-amber-100/70 border-b border-slate-400 font-black">
                        <th rowSpan={2} className="border-r border-slate-300 p-1.5 w-16">
                          Session N°
                        </th>
                        <th colSpan={3} className="border-r border-slate-300 p-1.5">
                          Prof.cat 1 (Nurse/Midwife)
                        </th>
                        <th colSpan={3} className="border-r border-slate-300 p-1.5">
                          Prof.cat 2 (Auxiliary)
                        </th>
                        <th colSpan={3} className="border-r border-slate-300 p-1.5">
                          Prof.cat 3 (Medical Doctor)
                        </th>
                        <th colSpan={3} className="border-r border-slate-300 p-1.5">
                          Prof.cat 4 (Other HCW)
                        </th>
                        <th colSpan={3} className="p-1.5 bg-amber-200/70">
                          Total per session
                        </th>
                      </tr>
                      <tr className="bg-slate-100 border-b border-slate-400 text-[9px] font-bold">
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

                        <th className="border-r border-slate-300 p-1 bg-amber-100">Opp (n)</th>
                        <th className="border-r border-slate-300 p-1 bg-amber-100">HW (n)</th>
                        <th className="p-1 bg-amber-100">HR (n)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 font-mono text-[9.5px]">
                      {basicCalcData.sessions.map((row) => (
                        <tr key={row.sessionNumber} className="hover:bg-slate-50">
                          <td className="border-r border-slate-300 font-bold p-1 bg-slate-50">
                            {row.sessionNumber}
                          </td>
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

                          <td className="border-r border-slate-200 p-1 font-bold bg-amber-50/50">{row.total.oppCount}</td>
                          <td className="border-r border-slate-200 p-1 font-bold bg-amber-50/50">{row.total.hwCount}</td>
                          <td className="p-1 font-bold bg-amber-50/50">{row.total.hrCount}</td>
                        </tr>
                      ))}

                      {/* Total Calculation Row */}
                      <tr className="bg-amber-100 font-bold border-t-2 border-slate-500 text-[10px]">
                        <td className="border-r border-slate-300 p-2 font-black text-slate-900">
                          Total Calculation
                        </td>
                        <td colSpan={3} className="border-r border-slate-300 p-2 text-left px-3">
                          <div>Act (n) = {basicCalcData.totalNurse.actCount}</div>
                          <div>Opp (n) = {basicCalcData.totalNurse.oppCount}</div>
                        </td>
                        <td colSpan={3} className="border-r border-slate-300 p-2 text-left px-3">
                          <div>Act (n) = {basicCalcData.totalAuxiliary.actCount}</div>
                          <div>Opp (n) = {basicCalcData.totalAuxiliary.oppCount}</div>
                        </td>
                        <td colSpan={3} className="border-r border-slate-300 p-2 text-left px-3">
                          <div>Act (n) = {basicCalcData.totalDoctor.actCount}</div>
                          <div>Opp (n) = {basicCalcData.totalDoctor.oppCount}</div>
                        </td>
                        <td colSpan={3} className="border-r border-slate-300 p-2 text-left px-3">
                          <div>Act (n) = {basicCalcData.totalOther.actCount}</div>
                          <div>Opp (n) = {basicCalcData.totalOther.oppCount}</div>
                        </td>
                        <td colSpan={3} className="p-2 text-left px-3 bg-amber-200 font-black">
                          <div>Act (n) = {basicCalcData.grandTotal.actCount}</div>
                          <div>Opp (n) = {basicCalcData.grandTotal.oppCount}</div>
                        </td>
                      </tr>

                      {/* Compliance Row */}
                      <tr className="bg-orange-50 font-black border-t border-slate-300 text-xs">
                        <td className="border-r border-slate-300 p-2 text-orange-950 font-black">
                          Compliance (%)
                        </td>
                        <td colSpan={3} className="border-r border-slate-300 p-2 text-emerald-800 text-sm">
                          %{basicCalcData.totalNurse.complianceRate}
                        </td>
                        <td colSpan={3} className="border-r border-slate-300 p-2 text-emerald-800 text-sm">
                          %{basicCalcData.totalAuxiliary.complianceRate}
                        </td>
                        <td colSpan={3} className="border-r border-slate-300 p-2 text-emerald-800 text-sm">
                          %{basicCalcData.totalDoctor.complianceRate}
                        </td>
                        <td colSpan={3} className="border-r border-slate-300 p-2 text-emerald-800 text-sm">
                          %{basicCalcData.totalOther.complianceRate}
                        </td>
                        <td colSpan={3} className="p-2 bg-orange-100 text-emerald-800 text-base font-black">
                          %{basicCalcData.overallComplianceRate}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* WHO Official Formula Callout */}
                <div className="border-2 border-slate-400 p-3 rounded-lg flex items-center justify-center gap-4 bg-slate-50 font-bold text-xs">
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
                <div className="bg-[#E65100] text-white p-4 rounded-t-lg flex items-center justify-between border-b-4 border-[#BF360C]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#E65100] font-black text-xs text-center leading-tight shadow-sm">
                      WHO
                    </div>
                    <div>
                      <h1 className="text-base font-black tracking-tight leading-snug">
                        World Health Organization
                      </h1>
                      <p className="text-[11px] font-semibold opacity-90">
                        Patient Safety • A World Alliance for Safer Health Care
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-sm font-black tracking-wider uppercase">
                      SAVE LIVES
                    </h2>
                    <p className="text-xs font-bold text-amber-200">
                      Clean Your Hands
                    </p>
                  </div>
                </div>

                <div className="text-center py-1 border-b border-slate-300">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-wide">
                    Observation Form – Optional Calculation Form
                  </h2>
                  <p className="text-xs text-slate-600 font-bold">
                    (Indication-related compliance with hand hygiene / 5 Moments)
                  </p>
                </div>

                {/* Header Information */}
                <div className="grid grid-cols-3 gap-4 text-xs font-bold border border-slate-300 p-2.5 rounded-lg bg-slate-50">
                  <div>Facility: <span className="font-black text-slate-900">{indicationCalcData.facility}</span></div>
                  <div>Period: <span className="font-black text-slate-900">{indicationCalcData.period}</span></div>
                  <div>Setting: <span className="font-black text-slate-900">{indicationCalcData.setting}</span></div>
                </div>

                {/* Calculation Matrix Table matching Page 4 */}
                <div className="border-2 border-slate-400 rounded-lg overflow-x-auto">
                  <table className="w-full text-center text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-amber-100/70 border-b border-slate-400 font-black">
                        <th rowSpan={2} className="border-r border-slate-300 p-1.5 w-16">
                          Session N°
                        </th>
                        <th colSpan={3} className="border-r border-slate-300 p-1.5">
                          Before touching a patient (1)
                        </th>
                        <th colSpan={3} className="border-r border-slate-300 p-1.5">
                          Before clean/aseptic (2)
                        </th>
                        <th colSpan={3} className="border-r border-slate-300 p-1.5">
                          After body fluid risk (3)
                        </th>
                        <th colSpan={3} className="border-r border-slate-300 p-1.5">
                          After touching a patient (4)
                        </th>
                        <th colSpan={3} className="p-1.5">
                          After touching surroundings (5)
                        </th>
                      </tr>
                      <tr className="bg-slate-100 border-b border-slate-400 text-[9px] font-bold">
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
                    <tbody className="divide-y divide-slate-300 font-mono text-[9.5px]">
                      {indicationCalcData.sessions.map((row) => (
                        <tr key={row.sessionNumber} className="hover:bg-slate-50">
                          <td className="border-r border-slate-300 font-bold p-1 bg-slate-50">
                            {row.sessionNumber}
                          </td>
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
                      <tr className="bg-amber-100 font-bold border-t-2 border-slate-500 text-[10px]">
                        <td className="border-r border-slate-300 p-2 font-black text-slate-900">
                          Total Calculation
                        </td>
                        <td colSpan={3} className="border-r border-slate-300 p-2 text-left px-2">
                          <div>Act = {indicationCalcData.totalBefPat.actCount} | Indic = {indicationCalcData.totalBefPat.indicCount}</div>
                        </td>
                        <td colSpan={3} className="border-r border-slate-300 p-2 text-left px-2">
                          <div>Act = {indicationCalcData.totalBefAsept.actCount} | Indic = {indicationCalcData.totalBefAsept.indicCount}</div>
                        </td>
                        <td colSpan={3} className="border-r border-slate-300 p-2 text-left px-2">
                          <div>Act = {indicationCalcData.totalAftBf.actCount} | Indic = {indicationCalcData.totalAftBf.indicCount}</div>
                        </td>
                        <td colSpan={3} className="border-r border-slate-300 p-2 text-left px-2">
                          <div>Act = {indicationCalcData.totalAftPat.actCount} | Indic = {indicationCalcData.totalAftPat.indicCount}</div>
                        </td>
                        <td colSpan={3} className="p-2 text-left px-2">
                          <div>Act = {indicationCalcData.totalAftSurr.actCount} | Indic = {indicationCalcData.totalAftSurr.indicCount}</div>
                        </td>
                      </tr>

                      {/* Ratio act/indic Row */}
                      <tr className="bg-orange-50 font-black border-t border-slate-300 text-xs">
                        <td className="border-r border-slate-300 p-2 text-orange-950 font-black">
                          Ratio act / indic (%)
                        </td>
                        <td colSpan={3} className="border-r border-slate-300 p-2 text-blue-900 text-sm">
                          %{indicationCalcData.totalBefPat.ratio}
                        </td>
                        <td colSpan={3} className="border-r border-slate-300 p-2 text-blue-900 text-sm">
                          %{indicationCalcData.totalBefAsept.ratio}
                        </td>
                        <td colSpan={3} className="border-r border-slate-300 p-2 text-blue-900 text-sm">
                          %{indicationCalcData.totalAftBf.ratio}
                        </td>
                        <td colSpan={3} className="border-r border-slate-300 p-2 text-blue-900 text-sm">
                          %{indicationCalcData.totalAftPat.ratio}
                        </td>
                        <td colSpan={3} className="p-2 text-blue-900 text-sm">
                          %{indicationCalcData.totalAftSurr.ratio}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-[10px] space-y-1 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="font-semibold leading-relaxed">
                    *<strong>Note:</strong> This calculation gives an overall idea of health-care worker’s behaviour towards each type of indication.
                  </p>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
