import { themes } from "@/src/context/themes";
import { Modal, StyleSheet } from "react-native";

export const calendarScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  calendarContainer: {
    borderRadius: 20,
    overflow: "hidden",
    margin: 16,
    borderWidth: 2,
    borderColor: themes.white,
  },
  scheduleContainer: {
    flex: 1,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    marginTop: 70,
    paddingRight: 16,
    paddingLeft: 16,
    backgroundColor: themes.vegasGold,
  },
  scheduleText: {
    fontSize: 48,
    fontFamily: "Chakra-Italic",
    marginBottom: 16,
    textAlign: 'center',
    color: themes.white,
  },
  sessionCard: {
    flexDirection: "row",
    borderRadius: 15,
    padding: 16,  
    marginBottom: 12,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: themes.black,
  },
  sessionText: {
    fontSize: 28,
    fontFamily: "Chakra-Regular",
    textAlign: "center",
    color: themes.white
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: themes.vegasGold,
  },
  buttonText: {
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },

  // modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: themes.black,
    borderColor: themes.vegasGold,
  },
  modalTitle: {
    marginBottom: 20,
    fontSize: 28,
    fontFamily: "Chakra-Italic",
    textAlign: "center",
    color: themes.vegasGold,
  },
  modalText: {
    fontSize: 20,
    fontFamily: "Chakra-Regular",
    textAlign: "center",
    color: themes.white,
  },
  modalTextInputContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  modalTextInput: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
    fontSize: 16,
    fontFamily: "Chakra-Regular",
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
  modalDayContainer: {
    flexDirection: "row",
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
  modalDayButtonSelected: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: themes.vegasGold
  },
  modalDayText: {
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  modalDayTextSelected: {
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.black,
  },
  errorText: {
    fontSize: 16,
    color: "#FF4444",
    marginTop: 8,
    textAlign: "center",
    fontFamily: "Chakra-Bold",
  }
});
