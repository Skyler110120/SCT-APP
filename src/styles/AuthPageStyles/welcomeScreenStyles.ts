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
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: "rgba(8,8,8,0.76)",
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
  valueProps: {
    gap: theme.space.sm,
  },
  valuePropRow: {
    borderWidth: 1,
    borderColor: "rgba(197,179,88,0.3)",
    backgroundColor: "rgba(197,179,88,0.08)",
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  valuePropText: {
    letterSpacing: 0.9,
    textTransform: "uppercase",
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  actionColumn: {
    gap: theme.space.md,
    marginTop: theme.space.sm,
  },
});
