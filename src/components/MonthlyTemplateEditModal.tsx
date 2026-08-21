import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Plus,
  Trash2,
  ListPlus,
  Sparkles,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { MonthlyThemeTemplate } from "../types";
import { ensurePreviousUnfinishedItemFirst } from "../data/monthlyTemplates";

interface MonthlyTemplateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: MonthlyThemeTemplate | null;
  onSaveTemplate: (updatedTemplate: MonthlyThemeTemplate) => void;
}

export const MonthlyTemplateEditModal: React.FC<MonthlyTemplateEditModalProps> = ({
  isOpen,
  onClose,
  template,
  onSaveTemplate,
}) => {
  const [formData, setFormData] = useState<MonthlyThemeTemplate | null>(null);
  const [newAgendaItem, setNewAgendaItem] = useState("");

  useEffect(() => {
    if (template) {
      // Ensure clone and item #1
      const cloned = JSON.parse(JSON.stringify(template));
      cloned.agenda = ensurePreviousUnfinishedItemFirst(cloned.agenda || []);
      setFormData(cloned);
    }
  }, [template, isOpen]);

  if (!isOpen || !formData) return null;

  const handleAddAgendaItem = () => {
    if (!newAgendaItem.trim()) return;
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        agenda: [...prev.agenda, newAgendaItem.trim()],
      };
    });
    setNewAgendaItem("");
  };

  const handleRemoveAgendaItem = (index: number) => {
    if (index === 0) {
      alert("البند الأول (ما لم يتم إنجازه من الاجتماع السابق) إلزامي لا يمكن حذفه.");
      return;
    }
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        agenda: prev.agenda.filter((_, i) => i !== index),
      };
    });
  };

  const handleAddKpi = () => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        defaultKpis: [...prev.defaultKpis, { name: "", value: "%90", target: "%100" }],
      };
    });
  };

  const handleRemoveKpi = (index: number) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        defaultKpis: prev.defaultKpis.filter((_, i) => i !== index),
      };
    });
  };

  const handleKpiChange = (index: number, field: "name" | "value" | "target", val: string) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.defaultKpis];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, defaultKpis: updated };
    });
  };

  const handleAddDecision = () => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sampleDecisions: [
          ...prev.sampleDecisions,
          {
            topic: "",
            decision: "",
            responsible: "مشرف التمريض",
            duration: "أسبوع",
            monitoringMethod: "المرور الميداني",
          },
        ],
      };
    });
  };

  const handleRemoveDecision = (index: number) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sampleDecisions: prev.sampleDecisions.filter((_, i) => i !== index),
      };
    });
  };

  const handleDecisionChange = (
    index: number,
    field: "topic" | "decision" | "responsible" | "duration" | "monitoringMethod",
    val: string
  ) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.sampleDecisions];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, sampleDecisions: updated };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    const finalData = {
      ...formData,
      agenda: ensurePreviousUnfinishedItemFirst(formData.agenda),
    };
    onSaveTemplate(finalData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              {formData.monthIndex}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                تعديل وتخصيص قالب شهر {formData.monthIndex}
              </h2>
              <p className="text-xs text-slate-500">
                تخصيص عنوان المحور، بنود جدول الأعمال، ومؤشرات الأداء لهذا الشهر
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          
          {/* Main Info */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              البيانات التعريفية للقالب
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الشهر والعنوان التعريفي:
                </label>
                <input
                  type="text"
                  required
                  value={formData.monthName}
                  onChange={(e) => setFormData({ ...formData, monthName: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  التصنيف / المجال:
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                عنوان وموضوع الاجتماع الأساسي:
              </label>
              <input
                type="text"
                required
                value={formData.themeTitle}
                onChange={(e) => setFormData({ ...formData, themeTitle: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المحور والهدف الاستراتيجي للشهر:
              </label>
              <textarea
                rows={2}
                value={formData.focusSummary}
                onChange={(e) => setFormData({ ...formData, focusSummary: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Agenda Items */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <ListPlus className="w-4 h-4 text-blue-600" />
                بنود جدول أعمال الاجتماع ({formData.agenda.length})
              </h3>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                البند #1 إلزامي لمتابعة إنجاز الاجتماع السابق
              </span>
            </div>

            <div className="space-y-2">
              {formData.agenda.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2 rounded-lg border ${
                    idx === 0
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-white text-slate-600 border border-slate-200 flex items-center justify-center text-xs shrink-0 font-bold">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-xs">{item}</span>
                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAgendaItem(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Agenda Item */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="أضف بنداً جديداً لجدول الأعمال..."
                value={newAgendaItem}
                onChange={(e) => setNewAgendaItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAgendaItem();
                  }
                }}
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddAgendaItem}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة بند</span>
              </button>
            </div>
          </div>

          {/* KPIs Section */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                مؤشرات الأداء المقترحة (KPIs)
              </h3>
              <button
                type="button"
                onClick={handleAddKpi}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مؤشر</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.defaultKpis.map((kpi, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <input
                    type="text"
                    placeholder="اسم المؤشر"
                    value={kpi.name}
                    onChange={(e) => handleKpiChange(idx, "name", e.target.value)}
                    className="flex-2 p-1.5 bg-white border border-slate-200 rounded text-xs"
                  />
                  <input
                    type="text"
                    placeholder="القيمة الحالية"
                    value={kpi.value}
                    onChange={(e) => handleKpiChange(idx, "value", e.target.value)}
                    className="w-24 p-1.5 bg-white border border-slate-200 rounded text-xs text-center"
                  />
                  <input
                    type="text"
                    placeholder="المستهدف"
                    value={kpi.target || ""}
                    onChange={(e) => handleKpiChange(idx, "target", e.target.value)}
                    className="w-24 p-1.5 bg-white border border-slate-200 rounded text-xs text-center"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveKpi(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Decisions */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-blue-600" />
                نماذج القرارات والتوصيات الجاهزة
              </h3>
              <button
                type="button"
                onClick={handleAddDecision}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة نموذج قرار</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.sampleDecisions.map((dec, idx) => (
                <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="الموضوع / الملاحظة"
                      value={dec.topic}
                      onChange={(e) => handleDecisionChange(idx, "topic", e.target.value)}
                      className="flex-1 p-1.5 bg-white border border-slate-200 rounded text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDecision(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="القرار / الإجراء التصحيحي"
                    value={dec.decision}
                    onChange={(e) => handleDecisionChange(idx, "decision", e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="المسؤول"
                      value={dec.responsible}
                      onChange={(e) => handleDecisionChange(idx, "responsible", e.target.value)}
                      className="p-1.5 bg-white border border-slate-200 rounded text-[11px]"
                    />
                    <input
                      type="text"
                      placeholder="المدة"
                      value={dec.duration}
                      onChange={(e) => handleDecisionChange(idx, "duration", e.target.value)}
                      className="p-1.5 bg-white border border-slate-200 rounded text-[11px]"
                    />
                    <input
                      type="text"
                      placeholder="طريقة المتابعة"
                      value={dec.monitoringMethod}
                      onChange={(e) => handleDecisionChange(idx, "monitoringMethod", e.target.value)}
                      className="p-1.5 bg-white border border-slate-200 rounded text-[11px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer actions inside form */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ تغييرات القالب</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
