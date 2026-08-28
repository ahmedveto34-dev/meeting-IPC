import React, { useState, useEffect, useId } from "react";
import {
  WHOObservationSession,
  WHOColumnObservation,
  WHOOpportunity,
  WHOIndicationKey,
  WHOActionKey,
  WHO_FIVE_MOMENTS,
  WHO_PROF_CATEGORIES,
  WHO_STANDARD_DEPARTMENTS,
} from "../types";
import {
  X,
  CheckCircle2,
  Plus,
  Trash2,
  Clock,
  User,
  Building2,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Check,
  AlertCircle,
} from "lucide-react";

interface HandHygieneSessionFormModalProps {
  initialSession: WHOObservationSession | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: WHOObservationSession) => void;
  centerName?: string;
  defaultObserver?: string;
}

export const HandHygieneSessionFormModal: React.FC<HandHygieneSessionFormModalProps> = ({
  initialSession,
  isOpen,
  onClose,
  onSave,
  centerName = "Waheed IPC",
  defaultObserver = "م/ أحمد وحيد شعبان",
}) => {
  const facilityInputId = useId();
  const serviceInputId = useId();
  const wardInputId = useId();
  const deptInputId = useId();
  const periodInputId = useId();
  const dateInputId = useId();
  const startTimeInputId = useId();
  const endTimeInputId = useId();
  const observerInputId = useId();
  const sessionNumInputId = useId();

  // Create state initialized from prop or default empty session
  const [formData, setFormData] = useState<WHOObservationSession>(() => {
    if (initialSession) return JSON.parse(JSON.stringify(initialSession));
    const now = new Date();
    return {
      id: `who-sess-${Date.now()}`,
      sessionNumber: 1,
      facility: centerName,
      service: "الجراحة والعمليات",
      ward: "جناح العمليات والعيادات",
      department: "surgery",
      periodNumber: "1",
      date: now.toISOString().split("T")[0].replace(/-/g, "/"),
      startTime: "10:00",
      endTime: "10:20",
      sessionDuration: 20,
      observer: defaultObserver,
      pageNumber: "1",
      city: "Cairo",
      country: "Egypt",
      columns: [
        {
          id: `col-1-${Date.now()}`,
          columnNumber: 1,
          profCatCode: "1.1",
          profCatName: "Nurse",
          profMainCategory: "1",
          workersCount: 2,
          opportunities: Array.from({ length: 8 }, (_, idx) => ({
            id: `opp-1-${idx + 1}-${Date.now()}`,
            oppNumber: idx + 1,
            indications: [] as WHOIndicationKey[],
            action: "" as WHOActionKey,
            gloves: false,
          })),
        },
        {
          id: `col-2-${Date.now()}`,
          columnNumber: 2,
          profCatCode: "3.2",
          profCatName: "Surgeon",
          profMainCategory: "3",
          workersCount: 1,
          opportunities: Array.from({ length: 8 }, (_, idx) => ({
            id: `opp-2-${idx + 1}-${Date.now()}`,
            oppNumber: idx + 1,
            indications: [] as WHOIndicationKey[],
            action: "" as WHOActionKey,
            gloves: false,
          })),
        },
        {
          id: `col-3-${Date.now()}`,
          columnNumber: 3,
          profCatCode: "2.0",
          profCatName: "Auxiliary",
          profMainCategory: "2",
          workersCount: 1,
          opportunities: Array.from({ length: 8 }, (_, idx) => ({
            id: `opp-3-${idx + 1}-${Date.now()}`,
            oppNumber: idx + 1,
            indications: [] as WHOIndicationKey[],
            action: "" as WHOActionKey,
            gloves: false,
          })),
        },
        {
          id: `col-4-${Date.now()}`,
          columnNumber: 4,
          profCatCode: "4.2",
          profCatName: "Technician",
          profMainCategory: "4",
          workersCount: 1,
          opportunities: Array.from({ length: 8 }, (_, idx) => ({
            id: `opp-4-${idx + 1}-${Date.now()}`,
            oppNumber: idx + 1,
            indications: [] as WHOIndicationKey[],
            action: "" as WHOActionKey,
            gloves: false,
          })),
        },
      ],
      notes: "",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  });

  useEffect(() => {
    if (initialSession) {
      setFormData(JSON.parse(JSON.stringify(initialSession)));
    } else {
      const now = new Date();
      setFormData({
        id: `who-sess-${Date.now()}`,
        sessionNumber: 1,
        facility: centerName,
        service: "الجراحة والعمليات",
        ward: "جناح العمليات والعيادات",
        department: "surgery",
        periodNumber: "1",
        date: now.toISOString().split("T")[0].replace(/-/g, "/"),
        startTime: "10:00",
        endTime: "10:20",
        sessionDuration: 20,
        observer: defaultObserver,
        pageNumber: "1",
        city: "Cairo",
        country: "Egypt",
        columns: [
          {
            id: `col-1-${Date.now()}`,
            columnNumber: 1,
            profCatCode: "1.1",
            profCatName: "Nurse",
            profMainCategory: "1",
            workersCount: 2,
            opportunities: Array.from({ length: 8 }, (_, idx) => ({
              id: `opp-1-${idx + 1}-${Date.now()}`,
              oppNumber: idx + 1,
              indications: [] as WHOIndicationKey[],
              action: "" as WHOActionKey,
              gloves: false,
            })),
          },
          {
            id: `col-2-${Date.now()}`,
            columnNumber: 2,
            profCatCode: "3.2",
            profCatName: "Surgeon",
            profMainCategory: "3",
            workersCount: 1,
            opportunities: Array.from({ length: 8 }, (_, idx) => ({
              id: `opp-2-${idx + 1}-${Date.now()}`,
              oppNumber: idx + 1,
              indications: [] as WHOIndicationKey[],
              action: "" as WHOActionKey,
              gloves: false,
            })),
          },
          {
            id: `col-3-${Date.now()}`,
            columnNumber: 3,
            profCatCode: "2.0",
            profCatName: "Auxiliary",
            profMainCategory: "2",
            workersCount: 1,
            opportunities: Array.from({ length: 8 }, (_, idx) => ({
              id: `opp-3-${idx + 1}-${Date.now()}`,
              oppNumber: idx + 1,
              indications: [] as WHOIndicationKey[],
              action: "" as WHOActionKey,
              gloves: false,
            })),
          },
          {
            id: `col-4-${Date.now()}`,
            columnNumber: 4,
            profCatCode: "4.2",
            profCatName: "Technician",
            profMainCategory: "4",
            workersCount: 1,
            opportunities: Array.from({ length: 8 }, (_, idx) => ({
              id: `opp-4-${idx + 1}-${Date.now()}`,
              oppNumber: idx + 1,
              indications: [] as WHOIndicationKey[],
              action: "" as WHOActionKey,
              gloves: false,
            })),
          },
        ],
        notes: "",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    }
  }, [initialSession, isOpen, centerName, defaultObserver]);

  if (!isOpen) return null;

  // Real-time calculation of session stats
  let totalOpp = 0;
  let totalHW = 0;
  let totalHR = 0;
  let totalMissed = 0;

  formData.columns.forEach((col) => {
    col.opportunities.forEach((opp) => {
      const hasIndication = opp.indications.length > 0;
      const hasAction = opp.action === "HR" || opp.action === "HW" || opp.action === "missed";
      if (hasIndication || hasAction) {
        totalOpp += 1;
        if (opp.action === "HW") totalHW += 1;
        else if (opp.action === "HR") totalHR += 1;
        else if (opp.action === "missed") totalMissed += 1;
      }
    });
  });

  const totalActions = totalHW + totalHR;
  const liveCompliance = totalOpp > 0 ? Math.round((totalActions / totalOpp) * 1000) / 10 : 0;

  // Handlers
  const handleUpdateField = (field: keyof WHOObservationSession, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateColumnProfCat = (colIndex: number, profCatCode: string) => {
    const matched = WHO_PROF_CATEGORIES.find((p) => p.code === profCatCode);
    const mainCategory = matched ? matched.mainCategory : "1";
    const name = matched ? matched.subNameEn : "HCW";

    const updatedCols = [...formData.columns];
    updatedCols[colIndex] = {
      ...updatedCols[colIndex],
      profCatCode,
      profCatName: name,
      profMainCategory: mainCategory,
    };
    setFormData({ ...formData, columns: updatedCols });
  };

  const handleUpdateColumnWorkers = (colIndex: number, count: number) => {
    const updatedCols = [...formData.columns];
    updatedCols[colIndex] = {
      ...updatedCols[colIndex],
      workersCount: Math.max(1, count),
    };
    setFormData({ ...formData, columns: updatedCols });
  };

  const handleToggleIndication = (colIndex: number, oppIndex: number, indKey: WHOIndicationKey) => {
    const updatedCols = [...formData.columns];
    const opp = updatedCols[colIndex].opportunities[oppIndex];
    const current = opp.indications || [];
    const exists = current.includes(indKey);
    const newIndications = exists ? current.filter((k) => k !== indKey) : [...current, indKey];

    updatedCols[colIndex].opportunities[oppIndex] = {
      ...opp,
      indications: newIndications,
    };
    setFormData({ ...formData, columns: updatedCols });
  };

  const handleSetAction = (colIndex: number, oppIndex: number, action: WHOActionKey) => {
    const updatedCols = [...formData.columns];
    const opp = updatedCols[colIndex].opportunities[oppIndex];
    const newAction = opp.action === action ? "" : action;

    updatedCols[colIndex].opportunities[oppIndex] = {
      ...opp,
      action: newAction,
    };
    setFormData({ ...formData, columns: updatedCols });
  };

  const handleToggleGloves = (colIndex: number, oppIndex: number) => {
    const updatedCols = [...formData.columns];
    const opp = updatedCols[colIndex].opportunities[oppIndex];

    updatedCols[colIndex].opportunities[oppIndex] = {
      ...opp,
      gloves: !opp.gloves,
    };
    setFormData({ ...formData, columns: updatedCols });
  };

  const handleAddOpportunityRow = (colIndex: number) => {
    const updatedCols = [...formData.columns];
    const col = updatedCols[colIndex];
    const newOppNum = col.opportunities.length + 1;
    col.opportunities.push({
      id: `opp-${col.columnNumber}-${newOppNum}-${Date.now()}`,
      oppNumber: newOppNum,
      indications: [],
      action: "",
      gloves: false,
    });
    setFormData({ ...formData, columns: updatedCols });
  };

  const handleClearColumn = (colIndex: number) => {
    if (!window.confirm(`هل أنت متأكد من مسح بيانات العمود رقم (${colIndex + 1})؟`)) return;
    const updatedCols = [...formData.columns];
    updatedCols[colIndex].opportunities = Array.from({ length: 8 }, (_, idx) => ({
      id: `opp-${colIndex + 1}-${idx + 1}-${Date.now()}`,
      oppNumber: idx + 1,
      indications: [],
      action: "",
      gloves: false,
    }));
    setFormData({ ...formData, columns: updatedCols });
  };

  const handleSave = () => {
    onSave({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto font-['Cairo',sans-serif] print:hidden">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-7xl max-h-[96vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header with WHO Theme */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider bg-black/20 text-amber-100 px-2.5 py-0.5 rounded-full border border-white/20">
                  SAVE LIVES: Clean Your Hands • WHO
                </span>
                <span className="text-xs font-bold text-amber-100">
                  Observation Form (نموذج الملاحظة الميداني)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black mt-0.5">
                {initialSession ? `تعديل جلسة رصد رقم (${formData.sessionNumber})` : "تسجيل جلسة رصد غسيل أيدي جديدة (WHO)"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* Header Metadata Grid matching WHO Observation Form */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  بيانات المنشأة والجلسة (Header Data)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                مدة الجلسة المعيارية: 20 دقيقة (±10 دقائق)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 text-xs">
              {/* Facility */}
              <div className="space-y-1">
                <label htmlFor={facilityInputId} className="font-bold text-slate-700 block text-[11px]">
                  Facility (اسم المركز/المنشأة)
                </label>
                <input
                  id={facilityInputId}
                  type="text"
                  value={formData.facility}
                  onChange={(e) => handleUpdateField("facility", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-semibold bg-white"
                />
              </div>

              {/* Service */}
              <div className="space-y-1">
                <label htmlFor={serviceInputId} className="font-bold text-slate-700 block text-[11px]">
                  Service (الخدمة الطبية)
                </label>
                <input
                  id={serviceInputId}
                  type="text"
                  value={formData.service}
                  onChange={(e) => handleUpdateField("service", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-semibold bg-white"
                />
              </div>

              {/* Ward */}
              <div className="space-y-1">
                <label htmlFor={wardInputId} className="font-bold text-slate-700 block text-[11px]">
                  Ward (الجناح / الوحدة)
                </label>
                <input
                  id={wardInputId}
                  type="text"
                  value={formData.ward}
                  onChange={(e) => handleUpdateField("ward", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-semibold bg-white"
                />
              </div>

              {/* Department (Standard WHO) */}
              <div className="space-y-1">
                <label htmlFor={deptInputId} className="font-bold text-slate-700 block text-[11px]">
                  Department (تصنيف القسم المعياري)
                </label>
                <select
                  id={deptInputId}
                  value={formData.department}
                  onChange={(e) => handleUpdateField("department", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-semibold bg-white cursor-pointer"
                >
                  {WHO_STANDARD_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Number */}
              <div className="space-y-1">
                <label htmlFor={periodInputId} className="font-bold text-slate-700 block text-[11px]">
                  Period N° (الفترة: 1: قبل / 2: بعد)
                </label>
                <select
                  id={periodInputId}
                  value={formData.periodNumber}
                  onChange={(e) => handleUpdateField("periodNumber", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-semibold bg-white cursor-pointer"
                >
                  <option value="1">1 (Pre-intervention / قبل التدخل)</option>
                  <option value="2">2 (Post-intervention / بعد التدخل)</option>
                  <option value="3">3 (متابعة دورية مستمرة)</option>
                </select>
              </div>

              {/* Session Number */}
              <div className="space-y-1">
                <label htmlFor={sessionNumInputId} className="font-bold text-slate-700 block text-[11px]">
                  Session N° (رقم الجلسة)
                </label>
                <input
                  id={sessionNumInputId}
                  type="number"
                  min="1"
                  max="50"
                  value={formData.sessionNumber}
                  onChange={(e) => handleUpdateField("sessionNumber", Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-bold bg-white"
                />
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label htmlFor={dateInputId} className="font-bold text-slate-700 block text-[11px]">
                  Date (التاريخ)
                </label>
                <input
                  id={dateInputId}
                  type="text"
                  value={formData.date}
                  onChange={(e) => handleUpdateField("date", e.target.value)}
                  placeholder="YYYY/MM/DD"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-semibold bg-white"
                />
              </div>

              {/* Start Time */}
              <div className="space-y-1">
                <label htmlFor={startTimeInputId} className="font-bold text-slate-700 block text-[11px]">
                  Start Time (وقت البدء)
                </label>
                <input
                  id={startTimeInputId}
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleUpdateField("startTime", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-semibold bg-white"
                />
              </div>

              {/* End Time */}
              <div className="space-y-1">
                <label htmlFor={endTimeInputId} className="font-bold text-slate-700 block text-[11px]">
                  End Time (وقت الانتهاء)
                </label>
                <input
                  id={endTimeInputId}
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleUpdateField("endTime", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-semibold bg-white"
                />
              </div>

              {/* Duration */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-[11px]">
                  Duration (المدة بالدقائق)
                </label>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  <span>{formData.sessionDuration || 20} دقيقة</span>
                </div>
              </div>

              {/* Observer */}
              <div className="space-y-1 sm:col-span-2">
                <label htmlFor={observerInputId} className="font-bold text-slate-700 block text-[11px]">
                  Observer (الراصد / الملاحظ)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    id={observerInputId}
                    type="text"
                    value={formData.observer}
                    onChange={(e) => handleUpdateField("observer", e.target.value)}
                    className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-semibold bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Guide to 5 Moments & Actions */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 sm:p-4 text-amber-950 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>دليل دواعي الغسيل الخمسة (WHO 5 Moments) وإجراءات الرصد:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="bg-white/80 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                <strong>bef.pat:</strong> قبل لمس المريض
              </span>
              <span className="bg-white/80 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                <strong>bef.asept:</strong> قبل إجراء معقم
              </span>
              <span className="bg-white/80 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                <strong>aft.b.f:</strong> بعد سوائل الجسم
              </span>
              <span className="bg-white/80 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                <strong>aft.pat:</strong> بعد لمس المريض
              </span>
              <span className="bg-white/80 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                <strong>aft.p.surr:</strong> بعد لمس المحيط
              </span>
            </div>
          </div>

          {/* 4-Columns WHO Observation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
            {formData.columns.map((col, colIdx) => (
              <div
                key={col.id}
                className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col overflow-hidden"
              >
                {/* Column Header: Category, Code, HCW Count */}
                <div className="bg-gradient-to-b from-slate-100 to-slate-200/90 p-3.5 border-b border-slate-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-300 shadow-2xs">
                      العمود #{colIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleClearColumn(colIdx)}
                      className="text-[10px] text-slate-500 hover:text-rose-600 font-bold px-2 py-0.5 rounded-md hover:bg-rose-50 transition-colors"
                      title="مسح خيارات هذا العمود"
                    >
                      مسح العمود
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Prof.cat (الفئة المهنية والكود)
                    </label>
                    <select
                      value={col.profCatCode}
                      onChange={(e) => handleUpdateColumnProfCat(colIdx, e.target.value)}
                      className="w-full text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer shadow-2xs"
                    >
                      <optgroup label="1. Nurse / Midwife (تمريض وقبالة)">
                        {WHO_PROF_CATEGORIES.filter((c) => c.mainCategory === "1").map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} - {c.subNameAr} ({c.subNameEn})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="2. Auxiliary (مساعدين صحيين)">
                        {WHO_PROF_CATEGORIES.filter((c) => c.mainCategory === "2").map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} - {c.subNameAr} ({c.subNameEn})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="3. Medical Doctor (أطباء بشريين)">
                        {WHO_PROF_CATEGORIES.filter((c) => c.mainCategory === "3").map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} - {c.subNameAr} ({c.subNameEn})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="4. Other Health-Care Worker (كوادر أخرى)">
                        {WHO_PROF_CATEGORIES.filter((c) => c.mainCategory === "4").map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} - {c.subNameAr} ({c.subNameEn})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-slate-600 text-[11px]">N° (عدد الكوادر):</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={col.workersCount}
                      onChange={(e) => handleUpdateColumnWorkers(colIdx, parseInt(e.target.value, 10) || 1)}
                      className="w-16 px-2 py-0.5 text-center font-bold text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                {/* Column Table Header */}
                <div className="grid grid-cols-12 bg-slate-800 text-white text-[10px] font-bold py-1.5 px-2 text-center items-center">
                  <div className="col-span-2 text-right pr-1">Opp</div>
                  <div className="col-span-6">Indication (الدواعي)</div>
                  <div className="col-span-4">HH Action (الإجراء)</div>
                </div>

                {/* Opportunities Rows (1 to 8+) */}
                <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[480px]">
                  {col.opportunities.map((opp, oppIdx) => {
                    const isOppActive = opp.indications.length > 0 || opp.action !== "";
                    return (
                      <div
                        key={opp.id}
                        className={`p-2 transition-colors ${
                          isOppActive ? "bg-amber-50/30" : "bg-white hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="grid grid-cols-12 gap-1 items-start">
                          
                          {/* Opp Number */}
                          <div className="col-span-2 flex items-center justify-center pt-1">
                            <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-bold text-[11px] flex items-center justify-center">
                              {opp.oppNumber}
                            </span>
                          </div>

                          {/* Indications (5 Checkboxes) */}
                          <div className="col-span-6 space-y-0.5 text-[10px]">
                            {WHO_FIVE_MOMENTS.map((moment) => {
                              const isChecked = opp.indications.includes(moment.key);
                              return (
                                <label
                                  key={moment.key}
                                  className={`flex items-center gap-1.5 px-1 py-0.5 rounded cursor-pointer select-none transition-colors ${
                                    isChecked
                                      ? "bg-amber-100 text-amber-900 font-bold border border-amber-300/80"
                                      : "text-slate-600 hover:bg-slate-100"
                                  }`}
                                  onClick={() => handleToggleIndication(colIdx, oppIdx, moment.key)}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}} // handled by parent onClick
                                    className="w-3 h-3 rounded text-orange-600 focus:ring-orange-500 cursor-pointer accent-orange-600"
                                  />
                                  <span className="font-mono text-[9.5px]">{moment.code}</span>
                                </label>
                              );
                            })}
                          </div>

                          {/* Actions (HR, HW, Missed, Gloves) */}
                          <div className="col-span-4 space-y-1">
                            {/* HR: Alcohol Rub */}
                            <button
                              type="button"
                              onClick={() => handleSetAction(colIdx, oppIdx, "HR")}
                              className={`w-full py-1 px-1 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                opp.action === "HR"
                                  ? "bg-emerald-600 text-white border-emerald-700 shadow-2xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              }`}
                              title="Handrub with alcohol-based formula"
                            >
                              <span>HR (كحول)</span>
                              {opp.action === "HR" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </button>

                            {/* HW: Handwash */}
                            <button
                              type="button"
                              onClick={() => handleSetAction(colIdx, oppIdx, "HW")}
                              className={`w-full py-1 px-1 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                opp.action === "HW"
                                  ? "bg-blue-600 text-white border-blue-700 shadow-2xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              }`}
                              title="Handwashing with soap and water"
                            >
                              <span>HW (ماء وصابون)</span>
                              {opp.action === "HW" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </button>

                            {/* Missed */}
                            <button
                              type="button"
                              onClick={() => handleSetAction(colIdx, oppIdx, "missed")}
                              className={`w-full py-1 px-1 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                opp.action === "missed"
                                  ? "bg-rose-600 text-white border-rose-700 shadow-2xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              }`}
                              title="No hand hygiene action performed"
                            >
                              <span>Missed (فائتة)</span>
                              {opp.action === "missed" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </button>

                            {/* Gloves Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleGloves(colIdx, oppIdx)}
                              className={`w-full py-0.5 px-1 rounded text-[9px] font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                opp.gloves
                                  ? "bg-purple-100 text-purple-900 border-purple-300"
                                  : "bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600"
                              }`}
                              title="Recorded when hand hygiene is missed while wearing gloves"
                            >
                              <span>{opp.gloves ? "✓ gloves (قفاز)" : "○ gloves"}</span>
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Row Button */}
                <div className="p-2 bg-slate-50 border-t border-slate-200 text-center">
                  <button
                    type="button"
                    onClick={() => handleAddOpportunityRow(colIdx)}
                    className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 font-bold px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة فرصة رصد أخرى (Opp)</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Session Notes */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              ملاحظات وتوصيات إضافية للجلسة (Notes / Feedback)
            </label>
            <textarea
              rows={2}
              value={formData.notes || ""}
              onChange={(e) => handleUpdateField("notes", e.target.value)}
              placeholder="اكتب أي ملاحظات أو تغذية راجعة تم تقديمها للطاقم بعد انتهاء الجلسة..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
            />
          </div>

        </div>

        {/* Modal Bottom Fixed Bar: Real-time Compliance Ticker & Actions */}
        <div className="bg-white border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-lg">
          
          {/* Live Math Stats Summary */}
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">إجمالي الفرص (Opp):</span>
              <span className="font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-sm">
                {totalOpp}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">الإجراءات الملتزمة (Act = HR+HW):</span>
              <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-sm">
                {totalActions}
              </span>
              <span className="text-[11px] text-slate-400">
                (كحول: {totalHR} | صابون: {totalHW})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">معدل الامتثال (Compliance %):</span>
              <span
                className={`font-black px-3 py-1 rounded-xl text-sm border ${
                  liveCompliance >= 85
                    ? "bg-emerald-600 text-white border-emerald-700"
                    : liveCompliance >= 70
                    ? "bg-amber-500 text-white border-amber-600"
                    : "bg-rose-500 text-white border-rose-600"
                }`}
              >
                %{liveCompliance}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-black shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ واعتماد جلسة الرصد</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
