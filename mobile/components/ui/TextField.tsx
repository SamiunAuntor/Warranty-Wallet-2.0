import type { LucideIcon } from "lucide-react-native";
import { forwardRef, useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { colors, fonts, radius, spacing } from "../../lib/theme";
import { Text } from "./Text";

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string | null;
  icon?: LucideIcon;
  optional?: boolean;
  trailing?: React.ReactNode;
};

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, hint, error, icon: Icon, optional, trailing, multiline, style, onFocus, onBlur, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="label" style={styles.label}>
          {label}
          {optional ? <Text variant="caption"> (optional)</Text> : null}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          multiline && styles.multiline,
          focused && styles.focused,
          error ? styles.errored : null,
        ]}
      >
        {Icon ? <Icon size={18} color={colors.subtle} style={styles.icon} /> : null}
        <TextInput
          ref={ref}
          {...props}
          multiline={multiline}
          placeholderTextColor={colors.subtle}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[styles.input, multiline && styles.inputMultiline, style]}
          textAlignVertical={multiline ? "top" : "center"}
        />
        {trailing}
      </View>
      {error ? (
        <Text variant="caption" color={colors.danger} style={styles.message}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" style={styles.message}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { marginLeft: 2 },
  field: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  multiline: { alignItems: "flex-start", minHeight: 108, paddingVertical: spacing.sm },
  focused: { borderColor: colors.primary, borderWidth: 1.5 },
  errored: { borderColor: colors.danger },
  icon: { marginRight: spacing.sm },
  input: {
    color: colors.ink,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    paddingVertical: spacing.sm,
  },
  inputMultiline: { minHeight: 88 },
  message: { marginLeft: 2 },
});
