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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
      {/* Top Banner / Center Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Center Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-base sm:text-lg leading-tight tracking-tight">
                  {centerSettings.centerName || "Waheed IPC"}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {centerSettings.departmentTitle || "لجنة مكافحة العدوى"}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                نظام إدارة وتوثيق الاجتماعات الشهرية وتقارير المرور الميداني
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAiModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shadow-2xs"
              title="مساعد الذكاء الاصطناعي لاقتراح جداول الأعمال والحلول التصحيحية"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">مساعد مكافحة العدوى الذكي</span>
              <span className="md:hidden">الذكاء الاصطناعي</span>
            </button>

            <button
              onClick={() => setCurrentTab("topics-library")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-2xs ${
                currentTab === "topics-library"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
              }`}
              title="مكتبة موضوعات اجتماعات مكافحة العدوى"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مكتبة الموضوعات</span>
            </button>

            <button
              onClick={onOpenObservationsBank}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors shadow-2xs"
              title="بنك الملاحظات الميدانية القياسية والتوصيات"
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden lg:inline">بنك الملاحظات</span>
            </button>

            <button
              onClick={onOpenTemplatesManager}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors shadow-2xs"
              title="رفع وتصدير قوالب المراكز والملاحظات الأخرى"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden xl:inline">قوالب المراكز</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="إعدادات المركز واللجنة"
            >
              <Settings className="w-4 h-4" />
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-md text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                title="قفل النظام وتسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-2 gap-2">
          <nav className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setCurrentTab("meetings")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                currentTab === "meetings" || currentTab === "meeting-view" || currentTab === "meeting-edit"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>الاجتماعات الشهرية للجنة</span>
            </button>

            <button
              onClick={() => setCurrentTab("topics-library")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                currentTab === "topics-library"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>مكتبة الموضوعات</span>
            </button>

            <button
              onClick={() => setCurrentTab("rounds")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                currentTab === "rounds" || currentTab === "round-view" || currentTab === "round-edit"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>تقارير المرور الميداني</span>
            </button>

            <button
              onClick={() => setCurrentTab("monthly-plan")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                currentTab === "monthly-plan"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>الخطة السنوية (12 شهراً)</span>
            </button>
          </nav>

          {/* Primary Quick Create Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNewRound}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-600" />
              <span>مرور جديد</span>
            </button>

            <button
              onClick={onNewMeeting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
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
