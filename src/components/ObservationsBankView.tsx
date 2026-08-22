import React, { useState, useMemo, useEffect } from "react";
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Printer,
  Copy,
  FileText,
  ClipboardCheck,
  Calendar,
  Building2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
  UserCheck,
  ShieldCheck,
  CheckSquare,
  Square,
  PlusCircle,
  FolderPlus,
  BookOpen,
  ArrowRight,
  Send,
  SlidersHorizontal,
  X,
  BookMarked,
  FileCheck2,
  ExternalLink,
  HelpCircle,
  Flame,
  AlertCircle
} from "lucide-react";
import {
  STANDARD_OBSERVATIONS_LIBRARY,
  OBSERVATION_CATEGORIES,
} from "../data/standardObservations";
import {
  EGYPTIAN_INSPECTION_CONTROL_POLICIES,
  getPolicyById
} from "../data/infectionControlPolicies";
import {
  getCustomObservations,
  saveCustomObservationsList,
  deleteCustomObservationById,
  CUSTOM_OBSERVATIONS_EVENT,
} from "../utils/customObservationsManager";
import {
  StandardObservationItem,
  MeetingTopic,
  Meeting,
  RoundReport,
  CenterSettings,
  InfectionControlPolicy
} from "../types";
import { TodayAddedSummaryView } from "./TodayAddedSummaryView";
import {
  TODAY_ADDED_OBSERVATION_IDS,
  sortWithTodaySummaryFirst,
} from "../data/todayObservationsSummary";
import { exportObservationsBankToDocx } from "../utils/docxExport";

interface ObservationsBankViewProps {
  topics: MeetingTopic[];
  meetings: Meeting[];
  rounds: RoundReport[];
  centerSettings: CenterSettings;
  onAddObservationToRound: (obs: StandardObservationItem[], targetRoundId?: string) => void;
  onAddObservationToMeeting: (obs: StandardObservationItem[], targetMeetingId?: string) => void;
  onAddTopicToMeeting: (topics: MeetingTopic[], targetMeetingId?: string) => void;
  onAddTopicToRound: (topics: MeetingTopic[], targetRoundId?: string) => void;
  onOpenNewRound: () => void;
  onOpenNewMeeting: () => void;
}

export const ObservationsBankView: React.FC<ObservationsBankViewProps> = ({
  topics,
  meetings,
  rounds,
  centerSettings,
  onAddObservationToRound,
  onAddObservationToMeeting,
  onAddTopicToMeeting,
  onAddTopicToRound,
  onOpenNewRound,
  onOpenNewMeeting,
}) => {
  // Main view mode: "summary" | "policies" | "observations" | "topics" | "all"
  const [activeBankTab, setActiveBankTab] = useState<"summary" | "policies" | "observations" | "topics" | "all">("summary");
  
  // Search & Filters
  const [search, setSearch] = useState<string>("");
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedPolicyDomain, setSelectedPolicyDomain] = useState<string>("الكل");

  // Selection Sets
  const [selectedObsIds, setSelectedObsIds] = useState<Set<string>>(new Set());
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());

  // Expanded Policy Cards in Policy View
  const [expandedPolicyIds, setExpandedPolicyIds] = useState<Set<string>>(new Set(["pol-hh", "pol-ppe", "pol-cssd"]));

  // Action Destination Modal State
  const [actionItem, setActionItem] = useState<{
    type: "observation" | "topic" | "batch_obs" | "batch_topic" | "batch_mixed";
    obsItems?: StandardObservationItem[];
    topicItems?: MeetingTopic[];
    title: string;
    description: string;
  } | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local Custom Observations State with real-time update event listener
  const [customObservations, setCustomObservations] = useState<StandardObservationItem[]>(() =>
    getCustomObservations()
  );

  // Modal to add custom observation
  const [showAddObsModal, setShowAddObsModal] = useState(false);
  const [newObsForm, setNewObsForm] = useState<Partial<StandardObservationItem>>({
    policyId: "pol-hh",
    category: "مرور عيادة الرمد (العيادات الخارجية)",
    location: "",
    observation: "",
    recommendation: "",
    responsible: "مشرف التمريض / مسؤول مكافحة العدوى",
    duration: "فوري",
    monitoringMethod: "المرور الميداني اليومي",
    severity: "high",
    standardRef: "معايير مكافحة العدوى المعتمدة",
  });

  useEffect(() => {
    const handleUpdate = () => {
      setCustomObservations(getCustomObservations());
    };
    window.addEventListener(CUSTOM_OBSERVATIONS_EVENT, handleUpdate);
    return () => window.removeEventListener(CUSTOM_OBSERVATIONS_EVENT, handleUpdate);
  }, []);

  // Combined Observations
  const allObservations = useMemo(() => {
    return [...customObservations, ...STANDARD_OBSERVATIONS_LIBRARY];
  }, [customObservations]);

  // Map of observations grouped by policyId
  const observationsByPolicy = useMemo(() => {
    const map = new Map<string, StandardObservationItem[]>();
    EGYPTIAN_INSPECTION_CONTROL_POLICIES.forEach((p) => map.set(p.id, []));

    allObservations.forEach((item) => {
      const pId = item.policyId || "pol-hh";
      if (!map.has(pId)) {
        map.set(pId, []);
      }
      map.get(pId)!.push(item);
    });

    return map;
  }, [allObservations]);

  // Unique Policy Domains
  const policyDomains = useMemo(() => {
    const domains = new Set<string>();
    domains.add("الكل");
    EGYPTIAN_INSPECTION_CONTROL_POLICIES.forEach((p) => {
      if (p.departmentCategory) domains.add(p.departmentCategory);
    });
    return Array.from(domains);
  }, []);

  // Categories for observations
  const obsCategories = useMemo(() => {
    const cats = new Set<string>();
    cats.add("الكل");
    allObservations.forEach((item) => cats.add(item.category));
    return Array.from(cats);
  }, [allObservations]);

  // Filtered Policies
  const filteredPolicies = useMemo(() => {
    return EGYPTIAN_INSPECTION_CONTROL_POLICIES.filter((policy) => {
      const matchDomain = selectedPolicyDomain === "الكل" || policy.departmentCategory === selectedPolicyDomain;
      const q = search.trim().toLowerCase();
      if (!q) return matchDomain;

      const policyObs = observationsByPolicy.get(policy.id) || [];
      const matchSearch =
        policy.title.toLowerCase().includes(q) ||
        policy.shortTitle.toLowerCase().includes(q) ||
        policy.code.toLowerCase().includes(q) ||
        policy.summary.toLowerCase().includes(q) ||
        policy.guidelineChapter.toLowerCase().includes(q) ||
        policy.scope.toLowerCase().includes(q) ||
        policy.keyRequirements.some((r) => r.toLowerCase().includes(q)) ||
        policyObs.some(
          (o) =>
            o.observation.toLowerCase().includes(q) ||
            o.recommendation.toLowerCase().includes(q) ||
            o.location.toLowerCase().includes(q)
        );

      return matchDomain && matchSearch;
    });
  }, [selectedPolicyDomain, search, observationsByPolicy]);

  // Filtered Observations (prioritizing the 35 summary observations first)
  const filteredObservations = useMemo(() => {
    const list = allObservations.filter((item) => {
      const matchPolicy = selectedPolicyId === "all" || item.policyId === selectedPolicyId;
      const matchCat = selectedCategory === "الكل" || item.category === selectedCategory;
      const matchSeverity = selectedSeverity === "all" || item.severity === selectedSeverity;
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

    return sortWithTodaySummaryFirst(list);
  }, [allObservations, selectedPolicyId, selectedCategory, selectedSeverity, search]);

  // Filtered Topics
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const q = search.trim().toLowerCase();
      const matchCat =
        selectedCategory === "الكل" ||
        t.category === selectedCategory ||
        t.targetDepartments?.some((d) => selectedCategory.includes(d));
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.agenda.some((a) => a.toLowerCase().includes(q)) ||
        t.sampleDecisions.some(
          (d) => d.topic.toLowerCase().includes(q) || d.decision.toLowerCase().includes(q)
        );
      return matchCat && matchSearch;
    });
  }, [topics, selectedCategory, search]);

  // Severity Counts
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

  // Toggle Policy Accordion
  const togglePolicyExpanded = (policyId: string) => {
    setExpandedPolicyIds((prev) => {
      const next = new Set(prev);
      if (next.has(policyId)) next.delete(policyId);
      else next.add(policyId);
      return next;
    });
  };

  const expandAllPolicies = () => {
    setExpandedPolicyIds(new Set(EGYPTIAN_INSPECTION_CONTROL_POLICIES.map((p) => p.id)));
  };

  const collapseAllPolicies = () => {
    setExpandedPolicyIds(new Set());
  };

  // Toggle Selection Handlers
  const toggleObsSelect = (id: string) => {
    setSelectedObsIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTopicSelect = (id: string) => {
    setSelectedTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllCurrentTab = () => {
    if (activeBankTab === "observations") {
      if (selectedObsIds.size === filteredObservations.length) {
        setSelectedObsIds(new Set());
      } else {
        setSelectedObsIds(new Set(filteredObservations.map((i) => i.id)));
      }
    } else if (activeBankTab === "topics") {
      if (selectedTopicIds.size === filteredTopics.length) {
        setSelectedTopicIds(new Set());
      } else {
        setSelectedTopicIds(new Set(filteredTopics.map((t) => t.id)));
      }
    } else if (activeBankTab === "policies") {
      const currentPolicyObs = filteredPolicies.flatMap((p) => observationsByPolicy.get(p.id) || []);
      if (selectedObsIds.size === currentPolicyObs.length) {
        setSelectedObsIds(new Set());
      } else {
        setSelectedObsIds(new Set(currentPolicyObs.map((o) => o.id)));
      }
    } else {
      if (
        selectedObsIds.size === filteredObservations.length &&
        selectedTopicIds.size === filteredTopics.length
      ) {
        setSelectedObsIds(new Set());
        setSelectedTopicIds(new Set());
      } else {
        setSelectedObsIds(new Set(filteredObservations.map((i) => i.id)));
        setSelectedTopicIds(new Set(filteredTopics.map((t) => t.id)));
      }
    }
  };

  const clearAllSelections = () => {
    setSelectedObsIds(new Set());
    setSelectedTopicIds(new Set());
  };

  // Trigger Action Modal for single observation
  const handleOpenActionForObs = (obs: StandardObservationItem) => {
    setActionItem({
      type: "observation",
      obsItems: [obs],
      title: `${obs.location}: ${obs.observation.slice(0, 75)}...`,
      description: obs.recommendation,
    });
  };

  // Trigger Action Modal for all observations of a policy
  const handleOpenActionForPolicy = (policy: InfectionControlPolicy) => {
    const policyObs = observationsByPolicy.get(policy.id) || [];
    if (policyObs.length === 0) {
      // Fallback create virtual observation from policy
      const virtualObs: StandardObservationItem = {
        id: `obs-pol-${policy.id}`,
        category: policy.departmentCategory || "الاحتياطات القياسية",
        policyId: policy.id,
        policyName: policy.title,
        egyptianGuidelineRef: policy.guidelineChapter,
        location: policy.shortTitle,
        observation: `متابعة الالتزام بمتطلبات: ${policy.title}`,
        recommendation: policy.summary,
        responsible: "مشرف مكافحة العدوى ورئيس القسم",
        duration: "أسبوع",
        monitoringMethod: "المرور الميداني وقائمة التحقق",
        severity: "high",
        standardRef: policy.guidelineChapter,
      };
      setActionItem({
        type: "batch_obs",
        obsItems: [virtualObs],
        title: `حزمة ملاحظات ${policy.code}: ${policy.shortTitle}`,
        description: policy.summary,
      });
      return;
    }

    setActionItem({
      type: "batch_obs",
      obsItems: policyObs,
      title: `حزمة ملاحظات ${policy.code}: ${policy.shortTitle} (${policyObs.length} ملاحظة)`,
      description: policy.summary,
    });
  };

  // Trigger Action Modal for single topic
  const handleOpenActionForTopic = (topic: MeetingTopic) => {
    setActionItem({
      type: "topic",
      topicItems: [topic],
      title: topic.title,
      description: topic.description,
    });
  };

  // Trigger Action Modal for batch observations
  const handleOpenActionForBatchObs = () => {
    const selectedList = allObservations.filter((i) => selectedObsIds.has(i.id));
    if (selectedList.length === 0) return;
    setActionItem({
      type: "batch_obs",
      obsItems: selectedList,
      title: `مجموعة ملاحظات محددة (${selectedList.length} ملاحظة)`,
      description: "إدراج الملاحظات المحددة في تقرير مرور ميداني أو مناقشتها في الاجتماع الشهري",
    });
  };

  // Trigger Action Modal for batch topics
  const handleOpenActionForBatchTopics = () => {
    const selectedList = topics.filter((t) => selectedTopicIds.has(t.id));
    if (selectedList.length === 0) return;
    setActionItem({
      type: "batch_topic",
      topicItems: selectedList,
      title: `مجموعة موضوعات محددة (${selectedList.length} موضوع)`,
      description: "إدراج الموضوعات وجداول الأعمال والقرارات في اجتماع شهري أو مرور ميداني",
    });
  };

  // Execute Action
  const handleExecuteAction = (targetType: "new_round" | "existing_round" | "new_meeting" | "existing_meeting", targetId?: string) => {
    if (!actionItem) return;

    if (actionItem.type === "observation" || actionItem.type === "batch_obs") {
      const items = actionItem.obsItems || [];
      if (targetType === "new_round") {
        onAddObservationToRound(items, "new");
        setToastMessage(`تم إنشاء تقرير مرور ميداني جديد بنجاح وتضمين ${items.length} ملاحظة!`);
      } else if (targetType === "existing_round") {
        onAddObservationToRound(items, targetId);
        setToastMessage(`تمت إضافة ${items.length} ملاحظة إلى تقرير المرور المحدد بنجاح!`);
      } else if (targetType === "new_meeting") {
        onAddObservationToMeeting(items, "new");
        setToastMessage(`تم إنشاء اجتماع شهري جديد بنجاح وإدراج ${items.length} ملاحظة في الأجندة والقرارات!`);
      } else if (targetType === "existing_meeting") {
        onAddObservationToMeeting(items, targetId);
        setToastMessage(`تمت إضافة ${items.length} ملاحظة إلى قرارات وأجندة الاجتماع الشهري!`);
      }
    } else if (actionItem.type === "topic" || actionItem.type === "batch_topic") {
      const topicList = actionItem.topicItems || [];
      if (targetType === "new_meeting") {
        onAddTopicToMeeting(topicList, "new");
        setToastMessage(`تم إنشاء اجتماع شهري جديد من ${topicList.length} موضوع بنجاح!`);
      } else if (targetType === "existing_meeting") {
        onAddTopicToMeeting(topicList, targetId);
        setToastMessage(`تمت إضافة ${topicList.length} موضوع إلى الاجتماع الشهري المحدد!`);
      } else if (targetType === "new_round") {
        onAddTopicToRound(topicList, "new");
        setToastMessage(`تم تحويل الموضوعات إلى تقرير مرور ميداني جديد بنجاح!`);
      } else if (targetType === "existing_round") {
        onAddTopicToRound(topicList, targetId);
        setToastMessage(`تمت إضافة بنود الموضوعات إلى تقرير المرور المحدد!`);
      }
    }

    setActionItem(null);
    clearAllSelections();
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Copy text helper
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage(`تم نسخ ${label} إلى الحافظة!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Add custom observation submit
  const handleAddCustomObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObsForm.observation?.trim()) return;

    const matchedPolicy = getPolicyById(newObsForm.policyId || "pol-hh") || EGYPTIAN_INSPECTION_CONTROL_POLICIES[0];

    const newItem: StandardObservationItem = {
      id: `custom-obs-${Date.now()}`,
      category: newObsForm.category || "عام",
      policyId: matchedPolicy.id,
      policyName: matchedPolicy.title,
      egyptianGuidelineRef: matchedPolicy.guidelineChapter,
      location: newObsForm.location || "عام",
      observation: newObsForm.observation || "",
      recommendation: newObsForm.recommendation || "تطبيق معايير مكافحة العدوى المعتمدة",
      responsible: newObsForm.responsible || "مشرف التمريض / مكافحة العدوى",
      duration: newObsForm.duration || "فوري",
      monitoringMethod: newObsForm.monitoringMethod || "المرور الميداني اليومي",
      severity: newObsForm.severity as any || "high",
      standardRef: newObsForm.standardRef || "الدليل القومي المصري لمكافحة العدوى 2020",
      isCustom: true,
    };

    saveCustomObservationsList([newItem, ...customObservations]);
    setShowAddObsModal(false);
    setNewObsForm({
      policyId: "pol-hh",
      category: "مرور عيادة الرمد (العيادات الخارجية)",
      location: "",
      observation: "",
      recommendation: "",
      responsible: "مشرف التمريض / مسؤول مكافحة العدوى",
      duration: "فوري",
      monitoringMethod: "المرور الميداني اليومي",
      severity: "high",
      standardRef: "الدليل القومي المصري لمكافحة العدوى 2020",
    });
    setToastMessage("تمت إضافة الملاحظة المخصصة بنجاح إلى البنك والسياسة المحددة!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalSelectedCount = selectedObsIds.size + selectedTopicIds.size;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <BookMarked className="w-3.5 h-3.5" />
              <span>مبوبة حسب سياسات الدليل القومي المصري لمكافحة العدوى 2020</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              بنك سياسات وملاحظات مكافحة العدوى
            </h1>
            <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
              تقسيم مرجعي شامل يغطي <strong>جميع سياسات مكافحة العدوى (23 سياسة معتمدة)</strong> طبقاً لـ <strong>الدليل القومي المصري لمكافحة العدوى 2020 (وزارة الصحة والسكان)</strong>، مع أكثر من <strong>200+ ملاحظة ميدانية وإجراء تصحيحي</strong> وموضوعات اللجان والاجتماعات.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={async () => {
                try {
                  await exportObservationsBankToDocx(allObservations, centerSettings);
                  setToastMessage("تم تصدير بنك الملاحظات بالكامل كملف Word (.docx) منسق بنجاح!");
                  setTimeout(() => setToastMessage(null), 4000);
                } catch (e) {
                  console.error(e);
                  alert("حدث خطأ أثناء تصدير ملف Word");
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shadow-2xs cursor-pointer"
              title="تصدير جميع سياسات وملاحظات مكافحة العدوى في ملف Word (.docx) منسق"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>تصدير البنك (Word .docx)</span>
            </button>
            <button
              onClick={() => setShowAddObsModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4 text-slate-600" />
              <span>إضافة ملاحظة جديدة</span>
            </button>
            <button
              onClick={onOpenNewRound}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
              <span>مرور جديد فارغ</span>
            </button>
            <button
              onClick={onOpenNewMeeting}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>اجتماع شهري جديد</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setActiveBankTab("summary")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                activeBankTab === "summary"
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "text-indigo-950 hover:text-indigo-700 hover:bg-indigo-50"
              }`}
            >
              <Sparkles className={`w-4 h-4 ${activeBankTab === "summary" ? "text-indigo-200" : "text-indigo-600"}`} />
              <span>الملخص (الملاحظات المضافة اليوم)</span>
              <span className={`px-1.5 py-0.5 rounded-full text-2xs font-bold ${
                activeBankTab === "summary" ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-800"
              }`}>
                {TODAY_ADDED_OBSERVATION_IDS.length}
              </span>
            </button>

            <button
              onClick={() => setActiveBankTab("policies")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                activeBankTab === "policies"
                  ? "bg-white text-emerald-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>سياسات الدليل القومي (23 سياسة)</span>
              <span className="px-1.5 py-0.5 rounded-full text-2xs bg-emerald-100 text-emerald-800 font-bold">
                {EGYPTIAN_INSPECTION_CONTROL_POLICIES.length}
              </span>
            </button>

            <button
              onClick={() => setActiveBankTab("observations")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                activeBankTab === "observations"
                  ? "bg-white text-blue-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
              <span>قائمة الملاحظات الميدانية</span>
              <span className="px-1.5 py-0.5 rounded-full text-2xs bg-blue-50 text-blue-700 font-bold">
                {allObservations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveBankTab("topics")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                activeBankTab === "topics"
                  ? "bg-white text-purple-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>موضوعات وأجندات الاجتماعات</span>
              <span className="px-1.5 py-0.5 rounded-full text-2xs bg-purple-50 text-purple-700 font-bold">
                {topics.length}
              </span>
            </button>

            <button
              onClick={() => setActiveBankTab("all")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                activeBankTab === "all"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-4 h-4 text-slate-700" />
              <span>البحث الشامل والموحد</span>
            </button>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-800 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{TODAY_ADDED_OBSERVATION_IDS.length} ملاحظة بالملخص</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>23 سياسة قومية معتمدة</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{allObservations.length} ملاحظة وتوصية</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Selection & Batch Action Bar */}
      {totalSelectedCount > 0 && (
        <div className="sticky top-4 z-40 bg-slate-900 text-white p-4 rounded-xl shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4 animate-slideDown">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500 text-white">
              {totalSelectedCount} محدد
            </span>
            <span className="text-sm font-medium text-slate-200">
              {selectedObsIds.size > 0 && `${selectedObsIds.size} ملاحظة`}
              {selectedObsIds.size > 0 && selectedTopicIds.size > 0 && " و "}
              {selectedTopicIds.size > 0 && `${selectedTopicIds.size} موضوع اجتماع`}
            </span>
            <button
              onClick={clearAllSelections}
              className="text-xs text-slate-400 hover:text-white underline transition-colors mr-2"
            >
              إلغاء التحديد
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {selectedObsIds.size > 0 && (
              <button
                onClick={handleOpenActionForBatchObs}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>إدراج الملاحظات المحددة ({selectedObsIds.size})</span>
              </button>
            )}

            {selectedTopicIds.size > 0 && (
              <button
                onClick={handleOpenActionForBatchTopics}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-xs"
              >
                <Calendar className="w-4 h-4" />
                <span>إدراج الموضوعات المحددة ({selectedTopicIds.size})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث برقم السياسة، الكود (POL-01)، اسم السياسة، العيادة، الإجراء، التوصية، أو نص الدليل القومي..."
              className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Policy Domain Filter (when in Policy view) */}
          {activeBankTab === "policies" && (
            <div className="w-full md:w-64">
              <select
                value={selectedPolicyDomain}
                onChange={(e) => setSelectedPolicyDomain(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
              >
                <option value="الكل">جميع أبواب ومجالات السياسات</option>
                {policyDomains.filter(d => d !== "الكل").map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Policy Selector (when in Observations view) */}
          {activeBankTab === "observations" && (
            <div className="w-full md:w-72">
              <select
                value={selectedPolicyId}
                onChange={(e) => setSelectedPolicyId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
              >
                <option value="all">جميع سياسات مكافحة العدوى ({EGYPTIAN_INSPECTION_CONTROL_POLICIES.length})</option>
                {EGYPTIAN_INSPECTION_CONTROL_POLICIES.map((p) => {
                  const count = (observationsByPolicy.get(p.id) || []).length;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.code}: {p.shortTitle} ({count} ملاحظة)
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Department / Category Filter */}
          {(activeBankTab === "observations" || activeBankTab === "topics" || activeBankTab === "all") && (
            <div className="w-full md:w-60">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              >
                <option value="الكل">جميع الأقسام والأماكن</option>
                {obsCategories
                  .filter((c) => c !== "الكل")
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Severity Filter */}
          {(activeBankTab === "observations" || activeBankTab === "all") && (
            <div className="w-full md:w-44">
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              >
                <option value="all">كل درجات الخطورة ({severityCounts.all})</option>
                <option value="critical">حرج جداً ({severityCounts.critical})</option>
                <option value="high">عالي الخطورة ({severityCounts.high})</option>
                <option value="medium">متوسط ({severityCounts.medium})</option>
                <option value="low">منخفض ({severityCounts.low})</option>
              </select>
            </div>
          )}
        </div>

        {/* Quick Actions & Selection Helpers */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAllCurrentTab}
              className="inline-flex items-center gap-1.5 text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              <CheckSquare className="w-4 h-4 text-slate-500" />
              <span>تحديد / إلغاء تحديد الكل في هذا العرض</span>
            </button>

            {activeBankTab === "policies" && (
              <div className="flex items-center gap-2 mr-2">
                <button
                  onClick={expandAllPolicies}
                  className="text-emerald-700 hover:underline"
                >
                  فتح كل السياسات
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={collapseAllPolicies}
                  className="text-slate-600 hover:underline"
                >
                  طي الكل
                </button>
              </div>
            )}
          </div>

          <div className="text-slate-500">
            {activeBankTab === "policies" && (
              <span>يتم عرض <strong>{filteredPolicies.length}</strong> من <strong>{EGYPTIAN_INSPECTION_CONTROL_POLICIES.length}</strong> سياسة قومية معتمدة</span>
            )}
            {activeBankTab === "observations" && (
              <span>يتم عرض <strong>{filteredObservations.length}</strong> من <strong>{allObservations.length}</strong> ملاحظة قياسية</span>
            )}
            {activeBankTab === "topics" && (
              <span>يتم عرض <strong>{filteredTopics.length}</strong> من <strong>{topics.length}</strong> موضوع اجتماع</span>
            )}
            {activeBankTab === "all" && (
              <span>إجمالي النتائج: <strong>{filteredObservations.length}</strong> ملاحظة و <strong>{filteredTopics.length}</strong> موضوع</span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: SUMMARY VIEW (عنصر الملخص - الملاحظات المضافة اليوم)                */}
      {/* ========================================================================= */}
      {activeBankTab === "summary" && (
        <TodayAddedSummaryView
          onAddObservationToRound={onAddObservationToRound}
          onAddObservationToMeeting={onAddObservationToMeeting}
          onOpenActionModal={handleOpenActionForObs}
          onBatchAction={(items) => {
            setActionItem({
              type: "batch_obs",
              obsItems: items,
              title: `إدراج دفعة من ملخص الملاحظات (${items.length} ملاحظة)`,
              description: `سيتم نسخ وإدراج كافة الملاحظات الـ (${items.length}) المحددة من الملخص مباشرة للتقرير المطلوب مع توصياتها المعتمدة.`,
            });
          }}
          rounds={rounds}
          meetings={meetings}
          centerSettings={centerSettings}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 1: POLICIES VIEW (تقسيم الملاحظات حسب سياسات الدليل القومي 2020)       */}
      {/* ========================================================================= */}
      {activeBankTab === "policies" && (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex items-start gap-3">
            <BookMarked className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-950">
                فهرس سياسات مكافحة العدوى المعتمدة طبقاً للدليل القومي المصري 2020
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                يحتوي هذا التبويب على السياسات الـ 23 المعتمدة بالدليل القومي المصري لمكافحة العدوى (الإصدار المحدث 2020 - قطاع الطب الوقائي بوزارة الصحة والسكان). يمكنك استعراض بنود كل سياسة، الدليل المرجعي، المتطلبات الإلزامية، وكافة الملاحظات الميدانية المرتبطة بها، مع إمكانية إدراج ملاحظات السياسة دفعة واحدة في تقرير مرور أو اجتماع شهري.
              </p>
            </div>
          </div>

          {filteredPolicies.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <Search className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">لم يتم العثور على سياسات تطابق معايير البحث</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                جرب تغيير كلمات البحث أو اختيار باب آخر من أبواب الدليل القومي.
              </p>
              <button
                onClick={() => { setSearch(""); setSelectedPolicyDomain("الكل"); }}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPolicies.map((policy) => {
                const isExpanded = expandedPolicyIds.has(policy.id);
                const policyObs = observationsByPolicy.get(policy.id) || [];
                const hasSelectedInPolicy = policyObs.some((o) => selectedObsIds.has(o.id));

                return (
                  <div
                    key={policy.id}
                    className={`bg-white rounded-xl border transition-all shadow-xs overflow-hidden ${
                      isExpanded
                        ? "border-emerald-300 ring-1 ring-emerald-200"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Policy Card Header */}
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {/* Policy Code Badge */}
                          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex flex-col items-center justify-center shrink-0 font-bold">
                            <span className="text-xs tracking-wider font-mono">{policy.code}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 mt-0.5" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                {policy.title}
                              </h2>
                              <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {policy.departmentCategory || "سياسة عامة"}
                              </span>
                              <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                {policyObs.length} ملاحظة قياسية
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{policy.guidelineChapter}</span>
                            </p>
                          </div>
                        </div>

                        {/* Actions for the Policy */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {/* Add entire policy package to Round / Meeting */}
                          <button
                            onClick={() => handleOpenActionForPolicy(policy)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
                            title="إدراج كافة ملاحظات وتوصيات هذه السياسة في تقرير مرور أو اجتماع"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>إدراج بنود السياسة ({policyObs.length})</span>
                          </button>

                          {/* Toggle Expand / Collapse */}
                          <button
                            onClick={() => togglePolicyExpanded(policy.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                          >
                            <span>{isExpanded ? "طي التفاصيل" : "استعراض البنود والملاحظات"}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Policy Summary */}
                      <div className="mt-3 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        <p>{policy.summary}</p>
                      </div>
                    </div>

                    {/* Policy Expanded Content: Mandatory Requirements + Observations List */}
                    {isExpanded && (
                      <div className="bg-slate-50/70 border-t border-emerald-100 p-4 sm:p-6 space-y-6">
                        {/* Scope & Key Mandatory Requirements */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {/* Scope */}
                          <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-2">
                            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>نطاق تطبيق السياسة (Scope):</span>
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {policy.scope}
                            </p>
                          </div>

                          {/* Key Requirements (المتطلبات الإلزامية بالدليل القومي) */}
                          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-4 space-y-2.5">
                            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>المتطلبات والبنود الإلزامية طبقاً للدليل القومي 2020:</span>
                            </h4>
                            <ul className="space-y-1.5 text-xs text-slate-700">
                              {policy.keyRequirements.map((req, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold text-2xs flex items-center justify-center shrink-0 mt-0.5">
                                    {idx + 1}
                                  </span>
                                  <span className="leading-relaxed">{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Observations List under this Policy */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                              <ClipboardCheck className="w-4 h-4 text-emerald-700" />
                              <span>الملاحظات الميدانية القياسية والإجراءات التصحيحية المرتبطة بهذه السياسة ({policyObs.length})</span>
                            </h4>

                            {policyObs.length > 0 && (
                              <button
                                onClick={() => {
                                  const ids = policyObs.map((o) => o.id);
                                  const allSel = ids.every((id) => selectedObsIds.has(id));
                                  setSelectedObsIds((prev) => {
                                    const next = new Set(prev);
                                    ids.forEach((id) => (allSel ? next.delete(id) : next.add(id)));
                                    return next;
                                  });
                                }}
                                className="text-xs text-emerald-700 hover:underline font-semibold"
                              >
                                {policyObs.every((o) => selectedObsIds.has(o.id))
                                  ? "إلغاء تحديد ملاحظات هذه السياسة"
                                  : "تحديد كل ملاحظات هذه السياسة"}
                              </button>
                            )}
                          </div>

                          {policyObs.length === 0 ? (
                            <div className="bg-white rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
                              لا توجد ملاحظات ميدانية مسجلة حالياً لهذه السياسة. يمكنك إضافة ملاحظة مخصصة وربطها بها عبر زر «إضافة ملاحظة جديدة».
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                              {policyObs.map((obs) => {
                                const isSelected = selectedObsIds.has(obs.id);
                                return (
                                  <div
                                    key={obs.id}
                                    className={`bg-white rounded-lg border p-4 transition-all space-y-3 relative ${
                                      isSelected
                                        ? "border-blue-400 bg-blue-50/30 ring-1 ring-blue-300"
                                        : "border-slate-200 hover:border-blue-300 hover:shadow-xs"
                                    }`}
                                  >
                                    {/* Observation Top Bar */}
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => toggleObsSelect(obs.id)}
                                          className="text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                                        >
                                          {isSelected ? (
                                            <CheckSquare className="w-4 h-4 text-blue-600" />
                                          ) : (
                                            <Square className="w-4 h-4" />
                                          )}
                                        </button>
                                        <span className="text-xs font-bold text-slate-800">
                                          {obs.location}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        {obs.severity === "critical" && (
                                          <span className="px-2 py-0.5 rounded text-2xs font-bold bg-red-100 text-red-800 border border-red-200">
                                            حرج جداً
                                          </span>
                                        )}
                                        {obs.severity === "high" && (
                                          <span className="px-2 py-0.5 rounded text-2xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                            عالي
                                          </span>
                                        )}
                                        {obs.severity === "medium" && (
                                          <span className="px-2 py-0.5 rounded text-2xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                            متوسط
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Observation text */}
                                    <div className="text-xs text-slate-800 leading-relaxed">
                                      <span className="font-semibold text-red-700">الملاحظة السلبية: </span>
                                      {obs.observation}
                                    </div>

                                    {/* Recommendation */}
                                    <div className="text-xs text-slate-700 leading-relaxed bg-emerald-50/50 p-2 rounded border border-emerald-100">
                                      <span className="font-semibold text-emerald-800">الإجراء التصحيحي: </span>
                                      {obs.recommendation}
                                    </div>

                                    {/* Metadata & Actions */}
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
                                      <div className="flex items-center gap-3">
                                        <span>المسؤول: {obs.responsible}</span>
                                        <span>المهلة: {obs.duration}</span>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        <button
                                          onClick={() => handleCopyText(
                                            `المكان: ${obs.location}\nالملاحظة: ${obs.observation}\nالتوصية: ${obs.recommendation}\nالمسؤول: ${obs.responsible}\nالسياسة: ${policy.title}`,
                                            "الملاحظة"
                                          )}
                                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                                          title="نسخ"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleOpenActionForObs(obs)}
                                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold transition-colors"
                                        >
                                          <Send className="w-3 h-3" />
                                          <span>إدراج</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: OBSERVATIONS LIST VIEW (قائمة الملاحظات الميدانية الشاملة)          */}
      {/* ========================================================================= */}
      {activeBankTab === "observations" && (
        <div className="space-y-4">
          {filteredObservations.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <Search className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">لم يتم العثور على ملاحظات تطابق معايير البحث</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                جرب تغيير كلمات البحث أو اختيار سياسة أو قسم آخر.
              </p>
              <button
                onClick={() => { setSearch(""); setSelectedPolicyId("all"); setSelectedCategory("الكل"); setSelectedSeverity("all"); }}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredObservations.map((obs) => {
                const isSelected = selectedObsIds.has(obs.id);
                const policy = getPolicyById(obs.policyId || "pol-hh");

                return (
                  <div
                    key={obs.id}
                    className={`bg-white rounded-xl border p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between gap-4 ${
                      isSelected
                        ? "border-blue-400 bg-blue-50/30 ring-1 ring-blue-300"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Header: Policy Badge + Location + Severity */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => toggleObsSelect(obs.id)}
                            className="text-slate-400 hover:text-blue-600 transition-colors mt-0.5 shrink-0"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {policy && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                                  <span>{policy.code}: {policy.shortTitle}</span>
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                {obs.category}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">
                              {obs.location}
                            </h3>
                          </div>
                        </div>

                        {/* Severity Badge */}
                        <div className="shrink-0">
                          {obs.severity === "critical" && (
                            <span className="px-2 py-0.5 rounded text-2xs font-bold bg-red-100 text-red-800 border border-red-200">
                              حرج جداً
                            </span>
                          )}
                          {obs.severity === "high" && (
                            <span className="px-2 py-0.5 rounded text-2xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              عالي
                            </span>
                          )}
                          {obs.severity === "medium" && (
                            <span className="px-2 py-0.5 rounded text-2xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              متوسط
                            </span>
                          )}
                          {obs.severity === "low" && (
                            <span className="px-2 py-0.5 rounded text-2xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              منخفض
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Observation Text - Clickable to insert into round form */}
                      <div
                        onClick={() => handleOpenActionForObs(obs)}
                        className="bg-red-50/40 hover:bg-red-50/80 p-3 rounded-lg border border-red-100 text-xs sm:text-sm text-slate-800 leading-relaxed cursor-pointer transition-colors group"
                        title="انقر لفتح نافذة إدراج هذه الملاحظة في نموذج المرور الميداني"
                      >
                        <div className="flex items-center justify-between gap-1 font-bold text-red-800 mb-1">
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                            <span>الملاحظة السلبية / المخالفة:</span>
                          </span>
                          <span className="text-3xs font-normal text-red-600 bg-white/80 px-1.5 py-0.5 rounded border border-red-200/60 opacity-0 group-hover:opacity-100 transition-opacity">
                            انقر للإدراج بنموذج المرور 📋
                          </span>
                        </div>
                        <p>{obs.observation}</p>
                      </div>

                      {/* Recommendation - Clickable to insert into round form */}
                      <div
                        onClick={() => handleOpenActionForObs(obs)}
                        className="bg-emerald-50/40 hover:bg-emerald-50/80 p-3 rounded-lg border border-emerald-100 text-xs sm:text-sm text-slate-800 leading-relaxed cursor-pointer transition-colors group"
                        title="انقر لفتح نافذة إدراج هذه الملاحظة في نموذج المرور الميداني"
                      >
                        <div className="flex items-center justify-between gap-1 font-bold text-emerald-800 mb-1">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>الإجراء التصحيحي والتوصية:</span>
                          </span>
                          <span className="text-3xs font-normal text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded border border-emerald-200/60 opacity-0 group-hover:opacity-100 transition-opacity">
                            انقر للإدراج بنموذج المرور 📋
                          </span>
                        </div>
                        <p>{obs.recommendation}</p>
                      </div>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 gap-2 text-2xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                        <div>
                          <span className="text-slate-400">المسؤول: </span>
                          <span className="font-semibold text-slate-700">{obs.responsible}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">المهلة: </span>
                          <span className="font-semibold text-slate-700">{obs.duration}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400">طريقة المتابعة: </span>
                          <span className="text-slate-700">{obs.monitoringMethod}</span>
                        </div>
                        {(obs.egyptianGuidelineRef || obs.standardRef) && (
                          <div className="col-span-2 text-slate-500 pt-1 border-t border-slate-200/60 font-mono text-3xs truncate">
                            مرجع: {obs.egyptianGuidelineRef || obs.standardRef}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleCopyText(
                          `الموقع: ${obs.location}\nالملاحظة: ${obs.observation}\nالتوصية: ${obs.recommendation}\nالمسؤول: ${obs.responsible}\nالسياسة: ${obs.policyName || ""}`,
                          "الملاحظة والتوصية"
                        )}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>نسخ النص</span>
                      </button>

                      <button
                        onClick={() => handleOpenActionForObs(obs)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>إدراج في مرور أو اجتماع</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MEETING TOPICS VIEW (موضوعات وأجندات الاجتماعات السنوية)             */}
      {/* ========================================================================= */}
      {activeBankTab === "topics" && (
        <div className="space-y-4">
          {filteredTopics.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <Search className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">لم يتم العثور على موضوعات تطابق معايير البحث</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                جرب كتابة كلمات بحث أخرى مثل اسم القسم أو كلمة مفتاحية.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTopics.map((topic) => {
                const isSelected = selectedTopicIds.has(topic.id);

                return (
                  <div
                    key={topic.id}
                    className={`bg-white rounded-xl border p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between gap-4 ${
                      isSelected
                        ? "border-purple-400 bg-purple-50/30 ring-1 ring-purple-300"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => toggleTopicSelect(topic.id)}
                            className="text-slate-400 hover:text-purple-600 transition-colors mt-0.5 shrink-0"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-purple-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>

                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                              {topic.category}
                            </span>
                            <h3 className="text-base font-bold text-slate-900">
                              {topic.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {topic.description}
                      </p>

                      {/* Agenda Items */}
                      <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                        <h4 className="text-2xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <FileText className="w-3 h-3 text-purple-600" />
                          <span>بنود جدول الأعمال المقترحة:</span>
                        </h4>
                        <ul className="space-y-1 text-xs text-slate-600">
                          {topic.agenda.slice(0, 3).map((a, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-purple-500 font-bold">•</span>
                              <span className="leading-snug">{a}</span>
                            </li>
                          ))}
                          {topic.agenda.length > 3 && (
                            <li className="text-2xs text-purple-700 font-semibold pt-1">
                              +{topic.agenda.length - 3} بنود إضافية...
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleCopyText(
                          `الموضوع: ${topic.title}\nالوصف: ${topic.description}\nجدول الأعمال:\n${topic.agenda.join("\n")}`,
                          "موضوع الاجتماع"
                        )}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>نسخ الأجندة</span>
                      </button>

                      <button
                        onClick={() => handleOpenActionForTopic(topic)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-2xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>إدراج في اجتماع شهري</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: UNIFIED ALL VIEW (البحث الشامل والموحد)                             */}
      {/* ========================================================================= */}
      {activeBankTab === "all" && (
        <div className="space-y-6">
          {/* Section 1: Matching Policies */}
          {filteredPolicies.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>سياسات مكافحة العدوى المتطابقة ({filteredPolicies.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {filteredPolicies.slice(0, 6).map((p) => (
                  <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-emerald-100 text-emerald-800">
                        {p.code}
                      </span>
                      <span className="text-2xs text-slate-500">{(observationsByPolicy.get(p.id) || []).length} ملاحظة</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{p.shortTitle}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{p.summary}</p>
                    <button
                      onClick={() => { setSelectedPolicyId(p.id); setActiveBankTab("observations"); }}
                      className="text-xs text-emerald-700 hover:underline font-semibold pt-1 flex items-center gap-1"
                    >
                      <span>استعراض الملاحظات</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Observations */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
              <span>ملاحظات المرور الميداني ({filteredObservations.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredObservations.slice(0, 6).map((obs) => (
                <div key={obs.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{obs.location}</span>
                    <button
                      onClick={() => handleOpenActionForObs(obs)}
                      className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
                    >
                      إدراج
                    </button>
                  </div>
                  <p className="text-xs text-slate-700">{obs.observation}</p>
                </div>
              ))}
            </div>
            {filteredObservations.length > 6 && (
              <button
                onClick={() => setActiveBankTab("observations")}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                عرض كافة الملاحظات ({filteredObservations.length})...
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESTINATION SELECTION MODAL (نافذة إدراج الملاحظات في نموذج المرور والتقارير)  */}
      {/* ========================================================================= */}
      {actionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">إدراج في نموذج المرور / الاجتماع</h3>
                  <p className="text-2xs text-indigo-200">اختر وجهة إدراج الملاحظة المحددة</p>
                </div>
              </div>
              <button
                onClick={() => setActionItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100 space-y-1">
                <div className="flex items-center gap-1.5 text-2xs font-bold text-indigo-700">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>الملاحظة / العنصر المحدد للإدراج:</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {actionItem.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-3">
                  {actionItem.description}
                </p>
              </div>

              {/* Option 1: Round Report (PRIMARY FOCUS) */}
              <div className="space-y-2.5 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                <h4 className="text-xs font-bold text-blue-900 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-blue-600" />
                  <span>1. نموذج المرور الميداني (تقرير المرور):</span>
                </h4>

                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={() => handleExecuteAction("new_round")}
                    className="w-full text-right p-3.5 rounded-xl border-2 border-blue-500 bg-white hover:bg-blue-50 hover:border-blue-600 transition-all flex items-center justify-between group shadow-xs cursor-pointer active:scale-98"
                  >
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm font-bold text-blue-950 group-hover:text-blue-900 flex items-center gap-1.5">
                        <PlusCircle className="w-4 h-4 text-blue-600" />
                        <span>إنشاء وتعبئة نموذج مرور ميداني جديد</span>
                      </div>
                      <div className="text-2xs text-slate-500">
                        فتح نموذج المرور فوراً مع إدراج الملاحظة والتوصية والمسؤول تلقائياً
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
                  </button>

                  {rounds.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-2xs text-slate-600 font-bold block">
                        أو إضافتها لنموذج مرور مسجل مسبقاً:
                      </label>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {rounds.map((round) => (
                          <button
                            key={round.id}
                            onClick={() => handleExecuteAction("existing_round", round.id)}
                            className="w-full text-right p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-between text-xs cursor-pointer group"
                          >
                            <span className="font-semibold text-slate-800 truncate group-hover:text-blue-900">
                              {round.title} ({round.day} - {round.date})
                            </span>
                            <span className="text-2xs text-blue-700 font-bold shrink-0 mr-2 bg-blue-100/60 px-2 py-0.5 rounded">
                              {round.observations.length} ملاحظات حالياً
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Option 2: Meeting Minutes */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>2. محضر اجتماع لجنة مكافحة العدوى:</span>
                </h4>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => handleExecuteAction("new_meeting")}
                    className="w-full text-right p-3 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 hover:border-purple-300 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-purple-950 group-hover:text-purple-900">
                        إنشاء محضر اجتماع شهري جديد
                      </div>
                      <div className="text-2xs text-purple-700">
                        تضمين البند في جدول الأعمال وصياغة قرار تنفيذي وتوصية تلقائية
                      </div>
                    </div>
                    <PlusCircle className="w-4 h-4 text-purple-600 shrink-0" />
                  </button>

                  {meetings.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <label className="text-2xs text-slate-500 font-semibold block">
                        أو إضافتها لاجتماع شهري مسجل مسبقاً:
                      </label>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {meetings.map((meeting) => (
                          <button
                            key={meeting.id}
                            onClick={() => handleExecuteAction("existing_meeting", meeting.id)}
                            className="w-full text-right p-2.5 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-slate-50 transition-all flex items-center justify-between text-xs cursor-pointer"
                          >
                            <span className="font-semibold text-slate-800 truncate">
                              الاجتماع رقم ({meeting.meetingNumber}) - {meeting.date}
                            </span>
                            <span className="text-2xs text-slate-500 shrink-0 mr-2">
                              {meeting.decisions.length} قرارات
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD CUSTOM OBSERVATION                                             */}
      {/* ========================================================================= */}
      {showAddObsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-scaleUp">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">إضافة ملاحظة وتوصية قياسية جديدة للبنك</h3>
              </div>
              <button
                onClick={() => setShowAddObsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomObservation} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">سياسة مكافحة العدوى المعتمدة (الدليل القومي 2020)*</label>
                <select
                  value={newObsForm.policyId}
                  onChange={(e) => setNewObsForm({ ...newObsForm, policyId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {EGYPTIAN_INSPECTION_CONTROL_POLICIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code}: {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">القسم / الوحدة*</label>
                  <input
                    type="text"
                    value={newObsForm.category}
                    onChange={(e) => setNewObsForm({ ...newObsForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="مثال: عيادة الرمد، التعقيم المركزي..."
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">الموقع الدقيق / الجهاز*</label>
                  <input
                    type="text"
                    value={newObsForm.location}
                    onChange={(e) => setNewObsForm({ ...newObsForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="مثال: مصباح الشق، حوض غسيل الأيدي..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">نص الملاحظة السلبية / المخالفة*</label>
                <textarea
                  value={newObsForm.observation}
                  onChange={(e) => setNewObsForm({ ...newObsForm, observation: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="وصف الملاحظة المرصودة بدقة..."
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">الإجراء التصحيحي / التوصية*</label>
                <textarea
                  value={newObsForm.recommendation}
                  onChange={(e) => setNewObsForm({ ...newObsForm, recommendation: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="التوصية والإجراء السليم وفق المعايير..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">المسؤول عن التنفيذ</label>
                  <input
                    type="text"
                    value={newObsForm.responsible}
                    onChange={(e) => setNewObsForm({ ...newObsForm, responsible: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">المهلة الزمنية</label>
                  <input
                    type="text"
                    value={newObsForm.duration}
                    onChange={(e) => setNewObsForm({ ...newObsForm, duration: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">درجة الخطورة</label>
                  <select
                    value={newObsForm.severity}
                    onChange={(e) => setNewObsForm({ ...newObsForm, severity: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="critical">حرج جداً</option>
                    <option value="high">عالي الخطورة</option>
                    <option value="medium">متوسط</option>
                    <option value="low">منخفض</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddObsModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 shadow-xs"
                >
                  حفظ في البنك
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
