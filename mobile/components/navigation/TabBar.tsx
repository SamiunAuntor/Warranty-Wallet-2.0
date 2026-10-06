import { router, useFocusEffect, usePathname } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import { Bell, House, Package, ShieldCheck, UserRound } from "lucide-react-native";
import { useCallback, type PropsWithChildren } from "react";
import { BackHandler, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUnreadCount } from "../../hooks/use-notifications";
import { colors, spacing } from "../../lib/theme";
import { Text } from "../ui/Text";

type Tab = { route: string; path: string; href: string; label: string; icon: LucideIcon };

const TABS: Tab[] = [
  { route: "index", path: "/", href: "/(app)", label: "Home", icon: House },
  { route: "assets", path: "/assets", href: "/(app)/assets", label: "Assets", icon: Package },
  { route: "claims", path: "/claims", href: "/(app)/claims", label: "Claims", icon: ShieldCheck },
  {
    route: "notifications",
    path: "/notifications",
    href: "/(app)/notifications",
    label: "Alerts",
    icon: Bell,
  },
  { route: "more", path: "/more", href: "/(app)/more", label: "Account", icon: UserRound },
];

/** Route names of the tab screens, used by the stack layout. */
export const TAB_ROUTES = TABS.map((tab) => tab.route);

export function goToTab(path: string) {
  const tab = TABS.find((item) => item.path === path);
  if (tab) router.replace(tab.href as never);
}

/**
 * Bottom navigation for the five top-level screens. Switching tabs replaces
 * the current screen, so the stack never grows from tab to tab.
 */
export function TabBar() {
  const pathname = usePathname();
  const { data: unread = 0 } = useUnreadCount();
  const active = TABS.find((tab) => tab.path === pathname) ?? TABS[0];

  // On Android, back from any tab other than Home returns to Home.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        if (active.path === "/") return false;
        goToTab("/");
        return true;
      });
      return () => subscription.remove();
    }, [active.path]),
  );

  return (
    <SafeAreaView edges={["bottom"]} style={styles.bar}>
      <View style={styles.row}>
        {TABS.map((tab) => {
          const focused = tab.path === active.path;
          const Icon = tab.icon;
          const badge = tab.route === "notifications" && unread > 0 ? unread : 0;
          return (
            <Pressable
              key={tab.route}
              accessibilityRole="tab"
              accessibilityLabel={badge ? `${tab.label}, ${badge} unread` : tab.label}
              accessibilityState={{ selected: focused }}
              onPress={() => !focused && router.replace(tab.href as never)}
              style={styles.tab}
            >
              <View style={[styles.iconWrap, focused && styles.iconActive]}>
                <Icon
                  size={21}
                  color={focused ? colors.primary : colors.muted}
                  strokeWidth={focused ? 2.4 : 2}
                />
                {badge ? (
                  <View style={styles.badge}>
                    <Text variant="caption" color={colors.white} weight="bold" style={styles.badgeText}>
                      {badge > 9 ? "9+" : badge}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text
                variant="caption"
                weight={focused ? "semibold" : "medium"}
                color={focused ? colors.primary : colors.muted}
                style={styles.label}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

/** Wraps a tab screen: top safe area, the content, then the tab bar. */
export function TabScreen({ children }: PropsWithChildren) {
  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.content}>
        {children}
      </SafeAreaView>
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.canvas, flex: 1 },
  content: { flex: 1 },
  bar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: { flexDirection: "row", paddingHorizontal: spacing.xs, paddingTop: 6, paddingBottom: 4 },
  tab: { alignItems: "center", flex: 1, gap: 2, paddingVertical: 2 },
  iconWrap: {
    alignItems: "center",
    borderRadius: 14,
    height: 30,
    justifyContent: "center",
    width: 52,
  },
  iconActive: { backgroundColor: colors.primarySoft },
  label: { fontSize: 11 },
  badge: {
    alignItems: "center",
    backgroundColor: colors.danger,
    borderColor: colors.surface,
    borderRadius: 9,
    borderWidth: 1.5,
    height: 18,
    justifyContent: "center",
    minWidth: 18,
    paddingHorizontal: 3,
    position: "absolute",
    right: 8,
    top: -3,
  },
  badgeText: { fontSize: 10, lineHeight: 12 },
});
