/**
 * Utility for syncing Infection Control Meetings, Field Rounds, and Action Plans
 * with Google Sheets via the Apps Script Web App endpoint.
 */
import { Meeting, RoundReport } from "../types";

export const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw8Un6zsH3kMX-ieKRW_ImtbdaR4STr3IxxVglEAUkru1Le28ZNtc8QLfncOAD0Cly-/exec";

/**
 * Get configured Google Apps Script Web App URL
 */
export function getGoogleSheetUrl(): string {
  return GOOGLE_APPS_SCRIPT_URL;
}

/**
 * Get configured Google Sheet ID from environment variables (SHEET_ID)
 */
export function getGoogleSheetId(): string {
  const metaEnv = (import.meta as any)?.env || {};
  const procEnv = (typeof process !== "undefined" && process.env) ? process.env : {};
  
  const envId =
    metaEnv.SHEET_ID ||
    metaEnv.VITE_SHEET_ID ||
    procEnv.SHEET_ID ||
    procEnv.VITE_SHEET_ID ||
    "";

  return typeof envId === "string" ? envId.trim() : "";
}

export interface SyncResponse {
  success: boolean;
  message?: string;
  error?: string;
  sheetName?: string;
  timestamp?: string;
}

/**
 * Save / Sync a single Meeting to Google Sheets
 */
export async function syncMeetingToGoogleSheets(
  meeting: Meeting,
  customSheetId?: string
): Promise<SyncResponse> {
  const url = getGoogleSheetUrl();
  const sheetId = customSheetId || getGoogleSheetId();

  try {
    const payload = {
      action: "save_meeting",
      sheetId: sheetId || undefined,
      data: {
        meetingNumber: meeting.meetingNumber,
        monthName: meeting.agenda && meeting.agenda.length > 0 ? meeting.agenda[0] : "اجتماع شهري",
        date: meeting.date,
        day: meeting.day,
        time: meeting.time,
        centerName: meeting.centerName,
        location: meeting.location,
        agenda: meeting.agenda,
        previousMeetingFollowUp: meeting.previousMeetingFollowUp,
        members: meeting.members,
        kpis: meeting.kpis,
        decisions: meeting.decisions,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Error syncing meeting to Google Sheets:", error);
    return {
      success: false,
      error: error?.message || "فشل الاتصال بـ Google Sheets",
    };
  }
}

/**
 * Save / Sync a single Field Round Report to Google Sheets
 */
export async function syncRoundToGoogleSheets(
  round: RoundReport,
  customSheetId?: string
): Promise<SyncResponse> {
  const url = getGoogleSheetUrl();
  const sheetId = customSheetId || getGoogleSheetId();

  try {
    const payload = {
      action: "save_round",
      sheetId: sheetId || undefined,
      data: {
        title: round.title,
        department: round.department || "عام",
        date: round.date,
        day: round.day,
        period: round.period,
        inspector: round.inspector,
        supervisorRole: round.supervisorRole,
        centerName: round.centerName,
        generalRecommendation: round.generalRecommendation,
        observations: round.observations,
        actionPlan: (round.observations || []).map((obs) => ({
          id: obs.id,
          observation: obs.observation,
          action: obs.recommendation,
          responsible: obs.responsible,
          status: obs.status,
          dueDate: obs.dueDate,
          location: obs.location,
        })),
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Error syncing round to Google Sheets:", error);
    return {
      success: false,
      error: error?.message || "فشل الاتصال بـ Google Sheets",
    };
  }
}

/**
 * Test connectivity with Google Apps Script Web App
 */
export async function testGoogleSheetsConnection(customSheetId?: string): Promise<{
  connected: boolean;
  statusText: string;
  sheetIdConfigured: boolean;
}> {
  const url = getGoogleSheetUrl();
  const sheetId = customSheetId || getGoogleSheetId();

  try {
    const testUrl = sheetId ? `${url}?sheetId=${encodeURIComponent(sheetId)}` : url;
    const response = await fetch(testUrl, { method: "GET" });
    const data = await response.json();

    return {
      connected: data.status === "online" || data.status === "ok" || Boolean(data.service),
      statusText: data.connectedSheet ? `متصل بالشيت: ${data.connectedSheet}` : "الخدمة متصلة وجاهزة للعمل",
      sheetIdConfigured: Boolean(sheetId),
    };
  } catch (error: any) {
    return {
      connected: false,
      statusText: error?.message || "تعذر الاتصال بالرابط",
      sheetIdConfigured: Boolean(sheetId),
    };
  }
}

