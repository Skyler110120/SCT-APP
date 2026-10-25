import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { theme } from "@/src/context/themes";

interface WeekTrackProps {
  /** Total weeks in the program. */
  totalWeeks: number;
  /** The week the student is currently in (1-based). */
  currentWeek: number;
  /** Group ticks into program months of this many weeks. */
  weeksPerGroup?: number;
  style?: ViewStyle;
}

/**
 * Segmented program track (mirrors the web WeekTrack): one tick per week, grouped
 * by program month. Completed weeks are solid brass, the current week is outlined,
 * upcoming weeks are dim.
 */
export function WeekTrack({ totalWeeks, currentWeek, weeksPerGroup = 4, style }: WeekTrackProps) {
  const total = Math.max(1, Math.min(totalWeeks, 104));
  const current = Math.max(1, Math.min(currentWeek, total));
  const groups: number[][] = [];
  for (let w = 1; w <= total; w += 1) {
    const g = Math.floor((w - 1) / weeksPerGroup);
    (groups[g] ||= []).push(w);
  }

  return (
    <View
      style={[styles.track, style]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Week ${current} of ${total}`}
      accessibilityValue={{ min: 1, max: total, now: current }}
    >
      {groups.map((weeks, gi) => (
        <View key={gi} style={styles.group}>
          {weeks.map((w) => (
            <View
              key={w}
              style={[
                styles.tick,
                w < current ? styles.done : w === current ? styles.current : styles.ahead,
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    gap: 5,
  },
  group: {
    flex: 1,
    flexDirection: "row",
    gap: 2,
  },
  tick: {
    flex: 1,
    height: 16,
    borderRadius: 2,
  },
  done: {
    backgroundColor: theme.colors.vegasGold,
  },
  current: {
    backgroundColor: theme.colors.goldMedium,
    borderWidth: 1.5,
    borderColor: theme.colors.vegasGold,
  },
  ahead: {
    backgroundColor: theme.colors.surface3,
  },
});
