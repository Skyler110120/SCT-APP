import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { theme } from "@/src/context/themes";
import { AppText } from "./AppText";

interface DateBlockProps {
  /** ISO date-time or Date for the day to show. */
  date: string | Date;
  style?: ViewStyle;
}

/** Compact month / day / weekday block for session rows (mirrors the web DateBlock). */
export function DateBlock({ date, style }: DateBlockProps) {
  const d = typeof date === "string" ? new Date(date) : date;
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  return (
    <View
      style={[styles.block, style]}
      accessible
      accessibilityLabel={d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
    >
      <AppText style={styles.month}>{month}</AppText>
      <AppText style={styles.day}>{d.getDate()}</AppText>
      <AppText style={styles.weekday}>{weekday}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    width: 52,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSunken,
  },
  month: {
    fontFamily: theme.typography.family.bodySemiBold,
    fontSize: 11,
    lineHeight: 13,
    color: theme.colors.vegasGold,
  },
  day: {
    fontFamily: theme.typography.family.headingSemiBold,
    fontSize: 24,
    lineHeight: 28,
    color: theme.colors.textPrimary,
  },
  weekday: {
    fontFamily: theme.typography.family.bodyMedium,
    fontSize: 11,
    lineHeight: 13,
    color: theme.colors.textMuted,
  },
});
