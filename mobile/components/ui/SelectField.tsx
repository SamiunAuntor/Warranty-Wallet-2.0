import { Check, ChevronDown, Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../../lib/theme";
import { Sheet } from "./Sheet";
import { EmptyState } from "./ScreenStates";
import { Text } from "./Text";
import { TextField } from "./TextField";

export type SelectOption = { value: string; label: string; description?: string };

type Props = {
  label?: string;
  placeholder?: string;
  value: string | null | undefined;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string | null;
  searchable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  emptyMessage?: string;
};

export function SelectField({
  label,
  placeholder = "Select",
  value,
  options,
  onChange,
  error,
  searchable = options.length > 8,
  disabled,
  loading,
  emptyMessage = "Nothing to choose from yet.",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) =>
      `${option.label} ${option.description ?? ""}`.toLowerCase().includes(term),
    );
  }, [options, query]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  return (
    <View style={styles.wrapper}>
      {label ? <Text variant="label" style={styles.label}>{label}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.field, error ? styles.errored : null, disabled && styles.disabled]}
      >
        <Text
          variant="body"
          color={selected ? colors.ink : colors.subtle}
          numberOfLines={1}
          style={styles.value}
        >
          {loading ? "Loading…" : (selected?.label ?? placeholder)}
        </Text>
        <ChevronDown size={18} color={colors.muted} />
      </Pressable>
      {error ? (
        <Text variant="caption" color={colors.danger} style={styles.label}>
          {error}
        </Text>
      ) : null}

      <Sheet visible={open} onClose={close} title={label ?? placeholder} tall={options.length > 6}>
        {searchable ? (
          <View style={styles.search}>
            <TextField
              icon={Search}
              placeholder="Search"
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
          </View>
        ) : null}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.value}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<EmptyState title={query ? "No matches" : emptyMessage} />}
          renderItem={({ item }) => {
            const active = item.value === value;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  onChange(item.value);
                  close();
                }}
                style={({ pressed }) => [
                  styles.option,
                  active && styles.optionActive,
                  pressed && styles.optionPressed,
                ]}
              >
                <View style={styles.optionText}>
                  <Text variant="body" weight={active ? "semibold" : "regular"} color={colors.ink}>
                    {item.label}
                  </Text>
                  {item.description ? <Text variant="caption">{item.description}</Text> : null}
                </View>
                {active ? <Check size={18} color={colors.primary} /> : null}
              </Pressable>
            );
          }}
        />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { marginLeft: 2 },
  field: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  errored: { borderColor: colors.danger },
  disabled: { opacity: 0.6 },
  value: { flex: 1 },
  search: { paddingBottom: spacing.sm },
  option: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm + 2,
  },
  optionActive: { backgroundColor: colors.primaryTint },
  optionPressed: { backgroundColor: colors.surfaceMuted },
  optionText: { flex: 1, gap: 2 },
});
