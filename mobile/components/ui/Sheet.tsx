import type { LucideIcon } from "lucide-react-native";
import { X } from "lucide-react-native";
import type { PropsWithChildren } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing } from "../../lib/theme";
import { Text } from "./Text";

type Props = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title?: string;
  /** Lets lists inside the sheet take most of the screen height. */
  tall?: boolean;
}>;

/** A bottom sheet built on Modal, so it needs no extra native dependency. */
export function Sheet({ visible, onClose, title, tall = false, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={styles.container}>
        <Pressable accessibilityLabel="Close" style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            tall && styles.tall,
            { paddingBottom: Math.max(insets.bottom, spacing.md) },
          ]}
        >
          <View style={styles.handle} />
          {title ? (
            <View style={styles.header}>
              <Text variant="heading" style={styles.title}>
                {title}
              </Text>
              <Pressable accessibilityLabel="Close" hitSlop={10} onPress={onClose}>
                <X size={22} color={colors.muted} />
              </Pressable>
            </View>
          ) : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}

export type SheetAction = {
  label: string;
  description?: string;
  icon?: LucideIcon;
  destructive?: boolean;
  onPress: () => void;
};

/** A list of actions, used in place of a native action sheet. */
export function ActionSheet({
  visible,
  onClose,
  title,
  actions,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  actions: SheetAction[];
}) {
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View style={styles.actions}>
        {actions.map((action) => {
          const Icon = action.icon;
          const tint = action.destructive ? colors.danger : colors.heading;
          return (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              onPress={() => {
                onClose();
                action.onPress();
              }}
              style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
            >
              {Icon ? (
                <View
                  style={[
                    styles.actionIcon,
                    action.destructive && { backgroundColor: colors.dangerSoft },
                  ]}
                >
                  <Icon size={20} color={action.destructive ? colors.danger : colors.primary} />
                </View>
              ) : null}
              <View style={styles.actionText}>
                <Text variant="subheading" color={tint}>
                  {action.label}
                </Text>
                {action.description ? (
                  <Text variant="caption">{action.description}</Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "85%",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  tall: { height: "80%" },
  handle: {
    alignSelf: "center",
    backgroundColor: colors.border,
    borderRadius: 3,
    height: 5,
    marginBottom: spacing.sm,
    width: 40,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.sm,
  },
  title: { flex: 1 },
  actions: { gap: spacing.xxs, paddingBottom: spacing.sm },
  action: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.sm,
  },
  actionPressed: { backgroundColor: colors.surfaceMuted },
  actionIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  actionText: { flex: 1, gap: 2 },
});
