import { Workout, RiskLevel, MomentumTrend, Insight, Client } from "./types";
import { subDays, format, parseISO, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";

export function calculateAdherence(completed: number, planned: number): number {
  if (planned === 0) return 0;
  const score = (completed / planned) * 100;
  return Math.min(100, Math.round(score));
}

export function getRiskLevel(score: number): RiskLevel {
  if (score < 40) return "critical";
  if (score < 70) return "risk";
  return "good";
}

export function getAdherenceFromWorkouts(
  workouts: Workout[],
  weeklyTarget: number,
  days = 30
): number {
  const cutoff = subDays(new Date(), days);
  const recent = workouts.filter((w) => new Date(w.date) >= cutoff);
  const completed = recent.filter((w) => w.status === "completed").length;
  const weeks = days / 7;
  const planned = Math.round(weeklyTarget * weeks);
  return calculateAdherence(completed, planned);
}

export function calculateStreak(workouts: Workout[]): number {
  const completed = workouts
    .filter((w) => w.status === "completed")
    .map((w) => w.date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (completed.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 60; i++) {
    const dateStr = format(subDays(currentDate, i), "yyyy-MM-dd");
    if (completed.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export function getMomentumTrend(workouts: Workout[], weeklyTarget: number): MomentumTrend {
  const recentScore = getAdherenceFromWorkouts(workouts, weeklyTarget, 14);
  const olderScore = getAdherenceFromWorkouts(workouts, weeklyTarget, 28);

  const diff = recentScore - olderScore;
  if (diff >= 10) return "improving";
  if (diff <= -10) return "declining";
  return "stable";
}

export function getWeeklyAdherenceData(
  workouts: Workout[],
  weeklyTarget: number,
  weeks = 8
): { label: string; score: number }[] {
  const result = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subDays(new Date(), i * 7));
    const weekEnd = endOfWeek(subDays(new Date(), i * 7));
    const weekWorkouts = workouts.filter((w) =>
      isWithinInterval(parseISO(w.date), { start: weekStart, end: weekEnd })
    );
    const completed = weekWorkouts.filter((w) => w.status === "completed").length;
    const score = calculateAdherence(completed, weeklyTarget);
    result.push({
      label: `W${weeks - i}`,
      score,
    });
  }
  return result;
}

export function generateInsights(clients: Client[]): Insight[] {
  const insights: Insight[] = [];

  clients.forEach((client) => {
    const score = client.adherenceScore ?? 0;
    const momentum = client.momentum;
    const streak = client.streak ?? 0;
    const workouts = client.workouts ?? [];

    // Critical alert
    if (score < 40) {
      insights.push({
        type: "critical",
        title: "Critical Adherence Alert",
        message: `${client.name} is at ${score}% adherence. Immediate check-in recommended.`,
        client_id: client.id,
        client_name: client.name,
      });
    }

    // Declining trend
    if (momentum === "declining" && score < 70) {
      insights.push({
        type: "warning",
        title: "Declining Momentum",
        message: `${client.name}'s adherence has dropped over the last 2 weeks. Consider adjusting their program.`,
        client_id: client.id,
        client_name: client.name,
      });
    }

    // Monday miss pattern
    const missedMondays = workouts.filter((w) => {
      const d = new Date(w.date);
      return d.getDay() === 1 && w.status === "missed";
    }).length;
    if (missedMondays >= 2) {
      insights.push({
        type: "warning",
        title: "Pattern Detected",
        message: `${client.name} has missed ${missedMondays} Mondays in a row. Consider moving their Monday session.`,
        client_id: client.id,
        client_name: client.name,
      });
    }

    // Streak achievement
    if (streak >= 7) {
      insights.push({
        type: "success",
        title: "🔥 Streak Achievement",
        message: `${client.name} is on a ${streak}-day streak! Send them an encouragement message.`,
        client_id: client.id,
        client_name: client.name,
      });
    }

    // Improving momentum
    if (momentum === "improving" && score >= 70) {
      insights.push({
        type: "info",
        title: "Positive Trend",
        message: `${client.name} is showing great improvement. Consider progressing their program.`,
        client_id: client.id,
        client_name: client.name,
      });
    }
  });

  return insights.slice(0, 6);
}
