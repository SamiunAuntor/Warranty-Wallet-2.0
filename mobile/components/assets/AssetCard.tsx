import { Image } from "expo-image";
import { Archive, Package } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useFormatters } from "../../hooks/use-preferences";
import { describeDaysUntil } from "../../lib/format";
import { colors, radius, spacing } from "../../lib/theme";
import type { Asset } from "../../lib/types";
import { WarrantyBadge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";

/** The product photo, if the asset has one, used on cards and the detail header. */
export function assetImageUrl(asset: Asset) {
  return (
    asset.productImageUrl ||
    asset.documents?.find((document) => document.fileType === "PRODUCT_IMAGE")?.fileUrl ||
    null
  );
}

export function AssetThumbnail({ asset, size = 56 }: { asset: Asset; size?: number }) {
  const uri = assetImageUrl(asset);
  const style = { width: size, height: size, borderRadius: radius.md };
  if (uri) return <Image source={{ uri }} style={[styles.thumb, style]} contentFit="cover" />;
  return (
    <View style={[styles.thumb, styles.placeholder, style]}>
      <Package size={size * 0.42} color={colors.primary} />
    </View>
  );
}

export function AssetCard({ asset, onPress }: { asset: Asset; onPress: () => void }) {
  const format = useFormatters();
  const archived = asset.lifecycleStatus === "ARCHIVED";
  const expiry =
    asset.hasWarranty && asset.expiryDate
      ? `${asset.warrantyStatus === "EXPIRED" ? "Expired" : "Expires"} ${format.date(asset.expiryDate)} · ${describeDaysUntil(asset.expiryDate)}`
      : "No warranty recorded";

  return (
    <Card onPress={onPress} accessibilityLabel={`${asset.name}, ${asset.brand}`} style={styles.card}>
      <View style={styles.row}>
        <AssetThumbnail asset={asset} />
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text variant="subheading" numberOfLines={1} style={styles.title}>
              {asset.name}
            </Text>
            <Text variant="subheading" color={colors.heading}>
              {format.money(asset.purchasePrice)}
            </Text>
          </View>
          <Text variant="caption" numberOfLines={1}>
            {[asset.brand, asset.model, asset.category?.name].filter(Boolean).join(" · ")}
          </Text>
          <View style={styles.meta}>
            <WarrantyBadge status={asset.warrantyStatus} />
            {archived ? (
              <View style={styles.archived}>
                <Archive size={12} color={colors.neutral} />
                <Text variant="caption" color={colors.neutral}>
                  Archived
                </Text>
              </View>
            ) : null}
          </View>
          <Text variant="caption" numberOfLines={1}>
            {expiry}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.sm + 2 },
  row: { flexDirection: "row", gap: spacing.md },
  thumb: { backgroundColor: colors.surfaceMuted },
  placeholder: { alignItems: "center", backgroundColor: colors.primaryTint, justifyContent: "center" },
  body: { flex: 1, gap: 4 },
  titleRow: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  title: { flex: 1 },
  meta: { alignItems: "center", flexDirection: "row", gap: spacing.sm, marginVertical: 2 },
  archived: { alignItems: "center", flexDirection: "row", gap: 4 },
});
