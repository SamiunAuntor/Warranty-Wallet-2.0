import type { LucideIcon } from "lucide-react-native";
import { AlertTriangle, Inbox } from "lucide-react-native";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { errorMessage } from "../../lib/api";
import { colors, radius, spacing } from "../../lib/theme";
import { Button } from "./Button";
import { Text } from "./Text";

export function LoadingState({ label }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} size="large" />
      {label ? <Text variant="bodySmall" color={colors.muted}>{label}</Text> : null}
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <View style={[styles.iconWrap, { backgroundColor: colors.dangerSoft }]}>
        <AlertTriangle size={26} color={colors.danger} />
      </View>
      <Text variant="subheading" align="center">
        Something went wrong
      </Text>
      <Text variant="bodySmall" color={colors.muted} align="center">
        {errorMessage(error)}
      </Text>
      {onRetry ? <Button title="Try again" variant="outline" size="sm" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon?: LucideIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.iconWrap}>
        <Icon size={26} color={colors.primary} />
      </View>
      <Text variant="subheading" align="center">
        {title}
      </Text>
      {message ? (
        <Text variant="bodySmall" color={colors.muted} align="center">
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} size="sm" onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

/** Inline error or success message inside forms. */
export function InlineMessage({
  message,
  tone = "danger",
}: {
  message?: string | null;
  tone?: "danger" | "success" | "info";
}) {
  if (!message) return null;
  const palette =
    tone === "danger"
      ? { background: colors.dangerSoft, foreground: colors.danger }
      : tone === "success"
        ? { background: colors.successSoft, foreground: colors.success }
        : { background: colors.primaryTint, foreground: colors.primary };
  return (
    <View style={[styles.inline, { backgroundColor: palette.background }]}>
      <Text variant="bodySmall" color={palette.foreground}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 240,
    padding: spacing.xl,
  },
  empty: { alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.xxl },
  iconWrap: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 56,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 56,
  },
  action: { marginTop: spacing.sm },
  inline: { borderRadius: radius.md, padding: spacing.sm + 2 },
});
