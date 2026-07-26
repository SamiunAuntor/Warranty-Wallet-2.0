import type { Asset } from "@/lib/assets-api";

export type DocumentType =
  | "INVOICE"
  | "WARRANTY_CARD"
  | "PRODUCT_IMAGE"
  | "RECEIPT"
  | "OTHER";

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
) {
  const body = new FormData();
  body.set("type", type);
  files.forEach((file) => body.append("files", file));
  return request<DocumentRecord[]>(`/products/${productId}/documents`, token, {
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
