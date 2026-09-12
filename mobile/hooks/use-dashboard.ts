import { useCallback, useEffect, useState } from "react";
import {
  getDashboard,
  getWarrantyHeatmap,
  type DashboardData,
  type WarrantyHeatmapData,
} from "../lib/dashboard-api";
import { useAuth } from "../providers/auth-provider";

export function useDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [heatmap, setHeatmap] = useState<WarrantyHeatmapData | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;

    setError("");

    try {
      const token = await user.getIdToken();
      const [dashboard, warranty] = await Promise.all([
        getDashboard(token),
        getWarrantyHeatmap(token),
      ]);
      setData(dashboard);
      setHeatmap(warranty);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load dashboard.");
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { data, error, heatmap, refresh, refreshing };
}
