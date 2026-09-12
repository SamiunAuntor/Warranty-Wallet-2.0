import { useCallback, useEffect, useState } from "react";
import {
  getNotifications,
  readAllNotifications,
  readNotification,
  type Notification,
} from "../lib/notifications-api";
import { useAuth } from "../providers/auth-provider";

export function useNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      setItems(await getNotifications(await user.getIdToken()));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = useCallback(
    async (item: Notification) => {
      if (!user || item.isRead) return;

      const updated = await readNotification(await user.getIdToken(), item.id);
      setItems((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
    },
    [user],
  );

  const markAllRead = useCallback(async () => {
    if (!user) return;

    await readAllNotifications(await user.getIdToken());
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
  }, [user]);

  return { error, items, loading, markAllRead, markRead };
}
