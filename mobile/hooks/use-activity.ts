import { useCallback, useEffect, useState } from "react";
import { getActivities, type Activity } from "../lib/activity-api";
import { useAuth } from "../providers/auth-provider";

export function useActivity() {
  const { user } = useAuth();
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;

    try {
      setItems(await getActivities(await user.getIdToken()));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load activity.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  return { error, items, loading };
}
