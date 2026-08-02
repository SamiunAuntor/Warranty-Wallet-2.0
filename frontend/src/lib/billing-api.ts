import type { UserPlan } from "@/constants/plans";
type Envelope<T> = { data: T; message: string; meta?: { page: number; totalPages: number; total: number } };
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
async function request<T>(path: string, token: string, init?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, { ...init, cache: "no-store", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init?.headers } });
  const payload = await response.json().catch(() => null) as Envelope<T> | null;
  if (!response.ok || !payload) throw new Error(payload?.message || "Billing request failed.");
  return payload;
}
export type Subscription = { id: string; plan: UserPlan; status: string; startsAt: string; expiresAt: string; isActive: boolean } | null;
export type Payment = { id: string; amount: string; currency: string; plan: UserPlan; status: string; createdAt: string };
export const getSubscription = async (token: string) => (await request<Subscription>("/payments/subscription", token)).data;
export const getPayments = async (token: string) => request<Payment[]>("/payments?page=1&limit=20", token);
export const createCheckout = async (token: string, plan: "PLUS" | "PRO") => (await request<{ url: string }>("/payments/create-checkout", token, { method: "POST", body: JSON.stringify({ plan }) })).data;
export const confirmCheckout = async (token: string, sessionId: string) => (await request<{ payment: Payment; subscription: NonNullable<Subscription> }>("/payments/confirm-checkout", token, { method: "POST", body: JSON.stringify({ sessionId }) })).data;
