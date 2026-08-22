import { StandardObservationItem } from "../types";
import { STANDARD_OBSERVATIONS_LIBRARY } from "./standardObservations";

// IDs of the 35 field observations newly added today
export const TODAY_ADDED_OBSERVATION_IDS: string[] = [
  "obs-206", "obs-207", "obs-208", "obs-209", "obs-210",
  "obs-211", "obs-212", "obs-213", "obs-214", "obs-215",
  "obs-216", "obs-217", "obs-218", "obs-219", "obs-220",
  "obs-221", "obs-222", "obs-223", "obs-224", "obs-225",
  "obs-226", "obs-227", "obs-228", "obs-229", "obs-230",
  "obs-231", "obs-232", "obs-233", "obs-234", "obs-235",
  "obs-236", "obs-237", "obs-238", "obs-239", "obs-240"
];

// Helper to check if an observation ID belongs to the 35 today's summary
export const isTodaySummaryObservation = (id: string): boolean => {
  return TODAY_ADDED_OBSERVATION_IDS.includes(id);
};

// Helper to retrieve today's 35 added observations
export const getTodayAddedObservations = (): StandardObservationItem[] => {
  const idSet = new Set(TODAY_ADDED_OBSERVATION_IDS);
  return STANDARD_OBSERVATIONS_LIBRARY.filter((item) => idSet.has(item.id));
};

/**
 * Sorts any list of observations so that the 35 summary observations appear first at the top
 */
export const sortWithTodaySummaryFirst = <T extends { id: string; location?: string; category?: string }>(
  items: T[],
  preferredLocation?: string
): T[] => {
  return [...items].sort((a, b) => {
    const aIsSummary = TODAY_ADDED_OBSERVATION_IDS.includes(a.id);
    const bIsSummary = TODAY_ADDED_OBSERVATION_IDS.includes(b.id);
    if (aIsSummary && !bIsSummary) return -1;
    if (!aIsSummary && bIsSummary) return 1;

    // If both are or aren't summary, prioritize matching preferredLocation if provided
    if (preferredLocation) {
      const pref = preferredLocation.toLowerCase();
      const aLoc = (a.location || "").toLowerCase();
      const bLoc = (b.location || "").toLowerCase();
      const aCat = (a.category || "").toLowerCase();
      const bCat = (b.category || "").toLowerCase();

      const aLocMatch = aLoc.includes(pref) || aCat.includes(pref) || pref.includes(aLoc);
      const bLocMatch = bLoc.includes(pref) || bCat.includes(pref) || pref.includes(bLoc);

      if (aLocMatch && !bLocMatch) return -1;
      if (!aLocMatch && bLocMatch) return 1;
    }

    return 0;
  });
};
