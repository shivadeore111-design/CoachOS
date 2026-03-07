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

export interface Insight {
  type: "warning" | "success" | "info" | "critical";
  title: string;
  message: string;
  client_id?: string;
  client_name?: string;
}

export interface DashboardStats {
  totalClients: number;
  avgAdherence: number;
  atRiskClients: number;
  criticalClients: number;
  goodClients: number;
  totalWorkoutsThisWeek: number;
}

export type WorkoutStatus = "completed" | "missed" | "scheduled";
export type RiskLevel = "good" | "risk" | "critical";
export type MomentumTrend = "improving" | "declining" | "stable";
export type ProgramType = "strength" | "fat_loss" | "athletic" | "mobility" | "custom";
export type PricingTier = "free" | "pro" | "team";
