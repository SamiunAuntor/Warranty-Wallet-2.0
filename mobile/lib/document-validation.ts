import type { DocumentType, NativeFile } from "./documents-api";

export type DocumentUploadDraft = {
  productId: string;
  type: DocumentType;
  file: NativeFile | null;
};

export function validateDocumentUpload(draft: DocumentUploadDraft): string | null {
  if (!draft.productId.trim()) return "Enter the asset ID.";
  if (!draft.file) return "Choose a file to upload.";
  return null;
}
