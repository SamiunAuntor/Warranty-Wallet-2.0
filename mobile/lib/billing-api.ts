import { apiRequest } from "./api";
export type Plan = "BASIC" | "PLUS" | "PRO";
export type Subscription = {
  id: string;
  plan: Plan;
  scheduledPlan: Plan | null;
  pendingPlan: Plan | null;
  paymentUrl?: string | null;
  status: "ACTIVE" | "INCOMPLETE" | "PAST_DUE" | "EXPIRED" | "CANCELLED";
  startsAt: string;
  expiresAt: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  isActive: boolean;
} | null;
export type Payment = {
  id: string;
  amount: string;
  currency: string;
  plan: Plan | null;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  createdAt: string;
};
export type PaymentList = {
  data: Payment[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};
export function getSubscription(token: string) {
  return apiRequest<Subscription>("/payments/subscription", { token });
}
export async function getPayments(token: string) {
  return {
    data: await apiRequest<Payment[]>("/payments?page=1&limit=20", { token }),
  };
}
export function createCheckout(token: string, plan: "PLUS" | "PRO") {
  return apiRequest<{ url: string }>("/payments/create-checkout", {
    method: "POST",
    token,
    body: JSON.stringify({ plan }),
  });
}
export function confirmCheckout(token: string, sessionId: string) {
  return apiRequest<{
    payment: Payment;
    subscription: NonNullable<Subscription>;
  }>("/payments/confirm-checkout", {
    method: "POST",
    token,
    body: JSON.stringify({ sessionId }),
  });
}
export function cancelSubscription(token: string) {
  return apiRequest<NonNullable<Subscription>>("/payments/cancel-subscription", {
    method: "POST",
    token,
  });
}
export function resumeSubscription(token: string) {
  return apiRequest<NonNullable<Subscription>>("/payments/resume-subscription", {
    method: "POST",
    token,
  });
}
