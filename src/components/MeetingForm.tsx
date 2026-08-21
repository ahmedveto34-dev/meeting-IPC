import React, { useState } from "react";
import {
  Save,
  ArrowRight,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  Download,
  FileDown,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Tag,
  CheckSquare,
  Filter,
} from "lucide-react";
import { CenterSettings, Meeting, MeetingDecision, Member, PerformanceIndicator, RoundReport, MeetingTopic } from "../types";
import { MONTHLY_TEMPLATES } from "../data/monthlyTemplates";
import { STANDARD_OBSERVATIONS_LIBRARY } from "../data/standardObservations";
import { TopicsPickerModal } from "./TopicsPickerModal";

interface MeetingFormProps {
  initialMeeting?: Meeting | null;
  centerSettings: CenterSettings;
  availableRounds: RoundReport[];
  availableTopics?: MeetingTopic[];
  onSave: (meeting: Meeting) => void;
  onCancel: () => void;
  onOpenAiHelper?: () => void;
}

export const MeetingForm: React.FC<MeetingFormProps> = ({
  initialMeeting,
  centerSettings,
  availableRounds,
  availableTopics = [],
  onSave,
  onCancel,
  onOpenAiHelper,
}) => {
  // Form State
  const [meetingNumber, setMeetingNumber] = useState<string>(
    initialMeeting ? String(initialMeeting.meetingNumber) : "1"
  );
  const [day, setDay] = useState<string>(initialMeeting?.day || "الأحد");
  const [date, setDate] = useState<string>(
    initialMeeting?.date || new Date().toISOString().split("T")[0].replace(/-/g, "/")
  );
  const [time, setTime] = useState<string>(initialMeeting?.time || "11:00 صباحاً");
  const [location, setLocation] = useState<string>(
    initialMeeting?.location || "قاعة اجتماعات الإدارة الطبية"
  );
  const [centerName, setCenterName] = useState<string>(
    initialMeeting?.centerName || centerSettings.centerName
  );
  const [departmentTitle, setDepartmentTitle] = useState<string>(
    initialMeeting?.departmentTitle || centerSettings.departmentTitle || "لجنة مكافحة العدوى"
  );

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    initialMeeting?.monthThemeKey || ""
  );
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [isTopicsPickerOpen, setIsTopicsPickerOpen] = useState<boolean>(false);
  const [importedTopicTitles, setImportedTopicTitles] = useState<string[]>([]);

  // Attendees
  const [members, setMembers] = useState<Member[]>(
    initialMeeting?.members || centerSettings.defaultMembers
  );

  // Agenda
  const [agenda, setAgenda] = useState<string[]>(() => {
    if (initialMeeting?.agenda && initialMeeting.agenda.length > 0) {
      // Ensure 'ما لم يتم إنجازه من الاجتماع السابق' is present as the first item if not already
      const hasPrior = initialMeeting.agenda.some((a) =>
        a.includes("ما لم يتم إنجازه")
      );
      if (hasPrior) {
        // Move it to index 0
        const withoutPrior = initialMeeting.agenda.filter(
          (a) => !a.includes("ما لم يتم إنجازه")
        );
        const priorItem = initialMeeting.agenda.find((a) =>
          a.includes("ما لم يتم إنجازه")
        )!;
        return [priorItem, ...withoutPrior];
      }
      return ["ما لم يتم إنجازه من الاجتماع السابق", ...initialMeeting.agenda];
    }
    return [
      "ما لم يتم إنجازه من الاجتماع السابق",
      "مراجعة تقرير المرور الميداني الأخير وملاحظات الأقسام",
      "متابعة الالتزام بغسيل الأيدي وتوفر المستلزمات",
      "تقييم إجراءات مكافحة العدوى ونظافة الأجهزة",
    ];
  });
  const [newAgendaItem, setNewAgendaItem] = useState<string>("");

  // Previous meeting
  const [previousMeetingDate, setPreviousMeetingDate] = useState<string>(
    initialMeeting?.previousMeetingDate || ""
  );
  const [previousMeetingFollowUp, setPreviousMeetingFollowUp] = useState<string>(
    initialMeeting?.previousMeetingFollowUp || ""
  );

  // KPIs
  const [kpis, setKpis] = useState<PerformanceIndicator[]>(
    initialMeeting?.kpis || [
      { id: "kpi-1", name: "معدل الالتزام بغسل الأيدي", value: "%75", target: "%85" },
      { id: "kpi-2", name: "معدل تطهير الأجهزة والأسطح", value: "%85", target: "%95" },
    ]
  );

  // Decisions
  const [decisions, setDecisions] = useState<MeetingDecision[]>(
    initialMeeting?.decisions || []
  );

  // Approvals
  const [preparedBy, setPreparedBy] = useState<string>(
    initialMeeting?.approvals?.preparedBy || centerSettings.nursingSupervisor || "مشرف التمريض"
  );
  const [infectionControlLead, setInfectionControlLead] = useState<string>(
    initialMeeting?.approvals?.infectionControlLead ||
      centerSettings.infectionControlLead ||
      "مسؤول مكافحة العدوى"
  );
  const [medicalDirector, setMedicalDirector] = useState<string>(
    initialMeeting?.approvals?.medicalDirector ||
      centerSettings.medicalDirector ||
      "المدير الطبي"
  );

  // UI helpers
  const [selectedRoundToImport, setSelectedRoundToImport] = useState<string>("");

  // Handler: Apply Monthly Template Preset
  const handleApplyMonthTemplate = (monthKey: string) => {
    const tmpl = MONTHLY_TEMPLATES.find((t) => t.key === monthKey);
    if (!tmpl) return;

    if (
      decisions.length > 0 &&
      !window.confirm(
        `هل تريد تطبيق موضوعات وقرارات "${tmpl.monthName}"؟ سيتم إضافة بنود جدول الأعمال والقرارات المقترحة لهذا الشهر.`
      )
    ) {
      return;
    }

    setSelectedMonthKey(monthKey);
    setAgenda(tmpl.agenda);
    setKpis(
      tmpl.defaultKpis.map((k, idx) => ({
        id: `kpi-${Date.now()}-${idx}`,
        name: k.name,
        value: k.value,
        target: k.target,
      }))
    );

    setDecisions(
      tmpl.sampleDecisions.map((d, idx) => ({
        id: `dec-${Date.now()}-${idx}`,
        topic: d.topic,
        decision: d.decision,
        responsible: d.responsible,
        duration: d.duration,
        monitoringMethod: d.monitoringMethod,
        status: "in_progress",
      }))
    );
  };

  // Handler: Batch Import multiple topics from TopicsPickerModal
  const handleImportTopicsBatch = (
    selectedTopics: MeetingTopic[],
    options: {
      mode: "append" | "replace";
      importAgenda: boolean;
      importKpis: boolean;
      importDecisions: boolean;
    }
  ) => {
    if (selectedTopics.length === 0) return;

    const newAgendaItems: string[] = [];
    const newKpiItems: PerformanceIndicator[] = [];
    const newDecisionItems: MeetingDecision[] = [];
    const newTopicTitles: string[] = [];

    selectedTopics.forEach((topic, tIdx) => {
      newTopicTitles.push(topic.title);

      // 1. Agenda
      if (options.importAgenda && topic.agenda) {
        topic.agenda.forEach((item) => {
          if (!newAgendaItems.includes(item)) {
            newAgendaItems.push(item);
          }
        });
      }

      // 2. KPIs
      if (options.importKpis && topic.kpis) {
        topic.kpis.forEach((kpi, kIdx) => {
          newKpiItems.push({
            id: `kpi-${Date.now()}-${tIdx}-${kIdx}`,
            name: kpi.name,
            value: kpi.value,
            target: kpi.target,
          });
        });
      }

      // 3. Decisions & Recommendations
      if (options.importDecisions && topic.sampleDecisions) {
        topic.sampleDecisions.forEach((dec, dIdx) => {
          newDecisionItems.push({
            id: `dec-${Date.now()}-${tIdx}-${dIdx}`,
            topic: dec.topic,
            decision: dec.decision,
            responsible: dec.responsible,
            duration: dec.duration,
            monitoringMethod: dec.monitoringMethod,
            status: "in_progress",
          });
        });
      }
    });

    if (options.mode === "replace") {
      setAgenda(newAgendaItems.length > 0 ? newAgendaItems : agenda);
      if (newKpiItems.length > 0) setKpis(newKpiItems);
      if (newDecisionItems.length > 0) setDecisions(newDecisionItems);
      setImportedTopicTitles(newTopicTitles);
    } else {
      // Append mode (merge non-destructively)
      if (newAgendaItems.length > 0) {
        setAgenda((prev) => Array.from(new Set([...prev, ...newAgendaItems])));
      }
      if (newKpiItems.length > 0) {
        setKpis((prev) => {
          const existingNames = new Set(prev.map((k) => k.name.trim()));
          const filteredNew = newKpiItems.filter((k) => !existingNames.has(k.name.trim()));
          return [...prev, ...filteredNew];
        });
      }
      if (newDecisionItems.length > 0) {
        setDecisions((prev) => [...prev, ...newDecisionItems]);
      }
      setImportedTopicTitles((prev) => Array.from(new Set([...prev, ...newTopicTitles])));
    }
  };

  // Handler: Quick Append a Single Topic to Meeting
  const handleQuickAppendTopic = (topic: MeetingTopic) => {
    handleImportTopicsBatch([topic], {
      mode: "append",
      importAgenda: true,
      importKpis: true,
      importDecisions: true,
    });
  };

  // Handler: Apply Topic from Topics Library dropdown (Single)
  const handleApplyTopicFromLibrary = (topicId: string) => {
    const topic = availableTopics.find((t) => t.id === topicId);
    if (!topic) return;

    handleQuickAppendTopic(topic);
    setSelectedTopicId(topicId);
  };

  // Handler: Import Observations from a Round Report
  const handleImportFromRound = (roundId: string) => {
    const round = availableRounds.find((r) => r.id === roundId);
    if (!round) return;

    const importedDecisions: MeetingDecision[] = round.observations.map((obs, idx) => ({
      id: `dec-imp-${Date.now()}-${idx}`,
      topic: `${obs.location}: ${obs.observation}`,
      decision: obs.recommendation,
      responsible: obs.responsible || "مشرف التمريض",
      duration: "3 أيام",
      monitoringMethod: "المرور الميداني",
      status: obs.status,
    }));

    // Append to decisions & agenda
    const newAgendaFromRound = round.observations.map((o) => o.observation);
    setAgenda((prev) => Array.from(new Set([...prev, ...newAgendaFromRound])));
    setDecisions((prev) => [...prev, ...importedDecisions]);
    setSelectedRoundToImport("");
    alert(`تم استيراد ${round.observations.length} ملاحظة وتوصية بنجاح إلى جدول الأعمال والقرارات!`);
  };

  // Agenda manipulation
  const handleAddAgendaItem = () => {
    if (!newAgendaItem.trim()) return;
    setAgenda([...agenda, newAgendaItem.trim()]);
    setNewAgendaItem("");
  };

  const handleRemoveAgendaItem = (idx: number) => {
    setAgenda(agenda.filter((_, i) => i !== idx));
  };

  // Decision manipulation
  const handleAddDecision = () => {
    const newDec: MeetingDecision = {
      id: `dec-${Date.now()}`,
      topic: "",
      decision: "",
      responsible: "مشرف التمريض",
      duration: "3 أيام",
      monitoringMethod: "المرور",
      status: "in_progress",
    };
    setDecisions([...decisions, newDec]);
  };

  const handleUpdateDecision = (
    id: string,
    field: keyof MeetingDecision,
    value: string
  ) => {
    setDecisions(
      decisions.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleRemoveDecision = (id: string) => {
    setDecisions(decisions.filter((d) => d.id !== id));
  };

  // Member manipulation
  const handleAddMember = () => {
    const newMem: Member = {
      id: `mem-${Date.now()}`,
      name: "",
      role: "",
      attended: true,
      signatureNote: "تم التوقيع",
    };
    setMembers([...members, newMem]);
  };

  const handleUpdateMember = (id: string, field: keyof Member, value: any) => {
    setMembers(
      members.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  // KPI manipulation
  const handleAddKpi = () => {
    setKpis([
      ...kpis,
      {
        id: `kpi-${Date.now()}`,
        name: "مؤشر جديد",
        value: "%80",
        target: "%90",
      },
    ]);
  };

  const handleUpdateKpi = (id: string, field: keyof PerformanceIndicator, value: string) => {
    setKpis(kpis.map((k) => (k.id === id ? { ...k, [field]: value } : k)));
  };

  const handleRemoveKpi = (id: string) => {
    setKpis(kpis.filter((k) => k.id !== id));
  };

  // Final Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!meetingNumber.trim()) {
      alert("يرجى إدخال رقم الاجتماع");
      return;
    }

    const meetingToSave: Meeting = {
      id: initialMeeting?.id || `meeting-${Date.now()}`,
      meetingNumber: meetingNumber.trim(),
      day: day.trim() || "الأحد",
      date: date.trim() || new Date().toISOString().split("T")[0],
      time,
      location,
      centerName: centerName.trim() || centerSettings.centerName,
      departmentTitle: departmentTitle.trim() || "لجنة مكافحة العدوى",
      members,
      agenda: agenda.filter((a) => a.trim().length > 0),
      previousMeetingDate: previousMeetingDate.trim() || undefined,
      previousMeetingFollowUp: previousMeetingFollowUp.trim() || undefined,
      kpis,
      decisions: decisions.filter((d) => d.topic.trim().length > 0 || d.decision.trim().length > 0),
      approvals: {
        preparedBy,
        infectionControlLead,
        medicalDirector,
      },
      monthThemeKey: selectedMonthKey,
      createdAt: initialMeeting?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(meetingToSave);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
        {/* Top Action Header */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 sticky top-16 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>إلغاء</span>
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialMeeting ? `تعديل اجتماع رقم (${meetingNumber})` : "إنشاء اجتماع لجنة شهري جديد"}
            </h2>
            <p className="text-xs text-slate-500">
              تحديد جدول الأعمال والأعضاء والقرارات والتوصيات المعتمدة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAiHelper && (
            <button
              type="button"
              onClick={onOpenAiHelper}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>اقتراح ذكي (AI)</span>
            </button>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>حفظ ومتابعة المعاينة والتصدير</span>
          </button>
        </div>
      </div>

      {/* 1. Theme / Topic Presets Selector & Massive Library Picker */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                مكتبة موضوعات مكافحة العدوى للاجتماع الشهري
              </h3>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {availableTopics.length} موضوعاً متاحاً
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              الاجتماع الشهري يتكون من عدة موضوعات وملاحظات؛ يمكنك اختيار عدة موضوعات دفعة واحدة ونقلها مباشرة لمحضر الاجتماع
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Primary Button: Open Massive Topic Picker Modal */}
            <button
              type="button"
              onClick={() => setIsTopicsPickerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>تصفح واختيار عدة موضوعات للمحضر</span>
            </button>

            {/* Quick Single Dropdown */}
            {availableTopics.length > 0 && (
              <div className="w-full sm:w-auto">
                <select
                  value={selectedTopicId}
                  onChange={(e) => handleApplyTopicFromLibrary(e.target.value)}
                  className="w-full sm:w-auto bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">+ إضافة موضوع فردي سريع...</option>
                  {availableTopics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      [{topic.category}] {topic.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Monthly Plan Selector (Themed Focus Preset) */}
            <div className="w-full sm:w-auto">
              <select
                value={selectedMonthKey}
                onChange={(e) => handleApplyMonthTemplate(e.target.value)}
                className="w-full sm:w-auto bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-3 py-2 shadow-2xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="">محور الخطة السنوية (اختياري)...</option>
                {MONTHLY_TEMPLATES.map((tmpl) => (
                  <option key={tmpl.key} value={tmpl.key}>
                    محور: {tmpl.monthName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Horizontal Topic Pills for Fast 1-Click Addition */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>موضوعات شائعة للإضافة الفورية للمحضر بنقرة واحدة:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {availableTopics.slice(0, 6).map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleQuickAppendTopic(topic)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 rounded-lg text-slate-700 text-xs font-medium whitespace-nowrap transition-all"
                title={`إضافة موضوع "${topic.title}" وملاحظاته وقراراته للمحضر`}
              >
                <Plus className="w-3 h-3 text-blue-600" />
                <span>{topic.title.length > 28 ? topic.title.slice(0, 28) + "..." : topic.title}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsTopicsPickerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold whitespace-nowrap shadow-2xs transition-colors cursor-pointer"
              title="تصفح كافة موضوعات مكافحة العدوى ونقلها بمرونة للمحضر"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>
                {availableTopics.length > 6
                  ? `المزيد (${availableTopics.length - 6}+) ...`
                  : `تصفح المكتبة (${availableTopics.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* Imported Topics Badges in this Meeting */}
        {importedTopicTitles.length > 0 && (
          <div className="bg-emerald-50/70 rounded-lg p-3 border border-emerald-200 text-xs">
            <div className="font-bold text-emerald-900 mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>الموضوعات المضمنة في هذا المحضر ({importedTopicTitles.length}):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {importedTopicTitles.map((title, idx) => (
                <span
                  key={idx}
                  className="bg-white border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded-md font-medium text-[11px] shadow-2xs"
                >
                  {title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Selected Theme/Topic Details Banner */}
        {(() => {
          const matchedTopic = availableTopics.find((t) => t.id === selectedTopicId);
          const currentTmpl = MONTHLY_TEMPLATES.find((t) => t.key === selectedMonthKey);
          const summaryText = matchedTopic?.description || currentTmpl?.focusSummary;
          if (!summaryText) return null;
          return (
            <div className="bg-blue-50/60 rounded-md p-3 border border-blue-100 text-xs text-slate-700 flex items-start gap-2">
              <span className="font-bold text-blue-900 shrink-0">المحور ونطاق التركيز:</span>
              <span className="leading-relaxed">{summaryText}</span>
            </div>
          );
        })()}
      </div>

      {/* 2. Import from Rounds Option (استيراد من جولات المرور) */}
      {availableRounds.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                استيراد الملاحظات والتوصيات من تقارير المرور الميداني
              </h4>
              <p className="text-xs text-slate-500">
                يمكنك تضمين ملاحظات جولة مرور أسبوعية محددة مباشرة في جدول أعمال وقرارات هذا الاجتماع
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedRoundToImport}
              onChange={(e) => setSelectedRoundToImport(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-xs rounded-md px-3 py-1.5 grow sm:grow-0"
            >
              <option value="">-- اختر تقرير مرور لاستيراده --</option>
              {availableRounds.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.day} {r.date}) - {r.observations.length} ملاحظات
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedRoundToImport}
              onClick={() => handleImportFromRound(selectedRoundToImport)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap shadow-2xs"
            >
              استيراد
            </button>
          </div>
        </div>
      )}

      {/* 3. Basic Meeting Information */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-3">
          البيانات الأساسية للاجتماع
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اسم المركز الطبي / المستشفى
            </label>
            <input
              type="text"
              value={centerName}
              onChange={(e) => setCenterName(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-500"
              placeholder="مثال: Waheed IPC"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              رقم الاجتماع
            </label>
            <input
              type="text"
              value={meetingNumber}
              onChange={(e) => setMeetingNumber(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-500 font-bold"
              placeholder="مثال: 6"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اليوم</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-500"
            >
              <option value="السبت">السبت</option>
              <option value="الأحد">الأحد</option>
              <option value="الاثنين">الاثنين</option>
              <option value="الثلاثاء">الثلاثاء</option>
              <option value="الأربعبعاء">الأربعاء</option>
              <option value="الخميس">الخميس</option>
              <option value="الجمعة">الجمعة</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ</label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-500 font-medium"
              placeholder="2026/6/28"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              مقر الانعقاد / القاعة
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5"
              placeholder="قاعة اجتماعات الإدارة الطبية"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              وقت الانعقاد
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5"
              placeholder="11:00 صباحاً"
            />
          </div>
        </div>
      </div>

      {/* 4. Committee Members & Attendees */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              أعضاء اللجنة الحاضرون (جدول الحضور والتوقيعات)
            </h3>
            <p className="text-xs text-slate-500">
              قائمة الحضور الرسمية التي تظهر بأعلى المحضر
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddMember}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة عضو</span>
          </button>
        </div>

        <div className="space-y-3">
          {members.map((member, index) => (
            <div
              key={member.id || index}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center p-3 rounded-lg bg-slate-50 border border-slate-200"
            >
              <div className="sm:col-span-5">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => handleUpdateMember(member.id, "name", e.target.value)}
                  placeholder="الاسم واللقب (مثال: ا.د / احمد مصطفى)"
                  className="w-full text-xs sm:text-sm rounded-md border border-slate-300 p-2 font-bold"
                  required
                />
              </div>

              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={member.role}
                  onChange={(e) => handleUpdateMember(member.id, "role", e.target.value)}
                  placeholder="الوظيفة (مثال: المدير الطبى / مشرف التمريض)"
                  className="w-full text-xs sm:text-sm rounded-md border border-slate-300 p-2"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={member.signatureNote || ""}
                  onChange={(e) => handleUpdateMember(member.id, "signatureNote", e.target.value)}
                  placeholder="التوقيع (فارغ للتوقيع)"
                  className="w-full text-xs rounded-md border border-slate-300 p-2 text-center"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveMember(member.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                  title="حذف العضو"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Agenda Items (جدول الأعمال) */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span>جدول الأعمال (Agenda)</span>
              {agenda[0]?.includes("ما لم يتم إنجازه") && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  البند الأول: ما لم يتم إنجازه من الاجتماع السابق ✓
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              الموضوعات والمحاور والنقاط المطروحة للنقاش في هذا الاجتماع
            </p>
          </div>
          {!agenda[0]?.includes("ما لم يتم إنجازه") && (
            <button
              type="button"
              onClick={() => {
                const filtered = agenda.filter((a) => !a.includes("ما لم يتم إنجازه"));
                setAgenda(["ما لم يتم إنجازه من الاجتماع السابق", ...filtered]);
              }}
              className="text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>وضع (ما لم يتم إنجازه من الاجتماع السابق) كبند أول</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          {agenda.map((item, idx) => {
            const isFirstUnfinishedItem = idx === 0 && item.includes("ما لم يتم إنجازه");
            return (
              <div
                key={idx}
                className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border transition-all ${
                  isFirstUnfinishedItem
                    ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 grow">
                  <span
                    className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                      isFirstUnfinishedItem
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const copy = [...agenda];
                      copy[idx] = e.target.value;
                      setAgenda(copy);
                    }}
                    className={`w-full text-xs sm:text-sm bg-transparent border-0 focus:ring-0 font-medium ${
                      isFirstUnfinishedItem ? "text-emerald-950 font-bold" : "text-slate-800"
                    }`}
                  />
                  {isFirstUnfinishedItem && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded shrink-0 hidden sm:inline-block">
                      البند الافتتاحي
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAgendaItem(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="حذف هذا البند"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {/* Add Agenda Item Input */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newAgendaItem}
              onChange={(e) => setNewAgendaItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddAgendaItem();
                }
              }}
              placeholder="اكتب بنداً جديداً لجدول الأعمال واضغط إضافة أو Enter..."
              className="grow text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="button"
              onClick={handleAddAgendaItem}
              className="inline-flex items-center gap-1 px-4 py-2.5 rounded-lg text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة بند</span>
            </button>
          </div>
        </div>

        {/* Previous Meeting Follow Up */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              تاريخ الاجتماع السابق للمتابعة (اختياري)
            </label>
            <input
              type="text"
              value={previousMeetingDate}
              onChange={(e) => setPreviousMeetingDate(e.target.value)}
              placeholder="مثال: 2026/5/24"
              className="w-full text-xs rounded-lg border border-slate-300 p-2"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              متابعة ما سبق بالاجتماع السابق
            </label>
            <input
              type="text"
              value={previousMeetingFollowUp}
              onChange={(e) => setPreviousMeetingFollowUp(e.target.value)}
              placeholder="مثال: عدم تفعيل نقطة الفرز / متابعة توفير أكياس النفايات"
              className="w-full text-xs rounded-lg border border-slate-300 p-2"
            />
          </div>
        </div>
      </div>

      {/* 6. Performance Indicators (مؤشرات الأداء) */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              مؤشرات الأداء (KPIs)
            </h3>
            <p className="text-xs text-slate-500">
              معدلات الالتزام بغسيل الأيدي والتعقيم ونسب الجودة
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddKpi}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة مؤشر</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
            >
              <div className="grow space-y-1.5">
                <input
                  type="text"
                  value={kpi.name}
                  onChange={(e) => handleUpdateKpi(kpi.id, "name", e.target.value)}
                  placeholder="اسم المؤشر (معدل الالتزام بغسل الايدي)"
                  className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-md p-1.5"
                />
                <div className="flex items-center gap-2">
                  <div className="w-1/2">
                    <span className="text-[10px] text-slate-500">النسبة الفعلية:</span>
                    <input
                      type="text"
                      value={kpi.value}
                      onChange={(e) => handleUpdateKpi(kpi.id, "value", e.target.value)}
                      placeholder="%65"
                      className="w-full text-xs font-bold text-teal-800 bg-white border border-slate-300 rounded-md p-1"
                    />
                  </div>
                  <div className="w-1/2">
                    <span className="text-[10px] text-slate-500">المستهدف:</span>
                    <input
                      type="text"
                      value={kpi.target || ""}
                      onChange={(e) => handleUpdateKpi(kpi.id, "target", e.target.value)}
                      placeholder="%85"
                      className="w-full text-xs text-slate-600 bg-white border border-slate-300 rounded-md p-1"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveKpi(kpi.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Decisions and Recommendations (القرارات والتوصيات - العمود الفقري للمحضر) */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              القرارات والتوصيات المعتمدة (Decisions & Recommendations)
            </h3>
            <p className="text-xs text-slate-500">
              تحديد الإجراء التصحيحي، والمسؤول عن التنفيذ، والمدة الزمنية، ووسيلة المتابعة
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddDecision}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-2xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة قرار / توصية جديدة</span>
          </button>
        </div>

        <div className="space-y-4">
          {decisions.map((decision, index) => (
            <div
              key={decision.id || index}
              className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-3 relative group"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-md">
                  قرار / توصية #{index + 1}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemoveDecision(decision.id)}
                  className="text-rose-500 hover:text-rose-700 p-1 text-xs flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الموضوع / الملاحظة
                  </label>
                  <input
                    type="text"
                    value={decision.topic}
                    onChange={(e) => handleUpdateDecision(decision.id, "topic", e.target.value)}
                    placeholder="مثال: عدم اعطاء الوقت الكافي في غرف العمليات بعد كل حالة والأخرى"
                    className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 bg-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    القرار / التوصية / الإجراء التصحيحي
                  </label>
                  <textarea
                    rows={2}
                    value={decision.decision}
                    onChange={(e) => handleUpdateDecision(decision.id, "decision", e.target.value)}
                    placeholder="مثال: اعطاء وقت 15 دقيقة من أجل تنظيف وتطهير وتغيير هواء الغرفة"
                    className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المسؤول عن التنفيذ
                  </label>
                  <input
                    type="text"
                    value={decision.responsible}
                    onChange={(e) =>
                      handleUpdateDecision(decision.id, "responsible", e.target.value)
                    }
                    placeholder="مشرف التمريض / تمريض العمليات"
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المدة الزمنية
                  </label>
                  <input
                    type="text"
                    value={decision.duration}
                    onChange={(e) =>
                      handleUpdateDecision(decision.id, "duration", e.target.value)
                    }
                    placeholder="يومين / 3 أيام / أسبوع / فوري"
                    className="w-full text-xs font-bold rounded-lg border border-slate-300 p-2 bg-white text-center"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    وسيلة المتابعة
                  </label>
                  <input
                    type="text"
                    value={decision.monitoringMethod}
                    onChange={(e) =>
                      handleUpdateDecision(decision.id, "monitoringMethod", e.target.value)
                    }
                    placeholder="المرور / دفتر التسجيل / الفحص الظاهري"
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Approvals & Signatures (الاعتماد) */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-3">
          الاعتماد والتوقيعات الرسمية
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              مسؤول مكافحة العدوى
            </label>
            <input
              type="text"
              value={infectionControlLead}
              onChange={(e) => setInfectionControlLead(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              مشرف التمريض
            </label>
            <input
              type="text"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              المدير الطبي
            </label>
            <input
              type="text"
              value={medicalDirector}
              onChange={(e) => setMedicalDirector(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Bottom Floating Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
        >
          إلغاء
        </button>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>حفظ المحضر ومعاينته</span>
        </button>
      </div>
    </form>

    {/* Massive Topics Library Picker Modal */}
    <TopicsPickerModal
      isOpen={isTopicsPickerOpen}
      onClose={() => setIsTopicsPickerOpen(false)}
      availableTopics={availableTopics}
      onImportTopics={handleImportTopicsBatch}
    />
  </>
  );
};
