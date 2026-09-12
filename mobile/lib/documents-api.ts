import { apiRequest } from "./api";

export type DocumentType = "INVOICE" | "WARRANTY_CARD" | "PRODUCT_IMAGE" | "RECEIPT" | "OTHER" | "CLAIM_EVIDENCE" | "CLAIM_CONDITION";
export type DocumentRecord = { id: string; productId: string; fileName: string; fileType: DocumentType; fileSize: number | null; fileUrl: string; ocrProcessed: boolean; createdAt: string; product: { id: string; name: string } };
export type DocumentList = { data: DocumentRecord[]; meta: { page: number; limit: number; total: number; totalPages: number } };
export type NativeFile = { uri: string; name: string; mimeType?: string | null; size?: number | null };

export function getDocuments(token: string, search = "") { const params = new URLSearchParams({ page: "1", limit: "50" }); if (search.trim()) params.set("search", search.trim()); return apiRequest<DocumentList>(`/documents?${params.toString()}`, { token }); }
export function uploadDocument(token: string, productId: string, type: DocumentType, file: NativeFile) { const body = new FormData(); body.append("type", type); body.append("files", { uri: file.uri, name: file.name, type: file.mimeType ?? "application/octet-stream" } as unknown as Blob); return apiRequest<DocumentRecord[]>(`/products/${productId}/documents`, { method: "POST", token, body }); }
export function deleteDocument(token: string, id: string) { return apiRequest<null>(`/documents/${id}`, { method: "DELETE", token }); }
