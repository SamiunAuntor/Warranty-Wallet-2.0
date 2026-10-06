import { router } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileDown,
  Megaphone,
  Package,
  Tags,
  UserCheck,
  UserX,
  Users,
  Wallet,
  Wrench,
} from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AdminGate } from "../../components/AdminGate";
import { Card, Section } from "../../components/ui/Card";
import { BarChart, StatTile } from "../../components/ui/Display";
import { IconButton } from "../../components/ui/IconButton";
import { ListRow } from "../../components/ui/Rows";
import { Screen } from "../../components/ui/Screen";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { ErrorState, LoadingState } from "../../components/ui/ScreenStates";
import { Text } from "../../components/ui/Text";
import { useAdminOverview } from "../../hooks/use-admin-dashboard";
import { formatMoney, formatNumber } from "../../lib/format";
import { colors, spacing } from "../../lib/theme";

export default function AdminScreen() {
  return (
    <AdminGate>
      <AdminOverview />
    </AdminGate>
  );
}

function AdminOverview() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { stats, revenue, growth, revenueByMonth, growthByMonth } = useAdminOverview(year);
  const header = <ScreenHeader title="Admin overview" fallbackHref="/(app)/more" />;

  if (stats.isPending) return <Screen header={header}><LoadingState /></Screen>;
  if (stats.isError || !stats.data) {
    return (
      <Screen header={header}>
        <ErrorState error={stats.error} onRetry={() => void stats.refetch()} />
      </Screen>
    );
  }

  const data = stats.data;
  const yearRevenue = revenueByMonth.reduce((sum, item) => sum + item.value, 0);
  const yearAssets = growthByMonth.reduce((sum, item) => sum + item.value, 0);

  return (
    <Screen
      header={header}
      refreshing={stats.isRefetching}
      onRefresh={() => {
        void stats.refetch();
        void revenue.refetch();
        void growth.refetch();
      }}
    >
      <View style={styles.grid}>
        <StatTile icon={Users} label="Users" value={formatNumber(data.totalUsers)} />
        <StatTile icon={UserCheck} tone="success" label="Active users" value={formatNumber(data.activeUsers)} />
        <StatTile icon={UserX} tone="danger" label="Blocked users" value={formatNumber(data.blockedUsers)} />
        <StatTile icon={Wallet} tone="warning" label="Paid users" value={formatNumber(data.paidUsers)} />
        <StatTile icon={Package} label="Assets" value={formatNumber(data.totalProducts)} />
        <StatTile icon={CreditCard} tone="success" label="Revenue" value={formatMoney(data.totalRevenue)} />
      </View>

      <View style={styles.yearRow}>
        <IconButton icon={ChevronLeft} label="Previous year" size={36} onPress={() => setYear(year - 1)} />
        <Text variant="subheading">{year}</Text>
        <IconButton
          icon={ChevronRight}
          label="Next year"
          size={36}
          disabled={year >= currentYear}
          onPress={() => setYear(year + 1)}
        />
      </View>

      <Section title="Revenue by month">
        <Card>
          <Text variant="heading">{formatMoney(yearRevenue)}</Text>
          <BarChart
            data={revenueByMonth.map((item) => ({
              label: item.label,
              segments: [{ value: item.value, color: colors.primary }],
            }))}
          />
        </Card>
      </Section>

      <Section title="New assets by month">
        <Card>
          <Text variant="heading">{formatNumber(yearAssets)} assets</Text>
          <BarChart
            data={growthByMonth.map((item) => ({
              label: item.label,
              segments: [{ value: item.value, color: colors.primaryBright }],
            }))}
          />
        </Card>
      </Section>

      <Section title="Manage">
        <Card padded={false} style={styles.menu}>
          <ListRow icon={Users} title="Users" subtitle="Search, block, or remove accounts" onPress={() => router.push("/(app)/admin-users")} />
          <ListRow icon={Wrench} title="Operations" subtitle="Assets, claims, and payments" onPress={() => router.push("/(app)/admin-operations")} />
          <ListRow icon={Tags} title="Catalog" subtitle={`${data.totalCategories} categories and brands`} onPress={() => router.push("/(app)/admin-catalog")} />
          <ListRow icon={Megaphone} title="Broadcast" subtitle="Notify every user" onPress={() => router.push("/(app)/admin-broadcast")} />
          <ListRow icon={FileDown} title="Reports" subtitle="Users, revenue, and categories" onPress={() => router.push("/(app)/reports")} />
        </Card>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  yearRow: { alignItems: "center", flexDirection: "row", gap: spacing.md, justifyContent: "center" },
  menu: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs },
});
