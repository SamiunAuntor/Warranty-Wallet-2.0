import { useCallback, useEffect, useState } from "react";
import {
  broadcast,
  getAdminStats,
  getAdminUsers,
  setUserBlocked,
  type AdminStats,
  type AdminUser,
} from "../lib/admin-api";
import { useAuth } from "../providers/auth-provider";

export function useAdminDashboard() {
  const { user, appUser } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user || appUser?.role !== "ADMIN") return;

    try {
      const token = await user.getIdToken();
      const [nextStats, nextUsers] = await Promise.all([
        getAdminStats(token),
        getAdminUsers(token),
      ]);
      setStats(nextStats);
      setUsers(nextUsers.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load admin data.");
    } finally {
      setLoading(false);
    }
  }, [appUser?.role, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleUser = useCallback(
    async (item: AdminUser) => {
      if (!user) return;

      try {
        const updated = await setUserBlocked(
          await user.getIdToken(),
          item.id,
          item.status !== "BLOCKED",
        );
        setUsers((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not update user.");
      }
    },
    [user],
  );

  const sendBroadcast = useCallback(
    async (title: string, message: string) => {
      if (!user) return;
      if (!title.trim() || !message.trim()) {
        setError("Enter a title and message.");
        return;
      }

      setBusy(true);

      try {
        await broadcast(await user.getIdToken(), {
          title: title.trim(),
          message: message.trim(),
          type: "SYSTEM",
        });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not broadcast notification.");
      } finally {
        setBusy(false);
      }
    },
    [user],
  );

  return { appUser, busy, error, loading, sendBroadcast, stats, toggleUser, users };
}
