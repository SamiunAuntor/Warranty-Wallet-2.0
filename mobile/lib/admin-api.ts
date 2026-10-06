import { apiList, apiRequest, queryString } from "./api";
import type {
  AppUser,
  Asset,
  Brand,
  Category,
  Claim,
  ClaimStatus,
  Payment,
  PaymentStatus,
  UserStatus,
} from "./types";

export type AdminStats = {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  paidUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalPayments: number;
  totalRevenue: string | number;
};
export type AdminUser = AppUser & { createdAt: string };
export type AdminAsset = Asset & { user: { id: string; name: string; email: string } };
export type AdminClaim = Claim & { user: { id: string; name: string; email: string } };
export type AdminPayment = Payment & { user: { id: string; name: string; email: string } };
export type RevenuePoint = { createdAt: string; _sum?: { amount?: string | number | null } };
export type GrowthPoint = { createdAt: string; _count?: { id?: number } };

type ListQuery = { page?: number; limit?: number; search?: string };

const list = <T>(path: string, query: Record<string, string | number | undefined>) =>
  apiList<T>(`${path}${queryString({ page: 1, limit: 20, ...query })}`);

export const getAdminStats = () => apiRequest<AdminStats>("/admin/dashboard");
export const getRevenue = (year: number) =>
  apiRequest<RevenuePoint[]>(`/dashboard/admin/revenue?year=${year}`);
export const getProductGrowth = (year: number) =>
  apiRequest<GrowthPoint[]>(`/dashboard/admin/product-growth?year=${year}`);

export const getAdminUsers = (query: ListQuery & { status?: UserStatus }) =>
  list<AdminUser>("/admin/users", query);
export const setUserBlocked = (id: string, blocked: boolean) =>
  apiRequest<AdminUser>(`/admin/users/${id}/${blocked ? "block" : "unblock"}`, {
    method: "PATCH",
  });
export const deleteAdminUser = (id: string) =>
  apiRequest<null>(`/admin/users/${id}`, { method: "DELETE" });

export const getAdminAssets = (query: ListQuery) => list<AdminAsset>("/admin/products", query);
export const deleteAdminAsset = (id: string) =>
  apiRequest<null>(`/admin/products/${id}`, { method: "DELETE" });

export const getAdminClaims = (query: ListQuery & { status?: ClaimStatus }) =>
  list<AdminClaim>("/admin/claims", query);
export const updateAdminClaimStatus = (id: string, status: ClaimStatus) =>
  apiRequest<AdminClaim>(`/admin/claims/${id}/status`, { method: "PATCH", body: { status } });

export const getAdminPayments = (query: ListQuery & { status?: PaymentStatus }) =>
  list<AdminPayment>("/admin/payments", query);

export const getAdminCategories = (query: ListQuery = {}) =>
  list<Category>("/admin/categories", { limit: 100, ...query });
export const createCategory = (input: { name: string; description?: string | null }) =>
  apiRequest<Category>("/categories", { method: "POST", body: input });
export const updateCategory = (
  id: string,
  input: { name?: string; description?: string | null; isActive?: boolean },
) => apiRequest<Category>(`/categories/${id}`, { method: "PATCH", body: input });
export const deleteCategory = (id: string) =>
  apiRequest<null>(`/categories/${id}`, { method: "DELETE" });

export const getAdminBrands = (query: ListQuery = {}) =>
  list<Brand>("/admin/brands", { limit: 100, ...query });
export const createBrand = (input: {
  name: string;
  description?: string | null;
  websiteUrl?: string | null;
}) => apiRequest<Brand>("/brands", { method: "POST", body: input });
export const updateBrand = (
  id: string,
  input: {
    name?: string;
    description?: string | null;
    websiteUrl?: string | null;
    isActive?: boolean;
  },
) => apiRequest<Brand>(`/brands/${id}`, { method: "PATCH", body: input });
export const deleteBrand = (id: string) => apiRequest<null>(`/brands/${id}`, { method: "DELETE" });

export const broadcastNotification = (input: { title: string; message: string }) =>
  apiRequest<null>("/admin/notifications", {
    method: "POST",
    body: { ...input, type: "SYSTEM" },
  });
