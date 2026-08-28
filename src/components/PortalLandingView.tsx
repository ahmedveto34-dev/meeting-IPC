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
  handHygieneSessionsCount?: number;
  onStartNewRound: () => void;
  onStartNewMeeting: () => void;
  onViewMeetingsList: () => void;
  onViewRoundsList: () => void;
  onViewObservationsBank: () => void;
  onViewMonthlyPlan: () => void;
  onViewTopicsLibrary: () => void;
  onViewHandHygiene?: () => void;
  onOpenAiHelper: () => void;
  onViewMeeting: (meeting: Meeting) => void;
  onViewRound: (round: RoundReport) => void;
}

export const PortalLandingView: React.FC<PortalLandingViewProps> = ({
  centerSettings,
  meetings,
  rounds,
  handHygieneSessionsCount = 4,
  onStartNewRound,
  onStartNewMeeting,
  onViewMeetingsList,
  onViewRoundsList,
  onViewObservationsBank,
  onViewMonthlyPlan,
  onViewTopicsLibrary,
  onViewHandHygiene,
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
              <div className="text-2xl sm:text-3xl font-black text-orange-400 drop-shadow-sm">{handHygieneSessionsCount}</div>
              <div className="text-[11px] text-orange-200 font-bold mt-0.5">جلسات غسيل أيدي WHO</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 drop-shadow-sm">100+</div>
              <div className="text-[11px] text-emerald-200 font-bold mt-0.5">بنك الملاحظات</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 THREE PRIMARY ACTION PATHWAYS (المرور الميداني + الاجتماع الشهري + إحصائية غسيل الأيدي WHO) 🌟 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7">
        
        {/* PATHWAY 1: New Field Round Report (المرور الميداني) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-sky-200/90 hover:border-blue-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-2.5 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-2 transition-all duration-300 shadow-lg shadow-blue-500/30">
                <ClipboardCheck className="w-8 h-8 stroke-[2.2]" />
              </div>
              <span className="text-xs font-black px-3.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200/80 shadow-2xs">
                جولة ميدانية تفقدية
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                الدخول لعمل مرور ميداني
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                تسجيل ورصد ملاحظات المرور على الأقسام والعيادات، اختيار بنود التقييم من بنك الملاحظات والملخص بنقرة واحدة.
              </p>
            </div>

            {/* Key Features Bullet List */}
            <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-2 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>اختيار الملاحظات مباشرة من ملخص اليوم</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>بنك ملاحظات مصنف (عيادات، عمليات، تعقيم...)</span>
              </div>
            </div>
          </div>

          <div className="pt-5 space-y-2.5">
            <button
              type="button"
              onClick={onStartNewRound}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>تسجيل تقرير مرور جديد</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onViewRoundsList}
              className="w-full py-2 px-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/90 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-blue-600" />
              <span>استعراض تقارير المرور ({rounds.length})</span>
            </button>
          </div>
        </div>

        {/* PATHWAY 2: New Monthly Meeting (الاجتماع الشهري للجنة) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-indigo-200/90 hover:border-indigo-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-2.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-2 transition-all duration-300 shadow-lg shadow-indigo-500/30">
                <FileText className="w-8 h-8 stroke-[2.2]" />
              </div>
              <span className="text-xs font-black px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200/80 shadow-2xs">
                محضر اجتماع رسمي
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                الدخول لعمل اجتماع شهري
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                إعداد محضر اجتماع لجنة مكافحة العدوى، إدراج جدول الأعمال، ترحيل ما لم يتم إنجازه من الاجتماع السابق أولاً.
              </p>
            </div>

            {/* Key Features Bullet List */}
            <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-2 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>إدراج تلقائي للبند الأول (المرحل السابق)</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>استيراد موضوعات الخطة وملاحظات المرور</span>
              </div>
            </div>
          </div>

          <div className="pt-5 space-y-2.5">
            <button
              type="button"
              onClick={onStartNewMeeting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>إعداد محضر اجتماع جديد</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onViewMeetingsList}
              className="w-full py-2 px-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/90 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span>استعراض سجل الاجتماعات ({meetings.length})</span>
            </button>
          </div>
        </div>

        {/* PATHWAY 3: WHO Hand Hygiene Compliance (إحصائية غسيل الأيدي طبقا لمنظمة الصحة العالمية) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-300 hover:border-orange-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-orange-500/10 group flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-white via-amber-50/20 to-orange-50/30">
          <div className="absolute top-0 right-0 left-0 h-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 text-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-2 transition-all duration-300 shadow-lg shadow-orange-500/30">
                <Sparkles className="w-8 h-8 text-amber-200 stroke-[2.2]" />
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-orange-100 text-orange-950 border border-orange-300 shadow-2xs">
                معايير WHO الرسمية
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-orange-700 text-xs font-black mb-1">
                <span>SAVE LIVES: Clean Your Hands</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1.5 group-hover:text-orange-600 transition-colors">
                إحصائية غسيل الأيدي (WHO)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                رصد دواعي الغسيل الخمسة (5 Moments)، حساب معدلات الامتثال للفئات المهنية (Page 3)، ونسب الدواعي (Page 4) بنفس تنسيق الـ PDF المعتمد.
              </p>
            </div>

            {/* Key Features Bullet List */}
            <div className="bg-amber-50/90 rounded-2xl p-3.5 space-y-2 border border-amber-200/80 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>معدل الامتثال: (Actions / Opportunities) × 100</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>نماذج واستمارات رصد جاهزة للطباعة والتصدير</span>
              </div>
            </div>
          </div>

          <div className="pt-5 space-y-2.5">
            <button
              type="button"
              onClick={onViewHandHygiene}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>الدخول لإحصائية ونماذج غسيل الأيدي</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onViewHandHygiene}
              className="w-full py-2 px-3 rounded-xl bg-orange-100/70 hover:bg-orange-200/80 text-orange-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-orange-200"
            >
              <FileDown className="w-3.5 h-3.5 text-orange-700" />
              <span>استعراض جداول الحساب المعتمدة ({handHygieneSessionsCount} جلسات)</span>
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
            onClick={onViewHandHygiene}
            className="p-4 rounded-2xl border-2 border-orange-100 bg-gradient-to-br from-amber-50/80 to-orange-50/50 hover:border-orange-400 hover:from-amber-100/90 hover:to-orange-100/70 text-right transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-2xs hover:shadow-md hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/25 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4 text-amber-200" />
              </div>
              <span className="text-[10px] font-black text-orange-950 bg-orange-200/90 px-2 py-0.5 rounded-full border border-orange-300">
                WHO Standard
              </span>
            </div>
            <div>
              <div className="font-black text-slate-900 text-xs sm:text-sm group-hover:text-orange-700">إحصائية غسيل الأيدي (WHO)</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">حساب الامتثال لـ 5 دواعي والمهن</div>
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
