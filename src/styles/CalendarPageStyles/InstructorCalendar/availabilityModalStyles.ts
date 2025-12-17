import { themes } from "@/src/context/themes";
import { StyleSheet } from "react-native";

export const availabilityModalStyles = StyleSheet.create({
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
  modalUpdateContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  modalDayButton: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
  },
  modalDayText: {
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  modalDayButtonSelected: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: themes.vegasGold
  },
  modalDayTextSelected: {
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.black,
  },
  modalCreateContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
    fontFamily: "Chakra-Bold",
    color: "#FF4444",
  },
});
