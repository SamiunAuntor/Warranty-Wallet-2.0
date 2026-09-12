import { apiRequest } from "./api";

export type Category = { id: string; name: string; slug: string; icon: string | null; description: string | null; isActive: boolean };
export type WarrantyStatus = "NO_WARRANTY" | "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
export type Asset = {
  id: string; name: string; brand: string; model: string | null; serialNumber: string | null; purchasePrice: string; purchaseDate: string;
  hasWarranty: boolean; warrantyDuration: number | null; warrantyType: "MANUFACTURER" | "EXTENDED" | null; expiryDate: string | null; warrantyStatus: WarrantyStatus; lifecycleStatus: "ADDED" | "ARCHIVED";
  sellerName?: string | null; sellerPhone?: string | null; sellerAddress?: string | null; notes?: string | null; productImageUrl?: string | null;
  category: Category; documents?: Array<{ id: string; fileName: string; fileType: string; fileUrl: string; createdAt: string }>; _count?: { claims: number; documents: number };
};
export type AssetInput = { name: string; brand: string; model?: string; serialNumber?: string; categoryId: string; purchasePrice: number; purchaseDate: string; hasWarranty: boolean; warrantyDuration?: number | null; warrantyType?: "MANUFACTURER" | "EXTENDED" | null; lifecycleStatus?: "ADDED" | "ARCHIVED"; sellerName?: string; sellerPhone?: string; sellerAddress?: string; notes?: string };
export type AssetList = { data: Asset[]; meta: { page: number; limit: number; total: number; totalPages: number } };

export function getAssets(token: string, search = "") {
  const params = new URLSearchParams({ page: "1", limit: "50" });
  if (search.trim()) params.set("search", search.trim());
  return apiRequest<AssetList>(`/products?${params.toString()}`, { token });
}
export function getCategories() { return apiRequest<Category[]>("/categories"); }
export function getAsset(token: string, id: string) { return apiRequest<Asset>(`/products/${id}`, { token }); }
export function createAsset(token: string, input: AssetInput) { return apiRequest<Asset>("/products", { method: "POST", token, body: JSON.stringify(input) }); }
export function updateAsset(token: string, id: string, input: Partial<AssetInput>) { return apiRequest<Asset>(`/products/${id}`, { method: "PATCH", token, body: JSON.stringify(input) }); }
export function deleteAsset(token: string, id: string) { return apiRequest<null>(`/products/${id}`, { method: "DELETE", token }); }
