import { apiRequest } from "./api";
import type { Activity, Notification, Plan, WarrantyStatus } from "./types";

export type DashboardData = {
  products: { total: number; active: number; expiringSoon: number; expired: number };
  purchaseValue: string | number;
  documents: {
    total: number;
    aiProcessing: number;
    recent: Array<{
      id: string;
      fileName: string;
      fileType: string;
      createdAt: string;
      product: { id: string; name: string };
    }>;
  };
  claims: { open: number };
  warrantyHealth: number;
  warrantyTimeline: Array<{
    id: string;
    name: string;
    expiryDate: string;
    warrantyStatus: WarrantyStatus;
  }>;
  notifications: { total: number; unread: number };
  recentNotifications?: Notification[];
  recentActivities?: Activity[];
  plan: Plan;
};

export type HeatmapMonth = {
  month: string;
  monthName: string;
  count: number;
  value: number;
  statusBreakdown: { ACTIVE: number; EXPIRING_SOON: number; EXPIRED: number };
  products: Array<{
    id: string;
    name: string;
    brand: string;
    category: string;
    purchasePrice: number;
    expiryDate: string;
    warrantyStatus: WarrantyStatus;
    daysUntilExpiry: number;
  }>;
};

export type WarrantyHeatmapData = {
  summary: {
    totalProducts: number;
    totalValue: number;
    valueAtRisk: number;
    healthScore: number;
    statusCounts: Record<WarrantyStatus, number>;
  };
  heatmap: HeatmapMonth[];
  trend: Array<{
    month: string;
    monthName: string;
    ACTIVE: number;
    EXPIRING_SOON: number;
    EXPIRED: number;
    totalItems: number;
    totalValue: number;
  }>;
};

export const getDashboard = () => apiRequest<DashboardData>("/dashboard");

export const getWarrantyHeatmap = () =>
  apiRequest<WarrantyHeatmapData>("/dashboard/warranty-heatmap");
