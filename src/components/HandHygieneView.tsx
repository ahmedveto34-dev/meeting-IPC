import React, { useState, useEffect } from "react";
import {
  WHOObservationSession,
  WHOBasicComplianceSheetData,
  WHOIndicationComplianceSheetData,
  CenterSettings,
  WHO_FIVE_MOMENTS,
  WHO_PROF_CATEGORIES,
} from "../types";
import {
  calculateWHOBasicCompliance,
  calculateWHOIndicationCompliance,
} from "../utils/whoHandHygieneCalculator";
import { HandHygieneSessionFormModal } from "./HandHygieneSessionFormModal";
import { HandHygienePrintableModal } from "./HandHygienePrintableModal";
import { HandHygieneStatsGeneratorModal } from "./HandHygieneStatsGeneratorModal";
import {
  exportHandHygieneStatisticsToWord,
  exportSingleHandHygieneSessionToWord,
} from "../utils/handHygieneDocxExport";
import { exportHandHygieneStatisticsToFullHtml } from "../utils/handHygieneHtmlExport";
import {
  PlusCircle,
  Sparkles,
  Printer,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  Trash2,
  Edit,
  Copy,
  Layers,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Building2,
  RotateCcw,
  Eye,
  TrendingUp,
  ShieldCheck,
  Award,
  Calendar,
  CloudUpload,
  Loader2,
  Check,
  FileDown,
  Settings2,
  Sliders,
  Save,
  Download,
  Calculator,
  Percent,
} from "lucide-react";

interface HandHygieneViewProps {
  sessions: WHOObservationSession[];
  centerSettings: CenterSettings;
  onSaveSession: (session: WHOObservationSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onSetAllSessions?: (sessions: WHOObservationSession[]) => void;
  onRestoreDefaultSessions?: () => void;
  onSyncAllToGoogleSheets?: () => Promise<{ success: boolean; message?: string; error?: string }>;
  onSyncSessionToGoogleSheets?: (session: WHOObservationSession) => Promise<void>;
}

const STORAGE_KEY_STATS_CONFIG = "inf_ctrl_who_hh_config_v1";

interface CustomStatsConfig {
  periodTitle: string;
  targetCompliance: number;
  notes: string;
}

export const HandHygieneView: React.FC<HandHygieneViewProps> = ({
  sessions,
  centerSettings,
  onSaveSession,
  onDeleteSession,
  onSetAllSessions,
  onRestoreDefaultSessions,
  onSyncAllToGoogleSheets,
  onSyncSessionToGoogleSheets,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"sessions" | "basic-calc" | "indication-calc" | "charts">("sessions");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");

  // Statistics Custom Settings (Persisted to localStorage)
  const [statsConfig, setStatsConfig] = useState<CustomStatsConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      periodTitle: "الفترة الحالية (2026)",
      targetCompliance: 85,
      notes: "الالتزام المستمر بتطبيق لحظات نظافة الأيدي الخمسة لمنظمة الصحة العالمية لتقليل العدوى المكتسبة",
    };
  });

  const [isEditingStatsConfig, setIsEditingStatsConfig] = useState(false);
  const [tempPeriodTitle, setTempPeriodTitle] = useState(statsConfig.periodTitle);
  const [tempTargetCompliance, setTempTargetCompliance] = useState(statsConfig.targetCompliance);
  const [tempNotes, setTempNotes] = useState(statsConfig.notes);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<WHOObservationSession | null>(null);

  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedSessionForPrint, setSelectedSessionForPrint] = useState<WHOObservationSession | null>(null);
  const [printDocType, setPrintDocType] = useState<"all-pages" | "session-form" | "basic-calc" | "indication-calc">("all-pages");

  const [syncFeedback, setSyncFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [exportingWordSessionId, setExportingWordSessionId] = useState<string | null>(null);

  // Run Calculations with statsConfig
  const basicCalcData: WHOBasicComplianceSheetData = calculateWHOBasicCompliance(
    sessions,
    centerSettings.centerName,
    statsConfig.periodTitle,
    centerSettings.departmentTitle
  );

  const indicationCalcData: WHOIndicationComplianceSheetData = calculateWHOIndicationCompliance(
    sessions,
    centerSettings.centerName,
    statsConfig.periodTitle,
    centerSettings.departmentTitle
  );

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      (s.ward || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.department || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.observer || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(s.sessionNumber).includes(searchQuery);

    const matchesDept = selectedDeptFilter === "all" || s.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  // Handlers
  const handleSaveStatsConfig = () => {
    const newConfig: CustomStatsConfig = {
      periodTitle: tempPeriodTitle.trim() || "الفترة الحالية (2026)",
      targetCompliance: Number(tempTargetCompliance) || 85,
      notes: tempNotes.trim(),
    };
    setStatsConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY_STATS_CONFIG, JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }
    setIsEditingStatsConfig(false);
    setSyncFeedback({
      type: "success",
      message: "تم حفظ وتثبيت معايير الإحصائية ومزامنتها تلقائياً مع Google Sheets!",
    });
    setTimeout(() => setSyncFeedback(null), 4000);

    // Auto-sync entire calculations to Google Sheets in background
    if (onSyncAllToGoogleSheets) {
      onSyncAllToGoogleSheets();
    }
  };

  const handleAddNewSession = () => {
    setEditingSession(null);
    setIsFormModalOpen(true);
  };

  const handleEditSession = (session: WHOObservationSession) => {
    setEditingSession(session);
    setIsFormModalOpen(true);
  };

  const handleDuplicateSession = (session: WHOObservationSession) => {
    const nextNum = sessions.length + 1;
    const duplicated: WHOObservationSession = {
      ...JSON.parse(JSON.stringify(session)),
      id: `who-sess-${Date.now()}`,
      sessionNumber: nextNum,
      date: new Date().toISOString().split("T")[0].replace(/-/g, "/"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveSession(duplicated);
    setSyncFeedback({
      type: "success",
      message: `تم نسخ الجلسة بنجاح كجلسة رقم (${nextNum}) مع إعادة احتساب الإحصائيات والحفظ التلقائي في Google Sheets!`,
    });
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  const handleOpenPrintModal = (session: WHOObservationSession | null, type: "all-pages" | "session-form" | "basic-calc" | "indication-calc") => {
    setSelectedSessionForPrint(session);
    setPrintDocType(type);
    setIsPrintModalOpen(true);
  };

  const handleExportWordStatistics = async () => {
    setIsExportingWord(true);
    try {
      await exportHandHygieneStatisticsToWord({
        sessions,
        basicCalcData,
        indicationCalcData,
        centerSettings,
        periodTitle: statsConfig.periodTitle,
        targetCompliance: statsConfig.targetCompliance,
      });
      setSyncFeedback({
        type: "success",
        message: "تم إنشاء وتنزيل التقرير الإحصائي بصيغة Microsoft Word (.docx) بنجاح!",
      });
    } catch (e) {
      console.error(e);
      setSyncFeedback({
        type: "error",
        message: "حدث خطأ أثناء إنشاء ملف Word. يرجى المحاولة مجدداً.",
      });
    } finally {
      setIsExportingWord(false);
      setTimeout(() => setSyncFeedback(null), 4500);
    }
  };

  const handleExportHtmlReport = () => {
    try {
      exportHandHygieneStatisticsToFullHtml({
        sessions,
        basicCalcData,
        indicationCalcData,
        centerSettings,
        periodTitle: statsConfig.periodTitle,
        targetCompliance: statsConfig.targetCompliance,
        customNotes: statsConfig.notes,
      });
      setSyncFeedback({
        type: "success",
        message: "تم إنشاء وتنزيل التقرير الشامل الملوّن بكافة صفحاته وتصميمه الدقيق (HTML/PDF) بنجاح!",
      });
    } catch (e) {
      console.error(e);
      setSyncFeedback({
        type: "error",
        message: "حدث خطأ أثناء تنزيل التقرير. يرجى المحاولة مجدداً.",
      });
    } finally {
      setTimeout(() => setSyncFeedback(null), 4500);
    }
  };

  const handleExportSingleSessionWord = async (session: WHOObservationSession) => {
    setExportingWordSessionId(session.id);
    try {
      await exportSingleHandHygieneSessionToWord(session, centerSettings);
      setSyncFeedback({
        type: "success",
        message: `تم تنزيل نموذج الرصد للجلسة رقم (${session.sessionNumber}) بصيغة Word بنجاح!`,
      });
    } catch (e) {
      console.error(e);
      setSyncFeedback({
        type: "error",
        message: "حدث خطأ أثناء تنزيل ملف Word للجلسة.",
      });
    } finally {
      setTimeout(() => setExportingWordSessionId(null), 500);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const handleApplyGeneratedSessions = (
    generatedSessions: WHOObservationSession[],
    newPeriodTitle: string,
    newTargetCompliance: number,
    notesText: string
  ) => {
    const newConfig: CustomStatsConfig = {
      periodTitle: newPeriodTitle || statsConfig.periodTitle,
      targetCompliance: newTargetCompliance || statsConfig.targetCompliance,
      notes: notesText || statsConfig.notes,
    };
    setStatsConfig(newConfig);
    setTempPeriodTitle(newConfig.periodTitle);
    setTempTargetCompliance(newConfig.targetCompliance);
    setTempNotes(newConfig.notes);

    try {
      localStorage.setItem(STORAGE_KEY_STATS_CONFIG, JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }

    if (onSetAllSessions) {
      onSetAllSessions(generatedSessions);
    } else {
      generatedSessions.forEach((s) => onSaveSession(s));
    }

    setSyncFeedback({
      type: "success",
      message: `تم توليد الإحصائية الرياضية الدقيقة بنجاح (${generatedSessions.length} جلسة رصد) بنسبة مستهدفة %${newTargetCompliance} مع الحفظ التلقائي في Google Sheets!`,
    });
    setTimeout(() => setSyncFeedback(null), 5500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 font-['Cairo',sans-serif]">
      
      {/* Smart Stats Generator Modal */}
      {isGeneratorModalOpen && (
        <HandHygieneStatsGeneratorModal
          isOpen={isGeneratorModalOpen}
          onClose={() => setIsGeneratorModalOpen(false)}
          centerSettings={centerSettings}
          periodTitle={statsConfig.periodTitle}
          targetCompliance={statsConfig.targetCompliance}
          onApplyGeneratedSessions={handleApplyGeneratedSessions}
        />
      )}

      {/* Session Form Modal */}
      {isFormModalOpen && (
        <HandHygieneSessionFormModal
          isOpen={isFormModalOpen}
          initialSession={editingSession}
          onClose={() => setIsFormModalOpen(false)}
          onSave={(saved) => {
            onSaveSession(saved);
            setIsFormModalOpen(false);
          }}
          centerName={centerSettings.centerName}
          defaultObserver={centerSettings.infectionControlLead}
        />
      )}

      {/* Printable Modal */}
      {isPrintModalOpen && (
        <HandHygienePrintableModal
          isOpen={isPrintModalOpen}
          session={selectedSessionForPrint || (sessions.length > 0 ? sessions[0] : null)}
          allSessions={sessions}
          basicCalcData={basicCalcData}
          indicationCalcData={indicationCalcData}
          onClose={() => setIsPrintModalOpen(false)}
          defaultDocType={printDocType}
          centerSettings={centerSettings}
          periodTitle={statsConfig.periodTitle}
          targetCompliance={statsConfig.targetCompliance}
          customNotes={statsConfig.notes}
        />
      )}

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-3 ${
            syncFeedback.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-rose-50 border-rose-300 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {syncFeedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-bold">{syncFeedback.message}</span>
          </div>
          <button
            onClick={() => setSyncFeedback(null)}
            className="text-xs font-bold px-2 py-1 rounded-md bg-white/60 hover:bg-white cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Hero Header Banner with WHO Theme & Export/Edit Actions */}
      <div className="relative rounded-3xl p-6 sm:p-7 text-white shadow-xl bg-gradient-to-r from-orange-900 via-amber-950 to-slate-950 border border-amber-500/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="bg-[#E65100] text-white px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-sm">
              SAVE LIVES: Clean Your Hands • WHO
            </span>
            <span className="text-xs font-bold text-amber-200 bg-black/30 px-3 py-1 rounded-full border border-amber-400/30">
              معايير منظمة الصحة العالمية الرسمية
            </span>
            <span className="text-xs font-bold text-amber-300 bg-amber-900/60 px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {statsConfig.periodTitle}
            </span>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-400/40 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
              <span>حفظ تلقائي في Google Sheets</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug">
            إحصائية ومعدلات الامتثال لنظافة وتطهير الأيدي (Hand Hygiene Compliance)
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/90 font-medium leading-relaxed">
            توثيق جلسات الرصد الميداني بدواعي الغسيل الخمسة (WHO 5 Moments)، حساب معدلات الامتثال للفئات المهنية (Page 3)، ونسب الدواعي (Page 4) مع إمكانية التعديل، الحفظ في التطبيق، وتصدير التقارير بصيغة Word (.docx) و PDF.
          </p>
        </div>

        {/* Hero Actions */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
          
          {/* Smart Stats Generator Modal Trigger Button */}
          <button
            onClick={() => setIsGeneratorModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-emerald-950/50 border border-emerald-300/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
            title="توليد إحصائية ذكية ودقيقة وفق النسبة المئوية، المؤسسة، عدد الجلسات والفرص لكل فئة جاهزة للطباعة والتصدير"
          >
            <Calculator className="w-4 h-4 text-white stroke-[2.5]" />
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>مُولّد ومُعدّ الإحصائية الذكي</span>
          </button>

          {/* Download Full Color HTML/PDF Report */}
          <button
            onClick={handleExportHtmlReport}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-black bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 border border-purple-400/30 transition-all cursor-pointer active:scale-98"
            title="تنزيل التقرير الشامل الملون بكافة الصفحات (1-5) بنفس التصميم والألوان الأصلية 100%"
          >
            <FileText className="w-4 h-4 text-purple-200" />
            <span>تحميل تقرير ملون (HTML/PDF)</span>
          </button>

          {/* Download Word Statistics Report */}
          <button
            onClick={handleExportWordStatistics}
            disabled={isExportingWord}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-black bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 border border-blue-400/30 transition-all cursor-pointer disabled:opacity-70 active:scale-98"
            title="تحميل التقرير الإحصائي الشامل بكامل جداول الامتثال بصيغة Microsoft Word (.docx)"
          >
            {isExportingWord ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <FileDown className="w-4 h-4 text-blue-200" />
            )}
            <span>تحميل الإحصائية Word (.docx)</span>
          </button>

          {/* PDF & Print Preview Button */}
          <button
            onClick={() => handleOpenPrintModal(null, "all-pages")}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-md"
            title="معاينة وطباعة التقرير الشامل (كافة الصفحات) بصيغة PDF الرسمية"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>طباعة / حفظ PDF</span>
          </button>

          {/* Edit Stats Parameters Toggle Button */}
          <button
            onClick={() => {
              setTempPeriodTitle(statsConfig.periodTitle);
              setTempTargetCompliance(statsConfig.targetCompliance);
              setTempNotes(statsConfig.notes);
              setIsEditingStatsConfig(!isEditingStatsConfig);
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-md ${
              isEditingStatsConfig
                ? "bg-amber-500 text-slate-950 border-amber-400 font-black"
                : "bg-white/10 hover:bg-white/20 text-white border-white/20"
            }`}
            title="تعديل معايير وفترة الإحصائية وحفظها في التطبيق"
          >
            <Sliders className="w-4 h-4 text-amber-300" />
            <span>تعديل معايير الإحصائية</span>
          </button>

          {/* Add New Observation Session */}
          <button
            onClick={handleAddNewSession}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 transition-all cursor-pointer shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-98"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>تسجيل جلسة رصد جديدة</span>
          </button>
        </div>
      </div>

      {/* Expandable Stats Parameters Editor Card */}
      {isEditingStatsConfig && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 rounded-3xl p-5 sm:p-7 border-2 border-amber-300 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  لوحة تعديل معايير وبيانات الإحصائية وحفظها في التطبيق
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  يمكنك تعديل مسمى الفترة الإحصائية، النسبة المستهدفة، والملاحظات وحفظها دائماً في التطبيق
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-300 self-start sm:self-auto">
              إمكانية التعديل بعد عمل الإحصائية
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                مسمى الفترة الإحصائية (Period Title)
              </label>
              <input
                type="text"
                value={tempPeriodTitle}
                onChange={(e) => setTempPeriodTitle(e.target.value)}
                placeholder="مثال: الربع الأول (Q1 2026) أو شهر مارس 2026"
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نسبة الامتثال المستهدفة (Target Compliance %)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={tempTargetCompliance}
                onChange={(e) => setTempTargetCompliance(Number(e.target.value))}
                className="w-full text-xs font-black px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                المنشأة والقسم المعتمد
              </label>
              <input
                type="text"
                disabled
                value={`${centerSettings.centerName} - ${centerSettings.departmentTitle}`}
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed shadow-2xs"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                توصيات وملاحظات فريق مكافحة العدوى على الإحصائية
              </label>
              <textarea
                rows={2}
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                placeholder="أدخل أي ملاحظات توجيهية أو خطة تحسين لمعدلات الامتثال..."
                className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-amber-300 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-2xs resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-amber-200">
            <button
              onClick={() => setIsEditingStatsConfig(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={handleSaveStatsConfig}
              className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md cursor-pointer transition-all flex items-center gap-1.5 active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وتثبيت الإحصائية في ذاكرة التطبيق</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Overview Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Compliance Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المعدل العام للامتثال (WHO)</span>
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-2xl sm:text-3xl font-black ${
              basicCalcData.overallComplianceRate >= 85
                ? "text-emerald-700"
                : basicCalcData.overallComplianceRate >= 70
                ? "text-amber-600"
                : "text-rose-600"
            }`}>
              %{basicCalcData.overallComplianceRate}
            </span>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              الهدف: ≥ %85
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            {basicCalcData.grandTotal.actCount} إجراء مطبق من إجمالي {basicCalcData.grandTotal.oppCount} فرصة
          </p>
        </div>

        {/* Metric 2: Nursing Compliance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">تمريض وقبالة (Nurse/Midwife)</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-blue-900">
              %{basicCalcData.totalNurse.complianceRate}
            </span>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              الفئة 1 (Prof.cat 1)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            {basicCalcData.totalNurse.actCount} مطبق / {basicCalcData.totalNurse.oppCount} فرصة
          </p>
        </div>

        {/* Metric 3: Medical Doctors */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الأطباء البشريين (Medical Doctors)</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-purple-900">
              %{basicCalcData.totalDoctor.complianceRate}
            </span>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              الفئة 3 (Prof.cat 3)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            {basicCalcData.totalDoctor.actCount} مطبق / {basicCalcData.totalDoctor.oppCount} فرصة
          </p>
        </div>

        {/* Metric 4: Alcohol Rub vs Water Wash */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">دلك كحولي (HR) مقابل صابون (HW)</span>
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold">
            <div>
              <span className="text-slate-500 block text-[10px]">كحول HR</span>
              <span className="text-emerald-700 text-lg font-black">{basicCalcData.grandTotal.hrCount}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500 block text-[10px]">ماء وصابون HW</span>
              <span className="text-blue-700 text-lg font-black">{basicCalcData.grandTotal.hwCount}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500 block text-[10px]">الجلسات</span>
              <span className="text-slate-900 text-lg font-black">{sessions.length}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            تفضيل الدلك الكحولي السريع لترشيد الوقت والفعالية
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveSubTab("sessions")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === "sessions"
                ? "bg-orange-600 text-white shadow-sm shadow-orange-500/25 ring-1 ring-orange-500"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>جلسات الرصد الميداني ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("basic-calc")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === "basic-calc"
                ? "bg-orange-600 text-white shadow-sm shadow-orange-500/25 ring-1 ring-orange-500"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>حساب الامتثال الأساسي (Page 3)</span>
          </button>

          <button
            onClick={() => setActiveSubTab("indication-calc")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === "indication-calc"
                ? "bg-orange-600 text-white shadow-sm shadow-orange-500/25 ring-1 ring-orange-500"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>الامتثال بدواعي الغسيل (Page 4)</span>
          </button>

          <button
            onClick={() => setActiveSubTab("charts")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === "charts"
                ? "bg-orange-600 text-white shadow-sm shadow-orange-500/25 ring-1 ring-orange-500"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>لوحة التحليلات والمقارنات</span>
          </button>
        </div>

        {/* Restore Defaults Button */}
        {onRestoreDefaultSessions && (
          <button
            type="button"
            onClick={onRestoreDefaultSessions}
            className="inline-flex items-center gap-1.5 text-xs text-orange-800 hover:text-orange-950 bg-orange-50 hover:bg-orange-100 font-bold px-3 py-1.5 rounded-xl border border-orange-200 transition-colors cursor-pointer self-start sm:self-auto"
            title="استعادة جلسات الرصد القياسية الافتراضية لمنظمة الصحة العالمية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة جلسات الرصد النموذجية (4 أقسام)</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: OBSERVATION SESSIONS LIST                                      */}
      {/* ========================================================================= */}
      {activeSubTab === "sessions" && (
        <div className="space-y-4">
          
          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
              <input
                type="text"
                placeholder="البحث في الجلسات حسب القسم، الراصد، الجناح، أو رقم الجلسة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
              >
                <option value="all">كافة الأقسام ({sessions.length})</option>
                <option value="surgery">surgery (العمليات والجراحة)</option>
                <option value="intensive care">intensive care (العناية المركزة)</option>
                <option value="ambulatory care">ambulatory care (العيادات الخارجية)</option>
                <option value="medical">medical (الباطنة والأقسام الداخلية)</option>
                <option value="emergency unit">emergency unit (الطوارئ)</option>
              </select>
            </div>
          </div>

          {/* Sessions Grid */}
          {filteredSessions.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-slate-300 space-y-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-800">لا توجد جلسات رصد مسجلة تطابق البحث</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                قم بإنشاء جلسة رصد جديدة بنموذج منظمة الصحة العالمية، أو استعد الجلسات الافتراضية.
              </p>
              <button
                onClick={handleAddNewSession}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>تسجيل جلسة رصد جديدة</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filteredSessions.map((sess) => {
                // Calculate session compliance
                let sOpp = 0;
                let sHW = 0;
                let sHR = 0;
                sess.columns.forEach((col) => {
                  col.opportunities.forEach((opp) => {
                    if (opp.indications.length > 0 || opp.action !== "") {
                      sOpp += 1;
                      if (opp.action === "HW") sHW += 1;
                      else if (opp.action === "HR") sHR += 1;
                    }
                  });
                });
                const sAct = sHW + sHR;
                const sRate = sOpp > 0 ? Math.round((sAct / sOpp) * 1000) / 10 : 0;

                return (
                  <div
                    key={sess.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-slate-950 text-sm">
                            جلسة رصد #{sess.sessionNumber}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-200">
                            {sess.department}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                            فترة {sess.periodNumber === "1" ? "قبل التدخل (1)" : "بعد التدخل (2)"}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-700 text-xs">
                          {sess.ward || sess.service || "الجناح الطبي"}
                        </h3>
                      </div>

                      {/* Compliance Rate Badge */}
                      <div className={`px-3 py-1.5 rounded-xl text-center shrink-0 border ${
                        sRate >= 85
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : sRate >= 70
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : "bg-rose-50 text-rose-800 border-rose-300"
                      }`}>
                        <span className="text-base font-black leading-none block">%{sRate}</span>
                        <span className="text-[9px] font-bold block mt-0.5">امتثال الجلسة</span>
                      </div>
                    </div>

                    {/* Metadata Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sess.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sess.startTime} - {sess.endTime} ({sess.sessionDuration} د)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 col-span-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">الراصد: {sess.observer}</span>
                      </div>
                    </div>

                    {/* Quick Opportunities Distribution */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 font-bold">
                      <div className="text-slate-600">
                        الفرص: <span className="font-black text-slate-900">{sOpp}</span>
                      </div>
                      <div className="text-emerald-700">
                        تطهير كحولي (HR): <span className="font-black">{sHR}</span>
                      </div>
                      <div className="text-blue-700">
                        ماء وصابون (HW): <span className="font-black">{sHW}</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenPrintModal(sess, "session-form")}
                          className="inline-flex items-center gap-1 text-xs text-orange-700 hover:text-orange-900 font-bold px-2.5 py-1.5 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
                          title="معاينة وطباعة نموذج الرصد المعتمد لهذه الجلسة"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة PDF</span>
                        </button>

                        <button
                          onClick={() => handleExportSingleSessionWord(sess)}
                          disabled={exportingWordSessionId === sess.id}
                          className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-bold px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-60"
                          title="تحميل نموذج الرصد لهذه الجلسة بصيغة Microsoft Word (.docx)"
                        >
                          {exportingWordSessionId === sess.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                          ) : (
                            <FileDown className="w-3.5 h-3.5" />
                          )}
                          <span>Word (.docx)</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDuplicateSession(sess)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="نسخ الجلسة"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditSession(sess)}
                          className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="تعديل بيانات ورصد الجلسة"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من حذف جلسة الرصد رقم (${sess.sessionNumber})؟`)) {
                              onDeleteSession(sess.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="حذف الجلسة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: WHO BASIC COMPLIANCE CALCULATION (Page 3 of PDF)               */}
      {/* ========================================================================= */}
      {activeSubTab === "basic-calc" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            
            {/* Header info & Print / Sync Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Observation Form – Basic Compliance Calculation (جدول حساب الامتثال الأساسي)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  مطابق لتنسيق الصفحة رقم (3) من دليل منظمة الصحة العالمية الرسمي
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <button
                  onClick={() => setIsGeneratorModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-98"
                  title="فتح مولّد الإحصائية لتعديل النسبة والفرص والمؤسسة وإعادة الحساب"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>توليد وتعديل الإحصائية الذكية</span>
                </button>

                <button
                  onClick={handleExportHtmlReport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-98"
                  title="تنزيل التقرير الشامل الملون بكافة الصفحات بنفس التصميم والألوان الأصلية 100%"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>تحميل تقرير ملون (HTML/PDF)</span>
                </button>

                <button
                  onClick={handleExportWordStatistics}
                  disabled={isExportingWord}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-98 disabled:opacity-70"
                  title="تحميل جدول الامتثال الأساسي وإحصائية الفئات بصيغة Microsoft Word (.docx)"
                >
                  {isExportingWord ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5 text-blue-200" />
                  )}
                  <span>تحميل Word (.docx)</span>
                </button>

                <button
                  onClick={() => handleOpenPrintModal(null, "basic-calc")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black shadow-md cursor-pointer transition-all active:scale-98"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة استمارة الحساب (Page 3)</span>
                </button>
              </div>
            </div>

            {/* Matrix Table matching Page 3 */}
            <div className="border border-slate-300 rounded-xl overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-amber-100/80 border-b border-slate-300 font-black text-slate-900">
                    <th rowSpan={2} className="border-r border-slate-300 p-2.5 w-24">
                      Session N°
                    </th>
                    <th colSpan={3} className="border-r border-slate-300 p-2 bg-blue-50/70 text-blue-950">
                      Prof.cat 1 (Nurse / Midwife)
                    </th>
                    <th colSpan={3} className="border-r border-slate-300 p-2 bg-teal-50/70 text-teal-950">
                      Prof.cat 2 (Auxiliary)
                    </th>
                    <th colSpan={3} className="border-r border-slate-300 p-2 bg-purple-50/70 text-purple-950">
                      Prof.cat 3 (Medical Doctor)
                    </th>
                    <th colSpan={3} className="border-r border-slate-300 p-2 bg-indigo-50/70 text-indigo-950">
                      Prof.cat 4 (Other HCW)
                    </th>
                    <th colSpan={3} className="p-2 bg-amber-200 text-amber-950">
                      Total per session
                    </th>
                  </tr>
                  <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-700">
                    <th className="border-r border-slate-300 p-1.5">Opp</th>
                    <th className="border-r border-slate-300 p-1.5">HW</th>
                    <th className="border-r border-slate-300 p-1.5">HR</th>

                    <th className="border-r border-slate-300 p-1.5">Opp</th>
                    <th className="border-r border-slate-300 p-1.5">HW</th>
                    <th className="border-r border-slate-300 p-1.5">HR</th>

                    <th className="border-r border-slate-300 p-1.5">Opp</th>
                    <th className="border-r border-slate-300 p-1.5">HW</th>
                    <th className="border-r border-slate-300 p-1.5">HR</th>

                    <th className="border-r border-slate-300 p-1.5">Opp</th>
                    <th className="border-r border-slate-300 p-1.5">HW</th>
                    <th className="border-r border-slate-300 p-1.5">HR</th>

                    <th className="border-r border-slate-300 p-1.5 bg-amber-100">Opp</th>
                    <th className="border-r border-slate-300 p-1.5 bg-amber-100">HW</th>
                    <th className="p-1.5 bg-amber-100">HR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-xs">
                  {basicCalcData.sessions.map((row) => {
                    const originalSession = sessions.find((s) => s.sessionNumber === row.sessionNumber);
                    return (
                      <tr key={row.sessionNumber} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="border-r border-slate-300 font-bold p-2 bg-slate-50">
                          <div className="flex items-center justify-center gap-1.5">
                            <span>{row.sessionNumber}</span>
                            {originalSession && (
                              <button
                                onClick={() => handleEditSession(originalSession)}
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                title="تعديل جلسة الرصد هذه مباشرة"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        {/* Nurse */}
                        <td className="border-r border-slate-200 p-2">{row.nurse.oppCount || "-"}</td>
                        <td className="border-r border-slate-200 p-2">{row.nurse.hwCount || "-"}</td>
                        <td className="border-r border-slate-300 p-2 font-bold text-emerald-700">{row.nurse.hrCount || "-"}</td>
                        {/* Auxiliary */}
                        <td className="border-r border-slate-200 p-2">{row.auxiliary.oppCount || "-"}</td>
                        <td className="border-r border-slate-200 p-2">{row.auxiliary.hwCount || "-"}</td>
                        <td className="border-r border-slate-300 p-2 font-bold text-emerald-700">{row.auxiliary.hrCount || "-"}</td>
                        {/* Doctor */}
                        <td className="border-r border-slate-200 p-2">{row.doctor.oppCount || "-"}</td>
                        <td className="border-r border-slate-200 p-2">{row.doctor.hwCount || "-"}</td>
                        <td className="border-r border-slate-300 p-2 font-bold text-emerald-700">{row.doctor.hrCount || "-"}</td>
                        {/* Other */}
                        <td className="border-r border-slate-200 p-2">{row.other.oppCount || "-"}</td>
                        <td className="border-r border-slate-200 p-2">{row.other.hwCount || "-"}</td>
                        <td className="border-r border-slate-300 p-2 font-bold text-emerald-700">{row.other.hrCount || "-"}</td>
                        {/* Total */}
                        <td className="border-r border-slate-200 p-2 font-black bg-amber-50">{row.total.oppCount}</td>
                        <td className="border-r border-slate-200 p-2 font-bold bg-amber-50">{row.total.hwCount}</td>
                        <td className="p-2 font-bold text-emerald-800 bg-amber-50">{row.total.hrCount}</td>
                      </tr>
                    );
                  })}

                  {/* Total Calculation Row */}
                  <tr className="bg-amber-100 font-bold border-t-2 border-slate-400 text-xs">
                    <td className="border-r border-slate-300 p-3 font-black text-slate-900">
                      Total Calculation
                    </td>
                    <td colSpan={3} className="border-r border-slate-300 p-3 text-left px-4">
                      <div>Act (n) = {basicCalcData.totalNurse.actCount}</div>
                      <div>Opp (n) = {basicCalcData.totalNurse.oppCount}</div>
                    </td>
                    <td colSpan={3} className="border-r border-slate-300 p-3 text-left px-4">
                      <div>Act (n) = {basicCalcData.totalAuxiliary.actCount}</div>
                      <div>Opp (n) = {basicCalcData.totalAuxiliary.oppCount}</div>
                    </td>
                    <td colSpan={3} className="border-r border-slate-300 p-3 text-left px-4">
                      <div>Act (n) = {basicCalcData.totalDoctor.actCount}</div>
                      <div>Opp (n) = {basicCalcData.totalDoctor.oppCount}</div>
                    </td>
                    <td colSpan={3} className="border-r border-slate-300 p-3 text-left px-4">
                      <div>Act (n) = {basicCalcData.totalOther.actCount}</div>
                      <div>Opp (n) = {basicCalcData.totalOther.oppCount}</div>
                    </td>
                    <td colSpan={3} className="p-3 text-left px-4 bg-amber-200 font-black">
                      <div>Act (n) = {basicCalcData.grandTotal.actCount}</div>
                      <div>Opp (n) = {basicCalcData.grandTotal.oppCount}</div>
                    </td>
                  </tr>

                  {/* Compliance Row */}
                  <tr className="bg-orange-50 font-black border-t border-slate-300 text-sm">
                    <td className="border-r border-slate-300 p-3 text-orange-950 font-black">
                      Compliance (%)
                    </td>
                    <td colSpan={3} className="border-r border-slate-300 p-3 text-blue-900 text-base">
                      %{basicCalcData.totalNurse.complianceRate}
                    </td>
                    <td colSpan={3} className="border-r border-slate-300 p-3 text-teal-900 text-base">
                      %{basicCalcData.totalAuxiliary.complianceRate}
                    </td>
                    <td colSpan={3} className="border-r border-slate-300 p-3 text-purple-900 text-base">
                      %{basicCalcData.totalDoctor.complianceRate}
                    </td>
                    <td colSpan={3} className="border-r border-slate-300 p-3 text-indigo-900 text-base">
                      %{basicCalcData.totalOther.complianceRate}
                    </td>
                    <td colSpan={3} className="p-3 bg-orange-200 text-orange-950 text-lg font-black">
                      %{basicCalcData.overallComplianceRate}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Formula Callout */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                <span>المعادلة المعتمدة من منظمة الصحة العالمية (WHO Formula):</span>
              </div>
              <div className="font-mono bg-white px-4 py-2 rounded-xl border border-slate-300 shadow-2xs text-slate-900">
                Compliance (%) = (Actions [HW + HR] / Opportunities) × 100
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: WHO INDICATION-RELATED COMPLIANCE (Page 4 of PDF)              */}
      {/* ========================================================================= */}
      {activeSubTab === "indication-calc" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            
            {/* Header info & Print / Sync Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Observation Form – Optional Calculation Form (حساب الامتثال بدواعي الغسيل الخمسة)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  مطابق لتنسيق الصفحة رقم (4) من دليل منظمة الصحة العالمية الرسمي (WHO 5 Moments Ratio)
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <button
                  onClick={() => setIsGeneratorModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-98"
                  title="فتح مولّد الإحصائية لتعديل النسبة والفرص والمؤسسة وإعادة الحساب"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>توليد وتعديل الإحصائية الذكية</span>
                </button>

                <button
                  onClick={handleExportHtmlReport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-98"
                  title="تنزيل التقرير الشامل الملون بكافة الصفحات بنفس التصميم والألوان الأصلية 100%"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>تحميل تقرير ملون (HTML/PDF)</span>
                </button>

                <button
                  onClick={handleExportWordStatistics}
                  disabled={isExportingWord}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-98 disabled:opacity-70"
                  title="تحميل جدول دواعي الغسيل الخمسة والإحصائية الشاملة بصيغة Microsoft Word (.docx)"
                >
                  {isExportingWord ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5 text-blue-200" />
                  )}
                  <span>تحميل Word (.docx)</span>
                </button>

                <button
                  onClick={() => handleOpenPrintModal(null, "indication-calc")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black shadow-md cursor-pointer transition-all active:scale-98"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة استمارة الدواعي (Page 4)</span>
                </button>
              </div>
            </div>

            {/* Matrix Table matching Page 4 */}
            <div className="border border-slate-300 rounded-xl overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-amber-100/80 border-b border-slate-300 font-black text-slate-900">
                    <th rowSpan={2} className="border-r border-slate-300 p-2.5 w-24">
                      Session N°
                    </th>
                    <th colSpan={3} className="border-r border-slate-300 p-2 bg-blue-50/70 text-blue-950">
                      Before touching a patient (1)
                    </th>
                    <th colSpan={3} className="border-r border-slate-300 p-2 bg-teal-50/70 text-teal-950">
                      Before clean/aseptic (2)
                    </th>
                    <th colSpan={3} className="border-r border-slate-300 p-2 bg-purple-50/70 text-purple-950">
                      After body fluid risk (3)
                    </th>
                    <th colSpan={3} className="border-r border-slate-300 p-2 bg-rose-50/70 text-rose-950">
                      After touching a patient (4)
                    </th>
                    <th colSpan={3} className="p-2 bg-amber-200 text-amber-950">
                      After touching surroundings (5)
                    </th>
                  </tr>
                  <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-700">
                    <th className="border-r border-slate-300 p-1.5">Indic</th>
                    <th className="border-r border-slate-300 p-1.5">HW</th>
                    <th className="border-r border-slate-300 p-1.5">HR</th>

                    <th className="border-r border-slate-300 p-1.5">Indic</th>
                    <th className="border-r border-slate-300 p-1.5">HW</th>
                    <th className="border-r border-slate-300 p-1.5">HR</th>

                    <th className="border-r border-slate-300 p-1.5">Indic</th>
                    <th className="border-r border-slate-300 p-1.5">HW</th>
                    <th className="border-r border-slate-300 p-1.5">HR</th>

                    <th className="border-r border-slate-300 p-1.5">Indic</th>
                    <th className="border-r border-slate-300 p-1.5">HW</th>
                    <th className="border-r border-slate-300 p-1.5">HR</th>

                    <th className="border-r border-slate-300 p-1.5 bg-amber-100">Indic</th>
                    <th className="border-r border-slate-300 p-1.5 bg-amber-100">HW</th>
                    <th className="p-1.5 bg-amber-100">HR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-xs">
                  {indicationCalcData.sessions.map((row) => {
                    const originalSession = sessions.find((s) => s.sessionNumber === row.sessionNumber);
                    return (
                      <tr key={row.sessionNumber} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="border-r border-slate-300 font-bold p-2 bg-slate-50">
                          <div className="flex items-center justify-center gap-1.5">
                            <span>{row.sessionNumber}</span>
                            {originalSession && (
                              <button
                                onClick={() => handleEditSession(originalSession)}
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                title="تعديل جلسة الرصد هذه مباشرة"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        {/* Moment 1 */}
                        <td className="border-r border-slate-200 p-2">{row.befPat.indicCount || "-"}</td>
                        <td className="border-r border-slate-200 p-2">{row.befPat.hwCount || "-"}</td>
                        <td className="border-r border-slate-300 p-2 font-bold text-emerald-700">{row.befPat.hrCount || "-"}</td>
                        {/* Moment 2 */}
                        <td className="border-r border-slate-200 p-2">{row.befAsept.indicCount || "-"}</td>
                        <td className="border-r border-slate-200 p-2">{row.befAsept.hwCount || "-"}</td>
                        <td className="border-r border-slate-300 p-2 font-bold text-emerald-700">{row.befAsept.hrCount || "-"}</td>
                        {/* Moment 3 */}
                        <td className="border-r border-slate-200 p-2">{row.aftBf.indicCount || "-"}</td>
                        <td className="border-r border-slate-200 p-2">{row.aftBf.hwCount || "-"}</td>
                        <td className="border-r border-slate-300 p-2 font-bold text-emerald-700">{row.aftBf.hrCount || "-"}</td>
                        {/* Moment 4 */}
                        <td className="border-r border-slate-200 p-2">{row.aftPat.indicCount || "-"}</td>
                        <td className="border-r border-slate-200 p-2">{row.aftPat.hwCount || "-"}</td>
                        <td className="border-r border-slate-300 p-2 font-bold text-emerald-700">{row.aftPat.hrCount || "-"}</td>
                        {/* Moment 5 */}
                        <td className="border-r border-slate-200 p-2">{row.aftSurr.indicCount || "-"}</td>
                        <td className="border-r border-slate-200 p-2">{row.aftSurr.hwCount || "-"}</td>
                        <td className="p-2 font-bold text-emerald-800">{row.aftSurr.hrCount || "-"}</td>
                      </tr>
                    );
                  })}

                  {/* Total Calculation Row */}
                  <tr className="bg-amber-100 font-bold border-t-2 border-slate-400 text-xs">
                    <td className="border-r border-slate-300 p-3 font-black text-slate-900">
                      Total Calculation
                    </td>
                    <td colSpan={3} className="border-r border-slate-300 p-3 text-left px-3">
                      <div>Act (n) = {indicationCalcData.totalBefPat.actCount}</div>
                      <div>Indic1 (n) = {indicationCalcData.totalBefPat.indicCount}</div>
                    </td>
                    <td colSpan={3} className="border-r border-slate-300 p-3 text-left px-3">
                      <div>Act (n) = {indicationCalcData.totalBefAsept.actCount}</div>
                      <div>Indic2 (n) = {indicationCalcData.totalBefAsept.indicCount}</div>
                    </td>
                    <td colSpan={3} className="border-r border-slate-300 p-3 text-left px-3">
                      <div>Act (n) = {indicationCalcData.totalAftBf.actCount}</div>
                      <div>Indic3 (n) = {indicationCalcData.totalAftBf.indicCount}</div>
                    </td>
                    <td colSpan={3} className="border-r border-slate-300 p-3 text-left px-3">
                      <div>Act (n) = {indicationCalcData.totalAftPat.actCount}</div>
                      <div>Indic4 (n) = {indicationCalcData.totalAftPat.indicCount}</div>
                    </td>
                    <td colSpan={3} className="p-3 text-left px-3 bg-amber-200 font-black">
                      <div>Act (n) = {indicationCalcData.totalAftSurr.actCount}</div>
                      <div>Indic5 (n) = {indicationCalcData.totalAftSurr.indicCount}</div>
                    </td>
                  </tr>

                  {/* Ratio act/indic Row */}
                  <tr className="bg-orange-50 font-black border-t border-slate-300 text-sm">
                    <td className="border-r border-slate-300 p-3 text-orange-950 font-black">
                      Ratio act / indic*
                    </td>
                    <td colSpan={3} className="border-r border-slate-300 p-3 text-blue-900 text-base">
                      %{indicationCalcData.totalBefPat.ratio}
                    </td>
                    <td colSpan={3} className="border-r border-slate-300 p-3 text-teal-900 text-base">
                      %{indicationCalcData.totalBefAsept.ratio}
                    </td>
                    <td colSpan={3} className="border-r border-slate-300 p-3 text-purple-900 text-base">
                      %{indicationCalcData.totalAftBf.ratio}
                    </td>
                    <td colSpan={3} className="border-r border-slate-300 p-3 text-rose-900 text-base">
                      %{indicationCalcData.totalAftPat.ratio}
                    </td>
                    <td colSpan={3} className="p-3 bg-orange-200 text-orange-950 text-base font-black">
                      %{indicationCalcData.totalAftSurr.ratio}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Note Callout */}
            <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/90 text-xs text-amber-950 space-y-1 font-medium">
              <p className="font-bold">
                * ملاحظة منظمة الصحة العالمية (WHO Official Note):
              </p>
              <p className="leading-relaxed">
                هذا الحساب يمثل نسبة الإجراءات إلى الدواعي (Ratio act / indic) وليس معدل امتثال مطلق نظراً لأن المقام هو عدد الدواعي وليس الفرص المستقلة، وهو يعطي مؤشراً دقيقاً لسلوك الكادر الطبي تجاه كل مرحلة من مراحل الغسيل الخمسة.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: CHARTS & ANALYTICS DASHBOARD                                   */}
      {/* ========================================================================= */}
      {activeSubTab === "charts" && (
        <div className="space-y-6">
          
          {/* Comparison Cards: Categories & 5 Moments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Category Comparison Bar Chart Panel */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span>معدلات الامتثال حسب الفئة المهنية (Compliance by Profession)</span>
                </h3>
              </div>

              <div className="space-y-4 text-xs font-bold">
                {/* Nurses */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-700">
                    <span>1. كادر التمريض والقبالة (Nurse / Midwife)</span>
                    <span className="text-blue-700 font-black">%{basicCalcData.totalNurse.complianceRate}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, basicCalcData.totalNurse.complianceRate)}%` }}
                    />
                  </div>
                </div>

                {/* Doctors */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-700">
                    <span>3. الأطباء البشريين (Medical Doctors)</span>
                    <span className="text-purple-700 font-black">%{basicCalcData.totalDoctor.complianceRate}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, basicCalcData.totalDoctor.complianceRate)}%` }}
                    />
                  </div>
                </div>

                {/* Auxiliaries */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-700">
                    <span>2. المساعدين الصحيين (Auxiliary / Workers)</span>
                    <span className="text-teal-700 font-black">%{basicCalcData.totalAuxiliary.complianceRate}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, basicCalcData.totalAuxiliary.complianceRate)}%` }}
                    />
                  </div>
                </div>

                {/* Other HCWs */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-700">
                    <span>4. الفنيين والكوادر المعاونة (Other HCW)</span>
                    <span className="text-amber-700 font-black">%{basicCalcData.totalOther.complianceRate}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, basicCalcData.totalOther.complianceRate)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Moments Comparison Bar Chart Panel */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>نسب الامتثال بدواعي الغسيل الخمسة (The 5 Moments)</span>
                </h3>
              </div>

              <div className="space-y-3.5 text-xs font-bold">
                {/* Moment 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>1. قبل ملامسة المريض (Before touching patient)</span>
                    <span className="text-blue-700 font-black">%{indicationCalcData.totalBefPat.ratio}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, indicationCalcData.totalBefPat.ratio)}%` }}
                    />
                  </div>
                </div>

                {/* Moment 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>2. قبل إجراء نظيف/معقم (Before aseptic procedure)</span>
                    <span className="text-emerald-700 font-black">%{indicationCalcData.totalBefAsept.ratio}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, indicationCalcData.totalBefAsept.ratio)}%` }}
                    />
                  </div>
                </div>

                {/* Moment 3 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>3. بعد خطر سوائل الجسم (After body fluid risk)</span>
                    <span className="text-purple-700 font-black">%{indicationCalcData.totalAftBf.ratio}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, indicationCalcData.totalAftBf.ratio)}%` }}
                    />
                  </div>
                </div>

                {/* Moment 4 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>4. بعد ملامسة المريض (After touching patient)</span>
                    <span className="text-teal-700 font-black">%{indicationCalcData.totalAftPat.ratio}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, indicationCalcData.totalAftPat.ratio)}%` }}
                    />
                  </div>
                </div>

                {/* Moment 5 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>5. بعد ملامسة محيط المريض (After touching surroundings)</span>
                    <span className="text-orange-700 font-black">%{indicationCalcData.totalAftSurr.ratio}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, indicationCalcData.totalAftSurr.ratio)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
