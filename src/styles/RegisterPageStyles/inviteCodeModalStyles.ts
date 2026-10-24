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
    backgroundColor: themes.backgroundElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themes.border,
  },
  modalTitle: {
    marginBottom: 16,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: "Oswald_500Medium",
    color: themes.textPrimary,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  labelText: {
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
    color: themes.textSecondary,
  },
  textInput: {
    padding: 12,
    backgroundColor: themes.backgroundSoft,
    borderWidth: 1,
    borderColor: themes.borderStrong,
    borderRadius: 12,
    color: themes.white,
    fontFamily: "Inter_400Regular",
    fontSize: 16
  },
  submitButton: {
    padding: 12,
    marginTop: 10,
    alignItems: "center",
    backgroundColor: themes.vegasGold,
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.6
  },
  buttonText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_600SemiBold",
    color: themes.black,
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