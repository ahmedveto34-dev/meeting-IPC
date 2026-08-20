import React, { useState } from "react";
import {
  FileDown,
  Printer,
  Edit,
  ArrowRight,
  Send,
  CheckCircle2,
  Copy,
  Calendar,
  Type,
  Trash2,
} from "lucide-react";
import { RoundReport } from "../types";
import { exportRoundToDocx } from "../utils/docxExport";

interface RoundViewProps {
  round: RoundReport;
  onEdit: (round: RoundReport) => void;
  onBack: () => void;
  onConvertToMeeting?: (round: RoundReport) => void;
  onDelete?: (id: string) => void;
}

export const RoundView: React.FC<RoundViewProps> = ({
  round,
  onEdit,
  onBack,
  onConvertToMeeting,
  onDelete,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontSizeMode, setFontSizeMode] = useState<"normal" | "large" | "xlarge">("large");

  const handleDelete = () => {
    if (window.confirm(`هل أنت متأكد تماماً من حذف تقرير المرور (${round.title}) ليوم ${round.day} (${round.date})؟\nلا يمكن التراجع عن هذا الإجراء.`)) {
      if (onDelete) {
        onDelete(round.id);
      }
    }
  };

  const handleDownloadDocx = async () => {
    try {
      setDownloading(true);
      await exportRoundToDocx(round);
    } catch (err) {
      console.error("Round docx export error:", err);
      alert("حدث خطأ أثناء تصدير تقرير المرور بصيغة Word.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `تقرير المرور الاسبوعي - مكافحة العدوى
اليوم: ${round.day} | التاريخ: ${round.date} | الفترة: ${round.period}
القائم بالمرور: ${round.inspector}
عدد الملاحظات: ${round.observations.length}
${round.observations.map((o, idx) => `${idx + 1}. [${o.location}] ${o.observation} => ${o.recommendation}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fontSizeConfig = {
    normal: {
      title: "text-xl sm:text-2xl font-black",
      metaText: "text-xs sm:text-sm",
      tableHeader: "text-xs sm:text-sm font-black",
      tableText: "text-xs sm:text-sm leading-relaxed",
      signText: "text-sm sm:text-base font-bold",
    },
    large: {
      title: "text-2xl sm:text-3xl font-black",
      metaText: "text-sm sm:text-base font-bold",
      tableHeader: "text-sm sm:text-base font-black",
      tableText: "text-sm sm:text-base leading-relaxed font-semibold",
      signText: "text-base sm:text-lg font-black",
    },
    xlarge: {
      title: "text-3xl sm:text-4xl font-black",
      metaText: "text-base sm:text-lg font-bold",
      tableHeader: "text-base sm:text-lg font-black",
      tableText: "text-base sm:text-lg leading-loose font-bold",
      signText: "text-lg sm:text-xl font-black",
    },
  }[fontSizeMode];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Top Action Toolbar (Hidden during Print) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع للتقارير</span>
          </button>
          <div className="border-r border-slate-200 h-6"></div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              {round.title} - {round.day} ({round.date})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              القائم بالمرور: {round.inspector} | {round.observations.length} ملاحظات مرصودة
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Font Size Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
            <span className="px-2 text-slate-500 flex items-center gap-1">
              <Type className="w-3.5 h-3.5" />
              <span>حجم الخط:</span>
            </span>
            <button
              type="button"
              onClick={() => setFontSizeMode("normal")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                fontSizeMode === "normal" ? "bg-white text-blue-700 shadow-2xs font-extrabold" : "hover:text-slate-900"
              }`}
            >
              عادي
            </button>
            <button
              type="button"
              onClick={() => setFontSizeMode("large")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                fontSizeMode === "large" ? "bg-white text-blue-700 shadow-2xs font-extrabold" : "hover:text-slate-900"
              }`}
            >
              كبير
            </button>
            <button
              type="button"
              onClick={() => setFontSizeMode("xlarge")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                fontSizeMode === "xlarge" ? "bg-white text-blue-700 shadow-2xs font-extrabold" : "hover:text-slate-900"
              }`}
            >
              كبير جداً
            </button>
          </div>

          {onConvertToMeeting && (
            <button
              onClick={() => onConvertToMeeting(round)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors shadow-2xs"
              title="تحويل هذه الملاحظات إلى بنود وقرارات باجتماع لجنة مكافحة العدوى"
            >
              <Send className="w-3.5 h-3.5" />
              <span>تحويل لمحضر اجتماع</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "تم النسخ" : "نسخ النص"}</span>
          </button>

          <button
            onClick={() => onEdit(round)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shadow-2xs"
          >
            <Edit className="w-4 h-4" />
            <span>تعديل التقرير</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold text-slate-800 bg-white border-2 border-slate-400 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>طباعة / حفظ PDF</span>
          </button>

          <button
            onClick={handleDownloadDocx}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
          >
            <FileDown className="w-4 h-4" />
            <span>{downloading ? "جاري التصدير..." : "تنزيل Word (.docx)"}</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container (Styled with Double Border exactly like official hospital sheets) */}
      <div
        className="bg-white rounded-2xl shadow-sm border-4 border-double border-black max-w-4xl mx-auto p-8 sm:p-12 text-slate-900 text-right print:shadow-none print:m-0 print:max-w-none print:border-4 print:border-double print:border-black min-h-[900px] flex flex-col justify-between"
        dir="rtl"
      >
        
        <div>
          {/* Header Title: تقرير المرور الاسبوعي */}
          <div className="text-center my-6">
            <h1 className={`${fontSizeConfig.title} text-slate-900 tracking-wide underline decoration-2 underline-offset-8 inline-block`}>
              {round.title || "تقرير المرور الاسبوعي"}
            </h1>
          </div>

          {/* Metadata Table (الفترة / اليوم / القائم بالمرور / التاريخ) */}
          <div className="my-6">
            <table className="w-full text-right border-collapse border-2 border-black" dir="rtl">
              <tbody>
                <tr className="border-b-2 border-black">
                  <td className={`border-2 border-black px-4 py-3 w-1/2 ${fontSizeConfig.metaText}`}>
                    <span className="font-black text-black">الفترة : </span>
                    <span className="font-bold text-slate-900">{round.period || "صباحي"}</span>
                  </td>
                  <td className={`border-2 border-black px-4 py-3 w-1/2 ${fontSizeConfig.metaText}`}>
                    <span className="font-black text-black">اليوم : </span>
                    <span className="font-bold text-slate-900">{round.day || "الأحد"}</span>
                  </td>
                </tr>
                <tr>
                  <td className={`border-2 border-black px-4 py-3 w-1/2 ${fontSizeConfig.metaText}`}>
                    <span className="font-black text-black">القائم بالمرور : </span>
                    <span className="font-bold text-slate-900">{round.inspector || "م/ أحمد وحيد شعبان"}</span>
                  </td>
                  <td className={`border-2 border-black px-4 py-3 w-1/2 ${fontSizeConfig.metaText}`}>
                    <span className="font-black text-black">التاريخ : </span>
                    <span className="font-bold text-slate-900" dir="ltr">{round.date || "2026/06/28"}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Observations Table (الموقع | الملاحظات | التوصيات | المسؤول عن التنفيذ) */}
          <div className="overflow-x-auto my-6">
            <table className="w-full text-right border-collapse border-2 border-black" dir="rtl">
              <thead>
                <tr className="bg-slate-200 border-b-2 border-black text-center">
                  <th className={`border-2 border-black px-4 py-3 w-[20%] text-center ${fontSizeConfig.tableHeader}`}>
                    الموقع
                  </th>
                  <th className={`border-2 border-black px-4 py-3 w-[35%] text-right ${fontSizeConfig.tableHeader}`}>
                    الملاحظات المرصودة
                  </th>
                  <th className={`border-2 border-black px-4 py-3 w-[30%] text-right ${fontSizeConfig.tableHeader}`}>
                    التوصيات والإجراء التصحيحي
                  </th>
                  <th className={`border-2 border-black px-3 py-3 w-[15%] text-center ${fontSizeConfig.tableHeader}`}>
                    المسؤول عن التنفيذ
                  </th>
                </tr>
              </thead>
              <tbody>
                {round.observations.map((obs, idx) => (
                  <tr key={obs.id || idx} className="border-b border-black">
                    <td className={`border border-black px-4 py-3 font-black text-center align-top ${fontSizeConfig.tableText}`}>
                      {obs.location}
                    </td>
                    <td className={`border border-black px-4 py-3 text-right leading-relaxed align-top ${fontSizeConfig.tableText}`}>
                      <bdi className="arabic-mixed-text">{obs.observation}</bdi>
                    </td>
                    <td className={`border border-black px-4 py-3 text-right leading-relaxed align-top ${fontSizeConfig.tableText}`}>
                      <bdi className="arabic-mixed-text">{obs.recommendation}</bdi>
                    </td>
                    <td className={`border border-black px-3 py-3 text-center align-top font-bold text-slate-800 ${fontSizeConfig.tableText}`}>
                      {obs.responsible}
                    </td>
                  </tr>
                ))}

                {/* Pad empty rows if list is short to fill the formal inspection sheet */}
                {Array.from({ length: Math.max(0, 4 - round.observations.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b border-black h-12">
                    <td className="border border-black px-3 py-2"></td>
                    <td className="border border-black px-3 py-2"></td>
                    <td className="border border-black px-3 py-2"></td>
                    <td className="border border-black px-3 py-2"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Signature: مشرف مكافحة العدوى */}
        <div className="mt-12 pt-6 signatures-section">
          <div className="flex flex-col items-start pr-4 text-right">
            <p className={`${fontSizeConfig.signText} text-slate-900 font-black`}>
              {round.supervisorRole || "مشرف مكافحة العدوى"}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className={`${fontSizeConfig.metaText} font-bold text-slate-800`}>التوقيع : </span>
              <span className={`${fontSizeConfig.signText} text-slate-900 font-extrabold underline decoration-slate-400`}>
                {round.inspector || "م/ أحمد وحيد شعبان"}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

