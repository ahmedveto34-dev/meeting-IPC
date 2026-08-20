import React, { useState } from "react";
import {
  ClipboardCheck,
  PlusCircle,
  FileDown,
  Edit,
  Trash2,
  Eye,
  Send,
  Calendar,
  Layers,
} from "lucide-react";
import { RoundReport } from "../types";
import { exportRoundToDocx } from "../utils/docxExport";

interface RoundsListProps {
  rounds: RoundReport[];
  onViewRound: (round: RoundReport) => void;
  onEditRound: (round: RoundReport) => void;
  onNewRound: () => void;
  onDeleteRound: (id: string) => void;
  onConvertToMeeting?: (round: RoundReport) => void;
}

export const RoundsList: React.FC<RoundsListProps> = ({
  rounds,
  onViewRound,
  onEditRound,
  onNewRound,
  onDeleteRound,
  onConvertToMeeting,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadDocx = async (e: React.MouseEvent, round: RoundReport) => {
    e.stopPropagation();
    try {
      setDownloadingId(round.id);
      await exportRoundToDocx(round);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تنزيل تقرير المرور بصيغة Word");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              سجل تقارير المرور الميداني الأسبوعي واليومي
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            توثيق الملاحظات المرورية، الإجراءات التصحيحية، المسؤولين عن التنفيذ، والتصدير لـ Word
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewRound}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل جولة مرور جديدة</span>
          </button>
        </div>
      </div>

      {/* Rounds Cards Grid */}
      {rounds.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 space-y-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
            <ClipboardCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">لا توجد تقارير مرور مسجلة</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              ابدأ برصد ملاحظات مكافحة العدوى الميدانية وتوثيق توصيات الأقسام
            </p>
          </div>
          <button
            onClick={onNewRound}
            className="px-4 py-2 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs"
          >
            + تسجيل مرور جديد الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rounds.map((round) => (
            <div
              key={round.id}
              onClick={() => onViewRound(round)}
              className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer space-y-4 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-1.5">
                      فترة: {round.period || "صباحي"}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {round.title || "تقرير المرور الاسبوعي"}
                    </h3>
                  </div>

                  <div className="text-left text-xs text-slate-500 font-medium">
                    <div>{round.day}</div>
                    <div className="font-bold text-slate-800">{round.date}</div>
                  </div>
                </div>

                {/* Inspector */}
                <div className="text-xs text-slate-600 flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span>القائم بالمرور: <strong className="text-slate-900">{round.inspector}</strong></span>
                  <span className="text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    {round.observations.length} ملاحظات
                  </span>
                </div>

                {/* Sample Observations */}
                <div className="space-y-1 text-xs text-slate-700">
                  {round.observations.slice(0, 2).map((obs, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="font-bold text-blue-800 ml-1">[{obs.location}]</span>
                      <span className="text-slate-800">{obs.observation}</span>
                    </div>
                  ))}
                  {round.observations.length > 2 && (
                    <p className="text-[11px] text-slate-400 font-medium pr-1">
                      + {round.observations.length - 2} ملاحظات وتوصيات أخرى...
                    </p>
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
                      onEditRound(round);
                    }}
                    className="p-1.5 rounded-md text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    title="تعديل التقرير"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {onConvertToMeeting && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConvertToMeeting(round);
                      }}
                      className="p-1.5 rounded-md text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                      title="تحويل الملاحظات لمحضر اجتماع لجنة مكافحة العدوى"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("هل أنت متأكد من حذف تقرير المرور هذا؟")) {
                        onDeleteRound(round.id);
                      }
                    }}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="حذف التقرير"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleDownloadDocx(e, round)}
                    disabled={downloadingId === round.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                    title="تنزيل ملف Word منسق جاهز للطباعة"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>{downloadingId === round.id ? "تنزيل..." : "تنزيل Word (.docx)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewRound(round)}
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
