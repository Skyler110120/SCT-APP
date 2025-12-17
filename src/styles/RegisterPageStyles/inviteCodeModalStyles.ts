import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const inviteCodeModalStyles = StyleSheet. create({
  modalOverlay:  {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor:  themes.black,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: themes. vegasGold,
  },
  modalTitle: {
    marginBottom: 20,
    fontSize: 28,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  labelText: {
    marginBottom: 12,
    fontSize: 18,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  textInput: {
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 1,
    borderColor: themes.vegasGold,
    borderRadius: 10,
    color: themes.white,
    fontFamily: "Chakra-Regular",
    fontSize: 16
  },
  submitButton: {
    padding: 12,
    marginTop: 10,
    alignItems: "center",
    backgroundColor: themes.vegasGold,
    borderRadius: 15
  },
  disabledButton: {
    opacity: 0.6
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  errorText:  {
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: "#FF4444",
    textAlign: "center",
    marginVertical: 10,
  },
});