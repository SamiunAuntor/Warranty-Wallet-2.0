import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { downloadReport } from "../../lib/reports-api";
import { colors, spacing } from "../../lib/theme";
import { useAuth } from "../../providers/auth-provider";

const reports = [
  ["admin/users", "User directory"],
  ["admin/revenue", "Revenue report"],
  ["admin/categories", "Category report"],
  ["products", "Asset report"],
  ["warranty", "Warranty report"],
  ["payments", "Payment report"],
] as const;
export default function ReportsScreen() {
  const { user, appUser } = useAuth();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  async function download(report: string, format: "PDF" | "EXCEL") {
    if (!user) return;
    setBusy(`${report}-${format}`);
    setError("");
    try {
      await downloadReport(await user.getIdToken(), report, format);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not download report.");
    } finally {
      setBusy("");
    }
  }
  if (appUser?.role !== "ADMIN")
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Admin access required.</Text>
      </View>
    );
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>OPERATIONS</Text>
      <Text style={styles.title}>Reports and audit</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {reports.map(([id, name]) => (
        <View key={id} style={styles.card}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.actions}>
            <Pressable
              disabled={Boolean(busy)}
              onPress={() => void download(id, "PDF")}
              style={styles.secondary}
            >
              <Text style={styles.secondaryText}>{busy === `${id}-PDF` ? "..." : "PDF"}</Text>
            </Pressable>
            <Pressable
              disabled={Boolean(busy)}
              onPress={() => void download(id, "EXCEL")}
              style={styles.primary}
            >
              <Text style={styles.primaryText}>{busy === `${id}-EXCEL` ? "..." : "Excel"}</Text>
            </Pressable>
          </View>
        </View>
      ))}
      {busy ? <ActivityIndicator color={colors.brand} /> : null}
    </ScrollView>
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
  error: {
    color: colors.danger,
  },
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  name: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  primary: {
    backgroundColor: colors.brand,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  primaryText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "700",
  },
  secondary: {
    backgroundColor: colors.brandSoft,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  secondaryText: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
  },
});
