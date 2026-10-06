import { apiList, apiRequest, filePart, queryString } from "./api";
import type { DocumentRecord, DocumentType, NativeFile } from "./types";

export type DocumentQuery = {
  page?: number;
  limit?: number;
  search?: string;
  type?: DocumentType;
  productId?: string;
};

export const getDocuments = (query: DocumentQuery = {}) =>
  apiList<DocumentRecord>(`/documents${queryString({ page: 1, limit: 20, ...query })}`);

/** Uploads one file. The API accepts a single file per request. */
export async function uploadDocument(productId: string, type: DocumentType, file: NativeFile) {
  const body = new FormData();
  body.append("type", type);
  body.append("files", filePart(file));
  const [created] = await apiRequest<DocumentRecord[]>(`/products/${productId}/documents`, {
    method: "POST",
    body,
  });
  return created;
}

export function replaceDocument(id: string, file: NativeFile) {
  const body = new FormData();
  body.append("file", filePart(file));
  return apiRequest<DocumentRecord>(`/documents/${id}`, { method: "PATCH", body });
}

export const deleteDocument = (id: string) =>
  apiRequest<null>(`/documents/${id}`, { method: "DELETE" });
