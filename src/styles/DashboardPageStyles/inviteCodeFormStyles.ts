import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const inviteCodeFormStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: themes.black,
    borderColor: themes.vegasGold,
  },
  modalTitle: {
    marginBottom: 20,
    fontSize: 28,
    fontFamily: "Chakra-Bold",
    textAlign: "center",
    color: themes.vegasGold,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 18,
    fontFamily: "Chakra-Regular",
    color: themes.vegasGold,
  },
  buttonContainer: {
    flexDirection: "column",
    gap: 10,
    marginTop: 8,
    marginBottom: "1%",
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    margin: 8,
    borderRadius: 15,
    backgroundColor: themes.vegasGold,
  },
  buttonText: {
    fontSize: width * 0.03,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
});