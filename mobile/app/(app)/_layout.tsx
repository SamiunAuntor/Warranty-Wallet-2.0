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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Dashboard", tabBarIcon: () => <Text>D</Text> }}
      />
      <Tabs.Screen name="assets" options={{ title: "Assets", tabBarIcon: () => <Text>A</Text> }} />
      <Tabs.Screen name="claims" options={{ title: "Claims", tabBarIcon: () => <Text>C</Text> }} />
      <Tabs.Screen
        name="documents"
        options={{ title: "Documents", tabBarIcon: () => <Text>F</Text> }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ title: "Alerts", tabBarIcon: () => <Text>N</Text> }}
      />
      <Tabs.Screen
        name="billing"
        options={{ title: "Billing", tabBarIcon: () => <Text>B</Text> }}
      />
      <Tabs.Screen name="admin" options={{ title: "Admin", tabBarIcon: () => <Text>O</Text> }} />
      <Tabs.Screen
        name="admin-catalog"
        options={{ title: "Catalog", tabBarIcon: () => <Text>K</Text> }}
      />
      <Tabs.Screen
        name="admin-operations"
        options={{ title: "Operations", tabBarIcon: () => <Text>X</Text> }}
      />
      <Tabs.Screen
        name="reports"
        options={{ title: "Reports", tabBarIcon: () => <Text>R</Text> }}
      />
      <Tabs.Screen name="scan" options={{ title: "Scan", tabBarIcon: () => <Text>I</Text> }} />
      <Tabs.Screen
        name="settings"
        options={{ title: "Settings", tabBarIcon: () => <Text>S</Text> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: () => <Text>P</Text> }}
      />
      <Tabs.Screen
        name="activity"
        options={{ title: "Activity", tabBarIcon: () => <Text>H</Text> }}
      />
      <Tabs.Screen
        name="preferences"
        options={{ title: "Preferences", tabBarIcon: () => <Text>V</Text> }}
      />
    </Tabs>
  );
}
