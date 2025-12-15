import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const editProfileModalStyles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  editModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  editModalContent: {
    width: "90%",
    maxHeight: "80%",
    padding: 20,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: themes.black,
    borderColor: themes.vegasGold,
  },
  editModalTitle: {
    marginBottom: 20,
    fontSize: 28,
    fontFamily: "Chakra-BoldItalic",
    textAlign: "center",
    color: themes.vegasGold,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 20,
    fontFamily: "Chakra-Regular",
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
    color: themes.white,
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: themes.vegasGold,
  },
  inputError: {
    borderWidth:  2,
    borderColor:  "#FF4444",
  },
  errorText: {
    marginTop: 8,
    textAlign: "left",
    fontSize: 16,
    fontFamily: "Chakra-Bold",
    color: "#FF4444",
  },
  datePickerText: {
    fontSize: 20,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  editModalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: themes.vegasGold,
    minHeight: 48,
  },
  editModalButtonText: {
    fontSize: 20,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
});