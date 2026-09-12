import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useActivity } from "../../hooks/use-activity";
import { colors, spacing } from "../../lib/theme";
export default function ActivityScreen() {
  const { error, items, loading } = useActivity();
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>HISTORY</Text>
      <Text style={styles.title}>Activity</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator color={colors.brand} />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={items}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.muted}>No activity recorded yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.muted}>
                {item.description ?? `${item.type} · ${item.entity}`}
              </Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.canvas,
    flex: 1,
    padding: spacing.lg,
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
    marginTop: spacing.xs,
  },
  list: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
  },
  itemTitle: {
    color: colors.ink,
    fontWeight: "700",
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  date: {
    color: colors.muted,
    fontSize: 11,
    marginTop: spacing.sm,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.md,
  },
});
