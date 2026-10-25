import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { theme } from "@/src/context/themes";
import { AppText } from "./AppText";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface AppButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { minHeight: 40, paddingHorizontal: 14 },
  md: { minHeight: 48, paddingHorizontal: 18 },
  lg: { minHeight: 54, paddingHorizontal: 22 },
};

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: theme.colors.vegasGold,
    borderWidth: 1,
    borderColor: theme.colors.vegasGold,
  },
  secondary: {
    backgroundColor: theme.colors.surface3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  ghost: {
    backgroundColor: "transparent",
  },
};

function buttonTextColor(variant: ButtonVariant): string {
  if (variant === "primary") return theme.colors.accentForeground;
  if (variant === "ghost") return theme.colors.vegasGold;
  return theme.colors.textPrimary;
}

export function AppButton({
  label,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: AppButtonProps) {
  return (
    <Pressable
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth ? styles.fullWidth : null,
        pressed ? styles.pressed : null,
        disabled || isLoading ? styles.disabled : null,
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "primary" ? theme.colors.accentForeground : theme.colors.vegasGold}
          size="small"
        />
      ) : (
        <AppText
          variant="bodyStrong"
          style={[styles.text, { color: buttonTextColor(variant) }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  text: {
    fontFamily: theme.typography.family.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: "100%",
  },
});
