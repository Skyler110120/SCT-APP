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
    backgroundColor: theme.colors.backgroundSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.vegasGold,
  },
  ghost: {
    backgroundColor: "transparent",
  },
};

function buttonTextColor(variant: ButtonVariant): string {
  if (variant === "primary") return theme.colors.black;
  if (variant === "secondary") return theme.colors.textPrimary;
  return theme.colors.vegasGold;
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
          color={variant === "primary" ? theme.colors.black : theme.colors.vegasGold}
          size="small"
        />
      ) : (
        <AppText
          variant="subtitle"
          style={[styles.text, { color: buttonTextColor(variant) }]}
          numberOfLines={1}
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
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: "100%",
  },
});
