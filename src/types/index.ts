// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Coach {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Client {
  id: string;
  coach_id: string;
  program_id?: string | null;
  name: string;
  goal: string;
  email?: string;
  phone?: string;
  avatar?: string;
  created_at: string;
  // Enriched at runtime
  program?: Program;
  workouts?: Workout[];
  adherenceScore?: number;
  riskLevel?: RiskLevel;
  streak?: number;
  momentum?: MomentumTrend;
}

export interface Program {
  id: string;
  client_id?: string | null;
  coach_id?: string;
  is_template?: boolean;
  description?: string;
  exercises?: string[];
  name: string;
  weekly_target: number;
  duration_weeks: number;
  type: ProgramType;
  created_at: string;
}

export interface Workout {
  id: string;
  client_id: string;
  date: string;
  status: WorkoutStatus;
  notes?: string;
  workout_type?: string;
  duration_minutes?: number;
  created_at: string;
}

export interface Alert {
  id: string;
  coach_id: string;
  client_id: string;
  type: AlertType;
  message: string;
  read: boolean;
  created_at: string;
  client_name?: string; // enriched
}

export interface InsightItem {
  type: "warning" | "success" | "info" | "critical";
  title: string;
  message: string;
  client_id?: string;
  client_name?: string;
  action?: string;
}

export interface RiskAssessment {
  client_id: string;
  client_name: string;
  score: number; // 0–100, higher = more at risk
  reasons: string[];
  level: RiskLevel;
  lastActive?: string;
  missedStreak?: number;
  trend: MomentumTrend;
}

export interface LeaderboardEntry {
  client_id: string;
  client_name: string;
  coach_id: string;
  adherenceScore: number;
  streak: number;
  leaderboardScore: number;
  rank: number;
  goal: string;
}

export interface DashboardStats {
  totalClients: number;
  avgAdherence: number;
  atRiskClients: number;
  criticalClients: number;
  goodClients: number;
  totalWorkoutsThisWeek: number;
}

// ─── Enums / Unions ───────────────────────────────────────────────────────────

export type WorkoutStatus = "completed" | "missed" | "scheduled";
export type RiskLevel = "good" | "risk" | "critical";
export type MomentumTrend = "improving" | "declining" | "stable";
export type ProgramType = "strength" | "fat_loss" | "athletic" | "mobility" | "custom";
export type PricingTier = "free" | "pro" | "business";
export type AlertType = "missed_workout" | "critical_adherence" | "streak_broken" | "declining_trend";

// ─── API response wrapper ─────────────────────────────────────────────────────

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
}
