import { theme } from "@/src/context/themes";
import { StyleSheet } from "react-native";

export const welcomeScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: theme.space["2xl"],
    paddingTop: theme.space.lg,
    paddingBottom: theme.space["3xl"],
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandMark: {
    width: 34,
    height: 36,
  },
  brandName: {
    fontFamily: theme.typography.family.headingSemiBold,
    fontSize: 19,
    lineHeight: 21,
    letterSpacing: 1.5,
    color: theme.colors.textPrimary,
  },
  brandSub: {
    fontFamily: theme.typography.family.bodyMedium,
    fontSize: 12,
    lineHeight: 15,
    color: theme.colors.textSecondary,
  },
  hero: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: theme.space["3xl"],
  },
  headline: {
    fontFamily: theme.typography.family.headingSemiBold,
    fontSize: 46,
    // Roomy enough that Android's font padding never clips the condensed caps.
    lineHeight: 50,
    letterSpacing: -0.8,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    marginTop: theme.space.lg,
    fontSize: 17,
    lineHeight: 25,
    color: theme.colors.textSecondary,
  },
  track: {
    marginTop: theme.space["2xl"],
  },
  trackCaption: {
    marginTop: theme.space.sm,
    fontFamily: theme.typography.family.bodyRegular,
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.textMuted,
  },
  block: {
    gap: theme.space.sm,
    paddingVertical: theme.space.lg,
  },
  blockDivided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borderStrong,
  },
  blockTitle: {
    fontFamily: theme.typography.family.headingSemiBold,
    fontSize: 21,
    lineHeight: 25,
    color: theme.colors.textPrimary,
  },
  blockText: {
    fontFamily: theme.typography.family.bodyRegular,
    fontSize: 15,
    lineHeight: 21,
    color: theme.colors.textSecondary,
    marginBottom: theme.space.xs,
  },
});
