import { Redirect, Tabs } from "expo-router";
import { Text } from "react-native";
import { useAuth } from "../../providers/auth-provider";
import { colors } from "../../lib/theme";

export default function AppLayout() {
  const { appUser, loading, user } = useAuth();
  if (!loading && (!user || !appUser)) {
    return <Redirect href="/(auth)/login" />;
  }
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: () => <Text>⌂</Text> }}
      />
      <Tabs.Screen name="assets" options={{ title: "Assets", tabBarIcon: () => <Text>▣</Text> }} />
      <Tabs.Screen name="claims" options={{ title: "Claims", tabBarIcon: () => <Text>✓</Text> }} />
      <Tabs.Screen
        name="reports"
        options={{ title: "Reports", tabBarIcon: () => <Text>▤</Text> }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: "More", tabBarIcon: () => <Text>•••</Text> }}
      />
      <Tabs.Screen name="documents" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="billing" options={{ href: null }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
      <Tabs.Screen name="admin-catalog" options={{ href: null }} />
      <Tabs.Screen name="admin-operations" options={{ href: null }} />
      <Tabs.Screen name="scan" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="preferences" options={{ href: null }} />
    </Tabs>
  );
}
