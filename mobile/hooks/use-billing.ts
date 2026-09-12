import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import {
  cancelSubscription,
  confirmCheckout,
  createCheckout,
  getPayments,
  getSubscription,
  resumeSubscription,
  type Payment,
  type Subscription,
} from "../lib/billing-api";
import { useAuth } from "../providers/auth-provider";

export function useBilling() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const [current, history] = await Promise.all([getSubscription(token), getPayments(token)]);

      setSubscription(current);
      setPayments(history.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load billing.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const upgrade = useCallback(
    async (plan: "PLUS" | "PRO") => {
      if (!user) return;

      setBusy(true);
      setError("");

      try {
        const token = await user.getIdToken();
        const { url } = await createCheckout(token, plan);
        const result = await WebBrowser.openBrowserAsync(url);
        const returnedUrl = "url" in result && typeof result.url === "string" ? result.url : "";
        const sessionId = returnedUrl.match(/[?&]session_id=([^&]+)/)?.[1];

        if (sessionId) {
          await confirmCheckout(token, decodeURIComponent(sessionId));
        }

        await load();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not complete checkout.");
      } finally {
        setBusy(false);
      }
    },
    [load, user],
  );

  const toggleCancel = useCallback(async () => {
    if (!user || !subscription) return;

    setBusy(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const nextSubscription = subscription.cancelAtPeriodEnd
        ? await resumeSubscription(token)
        : await cancelSubscription(token);

      setSubscription(nextSubscription);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update subscription.");
    } finally {
      setBusy(false);
    }
  }, [subscription, user]);

  return {
    busy,
    error,
    loading,
    payments,
    subscription,
    toggleCancel,
    upgrade,
  };
}
