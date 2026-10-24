import { theme } from "@/src/context/themes";
import { StyleSheet } from "react-native";

export const welcomeScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 540,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgroundElevated,
    paddingVertical: theme.space["2xl"],
    paddingHorizontal: theme.space.xl,
    gap: theme.space.lg,
  },
  headline: {
    textAlign: "center",
    color: theme.colors.textPrimary,
  },
  subtitle: {
    textAlign: "center",
    color: theme.colors.textSecondary,
    marginTop: -4,
  },
  actionColumn: {
    gap: theme.space.md,
    marginTop: theme.space.sm,
  },
});
