import { Platform } from "react-native";

const typography = {
  family: {
    bodyRegular: "Inter_400Regular",
    bodyMedium: "Inter_500Medium",
    bodySemiBold: "Inter_600SemiBold",
    bodyBold: "Inter_700Bold",
    headingRegular: "Oswald_400Regular",
    headingMedium: "Oswald_500Medium",
    headingSemiBold: "Oswald_600SemiBold",
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    "2xl": 28,
  },
  lineHeight: {
    compact: 18,
    body: 22,
    relaxed: 26,
  },
} as const;

const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
} as const;

const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

const colors = {
  black: "#040507",
  white: "#FFFFFF",
  vegasGold: "#C5B358",
  vegasGoldHover: "#D4C467",
  background: "#090A0C",
  backgroundElevated: "#111317",
  backgroundSoft: "#171A1F",
  border: "rgba(197,179,88,0.32)",
  borderStrong: "rgba(197,179,88,0.56)",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.78)",
  textMuted: "rgba(255,255,255,0.58)",
  success: "#4ADE80",
  warning: "#FBBF24",
  danger: "#F87171",
  overlay: "rgba(2,3,5,0.78)",
  gradientTop: "#050608",
  gradientBottom: "#1A1F2A",
} as const;

const elevation = {
  card:
    Platform.OS === "android"
      ? ({
          elevation: 4,
        } as const)
      : ({
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.24,
          shadowRadius: 18,
        } as const),
} as const;

export const theme = {
  colors,
  space,
  radius,
  typography,
  elevation,
} as const;

// Backwards-compatible alias while screens migrate to theme.* tokens.
export const themes = {
  ...colors,
  fonts: typography.family,
};