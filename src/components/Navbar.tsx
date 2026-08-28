import React from "react";
import {
  CalendarDays,
  ClipboardCheck,
  FileText,
  Building2,
  Sparkles,
  Layers,
  Settings,
  PlusCircle,
  FileDown,
  BookOpen,
  Upload,
  LogOut,
  Lock,
  LayoutDashboard,
  Home,
  Lightbulb,
} from "lucide-react";
import { CenterSettings } from "../types";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  centerSettings: CenterSettings;
  onOpenSettings: () => void;
  onOpenAiModal: () => void;
  onOpenObservationsBank: () => void;
  onOpenTemplatesManager: () => void;
  onNewMeeting: () => void;
  onNewRound: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  centerSettings,
  onOpenSettings,
  onOpenAiModal,
  onOpenObservationsBank,
  onOpenTemplatesManager,
  onNewMeeting,
  onNewRound,
  onLogout,
}) => {
  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-40 shadow-xs print:hidden">
      {/* Top Banner / Center Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Center Title */}
          <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => setCurrentTab("portal")}>
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 ring-2 ring-white group-hover:scale-105 transition-all duration-300">
                <ClipboardCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight tracking-tight group-hover:text-blue-600 transition-colors">
                  {centerSettings.centerName || "Waheed IPC"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200/80 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  {centerSettings.departmentTitle || "لجنة مكافحة العدوى"}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                المنصة المتكاملة لإدارة وتوثيق الاجتماعات الشهرية وتقارير المرور الميداني
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={onOpenAiModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm shadow-blue-500/25 hover:shadow-md hover:shadow-blue-500/35 active:scale-98 cursor-pointer"
              title="مساعد الذكاء الاصطناعي لاقتراح جداول الأعمال والحلول التصحيحية"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden md:inline">مساعد مكافحة العدوى الذكي</span>
              <span className="md:hidden font-bold">الذكاء الاصطناعي</span>
            </button>

            {/* Observations Bank Button */}
            <button
              onClick={() => setCurrentTab("observations-bank")}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                currentTab === "observations-bank"
                  ? "bg-slate-900 text-white ring-2 ring-slate-900/20"
                  : "bg-slate-100/90 text-slate-700 hover:bg-slate-200 border border-slate-200/80"
              }`}
              title="بنك الملاحظات الميدانية القياسية وموضوعات الاجتماعات"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">بنك الملاحظات</span>
            </button>

            <button
              onClick={() => setCurrentTab("topics-library")}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                currentTab === "topics-library"
                  ? "bg-slate-900 text-white ring-2 ring-slate-900/20"
                  : "bg-slate-100/90 text-slate-700 hover:bg-slate-200 border border-slate-200/80"
              }`}
              title="مكتبة موضوعات اجتماعات مكافحة العدوى"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden lg:inline">مكتبة الموضوعات</span>
            </button>

            <button
              onClick={onOpenTemplatesManager}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100/90 text-slate-700 hover:bg-slate-200 border border-slate-200/80 transition-all shadow-2xs cursor-pointer"
              title="رفع وتصدير قوالب المراكز والملاحظات الأخرى"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden xl:inline">قوالب المراكز</span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-0.5 hidden sm:block" />

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-all hover:scale-105 shadow-2xs cursor-pointer"
              title="إعدادات المركز واللجنة"
            >
              <Settings className="w-4 h-4" />
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200/80 transition-all hover:scale-105 shadow-2xs cursor-pointer"
                title="قفل النظام وتسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-50/90 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-2 gap-2 scrollbar-none">
          <nav className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setCurrentTab("portal")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                currentTab === "portal"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30 ring-1 ring-blue-500"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>الرئيسية / بوابة البدء</span>
            </button>

            <button
              onClick={() => setCurrentTab("meetings")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                currentTab === "meetings" || currentTab === "meeting-view" || currentTab === "meeting-edit"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30 ring-1 ring-blue-500"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>الاجتماعات الشهرية للجنة</span>
            </button>

            <button
              onClick={() => setCurrentTab("hand-hygiene")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                currentTab === "hand-hygiene"
                  ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm shadow-orange-500/30 ring-1 ring-orange-500"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>إحصائية غسيل الأيدي (WHO)</span>
            </button>

            <button
              onClick={() => setCurrentTab("rounds")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                currentTab === "rounds" || currentTab === "round-view" || currentTab === "round-edit"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30 ring-1 ring-blue-500"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>تقارير المرور الميداني</span>
            </button>

            <button
              onClick={() => setCurrentTab("monthly-plan")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                currentTab === "monthly-plan"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30 ring-1 ring-blue-500"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>الخطة السنوية (12 شهراً)</span>
            </button>

            <button
              onClick={() => setCurrentTab("observations-bank")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                currentTab === "observations-bank"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30 ring-1 ring-blue-500"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>بنك الملاحظات</span>
            </button>

            <button
              onClick={() => setCurrentTab("topics-library")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                currentTab === "topics-library"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30 ring-1 ring-blue-500"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>مكتبة الموضوعات</span>
            </button>
          </nav>

          {/* Primary Quick Create Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNewRound}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-slate-400 transition-all shadow-2xs active:scale-98 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>مرور جديد</span>
            </button>

            <button
              onClick={onNewMeeting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm shadow-blue-500/25 active:scale-98 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>اجتماع شهري جديد</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
