import React, { useState } from "react";
import { X, Copy, Check, Code2, ExternalLink, Sparkles, CheckCircle2, ShieldCheck, FileSpreadsheet } from "lucide-react";
import {
  getGoogleAppsScriptTemplateCode,
  getGoogleSheetUrl,
  getGoogleSheetId,
  getGoogleSpreadsheetDirectUrl,
} from "../utils/googleSheetsSync";

interface AppsScriptCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppsScriptCodeModal: React.FC<AppsScriptCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const code = getGoogleAppsScriptTemplateCode();
  const currentSheetId = getGoogleSheetId();
  const directSheetUrl = getGoogleSpreadsheetDirectUrl(currentSheetId);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 font-['Cairo',sans-serif]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white">
                كود الربط والتخزين في Google Sheets (Google Apps Script)
              </h3>
              <p className="text-xs text-emerald-200/90 font-medium">
                لحفظ اجتماعات اللجنة وجولات المرور وإحصائيات غسيل الأيدي (WHO) في نفس ملف الشيت
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto grow p-5 sm:p-6 space-y-5 text-slate-700 text-xs sm:text-sm">
          
          {/* Target Spreadsheet Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 block flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                ملف Google Sheets المعتمد للحفظ:
              </span>
              <p className="text-xs font-mono text-slate-300 select-all font-semibold">
                {currentSheetId}
              </p>
            </div>

            <a
              href={directSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
            >
              <span>فتح ملف الشيت في Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick Steps Guide */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2.5 text-emerald-950">
            <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>خطوات تفعيل الربط التلقائي في Google Sheets:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-emerald-900/90 font-medium leading-relaxed">
              <li>افتح ملف <strong>Google Sheets</strong> الخاص بك في المتصفح.</li>
              <li>من القائمة العلوية اضغط على <strong>التطبيقات الإضافية (Extensions)</strong> ثم اختر <strong>Apps Script</strong>.</li>
              <li>احذف أي كود موجود بالداخل والصق الكود الموجود بالأسفل كاملاً.</li>
              <li>اضغط على زر <strong>نشر (Deploy)</strong> ← <strong>نشر جديد (New deployment)</strong> ← اختر نوع <strong>تطبيق ويب (Web app)</strong>.</li>
              <li>اجعل خيار الوصول: <strong>أي شخص (Anyone)</strong> ثم اضغط نشر (Deploy) ووافق على الصلاحيات.</li>
            </ol>
          </div>

          {/* Features Supported Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                محاضر الاجتماعات
              </span>
              <p className="text-[11px] text-slate-500">تبويب: <code>محاضر_اجتماعات_مكافحة_العدوى</code></p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                جولات المرور الميداني
              </span>
              <p className="text-[11px] text-slate-500">تبويب: <code>تقارير_المرور_الميداني</code></p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                إحصائيات غسيل الأيدي WHO
              </span>
              <p className="text-[11px] text-slate-500">تبويب: <code>سجل_جلسات_غسيل_الأيدي_WHO</code> و <code>ملخص_إحصائيات_غسيل_الأيدي_WHO</code></p>
            </div>
          </div>

          {/* Code Container with Copy Button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-slate-500" />
                كود Google Apps Script الكامل المعتمد:
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                <span>{copied ? "تم النسخ بنجاح!" : "نسخ الكود البرمجي"}</span>
              </button>
            </div>

            <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-72 border border-slate-800 leading-relaxed dir-ltr text-left">
              {code}
            </pre>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>يتم تشفير وتأمين البيانات ونقلها مباشرة إلى Google Drive و Sheets</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
