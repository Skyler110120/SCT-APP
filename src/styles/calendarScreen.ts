import { themes } from "@/src/context/themes";
import { StyleSheet } from "react-native";

export const calendarScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  calendarContainer: {
    borderRadius: 20,
    overflow: "hidden",
    margin: 16,
    borderWidth: 2,
    borderColor: themes.white,
  },
  scheduleContainer: {
    flex: 1,
    backgroundColor: themes.vegasGold
  },
});
