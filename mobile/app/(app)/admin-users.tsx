import { Ban, ShieldCheck, Trash2, Users } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AdminGate } from "../../components/AdminGate";
import { Badge, PlanBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Chips } from "../../components/ui/Chips";
import { Avatar, SearchBar } from "../../components/ui/Display";
import { PagedList } from "../../components/ui/PagedList";
import { EmptyState } from "../../components/ui/ScreenStates";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { Text } from "../../components/ui/Text";
import { useAdminActions, useAdminUsers } from "../../hooks/use-admin-operations";
import { useDebouncedValue } from "../../hooks/use-debounced-value";
import { confirm } from "../../lib/confirm";
import { formatDate } from "../../lib/format";
import { userStatusLabels } from "../../lib/labels";
import { colors, spacing } from "../../lib/theme";
import type { UserStatus } from "../../lib/types";
import type { AdminUser } from "../../lib/admin-api";
import { useCurrentUser } from "../../providers/auth-provider";
import { useToast } from "../../providers/toast-provider";

type Filter = "ALL" | UserStatus;
const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "BLOCKED", label: "Blocked" },
];

export default function AdminUsersScreen() {
  return (
    <AdminGate>
      <UsersList />
    </AdminGate>
  );
}

function UsersList() {
  const me = useCurrentUser();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const debounced = useDebouncedValue(search.trim());
  const users = useAdminUsers(debounced, filter === "ALL" ? undefined : filter);
  const actions = useAdminActions();

  async function toggleBlock(user: AdminUser) {
    const blocking = user.status !== "BLOCKED";
    const ok = await confirm({
      title: blocking ? `Block ${user.name}?` : `Unblock ${user.name}?`,
      message: blocking
        ? "They will be signed out and can't sign in until unblocked."
        : "They will be able to sign in again.",
      confirmLabel: blocking ? "Block" : "Unblock",
      destructive: blocking,
    });
    if (!ok) return;
    actions.setBlocked.mutate(
      { id: user.id, blocked: blocking },
      {
        onSuccess: () => toast.success(blocking ? "User blocked." : "User unblocked."),
        onError: (error) => toast.error(error, "Could not update the user."),
      },
    );
  }

  async function remove(user: AdminUser) {
    const ok = await confirm({
      title: `Delete ${user.name}?`,
      message: "Their account and data are removed. This cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    actions.deleteUser.mutate(user.id, {
      onSuccess: () => toast.success("User deleted."),
      onError: (error) => toast.error(error, "Could not delete the user."),
    });
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <ScreenHeader
        title="Users"
        subtitle={users.isPending ? undefined : `${users.total} accounts`}
        fallbackHref="/(app)/admin"
      />
      <PagedList
        query={users}
        keyExtractor={(user) => user.id}
        header={
          <View style={styles.header}>
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name or email" />
            <Chips options={FILTERS} value={filter} onChange={setFilter} />
          </View>
        }
        renderItem={(user) => {
          const status = userStatusLabels[user.status];
          const self = user.id === me.id;
          const admin = user.role === "ADMIN";
          return (
            <Card>
              <View style={styles.row}>
                <Avatar name={user.name} photoUrl={user.photoURL} size={44} />
                <View style={styles.flex}>
                  <Text variant="subheading" numberOfLines={1}>
                    {user.name}
                    {admin ? <Text variant="caption" color={colors.primary}>  Admin</Text> : null}
                  </Text>
                  <Text variant="caption" numberOfLines={1}>
                    {user.email}
                  </Text>
                </View>
              </View>
              <View style={styles.badges}>
                <Badge label={status.label} tone={status.tone} />
                <PlanBadge plan={user.plan} />
                <Text variant="caption">Joined {formatDate(user.createdAt)}</Text>
              </View>
              {!self && !admin ? (
                <View style={styles.actions}>
                  <Button
                    title={user.status === "BLOCKED" ? "Unblock" : "Block"}
                    icon={user.status === "BLOCKED" ? ShieldCheck : Ban}
                    size="sm"
                    variant={user.status === "BLOCKED" ? "secondary" : "outline"}
                    style={styles.flex}
                    onPress={() => void toggleBlock(user)}
                  />
                  <Button
                    title="Delete"
                    icon={Trash2}
                    size="sm"
                    variant="dangerOutline"
                    style={styles.flex}
                    onPress={() => void remove(user)}
                  />
                </View>
              ) : null}
            </Card>
          );
        }}
        empty={<EmptyState icon={Users} title="No users found" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.canvas, flex: 1 },
  header: { gap: spacing.md },
  row: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  badges: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
});
