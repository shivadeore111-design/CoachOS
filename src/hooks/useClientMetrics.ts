import { useCallback, useEffect, useState } from "react";
import { getClientMetrics } from "../lib/metrics";
import type { ClientMetrics } from "../types/clientMetrics";

interface UseClientMetricsResult {
  clients: ClientMetrics[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useClientMetrics(coachId: string): UseClientMetricsResult {
  const [clients, setClients] = useState<ClientMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!coachId) {
      setClients([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getClientMetrics(coachId);
      setClients(data);
    } catch (err) {
      console.error("Metrics load error:", err);
      setError(err instanceof Error ? err.message : "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }, [coachId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { clients, loading, error, refresh };
}
