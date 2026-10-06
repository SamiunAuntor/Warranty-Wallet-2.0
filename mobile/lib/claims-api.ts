import { apiList, apiRequest, queryString } from "./api";
import type { Claim, ClaimInput, ClaimStatus, ClaimUpdate, EvidenceType } from "./types";

export type ClaimQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClaimStatus;
  productId?: string;
};

export const getClaims = (query: ClaimQuery = {}) =>
  apiList<Claim>(`/claims${queryString({ page: 1, limit: 20, ...query })}`);

export const getClaim = (id: string) => apiRequest<Claim>(`/claims/${id}`);

export const createClaim = (input: ClaimInput) =>
  apiRequest<Claim>("/claims", { method: "POST", body: input });

export const updateClaim = (id: string, input: ClaimUpdate) =>
  apiRequest<Claim>(`/claims/${id}`, { method: "PATCH", body: input });

export const deleteClaim = (id: string) => apiRequest<null>(`/claims/${id}`, { method: "DELETE" });

export const addClaimTimelineEvent = (id: string, title: string, description?: string) =>
  apiRequest<Claim>(`/claims/${id}/timeline`, {
    method: "POST",
    body: { title, ...(description ? { description } : {}) },
  });

export const attachClaimDocument = (id: string, documentId: string, evidenceType: EvidenceType) =>
  apiRequest<Claim>(`/claims/${id}/documents`, {
    method: "POST",
    body: { documentId, evidenceType },
  });

export const detachClaimDocument = (id: string, documentId: string) =>
  apiRequest<Claim>(`/claims/${id}/documents/${documentId}`, { method: "DELETE" });
