/**
 * src/lib/alerts.ts
 * Alert creation helpers — triggered by workout logging & risk changes.
 */
import type { Alert, AlertType } from "../types";
import { createAlert } from "./api";

export async function createMissedWorkoutAlert(
  coachId: string,
  clientId: string,
  clientName: string,
  date: string
): Promise<void> {
  await createAlert({
    coach_id: coachId,
    client_id: clientId,
    type: "missed_workout" as AlertType,
    message: `${clientName} missed their workout on ${date}.`,
    client_name: clientName,
  });
}

export async function createCriticalAdherenceAlert(
  coachId: string,
  clientId: string,
  clientName: string,
  score: number
): Promise<void> {
  await createAlert({
    coach_id: coachId,
    client_id: clientId,
    type: "critical_adherence" as AlertType,
    message: `${clientName} has dropped to ${score}% adherence — immediate intervention recommended.`,
    client_name: clientName,
  });
}

export async function createDecliningTrendAlert(
  coachId: string,
  clientId: string,
  clientName: string,
  drop: number
): Promise<void> {
  await createAlert({
    coach_id: coachId,
    client_id: clientId,
    type: "declining_trend" as AlertType,
    message: `${clientName}'s adherence has declined ${drop}% in the past 2 weeks.`,
    client_name: clientName,
  });
}

export function getAlertIcon(type: AlertType): string {
  switch (type) {
    case "missed_workout": return "⚠️";
    case "critical_adherence": return "🚨";
    case "streak_broken": return "💔";
    case "declining_trend": return "📉";
    default: return "🔔";
  }
}

export function getAlertColor(type: AlertType): string {
  switch (type) {
    case "critical_adherence": return "border-red-200 bg-red-50";
    case "missed_workout": return "border-amber-200 bg-amber-50";
    case "declining_trend": return "border-orange-200 bg-orange-50";
    case "streak_broken": return "border-violet-200 bg-violet-50";
    default: return "border-slate-200 bg-slate-50";
  }
}

export function getAlertTextColor(type: AlertType): string {
  switch (type) {
    case "critical_adherence": return "text-red-700";
    case "missed_workout": return "text-amber-700";
    case "declining_trend": return "text-orange-700";
    case "streak_broken": return "text-violet-700";
    default: return "text-slate-700";
  }
}

export function formatAlertTime(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// Re-export the Alert type for convenience
export type { Alert };
