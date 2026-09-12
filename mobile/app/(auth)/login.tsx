import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../lib/theme";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>WARRANTY WALLET</Text>
      <Text style={styles.title}>Your purchases, protected.</Text>
      <Text style={styles.copy}>The mobile foundation is ready. Authentication and the complete warranty workspace are delivered in the next phases.</Text>
      <Link href="/(app)" style={styles.link}>Open development workspace</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: spacing.xl, backgroundColor: colors.canvas },
  eyebrow: { color: colors.brand, fontSize: 12, fontWeight: "700", letterSpacing: 2 },
  title: { color: colors.ink, fontSize: 38, fontWeight: "800", lineHeight: 44, marginTop: spacing.md },
  copy: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: spacing.md },
  link: { alignSelf: "flex-start", backgroundColor: colors.brand, borderRadius: 12, color: colors.surface, fontSize: 16, fontWeight: "700", marginTop: spacing.xl, overflow: "hidden", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
});
