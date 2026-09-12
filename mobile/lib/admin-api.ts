import { apiRequest } from "./api";

export type AdminStats = { totalUsers: number; activeUsers: number; blockedUsers: number; paidUsers: number; totalProducts: number; totalCategories: number; totalPayments: number; totalRevenue: string | number };
export type AdminUser = { id: string; name: string; email: string; role: "USER" | "ADMIN"; status: "ACTIVE" | "BLOCKED" | "DELETED"; plan: "BASIC" | "PLUS" | "PRO"; createdAt: string };
export type AdminUserList = { data: AdminUser[]; meta: { page: number; limit: number; total: number; totalPages: number } };
export function getAdminStats(token: string) { return apiRequest<AdminStats>("/admin/dashboard", { token }); }
export function getAdminUsers(token: string) { return apiRequest<AdminUserList>("/admin/users?page=1&limit=50", { token }); }
export function setUserBlocked(token: string, id: string, blocked: boolean) { return apiRequest<AdminUser>(`/admin/users/${id}/${blocked ? "block" : "unblock"}`, { method: "PATCH", token }); }
export function broadcast(token: string, input: { title: string; message: string; type: string }) { return apiRequest<null>("/admin/notifications", { method: "POST", token, body: JSON.stringify(input) }); }
export type CatalogItem = { id: string; name: string; description?: string | null; websiteUrl?: string | null; isActive?: boolean; _count?: { products: number } };
export type AdminAsset = { id: string; name: string; brand: string; warrantyStatus: string; lifecycleStatus: string; user: { name: string; email: string } };
export type AdminClaim = { id: string; claimNumber: string; title: string; status: string; product: { name: string }; user: { name: string; email: string } };
export type AdminPayment = { id: string; amount: string | number; currency: string; plan: string | null; status: string; user: { name: string; email: string }; createdAt: string };
export function getAdminCategories(token: string) { return apiRequest<CatalogItem[]>("/admin/categories?page=1&limit=50", { token }); }
export function getAdminBrands(token: string) { return apiRequest<CatalogItem[]>("/admin/brands?page=1&limit=50", { token }); }
export function createCategory(token: string, name: string, description: string) { return apiRequest<CatalogItem>("/categories", { method: "POST", token, body: JSON.stringify({ name, description }) }); }
export function createBrand(token: string, name: string, description: string) { return apiRequest<CatalogItem>("/brands", { method: "POST", token, body: JSON.stringify({ name, description }) }); }
export function deleteCategory(token: string, id: string) { return apiRequest<null>(`/categories/${id}`, { method: "DELETE", token }); }
export function deleteBrand(token: string, id: string) { return apiRequest<null>(`/brands/${id}`, { method: "DELETE", token }); }
export function getAdminAssets(token: string) { return apiRequest<AdminAsset[]>("/admin/products?page=1&limit=50", { token }); }
export function deleteAdminAsset(token: string, id: string) { return apiRequest<null>(`/admin/products/${id}`, { method: "DELETE", token }); }
export function getAdminClaims(token: string) { return apiRequest<AdminClaim[]>("/admin/claims?page=1&limit=50", { token }); }
export function updateAdminClaim(token: string, id: string, status: string) { return apiRequest<AdminClaim>(`/admin/claims/${id}/status`, { method: "PATCH", token, body: JSON.stringify({ status }) }); }
export function getAdminPayments(token: string) { return apiRequest<AdminPayment[]>("/admin/payments?page=1&limit=50", { token }); }
