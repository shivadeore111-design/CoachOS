import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { getClientMetrics } from "../lib/metrics";
import type { Client } from "../lib/types";
import type { ClientMetrics } from "../types/clientMetrics";

interface UseClientMetricsResult {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function toClient(metric: ClientMetrics): Client {
  return {
    id: metric.client_id,
    coach_id: metric.coach_id,
    program_id: metric.program_id,
    name: metric.name,
    goal: metric.goal,
    created_at: "",
    adherenceScore: metric.adherence,
    riskLevel:
      metric.status === "critical"
        ? "critical"
        : metric.status === "at_risk"
          ? "risk"
          : "good",
    workouts: [
      ...Array.from({ length: metric.completed_sessions }, (_, i) => ({
        id: `cm-completed-${metric.client_id}-${i}`,
        client_id: metric.client_id,
        date: "",
        status: "completed" as const,
        created_at: "",
      })),
      ...Array.from({ length: metric.missed_sessions }, (_, i) => ({
        id: `cm-missed-${metric.client_id}-${i}`,
        client_id: metric.client_id,
        date: "",
        status: "missed" as const,
        created_at: "",
      })),
    ],
    streak: 0,
    momentum: "stable",
  };
}

export function useClientMetrics(coachId: string): UseClientMetricsResult {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!coachId) {
      setClients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getClientMetrics(coachId);
      setClients(data.map(toClient));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }, [coachId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!coachId) return;

    const channel = supabase
      .channel(`client-metrics-${coachId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workouts" },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [coachId, load]);

  return { clients, loading, error, refresh: load };
}
