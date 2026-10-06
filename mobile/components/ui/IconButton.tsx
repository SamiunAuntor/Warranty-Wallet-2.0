import type { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { colors, radius } from "../../lib/theme";
import { Text } from "./Text";

type Props = {
  icon: LucideIcon;
  onPress: () => void;
  label: string;
  tone?: "default" | "primary" | "danger";
  badge?: number;
  size?: number;
  disabled?: boolean;
};

const tones = {
  default: { color: colors.heading, background: colors.surface },
  primary: { color: colors.primary, background: colors.primarySoft },
  danger: { color: colors.danger, background: colors.dangerSoft },
};

export function IconButton({
  icon: Icon,
  onPress,
  label,
  tone = "default",
  badge,
  size = 40,
  disabled,
}: Props) {
  const palette = tones[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          backgroundColor: palette.background,
          borderColor: tone === "default" ? colors.border : palette.background,
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Icon size={Math.round(size * 0.45)} color={palette.color} strokeWidth={2} />
      {badge ? (
        <View style={styles.badge}>
          <Text variant="caption" color={colors.white} weight="bold" style={styles.badgeText}>
            {badge > 99 ? "99+" : badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: "center",
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.45 },
  badge: {
    alignItems: "center",
    backgroundColor: colors.danger,
    borderColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 20,
    justifyContent: "center",
    minWidth: 20,
    paddingHorizontal: 4,
    position: "absolute",
    right: -6,
    top: -6,
  },
  badgeText: { fontSize: 10, lineHeight: 12 },
});
