import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const navBarStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",
    backgroundColor: themes.backgroundElevated,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: themes.borderStrong,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  navItem: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 2,
  },
  navIcon: {
    width: 22,
    height: 22,
  },
  navText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Inter_500Medium",
    color: themes.textMuted,
  },
  navTextActive: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Inter_600SemiBold",
    color: themes.vegasGold,
  },
});
