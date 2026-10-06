import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Lock } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { AuthShell } from "../../components/auth/AuthShell";
import { Button } from "../../components/ui/Button";
import { InlineMessage, LoadingState } from "../../components/ui/ScreenStates";
import { TextField } from "../../components/ui/TextField";
import { getAuthError } from "../../lib/auth-errors";
import { MIN_PASSWORD_LENGTH } from "../../lib/auth-validation";
import { getFirebaseAuth } from "../../lib/firebase";
import { colors } from "../../lib/theme";

/**
 * Opened from a password-reset deep link such as
 * warrantywallet://reset-password?oobCode=… when the Firebase email template
 * points at the app. The default Firebase link resets in the browser instead.
 */
export default function ResetPasswordScreen() {
  const { oobCode } = useLocalSearchParams<{ oobCode?: string }>();
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setError("This password reset link is incomplete. Request a new one.");
      setChecking(false);
      return;
    }
    verifyPasswordResetCode(getFirebaseAuth(), oobCode)
      .then(setEmail)
      .catch(() => setError("This password reset link is invalid or has expired."))
      .finally(() => setChecking(false));
  }, [oobCode]);

  async function submit() {
    if (!oobCode) return;
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use a password with at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await confirmPasswordReset(getFirebaseAuth(), oobCode, password);
      router.replace("/(auth)/login");
    } catch (cause) {
      setError(getAuthError(cause));
      setSaving(false);
    }
  }

  if (checking) return <LoadingState label="Checking your link" />;

  return (
    <AuthShell
      title="Choose a new password"
      subtitle={email ? `For ${email}` : "Request a new link from the sign-in screen."}
      footer={
        <Link href="/(auth)/forgot-password" style={styles.link}>
          Request a new link
        </Link>
      }
    >
      <InlineMessage message={error} />
      {email ? (
        <>
          <TextField
            label="New password"
            icon={Lock}
            secureTextEntry
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
          />
          <TextField
            label="Confirm password"
            icon={Lock}
            secureTextEntry
            autoComplete="new-password"
            value={confirm}
            onChangeText={setConfirm}
          />
          <Button title="Reset password" loading={saving} fullWidth onPress={() => void submit()} />
        </>
      ) : null}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
