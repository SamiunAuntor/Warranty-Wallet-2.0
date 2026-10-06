import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../../lib/theme";
import { Text } from "./Text";

export type ChipOption<T extends string> = { value: T; label: string; count?: number };

type Props<T extends string> = {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Scrolls horizontally instead of wrapping onto new lines. */
  scrollable?: boolean;
};

export function Chips<T extends string>({ options, value, onChange, scrollable = false }: Props<T>) {
  const chips = options.map((option) => {
    const selected = option.value === value;
    return (
      <Pressable
        key={option.value}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => onChange(option.value)}
        style={[styles.chip, selected && styles.selected]}
      >
        <Text
          variant="label"
          color={selected ? colors.white : colors.text}
          weight={selected ? "semibold" : "medium"}
        >
          {option.label}
          {option.count !== undefined ? ` · ${option.count}` : ""}
        </Text>
      </Pressable>
    );
  });

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={styles.scroll}
      >
        {chips}
      </ScrollView>
    );
  }
  return <View style={[styles.row, styles.wrap]}>{chips}</View>;
}

/** Equal-width options in a single bordered control. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text
              variant="label"
              color={selected ? colors.primary : colors.muted}
              weight={selected ? "semibold" : "medium"}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, marginHorizontal: -spacing.md },
  row: { flexDirection: "row", gap: spacing.xs + 2, paddingHorizontal: spacing.md },
  wrap: { flexWrap: "wrap", paddingHorizontal: 0 },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  segmented: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    flexDirection: "row",
    padding: 4,
  },
  segment: { alignItems: "center", borderRadius: radius.sm, flex: 1, paddingVertical: 9 },
  segmentSelected: {
    backgroundColor: colors.surface,
    shadowColor: "#0b1c30",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
});
