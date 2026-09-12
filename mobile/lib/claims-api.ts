import { apiRequest } from "./api";

export type ClaimStatus = "SUBMITTED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED" | "CANCELLED";
export type ClaimTimelineEvent = { id: string; claimId: string; status: ClaimStatus | null; title: string; description: string | null; createdAt: string };
export type ClaimDocument = { claimId: string; documentId: string; attachedAt: string; evidenceType: string; claimStage: ClaimStatus | null; note: string | null; document: { id: string; fileName: string; fileUrl: string; fileType: string } };
export type Claim = { id: string; claimNumber: string; productId: string; title: string; issueDescription: string; serviceCenter: string | null; providerReference: string | null; submittedCondition: string | null; resolution: string | null; status: ClaimStatus; filedAt: string | null; createdAt: string; updatedAt: string; product: { id: string; name: string; brand: string }; timeline?: ClaimTimelineEvent[]; documents?: ClaimDocument[] };
export type ClaimList = { data: Claim[]; meta: { page: number; limit: number; total: number; totalPages: number } };
export function getClaims(token: string, search = "") { const params = new URLSearchParams({ page: "1", limit: "50" }); if (search.trim()) params.set("search", search.trim()); return apiRequest<ClaimList>(`/claims?${params.toString()}`, { token }); }
export function createClaim(token: string, input: { productId: string; title: string; issueDescription: string; serviceCenter?: string; providerReference?: string }) { return apiRequest<Claim>("/claims", { method: "POST", token, body: JSON.stringify(input) }); }
export function getClaim(token: string, id: string) { return apiRequest<Claim>(`/claims/${id}`, { token }); }
export function updateClaim(token: string, id: string, input: { status?: ClaimStatus; resolution?: string }) { return apiRequest<Claim>(`/claims/${id}`, { method: "PATCH", token, body: JSON.stringify(input) }); }
export function deleteClaim(token: string, id: string) { return apiRequest<null>(`/claims/${id}`, { method: "DELETE", token }); }
export function attachClaimDocument(token: string, id: string, documentId: string, evidenceType: string) { return apiRequest<Claim>(`/claims/${id}/documents`, { method: "POST", token, body: JSON.stringify({ documentId, evidenceType }) }); }
export function detachClaimDocument(token: string, id: string, documentId: string) { return apiRequest<Claim>(`/claims/${id}/documents/${documentId}`, { method: "DELETE", token }); }
export function addClaimTimelineEvent(token: string, id: string, title: string, description?: string) { return apiRequest<Claim>(`/claims/${id}/timeline`, { method: "POST", token, body: JSON.stringify({ title, description }) }); }
