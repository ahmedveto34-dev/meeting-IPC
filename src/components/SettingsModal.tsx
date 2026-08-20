import React, { useState } from "react";
import { X, Building2, Users, Save, RotateCcw, Plus, Trash2, Upload, Download, Sparkles } from "lucide-react";
import { CenterSettings, Member } from "../types";
import { DEFAULT_CENTER_SETTINGS } from "../data/seedData";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CenterSettings;
  onSaveSettings: (newSettings: CenterSettings) => void;
  onOpenTemplatesManager?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenTemplatesManager,
}) => {
  const [formData, setFormData] = useState<CenterSettings>(settings);
  const [newDept, setNewDept] = useState<string>("");

  if (!isOpen) return null;

  const handleMemberChange = (id: string, field: keyof Member, value: any) => {
    setFormData({
      ...formData,
      defaultMembers: formData.defaultMembers.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    });
  };

  const handleAddMember = () => {
    const newM: Member = {
      id: `m-${Date.now()}`,
      name: "",
      role: "",
      attended: true,
      signatureNote: "تم التوقيع",
    };
    setFormData({
      ...formData,
      defaultMembers: [...formData.defaultMembers, newM],
    });
  };

  const handleRemoveMember = (id: string) => {
    setFormData({
      ...formData,
      defaultMembers: formData.defaultMembers.filter((m) => m.id !== id),
    });
  };

  const handleAddDept = () => {
    if (!newDept.trim()) return;
    setFormData({
      ...formData,
      departments: [...formData.departments, newDept.trim()],
    });
    setNewDept("");
  };

  const handleRemoveDept = (idx: number) => {
    setFormData({
      ...formData,
      departments: formData.departments.filter((_, i) => i !== idx),
    });
  };

  const handleResetToDefaults = () => {
    if (window.confirm("هل تريد استعادة البيانات الافتراضية للمركز واللجنة؟")) {
      setFormData(DEFAULT_CENTER_SETTINGS);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                إعدادات المركز الطبي ولجنة مكافحة العدوى
              </h3>
              <p className="text-xs text-slate-500">
                تخصيص اسم المنشأة، القيادات، الأعضاء الافتراضيين، والأقسام
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto grow p-5 sm:p-6 space-y-6">
          
          {/* Quick Hub for Centers & Templates */}
          {onOpenTemplatesManager && (
            <div className="bg-blue-50/80 rounded-xl p-4 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    إدارة وتصدير قوالب المنظومة لمراكز ومستشفيات أخرى
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    رفع ملفات JSON لقوالب جديدة، التبديل بين قوالب المراكز الجاهزة، أو تصدير قالب فارغ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTemplatesManager();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>فتح مدير القوالب والمراكز</span>
              </button>
            </div>
          )}

          {/* Center Info */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              بيانات المنشأة الطبية
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المركز الطبي / المستشفى
                </label>
                <input
                  type="text"
                  value={formData.centerName}
                  onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                  className="w-full text-xs sm:text-sm rounded-md border border-slate-300 p-2.5 font-bold"
                  placeholder="مركز د احمد مصطفى للعيون"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مسمى اللجنة / الإدارة
                </label>
                <input
                  type="text"
                  value={formData.departmentTitle}
                  onChange={(e) => setFormData({ ...formData, departmentTitle: e.target.value })}
                  className="w-full text-xs sm:text-sm rounded-md border border-slate-300 p-2.5"
                  placeholder="لجنة مكافحة العدوى"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المدير الطبي
                </label>
                <input
                  type="text"
                  value={formData.medicalDirector}
                  onChange={(e) => setFormData({ ...formData, medicalDirector: e.target.value })}
                  className="w-full text-xs rounded-md border border-slate-300 p-2"
                  placeholder="ا.د / احمد مصطفى"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مسؤول / مشرف مكافحة العدوى
                </label>
                <input
                  type="text"
                  value={formData.infectionControlLead}
                  onChange={(e) =>
                    setFormData({ ...formData, infectionControlLead: e.target.value })
                  }
                  className="w-full text-xs rounded-md border border-slate-300 p-2"
                  placeholder="م/ أحمد وحيد شعبان"
                />
              </div>
            </div>
          </div>

          {/* Default Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-sm">
                الأعضاء الافتراضيون للجنة (يظهرون تلقائياً في كل اجتماع جديد)
              </h4>
              <button
                type="button"
                onClick={handleAddMember}
                className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة عضو</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.defaultMembers.map((m) => (
                <div
                  key={m.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => handleMemberChange(m.id, "name", e.target.value)}
                      placeholder="اسم العضو"
                      className="w-full text-xs bg-white border border-slate-300 rounded p-1.5 font-bold"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={m.role}
                      onChange={(e) => handleMemberChange(m.id, "role", e.target.value)}
                      placeholder="الوظيفة (المدير الطبي / مشرف التمريض)"
                      className="w-full text-xs bg-white border border-slate-300 rounded p-1.5"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Departments */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              أقسام ومواقع المرور الميداني
            </h4>

            <div className="flex flex-wrap gap-2">
              {formData.departments.map((dept, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                >
                  <span>{dept}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDept(idx)}
                    className="text-slate-400 hover:text-rose-600 mr-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddDept();
                  }
                }}
                placeholder="أضف قسماً جديداً (مثال: المعمل / الأشعة / رعاية الأطفال)..."
                className="grow text-xs rounded-md border border-slate-300 p-2"
              />
              <button
                type="button"
                onClick={handleAddDept}
                className="px-3 py-2 rounded-md text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 shadow-2xs"
              >
                + إضافة
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة الإعدادات الافتراضية</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التغييرات</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
