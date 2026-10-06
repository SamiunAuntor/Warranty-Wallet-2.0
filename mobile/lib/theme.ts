/** Design tokens taken from the web app so both clients look like one product. */
export const colors = {
  primary: "#4b41e1",
  primaryPressed: "#4438e6",
  primaryBright: "#5b47ee",
  primarySoft: "#eeecff",
  primaryTint: "#eff1ff",
  primaryBorder: "#dcd8ff",

  ink: "#0b1c30",
  heading: "#172033",
  text: "#394254",
  muted: "#686d77",
  subtle: "#8a909b",

  canvas: "#f8f9ff",
  surface: "#ffffff",
  surfaceMuted: "#f1f3fb",
  border: "#dfe2ea",
  borderStrong: "#c9ccd5",

  danger: "#ba1a1a",
  dangerSoft: "#fdeced",
  success: "#28724d",
  successSoft: "#e8f7ef",
  warning: "#9a5a00",
  warningSoft: "#fff4df",
  neutral: "#656b76",
  neutralSoft: "#f0f1f4",

  overlay: "rgba(17, 24, 39, 0.45)",
  white: "#ffffff",
} as const;

export const spacing = { xxs: 4, xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 } as const;

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export const shadow = {
  card: {
    shadowColor: "#0b1c30",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  raised: {
    shadowColor: "#0b1c30",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

export type Tone = "primary" | "success" | "warning" | "danger" | "neutral";

export const toneColors: Record<Tone, { background: string; foreground: string }> = {
  primary: { background: colors.primarySoft, foreground: colors.primary },
  success: { background: colors.successSoft, foreground: colors.success },
  warning: { background: colors.warningSoft, foreground: colors.warning },
  danger: { background: colors.dangerSoft, foreground: "#a23843" },
  neutral: { background: colors.neutralSoft, foreground: colors.neutral },
};

export const planColors = {
  BASIC: { background: "#f1f5f9", foreground: "#334155", border: "#cbd5e1" },
  PLUS: { background: "#f3f0ff", foreground: "#5b47ee", border: "#c4b5fd" },
  PRO: { background: "#fff8df", foreground: "#986600", border: "#f4cf78" },
} as const;
