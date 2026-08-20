import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  CheckSquare,
  Square,
  Plus,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  Sparkles,
  Building2,
  CheckCircle2,
  ListChecks,
  SlidersHorizontal,
  ArrowRight,
  Filter
} from "lucide-react";
import { MeetingTopic, TopicDecisionTemplate, TopicKpiTemplate } from "../types";
import { TOPIC_CATEGORIES } from "../data/defaultTopics";

interface TopicsPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTopics?: MeetingTopic[];
  onImportTopics: (
    selectedTopics: MeetingTopic[],
    options: {
      mode: "append" | "replace";
      importAgenda: boolean;
      importKpis: boolean;
      importDecisions: boolean;
      selectedDecisionIds?: Record<string, boolean>;
    }
  ) => void;
}

export const TopicsPickerModal: React.FC<TopicsPickerModalProps> = ({
  isOpen,
  onClose,
  availableTopics = [],
  onImportTopics,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [selectedDept, setSelectedDept] = useState("الكل");
  const [selectedTopicIds, setSelectedTopicIds] = useState<Record<string, boolean>>({});
  const [expandedTopicIds, setExpandedTopicIds] = useState<Record<string, boolean>>({});
  
  // Custom import options
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [importAgenda, setImportAgenda] = useState(true);
  const [importKpis, setImportKpis] = useState(true);
  const [importDecisions, setImportDecisions] = useState(true);

  const safeTopics = Array.isArray(availableTopics) ? availableTopics.filter(Boolean) : [];

  // Extract all categories
  const categories = useMemo(() => {
    const cats = new Set<string>(["الكل"]);
    TOPIC_CATEGORIES.forEach((c) => cats.add(c));
    safeTopics.forEach((t) => {
      if (t?.category) cats.add(t.category);
    });
    return Array.from(cats);
  }, [safeTopics]);

  // Extract all departments
  const departments = useMemo(() => {
    const depts = new Set<string>(["الكل"]);
    safeTopics.forEach((t) => {
      if (Array.isArray(t?.targetDepartments)) {
        t.targetDepartments.forEach((d) => {
          if (d) depts.add(d);
        });
      }
    });
    return Array.from(depts);
  }, [safeTopics]);

  // Filter topics
  const filteredTopics = useMemo(() => {
    return safeTopics.filter((t) => {
      if (!t || !t.id) return false;
      if (selectedCategory !== "الكل" && t.category !== selectedCategory) {
        return false;
      }
      if (selectedDept !== "الكل" && (!Array.isArray(t.targetDepartments) || !t.targetDepartments.includes(selectedDept))) {
        return false;
      }
      if (searchTerm && searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const inTitle = typeof t.title === "string" && t.title.toLowerCase().includes(q);
        const inDesc = typeof t.description === "string" && t.description.toLowerCase().includes(q);
        const inCat = typeof t.category === "string" && t.category.toLowerCase().includes(q);
        const inAgenda = Array.isArray(t.agenda) && t.agenda.some((a) => typeof a === "string" && a.toLowerCase().includes(q));
        const inDecisions = Array.isArray(t.sampleDecisions) && t.sampleDecisions.some(
          (d) =>
            (typeof d?.topic === "string" && d.topic.toLowerCase().includes(q)) ||
            (typeof d?.decision === "string" && d.decision.toLowerCase().includes(q)) ||
            (typeof d?.responsible === "string" && d.responsible.toLowerCase().includes(q))
        );
        const inTags = Array.isArray(t.tags) && t.tags.some((tag) => typeof tag === "string" && tag.toLowerCase().includes(q));
        return inTitle || inDesc || inCat || inAgenda || inDecisions || inTags;
      }
      return true;
    });
  }, [safeTopics, selectedCategory, selectedDept, searchTerm]);

  // Selected count
  const selectedCount = Object.values(selectedTopicIds).filter(Boolean).length;

  // Toggle selection for a single topic
  const toggleTopicSelect = (id: string) => {
    if (!id) return;
    setSelectedTopicIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Select all visible topics
  const handleSelectAllVisible = () => {
    const next: Record<string, boolean> = { ...selectedTopicIds };
    filteredTopics.forEach((t) => {
      if (t?.id) next[t.id] = true;
    });
    setSelectedTopicIds(next);
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedTopicIds({});
  };

  // Toggle expand
  const toggleExpand = (id: string) => {
    if (!id) return;
    setExpandedTopicIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handler: Transfer selected topics to meeting
  const handleTransfer = () => {
    const selected = safeTopics.filter((t) => t?.id && selectedTopicIds[t.id]);
    if (selected.length === 0) return;

    onImportTopics(selected, {
      mode: importMode,
      importAgenda,
      importKpis,
      importDecisions,
    });
    onClose();
  };

  // Handler: Quick import single topic
  const handleQuickImportSingle = (topic: MeetingTopic) => {
    if (!topic) return;
    onImportTopics([topic], {
      mode: importMode,
      importAgenda: true,
      importKpis: true,
      importDecisions: true,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                مكتبة موضوعات مكافحة العدوى للاجتماع الشهري
                <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                  {availableTopics.length} موضوعاً متاحاً
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                حدد موضوعاً واحداً أو عدة موضوعات لنقل محاورها وجدول أعمالها ومؤشراتها وقراراتها مباشرة إلى محضر الاجتماع
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters Bar */}
        <div className="p-4 bg-white border-b border-slate-100 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث في أسماء الموضوعات، الأجندة، القرارات، الأقسام، الكلمات المفتاحية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Category Filter */}
            <div className="sm:w-60 shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    تصنيف: {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div className="sm:w-48 shrink-0">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    القسم: {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Category Chips & Batch Actions */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllVisible}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>تحديد المعروض ({filteredTopics.length})</span>
              </button>

              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold transition-colors"
                >
                  <Square className="w-3.5 h-3.5 text-slate-500" />
                  <span>إلغاء التحديد</span>
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500">
              الموضوعات المطابقة: <strong className="text-slate-800">{filteredTopics.length}</strong> من أصل {availableTopics.length}
            </div>
          </div>
        </div>

        {/* Topics List / Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/50">
          {filteredTopics.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">لا توجد موضوعات مطابقة للبحث</h3>
              <p className="text-xs text-slate-500 mt-1">جرب تغيير كلمات البحث أو اختيار "الكل" في التصنيفات</p>
            </div>
          ) : (
            filteredTopics.map((topic) => {
              const isSelected = !!selectedTopicIds[topic.id];
              const isExpanded = !!expandedTopicIds[topic.id];

              return (
                <div
                  key={topic.id}
                  className={`rounded-xl border transition-all duration-150 ${
                    isSelected
                      ? "bg-blue-50/40 border-blue-400 ring-2 ring-blue-500/20 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  {/* Card Main Bar */}
                  <div className="p-3.5 sm:p-4 flex items-start sm:items-center justify-between gap-3">
                    
                    {/* Checkbox & Title */}
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleTopicSelect(topic.id)}
                        className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                        title={isSelected ? "إلغاء تحديد الموضوع" : "تحديد هذا الموضوع للنقل"}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-blue-600 fill-blue-50" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0" onClick={() => toggleTopicSelect(topic.id)}>
                        <div className="flex items-center flex-wrap gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-700 cursor-pointer">
                            {topic.title}
                          </h4>
                          <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                            {topic.category}
                          </span>
                          {topic.recommendedMonth && (
                            <span className="text-[11px] font-medium bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                              شهر {topic.recommendedMonth}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                          {topic.description}
                        </p>

                        {/* Badges / Meta */}
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-500">
                          {topic.targetDepartments && topic.targetDepartments.length > 0 && (
                            <span className="flex items-center gap-1 text-slate-600">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {topic.targetDepartments.slice(0, 3).join("، ")}
                              {topic.targetDepartments.length > 3 && ` (+${topic.targetDepartments.length - 3})`}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <ListChecks className="w-3.5 h-3.5" />
                            {topic.agenda?.length || 0} بنود أجندة
                          </span>
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {topic.sampleDecisions?.length || 0} قرارات وتوصيات
                          </span>
                          {topic.kpis && topic.kpis.length > 0 && (
                            <span className="text-amber-700 font-medium">
                              {topic.kpis.length} مؤشرات أداء
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* 1-Click Quick Add Button */}
                      <button
                        type="button"
                        onClick={() => handleQuickImportSingle(topic)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg text-xs font-bold transition-all shadow-2xs"
                        title="إضافة هذا الموضوع فوراً إلى المحضر"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">نقل للمحضر</span>
                      </button>

                      {/* Expand / Details Button */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(topic.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="معاينة تفاصيل البنود والقرارات"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Topic Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/70 rounded-b-xl space-y-3 text-xs">
                      
                      {/* Agenda Items */}
                      {topic.agenda && topic.agenda.length > 0 && (
                        <div>
                          <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5 text-xs">
                            <ListChecks className="w-3.5 h-3.5 text-blue-600" />
                            بنود جدول الأعمال المقترحة:
                          </div>
                          <ul className="space-y-1 list-disc list-inside text-slate-600 pr-2">
                            {topic.agenda.map((item, idx) => (
                              <li key={idx} className="leading-relaxed">{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Sample Decisions / Corrective Actions */}
                      {topic.sampleDecisions && topic.sampleDecisions.length > 0 && (
                        <div>
                          <div className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            القرارات والتوصيات النموذجية المرتبطة:
                          </div>
                          <div className="space-y-1.5">
                            {topic.sampleDecisions.map((dec, idx) => (
                              <div
                                key={idx}
                                className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                              >
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-slate-800">{dec.topic}</div>
                                  <div className="text-slate-600 leading-relaxed">{dec.decision}</div>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 shrink-0 font-medium">
                                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                    المسؤول: {dec.responsible}
                                  </span>
                                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                    المدة: {dec.duration}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* KPIs */}
                      {topic.kpis && topic.kpis.length > 0 && (
                        <div>
                          <div className="font-bold text-slate-800 mb-1 text-xs">
                            مؤشرات الأداء المقترحة:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {topic.kpis.map((kpi, idx) => (
                              <span
                                key={idx}
                                className="bg-white border border-slate-200 px-2.5 py-1 rounded-md text-[11px] text-slate-700"
                              >
                                <strong>{kpi.name}:</strong> المستهدف {kpi.target || kpi.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Import Action Bar */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          
          {/* Options: Mode & Checkboxes */}
          <div className="flex items-center flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setImportMode("append")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  importMode === "append"
                    ? "bg-white text-blue-800 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="إضافة البنود إلى المحضر الحالي دون مسح بنوده السابقة"
              >
                + دمج مع بنود المحضر الحالية
              </button>
              <button
                type="button"
                onClick={() => setImportMode("replace")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  importMode === "replace"
                    ? "bg-white text-rose-800 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="استبدال كافة بنود المحضر الحالية بالموضوعات المحددة"
              >
                استبدال المحتويات
              </button>
            </div>

            <div className="hidden md:flex items-center gap-3 text-slate-600">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={importAgenda}
                  onChange={(e) => setImportAgenda(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>الأجندة</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={importKpis}
                  onChange={(e) => setImportKpis(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>المؤشرات</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={importDecisions}
                  onChange={(e) => setImportDecisions(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>القرارات والتوصيات</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleTransfer}
              disabled={selectedCount === 0}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-all ${
                selectedCount > 0
                  ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                نقل الموضوعات المحددة ({selectedCount}) إلى محضر الاجتماع
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
