import React, { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  PlusCircle,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { MONTHLY_TEMPLATES } from "../data/monthlyTemplates";
import { MonthlyThemeTemplate } from "../types";

interface MonthlyPlanViewProps {
  onCreateMeetingFromMonth: (monthKey: string) => void;
}

export const MonthlyPlanView: React.FC<MonthlyPlanViewProps> = ({
  onCreateMeetingFromMonth,
}) => {
  const [expandedKey, setExpandedKey] = useState<string>("month-1");

  const toggleExpand = (key: string) => {
    setExpandedKey(expandedKey === key ? "" : key);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 sm:p-8 text-slate-900 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 mb-3">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <span>الخطة السنوية المتكاملة لمكافحة العدوى</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              دليل موضوعات الاجتماعات الشهرية (12 شهراً معتمداً)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
              تم إعداد وتوزيع موضوعات اجتماعات لجنة مكافحة العدوى لتغطي كافة المعايير الوطنية والدولية
              (نظافة الأيدي، التعقيم المركزي، غرف العمليات، النفايات، المضادات، المناظير، البيئة) مع تغيير المحاور دورياً.
            </p>
          </div>

          <div className="shrink-0 bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
            <span className="block text-2xl sm:text-3xl font-bold text-blue-600">12</span>
            <span className="text-xs text-slate-500 font-medium">موضوعاً معتمداً</span>
          </div>
        </div>
      </div>

      {/* 12 Months Grid & Accordions */}
      <div className="space-y-4">
        {MONTHLY_TEMPLATES.map((tmpl) => {
          const isExpanded = expandedKey === tmpl.key;

          return (
            <div
              key={tmpl.key}
              className={`bg-white rounded-xl border transition-all shadow-xs ${
                isExpanded ? "border-blue-500 ring-2 ring-blue-500/10" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Card Header */}
              <div
                onClick={() => toggleExpand(tmpl.key)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm sm:text-base flex items-center justify-center border border-blue-200 shrink-0">
                    {tmpl.monthIndex}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {tmpl.monthName}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {tmpl.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {tmpl.themeTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateMeetingFromMonth(tmpl.key);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">إنشاء محضر لهذا الشهر</span>
                    <span className="sm:hidden">إنشاء</span>
                  </button>

                  <div className="p-1 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Card Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-5 sm:px-6 sm:pb-6 border-t border-slate-100 pt-4 space-y-4">
                  
                  {/* Summary */}
                  <div className="p-3 bg-blue-50/60 rounded-lg text-xs text-slate-800 leading-relaxed border border-blue-100">
                    <span className="font-bold text-blue-900 ml-1">الهدف والمحور:</span>
                    {tmpl.focusSummary}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Agenda items */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>بنود جدول الأعمال المقترحة ({tmpl.agenda.length})</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700 pr-3 list-disc list-inside">
                        {tmpl.agenda.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>

                    {/* KPIs & Sample Decisions */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>مؤشرات الأداء المقاسة</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {tmpl.defaultKpis.map((k, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded bg-white border border-slate-200 text-xs font-medium text-slate-800"
                            >
                              {k.name}: <strong className="text-blue-700">{k.value}</strong>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 mb-1.5">
                          أبرز القرارات والتوصيات النموذجية:
                        </h4>
                        <ul className="space-y-1 text-xs text-slate-600">
                          {tmpl.sampleDecisions.map((d, i) => (
                            <li key={i} className="border-r-2 border-blue-500 pr-2 py-0.5">
                              <span className="font-bold text-slate-800">{d.topic}</span> ← {d.decision}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
