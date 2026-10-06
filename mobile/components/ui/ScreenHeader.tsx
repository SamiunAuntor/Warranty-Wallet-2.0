import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { colors, spacing } from "../../lib/theme";
import { Text } from "./Text";

type Props = {
  title: string;
  subtitle?: string;
  /** Shows a back button. Defaults to true for stacked screens. */
  back?: boolean;
  /** Where to go when there is no screen to return to. */
  fallbackHref?: string;
  actions?: ReactNode;
};

export function ScreenHeader({ title, subtitle, back = true, fallbackHref = "/", actions }: Props) {
  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace(fallbackHref as never);
  }

  return (
    <View style={styles.header}>
      {back ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={goBack}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <ChevronLeft size={24} color={colors.heading} />
        </Pressable>
      ) : null}
      <View style={styles.titles}>
        <Text variant="heading" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

/** Large page title used at the top of tab screens. */
export function PageTitle({
  overline,
  title,
  subtitle,
  actions,
}: {
  overline?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <View style={styles.page}>
      <View style={styles.pageTitles}>
        {overline ? <Text variant="overline">{overline}</Text> : null}
        <Text variant="title">{title}</Text>
        {subtitle ? <Text variant="bodySmall" color={colors.muted}>{subtitle}</Text> : null}
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    backgroundColor: colors.canvas,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 56,
    paddingHorizontal: spacing.sm,
  },
  back: { alignItems: "center", height: 40, justifyContent: "center", width: 40 },
  pressed: { opacity: 0.6 },
  titles: { flex: 1, paddingHorizontal: spacing.xs },
  actions: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  page: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  pageTitles: { flex: 1, gap: spacing.xxs },
});
