import { themes } from "@/src/context/themes";
import { StyleSheet } from "react-native";

export const registerScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  backButtonContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  registerScreenContentContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    gap: 35,
    paddingHorizontal: 20,
    minHeight: "100%"
  },
  image: {
    width: "40%",
    height: "22%",
  },
  welcomeContainer: {
    marginVertical: 20,
    marginHorizontal: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  welcomeText: {
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
    fontSize: 32,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  welcomeSubtext: {
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  nameInputBoxContainer:  {
    flexDirection: "row",
    gap: 50,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  nameInputBox: {
    width:  "33%",
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: themes. vegasGold,
    backgroundColor: themes.black,
    color: themes.vegasGold,
    fontSize: 30,
    fontFamily: "Chakra-Italic",
  },
  textInputBox: {
    width: "75%",
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
    color: themes.vegasGold,
    fontSize:  30,
    fontFamily:  "Chakra-Italic",
  },
  signUpButton: {
    width: "60%",
    backgroundColor: themes.vegasGold,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  signUpButtonText:  {
    fontFamily: "Chakra-semiBoldItalic",
    fontSize: 32,
    color: themes.white,
  },
});