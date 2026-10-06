import type { Claim, ClaimInput, ClaimStatus, ClaimUpdate } from "./types";

export type ClaimDraft = {
  productId: string;
  title: string;
  issueDescription: string;
  serviceCenter: string;
  providerReference: string;
  submittedCondition: string;
  resolution: string;
  status: ClaimStatus;
};

type Result<T> = { valid: true; value: T } | { valid: false; message: string };

export function createEmptyClaimDraft(productId = ""): ClaimDraft {
  return {
    productId,
    title: "",
    issueDescription: "",
    serviceCenter: "",
    providerReference: "",
    submittedCondition: "",
    resolution: "",
    status: "SUBMITTED",
  };
}

export function claimToDraft(claim: Claim): ClaimDraft {
  return {
    productId: claim.productId,
    title: claim.title,
    issueDescription: claim.issueDescription,
    serviceCenter: claim.serviceCenter ?? "",
    providerReference: claim.providerReference ?? "",
    submittedCondition: claim.submittedCondition ?? "",
    resolution: claim.resolution ?? "",
    status: claim.status,
  };
}

function validateCommon(draft: ClaimDraft) {
  if (draft.title.trim().length < 3) return "Enter a claim title of at least 3 characters.";
  if (draft.issueDescription.trim().length < 10) {
    return "Describe the issue in at least 10 characters.";
  }
  return null;
}

const optional = (value: string) => (value.trim() ? value.trim() : undefined);

export function validateNewClaim(draft: ClaimDraft): Result<ClaimInput> {
  if (!draft.productId) return { valid: false, message: "Choose the asset this claim is for." };
  const message = validateCommon(draft);
  if (message) return { valid: false, message };
  return {
    valid: true,
    value: {
      productId: draft.productId,
      title: draft.title.trim(),
      issueDescription: draft.issueDescription.trim(),
      serviceCenter: optional(draft.serviceCenter),
      providerReference: optional(draft.providerReference),
      submittedCondition: optional(draft.submittedCondition),
    },
  };
}

export function validateClaimUpdate(draft: ClaimDraft): Result<ClaimUpdate> {
  const message = validateCommon(draft);
  if (message) return { valid: false, message };
  const nullable = (value: string) => (value.trim() ? value.trim() : null);
  return {
    valid: true,
    value: {
      title: draft.title.trim(),
      issueDescription: draft.issueDescription.trim(),
      serviceCenter: nullable(draft.serviceCenter),
      providerReference: nullable(draft.providerReference),
      submittedCondition: nullable(draft.submittedCondition),
      resolution: nullable(draft.resolution),
      status: draft.status,
    },
  };
}
