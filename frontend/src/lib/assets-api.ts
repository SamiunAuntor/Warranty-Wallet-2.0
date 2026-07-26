export type WarrantyStatus = "NO_WARRANTY" | "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
export type AssetLifecycleStatus = "ADDED" | "ARCHIVED";
export type WarrantyType = "MANUFACTURER" | "EXTENDED";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
};

export type Asset = {
  id: string;
  userId: string;
  categoryId: string;
  name: string;
  brand: string;
  model: string | null;
  serialNumber: string | null;
  purchasePrice: string;
  purchaseDate: string;
  hasWarranty: boolean;
  warrantyDuration: number | null;
  warrantyType: WarrantyType | null;
  expiryDate: string | null;
  warrantyStatus: WarrantyStatus;
  lifecycleStatus: AssetLifecycleStatus;
  sellerName: string | null;
  sellerPhone: string | null;
  sellerAddress: string | null;
  productImageUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  category: Category;
  documents?: Array<{ id: string; fileName: string }>;
  claims?: Array<{ id: string; claimNumber: string; title: string; status: string; updatedAt: string; _count?: { documents: number } }>;
  _count?: { claims: number; documents: number };
};

export type AssetInput = {
  name: string;
  brand: string;
  model?: string;
  serialNumber?: string;
  categoryId: string;
  purchasePrice: number;
  purchaseDate: string;
  hasWarranty: boolean;
  warrantyDuration?: number | null;
  warrantyType?: WarrantyType | null;
  lifecycleStatus?: AssetLifecycleStatus;
  sellerName?: string;
  sellerPhone?: string;
  sellerAddress?: string;
  productImageUrl?: string;
  notes?: string;
};

export type AssetList = {
  data: Asset[];
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

async function request<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | { message?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.message || "The asset request could not be completed.");
  }

  return (payload as ApiEnvelope<T>).data;
}

export function getCategories() {
  return request<Category[]>("/categories");
}

export function getAssets(
  token: string,
  query: {
    page: number;
    limit: number;
    search?: string;
    warrantyStatus?: WarrantyStatus;
    lifecycleStatus?: AssetLifecycleStatus;
    categoryId?: string;
  },
) {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });
  if (query.search) params.set("search", query.search);
  if (query.warrantyStatus) params.set("warrantyStatus", query.warrantyStatus);
  if (query.lifecycleStatus) params.set("lifecycleStatus", query.lifecycleStatus);
  if (query.categoryId) params.set("categoryId", query.categoryId);
  return request<AssetList>(`/products?${params.toString()}`, token);
}

export async function getAssetUsage(token: string) {
  const assets = await request<AssetList>("/products?page=1&limit=1", token);
  return assets.meta.total;
}

export function getAsset(token: string, id: string) {
  return request<Asset>(`/products/${id}`, token);
}

export function createAsset(token: string, input: AssetInput) {
  return request<Asset>("/products", token, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateAsset(token: string, id: string, input: Partial<AssetInput>) {
  return request<Asset>(`/products/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteAsset(token: string, id: string) {
  return request<null>(`/products/${id}`, token, { method: "DELETE" });
}
