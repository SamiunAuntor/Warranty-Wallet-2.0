import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { WarrantyBadge } from "../../components/ui/Badge";
import { Card, Section } from "../../components/ui/Card";
import { BarChart, Legend, ProgressBar, StatTile } from "../../components/ui/Display";
import { Chips } from "../../components/ui/Chips";
import { Screen } from "../../components/ui/Screen";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/ScreenStates";
import { Text } from "../../components/ui/Text";
import { useWarrantyHeatmap } from "../../hooks/use-dashboard";
import { useFormatters } from "../../hooks/use-preferences";
import { describeDaysUntil } from "../../lib/format";
import { warrantyStatusLabels } from "../../lib/labels";
import { colors, spacing, toneColors } from "../../lib/theme";
import type { WarrantyStatus } from "../../lib/types";

const STATUS_COLORS: Record<WarrantyStatus, string> = {
  ACTIVE: toneColors.success.foreground,
  EXPIRING_SOON: "#d48806",
  EXPIRED: toneColors.danger.foreground,
  NO_WARRANTY: colors.borderStrong,
};

export default function WarrantyAnalyticsScreen() {
  const heatmap = useWarrantyHeatmap();
  const format = useFormatters();
  const [month, setMonth] = useState<string | null>(null);

  const months = useMemo(
    () => (heatmap.data?.heatmap ?? []).filter((item) => item.count > 0),
    [heatmap.data],
  );
  const selected = months.find((item) => item.month === month) ?? months[0];

  const header = <ScreenHeader title="Warranty analytics" fallbackHref="/(app)" />;
  if (heatmap.isPending) return <Screen header={header}><LoadingState /></Screen>;
  if (heatmap.isError || !heatmap.data) {
    return (
      <Screen header={header}>
        <ErrorState error={heatmap.error} onRetry={() => void heatmap.refetch()} />
      </Screen>
    );
  }

  const { summary, trend } = heatmap.data;
  const total = Math.max(1, summary.totalProducts);
  const statuses = Object.keys(STATUS_COLORS) as WarrantyStatus[];

  return (
    <Screen header={header} refreshing={heatmap.isRefetching} onRefresh={() => void heatmap.refetch()}>
      <View style={styles.grid}>
        <StatTile label="Health score" value={`${summary.healthScore}/100`} tone="success" />
        <StatTile label="Tracked assets" value={summary.totalProducts} />
        <StatTile label="Total value" value={format.money(summary.totalValue)} />
        <StatTile label="Value at risk" value={format.money(summary.valueAtRisk)} tone="warning" />
      </View>

      <Section title="Coverage">
        <Card>
          <View style={styles.stack}>
            {statuses.map((status) =>
              summary.statusCounts[status] ? (
                <View
                  key={status}
                  style={{ flex: summary.statusCounts[status], backgroundColor: STATUS_COLORS[status] }}
                />
              ) : null,
            )}
          </View>
          {statuses.map((status) => (
            <View key={status} style={styles.coverageRow}>
              <View style={[styles.dot, { backgroundColor: STATUS_COLORS[status] }]} />
              <Text variant="bodySmall" style={styles.flex}>
                {warrantyStatusLabels[status].label}
              </Text>
              <Text variant="subheading">{summary.statusCounts[status]}</Text>
              <Text variant="caption" style={styles.percent}>
                {Math.round((summary.statusCounts[status] / total) * 100)}%
              </Text>
            </View>
          ))}
        </Card>
      </Section>

      <Section title="Warranty trend">
        <Card>
          {trend.length ? (
            <>
              <BarChart
                data={trend.slice(-12).map((point) => ({
                  label: point.monthName.slice(0, 3),
                  segments: [
                    { value: point.ACTIVE, color: STATUS_COLORS.ACTIVE },
                    { value: point.EXPIRING_SOON, color: STATUS_COLORS.EXPIRING_SOON },
                    { value: point.EXPIRED, color: STATUS_COLORS.EXPIRED },
                  ],
                }))}
              />
              <Legend
                items={[
                  { label: "Active", color: STATUS_COLORS.ACTIVE },
                  { label: "Expiring", color: STATUS_COLORS.EXPIRING_SOON },
                  { label: "Expired", color: STATUS_COLORS.EXPIRED },
                ]}
              />
            </>
          ) : (
            <Text variant="bodySmall" color={colors.muted}>
              Add assets with warranties to see the trend.
            </Text>
          )}
        </Card>
      </Section>

      <Section title="Expiry calendar">
        {months.length && selected ? (
          <Card>
            <Chips
              scrollable
              options={months.map((item) => ({ value: item.month, label: item.monthName, count: item.count }))}
              value={selected.month}
              onChange={setMonth}
            />
            <View style={styles.monthSummary}>
              <Text variant="caption">
                {selected.count} {selected.count === 1 ? "warranty ends" : "warranties end"} ·{" "}
                {format.money(selected.value)}
              </Text>
              <ProgressBar
                value={selected.statusBreakdown.EXPIRED / Math.max(1, selected.count)}
                tone="danger"
              />
            </View>
            {selected.products.map((product) => (
              <Pressable
                key={product.id}
                onPress={() => router.push(`/(app)/assets/${product.id}`)}
                style={({ pressed }) => [styles.product, pressed && styles.pressed]}
              >
                <View style={styles.flex}>
                  <Text variant="subheading" numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text variant="caption" numberOfLines={1}>
                    {product.brand} · {format.date(product.expiryDate)} · {describeDaysUntil(product.expiryDate)}
                  </Text>
                </View>
                <WarrantyBadge status={product.warrantyStatus} />
              </Pressable>
            ))}
          </Card>
        ) : (
          <EmptyState
            title="No upcoming expiries"
            message="Warranties with an end date appear on this calendar."
          />
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  stack: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 6,
    flexDirection: "row",
    height: 14,
    marginBottom: spacing.xs,
    overflow: "hidden",
  },
  coverageRow: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  dot: { borderRadius: 5, height: 10, width: 10 },
  percent: { textAlign: "right", width: 40 },
  monthSummary: { gap: spacing.xs },
  product: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  pressed: { opacity: 0.7 },
});
