import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../lib/theme";

export default function DashboardScreen() {
  return <View style={styles.container}><Text style={styles.eyebrow}>WARRANTY WALLET</Text><Text style={styles.title}>Your warranty home.</Text><Text style={styles.copy}>Dashboard analytics, reminders, assets, documents, claims, billing, and admin parity are built on this navigation shell in the following phases.</Text></View>;
}

const styles = StyleSheet.create({ container: { flex: 1, padding: spacing.xl, backgroundColor: colors.canvas }, eyebrow: { color: colors.brand, fontSize: 12, fontWeight: "700", letterSpacing: 2 }, title: { color: colors.ink, fontSize: 32, fontWeight: "800", marginTop: spacing.md }, copy: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: spacing.md } });
