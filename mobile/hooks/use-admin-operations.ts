import { useCallback, useEffect, useState } from "react";
import {
  getAdminAssets,
  getAdminClaims,
  getAdminPayments,
  updateAdminClaim,
  type AdminAsset,
  type AdminClaim,
  type AdminPayment,
} from "../lib/admin-api";
import { useAuth } from "../providers/auth-provider";

export function useAdminOperations() {
  const { user, appUser } = useAuth();
  const [assets, setAssets] = useState<AdminAsset[]>([]);
  const [claims, setClaims] = useState<AdminClaim[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user || appUser?.role !== "ADMIN") return;

    setLoading(true);

    try {
      const token = await user.getIdToken();
      const [nextAssets, nextClaims, nextPayments] = await Promise.all([
        getAdminAssets(token),
        getAdminClaims(token),
        getAdminPayments(token),
      ]);
      setAssets(nextAssets);
      setClaims(nextClaims);
      setPayments(nextPayments);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load admin operations.");
    } finally {
      setLoading(false);
    }
  }, [appUser?.role, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeClaimStatus = useCallback(
    async (claim: AdminClaim, status: string) => {
      if (!user) return;

      try {
        const updated = await updateAdminClaim(await user.getIdToken(), claim.id, status);
        setClaims((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not update claim.");
      }
    },
    [user],
  );

  return {
    appUser,
    assets,
    changeClaimStatus,
    claims,
    error,
    loading,
    payments,
  };
}
