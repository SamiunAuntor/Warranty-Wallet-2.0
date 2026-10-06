import { apiRequest, filePart } from "./api";
import type { ExtractedAssetData, NativeFile } from "./types";

export function extractInvoice(file: NativeFile) {
  const body = new FormData();
  body.append("file", filePart(file));
  return apiRequest<ExtractedAssetData>("/ai/extract-invoice", { method: "POST", body });
}
