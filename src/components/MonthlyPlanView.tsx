import React, { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  PlusCircle,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Upload,
  Download,
  Edit3,
  RotateCcw,
  Building2,
  Layers,
  FileCheck,
  Check,
  FileCheck2,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { MonthlyThemeTemplate, CenterSettings } from "../types";
import { DEFAULT_MONTHLY_TEMPLATES } from "../data/monthlyTemplates";
import { MonthlyTemplatesUploadModal } from "./MonthlyTemplatesUploadModal";
import { MonthlyTemplateEditModal } from "./MonthlyTemplateEditModal";
import {
  exportMonthlyPlanToDocx,
  exportBlankMeetingTemplateToDocx,
  exportSingleMonthTemplateToDocx,
} from "../utils/docxExport";

interface MonthlyPlanViewProps {
  monthlyTemplates: MonthlyThemeTemplate[];
  onUpdateMonthlyTemplates: (templates: MonthlyThemeTemplate[], planName?: string) => void;
  onCreateMeetingFromMonth: (monthKey: string) => void;
  centerSettings: CenterSettings;
}

export const MonthlyPlanView: React.FC<MonthlyPlanViewProps> = ({
  monthlyTemplates,
  onUpdateMonthlyTemplates,
  onCreateMeetingFromMonth,
  centerSettings,
}) => {
  const [expandedKey, setExpandedKey] = useState<string>("month-1");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MonthlyThemeTemplate | null>(null);
  const [bannerAlert, setBannerAlert] = useState<string>("");
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const toggleExpand = (key: string) => {
    setExpandedKey(expandedKey === key ? "" : key);
  };

  const handleOpenEdit = (tmpl: MonthlyThemeTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTemplate(tmpl);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedTemplate = (updated: MonthlyThemeTemplate) => {
    const updatedList = monthlyTemplates.map((t) => (t.key === updated.key ? updated : t));
    onUpdateMonthlyTemplates(updatedList);
    setBannerAlert(`تم حفظ تعديلات قالب "${updated.monthName}" بنجاح!`);
    setTimeout(() => setBannerAlert(""), 4000);
  };

  const handleResetToDefault = () => {
    if (
      window.confirm(
        "هل أنت متأكد من استعادة القوالب الافتراضية القياسية (12 شهراً لمركز جراحات اليوم الواحد والعيون)؟"
      )
    ) {
      onUpdateMonthlyTemplates(DEFAULT_MONTHLY_TEMPLATES, "القوالب القياسية الافتراضية");
      setBannerAlert("تمت استعادة قوالب الـ 12 شهراً القياسية بنجاح.");
      setTimeout(() => setBannerAlert(""), 4000);
    }
  };

  const handleExportPlanDocx = async () => {
    try {
      setIsExportingDocx(true);
      await exportMonthlyPlanToDocx(monthlyTemplates, centerSettings);
      setBannerAlert("تم تجهيز وتنزيل الخطة السنوية الشاملة بصيغة Word (.docx) منسقة بنجاح!");
      setTimeout(() => setBannerAlert(""), 5000);
    } catch (err) {
      console.error("Error exporting plan to docx:", err);
      alert("حدث خطأ أثناء تصدير ملف Word، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportBlankMeetingDocx = async () => {
    try {
      setIsExportingDocx(true);
      await exportBlankMeetingTemplateToDocx(centerSettings);
      setBannerAlert("تم تنزيل نموذج محضر الاجتماع الفارغ بصيغة Word (.docx) المنسقة بنجاح!");
      setTimeout(() => setBannerAlert(""), 5000);
    } catch (err) {
      console.error("Error exporting blank meeting to docx:", err);
      alert("حدث خطأ أثناء تصدير ملف Word، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportSingleMonthDocx = async (tmpl: MonthlyThemeTemplate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setIsExportingDocx(true);
      await exportSingleMonthTemplateToDocx(tmpl, centerSettings);
      setBannerAlert(`تم تنزيل محضر اجتماع (${tmpl.monthName}) بصيغة Word (.docx) بنجاح!`);
      setTimeout(() => setBannerAlert(""), 5000);
    } catch (err) {
      console.error("Error exporting single month docx:", err);
      alert("حدث خطأ أثناء تصدير ملف Word");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportJson = () => {
    const exportData = {
      templateType: "monthly_meeting_templates",
      version: "2.0",
      exportedAt: new Date().toISOString(),
      centerName: centerSettings.centerName || "Medical Center",
      departmentTitle: centerSettings.departmentTitle || "لجنة مكافحة العدوى",
      monthlyTemplates: monthlyTemplates,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (centerSettings.centerName || "Center").replace(/\s+/g, "_");
    a.download = `قوالب_الاجتماعات_الشهرية_الـ12_${safeName}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setBannerAlert("تم تصدير ملف البيانات الرقمية (JSON) لنقل القوالب للأجهزة والمراكز الأخرى.");
    setTimeout(() => setBannerAlert(""), 5000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Notifications */}
      {bannerAlert && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-800 flex items-center justify-between font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{bannerAlert}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerAlert("")}
            className="text-emerald-700 hover:text-emerald-950 text-xs underline"
          >
            إخفاء
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 text-slate-900 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <span>الخطة السنوية المتكاملة لمكافحة العدوى ({centerSettings.centerName || "المركز الحالي"})</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              دليل وقوالب الاجتماعات الشهرية (12 شهراً معتمداً)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              خطة سنوية لتغطية معايير مكافحة العدوى مع إمكانية رفع واستيراد قوالب لأي مركز طبي آخر، تعديل بنود جدول الأعمال والمؤشرات، وتصدير الخطة كملف رقمي موحد.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-50 rounded-xl p-3.5 px-5 text-center border border-slate-200 shadow-2xs">
              <span className="block text-2xl sm:text-3xl font-bold text-blue-600">
                {monthlyTemplates.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">قوالب شهرية</span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Action: Export Full Plan to Formatted Word */}
            <button
              type="button"
              onClick={handleExportPlanDocx}
              disabled={isExportingDocx}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="تصدير الخطة السنوية بالكامل (12 شهراً) في ملف Word منسق جاهز للطباعة"
            >
              <FileText className="w-4 h-4" />
              <span>{isExportingDocx ? "جاري التصدير..." : "تصدير الخطة السنوية (Word .docx)"}</span>
            </button>

            {/* Export Blank Meeting Minutes Template in Word */}
            <button
              type="button"
              onClick={handleExportBlankMeetingDocx}
              disabled={isExportingDocx}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer disabled:opacity-50"
              title="تنزيل نموذج محضر اجتماع فارغ منسق Word (.docx) للكتابة والطباعة"
            >
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>نموذج محضر فارغ (.docx)</span>
            </button>

            {/* Import / Upload Templates */}
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>رفع / استيراد قوالب</span>
            </button>

            {/* Export Data Bundle (JSON) */}
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
              title="تصدير حزمة بيانات رقمية (JSON) لنقلها واستيرادها في جهاز أو مركز آخر (لا تفتح في Word)"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>نقل البيانات لمركز آخر (.json)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="استعادة القوالب الافتراضية"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة الافتراضي</span>
            </button>
          </div>
        </div>
      </div>

      {/* 12 Months Grid & Accordions */}
      <div className="space-y-3.5">
        {monthlyTemplates.map((tmpl) => {
          const isExpanded = expandedKey === tmpl.key;

          return (
            <div
              key={tmpl.key}
              className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                isExpanded
                  ? "border-blue-500 ring-2 ring-blue-500/10"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Card Header */}
              <div
                onClick={() => toggleExpand(tmpl.key)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none gap-3"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm sm:text-base flex items-center justify-center border border-blue-200 shrink-0 shadow-2xs">
                    {tmpl.monthIndex}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {tmpl.monthName}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {tmpl.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {tmpl.themeTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Export this month as Word .docx */}
                  <button
                    type="button"
                    onClick={(e) => handleExportSingleMonthDocx(tmpl, e)}
                    disabled={isExportingDocx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                    title="تنزيل محضر هذا الشهر بصيغة Word (.docx) منسق"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden sm:inline">تصدير Word</span>
                  </button>

                  {/* Edit Template Button */}
                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(tmpl, e)}
                    className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors cursor-pointer"
                    title="تعديل وتخصيص قالب هذا الشهر"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Create Meeting from this Month */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateMeetingFromMonth(tmpl.key);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">إنشاء محضر لهذا الشهر</span>
                    <span className="sm:hidden">إنشاء</span>
                  </button>

                  <div className="p-1 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Card Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-5 sm:px-6 sm:pb-6 border-t border-slate-100 pt-4 space-y-4 bg-slate-50/40">
                  
                  {/* Summary */}
                  <div className="p-3 bg-blue-50/70 rounded-xl text-xs text-slate-800 leading-relaxed border border-blue-100 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-blue-900 ml-1">الهدف والمحور الاستراتيجي:</span>
                      {tmpl.focusSummary}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Agenda items */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>بنود جدول الأعمال المقترحة ({tmpl.agenda.length})</span>
                        </h4>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                          البند الأول إلزامي
                        </span>
                      </div>

                      <ul className="space-y-1.5 text-xs pr-1">
                        {tmpl.agenda.map((a, i) => (
                          <li
                            key={i}
                            className={`p-1.5 rounded-lg flex items-start gap-2 ${
                              i === 0
                                ? "bg-emerald-50/80 border border-emerald-200 text-emerald-950 font-bold"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full bg-slate-200/80 text-[10px] text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="flex-1">{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* KPIs & Sample Decisions */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>مؤشرات الأداء المقاسة (KPIs)</span>
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {tmpl.defaultKpis.map((k, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                            >
                              {k.name}: <strong className="text-blue-700">{k.value}</strong>
                              {k.target && <span className="text-slate-400 text-[10px] mr-1">(المستهدف: {k.target})</span>}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                          <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>نماذج القرارات والتوصيات:</span>
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {tmpl.sampleDecisions.map((d, i) => (
                            <li key={i} className="border-r-2 border-blue-500 pr-2 py-1 bg-slate-50/70 rounded-l-lg">
                              <span className="font-bold text-slate-800">{d.topic}</span>
                              <div className="text-[11px] text-slate-600 mt-0.5">
                                ← {d.decision}
                                <span className="text-slate-400 mr-2">({d.responsible} - {d.duration})</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>

                  {/* Month Card Footer Actions */}
                  <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>قالب معتمد لشهر {tmpl.monthName} جاهز للطباعة والتوثيق</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleExportSingleMonthDocx(tmpl)}
                        disabled={isExportingDocx}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>تصدير محضر ({tmpl.monthName}) بصيغة Word (.docx)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onCreateMeetingFromMonth(tmpl.key)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition-colors cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>بدء تعبئة المحضر</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      <MonthlyTemplatesUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        monthlyTemplates={monthlyTemplates}
        centerSettings={centerSettings}
        onApplyMonthlyTemplates={(templates, planName) => {
          onUpdateMonthlyTemplates(templates, planName);
          setBannerAlert(
            planName ? `تم تطبيق "${planName}" بنجاح!` : "تم استيراد واعتماد القوالب الشهرية بنجاح!"
          );
          setTimeout(() => setBannerAlert(""), 4000);
        }}
      />

      {/* Edit Modal */}
      <MonthlyTemplateEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTemplate(null);
        }}
        template={editingTemplate}
        onSaveTemplate={handleSaveEditedTemplate}
      />

    </div>
  );
};
