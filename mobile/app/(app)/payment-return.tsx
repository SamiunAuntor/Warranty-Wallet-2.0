import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { LoadingState } from "../../components/ui/ScreenStates";
import { useConfirmReturnedCheckout } from "../../hooks/use-billing";

/**
 * Deep-link target for the end of Stripe Checkout. Normally the billing
 * screen handles the result directly; this covers the cases where the
 * operating system opens the link instead, such as after the app restarted.
 */
export default function PaymentReturnScreen() {
  const { status, session_id: sessionId } = useLocalSearchParams<{
    status?: string;
    session_id?: string;
  }>();
  const confirmCheckout = useConfirmReturnedCheckout();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    confirmCheckout.mutate(status === "success" ? (sessionId ?? null) : null, {
      onSettled: () => {
        if (router.canGoBack()) router.back();
        else router.replace("/(app)/billing");
      },
    });
  }, [confirmCheckout, sessionId, status]);

  return <LoadingState label="Updating your plan" />;
}
