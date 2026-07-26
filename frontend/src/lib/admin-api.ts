import type { Asset, Brand, Category } from "@/lib/assets-api";
import type { Claim, ClaimStatus, ClaimUpdate } from "@/lib/claims-api";
import type { Payment } from "@/lib/billing-api";
import type { AppUser } from "@/lib/auth-api";

export type Meta = { page: number; limit: number; total: number; totalPages: number };
export type ListResult<T> = { data: T[]; meta: Meta };
export type AdminUser = AppUser & { createdAt: string; subscription?: { status: string; expiresAt: string } | null };
export type AdminAsset = Asset & { user: { id: string; name: string; email: string } };
export type AdminPayment = Payment & { user: { id: string; name: string; email: string } };
export type AdminStats = { totalUsers: number; activeUsers: number; blockedUsers: number; paidUsers: number; totalProducts: number; totalCategories: number; totalPayments: number; totalRevenue: string | number };
export type RevenuePoint = { createdAt?: string; _sum?: { amount?: string | number | null }; month?: number; revenue?: string | number };
export type GrowthPoint = { createdAt?: string; _count?: { id?: number }; month?: number; count?: number };

type Envelope<T> = { data: T; message: string; meta?: Meta };
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
async function request<T>(path: string, token: string, init?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, { ...init, cache: "no-store", headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), Authorization: `Bearer ${token}`, ...init?.headers } });
  const payload = await response.json().catch(() => null) as Envelope<T> | null;
  if (!response.ok || !payload) throw new Error(payload?.message || "Admin request failed.");
  return payload;
}
const params = (query: Record<string, string | number | undefined>) => { const value = new URLSearchParams(); Object.entries(query).forEach(([key, item]) => { if (item !== undefined && item !== "") value.set(key, String(item)); }); return value.toString(); };

export const getAdminStats = async (token: string) => (await request<AdminStats>("/admin/dashboard", token)).data;
export const getRevenue = async (token: string, year: number) => (await request<RevenuePoint[]>(`/dashboard/admin/revenue?year=${year}`, token)).data;
export const getGrowth = async (token: string, year: number) => (await request<GrowthPoint[]>(`/dashboard/admin/product-growth?year=${year}`, token)).data;
export const getAdminUsers = async (token: string, query: Record<string, string | number | undefined>) => { const result = await request<AdminUser[]>(`/admin/users?${params(query)}`, token); return { data: result.data, meta: result.meta! }; };
export const setUserBlocked = (token: string, id: string, blocked: boolean) => request<AdminUser>(`/admin/users/${id}/${blocked ? "block" : "unblock"}`, token, { method: "PATCH" });
export const deleteAdminUser = (token: string, id: string) => request<null>(`/admin/users/${id}`, token, { method: "DELETE" });
export const getAdminAssets = async (token: string, query: Record<string, string | number | undefined>) => { const result = await request<AdminAsset[]>(`/admin/products?${params(query)}`, token); return { data: result.data, meta: result.meta! }; };
export const deleteAdminAsset = (token: string, id: string) => request<null>(`/admin/products/${id}`, token, { method: "DELETE" });
export const getAdminClaims = async (token: string, query: Record<string, string | number | undefined>) => (await request<ListResult<Claim>>(`/claims?${params(query)}`, token)).data;
export const updateAdminClaim = async (token: string, id: string, input: ClaimUpdate) => (await request<Claim>(`/claims/${id}`, token, { method: "PATCH", body: JSON.stringify(input) })).data;
export const getAdminCategories = async (token: string) => (await request<Category[]>("/admin/categories", token)).data;
export const createCategory = (token: string, input: { name: string; description?: string }) => request<Category>("/categories", token, { method: "POST", body: JSON.stringify(input) });
export const updateCategory = (token: string, id: string, input: Partial<Category>) => request<Category>(`/categories/${id}`, token, { method: "PATCH", body: JSON.stringify(input) });
export const deleteCategory = (token: string, id: string) => request<null>(`/categories/${id}`, token, { method: "DELETE" });
export const getAdminBrands = async (token: string) => (await request<Brand[]>("/brands?includeInactive=true", token)).data;
export const createBrand = (token: string, input: { name: string; description?: string }) => request<Brand>("/brands", token, { method: "POST", body: JSON.stringify(input) });
export const updateBrand = (token: string, id: string, input: Partial<Brand> & { isActive?: boolean }) => request<Brand>(`/brands/${id}`, token, { method: "PATCH", body: JSON.stringify(input) });
export const deleteBrand = (token: string, id: string) => request<null>(`/brands/${id}`, token, { method: "DELETE" });
export const getAdminPayments = async (token: string, query: Record<string, string | number | undefined>) => { const result = await request<AdminPayment[]>(`/admin/payments?${params(query)}`, token); return { data: result.data, meta: result.meta! }; };
export const broadcast = (token: string, input: { title: string; message: string; type: string }) => request<null>("/admin/notifications", token, { method: "POST", body: JSON.stringify(input) });
export { type Asset, type Brand, type Category, type Claim, type ClaimStatus };
