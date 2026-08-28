import {
  WHOObservationSession,
  WHOBasicCategoryStats,
  WHOSessionBasicRow,
  WHOBasicComplianceSheetData,
  WHOIndicationStats,
  WHOSessionIndicationRow,
  WHOIndicationComplianceSheetData,
  WHOIndicationKey,
} from "../types";

/**
 * Calculates WHO Basic Compliance (Form Page 3)
 * Formula: Compliance (%) = (Actions / Opportunities) * 100
 * where Actions = Handwash (HW) + Handrub (HR)
 */
export function calculateWHOBasicCompliance(
  sessions: WHOObservationSession[],
  facilityName = "Waheed IPC",
  period = "الفترة الحالية (2026)",
  setting = "كافة الأقسام الطبية والجراحية"
): WHOBasicComplianceSheetData {
  const sessionRows: WHOSessionBasicRow[] = sessions.map((sess) => {
    // Initial category counters
    const catStats: Record<"1" | "2" | "3" | "4", { opp: number; hw: number; hr: number }> = {
      "1": { opp: 0, hw: 0, hr: 0 },
      "2": { opp: 0, hw: 0, hr: 0 },
      "3": { opp: 0, hw: 0, hr: 0 },
      "4": { opp: 0, hw: 0, hr: 0 },
    };

    let sessionTotalOpp = 0;
    let sessionTotalHW = 0;
    let sessionTotalHR = 0;

    (sess.columns || []).forEach((col) => {
      const mainCat = col.profMainCategory || "1";
      (col.opportunities || []).forEach((opp) => {
        // An opportunity is counted if it has at least one indication selected OR has an action
        const hasIndication = opp.indications && opp.indications.length > 0;
        const hasAction = opp.action === "HR" || opp.action === "HW" || opp.action === "missed";

        if (hasIndication || hasAction) {
          catStats[mainCat].opp += 1;
          sessionTotalOpp += 1;

          if (opp.action === "HW") {
            catStats[mainCat].hw += 1;
            sessionTotalHW += 1;
          } else if (opp.action === "HR") {
            catStats[mainCat].hr += 1;
            sessionTotalHR += 1;
          }
        }
      });
    });

    const buildCatStats = (c: "1" | "2" | "3" | "4"): WHOBasicCategoryStats => {
      const opp = catStats[c].opp;
      const hw = catStats[c].hw;
      const hr = catStats[c].hr;
      const act = hw + hr;
      const rate = opp > 0 ? (act / opp) * 100 : 0;
      return {
        oppCount: opp,
        hwCount: hw,
        hrCount: hr,
        actCount: act,
        complianceRate: Math.round(rate * 10) / 10,
      };
    };

    const sessionAct = sessionTotalHW + sessionTotalHR;
    const sessionRate = sessionTotalOpp > 0 ? (sessionAct / sessionTotalOpp) * 100 : 0;

    return {
      sessionNumber: sess.sessionNumber || 1,
      sessionTitle: `${sess.ward || sess.department || "قسم"} (${sess.date})`,
      department: sess.department,
      date: sess.date,
      nurse: buildCatStats("1"),
      auxiliary: buildCatStats("2"),
      doctor: buildCatStats("3"),
      other: buildCatStats("4"),
      total: {
        oppCount: sessionTotalOpp,
        hwCount: sessionTotalHW,
        hrCount: sessionTotalHR,
        actCount: sessionAct,
        complianceRate: Math.round(sessionRate * 10) / 10,
      },
    };
  });

  // Calculate Column Totals (Sum across all sessions)
  const sumCat = (getter: (r: WHOSessionBasicRow) => WHOBasicCategoryStats): WHOBasicCategoryStats => {
    let opp = 0;
    let hw = 0;
    let hr = 0;
    sessionRows.forEach((r) => {
      const stat = getter(r);
      opp += stat.oppCount;
      hw += stat.hwCount;
      hr += stat.hrCount;
    });
    const act = hw + hr;
    const rate = opp > 0 ? (act / opp) * 100 : 0;
    return {
      oppCount: opp,
      hwCount: hw,
      hrCount: hr,
      actCount: act,
      complianceRate: Math.round(rate * 10) / 10,
    };
  };

  const totalNurse = sumCat((r) => r.nurse);
  const totalAuxiliary = sumCat((r) => r.auxiliary);
  const totalDoctor = sumCat((r) => r.doctor);
  const totalOther = sumCat((r) => r.other);
  const grandTotal = sumCat((r) => r.total);

  return {
    facility: facilityName,
    period,
    setting,
    sessions: sessionRows,
    totalNurse,
    totalAuxiliary,
    totalDoctor,
    totalOther,
    grandTotal,
    overallComplianceRate: grandTotal.complianceRate,
  };
}

/**
 * Calculates WHO Indication-Related Compliance (Form Page 4)
 * Formula: Ratio (act / indic) % = (Actions / Indications) * 100
 * where Actions = HW + HR associated with that indication
 */
export function calculateWHOIndicationCompliance(
  sessions: WHOObservationSession[],
  facilityName = "Waheed IPC",
  period = "الفترة الحالية (2026)",
  setting = "كافة الأقسام الطبية والجراحية"
): WHOIndicationComplianceSheetData {
  const sessionRows: WHOSessionIndicationRow[] = sessions.map((sess) => {
    // 5 moments counters
    const momentStats: Record<WHOIndicationKey, { indic: number; hw: number; hr: number }> = {
      bef_pat: { indic: 0, hw: 0, hr: 0 },
      bef_asept: { indic: 0, hw: 0, hr: 0 },
      aft_bf: { indic: 0, hw: 0, hr: 0 },
      aft_pat: { indic: 0, hw: 0, hr: 0 },
      aft_surr: { indic: 0, hw: 0, hr: 0 },
    };

    (sess.columns || []).forEach((col) => {
      (col.opportunities || []).forEach((opp) => {
        const indications = opp.indications || [];
        indications.forEach((indKey) => {
          if (momentStats[indKey]) {
            momentStats[indKey].indic += 1;
            if (opp.action === "HW") {
              momentStats[indKey].hw += 1;
            } else if (opp.action === "HR") {
              momentStats[indKey].hr += 1;
            }
          }
        });
      });
    });

    const buildIndStats = (key: WHOIndicationKey): WHOIndicationStats => {
      const indic = momentStats[key].indic;
      const hw = momentStats[key].hw;
      const hr = momentStats[key].hr;
      const act = hw + hr;
      const ratio = indic > 0 ? (act / indic) * 100 : 0;
      return {
        indicCount: indic,
        hwCount: hw,
        hrCount: hr,
        actCount: act,
        ratio: Math.round(ratio * 10) / 10,
      };
    };

    return {
      sessionNumber: sess.sessionNumber || 1,
      sessionTitle: `${sess.ward || sess.department || "قسم"} (${sess.date})`,
      department: sess.department,
      date: sess.date,
      befPat: buildIndStats("bef_pat"),
      befAsept: buildIndStats("bef_asept"),
      aftBf: buildIndStats("aft_bf"),
      aftPat: buildIndStats("aft_pat"),
      aftSurr: buildIndStats("aft_surr"),
    };
  });

  // Calculate totals per moment
  const sumMoment = (getter: (r: WHOSessionIndicationRow) => WHOIndicationStats): WHOIndicationStats => {
    let indic = 0;
    let hw = 0;
    let hr = 0;
    sessionRows.forEach((r) => {
      const stat = getter(r);
      indic += stat.indicCount;
      hw += stat.hwCount;
      hr += stat.hrCount;
    });
    const act = hw + hr;
    const ratio = indic > 0 ? (act / indic) * 100 : 0;
    return {
      indicCount: indic,
      hwCount: hw,
      hrCount: hr,
      actCount: act,
      ratio: Math.round(ratio * 10) / 10,
    };
  };

  const totalBefPat = sumMoment((r) => r.befPat);
  const totalBefAsept = sumMoment((r) => r.befAsept);
  const totalAftBf = sumMoment((r) => r.aftBf);
  const totalAftPat = sumMoment((r) => r.aftPat);
  const totalAftSurr = sumMoment((r) => r.aftSurr);

  const totalIndications =
    totalBefPat.indicCount +
    totalBefAsept.indicCount +
    totalAftBf.indicCount +
    totalAftPat.indicCount +
    totalAftSurr.indicCount;

  const totalActs =
    totalBefPat.actCount +
    totalBefAsept.actCount +
    totalAftBf.actCount +
    totalAftPat.actCount +
    totalAftSurr.actCount;

  const overallRatio = totalIndications > 0 ? Math.round((totalActs / totalIndications) * 1000) / 10 : 0;

  return {
    facility: facilityName,
    period,
    setting,
    sessions: sessionRows,
    totalBefPat,
    totalBefAsept,
    totalAftBf,
    totalAftPat,
    totalAftSurr,
    overallRatio,
  };
}

/**
 * Creates an empty fresh WHO Observation Session
 */
export function createEmptyWHOSession(
  sessionNumber: number | string,
  facilityName = "Waheed IPC",
  observer = "م/ أحمد وحيد شعبان",
  department = "surgery"
): WHOObservationSession {
  const now = new Date();
  const currentDate = now.toISOString().split("T")[0];

  const defaultColumns = [
    {
      id: `col-1-${Date.now()}`,
      columnNumber: 1,
      profCatCode: "1.1",
      profCatName: "Nurse",
      profMainCategory: "1" as const,
      workersCount: 2,
      opportunities: Array.from({ length: 8 }, (_, idx) => ({
        id: `opp-1-${idx + 1}-${Date.now()}`,
        oppNumber: idx + 1,
        indications: [] as WHOIndicationKey[],
        action: "" as const,
        gloves: false,
      })),
    },
    {
      id: `col-2-${Date.now()}`,
      columnNumber: 2,
      profCatCode: "3.2",
      profCatName: "Surgeon",
      profMainCategory: "3" as const,
      workersCount: 1,
      opportunities: Array.from({ length: 8 }, (_, idx) => ({
        id: `opp-2-${idx + 1}-${Date.now()}`,
        oppNumber: idx + 1,
        indications: [] as WHOIndicationKey[],
        action: "" as const,
        gloves: false,
      })),
    },
    {
      id: `col-3-${Date.now()}`,
      columnNumber: 3,
      profCatCode: "2.0",
      profCatName: "Auxiliary",
      profMainCategory: "2" as const,
      workersCount: 1,
      opportunities: Array.from({ length: 8 }, (_, idx) => ({
        id: `opp-3-${idx + 1}-${Date.now()}`,
        oppNumber: idx + 1,
        indications: [] as WHOIndicationKey[],
        action: "" as const,
        gloves: false,
      })),
    },
    {
      id: `col-4-${Date.now()}`,
      columnNumber: 4,
      profCatCode: "4.2",
      profCatName: "Technician",
      profMainCategory: "4" as const,
      workersCount: 1,
      opportunities: Array.from({ length: 8 }, (_, idx) => ({
        id: `opp-4-${idx + 1}-${Date.now()}`,
        oppNumber: idx + 1,
        indications: [] as WHOIndicationKey[],
        action: "" as const,
        gloves: false,
      })),
    },
  ];

  return {
    id: `who-sess-${Date.now()}`,
    sessionNumber,
    facility: facilityName,
    service: "الجراحة والعمليات",
    ward: "جناح العمليات والعيادات",
    department,
    periodNumber: "1",
    date: currentDate,
    startTime: "10:00",
    endTime: "10:20",
    sessionDuration: 20,
    observer,
    pageNumber: "1",
    city: "Cairo",
    country: "Egypt",
    columns: defaultColumns,
    notes: "جلسة رصد مطابقة لنموذج منظمة الصحة العالمية المعتمد (WHO Observation Form)",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}
