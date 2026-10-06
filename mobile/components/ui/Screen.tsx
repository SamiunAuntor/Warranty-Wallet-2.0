import type { PropsWithChildren, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { colors, spacing } from "../../lib/theme";

type Props = PropsWithChildren<{
  /** Rendered above the scroll area, for example a ScreenHeader. */
  header?: ReactNode;
  /** Pinned below the scroll area, for example a save button. */
  footer?: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: ViewStyle;
  /** Tab screens sit above the tab bar, which already pads the bottom inset. */
  edges?: Edge[];
}>;

export function Screen({
  children,
  header,
  footer,
  scroll = true,
  refreshing = false,
  onRefresh,
  contentStyle,
  edges = ["top", "bottom"],
}: Props) {
  const safeEdges = footer ? edges.filter((edge) => edge !== "bottom") : edges;
  return (
    <SafeAreaView edges={safeEdges} style={styles.safe}>
      {header}
      {/* Android draws edge to edge, so the window no longer resizes for the keyboard. */}
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.content, contentStyle]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, contentStyle]}>{children}</View>
        )}
        {footer ? (
          <SafeAreaView edges={edges.includes("bottom") ? ["bottom"] : []} style={styles.footer}>
            {footer}
          </SafeAreaView>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.canvas, flex: 1 },
  flex: { flex: 1 },
  content: { gap: spacing.md, padding: spacing.md, paddingBottom: spacing.xl },
  footer: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
});
