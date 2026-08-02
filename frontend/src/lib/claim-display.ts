import type { ClaimResolutionOutcome, ClaimStatus } from "@/lib/claims-api";

export const claimStatusLabels: Record<ClaimStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Claim submitted",
  UNDER_REVIEW: "Assessment in progress",
  APPROVED: "Claim approved",
  REJECTED: "Claim declined",
  RESOLVED: "Claim completed",
  CANCELLED: "Claim cancelled",
};

export const claimOutcomeLabels: Record<ClaimResolutionOutcome, string> = {
  REPAIRED: "Repaired",
  REPLACED: "Replaced",
  REFUNDED: "Refunded",
  STORE_CREDIT: "Store credit",
  NO_FAULT_FOUND: "No fault found",
  OTHER: "Other outcome",
};
