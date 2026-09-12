import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../providers/auth-provider";
import { colors } from "../lib/theme";

export default function Index() {
  const { loading, user } = useAuth();
  if (loading)
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  return <Redirect href={user ? "/(app)" : "/(auth)/login"} />;
}
