import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const instructorDashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themes.background,
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
    fontSize: 30,
    fontFamily: "Oswald_500Medium",
    color: themes.textPrimary,
  },
  fullDateText: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    color: themes.textSecondary,
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
    borderColor: themes.borderStrong,
    borderRadius: 8,
  },
  selectedDayButton: {
    backgroundColor: themes.vegasGold,
  },
  dayName: {
    color: themes.vegasGold,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  dayNumber: {
    color: themes.vegasGold,
    fontSize: 18,
    fontFamily: "Oswald_500Medium",
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
    fontSize: 20,
    textAlign: "center",
    fontFamily: "Oswald_500Medium",
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
    borderColor: themes.borderStrong,
    borderRadius: 10,
    height: 80,
    marginBottom: 15,
    marginHorizontal: 10,
    overflow: "hidden",
    backgroundColor: themes.backgroundElevated,
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
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  viewButtonSection: {
    width: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  viewButtonText: {
    color: themes.vegasGold,
    fontSize: 15,
    fontFamily: "Oswald_500Medium",
    marginRight: 5,
  },
  arrowIcon: {
    color: themes.vegasGold,
    fontSize: 24,
  },
  
  // Onboarding modal styles 
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
    fontSize: 22,
    fontFamily: "Oswald_500Medium",
    color: themes.vegasGold,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  labelText: {
    marginBottom: 12,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: themes.textSecondary,
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
    fontSize: 16,
    fontFamily: "Oswald_500Medium",
    color: themes.black,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  errorText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: themes.danger,
    textAlign: "center",
    marginVertical: 10,
  },
  emptyStateText: {
    color: themes.textMuted,
    textAlign: "center",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    paddingVertical: 24,
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
