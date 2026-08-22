import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  Sparkles,
  Layers,
  BookOpen,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Building,
  CheckSquare,
  Square,
  ListChecks,
  FileText,
  RotateCcw,
  Tag,
  Check,
} from "lucide-react";
import { StandardObservationItem, MeetingTopic, MeetingDecision } from "../types";
import {
  TODAY_ADDED_OBSERVATION_IDS,
  getTodayAddedObservations,
  isTodaySummaryObservation,
  sortWithTodaySummaryFirst,
} from "../data/todayObservationsSummary";
import { getAllCombinedObservations } from "../utils/customObservationsManager";
import { DEFAULT_TOPICS } from "../data/defaultTopics";

interface MeetingItemPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectObservationAsDecision: (item: StandardObservationItem, isCarriedOver?: boolean) => void;
  onSelectMultipleObservationsAsDecisions: (items: StandardObservationItem[], isCarriedOver?: boolean) => void;
  onSelectTopic: (topic: MeetingTopic) => void;
  onAddCustomDecision: (topic: string, decision: string, responsible: string, isCarriedOver: boolean) => void;
  availableTopics?: MeetingTopic[];
}

export const MeetingItemPickerModal: React.FC<MeetingItemPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectObservationAsDecision,
  onSelectMultipleObservationsAsDecisions,
  onSelectTopic,
  onAddCustomDecision,
  availableTopics = DEFAULT_TOPICS,
}) => {
  const [activeTab, setActiveTab] = useState<"today_obs" | "all_obs" | "topics" | "custom">("today_obs");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedObsIds, setSelectedObsIds] = useState<string[]>([]);
  const [isCarriedOverTarget, setIsCarriedOverTarget] = useState<boolean>(false);
  const [insertedFeedbackIds, setInsertedFeedbackIds] = useState<{ [id: string]: boolean }>({});

  // Custom row inputs
  const [customTopic, setCustomTopic] = useState<string>("");
  const [customDecision, setCustomDecision] = useState<string>("");
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

  // Active observations list based on tab and filters (35 summary observations prioritized first)
  const displayedObservations = useMemo(() => {
    const source = activeTab === "today_obs" ? todayObservations : allObservations;

    const filtered = source.filter((item) => {
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

      const matchSev = selectedSeverity === "all" || item.severity === selectedSeverity;

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.observation.toLowerCase().includes(q) ||
        item.recommendation.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.policyName && item.policyName.toLowerCase().includes(q));

      return matchCat && matchSev && matchSearch;
    });

    return sortWithTodaySummaryFirst(filtered);
  }, [activeTab, todayObservations, allObservations, selectedCategory, selectedSeverity, searchQuery]);

  // Filtered topics
  const displayedTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return availableTopics.filter((t) => {
      if (!q) return true;
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchCat = t.category?.toLowerCase().includes(q);
      const matchAgenda = t.agenda?.some((a) => a.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchCat || matchAgenda;
    });
  }, [availableTopics, searchQuery]);

  if (!isOpen) return null;

  const handleToggleSelectObs = (id: string) => {
    setSelectedObsIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisibleObs = () => {
    const visibleIds = displayedObservations.map((i) => i.id);
    const allSelected = visibleIds.every((id) => selectedObsIds.includes(id));
    if (allSelected) {
      setSelectedObsIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedObsIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleInsertSingleObs = (item: StandardObservationItem) => {
    onSelectObservationAsDecision(item, isCarriedOverTarget);
    setInsertedFeedbackIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setInsertedFeedbackIds((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }, 2000);
  };

  const handleInsertSelectedObs = () => {
    if (selectedObsIds.length === 0) return;
    const selectedItems = allObservations.filter((item) =>
      selectedObsIds.includes(item.id)
    );
    onSelectMultipleObservationsAsDecisions(selectedItems, isCarriedOverTarget);
    setSelectedObsIds([]);
    onClose();
  };

  const handleInsertTopic = (topic: MeetingTopic) => {
    onSelectTopic(topic);
    onClose();
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    onAddCustomDecision(
      customTopic.trim(),
      customDecision.trim() || "الالتزام بالإجراءات التصحيحية المعتمدة",
      customResp.trim() || "مشرف التمريض / مسؤول مكافحة العدوى",
      isCarriedOverTarget
    );
    setCustomTopic("");
    setCustomDecision("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  إضافة موضوعات وقرارات للاجتماع الشهري
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {activeTab === "topics" ? `${displayedTopics.length} موضوع طبي` : `${displayedObservations.length} ملاحظة متوفرة`}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                اختر من ملخص ملاحظات اليوم، أو بنك الأقسام، أو مكتبة الموضوعات المعتمدة لإدراجها مباشرة في جدول القرارات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Classification Toggle: Current vs Carried Over */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-bold px-1 text-[11px]">إدراج كـ:</span>
              <button
                type="button"
                onClick={() => setIsCarriedOverTarget(false)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  !isCarriedOverTarget
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-700 hover:bg-slate-200"
                }`}
              >
                🆕 موضوع حالي
              </button>
              <button
                type="button"
                onClick={() => setIsCarriedOverTarget(true)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  isCarriedOverTarget
                    ? "bg-amber-500 text-white shadow-2xs"
                    : "text-slate-700 hover:bg-slate-200"
                }`}
              >
                📌 مرحل لم ينجز
              </button>
            </div>

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
            onClick={() => setActiveTab("today_obs")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "today_obs"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>⭐ ملخص ملاحظات اليوم (35)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all_obs")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "all_obs"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>📂 بنك ملاحظات الأقسام (100+)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("topics")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "topics"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📚 مكتبة موضوعات مكافحة العدوى ({availableTopics.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "custom"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>✍️ كتابة قرار مخصص</span>
          </button>
        </div>

        {/* Filter Bar for Observations and Topics */}
        {activeTab !== "custom" && (
          <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50 space-y-2.5 shrink-0">
            <div className="flex flex-col md:flex-row gap-2.5">
              <div className="relative grow">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === "topics"
                      ? "ابحث في موضوعات الاجتماعات، بنود جدول الأعمال، القرارات..."
                      : "ابحث في الملاحظات، الإجراءات التصحيحية، الأقسام..."
                  }
                  className="w-full pr-9 pl-8 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
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

              {activeTab !== "topics" && (
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0 text-[11px] overflow-x-auto">
                  <span className="text-slate-400 px-1.5 font-medium">الخطورة:</span>
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
                    حرجة
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
                </div>
              )}
            </div>

            {/* Department Categories Bar for Observations */}
            {activeTab !== "topics" && (
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
                            ? "bg-indigo-600 text-white shadow-2xs"
                            : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {displayedObservations.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllVisibleObs}
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 shrink-0 whitespace-nowrap flex items-center gap-1 cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>تحديد الكل ({displayedObservations.length})</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-3 sm:p-5 overflow-y-auto grow space-y-3 bg-slate-50/50">
          
          {/* TAB: Topics Library */}
          {activeTab === "topics" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-4 rounded-2xl border-2 border-slate-200 hover:border-purple-300 bg-white text-right space-y-3 shadow-2xs transition-all"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-purple-50 text-purple-800 border border-purple-200">
                      {topic.category || "مكافحة العدوى"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInsertTopic(topic)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>تطبيق الموضوع بالاجتماع</span>
                    </button>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{topic.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{topic.description}</p>
                  </div>

                  {/* Sample Decisions Preview */}
                  {topic.sampleDecisions && topic.sampleDecisions.length > 0 && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>يتضمن ({topic.sampleDecisions.length}) قرارات وتوصيات مقترحة</span>
                      </div>
                      <div className="text-slate-600 text-[11px] line-clamp-2">
                        {topic.sampleDecisions.map((d) => d.topic).join(" • ")}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : activeTab === "custom" ? (
            /* TAB: Custom Decision Form */
            <form onSubmit={handleAddCustom} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-2xl mx-auto">
              <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>إدخال قرار / توصية مخصصة</span>
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الموضوع / الملاحظة المطروحة للنقاش</label>
                <textarea
                  rows={2}
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="مثال: متابعة توفير مستلزمات نظافة الأيدي والفرز البصري..."
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">القرار والتوصية المعتمدة من اللجنة</label>
                <textarea
                  rows={3}
                  value={customDecision}
                  onChange={(e) => setCustomDecision(e.target.value)}
                  placeholder="اكتب نص القرار والإجراء التصحيحي الواجب تنفيذه..."
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5"
                  required
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
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إدراج القرار في المحضر</span>
                </button>
              </div>
            </form>
          ) : displayedObservations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700 text-sm">لا توجد ملاحظات مطابقة لمعايير البحث</p>
              <p className="text-xs text-slate-400">جرّب اختيار تصنيف آخر أو مسح عبارة البحث</p>
            </div>
          ) : (
            /* TAB: Observations list */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedObservations.map((item) => {
                const isSelected = selectedObsIds.includes(item.id);
                const isInserted = !!insertedFeedbackIds[item.id];
                const isSummary = isTodaySummaryObservation(item.id);

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border-2 transition-all bg-white text-right space-y-2.5 shadow-2xs ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-400"
                        : isSummary
                        ? "border-amber-300/80 bg-amber-50/20 hover:border-amber-400"
                        : "border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectObs(item.id)}
                          className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                          title="تحديد لإدراج جماعي"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        {isSummary && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-200/90 text-amber-950 border border-amber-400 flex items-center gap-1 shadow-2xs">
                            ⭐ ملخص اليوم (35)
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                          <Building className="w-3 h-3 text-indigo-600" />
                          {item.location}
                        </span>

                        <span className="text-[10px] text-slate-500 font-medium">
                          ({item.category})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleInsertSingleObs(item)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                          isInserted
                            ? "bg-emerald-600 text-white"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
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
                            <span>إدراج كقرار</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs font-bold text-slate-900 leading-snug">
                      <span className="text-indigo-700 font-extrabold ml-1">الموضوع:</span>
                      {item.observation}
                    </div>

                    <div className="text-[11px] text-slate-700 leading-snug bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-emerald-700 font-bold ml-1">القرار والتوصية:</span>
                      {item.recommendation}
                    </div>

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

        {/* Modal Sticky Bottom Footer */}
        {activeTab !== "topics" && activeTab !== "custom" && (
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                الملاحظات المحددة:
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-black text-xs">
                {selectedObsIds.length} ملاحظة
              </span>
              {selectedObsIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedObsIds([])}
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
                onClick={handleInsertSelectedObs}
                disabled={selectedObsIds.length === 0}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer ${
                  selectedObsIds.length > 0
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>إدراج الملاحظات المحددة كقرارات بالاجتماع ({selectedObsIds.length})</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
