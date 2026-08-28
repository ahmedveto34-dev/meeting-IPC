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

export interface InfectionControlPolicy {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  guidelineChapter: string;
  scope: string;
  summary: string;
  keyRequirements: string[];
  departmentCategory?: string;
}

export interface StandardObservationItem {
  id: string;
  category: string;
  policyId?: string;
  policyName?: string;
  location: string;
  observation: string;
  recommendation: string;
  responsible: string;
  duration: string;
  monitoringMethod: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  standardRef?: string;
  egyptianGuidelineRef?: string;
  isCustom?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
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
  isCarriedOver?: boolean; // هل هو موضوع مرحل من الاجتماع السابق لم يتم إنجازه
  sourceMeetingNumber?: string | number; // رقم الاجتماع السابق المنقول منه
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

export const STANDARD_ROUND_DEPARTMENTS = [
  "عيادة",
  "فحوصات",
  "قسم داخلي",
  "عمليات",
  "إفاقة",
] as const;

export type StandardRoundDepartment = typeof STANDARD_ROUND_DEPARTMENTS[number];

export interface RoundObservation {
  id: string;
  location?: string; // الموقع / القسم (اختياري: عيادة / فحوصات / عمليات / افاقة / قسم داخلي)
  observation: string; // الملاحظات
  recommendation: string; // التوصيات / الإجراء التصحيحي
  responsible: string; // المسؤول عن التنفيذ
  status: 'completed' | 'in_progress' | 'pending';
  dueDate?: string;
}

export interface RoundReport {
  id: string;
  title: string; // تقرير المرور الاسبوعي
  department?: string; // قسم المرور (اختياري: عيادة / فحوصات / عمليات / افاقة / قسم داخلي / عام)
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

export interface AppExportBundle {
  version: string;
  exportedAt: string;
  centerSettings: CenterSettings;
  meetings: Meeting[];
  rounds: RoundReport[];
  topics: MeetingTopic[];
  monthlyTemplates?: MonthlyThemeTemplate[];
  handHygieneSessions?: WHOObservationSession[];
}

// ==========================================
// 🧼 WHO HAND HYGIENE OBSERVATION & COMPLIANCE TYPES
// (Based on WHO "SAVE LIVES: Clean Your Hands" Technical Reference Manual & Forms)
// ==========================================

export type WHOIndicationKey =
  | "bef_pat" // Before touching a patient
  | "bef_asept" // Before clean/aseptic procedure
  | "aft_bf" // After body fluid exposure risk
  | "aft_pat" // After touching a patient
  | "aft_surr"; // After touching patient surroundings

export type WHOActionKey = "HR" | "HW" | "missed" | "";

export interface WHOIndicationMeta {
  key: WHOIndicationKey;
  code: string; // "bef.pat.", "bef.asept.", etc.
  labelEn: string;
  labelAr: string;
  momentNumber: number; // 1 to 5
}

export const WHO_FIVE_MOMENTS: WHOIndicationMeta[] = [
  {
    key: "bef_pat",
    code: "bef.pat.",
    labelEn: "Before touching a patient",
    labelAr: "قبل ملامسة المريض (دواعي 1)",
    momentNumber: 1,
  },
  {
    key: "bef_asept",
    code: "bef.asept.",
    labelEn: "Before clean/aseptic procedure",
    labelAr: "قبل الإجراء النظيف / المعقم (دواعي 2)",
    momentNumber: 2,
  },
  {
    key: "aft_bf",
    code: "aft.b.f.",
    labelEn: "After body fluid exposure risk",
    labelAr: "بعد خطر التعرض لسوائل وإفرازات الجسم (دواعي 3)",
    momentNumber: 3,
  },
  {
    key: "aft_pat",
    code: "aft.pat.",
    labelEn: "After touching a patient",
    labelAr: "بعد ملامسة المريض (دواعي 4)",
    momentNumber: 4,
  },
  {
    key: "aft_surr",
    code: "aft.p.surr.",
    labelEn: "After touching patient surroundings",
    labelAr: "بعد ملامسة بيئة ومحيط المريض (دواعي 5)",
    momentNumber: 5,
  },
];

export interface WHOProfCategoryMeta {
  code: string;
  mainCategory: "1" | "2" | "3" | "4";
  mainNameEn: string;
  mainNameAr: string;
  subNameEn: string;
  subNameAr: string;
}

export const WHO_PROF_CATEGORIES: WHOProfCategoryMeta[] = [
  // 1. Nurse / Midwife
  { code: "1.1", mainCategory: "1", mainNameEn: "Nurse / Midwife", mainNameAr: "تمريض / قبالة", subNameEn: "Nurse", subNameAr: "ممرض / ممرضة" },
  { code: "1.2", mainCategory: "1", mainNameEn: "Nurse / Midwife", mainNameAr: "تمريض / قبالة", subNameEn: "Midwife", subNameAr: "قابلة / توليد" },
  { code: "1.3", mainCategory: "1", mainNameEn: "Nurse / Midwife", mainNameAr: "تمريض / قبالة", subNameEn: "Student Nurse", subNameAr: "طالب تمريض" },
  // 2. Auxiliary
  { code: "2.0", mainCategory: "2", mainNameEn: "Auxiliary", mainNameAr: "مساعد صحي / خدمات معاونة", subNameEn: "Auxiliary / Health Assistant", subNameAr: "مساعد صحي / معاون" },
  // 3. Medical Doctor
  { code: "3.1", mainCategory: "3", mainNameEn: "Medical Doctor", mainNameAr: "طبيب بشري", subNameEn: "Internal Medicine", subNameAr: "طبيب باطنة / تخصصات باطنية" },
  { code: "3.2", mainCategory: "3", mainNameEn: "Medical Doctor", mainNameAr: "طبيب بشري", subNameEn: "Surgeon", subNameAr: "جراح / جراحة عامة وتخصصية" },
  { code: "3.3", mainCategory: "3", mainNameEn: "Medical Doctor", mainNameAr: "طبيب بشري", subNameEn: "Anaesthetist / Emergency", subNameAr: "طبيب تخدير / عناية / طوارئ" },
  { code: "3.4", mainCategory: "3", mainNameEn: "Medical Doctor", mainNameAr: "طبيب بشري", subNameEn: "Paediatrician", subNameAr: "طبيب أطفال" },
  { code: "3.5", mainCategory: "3", mainNameEn: "Medical Doctor", mainNameAr: "طبيب بشري", subNameEn: "Gynaecologist", subNameAr: "طبيب نساء وتوليد" },
  { code: "3.6", mainCategory: "3", mainNameEn: "Medical Doctor", mainNameAr: "طبيب بشري", subNameEn: "Consultant", subNameAr: "استشاري" },
  { code: "3.7", mainCategory: "3", mainNameEn: "Medical Doctor", mainNameAr: "طبيب بشري", subNameEn: "Medical Student", subNameAr: "طالب طب / طبيب امتياز" },
  // 4. Other Health-Care Worker
  { code: "4.1", mainCategory: "4", mainNameEn: "Other Health-Care Worker", mainNameAr: "كادر صحي آخر", subNameEn: "Therapist (Physio/Speech)", subNameAr: "أخصائي علاج طبيعي / تأهيل" },
  { code: "4.2", mainCategory: "4", mainNameEn: "Other Health-Care Worker", mainNameAr: "كادر صحي آخر", subNameEn: "Technician (Lab/Rad/OR)", subNameAr: "فني (معمل / أشعة / عمليات)" },
  { code: "4.3", mainCategory: "4", mainNameEn: "Other Health-Care Worker", mainNameAr: "كادر صحي آخر", subNameEn: "Other (Dietician/Dentist/Pharm)", subNameAr: "صيدلي / أخصائي تغذية / أسنان" },
  { code: "4.4", mainCategory: "4", mainNameEn: "Other Health-Care Worker", mainNameAr: "كادر صحي آخر", subNameEn: "Student (Other)", subNameAr: "طالب كليات صحية أخرى" },
];

export const WHO_STANDARD_DEPARTMENTS = [
  "medical", // Medical (dermatology, neurology, etc.)
  "surgery", // Surgery (including neurosurgery, urology, EENT, ophthalmology)
  "mixed", // Mixed (medical & surgical)
  "obstetrics", // Obstetrics & Gynaecology
  "paediatrics", // Paediatrics & Neonates
  "intensive care", // Intensive care & Resuscitation (ICU/CCU)
  "emergency unit", // Emergency unit
  "ambulatory care", // Ambulatory care / Day Surgery / Outpatient
  "long term care", // Long term care & rehabilitation
  "other", // Other
] as const;

export interface WHOOpportunity {
  id: string;
  oppNumber: number; // 1 to 8 (or more)
  indications: WHOIndicationKey[]; // multiple indications can occur in one opportunity
  action: WHOActionKey; // HR, HW, missed, or ""
  gloves: boolean; // Gloves used while missing hand hygiene
}

export interface WHOColumnObservation {
  id: string;
  columnNumber: number; // 1 to 4
  profCatCode: string; // e.g. "1.1", "3.2", "4.2"
  profCatName: string; // e.g. "Nurse", "Surgeon"
  profMainCategory: "1" | "2" | "3" | "4";
  workersCount: number; // Number of observed HCWs
  opportunities: WHOOpportunity[]; // default 8 rows
}

export interface WHOObservationSession {
  id: string;
  sessionNumber: string | number;
  facility: string; // Facility name
  service: string; // Service / Division
  ward: string; // Ward / Unit
  department: string; // Department (from standardized nomenclature)
  periodNumber: string; // "1" (pre-intervention), "2" (post-intervention), or custom
  date: string; // yyyy-mm-dd or dd/mm/yyyy
  startTime: string; // hh:mm
  endTime: string; // hh:mm
  sessionDuration: number; // in minutes (e.g. 20)
  observer: string; // Observer initials / name
  pageNumber: string; // e.g. "1"
  city?: string;
  country?: string;
  columns: WHOColumnObservation[]; // 4 columns per WHO Observation Form
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Basic Compliance Calculation (Form Page 3)
export interface WHOBasicCategoryStats {
  oppCount: number;
  hwCount: number;
  hrCount: number;
  actCount: number;
  complianceRate: number; // %
}

export interface WHOSessionBasicRow {
  sessionNumber: string | number;
  sessionTitle?: string;
  department?: string;
  date?: string;
  nurse: WHOBasicCategoryStats; // Cat 1
  auxiliary: WHOBasicCategoryStats; // Cat 2
  doctor: WHOBasicCategoryStats; // Cat 3
  other: WHOBasicCategoryStats; // Cat 4
  total: WHOBasicCategoryStats; // Total per session
}

export interface WHOBasicComplianceSheetData {
  facility: string;
  period: string;
  setting: string;
  sessions: WHOSessionBasicRow[];
  totalNurse: WHOBasicCategoryStats;
  totalAuxiliary: WHOBasicCategoryStats;
  totalDoctor: WHOBasicCategoryStats;
  totalOther: WHOBasicCategoryStats;
  grandTotal: WHOBasicCategoryStats;
  overallComplianceRate: number;
}

// Optional Indication-Related Compliance Calculation (Form Page 4)
export interface WHOIndicationStats {
  indicCount: number;
  hwCount: number;
  hrCount: number;
  actCount: number;
  ratio: number; // (act / indic) * 100
}

export interface WHOSessionIndicationRow {
  sessionNumber: string | number;
  sessionTitle?: string;
  department?: string;
  date?: string;
  befPat: WHOIndicationStats; // Moment 1
  befAsept: WHOIndicationStats; // Moment 2
  aftBf: WHOIndicationStats; // Moment 3
  aftPat: WHOIndicationStats; // Moment 4
  aftSurr: WHOIndicationStats; // Moment 5
}

export interface WHOIndicationComplianceSheetData {
  facility: string;
  period: string;
  setting: string;
  sessions: WHOSessionIndicationRow[];
  totalBefPat: WHOIndicationStats;
  totalBefAsept: WHOIndicationStats;
  totalAftBf: WHOIndicationStats;
  totalAftPat: WHOIndicationStats;
  totalAftSurr: WHOIndicationStats;
  overallRatio: number;
}

