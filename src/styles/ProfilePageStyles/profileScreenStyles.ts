import { Dimensions, StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

const { width: windowWidth } = Dimensions.get("window");

const isNarrow = windowWidth < 400;
const horizontalPadding = 20;
const contentWidth = windowWidth - horizontalPadding * 2;

export const profileScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    maxWidth: "100%",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
    maxWidth: "100%",
  },
  profileContentContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly",
    gap: 30,
    paddingHorizontal: horizontalPadding,
    width: "100%",
    maxWidth: contentWidth,
    alignSelf: "center",
  },
  profileName: {
    fontSize: isNarrow ? 26 : 64,
    fontFamily: "Chakra-BoldItalic",
    color: themes.vegasGold,
    textAlign: "center",
    borderWidth: 1,
    padding: 10,
    paddingHorizontal: 16,
    maxWidth: "100%",
  },
  profilePictureContainer: {
    width: Math.min(300, contentWidth - 40),
    height: Math.min(300, contentWidth - 40),
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 150,
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  profileBioContainer: {
    flexDirection: "column",
    justifyContent: "flex-start",
    width: "100%",
    maxWidth: Math.min(700, contentWidth),
    alignSelf: "center",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  profileBioText: {
    fontSize: isNarrow ? 16 : 24,
    fontFamily: "Chakra-Italic",
    color: themes.white,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
    paddingTop: 10,
    borderBottomColor: themes.vegasGold,
    borderBottomWidth: 1,
    flexWrap: "wrap",
  },
  profileBioTextBottom: {
    fontSize: isNarrow ? 16 : 24,
    fontFamily: "Chakra-Italic",
    color: themes.white,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
    paddingTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    justifyContent: "center",
    width: "100%",
    maxWidth: contentWidth,
  },
  button: {
    padding: 10,
    borderRadius: 30,
    minWidth: Math.min(300, (contentWidth - 20) / 2),
    width: isNarrow ? "100%" : Math.min(300, (contentWidth - 20) / 2),
    height: 100,
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: themes.vegasGold,
  },
  buttonText: {
    fontSize: isNarrow ? 18 : 24,
    fontFamily: "Chakra-BoldItalic",
    color: themes.white,
  },
});
