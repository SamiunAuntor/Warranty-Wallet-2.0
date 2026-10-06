import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../lib/theme";
import { AuthProvider, useAuth } from "../providers/auth-provider";
import { QueryProvider } from "../providers/query-provider";
import { ToastProvider } from "../providers/toast-provider";

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Fall back to the system font rather than block the app if fonts fail.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ToastProvider>
          <AuthProvider>
            <StatusBar style="dark" />
            <HideSplashWhenReady />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.canvas },
              }}
            >
              <Stack.Screen name="index" options={{ animation: "none" }} />
              <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
              <Stack.Screen name="(app)" options={{ animation: "fade" }} />
            </Stack>
          </AuthProvider>
        </ToastProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}

/** Keeps the splash screen up until the saved session has been restored. */
function HideSplashWhenReady() {
  const { status } = useAuth();
  useEffect(() => {
    if (status !== "loading") void SplashScreen.hideAsync().catch(() => undefined);
  }, [status]);
  return null;
}
