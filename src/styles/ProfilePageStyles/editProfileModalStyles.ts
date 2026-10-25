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
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: themes.backgroundElevated,
    borderColor: themes.border,
  },
  editModalTitle: {
    marginBottom: 16,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: "ArchivoNarrow_600SemiBold",
    textAlign: "center",
    color: themes.textPrimary,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Archivo_500Medium",
    color: themes.textSecondary,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 16,
    fontFamily: "Archivo_400Regular",
    borderColor: themes.borderStrong,
    backgroundColor: themes.backgroundSoft,
    color: themes.white,
  },
  inputFocused: {
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  inputError: {
    borderWidth:  2,
    borderColor:  "#E8735F",
  },
  errorText: {
    marginTop: 8,
    textAlign: "left",
    fontSize: 16,
    fontFamily: "ArchivoNarrow_700Bold",
    color: "#E8735F",
  },
  datePickerText: {
    fontSize: 20,
    fontFamily: "Archivo_400Regular",
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
    fontFamily: "ArchivoNarrow_700Bold",
    color: themes.white,
  },
});