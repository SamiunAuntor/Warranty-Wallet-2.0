import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../lib/theme";
import { useAuth } from "../../providers/auth-provider";

type MoreItem = {
  label: string;
  route: string;
  description: string;
};

const commonItems: MoreItem[] = [
  { label: "Documents", route: "/(app)/documents", description: "Receipts and warranty files" },
  { label: "Notifications", route: "/(app)/notifications", description: "Warranty reminders and alerts" },
  { label: "Billing", route: "/(app)/billing", description: "Plans and payment history" },
  { label: "Scan invoice", route: "/(app)/scan", description: "Extract purchase details from an invoice" },
  { label: "Activity", route: "/(app)/activity", description: "Review account activity" },
  { label: "Profile", route: "/(app)/profile", description: "Manage your account profile" },
  { label: "Preferences", route: "/(app)/preferences", description: "Customize app preferences" },
  { label: "Settings", route: "/(app)/settings", description: "Account and reminder settings" },
];

export default function MoreScreen() {
  const { appUser } = useAuth();
  const items = appUser?.role === "ADMIN"
    ? [
        ...commonItems,
        { label: "Admin dashboard", route: "/(app)/admin", description: "Review platform activity" },
        { label: "Catalog", route: "/(app)/admin-catalog", description: "Manage catalog data" },
        { label: "Operations", route: "/(app)/admin-operations", description: "Manage operational queues" },
      ]
    : commonItems;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>WARRANTY WALLET</Text>
      <Text style={styles.title}>More</Text>
      <Text style={styles.copy}>Everything else you need to manage your warranty wallet.</Text>
      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item.route}
            onPress={() => router.push(item.route as never)}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <View style={styles.itemCopy}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.canvas,
    flexGrow: 1,
    gap: spacing.md,
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
    fontSize: 32,
    fontWeight: "800",
    marginTop: spacing.sm,
  },
  copy: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  list: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  item: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  itemPressed: {
    backgroundColor: colors.brandSoft,
  },
  itemCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  itemLabel: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "700",
  },
  itemDescription: {
    color: colors.muted,
    fontSize: 13,
  },
  arrow: {
    color: colors.brand,
    fontSize: 28,
    lineHeight: 28,
    marginLeft: spacing.sm,
  },
});
