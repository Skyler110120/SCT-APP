import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const adminUserActionModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "80%",
    alignSelf: "center",
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 28,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  modalUserInfo: {
    marginBottom: 20,
  },
  modalUserName: {
    marginBottom: 4,
    fontSize: 24,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  modalUserEmail: {
    marginBottom:  16,
    fontSize: 20,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    opacity: 0.8,
  },
  confirmationText: {
    marginBottom: 8,
    fontSize: 20,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  warningText: {
    marginBottom: 8,
    fontSize: 20,
    fontFamily: "Chakra-Regular",
    color: "#FF4444",
  },
  currentRole: {
    marginBottom:  12,
    fontSize: 20,
    fontFamily: "Chakra-Regular",
    color:  themes.white,
  },
  roleLabel: {
    marginBottom: 8,
    fontSize: 20,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  modalPickerContainer: {
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  modalPicker: {
    color: themes.white,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: themes.vegasGold,
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    marginLeft: 12,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: themes.vegasGold,
  },
  removalButton: {
    flex:  1,
    padding: 12,
    marginLeft: 8,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor:  themes.vegasGold,
  },
  buttonText: {
    fontSize: 24,
    fontFamily: "Chakra-BoldItalic",
    color: themes.white,
  },
});