import { documentTypeLabels } from "./labels";
import type { AssetDocumentSummary, DocumentType } from "./types";

// Mirrors the per-asset limits enforced by the API so users see the reason
// before they pick a file.
const MAX_PURCHASE_DOCUMENTS = 3;
const MAX_PRODUCT_IMAGES = 3;
const SINGLE_COPY_TYPES: DocumentType[] = ["INVOICE", "WARRANTY_CARD"];
const PURCHASE_DOCUMENT_TYPES: DocumentType[] = ["INVOICE", "RECEIPT", "WARRANTY_CARD", "OTHER"];

/** Returns why a document of this type cannot be added, or null when it can. */
export function documentUploadBlocker(
  type: DocumentType,
  existing: AssetDocumentSummary[],
): string | null {
  const count = (types: DocumentType[]) =>
    existing.filter((document) => types.includes(document.fileType)).length;

  if (SINGLE_COPY_TYPES.includes(type) && count([type]) > 0) {
    return `This asset already has a ${documentTypeLabels[type].toLowerCase()}. Replace it instead.`;
  }
  if (type === "PRODUCT_IMAGE" && count(["PRODUCT_IMAGE"]) >= MAX_PRODUCT_IMAGES) {
    return `Each asset can have up to ${MAX_PRODUCT_IMAGES} product photos.`;
  }
  if (PURCHASE_DOCUMENT_TYPES.includes(type) && count(PURCHASE_DOCUMENT_TYPES) >= MAX_PURCHASE_DOCUMENTS) {
    return `Each asset can have up to ${MAX_PURCHASE_DOCUMENTS} purchase documents.`;
  }
  return null;
}
