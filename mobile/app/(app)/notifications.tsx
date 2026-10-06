import { router } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import { Bell, BellOff, CheckCheck, CreditCard, Megaphone, ShieldAlert, Trash2 } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { TabScreen } from "../../components/navigation/TabBar";
import { Button } from "../../components/ui/Button";
import { PagedList } from "../../components/ui/PagedList";
import { EmptyState } from "../../components/ui/ScreenStates";
import { PageTitle } from "../../components/ui/ScreenHeader";
import { Text } from "../../components/ui/Text";
import { useNotificationActions, useNotificationList, useUnreadCount } from "../../hooks/use-notifications";
import { relativeTime } from "../../lib/format";
import { colors, radius, spacing } from "../../lib/theme";
import type { Notification } from "../../lib/types";
import { useToast } from "../../providers/toast-provider";

const ICONS: Record<string, LucideIcon> = {
  REMINDER: ShieldAlert,
  PAYMENT: CreditCard,
  SUBSCRIPTION: CreditCard,
  SYSTEM: Megaphone,
};

export default function NotificationsScreen() {
  const toast = useToast();
  const list = useNotificationList();
  const { data: unread = 0 } = useUnreadCount();
  const actions = useNotificationActions();

  function open(notification: Notification) {
    if (!notification.isRead) actions.markRead.mutate(notification.id);
    // Warranty reminders point at the asset that is expiring.
    if (notification.type === "REMINDER" && notification.entityId) {
      router.push(`/(app)/assets/${notification.entityId}`);
    } else if (notification.type === "PAYMENT" || notification.type === "SUBSCRIPTION") {
      router.push("/(app)/billing");
    }
  }

  return (
    <TabScreen>
      <PagedList
        query={list}
        keyExtractor={(item) => item.id}
        renderItem={(item) => {
          const Icon = ICONS[item.type] ?? Bell;
          return (
            <Pressable
              accessibilityRole="button"
              onPress={() => open(item)}
              style={({ pressed }) => [
                styles.item,
                !item.isRead && styles.unread,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.icon, item.type === "REMINDER" && styles.iconWarning]}>
                <Icon size={18} color={item.type === "REMINDER" ? colors.warning : colors.primary} />
              </View>
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text variant="subheading" numberOfLines={1} style={styles.flex}>
                    {item.title}
                  </Text>
                  {!item.isRead ? <View style={styles.dot} /> : null}
                </View>
                <Text variant="bodySmall">{item.message}</Text>
                <Text variant="caption">{relativeTime(item.createdAt)}</Text>
              </View>
              <Pressable
                accessibilityLabel="Delete notification"
                hitSlop={10}
                onPress={() =>
                  actions.remove.mutate(item.id, {
                    onError: (error) => toast.error(error, "Could not delete the notification."),
                  })
                }
              >
                <Trash2 size={18} color={colors.subtle} />
              </Pressable>
            </Pressable>
          );
        }}
        header={
          <PageTitle
            overline="Inbox"
            title="Alerts"
            subtitle={unread ? `${unread} unread` : "You're all caught up"}
            actions={
              unread ? (
                <Button
                  title="Mark all read"
                  icon={CheckCheck}
                  size="sm"
                  variant="secondary"
                  loading={actions.markAllRead.isPending}
                  onPress={() =>
                    actions.markAllRead.mutate(undefined, {
                      onError: (error) => toast.error(error, "Could not update notifications."),
                    })
                  }
                />
              ) : null
            }
          />
        }
        empty={
          <EmptyState
            icon={BellOff}
            title="No notifications"
            message="Warranty reminders, payment updates, and announcements appear here."
          />
        }
      />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  item: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  unread: { backgroundColor: colors.primaryTint, borderColor: colors.primaryBorder },
  pressed: { opacity: 0.85 },
  icon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  iconWarning: { backgroundColor: colors.warningSoft },
  body: { flex: 1, gap: 3 },
  titleRow: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
  dot: { backgroundColor: colors.primary, borderRadius: 4, height: 8, width: 8 },
});
