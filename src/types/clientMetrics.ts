export type ClientMetrics = {
  client_id: string;
  name: string;
  goal: string;
  program_id: string | null;
  coach_id: string;
  total_sessions: number;
  completed_sessions: number;
  missed_sessions: number;
  adherence: number;
  status: "on_track" | "at_risk" | "critical";
};
