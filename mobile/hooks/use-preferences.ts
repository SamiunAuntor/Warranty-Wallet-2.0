import { useCallback, useEffect, useState } from "react";
import {
  getUserPreferences,
  updateUserPreferences,
  type UserPreferences,
} from "../lib/auth-api";
import { useAuth } from "../providers/auth-provider";

export function usePreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      setPreferences(await getUserPreferences(await user.getIdToken()));
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not load preferences.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateField = useCallback(
    <K extends keyof UserPreferences>(field: K, value: UserPreferences[K]) => {
      setPreferences((current) => (current ? { ...current, [field]: value } : current));
    },
    [],
  );

  const save = useCallback(async () => {
    if (!user || !preferences) return;

    setSaving(true);
    setMessage("");

    try {
      setPreferences(await updateUserPreferences(await user.getIdToken(), preferences));
      setMessage("Preferences saved.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  }, [preferences, user]);

  return {
    loading,
    message,
    preferences,
    save,
    saving,
    updateField,
  };
}
