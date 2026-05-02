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
    letterSpacing: 2,
    fontSize: 56,
    lineHeight: 58,
    fontFamily: theme.typography.family.headingSemiBold,
    textAlign: "center",
    textShadowColor: "rgba(197,179,88,0.24)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 14,
  },
  shortNameCompact: {
    fontSize: 44,
    lineHeight: 46,
  },
});
