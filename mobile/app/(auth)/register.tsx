import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  normalizeEmail,
  validateRegistrationInput,
} from "../../lib/auth-validation";
import { colors, spacing } from "../../lib/theme";
import { useAuth } from "../../providers/auth-provider";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function submit() {
    setError("");
    const validationError = validateRegistrationInput(name, email, password);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), normalizeEmail(email), password);
      router.replace("/(app)");
    } catch {
      setError("We could not create your account. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>WARRANTY WALLET</Text>
      <Text style={styles.title}>Keep every purchase close.</Text>
      <Text style={styles.copy}>
        Create an account to organize warranties and documents in one place.
      </Text>
      <TextInput
        onChangeText={setName}
        placeholder="Full name"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={name}
      />
      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email address"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={email}
      />
      <TextInput
        autoCapitalize="none"
        secureTextEntry
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={password}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable disabled={submitting} onPress={submit} style={styles.button}>
        <Text style={styles.buttonText}>{submitting ? "Creating..." : "Create account"}</Text>
      </Pressable>
      <Link href="/(auth)/login" style={styles.link}>
        Already have an account? Sign in
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.canvas,
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
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.md,
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
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
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
  link: {
    color: colors.brand,
    fontSize: 15,
    fontWeight: "700",
    marginTop: spacing.lg,
    textAlign: "center",
  },
});
