import { Pressable, StyleSheet, Text } from "react-native";
import { colors, spacing } from "../../lib/theme";

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline" | "danger";
};

export function ActionButton({
  disabled = false,
  label,
  onPress,
  variant = "primary",
}: ActionButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, styles[variant], disabled && styles.disabled]}
    >
      <Text style={[styles.text, variant === "outline" ? styles.outlineText : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 10,
    padding: spacing.sm,
  },
  primary: {
    backgroundColor: colors.brand,
  },
  outline: {
    borderColor: colors.brand,
    borderWidth: 1,
  },
  danger: {
    borderColor: colors.danger,
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.surface,
    fontWeight: "700",
  },
  outlineText: {
    color: colors.brand,
  },
});
