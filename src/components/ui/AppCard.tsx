import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { theme } from "@/src/context/themes";

type CardVariant = "default" | "outlined" | "elevated";

interface AppCardProps extends ViewProps {
  variant?: CardVariant;
}

export function AppCard({ variant = "default", style, ...rest }: AppCardProps) {
  return <View style={[styles.base, styles[variant], style]} {...rest} />;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.lg,
    padding: theme.space.lg,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  default: {},
  outlined: {
    backgroundColor: "transparent",
    borderColor: theme.colors.borderStrong,
  },
  elevated: {
    ...theme.elevation.card,
  },
});
