import { apiRequest } from "./api";

export type DashboardData = {
  products: {
    total: number;
    active: number;
    expiringSoon: number;
    expired: number;
  };
  purchaseValue: string | number;
  claims: { open: number };
  warrantyHealth: number;
  warrantyTimeline: Array<{
    id: string;
    name: string;
    expiryDate: string;
    warrantyStatus: string;
  }>;
  notifications: { total: number; unread: number };
  plan: "BASIC" | "PLUS" | "PRO";
};
export type WarrantyHeatmapData = {
  summary: {
    totalProducts: number;
    totalValue: number;
    valueAtRisk: number;
    healthScore: number;
    statusCounts: {
      ACTIVE: number;
      EXPIRING_SOON: number;
      EXPIRED: number;
      NO_WARRANTY: number;
    };
  };
  trend: Array<{
    monthName: string;
    ACTIVE: number;
    EXPIRING_SOON: number;
    EXPIRED: number;
    totalItems: number;
    totalValue: number;
  }>;
};

export function getDashboard(token: string) {
  return apiRequest<DashboardData>("/dashboard", { token });
}
export function getWarrantyHeatmap(token: string) {
  return apiRequest<WarrantyHeatmapData>("/dashboard/warranty-heatmap", {
    token,
  });
}
