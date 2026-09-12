import { useCallback, useEffect, useState } from "react";
import {
  addClaimTimelineEvent,
  attachClaimDocument,
  deleteClaim,
  detachClaimDocument,
  getClaim,
  updateClaim,
  type Claim,
  type ClaimStatus,
} from "../lib/claims-api";
import { useAuth } from "../providers/auth-provider";

export function useClaimDetails(id: string | undefined) {
  const { user } = useAuth();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user || !id) return;

    try {
      setClaim(await getClaim(await user.getIdToken(), id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load claim.");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeStatus = useCallback(
    async (status: ClaimStatus) => {
      if (!user || !claim) return;
      setClaim(await updateClaim(await user.getIdToken(), claim.id, { status }));
    },
    [claim, user],
  );

  const addTimelineEvent = useCallback(
    async (title: string, description?: string) => {
      if (!user || !claim) return;
      setClaim(await addClaimTimelineEvent(await user.getIdToken(), claim.id, title, description));
    },
    [claim, user],
  );

  const attachDocument = useCallback(
    async (documentId: string, evidenceType: string) => {
      if (!user || !claim) return;
      setClaim(
        await attachClaimDocument(await user.getIdToken(), claim.id, documentId, evidenceType),
      );
    },
    [claim, user],
  );

  const detachDocument = useCallback(
    async (documentId: string) => {
      if (!user || !claim) return;
      setClaim(await detachClaimDocument(await user.getIdToken(), claim.id, documentId));
    },
    [claim, user],
  );

  const remove = useCallback(async () => {
    if (!user || !claim) return;
    await deleteClaim(await user.getIdToken(), claim.id);
  }, [claim, user]);

  return {
    addTimelineEvent,
    attachDocument,
    changeStatus,
    claim,
    detachDocument,
    error,
    loading,
    remove,
    reportError: setError,
  };
}
