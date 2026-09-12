import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "../providers/auth-provider";
import { colors } from "../lib/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <AuthProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: colors.canvas,
              },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
