/**
 * src/hooks/useClients.ts
 * Shared hook — fetches clients with enriched adherence data.
 */
import { useState, useEffect, useCallback } from "react";
import { subDays, format } from "date-fns";
import { getClients } from "../lib/api";
import { calculateAdherence, calculateStreak, getMomentumTrend } from "../lib/adherence";
import { supabase } from "../lib/supabase";
import type { Client, Workout } from "../lib/types";

interface UseClientsResult {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

function getRiskLevel(score: number): Client["riskLevel"] {
  if (score >= 70) return "good";
  if (score >= 40) return "risk";
  return "critical";
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

    const clientsWithPrograms = (result.data ?? []) as Client[];
    const clientIds = clientsWithPrograms.map((c) => c.id);

    let workoutsByClient = new Map<string, Workout[]>();

    if (clientIds.length > 0) {
      const cutoffDate = format(subDays(new Date(), 30), "yyyy-MM-dd");
      const { data: workoutsData, error: workoutsError } = await supabase
        .from("workouts")
        .select("*, clients!inner(coach_id)")
        .eq("clients.coach_id", coachId)
        .gte("date", cutoffDate)
        .in("client_id", clientIds)
        .order("date", { ascending: false });

      if (workoutsError) {
        setError(workoutsError.message);
      } else {
        workoutsByClient = (workoutsData ?? []).reduce((acc, workout) => {
          const list = acc.get(workout.client_id) ?? [];
          list.push(workout as Workout);
          acc.set(workout.client_id, list);
          return acc;
        }, new Map<string, Workout[]>());
      }
    }

    // Enrich with computed fields
    const enriched: Client[] = clientsWithPrograms.map((c) => {
      const workouts = workoutsByClient.get(c.id) ?? [];
      const weeklyTarget = c.program?.weekly_target ?? 3;
      const expectedWorkouts = Math.max(1, weeklyTarget * 4);
      const adherenceScore = calculateAdherence(workouts, expectedWorkouts, 30);
      const riskLevel = getRiskLevel(adherenceScore);
      const streak = calculateStreak(workouts);
      const momentum = getMomentumTrend(workouts, weeklyTarget);
      return { ...c, workouts, adherenceScore, riskLevel, streak, momentum };
    });

    setClients(enriched);
    setLoading(false);
  }, [coachId]);

  useEffect(() => {
    load();
  }, [load]);

  return { clients, loading, error, refresh: load };
}
