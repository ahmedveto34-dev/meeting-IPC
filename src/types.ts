export interface TopicDecisionTemplate {
  topic: string;
  decision: string;
  responsible: string;
  duration: string;
  monitoringMethod: string;
}

export interface TopicKpiTemplate {
  name: string;
  value: string;
  target?: string;
}

export interface MeetingTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  targetDepartments: string[];
  agenda: string[];
  kpis: TopicKpiTemplate[];
  sampleDecisions: TopicDecisionTemplate[];
  recommendedMonth?: number;
  tags?: string[];
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StandardObservationItem {
  id: string;
  category: string;
  location: string;
  observation: string;
  recommendation: string;
  responsible: string;
  duration: string;
  monitoringMethod: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  standardRef?: string;
  isCustom?: boolean;
  tags?: string[];
}

export interface Member {
  id: string;
  name: string;
  role: string;
  attended: boolean;
  signatureNote?: string;
}

export interface MeetingDecision {
  id: string;
  topic: string;
  decision: string;
  responsible: string;
  duration: string;
  monitoringMethod: string;
  status?: 'completed' | 'in_progress' | 'pending';
}

export interface PerformanceIndicator {
  id: string;
  name: string;
  value: string;
  target?: string;
}

export interface Meeting {
  id: string;
  meetingNumber: string | number;
  day: string;
  date: string;
  time?: string;
  location?: string;
  centerName: string;
  centerLogo?: string;
  departmentTitle?: string; // e.g. "لجنة مكافحة العدوى"
  members: Member[];
  agenda: string[];
  previousMeetingDate?: string;
  previousMeetingFollowUp?: string;
  kpis: PerformanceIndicator[];
  decisions: MeetingDecision[];
  generalNotes?: string;
  approvals: {
    preparedBy: string;
    infectionControlLead: string;
    medicalDirector: string;
  };
  monthThemeKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoundObservation {
  id: string;
  location: string; // الموقع
  observation: string; // الملاحظات
  recommendation: string; // التوصيات / الإجراء التصحيحي
  responsible: string; // المسؤول عن التنفيذ
  status: 'completed' | 'in_progress' | 'pending';
  dueDate?: string;
}

export interface RoundReport {
  id: string;
  title: string; // تقرير المرور الاسبوعي
  day: string;
  date: string;
  period: string; // الفترة : صباحي / مسائي
  inspector: string; // القائم بالمرور
  supervisorRole: string; // مشرف مكافحة العدوى
  centerName: string;
  centerLogo?: string;
  observations: RoundObservation[];
  generalRecommendation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CenterSettings {
  centerName: string;
  departmentTitle: string;
  logoUrl?: string;
  medicalDirector: string;
  infectionControlLead: string;
  qualityLead: string;
  nursingSupervisor: string;
  defaultMembers: Member[];
  departments: string[];
}

export interface MonthlyThemeTemplate {
  key: string;
  monthIndex: number;
  monthName: string;
  themeTitle: string;
  category: string;
  agenda: string[];
  defaultKpis: { name: string; value: string; target?: string }[];
  sampleDecisions: {
    topic: string;
    decision: string;
    responsible: string;
    duration: string;
    monitoringMethod: string;
  }[];
  focusSummary: string;
}
