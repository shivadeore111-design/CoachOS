import { supabase } from "./supabase";
import type { ClientMetrics } from "../types/clientMetrics";

export async function getClientMetrics(coachId: string): Promise<ClientMetrics[]> {
  const { data, error } = await supabase
    .from("client_metrics")
    .select("*")
    .eq("coach_id", coachId);

  if (error) {
    console.error("Metrics load error:", error);
    throw error;
  }

  return (data ?? []) as ClientMetrics[];
}

export async function getLeaderboard(): Promise<ClientMetrics[]> {
  const { data, error } = await supabase
    .from("client_metrics")
    .select("*")
    .order("adherence", { ascending: false });

  if (error) throw error;

  return (data ?? []) as ClientMetrics[];
}
