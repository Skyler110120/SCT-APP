import { Platform } from "react-native";

/**
 * Design tokens, kept in step with the web app (sct-web-app/src/styles/global.css).
 *
 * Direction: range-day equipment. Warm gunmetal surfaces (olive-leaning, not cool
 * grey), bone text, and brass gold reserved for actions, selection and progress.
 * Archivo for reading text; Archivo Narrow stands in for the web's condensed
 * Archivo headings, since React Native cannot drive the variable width axis.
 */
const typography = {
  family: {
    bodyRegular: "Archivo_400Regular",
    bodyMedium: "Archivo_500Medium",
    bodySemiBold: "Archivo_600SemiBold",
    bodyBold: "Archivo_700Bold",
    headingRegular: "ArchivoNarrow_500Medium",
    headingMedium: "ArchivoNarrow_600SemiBold",
    headingSemiBold: "ArchivoNarrow_700Bold",
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    "2xl": 30,
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

/** Containers get more radius, controls less, chips least (matches web). */
const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

const colors = {
  black: "#0B0C09",
  white: "#FFFFFF",
  vegasGold: "#C5B358",
  vegasGoldHover: "#D4C36A",
  goldDeep: "#8F8240",
  /** Text and icons placed on a gold fill. */
  accentForeground: "#17150A",
  goldLight: "rgba(197,179,88,0.1)",
  goldMedium: "rgba(197,179,88,0.2)",

  /* Surfaces, darkest to lightest (warm gunmetal) */
  background: "#0E0F0C",
  surfaceSunken: "#0B0C09",
  backgroundElevated: "#161712",
  backgroundSoft: "#1D1E18",
  surface3: "#26271F",

  borderSubtle: "rgba(237,235,227,0.06)",
  border: "rgba(237,235,227,0.1)",
  borderStrong: "rgba(237,235,227,0.18)",
  borderAccent: "rgba(197,179,88,0.45)",

  textPrimary: "#EDEBE3",
  textSecondary: "#A8A69A",
  textMuted: "#77766B",

  /* Status colors, muted to sit next to brass rather than compete with it */
  success: "#86BC7E",
  successBg: "rgba(134,188,126,0.12)",
  warning: "#E2A94E",
  warningBg: "rgba(226,169,78,0.12)",
  danger: "#E8735F",
  dangerBg: "rgba(232,115,95,0.12)",
  info: "#86A9CC",
  infoBg: "rgba(134,169,204,0.12)",

  overlay: "rgba(5,6,4,0.82)",
  gradientTop: "#0E0F0C",
  gradientBottom: "#0E0F0C",
} as const;

const elevation = {
  card:
    Platform.OS === "android"
      ? ({
          elevation: 4,
        } as const)
      : ({
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
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
