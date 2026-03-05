/**
 * src/lib/insights.ts
 * Rule-based AI-style insight generation — zero API cost.
 * Detects patterns and generates actionable coaching recommendations.
 */
import type { Client, InsightItem } from "../types";
import { getAdherenceFromWorkouts } from "./adherence";

// ─── Pattern detectors ────────────────────────────────────────────────────────

function detectDayPattern(client: Client, day: number): number {
  const workouts = client.workouts ?? [];
  return workouts.filter((w) => {
    const d = new Date(w.date);
    return d.getDay() === day && w.status === "missed";
  }).length;
}

function detectConsecutiveMisses(client: Client): number {
  const workouts = [...(client.workouts ?? [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let streak = 0;
  for (const w of workouts) {
    if (w.status === "missed") streak++;
    else break;
  }
  return streak;
}

function detectInactiveDays(client: Client): number {
  const workouts = client.workouts ?? [];
  const completedDates = workouts
    .filter((w) => w.status === "completed")
    .map((w) => new Date(w.date).getTime());
  if (completedDates.length === 0) return 99;
  const last = Math.max(...completedDates);
  return Math.round((Date.now() - last) / (1000 * 60 * 60 * 24));
}

// ─── Main insight generator ──────────────────────────────────────────────────

export function generateInsights(clients: Client[]): InsightItem[] {
  const insights: InsightItem[] = [];

  clients.forEach((client) => {
    const score = client.adherenceScore ?? 0;
    const momentum = client.momentum;
    const streak = client.streak ?? 0;
    const workouts = client.workouts ?? [];
    const weeklyTarget = client.program?.weekly_target ?? 3;

    // ── Critical adherence ──────────────────────────────────────────────────
    if (score < 40) {
      insights.push({
        type: "critical",
        title: "🚨 Critical Adherence Alert",
        message: `${client.name} is at ${score}% adherence. Immediate check-in recommended to prevent dropout.`,
        client_id: client.id,
        client_name: client.name,
        action: "Schedule call",
      });
    }

    // ── At-risk with declining trend ────────────────────────────────────────
    if (momentum === "declining" && score < 70) {
      const recentScore = getAdherenceFromWorkouts(workouts, weeklyTarget, 14);
      const olderScore = getAdherenceFromWorkouts(workouts, weeklyTarget, 28);
      const drop = olderScore - recentScore;
      if (drop > 10) {
        insights.push({
          type: "warning",
          title: "📉 Declining Momentum",
          message: `${client.name}'s adherence dropped ${drop}% in the last 2 weeks. Consider adjusting program difficulty or schedule.`,
          client_id: client.id,
          client_name: client.name,
          action: "Adjust program",
        });
      }
    }

    // ── Consecutive misses ──────────────────────────────────────────────────
    const missStreak = detectConsecutiveMisses(client);
    if (missStreak >= 3) {
      insights.push({
        type: "warning",
        title: "⛔ Missed Workout Streak",
        message: `${client.name} has missed ${missStreak} sessions in a row. Send a motivational message to re-engage.`,
        client_id: client.id,
        client_name: client.name,
        action: "Send message",
      });
    }

    // ── Day-of-week pattern ─────────────────────────────────────────────────
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    for (let day = 0; day < 7; day++) {
      const missed = detectDayPattern(client, day);
      if (missed >= 3) {
        insights.push({
          type: "info",
          title: "📅 Pattern Detected",
          message: `${client.name} has missed ${missed} ${dayNames[day]}s in a row. Consider rescheduling that day's session.`,
          client_id: client.id,
          client_name: client.name,
          action: "Reschedule",
        });
        break; // Only one day pattern per client
      }
    }

    // ── Long inactivity ─────────────────────────────────────────────────────
    const inactive = detectInactiveDays(client);
    if (inactive >= 10) {
      insights.push({
        type: "critical",
        title: "😴 Extended Inactivity",
        message: `${client.name} hasn't completed a workout in ${inactive} days. They may be considering quitting.`,
        client_id: client.id,
        client_name: client.name,
        action: "Check in now",
      });
    }

    // ── Streak achievement ──────────────────────────────────────────────────
    if (streak >= 14) {
      insights.push({
        type: "success",
        title: "🔥 2-Week Streak!",
        message: `${client.name} is on a ${streak}-day streak — an incredible achievement. Celebrate with them!`,
        client_id: client.id,
        client_name: client.name,
      });
    } else if (streak >= 7) {
      insights.push({
        type: "success",
        title: "🔥 7-Day Streak",
        message: `${client.name} is on a ${streak}-day streak! Send them an encouragement message to keep momentum.`,
        client_id: client.id,
        client_name: client.name,
      });
    }

    // ── Improving trend ─────────────────────────────────────────────────────
    if (momentum === "improving" && score >= 70) {
      insights.push({
        type: "info",
        title: "📈 Positive Trend",
        message: `${client.name} is showing great improvement this fortnight. Consider progressing their program to a new phase.`,
        client_id: client.id,
        client_name: client.name,
        action: "Progress program",
      });
    }

    // ── Perfect week ─────────────────────────────────────────────────────────
    if (score >= 95) {
      insights.push({
        type: "success",
        title: "⭐ Near-Perfect Adherence",
        message: `${client.name} is at ${score}% adherence — elite consistency. They're a great candidate for a program upgrade.`,
        client_id: client.id,
        client_name: client.name,
      });
    }
  });

  // Prioritise: critical → warning → info → success
  const priority = { critical: 0, warning: 1, info: 2, success: 3 };
  return insights
    .sort((a, b) => priority[a.type] - priority[b.type])
    .slice(0, 8);
}
