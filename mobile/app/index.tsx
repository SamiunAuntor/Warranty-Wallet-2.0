import { Image } from "expo-image";
import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { OfflineScreen } from "../components/OfflineScreen";
import { colors, spacing } from "../lib/theme";
import { useAuth } from "../providers/auth-provider";

/** Decides where the app starts once the saved session has been checked. */
export default function Index() {
  const { status } = useAuth();
  if (status === "signedIn") return <Redirect href="/(app)" />;
  if (status === "signedOut") return <Redirect href="/(auth)/login" />;
  if (status === "offline") return <OfflineScreen />;
  return (
    <View style={styles.center}>
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
        contentFit="contain"
      />
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    backgroundColor: colors.canvas,
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
  },
  logo: { height: 72, width: 72 },
});
