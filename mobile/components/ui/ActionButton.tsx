import type { LucideIcon } from "lucide-react-native";
import { Plus } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";
import { colors, radius, shadow, spacing } from "../../lib/theme";
import { Text } from "./Text";

/** Floating primary action, pinned above the tab bar on list screens. */
export function ActionButton({
  label,
  onPress,
  icon: Icon = Plus,
}: {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Icon size={20} color={colors.white} strokeWidth={2.4} />
      <Text variant="subheading" color={colors.white}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    bottom: spacing.md,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: 18,
    paddingVertical: 14,
    position: "absolute",
    right: spacing.md,
    ...shadow.raised,
  },
  pressed: { backgroundColor: colors.primaryPressed, transform: [{ scale: 0.98 }] },
});
