import { apiList, apiRequest, queryString } from "./api";
import type { Asset, AssetInput, Brand, Category, LifecycleStatus, WarrantyStatus } from "./types";

export type AssetQuery = {
  page?: number;
  limit?: number;
  search?: string;
  warrantyStatus?: WarrantyStatus;
  lifecycleStatus?: LifecycleStatus;
  categoryId?: string;
};

export const getAssets = (query: AssetQuery = {}) =>
  apiList<Asset>(`/products${queryString({ page: 1, limit: 20, ...query })}`);

export const getAsset = (id: string) => apiRequest<Asset>(`/products/${id}`);

export const createAsset = (input: AssetInput) =>
  apiRequest<Asset>("/products", { method: "POST", body: input });

export const updateAsset = (id: string, input: Partial<AssetInput>) =>
  apiRequest<Asset>(`/products/${id}`, { method: "PATCH", body: input });

export const deleteAsset = (id: string) =>
  apiRequest<null>(`/products/${id}`, { method: "DELETE" });

export const getCategories = () => apiRequest<Category[]>("/categories", { auth: false });

export const getBrands = () => apiRequest<Brand[]>("/brands", { auth: false });
