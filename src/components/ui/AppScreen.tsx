import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  ViewProps,
} from "react-native";
import { theme } from "@/src/context/themes";

interface AppScreenProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
}

export function AppScreen({
  children,
  scrollable = false,
  style,
  ...rest
}: AppScreenProps) {
  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, style]} {...rest}>
        {content}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
  },
  scrollContainer: {
    paddingBottom: theme.space["3xl"],
  },
});
