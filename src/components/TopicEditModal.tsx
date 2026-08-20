import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Save,
  BookOpen,
  ListChecks,
  CheckCircle2,
  FileText,
  Building2,
  Tag,
  Calendar,
  AlertCircle
} from "lucide-react";
import { MeetingTopic, TopicDecisionTemplate, TopicKpiTemplate } from "../types";
import { TOPIC_CATEGORIES } from "../data/defaultTopics";

interface TopicEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicToEdit?: MeetingTopic | null;
  initialTopic?: MeetingTopic | null; // alias
  onSaveTopic?: (topic: MeetingTopic) => void;
  onSave?: (topic: MeetingTopic) => void; // alias
  availableDepartments?: string[];
}

export const TopicEditModal: React.FC<TopicEditModalProps> = ({
  isOpen,
  onClose,
  topicToEdit,
  initialTopic,
  onSaveTopic,
  onSave,
  availableDepartments = [
    "التعقيم المركزي",
    "العمليات الجراحية",
    "العيادات التخصصية",
    "التمريض",
    "المعمل وبنك الدم",
    "الصيدلية",
    "الطوارئ والاستقبال",
    "المغسلة والمفروشات",
    "النفايات الطبية",
    "التغذية والمطبخ",
  ],
}) => {
  const activeTopic = topicToEdit || initialTopic || null;
  const isEditing = Boolean(activeTopic);
  const handleSave = onSaveTopic || onSave || (() => {});

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("التعقيم والتطهير");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [recommendedMonth, setRecommendedMonth] = useState<number | undefined>(undefined);
  const [targetDepartments, setTargetDepartments] = useState<string[]>([]);
  const [newDeptInput, setNewDeptInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [agenda, setAgenda] = useState<string[]>([""]);
  const [kpis, setKpis] = useState<TopicKpiTemplate[]>([
    { name: "معدل الالتزام بالمعيار", value: "%85", target: "%95" },
  ]);
  const [sampleDecisions, setSampleDecisions] = useState<TopicDecisionTemplate[]>([
    {
      topic: "",
      decision: "",
      responsible: "مشرف التمريض / مسؤول مكافحة العدوى",
      duration: "أسبوع",
      monitoringMethod: "المرور الميداني الدوري",
    },
  ]);
  const [errorMsg, setErrorMsg] = useState("");

  // Initialize form when activeTopic changes or modal opens
  useEffect(() => {
    if (activeTopic) {
      setTitle(activeTopic.title || "");
      if (TOPIC_CATEGORIES.includes(activeTopic.category as any)) {
        setCategory(activeTopic.category);
        setCustomCategory("");
      } else {
        setCategory("أخرى");
        setCustomCategory(activeTopic.category || "");
      }
      setDescription(activeTopic.description || "");
      setRecommendedMonth(activeTopic.recommendedMonth);
      setTargetDepartments(activeTopic.targetDepartments || []);
      setTags(activeTopic.tags || []);
      setAgenda(activeTopic.agenda?.length ? [...activeTopic.agenda] : [""]);
      setKpis(
        activeTopic.kpis?.length
          ? activeTopic.kpis.map((k) => ({ ...k }))
          : [{ name: "معدل الالتزام", value: "%85", target: "%95" }]
      );
      setSampleDecisions(
        activeTopic.sampleDecisions?.length
          ? activeTopic.sampleDecisions.map((d) => ({ ...d }))
          : [
              {
                topic: "",
                decision: "",
                responsible: "مشرف التمريض",
                duration: "أسبوع",
                monitoringMethod: "المرور الميداني",
              },
            ]
      );
    } else {
      // Reset for new topic
      setTitle("");
      setCategory("التعقيم والتطهير");
      setCustomCategory("");
      setDescription("");
      setRecommendedMonth(undefined);
      setTargetDepartments(["التمريض", "العمليات"]);
      setTags([]);
      setAgenda([
        "مراجعة السياسات والإجراءات القياسية المعتمدة",
        "تقييم نتائج المرور الميداني والامتثال للضوابط",
        "تدريب الكادر وتوفير المستلزمات الضرورية",
      ]);
      setKpis([
        { name: "معدل الالتزام بالمعيار", value: "%85", target: "%95" },
        { name: "نسبة توفر المستلزمات والأدوات", value: "%90", target: "%100" },
      ]);
      setSampleDecisions([
        {
          topic: "ملاحظة عدم اكتمال الاشتراطات",
          decision: "تطبيق خطة العمل التصحيحية الفورية وإعادة التقييم خلال أسبوع",
          responsible: "مشرف التمريض / مسؤول مكافحة العدوى",
          duration: "أسبوع",
          monitoringMethod: "المرور الميداني الأسبوعي",
        },
      ]);
    }
    setErrorMsg("");
  }, [activeTopic, isOpen]);

  if (!isOpen) return null;

  // Agenda Handlers
  const handleAddAgenda = () => {
    setAgenda([...agenda, ""]);
  };

  const handleUpdateAgenda = (index: number, text: string) => {
    const updated = [...agenda];
    updated[index] = text;
    setAgenda(updated);
  };

  const handleRemoveAgenda = (index: number) => {
    if (agenda.length <= 1) {
      setAgenda([""]);
      return;
    }
    setAgenda(agenda.filter((_, i) => i !== index));
  };

  // KPI Handlers
  const handleAddKpi = () => {
    setKpis([...kpis, { name: "", value: "%80", target: "%95" }]);
  };

  const handleUpdateKpi = (index: number, field: keyof TopicKpiTemplate, val: string) => {
    const updated = [...kpis];
    updated[index] = { ...updated[index], [field]: val };
    setKpis(updated);
  };

  const handleRemoveKpi = (index: number) => {
    setKpis(kpis.filter((_, i) => i !== index));
  };

  // Decision Handlers
  const handleAddDecision = () => {
    setSampleDecisions([
      ...sampleDecisions,
      {
        topic: "",
        decision: "",
        responsible: "مشرف التمريض",
        duration: "أسبوع",
        monitoringMethod: "المرور الميداني",
      },
    ]);
  };

  const handleUpdateDecision = (
    index: number,
    field: keyof TopicDecisionTemplate,
    val: string
  ) => {
    const updated = [...sampleDecisions];
    updated[index] = { ...updated[index], [field]: val };
    setSampleDecisions(updated);
  };

  const handleRemoveDecision = (index: number) => {
    setSampleDecisions(sampleDecisions.filter((_, i) => i !== index));
  };

  // Department Tags
  const handleToggleDept = (dept: string) => {
    if (targetDepartments.includes(dept)) {
      setTargetDepartments(targetDepartments.filter((d) => d !== dept));
    } else {
      setTargetDepartments([...targetDepartments, dept]);
    }
  };

  const handleAddCustomDept = () => {
    const trimmed = newDeptInput.trim();
    if (trimmed && !targetDepartments.includes(trimmed)) {
      setTargetDepartments([...targetDepartments, trimmed]);
      setNewDeptInput("");
    }
  };

  // Tags
  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Save handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("يرجى إدخال عنوان الموضوع");
      return;
    }

    const finalCategory = category === "أخرى" ? customCategory.trim() || "موضوعات عامة" : category;
    const cleanAgenda = agenda.map((a) => a.trim()).filter(Boolean);
    const cleanDecisions = sampleDecisions.filter((d) => d.topic.trim() || d.decision.trim());

    const savedTopic: MeetingTopic = {
      id: activeTopic ? activeTopic.id : `topic-${Date.now()}`,
      title: title.trim(),
      category: finalCategory,
      description: description.trim(),
      recommendedMonth: recommendedMonth ? Number(recommendedMonth) : undefined,
      targetDepartments: targetDepartments.length ? targetDepartments : ["جميع الأقسام"],
      tags: tags,
      agenda: cleanAgenda.length ? cleanAgenda : ["مناقشة ومراجعة الإجراءات التنفيذية للموضوع"],
      kpis: kpis.filter((k) => k.name.trim()),
      sampleDecisions: cleanDecisions.length
        ? cleanDecisions
        : [
            {
              topic: title.trim(),
              decision: "تطبيق التوصيات والإجراءات التصحيحية المعتمدة",
              responsible: "مشرف التمريض",
              duration: "أسبوع",
              monitoringMethod: "المرور الميداني",
            },
          ],
      isCustom: activeTopic?.isCustom !== undefined ? activeTopic.isCustom : true,
      createdAt: activeTopic?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    handleSave(savedTopic);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {isEditing ? "تعديل موضوع من مكتبة الاجتماعات" : "إضافة موضوع جديد إلى مكتبة الاجتماعات"}
              </h3>
              <p className="text-xs text-slate-500">
                تحديد محاور الأجندة، مؤشرات الأداء، والقرارات والتوصيات النموذجية المقترحة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 text-right">
          
          {errorMsg && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Basic Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>البيانات الأساسية للموضوع</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  عنوان الموضوع الرئيسي <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: التعقيم والتطهير وإدارة وحدة التعقيم المركزي (CSSD)"
                  className="w-full text-xs sm:text-sm rounded-md border border-slate-300 p-2.5 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  التصنيف / المجال
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-md border border-slate-300 p-2.5 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {TOPIC_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="أخرى">تصنيف مخصص آخر...</option>
                </select>

                {category === "أخرى" && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="اكتب اسم التصنيف الجديد..."
                    className="w-full mt-2 text-xs rounded-md border border-slate-300 p-2 font-medium"
                    required
                  />
                )}
              </div>

              {/* Recommended Month (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>الشهر المقترح بالخطة السنوية (اختياري)</span>
                  <span className="text-[11px] text-slate-400 font-normal">1 - 12</span>
                </label>
                <select
                  value={recommendedMonth || ""}
                  onChange={(e) =>
                    setRecommendedMonth(e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full text-xs sm:text-sm rounded-md border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="">-- بدون تحديد شهر معين (موضوع عام متاح دائماً) --</option>
                  <option value="1">شهر يناير (1)</option>
                  <option value="2">شهر فبراير (2)</option>
                  <option value="3">شهر مارس (3)</option>
                  <option value="4">شهر أبريل (4)</option>
                  <option value="5">شهر مايو (5)</option>
                  <option value="6">شهر يونيو (6)</option>
                  <option value="7">شهر يوليو (7)</option>
                  <option value="8">شهر أغسطس (8)</option>
                  <option value="9">شهر سبتمبر (9)</option>
                  <option value="10">شهر أكتوبر (10)</option>
                  <option value="11">شهر نوفمبر (11)</option>
                  <option value="12">شهر ديسمبر (12)</option>
                </select>
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نبذة ومحور التركيز للموضوع (الهدف العام)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب شرحاً موجزاً لأهمية هذا الموضوع ونطاق التركيز في الاجتماع..."
                  className="w-full text-xs sm:text-sm rounded-md border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* 2. Target Departments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>الأقسام والوحدات المستهدفة</span>
            </h4>

            <div className="flex flex-wrap gap-1.5">
              {Array.from(new Set([...availableDepartments, ...targetDepartments])).map((dept) => {
                const isSelected = targetDepartments.includes(dept);
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleToggleDept(dept)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors border ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isSelected ? `✓ ${dept}` : dept}
                  </button>
                );
              })}
            </div>

            {/* Custom Department Add */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={newDeptInput}
                onChange={(e) => setNewDeptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomDept();
                  }
                }}
                placeholder="أضف قسماً آخر (مثال: رعاية الحروق)..."
                className="text-xs rounded-md border border-slate-300 p-2 grow max-w-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomDept}
                className="px-3 py-2 rounded-md text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 shadow-2xs"
              >
                + إضافة قسم
              </button>
            </div>
          </div>

          {/* 3. Suggested Agenda Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-blue-600" />
                <span>بنود جدول الأعمال المقترحة ({agenda.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddAgenda}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة بند</span>
              </button>
            </div>

            <div className="space-y-2">
              {agenda.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleUpdateAgenda(idx, e.target.value)}
                    placeholder={`بند جدول الأعمال رقم ${idx + 1}...`}
                    className="grow text-xs rounded-md border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAgenda(idx)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="حذف البند"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Suggested KPIs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>مؤشرات الأداء المقترحة ({kpis.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddKpi}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مؤشر</span>
              </button>
            </div>

            <div className="space-y-2">
              {kpis.map((kpi, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-md bg-slate-50 border border-slate-200 items-center"
                >
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      value={kpi.name}
                      onChange={(e) => handleUpdateKpi(idx, "name", e.target.value)}
                      placeholder="اسم المؤشر (مثال: معدل الالتزام بغسل الأيدي)..."
                      className="w-full text-xs rounded-md border border-slate-300 p-1.5 bg-white font-medium"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={kpi.value}
                      onChange={(e) => handleUpdateKpi(idx, "value", e.target.value)}
                      placeholder="القيمة المقاسة (مثال: %82)"
                      className="w-full text-xs rounded-md border border-slate-300 p-1.5 bg-white text-center font-bold text-blue-700"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={kpi.target || ""}
                      onChange={(e) => handleUpdateKpi(idx, "target", e.target.value)}
                      placeholder="المستهدف (مثال: %95)"
                      className="w-full text-xs rounded-md border border-slate-300 p-1.5 bg-white text-center text-slate-500"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveKpi(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="حذف المؤشر"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Standard Decisions & Corrective Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>القرارات والتوصيات النموذجية المقترحة ({sampleDecisions.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddDecision}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة توصية/قرار</span>
              </button>
            </div>

            <div className="space-y-3">
              {sampleDecisions.map((dec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2.5 text-right"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      البند / الملاحظة النموذجية #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDecision(idx)}
                      className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      الموضوع / الملاحظة
                    </label>
                    <input
                      type="text"
                      value={dec.topic}
                      onChange={(e) => handleUpdateDecision(idx, "topic", e.target.value)}
                      placeholder="مثال: عدم توفير المناديل والمطهرات على بعض الأحواض..."
                      className="w-full text-xs rounded-md border border-slate-300 p-2 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      القرار / الإجراء التصحيحي الموصى به
                    </label>
                    <textarea
                      rows={2}
                      value={dec.decision}
                      onChange={(e) => handleUpdateDecision(idx, "decision", e.target.value)}
                      placeholder="مثال: توفير المناديل والماسكات وتوزيعها على جميع الأقسام فوراً وبكميات كافية..."
                      className="w-full text-xs rounded-md border border-slate-300 p-2 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        المسؤول عن التنفيذ
                      </label>
                      <input
                        type="text"
                        value={dec.responsible}
                        onChange={(e) => handleUpdateDecision(idx, "responsible", e.target.value)}
                        placeholder="مشرف التمريض..."
                        className="w-full text-xs rounded-md border border-slate-300 p-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        المدة الزمنية
                      </label>
                      <input
                        type="text"
                        value={dec.duration}
                        onChange={(e) => handleUpdateDecision(idx, "duration", e.target.value)}
                        placeholder="أسبوع / يومان..."
                        className="w-full text-xs rounded-md border border-slate-300 p-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        طريقة المتابعة
                      </label>
                      <input
                        type="text"
                        value={dec.monitoringMethod}
                        onChange={(e) =>
                          handleUpdateDecision(idx, "monitoringMethod", e.target.value)
                        }
                        placeholder="المرور الميداني..."
                        className="w-full text-xs rounded-md border border-slate-300 p-1.5 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Tags & Keywords */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              الكلمات المفتاحية والوسوم (للبحث السريع)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs bg-slate-100 text-slate-700 border border-slate-200"
                >
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-slate-400 hover:text-rose-600 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="أضف وسماً (مثال: أوتوكلاف، وخز، تعقيم)..."
                className="text-xs rounded-md border border-slate-300 p-2 grow max-w-xs"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              >
                + إضافة وسم
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-white sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? "حفظ التعديلات" : "إضافة الموضوع للمكتبة"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
