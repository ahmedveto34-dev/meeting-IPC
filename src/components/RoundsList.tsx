import React, { useState, useMemo } from "react";
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
  Building,
  Filter,
  Sparkles,
  RotateCcw,
  ChevronDown,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { RoundReport, STANDARD_ROUND_DEPARTMENTS } from "../types";
import { exportRoundToDocx } from "../utils/docxExport";
import { DEFAULT_WEEKLY_BALANCED_ROUNDS } from "../data/defaultRounds";
import { ROUND_TOPIC_PRESETS } from "../data/roundTopicPresets";
import { DefaultRoundTopicPickerModal } from "./DefaultRoundTopicPickerModal";

interface RoundsListProps {
  rounds: RoundReport[];
  onViewRound: (round: RoundReport) => void;
  onEditRound: (round: RoundReport) => void;
  onNewRound: () => void;
  onDeleteRound: (id: string) => void;
  onConvertToMeeting?: (round: RoundReport) => void;
  onGenerateDefaultRound?: (weekNumber: number) => void;
  onRestoreDefaultRounds?: () => void;
  onSaveDirectRound?: (round: RoundReport) => void;
  centerName?: string;
  inspectorName?: string;
}

export const RoundsList: React.FC<RoundsListProps> = ({
  rounds,
  onViewRound,
  onEditRound,
  onNewRound,
  onDeleteRound,
  onConvertToMeeting,
  onGenerateDefaultRound,
  onRestoreDefaultRounds,
  onSaveDirectRound,
  centerName = "Waheed IPC",
  inspectorName = "م/ أحمد وحيد شعبان",
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("الكل");
  const [isDefaultMenuOpen, setIsDefaultMenuOpen] = useState<boolean>(false);
  const [isTopicPickerModalOpen, setIsTopicPickerModalOpen] = useState<boolean>(false);

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

  const filteredRounds = useMemo(() => {
    if (selectedDeptFilter === "الكل") return rounds;
    return rounds.filter((r) => {
      if (r.department === selectedDeptFilter) return true;
      return r.observations.some(
        (o) => o.location && o.location.includes(selectedDeptFilter)
      );
    });
  }, [rounds, selectedDeptFilter]);

  const handleSelectTopicRound = (round: RoundReport) => {
    if (onSaveDirectRound) {
      onSaveDirectRound(round);
    } else if (onGenerateDefaultRound) {
      onGenerateDefaultRound(1);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Default Round Topics Modal */}
      <DefaultRoundTopicPickerModal
        isOpen={isTopicPickerModalOpen}
        onClose={() => setIsTopicPickerModalOpen(false)}
        onSelectTopicPreset={handleSelectTopicRound}
        mode="create_round"
        centerName={centerName}
        inspectorName={inspectorName}
      />
      
      {/* Top Banner */}
      <div className="relative rounded-3xl p-6 sm:p-7 text-white shadow-xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ClipboardCheck className="w-5 h-5 stroke-[2.3]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              سجل تقارير المرور الميداني الأسبوعي واليومي
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            توثيق الملاحظات المرورية (4-5 ملاحظات متوازنة بالأقسام والموضوعات)، الإجراءات التصحيحية، وتصدير Word
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          {/* Button to Open All 7 Topics Modal */}
          <button
            type="button"
            onClick={() => setIsTopicPickerModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-black text-amber-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>⚡ إنشاء تقرير افتراضي (7 موضوعات تخصصية)</span>
          </button>

          <button
            onClick={onNewRound}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-98 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>تسجيل جولة مرور جديدة</span>
          </button>
        </div>
      </div>

      {/* Quick Department Filter Bar */}
      {rounds.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 ml-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>تصفية حسب القسم:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {["الكل", ...STANDARD_ROUND_DEPARTMENTS].map((dept) => {
                const isSelected = selectedDeptFilter === dept;
                const count =
                  dept === "الكل"
                    ? rounds.length
                    : rounds.filter(
                        (r) =>
                          r.department === dept ||
                          r.observations.some((o) => o.location && o.location.includes(dept))
                      ).length;

                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDeptFilter(dept)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-600/20 scale-105"
                        : "bg-slate-100/90 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    <span>{dept}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isSelected ? "bg-white/25 text-white" : "bg-white text-slate-600 border border-slate-200/80"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Rounds Cards Grid */}
      {filteredRounds.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200 shadow-inner">
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              {rounds.length === 0 ? "لا توجد تقارير مرور مسجلة" : "لا توجد تقارير مطابقة لهذا القسم"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
              {rounds.length === 0
                ? "ابدأ برصد ملاحظات مكافحة العدوى الميدانية وتوثيق توصيات الأقسام"
                : "يمكنك اختيار تصنيف آخر أو تسجيل جولة مرور جديدة لهذا القسم"}
            </p>
          </div>
          {rounds.length === 0 ? (
            <button
              onClick={onNewRound}
              className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 cursor-pointer"
            >
              + تسجيل مرور جديد الآن
            </button>
          ) : (
            <button
              onClick={() => setSelectedDeptFilter("الكل")}
              className="px-4 py-2 rounded-xl text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 cursor-pointer"
            >
              عرض جميع التقارير
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRounds.map((round) => (
            <div
              key={round.id}
              onClick={() => onViewRound(round)}
              className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-500 p-5 sm:p-6 shadow-md hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer space-y-4 group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-3.5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                        فترة: {round.period || "صباحي"}
                      </span>
                      {round.department && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          القسم: {round.department}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {round.title || "تقرير المرور الاسبوعي"}
                    </h3>
                  </div>

                  <div className="text-left text-xs text-slate-500 font-bold shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <div className="text-slate-400 font-medium">{round.day}</div>
                    <div className="font-black text-slate-800 mt-0.5">{round.date}</div>
                  </div>
                </div>

                {/* Inspector */}
                <div className="text-xs text-slate-600 flex items-center justify-between bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                  <span>القائم بالمرور: <strong className="text-slate-900 font-black">{round.inspector}</strong></span>
                  <span className="text-blue-700 font-black bg-blue-100/90 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
                    {round.observations.length} ملاحظات
                  </span>
                </div>

                {/* Sample Observations */}
                <div className="space-y-1.5 text-xs text-slate-700">
                  {round.observations.slice(0, 2).map((obs, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/60 leading-relaxed font-medium">
                      {obs.location && (
                        <span className="font-black text-blue-800 ml-1">[{obs.location}]</span>
                      )}
                      <span className="text-slate-800">{obs.observation}</span>
                    </div>
                  ))}
                  {round.observations.length > 2 && (
                    <p className="text-[11px] text-slate-400 font-bold pr-1">
                      + {round.observations.length - 2} ملاحظات وتوصيات أخرى...
                    </p>
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
                      onEditRound(round);
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
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
                      className="p-2 rounded-xl text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
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
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-blue-700 bg-blue-50 border border-blue-200/80 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                    title="تنزيل ملف Word منسق جاهز للطباعة"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>{downloadingId === round.id ? "تنزيل..." : "تنزيل Word (.docx)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewRound(round)}
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
