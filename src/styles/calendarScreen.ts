import { themes } from "@/src/context/themes";
import { StyleSheet } from "react-native";

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
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    padding: 20,
    backgroundColor: themes.black,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: themes.vegasGold,
  },
  modalTitle: {
    marginBottom: 20,
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
    textAlign: "center",
  },
  modalText: {
    marginBottom: 12,
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  modalButton: {
    padding: 12,
    marginVertical: 6,
    alignItems: "center",
    backgroundColor: themes.vegasGold,
    borderRadius: 15,
  },
  modalButtonContainer: {
    marginBottom: 16,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: "Chakra-Bold",
    color: themes.black,
  },
  modalDayContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalDayButton: {
    width: "13%",
    padding: 8,
    marginVertical: 4,
    alignItems: "center",
    backgroundColor: "rgba(197, 179, 88, 0.2)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  modalDayButtonSelected: {
    backgroundColor: themes.vegasGold,
  },
  modalDayText: {
    fontSize: 12,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  modalDayTextSelected: {
    color: themes.black,
  },
  errorText: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    color: "#FF4444",
  },
});
