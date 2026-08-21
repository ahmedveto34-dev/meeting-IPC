import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Search,
  Layers,
  Copy,
  CheckCircle2,
  Building2,
  AlertTriangle,
  Plus,
  Printer,
  ShieldCheck,
  CheckSquare,
  Square,
  FileText,
  Clock,
  UserCheck,
  Eye,
  Trash2,
  Sparkles,
  ArrowRight,
  Filter,
  BookMarked
} from "lucide-react";
import {
  STANDARD_OBSERVATIONS_LIBRARY,
  OBSERVATION_CATEGORIES
} from "../data/standardObservations";
import {
  EGYPTIAN_INSPECTION_CONTROL_POLICIES,
  getPolicyById
} from "../data/infectionControlPolicies";
import { StandardObservationItem, CenterSettings } from "../types";
import {
  getCustomObservations,
  saveCustomObservationsList,
  deleteCustomObservationById,
  CUSTOM_OBSERVATIONS_EVENT,
} from "../utils/customObservationsManager";

interface ObservationsBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectObservation?: (item: StandardObservationItem) => void;
  onCreateRoundFromObservations?: (items: StandardObservationItem[]) => void;
  centerSettings?: CenterSettings;
}

export const ObservationsBankModal: React.FC<ObservationsBankModalProps> = ({
  isOpen,
  onClose,
  onSelectObservation,
  onCreateRoundFromObservations,
  centerSettings,
}) => {
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [copySuccessToast, setCopySuccessToast] = useState<string | null>(null);

  // Local Custom Observations with reactive update listener
  const [customObservations, setCustomObservations] = useState<StandardObservationItem[]>(() =>
    getCustomObservations()
  );

  // Sync custom observations across components
  useEffect(() => {
    const handleUpdate = () => {
      setCustomObservations(getCustomObservations());
    };
    window.addEventListener(CUSTOM_OBSERVATIONS_EVENT, handleUpdate);
    return () => window.removeEventListener(CUSTOM_OBSERVATIONS_EVENT, handleUpdate);
  }, []);

  // Merge default and custom observations
  const allObservations = useMemo(() => {
    return [...customObservations, ...STANDARD_OBSERVATIONS_LIBRARY];
  }, [customObservations]);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add("الكل");
    allObservations.forEach((item) => cats.add(item.category));
    return Array.from(cats);
  }, [allObservations]);

  // Counts by severity
  const severityCounts = useMemo(() => {
    const counts = { all: allObservations.length, critical: 0, high: 0, medium: 0, low: 0 };
    allObservations.forEach((item) => {
      if (item.severity === "critical") counts.critical++;
      else if (item.severity === "high") counts.high++;
      else if (item.severity === "medium") counts.medium++;
      else if (item.severity === "low") counts.low++;
    });
    return counts;
  }, [allObservations]);

  // Filtered observations
  const filtered = useMemo(() => {
    return allObservations.filter((item) => {
      const matchPolicy = selectedPolicyId === "all" || item.policyId === selectedPolicyId;
      const matchCat = selectedCategory === "الكل" || item.category === selectedCategory;
      const matchSeverity =
        selectedSeverity === "all" || item.severity === selectedSeverity;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.observation.toLowerCase().includes(q) ||
        item.recommendation.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.responsible.toLowerCase().includes(q) ||
        (item.policyName && item.policyName.toLowerCase().includes(q)) ||
        (item.egyptianGuidelineRef && item.egyptianGuidelineRef.toLowerCase().includes(q)) ||
        (item.standardRef && item.standardRef.toLowerCase().includes(q));
      return matchPolicy && matchCat && matchSeverity && matchSearch;
    });
  }, [allObservations, selectedPolicyId, selectedCategory, selectedSeverity, search]);

  // Selection toggle
  const toggleSelect = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    if (selectedItemIds.size === filtered.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(filtered.map((i) => i.id)));
    }
  };

  // Copy single item
  const handleCopyText = (item: StandardObservationItem) => {
    const text = `الموقع: ${item.location}
الملاحظة: ${item.observation}
التوصية / الإجراء التصحيحي: ${item.recommendation}
المسؤول عن التنفيذ: ${item.responsible} (${item.duration})
وسيلة المتابعة: ${item.monitoringMethod}
المرجع القياسي: ${item.standardRef || "معايير مكافحة العدوى الوطنية"}`;
    
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy selected items in batch
  const handleCopySelected = () => {
    const selectedList = allObservations.filter((item) => selectedItemIds.has(item.id));
    if (selectedList.length === 0) return;

    const formatted = selectedList
      .map(
        (item, idx) =>
          `[${idx + 1}] الموقع: ${item.location} (${item.category})
الملاحظة: ${item.observation}
التوصية: ${item.recommendation}
المسؤول: ${item.responsible} | المدة: ${item.duration}
المرجع: ${item.standardRef || "معايير مكافحة العدوى"}
----------------------------------------`
      )
      .join("\n\n");

    navigator.clipboard.writeText(formatted);
    setCopySuccessToast(`تم نسخ ${selectedList.length} ملاحظة بنجاح إلى الحافظة`);
    setTimeout(() => setCopySuccessToast(null), 3000);
  };

  // Create round report from selected
  const handleCreateRound = () => {
    const selectedList = allObservations.filter((item) => selectedItemIds.has(item.id));
    if (selectedList.length === 0) return;

    if (onCreateRoundFromObservations) {
      onCreateRoundFromObservations(selectedList);
    }
    onClose();
  };

  // Print full bank
  const handlePrint = () => {
    window.print();
  };

  // New Custom Item Form State
  const [newCat, setNewCat] = useState("غرفة العمليات والجراحة");
  const [newLocation, setNewLocation] = useState("");
  const [newObs, setNewObs] = useState("");
  const [newRec, setNewRec] = useState("");
  const [newResp, setNewResp] = useState("مشرف التمريض / مسؤول مكافحة العدوى");
  const [newDuration, setNewDuration] = useState("فوري");
  const [newMethod, setNewMethod] = useState("المرور الميداني");
  const [newSeverity, setNewSeverity] = useState<"critical" | "high" | "medium" | "low">("high");
  const [newRef, setNewRef] = useState("معايير مكافحة العدوى");

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObs.trim() || !newRec.trim() || !newLocation.trim()) return;

    const customItem: StandardObservationItem = {
      id: `custom-obs-${Date.now()}`,
      category: newCat,
      location: newLocation.trim(),
      observation: newObs.trim(),
      recommendation: newRec.trim(),
      responsible: newResp.trim(),
      duration: newDuration.trim(),
      monitoringMethod: newMethod.trim(),
      severity: newSeverity,
      standardRef: newRef.trim(),
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    saveCustomObservationsList([customItem, ...customObservations]);
    setShowAddModal(false);
    // Reset form
    setNewLocation("");
    setNewObs("");
    setNewRec("");
  };

  const handleDeleteCustom = (id: string) => {
    deleteCustomObservationById(id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  بنك ملاحظات المرور الميداني الشامل لمكافحة العدوى
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {allObservations.length} ملاحظة وتوصية معتمدة
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                مكتبة قياسية تغطي كافة أقسام المستشفيات والمراكز (العمليات، التعقيم، العناية، الكلى، الأسنان، المعامل، النفايات، والمزيد)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة ملاحظة للبنك</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              title="طباعة الدليل الكامل لبنك الملاحظات"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">طباعة الدليل</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50 space-y-3 shrink-0">
          
          {/* Search bar & Severity Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative grow">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالنص، الملاحظة، الإجراء التصحيحي، السياسة، الدليل القومي، أو القسم..."
                className="w-full pr-9 pl-8 py-2 text-xs sm:text-sm bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Policy Selector */}
            <div className="w-full md:w-64">
              <select
                value={selectedPolicyId}
                onChange={(e) => setSelectedPolicyId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-semibold"
              >
                <option value="all">جميع سياسات مكافحة العدوى ({EGYPTIAN_INSPECTION_CONTROL_POLICIES.length})</option>
                {EGYPTIAN_INSPECTION_CONTROL_POLICIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code}: {p.shortTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Pill Selector */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shrink-0 overflow-x-auto text-[11px]">
              <span className="text-slate-500 px-2 font-medium flex items-center gap-1">
                <Filter className="w-3 h-3" /> الخطورة:
              </span>
              <button
                type="button"
                onClick={() => setSelectedSeverity("all")}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  selectedSeverity === "all"
                    ? "bg-slate-800 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                الكل ({severityCounts.all})
              </button>
              <button
                type="button"
                onClick={() => setSelectedSeverity("critical")}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  selectedSeverity === "critical"
                    ? "bg-rose-600 text-white"
                    : "text-rose-700 hover:bg-rose-50"
                }`}
              >
                حرجة / فوري ({severityCounts.critical})
              </button>
              <button
                type="button"
                onClick={() => setSelectedSeverity("high")}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  selectedSeverity === "high"
                    ? "bg-amber-600 text-white"
                    : "text-amber-700 hover:bg-amber-50"
                }`}
              >
                عالية ({severityCounts.high})
              </button>
              <button
                type="button"
                onClick={() => setSelectedSeverity("medium")}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  selectedSeverity === "medium"
                    ? "bg-blue-600 text-white"
                    : "text-blue-700 hover:bg-blue-50"
                }`}
              >
                متوسطة ({severityCounts.medium})
              </button>
              <button
                type="button"
                onClick={() => setSelectedSeverity("low")}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  selectedSeverity === "low"
                    ? "bg-emerald-600 text-white"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                روتينية ({severityCounts.low})
              </button>
            </div>
          </div>

          {/* Department Categories Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const count =
                cat === "الكل"
                  ? allObservations.length
                  : allObservations.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600 font-bold"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bulk Selection Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={selectAllFiltered}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
              >
                {selectedItemIds.size === filtered.length && filtered.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>تحديد الكل ({filtered.length})</span>
              </button>

              {selectedItemIds.size > 0 && (
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  تم تحديد {selectedItemIds.size} ملاحظة
                </span>
              )}
            </div>

            {selectedItemIds.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySelected}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ المحددة</span>
                </button>

                {onCreateRoundFromObservations && (
                  <button
                    type="button"
                    onClick={handleCreateRound}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-2xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>إنشاء تقرير مرور بالملاحظات المحددة ({selectedItemIds.size})</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Copy Toast */}
        {copySuccessToast && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 text-center font-bold animate-in fade-in">
            {copySuccessToast}
          </div>
        )}

        {/* Observations List */}
        <div className="p-3 sm:p-5 overflow-y-auto grow space-y-3 bg-slate-50/50">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
              <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">لا توجد ملاحظات مطابقة لمعايير البحث</p>
              <p className="text-xs text-slate-400 mt-1">جرّب اختيار تصنيف آخر أو مسح عبارة البحث</p>
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selectedItemIds.has(item.id);
              
              const severityBadge = () => {
                switch (item.severity) {
                  case "critical":
                    return (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> خطورة حرجة (فوري)
                      </span>
                    );
                  case "high":
                    return (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        خطورة عالية
                      </span>
                    );
                  case "medium":
                    return (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        خطورة متوسطة
                      </span>
                    );
                  case "low":
                    return (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ملاحظة تحسينية
                      </span>
                    );
                  default:
                    return null;
                }
              };

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all bg-white space-y-3 text-right shadow-2xs ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {/* Item Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => toggleSelect(item.id)}
                        className="text-slate-400 hover:text-blue-600 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        {item.location}
                      </span>

                      {item.policyName && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <BookMarked className="w-3 h-3 text-emerald-600" />
                          {item.policyName}
                        </span>
                      )}

                      <span className="text-xs text-slate-500 font-medium">
                        ({item.category})
                      </span>

                      {severityBadge()}

                      {item.isCustom && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          مخصصة للمركز
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyText(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                        title="نسخ نص الملاحظة والتوصية"
                      >
                        {copiedId === item.id ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === item.id ? "تم النسخ" : "نسخ"}</span>
                      </button>

                      {onSelectObservation && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectObservation(item);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إدراج بالتقرير</span>
                        </button>
                      )}

                      {item.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustom(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="حذف هذه الملاحظة المخصصة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Core Observation & Recommendation */}
                  <div className="space-y-2">
                    <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                        <span className="text-rose-700 font-extrabold ml-1">الملاحظة الميدانية (عدم المطابقة):</span>{" "}
                        {item.observation}
                      </p>
                    </div>

                    <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                        <span className="text-blue-800 font-extrabold ml-1">
                          الإجراء التصحيحي والتوصية المعتمدة:
                        </span>{" "}
                        {item.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Meta Details Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100 bg-slate-50/60 p-2 rounded-lg">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <strong>المسؤول:</strong> {item.responsible}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <strong>المدة:</strong> {item.duration}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <strong>المتابعة:</strong> {item.monitoringMethod}
                      </span>
                    </div>

                    {item.standardRef && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {item.standardRef}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-white flex flex-wrap justify-between items-center text-xs text-slate-600 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span>
              إجمالي الملاحظات: <strong>{filtered.length}</strong> من أصل {allObservations.length}
            </span>
            {selectedItemIds.size > 0 && (
              <span className="text-blue-700 font-bold">
                (المحدد حالياً: {selectedItemIds.size})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>

      </div>

      {/* Add Custom Observation Sub-Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>إضافة ملاحظة وإجراء تصحيحي جديد لبنك الملاحظات</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="space-y-3.5 text-right text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم / التصنيف</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-semibold"
                  >
                    {OBSERVATION_CATEGORIES.filter((c) => c !== "الكل").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الموقع الدقيق</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="مثال: غرفة العمليات 2، حوض غسيل الأيدي..."
                    className="w-full p-2 rounded-lg border border-slate-300 font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  نص الملاحظة الميدانية (حالة عدم المطابقة)
                </label>
                <textarea
                  rows={2}
                  value={newObs}
                  onChange={(e) => setNewObs(e.target.value)}
                  placeholder="اكتب وصف الملاحظة بدقة..."
                  className="w-full p-2 rounded-lg border border-slate-300 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  التوصية والإجراء التصحيحي والوقائي المعتمد
                </label>
                <textarea
                  rows={2}
                  value={newRec}
                  onChange={(e) => setNewRec(e.target.value)}
                  placeholder="اكتب الإجراء التصحيحي المطلوب..."
                  className="w-full p-2 rounded-lg border border-slate-300 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المسؤول عن التنفيذ</label>
                  <input
                    type="text"
                    value={newResp}
                    onChange={(e) => setNewResp(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المدة الزمنية</label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">مستوى الخطورة</label>
                  <select
                    value={newSeverity}
                    onChange={(e) =>
                      setNewSeverity(e.target.value as "critical" | "high" | "medium" | "low")
                    }
                    className="w-full p-2 rounded-lg border border-slate-300 font-semibold"
                  >
                    <option value="critical">حرجة / فوري</option>
                    <option value="high">عالية</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">روتينية / تحسينية</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وسيلة المتابعة</label>
                  <input
                    type="text"
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المرجع القياسي / المعيار</label>
                  <input
                    type="text"
                    value={newRef}
                    onChange={(e) => setNewRef(e.target.value)}
                    placeholder="مثال: معايير سباهي CBAHI / WHO"
                    className="w-full p-2 rounded-lg border border-slate-300 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-2xs"
                >
                  حفظ بالبنك
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
