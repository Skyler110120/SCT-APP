import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const ICON_WIDTH = width * .1;
const ICON_HEIGHT = ICON_WIDTH * (50/64);

export const navBarStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: themes.vegasGold,
    padding: 10,
  },
  navItem: {
    paddingTop: 15,
  },
  navIcon: {
    width: ICON_WIDTH,
    height: ICON_HEIGHT,
  },
  selectedIconBackground: {
    backgroundColor: themes.black,
    borderRadius: 20,
    width: width * .25,
    height: height * .10,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: width * .045,
    fontFamily: "Chakra-Italic",
    color: themes.vegasGold,
  },
});