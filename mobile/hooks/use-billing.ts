import { useMutation, useQuery } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { getProfile } from "../lib/auth-api";
import {
  cancelSubscription,
  changePlan,
  confirmCheckout,
  createCheckout,
  getPayments,
  getPlans,
  getSubscription,
  resumeSubscription,
} from "../lib/billing-api";
import type { PaidPlan } from "../lib/types";
import { useAuth } from "../providers/auth-provider";
import { keys, useInvalidate, useSignedIn } from "./query-keys";
import { usePagedQuery } from "./use-paged-query";

export const PAYMENT_RETURN_PATH = "payment-return";

export const usePlans = () =>
  useQuery({ queryKey: keys.plans, queryFn: getPlans, staleTime: 60 * 60_000 });

export const useSubscription = () =>
  useQuery({ queryKey: keys.subscription, queryFn: getSubscription, enabled: useSignedIn() });

export function usePaymentList() {
  return usePagedQuery(keys.payments, (page) => getPayments(page), { enabled: useSignedIn() });
}

export type CheckoutOutcome = "paid" | "cancelled" | "pending";

/** Refreshes billing data and the signed-in user, whose plan may have changed. */
function useRefreshBilling() {
  const invalidate = useInvalidate();
  const { setAppUser } = useAuth();
  return async () => {
    await invalidate.billing();
    setAppUser(await getProfile());
  };
}

export function useBillingActions() {
  const refresh = useRefreshBilling();

  /**
   * Opens Stripe Checkout in an auth session. The API sends Stripe back to an
   * app deep link, which closes the browser and returns the session id here.
   */
  const checkout = useMutation({
    mutationFn: async (plan: PaidPlan): Promise<CheckoutOutcome> => {
      const returnUrl = Linking.createURL(PAYMENT_RETURN_PATH);
      const { url } = await createCheckout(plan, returnUrl);
      const result = await WebBrowser.openAuthSessionAsync(url, returnUrl);
      if (result.type !== "success") return "cancelled";

      const { queryParams } = Linking.parse(result.url);
      const sessionId = typeof queryParams?.session_id === "string" ? queryParams.session_id : null;
      if (queryParams?.status !== "success" || !sessionId) return "cancelled";

      try {
        await confirmCheckout(sessionId);
        return "paid";
      } catch {
        // The Stripe webhook will still activate the plan once payment settles.
        return "pending";
      }
    },
    onSettled: refresh,
  });

  const switchPlan = useMutation({
    mutationFn: async (plan: PaidPlan) => {
      const result = await changePlan(plan);
      if (result.paymentUrl) await WebBrowser.openBrowserAsync(result.paymentUrl);
      return result;
    },
    onSettled: refresh,
  });

  const cancel = useMutation({ mutationFn: cancelSubscription, onSuccess: refresh });
  const resume = useMutation({ mutationFn: resumeSubscription, onSuccess: refresh });

  return { checkout, switchPlan, cancel, resume };
}

/** Confirms a checkout that reached the app through the payment-return deep link. */
export function useConfirmReturnedCheckout() {
  const refresh = useRefreshBilling();
  return useMutation({
    mutationFn: async (sessionId: string | null) => {
      if (sessionId) await confirmCheckout(sessionId).catch(() => undefined);
    },
    onSettled: refresh,
  });
}
