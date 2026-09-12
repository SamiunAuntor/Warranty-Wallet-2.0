import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Asset } from "../../lib/assets-api";
import { colors, spacing } from "../../lib/theme";

type AssetCardProps = {
  asset: Asset;
  onPress: () => void;
};

export function AssetCard({ asset, onPress }: AssetCardProps) {
  const isExpired = asset.warrantyStatus === "EXPIRED";

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.assetName}>{asset.name}</Text>
        <Text style={styles.muted}>
          {asset.brand}
          {asset.model ? ` - ${asset.model}` : ""}
        </Text>
        <Text style={styles.muted}>
          Purchased {new Date(asset.purchaseDate).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.cardSide}>
        <Text style={[styles.status, isExpired ? styles.expired : styles.active]}>
          {asset.warrantyStatus.replaceAll("_", " ")}
        </Text>
        <Text style={styles.view}>View</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    padding: spacing.md,
  },
  cardBody: {
    flex: 1,
    gap: spacing.xs,
  },
  cardSide: {
    alignItems: "flex-end",
    gap: spacing.md,
  },
  assetName: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "700",
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
  },
  status: {
    borderRadius: 12,
    fontSize: 10,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  active: {
    backgroundColor: colors.brandSoft,
    color: colors.brand,
  },
  expired: {
    backgroundColor: "#fbe4e4",
    color: colors.danger,
  },
  view: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
  },
});
