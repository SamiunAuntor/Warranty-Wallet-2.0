import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addClaimTimelineEvent,
  attachClaimDocument,
  deleteClaim,
  detachClaimDocument,
  updateClaim,
} from "../lib/claims-api";
import { uploadDocument } from "../lib/documents-api";
import type { Claim, ClaimStatus, EvidenceType, NativeFile } from "../lib/types";
import { keys, useInvalidate } from "./query-keys";

/** Changes made from the claim detail screen. Each one refreshes the claim. */
export function useClaimActions(claim: Claim | undefined) {
  const client = useQueryClient();
  const invalidate = useInvalidate();
  const id = claim?.id ?? "";

  const applyClaim = async (updated: Claim) => {
    client.setQueryData(keys.claim(id), updated);
    await invalidate.claims();
  };

  const setStatus = useMutation({
    mutationFn: (status: ClaimStatus) => updateClaim(id, { status }),
    onSuccess: applyClaim,
  });

  const addEvent = useMutation({
    mutationFn: ({ title, description }: { title: string; description?: string }) =>
      addClaimTimelineEvent(id, title, description),
    onSuccess: applyClaim,
  });

  const attachExisting = useMutation({
    mutationFn: ({ documentId, evidenceType }: { documentId: string; evidenceType: EvidenceType }) =>
      attachClaimDocument(id, documentId, evidenceType),
    onSuccess: applyClaim,
  });

  const uploadEvidence = useMutation({
    mutationFn: async ({ file, condition }: { file: NativeFile; condition: boolean }) => {
      if (!claim) throw new Error("The claim is still loading.");
      const document = await uploadDocument(
        claim.productId,
        condition ? "CLAIM_CONDITION" : "CLAIM_EVIDENCE",
        file,
      );
      return attachClaimDocument(
        id,
        document.id,
        condition ? "CONDITION_PHOTO" : "SUPPORTING_DOCUMENT",
      );
    },
    onSuccess: async (updated) => {
      await applyClaim(updated);
      await invalidate.documents();
    },
  });

  const detach = useMutation({
    mutationFn: (documentId: string) => detachClaimDocument(id, documentId),
    onSuccess: applyClaim,
  });

  const remove = useMutation({
    mutationFn: () => deleteClaim(id),
    onSuccess: () => invalidate.claims(),
  });

  return { setStatus, addEvent, attachExisting, uploadEvidence, detach, remove };
}
