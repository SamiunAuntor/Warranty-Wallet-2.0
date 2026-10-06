import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { CalendarDays } from "lucide-react-native";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { formatDate, fromIsoDate, toIsoDate } from "../../lib/format";
import { colors, radius, spacing } from "../../lib/theme";
import { Button } from "./Button";
import { Sheet } from "./Sheet";
import { Text } from "./Text";

type Props = {
  label?: string;
  /** YYYY-MM-DD */
  value: string;
  onChange: (value: string) => void;
  maximumDate?: Date;
  minimumDate?: Date;
  error?: string | null;
};

export function DateField({ label, value, onChange, maximumDate, minimumDate, error }: Props) {
  const current = fromIsoDate(value) ?? new Date();
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState(current);

  function open() {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: current,
        mode: "date",
        maximumDate,
        minimumDate,
        onChange: (event: DateTimePickerEvent, date?: Date) => {
          if (event.type === "set" && date) onChange(toIsoDate(date));
        },
      });
      return;
    }
    setDraft(current);
    setIosOpen(true);
  }

  return (
    <View style={styles.wrapper}>
      {label ? <Text variant="label" style={styles.label}>{label}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? "Choose date"}
        onPress={open}
        style={[styles.field, error ? styles.errored : null]}
      >
        <CalendarDays size={18} color={colors.subtle} />
        <Text variant="body" color={value ? colors.ink : colors.subtle} style={styles.value}>
          {value ? formatDate(current) : "Choose a date"}
        </Text>
      </Pressable>
      {error ? (
        <Text variant="caption" color={colors.danger} style={styles.label}>
          {error}
        </Text>
      ) : null}

      {Platform.OS === "ios" ? (
        <Sheet visible={iosOpen} onClose={() => setIosOpen(false)} title={label ?? "Choose date"}>
          <DateTimePicker
            value={draft}
            mode="date"
            display="inline"
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            accentColor={colors.primary}
            onChange={(_event, date) => date && setDraft(date)}
          />
          <Button
            title="Done"
            onPress={() => {
              onChange(toIsoDate(draft));
              setIosOpen(false);
            }}
          />
        </Sheet>
      ) : null}
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
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  errored: { borderColor: colors.danger },
  value: { flex: 1 },
});
