import React from "react";
import { StyleSheet, View } from "react-native";
import BackgroundGradient from "@/src/components/BackgroundGradient";

interface AuthGridBackgroundProps {
  children: React.ReactNode;
}

export function AuthGridBackground({ children }: AuthGridBackgroundProps) {
  return (
    <BackgroundGradient>
      <View style={styles.container}>{children}</View>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
