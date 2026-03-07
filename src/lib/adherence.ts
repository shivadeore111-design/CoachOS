import { Workout, MomentumTrend } from "./types";
import { subDays, format, parseISO, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";

function toPercent(completed: number, planned: number): number {
  if (planned === 0) return 0;
  const score = (completed / planned) * 100;
  return Math.min(100, Math.round(score));
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
  return toPercent(completed, planned);
}

export function calculateAdherence(
  workouts: Workout[],
  expectedWorkouts: number,
  days = 30
): number {
  const cutoff = subDays(new Date(), days);
  const completed = workouts.filter(
    (w) => new Date(w.date) >= cutoff && w.status === "completed"
  ).length;
  return toPercent(completed, expectedWorkouts);
}

export function calculateStreak(workouts: Workout[]): number {
  const completed = workouts
    .filter((w) => w.status === "completed")
    .map((w) => w.date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (completed.length === 0) return 0;

  let streak = 0;
  const currentDate = new Date();
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
    const score = toPercent(completed, weeklyTarget);
    result.push({
      label: `W${weeks - i}`,
      score,
    });
  }
  return result;
}
