import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const instructorDashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themes.black,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  dateContainer: {
    marginBottom: 20,
  },
  todayText: {
    fontSize: 36,
    fontFamily: "Chakra-Regular",
    color: themes.vegasGold,
  },
  fullDateText: {
    fontSize: 30,
    fontFamily: "Chakra-Regular",
    color: themes.vegasGold,
    marginTop: 5,
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  dayButton: {
    width: 48,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: themes.vegasGold,
    borderRadius: 8,
  },
  selectedDayButton: {
    backgroundColor: themes.vegasGold,
  },
  dayName: {
    color: themes.vegasGold,
    fontSize: 16,
    fontFamily: "Chakra-Regular",
  },
  dayNumber: {
    color: themes.vegasGold,
    fontSize: 20,
    fontFamily: "Chakra-Bold",
    marginTop: 4,
  },
  selectedDayText: {
    color: themes.black,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: themes.white,
    fontSize: 24,
    textAlign: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: themes.vegasGold,
    paddingVertical: 10,
    marginBottom: 15,
  },
  videosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  videoThumbnail: {
    width: "48%",
    height: 120,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    borderRadius: 10,
  },
  classCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: themes.vegasGold,
    borderRadius: 10,
    height: 80,
    marginBottom: 15,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  classTypeSection: {
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: themes.vegasGold,
  },
  classTypeText: {
    color: themes.white,
    textAlign: "center",
    fontSize: 14,
  },
  classInfoSection: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  classTimeText: {
    color: themes.white,
    fontSize: 20,
    fontFamily: "Chakra-Regular",
  },
  viewButtonSection: {
    width: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  viewButtonText: {
    color: themes.vegasGold,
    fontSize: 20,
    fontFamily: "Chakra-Bold",
    marginRight: 5,
  },
  arrowIcon: {
    color: themes.vegasGold,
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: themes.black,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: themes.vegasGold,
  },
  modalTitle: {
    marginBottom: 20,
    fontSize: 28,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  labelText: {
    marginBottom: 12,
    fontSize: 18,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  textInput: {
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 1,
    borderColor: themes.vegasGold,
    borderRadius: 10,
    color: themes.white,
    fontFamily: "Chakra-Regular",
    fontSize: 16
  },
  submitButton: {
    padding: 12,
    marginTop: 10,
    alignItems: "center",
    backgroundColor: themes.vegasGold,
    borderRadius: 15
  },
  disabledButton: {
    opacity: 0.6
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: "#FF4444",
    textAlign: "center",
    marginVertical: 10,
  },
  navContainer: {
    flexDirection: "row",
    height: 60,
    backgroundColor: themes.vegasGold,
  },
  navButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  navTextActive: {
    fontSize: 12,
    fontFamily: "Chakra-Regular",
    color: themes.black,
  },
});
