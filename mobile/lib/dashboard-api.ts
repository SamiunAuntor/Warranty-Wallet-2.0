import { apiRequest } from "./api";

export type DashboardData = {
  products: { total: number; active: number; expiringSoon: number; expired: number };
  purchaseValue: string | number;
  claims: { open: number };
  warrantyHealth: number;
  warrantyTimeline: Array<{ id: string; name: string; expiryDate: string; warrantyStatus: string }>;
  notifications: { total: number; unread: number };
  plan: "BASIC" | "PLUS" | "PRO";
};

export function getDashboard(token: string) {
  return apiRequest<DashboardData>("/dashboard", { token });
}
