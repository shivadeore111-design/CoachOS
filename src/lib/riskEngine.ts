/**
 * src/lib/riskEngine.ts
 * Dropout risk engine — multi-factor risk scoring (0–100, higher = more at risk).
 */
import type { Client, RiskAssessment, Workout } from "../types";
import { getAdherenceFromWorkouts, getMomentumTrend } from "./adherence";
import { differenceInDays, parseISO } from "date-fns";

// ─── Factor weights ───────────────────────────────────────────────────────────

const WEIGHTS = {
  lowAdherence: 35,     // Below 40%
  decliningTrend: 25,   // Adherence falling over 2 weeks
  missedStreak: 20,     // 3+ consecutive missed workouts
  inactivity: 20,       // Days since last workout
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDaysSinceLastWorkout(workouts: Workout[]): number {
  const completed = workouts
    .filter((w) => w.status === "completed")
    .map((w) => w.date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (completed.length === 0) return 99;
  return differenceInDays(new Date(), parseISO(completed[0]));
}

function getMissedStreak(workouts: Workout[]): number {
  const sorted = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  let streak = 0;
  for (const w of sorted) {
    if (w.status === "missed") streak++;
    else break;
  }
  return streak;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function calculateDropoutRisk(client: Client): RiskAssessment {
  const workouts = client.workouts ?? [];
  const weeklyTarget = client.program?.weekly_target ?? 3;

  const adherence = getAdherenceFromWorkouts(workouts, weeklyTarget, 30);
  const recentAdherence = getAdherenceFromWorkouts(workouts, weeklyTarget, 14);
  const olderAdherence = getAdherenceFromWorkouts(workouts, weeklyTarget, 28);
  const trend = getMomentumTrend(workouts, weeklyTarget);
  const daysSinceLast = getDaysSinceLastWorkout(workouts);
  const missedStreak = getMissedStreak(workouts);

  let riskScore = 0;
  const reasons: string[] = [];

  // Factor 1: Low adherence
  if (adherence < 40) {
    riskScore += WEIGHTS.lowAdherence;
    reasons.push(`Adherence critically low at ${adherence}%`);
  } else if (adherence < 70) {
    riskScore += WEIGHTS.lowAdherence * 0.5;
    reasons.push(`Below-target adherence at ${adherence}%`);
  }

  // Factor 2: Declining trend
  const trendDrop = olderAdherence - recentAdherence;
  if (trend === "declining" && trendDrop > 15) {
    riskScore += WEIGHTS.decliningTrend;
    reasons.push(`Adherence dropped ${trendDrop}% over last 2 weeks`);
  } else if (trend === "declining") {
    riskScore += WEIGHTS.decliningTrend * 0.5;
    reasons.push("Slight downward trend in consistency");
  }

  // Factor 3: Missed workout streak
  if (missedStreak >= 4) {
    riskScore += WEIGHTS.missedStreak;
    reasons.push(`${missedStreak} consecutive missed workouts`);
  } else if (missedStreak >= 2) {
    riskScore += WEIGHTS.missedStreak * 0.5;
    reasons.push(`${missedStreak} missed workouts in a row`);
  }

  // Factor 4: Inactivity
  if (daysSinceLast >= 14) {
    riskScore += WEIGHTS.inactivity;
    reasons.push(`Inactive for ${daysSinceLast} days`);
  } else if (daysSinceLast >= 7) {
    riskScore += WEIGHTS.inactivity * 0.5;
    reasons.push(`${daysSinceLast} days since last session`);
  }

  const finalScore = Math.min(100, Math.round(riskScore));

  const level =
    finalScore >= 60 ? "critical"
    : finalScore >= 30 ? "risk"
    : "good";

  return {
    client_id: client.id,
    client_name: client.name,
    score: finalScore,
    reasons,
    level,
    lastActive: daysSinceLast < 99 ? `${daysSinceLast}d ago` : "Never",
    missedStreak,
    trend,
  };
}

export function rankByDropoutRisk(clients: Client[]): RiskAssessment[] {
  return clients
    .map(calculateDropoutRisk)
    .sort((a, b) => b.score - a.score);
}
