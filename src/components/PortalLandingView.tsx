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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background decorative graphics */}
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-12 w-60 h-60 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold text-blue-100 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
              <span>{centerSettings.departmentTitle || "لجنة مكافحة العدوى"}</span>
              <span className="text-white/40">•</span>
              <span>{centerSettings.centerName || "Waheed IPC"}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              بوابة مكافحة العدوى والجودة الميدانية
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              اختر الإجراء المطلوب مباشرة: بدء تسجيل تقرير مرور ميداني جديد مع اختيار الملاحظات القياسية، أو إعداد محضر اجتماع شهري للجنة مكافحة العدوى.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-black/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shrink-0 text-center">
            <div className="p-2 rounded-xl bg-white/5">
              <div className="text-xl sm:text-2xl font-black text-white">{totalRounds}</div>
              <div className="text-[11px] text-blue-200 font-medium">جولات مرور</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5">
              <div className="text-xl sm:text-2xl font-black text-white">{totalMeetings}</div>
              <div className="text-[11px] text-blue-200 font-medium">اجتماعات شهرية</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5">
              <div className="text-xl sm:text-2xl font-black text-amber-300">{TODAY_ADDED_OBSERVATION_IDS.length}</div>
              <div className="text-[11px] text-amber-200 font-medium">ملخص ملاحظات اليوم</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5">
              <div className="text-xl sm:text-2xl font-black text-emerald-300">100+</div>
              <div className="text-[11px] text-emerald-200 font-medium">بنك الملاحظات</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 TWO PRIMARY ACTION PATHWAYS (المرور الميداني الجديد vs الاجتماع الشهري) 🌟 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PATHWAY 1: New Field Round Report (المرور الميداني) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-blue-200 hover:border-blue-500 transition-all shadow-lg hover:shadow-xl group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <ClipboardCheck className="w-8 h-8" />
              </div>
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                جولة ميدانية تفقدية
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                الدخول لعمل مرور ميداني جديد
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                تسجيل ورصد ملاحظات المرور على الأقسام والعيادات، اختيار بنود التقييم من بنك الملاحظات المعتمدة والملخص بنقرة واحدة، وتحديد الإجراءات التصحيحية والمسؤولين.
              </p>
            </div>

            {/* Key Features Bullet List */}
            <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>إمكانية اختيار الملاحظات مباشرة من ملخص اليوم (35 ملاحظة)</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>بنك ملاحظات مصنف (عيادات، فحوصات، عمليات، إفاقة، تعقيم...)</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>اقتراح فوري للإجراء التصحيحي والتوصيات ومسؤول التنفيذ</span>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <button
              type="button"
              onClick={onStartNewRound}
              className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              <span>بدء تسجيل تقرير مرور جديد الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onViewRoundsList}
              className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>استعراض سجل تقارير المرور السابقة ({rounds.length})</span>
            </button>
          </div>
        </div>

        {/* PATHWAY 2: New Monthly Meeting (الاجتماع الشهري للجنة) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-indigo-200 hover:border-indigo-500 transition-all shadow-lg hover:shadow-xl group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <FileText className="w-8 h-8" />
              </div>
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                محضر اجتماع رسمي
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                الدخول لعمل اجتماع شهري
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                إعداد محضر اجتماع لجنة مكافحة العدوى، إدراج جدول الأعمال، ترحيل ما لم يتم إنجازه من الاجتماع السابق أولاً، استيراد موضوعات الخطة وملاحظات المرور.
              </p>
            </div>

            {/* Key Features Bullet List */}
            <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>إدراج تلقائي للبند الأول: (ما لم يتم إنجازه من الاجتماع السابق)</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>استيراد مباشر لملاحظات المرور الميداني وتحويلها لقرارات</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>مؤشرات الأداء (KPIs) ونماذج جاهزة لكافة شهور السنة الـ 12</span>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <button
              type="button"
              onClick={onStartNewMeeting}
              className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              <span>بدء إعداد محضر اجتماع شهري جديد</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onViewMeetingsList}
              className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>استعراض سجل محاضر الاجتماعات السابقة ({meetings.length})</span>
            </button>
          </div>
        </div>

      </div>

      {/* Quick Access Tools & Banks Ribbon */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>الأدوات المرجعية وبنوك المعايير السريعة</span>
          </h4>
          <span className="text-xs text-slate-400">وصول فوري لكافة القواعد والسياسات</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={onViewObservationsBank}
            className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-right transition-colors cursor-pointer flex flex-col justify-between gap-1 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                ⭐ 35 ملخص
              </span>
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-xs group-hover:text-blue-700">بنك الملاحظات والملخص</div>
              <div className="text-[11px] text-slate-500">100+ ملاحظة وتوصية قياسية</div>
            </div>
          </button>

          <button
            type="button"
            onClick={onViewMonthlyPlan}
            className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-right transition-colors cursor-pointer flex flex-col justify-between gap-1 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <CalendarDays className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                12 شهراً
              </span>
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-xs group-hover:text-indigo-700">الخطة السنوية المعتمدة</div>
              <div className="text-[11px] text-slate-500">موضوعات وقرارات كل شهر</div>
            </div>
          </button>

          <button
            type="button"
            onClick={onViewTopicsLibrary}
            className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-right transition-colors cursor-pointer flex flex-col justify-between gap-1 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                15 موضوع
              </span>
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-xs group-hover:text-purple-700">مكتبة الموضوعات الطبية</div>
              <div className="text-[11px] text-slate-500">حزم جاهزة بجدول الأعمال والـ KPIs</div>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenAiHelper}
            className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-right transition-colors cursor-pointer flex flex-col justify-between gap-1 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                AI Assistant
              </span>
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-xs group-hover:text-emerald-700">مساعد مكافحة العدوى الذكي</div>
              <div className="text-[11px] text-slate-500">صياغة القرارات والحلول الطبية</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity Sections (Recent Rounds & Recent Meetings) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Rounds Preview */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
              <h4 className="font-extrabold text-slate-900 text-sm">أحدث جولات المرور الميداني</h4>
            </div>
            <button
              type="button"
              onClick={onViewRoundsList}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              <span>عرض الكل</span>
              <ArrowLeft className="w-3 h-3" />
            </button>
          </div>

          {recentRounds.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">لا توجد تقارير مرور مسجلة بعد</div>
          ) : (
            <div className="space-y-2.5">
              {recentRounds.map((round) => (
                <div
                  key={round.id}
                  onClick={() => onViewRound(round)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span>{round.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({round.day} - {round.date})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>المفتش: {round.inspector}</span>
                      <span>•</span>
                      <span className="font-semibold text-blue-700">{round.observations.length} ملاحظات مرصودة</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-blue-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    عرض
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Meetings Preview */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h4 className="font-extrabold text-slate-900 text-sm">أحدث محاضر الاجتماعات الشهرية</h4>
            </div>
            <button
              type="button"
              onClick={onViewMeetingsList}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
            >
              <span>عرض الكل</span>
              <ArrowLeft className="w-3 h-3" />
            </button>
          </div>

          {recentMeetings.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">لا توجد محاضر اجتماعات مسجلة بعد</div>
          ) : (
            <div className="space-y-2.5">
              {recentMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  onClick={() => onViewMeeting(meeting)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span>محضر اجتماع رقم ({meeting.meetingNumber})</span>
                      <span className="text-[10px] text-slate-400 font-normal">({meeting.day} - {meeting.date})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>{meeting.members?.length || 0} أعضاء</span>
                      <span>•</span>
                      <span className="font-semibold text-indigo-700">{meeting.decisions.length} قرارات وتوصيات</span>
                      {meeting.decisions.some((d) => d.isCarriedOver) && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 rounded font-bold">
                          مرحل
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-bold text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
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
