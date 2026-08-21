import { StandardObservationItem, RoundObservation, MeetingDecision } from "../types";
import { STANDARD_OBSERVATIONS_LIBRARY } from "../data/standardObservations";

export const CUSTOM_OBSERVATIONS_STORAGE_KEY = "ic_custom_observations";
export const CUSTOM_OBSERVATIONS_EVENT = "ic_custom_observations_updated";

/**
 * Normalizes text for deduplication comparison (trims, collapses whitespace, lowercase, removes punctuation)
 */
export function normalizeObsText(text: string): string {
  return (text || "")
    .trim()
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟?،]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Retrieves all custom saved observations from localStorage safely
 */
export function getCustomObservations(): StandardObservationItem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_OBSERVATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to load custom observations from storage:", err);
    return [];
  }
}

/**
 * Saves custom observations array to localStorage and broadcasts an update event
 */
export function saveCustomObservationsList(items: StandardObservationItem[]): void {
  try {
    localStorage.setItem(CUSTOM_OBSERVATIONS_STORAGE_KEY, JSON.stringify(items));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CUSTOM_OBSERVATIONS_EVENT, { detail: items }));
    }
  } catch (err) {
    console.error("Failed to persist custom observations:", err);
  }
}

/**
 * Combines default library and user custom observations (custom items placed first for priority)
 */
export function getAllCombinedObservations(): StandardObservationItem[] {
  const custom = getCustomObservations();
  const customObsTexts = new Set(custom.map((c) => normalizeObsText(c.observation)));
  
  // Exclude standard items that match user customized ones exactly
  const standardFiltered = STANDARD_OBSERVATIONS_LIBRARY.filter(
    (std) => !customObsTexts.has(normalizeObsText(std.observation))
  );

  return [...custom, ...standardFiltered];
}

/**
 * Persists a single custom observation or updates it if already exists
 */
export function persistSingleObservation(item: {
  observation: string;
  recommendation: string;
  location?: string;
  responsible?: string;
  duration?: string;
  monitoringMethod?: string;
  category?: string;
  severity?: "critical" | "high" | "medium" | "low";
  source?: "user_round" | "user_meeting" | "manual";
}): boolean {
  const obsText = (item.observation || "").trim();
  if (obsText.length < 3) return false;

  const currentList = getCustomObservations();
  const normalizedNew = normalizeObsText(obsText);

  const existingIdx = currentList.findIndex(
    (existing) => normalizeObsText(existing.observation) === normalizedNew
  );

  const nowIso = new Date().toISOString();

  if (existingIdx >= 0) {
    // Update existing item with newer recommendation/details if provided
    const existing = currentList[existingIdx];
    currentList[existingIdx] = {
      ...existing,
      recommendation: item.recommendation?.trim() || existing.recommendation,
      location: item.location?.trim() || existing.location,
      responsible: item.responsible?.trim() || existing.responsible,
      duration: item.duration?.trim() || existing.duration,
      monitoringMethod: item.monitoringMethod?.trim() || existing.monitoringMethod,
      category: item.category || existing.category || "ملاحظات المستخدم المخصصة",
      updatedAt: nowIso,
    };
  } else {
    // Check if it's already identical to an existing default standard item
    const stdMatch = STANDARD_OBSERVATIONS_LIBRARY.find(
      (s) => normalizeObsText(s.observation) === normalizedNew
    );

    const newItem: StandardObservationItem = {
      id: `custom-obs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      category: item.category || stdMatch?.category || "ملاحظات المستخدم المخصصة",
      location: item.location || stdMatch?.location || "عام",
      observation: obsText,
      recommendation: item.recommendation?.trim() || stdMatch?.recommendation || "اتخاذ الإجراء التصحيحي اللازم فوراً.",
      responsible: item.responsible?.trim() || stdMatch?.responsible || "مشرف التمريض / مسؤول مكافحة العدوى",
      duration: item.duration?.trim() || stdMatch?.duration || "فوري",
      monitoringMethod: item.monitoringMethod?.trim() || stdMatch?.monitoringMethod || "المرور الميداني الدوري والملاحظة المباشرة",
      severity: item.severity || stdMatch?.severity || "medium",
      standardRef: item.source === "user_meeting" 
        ? "قرار معتمد من محضر اجتماع مكافحة العدوى"
        : "ملاحظة مسجلة ومحفوظة من جولات المرور الميداني",
      isCustom: true,
      createdAt: nowIso,
    };

    currentList.unshift(newItem);
  }

  saveCustomObservationsList(currentList);
  return true;
}

/**
 * Automatically persists all valid observations from a Round Report
 */
export function autoPersistObservationsFromRound(
  observations: RoundObservation[],
  defaultDepartment?: string
): number {
  if (!Array.isArray(observations) || observations.length === 0) return 0;

  let addedOrUpdatedCount = 0;
  for (const obs of observations) {
    if (obs.observation && obs.observation.trim().length >= 3) {
      const saved = persistSingleObservation({
        observation: obs.observation,
        recommendation: obs.recommendation || "",
        location: obs.location || defaultDepartment || "عام",
        responsible: obs.responsible,
        duration: obs.dueDate || "فوري",
        source: "user_round",
        category: obs.location || defaultDepartment || "ملاحظات المرور الميداني",
      });
      if (saved) addedOrUpdatedCount++;
    }
  }

  return addedOrUpdatedCount;
}

/**
 * Automatically persists all valid decisions and topics from a Meeting
 */
export function autoPersistDecisionsFromMeeting(
  decisions: MeetingDecision[],
  meetingTitle?: string
): number {
  if (!Array.isArray(decisions) || decisions.length === 0) return 0;

  let addedOrUpdatedCount = 0;
  for (const dec of decisions) {
    if (dec.topic && dec.topic.trim().length >= 3) {
      const saved = persistSingleObservation({
        observation: dec.topic,
        recommendation: dec.decision || "",
        location: "اجتماع اللجنة",
        responsible: dec.responsible,
        duration: dec.duration || "فوري",
        monitoringMethod: dec.monitoringMethod || "متابعة التنفيذ في الاجتماع القادم",
        source: "user_meeting",
        category: "قرارات اجتماعات مكافحة العدوى",
        severity: "medium",
      });
      if (saved) addedOrUpdatedCount++;
    }
  }

  return addedOrUpdatedCount;
}

/**
 * Deletes a custom observation by its ID
 */
export function deleteCustomObservationById(id: string): void {
  const list = getCustomObservations();
  const filtered = list.filter((item) => item.id !== id);
  saveCustomObservationsList(filtered);
}
