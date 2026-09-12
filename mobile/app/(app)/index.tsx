import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, spacing } from "../../lib/theme";
import {
  getDashboard,
  getWarrantyHeatmap,
  type DashboardData,
  type WarrantyHeatmapData,
} from "../../lib/dashboard-api";
import { useAuth } from "../../providers/auth-provider";

export default function DashboardScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [heatmap, setHeatmap] = useState<WarrantyHeatmapData | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => {
    if (!user) return;
    setError("");
    try {
      const token = await user.getIdToken();
      const [dashboard, warranty] = await Promise.all([
        getDashboard(token),
        getWarrantyHeatmap(token),
      ]);
      setData(dashboard);
      setHeatmap(warranty);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load dashboard.");
    }
  }, [user]);
  useEffect(() => {
    void load();
  }, [load]);
  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }
  if (!data && !error)
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl onRefresh={refresh} refreshing={refreshing} tintColor={colors.brand} />
      }
    >
      <Text style={styles.eyebrow}>WARRANTY WALLET</Text>
      <Text style={styles.title}>Your warranty home.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {data ? (
        <>
          <Text style={styles.copy}>
            A clear view of the purchases and warranties you are tracking.
          </Text>
          <View style={styles.grid}>
            <Stat label="Total assets" value={data.products.total} />
            <Stat label="Active warranties" value={data.products.active} />
            <Stat label="Expiring soon" value={data.products.expiringSoon} />
            <Stat label="Open claims" value={data.claims.open} />
          </View>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Warranty health</Text>
            <Text style={styles.health}>
              {data.warrantyHealth}
              <Text style={styles.healthSuffix}> / 100</Text>
            </Text>
            <Text style={styles.copy}>
              {data.products.expiringSoon
                ? `${data.products.expiringSoon} warranties need attention soon.`
                : "Your tracked warranties are in good shape."}
            </Text>
            {heatmap ? (
              <View style={styles.healthGrid}>
                <Stat
                  label="At risk"
                  value={
                    heatmap.summary.statusCounts.EXPIRING_SOON +
                    heatmap.summary.statusCounts.EXPIRED
                  }
                />
                <Stat label="No warranty" value={heatmap.summary.statusCounts.NO_WARRANTY} />
              </View>
            ) : null}
          </View>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Upcoming expirations</Text>
            {data.warrantyTimeline.length ? (
              data.warrantyTimeline.slice(0, 5).map((item) => (
                <View key={item.id} style={styles.timeline}>
                  <View style={styles.timelineCopy}>
                    <Text style={styles.assetName}>{item.name}</Text>
                    <Text style={styles.muted}>
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.badge}>
                    {Math.max(
                      0,
                      Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / 86400000),
                    )}{" "}
                    days
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.muted}>No upcoming warranty expirations.</Text>
            )}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    backgroundColor: colors.canvas,
    gap: spacing.md,
  },
  center: { alignItems: "center", flex: 1, justifyContent: "center" },
  eyebrow: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: "800",
    marginTop: spacing.md,
  },
  copy: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  error: { color: colors.danger, marginTop: spacing.md },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  healthGrid: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  stat: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: "47%",
    padding: spacing.md,
  },
  muted: { color: colors.muted, fontSize: 13 },
  statValue: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "800",
    marginTop: spacing.sm,
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  panelTitle: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  health: {
    color: colors.brand,
    fontSize: 42,
    fontWeight: "800",
    marginTop: spacing.md,
  },
  healthSuffix: { color: colors.muted, fontSize: 16, fontWeight: "500" },
  timeline: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingVertical: spacing.md,
  },
  timelineCopy: { flex: 1 },
  assetName: { color: colors.ink, fontSize: 15, fontWeight: "600" },
  badge: {
    backgroundColor: colors.brandSoft,
    borderRadius: 20,
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
