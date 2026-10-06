import { apiList, apiRequest, queryString } from "./api";
import type { PaidPlan, Payment, PlanInfo, Subscription } from "./types";

export const getPlans = () => apiRequest<PlanInfo[]>("/payments/plans", { auth: false });

export const getSubscription = () => apiRequest<Subscription | null>("/payments/subscription");

export const getPayments = (page = 1, limit = 20) =>
  apiList<Payment>(`/payments${queryString({ page, limit })}`);

export const createCheckout = (plan: PaidPlan, returnUrl: string) =>
  apiRequest<{ url: string }>("/payments/create-checkout", {
    method: "POST",
    body: { plan, returnUrl },
  });

export const confirmCheckout = (sessionId: string) =>
  apiRequest<{ payment: Payment; subscription: Subscription }>("/payments/confirm-checkout", {
    method: "POST",
    body: { sessionId },
  });

export const changePlan = (plan: PaidPlan) =>
  apiRequest<{ subscription: Subscription; paymentUrl: string | null }>("/payments/change-plan", {
    method: "POST",
    body: { plan },
  });

export const cancelSubscription = () =>
  apiRequest<Subscription>("/payments/cancel-subscription", { method: "POST" });

export const resumeSubscription = () =>
  apiRequest<Subscription>("/payments/resume-subscription", { method: "POST" });
