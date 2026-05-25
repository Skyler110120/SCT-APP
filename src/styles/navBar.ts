import { StyleSheet } from "react-native";
import { theme, themes } from "@/src/context/themes";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const ICON_SIZE = Math.max(22, Math.min(width * 0.075, 28));
const ACTIVE_MIN_WIDTH = Math.max(64, Math.min(width * 0.18, 90));
const NAV_TEXT_SIZE = Math.max(11, Math.min(width * 0.032, 13));

export const navBarStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: themes.backgroundElevated,
    borderTopWidth: 1,
    borderTopColor: themes.borderStrong,
    paddingHorizontal: 6,
    paddingTop: 8,
    gap: 6,
  },
  navItem: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  navItemActive: {
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  navIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  selectedIconBackground: {
    backgroundColor: "rgba(197, 179, 88, 0.26)",
    borderColor: themes.borderStrong,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    minWidth: ACTIVE_MIN_WIDTH,
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  navText: {
    fontSize: NAV_TEXT_SIZE,
    fontFamily: "Oswald_600SemiBold",
    color: "#F4E7AC",
    letterSpacing: 0.3,
  },
});