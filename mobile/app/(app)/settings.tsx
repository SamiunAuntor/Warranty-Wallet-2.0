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
import { useSettings } from "../../hooks/use-settings";
import { colors, spacing } from "../../lib/theme";

export default function SettingsScreen() {
  const settings = useSettings();
  const {
    appUser,
    loading,
    logout,
    message,
    name,
    phone,
    preferences,
    save,
    saving,
    setName,
    setPhone,
    updatePreference,
  } = settings;
  if (loading || !appUser || !preferences) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>ACCOUNT</Text>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.card}>
        <Text style={styles.section}>Profile</Text>
        <Text style={styles.label}>Name</Text>
        <TextInput onChangeText={setName} style={styles.input} value={name} />
        <Text style={styles.label}>Phone</Text>
        <TextInput
          keyboardType="phone-pad"
          onChangeText={setPhone}
          style={styles.input}
          value={phone}
        />
        <Text style={styles.readonly}>{appUser.email}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.section}>Warranty reminders</Text>
        <Pressable
          onPress={() =>
            updatePreference("warrantyReminders", !preferences.warrantyReminders)
          }
          style={styles.toggle}
        >
          <Text style={styles.toggleText}>
            {preferences.warrantyReminders ? "Enabled" : "Disabled"}
          </Text>
        </Pressable>
        <Text style={styles.label}>Reminder days, comma separated</Text>
        <TextInput
          keyboardType="numbers-and-punctuation"
          onChangeText={(value) =>
            updatePreference(
              "reminderDays",
              value.split(",").map(Number).filter((day) => Number.isFinite(day)),
            )
          }
          style={styles.input}
          value={preferences.reminderDays.join(", ")}
        />
        <Text style={styles.label}>Currency</Text>
        <TextInput
          autoCapitalize="characters"
          onChangeText={(value) =>
            updatePreference("currency", value as UserPreferences["currency"])
          }
          style={styles.input}
          value={preferences.currency}
        />
      </View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Pressable disabled={saving} onPress={() => void save()} style={styles.save}>
        <Text style={styles.saveText}>{saving ? "Saving..." : "Save settings"}</Text>
      </Pressable>
      <Pressable onPress={() => void logout()} style={styles.logout}>
        <Text style={styles.logoutText}>Sign out</Text>
      </Pressable>
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
    marginBottom: spacing.md,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  input: {
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.ink,
    marginTop: spacing.xs,
    padding: spacing.sm,
  },
  readonly: {
    color: colors.muted,
    fontSize: 13,
    marginTop: spacing.md,
  },
  toggle: {
    alignSelf: "flex-start",
    backgroundColor: colors.brandSoft,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  toggleText: {
    color: colors.brand,
    fontWeight: "700",
  },
  message: {
    color: colors.brand,
  },
  save: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 10,
    padding: spacing.md,
  },
  saveText: {
    color: colors.surface,
    fontWeight: "700",
  },
  logout: {
    alignItems: "center",
    borderColor: colors.danger,
    borderRadius: 10,
    borderWidth: 1,
    padding: spacing.md,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: "700",
  },
});
