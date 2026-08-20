import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Save,
  ArrowRight,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  Building,
  Lightbulb,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  CheckSquare,
  Square,
  ListChecks,
} from "lucide-react";
import { CenterSettings, RoundObservation, RoundReport, StandardObservationItem } from "../types";
import { STANDARD_OBSERVATIONS_LIBRARY, OBSERVATION_CATEGORIES } from "../data/standardObservations";

interface RoundFormProps {
  initialRound?: RoundReport | null;
  centerSettings: CenterSettings;
  onSave: (round: RoundReport) => void;
  onCancel: () => void;
}

export const RoundForm: React.FC<RoundFormProps> = ({
  initialRound,
  centerSettings,
  onSave,
  onCancel,
}) => {
  const isNewRound = !initialRound;
  const [title, setTitle] = useState<string>(
    initialRound?.title || "تقرير المرور الاسبوعي لمكافحة العدوى"
  );
  const [day, setDay] = useState<string>(() => {
    if (initialRound?.day) return initialRound.day;
    const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return dayNames[new Date().getDay()] || "الأحد";
  });
  const [date, setDate] = useState<string>(
    initialRound?.date || new Date().toISOString().split("T")[0].replace(/-/g, "/")
  );
  const [period, setPeriod] = useState<string>(initialRound?.period || "صباحي");
  const [inspector, setInspector] = useState<string>(
    initialRound?.inspector || centerSettings.infectionControlLead || "مشرف مكافحة العدوى"
  );
  const [supervisorRole, setSupervisorRole] = useState<string>(
    initialRound?.supervisorRole || "مشرف مكافحة العدوى"
  );

  const [observations, setObservations] = useState<RoundObservation[]>(() => {
    if (initialRound?.observations && initialRound.observations.length > 0) {
      return initialRound.observations;
    }
    // Default initial row
    return [
      {
        id: `ro-${Date.now()}-1`,
        location: centerSettings.departments[0] || "غرفة العمليات",
        observation: "",
        recommendation: "",
        responsible: "مشرف التمريض / مسؤول مكافحة العدوى",
        status: "in_progress",
      },
    ];
  });

  // Categorized Observations Multi-Select State
  const [showObservationBank, setShowObservationBank] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  // Track which observation row has its autocomplete suggestions dropdown open
  const [activeSuggestionRowId, setActiveSuggestionRowId] = useState<string | null>(null);
  const [dropdownCategoryFilter, setDropdownCategoryFilter] = useState<string>("الكل");

  // AI loading per observation
  const [aiLoadingIdx, setAiLoadingIdx] = useState<number | null>(null);

  // Success toast for added items
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Full standard library items (including custom)
  const allLibraryItems = useMemo(() => {
    try {
      const saved = localStorage.getItem("ic_custom_observations");
      const custom: StandardObservationItem[] = saved ? JSON.parse(saved) : [];
      return [...custom, ...STANDARD_OBSERVATIONS_LIBRARY];
    } catch {
      return STANDARD_OBSERVATIONS_LIBRARY;
    }
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add("الكل");
    allLibraryItems.forEach((i) => cats.add(i.category));
    return Array.from(cats);
  }, [allLibraryItems]);

  // Filtered observations for the multi-select bank
  const filteredBankItems = useMemo(() => {
    return allLibraryItems.filter((item) => {
      const matchCat = selectedCategory === "الكل" || item.category === selectedCategory;
      const matchSev = severityFilter === "all" || item.severity === severityFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.observation.toLowerCase().includes(q) ||
        item.recommendation.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.standardRef && item.standardRef.toLowerCase().includes(q));
      return matchCat && matchSev && matchSearch;
    });
  }, [allLibraryItems, selectedCategory, severityFilter, searchQuery]);

  // Group items by category for structured layout
  const groupedBankItems = useMemo(() => {
    const groups: { [key: string]: StandardObservationItem[] } = {};
    filteredBankItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredBankItems]);

  // Toggle single item selection checkbox
  const handleToggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all currently visible filtered items
  const handleSelectAllVisible = () => {
    const visibleIds = filteredBankItems.map((i) => i.id);
    const allSelected = visibleIds.every((id) => selectedItemIds.includes(id));
    if (allSelected) {
      setSelectedItemIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedItemIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Clear all selections
  const handleClearSelections = () => {
    setSelectedItemIds([]);
  };

  // 🌟 Bulk Insert Selected Observations into Round Report 🌟
  const handleAddSelectedToReport = () => {
    if (selectedItemIds.length === 0) {
      alert("يرجى تحديد ملاحظة واحدة على الأقل بالضغط على المربع الصغير لإضافتها.");
      return;
    }

    const selectedItems = allLibraryItems.filter((item) =>
      selectedItemIds.includes(item.id)
    );

    const newRows: RoundObservation[] = selectedItems.map((item, idx) => ({
      id: `ro-bulk-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
      location: item.location || item.category,
      observation: item.observation,
      recommendation: item.recommendation,
      responsible: item.responsible || "مشرف القسم / مسؤول مكافحة العدوى",
      status: "in_progress",
      dueDate: item.duration || "فوري",
    }));

    setObservations((prev) => {
      // If table only has 1 empty initial row, replace it
      const isSingleEmpty = prev.length === 1 && !prev[0].observation.trim();
      return isSingleEmpty ? newRows : [...prev, ...newRows];
    });

    const count = newRows.length;
    setSelectedItemIds([]);
    showToast(`✅ تمت إضافة (${count}) ملاحظات مختارة بنجاح إلى جدول التقرير`);

    // Smooth scroll down to observations table
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Add empty row manually
  const handleAddObservation = (defaultLocation?: string) => {
    const newId = `ro-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newObs: RoundObservation = {
      id: newId,
      location: defaultLocation || centerSettings.departments[0] || "غرفة العمليات",
      observation: "",
      recommendation: "",
      responsible: "مشرف التمريض / مسؤول مكافحة العدوى",
      status: "in_progress",
    };
    setObservations((prev) => [...prev, newObs]);
    setActiveSuggestionRowId(newId);
  };

  const handleUpdateObservation = (
    id: string,
    field: keyof RoundObservation,
    value: any
  ) => {
    setObservations((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  };

  const handleRemoveObservation = (id: string) => {
    setObservations((prev) => prev.filter((o) => o.id !== id));
    if (activeSuggestionRowId === id) {
      setActiveSuggestionRowId(null);
    }
  };

  // Apply a standard suggestion into a specific row
  const handleSelectSuggestionForRow = (rowId: string, item: StandardObservationItem) => {
    setObservations((prev) =>
      prev.map((o) => {
        if (o.id === rowId) {
          return {
            ...o,
            location: item.location || o.location,
            observation: item.observation,
            recommendation: item.recommendation,
            responsible: item.responsible || o.responsible,
            dueDate: item.duration || o.dueDate,
          };
        }
        return o;
      })
    );
    setActiveSuggestionRowId(null);
    showToast(`تم اختيار الملاحظة وتعبئة التوصية والمسؤول تلقائياً`);
  };

  // Call Gemini API to suggest corrective action for a specific observation
  const handleAiSuggestCorrectiveAction = async (idx: number) => {
    const obs = observations[idx];
    if (!obs.observation.trim()) {
      alert("يرجى كتابة الملاحظة أولاً ليقوم الذكاء الاصطناعي باقتراح الإجراء التصحيحي المناسب.");
      return;
    }

    try {
      setAiLoadingIdx(idx);
      const res = await fetch("/api/ai/suggest-corrective-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observation: obs.observation,
          department: obs.location,
        }),
      });

      if (!res.ok) throw new Error("Failed to call AI");
      const data = await res.json();

      if (data.recommendation) {
        handleUpdateObservation(obs.id, "recommendation", data.recommendation);
      }
      if (data.responsible && !obs.responsible) {
        handleUpdateObservation(obs.id, "responsible", data.responsible);
      }
      showToast("تم توليد التوصية التصحيحية بنجاح");
    } catch (err) {
      console.error(err);
      alert("تعذر الاتصال بالمساعد الذكي حالياً.");
    } finally {
      setAiLoadingIdx(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reportToSave: RoundReport = {
      id: initialRound?.id || `round-${Date.now()}`,
      title: title.trim() || "تقرير المرور الاسبوعي لمكافحة العدوى",
      day: day.trim() || "الأحد",
      date: date.trim() || new Date().toISOString().split("T")[0],
      period: period.trim() || "صباحي",
      inspector: inspector.trim() || "مشرف مكافحة العدوى",
      supervisorRole: supervisorRole.trim() || "مشرف مكافحة العدوى",
      centerName: centerSettings.centerName,
      observations: observations.filter(
        (o) => o.observation.trim().length > 0 || o.recommendation.trim().length > 0
      ),
      createdAt: initialRound?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(reportToSave);
  };

  // Helper to filter suggestions for a specific row based on user input text & row location
  const getSuggestionsForRow = (rowObs: RoundObservation) => {
    const query = (rowObs.observation || "").trim().toLowerCase();
    const loc = (rowObs.location || "").trim().toLowerCase();

    return allLibraryItems.filter((item) => {
      if (dropdownCategoryFilter !== "الكل" && item.category !== dropdownCategoryFilter) {
        return false;
      }

      if (query.length > 0) {
        return (
          item.observation.toLowerCase().includes(query) ||
          item.recommendation.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query) ||
          (item.standardRef && item.standardRef.toLowerCase().includes(query))
        );
      }

      if (loc.length > 0) {
        const matchLoc =
          item.location.toLowerCase().includes(loc) ||
          item.category.toLowerCase().includes(loc) ||
          loc.includes(item.location.toLowerCase()) ||
          loc.includes(item.category.toLowerCase());
        return matchLoc;
      }

      return true;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-20">
      
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 sticky top-16 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>إلغاء</span>
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {initialRound ? "تعديل تقرير المرور الميداني" : "تسجيل جولة مرور ميدانية جديدة"}
            </h2>
            <p className="text-xs text-slate-500">
              حدد الملاحظات المطلوبة من الأقسام عبر المربعات ثم اضغط (إضافة للتقرير)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Bank Toggle Button */}
          <button
            type="button"
            onClick={() => setShowObservationBank(!showObservationBank)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              showObservationBank
                ? "bg-blue-700 text-white"
                : "text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200"
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>{showObservationBank ? "إخفاء بنك الملاحظات" : "عرض بنك الملاحظات المعتمدة"}</span>
            {selectedItemIds.length > 0 && (
              <span className="bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full font-black text-[10px]">
                {selectedItemIds.length}
              </span>
            )}
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ تقرير المرور ومعاينته</span>
          </button>
        </div>
      </div>

      {/* 🌟 1. CATEGORIZED OBSERVATION BANK WITH CHECKBOXES (مقسمة إلى أقسام بمربعات اختيار) 🌟 */}
      {showObservationBank && (
        <div className="bg-gradient-to-br from-blue-50/70 via-white to-slate-50 rounded-2xl p-4 sm:p-6 border-2 border-blue-200 shadow-sm space-y-4">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-blue-100 pb-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs shrink-0 mt-0.5">
                <ListChecks className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    بنك ملاحظات مكافحة العدوى المعتمدة (مقسمة حسب الأقسام)
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {allLibraryItems.length} ملاحظة معتمدة
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  ضع علامة داخل <strong>المربع الصغير ☑️</strong> أمام الملاحظات المرصودة من أي قسم، ثم اضغط على زر <strong>(إضافة للتقرير)</strong> بالأسفل أو بالأعلى.
                </p>
              </div>
            </div>

            {/* Action Buttons: Add Selected to Report */}
            <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
              {selectedItemIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSelections}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  إلغاء التحديد ({selectedItemIds.length})
                </button>
              )}

              <button
                type="button"
                onClick={handleAddSelectedToReport}
                disabled={selectedItemIds.length === 0}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all shadow-md cursor-pointer ${
                  selectedItemIds.length > 0
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400 animate-pulse"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>إضافة للتقرير ({selectedItemIds.length})</span>
              </button>
            </div>
          </div>

          {/* Search & Severity Filters */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative grow">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في جميع الملاحظات (مثال: تعقيم، كراتين، غسيل أيدي، نفايات، كمامة، هواء، ضغط...)"
                className="w-full pr-10 pl-3 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Bulk Select Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSelectAllVisible}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>تحديد الكل في هذا العرض ({filteredBankItems.length})</span>
              </button>

              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSeverityFilter("all")}
                  className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                    severityFilter === "all" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => setSeverityFilter("critical")}
                  className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                    severityFilter === "critical" ? "bg-rose-600 text-white" : "text-rose-700 hover:bg-rose-50"
                  }`}
                >
                  حرجة / فوري
                </button>
                <button
                  type="button"
                  onClick={() => setSeverityFilter("high")}
                  className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                    severityFilter === "high" ? "bg-amber-600 text-white" : "text-amber-700 hover:bg-amber-50"
                  }`}
                >
                  عالية
                </button>
              </div>
            </div>
          </div>

          {/* Department / Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar border-b border-slate-200">
            {categories.map((cat) => {
              const count =
                cat === "الكل"
                  ? allLibraryItems.length
                  : allLibraryItems.filter((i) => i.category === cat).length;
              
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grouped Categorized Items List with Checkboxes */}
          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1 pl-1 bg-white/60 p-3 rounded-2xl border border-blue-100">
            {Object.keys(groupedBankItems).length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Lightbulb className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-sm font-bold">لا توجد ملاحظات مطابقة لمعايير البحث أو التصفية الحالية</p>
                <p className="text-xs text-slate-400">جرب كتابة كلمات بحث أخرى أو اختر تصنيف "الكل"</p>
              </div>
            ) : (
              Object.entries(groupedBankItems).map(([categoryName, items]) => (
                <div
                  key={categoryName}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5"
                >
                  {/* Category Group Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {categoryName}
                      </h4>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.2 rounded-md">
                        {items.length} ملاحظات
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const catIds = items.map((i) => i.id);
                        const allCatSelected = catIds.every((id) => selectedItemIds.includes(id));
                        if (allCatSelected) {
                          setSelectedItemIds((prev) => prev.filter((id) => !catIds.includes(id)));
                        } else {
                          setSelectedItemIds((prev) => Array.from(new Set([...prev, ...catIds])));
                        }
                      }}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:bg-blue-50 px-2 py-0.5 rounded cursor-pointer"
                    >
                      تحديد كل قسم ({categoryName.split(" ")[0]})
                    </button>
                  </div>

                  {/* Observation Cards with Checkboxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {items.map((item) => {
                      const isChecked = selectedItemIds.includes(item.id);

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleItemSelection(item.id)}
                          className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer text-right flex items-start gap-3 select-none ${
                            isChecked
                              ? "bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-500"
                              : "bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          {/* 🌟 Small Checkbox 🌟 */}
                          <div className="pt-0.5 shrink-0">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                isChecked
                                  ? "bg-blue-600 text-white shadow-2xs"
                                  : "border-2 border-slate-400 bg-white hover:border-blue-500"
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="grow space-y-1.5 min-w-0">
                            {/* Badges */}
                            <div className="flex items-center justify-between gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Building className="w-3 h-3 text-blue-600" />
                                {item.location}
                              </span>

                              <div className="flex items-center gap-1">
                                {item.severity === "critical" && (
                                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 flex items-center gap-0.5">
                                    <AlertTriangle className="w-2.5 h-2.5" /> فوري
                                  </span>
                                )}
                                {item.severity === "high" && (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                    عالي
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Observation Text */}
                            <p className="text-xs font-bold text-slate-900 leading-snug">
                              <span className="text-rose-700 font-extrabold ml-1">الملاحظة:</span>
                              {item.observation}
                            </p>

                            {/* Recommendation Text */}
                            <p className="text-[11px] text-slate-700 leading-snug">
                              <span className="text-blue-700 font-bold ml-1">التوصية:</span>
                              {item.recommendation}
                            </p>

                            {/* Metadata */}
                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                              <span><strong>المسؤول:</strong> {item.responsible}</span>
                              <span><strong>المدة:</strong> {item.duration}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sticky Bottom Bar within the Bank for Easy Insertion */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-blue-100 bg-white/80 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                إجمالي الملاحظات المحددة حالياً:
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-black text-xs">
                {selectedItemIds.length} ملاحظة
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddSelectedToReport}
              disabled={selectedItemIds.length === 0}
              className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all shadow-md cursor-pointer ${
                selectedItemIds.length > 0
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>إضافة الملاحظات المحددة للتقرير ({selectedItemIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Basic Metadata (اليوم / التاريخ / الفترة / القائم بالمرور) */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-3 flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-600" />
          <span>بيانات جولة المرور الميدانية</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              عنوان التقرير
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 font-bold"
              placeholder="تقرير المرور الاسبوعي لمكافحة العدوى"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اليوم</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5"
            >
              <option value="السبت">السبت</option>
              <option value="الأحد">الأحد</option>
              <option value="الاثنين">الاثنين</option>
              <option value="الثلاثاء">الثلاثاء</option>
              <option value="الأربعاء">الأربعاء</option>
              <option value="الخميس">الخميس</option>
              <option value="الجمعة">الجمعة</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ</label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 font-medium"
              placeholder="2026/06/28"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الفترة</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5"
            >
              <option value="صباحي">صباحي</option>
              <option value="مسائي">مسائي</option>
              <option value="طوارئ / نوبتجية">طوارئ / نوبتجية</option>
              <option value="مرور مفاجئ">مرور مفاجئ</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              القائم بالمرور
            </label>
            <input
              type="text"
              value={inspector}
              onChange={(e) => setInspector(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 font-semibold"
              placeholder="مشرف مكافحة العدوى"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              المسمى الوظيفي للمشرف
            </label>
            <input
              type="text"
              value={supervisorRole}
              onChange={(e) => setSupervisorRole(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 font-semibold"
              placeholder="مشرف مكافحة العدوى"
            />
          </div>
        </div>
      </div>

      {/* 3. Observations Table with Auto-suggest on Typing & Injected Items */}
      <div ref={tableRef} className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span>جدول بنود وملاحظات التقرير المرصودة</span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                {observations.length} بند مسجل
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              الملاحظات والتوصيات المضافة للتقرير — يمكنك تعديل أي نص أو موقع أو مسؤول بحرية
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setShowObservationBank(true);
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
            >
              <ListChecks className="w-4 h-4 text-blue-600" />
              <span>+ اختيار المزيد من بنك الأقسام</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddObservation()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سطر فارغ</span>
            </button>
          </div>
        </div>

        {observations.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/30 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <Lightbulb className="w-6 h-6 text-amber-500 fill-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">لا توجد ملاحظات مسجلة في جدول التقرير حتى الآن</p>
              <p className="text-xs text-slate-500 mt-1">
                حدد الملاحظات المطلوبة من قائمة الأقسام بالأعلى واضغط (إضافة للتقرير)، أو أضف سطراً يدوياً
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowObservationBank(true);
                  window.scrollTo({ top: 100, behavior: "smooth" });
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ListChecks className="w-4 h-4" />
                <span>فتح بنك الملاحظات واختيار بنود</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddObservation()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ إضافة سطر يدوياً</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {observations.map((obs, idx) => {
              const isDropdownOpen = activeSuggestionRowId === obs.id;
              const suggestions = getSuggestionsForRow(obs);

              return (
                <div
                  key={obs.id || idx}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-300 space-y-3 relative shadow-2xs transition-all hover:border-slate-400"
                >
                  {/* Row Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 bg-white border border-slate-300 px-2.5 py-0.5 rounded-md shadow-2xs">
                        بند #{idx + 1}
                      </span>
                      {obs.dueDate && (
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          المدة: {obs.dueDate}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveObservation(obs.id)}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-md text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      title="حذف هذا البند"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>

                  {/* Main Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    
                    {/* Location Field */}
                    <div className="sm:col-span-4">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        الموقع / القسم
                      </label>
                      <input
                        type="text"
                        list={`deps-list-${idx}`}
                        value={obs.location}
                        onChange={(e) => {
                          handleUpdateObservation(obs.id, "location", e.target.value);
                        }}
                        placeholder="غرفة العمليات / التعقيم..."
                        className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        required
                      />
                      <datalist id={`deps-list-${idx}`}>
                        {centerSettings.departments.map((d) => (
                          <option key={d} value={d} />
                        ))}
                      </datalist>
                    </div>

                    {/* Observation Field with Real-time Suggestions Popover */}
                    <div className="sm:col-span-8 relative">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span>الملاحظة (القصور أو عدم المطابقة المرصودة)</span>
                        </label>

                        <div className="flex items-center gap-2">
                          {/* Toggle Suggestions button */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSuggestionRowId(isDropdownOpen ? null : obs.id);
                            }}
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 transition-colors cursor-pointer ${
                              isDropdownOpen
                                ? "bg-blue-600 text-white border-blue-600"
                                : "text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100"
                            }`}
                            title="عرض قائمة الملاحظات المقترحة لهذا البند"
                          >
                            <Lightbulb className="w-3 h-3 text-amber-500 fill-amber-400" />
                            <span>{isDropdownOpen ? "إغلاق المقترحات" : "اقتراحات"}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                          </button>

                          {/* AI Correction Generator */}
                          <button
                            type="button"
                            onClick={() => handleAiSuggestCorrectiveAction(idx)}
                            disabled={aiLoadingIdx === idx}
                            className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1 cursor-pointer"
                            title="اقتراح الإجراء التصحيحي بالذكاء الاصطناعي"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span>{aiLoadingIdx === idx ? "جاري..." : "اقتراح AI"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Observation Textarea */}
                      <textarea
                        rows={2}
                        value={obs.observation}
                        onChange={(e) => {
                          handleUpdateObservation(obs.id, "observation", e.target.value);
                          if (!isDropdownOpen) {
                            setActiveSuggestionRowId(obs.id);
                          }
                        }}
                        onFocus={() => {
                          setActiveSuggestionRowId(obs.id);
                        }}
                        placeholder="ابدأ بكتابة الملاحظة أو عدل عليها..."
                        className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-hidden"
                        required
                      />

                      {/* Floating Autocomplete */}
                      {isDropdownOpen && (
                        <div className="absolute top-full right-0 left-0 mt-1 z-40 bg-white rounded-xl shadow-2xl border border-blue-300 p-3 space-y-2.5 animate-in fade-in slide-in-from-top-2 max-w-2xl">
                          
                          {/* Dropdown Header & Category Selector */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                              <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
                              <span>ملاحظات مقترحة مطابقة ({suggestions.length})</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setActiveSuggestionRowId(null)}
                              className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Suggestions List */}
                          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5 divide-y divide-slate-100">
                            {suggestions.length === 0 ? (
                              <div className="py-4 text-center text-xs text-slate-500">
                                لا توجد اقتراحات مطابقة تماماً لنص البحث
                              </div>
                            ) : (
                              suggestions.slice(0, 10).map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() => handleSelectSuggestionForRow(obs.id, item)}
                                  className="pt-2 first:pt-0 p-2 rounded-lg hover:bg-blue-50/80 cursor-pointer transition-colors text-right group border border-transparent hover:border-blue-200"
                                >
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                        {item.location}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-medium">
                                        ({item.category})
                                      </span>
                                    </div>

                                    <span className="text-[11px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                      <Check className="w-3 h-3" />
                                      <span>اختيار</span>
                                    </span>
                                  </div>

                                  <p className="text-xs font-bold text-slate-900 group-hover:text-blue-950 leading-snug">
                                    {item.observation}
                                  </p>
                                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                                    <strong className="text-blue-700">التوصية:</strong> {item.recommendation}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recommendation & Responsible Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                    {/* Recommendations */}
                    <div className="sm:col-span-8">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        التوصيات / الإجراء التصحيحي المطلوب
                      </label>
                      <textarea
                        rows={2}
                        value={obs.recommendation}
                        onChange={(e) =>
                          handleUpdateObservation(obs.id, "recommendation", e.target.value)
                        }
                        placeholder="التوصية أو الإجراء التصحيحي المعتمد لتلافي القصور..."
                        className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        required
                      />
                    </div>

                    {/* Responsible */}
                    <div className="sm:col-span-4">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        المسؤول عن التنفيذ
                      </label>
                      <input
                        type="text"
                        value={obs.responsible}
                        onChange={(e) =>
                          handleUpdateObservation(obs.id, "responsible", e.target.value)
                        }
                        placeholder="مشرف التمريض / مسؤول القسم"
                        className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        required
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => handleAddObservation()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة بند ملاحظة آخر</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ تقرير المرور ومعاينته</span>
          </button>
        </div>
      </div>

    </form>
  );
};

