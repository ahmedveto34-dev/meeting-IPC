import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { AuthScreen } from "./components/AuthScreen";
import { PortalLandingView } from "./components/PortalLandingView";
import { MeetingsList } from "./components/MeetingsList";
import { MeetingView } from "./components/MeetingView";
import { MeetingForm } from "./components/MeetingForm";
import { RoundsList } from "./components/RoundsList";
import { RoundView } from "./components/RoundView";
import { RoundForm } from "./components/RoundForm";
import { MonthlyPlanView } from "./components/MonthlyPlanView";
import { TopicsLibraryView } from "./components/TopicsLibraryView";
import { TopicEditModal } from "./components/TopicEditModal";
import { ObservationsBankModal } from "./components/ObservationsBankModal";
import { ObservationsBankView } from "./components/ObservationsBankView";
import { SettingsModal } from "./components/SettingsModal";
import { AiAssistantModal } from "./components/AiAssistantModal";
import { CenterTemplatesManagerModal } from "./components/CenterTemplatesManagerModal";
import { FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { CenterSettings, Meeting, RoundReport, StandardObservationItem, MeetingTopic, PerformanceIndicator, MeetingDecision, MonthlyThemeTemplate, AppExportBundle } from "./types";
import { INITIAL_MEETINGS, INITIAL_ROUNDS, DEFAULT_CENTER_SETTINGS } from "./data/seedData";
import { MONTHLY_TEMPLATES, DEFAULT_MONTHLY_TEMPLATES, normalizeMonthlyTemplates } from "./data/monthlyTemplates";
import { DEFAULT_TOPICS } from "./data/defaultTopics";
import { syncMeetingToGoogleSheets, syncRoundToGoogleSheets } from "./utils/googleSheetsSync";

const STORAGE_KEYS = {
  MEETINGS: "inf_ctrl_meetings_v2",
  ROUNDS: "inf_ctrl_rounds_v2",
  SETTINGS: "inf_ctrl_settings_v2",
  TOPICS: "inf_ctrl_topics_v2",
  MONTHLY_TEMPLATES: "inf_ctrl_monthly_templates_v2",
  AUTH: "inf_ctrl_auth_session_v2",
};

export default function App() {
  // Authentication State (PIN: 2008)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const localAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      const sessionAuth = sessionStorage.getItem(STORAGE_KEYS.AUTH);
      return localAuth === "true" || sessionAuth === "true";
    } catch {
      return false;
    }
  });

  const handleSuccessLogin = (remember: boolean) => {
    setIsAuthenticated(true);
    try {
      if (remember) {
        localStorage.setItem(STORAGE_KEYS.AUTH, "true");
      } else {
        sessionStorage.setItem(STORAGE_KEYS.AUTH, "true");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    if (window.confirm("هل تريد قفل النظام وتسجيل الخروج؟")) {
      setIsAuthenticated(false);
      try {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
        sessionStorage.removeItem(STORAGE_KEYS.AUTH);
      } catch (e) {
        console.error(e);
      }
    }
  };
  // Center Settings State
  const [centerSettings, setCenterSettings] = useState<CenterSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const data: CenterSettings = saved ? JSON.parse(saved) : DEFAULT_CENTER_SETTINGS;
      if (!data.centerName || data.centerName.includes("احمد مصطف") || data.centerName.includes("أحمد مصطف")) {
        data.centerName = "Waheed IPC";
      }
      if (data?.defaultMembers) {
        data.defaultMembers = data.defaultMembers.map((m) => ({
          ...m,
          signatureNote: m.signatureNote === "تم التوقيع" ? "" : (m.signatureNote || ""),
        }));
      }
      return data;
    } catch {
      return DEFAULT_CENTER_SETTINGS;
    }
  });

  // Topics Library State
  const [topics, setTopics] = useState<MeetingTopic[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TOPICS);
      if (saved) {
        const parsed: MeetingTopic[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((p) => p.id));
        const newDefaults = DEFAULT_TOPICS.filter((dt) => !existingIds.has(dt.id));
        if (newDefaults.length > 0) {
          return [...parsed, ...newDefaults];
        }
        return parsed;
      }
      return DEFAULT_TOPICS;
    } catch {
      return DEFAULT_TOPICS;
    }
  });

  // Monthly Meeting Plan Templates State (12 Months customizable for any medical center)
  const [monthlyTemplates, setMonthlyTemplates] = useState<MonthlyThemeTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MONTHLY_TEMPLATES);
      if (saved) {
        const parsed = JSON.parse(saved);
        return normalizeMonthlyTemplates(parsed);
      }
      return DEFAULT_MONTHLY_TEMPLATES;
    } catch {
      return DEFAULT_MONTHLY_TEMPLATES;
    }
  });

  // Meetings State
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEETINGS);
      const data: Meeting[] = saved ? JSON.parse(saved) : INITIAL_MEETINGS;
      return data.map((m) => ({
        ...m,
        centerName: (!m.centerName || m.centerName.includes("احمد مصطف") || m.centerName.includes("أحمد مصطف")) ? "Waheed IPC" : m.centerName,
        members: (m.members || []).map((mem) => ({
          ...mem,
          signatureNote: mem.signatureNote === "تم التوقيع" ? "" : (mem.signatureNote || ""),
        })),
      }));
    } catch {
      return INITIAL_MEETINGS;
    }
  });

  // Rounds State
  const [rounds, setRounds] = useState<RoundReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROUNDS);
      const data: RoundReport[] = saved ? JSON.parse(saved) : INITIAL_ROUNDS;
      return data.map((r) => ({
        ...r,
        centerName: (!r.centerName || r.centerName.includes("احمد مصطف") || r.centerName.includes("أحمد مصطف")) ? "Waheed IPC" : r.centerName,
      }));
    } catch {
      return INITIAL_ROUNDS;
    }
  });

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>("portal");
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  const [selectedRound, setSelectedRound] = useState<RoundReport | null>(null);
  const [editingRound, setEditingRound] = useState<RoundReport | null>(null);

  // Topic Modal State
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<MeetingTopic | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isObsBankOpen, setIsObsBankOpen] = useState(false);
  const [isTemplatesManagerOpen, setIsTemplatesManagerOpen] = useState(false);

  // Auto-Sync to Google Sheets State
  const [autoSyncState, setAutoSyncState] = useState<{
    status: "idle" | "syncing" | "success" | "error";
    title?: string;
    message?: string;
  }>({ status: "idle" });

  const triggerMeetingAutoSync = async (meeting: Meeting) => {
    setAutoSyncState({
      status: "syncing",
      title: `مزامنة تلقائية: محضر اجتماع رقم (${meeting.meetingNumber})`,
      message: "جاري حفظ وترحيل البيانات إلى Google Sheets تلقائياً...",
    });
    try {
      const res = await syncMeetingToGoogleSheets(meeting);
      if (res.success) {
        setAutoSyncState({
          status: "success",
          title: `تمت المزامنة التلقائية بنجاح ✓`,
          message: `تم ترحيل محضر الاجتماع رقم (${meeting.meetingNumber}) وقراراته إلى Google Sheets`,
        });
        setTimeout(() => {
          setAutoSyncState((prev) => (prev.status === "success" ? { status: "idle" } : prev));
        }, 4000);
      } else {
        setAutoSyncState({
          status: "error",
          title: `حفظ محلي (ملاحظة مزامنة)`,
          message: res.error || "تم الحفظ محلياً. يرجى التأكد من ضبط متغير SHEET_ID",
        });
        setTimeout(() => {
          setAutoSyncState((prev) => (prev.status === "error" ? { status: "idle" } : prev));
        }, 5000);
      }
    } catch {
      setAutoSyncState({
        status: "error",
        title: `حفظ محلي`,
        message: "تم حفظ المحضر محلياً في المتصفح",
      });
      setTimeout(() => {
        setAutoSyncState((prev) => (prev.status === "error" ? { status: "idle" } : prev));
      }, 4000);
    }
  };

  const triggerRoundAutoSync = async (round: RoundReport) => {
    setAutoSyncState({
      status: "syncing",
      title: `مزامنة تلقائية: تقرير المرور (${round.title})`,
      message: "جاري حفظ وترحيل الملاحظات وخطة العمل إلى Google Sheets تلقائياً...",
    });
    try {
      const res = await syncRoundToGoogleSheets(round);
      if (res.success) {
        setAutoSyncState({
          status: "success",
          title: `تمت المزامنة التلقائية بنجاح ✓`,
          message: `تم ترحيل تقرير المرور (${round.title}) وخطة العمل إلى Google Sheets`,
        });
        setTimeout(() => {
          setAutoSyncState((prev) => (prev.status === "success" ? { status: "idle" } : prev));
        }, 4000);
      } else {
        setAutoSyncState({
          status: "error",
          title: `حفظ محلي (ملاحظة مزامنة)`,
          message: res.error || "تم الحفظ محلياً. يرجى التأكد من ضبط متغير SHEET_ID",
        });
        setTimeout(() => {
          setAutoSyncState((prev) => (prev.status === "error" ? { status: "idle" } : prev));
        }, 5000);
      }
    } catch {
      setAutoSyncState({
        status: "error",
        title: `حفظ محلي`,
        message: "تم حفظ التقرير محلياً في المتصفح",
      });
      setTimeout(() => {
        setAutoSyncState((prev) => (prev.status === "error" ? { status: "idle" } : prev));
      }, 4000);
    }
  };

  // Bundle Import Handler for other centers
  const handleImportBundle = (
    bundle: Partial<AppExportBundle>,
    mode: "merge" | "replace"
  ) => {
    if (bundle.centerSettings) {
      setCenterSettings(bundle.centerSettings);
    }
    if (Array.isArray(bundle.topics)) {
      if (mode === "replace") {
        setTopics(bundle.topics);
      } else {
        // Merge topics uniquely by ID or title
        setTopics((prev) => {
          const existingIds = new Set(prev.map((t) => t.id));
          const additions = bundle.topics!.filter((t) => !existingIds.has(t.id));
          return [...prev, ...additions];
        });
      }
    }
    if (Array.isArray(bundle.meetings)) {
      if (mode === "replace") {
        setMeetings(bundle.meetings);
      } else {
        setMeetings((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const additions = bundle.meetings!.filter((m) => !existingIds.has(m.id));
          return [...prev, ...additions];
        });
      }
    }
    if (Array.isArray(bundle.rounds)) {
      if (mode === "replace") {
        setRounds(bundle.rounds);
      } else {
        setRounds((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const additions = bundle.rounds!.filter((r) => !existingIds.has(r.id));
          return [...prev, ...additions];
        });
      }
    }
    if (Array.isArray(bundle.monthlyTemplates) && bundle.monthlyTemplates.length > 0) {
      const normalized = normalizeMonthlyTemplates(bundle.monthlyTemplates);
      setMonthlyTemplates(normalized);
    }
  };

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(centerSettings));
    } catch (e) {
      console.error(e);
    }
  }, [centerSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
    } catch (e) {
      console.error(e);
    }
  }, [topics]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
    } catch (e) {
      console.error(e);
    }
  }, [meetings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROUNDS, JSON.stringify(rounds));
    } catch (e) {
      console.error(e);
    }
  }, [rounds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MONTHLY_TEMPLATES, JSON.stringify(monthlyTemplates));
    } catch (e) {
      console.error(e);
    }
  }, [monthlyTemplates]);

  // Meeting Handlers
  const handleViewMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setCurrentTab("meeting-view");
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setCurrentTab("meeting-edit");
  };

  const handleNewMeeting = () => {
    setEditingMeeting(null);
    setCurrentTab("meeting-edit");
  };

  const handleSaveMeeting = (savedMeeting: Meeting) => {
    const exists = meetings.some((m) => m.id === savedMeeting.id);
    let updatedList: Meeting[];
    if (exists) {
      updatedList = meetings.map((m) => (m.id === savedMeeting.id ? savedMeeting : m));
    } else {
      updatedList = [savedMeeting, ...meetings];
    }
    setMeetings(updatedList);
    setSelectedMeeting(savedMeeting);
    setEditingMeeting(null);
    setCurrentTab("meeting-view");

    // Trigger background automatic synchronization with Google Sheets
    triggerMeetingAutoSync(savedMeeting);
  };

  const handleDeleteMeeting = (id: string) => {
    setMeetings(meetings.filter((m) => m.id !== id));
    if (selectedMeeting?.id === id) {
      setSelectedMeeting(null);
      setCurrentTab("meetings");
    }
  };

  const handleDuplicateMeeting = (meeting: Meeting) => {
    const nextNum = String(Number(meeting.meetingNumber) + 1 || meetings.length + 1);
    
    // Identify unfinished items to carry over to the top of the new meeting
    const unfinishedDecisions = meeting.decisions.filter(
      (d) => d.status !== "completed" || d.isCarriedOver
    );
    const decisionsToCarry = unfinishedDecisions.length > 0 ? unfinishedDecisions : meeting.decisions;
    const carriedOverDecisions: MeetingDecision[] = decisionsToCarry.map((d, idx) => ({
      ...d,
      id: `dec-carry-${Date.now()}-${idx}`,
      status: "in_progress",
      isCarriedOver: true,
      sourceMeetingNumber: meeting.meetingNumber,
    }));

    const otherDecisions = meeting.decisions
      .filter((d) => d.status === "completed" && !d.isCarriedOver)
      .map((d, idx) => ({
        ...d,
        id: `dec-new-${Date.now()}-${idx}`,
        status: "in_progress" as const,
        isCarriedOver: false,
      }));

    const summaryFollowUp = carriedOverDecisions.map((d) => d.topic).slice(0, 3).join(" / ");

    const newDuplicatedMeeting: Meeting = {
      ...meeting,
      id: `meeting-${Date.now()}`,
      meetingNumber: nextNum,
      date: new Date().toISOString().split("T")[0].replace(/-/g, "/"),
      previousMeetingDate: meeting.date,
      previousMeetingFollowUp: summaryFollowUp || `متابعة تنفيذ قرارات وتوصيات الاجتماع رقم (${meeting.meetingNumber})`,
      agenda: [
        "ما لم يتم إنجازه من الاجتماع السابق",
        ...meeting.agenda.filter((a) => !a.includes("ما لم يتم إنجازه")),
      ],
      decisions: [...carriedOverDecisions, ...otherDecisions],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingMeeting(newDuplicatedMeeting);
    setCurrentTab("meeting-edit");
  };

  // Round Handlers
  const handleViewRound = (round: RoundReport) => {
    setSelectedRound(round);
    setCurrentTab("round-view");
  };

  const handleEditRound = (round: RoundReport) => {
    setEditingRound(round);
    setCurrentTab("round-edit");
  };

  const handleNewRound = () => {
    setEditingRound(null);
    setCurrentTab("round-edit");
  };

  const handleSaveRound = (savedRound: RoundReport) => {
    const exists = rounds.some((r) => r.id === savedRound.id);
    let updatedList: RoundReport[];
    if (exists) {
      updatedList = rounds.map((r) => (r.id === savedRound.id ? savedRound : r));
    } else {
      updatedList = [savedRound, ...rounds];
    }
    setRounds(updatedList);
    setSelectedRound(savedRound);
    setEditingRound(null);
    setCurrentTab("round-view");

    // Trigger background automatic synchronization with Google Sheets
    triggerRoundAutoSync(savedRound);
  };

  const handleDeleteRound = (id: string) => {
    setRounds(rounds.filter((r) => r.id !== id));
    if (selectedRound?.id === id) {
      setSelectedRound(null);
      setCurrentTab("rounds");
    }
  };

  // Create new Round from Selected Bank Observations
  const handleCreateRoundFromObservations = (obsList: StandardObservationItem[]) => {
    handleAddObservationToRound(obsList, "new");
    setIsObsBankOpen(false);
  };

  // Add Observation(s) to Round (New or Existing)
  const handleAddObservationToRound = (obsList: StandardObservationItem[], targetRoundId?: string) => {
    if (!targetRoundId || targetRoundId === "new") {
      const today = new Date();
      const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const currentDay = dayNames[today.getDay()];
      const currentDate = today.toISOString().split("T")[0].replace(/-/g, "/");

      const newRound: RoundReport = {
        id: `round-${Date.now()}`,
        title: "تقرير المرور الميداني لمكافحة العدوى",
        day: currentDay,
        date: currentDate,
        period: "صباحي",
        inspector: centerSettings.infectionControlLead || "مشرف مكافحة العدوى",
        supervisorRole: "مشرف مكافحة العدوى",
        centerName: centerSettings.centerName,
        observations: obsList.map((item, idx) => ({
          id: `obs-${Date.now()}-${idx}`,
          location: item.location,
          observation: item.observation,
          recommendation: item.recommendation,
          responsible: item.responsible,
          status: "pending",
          dueDate: item.duration,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setEditingRound(newRound);
      setCurrentTab("round-edit");
    } else {
      const existing = rounds.find((r) => r.id === targetRoundId);
      if (existing) {
        const newObs = obsList.map((item, idx) => ({
          id: `obs-appended-${Date.now()}-${idx}`,
          location: item.location,
          observation: item.observation,
          recommendation: item.recommendation,
          responsible: item.responsible,
          status: "pending" as const,
          dueDate: item.duration,
        }));
        const updatedRound: RoundReport = {
          ...existing,
          observations: [...existing.observations, ...newObs],
          updatedAt: new Date().toISOString(),
        };
        const updatedList = rounds.map((r) => (r.id === targetRoundId ? updatedRound : r));
        setRounds(updatedList);
        setSelectedRound(updatedRound);
        setCurrentTab("round-view");
        triggerRoundAutoSync(updatedRound);
      }
    }
  };

  // Add Observation(s) to Meeting (New or Existing)
  const handleAddObservationToMeeting = (obsList: StandardObservationItem[], targetMeetingId?: string) => {
    if (!targetMeetingId || targetMeetingId === "new") {
      const nextNum = String(meetings.length + 1);
      const newMeeting: Meeting = {
        id: `meeting-${Date.now()}`,
        meetingNumber: nextNum,
        day: "الأحد",
        date: new Date().toISOString().split("T")[0].replace(/-/g, "/"),
        time: "11:00 صباحاً",
        location: "قاعة اجتماعات الإدارة الطبية",
        centerName: centerSettings.centerName,
        departmentTitle: centerSettings.departmentTitle,
        members: centerSettings.defaultMembers,
        agenda: [
          "ما لم يتم إنجازه من الاجتماع السابق",
          "مناقشة ملاحظات مكافحة العدوى والقرارات التصحيحية المطلوبة",
          ...obsList.map((o) => `ملاحظة قسم ${o.location}: ${o.observation}`),
        ],
        previousMeetingDate: meetings[0]?.date,
        previousMeetingFollowUp: "متابعة نتائج المرور الميداني بالأقسام",
        kpis: [
          { id: `kpi-1-${Date.now()}`, name: "معدل الالتزام بمعايير مكافحة العدوى", value: "%80", target: "%90" },
        ],
        decisions: obsList.map((item, idx) => ({
          id: `dec-${Date.now()}-${idx}`,
          topic: `${item.location}: ${item.observation}`,
          decision: item.recommendation,
          responsible: item.responsible,
          duration: item.duration,
          monitoringMethod: item.monitoringMethod,
          status: "in_progress",
        })),
        approvals: {
          preparedBy: centerSettings.nursingSupervisor,
          infectionControlLead: centerSettings.infectionControlLead,
          medicalDirector: centerSettings.medicalDirector,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setEditingMeeting(newMeeting);
      setCurrentTab("meeting-edit");
    } else {
      const existing = meetings.find((m) => m.id === targetMeetingId);
      if (existing) {
        const newAgendas = obsList.map((o) => `ملاحظة قسم ${o.location}: ${o.observation}`);
        const newDecisions: MeetingDecision[] = obsList.map((item, idx) => ({
          id: `dec-appended-${Date.now()}-${idx}`,
          topic: `${item.location}: ${item.observation}`,
          decision: item.recommendation,
          responsible: item.responsible,
          duration: item.duration,
          monitoringMethod: item.monitoringMethod,
          status: "in_progress",
        }));
        const updatedMeeting: Meeting = {
          ...existing,
          agenda: [...existing.agenda, ...newAgendas],
          decisions: [...existing.decisions, ...newDecisions],
          updatedAt: new Date().toISOString(),
        };
        const updatedList = meetings.map((m) => (m.id === targetMeetingId ? updatedMeeting : m));
        setMeetings(updatedList);
        setSelectedMeeting(updatedMeeting);
        setCurrentTab("meeting-view");
        triggerMeetingAutoSync(updatedMeeting);
      }
    }
  };

  // Add Topic(s) to Meeting (New or Existing)
  const handleAddTopicToMeeting = (topicList: MeetingTopic[], targetMeetingId?: string) => {
    if (!targetMeetingId || targetMeetingId === "new") {
      handleCreateMeetingFromMultipleTopics(topicList);
    } else {
      const existing = meetings.find((m) => m.id === targetMeetingId);
      if (existing) {
        const combinedAgenda = [...existing.agenda];
        const combinedKpis = [...existing.kpis];
        const combinedDecisions = [...existing.decisions];

        topicList.forEach((t, tIdx) => {
          t.agenda?.forEach((item) => {
            if (!combinedAgenda.includes(item)) combinedAgenda.push(item);
          });
          t.kpis?.forEach((k, kIdx) => {
            if (!combinedKpis.some((x) => x.name.trim() === k.name.trim())) {
              combinedKpis.push({
                id: `kpi-top-${Date.now()}-${tIdx}-${kIdx}`,
                name: k.name,
                value: k.value,
                target: k.target,
              });
            }
          });
          t.sampleDecisions?.forEach((d, dIdx) => {
            combinedDecisions.push({
              id: `dec-top-${Date.now()}-${tIdx}-${dIdx}`,
              topic: d.topic,
              decision: d.decision,
              responsible: d.responsible,
              duration: d.duration,
              monitoringMethod: d.monitoringMethod,
              status: "in_progress",
            });
          });
        });

        const updatedMeeting: Meeting = {
          ...existing,
          agenda: combinedAgenda,
          kpis: combinedKpis,
          decisions: combinedDecisions,
          updatedAt: new Date().toISOString(),
        };
        const updatedList = meetings.map((m) => (m.id === targetMeetingId ? updatedMeeting : m));
        setMeetings(updatedList);
        setSelectedMeeting(updatedMeeting);
        setCurrentTab("meeting-view");
        triggerMeetingAutoSync(updatedMeeting);
      }
    }
  };

  // Add Topic(s) to Round (New or Existing)
  const handleAddTopicToRound = (topicList: MeetingTopic[], targetRoundId?: string) => {
    const obsList: StandardObservationItem[] = [];
    topicList.forEach((t) => {
      if (t.sampleDecisions && t.sampleDecisions.length > 0) {
        t.sampleDecisions.forEach((d, idx) => {
          obsList.push({
            id: `top-obs-${Date.now()}-${idx}`,
            category: t.category,
            location: t.targetDepartments?.[0] || t.category,
            observation: d.topic,
            recommendation: d.decision,
            responsible: d.responsible,
            duration: d.duration,
            monitoringMethod: d.monitoringMethod,
            severity: "high",
          });
        });
      } else {
        obsList.push({
          id: `top-obs-${Date.now()}`,
          category: t.category,
          location: t.targetDepartments?.[0] || t.category,
          observation: t.title,
          recommendation: t.description,
          responsible: "مشرف التمريض ومكافحة العدوى",
          duration: "أسبوع",
          monitoringMethod: "المرور الميداني",
          severity: "high",
        });
      }
    });

    handleAddObservationToRound(obsList, targetRoundId);
  };

  // Convert Round Observations to a Meeting
  const handleConvertRoundToMeeting = (round: RoundReport) => {
    const nextNum = String(meetings.length + 1);
    const newMeetingFromRound: Meeting = {
      id: `meeting-from-round-${Date.now()}`,
      meetingNumber: nextNum,
      day: round.day,
      date: round.date,
      time: "11:00 صباحاً",
      location: "قاعة اجتماعات الإدارة الطبية",
      centerName: centerSettings.centerName,
      departmentTitle: centerSettings.departmentTitle,
      members: centerSettings.defaultMembers,
      agenda: [
        "ما لم يتم إنجازه من الاجتماع السابق",
        `مناقشة تقرير المرور الميداني بتاريخ ${round.date}`,
        ...round.observations.map((o) => `ملاحظة قسم ${o.location}: ${o.observation}`),
      ],
      previousMeetingDate: meetings[0]?.date,
      previousMeetingFollowUp: "متابعة نتائج المرور الميداني بالأقسام",
      kpis: [
        { id: "kpi-1", name: "معدل الالتزام بغسل الأيدي", value: "%75", target: "%85" },
        { id: "kpi-2", name: "معدل تطهير ونظافة الأجهزة", value: "%85", target: "%95" },
      ],
      decisions: round.observations.map((obs, idx) => ({
        id: `dec-${Date.now()}-${idx}`,
        topic: `${obs.location}: ${obs.observation}`,
        decision: obs.recommendation,
        responsible: obs.responsible || "مشرف التمريض",
        duration: "3 أيام",
        monitoringMethod: "المرور الميداني",
        status: obs.status,
      })),
      approvals: {
        preparedBy: centerSettings.nursingSupervisor,
        infectionControlLead: round.inspector || centerSettings.infectionControlLead,
        medicalDirector: centerSettings.medicalDirector,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingMeeting(newMeetingFromRound);
    setCurrentTab("meeting-edit");
  };

  // Create meeting from monthly template key
  const handleCreateMeetingFromMonth = (monthKey: string) => {
    const tmpl = monthlyTemplates.find((t) => t.key === monthKey) || MONTHLY_TEMPLATES.find((t) => t.key === monthKey);
    if (!tmpl) return;

    const nextNum = String(tmpl.monthIndex);
    const newMeeting: Meeting = {
      id: `meeting-${Date.now()}`,
      meetingNumber: nextNum,
      day: "الأحد",
      date: new Date().toISOString().split("T")[0].replace(/-/g, "/"),
      time: "11:00 صباحاً",
      location: "قاعة اجتماعات الإدارة الطبية",
      centerName: centerSettings.centerName,
      departmentTitle: centerSettings.departmentTitle,
      members: centerSettings.defaultMembers,
      monthThemeKey: tmpl.key,
      agenda: tmpl.agenda,
      kpis: tmpl.defaultKpis.map((k, idx) => ({
        id: `kpi-${Date.now()}-${idx}`,
        name: k.name,
        value: k.value,
        target: k.target,
      })),
      decisions: tmpl.sampleDecisions.map((d, idx) => ({
        id: `dec-${Date.now()}-${idx}`,
        topic: d.topic,
        decision: d.decision,
        responsible: d.responsible,
        duration: d.duration,
        monitoringMethod: d.monitoringMethod,
        status: "in_progress",
      })),
      approvals: {
        preparedBy: centerSettings.nursingSupervisor,
        infectionControlLead: centerSettings.infectionControlLead,
        medicalDirector: centerSettings.medicalDirector,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingMeeting(newMeeting);
    setCurrentTab("meeting-edit");
  };

  // Topics Library Handlers
  const handleAddNewTopic = () => {
    setEditingTopic(null);
    setIsTopicModalOpen(true);
  };

  const handleEditTopic = (topic: MeetingTopic) => {
    setEditingTopic(topic);
    setIsTopicModalOpen(true);
  };

  const handleDuplicateTopic = (topic: MeetingTopic) => {
    const duplicated: MeetingTopic = {
      ...topic,
      id: `topic-${Date.now()}`,
      title: `${topic.title} (نسخة معدلة)`,
      isCustom: true,
      updatedAt: new Date().toISOString(),
    };
    setTopics([duplicated, ...topics]);
  };

  const handleDeleteTopic = (topicId: string) => {
    setTopics(topics.filter((t) => t.id !== topicId));
  };

  const handleSaveTopic = (savedTopic: MeetingTopic) => {
    const exists = topics.some((t) => t.id === savedTopic.id);
    if (exists) {
      setTopics(topics.map((t) => (t.id === savedTopic.id ? savedTopic : t)));
    } else {
      setTopics([savedTopic, ...topics]);
    }
  };

  const handleRestoreDefaultTopics = () => {
    if (window.confirm("هل تريد استعادة قائمة الموضوعات الافتراضية القياسية (28 موضوعاً شاملاً لكافة أقسام مكافحة العدوى)؟")) {
      setTopics(DEFAULT_TOPICS);
    }
  };

  const handleCreateMeetingFromTopic = (topic: MeetingTopic) => {
    handleCreateMeetingFromMultipleTopics([topic]);
  };

  const handleCreateMeetingFromMultipleTopics = (selectedTopics: MeetingTopic[]) => {
    if (selectedTopics.length === 0) return;

    const combinedAgenda: string[] = [];
    const combinedKpis: PerformanceIndicator[] = [];
    const combinedDecisions: MeetingDecision[] = [];

    selectedTopics.forEach((t, tIdx) => {
      // Agenda items
      if (t.agenda && t.agenda.length > 0) {
        t.agenda.forEach((item) => {
          if (!combinedAgenda.includes(item)) combinedAgenda.push(item);
        });
      } else {
        if (!combinedAgenda.includes(t.title)) combinedAgenda.push(t.title);
      }

      // KPIs
      if (t.kpis && t.kpis.length > 0) {
        t.kpis.forEach((k, kIdx) => {
          if (!combinedKpis.some((existing) => existing.name.trim() === k.name.trim())) {
            combinedKpis.push({
              id: `kpi-${Date.now()}-${tIdx}-${kIdx}`,
              name: k.name,
              value: k.value,
              target: k.target,
            });
          }
        });
      }

      // Decisions
      if (t.sampleDecisions && t.sampleDecisions.length > 0) {
        t.sampleDecisions.forEach((d, dIdx) => {
          combinedDecisions.push({
            id: `dec-${Date.now()}-${tIdx}-${dIdx}`,
            topic: d.topic,
            decision: d.decision,
            responsible: d.responsible,
            duration: d.duration,
            monitoringMethod: d.monitoringMethod,
            status: "in_progress",
          });
        });
      }
    });

    const nextNum = String(meetings.length + 1);
    const firstTopic = selectedTopics[0];
    const newMeeting: Meeting = {
      id: `meeting-${Date.now()}`,
      meetingNumber: nextNum,
      day: "الأحد",
      date: new Date().toISOString().split("T")[0].replace(/-/g, "/"),
      time: "11:00 صباحاً",
      location: "قاعة اجتماعات الإدارة الطبية",
      centerName: centerSettings.centerName,
      departmentTitle: centerSettings.departmentTitle,
      members: centerSettings.defaultMembers,
      monthThemeKey: firstTopic.recommendedMonth ? `month-${firstTopic.recommendedMonth}` : "month-1",
      agenda: [
        "ما لم يتم إنجازه من الاجتماع السابق",
        ...(combinedAgenda.length > 0
          ? combinedAgenda.filter((a) => !a.includes("ما لم يتم إنجازه"))
          : ["مناقشة موضوعات مكافحة العدوى والتقارير الشهرية"]),
      ],
      kpis: combinedKpis.length > 0 ? combinedKpis : [
        { id: "kpi-1", name: "معدل الالتزام بغسل الأيدي", value: "%75", target: "%85" },
        { id: "kpi-2", name: "معدل تطهير ونظافة الأجهزة والأسطح", value: "%85", target: "%95" },
      ],
      decisions: combinedDecisions,
      approvals: {
        preparedBy: centerSettings.nursingSupervisor,
        infectionControlLead: centerSettings.infectionControlLead,
        medicalDirector: centerSettings.medicalDirector,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingMeeting(newMeeting);
    setCurrentTab("meeting-edit");
  };

  // If not authenticated, show passcode screen
  if (!isAuthenticated) {
    return (
      <AuthScreen
        centerSettings={centerSettings}
        onSuccessLogin={handleSuccessLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-blue-100 selection:text-blue-900 font-['Cairo',sans-serif]">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        centerSettings={centerSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenObservationsBank={() => setIsObsBankOpen(true)}
        onOpenTemplatesManager={() => setIsTemplatesManagerOpen(true)}
        onNewMeeting={handleNewMeeting}
        onNewRound={handleNewRound}
        onLogout={handleLogout}
      />

      {/* Main Page Container */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* TAB 0: Portal Landing Hub (بوابة البدء السريع بعد تسجيل الدخول) */}
        {currentTab === "portal" && (
          <PortalLandingView
            centerSettings={centerSettings}
            meetings={meetings}
            rounds={rounds}
            onStartNewRound={handleNewRound}
            onStartNewMeeting={handleNewMeeting}
            onViewMeetingsList={() => setCurrentTab("meetings")}
            onViewRoundsList={() => setCurrentTab("rounds")}
            onViewObservationsBank={() => setCurrentTab("observations-bank")}
            onViewMonthlyPlan={() => setCurrentTab("monthly-plan")}
            onViewTopicsLibrary={() => setCurrentTab("topics-library")}
            onOpenAiHelper={() => setIsAiModalOpen(true)}
            onViewMeeting={handleViewMeeting}
            onViewRound={handleViewRound}
          />
        )}

        {/* TAB 1: Meetings List */}
        {currentTab === "meetings" && (
          <MeetingsList
            meetings={meetings}
            onViewMeeting={handleViewMeeting}
            onEditMeeting={handleEditMeeting}
            onNewMeeting={handleNewMeeting}
            onDuplicateMeeting={handleDuplicateMeeting}
            onDeleteMeeting={handleDeleteMeeting}
          />
        )}

        {/* TAB 1.1: Meeting Printable View */}
        {currentTab === "meeting-view" && selectedMeeting && (
          <MeetingView
            meeting={selectedMeeting}
            onEdit={handleEditMeeting}
            onBack={() => setCurrentTab("meetings")}
            onDuplicate={handleDuplicateMeeting}
            onDelete={handleDeleteMeeting}
          />
        )}

        {/* TAB 1.2: Meeting Form Editor */}
        {currentTab === "meeting-edit" && (
          <MeetingForm
            initialMeeting={editingMeeting}
            centerSettings={centerSettings}
            availableRounds={rounds}
            availableTopics={topics}
            availableMeetings={meetings}
            monthlyTemplates={monthlyTemplates}
            onSave={handleSaveMeeting}
            onCancel={() => {
              if (selectedMeeting) {
                setCurrentTab("meeting-view");
              } else {
                setCurrentTab("meetings");
              }
            }}
            onOpenAiHelper={() => setIsAiModalOpen(true)}
          />
        )}

        {/* TAB 2: Topics Library (مكتبة موضوعات مكافحة العدوى) */}
        {currentTab === "topics-library" && (
          <TopicsLibraryView
            topics={topics}
            centerSettings={centerSettings}
            onAddTopic={handleAddNewTopic}
            onEditTopic={handleEditTopic}
            onDuplicateTopic={handleDuplicateTopic}
            onDeleteTopic={handleDeleteTopic}
            onCreateMeetingFromTopic={handleCreateMeetingFromTopic}
            onCreateMeetingFromMultipleTopics={handleCreateMeetingFromMultipleTopics}
            onRestoreDefaults={handleRestoreDefaultTopics}
            onOpenTemplatesManager={() => setIsTemplatesManagerOpen(true)}
          />
        )}

        {/* TAB 3: Rounds List */}
        {currentTab === "rounds" && (
          <RoundsList
            rounds={rounds}
            onViewRound={handleViewRound}
            onEditRound={handleEditRound}
            onNewRound={handleNewRound}
            onDeleteRound={handleDeleteRound}
            onConvertToMeeting={handleConvertRoundToMeeting}
          />
        )}

        {/* TAB 3.1: Round Printable View */}
        {currentTab === "round-view" && selectedRound && (
          <RoundView
            round={selectedRound}
            onEdit={handleEditRound}
            onBack={() => setCurrentTab("rounds")}
            onConvertToMeeting={handleConvertRoundToMeeting}
            onDelete={handleDeleteRound}
          />
        )}

        {/* TAB 3.2: Round Form Editor */}
        {currentTab === "round-edit" && (
          <RoundForm
            initialRound={editingRound}
            centerSettings={centerSettings}
            onSave={handleSaveRound}
            onCancel={() => {
              if (selectedRound) {
                setCurrentTab("round-view");
              } else {
                setCurrentTab("rounds");
              }
            }}
          />
        )}

        {/* TAB 4: 12-Month Annual Plan */}
        {currentTab === "monthly-plan" && (
          <MonthlyPlanView
            monthlyTemplates={monthlyTemplates}
            onUpdateMonthlyTemplates={(newTemplates) => setMonthlyTemplates(newTemplates)}
            onCreateMeetingFromMonth={handleCreateMeetingFromMonth}
            centerSettings={centerSettings}
          />
        )}

        {/* TAB 5: Observations Bank (بنك الملاحظات وموضوعات الاجتماعات) */}
        {currentTab === "observations-bank" && (
          <ObservationsBankView
            topics={topics}
            meetings={meetings}
            rounds={rounds}
            centerSettings={centerSettings}
            onAddObservationToRound={handleAddObservationToRound}
            onAddObservationToMeeting={handleAddObservationToMeeting}
            onAddTopicToMeeting={handleAddTopicToMeeting}
            onAddTopicToRound={handleAddTopicToRound}
            onOpenNewRound={handleNewRound}
            onOpenNewMeeting={handleNewMeeting}
          />
        )}

      </main>

      {/* Clean Minimalism Footer */}
      <footer className="h-10 bg-white border-t border-slate-200 flex items-center px-4 sm:px-8 justify-between text-xs text-slate-400 print:hidden">
        <div>منصة مكافحة العدوى وإدارة الجودة الطبية</div>
        <div>{centerSettings.centerName || "المركز الطبي"} - جميع الحقوق محفوظة</div>
      </footer>

      {/* Modals */}
      <ObservationsBankModal
        isOpen={isObsBankOpen}
        onClose={() => setIsObsBankOpen(false)}
        onCreateRoundFromObservations={handleCreateRoundFromObservations}
        centerSettings={centerSettings}
      />

      <TopicEditModal
        isOpen={isTopicModalOpen}
        onClose={() => {
          setIsTopicModalOpen(false);
          setEditingTopic(null);
        }}
        initialTopic={editingTopic}
        onSave={handleSaveTopic}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={centerSettings}
        onSaveSettings={(newSettings) => setCenterSettings(newSettings)}
        onOpenTemplatesManager={() => setIsTemplatesManagerOpen(true)}
      />

      <CenterTemplatesManagerModal
        isOpen={isTemplatesManagerOpen}
        onClose={() => setIsTemplatesManagerOpen(false)}
        centerSettings={centerSettings}
        meetings={meetings}
        rounds={rounds}
        topics={topics}
        monthlyTemplates={monthlyTemplates}
        onImportBundle={handleImportBundle}
        onUpdateCenterSettings={(newSettings) => setCenterSettings(newSettings)}
        onUpdateMonthlyTemplates={(newTemplates) => setMonthlyTemplates(newTemplates)}
      />

      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        centerSettings={centerSettings}
        onApplyMeetingPlan={(data) => {
          if (currentTab === "meeting-edit" && editingMeeting) {
            setEditingMeeting({
              ...editingMeeting,
              agenda: data.agenda,
              kpis: data.kpis.map((k, i) => ({ id: `kpi-${i}`, ...k })),
              decisions: data.decisions,
              previousMeetingFollowUp: data.previousFollowUp,
            });
          } else {
            // Create new meeting with generated data
            const newM: Meeting = {
              id: `meeting-${Date.now()}`,
              meetingNumber: String(meetings.length + 1),
              day: "الأحد",
              date: new Date().toISOString().split("T")[0].replace(/-/g, "/"),
              centerName: centerSettings.centerName,
              departmentTitle: centerSettings.departmentTitle,
              members: centerSettings.defaultMembers,
              agenda: data.agenda,
              kpis: data.kpis.map((k, i) => ({ id: `kpi-${i}`, ...k })),
              decisions: data.decisions,
              previousMeetingFollowUp: data.previousFollowUp,
              approvals: {
                preparedBy: centerSettings.nursingSupervisor,
                infectionControlLead: centerSettings.infectionControlLead,
                medicalDirector: centerSettings.medicalDirector,
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setEditingMeeting(newM);
            setCurrentTab("meeting-edit");
          }
        }}
      />

      {/* Floating Auto-Sync Notification Toast */}
      {autoSyncState.status !== "idle" && (
        <div
          id="autosync-toast-notification"
          className={`fixed bottom-5 left-5 z-50 max-w-md w-auto rounded-2xl shadow-xl border p-4 flex items-start gap-3.5 transition-all duration-300 animate-in slide-in-from-bottom-5 print:hidden ${
            autoSyncState.status === "syncing"
              ? "bg-slate-900 text-white border-slate-700"
              : autoSyncState.status === "success"
              ? "bg-emerald-900 text-white border-emerald-700"
              : "bg-amber-900 text-white border-amber-700"
          }`}
          dir="rtl"
        >
          <div className="shrink-0 mt-0.5">
            {autoSyncState.status === "syncing" && (
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            )}
            {autoSyncState.status === "success" && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            {autoSyncState.status === "error" && (
              <AlertCircle className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div className="grow min-w-0 pr-1 text-right">
            <div className="flex items-center gap-1.5 font-black text-sm">
              <FileSpreadsheet className="w-3.5 h-3.5 opacity-80" />
              <span>{autoSyncState.title || "مزامنة Google Sheets"}</span>
            </div>
            {autoSyncState.message && (
              <p className="text-xs mt-1 text-slate-200 leading-relaxed opacity-90">
                {autoSyncState.message}
              </p>
            )}
          </div>
          <button
            onClick={() => setAutoSyncState({ status: "idle" })}
            className="shrink-0 text-slate-400 hover:text-white transition-colors cursor-pointer p-1 -mr-1"
            title="إغلاق الإشعار"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
