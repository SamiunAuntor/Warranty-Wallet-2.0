import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../lib/theme";

export function LoadingState() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.brand} />
    </View>
  );
}

export function AccessDeniedState() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Admin access required.</Text>
      <Text style={styles.message}>This area is limited to administrator accounts.</Text>
    </View>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return message ? <Text style={styles.error}>{message}</Text> : null;
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  message: {
    color: colors.muted,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
  },
});
