import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { AppText } from "@/src/components/ui";
import { theme } from "@/src/context/themes";
import Images from "@/src/assets/images";

interface AuthBrandLockupProps {
  /** Smaller mark and type for form headers. */
  compact?: boolean;
  /** Logo mark only, for narrow dialogs that already have their own title. */
  markOnly?: boolean;
}

export function AuthBrandLockup({
  compact = false,
  markOnly = false,
}: AuthBrandLockupProps) {
  return (
    <View style={[styles.container, compact ? styles.compact : null]}>
      <Image
        source={Images.logo.sctMark}
        style={[styles.mark, compact ? styles.markCompact : null]}
        resizeMode="contain"
        accessible
        accessibilityLabel="SCT logo"
      />
      {markOnly ? null : (
        <>
          <AppText
            variant="display"
            style={[styles.shortName, compact ? styles.shortNameCompact : null]}
          >
            SCT
          </AppText>
          <AppText variant="caption" style={styles.fullName}>
            Skills and Capabilities Training
          </AppText>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 2,
  },
  compact: {
    gap: 0,
  },
  mark: {
    width: 112,
    height: 116,
    marginBottom: 6,
  },
  markCompact: {
    width: 80,
    height: 84,
    marginBottom: 4,
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
    letterSpacing: 2.2,
    fontSize: 34,
    lineHeight: 40,
    fontFamily: theme.typography.family.headingSemiBold,
    textAlign: "center",
  },
  shortNameCompact: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: 1.8,
  },
});
