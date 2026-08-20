import React, { useState } from "react";
import {
  FileText,
  PlusCircle,
  FileDown,
  Printer,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Eye,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Meeting } from "../types";
import { exportMeetingToDocx } from "../utils/docxExport";

interface MeetingsListProps {
  meetings: Meeting[];
  onViewMeeting: (meeting: Meeting) => void;
  onEditMeeting: (meeting: Meeting) => void;
  onNewMeeting: () => void;
  onDuplicateMeeting: (meeting: Meeting) => void;
  onDeleteMeeting: (id: string) => void;
}

export const MeetingsList: React.FC<MeetingsListProps> = ({
  meetings,
  onViewMeeting,
  onEditMeeting,
  onNewMeeting,
  onDuplicateMeeting,
  onDeleteMeeting,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadDocx = async (e: React.MouseEvent, meeting: Meeting) => {
    e.stopPropagation();
    try {
      setDownloadingId(meeting.id);
      await exportMeetingToDocx(meeting);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تنزيل ملف Word");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Summary */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              سجل اجتماعات لجنة مكافحة العدوى الشهرية
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إدارة محاضر الاجتماعات الشهرية وتوثيق الحضور والقرارات والتوصيات مع التنزيل الفوري بصيغة Word
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewMeeting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إنشاء محضر اجتماع جديد</span>
          </button>
        </div>
      </div>

      {/* Meetings Cards Grid */}
      {meetings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 space-y-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">لا توجد محاضر اجتماعات مسجلة</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              ابدأ بإنشاء أول محضر اجتماع للجنة مكافحة العدوى أو اختر شهراً من الخطة السنوية
            </p>
          </div>
          <button
            onClick={onNewMeeting}
            className="px-4 py-2 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs"
          >
            + إنشاء محضر اجتماع الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => onViewMeeting(meeting)}
              className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer space-y-4 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Meeting Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-1.5">
                      اجتماع رقم ({meeting.meetingNumber})
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      محضر اجتماع لجنة مكافحة العدوى
                    </h3>
                  </div>

                  <div className="text-left text-xs text-slate-500 font-medium">
                    <div>{meeting.day}</div>
                    <div className="font-bold text-slate-800">{meeting.date}</div>
                  </div>
                </div>

                {/* Agenda snippet */}
                <div className="space-y-1 bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs text-slate-700">
                  <span className="font-bold text-slate-800 block mb-1">جدول الأعمال:</span>
                  <ul className="list-disc list-inside space-y-0.5 pr-1 line-clamp-2">
                    {meeting.agenda.slice(0, 2).map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                    {meeting.agenda.length > 2 && (
                      <li className="text-slate-400 font-normal">
                        + {meeting.agenda.length - 2} بنود إضافية...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Stats Bar */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{meeting.decisions.length} قرارات وتوصيات</span>
                  </span>

                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{meeting.members.length} أعضاء</span>
                  </span>

                  {meeting.kpis.length > 0 && (
                    <span className="text-[11px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                      {meeting.kpis[0].name}: {meeting.kpis[0].value}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditMeeting(meeting);
                    }}
                    className="p-1.5 rounded-md text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    title="تعديل المحضر"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateMeeting(meeting);
                    }}
                    className="p-1.5 rounded-md text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                    title="استنساخ لشهر جديد"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`هل أنت متأكد من حذف محضر الاجتماع رقم (${meeting.meetingNumber})؟`)) {
                        onDeleteMeeting(meeting.id);
                      }
                    }}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="حذف المحضر"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleDownloadDocx(e, meeting)}
                    disabled={downloadingId === meeting.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                    title="تنزيل ملف Word منسق جاهز للطباعة"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>{downloadingId === meeting.id ? "تنزيل..." : "تنزيل Word (.docx)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewMeeting(meeting)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>معاينة</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
