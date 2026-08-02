import type { Asset } from "@/lib/assets-api";
import { uploadDocuments } from "@/lib/documents-api";

export type ClaimStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "RESOLVED"
  | "CANCELLED";

export type ClaimResolutionOutcome =
  | "REPAIRED"
  | "REPLACED"
  | "REFUNDED"
  | "STORE_CREDIT"
  | "NO_FAULT_FOUND"
  | "OTHER";

export type ClaimRecordType = "WARRANTY_CLAIM" | "SERVICE_RECORD";
export type ClaimServicePurpose = "REPAIR" | "INSPECTION" | "MAINTENANCE" | "INSTALLATION" | "DAMAGE_ASSESSMENT" | "WARRANTY_CONSULTATION" | "OTHER";

export const claimTransitions: Record<ClaimStatus, ClaimStatus[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["RESOLVED", "CANCELLED"],
  REJECTED: [],
  RESOLVED: [],
  CANCELLED: [],
};

export const terminalClaimStatuses: ClaimStatus[] = ["REJECTED", "RESOLVED", "CANCELLED"];

export type AssetDocument = {
  id: string;
  productId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number | null;
  createdAt: string;
};

export type ClaimTimelineEvent = {
  id: string;
  claimId: string;
  status: ClaimStatus | null;
  title: string;
  description: string | null;
  createdAt: string;
};

export type Claim = {
  id: string;
  claimNumber: string;
  userId: string;
  productId: string;
  recordType: ClaimRecordType;
  parentClaimId: string | null;
  title: string;
  issueDescription: string;
  serviceCenter: string | null;
  servicePurpose: ClaimServicePurpose | null;
  serviceDate: string | null;
  providerReference: string | null;
  submittedCondition: string | null;
  userCost: string | null;
  resolution: string | null;
  resolutionOutcome: ClaimResolutionOutcome | null;
  status: ClaimStatus;
  filedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  product: Asset;
  timeline: ClaimTimelineEvent[];
  documents: Array<{
    claimId: string;
    documentId: string;
    attachedAt: string;
    evidenceType: string;
    claimStage: ClaimStatus | null;
    note: string | null;
    document: AssetDocument;
  }>;
  _count?: {
    timeline: number;
    documents: number;
  };
};

export type ClaimInput = {
  productId: string;
  recordType: ClaimRecordType;
  parentClaimId?: string;
  title: string;
  issueDescription: string;
  serviceCenter?: string;
  servicePurpose?: ClaimServicePurpose;
  serviceDate?: string;
  providerReference?: string;
  submittedCondition?: string;
  userCost?: number;
  resolution?: string;
  resolutionOutcome?: ClaimResolutionOutcome;
  status?: "DRAFT" | "SUBMITTED" | "RESOLVED";
  documentIds?: string[];
  pendingEvidence?: Array<{ file: File; kind: "CLAIM_EVIDENCE" | "CLAIM_CONDITION" }>;
};

export type ClaimUpdate = {
  title?: string;
  issueDescription?: string;
  serviceCenter?: string | null;
  resolution?: string | null;
  resolutionOutcome?: ClaimResolutionOutcome | null;
  status?: ClaimStatus;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ClaimList = {
  data: Claim[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | { message?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.message || "The claim request could not be completed.");
  }

  return (payload as ApiEnvelope<T>).data;
}

export function getClaims(token: string, query: { page: number; limit: number; search?: string; status?: ClaimStatus; recordType?: ClaimRecordType }) {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.recordType) params.set("recordType", query.recordType);
  return request<ClaimList>(`/claims?${params.toString()}`, token);
}

export function getClaim(token: string, id: string) {
  return request<Claim>(`/claims/${id}`, token);
}

export async function createClaim(token: string, input: ClaimInput) {
  const { pendingEvidence = [], documentIds = [], ...payload } = input;
  const evidence: Array<{ documentId: string; evidenceType: string }> = documentIds.map((documentId) => ({ documentId, evidenceType: "SUPPORTING_DOCUMENT" }));
  for (const item of pendingEvidence) {
    const [uploaded] = await uploadDocuments(token, input.productId, item.kind, [item.file]);
    evidence.push({ documentId: uploaded.id, evidenceType: item.kind === "CLAIM_CONDITION" ? "CONDITION_PHOTO" : "SUPPORTING_DOCUMENT" });
  }
  return request<Claim>("/claims", token, {
    method: "POST",
    body: JSON.stringify({ ...payload, evidence }),
  });
}

export function updateClaim(token: string, id: string, input: ClaimUpdate) {
  return request<Claim>(`/claims/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteClaim(token: string, id: string) {
  return request<null>(`/claims/${id}`, token, { method: "DELETE" });
}

export function addTimelineEvent(
  token: string,
  id: string,
  input: { title: string; description?: string; status?: ClaimStatus },
) {
  return request<Claim>(`/claims/${id}/timeline`, token, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function attachClaimDocument(token: string, id: string, documentId: string, evidenceType = "SUPPORTING_DOCUMENT", note?: string) {
  return request<Claim>(`/claims/${id}/documents`, token, {
    method: "POST",
    body: JSON.stringify({ documentId, evidenceType, note }),
  });
}

export async function uploadClaimEvidence(token: string, claim: Claim, file: File, conditionPhoto: boolean) {
  const [document] = await uploadDocuments(token, claim.productId, conditionPhoto ? "CLAIM_CONDITION" : "CLAIM_EVIDENCE", [file]);
  return attachClaimDocument(token, claim.id, document.id, conditionPhoto ? "CONDITION_PHOTO" : "SUPPORTING_DOCUMENT");
}

export function detachClaimDocument(token: string, id: string, documentId: string) {
  return request<Claim>(`/claims/${id}/documents/${documentId}`, token, {
    method: "DELETE",
  });
}

export function getAssetDocuments(token: string, productId: string) {
  return request<AssetDocument[]>(`/products/${productId}/documents`, token);
}
