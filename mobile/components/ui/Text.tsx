import { Text as NativeText, type TextProps, type TextStyle } from "react-native";
import { colors, fonts } from "../../lib/theme";

export type TextVariant =
  | "display"
  | "title"
  | "heading"
  | "subheading"
  | "body"
  | "bodySmall"
  | "caption"
  | "overline"
  | "label";

const variants: Record<TextVariant, TextStyle> = {
  display: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: colors.ink },
  title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.4, color: colors.ink },
  heading: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, color: colors.heading },
  subheading: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21, color: colors.heading },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.text },
  bodySmall: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.text },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: colors.muted },
  overline: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: colors.muted,
  },
  label: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.heading },
};

const weights = {
  regular: fonts.regular,
  medium: fonts.medium,
  semibold: fonts.semibold,
  bold: fonts.bold,
} as const;

type Props = TextProps & {
  variant?: TextVariant;
  color?: string;
  weight?: keyof typeof weights;
  align?: TextStyle["textAlign"];
};

/** App text with the Inter font. Android ignores fontWeight for custom fonts, so weights map to families. */
export function Text({ variant = "body", color, weight, align, style, ...props }: Props) {
  return (
    <NativeText
      {...props}
      style={[
        variants[variant],
        color ? { color } : null,
        weight ? { fontFamily: weights[weight] } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}
