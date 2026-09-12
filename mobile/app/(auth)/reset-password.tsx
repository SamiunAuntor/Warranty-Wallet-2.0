import { useEffect, useState } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { validatePasswordResetInput } from "../../lib/auth-validation";
import { colors, spacing } from "../../lib/theme";
import { useAuth } from "../../providers/auth-provider";

export default function ResetPasswordScreen() {
  const { oobCode } = useLocalSearchParams<{ oobCode?: string }>();
  const { verifyResetCode, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [valid, setValid] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!oobCode) return setError("This password reset link is incomplete.");
    void verifyResetCode(oobCode)
      .then(setEmail)
      .then(() => setValid(true))
      .catch(() => setError("This password reset link is invalid or expired."));
  }, [oobCode, verifyResetCode]);
  async function submit() {
    if (!oobCode) return;
    setError("");
    const validationError = validatePasswordResetInput(password, confirm);

    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      await resetPassword(oobCode, password);
      router.replace("/(auth)/login");
    } catch {
      setError("Could not reset your password. Request a new link and try again.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>ACCOUNT RECOVERY</Text>
      <Text style={styles.title}>Choose a new password.</Text>
      {email ? <Text style={styles.copy}>{email}</Text> : null}
      {valid ? (
        <>
          <TextInput
            autoCapitalize="none"
            secureTextEntry
            onChangeText={setPassword}
            placeholder="New password"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={password}
          />
          <TextInput
            autoCapitalize="none"
            secureTextEntry
            onChangeText={setConfirm}
            placeholder="Confirm password"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={confirm}
          />
          <Pressable disabled={saving} onPress={() => void submit()} style={styles.button}>
            <Text style={styles.buttonText}>{saving ? "Saving..." : "Reset password"}</Text>
          </Pressable>
        </>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Link href="/(auth)/login" style={styles.link}>
        Back to sign in
      </Link>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.canvas,
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
    marginTop: spacing.md,
  },
  copy: {
    color: colors.muted,
    fontSize: 15,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 12,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  error: {
    color: colors.danger,
    marginTop: spacing.md,
  },
  link: {
    color: colors.brand,
    fontSize: 15,
    fontWeight: "700",
    marginTop: spacing.lg,
    textAlign: "center",
  },
});
