import { Link, router } from "expo-router";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, spacing } from "../../lib/theme";
import { useAuth } from "../../providers/auth-provider";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { login, loginWithGoogle } = useAuth();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({ androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID, iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { if (response?.type === "success" && response.params.id_token) void loginWithGoogle(response.params.id_token).then(() => router.replace("/(app)")).catch(() => setError("Google sign-in could not be completed.")); }, [loginWithGoogle, response]);

  async function submit() {
    setError("");
    if (!email.trim() || !password) return setError("Enter your email and password.");
    setSubmitting(true);
    try { await login(email, password); router.replace("/(app)"); }
    catch { setError("The email or password is incorrect."); }
    finally { setSubmitting(false); }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>WARRANTY WALLET</Text>
      <Text style={styles.title}>Welcome back.</Text>
      <Text style={styles.copy}>Sign in to access your warranties, documents, and claims.</Text>
      <TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="Email address" placeholderTextColor={colors.muted} style={styles.input} value={email} />
      <TextInput autoCapitalize="none" secureTextEntry onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.muted} style={styles.input} value={password} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable disabled={submitting} onPress={submit} style={styles.button}><Text style={styles.buttonText}>{submitting ? "Signing in..." : "Sign in"}</Text></Pressable>
      <Pressable disabled={!request || submitting} onPress={() => void promptAsync()} style={styles.google}><Text style={styles.googleText}>Continue with Google</Text></Pressable>
      <Link href="/(auth)/forgot-password" style={styles.secondaryLink}>Forgot password?</Link>
      <Link href="/(auth)/register" style={styles.secondaryLink}>Create an account</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: spacing.xl, backgroundColor: colors.canvas },
  eyebrow: { color: colors.brand, fontSize: 12, fontWeight: "700", letterSpacing: 2 },
  title: { color: colors.ink, fontSize: 38, fontWeight: "800", lineHeight: 44, marginTop: spacing.md },
  copy: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: spacing.md },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.ink, fontSize: 16, marginTop: spacing.md, padding: spacing.md },
  error: { color: colors.danger, marginTop: spacing.sm },
  button: { alignItems: "center", backgroundColor: colors.brand, borderRadius: 12, marginTop: spacing.lg, padding: spacing.md },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: "700" },
  google: { alignItems: "center", borderColor: colors.border, borderRadius: 12, borderWidth: 1, marginTop: spacing.sm, padding: spacing.md },
  googleText: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  secondaryLink: { color: colors.brand, fontSize: 15, fontWeight: "700", marginTop: spacing.lg, textAlign: "center" },
});
