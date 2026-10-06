import { Check, Crown } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { Badge, PlanBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, Section } from "../../components/ui/Card";
import { Screen } from "../../components/ui/Screen";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { ErrorState, InlineMessage, LoadingState } from "../../components/ui/ScreenStates";
import { Text } from "../../components/ui/Text";
import {
  useBillingActions,
  usePaymentList,
  usePlans,
  useSubscription,
  type CheckoutOutcome,
} from "../../hooks/use-billing";
import { useFormatters } from "../../hooks/use-preferences";
import { confirm } from "../../lib/confirm";
import { paymentStatusLabels, planNames, subscriptionStatusLabels } from "../../lib/labels";
import { colors, planColors, spacing } from "../../lib/theme";
import type { PaidPlan, PlanInfo } from "../../lib/types";
import { useCurrentUser } from "../../providers/auth-provider";
import { useToast } from "../../providers/toast-provider";

const outcomeMessages: Record<CheckoutOutcome, string> = {
  paid: "Payment complete. Your plan is active.",
  pending: "Payment received. Your plan will update in a moment.",
  cancelled: "Checkout was cancelled. You have not been charged.",
};

export default function BillingScreen() {
  const user = useCurrentUser();
  const toast = useToast();
  const format = useFormatters();
  const plans = usePlans();
  const subscription = useSubscription();
  const payments = usePaymentList();
  const actions = useBillingActions();
  const current = subscription.data;
  const hasPaidPlan = user.plan !== "BASIC" && Boolean(current?.isActive);
  const busy =
    actions.checkout.isPending ||
    actions.switchPlan.isPending ||
    actions.cancel.isPending ||
    actions.resume.isPending;

  async function choose(plan: PlanInfo) {
    const target = plan.id as PaidPlan;
    try {
      if (hasPaidPlan) {
        const ok = await confirm({
          title: `Switch to ${plan.name}?`,
          message: `Your subscription changes to ${format.money(plan.price, "USD")} per month.`,
          confirmLabel: "Switch plan",
        });
        if (!ok) return;
        await actions.switchPlan.mutateAsync(target);
        toast.success(`Your plan is changing to ${plan.name}.`);
        return;
      }
      const outcome = await actions.checkout.mutateAsync(target);
      if (outcome === "cancelled") toast.info(outcomeMessages.cancelled);
      else toast.success(outcomeMessages[outcome]);
    } catch (error) {
      toast.error(error, "Could not start checkout.");
    }
  }

  async function toggleCancellation() {
    if (!current) return;
    try {
      if (current.cancelAtPeriodEnd) {
        await actions.resume.mutateAsync();
        toast.success("Your subscription will renew.");
        return;
      }
      const ok = await confirm({
        title: "Cancel your subscription?",
        message: `You keep ${planNames[current.plan]} until ${format.date(current.currentPeriodEnd ?? current.expiresAt)}, then move to Basic.`,
        confirmLabel: "Cancel subscription",
        destructive: true,
      });
      if (!ok) return;
      await actions.cancel.mutateAsync();
      toast.success("Your subscription will end after this billing period.");
    } catch (error) {
      toast.error(error, "Could not update the subscription.");
    }
  }

  const header = <ScreenHeader title="Plan and billing" fallbackHref="/(app)/more" />;
  if (plans.isPending || subscription.isPending) return <Screen header={header}><LoadingState /></Screen>;
  if (plans.isError) {
    return (
      <Screen header={header}>
        <ErrorState error={plans.error} onRetry={() => void plans.refetch()} />
      </Screen>
    );
  }

  const status = current ? subscriptionStatusLabels[current.status] : null;
  const pendingPlan = current?.pendingPlan ?? current?.scheduledPlan;

  return (
    <Screen
      header={header}
      refreshing={subscription.isRefetching}
      onRefresh={() => {
        void subscription.refetch();
        void payments.refetch();
      }}
    >
      <Card>
        <View style={styles.rowBetween}>
          <Text variant="overline">Current plan</Text>
          {status && user.plan !== "BASIC" ? <Badge label={status.label} tone={status.tone} /> : null}
        </View>
        <View style={styles.currentPlan}>
          <Crown size={22} color={planColors[user.plan].foreground} />
          <Text variant="title">{planNames[user.plan]}</Text>
        </View>
        <Text variant="bodySmall" color={colors.muted}>
          {user.plan === "BASIC"
            ? "You're on the free plan. Upgrade for more assets and features."
            : current?.cancelAtPeriodEnd
              ? `Ends on ${format.date(current.currentPeriodEnd ?? current.expiresAt)}. You won't be charged again.`
              : `Renews on ${format.date(current?.currentPeriodEnd ?? current?.expiresAt)}.`}
        </Text>
        {pendingPlan && pendingPlan !== user.plan ? (
          <InlineMessage tone="info" message={`Changing to ${planNames[pendingPlan]} at the next billing date.`} />
        ) : null}
        {hasPaidPlan && current ? (
          <Button
            title={current.cancelAtPeriodEnd ? "Keep my subscription" : "Cancel subscription"}
            variant={current.cancelAtPeriodEnd ? "secondary" : "dangerOutline"}
            size="sm"
            loading={actions.cancel.isPending || actions.resume.isPending}
            disabled={busy}
            onPress={() => void toggleCancellation()}
          />
        ) : null}
      </Card>

      <Section title="Plans">
        <Text variant="bodySmall" color={colors.muted}>
          Every plan includes reminders, documents, claims, and reports. Upgrade when your asset
          collection grows.
        </Text>
        {plans.data.map((plan) => {
          const isCurrent = plan.id === user.plan;
          const palette = planColors[plan.id];
          return (
            <Card key={plan.id} style={isCurrent ? [styles.planCard, { borderColor: palette.border }] : styles.planCard}>
              <View style={styles.rowBetween}>
                <PlanBadge plan={plan.id} />
                <Text variant="heading">
                  {plan.price ? `${format.money(plan.price, "USD")}` : "Free"}
                  {plan.price ? <Text variant="caption"> / month</Text> : null}
                </Text>
              </View>
              <View style={styles.feature}>
                <Check size={16} color={colors.success} />
                <Text variant="bodySmall" color={colors.heading} weight="medium">
                  Store up to {plan.assetLimit} assets
                </Text>
              </View>
              {isCurrent ? (
                <Button title="Current plan" variant="outline" size="sm" disabled onPress={() => undefined} />
              ) : plan.id === "BASIC" ? null : (
                <Button
                  title={hasPaidPlan ? `Switch to ${plan.name}` : `Upgrade to ${plan.name}`}
                  size="sm"
                  loading={
                    (actions.checkout.isPending && actions.checkout.variables === plan.id) ||
                    (actions.switchPlan.isPending && actions.switchPlan.variables === plan.id)
                  }
                  disabled={busy}
                  onPress={() => void choose(plan)}
                />
              )}
            </Card>
          );
        })}
        <Text variant="caption" align="center">
          Payments are processed securely by Stripe.
        </Text>
      </Section>

      <Section title="Payment history">
        <Card padded={false}>
          {payments.items.length ? (
            payments.items.map((payment, index) => {
              const label = paymentStatusLabels[payment.status];
              return (
                <View key={payment.id} style={[styles.payment, index > 0 && styles.divider]}>
                  <View style={styles.flex}>
                    <Text variant="subheading">
                      {payment.plan ? `${planNames[payment.plan]} plan` : "Payment"}
                    </Text>
                    <Text variant="caption">{format.date(payment.createdAt)}</Text>
                  </View>
                  <View style={styles.paymentRight}>
                    <Text variant="subheading">{format.money(payment.amount, payment.currency)}</Text>
                    <Badge label={label.label} tone={label.tone} />
                  </View>
                </View>
              );
            })
          ) : (
            <Text variant="bodySmall" color={colors.muted} style={styles.empty}>
              {payments.isPending ? "Loading payments…" : "No payments yet."}
            </Text>
          )}
          {payments.hasNextPage ? (
            <Button
              title="Load more"
              variant="ghost"
              size="sm"
              loading={payments.isFetchingNextPage}
              onPress={payments.loadMore}
            />
          ) : null}
        </Card>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  rowBetween: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  currentPlan: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  planCard: { gap: spacing.sm },
  feature: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  payment: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  paymentRight: { alignItems: "flex-end", gap: 4 },
  divider: { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
  empty: { padding: spacing.md },
});
