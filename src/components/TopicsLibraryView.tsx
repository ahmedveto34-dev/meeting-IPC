import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Copy,
  Calendar,
  Building2,
  ListChecks,
  CheckCircle2,
  FileText,
  Printer,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  Layers,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  CheckSquare,
  Square,
  Upload,
  Download
} from "lucide-react";
import { MeetingTopic, CenterSettings } from "../types";
import { TOPIC_CATEGORIES } from "../data/defaultTopics";

interface TopicsLibraryViewProps {
  topics: MeetingTopic[];
  centerSettings?: CenterSettings;
  onAddNewTopic?: () => void;
  onAddTopic?: () => void; // alias
  onEditTopic: (topic: MeetingTopic) => void;
  onDuplicateTopic: (topic: MeetingTopic) => void;
  onDeleteTopic: (id: string) => void;
  onRestoreDefaultTopics?: () => void;
  onRestoreDefaults?: () => void; // alias
  onCreateMeetingFromTopic: (topic: MeetingTopic) => void;
  onCreateMeetingFromMultipleTopics?: (topics: MeetingTopic[]) => void;
  onOpenTemplatesManager?: () => void;
}

export const TopicsLibraryView: React.FC<TopicsLibraryViewProps> = ({
  topics,
  centerSettings,
  onAddNewTopic,
  onAddTopic,
  onEditTopic,
  onDuplicateTopic,
  onDeleteTopic,
  onRestoreDefaultTopics,
  onRestoreDefaults,
  onCreateMeetingFromTopic,
  onCreateMeetingFromMultipleTopics,
  onOpenTemplatesManager,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [selectedDept, setSelectedDept] = useState("الكل");
  const [selectedTopicIds, setSelectedTopicIds] = useState<Record<string, boolean>>({});
  const [expandedTopicIds, setExpandedTopicIds] = useState<Record<string, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const handleAddClick = onAddNewTopic || onAddTopic || (() => {});
  const handleRestoreClick = onRestoreDefaultTopics || onRestoreDefaults || (() => {});

  // Toggle card selection
  const toggleTopicSelect = (id: string) => {
    setSelectedTopicIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle card expansion
  const toggleExpand = (id: string) => {
    setExpandedTopicIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Expand all / Collapse all
  const handleExpandAll = () => {
    const allExpanded = topics.reduce((acc, t) => {
      acc[t.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedTopicIds(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedTopicIds({});
  };

  // Select visible
  const handleSelectAllVisible = () => {
    const next: Record<string, boolean> = { ...selectedTopicIds };
    filteredTopics.forEach((t) => {
      next[t.id] = true;
    });
    setSelectedTopicIds(next);
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedTopicIds({});
  };

  // Extract all unique departments across topics
  const allDepartments = useMemo(() => {
    const depts = new Set<string>();
    topics.forEach((t) => {
      t.targetDepartments?.forEach((d) => depts.add(d));
    });
    return Array.from(depts);
  }, [topics]);

  // Extract all unique categories
  const categoriesList = useMemo(() => {
    const cats = new Set<string>(["الكل"]);
    TOPIC_CATEGORIES.forEach((c) => cats.add(c));
    topics.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats);
  }, [topics]);

  // Filtered Topics
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      // Category filter
      if (selectedCategory !== "الكل" && t.category !== selectedCategory) {
        return false;
      }

      // Department filter
      if (selectedDept !== "الكل" && !t.targetDepartments?.includes(selectedDept)) {
        return false;
      }

      // Search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const inTitle = t.title.toLowerCase().includes(query);
        const inDesc = t.description?.toLowerCase().includes(query);
        const inCat = t.category?.toLowerCase().includes(query);
        const inAgenda = t.agenda?.some((a) => a.toLowerCase().includes(query));
        const inDecisions = t.sampleDecisions?.some(
          (d) =>
            d.topic?.toLowerCase().includes(query) ||
            d.decision?.toLowerCase().includes(query) ||
            d.responsible?.toLowerCase().includes(query)
        );
        const inTags = t.tags?.some((tag) => tag.toLowerCase().includes(query));
        const inDepts = t.targetDepartments?.some((d) => d.toLowerCase().includes(query));

        return inTitle || inDesc || inCat || inAgenda || inDecisions || inTags || inDepts;
      }

      return true;
    });
  }, [topics, selectedCategory, selectedDept, searchTerm]);

  // Selected count
  const selectedCount = Object.values(selectedTopicIds).filter(Boolean).length;
  const selectedTopics = useMemo(() => {
    return topics.filter((t) => selectedTopicIds[t.id]);
  }, [topics, selectedTopicIds]);

  // Handler: Create meeting from selected topics
  const handleBatchCreateMeeting = () => {
    if (selectedTopics.length === 0) return;
    if (onCreateMeetingFromMultipleTopics) {
      onCreateMeetingFromMultipleTopics(selectedTopics);
    } else if (selectedTopics.length === 1) {
      onCreateMeetingFromTopic(selectedTopics[0]);
    }
  };

  // Print Catalog Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* 1. Header Banner & Quick Actions */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs print:border-none print:shadow-none">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>مكتبة موضوعات مكافحة العدوى المعتمدة</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              مكتبة موضوعات الاجتماعات الشهرية لمكافحة العدوى
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              دليل شامل ومصنف للموضوعات القياسية (التعقيم والتطهير، مقاومة المضادات الحيوية، النظافة الشخصية للعاملين الصحيين، إدارة النفايات الطبية، غرف العمليات، والمناظير). يمكنك إضافة موضوعات جديدة، تعديل البنود والمؤشرات والقرارات، وتوليد محاضر الاجتماعات بنقرة واحدة.
            </p>
          </div>

          {/* Quick Metrics & Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 print:hidden">
            <div className="bg-slate-50 rounded-xl p-3 sm:p-4 text-center border border-slate-200 min-w-[90px]">
              <span className="block text-2xl font-bold text-blue-600">{topics.length}</span>
              <span className="text-[11px] text-slate-500 font-medium">موضوعاً بالمكتبة</span>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 sm:p-4 text-center border border-slate-200 min-w-[90px]">
              <span className="block text-2xl font-bold text-slate-700">
                {topics.filter((t) => t.isCustom).length}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">موضوعاً مخصصاً</span>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleAddClick}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة موضوع جديد</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors grow shadow-2xs"
                  title="طباعة أو حفظ دليل الموضوعات"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>طباعة الدليل</span>
                </button>

                {onOpenTemplatesManager && (
                  <button
                    type="button"
                    onClick={onOpenTemplatesManager}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors shadow-2xs"
                    title="تصدير أو استيراد قوالب لمراكز أخرى"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>رفع/تصدير للمراكز</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowRestoreModal(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-700 transition-colors shadow-2xs"
                  title="استعادة الموضوعات الافتراضية"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">استعادة الافتراضيات</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Category Filters (Hidden in print) */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4 print:hidden">
        
        {/* Search input & Secondary filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative grow w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث في الموضوعات (مثال: التعقيم، المضادات، نظافة الأيدي، النفايات، العمليات، المناظير)..."
              className="w-full pr-9 pl-4 py-2 text-xs sm:text-sm bg-white rounded-md border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                مسح
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Building2 className="w-4 h-4 text-slate-500 hidden sm:block" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs rounded-md border border-slate-200 py-2 px-3 bg-white text-slate-700 font-medium w-full sm:w-auto"
            >
              <option value="الكل">جميع الأقسام والوحدات</option>
              {allDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  قسم: {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Expand / Collapse all buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleExpandAll}
              className="px-2.5 py-2 text-xs rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-medium"
            >
              توسيع الكل
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="px-2.5 py-2 text-xs rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-medium"
            >
              طي الكل
            </button>
          </div>
        </div>

        {/* Category Filter Chips & Selection helpers */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin grow">
            <span className="text-xs font-bold text-slate-500 shrink-0 ml-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>التصنيف:</span>
            </span>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Multi-select helper buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSelectAllVisible}
              className="text-xs text-blue-700 hover:text-blue-900 font-bold px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200"
            >
              تحديد المعروض ({filteredTopics.length})
            </button>
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 bg-slate-100 rounded-md"
              >
                إلغاء التحديد ({selectedCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Topics Cards List */}
      <div className="space-y-4">
        {filteredTopics.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-500 space-y-3">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-800 text-base">لا توجد موضوعات مطابقة للبحث أو التصنيف</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              جرب تغيير كلمات البحث أو مسح الفلاتر المختارة، أو أضف موضوعاً جديداً إلى المكتبة.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("الكل");
                setSelectedDept("الكل");
              }}
              className="px-4 py-2 rounded-md text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              إعادة ضبط جميع الفلاتر
            </button>
          </div>
        ) : (
          filteredTopics.map((topic, index) => {
            const isExpanded = Boolean(expandedTopicIds[topic.id]);
            const isSelected = Boolean(selectedTopicIds[topic.id]);
            return (
              <div
                key={topic.id}
                className={`bg-white rounded-xl border transition-all shadow-xs overflow-hidden ${
                  isSelected
                    ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/10"
                    : isExpanded
                    ? "border-blue-500 ring-2 ring-blue-500/10"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Topic Card Header */}
                <div
                  onClick={() => toggleExpand(topic.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    {/* Checkbox for Multi-select */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTopicSelect(topic.id);
                      }}
                      className="mt-1 sm:mt-0 p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      title={isSelected ? "إلغاء التحديد" : "تحديد الموضوع للاجتماع"}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600 fill-blue-50" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                      )}
                    </button>

                    {/* Index / Month Badge */}
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center border border-blue-200 shrink-0">
                      {topic.recommendedMonth ? `م${topic.recommendedMonth}` : `#${index + 1}`}
                    </div>

                    <div className="space-y-1 text-right">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {topic.title}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {topic.category}
                        </span>
                        {topic.isCustom && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            مخصص
                          </span>
                        )}
                        {topic.recommendedMonth && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>شهر {topic.recommendedMonth}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 max-w-3xl leading-relaxed">
                        {topic.description}
                      </p>

                      {/* Target Departments Pill list */}
                      {topic.targetDepartments && topic.targetDepartments.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          <span className="text-[11px] text-slate-400 font-medium">الأقسام:</span>
                          {topic.targetDepartments.map((dept, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200"
                            >
                              {dept}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Expand Trigger */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateMeetingFromTopic(topic);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs"
                      title="إنشاء محضر اجتماع شهري وتطبيق هذا الموضوع مباشرة"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>إنشاء محضر بهذا الموضوع</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTopic(topic);
                        }}
                        className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-md border border-slate-200 transition-colors"
                        title="تعديل هذا الموضوع"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateTopic(topic);
                        }}
                        className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-md border border-slate-200 transition-colors"
                        title="تكرار وإنشاء نسخة جديدة"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(topic.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md border border-slate-200 transition-colors"
                        title="حذف الموضوع"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="p-1.5 text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-6 sm:pb-6 border-t border-slate-100 pt-4 space-y-4 text-right bg-slate-50/40">
                    
                    {/* Goal / Summary */}
                    <div className="p-3 bg-blue-50/60 rounded-md text-xs text-slate-800 leading-relaxed border border-blue-100">
                      <span className="font-bold text-blue-900 ml-1">محور ونطاق التركيز:</span>
                      {topic.description}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Agenda items */}
                      <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-2">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <ListChecks className="w-3.5 h-3.5 text-blue-600" />
                          <span>بنود جدول الأعمال المقترحة ({topic.agenda.length})</span>
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-700 pr-3 list-disc list-inside leading-relaxed">
                          {topic.agenda.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* KPIs & Sample Decisions */}
                      <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-3">
                        {/* KPIs */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>مؤشرات الأداء المقاسة ({topic.kpis?.length || 0})</span>
                          </h4>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {topic.kpis?.map((k, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                              >
                                {k.name}: <strong className="text-blue-700">{k.value}</strong>
                                {k.target && (
                                  <span className="text-[11px] text-slate-400 font-normal mr-1">
                                    (المستهدف {k.target})
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Decisions */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span>القرارات والتوصيات النموذجية المقترحة</span>
                          </h4>
                          <ul className="space-y-2 text-xs text-slate-600 pt-1">
                            {topic.sampleDecisions?.map((d, i) => (
                              <li
                                key={i}
                                className="border-r-2 border-blue-500 pr-2.5 py-1 bg-slate-50/70 rounded-l p-2 space-y-0.5"
                              >
                                <p className="font-bold text-slate-800">{d.topic}</p>
                                <p className="text-slate-700">الإجراء: {d.decision}</p>
                                <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 pt-0.5">
                                  <span>المسؤول: {d.responsible}</span>
                                  <span>المدة: {d.duration}</span>
                                  <span>المتابعة: {d.monitoringMethod}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {topic.tags && topic.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500">الكلمات المفتاحية:</span>
                        <div className="flex flex-wrap gap-1">
                          {topic.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[11px] bg-white text-slate-600 border border-slate-200"
                            >
                              #{t}
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

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200 text-right space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-base">تأكيد حذف الموضوع من المكتبة</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا الموضوع؟ لن يؤثر هذا الحذف على محاضر الاجتماعات السابقة التي تم إنشاؤها بالفعل.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTopic(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-4 py-2 rounded-md text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Defaults Confirmation Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200 text-right space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-base">استعادة موضوعات المكتبة الافتراضية</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              سيؤدي هذا الإجراء إلى إعادة تعيين مكتبة الموضوعات وتحميل كافة الموضوعات المعتمدة القياسية (15 موضوعاً شاملاً). هل ترغب في المتابعة؟
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  handleRestoreClick();
                  setShowRestoreModal(false);
                }}
                className="px-4 py-2 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs"
              >
                استعادة الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Bar for Batch Selected Topics */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-1/2 sm:translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-bold">
              تم تحديد <span className="text-blue-400 font-extrabold">{selectedCount}</span> موضوعاً
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBatchCreateMeeting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>إنشاء محضر يضم هذه الموضوعات</span>
            </button>

            <button
              type="button"
              onClick={handleDeselectAll}
              className="px-3 py-2 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
