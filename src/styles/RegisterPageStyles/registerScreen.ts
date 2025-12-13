import { themes } from "@/src/context/themes";
import { StyleSheet } from "react-native";

export const registerScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  backButtonContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
  },
  registerScreenContentContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    gap: 35,
    paddingHorizontal: 20,
    minHeight: "100%"
  },
  image: {
    width: "40%",
    height: "22%",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  nameInputBoxContainer: {
    flexDirection: "row",
    gap: 50,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  nameInputBox: {
    width: "33%",
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
    color: themes.vegasGold,
    fontSize: 30,
    fontFamily: "Chakra-Italic",
  },
  textInputBox: {
    width: "75%",
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
    color: themes.vegasGold,
    fontSize: 30,
    fontFamily: "Chakra-Italic",
  },
  signUpButton: {
    width: "60%",
    backgroundColor: themes.vegasGold,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  signUpButtonText: {
    fontFamily: "Chakra-semiBoldItalic",
    fontSize: 32,
    color: themes.white,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
  },
  orText: {
    fontFamily: "Chakra-semiBoldItalic",
    fontSize: 36,
    color: themes.white,
  },
  horizontalLine: {
    flex: 1,
    borderBottomColor: themes.vegasGold,
    borderBottomWidth: 2,
  },
  welcomeContainer: {
    marginVertical: 20,
    marginHorizontal: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  welcomeText: {
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
    fontSize: 32,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  welcomeSubtext: {
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },

  // Modal styles
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
    borderColor: themes.vegasGold,
  },
  modalTitle: {
    marginBottom: 20,
    fontSize: 28,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
    textAlign: "center",
  },
  welcomeTitle: {
    textAlign: "center",
    marginBottom: 8,
    fontSize: 20,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  companyName: {
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 20,
  },
  roleButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 15,
    backgroundColor: themes.vegasGold,
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  recommendedButton: {
    backgroundColor: themes.vegasGold,
    borderWidth: 2,
    borderColor: themes.vegasGold,
    shadowColor: themes.vegasGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },

  buttonContent: {
    alignItems: "center",
    width: "100%",
  },
  buttonHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    gap: 12,
  },
  roleIcon: {
    fontSize: 24,
  },
  buttonTitle: {
    fontSize: 22,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  buttonDescription: {
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  recommendedBadge: {
    backgroundColor: themes.black,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  recommendedText: {
    fontSize: 12,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
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
  footerInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: themes.vegasGold,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Chakra-Italic",
    color: themes.white,
    textAlign: "center",
    lineHeight: 16,
  },

  //Course Selection Modal styles
  courseSelectionModal: {
    width: '90%',
    maxWidth: 500,
    minHeight: '40%',
    maxHeight: '85%'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
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
  contentContainer: {
    flex: 1,
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
  courseCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  courseIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: themes.vegasGold + '20',
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
  selectedCourseTitle: {
    color: themes.black,
  },
  courseMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    color: themes.black,
  },
  courseDescription: {
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    marginBottom: 12,
  },
  selectedCourseDescription: {
    color: themes.black,
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
  savingText: {
    fontSize: 12,
    fontFamily: "Chakra-Regular",
    color: themes.white,
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
  }
});
