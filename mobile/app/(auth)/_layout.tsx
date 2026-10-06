import { Redirect, Stack } from "expo-router";
import { colors } from "../../lib/theme";
import { useAuth } from "../../providers/auth-provider";

export default function AuthLayout() {
  const { status } = useAuth();
  if (status === "signedIn") return <Redirect href="/(app)" />;
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}
    />
  );
}
