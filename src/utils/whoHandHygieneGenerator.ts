import {
  WHOObservationSession,
  WHOColumnObservation,
  WHOOpportunity,
  WHOIndicationKey,
  WHOActionKey,
  WHO_PROF_CATEGORIES,
} from "../types";

export interface WHOGeneratorCategoryItem {
  id: string;
  cat: "1" | "2" | "3" | "4";
  code: string;
  name: string;
  totalOpps: number;
  targetRate?: number;
}

export interface WHOGeneratorOptions {
  facilityName: string;
  departmentTitle: string;
  wardName: string;
  departmentCategory: string; // e.g. "surgery", "intensive care", "medical", etc.
  periodTitle: string;
  observerName: string;
  medicalDirector?: string;
  targetOverallCompliance: number; // e.g. 85

  // Dynamic Custom Categories Array
  customCategories?: WHOGeneratorCategoryItem[];

  // Category Target Compliance Percentages (Fallback)
  nurseComplianceRate?: number; // e.g. 90
  auxiliaryComplianceRate?: number; // e.g. 80
  doctorComplianceRate?: number; // e.g. 82
  otherComplianceRate?: number; // e.g. 85

  // Category Total Opportunities (Fallback)
  nurseTotalOpps?: number; // e.g. 40
  auxiliaryTotalOpps?: number; // e.g. 20
  doctorTotalOpps?: number; // e.g. 30
  otherTotalOpps?: number; // e.g. 10

  // Sessions Count
  sessionsCount: number; // e.g. 10

  // Alcohol Handrub Preference (vs Soap Handwash)
  handrubRatioPercent?: number; // e.g. 70 means 70% HR, 30% HW

  // Custom Notes
  notes?: string;
}

export function generateAccurateWHOSessions(options: WHOGeneratorOptions): WHOObservationSession[] {
  const sessionsCount = Math.max(1, Math.min(50, options.sessionsCount || 10));
  const hrRatio = (options.handrubRatioPercent ?? 70) / 100;

  // Use specific category rates or derive from overall target
  const overallTarget = options.targetOverallCompliance ?? 85;
  const nurseRate = options.nurseComplianceRate ?? Math.min(100, Math.round(overallTarget * 1.04));
  const doctorRate = options.doctorComplianceRate ?? Math.max(50, Math.round(overallTarget * 0.96));
  const auxRate = options.auxiliaryComplianceRate ?? Math.max(50, Math.round(overallTarget * 0.94));
  const otherRate = options.otherComplianceRate ?? overallTarget;

  // Build category config dynamically
  let oppsConfig: {
    id?: string;
    cat: "1" | "2" | "3" | "4";
    code: string;
    name: string;
    totalOpps: number;
    targetRate: number;
  }[];

  if (options.customCategories && options.customCategories.length > 0) {
    oppsConfig = options.customCategories.map((c) => ({
      id: c.id,
      cat: c.cat,
      code: c.code || (c.cat === "1" ? "1.1" : c.cat === "2" ? "2.0" : c.cat === "3" ? "3.1" : "4.2"),
      name: c.name,
      totalOpps: Math.max(1, c.totalOpps || 10),
      targetRate: c.targetRate !== undefined ? c.targetRate : overallTarget,
    }));
  } else {
    oppsConfig = [
      {
        cat: "1",
        code: "1.1",
        name: "تمريض / Nurse",
        totalOpps: Math.max(1, options.nurseTotalOpps || 40),
        targetRate: nurseRate,
      },
      {
        cat: "2",
        code: "2.0",
        name: "مساعد صحي / Auxiliary",
        totalOpps: Math.max(1, options.auxiliaryTotalOpps || 20),
        targetRate: auxRate,
      },
      {
        cat: "3",
        code: "3.1",
        name: "طبيب بشري / Medical Doctor",
        totalOpps: Math.max(1, options.doctorTotalOpps || 30),
        targetRate: doctorRate,
      },
      {
        cat: "4",
        code: "4.2",
        name: "كادر صحي آخر / Other HCW",
        totalOpps: Math.max(1, options.otherTotalOpps || 10),
        targetRate: otherRate,
      },
    ];
  }

  // Helper to split count across sessions as evenly as possible
  function distributeInteger(total: number, parts: number): number[] {
    const base = Math.floor(total / parts);
    let remainder = total % parts;
    const result: number[] = [];
    for (let i = 0; i < parts; i++) {
      if (remainder > 0) {
        result.push(base + 1);
        remainder--;
      } else {
        result.push(base);
      }
    }
    return result;
  }

  // Pre-calculate per-category plan
  const categoryPlans = oppsConfig.map((cfg) => {
    const oppsPerSession = distributeInteger(cfg.totalOpps, sessionsCount);
    const totalActions = Math.round(cfg.totalOpps * (cfg.targetRate / 100));
    const actionsPerSession = distributeInteger(totalActions, sessionsCount);

    return {
      ...cfg,
      totalActions,
      oppsPerSession,
      actionsPerSession,
    };
  });

  const indicationsPool: WHOIndicationKey[][] = [
    ["bef_pat"],
    ["bef_asept"],
    ["aft_bf"],
    ["aft_pat"],
    ["aft_surr"],
    ["bef_pat", "bef_asept"],
    ["aft_bf", "aft_pat"],
    ["aft_surr"],
    ["bef_pat"],
    ["aft_pat"],
  ];

  const now = new Date();
  const baseYear = now.getFullYear();
  const baseMonth = String(now.getMonth() + 1).padStart(2, "0");

  const sessions: WHOObservationSession[] = [];

  for (let sIdx = 0; sIdx < sessionsCount; sIdx++) {
    const sessionNum = sIdx + 1;
    const day = String(Math.min(28, (sIdx % 28) + 1)).padStart(2, "0");
    const dateStr = `${baseYear}/${baseMonth}/${day}`;
    const startHour = 8 + (sIdx % 6);
    const startMin = (sIdx * 15) % 60;
    const startTimeStr = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;
    const endMin = (startMin + 20) % 60;
    const endHour = startMin + 20 >= 60 ? startHour + 1 : startHour;
    const endTimeStr = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;

    const columns: WHOColumnObservation[] = categoryPlans.map((catPlan, colIdx) => {
      const oppCountForThisSession = catPlan.oppsPerSession[sIdx] || 0;
      const actCountForThisSession = Math.min(oppCountForThisSession, catPlan.actionsPerSession[sIdx] || 0);
      const missedCount = oppCountForThisSession - actCountForThisSession;

      // Distribute actions into HR vs HW
      const hrCount = Math.round(actCountForThisSession * hrRatio);
      const hwCount = actCountForThisSession - hrCount;

      const actionsList: WHOActionKey[] = [];
      for (let i = 0; i < hrCount; i++) actionsList.push("HR");
      for (let i = 0; i < hwCount; i++) actionsList.push("HW");
      for (let i = 0; i < missedCount; i++) actionsList.push("missed");

      // Generate exact opportunities
      const opportunities: WHOOpportunity[] = [];
      for (let o = 0; o < oppCountForThisSession; o++) {
        const action = actionsList[o] || "missed";
        const indIndex = (sIdx * 4 + colIdx * 3 + o) % indicationsPool.length;
        const indications = indicationsPool[indIndex];
        const gloves = action === "missed" && o % 2 === 0;

        opportunities.push({
          id: `opp-${sessionNum}-${colIdx + 1}-${o + 1}`,
          oppNumber: o + 1,
          indications,
          action,
          gloves,
        });
      }

      // Ensure at least 8 rows for official WHO observation form view
      while (opportunities.length < 8) {
        const nextNum = opportunities.length + 1;
        opportunities.push({
          id: `opp-empty-${sessionNum}-${colIdx + 1}-${nextNum}`,
          oppNumber: nextNum,
          indications: [],
          action: "",
          gloves: false,
        });
      }

      return {
        id: `col-${sessionNum}-${colIdx + 1}`,
        columnNumber: colIdx + 1,
        profCatCode: catPlan.code,
        profCatName: catPlan.name,
        profMainCategory: catPlan.cat,
        workersCount: Math.max(1, Math.min(4, Math.round(oppCountForThisSession / 2) || 1)),
        opportunities,
      };
    });

    sessions.push({
      id: `who-generated-session-${Date.now()}-${sessionNum}`,
      sessionNumber: sessionNum,
      facility: options.facilityName || "Waheed IPC",
      service: options.departmentTitle || "قسم مكافحة العدوى",
      ward: options.wardName || `جناح ${sessionNum}`,
      department: options.departmentCategory || "surgery",
      periodNumber: "1",
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      sessionDuration: 20,
      observer: options.observerName || "راصد مكافحة العدوى",
      pageNumber: String(sessionNum),
      city: "Cairo",
      country: "Egypt",
      columns,
      notes: options.notes || "تم الرصد الميداني وفق معايير منظمة الصحة العالمية WHO 5 Moments",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return sessions;
}
