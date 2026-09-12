import { apiRequest } from "./api";

export type AdminStats = { totalUsers: number; activeUsers: number; blockedUsers: number; paidUsers: number; totalProducts: number; totalCategories: number; totalPayments: number; totalRevenue: string | number };
export type AdminUser = { id: string; name: string; email: string; role: "USER" | "ADMIN"; status: "ACTIVE" | "BLOCKED" | "DELETED"; plan: "BASIC" | "PLUS" | "PRO"; createdAt: string };
export type AdminUserList = { data: AdminUser[]; meta: { page: number; limit: number; total: number; totalPages: number } };
export function getAdminStats(token: string) { return apiRequest<AdminStats>("/admin/dashboard", { token }); }
export function getAdminUsers(token: string) { return apiRequest<AdminUserList>("/admin/users?page=1&limit=50", { token }); }
export function setUserBlocked(token: string, id: string, blocked: boolean) { return apiRequest<AdminUser>(`/admin/users/${id}/${blocked ? "block" : "unblock"}`, { method: "PATCH", token }); }
export function broadcast(token: string, input: { title: string; message: string; type: string }) { return apiRequest<null>("/admin/notifications", { method: "POST", token, body: JSON.stringify(input) }); }
