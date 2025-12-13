import { themes } from "@/src/context/themes";
import { StyleSheet } from "react-native";

export const eventModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0,7)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: themes.black,
    borderColor: themes.vegasGold,
  },
  modalTitle: {
    marginBottom: 20,
    fontSize: 28,
    fontFamily: "Chakra-BoldItalic",
    textAlign: "center",
    color: themes.vegasGold,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "Chakra-Regular",
    textAlign: "center",
    color: themes.white,
  },
  modalTextInputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  modalTextInput: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
    fontSize: 24,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  errorText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
    fontFamily: "Chakra-Bold",
    color: "#FF4444",
  },
  modalErrorInput: {
    color: "#FF4444",
    borderWidth: 1
  }
});
