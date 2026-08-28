import React, { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  Calculator,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  Percent,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  Sliders,
  FileSpreadsheet,
  Printer,
  FileDown,
  Plus,
  Trash2,
  Stethoscope,
  FlaskConical,
  Pill,
  Activity,
  Sparkle,
  UserCheck,
  Edit3,
  Check,
  Tag,
  Save,
  Download,
} from "lucide-react";
import {
  CenterSettings,
  WHOObservationSession,
  WHO_STANDARD_DEPARTMENTS,
  WHO_PROF_CATEGORIES,
} from "../types";
import {
  generateAccurateWHOSessions,
  WHOGeneratorOptions,
  WHOGeneratorCategoryItem,
} from "../utils/whoHandHygieneGenerator";

export interface GeneratorCategoryState {
  id: string;
  name: string;
  mainCategory: "1" | "2" | "3" | "4";
  code: string;
  opps: number;
  targetRate?: number;
  isCustom?: boolean;
}

interface HandHygieneStatsGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  centerSettings: CenterSettings;
  periodTitle: string;
  targetCompliance: number;
  onApplyGeneratedSessions: (
    sessions: WHOObservationSession[],
    newPeriodTitle: string,
    newTargetCompliance: number,
    notes: string,
    saveToArchiveDirectly?: boolean
  ) => void;
  onApplyAndPrint?: (
    sessions: WHOObservationSession[],
    newPeriodTitle: string,
    newTargetCompliance: number,
    notes: string
  ) => void;
  onApplyAndDownloadWord?: (
    sessions: WHOObservationSession[],
    newPeriodTitle: string,
    newTargetCompliance: number,
    notes: string
  ) => void;
}

// Popular medical category presets for quick 1-click addition
const PRESET_EXTRA_CATEGORIES: {
  title: string;
  name: string;
  mainCategory: "1" | "2" | "3" | "4";
  code: string;
  icon: string;
  defaultOpps: number;
}[] = [
  {
    title: "صيادلة وصيدلة إكلينيكية",
    name: "صيدلة إكلينيكية / Pharmacist",
    mainCategory: "4",
    code: "4.3",
    icon: "💊",
    defaultOpps: 10,
  },
  {
    title: "فنيو المختبر وسحب العينات",
    name: "فني مختبر / Laboratory & Phlebotomist",
    mainCategory: "4",
    code: "4.2",
    icon: "🧪",
    defaultOpps: 15,
  },
  {
    title: "أخصائيو علاج طبيعي وتنفسي",
    name: "علاج طبيعي وتنفسي / Physiotherapist",
    mainCategory: "4",
    code: "4.1",
    icon: "🫁",
    defaultOpps: 12,
  },
  {
    title: "فنيو الأشعة والتصوير",
    name: "فني أشعة / Radiology Tech",
    mainCategory: "4",
    code: "4.2",
    icon: "☢️",
    defaultOpps: 10,
  },
  {
    title: "عمال النظافة والخدمات البيئية",
    name: "خدمات بيئية ونظافة / Housekeeping",
    mainCategory: "2",
    code: "2.0",
    icon: "🧹",
    defaultOpps: 15,
  },
  {
    title: "استشاريون وجراحون تخصصيون",
    name: "جراح واستشاري / Surgeon & Consultant",
    mainCategory: "3",
    code: "3.2",
    icon: "🩺",
    defaultOpps: 20,
  },
  {
    title: "تمريض عناية حرجة وحضانات",
    name: "تمريض عناية وحضانات / ICU & NICU Nurse",
    mainCategory: "1",
    code: "1.1",
    icon: "👶",
    defaultOpps: 25,
  },
  {
    title: "إداريون واستقبال ومرافقة",
    name: "إداري واستقبال / Admin & Reception",
    mainCategory: "4",
    code: "4.3",
    icon: "📋",
    defaultOpps: 8,
  },
];

export const HandHygieneStatsGeneratorModal: React.FC<HandHygieneStatsGeneratorModalProps> = ({
  isOpen,
  onClose,
  centerSettings,
  periodTitle,
  targetCompliance,
  onApplyGeneratedSessions,
}) => {
  // Facility / Organization Data
  const [facilityName, setFacilityName] = useState(centerSettings.centerName || "مستشفى / مركز مكافحة العدوى");
  const [departmentTitle, setDepartmentTitle] = useState(centerSettings.departmentTitle || "قسم مكافحة العدوى");
  const [wardName, setWardName] = useState("قسم الجراحة والعناية المركزة");
  const [departmentCategory, setDepartmentCategory] = useState<string>("surgery");
  const [period, setPeriod] = useState(periodTitle || "الربع الأول (Q1 2026)");
  const [observerName, setObserverName] = useState(centerSettings.infectionControlLead || "م/ أحمد وحيد شعبان");
  const [medicalDirector, setMedicalDirector] = useState(centerSettings.medicalDirector || "د/ إيناس");

  // Sessions Count
  const [sessionsCount, setSessionsCount] = useState<number>(10);

  // Categories Dynamic List
  const [categories, setCategories] = useState<GeneratorCategoryState[]>([
    {
      id: "cat-nurse",
      name: "1. تمريض وقبالة (Nurse / Midwife)",
      mainCategory: "1",
      code: "1.1",
      opps: 40,
      targetRate: 88,
      isCustom: false,
    },
    {
      id: "cat-aux",
      name: "2. مساعدو الخدمات (Auxiliary)",
      mainCategory: "2",
      code: "2.0",
      opps: 20,
      targetRate: 80,
      isCustom: false,
    },
    {
      id: "cat-doc",
      name: "3. الأطباء البشريين (Doctor)",
      mainCategory: "3",
      code: "3.1",
      opps: 30,
      targetRate: 82,
      isCustom: false,
    },
    {
      id: "cat-other",
      name: "4. كوادر أخرى (Other HCW)",
      mainCategory: "4",
      code: "4.2",
      opps: 10,
      targetRate: 85,
      isCustom: false,
    },
  ]);

  // Adding Custom Category Form state
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatMain, setNewCatMain] = useState<"1" | "2" | "3" | "4">("4");
  const [newCatCode, setNewCatCode] = useState("4.3");
  const [newCatOpps, setNewCatOpps] = useState(15);
  const [newCatRate, setNewCatRate] = useState(85);

  // Statistical Targets & Parameters
  const [overallTarget, setOverallTarget] = useState<number>(targetCompliance || 85);
  const [customCategoryRates, setCustomCategoryRates] = useState(false);

  // Product Preference
  const [handrubRatio, setHandrubRatio] = useState<number>(75); // 75% HR, 25% HW
  const [autoSaveArchive, setAutoSaveArchive] = useState<boolean>(true);
  const [notes, setNotes] = useState(
    "تم إعداد وتوليد الإحصائية الرياضية الدقيقة وفق المعايير الفنية المعتمدة لمنظمة الصحة العالمية (WHO 5 Moments) بنسب امتثال واقعية ومحققة للمستهدف."
  );

  // Quick Preset Profiles
  const handleApplyPreset = (profile: "who_standard" | "high_performance" | "improvement_needed" | "comprehensive_audit") => {
    if (profile === "who_standard") {
      setOverallTarget(85);
      setSessionsCount(10);
      setHandrubRatio(75);
      setCategories([
        { id: "cat-nurse", name: "1. تمريض وقبالة (Nurse)", mainCategory: "1", code: "1.1", opps: 40, targetRate: 88 },
        { id: "cat-aux", name: "2. مساعدو الخدمات (Auxiliary)", mainCategory: "2", code: "2.0", opps: 20, targetRate: 80 },
        { id: "cat-doc", name: "3. الأطباء البشريين (Doctor)", mainCategory: "3", code: "3.1", opps: 30, targetRate: 82 },
        { id: "cat-other", name: "4. كوادر أخرى (Other HCW)", mainCategory: "4", code: "4.2", opps: 10, targetRate: 85 },
      ]);
    } else if (profile === "high_performance") {
      setOverallTarget(92);
      setSessionsCount(15);
      setHandrubRatio(85);
      setCategories([
        { id: "cat-nurse", name: "1. تمريض وقبالة (Nurse)", mainCategory: "1", code: "1.1", opps: 60, targetRate: 95 },
        { id: "cat-aux", name: "2. مساعدو الخدمات (Auxiliary)", mainCategory: "2", code: "2.0", opps: 30, targetRate: 88 },
        { id: "cat-doc", name: "3. الأطباء البشريين (Doctor)", mainCategory: "3", code: "3.1", opps: 45, targetRate: 90 },
        { id: "cat-other", name: "4. كوادر أخرى (Other HCW)", mainCategory: "4", code: "4.2", opps: 15, targetRate: 92 },
      ]);
    } else if (profile === "improvement_needed") {
      setOverallTarget(75);
      setSessionsCount(8);
      setHandrubRatio(65);
      setCategories([
        { id: "cat-nurse", name: "1. تمريض وقبالة (Nurse)", mainCategory: "1", code: "1.1", opps: 32, targetRate: 78 },
        { id: "cat-aux", name: "2. مساعدو الخدمات (Auxiliary)", mainCategory: "2", code: "2.0", opps: 16, targetRate: 68 },
        { id: "cat-doc", name: "3. الأطباء البشريين (Doctor)", mainCategory: "3", code: "3.1", opps: 24, targetRate: 70 },
        { id: "cat-other", name: "4. كوادر أخرى (Other HCW)", mainCategory: "4", code: "4.2", opps: 8, targetRate: 72 },
      ]);
    } else if (profile === "comprehensive_audit") {
      setOverallTarget(86);
      setSessionsCount(20);
      setHandrubRatio(80);
      setCategories([
        { id: "cat-nurse", name: "1. تمريض وقبالة (Nurse)", mainCategory: "1", code: "1.1", opps: 70, targetRate: 90 },
        { id: "cat-aux", name: "2. مساعدو الخدمات (Auxiliary)", mainCategory: "2", code: "2.0", opps: 35, targetRate: 82 },
        { id: "cat-doc", name: "3. الأطباء البشريين (Doctor)", mainCategory: "3", code: "3.1", opps: 50, targetRate: 84 },
        { id: "cat-pharm", name: "صيدلة إكلينيكية (Pharmacist)", mainCategory: "4", code: "4.3", opps: 20, targetRate: 86, isCustom: true },
        { id: "cat-lab", name: "فنيو المختبر (Laboratory)", mainCategory: "4", code: "4.2", opps: 15, targetRate: 88, isCustom: true },
        { id: "cat-other", name: "كوادر أخرى (Other HCW)", mainCategory: "4", code: "4.4", opps: 10, targetRate: 85 },
      ]);
    }
  };

  // Add Category Handler
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;

    const newId = `cat-custom-${Date.now()}`;
    const newCategory: GeneratorCategoryState = {
      id: newId,
      name: newCatName.trim(),
      mainCategory: newCatMain,
      code: newCatCode || (newCatMain === "1" ? "1.1" : newCatMain === "2" ? "2.0" : newCatMain === "3" ? "3.1" : "4.2"),
      opps: Math.max(1, newCatOpps || 10),
      targetRate: newCatRate || overallTarget,
      isCustom: true,
    };

    setCategories((prev) => [...prev, newCategory]);
    setNewCatName("");
    setShowAddCategoryForm(false);
  };

  // Quick Add Preset Category
  const handleQuickAddPreset = (preset: typeof PRESET_EXTRA_CATEGORIES[0]) => {
    const newId = `cat-custom-${Date.now()}`;
    const newCategory: GeneratorCategoryState = {
      id: newId,
      name: preset.name,
      mainCategory: preset.mainCategory,
      code: preset.code,
      opps: preset.defaultOpps,
      targetRate: overallTarget,
      isCustom: true,
    };

    setCategories((prev) => [...prev, newCategory]);
    setShowAddCategoryForm(false);
  };

  // Update Category Opps
  const handleUpdateCategoryOpps = (id: string, newOpps: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, opps: Math.max(1, newOpps) } : c))
    );
  };

  // Update Category Target Rate
  const handleUpdateCategoryRate = (id: string, newRate: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, targetRate: Math.max(0, Math.min(100, newRate)) } : c))
    );
  };

  // Update Category Name
  const handleUpdateCategoryName = (id: string, newName: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
  };

  // Remove Category
  const handleRemoveCategory = (id: string) => {
    if (categories.length <= 1) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Real-time Calculation Simulation
  const livePreview = useMemo(() => {
    let totalOpps = 0;
    let totalActions = 0;

    const categoryDetails = categories.map((cat) => {
      const opps = Math.max(1, cat.opps || 1);
      let rate = overallTarget;
      if (customCategoryRates && cat.targetRate !== undefined) {
        rate = cat.targetRate;
      } else {
        if (cat.mainCategory === "1") rate = Math.min(100, Math.round(overallTarget * 1.03));
        else if (cat.mainCategory === "3") rate = Math.max(50, Math.round(overallTarget * 0.96));
        else if (cat.mainCategory === "2") rate = Math.max(50, Math.round(overallTarget * 0.94));
        else rate = overallTarget;
      }
      const actions = Math.round(opps * (rate / 100));
      totalOpps += opps;
      totalActions += actions;

      return {
        ...cat,
        opps,
        rate,
        actions,
      };
    });

    const calculatedOverall = totalOpps > 0 ? Math.round((totalActions / totalOpps) * 1000) / 10 : 0;

    return {
      totalOpps,
      totalActions,
      calculatedOverall,
      categoryDetails,
    };
  }, [categories, overallTarget, customCategoryRates]);

  if (!isOpen) return null;

  const handleGenerateAndApply = (actionType: "save" | "print" | "word" = "save") => {
    const customCats: WHOGeneratorCategoryItem[] = categories.map((c) => ({
      id: c.id,
      cat: c.mainCategory,
      code: c.code,
      name: c.name,
      totalOpps: c.opps,
      targetRate: customCategoryRates ? c.targetRate : undefined,
    }));

    const options: WHOGeneratorOptions = {
      facilityName: facilityName.trim() || centerSettings.centerName,
      departmentTitle: departmentTitle.trim() || centerSettings.departmentTitle,
      wardName: wardName.trim(),
      departmentCategory,
      periodTitle: period.trim() || periodTitle,
      observerName: observerName.trim(),
      medicalDirector: medicalDirector.trim(),
      targetOverallCompliance: overallTarget,
      customCategories: customCats,
      sessionsCount,
      handrubRatioPercent: handrubRatio,
      notes,
    };

    const generated = generateAccurateWHOSessions(options);

    if (actionType === "print" && onApplyAndPrint) {
      onApplyAndPrint(generated, period, overallTarget, notes);
    } else if (actionType === "word" && onApplyAndDownloadWord) {
      onApplyAndDownloadWord(generated, period, overallTarget, notes);
    } else {
      onApplyGeneratedSessions(generated, period, overallTarget, notes, autoSaveArchive);
    }
    onClose();
  };

  const getMainCategoryBadge = (main: "1" | "2" | "3" | "4") => {
    switch (main) {
      case "1":
        return { label: "Prof.cat 1 (Nurse)", bg: "bg-blue-100 text-blue-800 border-blue-200" };
      case "2":
        return { label: "Prof.cat 2 (Auxiliary)", bg: "bg-slate-200 text-slate-800 border-slate-300" };
      case "3":
        return { label: "Prof.cat 3 (Doctor)", bg: "bg-purple-100 text-purple-800 border-purple-200" };
      case "4":
      default:
        return { label: "Prof.cat 4 (Other HCW)", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-['Cairo',sans-serif]">
      <div className="bg-slate-50 rounded-3xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-900 via-amber-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-lg font-black shrink-0">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                <span>مُولّد ومُعدّ الإحصائية الدقيقة لنظافة الأيدي (WHO Smart Stats Generator)</span>
              </h2>
              <p className="text-xs text-amber-200 font-medium">
                تحديد بيانات المؤسسة، النسبة المئوية، إضافة وتخصيص الفئات المهنية، وتوليد الجلسات بدقة رياضية فورية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-amber-200 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          
          {/* Presets Shortcuts */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="font-black text-slate-700 flex items-center gap-1.5 text-xs">
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>نماذج جاهزة سريعة (Presets):</span>
            </span>
            <div className="flex items-center flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyPreset("who_standard")}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold transition-all cursor-pointer text-xs"
              >
                نموذج قياسي (10 جلسات - 100 فرصة - 85%)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("high_performance")}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold transition-all cursor-pointer text-xs"
              >
                امتثال ممتاز (15 جلسة - 150 فرصة - 92%)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("comprehensive_audit")}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold transition-all cursor-pointer text-xs"
              >
                تدقيق شامل + صيادلة ومختبر (20 جلسة - 200 فرصة)
              </button>
            </div>
          </div>

          {/* Section 1: Facility & Institution Data */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 className="w-4 h-4 text-orange-600" />
              <span>1. بيانات المنشأة والمؤسسة الصحية والفترة</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المؤسسة / المستشفى / المركز</label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="مثال: مستشفى الحياة التخصصي"
                  className="w-full font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">القسم / الوحدة / الإدارة</label>
                <input
                  type="text"
                  value={departmentTitle}
                  onChange={(e) => setDepartmentTitle(e.target.value)}
                  placeholder="مثال: قسم مكافحة العدوى والجودة"
                  className="w-full font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مسمى الفترة الإحصائية</label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="مثال: الربع الأول (Q1 2026) أو شهر مارس 2026"
                  className="w-full font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-amber-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الجناح / الوحدة المرصودة (Ward)</label>
                <input
                  type="text"
                  value={wardName}
                  onChange={(e) => setWardName(e.target.value)}
                  placeholder="مثال: جناح الجراحة العامة والعناية"
                  className="w-full font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع القسم (WHO Classification)</label>
                <select
                  value={departmentCategory}
                  onChange={(e) => setDepartmentCategory(e.target.value)}
                  className="w-full font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="surgery">جراحة (Surgery)</option>
                  <option value="intensive care">عناية مركزة (ICU / CCU)</option>
                  <option value="medical">باطنة (Medical)</option>
                  <option value="emergency unit">طوارئ (Emergency)</option>
                  <option value="paediatrics">أطفال وحضانات (Paediatrics/NICU)</option>
                  <option value="obstetrics">نساء وتوليد (Obstetrics)</option>
                  <option value="ambulatory care">عيادات خارجية (Outpatient)</option>
                  <option value="mixed">مختلط (Mixed Medical & Surgical)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">راصد مكافحة العدوى (Observer)</label>
                <input
                  type="text"
                  value={observerName}
                  onChange={(e) => setObserverName(e.target.value)}
                  placeholder="اسم الراصد"
                  className="w-full font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Number of Sessions & Opportunities Per Category */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>2. تسمية وتخصيص الفئات المهنية وتحديد الفرص والجلسات</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  يمكنك النقر على اسم أي فئة مهنية لتعديل تسميتها مباشرة، وتعديل الفرص، أو إضافة فئات إضافية
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-xs font-black text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  إجمالي الفرص: {livePreview.totalOpps} فرصة | الجلسات: {sessionsCount}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCategoryForm((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-xs cursor-pointer active:scale-98 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>إضافة فئة مهنية أخرى</span>
                </button>
              </div>
            </div>

            {/* Sessions Count & Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              
              {/* Sessions Count Card */}
              <div className="p-3.5 bg-amber-50/80 border-2 border-amber-300 rounded-2xl space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block font-black text-amber-950 text-xs">
                      عدد جلسات الرصد (Sessions)
                    </label>
                    <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                      رئيسي
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-semibold block mt-0.5">
                    إجمالي استمارات الرصد الميداني
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={sessionsCount}
                    onChange={(e) => setSessionsCount(Math.max(1, Number(e.target.value)))}
                    className="w-full font-black text-base px-3 py-2 rounded-xl border border-amber-300 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 font-mono text-center"
                  />
                  <span className="text-xs font-bold text-amber-900 shrink-0">جلسة</span>
                </div>
              </div>

              {/* Dynamic Categories Cards */}
              {categories.map((cat, idx) => {
                const badge = getMainCategoryBadge(cat.mainCategory);
                const isNurse = cat.mainCategory === "1";
                const isAux = cat.mainCategory === "2";
                const isDoc = cat.mainCategory === "3";

                const cardBg = isNurse
                  ? "bg-blue-50/70 border-blue-200 hover:border-blue-300"
                  : isAux
                  ? "bg-slate-50 border-slate-200 hover:border-slate-300"
                  : isDoc
                  ? "bg-purple-50/70 border-purple-200 hover:border-purple-300"
                  : "bg-emerald-50/70 border-emerald-200 hover:border-emerald-300";

                return (
                  <div
                    key={cat.id}
                    className={`p-3.5 border rounded-2xl space-y-2 flex flex-col justify-between transition-all ${cardBg}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex-1">
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              value={cat.name}
                              onChange={(e) => handleUpdateCategoryName(cat.id, e.target.value)}
                              className="font-black text-xs text-slate-900 bg-white/80 hover:bg-white focus:bg-white pl-6 pr-2 py-1 rounded-lg border border-slate-300/80 hover:border-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-300 focus:outline-none w-full shadow-2xs transition-all"
                              placeholder="اسم الفئة المهنية..."
                              title="انقر لتعديل وتسمية الفئة المهنية كما تريد"
                            />
                            <Edit3 className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
                          </div>
                        </div>
                        {categories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(cat.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                            title="حذف هذه الفئة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          كود: {cat.code}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                        <span>الفرص المرصودة (Opps):</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {livePreview.categoryDetails.find((d) => d.id === cat.id)?.actions || 0} مطبق
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateCategoryOpps(cat.id, cat.opps - 5)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-black hover:bg-slate-100 flex items-center justify-center cursor-pointer active:scale-95"
                          title="إنقاص 5 فرص"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={cat.opps}
                          onChange={(e) => handleUpdateCategoryOpps(cat.id, Number(e.target.value))}
                          className="w-full font-black text-sm px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-900 text-center font-mono focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateCategoryOpps(cat.id, cat.opps + 5)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-black hover:bg-slate-100 flex items-center justify-center cursor-pointer active:scale-95"
                          title="زيادة 5 فرص"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Inline Quick Add Form & Popular Templates */}
            {showAddCategoryForm && (
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 p-4 rounded-2xl border-2 border-emerald-300 shadow-sm space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <h4 className="font-black text-xs text-emerald-950 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-700 stroke-[3]" />
                    <span>إضافة فئة مهنية جديدة إلى إحصائية الرصد الميداني</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryForm(false)}
                    className="p-1 rounded-lg text-emerald-800 hover:bg-emerald-200 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick 1-Click Preset Buttons */}
                <div>
                  <span className="block text-[11px] font-bold text-emerald-900 mb-1.5">
                    اختيار سريع لفئات صحية شائعة بالمستشفيات (نقرة واحدة):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_EXTRA_CATEGORIES.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleQuickAddPreset(preset)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-102"
                      >
                        <span>{preset.icon}</span>
                        <span>{preset.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Category Input Form */}
                <div className="pt-2 border-t border-emerald-200/80">
                  <span className="block text-[11px] font-bold text-emerald-900 mb-1.5">
                    أو كتابة وتحديد فئة مخصصة بالكامل:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">اسم الفئة المهنية المخصصة</label>
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="مثال: فنيو قسطرة قلبية أو مسؤولو تعقيم..."
                        className="w-full font-bold px-3 py-1.5 rounded-xl border border-emerald-300 bg-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">التصنيف الرئيسي (WHO Category)</label>
                      <select
                        value={newCatMain}
                        onChange={(e) => {
                          const val = e.target.value as "1" | "2" | "3" | "4";
                          setNewCatMain(val);
                          setNewCatCode(val === "1" ? "1.1" : val === "2" ? "2.0" : val === "3" ? "3.1" : "4.3");
                        }}
                        className="w-full font-bold px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="1">1. تمريض وقبالة (Nurse)</option>
                        <option value="2">2. مساعدو الخدمات (Auxiliary)</option>
                        <option value="3">3. الأطباء البشريين (Doctor)</option>
                        <option value="4">4. كوادر صحية أخرى (Other HCW)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">عدد الفرص المبدئية</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          value={newCatOpps}
                          onChange={(e) => setNewCatOpps(Math.max(1, Number(e.target.value)))}
                          className="w-full font-black px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-white text-xs text-center font-mono focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          disabled={!newCatName.trim()}
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-xs shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
                        >
                          إضافة
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Section 3: Statistical Percentages & Compliance Targets */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-600" />
                <span>3. تحديد النسبة المئوية للإحصائية ونسب الامتثال لكافة الفئات</span>
              </h3>
              <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={customCategoryRates}
                  onChange={(e) => setCustomCategoryRates(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span>تحديد نسبة امتثال مخصصة لكل فئة مهنية</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
              
              {/* Overall Target Rate */}
              <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-xl space-y-1">
                <label className="block font-black text-emerald-950">
                  النسبة الإجمالية المستهدفة (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overallTarget}
                  onChange={(e) => setOverallTarget(Number(e.target.value))}
                  className="w-full font-black text-base px-3 py-1.5 rounded-lg border border-emerald-400 bg-white text-emerald-800 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <span className="text-[10px] text-emerald-800 font-bold block">معدل الامتثال الكلي العام</span>
              </div>

              {/* Dynamic Categories Compliance % */}
              {categories.map((cat) => {
                const detail = livePreview.categoryDetails.find((d) => d.id === cat.id);
                const currentRate = customCategoryRates ? (cat.targetRate ?? overallTarget) : (detail?.rate ?? overallTarget);
                const cleanCatName = cat.name.trim() || `فئة ${cat.code}`;

                return (
                  <div key={cat.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <label className="block font-bold text-slate-800 truncate text-[11px]" title={cleanCatName}>
                      امتثال: {cleanCatName} %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      disabled={!customCategoryRates}
                      value={currentRate}
                      onChange={(e) => handleUpdateCategoryRate(cat.id, Number(e.target.value))}
                      className="w-full font-black text-sm px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-500 font-semibold block">
                      {detail?.actions || 0} مطبق من {cat.opps} فرصة
                    </span>
                  </div>
                );
              })}

            </div>

            {/* Handrub Preference Slider */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-700 block">
                  توزيع نوع الإجراء: المطهر الكحولي (HR) مقابل الغسيل بالماء والصابون (HW)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  الموصى به من WHO: تفضيل استخدام المطهر الكحولي بنسبة 70% إلى 85%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs">
                  %{handrubRatio} كحول (HR) / %{100 - handrubRatio} ماء وصابون (HW)
                </span>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={handrubRatio}
                  onChange={(e) => setHandrubRatio(Number(e.target.value))}
                  className="w-28 accent-amber-600"
                />
              </div>
            </div>

            {/* Auto Save to Archive Toggle */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between bg-amber-50/80 p-3 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-slate-900 text-xs block">
                    حفظ وأرشفة الإحصائية تلقائياً في الأرشيف (Auto-Archive)
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    يتم حفظ نسخة تاريخية كاملة مباشرة في الأرشيف للرجوع إليها في أي وقت
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveArchive}
                  onChange={(e) => setAutoSaveArchive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>

          {/* Section 4: Live Math Accuracy Preview Card */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 rounded-2xl p-4 border-2 border-amber-400/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                <Calculator className="w-4 h-4 text-amber-600" />
                <span>معاينة النتيجة الرياضية الدقيقة للإحصائية قبل التطبيق:</span>
              </span>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full">
                معدل الامتثال الناتج: %{livePreview.calculatedOverall}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 font-sans font-bold">الفرص الإجمالية</div>
                <div className="text-base font-black text-slate-900">{livePreview.totalOpps}</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 font-sans font-bold">الإجراءات المطبقة</div>
                <div className="text-base font-black text-emerald-700">{livePreview.totalActions}</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 font-sans font-bold">عدد الاستمارات (WHO Forms)</div>
                <div className="text-base font-black text-blue-700">{sessionsCount} جلسة</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 font-sans font-bold">جاهزية التقرير للطباعة</div>
                <div className="text-xs font-black text-emerald-700 font-sans flex items-center justify-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>5 صفحات جاهزة</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer with 3 Direct Completion Actions */}
        <div className="bg-slate-100 p-4 sm:p-5 border-t border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>سيتم إنشاء الإحصائية بدقة رياضية 100% وحفظها تلقائياً في Google Sheets والأرشيف</span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 w-full lg:w-auto">
            <button
              onClick={onClose}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 transition-all cursor-pointer text-xs"
            >
              إلغاء
            </button>

            {/* 1. Print Directly Button */}
            <button
              onClick={() => handleGenerateAndApply("print")}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-98"
              title="توليد الإحصائية وفتح نافذة الطباعة / الحفظ كـ PDF فوراً"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>توليد والطباعة فوراً (PDF)</span>
            </button>

            {/* 2. Download Word Directly Button */}
            <button
              onClick={() => handleGenerateAndApply("word")}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-98"
              title="توليد الإحصائية وتنزيل ملف التقرير بصيغة Microsoft Word فوراً"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-200" />
              <span>توليد وتحميل Word (.docx)</span>
            </button>

            {/* 3. Save to Google Sheets & Archive & Apply Button */}
            <button
              onClick={() => handleGenerateAndApply("save")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer"
              title="حفظ الإحصائية في Google Sheets، وأرشفتها تلقائياً وتطبيقها على المنظومة"
            >
              <Save className="w-4 h-4 text-emerald-200 stroke-[2.5]" />
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
              <span>توليد وحفظ في Google Sheets والأرشيف</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
