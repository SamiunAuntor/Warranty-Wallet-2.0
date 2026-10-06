import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { Card, Section } from "../../components/ui/Card";
import { Chips } from "../../components/ui/Chips";
import { SwitchRow } from "../../components/ui/Rows";
import { Screen } from "../../components/ui/Screen";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { ErrorState, InlineMessage, LoadingState } from "../../components/ui/ScreenStates";
import { SelectField } from "../../components/ui/SelectField";
import { Text } from "../../components/ui/Text";
import { usePreferences, useSavePreferences } from "../../hooks/use-preferences";
import { errorMessage } from "../../lib/api";
import { formatDate } from "../../lib/format";
import { colors, spacing } from "../../lib/theme";
import type { Currency, DateFormat, UserPreferences } from "../../lib/types";
import { useToast } from "../../providers/toast-provider";

const REMINDER_OPTIONS = [1, 3, 7, 14, 30, 60, 90];
const MAX_REMINDERS = 5;
const CURRENCIES: Currency[] = ["USD", "BDT", "EUR", "GBP", "CAD", "AUD"];
const DATE_FORMATS: DateFormat[] = ["MMM_D_YYYY", "DD_MM_YYYY", "MM_DD_YYYY"];
const COMMON_TIMEZONES = [
  "UTC",
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "America/Toronto",
  "Australia/Sydney",
];

type Draft = Omit<UserPreferences, "id" | "userId">;

const deviceTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

export default function PreferencesScreen() {
  const toast = useToast();
  const preferences = usePreferences();
  const save = useSavePreferences();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preferences.data && !draft) {
      const { id: _id, userId: _userId, ...rest } = preferences.data;
      setDraft(rest);
    }
  }, [draft, preferences.data]);

  const header = <ScreenHeader title="Preferences" fallbackHref="/(app)/more" />;
  if (preferences.isPending || (!draft && !preferences.isError)) {
    return <Screen header={header}><LoadingState /></Screen>;
  }
  if (preferences.isError || !draft) {
    return (
      <Screen header={header}>
        <ErrorState error={preferences.error} onRetry={() => void preferences.refetch()} />
      </Screen>
    );
  }

  const set = <K extends keyof Draft>(field: K, value: Draft[K]) =>
    setDraft((current) => (current ? { ...current, [field]: value } : current));

  function toggleDay(day: number) {
    if (!draft) return;
    const has = draft.reminderDays.includes(day);
    if (!has && draft.reminderDays.length >= MAX_REMINDERS) {
      toast.info(`Choose up to ${MAX_REMINDERS} reminder times.`);
      return;
    }
    if (has && draft.reminderDays.length === 1) {
      toast.info("Keep at least one reminder time, or turn reminders off.");
      return;
    }
    set(
      "reminderDays",
      has ? draft.reminderDays.filter((value) => value !== day) : [...draft.reminderDays, day].sort((a, b) => b - a),
    );
  }

  async function submit() {
    if (!draft) return;
    setError(null);
    try {
      await save.mutateAsync(draft);
      toast.success("Preferences saved.");
    } catch (cause) {
      setError(errorMessage(cause, "Could not save your preferences."));
    }
  }

  const timezoneOptions = Array.from(new Set([draft.timezone, deviceTimezone(), ...COMMON_TIMEZONES])).map(
    (zone) => ({ value: zone, label: zone.replaceAll("_", " "), description: zone === deviceTimezone() ? "This device" : undefined }),
  );
  const sample = new Date(2026, 2, 14);

  return (
    <Screen
      header={header}
      footer={<Button title="Save preferences" fullWidth loading={save.isPending} onPress={() => void submit()} />}
    >
      <InlineMessage message={error} />

      <Section title="Warranty reminders">
        <Card>
          <SwitchRow
            title="Email and in-app reminders"
            subtitle="Get notified before a warranty expires."
            value={draft.warrantyReminders}
            onValueChange={(value) => set("warrantyReminders", value)}
          />
          {draft.warrantyReminders ? (
            <View style={styles.days}>
              <Text variant="label">Remind me before expiry</Text>
              <View style={styles.dayRow}>
                {REMINDER_OPTIONS.map((day) => {
                  const selected = draft.reminderDays.includes(day);
                  return (
                    <Button
                      key={day}
                      title={day === 1 ? "1 day" : `${day} days`}
                      size="sm"
                      variant={selected ? "primary" : "outline"}
                      onPress={() => toggleDay(day)}
                    />
                  );
                })}
              </View>
              <Text variant="caption">Up to {MAX_REMINDERS} reminder times.</Text>
            </View>
          ) : null}
        </Card>
      </Section>

      <Section title="Display">
        <Card style={styles.display}>
          <View style={styles.field}>
            <Text variant="label">Currency</Text>
            <Chips
              options={CURRENCIES.map((value) => ({ value, label: value }))}
              value={draft.currency}
              onChange={(value) => set("currency", value)}
            />
          </View>
          <SelectField
            label="Date format"
            value={draft.dateFormat}
            options={DATE_FORMATS.map((value) => ({ value, label: formatDate(sample, value) }))}
            onChange={(value) => set("dateFormat", value as DateFormat)}
          />
          <SelectField
            label="Time zone"
            value={draft.timezone}
            options={timezoneOptions}
            searchable
            onChange={(value) => set("timezone", value)}
          />
          <Text variant="caption" color={colors.muted}>
            Reminders are sent according to this time zone.
          </Text>
        </Card>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  days: { gap: spacing.sm, marginTop: spacing.sm },
  dayRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  display: { gap: spacing.md },
  field: { gap: spacing.xs },
});
