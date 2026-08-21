import React, { useState } from "react";
import {
  FileDown,
  Printer,
  Edit,
  ArrowRight,
  Copy,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Share2,
  ZoomIn,
  ZoomOut,
  Type,
  Trash2,
} from "lucide-react";
import { Meeting } from "../types";
import { exportMeetingToDocx } from "../utils/docxExport";

interface MeetingViewProps {
  meeting: Meeting;
  onEdit: (meeting: Meeting) => void;
  onBack: () => void;
  onDuplicate: (meeting: Meeting) => void;
  onDelete?: (id: string) => void;
}

export const MeetingView: React.FC<MeetingViewProps> = ({
  meeting,
  onEdit,
  onBack,
  onDuplicate,
  onDelete,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontSizeMode, setFontSizeMode] = useState<"normal" | "large" | "xlarge">("large");

  const handleDelete = () => {
    if (window.confirm(`هل أنت متأكد تماماً من حذف محضر الاجتماع رقم (${meeting.meetingNumber}) المنعقد بتاريخ ${meeting.date}؟\nلا يمكن التراجع عن هذا الإجراء.`)) {
      if (onDelete) {
        onDelete(meeting.id);
      }
    }
  };

  const handleDownloadDocx = async () => {
    try {
      setDownloading(true);
      await exportMeetingToDocx(meeting);
    } catch (err) {
      console.error("Export error:", err);
      alert("حدث خطأ أثناء تصدير ملف Word. يرجى المحاولة مرة أخرى.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `محضر اجتماع لجنة مكافحة العدوى رقم (${meeting.meetingNumber})
المركز: ${meeting.centerName}
التاريخ: ${meeting.day} الموافق ${meeting.date}
عدد التوصيات والقرارات: ${meeting.decisions.length}
مؤشرات الأداء: ${meeting.kpis.map((k) => `${k.name}: ${k.value}`).join(" | ")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Font size classes based on state
  const fontSizeConfig = {
    normal: {
      bodyText: "text-sm sm:text-base leading-relaxed",
      statementText: "text-base sm:text-lg font-bold leading-relaxed",
      heading1: "text-xl sm:text-2xl font-black",
      heading2: "text-lg sm:text-xl font-extrabold",
      sectionHeading: "text-base sm:text-lg font-black",
      tableText: "text-xs sm:text-sm",
      tableHeader: "text-xs sm:text-sm font-black",
      listText: "text-sm sm:text-base leading-relaxed",
      signText: "text-sm sm:text-base",
    },
    large: {
      bodyText: "text-base sm:text-lg leading-relaxed",
      statementText: "text-lg sm:text-xl font-bold leading-loose",
      heading1: "text-2xl sm:text-3xl font-black",
      heading2: "text-xl sm:text-2xl font-black",
      sectionHeading: "text-lg sm:text-xl font-black",
      tableText: "text-sm sm:text-base",
      tableHeader: "text-sm sm:text-base font-black",
      listText: "text-base sm:text-lg leading-relaxed",
      signText: "text-base sm:text-lg",
    },
    xlarge: {
      bodyText: "text-lg sm:text-xl leading-loose",
      statementText: "text-xl sm:text-2xl font-extrabold leading-loose",
      heading1: "text-3xl sm:text-4xl font-black",
      heading2: "text-2xl sm:text-3xl font-black",
      sectionHeading: "text-xl sm:text-2xl font-black",
      tableText: "text-base sm:text-lg",
      tableHeader: "text-base sm:text-lg font-black",
      listText: "text-lg sm:text-xl leading-loose",
      signText: "text-lg sm:text-xl",
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
            <span>رجوع للاجتماعات</span>
          </button>
          <div className="border-r border-slate-200 h-6"></div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              محضر اجتماع رقم ({meeting.meetingNumber}) - {meeting.date}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              معاينة وتنسيق المحضر للطباعة الرسمية والتصدير
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Font Size Adjustment Controller */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
            <span className="px-2 text-slate-500 flex items-center gap-1">
              <Type className="w-3.5 h-3.5" />
              <span>حجم الخط:</span>
            </span>
            <button
              type="button"
              onClick={() => setFontSizeMode("normal")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                fontSizeMode === "normal"
                  ? "bg-white text-blue-700 shadow-2xs font-extrabold"
                  : "hover:text-slate-900"
              }`}
            >
              عادي
            </button>
            <button
              type="button"
              onClick={() => setFontSizeMode("large")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                fontSizeMode === "large"
                  ? "bg-white text-blue-700 shadow-2xs font-extrabold"
                  : "hover:text-slate-900"
              }`}
            >
              كبير (موصى به)
            </button>
            <button
              type="button"
              onClick={() => setFontSizeMode("xlarge")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                fontSizeMode === "xlarge"
                  ? "bg-white text-blue-700 shadow-2xs font-extrabold"
                  : "hover:text-slate-900"
              }`}
            >
              كبير جداً
            </button>
          </div>

          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "تم النسخ" : "نسخ ملخص"}</span>
          </button>

          <button
            onClick={() => onDuplicate(meeting)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
            title="إنشاء اجتماع جديد بنفس الهيكل والأعضاء للشهر القادم"
          >
            <Copy className="w-4 h-4 text-slate-600" />
            <span>استنساخ لشهر جديد</span>
          </button>

          <button
            onClick={() => onEdit(meeting)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shadow-2xs"
          >
            <Edit className="w-4 h-4" />
            <span>تعديل المحضر</span>
          </button>

          {onDelete && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors shadow-2xs"
              title="حذف هذا المحضر نهائياً"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>حذف المحضر</span>
            </button>
          )}

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

      {/* Printable Document Container (Styled cleanly, large fonts, strict right alignment) */}
      <div
        id="printable-meeting-document"
        className="bg-white rounded-2xl shadow-sm border border-slate-300 max-w-4xl mx-auto p-8 sm:p-12 text-slate-900 text-right print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none"
        dir="rtl"
      >
        
        {/* Document Header */}
        <div className="mb-6 flex justify-between items-start border-b-2 border-slate-800 pb-4">
          <div className="text-right">
            <h1 className={`${fontSizeConfig.heading1} text-slate-900 tracking-tight`}>
              {meeting.centerName || "Waheed IPC"}
            </h1>
            <p className={`${fontSizeConfig.bodyText} font-bold text-slate-700 mt-1`}>
              {meeting.departmentTitle || "لجنة مكافحة العدوى"}
            </p>
          </div>

          <div className="text-left text-xs sm:text-sm text-slate-600 font-semibold space-y-1">
            {meeting.time && (
              <div className="flex items-center gap-1.5 justify-end">
                <span>{meeting.time}</span>
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
            )}
            {meeting.location && (
              <div className="flex items-center gap-1.5 justify-end">
                <span>{meeting.location}</span>
                <MapPin className="w-4 h-4 text-slate-500" />
              </div>
            )}
          </div>
        </div>

        {/* Meeting Title Banner */}
        <div className="text-center my-6">
          <h2 className={`${fontSizeConfig.heading2} text-slate-900 font-black`}>
            لجنة مكافحة العدوى
          </h2>
          <div className="inline-block bg-slate-100 border border-slate-400 px-6 py-1 rounded-full mt-2">
            <p className={`${fontSizeConfig.sectionHeading} text-slate-900 font-black`}>
              الاجتماع رقم ({meeting.meetingNumber})
            </p>
          </div>
        </div>

        {/* Meeting Opening Statement */}
        <div className={`my-6 ${fontSizeConfig.statementText} text-slate-900 text-right leading-loose border-r-4 border-slate-900 pr-3 bg-slate-50/70 p-3 rounded-l-lg`}>
          إنه في يوم : <span className="font-black text-black">{meeting.day}</span> الموافق : <span className="font-black text-black" dir="ltr">{meeting.date}</span>م، تم انعقاد اجتماع لجنة مكافحة العدوى بحضور السادة الأعضاء الآتي ذكرهم :
        </div>

        {/* Attendees Table */}
        <div className="overflow-x-auto my-6">
          <table className="w-full text-right border-collapse border-2 border-black" dir="rtl">
            <thead>
              <tr className="bg-slate-200 border-b-2 border-black">
                <th className={`border-2 border-black px-4 py-3 text-center w-[35%] ${fontSizeConfig.tableHeader}`}>
                  الاسم
                </th>
                <th className={`border-2 border-black px-4 py-3 text-center w-[35%] ${fontSizeConfig.tableHeader}`}>
                  الوظيفة
                </th>
                <th className={`border-2 border-black px-4 py-3 text-center w-[30%] ${fontSizeConfig.tableHeader}`}>
                  التوقيع
                </th>
              </tr>
            </thead>
            <tbody>
              {meeting.members.map((m) => (
                <tr key={m.id} className="border-b border-black">
                  <td className={`border border-black px-4 py-2.5 font-bold text-right ${fontSizeConfig.tableText}`}>
                    {m.name}
                  </td>
                  <td className={`border border-black px-4 py-2.5 text-center font-medium ${fontSizeConfig.tableText}`}>
                    {m.role}
                  </td>
                  <td className={`border border-black px-4 py-2.5 text-center min-h-[38px] ${fontSizeConfig.tableText}`}>
                    <span className={m.attended ? "font-bold text-slate-900" : "text-slate-500 italic"}>
                      {m.signatureNote && m.signatureNote !== "تم التوقيع"
                        ? m.signatureNote
                        : (!m.attended ? "اعتذر" : "")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Agenda Section */}
        <div className="my-8">
          <h3 className={`${fontSizeConfig.sectionHeading} text-slate-900 mb-3 text-right pb-1 border-b-2 border-black inline-block font-black`}>
            جدول الأعمال
          </h3>
          <ul className="space-y-2.5 pr-4 list-disc list-outside text-right mr-3" dir="rtl">
            {meeting.agenda.map((item, idx) => (
              <li key={idx} className={`${fontSizeConfig.listText} font-bold text-slate-900 marker:text-black`}>
                <bdi className="arabic-mixed-text">{item}</bdi>
              </li>
            ))}
          </ul>
        </div>

        {/* Follow up on previous meeting */}
        {meeting.previousMeetingFollowUp && (
          <div className="my-6 bg-slate-50 border border-slate-300 p-4 rounded-xl text-right">
            <h4 className={`${fontSizeConfig.bodyText} font-extrabold text-slate-900 mb-1.5`}>
              * متابعة ما تم إنجازه بالاجتماع السابق {meeting.previousMeetingDate ? `بتاريخ ${meeting.previousMeetingDate}` : ""} :
            </h4>
            <div className={`pr-4 ${fontSizeConfig.bodyText} text-slate-800 font-semibold`}>
              • {meeting.previousMeetingFollowUp}
            </div>
          </div>
        )}

        {/* Performance Indicators (KPIs) */}
        {meeting.kpis && meeting.kpis.length > 0 && (
          <div className="my-8">
            <h3 className={`${fontSizeConfig.sectionHeading} text-slate-900 mb-3 text-right pb-1 border-b-2 border-black inline-block font-black`}>
              مؤشرات الأداء
            </h3>
            <ul className="space-y-3 pr-4 list-disc list-outside text-right mr-3" dir="rtl">
              {meeting.kpis.map((kpi, idx) => (
                <li key={idx} className={`${fontSizeConfig.listText} text-slate-900 font-bold marker:text-black`}>
                  <span>{kpi.name} : </span>
                  <span className="font-extrabold text-black mr-1" dir="ltr">
                    {kpi.value}
                  </span>
                  {kpi.target && (
                    <span className="text-slate-600 font-semibold mr-3">
                      [المستهدف: <span dir="ltr">{kpi.target}</span>]
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Decisions and Recommendations Section */}
        <div className="my-8">
          <h3 className={`${fontSizeConfig.sectionHeading} text-slate-900 mb-3 text-right pb-1 border-b-2 border-black inline-block font-black`}>
            القرارات والتوصيات
          </h3>
          
          <div className="overflow-x-auto my-3">
            <table className="w-full text-right border-collapse border-2 border-black" dir="rtl">
              <thead>
                <tr className="bg-slate-200 border-b-2 border-black text-center">
                  <th className={`border-2 border-black px-3 py-3 w-[22%] text-right ${fontSizeConfig.tableHeader}`}>
                    الموضوع
                  </th>
                  <th className={`border-2 border-black px-3 py-3 w-[36%] text-right ${fontSizeConfig.tableHeader}`}>
                    التوصية / القرار
                  </th>
                  <th className={`border-2 border-black px-2 py-3 w-[18%] text-center ${fontSizeConfig.tableHeader}`}>
                    المسؤول عن التنفيذ
                  </th>
                  <th className={`border-2 border-black px-2 py-3 w-[11%] text-center ${fontSizeConfig.tableHeader}`}>
                    المدة الزمنية
                  </th>
                  <th className={`border-2 border-black px-2 py-3 w-[13%] text-center ${fontSizeConfig.tableHeader}`}>
                    وسيلة المتابعة
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...meeting.decisions]
                  .sort((a, b) => {
                    if (a.isCarriedOver && !b.isCarriedOver) return -1;
                    if (!a.isCarriedOver && b.isCarriedOver) return 1;
                    return 0;
                  })
                  .map((d, index) => (
                  <tr key={d.id || index} className={`border-b border-black ${d.isCarriedOver ? "bg-amber-50/30 print:bg-transparent" : ""}`}>
                    <td className={`border border-black px-3 py-3 font-bold text-right align-top ${fontSizeConfig.tableText}`}>
                      {d.isCarriedOver && (
                        <span className="inline-block bg-amber-100 text-amber-950 border border-amber-300 text-[11px] font-extrabold px-1.5 py-0.5 rounded ml-1 mb-1 shadow-2xs print:border-black print:bg-slate-100">
                          📌 [مرحل من السابق للمناقشة {d.sourceMeetingNumber ? `(محضر ${d.sourceMeetingNumber})` : ""}]
                        </span>
                      )}
                      <bdi className="arabic-mixed-text block">{d.topic}</bdi>
                    </td>
                    <td className={`border border-black px-3 py-3 font-medium text-right leading-relaxed align-top ${fontSizeConfig.tableText}`}>
                      <bdi className="arabic-mixed-text">{d.decision}</bdi>
                    </td>
                    <td className={`border border-black px-2 py-3 text-center align-middle font-bold text-slate-800 ${fontSizeConfig.tableText}`}>
                      {d.responsible}
                    </td>
                    <td className={`border border-black px-2 py-3 text-center align-middle font-black text-slate-900 whitespace-nowrap ${fontSizeConfig.tableText}`}>
                      {d.duration}
                    </td>
                    <td className={`border border-black px-2 py-3 text-center align-middle font-medium ${fontSizeConfig.tableText}`}>
                      {d.monitoringMethod}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Approvals Section */}
        <div className="mt-14 pt-6 border-t-2 border-slate-900 signatures-section">
          <div className="text-center mb-8">
            <h4 className={`${fontSizeConfig.sectionHeading} font-black text-slate-900 underline decoration-2 underline-offset-8 inline-block`}>
              الاعتماد
            </h4>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center" dir="rtl">
            <div className="space-y-3">
              <p className={`${fontSizeConfig.signText} font-black text-slate-900`}>
                مسؤول مكافحة العدوى
              </p>
              <div className="h-10 flex items-center justify-center">
                <div className="w-3/4 border-b border-dashed border-slate-400"></div>
              </div>
              <p className={`${fontSizeConfig.signText} text-slate-900 font-extrabold`}>
                {meeting.approvals?.infectionControlLead || "م/ أحمد وحيد شعبان"}
              </p>
            </div>

            <div className="space-y-3">
              <p className={`${fontSizeConfig.signText} font-black text-slate-900`}>
                مشرف التمريض
              </p>
              <div className="h-10 flex items-center justify-center">
                <div className="w-3/4 border-b border-dashed border-slate-400"></div>
              </div>
              <p className={`${fontSizeConfig.signText} text-slate-900 font-extrabold`}>
                {meeting.approvals?.preparedBy || "م/ عبد الله إبراهيم عمر"}
              </p>
            </div>

            <div className="space-y-3">
              <p className={`${fontSizeConfig.signText} font-black text-slate-900`}>
                المدير الطبي
              </p>
              <div className="h-10 flex items-center justify-center">
                <div className="w-3/4 border-b border-dashed border-slate-400"></div>
              </div>
              <p className={`${fontSizeConfig.signText} text-slate-900 font-extrabold`}>
                {meeting.approvals?.medicalDirector || "ا.د / احمد مصطفى"}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

