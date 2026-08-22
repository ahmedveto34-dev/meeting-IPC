import React, { useState, useMemo } from "react";
import {
  Sparkles,
  ClipboardCheck,
  Send,
  Copy,
  Printer,
  ShieldCheck,
  Clock,
  UserCheck,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
  CheckSquare,
  Square,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Download
} from "lucide-react";
import { StandardObservationItem, MeetingTopic, Meeting, RoundReport, CenterSettings } from "../types";
import { getTodayAddedObservations, TODAY_ADDED_OBSERVATION_IDS } from "../data/todayObservationsSummary";

interface TodayAddedSummaryViewProps {
  onAddObservationToRound: (obs: StandardObservationItem[], targetRoundId?: string) => void;
  onAddObservationToMeeting: (obs: StandardObservationItem[], targetMeetingId?: string) => void;
  onOpenActionModal?: (obs: StandardObservationItem) => void;
  onBatchAction?: (items: StandardObservationItem[]) => void;
  rounds?: RoundReport[];
  meetings?: Meeting[];
  centerSettings?: CenterSettings;
}

export const TodayAddedSummaryView: React.FC<TodayAddedSummaryViewProps> = ({
  onAddObservationToRound,
  onAddObservationToMeeting,
  onOpenActionModal,
  onBatchAction,
  rounds = [],
  meetings = [],
  centerSettings,
}) => {
  const todayObservations = useMemo(() => getTodayAddedObservations(), []);

  // Filter & Search state within summary
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Grouping categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add("الكل");
    todayObservations.forEach((item) => cats.add(item.category));
    return Array.from(cats);
  }, [todayObservations]);

  // Filtered today observations
  const filteredItems = useMemo(() => {
    return todayObservations.filter((item) => {
      const matchCat = selectedCategory === "الكل" || item.category === selectedCategory;
      const matchSeverity = selectedSeverity === "all" || item.severity === selectedSeverity;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.observation.toLowerCase().includes(q) ||
        item.recommendation.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.responsible.toLowerCase().includes(q) ||
        (item.policyName && item.policyName.toLowerCase().includes(q)) ||
        (item.egyptianGuidelineRef && item.egyptianGuidelineRef.toLowerCase().includes(q)) ||
        (item.standardRef && item.standardRef.toLowerCase().includes(q));
      return matchCat && matchSeverity && matchSearch;
    });
  }, [todayObservations, selectedCategory, selectedSeverity, search]);

  // Metrics
  const metrics = useMemo(() => {
    const critical = todayObservations.filter((o) => o.severity === "critical").length;
    const high = todayObservations.filter((o) => o.severity === "high").length;
    const medium = todayObservations.filter((o) => o.severity === "medium").length;
    const low = todayObservations.filter((o) => o.severity === "low").length;
    const immediate = todayObservations.filter((o) => o.duration.includes("فوري")).length;
    return { total: todayObservations.length, critical, high, medium, low, immediate };
  }, [todayObservations]);

  // Selection toggle
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const handleCopy = (item: StandardObservationItem) => {
    const text = `الملاحظة: ${item.observation}\nالموقع: ${item.location}\nالإجراء التصحيحي: ${item.recommendation}\nالمسؤول: ${item.responsible} | المدة: ${item.duration}\nالمرجعية: ${item.standardRef || item.egyptianGuidelineRef || ""}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleInsertSelectedToRound = () => {
    const selectedList = todayObservations.filter((o) => selectedIds.has(o.id));
    if (selectedList.length === 0) return;
    if (onBatchAction) {
      onBatchAction(selectedList);
    } else {
      onAddObservationToRound(selectedList);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return {
          bg: "bg-rose-100 text-rose-800 border-rose-200",
          dot: "bg-rose-600",
          label: "مخالفة جسيمة / فوري",
        };
      case "high":
        return {
          bg: "bg-amber-100 text-amber-800 border-amber-200",
          dot: "bg-amber-600",
          label: "أولوية عالية",
        };
      case "medium":
        return {
          bg: "bg-blue-100 text-blue-800 border-blue-200",
          dot: "bg-blue-600",
          label: "أولوية متوسطة",
        };
      default:
        return {
          bg: "bg-slate-100 text-slate-800 border-slate-200",
          dot: "bg-slate-500",
          label: "متابعة روتينية",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border border-indigo-900/50 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>الملخص التراكمي للملاحظات الميدانية المضافة حديثاً</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>ملخص الملاحظات المضافة اليوم</span>
              <span className="text-sm font-bold px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-100">
                {metrics.total} ملاحظة معتمدة
              </span>
            </h2>
            <p className="text-indigo-100/80 text-sm max-w-3xl leading-relaxed">
              تم فحص وحصر وتدقيق كافة الملاحظات الميدانية المضافة، وتصنيفها طبقاً لـ <strong>الدليل القومي المصري لمكافحة العدوى 2020</strong> ومعايير الجودة، مع ربط كل ملاحظة بإجرائها التصحيحي الحاسم، المسؤول التنفيذي، والمدة الزمنية المحددة.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {selectedIds.size > 0 && (
              <button
                onClick={handleInsertSelectedToRound}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>إدراج المحدد ({selectedIds.size}) في نموذج المرور</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 text-white hover:bg-white/20 border border-white/15 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-indigo-200" />
              <span>طباعة تقرير الملخص</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-2xs text-indigo-200 block">إجمالي الملاحظات</span>
            <span className="text-xl sm:text-2xl font-bold text-white mt-1 block">{metrics.total}</span>
            <span className="text-2xs text-indigo-300">ملاحظة فريدة</span>
          </div>

          <div className="bg-rose-500/10 rounded-xl p-3 border border-rose-500/20">
            <span className="text-2xs text-rose-300 block">مخالفات جسيمة</span>
            <span className="text-xl sm:text-2xl font-bold text-rose-300 mt-1 block">{metrics.critical}</span>
            <span className="text-2xs text-rose-400">تتطلب وقفاً فورياً</span>
          </div>

          <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
            <span className="text-2xs text-amber-300 block">أولوية عالية</span>
            <span className="text-xl sm:text-2xl font-bold text-amber-300 mt-1 block">{metrics.high}</span>
            <span className="text-2xs text-amber-400">إجراءات تصحيحية سريعة</span>
          </div>

          <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
            <span className="text-2xs text-blue-300 block">أولوية متوسطة</span>
            <span className="text-xl sm:text-2xl font-bold text-blue-300 mt-1 block">{metrics.medium}</span>
            <span className="text-2xs text-blue-400">صيانة وتجهيزات</span>
          </div>

          <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
            <span className="text-2xs text-emerald-300 block">إجراء فوري</span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-300 mt-1 block">{metrics.immediate}</span>
            <span className="text-2xs text-emerald-400">تصحيح بنفس اليوم</span>
          </div>

          <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/20">
            <span className="text-2xs text-purple-300 block">الأقسام المشمولة</span>
            <span className="text-xl sm:text-2xl font-bold text-purple-300 mt-1 block">{categories.length - 1}</span>
            <span className="text-2xs text-purple-400">أقسام طبية وخدمية</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative grow">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في ملخص ملاحظات اليوم (الملاحظة، الموقع، التوصية، المسؤول، السياسة)..."
              className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Department Category */}
          <div className="w-full md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-semibold"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "الكل" ? "جميع الأقسام بالملخص" : c}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 overflow-x-auto text-xs">
            <button
              onClick={() => setSelectedSeverity("all")}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                selectedSeverity === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              الكل ({todayObservations.length})
            </button>
            <button
              onClick={() => setSelectedSeverity("critical")}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                selectedSeverity === "critical" ? "bg-rose-600 text-white shadow-xs" : "text-rose-700 hover:bg-rose-50"
              }`}
            >
              جسيمة ({metrics.critical})
            </button>
            <button
              onClick={() => setSelectedSeverity("high")}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                selectedSeverity === "high" ? "bg-amber-600 text-white shadow-xs" : "text-amber-700 hover:bg-amber-50"
              }`}
            >
              عالية ({metrics.high})
            </button>
            <button
              onClick={() => setSelectedSeverity("medium")}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                selectedSeverity === "medium" ? "bg-blue-600 text-white shadow-xs" : "text-blue-700 hover:bg-blue-50"
              }`}
            >
              متوسطة ({metrics.medium})
            </button>
          </div>
        </div>

        {/* Sub toolbar: Select All and Count */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:underline"
            >
              {selectedIds.size === filteredItems.length && filteredItems.length > 0 ? (
                <>
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  <span>إلغاء تحديد الكل</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-slate-400" />
                  <span>تحديد كافة المعروض ({filteredItems.length})</span>
                </>
              )}
            </button>
            {selectedIds.size > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-2xs">
                تم تحديد {selectedIds.size} من {filteredItems.length}
              </span>
            )}
          </div>

          <div className="text-2xs text-slate-500">
            عرض <strong>{filteredItems.length}</strong> ملاحظة من أصل <strong>{todayObservations.length}</strong>
          </div>
        </div>
      </div>

      {/* Observations Grid / Table */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">لا توجد ملاحظات تطابق معايير البحث الحالية في الملخص</p>
            <button
              onClick={() => { setSearch(""); setSelectedCategory("الكل"); setSelectedSeverity("all"); }}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const badge = getSeverityBadge(item.severity);
            const isSelected = selectedIds.has(item.id);
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border transition-all overflow-hidden ${
                  isSelected
                    ? "border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                    : "border-slate-200 hover:border-slate-300 shadow-xs"
                }`}
              >
                {/* Item Card Body */}
                <div className="p-4 sm:p-5 space-y-3">
                  {/* Top Bar of the Card */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        onClick={() => toggleSelect(item.id)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                        title={isSelected ? "إلغاء التحديد" : "تحديد"}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>

                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-bold border ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>

                      <span className="text-2xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {item.category}
                      </span>

                      {item.policyName && (
                        <span className="text-2xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{item.policyName}</span>
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      {onOpenActionModal && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenActionModal(item);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-xs transition-all cursor-pointer"
                          title="فتح نافذة منبثقة لإدراج هذه الملاحظة في نموذج المرور الميداني"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          <span>إدراج في نموذج المرور</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(item);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-2xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                        title="نسخ نص الملاحظة والتوصية"
                      >
                        {copiedId === item.id ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>نسخ</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(isExpanded ? null : item.id);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 cursor-pointer"
                        title="تفاصيل أكثر"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Main Content: Observation & Recommendation - Clickable to open round insertion modal */}
                  <div
                    onClick={() => onOpenActionModal && onOpenActionModal(item)}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1 cursor-pointer group"
                    title="انقر هنا لفتح نافذة منبثقة وإدراج الملاحظة في نموذج المرور الميداني"
                  >
                    {/* Location & Observation */}
                    <div className="lg:col-span-6 space-y-1.5 bg-rose-50/50 group-hover:bg-rose-50 p-3 rounded-lg border border-rose-100/70 group-hover:border-rose-200 transition-all">
                      <div className="flex items-center justify-between gap-1.5 text-xs font-bold text-rose-900">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>الموقع: {item.location}</span>
                        </div>
                        <span className="text-3xs font-normal text-rose-600 bg-white/80 px-1.5 py-0.5 rounded border border-rose-200/60 opacity-0 group-hover:opacity-100 transition-opacity">
                          انقر للإدراج بالمرور 📋
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                        {item.observation}
                      </p>
                    </div>

                    {/* Recommendation & Action */}
                    <div className="lg:col-span-6 space-y-1.5 bg-emerald-50/50 group-hover:bg-emerald-50 p-3 rounded-lg border border-emerald-100/70 group-hover:border-emerald-200 transition-all">
                      <div className="flex items-center justify-between gap-1.5 text-xs font-bold text-emerald-900">
                        <div className="flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>الإجراء التصحيحي المعتمد:</span>
                        </div>
                        <span className="text-3xs font-normal text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded border border-emerald-200/60 opacity-0 group-hover:opacity-100 transition-opacity">
                          انقر للإدراج بالمرور 📋
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                        {item.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Meta Bar: Responsible, Duration, Monitoring */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1 text-slate-700">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-semibold text-slate-500">المسؤول:</span>
                        <span className="font-medium text-slate-900">{item.responsible}</span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-semibold text-slate-500">المدة:</span>
                        <span className="font-bold text-amber-800">{item.duration}</span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-700">
                        <ClipboardCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-semibold text-slate-500">المتابعة:</span>
                        <span className="text-slate-800">{item.monitoringMethod}</span>
                      </div>
                    </div>

                    {item.standardRef && (
                      <div className="text-2xs text-slate-500 font-mono">
                        مرجع: {item.standardRef}
                      </div>
                    )}
                  </div>

                  {/* Collapsible Details */}
                  {isExpanded && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2 mt-2 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                        <div>
                          <strong className="text-slate-900">السياسة القومية:</strong> {item.policyName || "سياسات مكافحة العدوى العامة"}
                        </div>
                        <div>
                          <strong className="text-slate-900">الفصل بالدليل المصري:</strong> {item.egyptianGuidelineRef || "الدليل القومي 2020"}
                        </div>
                        <div className="sm:col-span-2">
                          <strong className="text-slate-900">المعيار العلمي:</strong> {item.standardRef || "معايير مكافحة العدوى بالمستشفيات"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
