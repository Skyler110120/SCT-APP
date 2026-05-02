import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { theme } from "@/src/context/themes";
import { AppText } from "./AppText";

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.vegasGold} />
      {label ? (
        <AppText variant="body" style={styles.label}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.space.lg,
  },
  label: {
    marginTop: theme.space.lg,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
