import { Client, Workout, Program, Coach } from "./types";
import { subDays, format } from "date-fns";

export const mockCoach: Coach = {
  id: "coach-1",
  email: "alex@coachos.io",
  name: "Alex Morgan",
  created_at: "2024-01-01T00:00:00Z",
};

function generateWorkouts(clientId: string, weeklyTarget: number, adherenceRate: number): Workout[] {
  const workouts: Workout[] = [];
  for (let i = 59; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayOfWeek = date.getDay();
    const isWorkoutDay = weeklyTarget >= 5
      ? dayOfWeek !== 0
      : weeklyTarget >= 3
      ? [1, 3, 5].includes(dayOfWeek)
      : [2, 5].includes(dayOfWeek);

    if (isWorkoutDay) {
      const rand = Math.random();
      const status = rand < adherenceRate ? "completed" : "missed";
      workouts.push({
        id: `w-${clientId}-${i}`,
        client_id: clientId,
        date: format(date, "yyyy-MM-dd"),
        status,
        notes: status === "completed" && rand > 0.7 ? "Great session, feeling strong!" : undefined,
        workout_type: ["Strength", "Cardio", "HIIT", "Mobility", "Upper Body", "Lower Body"][Math.floor(Math.random() * 6)],
        duration_minutes: status === "completed" ? Math.floor(Math.random() * 30) + 45 : undefined,
        created_at: date.toISOString(),
      });
    }
  }
  return workouts;
}

const programs: Program[] = [
  { id: "p-1", client_id: "c-1", name: "12-Week Strength Builder", weekly_target: 4, duration_weeks: 12, type: "strength", created_at: "2024-01-15T00:00:00Z" },
  { id: "p-2", client_id: "c-2", name: "Fat Loss Accelerator", weekly_target: 5, duration_weeks: 8, type: "fat_loss", created_at: "2024-02-01T00:00:00Z" },
  { id: "p-3", client_id: "c-3", name: "Athletic Performance", weekly_target: 6, duration_weeks: 16, type: "athletic", created_at: "2024-01-20T00:00:00Z" },
  { id: "p-4", client_id: "c-4", name: "Beginner Mobility", weekly_target: 3, duration_weeks: 6, type: "mobility", created_at: "2024-03-01T00:00:00Z" },
  { id: "p-5", client_id: "c-5", name: "Custom Body Recomp", weekly_target: 4, duration_weeks: 12, type: "custom", created_at: "2024-02-15T00:00:00Z" },
  { id: "p-6", client_id: "c-6", name: "Marathon Prep", weekly_target: 5, duration_weeks: 20, type: "athletic", created_at: "2024-01-10T00:00:00Z" },
  { id: "p-7", client_id: "c-7", name: "Power Lifting Cycle", weekly_target: 4, duration_weeks: 10, type: "strength", created_at: "2024-03-05T00:00:00Z" },
  { id: "p-8", client_id: "c-8", name: "Summer Shred", weekly_target: 5, duration_weeks: 8, type: "fat_loss", created_at: "2024-02-20T00:00:00Z" },
];

const clientsRaw = [
  { id: "c-1", name: "Jordan Lee", goal: "Build muscle mass and strength", email: "jordan@example.com", adherenceRate: 0.88 },
  { id: "c-2", name: "Sarah Kim", goal: "Lose 15 lbs, tone up", email: "sarah@example.com", adherenceRate: 0.52 },
  { id: "c-3", name: "Marcus Webb", goal: "Improve athletic performance", email: "marcus@example.com", adherenceRate: 0.95 },
  { id: "c-4", name: "Priya Patel", goal: "Reduce back pain, improve flexibility", email: "priya@example.com", adherenceRate: 0.30 },
  { id: "c-5", name: "Tom Briggs", goal: "Body recomposition", email: "tom@example.com", adherenceRate: 0.68 },
  { id: "c-6", name: "Elena Vasquez", goal: "Run a sub-4hr marathon", email: "elena@example.com", adherenceRate: 0.82 },
  { id: "c-7", name: "Deon Harris", goal: "Increase powerlifting totals", email: "deon@example.com", adherenceRate: 0.22 },
  { id: "c-8", name: "Mei Zhang", goal: "Summer body composition", email: "mei@example.com", adherenceRate: 0.60 },
];

export const mockClients: Client[] = clientsRaw.map((c) => {
  const program = programs.find((p) => p.client_id === c.id)!;
  const workouts = generateWorkouts(c.id, program.weekly_target, c.adherenceRate);
  return {
    id: c.id,
    coach_id: "coach-1",
    name: c.name,
    goal: c.goal,
    email: c.email,
    created_at: program.created_at,
    program,
    workouts,
  };
});

export const programTemplates = [
  {
    id: "t-1",
    name: "Strength Builder",
    type: "strength" as const,
    weekly_target: 4,
    duration_weeks: 12,
    description: "Progressive overload program focused on compound movements.",
    exercises: ["Squat", "Deadlift", "Bench Press", "Overhead Press"],
  },
  {
    id: "t-2",
    name: "Fat Loss Accelerator",
    type: "fat_loss" as const,
    weekly_target: 5,
    duration_weeks: 8,
    description: "High-frequency training with cardio to maximize fat loss.",
    exercises: ["HIIT Circuits", "Metabolic Conditioning", "Steady State Cardio"],
  },
  {
    id: "t-3",
    name: "Athletic Performance",
    type: "athletic" as const,
    weekly_target: 6,
    duration_weeks: 16,
    description: "Sport-specific training for peak athletic performance.",
    exercises: ["Plyometrics", "Speed Work", "Agility Drills", "Power Training"],
  },
  {
    id: "t-4",
    name: "Mobility & Recovery",
    type: "mobility" as const,
    weekly_target: 3,
    duration_weeks: 6,
    description: "Improve flexibility, reduce pain, and enhance movement quality.",
    exercises: ["Yoga Flow", "Foam Rolling", "Stretching Sequences", "Breathwork"],
  },
];
