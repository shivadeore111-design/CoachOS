/**
 * src/hooks/useClients.ts
 * Shared hook — fetches clients with enriched adherence data.
 * Falls back to mock data when Supabase not configured (demo mode).
 */
import { useState, useEffect, useCallback } from "react";
import { getClients } from "../lib/api";
import { getAdherenceFromWorkouts, calculateStreak, getMomentumTrend } from "../lib/adherence";
import type { Client } from "../lib/types";

interface UseClientsResult {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useClients(coachId: string): UseClientsResult {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!coachId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const result = await getClients(coachId);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Enrich with computed fields
    const enriched: Client[] = (result.data ?? []).map((c) => {
      const workouts = c.workouts ?? [];
      const weeklyTarget = c.program?.weekly_target ?? 3;
      const adherenceScore = getAdherenceFromWorkouts(workouts, weeklyTarget);
      const riskLevel = adherenceScore < 40 ? "critical" : adherenceScore < 70 ? "risk" : "good";
      const streak = calculateStreak(workouts);
      const momentum = getMomentumTrend(workouts, weeklyTarget);
      return { ...c, adherenceScore, riskLevel, streak, momentum };
    });

    setClients(enriched);
    setLoading(false);
  }, [coachId]);

  useEffect(() => {
    load();
  }, [load]);

  return { clients, loading, error, refresh: load };
}
