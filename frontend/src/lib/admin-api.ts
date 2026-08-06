import type { Asset, Brand, Category } from "@/lib/assets-api";
import type { Claim, ClaimStatus, ClaimUpdate } from "@/lib/claims-api";
import type { Payment } from "@/lib/billing-api";
import type { AppUser } from "@/lib/auth-api";
import { apiRequest, apiRequestEnvelope } from "@/lib/api-client";
import type { ApiSuccess } from "@/lib/api-contracts";

export type Meta = { page: number; limit: number; total: number; totalPages: number };
export type ListResult<T> = { data: T[]; meta: Meta };
export type AdminUser = AppUser & { createdAt: string; subscription?: { status: string; expiresAt: string } | null };
export type AdminAsset = Asset & { user: { id: string; name: string; email: string } };
export type AdminPayment = Payment & { user: { id: string; name: string; email: string } };
export type AdminClaim = Omit<Claim, "timeline"> & { timeline: NonNullable<Claim["timeline"]>; user: { id: string; name: string; email: string } };
export type AdminStats = { totalUsers: number; activeUsers: number; blockedUsers: number; paidUsers: number; totalProducts: number; totalCategories: number; totalPayments: number; totalRevenue: string | number };
export type RevenuePoint = { createdAt?: string; _sum?: { amount?: string | number | null }; month?: number; revenue?: string | number };
export type GrowthPoint = { createdAt?: string; _count?: { id?: number }; month?: number; count?: number };
export type Activity = { id: string; title: string; description: string | null; type: string; entity: string; createdAt: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
async function request<T>(path: string, token: string, init?: RequestInit) {
  const data = await apiRequest<T>(path, { ...init, cache: "no-store", token, fallbackMessage: "Admin request failed." });
  return { data } as ApiSuccess<T>;
}
async function listRequest<T>(path: string, token: string) {
  return apiRequestEnvelope<T[], Meta>(path, { token, cache: "no-store", fallbackMessage: "Admin list request failed." });
}
const params = (query: Record<string, string | number | undefined>) => { const value = new URLSearchParams(); Object.entries(query).forEach(([key, item]) => { if (item !== undefined && item !== "") value.set(key, String(item)); }); return value.toString(); };

export const getAdminStats = async (token: string) => (await request<AdminStats>("/admin/dashboard", token)).data;
export const getRevenue = async (token: string, year: number) => (await request<RevenuePoint[]>(`/dashboard/admin/revenue?year=${year}`, token)).data;
export const getGrowth = async (token: string, year: number) => (await request<GrowthPoint[]>(`/dashboard/admin/product-growth?year=${year}`, token)).data;
export const getAdminUsers = (token: string, query: Record<string, string | number | undefined>) => listRequest<AdminUser>(`/admin/users?${params(query)}`, token);
export const setUserBlocked = (token: string, id: string, blocked: boolean) => request<AdminUser>(`/admin/users/${id}/${blocked ? "block" : "unblock"}`, token, { method: "PATCH" });
export const deleteAdminUser = (token: string, id: string) => request<null>(`/admin/users/${id}`, token, { method: "DELETE" });
export const getAdminAssets = (token: string, query: Record<string, string | number | undefined>) => listRequest<AdminAsset>(`/admin/products?${params(query)}`, token);
export const deleteAdminAsset = (token: string, id: string) => request<null>(`/admin/products/${id}`, token, { method: "DELETE" });
export const getAdminClaims = (token: string, query: Record<string, string | number | undefined>) => listRequest<AdminClaim>(`/admin/claims?${params(query)}`, token);
export const updateAdminClaim = async (token: string, id: string, input: ClaimUpdate) => (await request<Claim>(`/admin/claims/${id}/status`, token, { method: "PATCH", body: JSON.stringify(input) })).data;
export const getAdminCategories = (token: string, query: Record<string, string | number | undefined> = {}) => listRequest<Category>(`/admin/categories?${params(query)}`, token);
export const createCategory = (token: string, input: { name: string; description?: string }) => request<Category>("/categories", token, { method: "POST", body: JSON.stringify(input) });
export const updateCategory = (token: string, id: string, input: Partial<Category>) => request<Category>(`/categories/${id}`, token, { method: "PATCH", body: JSON.stringify(input) });
export const deleteCategory = (token: string, id: string) => request<null>(`/categories/${id}`, token, { method: "DELETE" });
export const getAdminBrands = (token: string, query: Record<string, string | number | undefined> = {}) => listRequest<Brand>(`/admin/brands?${params(query)}`, token);
export const createBrand = (token: string, input: { name: string; description?: string; websiteUrl?: string | null }) => request<Brand>("/brands", token, { method: "POST", body: JSON.stringify(input) });
export const updateBrand = (token: string, id: string, input: Partial<Brand> & { isActive?: boolean }) => request<Brand>(`/brands/${id}`, token, { method: "PATCH", body: JSON.stringify(input) });
export const deleteBrand = (token: string, id: string) => request<null>(`/brands/${id}`, token, { method: "DELETE" });
export const getAdminPayments = (token: string, query: Record<string, string | number | undefined>) => listRequest<AdminPayment>(`/admin/payments?${params(query)}`, token);
export const broadcast = (token: string, input: { title: string; message: string; type: string }) => request<null>("/admin/notifications", token, { method: "POST", body: JSON.stringify(input) });
export const getAdminActivities = async (token: string) => { const result = await request<Activity[]>("/activities?page=1&limit=20", token); return result.data; };
export async function downloadAdminReport(token: string, report: string, format: "PDF" | "EXCEL") {
  const response = await fetch(`${API_URL}/reports/${report}?format=${format}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) { const error = await response.json().catch(() => null); throw new Error(error?.message || "Report download failed."); }
  const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${report.replaceAll("/", "-")}.${format === "PDF" ? "pdf" : "xlsx"}`; link.click(); URL.revokeObjectURL(url);
}
export { type Asset, type Brand, type Category, type Claim, type ClaimStatus };
