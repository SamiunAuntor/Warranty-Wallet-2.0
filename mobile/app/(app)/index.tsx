import { router } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import {
  Activity as ActivityIcon,
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  FilePlus2,
  Package,
  PackagePlus,
  ScanLine,
  ShieldCheck,
  ShieldPlus,
} from "lucide-react-native";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { TabScreen } from "../../components/navigation/TabBar";
import { PlanBadge, WarrantyBadge } from "../../components/ui/Badge";
import { Card, Section } from "../../components/ui/Card";
import { Avatar, ProgressBar, StatTile } from "../../components/ui/Display";
import { IconButton } from "../../components/ui/IconButton";
import { ErrorState, LoadingState } from "../../components/ui/ScreenStates";
import { Text } from "../../components/ui/Text";
import { useDashboard, useWarrantyHeatmap } from "../../hooks/use-dashboard";
import { useUnreadCount } from "../../hooks/use-notifications";
import { useFormatters } from "../../hooks/use-preferences";
import { describeDaysUntil, relativeTime } from "../../lib/format";
import { documentTypeLabels } from "../../lib/labels";
import { colors, radius, spacing } from "../../lib/theme";
import type { DocumentType } from "../../lib/types";
import { useCurrentUser } from "../../providers/auth-provider";

export default function HomeScreen() {
  const user = useCurrentUser();
  const dashboard = useDashboard();
  const heatmap = useWarrantyHeatmap();
  const { data: unread = 0 } = useUnreadCount();
  const format = useFormatters();
  const data = dashboard.data;
  const firstName = user.name.split(" ")[0];

  function refresh() {
    void dashboard.refetch();
    void heatmap.refetch();
  }

  return (
    <TabScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={dashboard.isRefetching}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <Pressable accessibilityLabel="Account" onPress={() => router.replace("/(app)/more")}>
            <Avatar name={user.name} photoUrl={user.photoURL} size={44} />
          </Pressable>
          <View style={styles.greeting}>
            <Text variant="caption">Welcome back</Text>
            <Text variant="heading" numberOfLines={1}>
              {firstName}
            </Text>
          </View>
          <IconButton
            icon={Bell}
            label="Notifications"
            badge={unread}
            onPress={() => router.replace("/(app)/notifications")}
          />
        </View>

        <View style={styles.actions}>
          <QuickAction icon={PackagePlus} label="Add asset" onPress={() => router.push("/(app)/assets/form")} />
          <QuickAction icon={ScanLine} label="Scan invoice" onPress={() => router.push("/(app)/assets/form?scan=1")} />
          <QuickAction icon={ShieldPlus} label="New claim" onPress={() => router.push("/(app)/claims/form")} />
          <QuickAction icon={FilePlus2} label="Upload" onPress={() => router.push("/(app)/documents?upload=1")} />
        </View>

        {dashboard.isPending ? (
          <LoadingState />
        ) : dashboard.isError || !data ? (
          <ErrorState error={dashboard.error} onRetry={refresh} />
        ) : (
          <>
            <View style={styles.grid}>
              <StatTile
                icon={Package}
                label="Total assets"
                value={data.products.total}
                onPress={() => router.replace("/(app)/assets")}
              />
              <StatTile
                icon={CheckCircle2}
                tone="success"
                label="Active warranties"
                value={data.products.active}
                onPress={() => router.replace("/(app)/assets?status=ACTIVE")}
              />
              <StatTile
                icon={AlertTriangle}
                tone="warning"
                label="Expiring soon"
                value={data.products.expiringSoon}
                onPress={() => router.replace("/(app)/assets?status=EXPIRING_SOON")}
              />
              <StatTile
                icon={ShieldCheck}
                tone="primary"
                label="Open claims"
                value={data.claims.open}
                onPress={() => router.replace("/(app)/claims")}
              />
            </View>

            <Card onPress={() => router.push("/(app)/warranty-analytics")}>
              <View style={styles.healthHeader}>
                <View style={styles.flex}>
                  <Text variant="overline">Warranty health</Text>
                  <Text variant="display">
                    {data.warrantyHealth}
                    <Text variant="heading" color={colors.muted}>
                      {" "}
                      / 100
                    </Text>
                  </Text>
                </View>
                <PlanBadge plan={user.plan} />
              </View>
              <ProgressBar
                value={data.warrantyHealth / 100}
                tone={data.warrantyHealth >= 75 ? "success" : data.warrantyHealth >= 45 ? "warning" : "danger"}
              />
              <View style={styles.healthFacts}>
                <Fact label="Purchase value" value={format.money(data.purchaseValue)} />
                <Fact
                  label="Value at risk"
                  value={heatmap.data ? format.money(heatmap.data.summary.valueAtRisk) : "—"}
                />
                <Fact label="Expired" value={String(data.products.expired)} />
              </View>
              <View style={styles.link}>
                <Text variant="label" color={colors.primary}>
                  View warranty analytics
                </Text>
                <ChevronRight size={16} color={colors.primary} />
              </View>
            </Card>

            <Section
              title="Upcoming expirations"
              action={<SeeAll onPress={() => router.replace("/(app)/assets?status=EXPIRING_SOON")} />}
            >
              <Card padded={false}>
                {data.warrantyTimeline.length ? (
                  data.warrantyTimeline.slice(0, 5).map((item, index) => (
                    <Pressable
                      key={item.id}
                      onPress={() => router.push(`/(app)/assets/${item.id}`)}
                      style={({ pressed }) => [
                        styles.listRow,
                        index > 0 && styles.listDivider,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.flex}>
                        <Text variant="subheading" numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text variant="caption">
                          {format.date(item.expiryDate)} · {describeDaysUntil(item.expiryDate)}
                        </Text>
                      </View>
                      <WarrantyBadge status={item.warrantyStatus} />
                    </Pressable>
                  ))
                ) : (
                  <Text variant="bodySmall" color={colors.muted} style={styles.emptyRow}>
                    No warranties are expiring soon.
                  </Text>
                )}
              </Card>
            </Section>

            {data.documents.recent.length ? (
              <Section
                title="Recent documents"
                action={<SeeAll onPress={() => router.push("/(app)/documents")} />}
              >
                <Card padded={false}>
                  {data.documents.recent.slice(0, 3).map((document, index) => (
                    <Pressable
                      key={document.id}
                      onPress={() => router.push(`/(app)/assets/${document.product.id}`)}
                      style={({ pressed }) => [
                        styles.listRow,
                        index > 0 && styles.listDivider,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.flex}>
                        <Text variant="subheading" numberOfLines={1}>
                          {document.fileName}
                        </Text>
                        <Text variant="caption" numberOfLines={1}>
                          {documentTypeLabels[document.fileType as DocumentType] ?? document.fileType} ·{" "}
                          {document.product.name}
                        </Text>
                      </View>
                      <Text variant="caption">{relativeTime(document.createdAt)}</Text>
                    </Pressable>
                  ))}
                </Card>
              </Section>
            ) : null}

            {data.recentActivities?.length ? (
              <Section
                title="Recent activity"
                action={<SeeAll onPress={() => router.push("/(app)/activity")} />}
              >
                <Card padded={false}>
                  {data.recentActivities.slice(0, 4).map((activity, index) => (
                    <View key={activity.id} style={[styles.listRow, index > 0 && styles.listDivider]}>
                      <View style={styles.activityIcon}>
                        <ActivityIcon size={16} color={colors.primary} />
                      </View>
                      <View style={styles.flex}>
                        <Text variant="bodySmall" color={colors.heading} weight="medium" numberOfLines={1}>
                          {activity.title}
                        </Text>
                        {activity.description ? (
                          <Text variant="caption" numberOfLines={1}>
                            {activity.description}
                          </Text>
                        ) : null}
                      </View>
                      <Text variant="caption">{relativeTime(activity.createdAt)}</Text>
                    </View>
                  ))}
                </Card>
              </Section>
            ) : null}
          </>
        )}
      </ScrollView>
    </TabScreen>
  );
}

function QuickAction({ icon: Icon, label, onPress }: { icon: LucideIcon; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}
    >
      <View style={styles.actionIcon}>
        <Icon size={22} color={colors.primary} />
      </View>
      <Text variant="caption" weight="medium" color={colors.heading} align="center" numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text variant="caption">{label}</Text>
      <Text variant="subheading" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function SeeAll({ onPress }: { onPress: () => void }) {
  return (
    <Pressable hitSlop={8} onPress={onPress}>
      <Text variant="label" color={colors.primary}>
        See all
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, padding: spacing.md, paddingBottom: spacing.xl },
  header: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  greeting: { flex: 1 },
  actions: { flexDirection: "row", gap: spacing.sm },
  action: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    paddingHorizontal: 4,
    paddingVertical: spacing.sm + 2,
  },
  actionIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  healthHeader: { alignItems: "flex-start", flexDirection: "row", gap: spacing.sm },
  healthFacts: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  fact: { flex: 1, gap: 2 },
  link: { alignItems: "center", flexDirection: "row", gap: 2, marginTop: spacing.xs },
  flex: { flex: 1, gap: 2 },
  listRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  listDivider: { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
  pressed: { backgroundColor: colors.surfaceMuted },
  emptyRow: { padding: spacing.md },
  activityIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
});
