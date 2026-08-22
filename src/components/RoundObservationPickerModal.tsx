import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  Sparkles,
  Layers,
  Building,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Check,
  CheckSquare,
  Square,
  BookOpen,
  Filter,
  ListChecks,
  FileText,
  Clock,
  UserCheck,
} from "lucide-react";
import { StandardObservationItem } from "../types";
import {
  TODAY_ADDED_OBSERVATION_IDS,
  getTodayAddedObservations,
  isTodaySummaryObservation,
  sortWithTodaySummaryFirst,
} from "../data/todayObservationsSummary";
import { EGYPTIAN_INSPECTION_CONTROL_POLICIES } from "../data/infectionControlPolicies";
import { getAllCombinedObservations } from "../utils/customObservationsManager";

interface RoundObservationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectObservation: (item: StandardObservationItem) => void;
  onSelectMultipleObservations: (items: StandardObservationItem[]) => void;
  onAddEmptyRow?: () => void;
  currentDepartment?: string;
}

export const RoundObservationPickerModal: React.FC<RoundObservationPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectObservation,
  onSelectMultipleObservations,
  onAddEmptyRow,
  currentDepartment,
}) => {
  const [activeTab, setActiveTab] = useState<"today_summary" | "categories" | "policies" | "custom">("today_summary");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>("all");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [insertedFeedbackIds, setInsertedFeedbackIds] = useState<{ [id: string]: boolean }>({});

  // Custom row quick entry
  const [customLocation, setCustomLocation] = useState<string>(currentDepartment || "عيادة");
  const [customObs, setCustomObs] = useState<string>("");
  const [customRec, setCustomRec] = useState<string>("");
  const [customResp, setCustomResp] = useState<string>("مشرف التمريض / مسؤول مكافحة العدوى");

  const allObservations = useMemo(() => getAllCombinedObservations(), []);
  const todayObservations = useMemo(() => getTodayAddedObservations(), []);

  // Department categories list
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add("الكل");
    cats.add("عيادة");
    cats.add("فحوصات");
    cats.add("قسم داخلي");
    cats.add("عمليات");
    cats.add("إفاقة");
    allObservations.forEach((item) => cats.add(item.category));
    return Array.from(cats);
  }, [allObservations]);

  // Active items list based on current tab and filters (sorted with 35 summary observations first)
  const displayedItems = useMemo(() => {
    let source = activeTab === "today_summary" ? todayObservations : allObservations;

    if (activeTab === "policies" && selectedPolicyId !== "all") {
      source = allObservations.filter((i) => i.policyId === selectedPolicyId);
    }

    const filtered = source.filter((item) => {
      // Category filter (if not in today_summary or if specified)
      let matchCat = true;
      if (selectedCategory !== "الكل") {
        const text = `${item.category} ${item.location}`.toLowerCase();
        if (selectedCategory === "عيادة") matchCat = text.includes("عياد") || text.includes("كشف");
        else if (selectedCategory === "فحوصات") matchCat = text.includes("فحص") || text.includes("تشخيص") || text.includes("مختبر");
        else if (selectedCategory === "قسم داخلي") matchCat = text.includes("داخلي") || text.includes("تنويم");
        else if (selectedCategory === "عمليات") matchCat = text.includes("عمليات") || text.includes("جراح");
        else if (selectedCategory === "إفاقة") matchCat = text.includes("افاق") || text.includes("إفاق");
        else matchCat = item.category === selectedCategory || item.location.includes(selectedCategory);
      }

      // Severity filter
      const matchSev = selectedSeverity === "all" || item.severity === selectedSeverity;

      // Search query
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.observation.toLowerCase().includes(q) ||
        item.recommendation.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.policyName && item.policyName.toLowerCase().includes(q)) ||
        (item.standardRef && item.standardRef.toLowerCase().includes(q));

      return matchCat && matchSev && matchSearch;
    });

    return sortWithTodaySummaryFirst(filtered, currentDepartment);
  }, [activeTab, todayObservations, allObservations, selectedPolicyId, selectedCategory, selectedSeverity, searchQuery, currentDepartment]);

  if (!isOpen) return null;

  const handleToggleSelect = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = displayedItems.map((i) => i.id);
    const allSelected = visibleIds.every((id) => selectedItemIds.includes(id));
    if (allSelected) {
      setSelectedItemIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedItemIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleInsertSingle = (item: StandardObservationItem) => {
    onSelectObservation(item);
    setInsertedFeedbackIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setInsertedFeedbackIds((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }, 2000);
  };

  const handleInsertSelected = () => {
    if (selectedItemIds.length === 0) return;
    const selectedItems = allObservations.filter((item) =>
      selectedItemIds.includes(item.id)
    );
    onSelectMultipleObservations(selectedItems);
    setSelectedItemIds([]);
    onClose();
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customObs.trim()) return;
    const newItem: StandardObservationItem = {
      id: `custom-obs-${Date.now()}`,
      location: customLocation.trim() || "عام",
      category: customLocation.trim() || "ملاحظات عامة",
      observation: customObs.trim(),
      recommendation: customRec.trim() || "الالتزام بالمعايير القياسية لمكافحة العدوى",
      responsible: customResp.trim() || "مشرف التمريض / مسؤول مكافحة العدوى",
      duration: "فوري",
      monitoringMethod: "المرور الميداني",
      severity: "high",
    };
    onSelectObservation(newItem);
    setCustomObs("");
    setCustomRec("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  إضافة ملاحظات لتقرير المرور الميداني
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {displayedItems.length} ملاحظة متوفرة
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                اختر من ملخص اليوم، أو تصفح بنك الملاحظات حسب الأقسام، أو حدد عدة بنود لإدراجها دفعة واحدة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onAddEmptyRow && (
              <button
                type="button"
                onClick={() => {
                  onAddEmptyRow();
                  onClose();
                }}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة سطر فارغ</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Primary Selection Tabs */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("today_summary")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "today_summary"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>⭐ ملخص ملاحظات اليوم</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === "today_summary" ? "bg-white/25 text-white" : "bg-indigo-200 text-indigo-900"
            }`}>
              {TODAY_ADDED_OBSERVATION_IDS.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "categories"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>📂 بنك الملاحظات حسب الأقسام</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === "categories" ? "bg-white/25 text-white" : "bg-slate-200 text-slate-800"
            }`}>
              {allObservations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("policies")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "policies"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📜 سياسات مكافحة العدوى</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "custom"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>✍️ كتابة ملاحظة يدوية جديدة</span>
          </button>
        </div>

        {/* Filter Controls Bar (Visible on list tabs) */}
        {activeTab !== "custom" && (
          <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50 space-y-2.5 shrink-0">
            <div className="flex flex-col md:flex-row gap-2.5">
              {/* Search input */}
              <div className="relative grow">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالنص، الملاحظة، الإجراء التصحيحي، أو القسم..."
                  className="w-full pr-9 pl-8 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Policy selector if on policies tab */}
              {activeTab === "policies" && (
                <div className="w-full md:w-64">
                  <select
                    value={selectedPolicyId}
                    onChange={(e) => setSelectedPolicyId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
                  >
                    <option value="all">جميع السياسات ({EGYPTIAN_INSPECTION_CONTROL_POLICIES.length})</option>
                    {EGYPTIAN_INSPECTION_CONTROL_POLICIES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code}: {p.shortTitle}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Severity filter buttons */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0 text-[11px] overflow-x-auto">
                <span className="text-slate-400 px-1.5 font-medium flex items-center gap-1">
                  <Filter className="w-3 h-3" /> الخطورة:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSeverity("all")}
                  className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                    selectedSeverity === "all" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSeverity("critical")}
                  className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                    selectedSeverity === "critical" ? "bg-rose-600 text-white" : "text-rose-700 hover:bg-rose-50"
                  }`}
                >
                  حرجة / فوري
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSeverity("high")}
                  className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                    selectedSeverity === "high" ? "bg-amber-600 text-white" : "text-amber-700 hover:bg-amber-50"
                  }`}
                >
                  عالية
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSeverity("medium")}
                  className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                    selectedSeverity === "medium" ? "bg-blue-600 text-white" : "text-blue-700 hover:bg-blue-50"
                  }`}
                >
                  متوسطة
                </button>
              </div>
            </div>

            {/* Department Categories Horizontal Bar */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {displayedItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 shrink-0 whitespace-nowrap flex items-center gap-1 cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>تحديد الكل ({displayedItems.length})</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="p-3 sm:p-5 overflow-y-auto grow space-y-3 bg-slate-50/50">
          {activeTab === "custom" ? (
            /* Custom Row Entry Form */
            <form onSubmit={handleAddCustom} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-2xl mx-auto">
              <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-600" />
                <span>إدخال ملاحظة جديدة مخصصة</span>
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">القسم / الموقع</label>
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="مثال: عيادة الرمد 1، غرفة العمليات..."
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نص الملاحظة السلبية / القصور المرصود</label>
                <textarea
                  rows={3}
                  value={customObs}
                  onChange={(e) => setCustomObs(e.target.value)}
                  placeholder="اكتب تفاصيل الملاحظة المرصودة..."
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التوصية والإجراء التصحيحي المطلوب</label>
                <textarea
                  rows={2}
                  value={customRec}
                  onChange={(e) => setCustomRec(e.target.value)}
                  placeholder="اكتب الإجراء التصحيحي المطلوب لتلافي القصور..."
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المسؤول عن التنفيذ</label>
                <input
                  type="text"
                  value={customResp}
                  onChange={(e) => setCustomResp(e.target.value)}
                  placeholder="مشرف التمريض / مسؤول مكافحة العدوى"
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إدراج الملاحظة المخصصة بالتقرير</span>
                </button>
              </div>
            </form>
          ) : displayedItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700 text-sm">لا توجد ملاحظات مطابقة لمعايير البحث</p>
              <p className="text-xs text-slate-400">جرّب اختيار تصنيف آخر أو مسح عبارة البحث</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                const isInserted = !!insertedFeedbackIds[item.id];
                const isSummary = isTodaySummaryObservation(item.id);

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border-2 transition-all bg-white text-right space-y-2.5 shadow-2xs ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-400"
                        : isSummary
                        ? "border-amber-300/80 bg-amber-50/20 hover:border-amber-400"
                        : "border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {/* Item Top Bar */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Checkbox for batch select */}
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(item.id)}
                          className="text-slate-400 hover:text-blue-600 cursor-pointer"
                          title="تحديد لإدراج جماعي"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        {isSummary && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-200/90 text-amber-950 border border-amber-400 flex items-center gap-1 shadow-2xs">
                            ⭐ ملخص اليوم (35)
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                          <Building className="w-3 h-3 text-blue-600" />
                          {item.location}
                        </span>

                        <span className="text-[10px] text-slate-500 font-medium">
                          ({item.category})
                        </span>

                        {item.severity === "critical" && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> فوري
                          </span>
                        )}
                        {item.severity === "high" && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            عالي
                          </span>
                        )}
                      </div>

                      {/* Single Insert Button */}
                      <button
                        type="button"
                        onClick={() => handleInsertSingle(item)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                          isInserted
                            ? "bg-emerald-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {isInserted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تمت الإضافة!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>إدراج بالتقرير</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Negative Observation */}
                    <div className="text-xs font-bold text-slate-900 leading-snug">
                      <span className="text-rose-700 font-extrabold ml-1">الملاحظة:</span>
                      {item.observation}
                    </div>

                    {/* Corrective Action */}
                    <div className="text-[11px] text-slate-700 leading-snug bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-blue-700 font-bold ml-1">التوصية:</span>
                      {item.recommendation}
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span><strong>المسؤول:</strong> {item.responsible}</span>
                      <span><strong>المدة:</strong> {item.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom Sticky Action Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">
              الملاحظات المحددة بالمربعات:
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-black text-xs">
              {selectedItemIds.length} ملاحظة
            </span>
            {selectedItemIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedItemIds([])}
                className="text-xs text-slate-500 hover:text-rose-600 underline font-medium cursor-pointer mr-2"
              >
                مسح التحديد
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              إغلاق النافذة
            </button>

            <button
              type="button"
              onClick={handleInsertSelected}
              disabled={selectedItemIds.length === 0}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer ${
                selectedItemIds.length > 0
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>إدراج الملاحظات المحددة في التقرير ({selectedItemIds.length})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
