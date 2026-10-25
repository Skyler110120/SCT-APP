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
    width: "88%",
    maxWidth: 420,
    padding: 22,
    backgroundColor: themes.backgroundElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themes.border,
  },
  brandSlot: {
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    marginBottom: 16,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: "ArchivoNarrow_600SemiBold",
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
    fontFamily: "Archivo_400Regular",
    color: themes.textSecondary,
  },
  textInput: {
    minHeight: 48,
    paddingHorizontal: 14,
    backgroundColor: themes.surfaceSunken,
    borderWidth: 1,
    borderColor: themes.border,
    borderRadius: 8,
    color: themes.textPrimary,
    fontFamily: "Archivo_400Regular",
    fontSize: 16
  },
  submitButton: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: themes.vegasGold,
    borderRadius: 8,
  },
  cancelButton: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: themes.borderStrong,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Archivo_600SemiBold",
    color: themes.textPrimary,
  },
  disabledButton: {
    opacity: 0.6
  },
  buttonText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Archivo_600SemiBold",
    color: themes.accentForeground,
  },
  buttonContainer: {
    gap: 10,
    marginTop: 8,
  },
  errorText:  {
    fontSize: 16,
    fontFamily: "Archivo_400Regular",
    color: "#E8735F",
    textAlign: "center",
    marginVertical: 10,
  },
});