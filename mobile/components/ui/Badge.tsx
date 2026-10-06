import { StyleSheet, View } from "react-native";
import { claimStatusLabels, warrantyStatusLabels } from "../../lib/labels";
import { planColors, radius, toneColors, type Tone } from "../../lib/theme";
import type { ClaimStatus, Plan, WarrantyStatus } from "../../lib/types";
import { planNames } from "../../lib/labels";
import { Text } from "./Text";

export function Badge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  const palette = toneColors[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      <View style={[styles.dot, { backgroundColor: palette.foreground }]} />
      <Text variant="caption" weight="semibold" color={palette.foreground} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function WarrantyBadge({ status }: { status: WarrantyStatus }) {
  const { label, tone } = warrantyStatusLabels[status];
  return <Badge label={label} tone={tone} />;
}

export function ClaimBadge({ status }: { status: ClaimStatus }) {
  const { label, tone } = claimStatusLabels[status];
  return <Badge label={label} tone={tone} />;
}

export function PlanBadge({ plan }: { plan: Plan }) {
  const palette = planColors[plan];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: palette.background, borderColor: palette.border, borderWidth: 1 },
      ]}
    >
      <Text variant="caption" weight="semibold" color={palette.foreground}>
        {planNames[plan]} plan
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dot: { borderRadius: 3, height: 6, width: 6 },
});
