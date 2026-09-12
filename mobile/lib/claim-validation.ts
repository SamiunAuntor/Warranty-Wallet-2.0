import type { CreateClaimInput } from "./claims-api";

export type ClaimDraft = {
  productId: string;
  title: string;
  issueDescription: string;
};

export function createEmptyClaimDraft(): ClaimDraft {
  return {
    productId: "",
    title: "",
    issueDescription: "",
  };
}

export function validateClaimDraft(draft: ClaimDraft):
  | { valid: true; value: CreateClaimInput }
  | { valid: false; message: string } {
  const value: CreateClaimInput = {
    productId: draft.productId.trim(),
    title: draft.title.trim(),
    issueDescription: draft.issueDescription.trim(),
  };

  if (!value.productId || !value.title || !value.issueDescription) {
    return {
      valid: false,
      message: "Enter the asset ID, title, and issue description.",
    };
  }

  return { valid: true, value };
}
