import React from "react";
import { StyleSheet, View } from "react-native";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import { theme } from "@/src/context/themes";

interface AuthGridBackgroundProps {
  children: React.ReactNode;
}

export function AuthGridBackground({ children }: AuthGridBackgroundProps) {
  return (
    <BackgroundGradient>
      <View style={styles.container}>
        <View pointerEvents="none" style={styles.gridOverlay}>
          {Array.from({ length: 11 }).map((_, index) => (
            <View
              key={`v-${index}`}
              style={[
                styles.verticalLine,
                { left: `${(index / 10) * 100}%` },
                index === 5 ? styles.centerLine : null,
              ]}
            />
          ))}
          {Array.from({ length: 15 }).map((_, index) => (
            <View
              key={`h-${index}`}
              style={[
                styles.horizontalLine,
                { top: `${(index / 14) * 100}%` },
                index === 7 ? styles.centerLine : null,
              ]}
            />
          ))}
        </View>
        <View pointerEvents="none" style={styles.glowOrb} />
        {children}
      </View>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45,
  },
  verticalLine: {
    position: "absolute",
    width: 1,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  horizontalLine: {
    position: "absolute",
    height: 1,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  centerLine: {
    backgroundColor: "rgba(197,179,88,0.24)",
  },
  glowOrb: {
    position: "absolute",
    top: -120,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(197,179,88,0.14)",
    shadowColor: theme.colors.vegasGold,
    shadowOpacity: 0.35,
    shadowRadius: 42,
    shadowOffset: { width: 0, height: 8 },
  },
});
