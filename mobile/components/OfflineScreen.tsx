import { WifiOff } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../lib/config";
import { colors, radius, spacing } from "../lib/theme";
import { useAuth } from "../providers/auth-provider";
import { Button } from "./ui/Button";
import { Text } from "./ui/Text";

/** Shown when Firebase restored a session but the API could not be reached. */
export function OfflineScreen() {
  const { retrySync, logout } = useAuth();
  const [retrying, setRetrying] = useState(false);
  return (
    <SafeAreaView style={styles.center}>
      <View style={styles.icon}>
        <WifiOff size={28} color={colors.primary} />
      </View>
      <Text variant="title" align="center">
        Can&apos;t reach Warranty Wallet
      </Text>
      <Text variant="body" color={colors.muted} align="center">
        You are signed in, but the server did not respond. Check your connection and try again.
      </Text>
      <Text variant="caption" align="center">
        Server: {API_URL}
      </Text>
      <View style={styles.actions}>
        <Button
          title="Try again"
          loading={retrying}
          fullWidth
          onPress={async () => {
            setRetrying(true);
            await retrySync();
            setRetrying(false);
          }}
        />
        <Button title="Sign out" variant="ghost" fullWidth onPress={() => void logout()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    backgroundColor: colors.canvas,
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    padding: spacing.xl,
  },
  icon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  actions: { alignSelf: "stretch", gap: spacing.xs, marginTop: spacing.md },
});
