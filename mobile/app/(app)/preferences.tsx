import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { UserPreferences } from "../../lib/auth-api";
import { usePreferences } from "../../hooks/use-preferences";
import { colors, spacing } from "../../lib/theme";
export default function PreferencesScreen() {
  const { loading, message, preferences, save, saving, updateField } = usePreferences();
  if (loading || !preferences) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>ACCOUNT</Text>
      <Text style={styles.title}>Preferences</Text>
      <View style={styles.card}>
        <Text style={styles.section}>Warranty reminders</Text>
        <Pressable
          onPress={() =>
            updateField("warrantyReminders", !preferences.warrantyReminders)
          }
          style={styles.toggle}
        >
          <Text style={styles.toggleText}>
            {preferences.warrantyReminders ? "Enabled" : "Disabled"}
          </Text>
        </Pressable>
        <Text style={styles.label}>Reminder days</Text>
        <TextInput
          keyboardType="numbers-and-punctuation"
          onChangeText={(value) =>
            updateField("reminderDays", value.split(",").map(Number).filter(Number.isFinite))
          }
          style={styles.input}
          value={preferences.reminderDays.join(", ")}
        />
        <Text style={styles.label}>Time zone</Text>
        <TextInput
          onChangeText={(value) => updateField("timezone", value)}
          style={styles.input}
          value={preferences.timezone}
        />
        <Text style={styles.label}>Currency</Text>
        <TextInput
          autoCapitalize="characters"
          onChangeText={(value) => updateField("currency", value as UserPreferences["currency"])}
          style={styles.input}
          value={preferences.currency}
        />
        <Text style={styles.label}>Date format</Text>
        <TextInput
          onChangeText={(value) =>
            updateField("dateFormat", value as UserPreferences["dateFormat"])
          }
          style={styles.input}
          value={preferences.dateFormat}
        />
        <Pressable disabled={saving} onPress={() => void save()} style={styles.save}>
          <Text style={styles.saveText}>{saving ? "Saving..." : "Save preferences"}</Text>
        </Pressable>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.canvas,
    gap: spacing.md,
    padding: spacing.lg,
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "800",
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.lg,
  },
  section: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "700",
  },
  toggle: {
    alignSelf: "flex-start",
    backgroundColor: colors.brandSoft,
    borderRadius: 16,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  toggleText: {
    color: colors.brand,
    fontWeight: "700",
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.md,
  },
  input: {
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.ink,
    marginTop: spacing.xs,
    padding: spacing.sm,
  },
  save: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 10,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  saveText: {
    color: colors.surface,
    fontWeight: "700",
  },
  message: {
    color: colors.brand,
    marginTop: spacing.md,
  },
});
