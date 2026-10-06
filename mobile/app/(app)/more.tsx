import { router } from "expo-router";
import {
  Activity,
  BarChart3,
  CreditCard,
  FileDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  SlidersHorizontal,
  Tags,
  UserRound,
  Users,
  Wrench,
} from "lucide-react-native";
import { ScrollView, StyleSheet, View } from "react-native";
import { TabScreen } from "../../components/navigation/TabBar";
import { PlanBadge } from "../../components/ui/Badge";
import { Card, Section } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Display";
import { ListRow } from "../../components/ui/Rows";
import { Text } from "../../components/ui/Text";
import { confirm } from "../../lib/confirm";
import { colors, spacing } from "../../lib/theme";
import { useAuth, useCurrentUser } from "../../providers/auth-provider";

export default function AccountScreen() {
  const user = useCurrentUser();
  const { isAdmin, logout } = useAuth();

  async function signOut() {
    const ok = await confirm({ title: "Sign out?", confirmLabel: "Sign out" });
    if (ok) await logout();
  }

  return (
    <TabScreen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card onPress={() => router.push("/(app)/profile")} style={styles.profile}>
          <Avatar name={user.name} photoUrl={user.photoURL} size={60} />
          <View style={styles.flex}>
            <Text variant="heading" numberOfLines={1}>
              {user.name}
            </Text>
            <Text variant="caption" numberOfLines={1}>
              {user.email}
            </Text>
            <View style={styles.badge}>
              <PlanBadge plan={user.plan} />
            </View>
          </View>
        </Card>

        <Section title="Your wallet">
          <Card padded={false} style={styles.menu}>
            <ListRow icon={FileText} title="Documents" subtitle="Receipts, invoices, and warranty cards" onPress={() => router.push("/(app)/documents")} />
            <ListRow icon={BarChart3} title="Warranty analytics" subtitle="Coverage, value at risk, and expiry timeline" onPress={() => router.push("/(app)/warranty-analytics")} />
            <ListRow icon={Activity} title="Activity" subtitle="Everything that changed in your account" onPress={() => router.push("/(app)/activity")} />
            <ListRow icon={FileDown} title="Reports" subtitle="Export PDF or Excel reports" onPress={() => router.push("/(app)/reports")} />
          </Card>
        </Section>

        <Section title="Account">
          <Card padded={false} style={styles.menu}>
            <ListRow icon={UserRound} title="Profile" subtitle="Name, phone, and photo" onPress={() => router.push("/(app)/profile")} />
            <ListRow icon={CreditCard} title="Plan and billing" subtitle="Upgrade, manage, and view payments" onPress={() => router.push("/(app)/billing")} />
            <ListRow icon={SlidersHorizontal} title="Preferences" subtitle="Reminders, currency, and date format" onPress={() => router.push("/(app)/preferences")} />
            <ListRow icon={Settings} title="Security and app" subtitle="Password reset and app information" onPress={() => router.push("/(app)/settings")} />
          </Card>
        </Section>

        {isAdmin ? (
          <Section title="Administration">
            <Card padded={false} style={styles.menu}>
              <ListRow icon={LayoutDashboard} title="Admin overview" subtitle="Platform statistics and revenue" onPress={() => router.push("/(app)/admin")} />
              <ListRow icon={Users} title="Users" subtitle="Block, unblock, or remove accounts" onPress={() => router.push("/(app)/admin-users")} />
              <ListRow icon={Wrench} title="Operations" subtitle="Assets, claims, and payments" onPress={() => router.push("/(app)/admin-operations")} />
              <ListRow icon={Tags} title="Catalog" subtitle="Categories and brands" onPress={() => router.push("/(app)/admin-catalog")} />
              <ListRow icon={Megaphone} title="Broadcast" subtitle="Send an announcement to every user" onPress={() => router.push("/(app)/admin-broadcast")} />
            </Card>
          </Section>
        ) : null}

        <Card padded={false} style={styles.menu}>
          <ListRow icon={LogOut} title="Sign out" destructive onPress={() => void signOut()} trailing={null} />
        </Card>

        <Text variant="caption" align="center" color={colors.subtle}>
          Warranty Wallet for mobile
        </Text>
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, padding: spacing.md, paddingBottom: spacing.xl },
  profile: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  flex: { flex: 1, gap: 2 },
  badge: { marginTop: spacing.xs },
  menu: { paddingVertical: spacing.xs, paddingHorizontal: spacing.xs },
});
