import { Image } from "expo-image";
import type { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Screen } from "../ui/Screen";
import { Text } from "../ui/Text";
import { colors, radius, shadow, spacing } from "../../lib/theme";

type Props = PropsWithChildren<{
  title: string;
  subtitle: string;
  footer?: ReactNode;
}>;

/** Shared frame for sign-in screens: brand, heading, a form card, and a footer link. */
export function AuthShell({ title, subtitle, footer, children }: Props) {
  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.brand}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <Text variant="subheading" color={colors.ink}>
          Warranty <Text variant="subheading" color={colors.primary}>Wallet</Text>
        </Text>
      </View>
      <View style={styles.heading}>
        <Text variant="display">{title}</Text>
        <Text variant="body" color={colors.muted}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.card}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: spacing.lg,
    justifyContent: "center",
    padding: spacing.lg,
  },
  brand: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  logo: { height: 36, width: 36 },
  heading: { gap: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadow.card,
  },
  footer: { alignItems: "center", gap: spacing.sm },
});
