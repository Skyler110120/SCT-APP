import { themes } from "@/src/context/themes";
import { StyleSheet } from "react-native";

export const loginScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  backButtonContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
  },
  loginScreenContentContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    gap: 56,
  },
  image: {
    width: 300,
    height: 300,
  },
  keyboardView: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  textInputBox: {
    height: 90,
    width: "75%",
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
    color: themes.vegasGold,
    fontSize: 36,
    fontFamily: "Chakra-Italic",
  },
  logInButton: {
    height: 80,
    width: "60%",
    backgroundColor: themes.vegasGold,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  logInButtonText: {
    fontFamily: "Chakra-semiBoldItalic",
    fontSize: 32,
    color: themes.white,
  },
  forgotPasswordText: {
    fontFamily: "Chakra-semiBoldItalic",
    fontSize: 32,
    color: themes.vegasGold,
    textDecorationLine: "underline",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
  },
  orText: {
    fontFamily: "Chakra-semiBoldItalic",
    fontSize: 36,
    color: themes.white,
  },
  horizontalLine: {
    flex: 1,
    borderBottomColor: themes.vegasGold,
    borderBottomWidth: 2,
  },
});
