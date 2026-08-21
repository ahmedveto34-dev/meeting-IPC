import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Download,
  Building2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  CalendarDays,
  ArrowRight,
  FileSpreadsheet,
  RotateCcw,
  Eye,
  Check,
} from "lucide-react";
import { MonthlyThemeTemplate, CenterSettings } from "../types";
import {
  DEFAULT_MONTHLY_TEMPLATES,
  PRESET_MONTHLY_PLANS,
  normalizeMonthlyTemplates,
  PresetMonthlyPlan,
} from "../data/monthlyTemplates";

interface MonthlyTemplatesUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyTemplates: MonthlyThemeTemplate[];
  centerSettings: CenterSettings;
  onApplyMonthlyTemplates: (templates: MonthlyThemeTemplate[], planName?: string) => void;
}

export const MonthlyTemplatesUploadModal: React.FC<MonthlyTemplatesUploadModalProps> = ({
  isOpen,
  onClose,
  monthlyTemplates,
  centerSettings,
  onApplyMonthlyTemplates,
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "presets" | "export">("upload");
  const [fileError, setFileError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [parsedTemplates, setParsedTemplates] = useState<MonthlyThemeTemplate[] | null>(null);
  const [sourceCenterName, setSourceCenterName] = useState<string>("");
  const [jsonText, setJsonText] = useState<string>("");
  const [previewMonthKey, setPreviewMonthKey] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    setSuccessMsg("");
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        parseAndSetTemplates(text);
      } catch (err: any) {
        setFileError(err.message || "حدث خطأ أثناء قراءة الملف، يرجى التأكد من اختيار ملف JSON متوافق.");
        setParsedTemplates(null);
      }
    };
    reader.readAsText(file);
  };

  // Parse Text / JSON helper
  const parseAndSetTemplates = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || (typeof parsed !== "object" && !Array.isArray(parsed))) {
        throw new Error("تنسيق الملف غير صالح، يجب أن يحتوي على كائن أو مصفوفة JSON.");
      }

      // Check if centerName exists in bundle or root
      let detectedCenter = "";
      if (parsed.centerSettings?.centerName) {
        detectedCenter = parsed.centerSettings.centerName;
      } else if (parsed.centerName) {
        detectedCenter = parsed.centerName;
      } else if (parsed.planName) {
        detectedCenter = parsed.planName;
      }

      const normalized = normalizeMonthlyTemplates(parsed);
      if (!normalized || normalized.length === 0) {
        throw new Error("لم يتم العثور على قوالب شهرية صالحة داخل الملف.");
      }

      setParsedTemplates(normalized);
      setSourceCenterName(detectedCenter);
      setPreviewMonthKey(normalized[0]?.key || "month-1");
      setSuccessMsg(`تمت قراءة وتحليل ${normalized.length} قالباً شهرياً بنجاح! يمكنك استعراضها وتأكيد التطبيق.`);
    } catch (err: any) {
      setFileError(err.message || "خطأ في قراءة صيغة JSON.");
      setParsedTemplates(null);
    }
  };

  // 2. Apply Uploaded / Parsed Templates
  const handleConfirmApply = () => {
    if (!parsedTemplates || parsedTemplates.length === 0) return;
    onApplyMonthlyTemplates(
      parsedTemplates,
      sourceCenterName ? `قالب مرفوع من ${sourceCenterName}` : undefined
    );
    setSuccessMsg("تم تطبيق واعتماد القوالب الشهرية للمركز بنجاح!");
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 1200);
  };

  // 3. Apply a Ready Preset Plan
  const handleApplyPresetPlan = (preset: PresetMonthlyPlan) => {
    if (
      window.confirm(
        `هل تريد تطبيق "${preset.name}"؟ سيتم استبدال قوالب الأشهر الـ 12 الحالية بقوالب ${preset.type}.`
      )
    ) {
      onApplyMonthlyTemplates(preset.templates, preset.name);
      setSuccessMsg(`تم تطبيق "${preset.name}" بنجاح!`);
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1200);
    }
  };

  // 4. Export Current 12-Month Plan as JSON Template
  const handleExportTemplates = () => {
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

    setSuccessMsg("تم تصدير ملف القوالب الشهرية بصيغة JSON جاهز للرفع في أي منشأة أو مركز آخر.");
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  // 5. Download Sample Blank / Schema JSON
  const handleDownloadSample = () => {
    const sampleData = {
      templateType: "monthly_meeting_templates",
      version: "2.0",
      centerName: "اسم المركز الطبي النموذجي",
      monthlyTemplates: DEFAULT_MONTHLY_TEMPLATES,
    };
    const dataStr = JSON.stringify(sampleData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "نموذج_قوالب_الاجتماعات_الشهرية_القياسي.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                رفع واستيراد قوالب الاجتماعات الشهرية للمراكز الطبية
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                رفع ملفات القوالب (JSON) الخاصة بأي مستشفى أو مركز تخصصي، أو اختيار خطة سنوية معتمدة جاهزة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-white flex gap-3 text-xs sm:text-sm font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "upload"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>رفع ملف قوالب (.json)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "presets"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>قوالب المراكز التخصصية الجاهزة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("export")}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "export"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>تصدير ومشاركة القوالب الحالية</span>
          </button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-800 flex items-center gap-2 font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {fileError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-800 flex items-center gap-2 font-bold animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: UPLOAD JSON */}
          {activeTab === "upload" && (
            <div className="space-y-5">
              
              {/* Drag and drop / File selector */}
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 sm:p-8 text-center bg-slate-50/60 hover:bg-blue-50/30 transition-all">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                  id="monthly-template-file-input"
                />
                <label
                  htmlFor="monthly-template-file-input"
                  className="flex flex-col items-center justify-center cursor-pointer space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-blue-700 hover:underline">
                      انقر لاختيار ملف قوالب الاجتماعات الشهرية (.json)
                    </span>
                    <span className="text-xs text-slate-500 block mt-1">
                      أو اسحب وأفلت الملف المصدّر من أي مركز أو مستشفى آخر هنا
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>يدعم قوالب الـ 12 شهراً، جداول الأعمال، ومؤشرات الأداء والقرارات</span>
                  </div>
                </label>
              </div>

              {/* Paste JSON directly option */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>أو قم بلصق كود JSON مباشرة:</span>
                  </label>
                  {jsonText && (
                    <button
                      type="button"
                      onClick={() => setJsonText("")}
                      className="text-[11px] text-slate-400 hover:text-slate-700"
                    >
                      مسح
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder='الصق كود JSON للقوالب هنا، مثال: { "monthlyTemplates": [ ... ] }'
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                />
                {jsonText && (
                  <button
                    type="button"
                    onClick={() => parseAndSetTemplates(jsonText)}
                    className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تحليل الكود الملصوق</span>
                  </button>
                )}
              </div>

              {/* Parsed Templates Preview Section */}
              {parsedTemplates && parsedTemplates.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 animate-in fade-in">
                  
                  {/* Summary Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          معاينة القوالب المرفوعة ({parsedTemplates.length} شهراً)
                        </h3>
                      </div>
                      {sourceCenterName && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          المنشأة المصدر: <strong>{sourceCenterName}</strong>
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmApply}
                      className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تأكيد واعتماد هذه القوالب الشهرية للمركز</span>
                    </button>
                  </div>

                  {/* Month Buttons Selector */}
                  <div className="flex flex-wrap gap-1.5">
                    {parsedTemplates.map((tmpl) => (
                      <button
                        key={tmpl.key}
                        type="button"
                        onClick={() => setPreviewMonthKey(tmpl.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          previewMonthKey === tmpl.key
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        شهر {tmpl.monthIndex}
                      </button>
                    ))}
                  </div>

                  {/* Active Selected Month Detailed View */}
                  {(() => {
                    const activePreview =
                      parsedTemplates.find((t) => t.key === previewMonthKey) || parsedTemplates[0];
                    if (!activePreview) return null;

                    return (
                      <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {activePreview.category}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 mt-1">
                              {activePreview.monthName}
                            </h4>
                          </div>
                          <span className="text-xs text-slate-500">
                            {activePreview.themeTitle}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                          <strong>المحور والهدف:</strong> {activePreview.focusSummary}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Agenda */}
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                            <span className="font-bold text-slate-800 block">
                              جدول الأعمال ({activePreview.agenda.length} بنود):
                            </span>
                            <ul className="space-y-1 list-disc list-inside text-slate-600 pr-1">
                              {activePreview.agenda.map((a, i) => (
                                <li key={i} className={i === 0 ? "font-bold text-emerald-800" : ""}>
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* KPIs & Decisions */}
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                            <div>
                              <span className="font-bold text-slate-800 block mb-1">
                                مؤشرات الأداء ({activePreview.defaultKpis.length}):
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {activePreview.defaultKpis.map((k, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px]"
                                  >
                                    {k.name}: <strong>{k.value}</strong>
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <span className="font-bold text-slate-800 block mb-1">
                                نماذج القرارات والتوصيات:
                              </span>
                              <ul className="space-y-1 text-[11px] text-slate-600">
                                {activePreview.sampleDecisions.map((d, i) => (
                                  <li key={i} className="truncate">
                                    • {d.topic} ← {d.decision}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                </div>
              )}

            </div>
          )}

          {/* TAB 2: SPECIALIZED CENTER PRESETS */}
          {activeTab === "presets" && (
            <div className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 leading-relaxed">
                <strong>الخطط السنوية المعتمدة مسبقاً:</strong> يمكنك بنقرة واحدة تحميل وتطبيق خطة الـ 12 شهراً المتخصصة بالكامل لنوع منشأتك (مراكز العيون واليوم الواحد، المستشفيات التخصصية، أو مجمعات الأسنان).
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PRESET_MONTHLY_PLANS.map((preset) => {
                  return (
                    <div
                      key={preset.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between space-y-3 hover:border-blue-400 transition-all shadow-2xs"
                    >
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {preset.centerCategory}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {preset.name}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="text-[11px] text-slate-500 flex items-center justify-between">
                          <span>عدد القوالب الشهرية:</span>
                          <strong className="text-blue-600 font-bold">{preset.templates.length} شهراً</strong>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyPresetPlan(preset)}
                          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تطبيق هذه الخطة للمركز</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: EXPORT & SHARE TEMPLATES */}
          {activeTab === "export" && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-600" />
                  مشاركة وتصدير قوالب الاجتماعات الشهرية لمراكز أخرى
                </h4>
                <p className="leading-relaxed">
                  يمكنك تصدير الخطة السنوية الحالية للمركز (الـ 12 شهراً بجداول أعمالها ومؤشراتها وقراراتها) في ملف رقمي موحد (.json)، ليقوم أي مسؤول مكافحة عدوى في مركز طبي آخر برفعه واستخدامه فوراً.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Option 1: Export Current 12 Months */}
                <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition-all flex flex-col justify-between space-y-4 shadow-2xs">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      تصدير قوالب الـ 12 شهراً لـ ({centerSettings.centerName || "المركز الحالي"})
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      ملف JSON يحتوي على جميع الشهور الـ 12 المعتمدة، مع العناوين والبنود والمؤشرات.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportTemplates}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>تصدير ملف القوالب الشهرية (.json)</span>
                  </button>
                </div>

                {/* Option 2: Download Sample Schema */}
                <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 transition-all flex flex-col justify-between space-y-4 shadow-2xs">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      تحميل ملف نموذج فارغ / قياسي كمرجع
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      ملف نموذجي يمكنك التعديل عليه في برامج النصوص أو محررات الأكواد لملء بيانات مستشفى جديد ثم إعادة رفعه.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadSample}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل النموذج القياسي (.json)</span>
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            الخطة المفعلة حالياً: <strong className="text-slate-800">{monthlyTemplates.length} قوالب شهرية</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
