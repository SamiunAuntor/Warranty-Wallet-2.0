import type { Asset } from "@/lib/assets-api";
import { apiRequest } from "@/lib/api-client";
import type { ClaimStatus } from "@/lib/api-contracts";
import { uploadDocuments } from "@/lib/documents-api";

export type { ClaimStatus } from "@/lib/api-contracts";
export const claimStatuses: ClaimStatus[] = ["SUBMITTED", "IN_PROGRESS", "RESOLVED", "REJECTED", "CANCELLED"];
export const terminalClaimStatuses: ClaimStatus[] = ["RESOLVED", "REJECTED", "CANCELLED"];

export type AssetDocument = { id: string; productId: string; fileName: string; fileType: string; fileUrl: string; fileSize: number | null; createdAt: string };
export type ClaimTimelineEvent = { id: string; claimId: string; status: ClaimStatus | null; title: string; description: string | null; createdAt: string };
export type Claim = {
  id: string; claimNumber: string; userId: string; productId: string; title: string; issueDescription: string;
  serviceCenter: string | null; providerReference: string | null; submittedCondition: string | null;
  resolution: string | null; status: ClaimStatus; filedAt: string | null; resolvedAt: string | null;
  createdAt: string; updatedAt: string; product: Asset; timeline?: ClaimTimelineEvent[];
  documents?: Array<{ claimId: string; documentId: string; attachedAt: string; evidenceType: string; claimStage: ClaimStatus | null; note: string | null; document: AssetDocument }>;
  _count?: { timeline: number; documents: number };
};
export type ClaimInput = {
  productId: string; title: string; issueDescription: string; serviceCenter?: string; providerReference?: string;
  submittedCondition?: string; status?: ClaimStatus; resolution?: string; documentIds?: string[];
  pendingEvidence?: Array<{ file: File; kind: "CLAIM_EVIDENCE" | "CLAIM_CONDITION" }>;
};
export type ClaimUpdate = Partial<Pick<ClaimInput, "title" | "issueDescription" | "serviceCenter" | "providerReference" | "submittedCondition" | "status" | "resolution">>;
export type ClaimList = { data: Claim[]; meta: { page: number; limit: number; total: number; totalPages: number } };

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  return apiRequest<T>(path, { ...init, token, fallbackMessage: "The claim request could not be completed." });
}

export function getClaims(token: string, query: { page: number; limit: number; search?: string; status?: ClaimStatus; productId?: string }) {
  const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit) });
  if (query.search) params.set("search", query.search); if (query.status) params.set("status", query.status); if (query.productId) params.set("productId", query.productId);
  return request<ClaimList>(`/claims?${params}`, token);
}
export const getClaim = (token: string, id: string) => request<Claim>(`/claims/${id}`, token);
export async function createClaim(token: string, input: ClaimInput) {
  const { pendingEvidence = [], documentIds = [], ...payload } = input;
  const evidence: Array<{ documentId: string; evidenceType: string }> = documentIds.map((documentId) => ({ documentId, evidenceType: "SUPPORTING_DOCUMENT" }));
  for (const item of pendingEvidence) { const [uploaded] = await uploadDocuments(token, input.productId, item.kind, [item.file]); evidence.push({ documentId: uploaded.id, evidenceType: item.kind === "CLAIM_CONDITION" ? "CONDITION_PHOTO" : "SUPPORTING_DOCUMENT" }); }
  return request<Claim>("/claims", token, { method: "POST", body: JSON.stringify({ ...payload, evidence }) });
}
export const updateClaim = (token: string, id: string, input: ClaimUpdate) => request<Claim>(`/claims/${id}`, token, { method: "PATCH", body: JSON.stringify(input) });
export const deleteClaim = (token: string, id: string) => request<null>(`/claims/${id}`, token, { method: "DELETE" });
export const getAssetDocuments = (token: string, productId: string) => request<AssetDocument[]>(`/products/${productId}/documents`, token);
