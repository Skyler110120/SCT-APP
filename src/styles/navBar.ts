import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const ICON_WIDTH = Math.max(22, Math.min(width * 0.08, 32));
const ICON_HEIGHT = ICON_WIDTH * (50 / 64);
const SELECTED_WIDTH = Math.max(72, Math.min(width * 0.22, 110));
const SELECTED_HEIGHT = Math.max(42, Math.min(height * 0.08, 64));
const NAV_TEXT_SIZE = Math.max(12, Math.min(width * 0.038, 16));

export const navBarStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: themes.vegasGold,
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  navItem: {
    paddingTop: 8,
  },
  navIcon: {
    width: ICON_WIDTH,
    height: ICON_HEIGHT,
  },
  selectedIconBackground: {
    backgroundColor: themes.black,
    borderRadius: 20,
    width: SELECTED_WIDTH,
    minHeight: SELECTED_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: NAV_TEXT_SIZE,
    fontFamily: "Chakra-Italic",
    color: themes.vegasGold,
  },
});