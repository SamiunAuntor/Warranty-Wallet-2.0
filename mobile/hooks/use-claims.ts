import { useCallback, useEffect, useState } from "react";
import {
  createClaim,
  getClaims,
  updateClaim,
  type Claim,
  type ClaimStatus,
  type CreateClaimInput,
} from "../lib/claims-api";
import { useAuth } from "../providers/auth-provider";

export function useClaims(search: string) {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const result = await getClaims(await user.getIdToken(), search);
      setClaims(result.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load claims.");
    } finally {
      setLoading(false);
    }
  }, [search, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const addClaim = useCallback(
    async (input: CreateClaimInput) => {
      if (!user) throw new Error("You must be signed in to create a claim.");

      const claim = await createClaim(await user.getIdToken(), input);
      setClaims((current) => [claim, ...current]);
    },
    [user],
  );

  const changeStatus = useCallback(
    async (claim: Claim, status: ClaimStatus) => {
      if (!user) return;

      try {
        const updated = await updateClaim(await user.getIdToken(), claim.id, { status });
        setClaims((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not update claim.");
      }
    },
    [user],
  );

  return {
    addClaim,
    changeStatus,
    claims,
    error,
    loading,
  };
}
