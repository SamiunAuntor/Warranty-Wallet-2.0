import { useEffect, useState } from "react";
import {
  getUserPreferences,
  updateAppUser,
  updateUserPreferences,
  type UserPreferences,
} from "../lib/auth-api";
import { useAuth } from "../providers/auth-provider";

export function useSettings() {
  const { user, appUser, logout, setAppUser } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    setName(appUser?.name ?? "");
    setPhone(appUser?.phone ?? "");

    void (async () => {
      try {
        setPreferences(await getUserPreferences(await user.getIdToken()));
      } catch {
        setMessage("Could not load settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, [appUser?.name, appUser?.phone, user]);

  async function save() {
    if (!user || !preferences) return;
    if (!name.trim()) {
      setMessage("Name is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const token = await user.getIdToken();
      const [updatedUser, updatedPreferences] = await Promise.all([
        updateAppUser(token, {
          name: name.trim(),
          phone: phone.trim() || null,
        }),
        updateUserPreferences(token, preferences),
      ]);
      setAppUser(updatedUser);
      setPreferences(updatedPreferences);
      setMessage("Settings saved.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  function updatePreference<K extends keyof UserPreferences>(
    field: K,
    value: UserPreferences[K],
  ) {
    setPreferences((current) => (current ? { ...current, [field]: value } : current));
  }

  return {
    appUser,
    loading,
    logout,
    message,
    name,
    phone,
    preferences,
    save,
    saving,
    setName,
    setPhone,
    updatePreference,
  };
}
