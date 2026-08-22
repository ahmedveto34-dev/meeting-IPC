import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Download,
  Building2,
  FileText,
  ClipboardCheck,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ArrowRight,
  FileCheck2,
  FileCheck,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { CenterSettings, Meeting, RoundReport, MeetingTopic, MonthlyThemeTemplate, AppExportBundle } from "../types";
import { PRESET_MONTHLY_PLANS, DEFAULT_MONTHLY_TEMPLATES } from "../data/monthlyTemplates";
import { STANDARD_OBSERVATIONS_LIBRARY } from "../data/standardObservations";
import {
  exportMonthlyPlanToDocx,
  exportBlankMeetingTemplateToDocx,
  exportBlankRoundTemplateToDocx,
  exportObservationsBankToDocx,
} from "../utils/docxExport";

export type { AppExportBundle };

interface CenterTemplatesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  centerSettings: CenterSettings;
  meetings: Meeting[];
  rounds: RoundReport[];
  topics: MeetingTopic[];
  monthlyTemplates?: MonthlyThemeTemplate[];
  onImportBundle: (bundle: Partial<AppExportBundle>, mode: "merge" | "replace") => void;
  onUpdateCenterSettings: (newSettings: CenterSettings) => void;
  onUpdateMonthlyTemplates?: (templates: MonthlyThemeTemplate[], planName?: string) => void;
}

// Preset Center Templates for quick 1-click adoption
const PRESET_CENTERS: Array<{
  name: string;
  type: string;
  description: string;
  settings: Partial<CenterSettings>;
}> = [
  {
    name: "Waheed IPC - مركز جراحات العيون ومكافحة العدوى",
    type: "مركز جراحات اليوم الواحد ومكافحة العدوى",
    description: "قالب مخصص لمراكز العيون، غرف العمليات الصغرى، التعقيم الدقيق، والمناظير.",
    settings: {
      centerName: "Waheed IPC",
      departmentTitle: "لجنة مكافحة العدوى",
      medicalDirector: "أ.د / المدير الطبي",
      infectionControlLead: "م/ أحمد وحيد شعبان",
      nursingSupervisor: "مشرف التمريض",
      departments: [
        "العمليات الصغرى والليزك",
        "التعقيم المركزي (CSSD)",
        "العيادات الخارجية والفحص",
        "غرفة الإفاقة والرعاية",
        "الصيدلية",
        "النفايات الطبية والمفروشات",
      ],
    },
  },
  {
    name: "مستشفى الجراحة التخصصية والنساء والتوليد",
    type: "مستشفى تخصصي متكامل",
    description: "قالب يغطي العمليات الكبرى، حضانات الأطفال، الرعاية المركزة، بنك الدم والمختبر.",
    settings: {
      centerName: "مستشفى الجراحة والنساء التخصصي",
      departmentTitle: "فريق ومكتب مكافحة العدوى",
      medicalDirector: "د / استشاري الجراحة العامة",
      infectionControlLead: "د / مسؤول مكافحة العدوى والجودة",
      nursingSupervisor: "رئيسة هيئة التمريض",
      departments: [
        "العمليات الكبرى (OR)",
        "الرعاية المركزة (ICU)",
        "حضانات الأطفال المبتسرين (NICU)",
        "التعقيم المركزي (CSSD)",
        "المعمل وبنك الدم",
        "قسم الطوارئ والاستقبال",
        "المغسلة المركزية",
        "الصيدلية وتجهيز المحاليل",
      ],
    },
  },
  {
    name: "مجمع العيادات الخارجية ومراكز طب الأسنان",
    type: "مراكز الأسنان والعيادات الخارجية",
    description: "قالب مخصص للتعقيم السريع لأدوات الأسنان، التطهير البيئي، ونظافة الأيدي ومكافحة العدوى الرذاذية.",
    settings: {
      centerName: "مجمع عيادات الأسنان والطب الوقائي",
      departmentTitle: "لجنة السلامة ومكافحة العدوى",
      medicalDirector: "د / المشرف الفني العام",
      infectionControlLead: "د / منسق مكافحة العدوى",
      nursingSupervisor: "مشرفة العيادات",
      departments: [
        "عيادات الأسنان والجراحة",
        "وحدة التعقيم والأوتوكلاف",
        "غرفة الأشعة السينية",
        "الاستقبال والانتظار",
        "الصيدلية",
        "التخلص من الأدوات الحادة",
      ],
    },
  },
  {
    name: "مركز الغسيل الكلوي والأمراض الباطنية",
    type: "مراكز الغسيل الكلوي (Hemodialysis)",
    description: "قالب مركز على فحص التهاب الكبد الوبائي (B & C)، تعقيم ماكينات الكلى، ونقاء محطة معالجة المياه.",
    settings: {
      centerName: "مركز الأمل للغسيل الكلوي",
      departmentTitle: "لجنة مكافحة العدوى والكلى",
      medicalDirector: "استشاري أمراض الكلى والباطنة",
      infectionControlLead: "مسؤول مكافحة العدوى المعتمد",
      nursingSupervisor: "مشرف تمريض الغسيل الكلوي",
      departments: [
        "صالة الغسيل الكلوي (المرضى السلبيون)",
        "صالة الغسيل الكلوي (المرضى الإيجابيون - الفيروسات)",
        "محطة معالجة المياه المركزية",
        "غرفة تحضير وتخزين الفلاتر والأدوية",
        "النفايات الخطرة والمخلفات الطبية",
      ],
    },
  },
];

export const CenterTemplatesManagerModal: React.FC<CenterTemplatesManagerModalProps> = ({
  isOpen,
  onClose,
  centerSettings,
  meetings,
  rounds,
  topics,
  monthlyTemplates,
  onImportBundle,
  onUpdateCenterSettings,
  onUpdateMonthlyTemplates,
}) => {
  const [activeTab, setActiveTab] = useState<"presets" | "upload" | "export">("presets");
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [fileError, setFileError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [selectedFileBundle, setSelectedFileBundle] = useState<AppExportBundle | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  if (!isOpen) return null;

  // 1. Export Current Data & Templates to JSON
  const handleExportAll = () => {
    const bundle: AppExportBundle = {
      version: "2.0",
      exportedAt: new Date().toISOString(),
      centerSettings,
      meetings,
      rounds,
      topics,
      monthlyTemplates,
    };

    const dataStr = JSON.stringify(bundle, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (centerSettings.centerName || "MedicalCenter").replace(/\s+/g, "_");
    a.download = `قوالب_واجتماعات_${safeName}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccessMsg("تم تصدير حزمة القوالب والاجتماعات بنجاح بصيغة JSON قابلة للرفع في أي مركز آخر.");
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  // 2. Export Only Blank Templates (Settings + Standard Topics + Monthly Templates)
  const handleExportBlankTemplate = () => {
    const bundle: Partial<AppExportBundle> = {
      version: "2.0",
      exportedAt: new Date().toISOString(),
      centerSettings,
      meetings: [], // Empty meetings for fresh center start
      rounds: [], // Empty rounds
      topics,
      monthlyTemplates,
    };

    const dataStr = JSON.stringify(bundle, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (centerSettings.centerName || "MedicalCenter").replace(/\s+/g, "_");
    a.download = `قالب_فارغ_معتمد_${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccessMsg("تم تصدير ملف القالب الفارغ (الإعدادات + مكتبة الموضوعات + قوالب الأشهر الـ12) لإنشاء مراكز جديدة.");
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  // 3. Word (.docx) Exports
  const handleExportPlanDocx = async () => {
    try {
      setIsExportingDocx(true);
      await exportMonthlyPlanToDocx(monthlyTemplates || DEFAULT_MONTHLY_TEMPLATES, centerSettings);
      setSuccessMsg("تم تجهيز وتنزيل الخطة السنوية الشاملة بصيغة Word (.docx) منسقة بنجاح.");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      console.error(err);
      setFileError("حدث خطأ أثناء تصدير ملف Word.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportBlankMeetingDocx = async () => {
    try {
      setIsExportingDocx(true);
      await exportBlankMeetingTemplateToDocx(centerSettings);
      setSuccessMsg("تم تنزيل نموذج محضر الاجتماع الفارغ المعتمد بصيغة Word (.docx) بنجاح.");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      console.error(err);
      setFileError("حدث خطأ أثناء تصدير ملف Word.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportBlankRoundDocx = async () => {
    try {
      setIsExportingDocx(true);
      await exportBlankRoundTemplateToDocx(centerSettings);
      setSuccessMsg("تم تنزيل نموذج تقرير المرور الميداني الأسبوعي الفارغ بصيغة Word (.docx) بنجاح.");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      console.error(err);
      setFileError("حدث خطأ أثناء تصدير ملف Word.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportObservationsDocx = async () => {
    try {
      setIsExportingDocx(true);
      await exportObservationsBankToDocx(STANDARD_OBSERVATIONS_LIBRARY, centerSettings);
      setSuccessMsg("تم تنزيل الدليل القياسي وبنك الملاحظات المعتمد بصيغة Word (.docx) بنجاح.");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      console.error(err);
      setFileError("حدث خطأ أثناء تصدير ملف Word.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  // 3. File Selection & Parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    setSuccessMsg("");
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Basic validation
        if (!parsed || typeof parsed !== "object") {
          throw new Error("تنسيق الملف غير صالح، يجب أن يكون ملف JSON متوافق.");
        }

        setSelectedFileBundle(parsed);
      } catch (err: any) {
        setFileError(err.message || "حدث خطأ أثناء قراءة الملف، تأكد من اختيار ملف JSON صحيح.");
        setSelectedFileBundle(null);
      }
    };
    reader.readAsText(file);
  };

  // 4. Apply Uploaded Bundle
  const handleApplyUploadedBundle = () => {
    if (!selectedFileBundle) return;

    onImportBundle(selectedFileBundle, importMode);
    setSuccessMsg("تم استيراد ورفع القوالب والبيانات للمركز بنجاح!");
    setSelectedFileBundle(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 1500);
  };

  // 5. Apply Ready-Made Center Preset
  const handleApplyPreset = (preset: typeof PRESET_CENTERS[0]) => {
    if (
      window.confirm(
        `هل تريد تطبيق إعدادات وأقسام "${preset.name}"؟ سيتم تحديث اسم المنشأة، المدير الطبي، ومسؤول مكافحة العدوى والأقسام فوراً.`
      )
    ) {
      onUpdateCenterSettings({
        ...centerSettings,
        ...preset.settings,
        defaultMembers: centerSettings.defaultMembers.map((m, idx) => {
          if (idx === 0) return { ...m, name: (preset.settings.medicalDirector as string) || m.name };
          if (idx === 1) return { ...m, name: (preset.settings.infectionControlLead as string) || m.name };
          return m;
        }),
      });

      // Also check if there is a matching specialized monthly plan
      if (onUpdateMonthlyTemplates) {
        if (preset.name.includes("الأسنان")) {
          const dentalPlan = PRESET_MONTHLY_PLANS.find((p) => p.id === "plan-dental-centers");
          if (dentalPlan) onUpdateMonthlyTemplates(dentalPlan.templates, dentalPlan.name);
        } else if (preset.name.includes("مستشفى") || preset.name.includes("الجراحة التخصصية")) {
          const hospPlan = PRESET_MONTHLY_PLANS.find((p) => p.id === "plan-general-hospital");
          if (hospPlan) onUpdateMonthlyTemplates(hospPlan.templates, hospPlan.name);
        } else if (preset.name.includes("Waheed") || preset.name.includes("العيون")) {
          onUpdateMonthlyTemplates(DEFAULT_MONTHLY_TEMPLATES, "قالب مراكز العيون وجراحات اليوم الواحد");
        }
      }

      setSuccessMsg(`تم تطبيق قالب "${preset.name}" بنجاح!`);
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                إدارة ورفع قوالب الاجتماعات والملاحظات للمراكز الأخرى
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تصدير واستيراد نماذج الاجتماعات، مكتبة الموضوعات، وبنك الملاحظات، أو التبديل بين قوالب المستشفيات والمراكز التخصصية الجاهزة
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
            onClick={() => setActiveTab("presets")}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "presets"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>قوالب المراكز والمستشفيات الجاهزة</span>
          </button>

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
            <span>رفع واستيراد ملف قالب (.json)</span>
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
            <span>تصدير ومشاركة قالب المركز الحالي</span>
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

        {/* Tab 1: Ready-Made Center Presets */}
        {activeTab === "presets" && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 leading-relaxed">
              <strong>قوالب معتمدة مسبقاً:</strong> يمكنك بنقرة زر واحدة تخصيص المنظومة بالكامل لتلائم طبيعة أي منشأة طبية جديدة (عيون وجراحات يوم واحد، مستشفى متكامل، مجمع أسنان، أو مركز غسيل كلوي).
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESET_CENTERS.map((preset, idx) => {
                const isCurrent = centerSettings.centerName === preset.settings.centerName;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                      isCurrent
                        ? "bg-blue-50/40 border-blue-400 ring-2 ring-blue-500/20"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {preset.type}
                        </span>
                        {isCurrent && (
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            المركز الحالي
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {preset.name}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-[11px] text-slate-500 mb-2 font-medium">
                        <strong>الأقسام المشمولة ({preset.settings.departments?.length}):</strong>{" "}
                        {preset.settings.departments?.slice(0, 4).join("، ")}...
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          isCurrent
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{isCurrent ? "إعادة تطبيق القالب" : "تطبيق هذا القالب على المركز"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Upload & Import JSON Template */}
        {activeTab === "upload" && (
          <div className="p-6 overflow-y-auto space-y-5">
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-all">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="template-upload-input"
              />
              <label
                htmlFor="template-upload-input"
                className="flex flex-col items-center justify-center cursor-pointer space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-sm font-bold text-blue-700 hover:underline">
                    انقر لاختيار ملف القالب من جهازك
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">
                    أو اسحب ملف (.json) الخاص بمركز أو مستشفى آخر هنا
                  </span>
                </div>
              </label>
            </div>

            {/* Selected File Inspection */}
            {selectedFileBundle && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-800">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>محتويات ملف القالب المحدد:</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {selectedFileBundle.exportedAt ? `تاريخ التصدير: ${selectedFileBundle.exportedAt.split("T")[0]}` : ""}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="block text-slate-500 text-[11px]">اسم المنشأة</span>
                    <strong className="text-slate-800 truncate block">
                      {selectedFileBundle.centerSettings?.centerName || "غير محدد"}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="block text-slate-500 text-[11px]">قوالب الأشهر الـ12</span>
                    <strong className="text-emerald-700">
                      {Array.isArray(selectedFileBundle.monthlyTemplates) ? selectedFileBundle.monthlyTemplates.length : 0} شهراً
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="block text-slate-500 text-[11px]">موضوعات المكتبة</span>
                    <strong className="text-blue-600">
                      {Array.isArray(selectedFileBundle.topics) ? selectedFileBundle.topics.length : 0} موضوعاً
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="block text-slate-500 text-[11px]">محاضر الاجتماعات</span>
                    <strong className="text-slate-800">
                      {Array.isArray(selectedFileBundle.meetings) ? selectedFileBundle.meetings.length : 0} محضر
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="block text-slate-500 text-[11px]">تقارير المرور</span>
                    <strong className="text-slate-800">
                      {Array.isArray(selectedFileBundle.rounds) ? selectedFileBundle.rounds.length : 0} تقرير
                    </strong>
                  </div>
                </div>

                {/* Import Mode Radio */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2">طريقة الاستيراد:</label>
                  <div className="flex flex-col sm:flex-row gap-3 text-xs">
                    <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 flex-1">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === "merge"}
                        onChange={() => setImportMode("merge")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <strong className="block text-slate-800">دمج ذكي (Merge - مستحسن)</strong>
                        <span className="text-[11px] text-slate-500">
                          إضافة الموضوعات والاجتماعات الجديدة دون مسح بياناتك الحالية
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 flex-1">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === "replace"}
                        onChange={() => setImportMode("replace")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <strong className="block text-rose-700">استبدال كامل (Replace)</strong>
                        <span className="text-[11px] text-slate-500">
                          تطبيق بيانات القالب المرفوع واستبدال الإعدادات الحالية
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleApplyUploadedBundle}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد استيراد وتطبيق القالب الآن</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Export Formatted Word Documents & JSON Data Bundles */}
        {activeTab === "export" && (
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Section 1: Formatted Word Documents (.docx) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-900 text-sm">
                  تصدير مستندات ونماذج وورد منسقة وجاهزة للطباعة (.docx)
                </h4>
                <span className="text-[11px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-bold border border-blue-200 mr-auto">
                  ملفات Word رسمية
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                مستندات وورد منسقة بالكامل بالخطوط العربية المعتمدة (Cairo)، جداول الحضور، مؤشرات الأداء، وبنود التوصيات والاعتماد.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* 1. Annual Plan 12 Months Docx */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex flex-col justify-between space-y-3 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-1">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>الخطة السنوية الشاملة (12 شهراً)</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      ملف وورد شامل يحتوي على خطة الـ 12 شهراً، المحاور الاستراتيجية، مؤشرات الأداء المستهدفة، ونماذج التوصيات.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportPlanDocx}
                    disabled={isExportingDocx}
                    className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExportingDocx ? "جاري التجهيز..." : "تصدير الخطة السنوية (.docx Word)"}</span>
                  </button>
                </div>

                {/* 2. Blank Meeting Template Docx */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex flex-col justify-between space-y-3 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-1">
                      <FileCheck2 className="w-4 h-4" />
                      <span>نموذج محضر اجتماع فارغ معتمد</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      نموذج محضر اجتماع منسق جاهز للكتابة أو الطباعة، يحتوي على جدول الحضور، بنود جدول الأعمال، والقرارات والتوقيعات.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportBlankMeetingDocx}
                    disabled={isExportingDocx}
                    className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>{isExportingDocx ? "جاري التجهيز..." : "تصدير نموذج محضر فارغ (.docx)"}</span>
                  </button>
                </div>

                {/* 3. Blank Round Report Template Docx */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                      <ClipboardCheck className="w-4 h-4" />
                      <span>نموذج تقرير مرور ميداني أسبوعي فارغ</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      نموذج تقرير مرور ميداني فارغ مجهز لتدوين ملاحظات التفتيش الميداني والإجراءات التصحيحية والتوقيعات الرسمية.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportBlankRoundDocx}
                    disabled={isExportingDocx}
                    className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>{isExportingDocx ? "جاري التجهيز..." : "تصدير نموذج مرور فارغ (.docx)"}</span>
                  </button>
                </div>

                {/* 4. Observations & Policies Bank Docx */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-300 transition-all flex flex-col justify-between space-y-3 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2 text-purple-700 font-bold text-xs mb-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>الدليل القياسي وبنك الملاحظات والمعايير</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      تصدير بنك الملاحظات الميدانية القياسية والإجراءات التصحيحية المعتمدة بالكامل في جدول وورد منظم.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportObservationsDocx}
                    disabled={isExportingDocx}
                    className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-purple-600" />
                    <span>{isExportingDocx ? "جاري التجهيز..." : "تصدير بنك الملاحظات (.docx)"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Data Portability & Backup Bundles (.json) */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Layers className="w-5 h-5 text-slate-600" />
                <h4 className="font-bold text-slate-900 text-sm">
                  حزم البيانات الرقمية لنقل المنظومة بين الحواسيب والمراكز (.json)
                </h4>
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold border border-slate-200 mr-auto">
                  بيانات رقمية للاستيراد
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                ملفات بيانات مشفرة رقمياً (JSON) مخصصة للنقل بين الحواسيب ورفعها عبر تبويب "استيراد قالب" في مراكز ومستشفيات أخرى لتطبيق نفس الإعدادات والموضوعات تلقائياً.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Option A: Full Backup Bundle */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs mb-1">
                      حزمة نسخ احتياطي كاملة (الإعدادات + الموضوعات + الاجتماعات)
                    </h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      نسخة احتياطية رقمية كاملة تحتوي على جميع محاضر الاجتماعات السابقة وتقارير المرور وإعدادات المركز.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportAll}
                    className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>تصدير نسخة احتياطية (.json)</span>
                  </button>
                </div>

                {/* Option B: Blank Template for new centers */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs mb-1">
                      حزمة قالب فارغ للمراكز الجديدة (إعدادات + بنك الموضوعات)
                    </h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      حزمة مخصصة لإنشاء منشأة جديدة بدون أي محاضر سابقة، لنقلها واستيرادها في مراكز أخرى.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportBlankTemplate}
                    className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>تصدير قالب فارغ (.json)</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
