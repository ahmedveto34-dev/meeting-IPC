import React from "react";
import {
  ClipboardCheck,
  FileText,
  PlusCircle,
  Sparkles,
  Layers,
  CalendarDays,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  ShieldCheck,
  History,
  TrendingUp,
  FileDown,
  ListChecks,
  Lightbulb,
} from "lucide-react";
import { CenterSettings, Meeting, RoundReport } from "../types";
import { TODAY_ADDED_OBSERVATION_IDS } from "../data/todayObservationsSummary";

interface PortalLandingViewProps {
  centerSettings: CenterSettings;
  meetings: Meeting[];
  rounds: RoundReport[];
  onStartNewRound: () => void;
  onStartNewMeeting: () => void;
  onViewMeetingsList: () => void;
  onViewRoundsList: () => void;
  onViewObservationsBank: () => void;
  onViewMonthlyPlan: () => void;
  onViewTopicsLibrary: () => void;
  onOpenAiHelper: () => void;
  onViewMeeting: (meeting: Meeting) => void;
  onViewRound: (round: RoundReport) => void;
}

export const PortalLandingView: React.FC<PortalLandingViewProps> = ({
  centerSettings,
  meetings,
  rounds,
  onStartNewRound,
  onStartNewMeeting,
  onViewMeetingsList,
  onViewRoundsList,
  onViewObservationsBank,
  onViewMonthlyPlan,
  onViewTopicsLibrary,
  onOpenAiHelper,
  onViewMeeting,
  onViewRound,
}) => {
  // Statistics
  const totalMeetings = meetings.length;
  const totalRounds = rounds.length;

  const totalRoundObs = rounds.reduce(
    (acc, r) => acc + (r.observations?.length || 0),
    0
  );

  const totalCarriedDecisions = meetings.reduce(
    (acc, m) => acc + (m.decisions?.filter((d) => d.isCarriedOver)?.length || 0),
    0
  );

  const recentRounds = [...rounds]
    .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
    .slice(0, 3);

  const recentMeetings = [...meetings]
    .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-8">
      {/* Welcome Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-9 text-white shadow-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 border border-white/10">
        {/* Background decorative luxury graphics & glowing orbs */}
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -top-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.2 rounded-full bg-white/10 backdrop-blur-md text-xs font-extrabold text-blue-200 border border-white/15 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{centerSettings.departmentTitle || "لجنة مكافحة العدوى"}</span>
              <span className="text-white/40">•</span>
              <span className="text-amber-300">{centerSettings.centerName || "Waheed IPC"}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              بوابة مكافحة العدوى والجودة الميدانية
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium">
              اختر الإجراء المطلوب مباشرة: بدء تسجيل تقرير مرور ميداني جديد مع اختيار الملاحظات القياسية، أو إعداد محضر اجتماع شهري للجنة مكافحة العدوى.
            </p>
          </div>

          {/* Quick Metrics Bar with Luxury Glass Style */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shrink-0 text-center shadow-lg">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-2xl sm:text-3xl font-black text-sky-400 drop-shadow-sm">{totalRounds}</div>
              <div className="text-[11px] text-slate-300 font-bold mt-0.5">جولات مرور</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-2xl sm:text-3xl font-black text-indigo-400 drop-shadow-sm">{totalMeetings}</div>
              <div className="text-[11px] text-slate-300 font-bold mt-0.5">اجتماعات شهرية</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow-sm">{TODAY_ADDED_OBSERVATION_IDS.length}</div>
              <div className="text-[11px] text-amber-200 font-bold mt-0.5">ملخص اليوم</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 drop-shadow-sm">100+</div>
              <div className="text-[11px] text-emerald-200 font-bold mt-0.5">بنك الملاحظات</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 TWO PRIMARY ACTION PATHWAYS (المرور الميداني الجديد vs الاجتماع الشهري) 🌟 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        
        {/* PATHWAY 1: New Field Round Report (المرور الميداني) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-sky-200/90 hover:border-blue-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-2.5 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600" />
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-2 transition-all duration-300 shadow-lg shadow-blue-500/30">
                <ClipboardCheck className="w-9 h-9 stroke-[2.2]" />
              </div>
              <span className="text-xs font-black px-3.5 py-1.2 rounded-full bg-blue-50 text-blue-800 border border-blue-200/80 shadow-2xs">
                جولة ميدانية تفقدية
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                الدخول لعمل مرور ميداني جديد
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                تسجيل ورصد ملاحظات المرور على الأقسام والعيادات، اختيار بنود التقييم من بنك الملاحظات المعتمدة والملخص بنقرة واحدة، وتحديد الإجراءات التصحيحية والمسؤولين.
              </p>
            </div>

            {/* Key Features Bullet List */}
            <div className="bg-slate-50/80 rounded-2xl p-4 space-y-2.5 border border-slate-200 text-xs">
              <div className="flex items-center gap-2.5 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>إمكانية اختيار الملاحظات مباشرة من ملخص اليوم (35 ملاحظة)</span>
              </div>
              <div className="flex items-center gap-2.5 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>بنك ملاحظات مصنف (عيادات، فحوصات، عمليات، إفاقة، تعقيم...)</span>
              </div>
              <div className="flex items-center gap-2.5 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>اقتراح فوري للإجراء التصحيحي والتوصيات ومسؤول التنفيذ</span>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <button
              type="button"
              onClick={onStartNewRound}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              <span>بدء تسجيل تقرير مرور جديد الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onViewRoundsList}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100/80 hover:bg-slate-200/90 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-blue-600" />
              <span>استعراض سجل تقارير المرور السابقة ({rounds.length})</span>
            </button>
          </div>
        </div>

        {/* PATHWAY 2: New Monthly Meeting (الاجتماع الشهري للجنة) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-200/90 hover:border-indigo-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-2.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500" />
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-2 transition-all duration-300 shadow-lg shadow-indigo-500/30">
                <FileText className="w-9 h-9 stroke-[2.2]" />
              </div>
              <span className="text-xs font-black px-3.5 py-1.2 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200/80 shadow-2xs">
                محضر اجتماع رسمي
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                الدخول لعمل اجتماع شهري
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                إعداد محضر اجتماع لجنة مكافحة العدوى، إدراج جدول الأعمال، ترحيل ما لم يتم إنجازه من الاجتماع السابق أولاً، استيراد موضوعات الخطة وملاحظات المرور.
              </p>
            </div>

            {/* Key Features Bullet List */}
            <div className="bg-slate-50/80 rounded-2xl p-4 space-y-2.5 border border-slate-200 text-xs">
              <div className="flex items-center gap-2.5 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>إدراج تلقائي للبند الأول: (ما لم يتم إنجازه من الاجتماع السابق)</span>
              </div>
              <div className="flex items-center gap-2.5 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>استيراد مباشر لملاحظات المرور الميداني وتحويلها لقرارات</span>
              </div>
              <div className="flex items-center gap-2.5 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>مؤشرات الأداء (KPIs) ونماذج جاهزة لكافة شهور السنة الـ 12</span>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <button
              type="button"
              onClick={onStartNewMeeting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              <span>بدء إعداد محضر اجتماع شهري جديد</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onViewMeetingsList}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100/80 hover:bg-slate-200/90 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span>استعراض سجل محاضر الاجتماعات السابقة ({meetings.length})</span>
            </button>
          </div>
        </div>

      </div>

      {/* Quick Access Tools & Banks Ribbon */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>الأدوات المرجعية وبنوك المعايير السريعة</span>
          </h4>
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">وصول فوري لكافة القواعد والسياسات المعتمدة</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <button
            type="button"
            onClick={onViewObservationsBank}
            className="p-4 rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50/70 to-sky-50/40 hover:border-blue-400 hover:from-blue-100/80 hover:to-sky-100/60 text-right transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-2xs hover:shadow-md hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-110 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-blue-800 bg-blue-100/90 px-2 py-0.5 rounded-full border border-blue-200">
                ⭐ 35 ملخص
              </span>
            </div>
            <div>
              <div className="font-black text-slate-900 text-xs sm:text-sm group-hover:text-blue-700">بنك الملاحظات والملخص</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">100+ ملاحظة وتوصية قياسية</div>
            </div>
          </button>

          <button
            type="button"
            onClick={onViewMonthlyPlan}
            className="p-4 rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-purple-50/40 hover:border-indigo-400 hover:from-indigo-100/80 hover:to-purple-100/60 text-right transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-2xs hover:shadow-md hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                <CalendarDays className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-indigo-800 bg-indigo-100/90 px-2 py-0.5 rounded-full border border-indigo-200">
                12 شهراً
              </span>
            </div>
            <div>
              <div className="font-black text-slate-900 text-xs sm:text-sm group-hover:text-indigo-700">الخطة السنوية المعتمدة</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">موضوعات وقرارات كل شهر</div>
            </div>
          </button>

          <button
            type="button"
            onClick={onViewTopicsLibrary}
            className="p-4 rounded-2xl border-2 border-purple-100 bg-gradient-to-br from-purple-50/70 to-pink-50/40 hover:border-purple-400 hover:from-purple-100/80 hover:to-pink-100/60 text-right transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-2xs hover:shadow-md hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25 group-hover:scale-110 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-purple-800 bg-purple-100/90 px-2 py-0.5 rounded-full border border-purple-200">
                15 موضوع
              </span>
            </div>
            <div>
              <div className="font-black text-slate-900 text-xs sm:text-sm group-hover:text-purple-700">مكتبة الموضوعات الطبية</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">حزم جاهزة بجدول الأعمال والـ KPIs</div>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenAiHelper}
            className="p-4 rounded-2xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 hover:border-emerald-400 hover:from-emerald-100/80 hover:to-teal-100/60 text-right transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-2xs hover:shadow-md hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200">
                AI Assistant
              </span>
            </div>
            <div>
              <div className="font-black text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700">مساعد مكافحة العدوى الذكي</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">صياغة القرارات والحلول الطبية</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity Sections (Recent Rounds & Recent Meetings) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Recent Rounds Preview */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <h4 className="font-black text-slate-900 text-sm sm:text-base">أحدث جولات المرور الميداني</h4>
            </div>
            <button
              type="button"
              onClick={onViewRoundsList}
              className="text-xs text-blue-600 hover:text-blue-800 font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <span>عرض الكل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentRounds.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">لا توجد تقارير مرور مسجلة بعد</div>
          ) : (
            <div className="space-y-3">
              {recentRounds.map((round) => (
                <div
                  key={round.id}
                  onClick={() => onViewRound(round)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                      <span className="group-hover:text-blue-700 transition-colors">{round.title}</span>
                      <span className="text-[11px] text-slate-400 font-normal">({round.day} - {round.date})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>المفتش: <strong className="text-slate-700">{round.inspector}</strong></span>
                      <span>•</span>
                      <span className="font-bold text-blue-700">{round.observations.length} ملاحظات مرصودة</span>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-blue-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                    عرض
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Meetings Preview */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-black text-slate-900 text-sm sm:text-base">أحدث محاضر الاجتماعات الشهرية</h4>
            </div>
            <button
              type="button"
              onClick={onViewMeetingsList}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <span>عرض الكل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentMeetings.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">لا توجد محاضر اجتماعات مسجلة بعد</div>
          ) : (
            <div className="space-y-3">
              {recentMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  onClick={() => onViewMeeting(meeting)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                      <span className="group-hover:text-indigo-700 transition-colors">محضر اجتماع رقم ({meeting.meetingNumber})</span>
                      <span className="text-[11px] text-slate-400 font-normal">({meeting.day} - {meeting.date})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>{meeting.members?.length || 0} أعضاء</span>
                      <span>•</span>
                      <span className="font-bold text-indigo-700">{meeting.decisions.length} قرارات وتوصيات</span>
                      {meeting.decisions.some((d) => d.isCarriedOver) && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-extrabold">
                          مرحل
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-indigo-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    عرض
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
