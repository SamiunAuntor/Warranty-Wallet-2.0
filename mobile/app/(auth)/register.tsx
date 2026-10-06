import { Link } from "expo-router";
import { Lock, Mail, UserRound } from "lucide-react-native";
import { useRef, useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { AuthShell } from "../../components/auth/AuthShell";
import { Button } from "../../components/ui/Button";
import { InlineMessage } from "../../components/ui/ScreenStates";
import { Text } from "../../components/ui/Text";
import { TextField } from "../../components/ui/TextField";
import { MIN_PASSWORD_LENGTH, validateRegistrationInput } from "../../lib/auth-validation";
import { colors } from "../../lib/theme";
import { useAuth } from "../../providers/auth-provider";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  async function submit() {
    const validationError = validateRegistrationInput(name, email, password, confirm);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await register(name, email, password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create your account.");
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Keep every receipt, warranty, and claim in one place."
      footer={
        <Text variant="bodySmall" color={colors.muted}>
          Already have an account?{" "}
          <Link href="/(auth)/login" style={styles.link}>
            Sign in
          </Link>
        </Text>
      }
    >
      <InlineMessage message={error} />
      <TextField
        label="Full name"
        icon={UserRound}
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        placeholder="Your name"
        value={name}
        onChangeText={setName}
      />
      <TextField
        ref={emailRef}
        label="Email"
        icon={Mail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        ref={passwordRef}
        label="Password"
        icon={Lock}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
      />
      <TextField
        ref={confirmRef}
        label="Confirm password"
        icon={Lock}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={() => void submit()}
        placeholder="Repeat the password"
        value={confirm}
        onChangeText={setConfirm}
      />
      <Button title="Create account" loading={submitting} fullWidth onPress={() => void submit()} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
