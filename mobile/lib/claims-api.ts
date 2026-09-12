import { apiRequest } from "./api";

export type ClaimStatus = "SUBMITTED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED" | "CANCELLED";
export type Claim = { id: string; claimNumber: string; productId: string; title: string; issueDescription: string; serviceCenter: string | null; providerReference: string | null; resolution: string | null; status: ClaimStatus; filedAt: string | null; createdAt: string; updatedAt: string; product: { id: string; name: string; brand: string } };
export type ClaimList = { data: Claim[]; meta: { page: number; limit: number; total: number; totalPages: number } };
export function getClaims(token: string, search = "") { const params = new URLSearchParams({ page: "1", limit: "50" }); if (search.trim()) params.set("search", search.trim()); return apiRequest<ClaimList>(`/claims?${params.toString()}`, { token }); }
export function createClaim(token: string, input: { productId: string; title: string; issueDescription: string; serviceCenter?: string; providerReference?: string }) { return apiRequest<Claim>("/claims", { method: "POST", token, body: JSON.stringify(input) }); }
export function updateClaim(token: string, id: string, input: { status?: ClaimStatus; resolution?: string }) { return apiRequest<Claim>(`/claims/${id}`, { method: "PATCH", token, body: JSON.stringify(input) }); }
export function deleteClaim(token: string, id: string) { return apiRequest<null>(`/claims/${id}`, { method: "DELETE", token }); }
