import React from "react";
import { StyleSheet, Text, TextProps, TextStyle } from "react-native";
import { theme } from "@/src/context/themes";

type TextVariant =
  | "display"
  | "title"
  | "subtitle"
  | "body"
  | "bodyStrong"
  | "caption";

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
}

const variantStyles: Record<TextVariant, TextStyle> = {
  display: {
    fontFamily: theme.typography.family.headingSemiBold,
    fontSize: theme.typography.size["2xl"],
    lineHeight: 34,
    color: theme.colors.textPrimary,
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: theme.typography.family.headingMedium,
    fontSize: theme.typography.size.xl,
    lineHeight: 28,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontFamily: theme.typography.family.bodySemiBold,
    fontSize: theme.typography.size.lg,
    lineHeight: 24,
    color: theme.colors.textPrimary,
  },
  body: {
    fontFamily: theme.typography.family.bodyRegular,
    fontSize: theme.typography.size.md,
    lineHeight: theme.typography.lineHeight.body,
    color: theme.colors.textSecondary,
  },
  bodyStrong: {
    fontFamily: theme.typography.family.bodySemiBold,
    fontSize: theme.typography.size.md,
    lineHeight: theme.typography.lineHeight.body,
    color: theme.colors.textPrimary,
  },
  caption: {
    fontFamily: theme.typography.family.bodyMedium,
    fontSize: theme.typography.size.sm,
    lineHeight: 18,
    color: theme.colors.textMuted,
  },
};

export function AppText({
  variant = "body",
  color,
  style,
  children,
  ...rest
}: AppTextProps) {
  return (
    <Text
      style={[styles.base, variantStyles[variant], color ? { color } : null, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: theme.colors.textPrimary,
  },
});
