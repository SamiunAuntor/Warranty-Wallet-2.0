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
      ocrProcessed: boolean;
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
    warrantyStatus: string;
  }>;
  notifications: { total: number; unread: number };
  plan: "BASIC" | "PLUS" | "PRO";
};

export async function getDashboard(token: string) {
  return apiRequest<DashboardData>("/dashboard", {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
}
import { apiRequest } from "@/lib/api-client";
