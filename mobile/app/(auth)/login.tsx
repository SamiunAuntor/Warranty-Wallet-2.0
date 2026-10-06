import { Link } from "expo-router";
import { Lock, Mail } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { AuthShell } from "../../components/auth/AuthShell";
import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton";
import { Button } from "../../components/ui/Button";
import { InlineMessage } from "../../components/ui/ScreenStates";
import { Text } from "../../components/ui/Text";
import { TextField } from "../../components/ui/TextField";
import { validateLoginInput } from "../../lib/auth-validation";
import { colors, spacing } from "../../lib/theme";
import { useAuth } from "../../providers/auth-provider";

export default function LoginScreen() {
  const { login, loginWithGoogle, notice, clearNotice } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  async function submit() {
    clearNotice();
    const validationError = validateLoginInput(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      // The auth layout redirects into the app once the session is ready.
      await login(email, password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign you in.");
      setSubmitting(false);
    }
  }

  const handleGoogleToken = useCallback(
    (idToken: string) => {
      setError("");
      setSubmitting(true);
      loginWithGoogle(idToken).catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Google sign-in failed.");
        setSubmitting(false);
      });
    },
    [loginWithGoogle],
  );

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to see your warranties, documents, and claims."
      footer={
        <Text variant="bodySmall" color={colors.muted}>
          New to Warranty Wallet?{" "}
          <Link href="/(auth)/register" style={styles.link}>
            Create an account
          </Link>
        </Text>
      }
    >
      <InlineMessage message={error || notice} />
      <TextField
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
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={() => void submit()}
        placeholder="Your password"
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.forgot}>
        <Link href="/(auth)/forgot-password" style={styles.link}>
          Forgot password?
        </Link>
      </View>
      <Button title="Sign in" loading={submitting} fullWidth onPress={() => void submit()} />
      <GoogleSignInButton
        disabled={submitting}
        onIdToken={handleGoogleToken}
        onError={setError}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  forgot: { alignItems: "flex-end", marginTop: -spacing.xs },
  link: { color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
