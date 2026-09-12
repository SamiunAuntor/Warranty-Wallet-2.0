import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useAdminOperations } from "../../hooks/use-admin-operations";
import { colors, spacing } from "../../lib/theme";
const claimStatuses = ["SUBMITTED", "IN_PROGRESS", "RESOLVED", "REJECTED", "CANCELLED"];
export default function AdminOperationsScreen() {
  const { appUser, assets, changeClaimStatus, claims, error, loading, payments } =
    useAdminOperations();
  if (appUser?.role !== "ADMIN")
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Admin access required.</Text>
      </View>
    );
  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={[
        {
          title: "Customer assets",
          count: assets.length,
          body: assets.map((item) => `${item.name} · ${item.user.email}`),
        },
        {
          title: "Payments",
          count: payments.length,
          body: payments.map(
            (item) => `${item.plan ?? "Plan"} · ${item.amount} ${item.currency} · ${item.status}`,
          ),
        },
      ]}
      keyExtractor={(item) => item.title}
      ListHeaderComponent={
        <>
          <Text style={styles.eyebrow}>ADMIN OPERATIONS</Text>
          <Text style={styles.title}>Assets, claims, payments</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.card}>
            <Text style={styles.section}>Claims</Text>
            {claims.map((claim) => (
              <View key={claim.id} style={styles.claim}>
                <Text style={styles.name}>
                  {claim.claimNumber} · {claim.title}
                </Text>
                <Text style={styles.muted}>
                  {claim.product.name} · {claim.user.email}
                </Text>
                <View style={styles.statusRow}>
                  {claimStatuses.map((status) => (
                    <Pressable
                      key={status}
                      onPress={() => void changeClaimStatus(claim, status)}
                      style={[styles.status, claim.status === status && styles.selected]}
                    >
                      <Text
                        style={claim.status === status ? styles.selectedText : styles.statusText}
                      >
                        {status.replaceAll("_", " ")}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.section}>
            {item.title} ({item.count})
          </Text>
          {item.body.slice(0, 50).map((line, index) => (
            <Text key={`${line}-${index}`} style={styles.muted}>
              {line}
            </Text>
          ))}
        </View>
      )}
    />
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
    fontSize: 28,
    fontWeight: "800",
  },
  error: {
    color: colors.danger,
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
  },
  claim: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  name: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  muted: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  status: {
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  selected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  statusText: {
    color: colors.muted,
    fontSize: 9,
  },
  selectedText: {
    color: colors.surface,
    fontSize: 9,
    fontWeight: "700",
  },
});
