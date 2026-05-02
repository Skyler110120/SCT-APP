import React from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { theme } from "@/src/context/themes";
import { AppText } from "./AppText";

interface AppInputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  errorText?: string;
}

export function AppInput({
  label,
  helperText,
  errorText,
  style,
  ...rest
}: AppInputProps) {
  return (
    <View style={styles.container}>
      {label ? (
        <AppText variant="caption" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <TextInput
        style={[styles.input, errorText ? styles.inputError : null, style]}
        placeholderTextColor={theme.colors.textMuted}
        {...rest}
      />
      {errorText ? (
        <AppText variant="caption" color={theme.colors.danger}>
          {errorText}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption">{helperText}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: theme.space.sm,
  },
  label: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: theme.colors.vegasGold,
  },
  input: {
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.backgroundElevated,
    paddingHorizontal: theme.space.lg,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.family.bodyRegular,
    fontSize: theme.typography.size.md,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
});
