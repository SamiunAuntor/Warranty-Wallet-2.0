import type { Asset } from "@/lib/assets-api";

export type DocumentType =
  | "INVOICE"
  | "WARRANTY_CARD"
  | "PRODUCT_IMAGE"
  | "RECEIPT"
  | "OTHER"
  | "CLAIM_EVIDENCE"
  | "CLAIM_CONDITION";

export type DocumentRecord = {
  id: string;
  userId: string;
  productId: string;
  fileName: string;
  fileType: DocumentType;
  fileSize: number | null;
  fileUrl: string;
  publicId: string;
  provider: string;
  invoiceNumber: string | null;
  vendorName: string | null;
  ocrProcessed: boolean;
  ocrConfidence: number | null;
  ocrRaw: {
    productName?: string | null;
    brand?: string | null;
    purchaseDate?: string | null;
    purchasePrice?: number | null;
    sellerName?: string | null;
    invoiceNumber?: string | null;
    warrantyDuration?: number | null;
    confidence?: number | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  product: Asset;
  _count?: {
    claims: number;
  };
};

export type DocumentList = {
  data: DocumentRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ExtractedAssetData = {
  productName?: string | null;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  category?: string | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  sellerName?: string | null;
  invoiceNumber?: string | null;
  warrantyDuration?: number | null;
  warrantyType?: "MANUFACTURER" | "EXTENDED" | null;
  confidence?: number | null;
};

export type PendingAssetDocument = {
  file: File;
  type: DocumentType;
  extractedData?: ExtractedAssetData;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | { message?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.message || "The document request could not be completed.");
  }

  return (payload as ApiEnvelope<T>).data;
}

export function getDocuments(
  token: string,
  query: {
    page: number;
    limit: number;
    search?: string;
    type?: DocumentType;
    productId?: string;
  },
) {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });
  if (query.search) params.set("search", query.search);
  if (query.type) params.set("type", query.type);
  if (query.productId) params.set("productId", query.productId);
  return request<DocumentList>(`/documents?${params.toString()}`, token);
}

export function uploadDocuments(
  token: string,
  productId: string,
  type: DocumentType,
  files: File[],
  extractedData?: ExtractedAssetData,
) {
  const body = new FormData();
  body.set("type", type);
  files.forEach((file) => body.append("files", file));
  if (extractedData) body.set("extractedData", JSON.stringify(extractedData));
  return request<DocumentRecord[]>(`/products/${productId}/documents`, token, {
    method: "POST",
    body,
  });
}

export function extractAssetDocument(token: string, file: File) {
  const body = new FormData();
  body.set("file", file);
  return request<ExtractedAssetData>("/ai/extract-invoice", token, {
    method: "POST",
    body,
  });
}

export function replaceDocument(token: string, id: string, file: File) {
  const body = new FormData();
  body.set("file", file);
  return request<DocumentRecord>(`/documents/${id}`, token, {
    method: "PATCH",
    body,
  });
}

export function deleteDocument(token: string, id: string) {
  return request<null>(`/documents/${id}`, token, { method: "DELETE" });
}
