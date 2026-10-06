import type { LucideIcon } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { colors, radius, spacing } from "../../lib/theme";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "dangerOutline";
type Size = "sm" | "md" | "lg";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

const palette: Record<Variant, { background: string; foreground: string; border: string }> = {
  primary: { background: colors.primary, foreground: colors.white, border: colors.primary },
  secondary: { background: colors.primarySoft, foreground: colors.primary, border: colors.primarySoft },
  outline: { background: colors.surface, foreground: colors.heading, border: colors.borderStrong },
  ghost: { background: "transparent", foreground: colors.primary, border: "transparent" },
  danger: { background: colors.danger, foreground: colors.white, border: colors.danger },
  dangerOutline: { background: colors.surface, foreground: colors.danger, border: "#f0c4c4" },
};

const heights: Record<Size, number> = { sm: 36, md: 46, lg: 52 };

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  accessibilityLabel,
}: Props) {
  const tone = palette[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: tone.background,
          borderColor: tone.border,
          minHeight: heights[size],
          paddingHorizontal: size === "sm" ? spacing.sm + 2 : spacing.md,
        },
        fullWidth && styles.fullWidth,
        pressed && !inactive && styles.pressed,
        inactive && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={tone.foreground} />
        ) : Icon ? (
          <Icon size={size === "sm" ? 16 : 18} color={tone.foreground} strokeWidth={2.2} />
        ) : null}
        <Text
          variant={size === "sm" ? "label" : "subheading"}
          color={tone.foreground}
          weight="semibold"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: "center",
  },
  content: { alignItems: "center", flexDirection: "row", gap: spacing.xs + 2 },
  fullWidth: { alignSelf: "stretch" },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.55 },
});
