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
    justifyContent: "flex-start",
    gap: 18,
    paddingHorizontal: horizontalPadding,
    width: "100%",
    maxWidth: contentWidth,
    alignSelf: "center",
  },
  profileName: {
    fontSize: isNarrow ? 26 : 32,
    lineHeight: isNarrow ? 32 : 38,
    fontFamily: "Oswald_500Medium",
    color: themes.textPrimary,
    textAlign: "center",
    maxWidth: "100%",
    marginTop: 8,
  },
  profilePictureContainer: {
    width: 112,
    height: 112,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 56,
    borderWidth: 0,
    backgroundColor: themes.backgroundSoft,
  },
  avatarInitial: {
    fontSize: 36,
    lineHeight: 42,
    fontFamily: "Oswald_500Medium",
    color: themes.vegasGold,
    textAlign: "center",
  },
  profileBioContainer: {
    flexDirection: "column",
    justifyContent: "flex-start",
    width: "100%",
    maxWidth: Math.min(700, contentWidth),
    alignSelf: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themes.borderStrong,
    backgroundColor: themes.backgroundElevated,
  },
  profileBioText: {
    fontSize: isNarrow ? 15 : 18,
    fontFamily: "Inter_400Regular",
    color: themes.textPrimary,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
    paddingTop: 10,
    borderBottomColor: themes.border,
    borderBottomWidth: 1,
    flexWrap: "wrap",
  },
  profileBioTextBottom: {
    fontSize: isNarrow ? 15 : 18,
    fontFamily: "Inter_400Regular",
    color: themes.textSecondary,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
    paddingTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    width: "100%",
    maxWidth: contentWidth,
  },
  button: {
    padding: 10,
    borderRadius: 12,
    minWidth: Math.min(300, (contentWidth - 20) / 2),
    width: isNarrow ? "100%" : Math.min(300, (contentWidth - 20) / 2),
    minHeight: 52,
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: themes.vegasGold,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: themes.borderStrong,
  },
  secondaryButtonText: {
    color: themes.textPrimary,
  },
  buttonText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_600SemiBold",
    color: themes.black,
  },
});
