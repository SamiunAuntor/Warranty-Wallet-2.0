"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getUserPreferences, type UserPreferences } from "@/lib/auth-api";
type Value = { preferences: UserPreferences | null; setPreferences: (value: UserPreferences) => void; formatMoney: (value: number) => string; formatDate: (value: string | Date | null) => string };
const Context = createContext<Value | null>(null);
export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser } = useAuth(); const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  useEffect(() => { if (!firebaseUser) { setPreferences(null); return; } let cancelled = false; firebaseUser.getIdToken().then(getUserPreferences).then((value) => { if (!cancelled) setPreferences(value); }).catch(() => undefined); return () => { cancelled = true; }; }, [firebaseUser]);
  const value = useMemo<Value>(() => ({ preferences, setPreferences,
    formatMoney: (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: preferences?.currency ?? "USD" }).format(amount),
    formatDate: (input) => { if (!input) return "Not provided"; const options: Intl.DateTimeFormatOptions = preferences?.dateFormat === "DD_MM_YYYY" ? { day: "2-digit", month: "2-digit", year: "numeric" } : preferences?.dateFormat === "MM_DD_YYYY" ? { month: "2-digit", day: "2-digit", year: "numeric" } : { dateStyle: "medium" }; return new Intl.DateTimeFormat("en-US", { ...options, timeZone: preferences?.timezone ?? "UTC" }).format(new Date(input)); },
  }), [preferences]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function usePreferences() { const value = useContext(Context); if (!value) throw new Error("usePreferences must be used inside PreferencesProvider."); return value; }
