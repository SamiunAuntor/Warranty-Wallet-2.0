import { Link } from "expo-router";
import { Mail } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { AuthShell } from "../../components/auth/AuthShell";
import { Button } from "../../components/ui/Button";
import { InlineMessage } from "../../components/ui/ScreenStates";
import { TextField } from "../../components/ui/TextField";
import { validatePasswordResetRequest } from "../../lib/auth-validation";
import { colors } from "../../lib/theme";
import { useAuth } from "../../providers/auth-provider";

export default function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const validationError = validatePasswordResetRequest(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send the reset email.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link to choose a new password. Open it on any device, then sign in here."
      footer={
        <Link href="/(auth)/login" style={styles.link}>
          Back to sign in
        </Link>
      }
    >
      <InlineMessage message={error} />
      <InlineMessage
        tone="success"
        message={sent ? `If an account exists for ${email.trim()}, a reset link is on its way.` : null}
      />
      <TextField
        label="Email"
        icon={Mail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={() => void submit()}
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
      />
      <Button
        title={sent ? "Send again" : "Send reset link"}
        loading={submitting}
        fullWidth
        onPress={() => void submit()}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
