import { themes } from "@/src/context/themes";
import { StyleSheet } from "react-native";

export const bookingModalStyles = StyleSheet.create({
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
  sessionCard: {
    flexDirection: "row",
    borderRadius: 15,
    padding: 16,  
    marginBottom: 16,
    borderWidth: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: themes.black,
    borderColor: themes.vegasGold,
  },
  sessionCardSelected: {
    borderWidth: 2,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
  },
  sessionText: {
    fontSize: 28,
    fontFamily: "Chakra-Regular",
    color: themes.white
  },
  selectionIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: themes.vegasGold,
  },
  selectionIndicatorText: {
    fontSize: 20,
    fontFamily: "Chakra-Bold",
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
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
});
