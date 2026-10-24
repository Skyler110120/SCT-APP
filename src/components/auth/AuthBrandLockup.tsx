import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/src/components/ui";
import { theme } from "@/src/context/themes";

interface AuthBrandLockupProps {
  compact?: boolean;
}

export function AuthBrandLockup({ compact = false }: AuthBrandLockupProps) {
  return (
    <View style={[styles.container, compact ? styles.compact : null]}>
      <AppText variant="caption" style={styles.fullName}>
        Skills and Capabilities Training
      </AppText>
      <AppText variant="display" style={[styles.shortName, compact ? styles.shortNameCompact : null]}>
        SCT
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 6,
  },
  compact: {
    gap: 2,
  },
  fullName: {
    color: theme.colors.vegasGold,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: theme.typography.family.bodySemiBold,
    textAlign: "center",
  },
  shortName: {
    color: theme.colors.textPrimary,
    letterSpacing: 1.5,
    fontSize: 40,
    lineHeight: 48,
    fontFamily: theme.typography.family.headingSemiBold,
    textAlign: "center",
  },
  shortNameCompact: {
    fontSize: 32,
    lineHeight: 38,
  },
});
