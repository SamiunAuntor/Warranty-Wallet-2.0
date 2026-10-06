import { Image } from "expo-image";
import type { LucideIcon } from "lucide-react-native";
import { Search, X } from "lucide-react-native";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { initials } from "../../lib/format";
import { colors, radius, spacing, toneColors, type Tone } from "../../lib/theme";
import { Text } from "./Text";
import { TextField } from "./TextField";

export function Avatar({
  name,
  photoUrl,
  size = 44,
}: {
  name: string | null | undefined;
  photoUrl?: string | null;
  size?: number;
}) {
  const style = { width: size, height: size, borderRadius: size / 2 };
  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={[styles.avatar, style]} contentFit="cover" />;
  }
  return (
    <View style={[styles.avatar, styles.avatarFallback, style]}>
      <Text variant="subheading" color={colors.white} style={{ fontSize: size * 0.36 }}>
        {initials(name)}
      </Text>
    </View>
  );
}

export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "primary",
  onPress,
  style,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: Tone;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const palette = toneColors[tone];
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.stat, pressed && styles.pressed, style]}
    >
      {Icon ? (
        <View style={[styles.statIcon, { backgroundColor: palette.background }]}>
          <Icon size={18} color={palette.foreground} />
        </View>
      ) : null}
      <Text variant="title" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text variant="caption" numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search",
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <TextField
      icon={Search}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      autoCorrect={false}
      autoCapitalize="none"
      returnKeyType="search"
      trailing={
        value ? (
          <Pressable accessibilityLabel="Clear search" hitSlop={10} onPress={() => onChangeText("")}>
            <X size={18} color={colors.subtle} />
          </Pressable>
        ) : null
      }
    />
  );
}

export function ProgressBar({ value, tone = "primary" }: { value: number; tone?: Tone }) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          { width: `${clamped * 100}%`, backgroundColor: toneColors[tone].foreground },
        ]}
      />
    </View>
  );
}

export type BarSegment = { value: number; color: string };
export type BarDatum = { label: string; segments: BarSegment[] };

/** A small stacked bar chart drawn with Views. */
export function BarChart({ data, height = 140 }: { data: BarDatum[]; height?: number }) {
  const max = Math.max(1, ...data.map((item) => item.segments.reduce((sum, s) => sum + s.value, 0)));
  return (
    <View style={styles.chart}>
      <View style={[styles.bars, { height }]}>
        {data.map((item) => (
          <View key={item.label} style={styles.barColumn}>
            <View style={styles.barStack}>
              {item.segments.map((segment, index) =>
                segment.value > 0 ? (
                  <View
                    key={index}
                    style={{
                      backgroundColor: segment.color,
                      height: (segment.value / max) * height,
                    }}
                  />
                ) : null,
              )}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.labels}>
        {data.map((item) => (
          <Text key={item.label} variant="caption" style={styles.barLabel} numberOfLines={1}>
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function Legend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <View style={styles.legend}>
      {items.map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text variant="caption">{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { backgroundColor: colors.surfaceMuted },
  avatarFallback: { alignItems: "center", backgroundColor: colors.heading, justifyContent: "center" },
  stat: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    gap: 4,
    padding: spacing.md,
  },
  pressed: { opacity: 0.8 },
  statIcon: {
    alignItems: "center",
    borderRadius: radius.sm,
    height: 32,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 32,
  },
  track: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    height: 8,
    overflow: "hidden",
  },
  fill: { borderRadius: radius.pill, height: "100%" },
  chart: { gap: spacing.xs },
  bars: { alignItems: "flex-end", flexDirection: "row", gap: 6 },
  barColumn: { flex: 1, height: "100%", justifyContent: "flex-end" },
  barStack: { borderRadius: 4, flexDirection: "column-reverse", overflow: "hidden" },
  labels: { flexDirection: "row", gap: 6 },
  barLabel: { flex: 1, fontSize: 10, textAlign: "center" },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  legendItem: { alignItems: "center", flexDirection: "row", gap: 6 },
  legendDot: { borderRadius: 4, height: 8, width: 8 },
});
