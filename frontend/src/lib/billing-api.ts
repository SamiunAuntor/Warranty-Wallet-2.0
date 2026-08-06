import type { UserPlan } from "@/constants/plans";
import { apiRequest, apiRequestEnvelope } from "@/lib/api-client";
import type { PaginationMeta } from "@/lib/api-contracts";

async function request<T>(path: string, token: string, init?: RequestInit) {
  return apiRequest<T>(path, { ...init, cache: "no-store", token });
}
export type Subscription = { id: string; plan: UserPlan; scheduledPlan: UserPlan | null; pendingPlan: UserPlan | null; paymentUrl?: string | null; status: "ACTIVE" | "INCOMPLETE" | "PAST_DUE" | "EXPIRED" | "CANCELLED"; startsAt: string; expiresAt: string; currentPeriodStart: string | null; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean; cancelledAt: string | null; isActive: boolean } | null;
export type Payment = { id: string; amount: string; currency: string; plan: UserPlan; status: string; createdAt: string };
export const getSubscription = (token: string) => request<Subscription>("/payments/subscription", token);
export const getPayments = (token: string) => apiRequestEnvelope<Payment[], PaginationMeta>("/payments?page=1&limit=20", { token, cache: "no-store" });
export const createCheckout = (token: string, plan: "PLUS" | "PRO") => request<{ url: string }>("/payments/create-checkout", token, { method: "POST", body: JSON.stringify({ plan }) });
export const confirmCheckout = (token: string, sessionId: string) => request<{ payment: Payment; subscription: NonNullable<Subscription> }>("/payments/confirm-checkout", token, { method: "POST", body: JSON.stringify({ sessionId }) });
export const changePlan = (token: string, plan: "PLUS" | "PRO") => request<{ subscription: NonNullable<Subscription>; paymentUrl: string | null }>("/payments/change-plan", token, { method: "POST", body: JSON.stringify({ plan }) });
export const cancelSubscription = (token: string) => request<NonNullable<Subscription>>("/payments/cancel-subscription", token, { method: "POST" });
export const resumeSubscription = (token: string) => request<NonNullable<Subscription>>("/payments/resume-subscription", token, { method: "POST" });
