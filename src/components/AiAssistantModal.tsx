import React, { useState } from "react";
import { X, Sparkles, Send, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { CenterSettings, MeetingDecision } from "../types";

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  centerSettings: CenterSettings;
  onApplyMeetingPlan?: (data: {
    agenda: string[];
    kpis: { name: string; value: string; target?: string }[];
    decisions: MeetingDecision[];
    previousFollowUp?: string;
  }) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  centerSettings,
  onApplyMeetingPlan,
}) => {
  const [centerType, setCenterType] = useState<string>("مركز جراحة عيون");
  const [monthName, setMonthName] = useState<string>("شهر يوليو");
  const [focusArea, setFocusArea] = useState<string>(
    "التعقيم ومكافحة العدوى بالعمليات والفيالات متعددة الجرعات"
  );
  const [previousNotes, setPreviousNotes] = useState<string>(
    "عدم تفعيل نقطة الفرز وتأخر تطهير الأجهزة بين العمليات"
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setResult(null);

      const res = await fetch("/api/ai/generate-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centerType,
          monthName,
          focusArea,
          previousNotes,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to call AI server");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      alert("تعذر توليد المحتوى بالذكاء الاصطناعي حالياً. يرجى التأكد من الاتصال.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result || !onApplyMeetingPlan) return;

    const formattedDecisions: MeetingDecision[] = (result.decisions || []).map(
      (d: any, idx: number) => ({
        id: `dec-ai-${Date.now()}-${idx}`,
        topic: d.topic || "ملاحظة مكافحة عدوى",
        decision: d.decision || "",
        responsible: d.responsible || "مشرف التمريض",
        duration: d.duration || "3 أيام",
        monitoringMethod: d.monitoringMethod || "المرور الميداني",
        status: "in_progress",
      })
    );

    onApplyMeetingPlan({
      agenda: result.agenda || [],
      kpis: result.kpis || [],
      decisions: formattedDecisions,
      previousFollowUp: result.previousFollowUp || "",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                مستشار مكافحة العدوى الذكي (Gemini AI)
              </h3>
              <p className="text-xs text-slate-500">
                توليد جدول أعمال وقرارات وإجراءات تصحيحية ذكية ومطابقة لمعايير الجودة ومكافحة العدوى
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto grow p-5 sm:p-6 space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                نوع ونشاط المنشأة الطبية
              </label>
              <input
                type="text"
                value={centerType}
                onChange={(e) => setCenterType(e.target.value)}
                placeholder="مركز جراحة عيون / مستشفى عام / مركز أسنان / غسيل كلوي..."
                className="w-full text-xs sm:text-sm rounded-md border border-slate-300 p-2.5 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الشهر أو المناسبة
              </label>
              <input
                type="text"
                value={monthName}
                onChange={(e) => setMonthName(e.target.value)}
                placeholder="شهر يوليو / الربع الثاني..."
                className="w-full text-xs sm:text-sm rounded-md border border-slate-300 p-2.5 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              الموضوع أو المشكلات المراد التركيز عليها هذا الشهر
            </label>
            <input
              type="text"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="مثال: الرقابة على غرف العمليات، تطهير الأجهزة، نظافة الأيدي، النفايات..."
              className="w-full text-xs sm:text-sm rounded-md border border-slate-300 p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ملاحظات أو قرارات غير مكتملة من الاجتماع السابق (للمتابعة)
            </label>
            <textarea
              rows={2}
              value={previousNotes}
              onChange={(e) => setPreviousNotes(e.target.value)}
              placeholder="مثال: متابعة توفير مستلزمات أحواض غسيل الأيدي ونقطة الفرز..."
              className="w-full text-xs sm:text-sm rounded-md border border-slate-300 p-2.5"
            />
          </div>

          <div className="pt-1">
            <button
              type="button"
              disabled={loading}
              onClick={handleGenerate}
              className="w-full py-2.5 rounded-md text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري إعداد وصياغة جدول الأعمال والتوصيات بالذكاء الاصطناعي...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>توليد مقترح محضر الاجتماع والقرارات فوراً</span>
                </>
              )}
            </button>
          </div>

          {/* Result Preview */}
          {result && (
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-4 text-right">
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>تم التوليد بنجاح! معاينة المقترح:</span>
                </span>

                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-1.5 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs"
                >
                  تطبيق وإدراج في المحضر الجاري
                </button>
              </div>

              {/* Agenda */}
              <div>
                <h5 className="text-xs font-bold text-slate-800 mb-1">جدول الأعمال المقترح:</h5>
                <ul className="text-xs text-slate-700 space-y-1 pr-4 list-disc list-inside">
                  {result.agenda?.map((a: string, i: number) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              {/* Decisions */}
              <div>
                <h5 className="text-xs font-bold text-slate-800 mb-1">
                  القرارات والتوصيات المقترحة ({result.decisions?.length}):
                </h5>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {result.decisions?.map((d: any, i: number) => (
                    <div key={i} className="p-2 bg-white rounded border border-blue-100 text-xs">
                      <p className="font-bold text-slate-900">{d.topic}</p>
                      <p className="text-slate-700">التوصية: {d.decision}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        المسؤول: {d.responsible} | المدة: {d.duration} | المتابعة: {d.monitoringMethod}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
