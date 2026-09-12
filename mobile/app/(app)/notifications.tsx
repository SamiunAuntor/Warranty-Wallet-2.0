import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useNotifications } from "../../hooks/use-notifications";
import { colors, spacing } from "../../lib/theme";

export default function NotificationsScreen() {
  const { error, items, loading, markAllRead, markRead } = useNotifications();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>UPDATES</Text>
          <Text style={styles.title}>Notifications</Text>
        </View>
        <Pressable onPress={() => void markAllRead()}>
          <Text style={styles.markAll}>Mark all read</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator color={colors.brand} style={styles.loader} />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={items}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.empty}>You are all caught up.</Text>}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => void markRead(item)}
              style={[styles.card, !item.isRead && styles.unread]}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
            </Pressable>
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
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
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
  markAll: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
  },
  unread: {
    borderColor: colors.brand,
    borderWidth: 2,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  message: {
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
  empty: {
    color: colors.muted,
    padding: spacing.xl,
    textAlign: "center",
  },
  error: {
    color: colors.danger,
    marginTop: spacing.md,
  },
  loader: {
    marginTop: spacing.xl,
  },
});
