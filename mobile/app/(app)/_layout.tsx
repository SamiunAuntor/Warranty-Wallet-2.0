import { Redirect, Tabs } from "expo-router";
import { Text } from "react-native";
import { useAuth } from "../../providers/auth-provider";
import { colors } from "../../lib/theme";

export default function AppLayout() {
  const { user, loading } = useAuth();
  if (!loading && !user) return <Redirect href="/(auth)/login" />;
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.brand }}>
    <Tabs.Screen name="index" options={{ title: "Dashboard", tabBarIcon: () => <Text>D</Text> }} />
    <Tabs.Screen name="assets" options={{ title: "Assets", tabBarIcon: () => <Text>A</Text> }} />
    <Tabs.Screen name="claims" options={{ title: "Claims", tabBarIcon: () => <Text>C</Text> }} />
    <Tabs.Screen name="documents" options={{ title: "Documents", tabBarIcon: () => <Text>F</Text> }} />
    <Tabs.Screen name="notifications" options={{ title: "Alerts", tabBarIcon: () => <Text>N</Text> }} />
    <Tabs.Screen name="billing" options={{ title: "Billing", tabBarIcon: () => <Text>B</Text> }} />
    <Tabs.Screen name="admin" options={{ title: "Admin", tabBarIcon: () => <Text>O</Text> }} />
    <Tabs.Screen name="reports" options={{ title: "Reports", tabBarIcon: () => <Text>R</Text> }} />
    <Tabs.Screen name="scan" options={{ title: "Scan", tabBarIcon: () => <Text>I</Text> }} />
    <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: () => <Text>S</Text> }} />
  </Tabs>;
}
