import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import type { AssetQuery } from "../lib/assets-api";
import type { ClaimQuery } from "../lib/claims-api";
import type { DocumentQuery } from "../lib/documents-api";
import { useAuth } from "../providers/auth-provider";

/** Query keys in one place so changes can refresh the right data. */
export const keys = {
  dashboard: ["dashboard"] as const,
  heatmap: ["heatmap"] as const,
  assets: (query?: AssetQuery) => (query ? (["assets", query] as const) : (["assets"] as const)),
  asset: (id: string) => ["asset", id] as const,
  categories: ["categories"] as const,
  brands: ["brands"] as const,
  claims: (query?: ClaimQuery) => (query ? (["claims", query] as const) : (["claims"] as const)),
  claim: (id: string) => ["claim", id] as const,
  documents: (query?: DocumentQuery) =>
    query ? (["documents", query] as const) : (["documents"] as const),
  notifications: ["notifications"] as const,
  unread: ["unread-notifications"] as const,
  activities: ["activities"] as const,
  plans: ["plans"] as const,
  subscription: ["subscription"] as const,
  payments: ["payments"] as const,
  preferences: ["preferences"] as const,
  admin: (...parts: unknown[]) => ["admin", ...parts] as const,
};

/** Data queries only run once the backend session is ready. */
export function useSignedIn() {
  return useAuth().status === "signedIn";
}

/** Groups of queries to refresh after a change, so every screen stays current. */
export function useInvalidate() {
  const client = useQueryClient();
  return useMemo(() => {
    const run = (...groups: ReadonlyArray<readonly unknown[]>) =>
      Promise.all(groups.map((queryKey) => client.invalidateQueries({ queryKey }))).then(
        () => undefined,
      );
    return {
      assets: () =>
        run(
          keys.assets(),
          ["asset"],
          keys.dashboard,
          keys.heatmap,
          keys.documents(),
          keys.activities,
        ),
      claims: () => run(keys.claims(), ["claim"], ["asset"], keys.dashboard, keys.activities),
      documents: () => run(keys.documents(), ["asset"], ["claim"], keys.dashboard),
      notifications: () => run(keys.notifications, keys.unread, keys.dashboard),
      billing: () => run(keys.subscription, keys.payments, keys.dashboard),
      preferences: () => run(keys.preferences),
      admin: () => run(keys.admin()),
      catalog: () => run(keys.categories, keys.brands, keys.admin()),
      everything: () => client.invalidateQueries(),
    };
  }, [client]);
}
