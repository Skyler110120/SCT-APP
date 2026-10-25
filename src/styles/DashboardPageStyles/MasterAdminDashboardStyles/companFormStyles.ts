import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const companyFormStyles = StyleSheet.create({
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
    backgroundColor:  themes.black,
    borderColor: themes.border,
  },
  modalTitle: {
    marginBottom: 20,
    fontSize: 28,
    fontFamily: "ArchivoNarrow_700Bold",
    textAlign: "center",
    color: themes.textPrimary,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 18,
    fontFamily: "Archivo_400Regular",
    color: themes.textSecondary,
  },
  textInput: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: themes.black,
    borderColor: themes.border,
    fontSize: 16,
    fontFamily: "Archivo_400Regular",
    color: themes.white,
  },
  errorText: {
    marginTop: 4,
    fontFamily: "Archivo_400Regular",
    color: "#E8735F",
  },
  buttonContainer: {
    flexDirection:  "row",
    justifyContent: "space-between",
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
    fontFamily: "ArchivoNarrow_700Bold",
    color: themes.white,
  },
});