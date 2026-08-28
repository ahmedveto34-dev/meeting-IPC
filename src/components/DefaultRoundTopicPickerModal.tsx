import React, { useState, useMemo } from "react";
import {
  Sparkles,
  X,
  Layers,
  CheckCircle2,
  Calendar,
  Building,
  ShieldCheck,
  Search,
  ArrowLeft,
  ChevronDown,
  Info,
  SlidersHorizontal,
  Flame,
} from "lucide-react";
import { RoundReport, RoundObservation } from "../types";
import {
  ROUND_TOPIC_PRESETS,
  RoundTopicPreset,
  createRoundReportFromTopicPreset,
} from "../data/roundTopicPresets";
import { DEFAULT_WEEKLY_BALANCED_ROUNDS } from "../data/defaultRounds";

interface DefaultRoundTopicPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopicPreset: (round: RoundReport) => void;
  onLoadObservationsOnly?: (observations: RoundObservation[], topicTitle: string) => void;
  mode?: "create_round" | "fill_form";
  centerName?: string;
  inspectorName?: string;
}

export const DefaultRoundTopicPickerModal: React.FC<DefaultRoundTopicPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectTopicPreset,
  onLoadObservationsOnly,
  mode = "create_round",
  centerName = "Waheed IPC",
  inspectorName = "م/ أحمد وحيد شعبان",
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePresetId, setActivePresetId] = useState<string>(ROUND_TOPIC_PRESETS[0].id);

  // Available categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    ROUND_TOPIC_PRESETS.forEach((p) => set.add(p.topicCategory));
    return ["الكل", ...Array.from(set)];
  }, []);

  // Filtered presets
  const filteredPresets = useMemo(() => {
    return ROUND_TOPIC_PRESETS.filter((p) => {
      const matchCategory = selectedCategory === "الكل" || p.topicCategory === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        p.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.observations.some(
          (o) =>
            o.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.observation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.recommendation.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activePreset = useMemo(() => {
    return (
      ROUND_TOPIC_PRESETS.find((p) => p.id === activePresetId) ||
      filteredPresets[0] ||
      ROUND_TOPIC_PRESETS[0]
    );
  }, [activePresetId, filteredPresets]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: RoundTopicPreset) => {
    if (mode === "fill_form" && onLoadObservationsOnly) {
      const generatedObs: RoundObservation[] = preset.observations.map((obs, idx) => ({
        id: `ro-${preset.id}-${Date.now()}-${idx + 1}`,
        location: obs.location,
        observation: obs.observation,
        recommendation: obs.recommendation,
        responsible: obs.responsible,
        status: obs.status,
      }));
      onLoadObservationsOnly(generatedObs, preset.topicTitle);
    } else {
      const newRound = createRoundReportFromTopicPreset(preset, {
        centerName,
        inspector: inspectorName,
      });
      onSelectTopicPreset(newRound);
    }
    onClose();
  };

  const handleApplyWeeklyRound = (weekNumber: number) => {
    const target = DEFAULT_WEEKLY_BALANCED_ROUNDS[(weekNumber - 1) % DEFAULT_WEEKLY_BALANCED_ROUNDS.length];
    const today = new Date();
    const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const currentDay = dayNames[today.getDay()] || "الأحد";
    const currentDate = today.toISOString().split("T")[0].replace(/-/g, "/");

    if (mode === "fill_form" && onLoadObservationsOnly) {
      const generatedObs: RoundObservation[] = target.observations.map((obs, idx) => ({
        ...obs,
        id: `ro-w${weekNumber}-${Date.now()}-${idx + 1}`,
      }));
      onLoadObservationsOnly(generatedObs, target.title);
    } else {
      const newRound: RoundReport = {
        ...target,
        id: `round-balanced-${Date.now()}`,
        day: currentDay,
        date: currentDate,
        inspector: inspectorName || target.inspector,
        centerName: centerName || target.centerName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSelectTopicPreset(newRound);
    }
    onClose();
  };

  const getBadgeColorClasses = (color: RoundTopicPreset["badgeColor"]) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "rose":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "purple":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "emerald":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "teal":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "indigo":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "amber":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <Sparkles className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {mode === "fill_form"
                    ? "تعبئة التقرير بموضوع مروري تخصصي متوازن"
                    : "إنشاء تقرير مرور جديد حسب الموضوعات التخصصية"}
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {ROUND_TOPIC_PRESETS.length} موضوعات معتمدة
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                اختر موضوع المرور المطلوب لتوليد تقرير متوازن (4 إلى 5 ملاحظات مع الإجراءات والمسؤولين بدقة)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Week Tabs & Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          {/* 4 Weekly Quick Pills */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
              <span className="text-slate-500 ml-1.5 flex items-center gap-1 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>الأسابيع القياسية:</span>
              </span>
              {[1, 2, 3, 4].map((wk) => (
                <button
                  key={wk}
                  type="button"
                  onClick={() => handleApplyWeeklyRound(wk)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50/50 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>الأسبوع {wk}</span>
                  <span className="text-[10px] text-slate-400">({wk <= 2 ? "5 بنود" : "4 بنود"})</span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="بحث في موضوعات المرور أو الملاحظات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-1.5 bg-white rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 ml-1 flex items-center gap-1 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>التصنيف:</span>
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Main Body (2 Columns Layout: Topic List on Left/Right & Full Details on Other) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
          
          {/* Left Column: Topics List (5 cols on md) */}
          <div className="md:col-span-5 border-l border-slate-200 overflow-y-auto p-3 sm:p-4 space-y-2.5 bg-slate-50/50">
            <p className="text-[11px] font-black text-slate-500 px-1">
              اختر موضوع المرور ({filteredPresets.length} متاح)
            </p>

            {filteredPresets.map((preset) => {
              const isSelected = preset.id === activePreset.id;
              const badgeClasses = getBadgeColorClasses(preset.badgeColor);

              return (
                <div
                  key={preset.id}
                  onClick={() => setActivePresetId(preset.id)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-right relative ${
                    isSelected
                      ? "bg-white border-blue-600 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20"
                      : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${badgeClasses}`}>
                      {preset.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                      {preset.departmentScope}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug mb-1">
                    {preset.topicTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">
                      {preset.observations.length} ملاحظات جاهزة
                    </span>
                    <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:underline">
                      <span>عرض البنود</span>
                      <ArrowLeft className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Topic Preview & Observations (7 cols on md) */}
          <div className="md:col-span-7 overflow-y-auto p-4 sm:p-6 bg-white flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              
              {/* Topic Hero Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white space-y-2 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{activePreset.topicCategory}</span>
                  </span>
                  <span className="text-[11px] bg-white/15 text-blue-100 px-2.5 py-0.5 rounded-full font-bold">
                    نطاق: {activePreset.departmentScope}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                  {activePreset.topicTitle}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {activePreset.description}
                </p>

                {activePreset.generalRecommendation && (
                  <div className="pt-2 border-t border-white/10 text-xs text-blue-200">
                    <span className="font-bold text-amber-300 ml-1">التوصية العامة:</span>
                    <span>{activePreset.generalRecommendation}</span>
                  </div>
                )}
              </div>

              {/* Observations Breakdown Table/List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ملاحظات وإجراءات الموضوع ({activePreset.observations.length} بنود):</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    متوازنة ومحددة بالمسؤولين والتوصيات
                  </span>
                </div>

                <div className="space-y-2">
                  {activePreset.observations.map((obs, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-md text-[11px]">
                          {obs.location}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                          المسؤول: {obs.responsible}
                        </span>
                      </div>

                      <p className="text-slate-800 font-medium leading-relaxed">
                        <span className="font-bold text-slate-900 ml-1">الملاحظة:</span>
                        {obs.observation}
                      </p>

                      <p className="text-emerald-800 font-medium leading-relaxed bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/60 text-[11px]">
                        <span className="font-bold text-emerald-950 ml-1">الإجراء والتوصية:</span>
                        {obs.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset(activePreset)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-98 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {mode === "fill_form"
                    ? `تعبئة الجدول بملاحظات: ${activePreset.topicTitle}`
                    : `إنشاء تقرير فوري بموضوع: ${activePreset.topicCategory}`}
                </span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
