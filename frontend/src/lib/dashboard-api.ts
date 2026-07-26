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

type Envelope<T> = { data: T; message: string; success: boolean };
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function getDashboard(token: string) {
  const response = await fetch(`${API_URL}/dashboard`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => null) as Envelope<DashboardData> | null;
  if (!response.ok || !payload) throw new Error(payload?.message || "Could not load dashboard.");
  return payload.data;
}
