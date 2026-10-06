import type { LucideIcon } from "lucide-react-native";
import { ChevronRight } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";
import { colors, radius, spacing } from "../../lib/theme";
import { Text } from "./Text";

/** A tappable menu row with an icon, used in settings-style lists. */
export function ListRow({
  icon: Icon,
  title,
  subtitle,
  onPress,
  trailing,
  destructive,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: ReactNode;
  destructive?: boolean;
}) {
  const tint = destructive ? colors.danger : colors.primary;
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {Icon ? (
        <View style={[styles.icon, destructive && { backgroundColor: colors.dangerSoft }]}>
          <Icon size={19} color={tint} />
        </View>
      ) : null}
      <View style={styles.text}>
        <Text variant="subheading" color={destructive ? colors.danger : colors.heading}>
          {title}
        </Text>
        {subtitle ? <Text variant="caption" numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {trailing !== undefined
        ? trailing
        : onPress
          ? <ChevronRight size={18} color={colors.subtle} />
          : null}
    </Pressable>
  );
}

export function SwitchRow({
  title,
  subtitle,
  value,
  onValueChange,
  disabled,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.text}>
        <Text variant="subheading">{title}</Text>
        {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: colors.primary, false: colors.borderStrong }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.borderStrong}
      />
    </View>
  );
}

/** A label and value pair for detail screens. */
export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <View style={styles.info}>
      <Text variant="caption">{label}</Text>
      {typeof value === "string" || typeof value === "number" ? (
        <Text variant="body" color={colors.heading} weight="medium">
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  );
}

export function InfoGrid({ children }: { children: ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm + 2,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  icon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  text: { flex: 1, gap: 2 },
  switchRow: { alignItems: "center", flexDirection: "row", gap: spacing.md, paddingVertical: spacing.xs },
  info: { gap: 2, minWidth: "45%", flexGrow: 1, flexBasis: "45%" },
  grid: { columnGap: spacing.md, flexDirection: "row", flexWrap: "wrap", rowGap: spacing.md },
});
