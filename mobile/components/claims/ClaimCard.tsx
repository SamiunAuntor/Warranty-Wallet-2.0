import { Paperclip } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useFormatters } from "../../hooks/use-preferences";
import { colors, spacing } from "../../lib/theme";
import type { Claim } from "../../lib/types";
import { ClaimBadge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";

export function ClaimCard({
  claim,
  onPress,
  showOwner = false,
}: {
  claim: Claim;
  onPress: () => void;
  showOwner?: boolean;
}) {
  const format = useFormatters();
  const evidenceCount = claim._count?.documents ?? claim.documents?.length ?? 0;
  return (
    <Card onPress={onPress} accessibilityLabel={`Claim ${claim.title}`}>
      <View style={styles.header}>
        <Text variant="caption" weight="semibold" color={colors.primary}>
          #{claim.claimNumber}
        </Text>
        <ClaimBadge status={claim.status} />
      </View>
      <Text variant="subheading" numberOfLines={2}>
        {claim.title}
      </Text>
      <Text variant="bodySmall" color={colors.muted} numberOfLines={1}>
        {claim.product.name} · {claim.product.brand}
      </Text>
      {showOwner && claim.user ? (
        <Text variant="caption" numberOfLines={1}>
          {claim.user.name} · {claim.user.email}
        </Text>
      ) : null}
      <View style={styles.footer}>
        <Text variant="caption">Updated {format.date(claim.updatedAt)}</Text>
        {evidenceCount ? (
          <View style={styles.evidence}>
            <Paperclip size={12} color={colors.muted} />
            <Text variant="caption">{evidenceCount}</Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xxs,
  },
  evidence: { alignItems: "center", flexDirection: "row", gap: 4 },
});
