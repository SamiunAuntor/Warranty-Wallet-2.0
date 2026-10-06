import type { Tone } from "./theme";
import type {
  ClaimStatus,
  DocumentType,
  EvidenceType,
  PaymentStatus,
  Plan,
  SubscriptionStatus,
  UserStatus,
  WarrantyStatus,
  WarrantyType,
} from "./types";

type Label = { label: string; tone: Tone };

export const warrantyStatusLabels: Record<WarrantyStatus, Label> = {
  ACTIVE: { label: "Active", tone: "success" },
  EXPIRING_SOON: { label: "Expiring soon", tone: "warning" },
  EXPIRED: { label: "Expired", tone: "danger" },
  NO_WARRANTY: { label: "No warranty", tone: "neutral" },
};

export const claimStatuses: ClaimStatus[] = [
  "SUBMITTED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
  "CANCELLED",
];

export const claimStatusLabels: Record<ClaimStatus, Label> = {
  SUBMITTED: { label: "Submitted", tone: "primary" },
  IN_PROGRESS: { label: "In progress", tone: "warning" },
  RESOLVED: { label: "Resolved", tone: "success" },
  REJECTED: { label: "Rejected", tone: "danger" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export const paymentStatusLabels: Record<PaymentStatus, Label> = {
  PENDING: { label: "Pending", tone: "warning" },
  SUCCESS: { label: "Paid", tone: "success" },
  FAILED: { label: "Failed", tone: "danger" },
  REFUNDED: { label: "Refunded", tone: "neutral" },
};

export const subscriptionStatusLabels: Record<SubscriptionStatus, Label> = {
  ACTIVE: { label: "Active", tone: "success" },
  INCOMPLETE: { label: "Incomplete", tone: "warning" },
  PAST_DUE: { label: "Past due", tone: "danger" },
  EXPIRED: { label: "Expired", tone: "neutral" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export const userStatusLabels: Record<UserStatus, Label> = {
  ACTIVE: { label: "Active", tone: "success" },
  BLOCKED: { label: "Blocked", tone: "danger" },
  DELETED: { label: "Deleted", tone: "neutral" },
};

export const planNames: Record<Plan, string> = { BASIC: "Basic", PLUS: "Plus", PRO: "Pro" };

export const warrantyTypeLabels: Record<WarrantyType, string> = {
  MANUFACTURER: "Manufacturer",
  EXTENDED: "Extended",
};

export const documentTypeLabels: Record<DocumentType, string> = {
  INVOICE: "Invoice",
  WARRANTY_CARD: "Warranty card",
  PRODUCT_IMAGE: "Product photo",
  RECEIPT: "Receipt",
  OTHER: "Other",
  CLAIM_EVIDENCE: "Claim evidence",
  CLAIM_CONDITION: "Condition photo",
};

/** Document types a user can upload directly to an asset. */
export const assetDocumentTypes: DocumentType[] = [
  "INVOICE",
  "RECEIPT",
  "WARRANTY_CARD",
  "PRODUCT_IMAGE",
  "OTHER",
];

export const evidenceTypeLabels: Record<EvidenceType, string> = {
  SUPPORTING_DOCUMENT: "Supporting document",
  CONDITION_PHOTO: "Condition photo",
  DAMAGE_PHOTO: "Damage photo",
  CORRESPONDENCE: "Correspondence",
  OTHER: "Other",
};
