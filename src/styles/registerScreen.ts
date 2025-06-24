import { themes } from "@/src/context/themes";
import { StyleSheet } from "react-native";

export const registerScreenStyles = StyleSheet.create({
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
  registerScreenContentContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    gap: 50,
  },
  image: {
    width: 300,
    height: 300,
  },
  nameInputBoxContainer: {
    flexDirection: "row",
    gap: 50,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  nameInputBox: {
    width: "33%",
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
    color: themes.vegasGold,
    fontSize: 36,
    fontFamily: "Chakra-Italic",
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
  signUpButton: {
    height: 80,
    width: "60%",
    backgroundColor: themes.vegasGold,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  signUpButtonText: {
    fontFamily: "Chakra-semiBoldItalic",
    fontSize: 32,
    color: themes.white,
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
