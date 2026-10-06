import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { colors, radius, shadow, spacing } from "../../lib/theme";
import { Text } from "./Text";

type Props = PropsWithChildren<{
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
  accessibilityLabel?: string;
}>;

export function Card({ children, onPress, style, padded = true, accessibilityLabel }: Props) {
  const content = [styles.card, padded && styles.padded, style];
  if (!onPress) return <View style={content}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [...content, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

/** A titled group inside a screen, with an optional action on the right. */
export function Section({
  title,
  action,
  children,
  style,
}: PropsWithChildren<{ title: string; action?: ReactNode; style?: ViewStyle }>) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.sectionHeader}>
        <Text variant="subheading">{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    ...shadow.card,
  },
  padded: { gap: spacing.sm, padding: spacing.md },
  pressed: { backgroundColor: "#fafaff", transform: [{ scale: 0.995 }] },
  section: { gap: spacing.sm },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 28,
  },
  divider: { backgroundColor: colors.border, height: StyleSheet.hairlineWidth },
});
