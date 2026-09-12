import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { AdminUser } from "../../lib/admin-api";
import { useAdminDashboard } from "../../hooks/use-admin-dashboard";
import { colors, spacing } from "../../lib/theme";

export default function AdminScreen() {
  const { appUser, busy, error, loading, sendBroadcast, stats, toggleUser, users } =
    useAdminDashboard();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  async function send() {
    await sendBroadcast(title, message);
    if (!error) {
      setTitle("");
      setMessage("");
    }
  }
  if (appUser?.role !== "ADMIN")
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Admin access required.</Text>
        <Text style={styles.muted}>This area is limited to administrator accounts.</Text>
      </View>
    );
  if (loading || !stats)
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>OPERATIONS</Text>
      <Text style={styles.title}>Admin dashboard</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.grid}>
        <Stat label="Users" value={stats.totalUsers} />
        <Stat label="Assets" value={stats.totalProducts} />
        <Stat label="Paid users" value={stats.paidUsers} />
        <Stat label="Revenue" value={String(stats.totalRevenue)} />
      </View>
      <View style={styles.card}>
        <Text style={styles.section}>Broadcast notification</Text>
        <TextInput
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={title}
        />
        <TextInput
          multiline
          onChangeText={setMessage}
          placeholder="Message"
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.multiline]}
          value={message}
        />
        <Pressable disabled={busy} onPress={() => void send()} style={styles.save}>
          <Text style={styles.saveText}>{busy ? "Sending..." : "Send to users"}</Text>
        </Pressable>
      </View>
      <Text style={styles.section}>User management</Text>
      {users.map((item) => (
        <View key={item.id} style={styles.user}>
          <View style={styles.userCopy}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.muted}>
              {item.email} · {item.plan}
            </Text>
          </View>
          <Pressable onPress={() => void toggleUser(item)}>
            <Text style={item.status === "BLOCKED" ? styles.unblock : styles.block}>
              {item.status === "BLOCKED" ? "Unblock" : "Block"}
            </Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.canvas,
    gap: spacing.md,
    padding: spacing.lg,
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "800",
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.danger,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  stat: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: "47%",
    padding: spacing.md,
  },
  value: {
    color: colors.ink,
    fontSize: 23,
    fontWeight: "800",
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
  },
  section: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  input: {
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.ink,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  save: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 10,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  saveText: {
    color: colors.surface,
    fontWeight: "700",
  },
  user: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    padding: spacing.md,
  },
  userCopy: {
    flex: 1,
  },
  userName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  block: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "700",
  },
  unblock: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
  },
});
