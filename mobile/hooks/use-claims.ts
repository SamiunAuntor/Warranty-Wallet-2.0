import { useMutation, useQuery } from "@tanstack/react-query";
import { createClaim, getClaim, getClaims, updateClaim, type ClaimQuery } from "../lib/claims-api";
import { uploadDocument } from "../lib/documents-api";
import type { ClaimInput, ClaimUpdate, EvidenceType, NativeFile } from "../lib/types";
import { keys, useInvalidate, useSignedIn } from "./query-keys";
import { usePagedQuery } from "./use-paged-query";

export function useClaimList(query: ClaimQuery) {
  return usePagedQuery(keys.claims(query), (page) => getClaims({ ...query, page }), {
    enabled: useSignedIn(),
  });
}

export const useClaim = (id: string | undefined) =>
  useQuery({
    queryKey: keys.claim(id ?? ""),
    queryFn: () => getClaim(id as string),
    enabled: useSignedIn() && Boolean(id),
  });

export type PendingEvidence = { file: NativeFile; kind: "CLAIM_EVIDENCE" | "CLAIM_CONDITION" };

/**
 * Creates a claim. Evidence files are uploaded to the asset first, then
 * attached when the claim is created, the same way the web app does it.
 */
export function useCreateClaim() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ input, evidence }: { input: ClaimInput; evidence: PendingEvidence[] }) => {
      const attached: Array<{ documentId: string; evidenceType: EvidenceType }> = [];
      for (const item of evidence) {
        const document = await uploadDocument(input.productId, item.kind, item.file);
        attached.push({
          documentId: document.id,
          evidenceType: item.kind === "CLAIM_CONDITION" ? "CONDITION_PHOTO" : "SUPPORTING_DOCUMENT",
        });
      }
      return createClaim({ ...input, ...(attached.length ? { evidence: attached } : {}) });
    },
    onSuccess: () => Promise.all([invalidate.claims(), invalidate.documents()]),
  });
}

export function useUpdateClaim(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: ClaimUpdate) => updateClaim(id, input),
    onSuccess: () => invalidate.claims(),
  });
}
