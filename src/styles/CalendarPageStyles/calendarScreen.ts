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
    marginTop: 30,
    paddingRight: 16,
    paddingLeft: 16,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  scheduleText: {
    fontSize: 48,
    fontFamily: "Chakra-BoldItalic",
    marginBottom: 16,
    textAlign: 'center',
    color: themes.white,
  },
  sessionText: {
    fontSize: 28,
    fontFamily: "Chakra-Regular",
    color: themes.white
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  actionButton: {
    width: "75%",
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: themes.black,
    borderColor: themes.vegasGold,
  },
  actionButtonText: {
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  actionButtonActive: {
    opacity: 0.7,
    backgroundColor: themes.black
  },
  actionButtonTextActive: {
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  addButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: themes.black,
    borderColor: themes.vegasGold,
  },
  addButtonText: {
    fontSize: 32,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  availabilityCardSelected: {
    borderWidth: 2,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
  },
  availabilityInfo: {
    flex: 1,
    justifyContent: "space-between"
  },
  availabilityTimeText: {
    marginBottom: 8,
    fontSize: 24,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  availabilityDateText: {
    marginBottom: 4,
    fontSize: 24,
    fontFamily: "Chakra-Regular",
    color: themes.white,

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
  availabilityActionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  updateButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: themes.black,
    borderColor: themes.vegasGold,
  },
  updateButtonText: {
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  }, 
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: themes.black,
    borderColor: themes.vegasGold,
  },
  deleteButtonText: {
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  weeklyScheduleContainer: {
    marginTop: 16,
  },
  dayScheduleContainer: {
    marginBottom: 20,
    paddingBottom: 16,
  },
  dayTitle: {
    marginBottom: 8,
    fontSize: 28,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  compactAvailabilityCard: {
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  noAvailabilityText: {
    paddingLeft: 12,
    fontSize: 28,
    textAlign: "center",
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  sectionSubtitle: {
    marginBottom: 12,
    fontSize: 28,
    textAlign: "center",
    fontFamily: "Chakra-BoldItalic",
    color: themes.vegasGold,
  },
  availabilityDateRange: {
    marginTop: 4,
    fontSize: 16,
    color: themes.white,
  },
  hintText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 24,
    fontFamily: "Chakra-Italic",
    color: themes.white,
  },

  // modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0,7)"
  },
  modalHeader: {
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: themes.vegasGold + '30', 
    marginBottom: 16,
  },
  modalSubtitle: {
    marginBottom: 16,
    fontSize: 18,
    textAlign: 'center',
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  modalScrollView: {
    flex: 1,
    marginVertical: 16,
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
  modalTextBold: {
    fontSize: 16,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
    marginBottom: 8,
  },
  modalTextInputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  modalTextInput: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
    fontSize: 24,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  eventDescriptionContainer: {
    width: "60%"
  },
  eventTitleContainer: {
    width: "40%",
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
  modalCreateContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
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
    marginTop: 8,
    textAlign: "center",
    fontFamily: "Chakra-Bold",
    color: "#FF4444",
  },
  availabilityScrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 120,
    flexGrow: 1,
  },

  //SessionModal styles
  sessionModalContent: {
    width: "95%",
    minHeight: 300,
    maxHeight: "85%",
    flexDirection: "column",
    padding: 24,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: themes.black,
    borderColor: themes.vegasGold,
  },
  sessionModalBody: {
    marginBottom: 16,
  },
  sessionModalTitle: {
    fontSize: 36,
    fontFamily: "Chakra-BoldItalic",
    textAlign: "center",
    marginBottom: 8,
    color: themes.vegasGold,
  },
  sessionModalSubtitle: {
    fontSize: 28,
    fontFamily: "Chakra-Bold",
    textAlign: "center",
    marginBottom: 16,
    color: themes.white,
  },
  infoCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: themes.black,
    borderColor: themes.vegasGold,
  },
  infoCardSecondary: {
    padding: 20,
    backgroundColor: themes.black,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  infoCardTertiary: {
    padding: 20,
    backgroundColor: themes.black,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  infoLabel: {
    marginBottom: 4,
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  infoValuePrimary: {
    fontSize: 20,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  infoValueSecondary: {
    marginBottom: 4,
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  infoValueTertiary: {
    fontSize: 24,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  infoValueSubtle: {
    fontSize: 24,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  sessionButtonPrimary: {
    backgroundColor: themes.vegasGold,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56
  },
  sessionButtonSecondary: {
    backgroundColor: themes.black,
    borderWidth: 2,
    borderColor: themes.vegasGold,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56
  },
  sessionButtonDestructive: {
    backgroundColor: "#FF4444",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    flex: 1
  },
  sessionButtonClose: {
    backgroundColor: themes.black,
    borderWidth: 2,
    borderColor: themes.vegasGold,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    flex: 1
  },
  sessionButtonTextPrimary: {
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.white
  },
  sessionButtonTextSecondary: {
    fontSize: 24,
    fontFamily: "Chakra-Bold", 
    color: themes.vegasGold
  },
  sessionButtonTextDestructive: {
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.white
  },
  rowLayout: {
    flexDirection: "row",
    gap: 16
  },
  columnLayout: {
    flexDirection: "column",
    gap: 12
  },
  flexEqual: {
    flex: 1
  },
  flexDouble: {
    flex: 2
  },
  spacingSmall: {
    marginBottom: 8
  },
  spacingMedium: {
    marginBottom: 16
  },
  spacingLarge: {
    marginBottom: 24
  },
});
