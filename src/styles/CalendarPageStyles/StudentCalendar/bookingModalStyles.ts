import { themes } from "@/src/context/themes";
import { StyleSheet } from "react-native";

export const bookingModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "90%",
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: themes.backgroundElevated,
    borderColor: themes.border,
  },
  modalTitle: {
    marginBottom: 16,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: "ArchivoNarrow_600SemiBold",
    textAlign: "center",
    color: themes.textPrimary,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "Archivo_400Regular",
    textAlign: "center",
    color: themes.white,
  },
  sessionCard: {
    flexDirection: "row",
    borderRadius: 15,
    padding: 16,  
    marginBottom: 16,
    borderWidth: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: themes.backgroundSoft,
    borderColor: themes.border,
  },
  sessionCardSelected: {
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: "rgba(197,179,88,0.12)",
  },
  sessionText: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Archivo_400Regular",
    color: themes.white
  },
  selectionIndicator: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: themes.vegasGold,
  },
  selectionIndicatorText: {
    fontSize: 13,
    fontFamily: "ArchivoNarrow_700Bold",
    color: themes.black,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: themes.vegasGold,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: "ArchivoNarrow_700Bold",
    color: themes.white,
  },
});
