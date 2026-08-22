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
    <div className="space-y-6 pb-8">
      
      {/* Top Banner / Summary */}
      <div className="relative rounded-3xl p-6 sm:p-7 text-white shadow-xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <FileText className="w-5 h-5 stroke-[2.3]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              سجل اجتماعات لجنة مكافحة العدوى الشهرية
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            إدارة محاضر الاجتماعات الشهرية وتوثيق الحضور والقرارات والتوصيات مع التنزيل الفوري بصيغة Word
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <button
            onClick={onNewMeeting}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-98 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>إنشاء محضر اجتماع جديد</span>
          </button>
        </div>
      </div>

      {/* Meetings Cards Grid */}
      {meetings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200 shadow-inner">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">لا توجد محاضر اجتماعات مسجلة</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
              ابدأ بإنشاء أول محضر اجتماع للجنة مكافحة العدوى أو اختر شهراً من الخطة السنوية
            </p>
          </div>
          <button
            onClick={onNewMeeting}
            className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 cursor-pointer"
          >
            + إنشاء محضر اجتماع الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => onViewMeeting(meeting)}
              className="bg-white rounded-3xl border border-slate-200/90 hover:border-indigo-500 p-5 sm:p-6 shadow-md hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer space-y-4 group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-3.5">
                {/* Meeting Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-800 border border-indigo-200 mb-2 shadow-2xs">
                      اجتماع رقم ({meeting.meetingNumber})
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      محضر اجتماع لجنة مكافحة العدوى
                    </h3>
                  </div>

                  <div className="text-left text-xs text-slate-500 font-bold shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <div className="text-slate-400 font-medium">{meeting.day}</div>
                    <div className="font-black text-slate-800 mt-0.5">{meeting.date}</div>
                  </div>
                </div>

                {/* Agenda snippet */}
                <div className="space-y-1 bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/70 text-xs text-slate-700">
                  <span className="font-black text-slate-900 block mb-1">جدول الأعمال:</span>
                  <ul className="list-disc list-inside space-y-0.5 pr-1 line-clamp-2 font-medium">
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
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 bg-indigo-50/70 border border-indigo-100 px-2.5 py-1 rounded-xl">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{meeting.decisions.length} قرارات وتوصيات</span>
                  </span>

                  <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{meeting.members.length} أعضاء</span>
                  </span>

                  {meeting.kpis.length > 0 && (
                    <span className="text-[11px] text-slate-700 bg-amber-50/80 border border-amber-200/80 px-2.5 py-1 rounded-xl font-bold">
                      {meeting.kpis[0].name}: {meeting.kpis[0].value}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditMeeting(meeting);
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
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
                    className="p-2 rounded-xl text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
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
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200/80 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                    title="تنزيل ملف Word منسق جاهز للطباعة"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>{downloadingId === meeting.id ? "تنزيل..." : "تنزيل Word (.docx)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewMeeting(meeting)}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-black text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 cursor-pointer"
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
