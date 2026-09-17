import { Redirect, Tabs } from "expo-router";
import { StyleSheet, Text } from "react-native";
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
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} glyph="\u2302" />,
        }}
      />
      <Tabs.Screen
        name="assets"
        options={{
          title: "Assets",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} glyph="\u25a6" />,
        }}
      />
      <Tabs.Screen
        name="claims"
        options={{
          title: "Claims",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} glyph="\u2713" />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} glyph="\u25a4" />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} glyph="..." />,
        }}
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

function TabIcon({ focused, glyph }: { focused: boolean; glyph: string }) {
  return <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{glyph}</Text>;
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    height: 68,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabBarItem: {
    minWidth: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  tabIcon: {
    color: colors.muted,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 24,
  },
  tabIconActive: {
    color: colors.brand,
  },
});
