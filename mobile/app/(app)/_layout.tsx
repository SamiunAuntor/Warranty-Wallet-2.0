import { Redirect, Stack } from "expo-router";
import { OfflineScreen } from "../../components/OfflineScreen";
import { LoadingState } from "../../components/ui/ScreenStates";
import { TAB_ROUTES } from "../../components/navigation/TabBar";
import { colors } from "../../lib/theme";
import { useAuth } from "../../providers/auth-provider";

/**
 * Every signed-in screen lives in one stack, so detail screens always have a
 * real back stack. The five tab screens show the bottom TabBar themselves.
 */
export default function AppLayout() {
  const { status } = useAuth();
  if (status === "loading") return <LoadingState />;
  if (status === "offline") return <OfflineScreen />;
  if (status === "signedOut") return <Redirect href="/(auth)/login" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      {TAB_ROUTES.map((route) => (
        <Stack.Screen
          key={route}
          name={route}
          options={{ animation: "fade", gestureEnabled: false }}
        />
      ))}
    </Stack>
  );
}
