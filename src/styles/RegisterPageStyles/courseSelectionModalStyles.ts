import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const courseSelectionModalStyles = StyleSheet. create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    width: "85%",
    maxWidth: 450,
    padding: 20,
    backgroundColor: themes.black,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: themes. vegasGold,
  },
  courseSelectionModal: {
    width: '90%',
    maxWidth: 500,
    minHeight: '40%',
    maxHeight: '85%'
  },
  modalHeader: {
    flexDirection:  'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth:  1,
    borderBottomColor: themes.vegasGold,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: themes.vegasGold,
  },
  modalTitle: {
    marginBottom: 20,
    fontSize: 28,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
    textAlign: "center",
  },
  contentContainer: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: "Chakra-Bold",
    marginTop: 16,
    marginBottom: 8,
    color: themes.vegasGold,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Chakra-Regular",
    marginBottom: 24,
    paddingHorizontal: 20,
    color: themes.white,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: themes.vegasGold,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: "Chakra-Bold",
    color: themes.black,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  courseListContainer: {
    flex: 1,
  },
  courseListTitle: {
    fontSize: 20,
    fontFamily: "Chakra-Bold",
    textAlign: "center",
    marginBottom: 8,
    color: themes.vegasGold,
  },
  courseListDescription: {
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
    color: themes.white,
  },
  courseScrollView: {
    flex: 1,
    marginBottom: 15,
  },
  courseCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themes.vegasGold + '40',
    backgroundColor: themes.black,
  },
  selectedCourseCard: {
    backgroundColor: themes.vegasGold,
    borderColor: themes.vegasGold
  },
  disabledButton: {
    opacity: 0.6,
  },
  courseCardHeader: {
    flexDirection:  'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  courseIconContainer:  {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: themes. vegasGold + '20',
  },
  courseTitleContainer: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    marginBottom: 6,
    fontFamily: "Chakra-Bold",
    color: themes.white
  },
  selectedCourseTitle:  {
    color: themes.black,
  },
  courseMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems:  'center',
    gap:  4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: themes.black + '30',
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: "Chakra-Bold",
  },
  gunTypeText: {
    fontSize: 12,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  selectedGunTypeText: {
    color: themes. black,
  },
  courseDescription: {
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    marginBottom: 12,
  },
  selectedCourseDescription: {
    color: themes. black,
  },
  courseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courseOrder: {
    fontSize: 12,
    fontFamily: "Chakra-Italic",
    color: themes.white,
  },
  selectedCourseOrder: {
    color: themes.black,
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savingText:  {
    fontSize: 12,
    fontFamily: "Chakra-Regular",
    color:  themes.white,
  },
});